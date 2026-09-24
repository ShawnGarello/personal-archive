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

## Proposals awaiting resolution

| Proposal | Reason to investigate | Where to resolve |
| --- | --- | --- |
| One cabinet and one primary folder for the first release | Keeps the central journey achievable and coherent | Phase 0 scope |
| 3D environment with readable HTML content | Supports the physical metaphor and ordinary web navigation | Phase 1 handoff experiment |
| Direct work/contact access and section tabs | Supports visitors who want specific information quickly | Phase 0 experience |
| Lightweight CI and focused interaction tests | Checks breakage without a large test-maintenance burden | Phase 1 foundation |
| Editable 3D sources plus optimized web exports | Makes the modeling process learnable and reproducible | Asset workflow and licensing |

## Future entry format

Record: decision, status, context, alternatives actually considered, reason, consequences, and evidence. Add dates when decisions are made. Avoid inventing retrospective experiments to justify a choice.
