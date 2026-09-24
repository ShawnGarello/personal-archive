# Phases and waves

Status: proposed roadmap. Phase 0 is active; implementation has not started. Later waves may change when design exploration or prototypes reveal new information.

A phase delivers an outcome. A wave is a small, reviewable piece of that outcome; it does not imply parallel agents or separate worktrees. Complete dependencies before beginning dependent work. No schedule estimate is committed yet.

## Phase 0: Define the portfolio

Purpose: establish what the site communicates, contains, and looks like before implementing it.

| Wave | Deliverable | Completion criteria |
| --- | --- | --- |
| 0A: Purpose and content | Audience, owner positioning, content inventory, release scope | Primary audience and intended visitor action are clear; initial projects are identified |
| 0B: Visual direction | Reference board and rough cabinet, drawer, and reading compositions | Materials, lighting, typography direction, and desktop/mobile hierarchy form a coherent direction |
| 0C: Experience | Storyboard, navigation, fallback behavior, initial constraints | The full journey is understandable, including direct content access and reduced motion |

Current state: initial written drafts exist. The owner identified software engineering recruiters, fellow developers, and UI/UX enthusiasts as audiences, while welcoming everyone. A precise, curated case-file feeling is confirmed. Content selection and specific visual compositions remain open. A written concept alone does not complete visual design.

## Phase 1: Prove the central interaction

Depends on Phase 0's agreed direction. Purpose: resolve the largest technical risks using simple geometry and representative content.

| Wave | Deliverable | Completion criteria |
| --- | --- | --- |
| 1A: App foundation | Selected stack, reproducible setup, lightweight CI | A clean checkout installs and builds; type and lint checks pass |
| 1B: Cabinet to folder | One drawer, one folder, coordinated camera transitions | The sequence works with pointer and keyboard; repeated activation cannot corrupt state |
| 1C: Folder to content | A readable sample page and project view | The 3D/HTML handoff works, including mobile, reduced motion, and 3D failure |

Do not create the entire polished asset set before proving the handoff. Record experiments and rejected approaches with their reasons.

## Phase 2: Build the complete portfolio

Depends on the successful interaction prototype. Purpose: make the full content journey useful.

| Wave | Deliverable | Completion criteria |
| --- | --- | --- |
| 2A: Content structure | Introduction, projects, approved experience summaries, public contact | Content is approved for publication; no private source documents or fabricated achievements |
| 2B: Navigation and media | Tabs, page controls, project URLs, enlarged images | Direct entry and browser Back work; returning preserves reading context and focus |
| 2C: Complete access paths | Keyboard, phone layouts, fallback content | Core information can be reached through every supported access path |

## Phase 3: Develop the visual craft

Depends on a complete functional journey. Purpose: realize the selected art direction without degrading usability.

| Wave | Deliverable | Completion criteria |
| --- | --- | --- |
| 3A: Final assets | Cabinet, folder, paper, photographs, lighting | Assets match the selected direction, have recorded provenance, and export reproducibly |
| 3B: Motion and detail | Tuned camera, drawer, cover and page movement | Transitions feel continuous and remain interruptible or safely guarded |
| 3C: Performance | Asset optimization and measured device checks | Loading and animation meet budgets selected and recorded during the prototype phase |

This phase refines art direction established in Phase 0; it is not the first time appearance is considered.

## Phase 4: Prepare the public release

Depends on the finished experience. Purpose: make the site reliable and the repository useful to others.

| Wave | Deliverable | Completion criteria |
| --- | --- | --- |
| 4A: Verification | Focused browser tests and manual review | Core journey, direct links, keyboard, reduced motion, mobile and failure fallback work |
| 4B: Open-source documentation | Setup, architecture, asset workflow, credits, license, contribution notes | A fresh checkout is reproducible; reuse terms are explicit for code and assets |
| 4C: Publication | Chosen hosting, metadata, preview images, final links | Deployed build is checked and public content is accurate |

## Testing policy

- README-only planning does not need an application CI pipeline.
- Add type checking, linting, and a production build when app code arrives.
- Add a browser smoke test once the core journey is stable enough to exercise.
- Unit-test meaningful state or navigation logic, especially interrupted or repeated actions.
- Verify visual quality and motion manually; passing tests do not establish that transitions feel good.
- No arbitrary coverage target and no tests that merely repeat component markup.

## Documentation in every phase

For each meaningful milestone, update the journal with the outcome, evidence, unresolved questions, and next step. Record consequential decisions when they happen. Add screenshots, short clips, or diagrams when they explain something that prose cannot; keep heavy source assets out of ordinary Git until their storage approach is chosen.
