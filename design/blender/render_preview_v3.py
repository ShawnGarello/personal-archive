"""Render V3 stills at 1600x1000 or its complete 960x600 sequence."""
import bpy
import sys
import shutil
from pathlib import Path
OUT=Path(__file__).resolve().parents[2]/'artifacts'/'archive-motion-draft'/'v3'
s=bpy.data.scenes['Archive_Motion_V3']; bpy.context.window.scene=s
mode=sys.argv[sys.argv.index('--')+1] if '--' in sys.argv else 'stills'
resume='resume' in sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else False
s.render.image_settings.file_format='PNG'; s.render.resolution_percentage=100
s.render.resolution_x=1600 if mode=='stills' else 960; s.render.resolution_y=1000 if mode=='stills' else 600
s.eevee.taa_render_samples=48 if mode=='stills' else 24
target=OUT/('stills' if mode=='stills' else 'sequence'); target.mkdir(parents=True,exist_ok=True)
frames=[1,50,70,116,132,156,224,246,294] if mode=='stills' else range(1,295)
for f in frames:
    if resume and (target/('%04d.png'%f)).exists(): continue
    hold=1 if 2<=f<=18 else 156 if 157<=f<=204 else 246 if f>=247 else None
    if mode!='stills' and hold:
        shutil.copyfile(target/('%04d.png'%hold),target/('%04d.png'%f)); continue
    s.frame_set(f); s.render.filepath=str(target/('%04d.png'%f)); bpy.ops.render.render(write_still=True,scene=s.name)
