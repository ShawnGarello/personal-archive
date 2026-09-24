# Experience and visual brief

Status: proposed storyboard for discussion. This is a written sketch, not an approved visual design or implementation specification.

## Visual premise

The owner selected a precise, curated personal archive with the feeling of a case file. Objects carry meaning: a label identifies the owner, a folder organizes their work, photographs preview projects, and annotations explain what matters.

Proposed visual interpretation: neatly arranged folders, consistent label placement, deliberate page layouts, and photographs organized around each project. The case-file reference supplies structure; it does not yet establish a detective narrative, classified stamps, or a particular historical period.

Recruiters should be able to scan the work and background quickly, while fellow developers and UI/UX enthusiasts can explore the details and making-of material. Both paths belong to the same portfolio.

The cabinet is the dominant object in the entrance composition. In reading mode, the open folder becomes dominant and the environment recedes. Exact materials, lighting, palette, typography, and the surrounding space remain undecided.

Explore the cabinet, folder, paper, photograph borders, tabs, and handwriting as a coherent family. Textures must survive close inspection without making text harder to read. Real project images supply the content; decorative photographs must not stand in for evidence of work.

## Proposed storyboard

| Scene | What the visitor sees and does | Transition or result |
| --- | --- | --- |
| Arrival | Cabinet, owner's approved name and role, clear opening action, work/contact shortcuts | Content access is available while 3D prepares |
| Open drawer | Activate the handle or its equivalent button | Drawer movement and camera approach overlap |
| Select folder | A clearly labeled personal folder inside the drawer | Activate it to lift the folder toward the reading position |
| Open folder | Folder settles on a surface and its cover opens | Camera settles; introduction and navigation become readable |
| Browse pages | Use tabs or page controls to explore the portfolio | Short page transitions preserve context |
| Inspect project | Activate a project photograph or title | Read a complete project view and enlarge media |
| Return | Close the project view or choose to return to the cabinet | Preserve the page location; avoid replaying the entire entrance |

The resting surface for the folder is an open design choice. A pull-out shelf or nearby writing surface is a possibility, not a requirement. Decide this before detailed modeling so the object's movement has a coherent destination.

## Reading layout

Proposed organization:

- Introduction: a concise bio and one meaningful portrait or artifact, if available.
- Projects: selected work with image previews, short captions, and direct access to details.
- Experience: an owner-approved readable summary. No private source document or resume download.
- Contact: clear public contact links.

Desktop may use an open spread if actual content fits comfortably. Mobile should use one readable page at a time. The scene must adapt to the reading layout rather than shrinking desktop text to fit the phone.

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

Blender is a candidate tool for creating editable models and exported web assets. Framework, animation library, hosting, page-turn technique, and asset pipeline are not selected yet.

Static environment details may suit baked lighting. Moving drawers and pages need separate consideration so shadows do not appear attached to the wrong surface. Test this before polishing all assets.

## Next design artifacts

Prepare a small reference board and rough compositions for the cabinet view, drawer view, and reading view, including a phone version. Compare visual directions before selecting final colors, fonts, or detailed models. The next step is visual exploration, not a production interface.

Follow [the exploration plan](exploration.md). Use fictional placeholder content in public or externally generated concept images; do not include private resume text, screenshots, or contact details.
