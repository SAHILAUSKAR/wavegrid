import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { callGateway } from "./ai-gateway.server";
import { buildFinalPrompt, enhancePromptLocally, hasSongKeyword } from "./prompt-intercept";

const PromptInput = z.object({ prompt: z.string().min(1).max(8000) });

const GENERATOR_INSTRUCTIONS = `You are an elite front-end engineer. Output a COMPLETE, single-file web application.

HARD RULES:
- Respond with raw HTML only. Start with <!DOCTYPE html> and end with </html>.
- No markdown fences, no commentary, no explanations before or after the code.
- Style exclusively with Tailwind CSS utility classes, loaded via <script src="https://cdn.tailwindcss.com"></script>.
- All interactivity in a single inline <script> tag using vanilla JavaScript. No build steps, no frameworks unless explicitly requested.
- Use real, specific copy (never "Lorem ipsum"). Use inline SVG for icons and CSS gradients/shapes instead of remote images unless a photo is essential (then use https://images.unsplash.com URLs).
- The page must be fully responsive and look professionally designed: consistent spacing, a coherent color system, hover/focus states and subtle transitions.`;

export const generateWebsite = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => PromptInput.parse(d))
  .handler(async ({ data }) => {
    const finalPrompt = buildFinalPrompt(data.prompt);
    const html = await callGateway({
      instructions: GENERATOR_INSTRUCTIONS,
      input: finalPrompt,
      effort: hasSongKeyword(data.prompt) ? "medium" : "low",
    });
    if (!html) throw new Error("The AI engine returned an empty result. Please try again.");
    return { html, intercepted: hasSongKeyword(data.prompt) };
  });

export const enhancePrompt = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => PromptInput.parse(d))
  .handler(async ({ data }) => {
    const seeded = enhancePromptLocally(data.prompt);
    try {
      const text = await callGateway({
        instructions:
          "You expand short website ideas into one rich, concrete build brief. Reply with a single paragraph of plain text (max 120 words) describing sections, layout, tone and colour direction. No lists, no markdown, no preamble.",
        input: seeded,
        effort: "low",
      });
      return { prompt: text.trim() || seeded };
    } catch {
      return { prompt: seeded };
    }
  });
