"""Encode the rendered frames and make a review contact sheet.

Requires Python, Pillow and imageio-ffmpeg (no website dependencies).
"""
import json
import hashlib
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw
import imageio_ffmpeg

out=Path(__file__).resolve().parents[2]/'artifacts'/'archive-motion-draft'
ffmpeg=imageio_ffmpeg.get_ffmpeg_exe()
subprocess.run([ffmpeg,'-y','-framerate','24','-i',str(out/'sequence'/'%04d.png'),'-c:v','libx264','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',str(out/'archive-motion-preview.mp4')],check=True)
# Decode the finished video itself so the review checks the delivered encoding.
review=out/'video-review'; review.mkdir(exist_ok=True)
subprocess.run([ffmpeg,'-y','-i',str(out/'archive-motion-preview.mp4'),'-vf','fps=4',str(review/'%03d.png')],check=True)
frames=sorted(review.glob('*.png'))
sheet=Image.new('RGB',(4*320,10*222),(245,243,238))
draw=ImageDraw.Draw(sheet)
for i,p in enumerate(frames):
    im=Image.open(p).convert('RGB').resize((320,200))
    x=(i%4)*320; y=(i//4)*222
    sheet.paste(im,(x,y)); draw.text((x+8,y+203),'%.2fs'%(i*.25),fill=(30,40,35))
sheet.save(out/'video-contact-sheet.jpg',quality=92)
selected=[(1,'Arrival'),(66,'Drawer clear'),(94,'Lift'),(130,'Follow'),(158,'Cover opening'),(197,'Reading')]
board=Image.new('RGB',(1440,648),(245,243,238)); draw=ImageDraw.Draw(board)
for i,(f,label) in enumerate(selected):
    im=Image.open(out/'stills'/('%04d.png'%f)).convert('RGB').resize((480,300))
    x=(i%3)*480; y=(i//3)*324
    board.paste(im,(x,y)); draw.text((x+12,y+304),'%s | frame %d'%(label,f),fill=(30,40,35))
board.save(out/'representative-frames.jpg',quality=94)
paths=[out/'archive-motion-draft.blend',out/'archive-motion-preview.mp4',out/'representative-frames.jpg',out/'video-contact-sheet.jpg',out/'checks.json',*sorted((out/'stills').glob('*.png'))]
manifest={'storage':'Local only, ignored artifacts/archive-motion-draft; regenerate with design/blender scripts.','files':[{'path':str(p.relative_to(out)).replace('\\','/'),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in paths]}
(Path(__file__).parent/'artifact-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps({'video':str(out/'archive-motion-preview.mp4'),'decoded_review_frames':len(frames)}))
