# Wave 1C implementation record

2026-09-28. Status: **implemented and locally verified; awaiting audit**. Phase 2 is not started.

Branch: `implement/wave-1c`, created from `origin/main` at `1ac12b5` (merge of Wave 1B, containing the audit fix `1cfb007`). Worktree: `C:/Users/teche/personal-archive-wave-1c`. The implementation commit is the commit containing this report; resolve it with `git log -1 --format=%H -- docs/reviews/wave-1c.md`. No push, pull request, merge, deployment, or private-file access occurred. Existing Blender scenes, renders, and the other worktrees were not modified.

## What was built

- **Second document and identity.** `app/src/content/fictional-documents.ts` holds two invented documents in reading order; the second takes V3's placeholder theme ("a daylight notebook for small rooms"). Both render as semantic `article`s inside `main#reading`; one is shown at a time. Without JavaScript both are shown in order.
- **Controller-owned navigation.** `ExperienceController` gains `document` and the `turning` phase. A request is accepted only while reading and only towards an existing adjacent document. It commits immediately; the turn only animates towards the committed document, so every interruption settles on it. Requests during a turn are ignored, not queued.
- **Page turn.** The exported V3 top hinge rotates 178° over 1.75 s on V3's curve. V3's lattice "Free edge lag" is reproduced on the sheet's 910 vertices, and reversed so the free edge trails in both directions. The camera and the outer cover are untouched. See [D017](../decisions.md) and the [technique description](../application.md#documents-and-page-turn-wave-1c).
- **Text during a turn.** The document printed on the turning sheet rides it through the existing CSS homography, fading out between 40° and 70°. The document beneath stays untransformed and is clipped to the area below the sheet's projected lowest point. One layer is `main#reading`; the other is a temporary copy that is `inert`, `aria-hidden`, and ID-free.
- **Access.** Previous/Next with a live position announcement; focus stays on the control used. Each document keeps its reading position. Reduced motion, the plain layout, and failures switch documents instantly. Slow rendering settles a turn and disables later turns. When the settled page would be narrower than 16 rem, reading uses the plain layout.
- **Tests.** Eighteen Playwright tests in `tests/browser/navigation.spec.ts` (fifteen at `c8212a9`, three added by the audit fix). The thirteen entrance tests are unchanged except for a wider clock-pause margin (below) and the audit fix's extended checks of the two direct-access-while-downloading tests.

## Commands and results

Runtime: Node 24.21.0 and npm 11.19.0 (the local runtime at `C:/Users/teche/personal-archive-wave-1a/artifacts/tooling/`), Python 3.13.7, Chromium 153 through Playwright 1.63.0, Windows 11 x64, Intel Iris Xe. No dependencies were added or changed; `npm ci` reported zero known vulnerabilities.

```powershell
git fetch origin
git worktree add -b implement/wave-1c ../personal-archive-wave-1c origin/main
# From the worktree, with Node 24 first on PATH:
npm ci
python scripts/check_repository.py
npm run typecheck
npm run lint
npm run build
npm run test:browser
# Software WebGL (local CI approximation; config kept in ignored artifacts/):
npx playwright test -c artifacts/wave-1c/playwright.swiftshader.config.ts
```

| Check | Result |
| --- | --- |
| Repository check | Pass (with the new files staged) |
| Type check | 0 errors, 0 warnings, 0 hints |
| Lint | Pass, zero warnings |
| Build | Pass; the existing warning that the lazy three.js chunk exceeds 500 kB |
| Browser tests, hardware GPU (ANGLE/D3D11) | 28 passed in about 1 min at `c8212a9`; 31 passed in 1.1 min after the audit fix |
| Browser tests, software WebGL (SwiftShader) | 28 passed in 5.3 min at `c8212a9`; 31 passed in 5.8 min after the audit fix (see limits) |
| Remote GitHub CI | **Not run**: no push was authorized |

