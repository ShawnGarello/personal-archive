# Wave 1B implementation record

2026-09-28. Status: **implemented and locally verified; awaiting audit**. Wave 1C is not started.

Branch: `implement/wave-1b`, created from `origin/main` at `0f2095c` (merge of Wave 1A, including correction `3655a6a`). Worktree: `C:/Users/teche/personal-archive-wave-1b`. The implementation commit is the commit containing this report; resolve it with `git log -1 --format=%H -- docs/reviews/wave-1b.md`. No push, merge, deployment, or private-file access occurred. Existing Blender scenes and renders in `C:/Users/teche/personal-archive-blender-draft` were read, not modified.

## What was built

- **Scene transfer.** `design/blender/export_web_v3.py` exports the saved V3 scene to `app/src/assets/scene/archive-entrance-v3.glb` plus a provenance manifest. The export includes 97 nodes with V3 names, parents, the 0.65 folder scale, and hinge pivots. The cabinet, drawer, slides, five neighbour files, folder, portrait orientation, cover hinge, both sheet hinges and papers, fasteners, and camera are included. Page text and images, the lattice, lights, and the ground are excluded. The export carries one sampled 24 fps clip for V3 frames 18–156 (5.75 s) on 8 channels. See [D016](../decisions.md) and the [asset workflow](../application.md#scene-asset-workflow).
- **Animation ownership.** The scene adapter (`app/src/scripts/experience/scene.ts`) drives the three.js `AnimationMixer` from one clamped timeline and computes the reading camera. `controller.ts` is the only authority over phase, surface, and transition ID. `main.ts` renders state to the DOM, owns focus, and places the paper.
- **Reading surface.** The Wave 1A semantic document is the only readable copy. During the cover opening it is mapped onto the paper with a CSS homography; when settled it sits untransformed over the rendered sheet, scrolls inside it, and is keyboard-focusable. The fictional content is unchanged.
- **Access paths.** The entrance can be started with the Open button (pointer, Enter, or Space) or by clicking the top drawer. "Go straight to the document" and the skip link work while loading or during the entrance. Reduced motion, missing WebGL 2, a failed asset load, context loss, and a module that never runs all reach the plain document.
- **Tests and CI.** Nine Playwright tests (`tests/browser/entrance.spec.ts`) and a CI browser job were added.

## Commands and results

Runtime: Node 24.21.0, npm 11.19.0 (the Wave 1A local runtime at `C:/Users/teche/personal-archive-wave-1a/artifacts/tooling/`), Python 3.13.7, Blender 5.1.2, Windows 11 x64. New dependencies (exact): `three` 0.186.1; dev `@types/three` 0.186.0 and `@playwright/test` 1.63.0 (Chromium 153.0.8010.12). `npm ci` reported zero known vulnerabilities.

```powershell
git fetch origin
git worktree add -b implement/wave-1b ../personal-archive-wave-1b origin/main
# From the worktree, with Node 24 first on PATH:
npm ci
npx playwright install chromium          # already present locally
python scripts/check_repository.py
npm run typecheck
npm run lint
npm run build
npm run test:browser
# Asset export (local V3 scene, read-only):
blender -b C:/Users/teche/personal-archive-blender-draft/artifacts/archive-motion-draft/v3/archive-motion-v3.blend --python-exit-code 1 --python design/blender/export_web_v3.py
```

| Check | Result |
| --- | --- |
| Repository check | Pass (includes staged new files) |
| Type check | 0 errors, 0 warnings, 0 hints |
| Lint | Pass, zero warnings |
| Build | Pass; one existing Vite warning that the lazy three.js chunk exceeds 500 kB |
| Browser tests, hardware GPU (ANGLE/D3D11, Intel Iris Xe) | 9 passed in 33 s |
| Browser tests, software WebGL (SwiftShader; the CI approximation) | 9 passed in 4.3 min |
| Remote GitHub CI | **Not run**: no push was authorized |

Isolated copy: `git checkout-index --all --prefix=C:/Users/teche/personal-archive-wave-1b-clean/` of the staged index (61 files; no dependencies, build output, artifacts, or private files), then `git init` and `git add -A` there. With a fresh npm cache, `npm ci`, the repository check, type check, lint, and `npm run test:browser` (9 passed, 36 s) all succeeded. The build emitted the same fingerprinted file names as the worktree, and the GLB hash was identical. Blender was not used.

Asset reproducibility: `design/blender/*.py` was copied to an empty scratch directory. There, `rebuild_all.py` rebuilt V1→V3 in a fresh `--factory-startup` session, and the exporter ran against that result. Compared with the committed export (from the owner's accepted local V3 file), hierarchy, parents, node transforms, mesh bounds, triangle counts, materials, camera, and all animation samples are identical (maximum difference 0). The files are not byte-identical: 21 bevelled meshes differ by 1–10 vertices from split-normal deduplication. The comparison script is `artifacts/wave-1b/compare-glb.mjs`.

## Build inventory and sizes

| Output | Raw | gzip -9 | Loaded |
| --- | --- | --- | --- |
| `index.html` (inline CSS and fallback script) | 7.9 kB | 3.1 kB | Always |
| Experience module | 6.3 kB | 2.8 kB | Always (module) |
| `scene.*.js` (three.js, GLTFLoader, RoomEnvironment) | 633 kB | 157 kB | On demand, not with reduced motion or without WebGL 2 |
| `archive-entrance-v3.*.glb` | 669 kB | 125 kB | On demand, as above |

`app/public/` is still absent. The GLB contains no images or textures (checked by the exporter). The build contains only the four files above. Loading on this machine: ready (`idle`) 0.5–2.1 s after navigation from local preview. Network conditions were not throttled; these are observations, not budgets.

## Browser evidence

Unless noted, the browser was Playwright Chromium 153 on Windows using the hardware GPU (ANGLE D3D11). This is tool-driven viewport emulation, not physical devices. **Playback** means real-time recordings at normal speed, decoded and inspected at 4 frames per second. **Deterministic frames** use Playwright's paused clock. **Automated** means test assertions.

| Evidence | Type | Location (local, ignored) |
| --- | --- | --- |
| Desktop 1440×900 and phone 390×844 (DPR 2) recordings | Playback | `artifacts/wave-1b/motion/desktop.webm`, `phone.webm`; sheets `_desktop-sheet.png`, `_phone-sheet.png` |
| Frame timing during playback | Measured | `artifacts/wave-1b/motion/results.json` |
| Timeline frames at 0–5.75 s | Deterministic frames | `artifacts/wave-1b/run2/` |
| Last moving frame vs settled page | Screenshots and pixel diff | `artifacts/wave-1b/handoff/` |
| Framing study (4 viewports × 0.78/0.86) | Screenshots and DOM metrics | `artifacts/wave-1b/framing/` (`results.json`) |
| Keyboard focus, reduced motion, load failure, no JavaScript | Screenshots | `artifacts/wave-1b/states/` |
| Resize while reading | Screenshot and metrics | `artifacts/wave-1b/motion/resize-reading-900x700.png` |
| Scripts | — | `artifacts/wave-1b/*.mjs`, `sheet.py` |

Frame timing (real time, GPU): desktop 351 frames, median 16.7 ms, p95 16.8 ms, maximum 66.7 ms, 2 frames over 33 ms; phone 350 frames, median 16.7 ms, maximum 33.3 ms. The entrance took 5.9 s wall time against the 5.75 s clip. Under SwiftShader (1280×800), frames took about 1.3 s; the clamped timeline completed in 84 s rather than skipping.

## Acceptance

| ID | Result |
| --- | --- |
| B1 | **Pass, with deviations below.** In desktop and phone playback, one activation runs: drawer opening while the camera approaches, upright lift, outward follow with rotation to portrait, cover opening left, and approach to the first page. The same folder nodes animate throughout; there are no swaps. The settled views at every size studied show only the folder on the off-white background. The cabinet sits about 6 scene units behind the reading page, beyond the ~0.9-unit half-height of the reading frustum, and its shadow falls away from the reading area. |
| B2 | **Pass on inspection.** No intersection, teleport, or jump was visible in playback or deterministic frames. The export matches V3 transforms exactly, and V3's own collision checks applied to those transforms. This was sampled visual review, not a new collision test. |
| B3 | **Pass.** Handoff: the heading moved 0.30 px horizontally and 0.02 px vertically between the last transformed frame and the settled page; 0.45% of paper pixels changed, all within text anti-aliasing. Settled text is untransformed, selectable (double-click selection asserted), and scrollable by Page Down, arrows, Space, and wheel. Focus lands on `main#reading` after entrance, skip, or direct access. Tab then reaches the only link and Shift+Tab leaves the page. Focus outlines are visible, and the skip link is visible over the scene. Body text contrast on the rendered paper (#dedddc) is about 11:1. |
| B4 | **Pass (automated).** Pointer, keyboard, dispatched click, and drawer input during the entrance keep one transition ID and one `entering` phase. Skipping settles reading immediately; advancing the clock 10 s afterwards changes neither phase nor page placement. |
| B5 | **Pass.** Automated coverage: aborted GLB, missing WebGL 2, late load after direct access, reduced motion initially and mid-entrance, and resize mid-entrance. Manual: resize while reading realigned the page at 78%; the tab-switch check is described under limits. |
| B6 | **Recommendation below; not an approval.** |
| B7 | **Pass locally.** A fresh checkout needs no Blender to run, build, or test; the export is reproducible with Blender as described. Remote CI is unverified. |

## Framing study (B6)

Same document at both ratios; the settled page is measured from the DOM.

| Viewport | 78%: page px, text visible at once, chars/line | 86% |
| --- | --- | --- |
| 1440×900 | 494×702, 55%, 46 | 546×774, 61%, 46 |
| 1920×1080 | 594×842, 67%, 61 | 654×928, 84%, 61 |
| 1280×720 | 396×562, 38%, 37 | 436×620, 45%, 46 |
| 390×844 phone | 366×519 (width-limited, 61% of height), 34%, 37 | Identical |

Recommendation for review: **use about 86% on desktop and laptop screens.** It shows 6–17 percentage points more text per view and fixes the short 37-character lines at 1280×720, while the page, tab, and folder border stay visible. Its costs are real. At 86% the folder's top and bottom margins shrink to about 2–4% of the viewport, and the fixed "Personal Archive" header and fictional-content footer overlay the open cover. Adopting it would mean moving that chrome off the folder. The code keeps V3's 0.78 as the default until the owner decides; `?framing=0.86` shows the alternative.

Phone: **neither ratio applies, and the result is readable but cramped.** The page is limited by width. At 16 px the text is legible with 37 characters per line, but only a third of the document is visible at once in a 519-px scrolling window, above a 180-px empty band. A useful phone reading view probably needs a narrow-screen sheet proportion or a handoff to the full-width plain layout after settling. Both change V3's paper geometry or reading metaphor, so they are left for owner review.

## Deviations from V3 for review

1. **Perpendicular reading camera** instead of V3's ~80°, so that the settled HTML can be untransformed and crisp. The visible perspective of the cover and folder thickness remain.
2. The browser supplies its own **lighting and tone mapping**: AgX, one directional key with a shadow-only floor, and a room environment. Shadows are firmer than V3's area-light softness, and colours are close but not identical.
3. **Labels are flattened** and use a coarser curve resolution in the export. The page's rendered V3 text and images are replaced by the HTML document.
4. **Narrow screens widen the field of view** below a 1:1 aspect, so the cabinet is small on phones: about 20% of viewport height at arrival.
5. The **arrival hold** is indefinite (V3 frames 1–18 simulated waiting). The entrance runs from frame 18 at V3 timing: 5.75 s to the reading lock.
6. With **reduced motion preferred at load**, visitors get the plain document and never see the cabinet, following the contract's loading-state rule. Switching reduced motion on while the cabinet is already open (`idle`) keeps it, and Open then settles without motion.

## Limits and unresolved issues

- **Visual collisions:** on phones the header text overlays the cabinet top during parts of the approach. At 86% on desktop the header and footer overlay the cover. On phones the entrance buttons sit over the lower scene during the drawer phase.
- **Text above the canvas:** text is drawn above the canvas, so no scene object can ever occlude it. Wave 1C's upward turn must hide or move the text while the sheet flexes. While moving, text is rasterized under a 3D transform and slightly soft; it sharpens when settled.
- **Tab resume:** checked only in headed Chromium. Playwright kept reporting `visibilityState: visible`, but frames paused while another tab was in front, and the entrance resumed and completed 3.5 s after return. A true hidden-document check on a physical browser was not performed.
- **Loading feedback:** loading shows only an off-white screen with "Preparing the archive…" and the controls. There is no poster image.
- **Environment coverage:** only Chromium on Windows was tested. Firefox, Safari, physical phones, touch hardware, screen readers, enlarged text, and 200% zoom were not re-tested in the scene surface. The plain fallback is the Wave 1A layout.
- **Study parameter:** the `framing` query parameter is a study aid that ships in the build.
- **Licensing:** asset and code licensing remain open.
