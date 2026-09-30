# Checks and CI

## Available now

Run `python scripts/check_repository.py` from the repository root. The GitHub Actions workflow runs the same command for pull requests, pushes to main, and manual dispatches.

It checks tracked file paths for private directories, local artifacts, resume PDFs, and environment files; parses Python without executing it; parses JSON; and validates relative Markdown file links. It examines tracked files only. It does not read the local private directory.

This is a guard against specific accidental inclusions, not a general secret scanner. Renamed private documents or personal details copied into otherwise permitted files still require staged-diff review. Ignore rules also do not prevent a future build from copying private files.

The application job installs locked dependencies with `npm ci`, then runs `npm run typecheck`, `npm run lint`, and `npm run build`. A browser job installs Chromium and runs `npm run test:browser`: Playwright tests of the entrance and document navigation against the production build. See [application setup](application.md) for the runtime and exact local equivalents. The pipeline does not install Blender, render movies, validate external URLs, or check Markdown anchors.

Browser tests assert observable state (`<html data-phase data-surface data-transition data-scene-load>`, focus, visibility, geometry of the settled page) and wait for conditions, not sleeps. Where a test must reason about time (skip, repeated activation, reduced-motion change, hidden tab, a turn in progress), it uses Playwright's controllable clock. Page-turn tests jump the paused clock with `fastForward`: turns follow real elapsed time, so one jump reaches the same pose as many small frames and software WebGL stays fast. Slow rendering is simulated by delaying each animation frame by 250 ms. Hosted runners have no GPU, so WebGL runs in SwiftShader and real-time entrances settle early through the slow-rendering path rather than completing; completion itself is exercised on GPU runs. A local software-mode run of the 13 tests took 2.4 minutes against 43 seconds on a GPU. Remote CI results are reported only after a run is observed.

## Add tests alongside their behavior

| When | Automated checks to add | Manual evidence |
| --- | --- | --- |
| App foundation, wave 1A | Locked dependency install, type checking, linting, production build | Clean checkout setup and useful fallback content |
| Entrance and reading, wave 1B | Implemented: keyboard and pointer activation to readable content, repeated activation, skip during entrance, load failure, missing WebGL 2, late load after direct access, direct access while the module downloads, slow rendering, hidden-tab pause, reduced motion (initial and mid-entrance), resize during entrance | Compare V3 sequence and inspect content alignment |
| Page turning and access, wave 1C | Implemented: both directions with committed document identity, first/last boundaries, repeated input in both directions, real-time keyboard navigation and selection, per-document scroll position, reduced motion (preferred and mid-turn), context loss mid-turn, failed load, slow rendering, hidden tab, skip link and resize mid-turn, readable-size fallback, no JavaScript, every document readable while the module downloads or after it fails, reader's place kept when paging starts | Page flex, no obscured content, phone, 200% zoom and enlarged-text review |
| Complete portfolio, phase 2 | Project deep links, browser Back, focus restoration, asset/link failures | Real approved content and enlarged project media |
| Asset/scene changes | Run the applicable Blender checks and inspect their reports locally | Representative frames and motion review after affected changes |

Keep browser tests focused on observable behavior. Avoid fixed sleep-based timing assertions, implementation-mirroring tests, and arbitrary coverage targets. Expand test coverage when new behavior or failures justify it.

## First prototype review

Each [wave contract](contracts/README.md) maps acceptance criteria to evidence. Record actual results and limitations in its wave report. Remote CI is only reported as passed after observing a successful run; local checks alone do not establish GitHub status.

Verify the entrance, the first readable page, one forward and reverse turn, keyboard navigation, reduced motion, and a forced 3D failure. Review desktop and a narrow phone viewport. Record real browser/device, content size, load measurements, and rendering performance before setting final performance budgets.

GitHub Actions checks initially provide visibility; branch protection and required-check policies are separate settings and are not configured by this workflow. No CI job deploys the site or uploads local Blender artifacts.