The repeated-input test was checked against a deliberate regression: with the controller's "only while reading" guard removed, it fails (a second turn starts), and it passes with the guard. Software-WebGL runs exposed a latent flake in the shared helper, which paused the clock only 100 ms ahead of the page's time. Software WebGL can block the page for seconds (shader compilation) before the pause applies, giving "Cannot fast-forward to the past" in 2 of 28 tests. A 1 s margin failed the same way once. Both helpers, including the Wave 1B one, now pause 10 s ahead; nothing is timed while the cabinet is idle, so behaviour is unchanged. The final software run then passed all 28. Turn tests jump the paused clock with `fastForward`. Because turns follow real elapsed time, one jump reaches the same pose as many 16 ms frames, and software WebGL stays usable.

## Build inventory

| Output | Raw | gzip -9 | Change from 1B |
| --- | --- | --- | --- |
| `index.html` (inline fallback script) | 7.1 kB | 2.8 kB | CSS moved out (below); second document added |
| `index.*.css` | 6.1 kB | 1.8 kB | New file: the stylesheet now exceeds Astro's inline threshold |
| Experience module | 11.1 kB | 4.5 kB | +4.8 kB raw |
| `scene.*.js` (on demand) | 635 kB | 158 kB | +1 kB |
| `archive-entrance-v3.*.glb` (on demand) | 669 kB | 125 kB | Unchanged; no new asset or export |

The separate stylesheet adds one render-blocking request; inlining it (`build.inlineStylesheets`) is a possible follow-up. `app/public/` is still absent.

## Browser evidence

All browser work used Playwright Chromium 153 on Windows with the hardware GPU unless noted. It is viewport emulation, not physical devices. **Playback**: normal-speed recordings decoded at 8 frames per second and inspected. **Deterministic frames**: Playwright's paused clock, stepped through a turn. **Automated**: test assertions. Evidence is local and ignored.

| Evidence | Type | Location |
| --- | --- | --- |
| Entrance, forward and reverse turn at 1280×800 and 390×844 (DPR 2) | Playback | `artifacts/wave-1c/motion/{desktop,phone}/playback.webm`, `_*-forward.png`, `_*-reverse.png` |
| Frame timing during both turns | Measured | `artifacts/wave-1c/motion/*/timing.json` |
| Forward and reverse at 150 ms steps | Deterministic frames | `artifacts/wave-1c/frames/desktop/`, sheets `_sheet-next.png`, `_sheet-prev.png` |
| Rendered sheet edge versus text layers | Pixel measurement | `artifacts/wave-1c/edge.mjs`, `frames/col-*.png` |
| Settled layouts: 8 viewports × scene, enlarged text, reduced motion; both documents | Screenshots and DOM metrics | `artifacts/wave-1c/layouts/` (`results.json`) |
| Keyboard focus during and after a turn, tab switch mid-turn | Screenshots and state log | `artifacts/wave-1c/states/` |
| Scripts | — | `artifacts/wave-1c/*.mjs`, `sheet.py` |

**Motion.** Both directions played at 60 fps: 106 frames, median 16.7 ms, maximum 16.8 ms on desktop. The phone had a single 50 ms frame at the start of the forward turn, likely from building the copy. Click to settled was 1.77 s. Forward: the text lifts with the sheet and fades as the sheet steepens. Document 2 is revealed from the bottom up beneath the sheet's edge. The sheet passes vertical and comes to rest beyond the top of the page, with the straps in front, as in V3. Reverse mirrors this: for the first ~0.6 s only the strip above the page moves, then the sheet comes down, covering document 2 from the top, and document 1's text fades in as it lands. The left cover and camera stay still throughout. On the phone, the lifting sheet widens past the narrow viewport as it approaches the camera; that is perspective, not a layout fault.

**Alignment.** At the page's centre column the rendered sheet edge was at rows 578, 272, 558, and 684 at four turn times. The carried text's box bottom measured 577.8, 272.2, 558.6, and 684.0, and the uncovered text began about 1 px lower. One early frame capture showed a few pixels of overlap that did not reproduce in two later captures of the same moment; it is treated as a capture artefact. Settled handoff: the paper is untransformed with no clip at rest (asserted).

