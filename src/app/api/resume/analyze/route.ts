import { NextResponse } from "next/server"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
// @ts-expect-error - No type definitions available for pdf-parse/lib/pdf-parse.js
import pdfParse from "pdf-parse/lib/pdf-parse.js"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert the file to a Buffer for pdf-parse
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let text = ""
    try {
      const data = await pdfParse(buffer)
      text = data.text
    } catch (err: any) {
      console.error("PDF Parsing error:", err)
      return NextResponse.json({ error: `Failed to parse PDF file. Ensure it is a valid PDF document. Details: ${err.message}` }, { status: 400 })
    }

    if (!text.trim()) {
      return NextResponse.json({ error: "No text could be extracted from the PDF." }, { status: 400 })
    }

    // Analyze the text using Groq with manual JSON parsing
    const { text: resultText } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      prompt: `Analyze the following resume and return a JSON object with strictly these keys:
- overallScore (number 0-100)
- skillsScore (number 0-100)
- experienceScore (number 0-100)
- projectsScore (number 0-100)
- presentationScore (number 0-100)
- impactSummary (string, 2-3 sentences evaluating competitiveness)
- improvements (array of 4-6 highly specific string critiques)

Resume Text:
${text.substring(0, 15000)}

RETURN ONLY VALID JSON. Do not include markdown formatting like \`\`\`json. Do not include any other text.`
    })

    let parsedResult;
    try {
      const startIndex = resultText.indexOf('{');
      const endIndex = resultText.lastIndexOf('}');
      if (startIndex !== -1 && endIndex !== -1) {
        parsedResult = JSON.parse(resultText.substring(startIndex, endIndex + 1));
      } else {
        parsedResult = JSON.parse(resultText);
      }
    } catch (e) {
      console.error("Failed to parse JSON:", resultText);
      return NextResponse.json({ error: "Failed to parse AI response into valid JSON." }, { status: 500 })
    }

    return NextResponse.json(parsedResult)

  } catch (error: any) {
    console.error("Resume analysis error:", error)
    return NextResponse.json({ error: `Failed to analyze resume: ${error.message || error.toString()}` }, { status: 500 })
  }
}
