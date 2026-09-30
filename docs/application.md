# Application setup and boundaries

Astro, TypeScript, and plain CSS generate the documents as static HTML (Wave 1A). Wave 1B adds a client entrance: three.js plays the V3 cabinet-to-folder sequence exported from Blender, then places the same semantic HTML on the settled paper. Wave 1C adds a second document with Previous/Next controls and V3's upward page turn. The documents remain complete without JavaScript, WebGL, or the scene asset. Blender V3 remains the accepted storyboard.

## Setup

Use Node **24.21.0** (also recorded in `.node-version`) and its bundled npm **11.19.0**. The supported runtime range is Node 24.21+ within 24.x, with npm 11.x; the exact baseline is selected for verification and CI. Python 3 and Git are needed for repository checks. No Blender installation, private files, environment variables, or credentials are needed.

From the repository root:

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:4321`. Stop with Ctrl+C. On Windows PowerShell, use `npm.cmd` if a local script policy prevents `npm.ps1` from running. Use the URL printed by Astro if the port is already occupied.

```sh
python scripts/check_repository.py
npm run typecheck
npm run lint
npm run build
npm run preview
```

```sh
npx playwright install chromium   # once per machine
npm run test:browser
```

`npm run check` combines type checking and linting. `npm run test:browser` builds, starts preview on port 4350, and runs the Playwright behaviour tests in Chromium (`tests/browser/entrance.spec.ts` and `navigation.spec.ts`). Stop any other `astro preview` for this checkout first (`npx astro preview stop`); Astro allows one per project. On Windows the tests request the hardware GPU through ANGLE/D3D11; elsewhere Chromium uses SwiftShader software WebGL, which is much slower; the entrance then settles early (see below), and the suite still passes. Preview serves the existing production `dist/` at `http://127.0.0.1:4321`; rebuild after editing. Both servers bind to loopback. Preview is a local inspection command, not a deployment service. CI runs `npm ci`, type checking, linting, and build; a separate job runs the browser tests; the original repository check is unchanged. CI does not publish artifacts or deploy. Restart the dev server after changing the root-level Astro config. npm's `allowScripts` entry explicitly permits the locked esbuild platform-binary setup; normal installs require no interactive approval.

## Content and asset boundary

- `app/src/content/fictional-documents.ts`: the documents in reading order, each with a stable ID, headings, paragraphs, project summary, and reference link; no scene imports or coordinates. Both are invented fixtures.
- `app/src/components/ReadingDocument.astro`: renders one document into a semantic, selectable `article` at build time. Content is escaped by Astro, not injected as raw HTML.
- `app/src/pages/index.astro`: one route, title, language, viewport, skip link, landmarks, entrance controls, status region, every document inside `main#reading`, the document navigation, and a small inline script that chooses the scene or plain layout before first paint.
- `app/src/scripts/experience/`: `controller.ts` (the single state authority), `main.ts` (DOM view, focus, and paper placement), `scene.ts` (three.js adapter, loaded on demand), `geometry.ts` (pure framing and projection math).
- `app/src/assets/scene/archive-entrance-v3.glb` and `.json`: the exported scene and its provenance manifest. See the scene asset workflow below.
- `app/src/styles/global.css`: provisional portrait composition with natural scrolling and phone reflow; scene-mode rules place the same document on the paper.
- `app/public/`: reserved for explicitly reviewed public assets only; still absent. The scene asset is imported by URL and fingerprinted by the build instead. Anything placed here will be copied verbatim by Astro.
- `dist/`: generated output only. Serve this through preview, never the repository root through a general static server.

The application root is `app/`. The config explicitly names the public and output directories; there are no copy plugins, broad content globs, or imports from repository documents. Vite's filesystem allowlist covers the app and dependencies, with explicit denials for private, artifact, design, Git, and environment paths. This is defense in depth, not permission to copy sensitive material into an allowed path. Review future imports and assets before building. Local evidence belongs in ignored `artifacts/`, never `app/public/`.

## Experience coordination (Waves 1B and 1C)

`ExperienceController` owns one state record: `phase` (`loading`, `idle`, `entering`, `reading`, `turning`), `surface` (`scene` or `flat`), a monotonically increasing `transitionId`, `failed`, and `document` (the current document's index in reading order). The view mirrors it on `<html>` as `data-phase`, `data-surface`, `data-transition`, and `data-document` (the document's ID); `data-scene-load` reports the loader outcome and `data-sheet` the document the 3D sheets currently rest on (`turning` while a sheet moves; absent on the plain layout). The scene adapter owns all camera, object, and sheet animation and reports completion, pointer activation, slow rendering, and failure; only the controller changes phase or document. Load, completion, and turn callbacks are ignored if the transition ID has changed since they started.

