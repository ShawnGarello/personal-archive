# Implementation preparation

Status: plan following owner acceptance of Blender V3 on 2026-09-27. Wave 1A is implemented and locally verified, awaiting audit. Assign one wave at a time; completion requires its evidence, not merely a commit.

Use the [implementation contracts](contracts/README.md) for detailed scope, steps, behavior boundaries, and acceptance evidence. [Wave 1A](contracts/wave-1a.md) now has a [verification report](reviews/wave-1a.md). Wave 1B and 1C contracts remain provisional until their dependencies have been reviewed. Contract preparation does not start implementation.

## Baseline

Use [V3](../design/blender/README-v3.md) for the sequence: distant cabinet, deliberate activation, drawer opening, selected upright file extraction, rotation, outer cover opening left, close reading, and independent upward document turns. The cabinet leaves the pale reading background, and the camera stays stable while reading and turning pages.

Accept the storyboard as the reference for implementation. The textures, lighting, typography, placeholder content, exact duration, and final camera distance are not production approvals. Earlier vector/image studies are historical alternatives, not competing requirements.

## Preparation

The source scripts and review notes are versioned. Existing `.blend` files and videos remain in the design worktree's ignored artifacts directory; keep that worktree. A fresh checkout can rebuild the scenes using the documented entry point. Do not copy the private reference directory into a new worktree or application asset tree.

Choose the application stack in wave 1A and record a short architecture decision. Evaluate static delivery, semantic readable content, 3D integration, routing, test support, and maintenance. No backend, accounts, CMS, or contact-form service is currently required. Do not install a framework just to make this planning document concrete.

## Wave 1A: Browser foundation and content surface

Deliver a minimal application with fictional representative content that is usable before the 3D scene loads. Keep portfolio data separate from scene construction. Add documented setup commands and a lockfile, then type/lint/build checks to CI.

Define explicit state transitions for loading, idle, entering, reading, and page turning, including skip and failure paths. Choose one owner for camera/object animation so independent timelines cannot compete. A separate state library is optional.

Completion: a clean checkout runs and builds; one representative portrait document is readable with keyboard and on a phone; useful content survives a 3D-load failure; existing privacy checks remain effective. No private-source content is published. The chosen stack and limitations are documented.

## Wave 1B: Cabinet to readable content

Deliver a small browser slice using one cabinet, drawer, continuous folder, and the first document. Export or reconstruct only the scene elements needed for this slice. Preserve pivots and naming; select an animation/export strategy explicitly.

Investigate the most uncertain part early: stable, semantic, selectable text aligned with the physical page. Blender text meshes are visual references, not the production content system. The Blender lattice page deformation may require a browser-specific approach; do not assume an exported animation preserves it.

Compare V3's approximately 78% page-height framing with a closer 85-88% study. These are comparison targets, not fixed responsive requirements. Judge actual text at ordinary browser scale, reserving room for navigation and preserving useful folder edges. Do not enlarge text by shrinking an entire desktop screenshot onto a phone.

Completion: pointer/keyboard activation reaches the readable page; the cabinet exits the reading frame; text does not jump during the handoff; repeated activation cannot start competing transitions; direct-content/skip access works. Add a browser smoke test, record desktop/phone evidence, and report a reading-framing recommendation for review.

## Wave 1C: One reversible page turn and robust access

Deliver two fictional documents with the independent upward page turn, next/previous controls, and a stable reading camera. Resolve how the readable content behaves during the bend without duplicate interactive controls or invisible focus targets.

Completion: forward and reverse navigation maintain the correct page, repeated actions are handled deliberately, settled text remains selectable, focus is predictable, and reduced motion reaches the same content without the camera flight or curl. Verify failed asset loads, enlarged text, and phone layout. Add focused behavior tests as described in [testing](testing.md).

This finishes the first reviewable browser prototype. Do not expand to all content or final assets until the handoff and page mechanism work.

## Later phases

Phase 2 populates the portfolio with owner-approved content and implements project details, navigation, media enlargement, addressable URLs, and return behavior. Resolve content selection and licensing alongside the prototype; private notes remain private until separately approved.

Phase 3 refines assets, paper, photographs, typography, lighting, responsive composition, and motion within measured loading and rendering budgets. Approve a representative visual treatment before applying it throughout.

Phase 4 verifies the complete experience, documents reproducible setup and asset workflows, resolves licenses/credits, and deploys only when requested. Hosting and domain configuration remain undecided.

## Wave handoff and review

Each assignment names the wave, allowed scope, deliverables, and completion criteria. Use a branch and isolated worktree for concurrent editing. A report should provide the commit, runnable commands, verification results, representative visual evidence, and unresolved risks. Keep human commit attribution and review staged files before pushing. The audit session compares the result against the accepted storyboard and the assigned wave; it does not silently implement the next wave.
