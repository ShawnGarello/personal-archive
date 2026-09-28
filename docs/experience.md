# Experience and visual brief

Status: the V3 storyboard is accepted as the implementation baseline as of 2026-09-27. Visual polish, final content, exact reading framing, and browser behavior remain to be established. See [V3 notes](../design/blender/README-v3.md) and the [implementation plan](implementation-plan.md).

## Visual premise

The owner selected a precise, curated personal archive with the feeling of a case file. Objects carry meaning: a label identifies the owner, a folder organizes their work, photographs preview projects, and annotations explain what matters.

Proposed visual interpretation: neatly arranged folders, consistent label placement, deliberate page layouts, and photographs organized around each project. The case-file reference supplies structure; it does not yet establish a detective narrative, classified stamps, or a particular historical period.

Recruiters should be able to scan the work and background quickly, while fellow developers and UI/UX enthusiasts can explore the details and making-of material. Both paths belong to the same portfolio.

The cabinet is the dominant object in the entrance composition. The reading view isolates the folder and pages against a clean white/off-white background, with no cabinet visible behind them. Use V3's camera sequence and geometry as the baseline: follow the folder outward, let the cabinet leave the composition, then approach the reading page. Final materials, lighting, accent palette, typography, and background finish remain open.

Explore the cabinet, folder, paper, photograph borders, tabs, and handwriting as a coherent family. Textures must survive close inspection without making text harder to read. Real project images supply the content; decorative photographs must not stand in for evidence of work.

## Storyboard baseline

| Scene | What the visitor sees and does | Transition or result |
| --- | --- | --- |
| Arrival | Cabinet, owner's approved name and role, clear opening action, work/contact shortcuts | A subtle settling movement is optional; the main sequence waits for a deliberate click |
| Open drawer | Activate the handle or its equivalent button | Drawer movement and camera approach overlap |
| Select folder | A clearly labeled upright personal folder rises without a visible hand | The initial activation continues through extraction; camera follows outward as the cabinet leaves the composition |
| Open folder | Outer cover opens to the left, revealing portrait documents | Camera approaches and centers the document stack; empty cover may be cropped |
| Browse pages | Documents turn upward around a separate top attachment | Camera stays fixed; reading holds last until the visitor navigates |
| Inspect project | Activate a project photograph or title | Read a complete project view and enlarge media |
| Return | Close the project view or choose to return to the cabinet | Preserve the page location; avoid replaying the entire entrance |

V3 uses an implied pale supporting surface. Preserve the isolated reading composition in the prototype; detailed surface treatment remains provisional. Earlier shelf/desk scene alternatives are not the current baseline.

## Reading layout

Proposed organization:

- Introduction: a concise bio and one meaningful portrait or artifact, if available.
- Projects: selected work with image previews, short captions, and direct access to details.
- Experience: an owner-approved readable summary. No private source document or resume download.
- Contact: clear public contact links.

Use one portrait document as the primary reading surface. The side cover can be cropped. Adapt the scene to readable content on desktop and phone rather than shrinking desktop text to fit. Compare the current roughly 78% page-height framing with a modestly closer view in the browser prototype.

Polaroid-style frames work as previews. Detailed screenshots should also have an uncropped, enlarged view. Project details need room for the problem, the owner's role, key choices, outcome, and relevant links.

## Proposed interaction rules

- Opening and selection use deliberate activation; hover may provide feedback but never be required.
- Tabs allow direct section access; sequential page turns are an additional path.
- Keep camera movement restrained once reading begins.
- Do not require dragging, precision clicks, free-camera control, or sound to navigate.
- Make transition handling explicit: repeated activation must not start competing animations.
- Project navigation should support shareable URLs and browser Back behavior.
- Returning from a project should restore the originating page and keyboard focus.
- If sound is added, provide an explicit control; the experience must work without it.

## Loading, fallback, and accessibility

| Condition | Proposed behavior |
| --- | --- |
| 3D assets loading | Show identity, useful content access, and honest loading feedback |
| 3D unavailable or failed | Offer the same portfolio content in a readable layout with optional retry |
| Reduced motion | Skip the camera journey and page curl; use instant changes or brief fades |
| Keyboard use | Provide labeled controls, visible focus, logical navigation, and a way to leave every view |
| Small screen | Recompose the entrance, use readable single pages, and provide comfortable touch targets |
| Long content or enlarged text | Allow natural reading and scrolling without clipped text |
| Missing optional media | Preserve the text and links; do not leave a broken image or blocked page |

Accessibility is an implementation requirement to verify, not a claim of current conformance.

## Technical approach to investigate

A candidate approach combines 3D objects and movement with semantic HTML for readable content. The key experiment is the handoff from the physical folder to the reading surface: alignment, text clarity, focus, and navigation must remain coherent.

Blender is the established storyboard tool. Framework, animation library, hosting, browser page-turn technique, and production asset pipeline are not selected yet. Do not assume the prototype's lattice deformation or text meshes transfer directly to a browser.

Static environment details may suit baked lighting. Moving drawers and pages need separate consideration so shadows do not appear attached to the wrong surface. Test this before polishing all assets.

## Next validation

Prepare the scoped browser prototype described in the implementation plan, when assigned. Validate readable content and navigation against the V3 composition before detailing all assets. Final colors, fonts, textures, and lighting can be refined after this handoff works.

Follow [the exploration plan](exploration.md). Use fictional placeholder content in public or externally generated concept images; do not include private resume text, screenshots, or contact details.
