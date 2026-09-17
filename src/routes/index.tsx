import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Code2,
  Download,
  Loader2,
  Monitor,
  Music4,
  RefreshCw,
  Smartphone,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateWebsite, enhancePrompt } from "@/lib/builder.functions";
import { hasSongKeyword } from "@/lib/prompt-intercept";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Forge Studio — AI Website Builder" },
      {
        name: "description",
        content:
          "Describe any website and Forge Studio generates, previews and exports a working single-page app instantly — including full DAW-style music apps.",
      },
      { property: "og:title", content: "Forge Studio — AI Website Builder" },
      {
        property: "og:description",
        content:
          "Generate, preview and download functional single-page web apps from a prompt, live in your browser.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Builder,
});

const IDEAS = [
  "A bakery landing page",
  "Build me a song studio",
  "SaaS pricing page for an email tool",
  "Photographer portfolio",
];

const EMPTY_DOC = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><script src="https://cdn.tailwindcss.com"></script></head><body class="min-h-screen flex items-center justify-center bg-[#101317] text-slate-500 font-sans"><div class="text-center px-6"><div class="text-sm tracking-[0.3em] uppercase">Preview</div><p class="mt-3 text-slate-600">Your generated website will appear here.</p></div></body></html>`;

function Builder() {
  const [prompt, setPrompt] = useState("");
  const [html, setHtml] = useState("");
  const [busy, setBusy] = useState<"idle" | "enhance" | "generate">("idle");
  const [view, setView] = useState<"desktop" | "mobile">("desktop");
  const [showCode, setShowCode] = useState(false);
  const frameKey = useRef(0);

  const generate = useServerFn(generateWebsite);
  const enhance = useServerFn(enhancePrompt);

  const songMode = useMemo(() => hasSongKeyword(prompt), [prompt]);

  const onEnhance = useCallback(async () => {
    if (!prompt.trim() || busy !== "idle") return;
    setBusy("enhance");
    try {
      const res = await enhance({ data: { prompt } });
      setPrompt(res.prompt);
      toast.success("Prompt expanded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not expand the prompt");
    } finally {
      setBusy("idle");
    }
  }, [prompt, busy, enhance]);

  const onGenerate = useCallback(async () => {
    if (!prompt.trim() || busy !== "idle") return;
    setBusy("generate");
    try {
      const res = await generate({ data: { prompt } });
      frameKey.current += 1;
      setHtml(res.html);
      toast.success(res.intercepted ? "Music studio app generated" : "Website generated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setBusy("idle");
    }
  }, [prompt, busy, generate]);

  const onDownload = useCallback(() => {
    if (!html) return;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "index.html";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("index.html downloaded");
  }, [html]);

  const working = busy !== "idle";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-center" />

      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1800px] items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-brand text-primary-foreground shadow-glow">
              <Zap className="size-5" />
            </span>
            <div className="leading-tight">
              <h1 className="text-base font-semibold tracking-tight">Forge Studio</h1>
              <p className="hidden text-xs text-muted-foreground sm:block">
                Prompt-to-app generation engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center rounded-lg border border-border bg-card p-1 sm:flex">
              <button
                onClick={() => setView("desktop")}
                aria-label="Desktop preview"
                className={`rounded-md p-1.5 transition-colors ${view === "desktop" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Monitor className="size-4" />
              </button>
              <button
                onClick={() => setView("mobile")}
                aria-label="Mobile preview"
                className={`rounded-md p-1.5 transition-colors ${view === "mobile" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Smartphone className="size-4" />
              </button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCode((s) => !s)}
              disabled={!html}
            >
              <Code2 className="size-4" />
              <span className="hidden sm:inline">{showCode ? "Preview" : "Code"}</span>
            </Button>
            <Button size="sm" onClick={onDownload} disabled={!html}>
              <Download className="size-4" />
              <span className="hidden sm:inline">Download</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1800px] gap-4 p-4 sm:px-6 lg:grid-cols-[360px_1fr] lg:items-start">
        <aside className="surface-glow rounded-2xl border border-border bg-card p-4 lg:sticky lg:top-20">
          <label
            htmlFor="prompt"
            className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground"
          >
            Your idea
          </label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the website you want to build..."
            className="mt-2 min-h-40 resize-none bg-background/60 text-sm leading-relaxed"
          />

          <div className="mt-3 flex flex-wrap gap-1.5">
            {IDEAS.map((idea) => (
              <button
                key={idea}
                onClick={() => setPrompt(idea)}
                className="rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
              >
                {idea}
              </button>
            ))}
          </div>

          {songMode && (
            <div className="mt-3 flex gap-2 rounded-xl border border-primary/40 bg-primary/10 p-3 text-xs text-foreground">
              <Music4 className="mt-0.5 size-4 shrink-0 text-primary" />
              <p>
                Studio mode detected — this build becomes a BandLab-style multi-track DAW with a
                Suno-style AI music panel, transport controls and a live playhead.
              </p>
            </div>
          )}

          <div className="mt-4 grid gap-2">
            <Button
              variant="outline"
              onClick={onEnhance}
              disabled={working || !prompt.trim()}
              className="w-full"
            >
              {busy === "enhance" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Wand2 className="size-4" />
              )}
              Enhance Prompt
            </Button>
            <Button
              onClick={onGenerate}
              disabled={working || !prompt.trim()}
              className="w-full bg-gradient-brand font-semibold text-primary-foreground shadow-glow hover:opacity-90"
            >
              {busy === "generate" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              Generate Website
            </Button>
            {html && (
              <Button variant="ghost" onClick={onGenerate} disabled={working} className="w-full">
                <RefreshCw className="size-4" />
                Regenerate
              </Button>
            )}
          </div>

          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Output is raw HTML + Tailwind, rendered live in the preview frame and ready to download
            as a single file.
          </p>
        </aside>

        <section className="min-h-[70vh]">
          <div className="grid-dots overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border bg-background/60 px-3 py-2">
              <span className="size-2.5 rounded-full bg-destructive/70" />
              <span className="size-2.5 rounded-full bg-accent/70" />
              <span className="size-2.5 rounded-full bg-primary/70" />
              <span className="ml-2 truncate text-xs text-muted-foreground">
                {showCode ? "source · index.html" : "localhost:preview"}
              </span>
            </div>

            {showCode ? (
              <pre className="max-h-[calc(100vh-11rem)] overflow-auto bg-background/80 p-4 text-xs leading-relaxed text-muted-foreground">
                <code>{html}</code>
              </pre>
            ) : (
              <div className="flex justify-center bg-background/40 p-2 sm:p-4">
                <div
                  className={`relative w-full transition-all duration-300 ${view === "mobile" ? "max-w-[390px]" : "max-w-none"}`}
                >
                  {busy === "generate" && (
                    <div className="absolute inset-0 z-10 grid place-items-center rounded-xl bg-background/80 backdrop-blur-sm">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="size-7 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Building your app…</p>
                      </div>
                    </div>
                  )}
                  <iframe
                    key={frameKey.current}
                    title="Generated website preview"
                    srcDoc={html || EMPTY_DOC}
                    sandbox="allow-scripts allow-forms allow-modals allow-popups"
                    className="h-[calc(100vh-13rem)] min-h-[520px] w-full rounded-xl border border-border bg-white"
                  />
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
