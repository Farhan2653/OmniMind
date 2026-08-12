import { generateText } from 'ai';
import { groq } from '@ai-sdk/groq';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Pass the message history to the model
    // Convert the messages format (sender: "user" | "ai") to AI SDK format (role: "user" | "assistant")
    const formattedMessages = messages.map((msg: any) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    const result = await generateText({
      model: groq('llama-3.1-8b-instant'),
      messages: formattedMessages,
    });

    return Response.json({ content: result.text });
  } catch (error: any) {
    console.error("AI API Error:", error);
    return Response.json(
      { error: error.message || "Failed to generate AI response. Check your API Key or model selection." },
      { status: 500 }
    );
  }
}
