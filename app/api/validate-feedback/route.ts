import { NextResponse } from "next/server";
import { getFeedbackValidationIssue, normalizeFeedbackText } from "@/lib/feedback-validation";
import { getOpenRouterJson } from "@/lib/openrouter";

interface FeedbackValidationModelResponse {
  verdict: "accept" | "reject";
  reason: string;
}

const feedbackValidationPrompt = `You validate whether product feedback is meaningful enough to unlock gated content.

Return JSON only in this exact shape:
{
  "verdict": "accept" | "reject",
  "reason": "Short plain-English message for the end user."
}

Accept feedback when it expresses a real opinion, reaction, suggestion, or critique about the CV review experience, even if it is brief.
Reject feedback when it is nonsense, punctuation, filler, repeated words, random characters, or too vague to be useful.

Examples to reject:
- ".."
- "good"
- "ok"
- "nice nice nice"
- "asdfgh"
- "123456"

Examples to accept:
- "The score breakdown was helpful, but I wanted clearer advice on the summary section."
- "I liked the review and the comments were easy to understand."
- "The feedback felt too generic for my work experience."
- "This thing is amazing!"

Keep the reason short, direct, and user-friendly.`;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { feedback?: unknown };
    const feedback = typeof body.feedback === "string" ? body.feedback : "";
    const normalizedFeedback = normalizeFeedbackText(feedback);

    const localIssue = getFeedbackValidationIssue(normalizedFeedback);
    if (localIssue) {
      return NextResponse.json(
        { valid: false, message: localIssue.message, source: "rules" },
        { status: 400 }
      );
    }

    try {
      const result = await getOpenRouterJson<FeedbackValidationModelResponse>({
        model: process.env.OPENROUTER_FEEDBACK_MODEL || "openai/gpt-4o-mini",
        temperature: 0,
        messages: [
          { role: "system", content: feedbackValidationPrompt },
          { role: "user", content: normalizedFeedback },
        ],
      });

      if (result.verdict === "reject") {
        return NextResponse.json(
          {
            valid: false,
            message: result.reason || "That feedback does not seem meaningful. Please try again with a real sentence.",
            source: "ai",
          },
          { status: 400 }
        );
      }

      return NextResponse.json({ valid: true, source: "ai" }, { status: 200 });
    } catch (error) {
      console.error("Feedback validation model error:", error);

      return NextResponse.json(
        { valid: true, source: "fallback" },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error validating feedback:", error);
    return NextResponse.json(
      { valid: false, message: "We could not validate your feedback right now. Please try again." },
      { status: 500 }
    );
  }
}
