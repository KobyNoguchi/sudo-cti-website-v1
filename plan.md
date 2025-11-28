## Plan: Platform Globe Proof of Concept

### Overview
- Create a first-pass `/platform` page so the existing navigation link resolves to a dedicated experience.
- Showcase a Kaspersky-inspired ransomware globe using mock data (2013‑2025) to validate animation, UI, and performance decisions before ingesting the production dataset.
- Keep the implementation modular (distinct data/types, controls, visualization, and page shell) so we can iterate or swap data sources without rewriting the UI.

### Plan
1. **Dependencies (`package.json`, `package-lock.json`)**
   - Add `three` and `globe.gl` for the visualization plus `@types/three` as a dev dependency. (No `leva` unless you want a debug panel; we’ll skip it for simplicity.)
   - Run `npm install` to update the lockfile.

2. **Shared types (`types/index.ts`)**
   - Define a `RansomwareAttack` interface describing id, organization, city/state, coordinates, ransom amount, date, ransomware family, severity bucket, and optional attacker origin when rendering arcs.
   - Export the interface for reuse across mock data and components.

3. **Mock dataset (`data/mock-ransomware.ts`)**
   - Create a lightweight dataset (≈25 entries) covering the 2013‑2025 range and all severity tiers.
   - Pre-calculate helper fields where useful (e.g., magnitude-derived color category) so the globe component can remain lean.

4. **Timeline controls (`components/platform/TimelineControls.tsx`)**
   - Build a client component that receives `currentYear`, year bounds, `isPlaying`, `speed`, and callback props.
   - Render play/pause, reset, speed pills (1×/2×/5×/10×), and a range slider; ensure controls are accessible (`aria-label`s, keyboard focus outlines).

5. **Globe experience (`components/platform/RansomwareGlobe.tsx`)**
   - Client component that dynamically imports `globe.gl` to avoid SSR issues.
   - Configure globe textures, ambient/directional lighting, auto-rotation, and constrained zoom via the Globe API.
   - Use component state to manage `currentYear`, `isPlaying`, `speed`, and filtered `visibleAttacks`.
   - Render points (severity-based colors + pulse effect), optional arcs (origin→victim), and rings for impact ripples.
   - Wire hover events to show a floating tooltip with organization, location, amount, family, and date.
   - Integrate the `TimelineControls` component and keep everything wrapped in a responsive container with a gradient background.

6. **Styling helpers (`app/globals.css`)**
   - Add minimal custom classes (e.g., `.cyber-gradient`, `.starfield`, `.globe-tooltip`) plus keyframes for point/ring glow.
   - Keep styles tailwind-friendly (utility classes + a few bespoke selectors where Tailwind can’t help).

7. **Platform page (`app/platform/page.tsx`)**
   - Add page-level metadata (title/description). 
   - Compose a hero section (headline, supporting copy, CTA) explaining the platform value, followed by the globe component inside a dark section, and optionally a short feature grid/FAQ to contextualize what the visualization represents.
   - Ensure the page uses existing spacing conventions (`pt-32 pb-24`, `max-w-7xl`, etc.) so it matches the rest of the site.

8. **QA / static export sanity**
   - Since the site is statically exported, confirm the globe component only runs on the client (no SSR usage of `window` or `document`).
   - Smoke-test `npm run build` to ensure `globe.gl` doesn’t break the static export pipeline.

### Implementation Checklist
1. Install `three`, `globe.gl`, and `@types/three`; update both `package.json` and `package-lock.json`.
2. Extend `types/index.ts` with the `RansomwareAttack` interface.
3. Create `data/mock-ransomware.ts` exporting a typed mock dataset covering 2013‑2025 and multiple severity tiers.
4. Implement `components/platform/TimelineControls.tsx` with play/pause, reset, speed buttons, and a year slider.
5. Implement `components/platform/RansomwareGlobe.tsx` that lazy-loads `globe.gl`, renders points/arcs/rings, manages playback state, and shows hover tooltips.
6. Add supporting styles in `app/globals.css` for the globe container background, tooltip, and pulse effects.
7. Build `app/platform/page.tsx` with metadata, hero content, and the new globe section using the mock dataset.
8. Run a quick `npm run build` (or `npm run dev` smoke test) to ensure the globe renders without SSR/export issues.***

