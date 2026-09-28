# Checks and CI

## Available now

Run `python scripts/check_repository.py` from the repository root. The GitHub Actions workflow runs the same command for pull requests, pushes to main, and manual dispatches.

It checks tracked file paths for private directories, local artifacts, resume PDFs, and environment files; parses Python without executing it; parses JSON; and validates relative Markdown file links. It examines tracked files only. It does not read the local private directory.

This is a guard against specific accidental inclusions, not a general secret scanner. Renamed private documents or personal details copied into otherwise permitted files still require staged-diff review. Ignore rules also do not prevent a future build from copying private files.

The current pipeline does not install Blender, render movies, validate external URLs, check Markdown anchors, or test a website that does not exist yet.

## Add tests alongside their behavior

| When | Automated checks to add | Manual evidence |
| --- | --- | --- |
| App foundation, wave 1A | Locked dependency install, type checking, linting, production build | Clean checkout setup and useful fallback content |
| Entrance and reading, wave 1B | Browser smoke test for activation to readable content; meaningful transition-state tests if needed | Compare V3 sequence and inspect content alignment |
| Page turning and access, wave 1C | Forward/back page selection, repeated activation, keyboard, reduced motion, simulated 3D-load failure | Page flex, no obscured content, phone and enlarged-text review |
| Complete portfolio, phase 2 | Project deep links, browser Back, focus restoration, asset/link failures | Real approved content and enlarged project media |
| Asset/scene changes | Run the applicable Blender checks and inspect their reports locally | Representative frames and motion review after affected changes |

Keep browser tests focused on observable behavior. Avoid fixed sleep-based timing assertions, implementation-mirroring tests, and arbitrary coverage targets. Expand test coverage when new behavior or failures justify it.

## First prototype review

Each [wave contract](contracts/README.md) maps acceptance criteria to evidence. Record actual results and limitations in its wave report. Remote CI is only reported as passed after observing a successful run; local checks alone do not establish GitHub status.

Verify the entrance, the first readable page, one forward and reverse turn, keyboard navigation, reduced motion, and a forced 3D failure. Review desktop and a narrow phone viewport. Record real browser/device, content size, load measurements, and rendering performance before setting final performance budgets.

GitHub Actions checks initially provide visibility; branch protection and required-check policies are separate settings and are not configured by this workflow. No CI job deploys the site or uploads local Blender artifacts.
