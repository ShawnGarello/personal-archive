# Wave 1A implementation record

2026-09-27. Status: **implemented and locally verified; awaiting audit before integration**. Wave 1B remains unassigned.

Branch: `implement/wave-1a`, based on `27d7379` on `docs/implementation-contracts`. Worktree: `C:/Users/teche/personal-archive-wave-1a`. The implementation commit is the commit containing this report; resolve it with `git log -1 --format=%H -- docs/reviews/wave-1a.md`. The original checkout remains on the documentation branch, unmodified. No push, merge, deployment, or private-file copy occurred.

## Decisions and delivered scope

Astro **7.3.5**, TypeScript **6.0.3**, and plain CSS generate one fictional document at build time. The separate data fixture has a stable ID and no scene dependency. The component supplies semantic headings, paragraphs, a project summary, and a usable background link; the page supplies landmarks, metadata, and a skip link. The white portrait composition, system font, and pale surround are provisional. Natural scrolling and reflow take precedence over fixed paper dimensions.

Verified runtime: Node **24.21.0**, npm **11.19.0**, Python **3.13.7**, Windows x64. Other direct development dependencies: `@astrojs/check` 0.9.10, ESLint 10.11.0, `@eslint/js` 10.0.1, `typescript-eslint` 8.70.1, and `eslint-plugin-astro` 3.2.1. TypeScript 6 is deliberate: checker/linter peer ranges do not support registry-latest TypeScript 7. npm's version-specific `allowScripts` entry permits esbuild 0.28.2's platform-binary setup. No global package or Git identity was changed.

See [D015](../decisions.md) for alternatives and official guidance, and [application setup](../application.md) for commands, boundaries, and proposed loading/idle/entering/reading/turning coordination. This wave has no client script, renderer, state framework, fake loading, cabinet, camera, page turn, full navigation, real personal copy, or production assets. V3 is unchanged.

## Commands and results

From the original clean documentation checkout:

```powershell
git status --short
git branch --show-current
git worktree list
git show -s --oneline 27d7379
git worktree add -b implement/wave-1a C:/Users/teche/personal-archive-wave-1a 27d7379
```

The host initially provided Node 22.16.0/npm 10.9.2. Installed a local runtime in ignored `artifacts/tooling/`, without changing the system installation. Exact resumed setup/check commands from the implementation worktree:

```powershell
curl.exe --fail --silent --show-error --location https://nodejs.org/dist/v24.21.0/node-v24.21.0-win-x64.zip -o artifacts/tooling/node.zip
Get-FileHash artifacts/tooling/node.zip -Algorithm SHA256
python -m zipfile -e artifacts/tooling/node.zip artifacts/tooling
$env:PATH = "$PWD/artifacts/tooling/node-v24.21.0-win-x64;" + $env:PATH
$env:ASTRO_TELEMETRY_DISABLED = '1'
node --version
npm.cmd --version
npm.cmd ci
npm.cmd install-scripts ls
npm.cmd install-scripts approve esbuild
npm.cmd run check
npm.cmd run build
python scripts/check_repository.py
git diff --cached --check
npm.cmd run dev
# Separate terminal, same Node on PATH:
npm.cmd run preview -- --port 4322
```

The Node ZIP matched the official SHA-256: `158f7685b44de51f6c0df1d153526cbcd3e1bc739a8dfc607721cef75de9e541`.

Locked install succeeded: 366 installed packages; npm reported zero known vulnerabilities. Type checking: **0 errors, 0 warnings, 0 hints**. Lint: pass with zero warnings. Build: one page. Repository checks: pass for **51 tracked files**. Staged whitespace check: pass. Dev on 4321 and preview on 4322 returned HTTP 200 with the fixture. Remote GitHub CI is **unrun**, since no push was authorized. The workflow preserves the repository job and adds locked install/type/lint/build without publication.

