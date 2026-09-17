// Pre-processing layer: keyword templates + the critical "song" interception rule.

const KEYWORD_TEMPLATES: Record<string, string> = {
  bakery:
    "A modern bakery landing page with a hero banner, signature product grid, opening hours, testimonials, and a contact form.",
  restaurant:
    "An elegant restaurant landing page with a full-bleed hero, menu sections with prices, chef story, gallery, reservation form, and map/footer.",
  portfolio:
    "A minimal personal portfolio with a bold hero intro, selected project cards with hover states, skills list, about section, and contact links.",
  saas: "A polished SaaS marketing page with a gradient hero, feature grid, logo strip, pricing tiers with a highlighted plan, FAQ accordion, and CTA footer.",
  gym: "A high-energy fitness studio page with a hero call-to-action, class schedule table, trainer cards, membership pricing, and a join form.",
  agency:
    "A creative agency site with a statement hero, services grid, case-study cards, team section, client logos, and a contact form.",
  blog: "A clean editorial blog homepage with a featured article, article card grid, category chips, newsletter signup, and footer.",
  shop: "A modern e-commerce landing page with a hero promo, product grid with prices and add-to-cart buttons, category filters, reviews, and footer.",
  travel:
    "A travel agency page with a cinematic hero, destination cards, itinerary highlights, pricing packages, testimonials, and a booking form.",
  dashboard:
    "An analytics dashboard UI with a sidebar, KPI stat cards, a chart area, a recent-activity table, and a top bar with search and avatar.",
};

export const SONG_CONTEXT = `Build a professional, dark-themed, single-page MUSIC PRODUCTION WEB APPLICATION (not a generic website). It must include ALL of the following, fully laid out and interactive:

1. A multi-track Digital Audio Workstation (DAW) timeline styled tightly after BandLab: a left column of track headers for Vocals, Drums, Instruments and Bass, each with a colored label, an M (mute) and S (solo) toggle button that visibly changes state on click, and a volume range slider. To the right of each header, a scrollable timeline lane with a ruler of bar numbers and several colored clip blocks containing simple waveform bars.
2. A dedicated "AI Music Generation" panel mimicking Suno AI: a styled textarea for a song description, genre/mood chips, and a "Generate" button that shows a fake progress/loading state and then appends a new clip to a track.
3. Transport controls in a fixed bottom bar: Play, Pause and Stop buttons, a master volume slider, a BPM slider (60-180) with a live value readout, and a time display.
4. Audio engine: load Tone.js from CDN (https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js) and, when Play is pressed, start a simple synth/drum pattern whose tempo follows the BPM slider. Wrap Tone usage in try/catch and fall back to a silent mock scheduler using requestAnimationFrame so the UI always works. In both cases a vertical playhead line must animate smoothly across the timeline lanes while playing, and stop/reset correctly.

Use a dark studio aesthetic (near-black background, subtle borders, neon accent color), Tailwind CSS utility classes, and make it responsive.`;

export function hasSongKeyword(prompt: string) {
  return /\bsongs?\b/i.test(prompt);
}

/** Expands simple keyword entries into a detailed description. */
export function enhancePromptLocally(prompt: string) {
  const raw = prompt.trim();
  if (!raw) return raw;
  const lower = raw.toLowerCase();

  const hit = Object.keys(KEYWORD_TEMPLATES).find((k) => lower.includes(k));
  const base = hit ? `${KEYWORD_TEMPLATES[hit]} Original request: "${raw}".` : raw;

  return `${base} Include a sticky navigation bar, a strong hero section, at least four well-spaced content sections, smooth hover states, tasteful micro-animations, a footer, and a fully mobile-responsive layout.`;
}

/** Final prompt sent to the generation engine. */
export function buildFinalPrompt(prompt: string) {
  const raw = prompt.trim();
  if (hasSongKeyword(raw)) {
    return `${SONG_CONTEXT}\n\nThe user's original request was: "${raw}". Honour any extra details in it, but the deliverable is the music production application described above.`;
  }
  return raw;
}
