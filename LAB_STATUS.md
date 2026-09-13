# Current public lab status / 2026-09-13

The seven-work collection is LIVE at https://interactive-visual-lab.vercel.app/. GitHub: emilgoodman-lab/emilgoodman. Each player has Previous / Next / Index. See PUBLISHING.md for the release workflow.

The records below describe earlier local stages and are historical, not current deployment status.

## Strata I — Sand Table / 2026-09-13

- New independent artwork: `/experiments/strata/v1/`; stable player `/play/?work=strata`. All six earlier catalog works and their versioned paths remain preserved.
- 3000 permanent uncommon glyph grains are divided into three exact 1000-grain collision layers. Seeded sizes vary by ±25%; layers pass through each other while every grain collides within its own layer and the canvas walls.
- Pointer, touch and open hand sweep with a broad circular field. Held pointer, Space or fist inverts the chamber and generates continuously changing multidirectional turbulence across the table.
- Three continuous granular textures plus additive stereo impacts follow layer contacts and movement. Held wind adds three white-noise bands, pans toward the strongest direction and feeds two spatial echoes.
- Seven deterministic catalog and physics checks passed. The actual OfflineAudioContext graph verified silence at rest, contact-additive density, directional stereo wind and echo tails. Synthetic open-hand, sustained-fist, tracking-loss and keyboard states passed; the complete 53-test lab suite passed.
- GitHub release commit: `c11ee6192f84e71d230764143083eecc149a8ee1`. Vercel deployment `52smBoTGNtLsbrn3rgNBBA33o7DG` succeeded. The public player loaded Strata I as 007 / 007 with all 3000 grains; sound, sweep, transient held inversion and Previous / Next links were verified.

## Weave II — Elastic Resonance / 2026-09-13

- Live release: `/experiments/weave/v2/`; the stable player remains `/play/?work=weave`. Weave I remains preserved.
- Replaced the abrupt initial motion with a phase-continuous cubic growth envelope: a slow local wave starts near 2 px / 50 px range and grows over about 3.2 seconds to the established full amplitude and a wider 340+ px range.
- Calm audio is driven by the exact visual sine signal. Trough-to-crest position changes both gain and pitch continuously while screen position still sets the base tone.
- The fist/pointer knot gathers roughly 60% more glyphs into the core, pulls more than 1200 outer nodes and keeps over 1300 nodes in active high-frequency motion in the deterministic desktop test.
- Eight catalog, physics, envelope and audio-mapping checks passed. Real OfflineAudioContext renders verified the trough/crest relationship, position-dependent tone, distorted knot and echo. Synthetic hand states and desktop visuals passed.
- GitHub release commit: `444371712e4ed85ce9b36e7fad1bafbf98497f07`. Vercel deployment `HkL3yg9pKkfEno73UqZCcuowRjFf` succeeded. The public player loaded Weave II as 006 / 006; the measured 9% to 100% growth, audio activation, navigation and clean browser execution were verified.

## Weave I — Elastic Field / 2026-09-13

- New independent artwork: `/experiments/weave/v1/`; stable player `/play/?work=weave`. All five earlier artworks remain preserved.
- A regular screen-filling lattice of 90 permanent uncommon glyphs runs as an elastic X/Y/Z wave simulation. Pointer, touch and open-hand dwell build amplitude and propagation range.
- Held pointer, Space or tracked fist pulls a broad area into an amorphous vibrating knot, transmits tension across the surrounding fabric and inverts only while held.
- Four soft positional voices, stereo air and three feedback echoes form the calm sound. The knot adds three rapidly modulated voices, tremolo, moving filters and dynamic distortion.
- Six catalog and physics tests passed. The actual OfflineAudioContext graph verified positional pitch change, wave-density growth, stereo separation, echo tail and the stronger distorted knot. Synthetic hand states passed; desktop visuals were inspected.
- GitHub release commit: `755e8ce72fd1382d617562e0cd3cd10782903d44`. Vercel deployment `6iFgNjS8BB7ZJXUaHAHQTFpYpd8P` succeeded. The public player selected Weave I as item 006 / 006; sound, resonance, Index / Previous / Next and clean browser execution were verified.

## Silt — Granular Matter / 2026-09-13

