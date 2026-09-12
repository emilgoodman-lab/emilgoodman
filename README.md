# Interactive Visual Lab

Interactive visual artworks by Emil Goodman.

**Live collection: https://interactive-visual-lab.vercel.app/**

- Organism — Character Field
- Chain Choir — Touch Voices
- Abyssal — Specimen 06

## Open and explore
The root index lists every curated work. `/play/?work=organism`, `/play/?work=chain-choir` and `/play/?work=abyssal` are permanent launch links with Index, Previous and Next navigation. Older experiment paths remain available.

## Extend the lab
Add the new artwork under `public/experiments/<name>/v<number>/`, then append its title, description, stable ID and path to `public/lab/catalog.mjs`. The list and neighboring links update automatically. Preserve published IDs and numbered folders.

## Development and publishing
Plain browser Canvas, JavaScript and CSS; no framework or package install. Run `node scripts/prepare-assets.mjs`, then serve `public/` using a static HTTP server. Vercel uses the same preparation step and serves `public/`. The four large hand-tracking binaries are downloaded from pinned URLs and verified against SHA-256 hashes. All runtime resources are served from this site. Camera frames stay in the browser.

This repository is connected to the Interactive Visual Lab Vercel project. Every commit to `main` automatically creates a production deployment at the stable collection URL.

## Licenses
The bundled Noto Sans Symbols 2 font uses the SIL Open Font License; license files are included beside each copy. The MediaPipe runtime/model license and source records are under `public/experiments/organic/v4/vendor/`.
