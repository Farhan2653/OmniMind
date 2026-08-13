"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Play, RotateCcw, Award, CheckCircle2, ChevronRight, Video, Mic, Volume2, Loader2, History, X } from "lucide-react"
import { supabase } from "@/lib/supabase"
type InterviewMode = "text" | "video" | "voice"

interface Question {
  id: number;
  text: string;
}

interface EvaluationMetrics {
  vocabulary: number;
  confidence: number;
  grammar: number;
  logic: number;
  hireability: number;
}

interface Feedback {
  overallScore: number;
  review: string;
  metrics: EvaluationMetrics;
}

interface TranscriptEntry {
  question: string;
  answer: string;
}

const initialQuestions: Question[] = []

export default function InterviewPage() {
  const [mode, setMode] = React.useState<InterviewMode>("text")
  const [started, setStarted] = React.useState(false)
  const [currentIdx, setCurrentIdx] = React.useState(0)
  const [questions, setQuestions] = React.useState<Question[]>(initialQuestions)
  const [response, setResponse] = React.useState("")
  const [completed, setCompleted] = React.useState(false)
  const [evaluating, setEvaluating] = React.useState(false)
  const [feedback, setFeedback] = React.useState<Feedback | null>(null)
  const [transcript, setTranscript] = React.useState<TranscriptEntry[]>([])

  // History State
  const [showHistory, setShowHistory] = React.useState(false)
  const [historyItems, setHistoryItems] = React.useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = React.useState(false)
  const [selectedHistory, setSelectedHistory] = React.useState<any | null>(null)

  const fetchHistory = async () => {
    setLoadingHistory(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const { data } = await supabase.from('interviews').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false })
      if (data) setHistoryItems(data)
    }
    setLoadingHistory(false)
  }

  React.useEffect(() => {
    if (showHistory && historyItems.length === 0) {
      fetchHistory()
    }
  }, [showHistory])

  // Video Mode State
  const [recording, setRecording] = React.useState(false)
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const streamRef = React.useRef<MediaStream | null>(null)

  // Text-To-Speech / Dynamic Voice Mode State
  const [speaking, setSpeaking] = React.useState(false)
  const [listening, setListening] = React.useState(false)
  const [speechError, setSpeechError] = React.useState<string | null>(null)
  const recognitionRef = React.useRef<any>(null)
  
  // Dynamic Generation State
  const [topic, setTopic] = React.useState("")
  const [numQuestions, setNumQuestions] = React.useState<number>(5)
  const [generating, setGenerating] = React.useState(false)
  const [generatingFollowUp, setGeneratingFollowUp] = React.useState(false)

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
          if (event.error === 'network') {
            setSpeechError("Browser speech recognition failed (network error). Please check your connection or switch to Text mode.")
          } else {
            setSpeechError(`Microphone error: ${event.error}`)
          }
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
      stopTTS()
    }
  }, [])

  const toggleListening = () => {
    setSpeechError(null)
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

  const stopTTS = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
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
    if (started && mode === "voice" && questions[currentIdx] && !generatingFollowUp && !evaluating) {
      speakQuestion(questions[currentIdx].text)
    }
  }, [started, currentIdx, mode, questions, generatingFollowUp, evaluating])

  // Clean up media streams on unmount
  React.useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      stopTTS()
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
    if (!topic.trim()) {
      alert("Please enter an interview topic or role to continue.");
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch('/api/interview/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, numQuestions })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to generate questions");
      
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
      }
    } catch (err: any) {
      console.error(err);
      alert(`Failed to generate dynamic questions: ${err.message}`);
      setGenerating(false);
      return;
    } finally {
      setGenerating(false);
    }

    setStarted(true)
    if (mode === "video" || mode === "voice") {
      await startCamera()
    }
  }

  const handleNext = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setListening(false)
    }
    stopTTS()

    const userAns = response.trim()
    const currentQ = questions[currentIdx].text
    
    // Update transcript
    const updatedTranscript = [...transcript, { question: currentQ, answer: userAns }]
    setTranscript(updatedTranscript)
    setResponse("")

    // Dynamic Follow-Up Question Generation for Voice Mode
    if (mode === "voice" && currentIdx < questions.length - 1) {
      setGeneratingFollowUp(true)
      try {
        const res = await fetch('/api/interview/followup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic, question: currentQ, answer: userAns })
        })
        const data = await res.json()
        if (data.question) {
          const updatedQuestions = [...questions]
          updatedQuestions.splice(currentIdx + 1, 1, {
            id: Date.now(),
            text: data.question
          })
          setQuestions(updatedQuestions)
        }
      } catch (err) {
        console.error("Failed to generate follow up", err)
      } finally {
        setGeneratingFollowUp(false)
      }
    }

    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1)
    } else {
      setEvaluating(true)
      if (mode === "video" || mode === "voice") {
        stopCamera()
      }
      
      try {
        const res = await fetch('/api/interview/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic, transcript: updatedTranscript })
        })
        const data = await res.json()
        setFeedback(data)

        // Save to DB
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user && data.overallScore) {
          const { error: insertError } = await supabase.from('interviews').insert({
            user_id: session.user.id,
            role_title: topic,
            score: data.overallScore,
            feedback: JSON.stringify({ review: data.review, metrics: data.metrics }),
            transcript: updatedTranscript,
            status: 'completed'
          })
          if (insertError) {
            console.error("Supabase Insert Error:", insertError);
            alert("Failed to save interview to database: " + insertError.message);
          }
        }
      } catch (err) {
        console.error(err)
        setFeedback({
          overallScore: 0,
          review: "Evaluation failed. The server was unable to generate your results.",
          metrics: { vocabulary: 0, confidence: 0, grammar: 0, logic: 0, hireability: 0 }
        })
      } finally {
        setEvaluating(false)
        setCompleted(true)
      }
    }
  }

  const restart = () => {
    stopCamera()
    stopTTS()
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setListening(false)
    }
    setStarted(false)
    setCurrentIdx(0)
    setQuestions([])
    setTranscript([])
    setResponse("")
    setCompleted(false)
    setFeedback(null)
  }

  // Helper to render metric progress bar
  const MetricBar = ({ label, score }: { label: string, score: number }) => (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-neutral-300">{label}</span>
        <span className="font-bold text-white">{score}%</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">AI Interview Simulator</h1>
          <p className="text-xs text-neutral-400">Practice your technical and behavioral responses in real-time.</p>
        </div>
        <Button onClick={() => setShowHistory(true)} variant="secondary" className="flex items-center gap-2">
          <History className="w-4 h-4" /> Past Interviews
        </Button>
      </div>

      {!started && !completed && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mode Selector Cards */}
          <div className="md:col-span-1 space-y-4">
            <h3 className="text-sm font-semibold text-neutral-400 mb-2">Select Mode</h3>
            <button
              onClick={() => setMode("text")}
              className={`w-full p-4 rounded-xl border text-left flex items-start gap-4 transition-all ${
                mode === "text"
                  ? "bg-white/10 border-blue-500 text-white"
                  : "bg-white/5 border-white/5 text-neutral-400 hover:border-white/10"
              }`}
            >
              <Award className="w-5 h-5 mt-0.5" />
              <div className="space-y-1">
                <span className="block text-sm font-bold text-white">1. Text Input</span>
                <span className="block text-xs text-neutral-400 leading-relaxed">Read questions and type answers directly.</span>
              </div>
            </button>

            <button
              onClick={() => setMode("video")}
              className={`w-full p-4 rounded-xl border text-left flex items-start gap-4 transition-all ${
                mode === "video"
                  ? "bg-white/10 border-purple-500 text-white"
                  : "bg-white/5 border-white/5 text-neutral-400 hover:border-white/10"
              }`}
            >
              <Video className="w-5 h-5 mt-0.5" />
              <div className="space-y-1">
                <span className="block text-sm font-bold text-white">2. Video & Audio</span>
                <span className="block text-xs text-neutral-400 leading-relaxed">Answer live using your camera and microphone.</span>
              </div>
            </button>

            <button
              onClick={() => setMode("voice")}
              className={`w-full p-4 rounded-xl border text-left flex items-start gap-4 transition-all ${
                mode === "voice"
                  ? "bg-white/10 border-emerald-500 text-white"
                  : "bg-white/5 border-white/5 text-neutral-400 hover:border-white/10"
              }`}
            >
              <Mic className="w-5 h-5 mt-0.5" />
              <div className="space-y-1">
                <span className="block text-sm font-bold text-white">3. TTS Dynamic Interview</span>
                <span className="block text-xs text-neutral-400 leading-relaxed">AI speaks aloud. Asks follow-ups based on your answers.</span>
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
              <div className="max-w-sm space-y-2 w-full text-left">
                <h2 className="text-lg font-semibold text-center mb-6">Ready to start?</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-neutral-400 block mb-1">Interview Topic / Role</label>
                    <input 
                      type="text" 
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g. Senior React Developer, HR Manager, System Design" 
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-neutral-400 block mb-1">Number of Questions</label>
                    <input 
                      type="number" 
                      min="1"
                      max="15"
                      value={numQuestions}
                      onChange={(e) => setNumQuestions(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

              </div>
              <Button onClick={handleStart} variant="primary" className="rounded-xl px-6 mt-4" disabled={generating || !topic.trim()}>
                {generating ? "Generating Questions..." : <><Play className="w-4 h-4 mr-2" /> Start Simulator</>}
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
                  onClick={() => speakQuestion(questions[currentIdx]?.text)}
                  className={`p-1.5 rounded-lg border ${speaking ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 animate-pulse" : "bg-white/5 border-white/10 text-neutral-400"}`}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
              {generatingFollowUp ? (
                <span className="flex items-center text-neutral-400 italic">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating follow-up question...
                </span>
              ) : (
                questions[currentIdx]?.text
              )}
            </h2>

            {/* Video Feed Screen */}
            {(mode === "video" || mode === "voice") && (
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
              disabled={generatingFollowUp || evaluating}
              className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all text-xs font-medium disabled:opacity-50"
            />
            {speechError && (
              <div className="text-red-400 text-[10px] mt-1 bg-red-500/10 p-2 rounded border border-red-500/20">
                {speechError}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleNext} 
              variant="primary" 
              className="rounded-xl text-xs py-2"
              disabled={!response.trim() || evaluating || generatingFollowUp}
            >
              {evaluating ? "Evaluating..." : generatingFollowUp ? "Generating..." : currentIdx === questions.length - 1 ? "Finish Interview" : "Submit Answer"} 
              {!evaluating && !generatingFollowUp && <ChevronRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </GlassPanel>
      )}

      {completed && feedback && (
        <GlassPanel className="space-y-8 p-8">
          <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-white/5">
            <div className="w-24 h-24 rounded-full border-4 border-blue-500/30 flex items-center justify-center bg-blue-500/10 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
              <span className="text-4xl font-extrabold text-blue-400">{feedback.overallScore}</span>
            </div>
            <div className="text-center md:text-left space-y-2 flex-1">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 justify-center md:justify-start">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                Interview Completed
              </h2>
              <p className="text-sm text-neutral-300 leading-relaxed max-w-xl">
                {feedback.review}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">Core Metrics</h3>
              <div className="space-y-5 p-5 bg-white/5 border border-white/5 rounded-2xl shadow-inner">
                <MetricBar label="Vocabulary & Professionalism" score={feedback.metrics.vocabulary} />
                <MetricBar label="Confidence & Delivery" score={feedback.metrics.confidence} />
                <MetricBar label="Grammar & Structure" score={feedback.metrics.grammar} />
                <MetricBar label="Logical Reasoning" score={feedback.metrics.logic} />
                <MetricBar label="Hireability Probability" score={feedback.metrics.hireability} />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">Interview Transcript</h3>
              <div className="p-5 bg-black/40 border border-white/5 rounded-2xl max-h-[300px] overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {transcript.map((entry, idx) => (
                  <div key={idx} className="space-y-2 text-xs">
                    <div className="text-blue-400 font-medium leading-relaxed bg-blue-500/10 p-3 rounded-tr-xl rounded-bl-xl rounded-br-xl border border-blue-500/10">
                      Q: {entry.question}
                    </div>
                    <div className="text-neutral-300 pl-4 border-l-2 border-white/10 ml-2 py-1 leading-relaxed">
                      A: {entry.answer}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <Button onClick={restart} variant="primary" className="rounded-xl px-8 shadow-lg shadow-blue-500/20">
              <RotateCcw className="w-4 h-4 mr-2" /> Start Another Interview
            </Button>
          </div>
        </GlassPanel>
      )}

      {/* History Slide-Out Panel */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowHistory(false)} />
          <div className="relative w-full max-w-xl bg-[#111] border-l border-white/10 h-full overflow-y-auto shadow-2xl p-6 flex flex-col transform transition-transform animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-blue-500" /> Interview History
              </h2>
              <button onClick={() => { setShowHistory(false); setSelectedHistory(null); }} className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedHistory ? (
              <div className="space-y-6">
                <button onClick={() => setSelectedHistory(null)} className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 mb-2">
                  <RotateCcw className="w-3 h-3" /> Back to list
                </button>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedHistory.topic}</h3>
                    <p className="text-xs text-neutral-400">{new Date(selectedHistory.created_at).toLocaleString()}</p>
                  </div>
                  <div className="text-2xl font-bold text-blue-400">{selectedHistory.overall_score}</div>
                </div>
                
                <div className="space-y-4 p-4 bg-white/5 rounded-xl">
                  <MetricBar label="Vocabulary" score={selectedHistory.metrics.vocabulary} />
                  <MetricBar label="Confidence" score={selectedHistory.metrics.confidence} />
                  <MetricBar label="Grammar" score={selectedHistory.metrics.grammar} />
                  <MetricBar label="Logic" score={selectedHistory.metrics.logic} />
                  <MetricBar label="Hireability" score={selectedHistory.metrics.hireability} />
                </div>

                <div className="space-y-4 mt-6">
                  <h4 className="text-sm font-semibold text-neutral-300">Transcript</h4>
                  {selectedHistory.transcript.map((entry: any, i: number) => (
                    <div key={i} className="space-y-2 text-xs bg-black/40 p-4 rounded-xl border border-white/5">
                      <p className="text-blue-400 font-medium">Q: {entry.question}</p>
                      <p className="text-neutral-300">A: {entry.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {loadingHistory ? (
                  <div className="text-center text-neutral-500 py-8 flex flex-col items-center">
                    <Loader2 className="w-6 h-6 animate-spin mb-2" />
                    Loading history...
                  </div>
                ) : historyItems.length === 0 ? (
                  <div className="text-center text-neutral-500 py-8">
                    No interviews found. Complete one to see it here!
                  </div>
                ) : (
                  historyItems.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => setSelectedHistory(item)}
                      className="p-4 bg-white/5 border border-white/5 hover:border-white/20 rounded-xl cursor-pointer transition-all hover:bg-white/10 group"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors">{item.topic}</h4>
                          <p className="text-xs text-neutral-400 mt-1">{new Date(item.created_at).toLocaleDateString()} • {item.mode} mode • {item.num_questions} Qs</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-bold text-blue-400">{item.overall_score}</span>
                          <span className="text-[10px] block text-neutral-500">SCORE</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