| State | Implemented behaviour |
| --- | --- |
| before script | The inline script sets `loading`/`scene`, or `reading`/`flat` for reduced motion or missing WebGL 2. Until the module runs, the inline script itself handles "Go straight to the document" and the skip link (showing `reading`/`flat` and focusing the document), because a module still downloading also delays `DOMContentLoaded`. The module adopts an existing `reading` state instead of starting a load. If the module has not run by `DOMContentLoaded` (for example, it failed), the page falls back to `reading`/`flat`. Without JavaScript nothing is hidden. |
| `loading` | Status "Preparing the archive…"; Open is `aria-disabled`. "Go straight to the document" or the skip link leads to `reading`/`flat` and invalidates the load; a scene that finishes loading afterwards is disposed and the plain layout stays. Load failure leads to `reading`/`flat` with a status message; there is no automatic retry. Reduced motion switched on here also leads to `reading`/`flat`. |
| `idle` | The Open button (pointer, Enter, or Space) or a click on the top drawer starts one entrance. Direct access settles the scene without motion. If reduced motion is now preferred, Open settles directly. A mouse turns the view slightly (the orbit study below). |
| `entering` | One timeline: 5.24 seconds by default, 5.75 at V3 timing (see the entrance study below). Repeated Open, keyboard, or drawer input is ignored. "Skip the animation", the skip link, switching reduced motion on, or sustained slow rendering cancels the timeline, advances the ID, and settles `reading` on the scene surface. |
| `reading` | Indefinite hold; the canvas re-renders only on resize. Previous/Next start a turn (see below). WebGL context loss disposes the scene and falls back to `flat` on the current document. |
| `turning` | One 1.75-second turn (V3 frames 204–246). Previous/Next are `aria-disabled`; further requests are ignored, never queued. The skip link settles the turn and focuses the document. Switching reduced motion on, sustained slow rendering, context loss, or a viewport too small for the paper settles on the committed document. |

Timeline time is real elapsed time while the document is visible. An entrance clock (`entranceClock` in `geometry.ts`) maps it to V3 clip time; at V3 timing the two are equal. A hidden document pauses the timeline, and the gap is not counted when it becomes visible again. A single long foreground frame (an occluded window or a hitch) advances at most 0.25 s, so the motion resumes rather than jumping. Three consecutive frames longer than 100 ms (below 10 fps) mean rendering cannot keep up: the adapter reports this and the controller settles into reading, focusing the document as on completion. Resizing recomputes the field of view and reading pose; below a 1:1 aspect the vertical field of view widens so V3's centred action stays in frame.

Focus: deliberate actions (entrance completion, direct access, skip) move focus to `main#reading`, which is also the paper's scroll container, so arrow keys, Page Down, and Space scroll it. Passive changes (load failure, reduced-motion change) move focus only when it was on an entrance control that has just disappeared. `main` is `inert` until `reading`, so the moving copy has no focus targets. The DOM contains exactly one document.

### Entrance study: camera approach timing

Study parameter `?approach=` (0.6–1, default 0.75; `1` is V3). V3's camera approaches the cabinet during clip frames 18–66 (2.0 s), while the drawer opens (frames 18–50). The approach takes this fraction of that time. The exported clip keeps one shared clock, so the follow camera stays on the folder. The clip runs faster from activation, then eases back to V3's speed along a smoothstep shortly after the approach. Everything from the folder's rotation (frame 83) plays at V3's pace, including the cover opening and reading approach. The clip speed changes gradually, so there is no hitch. It is never slower than V3.

| `approach` | Entrance | Camera approach | Drawer opening | Lift (frames 50–70) | Rotation onwards |
| --- | --- | --- | --- | --- | --- |
| 1 (V3) | 5.75 s | 2.00 s | 1.33 s | 0.83 s | V3 |
| 0.8 | 5.34 s | 1.60 s | 1.04 s | 0.72 s | V3 |
| 0.75 (default) | 5.24 s | 1.50 s | 0.97 s | 0.69 s | V3 |
| 0.7 | 5.14 s | 1.40 s | 0.90 s | 0.65 s | V3 |

