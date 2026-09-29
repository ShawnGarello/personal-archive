# Application setup and boundaries

Astro, TypeScript, and plain CSS generate the document as static HTML (Wave 1A). Wave 1B adds a client entrance: three.js plays the V3 cabinet-to-folder sequence exported from Blender, then places the same semantic HTML on the settled paper. The document remains complete without JavaScript, WebGL, or the scene asset. Blender V3 remains the accepted storyboard.

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

`npm run check` combines type checking and linting. `npm run test:browser` builds, starts preview on port 4350, and runs the Playwright behaviour tests in Chromium. Stop any other `astro preview` for this checkout first (`npx astro preview stop`); Astro allows one per project. On Windows the tests request the hardware GPU through ANGLE/D3D11; elsewhere Chromium uses SwiftShader software WebGL, which is much slower; the entrance then settles early (see below), and the suite still passes. Preview serves the existing production `dist/` at `http://127.0.0.1:4321`; rebuild after editing. Both servers bind to loopback. Preview is a local inspection command, not a deployment service. CI runs `npm ci`, type checking, linting, and build; a separate job runs the browser tests; the original repository check is unchanged. CI does not publish artifacts or deploy. Restart the dev server after changing the root-level Astro config. npm's `allowScripts` entry explicitly permits the locked esbuild platform-binary setup; normal installs require no interactive approval.

## Content and asset boundary

- `app/src/content/fictional-document.ts`: stable document ID, headings, paragraphs, project summary, and reference link; no scene imports or coordinates.
- `app/src/components/ReadingDocument.astro`: renders that data into semantic, selectable HTML at build time. Content is escaped by Astro, not injected as raw HTML.
- `app/src/pages/index.astro`: one route, title, language, viewport, skip link, landmarks, entrance controls, status region, and a small inline script that chooses the scene or plain layout before first paint.
- `app/src/scripts/experience/`: `controller.ts` (the single state authority), `main.ts` (DOM view, focus, and paper placement), `scene.ts` (three.js adapter, loaded on demand), `geometry.ts` (pure framing and projection math).
- `app/src/assets/scene/archive-entrance-v3.glb` and `.json`: the exported scene and its provenance manifest. See the scene asset workflow below.
- `app/src/styles/global.css`: provisional portrait composition with natural scrolling and phone reflow; scene-mode rules place the same document on the paper.
- `app/public/`: reserved for explicitly reviewed public assets only; still absent. The scene asset is imported by URL and fingerprinted by the build instead. Anything placed here will be copied verbatim by Astro.
- `dist/`: generated output only. Serve this through preview, never the repository root through a general static server.

The application root is `app/`. The config explicitly names the public and output directories; there are no copy plugins, broad content globs, or imports from repository documents. Vite's filesystem allowlist covers the app and dependencies, with explicit denials for private, artifact, design, Git, and environment paths. This is defense in depth, not permission to copy sensitive material into an allowed path. Review future imports and assets before building. Local evidence belongs in ignored `artifacts/`, never `app/public/`.

## Experience coordination (Wave 1B)

`ExperienceController` owns one state record: `phase` (`loading`, `idle`, `entering`, `reading`), `surface` (`scene` or `flat`), a monotonically increasing `transitionId`, and `failed`. The view mirrors it on `<html>` as `data-phase`, `data-surface`, and `data-transition`; `data-scene-load` reports the loader outcome. The scene adapter owns all camera and object animation and reports completion, pointer activation, and failure; only the controller changes phase. Load and completion callbacks are ignored if the transition ID has changed since they started.

