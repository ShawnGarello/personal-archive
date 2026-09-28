# Archive motion draft — version 3

2026-09-27. **Accepted storyboard baseline following owner review.** This iteration covers folder construction, reading composition and one page turn. Final polish and browser behavior remain open. No website implementation or production asset work. See [implementation preparation](../../docs/implementation-plan.md).

## Open the draft

All binary outputs remain local in the ignored `artifacts/archive-motion-draft/v3/` directory:

- `archive-motion-v3.blend`: editable scene `Archive_Motion_V3`, 114 objects, native text, packed synthetic image placeholders, mesh paper, lattice and keyframes.
- `archive-motion-v3.mp4`: full entrance and page turn, 960 × 600, 24 fps, H.264, 12.25 seconds.
- `reading-page-01.png` and `reading-page-02.png`: full-resolution 1600 × 1000 reading views.
- `stills/`: nine representative renders; `representative-frames.jpg`: overview.
- `video-review/`, `motion-review-*.jpg`, `video-contact-sheet.jpg`: samples decoded from the delivered MP4.
- `checks.json`: evaluated geometry and framing results for all 294 frames.

The branch is `design/archive-blender-draft` in `C:/Users/teche/personal-archive-blender-draft`. Earlier outputs and scripts are preserved. Ordinary Git stores scripts, notes and `artifact-manifest-v3.json`; binaries are neither committed nor uploaded. Retain the worktree to retain the renders. A fresh checkout must rebuild V1, then V2, then V3 if the local source files are absent.

## Construction and composition

V2's cabinet, neutral finish, centered arrival, five neighboring files, drawer travel and selected-file extraction remain the baseline. The portrait folder is stored on its long edge, preserving the existing storage footprint, then rotates into portrait after lifting clear. Its dimensions stay constant throughout.

The outer folder is 1.76 × 2.38 local units. Its front cover swings left by 176 degrees about the left spine. The documents are 1.48 × 2.10, visibly taller than wide. Two small metal straps explain their separate top attachment. The first sheet rotates upward by 178 degrees around that attachment. A keyed lattice adds modest free-edge lag to the thin mesh, editable text and image together. The turned sheet comes to rest beyond the top of the reading area; the second document stays visible.

After the cover opens, the camera approaches and centers the paper. The page occupies about **77.9% of image height**, with a minimum page margin of **10.1%**. Its top edge is 94.4% as wide on screen as its bottom edge, giving mild perspective. The camera is about 80 degrees above the surface and remains fixed throughout both reading holds and the turn. The left cover deliberately extends beyond the left image edge; the turned sheet deliberately extends beyond the top. Neither is a reading-document framing failure.

The owner reference `Screenshot 2026-09-27 100956.png` informed the relationship between close content and the surrounding physical object. Its monitor/interface was not copied. A local, unpacked reference datablock is optional; rendering does not depend on it. All headings, paragraphs and landscape placeholders are fictional; no private material was accessed.

## Proposed timing

Approximate times at 24 fps; frame 1 starts the exported clip.

| Frames | Time | Action |
| --- | --- | --- |
| 1–18 | 0–0.75 s | Closed cabinet; pause simulates waiting for entrance activation |
| 18–50 | 0.75–2.1 s | Drawer opens while camera approaches |
| 50–70 | 2.1–2.9 s | Selected file lifts clear of tray and neighbors |
| 70–103 | 2.9–4.3 s | Outward travel and rotation toward portrait reading |
| 103–132 | 4.3–5.5 s | Cover opens left as folder reaches its pale reading position |
| 132–156 | 5.5–6.5 s | Camera moves closer and centers the documents |
| 156–204 | 6.5–8.5 s | First reading hold; end simulates page-turn activation |
| 204–246 | 8.5–10.25 s | One flexible sheet flips upward; camera stays locked |
| 246–294 | 10.25–12.25 s | Second reading hold |

V2's cover-open arrival remains at approximately 5.5 seconds. V3 adds a one-second content approach before locking the camera, so activation to the final close reading view is approximately 5.75 seconds. This is a pacing proposal, not a usability result. No additional entrance click is implied.

## Verification

