// AI Client - Uses api.abdalgani.com (LiteLLM) with OpenAI-compatible API
const API_BASE = "https://api.abdalgani.com/v1";
const API_KEY = (import.meta as any).env.VITE_API_KEY || "";
const MODEL = "gemini-2.5-flash";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface FunctionDef {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}

async function callAPI(messages: ChatMessage[], options?: {
  responseMimeType?: string;
  functions?: FunctionDef[];
  function_call?: string;
}) {
  const body: any = {
    model: MODEL,
    messages,
    temperature: 0.7,
    max_tokens: 4096,
  };

  if (options?.responseMimeType === "application/json") {
    body.response_format = { type: "json_object" };
  }

  if (options?.functions) {
    body.functions = options.functions;
    if (options.function_call) {
      body.function_call = options.function_call;
    }
  }

  const res = await fetch(`${API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API Error ${res.status}: ${err}`);
  }

  return res.json();
}

// Simple text generation
export async function generateText(prompt: string, systemInstruction?: string): Promise<string> {
  const messages: ChatMessage[] = [];
  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }
  messages.push({ role: "user", content: prompt });

  const data = await callAPI(messages);
  return data.choices?.[0]?.message?.content || "";
}

// JSON generation
export async function generateJSON(prompt: string, systemInstruction?: string): Promise<string> {
  const messages: ChatMessage[] = [];
  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }
  messages.push({ role: "user", content: prompt });

  const data = await callAPI(messages, { responseMimeType: "application/json" });
  return data.choices?.[0]?.message?.content || "[]";
}

// Chat with function calling (for SecureCity)
export async function chatWithFunctions(
  prompt: string,
  history: { role: string; content: string }[],
  systemInstruction: string,
  functions: FunctionDef[]
): Promise<any> {
  const messages: ChatMessage[] = [
    { role: "system", content: systemInstruction },
    ...history.map(h => ({
      role: h.role === "model" ? "assistant" as const : h.role as any,
      content: h.content,
    })),
    { role: "user", content: prompt },
  ];

  const data = await callAPI(messages, { functions });

  const choice = data.choices?.[0];
  const message = choice?.message;

  return {
    text: message?.content || "",
    functionCall: message?.function_call || null,
  };
}

export type { FunctionDef };
