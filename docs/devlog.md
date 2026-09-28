# Development journal

## Milestone 0: Repository and planning draft

The initial concept is a personal archive portfolio: open a cabinet, select a folder, and browse pages containing projects, photographs, and background information.

The public repository was initialized with a README and ignore rules. The first planning documents now describe the concept, proposed experience, phases, and decision status. No application code, 3D assets, or automated checks have been created yet.

Research established that the reference portfolio separates its 3D scene and its OS-style interface into two repositories. Its camera transitions and embedded webpage approach are useful implementation references. This project's architecture has not been selected.

During planning, the owner identified software engineering recruiters, fellow developers, and people interested in design and UI/UX as audiences, while emphasizing that the portfolio should welcome everyone. The chosen physical feeling is precise and curated, like a case file.

Open work: select content and compare rough scene compositions that express this direction. The most important early technical experiment will be the transition from a moving 3D folder to readable portfolio pages.

## First Blender motion draft — 2026-09-26

The owner authorized a 3D design prototype to test the complete entrance. Blender MCP inspection established a default three-object scene in Blender 5.1.2. A separate `Archive_Motion_Draft` scene preserves those objects and adds an editable cabinet, telescoping upper drawer, continuous folder, opening cover, three paper layers, two synthetic image previews and a following camera.

The draft is ten seconds at 24 fps. A one-second hold simulates waiting for activation. Drawer movement, folder lift, outward travel and cover opening lead to an isolated pale reading view. A raised waypoint keeps the folder above the drawer front until its back edge has cleared. Arrival framing and simplified rail geometry were corrected during rendered review. All 240 frames pass the recorded clearance and framing checks.

Artifacts are local and ignored; scripts and [review notes](../design/blender/README.md) are committed on the dedicated branch. The supplied screenshot informed the miniature composition and lighting. No private directory or resume was accessed, and all text and image placeholders are fictional. Remaining choices include pacing, folder orientation, the implied supporting surface and final visual language. The next step is owner review of this first motion draft.

## Blender motion draft version 2 — 2026-09-27

Preserved V1 source, video, stills and script snapshots, then cloned its scene for a new reference-directed iteration. Revised the cabinet to tall neutral metal, reduced its arrival framing to 50.6% of image height, introduced five neighboring upright files, and animated vertical extraction of the selected file followed by outward travel and rotation.

The 960 × 600 preview lasts 7.5 seconds, including 4.75 seconds from activation to settled reading. Oriented-bounds checks cover all 180 frames, including neighbors, cover sweep and final cabinet/shadow exclusion. Inspected the encoded sequence through 90 decoded samples and representative stills. Corrected file-edge clearance, cover framing and the distant floor tone before delivery. An arrival comparison records the change from V1. See [review notes](../design/blender/README-v2.md); next step is owner review.

## Blender motion draft version 3 — 2026-09-27

Retained V2's cabinet, file row and extraction, then rebuilt the hero folder with portrait proportions stored on the long edge. The outer cover opens left; a separate top attachment turns one thin document upward. A keyed lattice bends the paper and its editable content together. The final camera approaches the document stack, deliberately crops the empty cover and locks for two reading holds and the page turn.

The 12.25-second draft includes the entrance, a closer reading approach, a two-second first-page hold, a 1.75-second turn and a two-second second-page hold. The document occupies about 78% of frame height. Evaluated geometry checks cover all 294 frames; a small spine/tray intersection was corrected. Inspected 147 samples decoded from the final MP4 and full-resolution stills, with no obvious clipping or final-page obstruction. A fresh-session rebuild succeeded, and V2's 13 recorded artifact hashes remain unchanged. Binary outputs stay local and ignored; V3 scripts, manifest and [review notes](../design/blender/README-v3.md) are versioned separately. The next step is owner review; browser interaction and readability remain untested.

## Storyboard integration and implementation preparation — 2026-09-27

The owner accepted V3 as the storyboard baseline and requested integration into main before implementation planning. Preserved the distinction between the accepted motion structure and open visual polish/reading-distance choices. Updated agent reading guidance and defined three initial browser waves: foundation and readable content, entrance handoff, and reversible page interaction.

Added dependency-free repository checks for tracked-file boundaries, documentation links, Python syntax, and JSON. Application checks will be added alongside the application. Added a fresh-checkout rebuild entry point that supplies the V1 source path required by later builders. Source scenes and videos remain local; no private references are published.

## Implementation contracts prepared - 2026-09-27

The owner requested detailed documents and contracts before beginning implementation. Added a shared responsibility and interaction agreement, plus scoped contracts for the browser foundation, cabinet-to-content handoff, and reversible document turn. Each contract records dependencies, sequential work, acceptance evidence, and deferred work. Wave 1A includes a plain-paragraph prompt for a separate implementation session.

The contracts keep the accepted V3 motion distinct from unapproved final styling and browser techniques. They make loading/skip behavior, repeated input, transition ownership, semantic content, and failure access explicit. Updated agent reading guidance and planning links. No application stack, dependencies, production assets, or private content were introduced. The next step is assigning Wave 1A; later contracts will be refined from its results.

## Wave 1A foundation verified - 2026-09-27

Created `implement/wave-1a` in an isolated worktree from documentation baseline `27d7379`. Selected Astro with strict TypeScript and plain CSS, wrote one independently invented document and its semantic reading surface, and added application CI plus setup/state-ownership documentation. No private files or local Blender sources were copied or accessed.

After the owner resolved a disk-space blocker, installed the selected local Node 24 runtime and completed type, lint, repository, and production-build checks. Corrected explicit Astro directory paths during startup validation. A tracked-files-only isolated copy with a fresh dependency cache passed the same checks and dev/preview startup, producing byte-identical HTML.

Inspected Chromium screenshots at desktop, 390px phone width, actual 200% browser zoom, and enlarged text. Verified keyboard skip/link navigation, visible focus, text copy, and JavaScript-disabled reading. The output is one HTML file with inline CSS and no client JavaScript. See the [Wave 1A record](reviews/wave-1a.md) for exact evidence and limitations. Remote CI, other browser engines, physical devices, and screen readers remain untested. The next step is audit before integration; Wave 1B is unassigned.

## Wave 1B entrance implemented - 2026-09-28

Created `implement/wave-1b` in an isolated worktree from merged main (`0f2095c`, containing Wave 1A and correction `3655a6a`). Added a Blender export script for the V3 entrance objects and animation. Implemented a three.js scene adapter, one experience controller, and a reading view that maps the existing semantic document onto the paper during the cover opening and settles it untransformed. No private files were accessed; content remains the Wave 1A fiction.

Browser review found and fixed a phone layout where the status line intercepted taps on Open, and a skip link hidden beneath the canvas. It also corrected tone mapping and lighting to approach V3's muted materials and soft shadows. Nine Playwright behaviour tests pass with a GPU and with software WebGL. On an integrated GPU the entrance runs at 60 fps. The framing study, deviations, and open phone composition question are recorded in the [Wave 1B record](reviews/wave-1b.md). The next step is audit; Wave 1C is not started.

## Format for future milestones

- Objective: what we wanted to learn or deliver.
- Work and evidence: changes, screenshots, clips, measurements, or commits.
- Findings: what worked, what failed, and why the approach changed.
- Verification: checks performed and their limits.
- Next step: the remaining question or dependent milestone.

Keep entries specific to real work. Link detailed decisions and asset instructions rather than duplicating them.