- Silt II is live at `/experiments/silt/v2/`; the stable player remains `/play/?work=silt`. Silt I is preserved at `/experiments/silt/v1/`.
- Gravity now produces a visibly accelerating fall. The larger pulsing circular field combines radial throw, swirl, pointer velocity and lift to move a broad section of the pile.
- Sound now combines three continuous sand textures and three transient grain families. Collision layers accumulate with activity. In zero gravity the existing atmosphere remains, while field contact adds granular sound through three stereo echoes.
- Seven automated catalog and physics checks passed. The real OfflineAudioContext graph verified silence at rest, denser multi-layer output under heavy movement, stereo separation and a longer zero-gravity field tail. Synthetic open hand, held fist, tracking-loss and keyboard states passed; local browser showed clean console output.
- GitHub release commit: `2be6cf4761f720d06e71731e58a37149170f83f3`. Vercel deployment `CpdiREMuuQz3jQo4JhJsjyi771NA` succeeded. The stable public player loaded Silt II with all 2000 grains, sound enabled correctly, Previous / Next navigation remained intact, and the browser console stayed clean.

- New independent artwork: `/experiments/silt/v1/`; player `/play/?work=silt`. Fifth catalog entry; all earlier versions are preserved.
- 2000 permanent glyph grains from 90 uncommon geometric signs, fixed seeded sizes from 70% to 130%, smooth circular collision bodies, frame walls and 120 Hz granular dynamics.
- Circular pointer/touch/open-hand field stirs the settled pile. Contact and moving-grain density drive granular stereo sound. Held pointer/Space/fist disables gravity, inverts the chamber, keeps the field active and crossfades to a deep electronic stereo echo atmosphere; release restores gravity.
- Physics tests cover identity, size range, bounded contacts, negligible resting jitter, stirring, sound density, held zero gravity, release, resettling and mobile resize. Real OfflineAudioContext and synthetic hand-state browser tests passed. Desktop and mobile layouts visually checked.
- GitHub release commit: `ef27755737d8eefd806be6ff89d76bb96332ef2b`. Vercel production status succeeded. The public source files and catalog matched the tested local files byte-for-byte; the public player ran all 2000 grains without browser warnings or errors. Live URL: https://interactive-visual-lab.vercel.app/play/?work=silt

# Lab setup status

- GitHub connector account: emilgoodman-lab. Repository creation and GitHub browser sign-in remain pending. No GitHub remote push or Vercel deployment has occurred.
- Vercel: signed-in workspace Interactive Visual Lab, slug interactive-visual-lab, personal Hobby plan. Project import and automatic deployment remain pending GitHub setup.
- Latest creative version: Organism IV — Hand Control, `/experiments/organic/v4/`. Root opens v4. v1, v2 and v3 are preserved.
- Local preview: http://127.0.0.1:8765/experiments/organic/v4/
- Main server: Python static server serving public/ on port 8765, retained session 6404 (restart if unavailable).
- v3 finalized and committed as de30b85 before adding v4.
- v4: particle-size / motion-amplitude / spatial-size sliders; optional local webcam landmark tracking; stabilized fist expands layers; binary black/white dithered 2-bit camera preview; square tracking HUD; 4800 permanent particles and 82 glyphs; English retro UI.
- QA: syntax checks passed. Four geometry/latch/dithering tests passed. Actual browser worker initialized the real model and correctly returned no hand on a blank frame. Browser showed live HAND / OPEN tracking and real pointer coordinates with the user's enabled webcam; camera pixels/HUD visually inspected. Three slider values responded; no browser errors/warnings observed. Actual fist pose not independently observed; classifier checked with synthetic 3D landmarks.
- Live webcam was left as the user enabled it; do not reload or stop it casually during follow-up. Camera automatically stops when tab hides/navigates.
- Public URL: none. Do not describe localhost as a public deployment.

## Chain Choir — Sixteen / 2026-09-12
- New independent artwork: `/experiments/chimes/v1/`. Local preview: http://127.0.0.1:8765/experiments/chimes/v1/
- Branch: `codex/ascii-chain-chimes`. 16 chains, 488 fixed-identity glyph links, pinned anchors, 120 Hz gravity/constraint physics, pointer/touch sweep and grabbing.
- Optional local webcam hand input reuses v4 assets. Open hand sweeps, fist holds a link; binary pixel video and tracked square HUD. Live open-hand tracking observed in the browser.
- Optional Web Audio: 16 distinct D-major pentatonic pitches, soft sine partials, stereo placement, quiet envelopes, compressor, volume and mute; movement drives sound.
- QA: eight physics/hand tests passed; syntax passed; URL returned HTTP 200; desktop and 390×844 layout inspected; pause froze time and resume advanced it; audio enable/mute states verified; no browser warnings/errors. Direct touch-device and live fist-grab tests remain hardware checks.
- Organic v1–v4 and the root redirect are unchanged. GitHub/Vercel publication is still pending account setup above; this URL is local, not public.