Resolved setup failures: disk exhaustion blocked runtime extraction until the owner freed space; the old host runtime failed engine enforcement; Astro rejected URL objects for directory settings, now explicit filesystem paths. Explicit source/checker roots avoid root-relative defaults and scanning unrelated material. The initial lockfile-only resolution under npm 10 was subsequently validated by normal npm 11 `npm ci` with engine enforcement; no lockfile change was needed.

## Isolated-copy reproducibility (A1)

Copied the Git index, not the working directory, into a new directory with its own Git index. It began with only the 51 reviewed tracked files: no dependencies, generated output, evidence, or private files. This was an equivalent isolated-copy check, not a remote clone.

```powershell
# From the implementation worktree:
git checkout-index --all --prefix=C:/Users/teche/personal-archive-wave-1a-clean/
git -C C:/Users/teche/personal-archive-wave-1a-clean init
$snapshotFiles = git ls-files
git -C C:/Users/teche/personal-archive-wave-1a-clean add -- $snapshotFiles

# From C:/Users/teche/personal-archive-wave-1a-clean:
$env:PATH = 'C:/Users/teche/personal-archive-wave-1a/artifacts/tooling/node-v24.21.0-win-x64;' + $env:PATH
$env:ASTRO_TELEMETRY_DISABLED = '1'
npm.cmd ci --cache C:/Users/teche/personal-archive-wave-1a/artifacts/wave-1a/clean-npm-cache
python scripts/check_repository.py
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
npm.cmd run dev -- --port 4331
# Separate terminal:
npm.cmd run preview -- --port 4332
```

All passed, including a fresh npm cache and approved esbuild setup without script warnings. Both servers returned HTTP 200 and the fixture heading. Both builds contain only `dist/index.html`, **4,045 bytes**, SHA-256 `9f5dee8b85483e4bf1ae15d5f97564d03bfe6765a4338145e08396bafa15ee26`. Application/configuration/lockfile inputs were identical; final report/status prose was completed afterward. Local records: `artifacts/wave-1a/clean-checks.txt` and `artifacts/wave-1a/reproducibility.json`.

## Browser review (A2–A4)

Production preview was inspected using Playwright **1.63.0**, Chromium **153.0.8010.12**, headless on Windows. These were tool-driven browser interactions and visual inspection of screenshots, not physical-device or human-operated keyboard tests. Browser tooling and evidence stay in ignored artifacts, outside the app.

| Inspection | Observation |
| --- | --- |
| Desktop 1440 × 1000, 100% | Portrait page 736px wide and about 1115px tall; natural scrolling and clear hierarchy; no horizontal overflow. |
| Phone viewport 390 × 844, 100% | 390px page with 20px internal padding; text and link wrap; no horizontal overflow or clipped text. Viewport emulation, not a physical phone. |
| Actual 200% tab zoom | Extension `chrome.tabs.setZoom(..., 2)` and `getZoom` confirmed 2; CSS viewport 720 × 500, DPR 2, physical viewport 1440 × 1000. All text and controls fit horizontally and remain reachable by scrolling. |
| Phone with 200% text | Additional root-font-size 200% check at 390px; title, paragraphs, link, header, and footer reflow without horizontal overflow. Distinct from actual browser zoom. |
| JavaScript disabled | Complete document and link remain readable at 390px. No production script is emitted and no renderer must initialize. |
| Select and copy | Selected heading text and issued Ctrl+C; clipboard readback exactly matched `Small tools for shared places`. |
| Keyboard | Tab reveals the outlined skip link; Enter focuses `main#reading`; Tab reaches the outlined background link; Shift+Tab returns to skip. Tab/Enter then navigates to Wikipedia's Library of things page. Back returns to `/#reading`. End scrolls to the bottom while link focus stays visible. No trap or duplicate target. |
| Headings and contrast | H1, H2, H3, H3 order. Lowest specified text contrast is approximately 7.53:1 (secondary text against pale surround). |

DOM measurements found `scrollWidth === clientWidth` at desktop, phone, zoom, and enlarged-text sizes. Paragraph, heading, and link bounds showed no horizontal clipping. No browser page errors were recorded. Initial loading requested only the document; external requests occurred after deliberate link activation.

