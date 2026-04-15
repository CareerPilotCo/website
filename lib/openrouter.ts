interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenRouterJsonOptions {
  messages: OpenRouterMessage[];
  model: string;
  temperature?: number;
}

function stripMarkdownCodeFence(content: string) {
  if (content.startsWith("```json")) {
    return content.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  }

  if (content.startsWith("```")) {
    return content.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }

  return content;
}

export async function getOpenRouterJson<T>({
  messages,
  model,
  temperature = 0,
}: OpenRouterJsonOptions): Promise<T> {
  const openRouterApiKey = process.env.OPENROUTER_API_KEY;

  if (!openRouterApiKey) {
    throw new Error("OpenRouter API key is missing.");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openRouterApiKey}`,
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://careerpilot.com",
      "X-Title": "CareerPilot CV Review",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature,
      messages,
      response_format: { type: "json_object" },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("OpenRouter returned an empty response.");
  }

  return JSON.parse(stripMarkdownCodeFence(content)) as T;
}
