"""Encode V3 and make review boards from the finished MP4, plus a local manifest."""
import hashlib
import json
import math
import shutil
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw
import imageio_ffmpeg

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'artifacts'/'archive-motion-draft'/'v3'
ffmpeg=imageio_ffmpeg.get_ffmpeg_exe()
expected=[OUT/'sequence'/('%04d.png'%f) for f in range(1,295)]
if not all(p.exists() for p in expected): raise RuntimeError('Complete the 294-frame render first')

def ff(args): subprocess.run([ffmpeg,'-hide_banner','-loglevel','warning','-y',*args],check=True)
ff(['-framerate','24','-i',str(OUT/'sequence'/'%04d.png'),'-frames:v','294','-c:v','libx264','-crf','17','-pix_fmt','yuv420p','-movflags','+faststart',str(OUT/'archive-motion-v3.mp4')])
review=OUT/'video-review'; review.mkdir(exist_ok=True)
ff(['-i',str(OUT/'archive-motion-v3.mp4'),'-vf','fps=12',str(review/'%03d.png')])
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

for part in range(math.ceil(len(decoded)/30)):
    subset=decoded[part*30:(part+1)*30]
    board([(p,'%.2f s'%((part*30+i)/12)) for i,p in enumerate(subset)],OUT/('motion-review-%d.jpg'%(part+1)),cols=5,width=320)
board([(p,'%.2f s'%(i/12)) for i,p in enumerate(decoded) if i%3==0],OUT/'video-contact-sheet.jpg',cols=5,width=320)
selected=[(1,'Arrival'),(50,'Drawer open'),(70,'File clear'),(116,'Portrait / cover opening'),(132,'Cover open'),(156,'First reading page'),(224,'Upward sheet turn'),(246,'Second reading page'),(294,'Final hold')]
board([(OUT/'stills'/('%04d.png'%f),'%s | frame %d'%(label,f)) for f,label in selected],OUT/'representative-frames.jpg')
for n,f in [(1,156),(2,246)]: shutil.copy2(OUT/'stills'/('%04d.png'%f),OUT/('reading-page-%02d.png'%n))
paths=[OUT/'archive-motion-v3.blend',OUT/'archive-motion-v3.mp4',OUT/'representative-frames.jpg',OUT/'video-contact-sheet.jpg',OUT/'checks.json',*sorted(OUT.glob('reading-page-*.png')),*sorted((OUT/'stills').glob('*.png')),*sorted(OUT.glob('motion-review-*.jpg'))]
manifest={'version':3,'storage':'Local only: ignored artifacts/archive-motion-draft/v3; earlier versions preserved.','files':[{'path':p.relative_to(OUT).as_posix(),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in paths]}
(Path(__file__).parent/'artifact-manifest-v3.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps({'video':str(OUT/'archive-motion-v3.mp4'),'decoded_review_frames':len(decoded)}))
