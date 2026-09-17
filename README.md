# Prompt Weaver

Create a highly professional, dark-themed AI Website Builder platform that generates, previews, and renders functional single-page web applications from user prompts. The application must run entirely in the browser as a responsive web app.

### 1. User Interface Requirements

- **Dashboard Layout:** A clean sidebar for input controls and a large main viewport for the website preview.

- **Sidebar Elements:** 

  - A prominent text area labeled "Describe the website you want to build...".

  - An "Enhance Prompt" button that expands simple user entries into detailed descriptions.

  - A "Generate Website" button to trigger the creation process.

- **Main Viewport:** A large container holding an HTML <iframe>. This iframe must instantly parse and display whatever HTML/CSS/JS code the generation engine outputs.

- **Export Tools:** Include a "Download Source Code" button that packages the generated code into a clean file for the user.

### 2. Pre-Processing & "Song" Keyword Mapping Logic

Implement an interceptor function that processes the user's text entry before sending it to the generation engine:

- If the user clicks "Enhance Prompt", use an internal template to rewrite simple keywords (e.g., "bakery" becomes "A modern bakery landing page with a hero banner, product grid, opening hours, and contact form").

- CRITICAL MAPPING RULE: If the user inputs the word "song" anywhere in their prompt, the app must automatically intercept it and inject a comprehensive background context. The injected prompt must explicitly force the generation engine to build a music production application with the following criteria:

  1. A multi-track Digital Audio Workstation (DAW) timeline layout styled tightly after BandLab, featuring visible audio tracks (Vocals, Drums, Instruments, Bass), individual mute/solo toggles, volume sliders, and track headers.

  2. A dedicated "AI Music Generation" prompt box mimicking Suno AI, where users can type a description to synthesize music.

  3. Interactive transport controls (Play, Pause, Stop, a master Volume slider, and a BPM slider).

  4. Integration with Tone.js (or an engineered mock audio node system) that allows users to click play and see a visual playhead move across the timeline blocks.

### 3. Execution & Preview Engine

- Setup a code parsing component that communicates with an LLM framework (or a robust mock generation library for testing). 

- The engine must output ONLY valid, raw, web-standard HTML combined with Tailwind CSS classes for styling. 

- No markdown wrappers (like ```html), no conversational pleasantries, and no textual explanations.

- Ensure that the generated code string is dynamically injected into the iframe srcDoc property so the user can see and interact with their newly created website immediately without reloading the page.

- Make the layout completely mobile-responsive, scaling beautifully from desktop monitors down to mobile phone viewports.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://wavegrid.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/96a24c35-634d-4e5d-bcbd-44eadcd296a5).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
