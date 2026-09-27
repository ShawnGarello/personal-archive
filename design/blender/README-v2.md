# Archive motion draft — version 2

Completed 2026-09-27. Status: design iteration for owner review. Branch: `design/archive-blender-draft`; worktree: `C:/Users/teche/personal-archive-blender-draft`.

## Deliverables

Local, ignored directory: `artifacts/archive-motion-draft/v2/`.

- `archive-motion-v2.blend`: editable `Archive_Motion_V2` scene, plus the preserved V1 scene. Native geometry, text, materials, lights and animation; 104 objects in V2.
- `archive-motion-v2.mp4`: complete 7.5-second H.264 preview, 960 × 600, 24 fps.
- `stills/0001.png`, `0050.png`, `0070.png`, `0082.png`, `0106.png`, `0132.png`, `0180.png`: arrival, open drawer, upright lift, outward move, rotation, reading and final hold.
- `arrival-comparison.jpg`: V1 and V2 at equal image dimensions, without cropping or normalizing the cabinet size.
- `representative-frames.jpg`: six representative views.
- `video-contact-sheet.jpg` and `motion-review-1.jpg` through `motion-review-3.jpg`: samples decoded from the actual MP4.
- `checks.json`: geometric and framing evidence for all 180 frames.

V1 was copied to `artifacts/archive-motion-draft/v1/` before editing. Its `.blend` and MP4 hashes match the original files and original manifest. V1 stills, checks, contact sheets and scripts were also copied. Original unversioned outputs remain intact. Binary deliverables stay local and ignored; scripts, notes and `artifact-manifest-v2.json` enter ordinary Git. No merge or upload is part of this iteration.

## What changed

The owner-supplied `ChatGPT Image Sep 26, 2026, 02_15_45 PM.png` directly informed the tall, narrow neutral-metal cabinet, frontal camera, rectangular label holders, handles, pale surroundings and upright file arrangement. It was inspected before modeling and loaded as an unpacked local reference image in Blender. It is optional when opening the delivered file; the render does not depend on it.

Arrival now uses a centered 55 mm perspective camera, approximately 15 degrees downward. The cabinet occupies **50.6% of image height**, with only a small top surface visible. Neutral metal and darker seams replace the earlier green finish. A pale studio ground and broad lights maintain separation and soft contact shadows.

Five neighboring upright folders remain in the drawer around the selected portfolio file. Its white `PORTFOLIO` tab, cover label, spine and dimensions remain consistent from storage through reading. The original V1 hero assembly was revised and animated, with no object swap, visibility cut or animated scale. The cover and three paper layers remain editable; the two Polaroid frames retain fictional synthetic landscape placeholders.

The camera approaches while the drawer opens, rises to reveal the tabs, follows the selected file upward and outward, and settles over the spread. The selected folder's projected width grows from roughly 11% at arrival to 27% at the open drawer and 37% before rotation. The final open spread spans roughly 86% of image width. There is no orbit; the camera progressively pitches for reading, then stays still.

## Proposed timing

| Frames | Approximate time | Action |
| --- | --- | --- |
| 1–18 | 0–0.75 s | Closed cabinet hold / simulated activation |
| 18–50 | 0.75–2.08 s | Drawer opening and camera approach overlap |
| 50–70 | 2.08–2.92 s | Selected file lifts vertically clear of its neighbors |
| 70–82 | 2.92–3.42 s | Upright file advances beyond the drawer front |
| 82–122 | 3.42–5.08 s | Folder rotates toward horizontal and descends to the pale surface |
| 103–132 | 4.29–5.50 s | Cover opens as camera reframes for the spread |
| 132–180 | 5.50–7.50 s | Stable reading hold |

Activation to settled reading is **4.75 seconds**. Times describe the intended beats at 24 fps; individual frame timestamps differ by up to one frame.

## Checks and rendered review

The updated checker uses oriented mesh bounds with a 15-axis separating-axis test, so it can assess the selected file as it rotates. Across all 180 frames it reports zero selected-file/cabinet intersections, zero selected-file/neighbor intersections, zero cover/page intersections, zero ground intersections, zero camera clipping, and zero folder framing failures. Minimum folder framing margin is **5.5%**. The maximum folder-center displacement per frame is 2.8% of normalized image coordinates; this is a diagnostic, not a perceptual pass threshold.

Final frames also exclude all cabinet and neighbor bounds and the cabinet shadow envelopes projected from light centers. Soft shadows were inspected in the rendered reading image. Neighbor files stay parented to the drawer throughout.

Rendered review covered the full MP4 at 12 samples per second (90 decoded images), an overview at quarter-second intervals, and the full-resolution representative stills. Corrected issues included a dark distant floor, a slight file-edge intersection during drawer opening, and a cover sweep that briefly reached the frame's top edge. The final decoded sequence keeps the file continuous and fully framed, and the cabinet disappears before the cover finishes opening. This was dense sampled inspection of the encoded video, not real-time playback in a video player.

The V2 builder also completed in a fresh background Blender session using the preserved V1 file. Geometry checks supplement this visual review; the scene is not a mechanics simulation.

## Remaining choices

- The 4.75-second entrance is within the requested target; review whether the lift and subsequent rotation feel comfortably paced.
- The final camera is about 60 degrees above the surface, preserving paper depth. Actual portfolio typography, mobile reading and accessible web content remain untested and outside this draft.
- The implied pale ground, slight cover angle and placeholder artwork remain design proposals. No furniture or final content was added.

## Rebuild / edit

Open `archive-motion-v2.blend`, choose `Archive_Motion_V2`, and play frames 1–180. Assemblies retain V1 names with a `V2 | ` prefix; `NEIGHBORS | retained files` contains the contextual folders. To rebuild, preserve the V1 file at the documented path and run from this worktree:

```powershell
$blenderExe = 'C:/Program Files/Blender Foundation/Blender 5.1/blender.exe'
& $blenderExe -b --factory-startup --python design/blender/build_archive_v2.py
& $blenderExe -b artifacts/archive-motion-draft/v2/archive-motion-v2.blend --python design/blender/check_motion_v2.py
& $blenderExe -b artifacts/archive-motion-draft/v2/archive-motion-v2.blend --python design/blender/render_preview_v2.py -- stills
& $blenderExe -b artifacts/archive-motion-draft/v2/archive-motion-v2.blend --python design/blender/render_preview_v2.py -- sequence
python design/blender/package_preview_v2.py
```

Blender 5.1.2 is the tested version. Packaging uses the existing Pillow and `imageio-ffmpeg` installation. V1 scripts and source commit `4e80414` remain available. The V2 builder clones the preserved scene and refuses to replace an existing V2 scene in the current session.
