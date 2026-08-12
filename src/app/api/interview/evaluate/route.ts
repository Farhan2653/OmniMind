import { generateText } from 'ai';
import { groq } from '@ai-sdk/groq';

export async function POST(req: Request) {
  try {
    const { topic, transcript } = await req.json();

    if (!topic || !transcript || !Array.isArray(transcript)) {
      return Response.json({ error: "Topic and transcript array are required" }, { status: 400 });
    }

    const transcriptText = transcript.map(entry => `Interviewer: ${entry.question}\nCandidate: ${entry.answer}`).join("\n\n");

    const prompt = `You are an expert HR and Technical Evaluator. Evaluate the following interview transcript for a "${topic}" role.

Transcript:
${transcriptText}

You must evaluate the candidate on a scale of 0 to 100 for the following metrics:
1. Vocabulary (Professionalism, word choice)
2. Confidence (Assertiveness, lack of hesitation/filler words in the text)
3. Grammar (Sentence structure, correctness)
4. Logic (Logical answer quality, reasoning, structure)
5. Hireability (Possibility of getting hired based on this performance)

Provide a JSON object EXACTLY matching this structure, with no markdown formatting (\`\`\`json) or extra text:
{
  "overallScore": 85,
  "metrics": {
    "vocabulary": 80,
    "confidence": 75,
    "grammar": 90,
    "logic": 88,
    "hireability": 85
  },
  "review": "A 2-3 sentence overall review of their performance, highlighting strengths and weaknesses."
}
`;

    const result = await generateText({
      model: groq('llama-3.1-8b-instant'),
      prompt: prompt,
    });

    let text = result.text.trim();
    if (text.startsWith("```json")) {
      text = text.replace("```json", "").replace("```", "").trim();
    } else if (text.startsWith("```")) {
      text = text.replace(/```/g, "").trim();
    }

    const evaluation = JSON.parse(text);

    return Response.json(evaluation);
  } catch (error: any) {
    console.error("Evaluation generation error:", error);
    return Response.json(
      { error: error.message || "Failed to generate evaluation" },
      { status: 500 }
    );
  }
}
