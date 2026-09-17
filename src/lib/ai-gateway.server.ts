const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/responses";
const MODEL = "openai/gpt-6-astra";

function stripFences(text: string) {
  let out = text.trim();
  // Only remove markdown fences — never slice into the payload, the generator
  // returns JSON whose string values legitimately contain "<!DOCTYPE html".
  out = out.replace(/^```(?:json|html|JSON|HTML)?\s*/, "").replace(/```\s*$/, "");
  return out.trim();
}

/**
 * Calls the Lovable AI Gateway Responses API with streaming (required for
 * reasoning models) and accumulates the final text server-side.
 */
export async function callGateway(opts: {
  instructions: string;
  input: string;
  effort?: "low" | "medium" | "high";
}): Promise<string> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: MODEL,
      instructions: opts.instructions,
      input: opts.input,
      stream: true,
      store: false,
      reasoning: { effort: opts.effort ?? "low" },
    }),
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    if (res.status === 429) throw new Error("The AI engine is busy right now. Please try again in a moment.");
    if (res.status === 402)
      throw new Error("AI credits are exhausted for this workspace. Add credits in Lovable to keep generating.");
    if (res.status === 403)
      throw new Error("AI access is blocked for this workspace. Check the workspace AI settings.");
    throw new Error(`AI request failed (${res.status}). ${detail.slice(0, 300)}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const evt = JSON.parse(payload);
        if (evt.type === "response.output_text.delta" && typeof evt.delta === "string") {
          text += evt.delta;
        } else if (evt.type === "response.completed" && !text) {
          text = evt.response?.output_text ?? "";
        }
      } catch {
        // ignore keep-alive / partial frames
      }
    }
  }

  return stripFences(text);
}