## Chain Choir II — Extended / 2026-09-12
- Latest chain version: http://127.0.0.1:8765/experiments/chimes/v2/ (local only). Branch `codex/chain-choir-extended`. Earlier paths and root preserved.
- 16 equal-length chains reach the artwork bottom, 1000 permanent glyphs total, fixed ±25% size variation, size-aware link distances, no wires and no collisions.
- Fist switches from chimes to procedural distorted electronic tones; both modes have filtered stereo echo. Webcam and audio were enabled by the user during preview and left enabled.
- Five physics tests passed. Actual offline audio rendering: chimes peak 0.0121, distorted peak 0.0101; both had measurable stereo separation and echo after 2.2 seconds. Syntax passed; desktop/mobile visuals and pause/resume verified; no browser warnings/errors. Open-hand live tracking observed. Physical fist pose and physical touch device were not independently tested.
- GitHub remote and Vercel deployment remain pending as above.

## Chain Choir III — Touch Voices / 2026-09-12
- Latest: http://127.0.0.1:8765/experiments/chimes/v3/ (local only); branch `codex/chain-choir-touch-voices`.
- Fist no longer grabs; full inversion and local per-glyph tremor. Actual per-chain contact height drives both pleasant and distorted timbres. Sixteen independent delay/timbre profiles, ethereal modulation and stereo drift. Earlier versions preserved.
- Eight node tests passed. Four actual offline audio graphs (upper/lower × clean/distorted) rendered successfully with stereo separation and echo tails. Synthetic hand integration test verified inversion, local tremor, upper/lower voicing and hand-loss recovery. Main browser error log was empty. Live physical fist pose not independently verified.
- User enabled webcam and sound during preview, and raised volume to 0.95. Preserve their settings when practical. GitHub/Vercel publication is still pending.

## Abyssal — Specimen 06 / 2026-09-12
- New independent artwork: http://127.0.0.1:8765/experiments/abyssal/v1/ (local only). Branch `codex/abyssal-ascii-creature`. Root and all earlier artworks preserved.
- Six tapered physical glyph tentacles, articulated mechanical glyph head, drag/inertia, stalking/striking/feeding, cursor/open-hand fleeing, held click/fist capture with thrashing and optional irregular inversion. No inter-tentacle collisions.
- Three procedural sound states: underwater purr, digital attack, distorted capture distress; stereo echo.
- Four physics tests passed; all three actual offline audio graphs rendered (peaks 0.0384 / 0.0249 / 0.0657). Synthetic hand UI test observed capture/inversion, escape and release. Main browser errors empty; desktop/mobile layout inspected. Real physical fist and touch-device tests remain unobserved.
- User enabled audio and webcam, volume 0.75, flashes on; these were restored after the final reload. Static preview still runs on port 8765. Public GitHub/Vercel deployment remains pending.

## Rotor — Glyph Resonator / 2026-09-12
- New independent artwork: `/experiments/rotor/v1/`; player `/play/?work=rotor`. Fourth catalog entry; all earlier paths preserved.
- 28 single-glyph rings, ~3,000–4,300 characters depending on viewport. Permanent ring identity, slow alternating rotations, continuous four-zone field mixing, depth shading, spring-delayed drift, sequential glyph turns, proportional 3D tilt. Center mixes all effects.
- Kaleidoscope slider: 0 original, 1 simple mirror, 2–8 progressively 4–16 alternating reflected sectors. Source covers viewport diagonal to avoid missing wedges.
- Click/tap or fist rising edge toggles inversion and oscillatory distress. A held fist does not toggle repeatedly. Optional continuous electronic resonator with metallic FM, breathing partials and filtered stereo feedback delays; distorted mode crossfades.
- Five geometry/catalog tests passed; actual calm/distorted OfflineAudioContext graphs passed (peaks 0.0379 / 0.1964, finite stereo output). Direct artwork browser console empty. Wrapper occasionally produces a browser-tool MutationObserver error also seen with earlier unchanged artworks; no source uses MutationObserver.
- Desktop and 390×844 visuals inspected; mirror levels 1/8, pointer center mixing, inversion, pause/resume and mobile index verified. Live webcam tracked the user and showed FIST / AGITATED. Physical touch-device test not observed. User enabled sound/camera in local player tab 20; preserve it if still open.
- GitHub release commit: fed42abaae7e04b7739a4007d551a4f956de9a7e. Vercel production status SUCCESS, deployment ERjRnugH3tp3ED5xhaVkH7Hm2kBN. Public player loaded and advanced simulation time. Anonymous HTTP 200 and byte-for-byte comparison passed for every Rotor source file and the catalog. Public URL: https://interactive-visual-lab.vercel.app/play/?work=rotor
