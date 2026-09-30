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
| Application checks and focused interaction tests | Extends the repository CI established in D013 as behavior is implemented | Phase 1 contracts |
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

## D013: Accept V3 storyboard and prepare implementation

Date: 2026-09-27. Status: accepted by the owner for integration into main.

Use V3's cabinet, upright extraction, sideways outer cover, portrait documents, independent upward sheet turn, and stable content-focused reading as the implementation baseline. Acceptance covers the storyboard, not final textures, lighting, typography, content, or responsive behavior. Test a modestly closer page view in the first browser prototype rather than extending Blender exploration indefinitely.

Merge the design scripts and review record; preserve local binary artifacts and the design worktree. Add inexpensive repository checks now. Add application type/lint/build checks with the app foundation, and behavior tests with the entrance/page interactions. Detailed first waves are in [implementation preparation](implementation-plan.md). Website code is not part of this integration task.

## D014: Prepare scoped implementation contracts

Date: 2026-09-27. Status: owner requested documentation and contracts before implementation; contracts prepared, application work not started.

Translate the first three waves into [assignments with acceptance evidence](contracts/README.md). Prepare Wave 1A for assignment and keep dependent contracts subject to findings from browser work. Separate content, readable HTML, experience control, scene animation and asset responsibilities without prescribing untested APIs or selecting a stack in a documentation session.

The proposed implementation workflow uses one reviewed wave at a time, fictional fixtures, focused checks, and a reproducible report. Stack selection belongs to Wave 1A; scene transfer and HTML alignment to Wave 1B; browser paper deformation to Wave 1C. These technical choices remain open. Preparing these contracts does not authorize implementation, deployment, or publication of personal content.

## D015: Static HTML foundation and future transition ownership

Date: 2026-09-27. Status: selected within the owner's Wave 1A assignment; implementation awaits audit before integration.

Choose Astro with strict TypeScript and plain CSS, using Node 24 LTS and npm with a committed lockfile. Generate the fictional document as HTML during build, with no hydrated component or runtime dependency on a renderer. Separate typed content from the reading component and future scene construction. The app lives under `app/`; repository references and local artifacts are outside its public asset path. See [setup and architecture](application.md).

Alternatives considered without installing them: Vite with vanilla TypeScript would keep later scene code simple, but would need a separate templating step to generate content HTML; a client-rendered React/Vite app would introduce hydration and a client content dependency without useful state in this wave. Astro supplies static templates now and a later client-script integration point. This choice does not select a scene or animation library, prove HTML-to-3D alignment, or require an additional UI framework later.

The future experience controller will own navigation and transition IDs, with one scene adapter owning camera/object animation. Loading, idle, entering, reading, turning, cancellation, failure, and reduced-motion behavior are documented proposals for 1B/1C. Wave 1A simply renders reading content immediately; no simulated delay, unused state framework, or controls for missing behavior.

