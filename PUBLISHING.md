# Publishing this lab

- Public site: https://interactive-visual-lab.vercel.app/
- GitHub repository: emilgoodman-lab/emilgoodman, production branch main.
- Vercel team/project: interactive-visual-lab / interactive-visual-lab (Hobby).
- Initial production commit: 05d8aff60fd95e15c0064b630d0d70e38043274a.
- Automatic deployment verified by README update 6cd4de6d0fdc5914c580225e5209b5d4a3d20df3; Vercel status success.

The local repository preserves the original creative history. GitHub was initialized through the GitHub connector and has a separate history. Never force-push the local branch over main. Use connector fetch_file/update_file for small edits or an atomic create_tree/create_commit/update_ref release based on the current remote main commit and tree. Update the ref without force. Read remote state first to avoid overwriting concurrent changes.

Publish public/ text files, the existing font blobs, scripts/assets.json, scripts/prepare-assets.mjs and vercel.json. The four large wasm/model binaries are regenerated and SHA-256 verified at build time; do not upload those binaries through text APIs. No secret is required in source. Existing font blob: d786ee8fd3e7d6b0c431ab10fdcab0003fd27897.

Append works to public/lab/catalog.mjs. Keep IDs and numbered artwork paths stable. Player URLs /play/?work=<id> provide Index/Previous/Next automatically. The direct version paths remain available. Serve public/ locally for QA; run node --test tests/catalog.test.mjs. Verify production status for the new commit and the anonymous public URL after each release.

Latest artwork release: Rotor I, fed42abaae7e04b7739a4007d551a4f956de9a7e. Production deployment ERjRnugH3tp3ED5xhaVkH7Hm2kBN. Four works in catalog; checked anonymous public assets against local source bytes.

Latest artwork release: Silt I, ef27755737d8eefd806be6ff89d76bb96332ef2b. Vercel production status succeeded at deployment GGR2LvvavWKjWB4J4ppn61bFuqR1. Five works are now in the catalog. Public Silt sources were checked byte-for-byte against the tested local release.

Latest artwork release: Silt II, 2be6cf4761f720d06e71731e58a37149170f83f3. Vercel production status succeeded at deployment CpdiREMuuQz3jQo4JhJsjyi771NA. The stable `silt` player now selects `/experiments/silt/v2/`; Silt I remains preserved.

Latest artwork release: Weave I, 755e8ce72fd1382d617562e0cd3cd10782903d44. Vercel production status succeeded at deployment 6iFgNjS8BB7ZJXUaHAHQTFpYpd8P. Six works are in the catalog; the stable `weave` player selects `/experiments/weave/v1/`.

Latest artwork release: Weave II, 444371712e4ed85ce9b36e7fad1bafbf98497f07. Vercel production status succeeded at deployment HkL3yg9pKkfEno73UqZCcuowRjFf. The stable `weave` player now selects `/experiments/weave/v2/`; Weave I remains preserved.

Latest artwork release: Strata I, c11ee6192f84e71d230764143083eecc149a8ee1. Vercel production status succeeded at deployment 52smBoTGNtLsbrn3rgNBBA33o7DG. Seven works are in the catalog; the stable `strata` player selects `/experiments/strata/v1/`.

Latest artwork release: Strata II, 10eecd7cfed03f4e5ff03ebdd49fff84f24315ca. Vercel production status succeeded at deployment 9csjchFW5JKy9fYAqTF1Y8ZYKnCj. The stable `strata` player now selects `/experiments/strata/v2/`; Strata I remains preserved.

Latest artwork release: Strata III, 2a92a768cc1e80f729515666ab2fc3b02467fc61. Vercel production status succeeded at deployment FyrYMY4wJgiz4vvEtoLkK22TUxba. The stable `strata` player now selects `/experiments/strata/v3/`; Strata I and II remain preserved.

Latest artwork release: Strata IV, b6501ef1d414e95092bf67803baac161b2170f03. Vercel production status succeeded at deployment D9BH19se4fMddnQrCjuiV4RJmBnU. The stable `strata` player now selects `/experiments/strata/v4/`; Strata I, II and III remain preserved.
