export interface FeedbackValidationIssue {
  code:
    | "EMPTY"
    | "TOO_SHORT"
    | "NOT_ENOUGH_WORDS"
    | "NOT_ENOUGH_LETTERS"
    | "PUNCTUATION_ONLY"
    | "REPEATED_CHARACTERS"
    | "TOO_REPETITIVE";
  message: string;
}

export function normalizeFeedbackText(input: string) {
  return input.replace(/\s+/g, " ").trim();
}

export function getFeedbackValidationIssue(input: string): FeedbackValidationIssue | null {
  const text = normalizeFeedbackText(input);

  if (!text) {
    return {
      code: "EMPTY",
      message: "Please share a real sentence about your experience before unlocking the solutions.",
    };
  }

  if (text.length < 12) {
    return {
      code: "TOO_SHORT",
      message: "That feedback is too short to be useful. Please add a meaningful sentence.",
    };
  }

  if (!/[A-Za-z]/.test(text)) {
    return {
      code: "PUNCTUATION_ONLY",
      message: "Please use real words instead of symbols or dots.",
    };
  }

  const lettersOnly = text.replace(/[^A-Za-z]/g, "");
  if (lettersOnly.length < 8) {
    return {
      code: "NOT_ENOUGH_LETTERS",
      message: "Please write a little more so we can understand your feedback.",
    };
  }

  const words = text
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.replace(/[^a-z]/g, ""))
    .filter(Boolean);

  if (words.length < 3) {
    return {
      code: "NOT_ENOUGH_WORDS",
      message: "Please write at least a short sentence with a few real words.",
    };
  }

  if (/^(.)\1{5,}$/i.test(lettersOnly)) {
    return {
      code: "REPEATED_CHARACTERS",
      message: "That looks like repeated characters rather than feedback. Please try again.",
    };
  }

  const uniqueWords = new Set(words);
  if (uniqueWords.size <= 1 || uniqueWords.size === 2 && words.length >= 4) {
    return {
      code: "TOO_REPETITIVE",
      message: "Please write feedback that explains your experience instead of repeating the same word.",
    };
  }

  return null;
}
