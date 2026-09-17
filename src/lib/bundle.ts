// Shared (browser-safe) helpers for the multi-file project bundle.

export const FILE_ORDER = ["index.html", "style.css", "audioEngine.js", "uiController.js"] as const;

export type FileName = (typeof FILE_ORDER)[number];

export type ProjectFiles = Record<FileName, string>;

export const EMPTY_FILES: ProjectFiles = {
  "index.html": "",
  "style.css": "",
  "audioEngine.js": "",
  "uiController.js": "",
};

/**
 * Inlines style.css and the two JS modules into index.html so the bundle can be
 * rendered inside a sandboxed iframe (no network module resolution available).
 */
export function assembleBundle(files: ProjectFiles): string {
  let html = files["index.html"] ?? "";
  if (!html.trim()) return "";

  // Drop local references — they are inlined below.
  html = html
    .replace(/<link[^>]+href=["']\.?\/?style\.css["'][^>]*>\s*/gi, "")
    .replace(/<script[^>]+src=["']\.?\/?(audioEngine|uiController)\.js["'][^>]*>\s*<\/script>\s*/gi, "");

  const styleTag = files["style.css"].trim() ? `<style>\n${files["style.css"]}\n</style>` : "";
  const scriptTag = `<script>\n${files["audioEngine.js"]}\n</script>\n<script>\n${files["uiController.js"]}\n</script>`;

  if (/<\/head>/i.test(html)) {
    html = html.replace(/<\/head>/i, `${styleTag}\n</head>`);
  } else {
    html = `${styleTag}\n${html}`;
  }

  if (/<\/body>/i.test(html)) {
    html = html.replace(/<\/body>/i, `${scriptTag}\n</body>`);
  } else {
    html = `${html}\n${scriptTag}`;
  }

  return html;
}
