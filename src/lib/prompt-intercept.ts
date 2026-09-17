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

export const SONG_CONTEXT = `Build a professional, dark-themed MUSIC PRODUCTION WEB APPLICATION (a real DAW, not a marketing page), split across index.html, style.css, audioEngine.js and uiController.js.

LAYOUT (index.html + style.css)
1. Multi-track DAW timeline styled after BandLab: a left column of track headers for Vocals, Drums, Instruments and Bass, each with a colored label, M (mute) and S (solo) toggle buttons that visibly change state, and a per-track volume slider. To the right, scrollable timeline lanes with a bar-number ruler, colored clip blocks and a <canvas> per clip for waveform drawing.
2. An "AI Music Generation" panel mimicking Suno AI: description textarea, genre/mood chips, and a Generate button with a progress state that appends a new clip to a track.
3. A fixed bottom transport bar: Play, Pause, Stop, master volume, BPM slider (60-180) with live readout, and a monospace time display formatted 00:00.00.
4. style.css owns CSS custom properties for the whole palette (background, surface, border, accent, per-track colors) plus CSS grid definitions for the timeline, so a single variable change re-themes the app instantly.

AUDIO ENGINE (audioEngine.js — audio only, no DOM rendering)
- Expose a single global object (e.g. window.AudioEngine) with init(), play(), pause(), stop(), setBpm(), setTrackVolume(), setMute(), setSolo(), loadFile(file, trackId) and a getPosition() used by the UI.
- Create the AudioContext / Tone context lazily INSIDE the first user gesture (the Play click). Always check ctx.state === 'suspended' and await ctx.resume() before scheduling.
- Master chain: every track gain -> a master GainNode -> a DynamicsCompressorNode configured threshold -24, knee 30, ratio 12, attack 0.003, release 0.25 -> ctx.destination. This is mandatory anti-clipping protection so four simultaneous tracks never crackle.
- Use look-ahead scheduling: a setInterval/worker tick every ~25ms that schedules events up to ~100ms ahead with exact ctx.currentTime offsets. Never schedule per animation frame and never block the main thread.
- Tone.js may be loaded from https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js, but wrap every Tone call in try/catch and fall back to a pure Web Audio oscillator/noise-buffer kit so playback always works.
- Local media: loadFile() must run ctx.decodeAudioData on dropped .wav/.mp3 files, keep the resulting AudioBuffer, play it through an AudioBufferSourceNode routed into that track's gain, and return peak data for waveform drawing.

UI CONTROLLER (uiController.js — state, events, rendering)
- Owns all event listeners, mute/solo/volume state, BPM, and the render loop.
- requestAnimationFrame loop reads AudioEngine.getPosition() to move a vertical playhead smoothly across the lanes and update the 00:00.00 counter; stop/reset returns both to zero.
- Drag-and-drop: dragover/dragleave/drop listeners on every track row, with a visible drop highlight. On drop, call AudioEngine.loadFile(), draw the returned peaks onto the clip canvas, and place the clip on the sequencer grid at the dropped bar position.

Use a dark studio aesthetic (near-black background, subtle borders, one neon accent), Tailwind utility classes for layout plus style.css variables, and make it responsive.`;

export function hasSongKeyword(prompt: string) {
  return /\bsongs?\b|\bstudio\b|\bdaw\b|\bmusic\b/i.test(prompt);
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
    return `${SONG_CONTEXT}\n\nThe user's original request was: "${raw}". Honour any extra details in it, but the deliverable is the modular music production application described above.`;
  }
  return raw;
}
