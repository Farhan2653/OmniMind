import { generateText } from 'ai';
import { groq } from '@ai-sdk/groq';

export async function POST(req: Request) {
  try {
    const { code, language } = await req.json();

    if (!code) {
      return Response.json({ error: "Code is required" }, { status: 400 });
    }

    const systemPrompt = `You are an expert AI Coding Mentor for the OmniMind platform. 
Your goal is to analyze the user's code, determine its Time and Space complexity, suggest optimizations (if applicable), and provide exactly 1-3 related problems from LeetCode, Codeforces, or HackerRank.
If the code is already perfectly optimized for the problem it solves, explicitly state that it is fully optimized.
You MUST output your response as valid JSON matching the following schema exactly:
{
  "timeComplexity": "O(...)",
  "spaceComplexity": "O(...)",
  "optimizationDetails": "Markdown text explaining how to optimize it. If it is already fully optimized, write 'This code is already optimal.' and briefly explain why.",
  "isOptimized": boolean,
  "relatedProblems": [
    { "name": "Problem Name", "platform": "LeetCode", "url": "https://leetcode.com/problems/..." }
  ]
}

DO NOT wrap the output in markdown code blocks like \`\`\`json. Return only the raw JSON.`;

    const result = await generateText({
      model: groq('llama-3.1-8b-instant'),
      system: systemPrompt,
      messages: [{ role: 'user', content: `Language: ${language}\n\nCode:\n${code}` }],
      temperature: 0.1,
    });

    // Attempt to parse JSON. Llama sometimes still outputs markdown wrappers despite instructions.
    let text = result.text.trim();
    if (text.startsWith("\`\`\`json")) {
      text = text.replace("\`\`\`json", "").replace(/\`\`\`$/, "").trim();
    } else if (text.startsWith("\`\`\`")) {
      text = text.replace(/^\`\`\`/, "").replace(/\`\`\`$/, "").trim();
    }

    const evaluation = JSON.parse(text);
    return Response.json(evaluation);

  } catch (error: any) {
    console.error("Coding Analysis API Error:", error);
    return Response.json(
      { error: error.message || "Failed to analyze code." },
      { status: 500 }
    );
  }
}