Evidence root: `C:/Users/teche/personal-archive-wave-1a/artifacts/wave-1a/`. These local files are not fresh-checkout deliverables:

- `desktop-1440.png`, `phone-390.png`, `phone-no-javascript.png`: full-page screenshots visually inspected.
- `zoom-200-top.png`, `zoom-200-middle.png`, `zoom-200-bottom.png`: inspected viewport captures covering actual 200% zoom. An initial Playwright full-page zoom capture cropped incorrectly; these CDP viewport captures replace it as evidence.
- `keyboard-skip.png`, `keyboard-link-end.png`: visible focus inspected.
- `phone-text-200-percent.png`, `phone-text-200-top.png`, `phone-text-200-bottom.png`: enlarged-text full page and detail captures inspected.
- `browser-results.json`: metrics, heading order, focus sequence, copied text, zoom factor, and link destination.
- `browser-review.mjs`, `zoom-review.mjs`, `focus-review.mjs`: local inspection scripts, not a committed test suite.

Browser-tool commands: `npm.cmd install --prefix artifacts/wave-1a/browser-tools --save-exact playwright@1.63.0`, `node artifacts/wave-1a/browser-tools/node_modules/playwright/cli.js install chromium`, then `$env:REVIEW_URL = 'http://127.0.0.1:4322'` and `node artifacts/wave-1a/browser-review.mjs`, `node artifacts/wave-1a/zoom-review.mjs`, `node artifacts/wave-1a/focus-review.mjs`. The zoom helper uses the [documented extension setup](https://playwright.dev/docs/chrome-extensions) and [tab zoom API](https://developer.chrome.com/docs/extensions/reference/api/tabs#method-setZoom) in a disposable browser profile.

Fresh-checkout reviewers can reproduce without those scripts: run build/preview, inspect at 1440 × 1000 and 390 × 844, set browser zoom to 200%, scroll through all content, execute the keyboard sequence above, select/copy text, and reload with JavaScript disabled. Use the browser's zoom control, not a CSS transform or screenshot resize.

## Boundaries and acceptance

Reviewed staged source/configuration changes and lockfile structure. Dependency resolution URLs point only to the npm registry, with no local-file resolutions. App imports consist only of the fictional fixture, reading component, and CSS. `app/public/` is absent; there are no copy plugins or broad content globs. Reviewed the complete output as UTF-8: one HTML file containing only invented text and inline styles, with no scripts, source maps, scene files, or evidence. A dev request for the harmless `docs/concept.md` through `/@fs/` returned **403**, checking the outside-app boundary without probing a private file. No private material or derivatives were accessed.

| Criterion | Result |
| --- | --- |
| A1 | Pass: isolated install/check/build/dev/preview; identical output hashes. |
| A2 | Pass: static HTML, selection/clipboard readback, JavaScript-disabled browser. |
| A3 | Pass within stated coverage: keyboard sequence, visible focus, headings, working link. |
| A4 | Pass: desktop, 390px, actual 200% zoom, plus 200% text; screenshots and measurements agree. |
| A5 | Pass locally: repository/type/lint/build; application CI added, repository CI preserved. Remote CI unrun. |
| A6 | Pass: staged/import/public/build inventories reviewed; fictional fixtures only. |
| A7 | Pass: setup, alternatives, dependency guidance, boundaries, future state ownership, decisions, and journal recorded. |

## Limits and next review

No outstanding Wave 1A defect was found within these checks. Audit remains required before integration. Coverage is Chromium on Windows; Firefox, Safari, physical phones, screen readers, and Linux CI were not exercised. This is not a full accessibility-conformance claim. Screenshots establish the provisional reading surface, not final visual approval or V3-to-HTML alignment.

Renderer-failure injection is inapplicable to this renderer-free wave. Real loading, motion interruption, mid-motion reduced-motion changes, camera framing, and paper deformation require tests when introduced in 1B/1C. Final content, asset licensing, appearance, and release remain open. Stop at Wave 1A until audited.
