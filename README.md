# Interactive Visual Lab

Interactive visual artworks by Emil Goodman.

**Live collection: https://interactive-visual-lab.vercel.app/**

- Organism — Character Field
- Chain Choir — Touch Voices
- Abyssal — Specimen 06
- Rotor — Glyph Resonator
- Silt — Granular Matter

## Open and explore
The root index lists every curated work. `/play/?work=organism`, `/play/?work=chain-choir`, `/play/?work=abyssal`, `/play/?work=rotor` and `/play/?work=silt` are permanent launch links with Index, Previous and Next navigation. Older experiment paths remain available.

## Extend the lab
Add the new artwork under `public/experiments/<name>/v<number>/`, then append its title, description, stable ID and path to `public/lab/catalog.mjs`. The list and neighboring links update automatically. Preserve published IDs and numbered folders.

## Development and publishing
Plain browser Canvas, JavaScript and CSS; no framework or package install. Run `node scripts/prepare-assets.mjs`, then serve `public/` using a static HTTP server. Vercel uses the same preparation step and serves `public/`. The four large hand-tracking binaries are downloaded from pinned URLs and verified against SHA-256 hashes. All runtime resources are served from this site. Camera frames stay in the browser.

This repository is connected to the Interactive Visual Lab Vercel project. Every commit to `main` automatically creates a production deployment at the stable collection URL.

## Licenses
The bundled Noto Sans Symbols 2 font uses the SIL Open Font License; license files are included beside each copy. The MediaPipe runtime/model license and source records are under `public/experiments/organic/v4/vendor/`.

## Rotor — Glyph Resonator
28 concentric rings, each built from one permanent geometric glyph. Independent slow rotations; four overlapping pointer/hand fields: top depth tunnel with distance shading, right spring-delayed XY drift, bottom sequential glyph turns, left proportional spatial tilt. Center combines all four. Kaleidoscope steps run from original through a single mirror to 16 reflected sectors. Click/tap or a new fist closure toggles inversion, oscillation and distorted electronic resonances; reopening the hand rearms the toggle. Sound requires Enable Sound. Stereo echoes and slow pitch/amplitude motion accompany a continuous electronic prayer-wheel timbre. Reduced motion starts paused; no automatic strobe. All earlier versions remain available.

Verification: `node --test tests/rotor.test.mjs tests/catalog.test.mjs`. The audio harness in `tests/rotor-audio.html` renders the actual calm and distorted graphs with OfflineAudioContext; temporarily serve it from the public root to run it.

## Silt — Granular Matter

2000 permanent geometric glyph grains with seeded sizes from 70% to 130%. Every grain collides as a smooth circular body inside the canvas walls. A fixed 120 Hz solver, soft positional contacts, inelastic friction and stable resting bodies minimize pile jitter. The circular pointer, touch or open-hand field stirs the settled material; movement and contact density drive granular stereo sound.

Holding the pointer, Space, or a tracked fist disables gravity and inverts the chamber only for the duration of the hold. The stirring field remains active while particles float. Zero gravity crossfades to low electronic partials and long filtered stereo echoes; release restores gravity and the dry granular sound. Camera processing remains local.

Verification: `node --test tests/silt.test.mjs tests/catalog.test.mjs`. The actual audio graph is tested in `tests/silt-audio.html`; sustained and released hand states are tested in `tests/silt-ui.html`.
