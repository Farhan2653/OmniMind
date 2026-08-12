import { generateText } from 'ai';
import { groq } from '@ai-sdk/groq';

export async function POST(req: Request) {
  try {
    const { topic, question, answer } = await req.json();

    if (!topic || !question || !answer) {
      return Response.json({ error: "Topic, question, and answer are required" }, { status: 400 });
    }

    const prompt = `You are a strict, real-life interviewer conducting a "${topic}" interview. 
The candidate was asked: "${question}"
The candidate answered: "${answer}"

Your task is to generate ONE single logical, challenging follow-up question based specifically on what the candidate just said. If they missed something, probe them on it. If they gave a good answer, ask them to go deeper or handle a difficult edge case.
Return ONLY the question text. Do not include quotes, pleasantries, or any other formatting. Just the raw follow-up question.`;

    const result = await generateText({
      model: groq('llama-3.1-8b-instant'),
      prompt: prompt,
    });

    return Response.json({ question: result.text.trim().replace(/^"/, "").replace(/"$/, "") });
  } catch (error: any) {
    console.error("Follow-up generation error:", error);
    return Response.json(
      { error: error.message || "Failed to generate follow-up question" },
      { status: 500 }
    );
  }
}
