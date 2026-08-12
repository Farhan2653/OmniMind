import { generateText } from 'ai';
import { groq } from '@ai-sdk/groq';

export async function POST(req: Request) {
  try {
    const { topic, numQuestions = 5 } = await req.json();

    if (!topic) {
      return Response.json({ error: "Topic is required" }, { status: 400 });
    }

    const prompt = `You are an expert, rigorous real-life interviewer. Generate exactly ${numQuestions} unique, difficult, and challenging interview questions for a candidate taking a "${topic}" interview. 
    
    Return the output STRICTLY as a valid JSON array of strings. Do NOT include markdown formatting (like \`\`\`json), do NOT include keys, just a raw JSON array like this:
    ["Question 1", "Question 2", "Question 3"]
    `;

    const result = await generateText({
      model: groq('llama-3.1-8b-instant'),
      prompt: prompt,
    });

    let text = result.text.trim();
    
    // Clean up potential markdown formatting that Gemini might sneak in
    if (text.startsWith("```json")) {
      text = text.replace("```json", "").replace("```", "").trim();
    } else if (text.startsWith("```")) {
      text = text.replace(/```/g, "").trim();
    }

    let questions: string[] = [];
    try {
      questions = JSON.parse(text);
      if (!Array.isArray(questions)) {
        throw new Error("Output is not an array");
      }
    } catch (e) {
      console.error("Failed to parse JSON array from Gemini:", text);
      return Response.json({ error: "Failed to parse interview questions format" }, { status: 500 });
    }

    // Format them for the frontend
    const formattedQuestions = questions.map((q, idx) => ({
      id: idx + 1,
      text: q
    }));

    return Response.json({ questions: formattedQuestions });
  } catch (error: any) {
    console.error("Interview generation error:", error);
    return Response.json(
      { error: error.message || "Failed to generate interview questions" },
      { status: 500 }
    );
  }
}
