# Archive motion drafts

**Current iteration: [version 3 review notes](README-v3.md).** V3 retains the liked V2 cabinet and extraction, adds portrait documents with an independent flexible top-edge page turn, and moves the reading camera closer. Scripts end in `_v3.py`; separate outputs live in `artifacts/archive-motion-draft/v3/`.

[Version 2 review notes](README-v2.md), scripts and outputs remain preserved. Use each version's own rebuild commands.

Version 1's `.blend`, MP4, stills, checks and script snapshots are preserved in `artifacts/archive-motion-draft/v1/`. The original unversioned outputs and the original scripts below also remain unchanged. Do not use the V1 render/package commands below for V2.

## Version 1 record

Status: **proposal for owner review**, 2026-09-26. This is a Blender design study. No website or production asset pipeline is included.

## Deliverables and storage

Local outputs live in `../../artifacts/archive-motion-draft/`:

- `archive-motion-draft.blend`: editable geometry, native text, packed synthetic image placeholders, materials, lights, camera, keyframes and timeline markers.
- `archive-motion-preview.mp4`: full 10-second sequence, 24 fps, 640 × 400, H.264.
- `stills/`: seven 960 × 600 representative PNGs.
- `representative-frames.jpg`: six-frame review board.
- `video-contact-sheet.jpg`: samples decoded from the finished video at four frames per second.
- `checks.json`: clearance and camera bounds results across all 240 frames.
- `sequence/`: lossless preview frames, including opening and closing holds.

Large binary sources and renders remain local in the ignored `artifacts/` directory. Ordinary Git stores the rebuilding scripts, review notes and artifact manifest. No files are uploaded, and no LFS service is configured. Keep the worktree to retain the delivered binaries; a fresh checkout must rebuild them. The screenshot reference is used visually, not copied into the repository or packed into Blender.

Branch: `design/archive-blender-draft`. Worktree: `C:/Users/teche/personal-archive-blender-draft`. No merge into `main`.

## Open and edit

Open the `.blend` file and choose scene `Archive_Motion_Draft`. The pre-existing `Scene` with its cube, light and camera is preserved separately. The draft contains 72 objects, grouped through named parent assemblies. Select these parents in the Outliner to edit movement:

| Assembly | Purpose |
| --- | --- |
| `CABINET \| fixed assembly` | Stationary cabinet shell and lower drawers |
| `DRAWER \| slide Y` | Active upper tray, front, label, handle and moving slides |
| `SLIDES \| telescoping intermediate` | Intermediate slides moving at half drawer travel |
| `FOLDER \| continuous hero` | Same folder, three pages and image previews for the entire animation |
| `COVER \| left spine hinge` | Cover rotation about its left edge |
| `CAMERA \| follow and settle` | Orthographic framing, translation and restrained angle change |

Use the camera view and play frames 1–240. Timeline markers identify the major beats. All bevel modifiers remain editable. No external models, online images, geometry caches, simulation baking or private documents are required. The two Polaroid-style previews contain packed synthetic landscape placeholders, not actual portfolio photographs.

## Proposed timing

Times are approximate; frame 1 is the beginning of the exported clip.

| Frames | Time | Proposed action |
| --- | --- | --- |
| 1–24 | 0–1.0 s | Closed cabinet hold; frame 24 simulates one click |
| 24–66 | 1.0–2.7 s | Drawer extends; camera approaches and shifts toward it |
| 66–94 | 2.7–3.9 s | Folder lifts vertically clear of the tray |
| 94–122 | 3.9–5.0 s | Folder advances at full lift height until its rear edge clears the drawer front |
| 122–166 | 5.0–6.9 s | Folder descends toward the pale ground as the camera follows |
| 135–197 | 5.6–8.2 s | Cover opens through 176 degrees; camera adjusts left to include the spread |
| 197–240 | 8.2–10.0 s | Stable reading hold with cabinet entirely outside the frame |

One activation starts the whole proposed sequence. Nothing represents a second required click. Bezier curves use clamped handles, and the camera maintains its general direction without an orbit or cut. The folder stays horizontal while traveling. Its arrival on an implied continuous pale surface is a proposal, not an approved destination treatment.

## Reference and visual intent

The owner-supplied `Screenshot 2026-09-24 130717.png` informed elevated miniature framing, soft studio shadows, pale surroundings and recognizable manufactured objects. This draft uses a muted green enamel cabinet, warm card, paper layers, label holders and simple metal pulls. Earlier generated concepts are not treated as approved designs. The complete cabinet appears on arrival; it intentionally leaves the shot as attention transfers to the folder.

## Verification and limits

- Blender MCP connected to Blender 5.1.2, protocol 11. Initial scene inspection found the default three objects; they remain in their original scene.
- Corrected an initially tight arrival crop, protruding simplified rails, reversed box normals, insufficient cover/page separation, and a descent path that would have crossed the drawer front.
- A world-bounds check samples all 240 frames for intersections between folder meshes and cabinet/drawer meshes, near/far clipping, folder framing after extraction, and cabinet visibility during the reading hold.
- Final check: zero bounds intersections, zero clipping failures, zero folder framing failures, zero cabinet bounds in the reading hold; minimum folder framing margin is about 8.6% of the corresponding image dimension.
- Inspected 40 frames decoded from the delivered MP4 at quarter-second intervals, plus seven full-resolution stills. The folder remains continuous, the cabinet has left the composition by approximately 5.75 seconds, and the cover opens into a stable spread without an obvious framing jump. This was sampled visual inspection, not real-time playback in a video player.
- The builder also completed successfully in a fresh background Blender session, saving a separate verification file. The delivered closed cover clears the photo borders by 0.0295 scene units.
- The checks are conservative geometric checks, not a rigid-body simulation. They supplement rendered inspection; they do not prove interaction usability.
- Native page text establishes hierarchy and remains editable. The small preview is for motion review; short labels are clearer in the full-resolution stills. Actual portfolio reading, mobile layout and semantic web text have not been tested.

## Choices for review

1. Is the deliberately paced 8.2-second entrance appropriate, or should the eventual site reach content sooner?
2. Does the horizontal archive-tray folder feel right, or should a later study test upright hanging files?
3. Should the folder settle onto this pale implied floor, an explicit writing surface, or a suspended reading stage?
4. Is the near-overhead reading angle preferable to a fully front-facing page presentation? The empty inside cover reserves space but has no approved content.
5. Cabinet proportions, green enamel, card color, typography and final project imagery remain open. Desktop composition only; no phone or reduced-motion study is included here.

## Rebuild

Use Blender 5.1.2. Run from the worktree root in PowerShell. The builder refuses to overwrite an existing draft scene. Running it in a fresh background session preserves that session's default scene and saves a separate file.

```powershell
$blenderExe = 'C:/Program Files/Blender Foundation/Blender 5.1/blender.exe'
& $blenderExe -b --factory-startup --python design/blender/build_archive.py
& $blenderExe -b artifacts/archive-motion-draft/archive-motion-draft.blend --python design/blender/check_motion.py
& $blenderExe -b artifacts/archive-motion-draft/archive-motion-draft.blend --python design/blender/render_preview.py -- stills
& $blenderExe -b artifacts/archive-motion-draft/archive-motion-draft.blend --python design/blender/render_preview.py -- sequence
python -m pip install Pillow imageio-ffmpeg
python design/blender/package_preview.py
```

The renderer copies identical hold frames to avoid redundant rendering. MP4 encoding uses the FFmpeg binary supplied by `imageio-ffmpeg`. Scripts resolve output paths relative to the worktree. The source file packs its image data and opens independently of these Python packages.