Official guidance checked during selection: [Astro installation](https://docs.astro.build/en/install-and-setup/), [static components](https://docs.astro.build/en/basics/astro-components/), [TypeScript checking](https://docs.astro.build/en/guides/typescript/), [Astro configuration](https://docs.astro.build/en/reference/configuration-reference/), [Vite filesystem restrictions](https://vite.dev/config/server-options.html#server-fs-deny), [Astro ESLint integration](https://ota-meshi.github.io/eslint-plugin-astro/user-guide/), [Node release support](https://github.com/nodejs/Release), and [setup-node](https://github.com/actions/setup-node). npm registry package metadata was also checked: Astro checker and TypeScript ESLint support TypeScript 6, so this wave deliberately avoids the registry's newer TypeScript 7. Exact installed versions and results belong in the wave report.

The appearance remains provisional: a white portrait surface on a pale neutral surround, system fonts, underlined links, and natural scrolling. No final palette or typography decision is implied. No private source or derivatives informed the invented content.

## D016: Exported V3 entrance with HTML mapped onto the paper

Date: 2026-09-28. Status: selected within the owner's Wave 1B assignment; implementation awaits audit. Final framing, materials, and phone composition remain open.

Context: Wave 1B needs the accepted V3 motion in the browser and the Wave 1A document on the settled paper, without duplicate or rasterized readable text.

Alternatives considered: (1) rebuilding the cabinet and keyframes in TypeScript avoids a binary asset, but must re-derive V1-to-V2 scaling and Blender's auto-clamped Bézier curves by hand, which risks drift from the accepted motion; (2) exporting everything, including page text, would ship non-semantic text meshes; (3) rendering the HTML into a texture would duplicate the readable copy and blur text. Selected: a scripted Blender glTF export of the cabinet, drawer, folder, cover and sheet transforms, and the camera, with V3's sampled animation for frames 18–156. The browser adds lights, a shadow-only floor, and a viewport-specific reading camera. three.js 0.186 renders; its `AnimationMixer` is driven by one adapter-owned timeline. The same semantic document is mapped onto the paper with a CSS homography while moving and placed untransformed when settled.

Consequences: V3 names, parents, scale, and hinge pivots are preserved and regenerable (`design/blender/export_web_v3.py`); a 669 KB GLB (125 KB gzip) is committed with a provenance manifest. The reading camera is perpendicular to the page instead of V3's ~80° tilt, so the page is an exact rectangle and the settled text is crisp. This deviation needs review. HTML text is drawn above the canvas and cannot be occluded by scene objects, which constrains the Wave 1C turn. Long documents scroll inside the page. Evidence and framing study: [Wave 1B record](reviews/wave-1b.md).

## D017: Page turn with CPU sheet flex and two HTML layers

Date: 2026-09-28. Status: selected within the owner's Wave 1C assignment; implementation awaits audit. Final paper materials, timing, and the small-viewport reading composition remain open.

Context: Wave 1C needs V3's upward turn around the top attachment, and its reverse, in the browser, while the HTML text (drawn above the canvas since D016) stays the only readable copy and never appears over the wrong sheet.

Alternatives considered: (1) a vertex shader or morph targets for the bend would need a custom material or a re-export for a 910-vertex sheet that is cheap to deform on the CPU; (2) rendering document text into a texture on the 3D sheet (SVG `foreignObject` or a canvas copy) would add a rasterized duplicate, cross-browser rendering and tainting risks, and blurry text; (3) splitting the HTML into strips, each with its own transform, would follow the curve but duplicate the document several times; (4) a CSS-only 3D flip of the HTML would not move the rendered paper. Selected: rotate the exported hinge with V3's curve and reproduce the lattice's quadratic free-edge lag on the sheet's vertices. The text on the lifting sheet rides it by the existing homography and fades out by 70°. The document beneath is clipped below the sheet's projected lowest point. `main#reading` holds the committed document; an inert, `aria-hidden`, ID-free copy supplies the other layer during the turn only.

Consequences: navigation commits when accepted, so every interruption settles on one document; requests during a turn are ignored rather than queued. The camera is untouched by turns. Mid-lift the sheet shows blank paper. That is an approximation of V3, where the text bent with the sheet, and it needs visual review. The two V3 sheets support exactly two documents. The scene's reading page is replaced by the plain layout when it would be narrower than 16 rem (200% zoom, enlarged text, landscape phones). This is an accessibility fallback, not a composition decision, and it needs owner review. Details: [application setup](application.md#documents-and-page-turn-wave-1c); evidence: [Wave 1C record](reviews/wave-1c.md).

## D018: Cabinet entrance study (faster approach, idle orbit, charcoal stage)

Date: 2026-09-30. Status: **proposal on `experiment/cabinet-entrance`, awaiting owner review**. It does not change V3's accepted sequence on `main`, and it is separate from Phase 2 content.

Context: the owner asked for a faster-feeling camera approach, a restrained mouse orbit while the cabinet is idle, and a charcoal, spotlit entrance. The reading view must stay the established pale one, with no cabinet behind it. The existing appearance must remain available for comparison.

Alternatives considered and choices:

- **Approach timing.** (1) A uniform speed-up would also shorten the cover opening and reading approach. (2) Retiming only the camera would keep the drawer at V3's pace. The camera would then arrive early and wait, the entrance would not get shorter, and the follow camera would need its own clock. (3) Selected: one shared clock that runs faster from activation and eases back to V3's speed before the folder rotates. The approach takes 1.5 s instead of 2.0 s. The drawer opening also shortens, from 1.33 s to 0.97 s.
- **Orbit.** Turning the camera in place would slide the cabinet off centre, so the camera turns about the point on the arrival axis nearest the cabinet's centre. The input filter is `pointerType === 'mouse'` rather than a hover media query, so hybrid devices orbit only with their mouse. Activation freezes the angle, and the approach releases it smoothly, so the entrance starts from the visitor's view.
- **Stage.** A radially faded floor disc was considered. Fog matching the backdrop was selected, because both are applied in output colour space and meet without a seam. Blending the backdrop in linear light was tried first; it looked grey early, so the blend is in sRGB. Page chrome flips at the cross-fade's midpoint instead of blending its colour, because the buttons carry their own backgrounds and stay legible on either side.

Consequences: each change has a study parameter restoring the previous behaviour (`?approach=1`, `?orbit=off`, `?look=pale`). With all three, current `main` is reproduced pixel for pixel. The settled reading view is identical in both appearances. A second shadow-casting light is added; each light skips shadow updates while unlit. The study parameters and the `/compare/` page ship in the build until a direction is chosen. Open questions and evidence: [entrance study record](reviews/entrance-study.md).

## Future entry format

Record: decision, status, context, alternatives actually considered, reason, consequences, and evidence. Add dates when decisions are made. Avoid inventing retrospective experiments to justify a choice.