- Blender MCP connected to the existing Blender 5.1.2 session. V2 was inspected and cloned into a separate scene with independent data/actions. The original scene and earlier draft scenes remain available.
- Evaluated meshes include bevels, paper thickness and lattice deformation. Checks cover all 294 frames for selected-folder/cabinet/neighbor intersections, cover/document intersections, page/page intersections, ground penetration, camera clip planes, extracted-folder framing, complete reading-page framing and final cabinet exclusion.
- Corrected a small spine/tray-bottom intersection before the final render. Final results contain zero reported failures. The camera matrix is unchanged from frame 156 onward. A grid of 117 rays per final-hold frame detects no turned-sheet obstruction of the second page's content area.
- Deliberate cover cropping and turned-sheet cropping are recorded separately. Attachment hardware contact is intentional and excluded from folder/cabinet intersection tests. Surface tests and sampled rays are not a mechanical simulation or proof of every possible overlap.
- The builder completed in a fresh background Blender session using the preserved V2 source, writing a separate verification file.
- Inspected the finished MP4 through 147 decoded samples at 12 samples per second, plus full-resolution stills and additional turn frames. No obvious extraction intersection, cover/page clipping, framing jump or settled second-page obstruction was visible. The reading background contains neither cabinet nor cabinet shadow. This was dense sampled visual review, not real-time playback in a video player; exact pacing still needs owner review. The two-second holds demonstrate activation pauses and are not intended to limit actual reading time.
- V2's 13 recorded artifact hashes still match its preserved manifest. Concurrent background render jobs stalled; the final outputs were completed sequentially from the saved scene.

## Established direction and remaining choices

**Owner-directed:** retain V2 cabinet/filing/extraction; use a sideways outer cover and portrait documents attached at the top; make content dominant; keep the cabinet out of the reading view and the camera stable during page turning.

**Provisional in this draft:** exact folder size, long-edge storage, fastening straps, bend profile, hold durations, camera approach duration, type sizes, colors and implied pale supporting surface. The image placeholders are synthetic layout aids. Final photography and detailed typography remain outside this pass.

**Requires a later browser test:** responsive page scaling and text readability; semantic/selectable content and keyboard focus; pointer/touch activation and repeat/interrupted turns; long content and navigation; reduced-motion/skip behavior; loading cost and frame rate; synchronization of 3D paper with any HTML content. Blender's rendered text and camera do not establish these behaviors. No controls or browser code have been implemented.

## Edit / rebuild

Use camera view in `Archive_Motion_V3`, frames 1–294. Timeline markers label activation and reading beats. Named assemblies:

| Object | Edit |
| --- | --- |
| `V3 \| FOLDER \| continuous hero` | Preserved V2 translation and extraction tilt |
| `V3 \| FOLDER \| portrait orientation` | Long-edge storage to portrait rotation |
| `V3 \| COVER \| left spine hinge` | Sideways outer-cover opening |
| `V3 \| PAGE 01 \| top attachment hinge` | Upward sheet rotation |
| `V3 \| PAGE FLEX \| editable lattice` | `Free edge lag` shape key, shared by paper and content |
| `V3 \| PAGE 02 \| fixed document` | Second-page content and placement |
| `V3 \| CAMERA \| follow and settle` | Entrance and final content approach |

From the worktree root, with V2's local source present:

```powershell
$blenderExe = 'C:/Program Files/Blender Foundation/Blender 5.1/blender.exe'
& $blenderExe -b --factory-startup --python design/blender/build_archive_v3.py
& $blenderExe -b artifacts/archive-motion-draft/v3/archive-motion-v3.blend --python design/blender/check_motion_v3.py
& $blenderExe -b artifacts/archive-motion-draft/v3/archive-motion-v3.blend --python design/blender/render_preview_v3.py -- stills
& $blenderExe -b artifacts/archive-motion-draft/v3/archive-motion-v3.blend --python design/blender/render_preview_v3.py -- sequence
python design/blender/package_preview_v3.py
```

Packaging uses the existing Pillow and `imageio-ffmpeg` installation. The builder refuses to replace a V3 scene in the current session; a fresh rebuild writes only V3 outputs. Preserve any manual V3 edits before rebuilding. Earlier versions are never overwritten.

Render the stills and sequence sequentially. Append `resume` after `sequence` only to continue an interrupted render of the same saved scene; it skips existing PNGs. Omit it after scene changes.
