"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Play, RotateCcw, Award, CheckCircle2, ChevronRight, Video, Mic, Volume2, HelpCircle } from "lucide-react"

type InterviewMode = "text" | "video" | "voice"

interface Question {
  id: number;
  text: string;
}

const initialQuestions: Question[] = [
  { id: 1, text: "Can you tell me about a complex technical challenge you solved recently?" },
  { id: 2, text: "How do you handle disagreement with a product manager or team lead?" },
  { id: 3, text: "Explain how you would design a rate limiter for a high-traffic API." }
]

export default function InterviewPage() {
  const [mode, setMode] = React.useState<InterviewMode>("text")
  const [started, setStarted] = React.useState(false)
  const [currentIdx, setCurrentIdx] = React.useState(0)
  const [questions, setQuestions] = React.useState<Question[]>(initialQuestions)
  const [response, setResponse] = React.useState("")
  const [completed, setCompleted] = React.useState(false)
  const [evaluating, setEvaluating] = React.useState(false)
  const [feedback, setFeedback] = React.useState<{ score: number; review: string } | null>(null)

  // Video Mode State
  const [recording, setRecording] = React.useState(false)
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const streamRef = React.useRef<MediaStream | null>(null)

  // Text-To-Speech / Dynamic Voice Mode State
  const [speaking, setSpeaking] = React.useState(false)
  const [listening, setListening] = React.useState(false)
  const recognitionRef = React.useRef<any>(null)

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = 'en-US'

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = ''
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript
            }
          }
          if (finalTranscript) {
            setResponse((prev) => prev ? prev + " " + finalTranscript.trim() : finalTranscript.trim())
          }
        }
        
        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error)
          setListening(false)
        }
        recognitionRef.current.onend = () => {
          setListening(false)
        }
      }
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const toggleListening = () => {
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
    } else {
      try {
        recognitionRef.current?.start()
        setListening(true)
      } catch (err) {
        console.error(err)
      }
    }
  }

  // Speak question helper
  const speakQuestion = (text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.onstart = () => setSpeaking(true)
      utterance.onend = () => setSpeaking(false)
      window.speechSynthesis.speak(utterance)
    }
  }

  // Effect to read questions aloud automatically in voice mode
  React.useEffect(() => {
    if (started && mode === "voice" && questions[currentIdx]) {
      speakQuestion(questions[currentIdx].text)
    }
  }, [started, currentIdx, mode, questions])

  // Clean up media streams on unmount
  React.useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Start video stream
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setRecording(true)
    } catch (err) {
      alert("Camera access denied or unavailable. Falling back to simple simulator.")
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setRecording(false)
  }

  const handleStart = async () => {
    setStarted(true)
    if (mode === "video") {
      await startCamera()
    }
  }

  const handleNext = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setListening(false)
    }
    const userAns = response.trim()
    
    // Dynamic Follow-Up Question Generation for Voice Mode
    if (mode === "voice" && currentIdx < questions.length - 1) {
      // Inject dynamic follow-up question based on user response
      const updatedQuestions = [...questions]
      const followUpText = `Interesting explanation. You mentioned "${userAns.slice(0, 30)}...". How did you verify or measure the performance of that specific choice?`
      
      // Insert dynamic follow-up right after current question
      updatedQuestions.splice(currentIdx + 1, 0, {
        id: Date.now(),
        text: followUpText
      })
      setQuestions(updatedQuestions)
    }

    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1)
      setResponse("")
    } else {
      setEvaluating(true)
      if (mode === "video") {
        stopCamera()
      }
      // Mock evaluation duration
      setTimeout(() => {
        setEvaluating(false)
        setCompleted(true)
        setFeedback({
          score: 88,
          review: `Successfully completed in ${mode.toUpperCase()} mode. Excellent response structure. Your explanation showed depth, and your verbal indicators matched expectations. Suggestions: structure complex architecture steps more logically.`
        })
      }, 1500)
    }
  }

  const restart = () => {
    stopCamera()
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setListening(false)
    }
    setStarted(false)
    setCurrentIdx(0)
    setQuestions(initialQuestions)
    setResponse("")
    setCompleted(false)
    setFeedback(null)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">AI Interview Simulator</h1>
          <p className="text-xs text-neutral-400">Practice your technical and behavioral responses in real-time.</p>
        </div>
      </div>

      {!started && !completed && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mode Selector Cards */}
          <div className="md:col-span-1 space-y-3">
            <h3 className="text-xs font-semibold text-neutral-400">Select Mode</h3>
            <button
              onClick={() => setMode("text")}
              className={`w-full p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                mode === "text"
                  ? "bg-white/10 border-blue-500 text-white"
                  : "bg-white/5 border-white/5 text-neutral-400 hover:border-white/10"
              }`}
            >
              <Award className="w-5 h-5 mt-0.5" />
              <div>
                <span className="block text-xs font-bold text-white">1. Text Input</span>
                <span className="text-[10px] text-neutral-400">Read questions and type answers directly.</span>
              </div>
            </button>

            <button
              onClick={() => setMode("video")}
              className={`w-full p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                mode === "video"
                  ? "bg-white/10 border-purple-500 text-white"
                  : "bg-white/5 border-white/5 text-neutral-400 hover:border-white/10"
              }`}
            >
              <Video className="w-5 h-5 mt-0.5" />
              <div>
                <span className="block text-xs font-bold text-white">2. Video & Audio</span>
                <span className="text-[10px] text-neutral-400">Answer live using your camera and microphone.</span>
              </div>
            </button>

            <button
              onClick={() => setMode("voice")}
              className={`w-full p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                mode === "voice"
                  ? "bg-white/10 border-emerald-500 text-white"
                  : "bg-white/5 border-white/5 text-neutral-400 hover:border-white/10"
              }`}
            >
              <Mic className="w-5 h-5 mt-0.5" />
              <div>
                <span className="block text-xs font-bold text-white">3. TTS Dynamic Interview</span>
                <span className="text-[10px] text-neutral-400">AI speaks aloud. Asks follow-ups based on your answers.</span>
              </div>
            </button>
          </div>

          {/* Launcher Panel */}
          <div className="md:col-span-2">
            <GlassPanel className="text-center py-12 space-y-6 h-full flex flex-col justify-center items-center">
              <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                {mode === "text" && <Award className="w-6 h-6" />}
                {mode === "video" && <Video className="w-6 h-6 text-purple-400" />}
                {mode === "voice" && <Mic className="w-6 h-6 text-emerald-400" />}
              </div>
              <div className="max-w-xs space-y-2">
                <h2 className="text-lg font-semibold">Ready to start?</h2>
                <p className="text-xs text-neutral-400">
                  {mode === "text" && "Answer questions through standard keyboard input."}
                  {mode === "video" && "Requires camera and microphone permission."}
                  {mode === "voice" && "Make sure your speakers are on. The AI will speak questions aloud."}
                </p>
              </div>
              <Button onClick={handleStart} variant="primary" className="rounded-xl px-6">
                <Play className="w-4 h-4 mr-2" /> Start Simulator
              </Button>
            </GlassPanel>
          </div>
        </div>
      )}

      {started && !completed && (
        <GlassPanel className="space-y-6">
          <div className="flex justify-between items-center text-xs text-neutral-400 pb-2 border-b border-white/5">
            <div className="flex items-center gap-4">
              <button onClick={restart} className="flex items-center gap-1 hover:text-white transition-colors">
                <RotateCcw className="w-3 h-3" /> Back
              </button>
              <span>Question {currentIdx + 1} of {questions.length}</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 uppercase tracking-wider text-[9px]">
              {mode} MODE
            </span>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-semibold text-white leading-relaxed flex items-center gap-2">
              {mode === "voice" && (
                <button 
                  onClick={() => speakQuestion(questions[currentIdx].text)}
                  className={`p-1.5 rounded-lg border ${speaking ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 animate-pulse" : "bg-white/5 border-white/10 text-neutral-400"}`}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
              {questions[currentIdx].text}
            </h2>

            {/* Video Feed Screen */}
            {mode === "video" && (
              <div className="relative aspect-video max-w-md mx-auto bg-black rounded-xl overflow-hidden border border-white/10 shadow-inner">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-red-600/90 text-white text-[9px] px-2 py-0.5 rounded-full font-bold uppercase animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" /> REC LIVE
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-neutral-400">
                {mode === "voice" ? "Speak or type your response:" : "Your Response:"}
              </label>
              {mode === "voice" && (
                <button
                  onClick={toggleListening}
                  className={`text-xs px-3 py-1 rounded-full flex items-center gap-1.5 transition-colors ${
                    listening 
                      ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse" 
                      : "bg-white/5 text-neutral-400 border border-white/10 hover:bg-white/10"
                  }`}
                >
                  <Mic className="w-3 h-3" />
                  {listening ? "Recording..." : "Start Speaking"}
                </button>
              )}
            </div>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder={mode === "voice" ? "Start speaking or type here..." : "Type your response here..."}
              rows={5}
              className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all text-xs font-medium"
            />
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleNext} 
              variant="primary" 
              className="rounded-xl text-xs py-2"
              disabled={!response.trim() || evaluating}
            >
              {evaluating ? "Evaluating..." : currentIdx === questions.length - 1 ? "Finish Interview" : "Submit Answer"} 
              {!evaluating && <ChevronRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </GlassPanel>
      )}

      {completed && feedback && (
        <GlassPanel className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Interview Completed!</h2>
              <p className="text-xs text-neutral-400">Here is your performance feedback summary.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
            <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-center">
              <span className="block text-xs text-neutral-400 mb-1">Overall Score</span>
              <span className="text-3xl font-extrabold text-blue-400">{feedback.score}%</span>
            </div>
            <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-center col-span-2">
              <span className="block text-xs text-neutral-400 mb-1">Mode Practiced</span>
              <span className="text-3xl font-extrabold text-white uppercase tracking-wider">{mode}</span>
            </div>
          </div>

          <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2">
            <h3 className="text-sm font-semibold text-white">Detailed Evaluation</h3>
            <p className="text-sm text-neutral-300 leading-relaxed">{feedback.review}</p>
          </div>

          <div className="flex justify-start">
            <Button onClick={restart} variant="secondary" className="rounded-xl">
              <RotateCcw className="w-4 h-4 mr-2" /> Start Over
            </Button>
          </div>
        </GlassPanel>
      )}
    </div>
  )
}
