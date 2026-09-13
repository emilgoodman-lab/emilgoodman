# Talisman — Paper Creature

A collage edition of Abyssal. `physics.mjs` and `audio.mjs` re-export the preserved original implementations; all six arms, 150 inertial links, fluid drag, hunting, capture and escape use exactly the original engine. Only the renderer, cursor, camera presentation and sound activation differ.

The user-supplied painted reference is reduced to a 228 KB JPEG. Geometry clips selected ornamental patches into cached sprites with slightly irregular edges and a tiny baked shadow. The pink paper tile comes from an unprinted patch. No full-frame filters or per-frame texture generation are used. Food is small eight-point stars. The habitat stays pink during capture while the original physical distress motion and sound continue.

Move near the creature to scare it; hold the pointer or close a tracked fist near its body or arms to capture it. Release to let go. Sound starts on the first press or webcam-button gesture. P pauses/resumes; M mutes/unmutes. Reduced-motion preference starts paused. Camera tracking is local, requests no microphone and stops when the page is hidden.

The stable catalog entry is `talisman`. Its player deliberately hides navigation chrome, as requested for this edition. Other works retain Previous/Next. The original Abyssal path and catalog entry are preserved.

Validation: original deterministic physics tests, engine identity test, catalog and hand-math tests; browser capture/release, tracking loss, touch cancellation, pause/resume, mobile sizing, reduced motion; original audio graph rendered in all three states. Live webcam hardware requires user permission and a visible hand and was not physically exercised during automated QA.
