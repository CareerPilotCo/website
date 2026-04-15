import { NextResponse } from "next/server";
import { systemPrompt } from "@/lib/prompt";
import { getOpenRouterJson } from "@/lib/openrouter";
// @ts-expect-error: Bypassing standard import to avoid Next.js test file read error in pdf-parse
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
    try {
      const parsedResult = await getOpenRouterJson({
        model: "google/gemini-3-flash-preview",
        temperature: 0.4,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `The user's career level is: ${careerLevel}\n\nHere is the CV text to analyze:\n\n${cvText}`,
          },
        ],
      });

      return NextResponse.json(parsedResult, { status: 200 });
    } catch (error) {
      console.error("OpenRouter API Error:", error);
      return NextResponse.json({ error: "Failed to communicate with OpenRouter." }, { status: 500 });
    }

  } catch (error) {
    console.error("Error processing CV:", error);
    return NextResponse.json(
      { error: "An internal server error occurred while analyzing the CV." },
      { status: 500 }
    );
  }
}
