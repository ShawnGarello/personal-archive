# Wave 1B: Cabinet to readable content

Status: assigned 2026-09-28; implemented and locally verified, awaiting audit. See the [Wave 1B record](../reviews/wave-1b.md). Use the selected stack and reviewed content foundation, not a second scaffold.

## Outcome and scope

Implement one continuous entrance from the cabinet to the first readable document, preserving the accepted [V3](../../design/blender/README-v3.md) choreography. Use simple geometry/materials sufficient to judge composition and motion. Final asset polish is deferred.

Read the root guidance, planning documents, [shared contract](README.md), Wave 1A report/architecture decision, and [Blender source instructions](../../design/blender/README.md). Preserve existing local scenes and videos.

## Steps

1. Choose and document the minimum scene transfer method: exported assets, browser-built geometry, or a justified combination. Record stable object names, coordinate conversion, units, parent relationships, hinge pivots, camera mapping, and which system owns each animation. Preserve separate drawer, folder, cover and sheet transforms. Record asset provenance and regeneration commands; do not commit an entire render directory.
2. Build the arrival and one activation path: approach/open drawer, lift the upright file clear, follow it outward, rotate for reading, open the cover left, and settle near the portrait document. Keep one visually continuous folder with no visible hand. Avoid adding another selection click.
3. Connect scene readiness, completion, failure and cancellation to the shared interaction behavior. Provide keyboard-equivalent activation and content access during loading/entrance. Handle reduced motion for the entrance now, including a preference change during movement.
4. Align the existing semantic content surface with the settled paper. Document when readable HTML appears and how visual continuity is maintained. Do not rasterize the only readable text or leave duplicate interactive layers. Focus must land predictably when the visitor enters or skips to reading.
5. Compare roughly 78% and 85-88% viewport-height paper framing on desktop with identical text. Inspect phone composition separately. Record a recommendation based on readability, controls, and visible folder edges; these ratios are study targets, not universal CSS requirements.
6. Add focused browser smoke coverage for entrance completion, repeated activation, skip during entrance, and a failed scene load. Use observable completion/state conditions rather than fixed sleeps. Record motion evidence, asset sizes, and basic loading/rendering observations before proposing budgets.

## Acceptance and evidence

| ID | Required result | Evidence |
| --- | --- | --- |
| B1 | One activation follows V3 to an isolated reading view; cabinet and its shadow are absent there | Actual browser playback, representative frames, and any deviations recorded |
| B2 | Drawer/file/cover clear each other without visible collisions or teleporting; reading camera settles | Motion inspection at normal speed; targeted frame inspection where needed |
| B3 | Settled HTML is selectable, aligned, readable, and keyboard usable; handoff has no visible jump | Desktop/phone captures and manual text/focus inspection |
| B4 | Repeated Open cannot compete; skip settles content and late callbacks cannot replay the entrance | Browser behavior tests and manual check |
| B5 | Failed assets and reduced motion reach useful content; resize/tab resume cannot leave the interface stuck | Failure injection, preference-change and viewport/resume observations |
| B6 | Framing comparison yields a reviewable recommendation, not an assumed approval | Same-content desktop comparisons plus narrow-phone reading evidence |
| B7 | A fresh checkout can obtain/build only the intended scene inputs; all current checks pass | Asset/setup instructions, provenance, build inventory and test results |

Do not claim exact V3 equivalence from a successful export alone. Browser playback is the evidence. If readable alignment requires changing accepted choreography, document the conflict for review instead of disguising it as an approved redesign.

## Deferred work and handoff

Do not add page-turn deformation, full content, project routing, final textures, or deployment. Write the wave report required by the shared contract. Identify the actual scene-to-HTML technique and its limitations so Wave 1C can build on it. Resolve material handoff failures before expanding the portfolio.