| State | Implemented behaviour |
| --- | --- |
| before script | The inline script sets `loading`/`scene`, or `reading`/`flat` for reduced motion or missing WebGL 2. Until the module runs, the inline script itself handles "Go straight to the document" and the skip link (showing `reading`/`flat` and focusing the document), because a module still downloading also delays `DOMContentLoaded`. The module adopts an existing `reading` state instead of starting a load. If the module has not run by `DOMContentLoaded` (for example, it failed), the page falls back to `reading`/`flat`. Without JavaScript nothing is hidden. |
| `loading` | Status "Preparing the archive…"; Open is `aria-disabled`. "Go straight to the document" or the skip link leads to `reading`/`flat` and invalidates the load; a scene that finishes loading afterwards is disposed and the plain layout stays. Load failure leads to `reading`/`flat` with a status message; there is no automatic retry. Reduced motion switched on here also leads to `reading`/`flat`. |
| `idle` | The Open button (pointer, Enter, or Space) or a click on the top drawer starts one entrance. Direct access settles the scene without motion. If reduced motion is now preferred, Open settles directly. |
| `entering` | One 5.75-second timeline. Repeated Open, keyboard, or drawer input is ignored. "Skip the animation", the skip link, switching reduced motion on, or sustained slow rendering cancels the timeline, advances the ID, and settles `reading` on the scene surface. |
| `reading` | Indefinite hold; the canvas re-renders only on resize. WebGL context loss disposes the scene and falls back to `flat`. |

Timeline time is real elapsed time while the document is visible. A hidden document pauses the timeline, and the gap is not counted when it becomes visible again. A single long foreground frame (an occluded window or a hitch) advances at most 0.25 s, so the motion resumes rather than jumping. Three consecutive frames longer than 100 ms (below 10 fps) mean rendering cannot keep up: the adapter reports this and the controller settles into reading, focusing the document as on completion. Resizing recomputes the field of view and reading pose; below a 1:1 aspect the vertical field of view widens so V3's centred action stays in frame.

Focus: deliberate actions (entrance completion, direct access, skip) move focus to `main#reading`, which is also the paper's scroll container, so arrow keys, Page Down, and Space scroll it. Passive changes (load failure, reduced-motion change) move focus only when it was on an entrance control that has just disappeared. `main` is `inert` until `reading`, so the moving copy has no focus targets. The DOM contains exactly one document.

### Scene-to-HTML handoff

The exported V3 clip (frames 18–156) drives the drawer, slides, folder, portrait rotation, cover hinge, and follow camera. From frame 132 the browser blends the camera towards a reading pose computed for the viewport. That pose is perpendicular to the page and sized so the page fills a chosen fraction of the viewport height (`?framing=0.86`; default 0.78, V3's rendered ratio). Narrow screens are limited by width instead. The pose is perpendicular, rather than V3's roughly 80°, so the settled page projects to an exact rectangle.

The HTML page is the only readable copy. Its background is transparent, so the rendered sheet serves as the paper. Between V3 frames 116 and 130, once the cover is clear of the page, the text fades in. It is laid out at its settled size and mapped onto the page's projected corners by a CSS `matrix3d` homography each frame. On completion the transform is removed and the same box is positioned with `left`/`top`, so the text layout does not change; measured handoff movement is under 0.5 px. The top 4% of the sheet stays clear of the fastening straps. Content longer than the page scrolls inside it, with a fade at the lower edge. Because the text is drawn above the canvas, nothing in the scene can occlude it. This constrains the Wave 1C page turn.

### Scene asset workflow

The committed GLB is generated, not hand-edited. From a fresh checkout with Blender 5.1.2:

```text
blender --background --factory-startup --python-exit-code 1 --python design/blender/rebuild_all.py
blender -b artifacts/archive-motion-draft/v3/archive-motion-v3.blend --python-exit-code 1 --python design/blender/export_web_v3.py
```

The exporter reads the saved V3 scene without saving it. It writes `app/src/assets/scene/archive-entrance-v3.glb` plus a manifest recording SHA-256, size, Blender version, frame range, exclusions, animated nodes, and every node's parent. It preserves V3 object names (three.js replaces spaces with underscores), parents, the 0.65 folder scale, and hinge pivots. It converts Blender Z-up to glTF Y-up (`x, y, z → x, z, −y`), applies bevel and solidify modifiers at frame 18, and flattens label text. Page text and images, the paper-flex lattice, lights, and the ground are excluded, and the export fails if any image would be included.

A fresh rebuild is semantically identical to the committed export (hierarchy, transforms, bounds, animation) but not byte-identical: 21 bevelled meshes differ by a few split-normal vertices. Blender is not needed to run, build, or test the app.

## Review

See [Wave 1A evidence](reviews/wave-1a.md) and [Wave 1B evidence](reviews/wave-1b.md) for tested commands, screenshots, measurements, and limitations. `tests/browser/entrance.spec.ts` exercises real transition logic through the observable `data-*` state rather than restating markup.