## Viewport, zoom, and text size

Enlarged text used Chrome's default font size set to 32 px (CDP `Page.setFontSizes`), which scales rem and media queries like the user preference. 200% zoom is represented by halving the CSS viewport at DPR 2.

| Viewport | Scene reading page | Result |
| --- | --- | --- |
| 1440×900 | 494×702, controls below | Scene; unchanged from 1B |
| 1280×720 | 396×562 | Scene; unchanged |
| 1024×640 | 352×500 | Scene; unchanged (the controls fit in the existing margin) |
| 390×844 phone | 366×519 at y = 143 | Scene; same size, 38 px higher than 1B (computed from 1B's reserve), controls in the lower band |
| 320×568 phone | 296×420 | Scene |
| 844×390 landscape phone | Would be 184 px wide | Plain layout |
| 200% zoom of 1440×900 or 1280×720 | Would be 226 or 130 px wide | Plain layout |
| 32 px default text, any size tested | Would be under 16 rem | Plain layout |

Before the fix (first measured with the root font size doubled), enlarged text and zoom shrank the scene page to 54×76 px on a phone and to 2×2 px with zoom and enlarged text combined. The wrapping controls also pushed Next off 320–390 px screens. With the fix, every control is within the viewport, or reachable by scrolling where the controls follow the document (below 20em). The controls' centre points hit-test to themselves. The plain-layout band is opaque, and its padding and scroll padding keep the end of the document and focused links clear of it.

## Acceptance

| ID | Result |
| --- | --- |
| C1 | **Pass.** Next reveals document 2 and Previous restores document 1 (automated in both directions and at real speed by keyboard). At the first/last document the unavailable control is `aria-disabled`; pointer, dispatched click, Enter, and Space do nothing (automated). |
| C2 | **Pass on inspection.** Playback and deterministic frames show the sheet turning about its top attachment with flex. The cover stays open to the left and is not confused with the sheet. The rendered edge and the text layers agree within about 1 px. The camera is set only by the entrance pose, which is exactly the reading pose once complete; `turn` changes only the hinge and the sheet vertices (code inspection). |
| C3 | **Pass (automated).** Repeated pointer, dispatched, and keyboard requests during forward and reverse turns keep one transition and one committed document. Nothing starts after the turn settles. `data-sheet`, `data-document`, the visible heading, the position text, and the controls agree. |
| C4 | **Pass.** Focus stays on the control used, with a full-strength outline even when that control becomes unavailable (screenshot). During a turn both layers are `inert` and no document link is reachable (asserted). The copy has no IDs. Settled text is selectable (double-click asserted on document 2). The skip link during a turn settles it and focuses the document. |
| C5 | **Pass (automated).** Reduced motion preferred (plain layout) and switched on mid-turn; WebGL context loss mid-turn; failed scene load. Each leaves the committed document readable with working Previous/Next, and no later turn is animated where reduced motion applies. |
| C6 | **Pass with emulation limits.** Phone and desktop layouts, enlarged text, and 200% zoom are as tabled above. Resize mid-turn settles aligned on the committed document; shrinking past the readable size and growing back moves between surfaces (automated). A simulated hidden tab pauses the turn, which then completes (automated). A real tab switch in Playwright never reported `hidden`, so the turn completed in real time and was settled on return (`states/tabresume.json`). No physical devices were used. |
| C7 | **Pass locally.** Checks pass; the technique, commit point, focus, scroll, and slow-rendering policy are documented in [application setup](../application.md#documents-and-page-turn-wave-1c) and [D017](../decisions.md). Remote CI is unverified. |

## Audit fix: documents hidden while the module downloads

The audit of `c8212a9` found that the inline script set `data-paged` immediately, hiding document 2 before any navigation existed. With the experience module's download held, "Go straight to the document" and a reduced-motion load both showed only document 1, with no controls. The page recovered once the module loaded or failed, but a stalled download left document 2 unreachable.

Fix: only the booted module enables paging, together with working controls. Until then (no JavaScript, a pending or failed module, direct access or reduced motion before boot) every document is shown in order and the controls stay hidden. At boot the module starts on the document the reader is using: the one holding focus, or else the one at the top of the window. It keeps that document at the same screen position, so hiding the others does not move what is being read. The scene surface always opens on the first document.

Tests: the two entrance tests that hold the module download now assert that both documents are visible with no controls and no `data-paged`. After release they assert paging, document 1 current, and working Next. New tests cover a reduced-motion load with the module held, a reader scrolled to document 2 before boot (it stays current and within 2 px of its screen position, and Previous works), and a module that fails to download (all documents, no controls). With the original `c8212a9` application sources and these tests, the four held-download tests fail and the failed-download test passes; that path already recovered through the `DOMContentLoaded` fallback. All pass with the fix.

## CI fix: two timing-dependent tests

The first GitHub Actions run of PR #4 (Linux, software WebGL) failed 2 of 31 browser tests; application code was not at fault.

- **Selection.** The test double-clicked the heading's box centre, which can land on a word boundary depending on font metrics; CI selected nothing. A local check confirmed that settled text selects: double-clicking the centre of "daylight" selected it. The test now scrolls the heading into view (focusing the document's link had scrolled it away) and double-clicks the centre of the heading's longest word, asserting that exact word.
- **Slow rendering.** The test busy-waited 250 ms per real frame and expected three slow frames before the 1.75 s turn ended. On a slower renderer the turn finished first, so the fallback was not exercised (transition 3, not 4). It now uses the paused clock: three one-frame 200 ms jumps trigger the fallback independently of renderer speed. With slow detection disabled, the test fails.

After the fix: 31 passed on the GPU (1.1 min) and with software WebGL (4.5 min) locally. Remote CI has not been re-run; the fix is committed locally but not pushed.

## Deviations for review

1. **Blank sheet mid-lift.** V3 bends the text with the sheet. Here the text rides a flat mapping of the bent sheet and fades out between 40° and 70°, so the steep middle of the turn shows blank paper. The back of the sheet is blank, as in V3.
2. **Reverse bend.** V3 shows only the forward turn. The reverse is the same motion backwards with the free-edge lag flipped, so the edge trails the motion.
3. **Commit at request.** The position text and announcement change at the start of the turn, not when it lands.
4. **Readable-size fallback.** Landscape phones, 200% zoom, and enlarged default text read on the plain layout after the entrance. This is an accessibility fallback, not a chosen composition; the 16 rem threshold is a proposal.
5. **Controls take space.** The reading camera reserves room for the fixed controls. Desktop pages at 78% framing are unchanged; the phone page sits 38 px higher, and short viewports get a smaller page (or the plain layout). The 78% framing is otherwise unchanged.
6. **Slow devices.** Turns follow real time with no per-frame cap. After one slow settle (entrance or turn), later document changes skip the turn for the rest of the visit.

## Limits and unresolved issues

- **Two documents only.** The two V3 sheets support exactly two documents; more need more exported sheets.
- **Software WebGL.** Each test takes seconds at about 1.3 s per frame. The final run is the one recorded in `artifacts/wave-1c/swiftshader-run.txt`.
- **Tab resume.** Playwright's Chromium never reported a background tab as `hidden`, so real pause-and-resume is covered only by the simulated test. Behaviour in a user's browser outside automation was not observed.
- **Environment coverage.** Only Chromium on Windows was tested. Firefox, Safari, physical phones, touch hardware, and screen readers were not; the live-region wording is unverified with assistive technology.
- **Visual polish.** Materials, lighting, typography, turn timing, and the phone composition remain open design work. Sheet shadows fall only on the floor, not on the page beneath.
- **Licensing.** Asset and code licensing remain open.
