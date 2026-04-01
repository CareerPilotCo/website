import { NextResponse } from "next/server";
import { systemPrompt } from "@/lib/prompt";
// @ts-ignore: Bypassing standard import to avoid Next.js test file read error in pdf-parse
import pdf from "pdf-parse/lib/pdf-parse.js";
import mammoth from "mammoth";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("cv") as File | null;
    const careerLevel = formData.get("careerLevel") as string || "Fresh";

    if (!file) {
      return NextResponse.json(
        { error: "No CV file provided." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let cvText = "";

    // Parse text based on file type
    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      const parsedPdf = await pdf(buffer);
      cvText = parsedPdf.text;
    } else if (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.name.endsWith(".docx")
    ) {
      const parsedDocx = await mammoth.extractRawText({ buffer });
      cvText = parsedDocx.value;
    } else {
      return NextResponse.json(
        { error: "Unsupported file format. Please upload PDF or DOCX." },
        { status: 400 }
      );
    }

    if (!cvText || cvText.trim() === "") {
      return NextResponse.json(
        { error: "Could not extract text from the file. It might be empty or an image-based PDF." },
        { status: 400 }
      );
    }

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;

    if (!openRouterApiKey) {
      return NextResponse.json(
        { error: "OpenRouter API key is missing. Ensure it is set in Vercel environment variables." },
        { status: 500 }
      );
    }

    // Call OpenRouter
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterApiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://careerpilot.com", // Optional, for OpenRouter rankings
        "X-Title": "CareerPilot CV Review", // Optional, for OpenRouter rankings
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview", // Adjust model as needed (e.g., anthropic/claude-3.5-sonnet)
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `The user's career level is: ${careerLevel}\n\nHere is the CV text to analyze:\n\n${cvText}` }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API Error:", errorText);
      return NextResponse.json({ error: "Failed to communicate with OpenRouter." }, { status: response.status });
    }

    const data = await response.json();
    let resultJson = data.choices[0].message.content;

    try {
      // OpenRouter sometimes wraps JSON in markdown blocks despite the system prompt, so we clean it up if needed.
      if (resultJson.startsWith("\`\`\`json")) {
        resultJson = resultJson.replace(/^\`\`\`json\n/, "").replace(/\n\`\`\`$/, "");
      } else if (resultJson.startsWith("\`\`\`")) {
        resultJson = resultJson.replace(/^\`\`\`\n/, "").replace(/\n\`\`\`$/, "");
      }
      
      const parsedResult = JSON.parse(resultJson);
      return NextResponse.json(parsedResult, { status: 200 });
    } catch (parseError) {
      console.error("Failed to parse LLM response as JSON:", resultJson);
      return NextResponse.json({ error: "LLM did not return valid JSON.", raw_output: resultJson }, { status: 500 });
    }

  } catch (error) {
    console.error("Error processing CV:", error);
    return NextResponse.json(
      { error: "An internal server error occurred while analyzing the CV." },
      { status: 500 }
    );
  }
}