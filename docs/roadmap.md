# Phases and waves

Status: V3 storyboard accepted on 2026-09-27; Waves 1A and 1B are integrated; Wave 1C is implemented and locally verified, awaiting audit. Follow the [detailed first-wave plan](implementation-plan.md) and [testing policy](testing.md). Later waves may change based on browser evidence.

A phase delivers an outcome. A wave is a small, reviewable piece of that outcome; it does not imply parallel agents or separate worktrees. Complete dependencies before beginning dependent work. No schedule estimate is committed yet.

Detailed [implementation contracts](contracts/README.md) define the first three waves. Audit the Wave 1C result and review the complete prototype before assigning Phase 2.

## Phase 0: Define the portfolio

Purpose: establish what the site communicates, contains, and looks like before implementing it.

| Wave | Deliverable | Completion criteria |
| --- | --- | --- |
| 0A: Purpose and content | Audience, owner positioning, content inventory, release scope | Primary audience and intended visitor action are clear; initial projects are identified |
| 0B: Camera and experience | Camera storyboard, object movement, navigation, fallback behavior | Click-triggered movement leads continuously to an isolated pale reading view; cabinet leaves the composition |
| 0C: Visual direction | Reference board and rough cabinet, drawer, and reading compositions | Materials, lighting, typography direction, and desktop/mobile hierarchy support the established storyboard |

Current state: audience, archive concept, and the V3 camera/cover/page storyboard are established. Content approval and final visual polish remain open and can proceed alongside the technical prototype. Phone composition and readable web content must be proved in the browser; they are not established by the Blender draft.

## Phase 1: Prove the central interaction

Depends on the accepted V3 storyboard. Purpose: resolve the largest technical risks using limited scene geometry and representative fictional content.

| Wave | Deliverable | Completion criteria |
| --- | --- | --- |
| 1A: Foundation and reading surface | Selected stack, accessible sample content, type/lint/build CI | Clean checkout runs; useful content is available independently of 3D |
| 1B: Entrance to content | V3 entrance and a stable handoff to readable text | Pointer/keyboard activation, skip access, framing comparison, and browser smoke test |
| 1C: Reversible page turn | Two documents, navigation, reduced motion, failure handling | Forward/back and repeated actions work; camera stays stable; phone reading is verified |

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

- Repository CI now checks tracked-file boundaries, local documentation links, Python syntax, and JSON. It does not render Blender or test application behavior.
- Add type checking, linting, and a production build when app code arrives.
- Add a browser smoke test once the core journey is stable enough to exercise.
- Unit-test meaningful state or navigation logic, especially interrupted or repeated actions.
- Verify visual quality and motion manually; passing tests do not establish that transitions feel good.
- No arbitrary coverage target and no tests that merely repeat component markup.

## Documentation in every phase

For each meaningful milestone, update the journal with the outcome, evidence, unresolved questions, and next step. Record consequential decisions when they happen. Add screenshots, short clips, or diagrams when they explain something that prose cannot; keep heavy source assets out of ordinary Git until their storage approach is chosen.
