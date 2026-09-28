# Wave 1C: Reversible page turn and robust access

Status: prepared for refinement after Wave 1B review; not assigned. Depends on the accepted browser entrance and readable handoff.

## Outcome and scope

Extend the prototype to two fictional documents with an independent upward page turn and its reverse. The outer folder cover remains a separate left-opening mechanism. Keep the settled reading camera fixed.

Read the root guidance, planning documents, [shared contract](README.md), previous wave reports and architecture decisions, and [V3 construction notes](../../design/blender/README-v3.md).

## Steps

1. Select a browser-compatible sheet deformation technique and record why it fits the existing handoff. Preserve a top-edge attachment and restrained flex. Do not assume the Blender lattice exports as a working web animation.
2. Add a second fixture document, active-document identity, next/previous controls, and boundaries. Define the commit point where the visible document becomes current; cancellation must reconcile the visual sheet, semantic content, and navigation to the same document.
3. Implement forward/upward and reverse turns without moving the camera. Guard repeated actions while a turn is active; do not queue extra turns. Provide a deliberate focus policy, such as retaining a persistent navigation control and announcing the new document. Hidden/turning copies must not expose duplicate interactive elements.
4. Keep settled text selectable and let long/enlarged content scroll. Document what happens to reading scroll position when changing documents. Provide the same document navigation without curl for reduced motion or scene failure. A preference change or rendering failure during a turn must settle deterministically.
5. Exercise keyboard, touch-sized controls, phone layout, 200% zoom, resize, and background-tab resume. Add focused behavior tests for document identity, both directions, boundaries, repeated input, reduced motion, and forced rendering failure.
6. Record normal-speed forward/reverse motion, representative frames, check results, and remaining technical limitations. Do not replace manual visual review with a screenshot-only assertion.

## Acceptance and evidence

| ID | Required result | Evidence |
| --- | --- | --- |
| C1 | Next reveals document two and Previous restores document one; first/last boundaries behave correctly | Observable browser tests and manual navigation |
| C2 | Paper turns around the top attachment with no visible cover confusion or content obstruction; camera remains fixed | Actual playback plus implementation verification of camera ownership |
| C3 | Rapid repeated actions cause neither queued flips nor mismatched visual/semantic documents | Behavior tests through forward and reverse transitions |
| C4 | Keyboard focus remains visible/predictable, hidden layers cannot receive focus, and settled text is selectable | Manual keyboard/text inspection and targeted assertions |
| C5 | Reduced motion and scene failure, including mid-turn changes, leave correct readable content and working navigation | Injected failure/preference tests with explicit settled-document assertions |
| C6 | Phone, enlarged text, resize and tab resume remain usable without clipping, dead controls, or frozen turns | Recorded viewport/zoom/resume checks; identify real devices versus emulation |
| C7 | Current checks pass and the page technique/limitations are reproducible for the next implementer | Setup/architecture updates and wave report |

## Deferred work and review outcome

No real resume-derived content, full portfolio sections, project deep links, final asset polish, or deployment. Finishing this wave produces the first complete interaction prototype, not the finished portfolio. Review entrance continuity, readable framing, page motion, access paths and performance evidence before assigning Phase 2. Record unresolved visual decisions without treating them as accepted.