The drawer opening overlaps the approach, so it shortens slightly more than the approach does. This timing is a comparison for review, not an approved change to V3.

### Entrance study: idle pointer orbit

Study parameter `?orbit=off` keeps the arrival view still, as in Wave 1B. While the cabinet is `idle`, the mouse position turns the camera about the cabinet. The pivot is the point on the arrival camera's axis nearest the cabinet's centre. A pointer at the right edge moves the camera 7° to the right, revealing the cabinet's right side; the top edge raises it 2.5°. The view eases towards the pointer at a frame-rate-independent rate (about 95% of the way in 0.75 s), and recentres when the pointer leaves the window. Rendering runs only while the view is still moving.

Only `pointerType === 'mouse'` moves the view; touch and pen leave the cabinet still. When reduced motion is switched on, the controller tells the scene (`ArchiveScene.reduceMotion`), which returns to the arrival view at once and ignores the pointer. With reduced motion preferred at load the plain layout is used, as before. Activation freezes the angle; the approach to the cabinet then releases it along a smoothstep, from the angle the visitor left to V3's path by clip frame 66. The first entrance frame is therefore the last idle frame. The reading camera and page turns never use the orbit.

### Scene-to-HTML handoff

The exported V3 clip (frames 18–156) drives the drawer, slides, folder, portrait rotation, cover hinge, and follow camera. From frame 132 the browser blends the camera towards a reading pose computed for the viewport. That pose is perpendicular to the page and sized so the page fills a chosen fraction of the viewport height (`?framing=0.86`; default 0.78, V3's rendered ratio). Narrow screens are limited by width instead. The pose is perpendicular, rather than V3's roughly 80°, so the settled page projects to an exact rectangle.

The HTML page is the only readable copy. Its background is transparent, so the rendered sheet serves as the paper. Between V3 frames 116 and 130, once the cover is clear of the page, the text fades in. It is laid out at its settled size and mapped onto the page's projected corners by a CSS `matrix3d` homography each frame. On completion the transform is removed and the same box is positioned with `left`/`top`, so the text layout does not change; measured handoff movement is under 0.5 px. The top 4% of the sheet stays clear of the fastening straps. Content longer than the page scrolls inside it, with a fade at the lower edge. Because the text is drawn above the canvas, nothing in the scene can occlude it; Wave 1C resolves this for the page turn below.

### Documents and page turn (Wave 1C)

**Commit point.** A navigation request is accepted only in `reading`, and only towards an existing adjacent document; the first and last documents disable the direction that would wrap. An accepted request commits immediately: `document` changes, the transition ID advances, the navigation announces "Document 2 of 2: …" through a polite live region, and `main#reading` switches to the new article. The turn only animates towards that committed document. Every interruption therefore settles the sheets, the readable text, and the navigation on the same document. None can revert or half-apply it.

**Motion.** Only the first V3 sheet turns, around its top attachment (`PAGE 01 | top attachment hinge`), by 178° over 1.75 s. The rotation follows V3's two-key curve, which with flat Bézier handles is exactly a smoothstep. The Blender lattice does not export (D016), so its "Free edge lag" is reproduced on the CPU. The sheet's 910 vertices move along the sheet normal by 0.18 × (distance from attachment ÷ length)², weighted by V3's keys (0, 0.8, 1, 0.45, 0 at frames 204/218/228/238/246) through monotone cubic interpolation. Normals are recomputed while bent and restored exactly at rest. Previous replays the same pose backwards, with the bend reversed so the free edge still trails the motion. The outer cover, which opens left during the entrance, is not touched. The camera stays at the reading pose: turns change only the sheet. The first document rests on the flat sheet. The second is read on the fixed second sheet once the first has turned over and rests beyond the top of the page, as in V3. The scene therefore supports exactly these two documents; more need more exported sheets.

**Text during a turn.** HTML is drawn above the canvas, so the scene cannot hide it. The turn therefore uses two layers in the settled page box:

- The document printed on the turning sheet rides it. Its box is mapped by the same CSS homography as the entrance onto the screen quad of the bent sheet's corners. The flat mapping follows the curved sheet to within its bulge (at most 2% of the sheet length). Its opacity fades to zero between 40° and 70° of lift, before the sheet is too foreshortened and curved for a flat mapping, and fades back in as a returning sheet lands. Past that angle the sheet shows blank paper, and its back is blank.
- The document beneath stays untransformed. It is clipped with `clip-path: inset(...)` so that it is visible only below the lowest screen point of the turning sheet, measured from its projected vertices every frame. It is revealed as the sheet lifts, and covered as it returns.

The two layers therefore never overlap, and neither text is drawn over the wrong sheet (measured: the rendered sheet edge and the text layers agree within about 1 px). `main#reading`, which already holds the committed document, takes whichever role that document has. For the other role the view clones the outgoing article into a temporary `.paper-copy`. The copy has its IDs and `aria-labelledby` removed and is `inert` and `aria-hidden`, so it has no focus targets, selection, find-in-page, or accessible content. `main#reading` is also `inert` during the turn. The copy is removed when the turn settles. At rest the page is untransformed, selectable, and scrollable as in Wave 1B.

**Focus and announcements.** Navigation keeps focus on the control used; the live region announces the new document. At a boundary the focused control stays focusable but reports `aria-disabled`. If focus was inside the outgoing document, it moves to the control for that direction. The skip link during a turn settles it and focuses the document. Passive settles (slow rendering, reduced motion, failure, resize) do not move focus. In tab order the controls follow the document.

**Scroll position.** Each document keeps its reading position for the visit (the paper's `scrollTop` in the scene, the window offset in the plain layout). An unvisited document opens at its top. The outgoing sheet shows exactly what the reader last saw, and returning restores it. Moving between the scene and the plain layout keeps the position.

**Slow devices.** Turns use real elapsed time without the entrance's per-frame cap, so a hitch jumps forward instead of prolonging the turn: a turn lasts at most 1.75 s of visible time plus one frame. Three consecutive frames over 100 ms settle the turn immediately. Once an entrance or turn has been settled for slow rendering, later document changes switch without a turn. A hidden document pauses a turn, which resumes when visible, as for the entrance.

**Reduced motion and the plain layout.** With reduced motion (preferred at load or switched on later), without a scene, after a failure, or on the plain layout, Previous/Next switch the document instantly. On the scene surface the sheets jump to the matching rest pose, with no turn. Without JavaScript, and until the module boots (including a stalled or failed download, and direct access or reduced motion before boot), every document is shown in order and the controls are hidden. Only the booted module sets `data-paged`, which shows one document at a time, together with working controls. It starts on the document that holds focus, or else the one at the top of the window, and keeps it where it was on screen.

**Controls and readable size.** The navigation (Previous, position, Next; 44 px targets) is fixed below the page on both surfaces. On the plain layout it sits on an opaque band, with bottom padding and `scroll-padding` so that it never covers the end of a document or a focused link. Below 20em it wraps and follows the document instead. The scene's reading camera reserves the controls' height. When the settled page would be narrower than 16 rem (for example at 200% zoom, with enlarged default text, or on a landscape phone), reading uses the plain layout. The scene stays loaded, and the paper is used again when a resize makes room. The entrance picks the surface when it ends.

### Scene asset workflow

The committed GLB is generated, not hand-edited. From a fresh checkout with Blender 5.1.2:

```text
blender --background --factory-startup --python-exit-code 1 --python design/blender/rebuild_all.py
blender -b artifacts/archive-motion-draft/v3/archive-motion-v3.blend --python-exit-code 1 --python design/blender/export_web_v3.py
```

The exporter reads the saved V3 scene without saving it. It writes `app/src/assets/scene/archive-entrance-v3.glb` plus a manifest recording SHA-256, size, Blender version, frame range, exclusions, animated nodes, and every node's parent. It preserves V3 object names (three.js replaces spaces with underscores), parents, the 0.65 folder scale, and hinge pivots. It converts Blender Z-up to glTF Y-up (`x, y, z → x, z, −y`), applies bevel and solidify modifiers at frame 18, and flattens label text. Page text and images, the paper-flex lattice, lights, and the ground are excluded, and the export fails if any image would be included.

A fresh rebuild is semantically identical to the committed export (hierarchy, transforms, bounds, animation) but not byte-identical: 21 bevelled meshes differ by a few split-normal vertices. Blender is not needed to run, build, or test the app.

## Review

See [Wave 1A evidence](reviews/wave-1a.md), [Wave 1B evidence](reviews/wave-1b.md), and [Wave 1C evidence](reviews/wave-1c.md) for tested commands, screenshots, measurements, and limitations. `tests/browser/entrance.spec.ts` and `navigation.spec.ts` exercise real transition logic through the observable `data-*` state rather than restating markup.
