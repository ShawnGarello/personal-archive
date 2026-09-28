"""V3 evaluated-geometry checks, camera lock and second-page occlusion samples.

Uses evaluated meshes so paper flex is included. Fastener contact at the top
attachment and deliberate cover/turned-sheet cropping are handled separately.
"""
import bpy
import json
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree
from bpy_extras.object_utils import world_to_camera_view
s=bpy.data.scenes['Archive_Motion_V3']; bpy.context.window.scene=s
def obj(name): return s.objects['V3 | '+name]
folder=obj('FOLDER | continuous hero'); hinge=obj('COVER | left spine hinge')
hero=[o for o in folder.children_recursive if o.type=='MESH' and 'fastener' not in o.name]
cover=obj('Outer cover'); page1=obj('Page 01 paper'); page2=obj('Page 02 paper')
cabinet=[o for name in ['CABINET | fixed assembly','DRAWER | slide Y','SLIDES | telescoping intermediate'] for o in obj(name).children_recursive if o.type=='MESH']
def mesh_info(o,deps):
    ev=o.evaluated_get(deps); me=ev.to_mesh()
    verts=[ev.matrix_world@v.co for v in me.vertices]
    faces=[tuple(p.vertices) for p in me.polygons]
    tree=BVHTree.FromPolygons(verts,faces,all_triangles=False,epsilon=.00001)
    ev.to_mesh_clear()
    lo=Vector([min(v[i] for v in verts) for i in range(3)]); hi=Vector([max(v[i] for v in verts) for i in range(3)])
    return verts,tree,lo,hi
def broad(a,b): return all(min(a[3][i],b[3][i])-max(a[2][i],b[2][i])>.0002 for i in range(3))
def projected(verts): return [world_to_camera_view(s,s.camera,v) for v in verts]
def margin(points): return min(min(p.x,1-p.x,p.y,1-p.y) for p in points)
def visible(p): return max(v.x for v in p)>0 and min(v.x for v in p)<1 and max(v.y for v in p)>0 and min(v.y for v in p)<1 and max(v.z for v in p)>0
issues={k:[] for k in ['drawer_neighbor_intersections','cover_document_intersections','page_stack_intersections','ground_penetration','reading_document_clipping','extraction_framing','camera_clip_planes','final_cabinet_visibility','camera_movement_during_reading','second_page_occlusion']}
intentional_cover_crop=[]; intentional_turned_sheet_crop=[]; reading_min=1; reference_camera=None; metrics={}
for f in range(1,295):
    s.frame_set(f); deps=bpy.context.evaluated_depsgraph_get()
    data={o:mesh_info(o,deps) for o in hero+cabinet}
    for h in hero:
        for c in cabinet:
            if broad(data[h],data[c]) and data[h][1].overlap(data[c][1]): issues['drawer_neighbor_intersections'].append([f,h.name,c.name])
        if data[h][2].z<-.0105: issues['ground_penetration'].append([f,h.name,round(data[h][2].z,4)])
        p=projected(data[h][0])
        if any(v.z<s.camera.data.clip_start or v.z>s.camera.data.clip_end for v in p): issues['camera_clip_planes'].append([f,h.name])
        if 50<=f<=132 and margin(p)<0: issues['extraction_framing'].append([f,h.name,round(margin(p),4)])
    for p in [page1,page2,obj('Paper stack lower edge'),obj('Paper stack middle edge')]:
        if broad(data[cover],data[p]) and data[cover][1].overlap(data[p][1]): issues['cover_document_intersections'].append([f,p.name])
    if broad(data[page1],data[page2]) and data[page1][1].overlap(data[page2][1]): issues['page_stack_intersections'].append(f)
    if f>=156:
        p=projected(data[page2][0]); reading_min=min(reading_min,margin(p))
        if margin(p)<0: issues['reading_document_clipping'].append(f)
        if f<=204 and margin(projected(data[page1][0]))<0: issues['reading_document_clipping'].append(f)
        if margin(projected(data[cover][0]))<0: intentional_cover_crop.append(f)
        if f>=205 and margin(projected(data[page1][0]))<0: intentional_turned_sheet_crop.append(f)
        for c in cabinet:
            if visible(projected(data[c][0])): issues['final_cabinet_visibility'].append([f,c.name])
        current=[v for row in s.camera.matrix_world for v in row]
        if reference_camera is None: reference_camera=current
        if max(abs(a-b) for a,b in zip(current,reference_camera))>1e-6: issues['camera_movement_during_reading'].append(f)
    if f in [156,246]:
        p=projected(data[page2][0]); root=obj('PAGE 02 | fixed document')
        top=[world_to_camera_view(s,s.camera,root.matrix_world@Vector((x,0,0))) for x in [-.74,.74]]
        bottom=[world_to_camera_view(s,s.camera,root.matrix_world@Vector((x,-2.1,0))) for x in [-.74,.74]]
        metrics[f]={'page_height_fraction':round(max(v.y for v in p)-min(v.y for v in p),4),'page_width_fraction':round(max(v.x for v in p)-min(v.x for v in p),4),'top_bottom_width_ratio':round((top[1].x-top[0].x)/(bottom[1].x-bottom[0].x),4)}
    if f>=246:
        root=obj('PAGE 02 | fixed document')
        for ix in range(9):
            for iy in range(13):
                pt=root.matrix_world@Vector((-.66+1.32*ix/8,-.18-1.82*iy/12,.006))
                ray=pt-s.camera.location; length=ray.length
                hit,normal,index,distance=data[page1][1].ray_cast(s.camera.location,ray.normalized(),length)
                if hit is not None and distance<length-.0005: issues['second_page_occlusion'].append([f,ix,iy])
report={'frames_checked':294,'issues':issues,'reading_metrics':metrics,'minimum_reading_page_margin':round(reading_min,4),'intentional_cover_crop_frames':[min(intentional_cover_crop),max(intentional_cover_crop)] if intentional_cover_crop else [],'intentional_turned_sheet_crop_frames':[min(intentional_turned_sheet_crop),max(intentional_turned_sheet_crop)] if intentional_turned_sheet_crop else [],'occlusion_samples_per_final_frame':117,'limits':'Evaluated surface intersection tests and sampled rays; fastening contact is intentional. Not a mechanical simulation or browser readability/accessibility test.'}
out=Path(__file__).resolve().parents[2]/'artifacts'/'archive-motion-draft'/'v3'/'checks.json'; out.write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report)); s.frame_set(1)
