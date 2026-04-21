import { NextResponse } from "next/server";
import { getFeedbackValidationIssue, normalizeFeedbackText } from "@/lib/feedback-validation";

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

    return NextResponse.json({ valid: true, source: "rules" }, { status: 200 });
  } catch (error) {
    console.error("Error validating feedback:", error);
    return NextResponse.json(
      { valid: false, message: "We could not validate your feedback right now. Please try again." },
      { status: 500 }
    );
  }
}
