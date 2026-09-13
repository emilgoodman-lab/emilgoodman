# Interactive Visual Lab

Interactive visual artworks by Emil Goodman.

**Live collection: https://interactive-visual-lab.vercel.app/**

- Organism — Character Field
- Chain Choir — Touch Voices
- Abyssal — Specimen 06
- Rotor — Glyph Resonator
- Silt II — Dynamic Granular Matter
- Weave II — Elastic Resonance
- Strata III — Ring Broom

## Open and explore
The root index lists every curated work. Every catalog ID has a permanent `/play/?work=<id>` launch link with Index, Previous and Next navigation. Older experiment paths remain available.

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

## Silt II — Dynamic Granular Matter

2000 permanent geometric glyph grains with seeded sizes from 70% to 130%. Every grain collides as a smooth circular body inside the canvas walls. A fixed 120 Hz solver, strong accelerating gravity, grounded contact correction and stable resting bodies keep the fall physical and the pile still. A larger pulsing pointer, touch or open-hand field throws and swirls a broad section of the material.

Collision and field energy drive three continuous granular textures plus three families of individual stereo grains, so dense movement builds into a layered sand-pouring sound. Holding the pointer, Space, or a tracked fist disables gravity and inverts the chamber only for the duration of the hold. Zero gravity keeps the deep electronic atmosphere; the active field adds separate granular impacts through three spatial echoes. Release restores gravity and the dry granular layers. Camera processing remains local. Silt I remains preserved at `/experiments/silt/v1/`.

Verification: `node --test tests/silt-v2.test.mjs tests/catalog.test.mjs`. The actual audio graph is tested in `tests/silt-v2-audio.html`; sustained and released hand states are tested in `tests/silt-v2-ui.html`.

## Weave I — Elastic Field

A screen-filling regular fabric of permanent uncommon geometric glyphs. Pointer, touch or an open tracked hand excites a damped elastic lattice along X, Y and Z. Remaining in one place gradually increases both wave amplitude and propagation range; horizontal and vertical position continuously retune a soft pulsing four-voice resonance.

Holding the pointer or closing a tracked fist pulls a broad region into an amorphous vibrating knot, transmits tension into the surrounding fabric and keeps the chamber inverted for the duration of the hold. The knot adds three rapidly modulated voices, dynamic distortion, tremolo and spatial feedback echoes. Release returns the image immediately and lets the physical fabric unfold back to its exact regular grid.

Verification: `node --test tests/weave.test.mjs tests/catalog.test.mjs`. `tests/weave-audio.html` renders and measures the real calm, positional and distorted Web Audio graphs. `tests/weave-ui.html` verifies open-hand, sustained-fist and tracking-loss states.

## Weave II — Elastic Resonance

The wave now starts as a slow, local two-pixel motion and grows through a smooth cubic envelope to the full spatial deformation over roughly 3.2 seconds. Its radius expands from about 50 pixels to more than 340 pixels without changing phase abruptly. Glyph rotation follows the smooth depth displacement, removing the initial velocity jitter.

The calm audio reads the same live sine value as the visual simulation. Every trough-to-crest cycle drives both amplitude and pitch while screen position retains its tonal mapping. The held knot uses a wider elastic field: roughly 60% more glyphs gather into its core than in Weave I, while tension and high-frequency motion reach most of the remaining fabric. Weave I remains preserved at `/experiments/weave/v1/`.

Verification: `node --test tests/weave-v2.test.mjs tests/catalog.test.mjs`. The actual synchronized trough/crest, positional voices, distortion and echo are rendered in `tests/weave-v2-audio.html`; hand-state behavior is covered by `tests/weave-v2-ui.html`.

## Strata I — Sand Table

Three superimposed layers each contain exactly 1000 permanent, uncommon geometric glyph grains. Contacts are solved only within the grain's own layer, creating three independent materials across one monochrome table. Seeded grain sizes vary from 75% to 125%.

Pointer, touch or an open tracked hand acts as a circular broom that pushes, rolls and scatters nearby grains. Holding the pointer, Space, or a tracked fist inverts the chamber and starts a continuously changing multidirectional wind field that moves nearly the whole table. Three continuous sand bands and additive individual impacts become denser with contacts; held wind adds three stereo white-noise bands panned toward its strongest direction and spatial feedback echoes.

Verification: `node --test tests/strata.test.mjs tests/catalog.test.mjs`. `tests/strata-audio.html` renders and measures the real rest, light/dense sweep and left/right turbine graphs; `tests/strata-ui.html` verifies sustained fist, tracking loss and keyboard states.

## Strata II — Solid Broom

The stable Strata player now uses four-times-larger visible and physical grains. A seeded near-regular scatter gives each 1000-grain layer enough room to settle without losing its granular irregularity. The circular sweep is solid across 92% of its radius, with a smooth transition confined to the outermost 8%, so the field behaves like a physical broom instead of a broad gradient. The established multidirectional held wind and sound system remain intact. Strata I stays preserved at `/experiments/strata/v1/`.

Verification: `node --test tests/strata-v2.test.mjs tests/catalog.test.mjs`; `tests/strata-v2-audio.html` and `tests/strata-v2-ui.html` run the sound and synthetic input checks against the revised stable version.

## Strata III — Ring Broom

The table now carries exactly 5000 grains divided across three independent collision layers: 1667, 1667 and 1666. Each grain is half the Strata II scale, while retaining its permanent glyph and ±25% seeded size variation.

The dashed circle itself is the broom. Its narrow circumference collides with grains from either side and transfers the ring's movement; the entire interior has zero sweep influence. Held pointer, Space and fist retain the established full-table multidirectional wind, inversion and directional stereo sound. Strata I and II remain preserved at their versioned paths.

Verification: `node --test tests/strata-v3.test.mjs tests/catalog.test.mjs`; `tests/strata-v3-audio.html` and `tests/strata-v3-ui.html` cover the unchanged sound and held-input behavior in the new build.
