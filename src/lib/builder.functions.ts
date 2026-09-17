import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { callGateway } from "./ai-gateway.server";
import { buildFinalPrompt, enhancePromptLocally, hasSongKeyword } from "./prompt-intercept";
import { EMPTY_FILES, type ProjectFiles } from "./bundle";

const PromptInput = z.object({ prompt: z.string().min(1).max(8000) });

const GENERATOR_INSTRUCTIONS = `You are an elite full-stack architect and senior sound engineer. You output MODULAR, MULTI-FILE web projects — never a single flat file.

OUTPUT FORMAT (absolute):
Respond with ONE raw JSON object and nothing else. No markdown fences, no commentary. Shape:
{"index.html":"...","style.css":"...","audioEngine.js":"...","uiController.js":"..."}
All four keys are required. Values are complete file contents as JSON-escaped strings.

FILE RESPONSIBILITIES:
- index.html: structural DOM shell only — layout frames, panels, controls, canvases. It loads Tailwind via <script src="https://cdn.tailwindcss.com"></script>, then <link rel="stylesheet" href="style.css">, and at the end of <body> <script src="audioEngine.js"></script> followed by <script src="uiController.js"></script>. No inline logic, no inline <style> blocks.
- style.css: CSS custom properties for the entire palette plus CSS grid/layout rules, so changing one variable re-themes the app instantly.
- audioEngine.js: audio only. Exposes a global engine object; no DOM querying, no rendering loops.
- uiController.js: all app state, event listeners, click handlers, rendering loops and cross-module calls into the audio engine.

ENGINEERING RULES:
- Any AudioContext (or Tone context) is created and resumed inside a real user gesture; always check state === 'suspended' and call resume().
- Master chain always ends: track gains -> master gain -> DynamicsCompressorNode(threshold -24, knee 30, ratio 12, attack 0.003, release 0.25) -> destination.
- Scheduling uses a look-ahead timer (~25ms tick, ~100ms horizon) against ctx.currentTime; visuals use requestAnimationFrame and never drive audio timing.
- Guard every optional CDN library in try/catch with a working fallback.
- Real, specific copy (never lorem ipsum), inline SVG icons, responsive on phone through desktop, consistent spacing, hover/focus states.
- The code must run with zero console errors when the files are concatenated into one document.`;

function coerceFiles(raw: string): ProjectFiles {
  const text = raw.trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end > start) {
    try {
      const parsed = JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
      const files: ProjectFiles = { ...EMPTY_FILES };
      let found = false;
      for (const key of Object.keys(files) as (keyof ProjectFiles)[]) {
        const value = parsed[key];
        if (typeof value === "string") {
          files[key] = value;
          if (key === "index.html") found = true;
        }
      }
      if (found) return files;
    } catch {
      // fall through to the single-document fallback
    }
  }

  // Fallback: the model returned plain HTML.
  const htmlStart = text.search(/<!DOCTYPE html|<html/i);
  if (htmlStart !== -1) {
    return { ...EMPTY_FILES, "index.html": text.slice(htmlStart) };
  }
  return { ...EMPTY_FILES };
}

export const generateWebsite = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => PromptInput.parse(d))
  .handler(async ({ data }) => {
    const finalPrompt = buildFinalPrompt(data.prompt);
    const raw = await callGateway({
      instructions: GENERATOR_INSTRUCTIONS,
      input: finalPrompt,
      effort: hasSongKeyword(data.prompt) ? "medium" : "low",
    });
    const files = coerceFiles(raw);
    if (!files["index.html"].trim())
      throw new Error("The AI engine returned an empty project. Please try again.");
    return { files, intercepted: hasSongKeyword(data.prompt) };
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
