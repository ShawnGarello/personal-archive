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

## Format for future milestones

- Objective: what we wanted to learn or deliver.
- Work and evidence: changes, screenshots, clips, measurements, or commits.
- Findings: what worked, what failed, and why the approach changed.
- Verification: checks performed and their limits.
- Next step: the remaining question or dependent milestone.

Keep entries specific to real work. Link detailed decisions and asset instructions rather than duplicating them.
