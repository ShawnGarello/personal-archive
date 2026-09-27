# Decision log

Keep confirmed direction distinct from recommendations. Update a superseded decision explicitly rather than silently rewriting its history.

## D001: Personal archive theme

Status: confirmed by the owner.

Use a cabinet, personal folder, pages, and Polaroid-style imagery to present the portfolio. The intended identity is a precise, curated personal archive with a case-file feeling. Cabinet material, palette, and lighting remain open.

## D002: Spatial transition reference

Status: confirmed by the owner.

Study Henry Heffernan's 3D presentation and camera transitions. Develop an original portfolio rather than reproducing that site's complete appearance or OS metaphor.

## D003: Public repository and process documentation

Status: confirmed; repository created.

Maintain the project at [ShawnGarello/personal-archive](https://github.com/ShawnGarello/personal-archive). Document how the experience is designed and built. License selection remains open; a public repository is not itself a reuse license.

## D004: Plan before implementation

Status: confirmed by the owner's current request.

Establish the portfolio's purpose, appearance, interactions, and phases before writing application code. Draft documents preserve progress without treating open design choices as final.

## D005: Audience

Status: confirmed by the owner during planning.

Speak to software engineering recruiters, fellow developers, and people interested in design and UI/UX, while welcoming a broad public audience. Do not make specialist technical knowledge a prerequisite for using the portfolio.

## D006: Private resume reference

Status: explicitly required by the owner.

Keep a local copy of the resume in the ignored `private/` tree and preserve the original. Neither the source PDF nor extracted text, rendered pages, or private summaries may enter tracked files, public assets, external generation tools, or deployment outputs. Derived portfolio copy requires separate owner review before publication.

This supersedes earlier proposals for a resume download. The current scope contains no public resume PDF. Any separate public version would require explicit authorization.

## D007: Camera storyboard first

Status: confirmed by the owner.

The owner agreed to a click-triggered main sequence and prioritizing camera choreography before detailed models. The folder moves without a visible hand; the camera follows it outward and settles for reading.

## D008: Isolated reading background

Status: confirmed by the owner.

The folder and pages must be presented against white/off-white, with no cabinet visible behind them. Exact transition technique and supporting-surface treatment remain open.

## D009: Human commit attribution

Status: explicitly required by the owner for Claude; shared Git guidance applies the same convention to all assistants.

Claude must not be an author or co-author. Use the configured human identity and exclude AI attribution trailers.

## Proposals awaiting resolution

| Proposal | Reason to investigate | Where to resolve |
| --- | --- | --- |
| One cabinet and one primary folder for the first release | Keeps the central journey achievable and coherent | Phase 0 scope |
| 3D environment with readable HTML content | Supports the physical metaphor and ordinary web navigation | Phase 1 handoff experiment |
| Direct work/contact access and section tabs | Supports visitors who want specific information quickly | Phase 0 experience |
| Lightweight CI and focused interaction tests | Checks breakage without a large test-maintenance burden | Phase 1 foundation |
| Editable 3D sources plus optimized web exports | Makes the modeling process learnable and reproducible | Asset workflow and licensing |

## D010: First Blender motion study

Date: 2026-09-26. Status: owner authorized the prototype; its specific design choices await review.

Create an editable Blender study on `design/archive-blender-draft` in a separate worktree and scene. Preserve the original scene and stop after presenting the first motion draft. This is a scoped exception to the earlier prohibition on starting 3D work; website implementation and detailed production assets remain outside the assignment.

The draft proposes one activation, a horizontal folder in a shallow upper drawer, a vertical lift followed by outward travel, and an opening cover that settles against an implied pale surface. It preserves the same folder, and camera framing removes the cabinet from the reading view. None of these proposed construction, timing or material choices supersedes the confirmed direction without owner review.

Large `.blend` and render outputs remain in ignored local `artifacts/`; rebuilding scripts and review notes enter ordinary Git. No external asset storage or publication is introduced. See [draft notes](../design/blender/README.md) for timing, evidence, limitations and unresolved choices.

## D011: Revised cabinet reference and upright extraction

Date: 2026-09-27. Status: owner-directed iteration; exact motion and final appearance await review.

The latest owner-supplied reference replaces the earlier green cabinet and steep arrival as the direction for this study. Use a tall, narrow neutral-metal cabinet, a centered modest downward view with the cabinet around half the image height, pale surroundings, and upright files with visible tabs. Extract one continuous portfolio file vertically before bringing it outward and rotating it for reading. Target four to five seconds from activation to reading, plus opening and final holds.

Version 1 was preserved before making an independent V2 scene and versioned outputs. The V2 proposal reaches reading in 4.75 seconds, with a 0.75-second arrival and two-second reading hold. See [V2 review notes](../design/blender/README-v2.md) for render evidence, geometric checks and unresolved choices. This authorization remains limited to a 3D design iteration.

## D012: Separate cover and document hinges; content-focused reading

Date: 2026-09-27. Status: owner-directed V3 study; exact construction and timing await review.

Retain V2's liked cabinet composition, upright filing and extraction. The outer cover opens left around a side spine. Portrait documents attach at their top edge and turn upward independently, with modest paper flex. After opening, approach and center the document stack; allow intentional cropping of the empty cover. Lock the camera during the demonstrated page turn and keep the cabinet outside the reading composition.

V3 proposes storing the portrait folder on its long edge to preserve V2's drawer footprint, rotating it after extraction, then adding a one-second content approach. Separate versioned outputs preserve V2. The close page occupies approximately 78% of frame height. These rendered proportions and the two reading holds are review evidence, not proof of browser readability or interaction usability. See [V3 review notes](../design/blender/README-v3.md). No website implementation is authorized by this iteration.

## Future entry format

Record: decision, status, context, alternatives actually considered, reason, consequences, and evidence. Add dates when decisions are made. Avoid inventing retrospective experiments to justify a choice.
