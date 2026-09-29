# Implementation contracts

Status: prepared on 2026-09-27. These contracts define scoped assignments and review criteria; they do not authorize an implementation session by themselves. Waves 1A and 1B are integrated; Wave 1C is implemented and locally verified, awaiting audit. Refine later contracts with evidence from each reviewed wave.

The [implementation plan](../implementation-plan.md) explains the build order. These contracts explain what each assignment must deliver. The accepted [V3 storyboard](../../design/blender/README-v3.md) remains the visual and motion baseline. Final materials, typography, responsive composition, and exact timing remain open.

## Assignment order

| Contract | Dependency | Outcome |
| --- | --- | --- |
| [Wave 1A](wave-1a.md) | Explicit assignment | Runnable foundation, representative readable document, architecture decision, application CI |
| [Wave 1B](wave-1b.md) | Reviewed 1A foundation | Browser entrance from cabinet to selectable document text |
| [Wave 1C](wave-1c.md) | Reviewed 1B handoff | Two documents with forward/reverse turns and robust access |

Later content, polish, and release work stays in the [roadmap](../roadmap.md). Do not invent detailed later assignments before the prototype exposes their needs.

## Shared responsibilities

These are behavioral boundaries, not prescribed class names, libraries, or APIs. Wave 1A records their concrete implementation ownership.

| Concern | Responsibility | Boundary |
| --- | --- | --- |
| Content | Stable document IDs, reading order, headings, body, optional media descriptions and links | Independent of scene objects, frame numbers, and camera positions; fictional fixtures until public copy is approved |
| Reading surface | Semantic, selectable text, logical focus, scrolling, responsive layout | Content remains accessible when 3D is absent; hidden visual copies cannot create duplicate focus targets |
| Experience control | Active document, entrance/turn status, allowed actions, cancellation and completion | One authority coordinates transitions; stale animation/load callbacks cannot override a newer choice |
| Scene | Cabinet, drawer, folder, cover, sheets, camera and visual animation | Reports readiness/completion/failure; does not own portfolio copy or independently change navigation |
| Assets | Reproducible scene exports or construction, origins/pivots, sizes and provenance | Blender lattice deformation and rendered text are not assumed to survive export; source renders remain outside public bundles |

Prefer a small explicit implementation over a speculative framework. No generic plugin system, CMS, backend, or elaborate event bus is required.

## Interaction agreement

Use the following behavior as the prototype contract. Concrete state representation is chosen in 1A; enforce each behavior when its wave introduces it.

| Situation/action | Required result | First exercised |
| --- | --- | --- |
| Scene is loading | Useful HTML content access remains available | 1A content; 1B real loading |
| Scene is ready and visitor activates Open | One entrance sequence starts; no extra folder-selection click | 1B |
| Open is activated repeatedly during entrance | No restart, queue of entrances, or competing camera timelines | 1B |
| Visitor chooses direct content or skips entrance | Reach the reading content without waiting; late readiness/completion cannot restart the entrance | 1A direct access; 1B interruption |
| Scene fails or is unavailable | Same content remains readable; failure does not trap navigation | 1B, broadened in 1C |
| Reduced motion is enabled | Content is reachable without camera flight or page curl; enabling it mid-motion settles safely | Entrance in 1B; turns in 1C |
| Reader requests an adjacent document | Exactly one valid turn, then the requested document becomes active | 1C |
| Reader repeats navigation during a turn | Guard further turn requests until settled; do not accumulate a queue; announce/display busy state without a focus trap | 1C |
| Reader reaches first/last document | Unavailable direction is communicated and cannot wrap accidentally | 1C |
| Viewport changes or a tab resumes | Correct content and controls remain available; no frozen transition or unexpected replay | 1B entrance; 1C turn |

Reading holds are indefinite. Blender preview holds are not automatic navigation timers. Maintain a stable camera during reading and page turns. A skip/access path must not depend on the renderer succeeding.

## Working sequence for each assignment

1. Read root guidance, the required planning documents, and the assigned contract. Inspect Git status and preserve unrelated changes.
2. Work on a dedicated branch from the reviewed baseline. Use an isolated worktree if another session is editing. Never copy the private reference directory to it.
3. Resolve decisions needed for this wave, recording alternatives actually considered and the reason for selection. Verify current dependencies and APIs using official documentation when selecting the stack.
4. Implement only the assigned outcome. Record necessary deviations and their consequences; do not silently redesign the accepted storyboard or start the next wave.
5. Run applicable automated checks and inspect the browser at desktop and narrow-phone sizes. Record evidence and limitations, not just a claim that it works.
6. Review the staged diff and build inputs/outputs for accidental private material. Commit using the configured human identity with no AI attribution. Provide the handoff described below.
7. Review the result against its contract. Address material failures before merging or assigning dependent work. Pushing, opening a PR, merging, and deploying follow the actual session authorization; a contract is not blanket authorization for those actions.

Do not stop for routine implementation choices within the assignment. Ask only when a missing owner decision materially blocks it; fictional fixtures allow the first three waves to proceed without private content.

## Review evidence and documentation

Add a concise wave report under `docs/reviews/` when implementation completes. Include branch/commit, exact setup and check commands, pass/fail results, browser and viewport sizes, a result for each acceptance criterion, deviations, and remaining risks. Identify which observations are screenshots, actual playback, or automated assertions. Never report a planned check as performed.

Keep heavy local recordings/screenshots under ignored `artifacts/` and give their location in the report; these paths are not fresh-checkout deliverables. Provide reproducible steps for reviewers without local evidence. Share or track selected non-sensitive evidence only when its publication and storage are intentionally included in the assignment. Keep private source material out of all evidence.

Update setup documentation, the [decision log](../decisions.md), and [development journal](../devlog.md) as applicable. A new developer must be able to install and run the app without the original user's Downloads, local Blender scene, or private files. Code and asset licensing choices remain open and must be resolved before release.

Automated success does not establish visual approval. Use the [testing policy](../testing.md) alongside manual motion and reading review. Do not add arbitrary coverage targets or tests that merely restate markup.
