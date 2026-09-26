"""Conservative world-bounds clearance and camera checks across all 240 frames."""
import bpy
import json
from pathlib import Path
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

s=bpy.data.scenes['Archive_Motion_Draft']
bpy.context.window.scene=s
folder=bpy.data.objects['FOLDER | continuous hero']
def descendants(o):
    return list(o.children_recursive)
hero=[o for o in descendants(folder) if o.type=='MESH']
obstacles=[o for root in ['CABINET | fixed assembly','DRAWER | slide Y','SLIDES | telescoping intermediate'] for o in descendants(bpy.data.objects[root]) if o.type=='MESH']
def corners(o): return [o.matrix_world@Vector(v) for v in o.bound_box]
def bounds(o):
    vs=corners(o)
    return ([min(v[i] for v in vs) for i in range(3)],[max(v[i] for v in vs) for i in range(3)])
collisions=[]; framing=[]; clipping=[]; final_cabinet=[]
minimum_margin=1
for f in range(1,241):
    s.frame_set(f)
    for o in hero:
        a,b=bounds(o)
        for q in obstacles:
            c,d=bounds(q)
            if all(min(b[i],d[i])-max(a[i],c[i])>.001 for i in range(3)):
                collisions.append([f,o.name,q.name])
        points=[world_to_camera_view(s,s.camera,v) for v in corners(o)]
        if f>=66:
            margin=min(min(v.x,1-v.x,v.y,1-v.y) for v in points)
            minimum_margin=min(minimum_margin,margin)
            if margin<0: framing.append([f,o.name,round(margin,4)])
        if any(v.z<s.camera.data.clip_start or v.z>s.camera.data.clip_end for v in points): clipping.append([f,o.name])
    if f>=197:
        for o in obstacles:
            p=[world_to_camera_view(s,s.camera,v) for v in corners(o)]
            if max(v.x for v in p)>=0 and min(v.x for v in p)<=1 and max(v.y for v in p)>=0 and min(v.y for v in p)<=1:
                final_cabinet.append([f,o.name])
report={'frames_checked':240,'bounds_collisions':collisions,'folder_out_of_frame':framing,'camera_clip_failures':clipping,'cabinet_bounds_in_reading_frame':final_cabinet,'minimum_folder_frame_margin':round(minimum_margin,4),'limits':'Conservative axis-aligned mesh bounds; visual review also required. Does not assess website accessibility or physical dynamics.'}
out=Path(__file__).resolve().parents[2]/'artifacts'/'archive-motion-draft'/'checks.json'
out.write_text(json.dumps(report,indent=2))
print(json.dumps(report))
