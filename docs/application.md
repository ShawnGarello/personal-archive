# Application setup and boundaries

Wave 1A uses Astro, TypeScript, and plain CSS. It generates static HTML with no client JavaScript in the production page. The provisional reading surface is independent of future scene work. Blender V3 remains the accepted storyboard.

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

`npm run check` combines type checking and linting. Preview serves the existing production `dist/` at `http://127.0.0.1:4321`; rebuild after editing. Both servers bind to loopback. Preview is a local inspection command, not a deployment service. CI runs `npm ci`, type checking, linting, and build, alongside the original repository check; it does not publish artifacts or deploy. Restart the dev server after changing the root-level Astro config. npm's `allowScripts` entry explicitly permits the locked esbuild platform-binary setup; normal installs require no interactive approval.

## Content and asset boundary

- `app/src/content/fictional-document.ts`: stable document ID, headings, paragraphs, project summary, and reference link; no scene imports or coordinates.
- `app/src/components/ReadingDocument.astro`: renders that data into semantic, selectable HTML at build time. Content is escaped by Astro, not injected as raw HTML.
- `app/src/pages/index.astro`: one route, title, language, viewport, skip link, and landmarks.
- `app/src/styles/global.css`: provisional portrait composition; minimum desktop height, no fixed content height, natural scrolling and phone reflow.
- `app/public/`: reserved for explicitly reviewed public assets only; currently absent because there are no assets to copy. Anything placed here will be copied verbatim by Astro.
- `dist/`: generated output only. Serve this through preview, never the repository root through a general static server.

The application root is `app/`. The config explicitly names the public and output directories; there are no copy plugins, broad content globs, or imports from repository documents. Vite's filesystem allowlist covers the app and dependencies, with explicit denials for private, artifact, design, Git, and environment paths. This is defense in depth, not permission to copy sensitive material into an allowed path. Review future imports and assets before building. Local evidence belongs in ignored `artifacts/`, never `app/public/`.

## Future experience coordination (proposal for 1B/1C)

Only direct reading exists in 1A. It requires no runtime state store. The following is an integration contract, not implemented behavior or a new state-machine dependency.

The future experience controller will own one discriminated state record with `phase`, `activeDocumentId`, and a monotonically increasing `transitionId`. A turning state additionally records source and target IDs. The content module remains the source of reading order and data; the scene receives IDs and geometry inputs, never owns copy or navigation. A single scene adapter owns all camera/object timelines and exposes cancel/settle operations plus readiness, completion, and failure reports tagged with the transition ID. Only the controller commits navigation or accepts matching callbacks.

| State | Allowed event and next state |
| --- | --- |
| `loading` | Real asset readiness leads to `idle`; HTML is already available. Direct access, reduced motion, or failure leads to `reading`, invalidating pending load/animation callbacks. No invented progress percentage. |
| `idle` | One Open activation leads to `entering`. Direct access leads to `reading`. |
| `entering` | One matching completion leads to `reading`. Repeated Open is ignored. Skip, reduced motion, or failure cancels the timeline, advances the transition ID, and settles in `reading`. |
| `reading` | Hold indefinitely. In 1C, a valid adjacent-document request leads to `turning`; first/last boundaries disable unavailable directions without wrapping. |
| `turning` | Matching completion commits the target ID and returns to `reading`. Further turns are guarded, not queued. Skip/reduced motion/failure cancels and settles on the requested target in HTML. |

Failures preserve useful content and can display an honest status; retry must be explicit and must not replay the entrance automatically. Viewport changes or tab resumption must remeasure and settle an interrupted transition without replay. Enabling reduced motion mid-transition uses the same cancellation path. Real load failure and interruption tests belong to the integrated scene waves.

The reading surface owns DOM focus, scroll, and text accessibility. A deliberate skip moves focus to the reading landmark; navigation completion should focus the new document heading, while passive scene readiness must not steal focus. Only one readable interactive copy exists. If the scene uses decorative text or a visual page copy, it must be hidden from assistive technology and contain no focus targets. Busy feedback must not create a focus trap.

V3 choreography remains: one click, drawer and camera approach, upright extraction, continuous folder motion outward, cover opening left, content approach, then a fixed reading camera; later sheets turn upward at their independent top attachment. The cabinet leaves the pale reading composition. Timing, framing, scene library, and HTML alignment are unproved until 1B; paper deformation is 1C work.

## Review

See [Wave 1A evidence](reviews/wave-1a.md) for tested commands, screenshots, reproducibility, and limitations. No automatic interaction suite is added for this static page; future tests should exercise real transition logic rather than restate markup.
