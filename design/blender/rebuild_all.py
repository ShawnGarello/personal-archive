"""Rebuild the accepted V3 study from a fresh checkout in one Blender session.

Run: blender --background --factory-startup --python design/blender/rebuild_all.py
Existing local source files are never overwritten by this entry point.
"""
import runpy
import shutil
from pathlib import Path

HERE = Path(__file__).resolve().parent
BASE = HERE.parents[1] / "artifacts" / "archive-motion-draft"
outputs = [
    BASE / "archive-motion-draft.blend",
    BASE / "v1" / "archive-motion-v1.blend",
    BASE / "v2" / "archive-motion-v2.blend",
    BASE / "v3" / "archive-motion-v3.blend",
]
if any(path.exists() for path in outputs):
    raise RuntimeError("Source outputs already exist. Use a fresh checkout; preserve local edits.")
runpy.run_path(str(HERE / "build_archive.py"), run_name="__main__")
outputs[1].parent.mkdir(parents=True, exist_ok=True)
shutil.copyfile(outputs[0], outputs[1])
runpy.run_path(str(HERE / "build_archive_v2.py"), run_name="__main__")
runpy.run_path(str(HERE / "build_archive_v3.py"), run_name="__main__")
print("Rebuilt V1, V2, and V3. Rendering is a separate, optional step.")
