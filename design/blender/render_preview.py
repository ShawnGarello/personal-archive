"""Render existing draft: blender -b file.blend --python this.py -- stills|sequence."""
import bpy
import sys
import shutil
from pathlib import Path

root=Path(__file__).resolve().parents[2]
out=root/'artifacts'/'archive-motion-draft'
s=bpy.data.scenes['Archive_Motion_Draft']
bpy.context.window.scene=s
s.render.image_settings.file_format='PNG'
mode=sys.argv[sys.argv.index('--')+1] if '--' in sys.argv else 'stills'
if mode=='stills':
    s.render.resolution_percentage=100
    frames=[1,66,94,130,158,197,240]
    target=out/'stills'
else:
    s.render.resolution_percentage=100
    s.render.resolution_x=640
    s.render.resolution_y=400
    s.eevee.taa_render_samples=32
    frames=range(1,241)
    target=out/'sequence'
target.mkdir(exist_ok=True)
for f in frames:
    if mode=='sequence' and (2<=f<=24 or f>=198):
        shutil.copyfile(target/('%04d.png'%(1 if f<=24 else 197)),target/('%04d.png'%f))
        continue
    s.frame_set(f)
    s.render.filepath=str(target/('%04d.png'%f))
    bpy.ops.render.render(write_still=True,scene=s.name)
