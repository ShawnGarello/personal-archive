"""V2: blender -b archive-motion-v2.blend --python this.py -- stills|sequence."""
import bpy
import sys
import shutil
from pathlib import Path
out=Path(__file__).resolve().parents[2]/'artifacts'/'archive-motion-draft'/'v2'
s=bpy.data.scenes['Archive_Motion_V2']; bpy.context.window.scene=s
s.render.image_settings.file_format='PNG'
s.render.resolution_x=960; s.render.resolution_y=600; s.render.resolution_percentage=100
mode=sys.argv[sys.argv.index('--')+1] if '--' in sys.argv else 'stills'
frames=[1,50,70,82,106,132,180] if mode=='stills' else range(1,181)
s.eevee.taa_render_samples=64 if mode=='stills' else 32
target=out/('stills' if mode=='stills' else 'sequence'); target.mkdir(parents=True,exist_ok=True)
for f in frames:
    if mode=='sequence' and (2<=f<=18 or f>=133):
        shutil.copyfile(target/('%04d.png'%(1 if f<=18 else 132)),target/('%04d.png'%f))
        continue
    s.frame_set(f); s.render.filepath=str(target/('%04d.png'%f))
    bpy.ops.render.render(write_still=True,scene=s.name)
