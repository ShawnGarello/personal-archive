"""Encode V2 at 960x600 and make review boards from the delivered MP4."""
import hashlib
import json
import math
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw
import imageio_ffmpeg

ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/'artifacts'/'archive-motion-draft'
OUT=BASE/'v2'
ffmpeg=imageio_ffmpeg.get_ffmpeg_exe()
expected=[OUT/'sequence'/('%04d.png'%f) for f in range(1,181)]
if not all(p.exists() for p in expected): raise RuntimeError('Complete the 180-frame render first')
def ff(args): subprocess.run([ffmpeg,'-hide_banner','-loglevel','warning','-y',*args],check=True)
ff(['-framerate','24','-i',str(OUT/'sequence'/'%04d.png'),'-frames:v','180','-c:v','libx264','-crf','17','-pix_fmt','yuv420p','-movflags','+faststart',str(OUT/'archive-motion-v2.mp4')])
review=OUT/'video-review'; review.mkdir(exist_ok=True)
ff(['-i',str(OUT/'archive-motion-v2.mp4'),'-vf','fps=12',str(review/'%03d.png')])
decoded=sorted(review.glob('*.png'))
def board(items,path,cols=3,width=480):
    height=int(width*600/960); cell=height+28
    im=Image.new('RGB',(cols*width,math.ceil(len(items)/cols)*cell),(248,247,244))
    draw=ImageDraw.Draw(im)
    for i,(p,caption) in enumerate(items):
        x=(i%cols)*width; y=(i//cols)*cell
        with Image.open(p) as source: im.paste(source.convert('RGB').resize((width,height)),(x,y))
        draw.text((x+10,y+height+7),caption,fill=(28,35,32))
    im.save(path,quality=94)
for part in range(3):
    subset=decoded[part*30:(part+1)*30]
    board([(p,'%.2f s'%((part*30+i)/12)) for i,p in enumerate(subset)],OUT/('motion-review-%d.jpg'%(part+1)),cols=5,width=320)
board([(p,'%.2f s'%(i/12)) for i,p in enumerate(decoded) if i%3==0],OUT/'video-contact-sheet.jpg',cols=5,width=320)
selected=[(1,'Arrival'),(50,'Drawer open / tabs'),(70,'Upright file clear'),(82,'Outward transition'),(106,'Rotate into reading'),(132,'Settled reading')]
board([(OUT/'stills'/('%04d.png'%f),'%s | frame %d'%(label,f)) for f,label in selected],OUT/'representative-frames.jpg')
board([(BASE/'v1'/'stills'/'0001.png','VERSION 1 | previous arrival'),(OUT/'stills'/'0001.png','VERSION 2 | centered / 50.6% frame height')],OUT/'arrival-comparison.jpg',cols=2,width=720)
paths=[OUT/'archive-motion-v2.blend',OUT/'archive-motion-v2.mp4',OUT/'representative-frames.jpg',OUT/'arrival-comparison.jpg',OUT/'video-contact-sheet.jpg',OUT/'checks.json',*sorted((OUT/'stills').glob('*.png'))]
manifest={'version':2,'storage':'Local only: ignored artifacts/archive-motion-draft/v2; V1 preserved under v1.','files':[{'path':p.relative_to(OUT).as_posix(),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in paths]}
(Path(__file__).parent/'artifact-manifest-v2.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps({'video':str(OUT/'archive-motion-v2.mp4'),'decoded_review_frames':len(decoded)}))
