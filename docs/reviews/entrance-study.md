# Cabinet entrance study record

2026-09-30. Status: **browser experiment for owner review; not approved or integrated**. Phase 2 content work is not part of it.

Branch: `experiment/cabinet-entrance`, created from `origin/main` at `4c13a40` (merge of Wave 1C). Worktree: `C:/Users/teche/personal-archive-cabinet-entrance`. The branch is unpushed for audit; no pull request, merge, deployment, or private-file access occurred. Content is the existing fictional documents; the scene asset is the committed V3 export, unchanged.

## What the study changes

Each change has a study parameter that restores the previous behaviour, and a comparison page shows them side by side. See [D018](../decisions.md) and the [application notes](../application.md#entrance-study-camera-approach-timing).

| Commit | Change | Parameter restoring the previous behaviour |
| --- | --- | --- |
| `76a7c77` | The camera's approach to the cabinet takes 1.5 s instead of V3's 2.0 s (25% shorter). One shared clock eases back to V3's pace before the folder rotates. | `?approach=1` (also accepts 0.6–1) |
| `dbfae4d` | A mouse turns the idle arrival view about the cabinet, up to 7° sideways and 2.5° vertically, with easing. The approach releases it continuously. | `?orbit=off` |
| `35cfc4b` | Charcoal stage with a soft spotlight, a pool of light, and a blurred shadow. It cross-fades to the unchanged pale reading setup as the cover opens. Page chrome is legible on both backdrops. | `?look=pale` |
| `dcd66c4` | Local comparison page at `/compare/` | — |

`?look=pale&orbit=off&approach=1` reproduces current `main` pixel for pixel (below).

## Run the comparison

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:4321/compare/`. Frame A defaults to the current appearance and V3 timing; frame B to the full study. Each frame renders the ordinary page at 1280 × 800 and scales it to fit. "Open both" starts both entrances in the same task. The presets also isolate each change and offer 20% and 30% shorter approaches. "Open A alone" or "Open B alone" shows a page at full size, where the orbit, lighting, and timing are easiest to judge. Individual URLs work too, for example `http://127.0.0.1:4321/?approach=0.8`.

## Commands and results

Runtime: Node 24.21.0 and npm 11.19.0 (the local runtime at `C:/Users/teche/personal-archive-wave-1a/artifacts/tooling/`), Python 3.13.7, Playwright 1.63.0 with Chromium 153, Windows 11 x64, Intel Iris Xe. No dependencies were added or changed; `npm ci` reported zero known vulnerabilities.

```powershell
git fetch origin
git worktree add --no-track -b experiment/cabinet-entrance ../personal-archive-cabinet-entrance origin/main
# From the worktree, with Node 24 first on PATH:
npm ci
python scripts/check_repository.py
npm run check
npm run build
npm run test:browser
# Software WebGL (local CI approximation; config in ignored artifacts/):
npx playwright test -c artifacts/entrance-study/playwright.swiftshader.config.ts
```

| Check | Result |
| --- | --- |
| Repository check | Pass |
| Type check / lint | 0 errors, 0 warnings, 0 hints / pass with zero warnings |
| Build | Pass; the existing warning that the lazy three.js chunk exceeds 500 kB. The build now also emits `compare/index.html`. |
| Browser tests before changes | 31 passed (1.9 min, GPU) |
| Browser tests, hardware GPU (ANGLE/D3D11) | 46 passed (1.6 min): the 31 existing and 15 new |
| Browser tests, software WebGL (SwiftShader) | 46 passed (10.3 min; 6.8 min before the two cross-fade tests, which render about 45 frames each) |
| Remote GitHub CI | **Not run**: the branch is unpushed |

New tests: `entrance-timing.spec.ts` checks the pure clock without a page (identity at 1; arrival, continuity, never slower than V3, and V3 pace from the rotation onwards at 0.7, 0.75, and 0.8). `entrance-orbit.spec.ts` and `entrance-look.spec.ts` compare rendered frames and measured colours. Each new behaviour test was checked against a deliberate regression, and each regression made it fail: no touch filter on the orbit, no reset on reduced motion, snapping to centre on activation, removing the light chrome styles, and stopping the cross-fade at 99%. Two probes led to fixes in the tests themselves. The touch test first passed with the filters removed, because Chromium sends only one touch `pointermove` before `pointercancel` and `pointerleave`. The test now checks the frame while the finger is down, and the leave handler also ignores touch. The reading-view comparison first used a mean over the screen, which diluted small lighting changes, so it now counts pixels that differ.

The two cross-fade tests (desktop 1024 × 640 and phone 390 × 844) were added after review. They step the paused clock in 96 ms frames, below the 100 ms slow-rendering threshold, and sample every frame from 0.3 s before the fade to 0.3 s after it. On each frame they measure the status and skip-control text against the rendered pixels behind it, and the focus ring against the backdrop beside it. They also check that the header is hidden and that the samples run from charcoal to pale. Against the previous chrome they fail because the header is visible. With that check removed, the previous chrome's phone status measured 4.0:1 before the fade and 2.35:1 at its midpoint, and its header 2.32:1. They also fail with the status pill removed (4.31:1 mid-fade) or with a single-tone light focus ring (2.25:1).

## Evidence

Local and ignored under `artifacts/entrance-study/`. The scripts are there too (`capture.mjs`, `record.mjs`, `diff.mjs`, `sheet.mjs`, `crop.mjs`), and `results.md` holds the measured numbers. **Deterministic frames** use Playwright's paused clock stepped at 60 fps. **Playback** means real-time recordings. Viewports are emulated, not physical devices.

| Evidence | Type | Location |
| --- | --- | --- |
| Approach 1 vs 0.75 at matched real times | Deterministic frames | `timing/sheet.png` |
| Orbit at the pointer extremes; entrance from an orbited view | Deterministic frames | `orbit/crop.png`, `orbit/crop-vertical.png`, `orbit/entrance-sheet.png` |
| Stage iterations v1–v4 and final sequence | Deterministic frames | `look/`, `final/study-sheet.png` |
| Phone 390 × 844 | Deterministic frames | `phone/sheet.png` |
| Equivalence with current `main` | Pixel comparison | `baseline/`, `results.md` |
| Desktop and phone, study and current | Playback, frame timing | `motion/*.webm`, `motion/*.json` |
| Comparison page | Screenshots | `compare/` |
| Entrance chrome through the cross-fade, after the review fix | Deterministic frames; per-frame contrast | `fix/desktop-sheet.png`, `fix/phone-sheet.png`, `fade-contrast-fixed.txt` |

**Equivalence.** Current `main` was built from `git archive origin/main` in a scratch directory. It was compared with this branch at `?look=pale&orbit=off&approach=1` at idle and at 0.5, 1.5, 2.5, 3.5, 4.5, 5.2, and 5.75 s. No pixel differed at any moment. The settled reading view of the full study is also identical to `main`'s (6.0 s; no differing pixel). Captures are reproducible only up to a one-frame (16 ms) phase offset between runs. Repeating the same capture on one build differed by 3–8% of pixels in one run and not at all in another. A run-to-run offset can produce false differences but not false matches. After the contrast fix, the pale-look frames again matched the earlier captures exactly.

**Timing and frame rate** (real time, GPU, from Open to `reading`):

| Run | Open to reading | Median frame | p95 | Longest | Frames over 33 ms |
| --- | --- | --- | --- | --- | --- |
| Desktop 1440 × 900, study | 5.34 s | 16.7 ms | 16.8 ms | 33.3 ms | 0 |
| Desktop, current | 5.81 s | 16.7 ms | 16.7 ms | 16.8 ms | 0 |
| Phone 390 × 844, study | 5.39 s | 16.7 ms | 16.8 ms | 66.7 ms | 1 |
| Phone, current | 5.90 s | 16.7 ms | 16.7 ms | 66.7 ms | 1 |

The recordings were made for owner review. I judged motion from the deterministic frames and these measurements; I did not watch the recordings in a video player.

## Findings during the study

- **Approach.** Compressing only the camera would have kept the drawer at V3's pace. The camera would then arrive early and wait, and the entrance length would stay the same. A uniform speed-up would also have shortened the cover opening. The shared eased clock was chosen instead. In frames at matched times, the study reaches the open drawer about 0.35 s sooner. The drawer, files, and lift show the same poses, just earlier.
- **Orbit.** Pointing right reveals the shaded right side; pointing left reveals the lit left side. Vertical movement is subtle. Released during the approach, the orbited and centred entrances are identical by 1.5 s. No snap was visible or measured at activation.
- **Stage defect found and fixed.** The first version rendered only the charcoal backdrop, with no cabinet. Skipping the unlit key light's shadow update left its shadow map uncreated, and WebGL rejects every draw that samples a missing map. Both maps are now created on the first frame.
- **Backdrop blend.** Blending the backdrop in linear light jumped to mid-grey early (`look/v2` vs `look/v3`), so it now blends in sRGB. A lighter stage floor read as grey rather than charcoal around the pool, so it was darkened and the spotlight raised. The shadow was crisp, so the penumbra was widened and the shadow blurred.
- **Comparison frames.** At about 775 × 485, both pages correctly used the plain reading layout, the Wave 1C readable-size rule. The frames therefore render at 1280 × 800 and are scaled down.
- **Contrast through the cross-fade (found in review).** The first version switched the chrome's colours at the cross-fade's midpoint, while the backdrop faded continuously, and the tests only checked the two ends. Mid-fade, light text sat on mid-grey; on phones the header also crossed the lit cabinet. The review measured about 3.1:1 for the header and 3.4:1 for the status in a phone frame at 3.4 s. The fix stops relying on the backdrop: the header is hidden during the entrance, and the status and skip control carry their own dark surfaces. Focus rings are two-tone, and the scene's backdrop report (`data-backdrop`) was removed.

## For owner review

1. **Approach length.** 25% shorter feels quicker, but the drawer opening also shortens by 27% (1.33 → 0.97 s) because it overlaps the approach. Compare 20% (drawer 1.04 s) and 30% (0.90 s) on the comparison page.
2. **Orbit strength.** 7° sideways and 2.5° vertically is restrained by design. The view recentres when the pointer leaves the window. Keyboard, touch, and pen visitors see the still arrival view.
3. **Stage.** Charcoal `#232427`, a slightly warm spotlight, pool size, and shadow softness are first choices, not final lighting. The cross-fade (clip frames 100–124, about 2.9–3.9 s) passes through mid-grey while the cover opens.
4. **Chrome during the entrance.** Resolved after review: the header is hidden from Open until reading, and the status and controls keep at least 10:1 contrast throughout the fade (above). Whether the header should reappear sooner, or the pill and button styles should change, is a visual choice. `?look=pale` deliberately keeps `main`'s behaviour, including the header crossing the cabinet on phones (a known Wave 1B issue).
5. **Study aids in the build.** `/compare/` and the study parameters ship in the static build, like `?framing`. Remove them before publication, or when a direction is chosen.
6. **Reverting one change.** Reverting all the study commits, newest first, is clean and restores `main`'s tree exactly. This was checked again after the contrast fix. In code and tests, the comparison page and the contrast fix each revert without conflicts. So does the charcoal stage together with its contrast fix (newest first), because the fix rewrites the stage's chrome styles and tests. This record is updated by several commits, so reverting any one of them alone conflicts here; the documentation needs a manual edit anyway. The timing and orbit commits also share wiring lines with later commits: the scene options, their call in `main.ts`, and adjacent sections of the application notes. Reverting either alone leaves a few small conflicts to resolve by hand. Each change can also be switched off with its parameter, and changing a default is a one-line edit.

## Limits

- Chromium on Windows only. Firefox, Safari, physical phones, touch hardware (touch was emulated through the DevTools protocol), and screen readers were not tested.
- The orbit was driven by Playwright's pointer, not a person with a mouse.
- Only an integrated GPU was measured. During the cross-fade both lights update shadow maps; otherwise only the lit one does.
- The hidden-tab and slow-rendering paths of the entrance are unchanged and still pass their tests; the idle orbit has no dedicated hidden-tab test.
- Remote CI has not run.
