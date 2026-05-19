export interface FeedbackValidationIssue {
  code:
    | "EMPTY"
    | "PUNCTUATION_ONLY"
    | "NUMBERS_ONLY"
    | "PLACEHOLDER_TEXT"
    | "INTERNET_SLANG"
    | "KEYBOARD_MASH"
    | "REPEATED_CHARACTERS"
    | "TOO_REPETITIVE"
    | "LOW_SIGNAL";
  message: string;
}

const LOW_SIGNAL_EXACT_PATTERNS = new Set([
  "k",
  "kk",
  "feedback",
  "na",
  "n/a",
]);

const LOW_SIGNAL_PHRASE_PATTERNS = [
  /^good job!?$/i,
  /^very good!?$/i,
  /^looks good!?$/i,
  /^all good!?$/i,
  /^nice work!?$/i,
  /^great job!?$/i,
  /^so good!?$/i,
  /^it('?s| is) good!?$/i,
  /^it('?s| is) nice!?$/i,
  /^it('?s| is) great!?$/i,
];

const KEYBOARD_MASH_PATTERNS = [
  /qwerty/i,
  /asdf/i,
  /zxcv/i,
  /^[bcdfghjklmnpqrstvwxyz]{6,}$/i,
];

const INTERNET_SLANG_PATTERNS = [
  /^(?:lmao|lmfao|lol|lolol|rofl|wtf|bruh|bro|omg|idk|ikr|tbh|ngl|fr|frfr)$/i,
  /^(?:haha|hahaha|hehe|hehehe|xd)+$/i,
];

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

  if (!/[A-Za-z]/.test(text)) {
    if (/^\d+$/.test(text.replace(/\s+/g, ""))) {
      return {
        code: "NUMBERS_ONLY",
        message: "Please use real words instead of only numbers.",
      };
    }

    return {
      code: "PUNCTUATION_ONLY",
      message: "Please use real words instead of symbols or dots.",
    };
  }

  const lowered = text.toLowerCase();
  if (LOW_SIGNAL_EXACT_PATTERNS.has(lowered) || LOW_SIGNAL_PHRASE_PATTERNS.some((pattern) => pattern.test(text))) {
    return {
      code: "LOW_SIGNAL",
      message: "Please share at least a little real feedback instead of a generic short phrase.",
    };
  }

  const words = lowered
    .split(/\s+/)
    .map((word) => word.replace(/[^a-z]/g, ""))
    .filter(Boolean);

  if (words.length === 1) {
    const onlyWord = words[0];

    if (INTERNET_SLANG_PATTERNS.some((pattern) => pattern.test(onlyWord))) {
      return {
        code: "INTERNET_SLANG",
        message: "Please write real feedback instead of slang or reaction words.",
      };
    }
  }

  if (words.length === 1 && (words[0] === "lorem" || words[0] === "ipsum")) {
    return {
      code: "PLACEHOLDER_TEXT",
      message: "Please write real feedback instead of placeholder text.",
    };
  }

  if (/lorem ipsum/i.test(text) || /\b(?:test|testing)\b(?:[\s.!?]+\b(?:test|testing)\b)?/i.test(text)) {
    return {
      code: "PLACEHOLDER_TEXT",
      message: "Please write real feedback instead of placeholder text.",
    };
  }

  const compactText = text.replace(/\s+/g, "");
  if (KEYBOARD_MASH_PATTERNS.some((pattern) => pattern.test(compactText))) {
    return {
      code: "KEYBOARD_MASH",
      message: "That looks like random letters instead of feedback. Please try again.",
    };
  }

  const lettersOnly = text.replace(/[^A-Za-z]/g, "");
  if (/^(.)\1{5,}$/i.test(lettersOnly)) {
    return {
      code: "REPEATED_CHARACTERS",
      message: "That looks like repeated characters rather than feedback. Please try again.",
    };
  }

  const uniqueWords = new Set(words);
  if ((uniqueWords.size === 1 && words.length >= 2) || (uniqueWords.size === 2 && words.length >= 5)) {
    return {
      code: "TOO_REPETITIVE",
      message: "Please write feedback that explains your experience instead of repeating the same word.",
    };
  }

  return null;
}
