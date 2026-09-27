"""V2 oriented-bounds checks for the rotating upright folder (15-axis SAT)."""
import bpy
import json
from pathlib import Path
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view
s=bpy.data.scenes['Archive_Motion_V2']; bpy.context.window.scene=s
def obj(name): return s.objects['V2 | '+name]
folder=obj('FOLDER | continuous hero'); hinge=obj('COVER | left spine hinge')
hero=[o for o in folder.children_recursive if o.type=='MESH']
cover=[o for o in hinge.children_recursive if o.type=='MESH']
paper=[o for o in hero if o not in cover and o.name!='V2 | Folder spine']
cabinet=[o for root in ['CABINET | fixed assembly','DRAWER | slide Y','SLIDES | telescoping intermediate'] for o in obj(root).children_recursive if o.type=='MESH']
neighbors=[o for o in obj('NEIGHBORS | retained files').children_recursive if o.type=='MESH']
fixed=[o for o in cabinet if o not in neighbors]
ground=obj('Seamless pale ground')
def corners(o): return [o.matrix_world@Vector(v) for v in o.bound_box]
def obb(o):
    lo=Vector([min(v[i] for v in o.bound_box) for i in range(3)])
    hi=Vector([max(v[i] for v in o.bound_box) for i in range(3)])
    axes=[o.matrix_world.to_3x3().col[i].copy() for i in range(3)]
    half=[(hi[i]-lo[i])*.5*axes[i].length for i in range(3)]
    return o.matrix_world@((lo+hi)*.5),[a.normalized() for a in axes],half
def intersect(a,b,tol=.0005):
    ca,aa,ha=a; cb,ab,hb=b; delta=cb-ca
    for axis in aa+ab+[x.cross(y) for x in aa for y in ab]:
        if axis.length_squared<1e-10: continue
        n=axis.normalized()
        ra=sum(ha[i]*abs(aa[i].dot(n)) for i in range(3))
        rb=sum(hb[i]*abs(ab[i].dot(n)) for i in range(3))
        if ra+rb-abs(delta.dot(n))<=tol: return False
    return True
def projection(objects):
    return [world_to_camera_view(s,s.camera,v) for o in objects for v in corners(o)]
def visible(points):
    return max(p.x for p in points)>=0 and min(p.x for p in points)<=1 and max(p.y for p in points)>=0 and min(p.y for p in points)<=1 and max(p.z for p in points)>0
issues={k:[] for k in ['folder_cabinet_intersections','neighbor_intersections','cover_page_intersections','ground_intersections','folder_framing','camera_clipping','final_cabinet_visibility','final_shadow_projection']}
min_margin=1; largest_step=0; prev=None; samples={}
for f in range(1,181):
    s.frame_set(f)
    boxes={o:obb(o) for o in hero+cabinet+[ground]}
    for h in hero:
        for other in fixed+neighbors:
            if intersect(boxes[h],boxes[other]):
                issues['neighbor_intersections' if other in neighbors else 'folder_cabinet_intersections'].append([f,h.name,other.name])
        if intersect(boxes[h],boxes[ground]): issues['ground_intersections'].append([f,h.name])
    for c in cover:
        for p in paper:
            if intersect(boxes[c],boxes[p]): issues['cover_page_intersections'].append([f,c.name,p.name])
    points=projection(hero)
    margin=min(min(v.x,1-v.x,v.y,1-v.y) for v in points)
    if f>=50:
        min_margin=min(min_margin,margin)
        if margin<0: issues['folder_framing'].append([f,round(margin,4)])
    if any(v.z<s.camera.data.clip_start or v.z>s.camera.data.clip_end for v in points): issues['camera_clipping'].append(f)
    center=world_to_camera_view(s,s.camera,folder.matrix_world.translation)
    if prev is not None: largest_step=max(largest_step,(Vector(center[:2])-Vector(prev[:2])).length)
    prev=center
    if f in [1,50,70,82,106,132]:
        samples[f]={'folder_width':round(max(v.x for v in points)-min(v.x for v in points),4),'folder_height':round(max(v.y for v in points)-min(v.y for v in points),4)}
    if f==1:
        cp=projection([o for o in obj('CABINET | fixed assembly').children_recursive if o.type=='MESH'])
        arrival_height=max(p.y for p in cp)-min(p.y for p in cp)
    if f>=132:
        for o in cabinet:
            if visible(projection([o])): issues['final_cabinet_visibility'].append([f,o.name])
        # Light-center hard-shadow envelopes supplement rendered soft-shadow review.
        for light in [o for o in s.objects if o.type=='LIGHT']:
            shadows=[]
            for o in cabinet:
                for v in corners(o):
                    direction=v-light.location
                    if abs(direction.z)>1e-6:
                        t=(-.01-light.location.z)/direction.z
                        if t>=1: shadows.append(world_to_camera_view(s,s.camera,light.location+t*direction))
            if shadows and visible(shadows): issues['final_shadow_projection'].append([f,light.name])
report={'frames_checked':180,'checks':issues,'arrival_cabinet_height_fraction':round(arrival_height,4),'minimum_folder_frame_margin':round(min_margin,4),'maximum_folder_center_step_per_frame':round(largest_step,4),'screen_size_samples':samples,'limits':'Oriented mesh bounds and light-center shadow envelopes; rendered review required for appearance and motion quality.'}
out=Path(__file__).resolve().parents[2]/'artifacts'/'archive-motion-draft'/'v2'/'checks.json'
out.write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
s.frame_set(1)
