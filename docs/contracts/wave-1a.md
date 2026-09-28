# Wave 1A: Browser foundation and content surface

Status: implemented and locally verified on `implement/wave-1a`, 2026-09-27; awaiting audit before integration. See the [wave report](../reviews/wave-1a.md). Later waves remain unassigned.

## Outcome and scope

Deliver a reproducible website foundation with one fictional portrait document that can be read independently of a 3D renderer. The purpose is to establish the content surface and application boundaries before implementing the entrance.

Read [AGENTS.md](../../AGENTS.md), [concept](../concept.md), [experience](../experience.md), [roadmap](../roadmap.md), [implementation plan](../implementation-plan.md), [testing](../testing.md), and the [shared contract](README.md).

## Steps

1. Select a stack suited to static delivery, semantic HTML, later 3D integration, and focused browser testing. Record the chosen runtime/package manager and supported versions, alternatives actually considered, animation ownership, and the proposed content-to-scene boundary. Choose sensible defaults within scope; do not request approval for each dependency. Do not install multiple competing frameworks for comparison.
2. Scaffold the minimal app with a lockfile, ignore rules, documented install/dev/check/build/preview commands, and a clear public asset boundary. Keep private files and Blender artifacts outside every public copy/import path. Avoid adding a 3D dependency until it has an actual role.
3. Create a small independent content fixture with a stable document ID and representative heading, paragraphs, a project summary, and a usable link. Label fictional content clearly. Include enough text to expose overflow; use invented examples, not paraphrases of the resume.
4. Build the reading surface: selectable HTML, heading hierarchy, visible keyboard focus, readable spacing and natural scrolling. Give desktop a provisional portrait-page composition with a pale surround. Let a phone and enlarged text reflow; do not lock all content into a fixed paper height. This is a layout study, not final typography or folder art.
5. Document how loading, idle, entering, reading, and turning will be represented, including skip/failure behavior and who owns transitions. Implement only state behavior needed by this wave. Do not create simulated entrance delays, fake loading percentages, nonfunctional cabinet controls, or an unused state framework.
6. Extend CI with a locked dependency install, type checking, linting, and a production build. Preserve repository checks. Document exact local equivalents and use no deployment credentials or publish steps.
7. Verify the criteria below and write the handoff report. Stop before implementing the cabinet or camera.

## Acceptance and evidence

| ID | Required result | Evidence |
| --- | --- | --- |
| A1 | A clean checkout installs, runs and builds with documented commands and no local-only inputs | Fresh-checkout or equivalent isolated-copy verification with exact runtime and commands |
| A2 | Fictional content appears without waiting for any renderer; its text can be selected and copied | Browser inspection and short description of the renderer-independent path |
| A3 | Reading and links work by keyboard, with visible focus and logical heading order | Manual keyboard sequence and observations |
| A4 | At a representative desktop viewport and a 390px-wide phone viewport, content is readable without horizontal page scrolling; 200% browser zoom does not clip text or controls | Viewport/zoom records and screenshots; distinguish viewport emulation from physical-device testing |
| A5 | Repository, type, lint and build checks pass locally; workflow includes the application checks | Commands/results; GitHub run when a push is authorized, otherwise explicitly mark remote CI unrun |
| A6 | Public/build paths contain only intended fixtures and assets; no private reference or derivatives were used | Reviewed staging and build configuration/output inventory; do not read private material to create this evidence |
| A7 | Architecture choice, setup and state responsibilities are understandable to the next implementer | Decision entry, setup documentation, and wave report |

Automated interaction tests may be added for meaningful custom logic if introduced. A fake renderer-failure test is unnecessary when this wave has no renderer. Actual failure injection belongs to the integrated scene in 1B/1C.

## Deferred work

No cabinet model/export, entrance animation, page curl, all-section navigation, project detail routes, real personal copy, final visual system, backend, hosting, or deployment. A representative page is enough to finish this wave.

## Assignment prompt

The owner can give the following prompt to an implementation session. Sending it assigns Wave 1A only.

```text
Implement Wave 1A of Personal Archive in C:\Users\teche\personal-archive. Read AGENTS.md and docs/contracts/wave-1a.md, then follow its required reading and the shared contract. Inspect the working tree first and branch from the reviewed documentation baseline. Preserve unrelated work; use a separate worktree if another session is editing.

Choose and document the application stack, create the minimal runnable foundation and one clearly fictional readable document, and add the application checks required by the contract. Make routine technical decisions autonomously within that scope. Preserve the V3 storyboard as the reference for future integration; this assignment does not implement the cabinet, camera animation, or page turn.

Do not access, copy, publish, or serve private resume material or its derivatives. Use fictional content. Follow the configured human Git identity and include no AI author, co-author, or generated-by attribution.

Verify every Wave 1A acceptance criterion and document exact commands, browser evidence, decisions, and limitations in a wave report. Commit the scoped changes locally and report the branch, commit, how to run the app, check results, and anything needing review. Do not push, merge, deploy, or proceed to Wave 1B as part of this assignment.
```
