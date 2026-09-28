"""V3: portrait documents, left cover hinge, independent flexible top page hinge.

Clones V2 data/actions; never overwrites a previous version. Blender 5.1.2.
"""
import bpy
import math
from pathlib import Path
from mathutils import Vector

ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/'artifacts'/'archive-motion-draft'
OUT=Path(globals().get('ARCHIVE_OUTPUT',BASE/'v3')); OUT.mkdir(parents=True,exist_ok=True)
NAME='Archive_Motion_V3'
if NAME in bpy.data.scenes: raise RuntimeError('V3 already exists; rebuild in a fresh Blender session.')
if 'Archive_Motion_V2' not in bpy.data.scenes:
    with bpy.data.libraries.load(str(BASE/'v2'/'archive-motion-v2.blend'),link=False) as (src,dst): dst.scenes=['Archive_Motion_V2']
source=bpy.data.scenes['Archive_Motion_V2']; old_frame=source.frame_current; source.frame_set(1)
s=bpy.data.scenes.new(NAME); bpy.context.window.scene=s
objects={}; materials={}
for old in source.objects:
    n=old.copy(); n.name=old.name.replace('V2 | ','V3 | ',1)
    if old.animation_data and old.animation_data.action: n.animation_data.action=old.animation_data.action.copy()
    if old.data:
        n.data=old.data.copy()
        if old.data.animation_data and old.data.animation_data.action: n.data.animation_data.action=old.data.animation_data.action.copy()
        if hasattr(n.data,'materials'):
            for i,m in enumerate(old.data.materials):
                if m not in materials: materials[m]=m.copy(); materials[m].name='V3 | '+m.name
                n.data.materials[i]=materials[m]
    s.collection.objects.link(n); objects[old.name.removeprefix('V2 | ')]=n
for old in source.objects:
    objects[old.name.removeprefix('V2 | ')].parent=objects.get(old.parent.name.removeprefix('V2 | ')) if old.parent else None
source.frame_set(old_frame)
s.world=source.world.copy()
try: s.render.engine='BLENDER_EEVEE'
except TypeError: raise RuntimeError('Eevee is required')
s.render.resolution_x=1600; s.render.resolution_y=1000; s.render.resolution_percentage=100
s.render.fps=24; s.frame_start=1; s.frame_end=294; s.eevee.taa_render_samples=48
s.render.image_settings.file_format='PNG'; s.render.film_transparent=False
def material(suffix): return next(m for m in materials.values() if m.name.endswith(suffix))
card=material('oat folder card'); paper=material('warm paper'); ink=material('graphite ink'); nickel=material('brushed nickel'); accent=material('oxide index')
photo_mats=[material('Landscape placeholder %d'%i) for i in [0,1]]
folder=objects['FOLDER | continuous hero']
# Replace only independently cloned V3 hero children. V2 remains untouched.
for o in list(folder.children_recursive): bpy.data.objects.remove(o,do_unlink=True)
def empty(name,parent=None,loc=(0,0,0)):
    o=bpy.data.objects.new('V3 | '+name,None); s.collection.objects.link(o); o.parent=parent; o.location=loc; return o
def box(name,loc,size,mat,parent,bevel=.006):
    x,y,z=[v/2 for v in size]; me=bpy.data.meshes.new(name+' mesh')
    me.from_pydata([(-x,-y,-z),(-x,-y,z),(-x,y,-z),(-x,y,z),(x,-y,-z),(x,-y,z),(x,y,-z),(x,y,z)],[],[(2,6,4,0),(5,7,3,1),(4,5,1,0),(3,7,6,2),(1,3,2,0),(6,7,5,4)])
    me.update(); o=bpy.data.objects.new('V3 | '+name,me); s.collection.objects.link(o); o.parent=parent; o.location=loc; me.materials.append(mat)
    if bevel:
        b=o.modifiers.new('Soft edge','BEVEL'); b.width=bevel; b.segments=3
        o.modifiers.new('Corner normals','WEIGHTED_NORMAL')
    return o
def text(name,body,loc,size,parent,mat=ink,rot=0):
    cu=bpy.data.curves.new(name,'FONT'); cu.body=body; cu.size=size; cu.space_line=1.25; cu.extrude=.0001; cu.resolution_u=8
    o=bpy.data.objects.new('V3 | '+name,cu); s.collection.objects.link(o); o.parent=parent; o.location=loc; o.rotation_euler.z=rot; cu.materials.append(mat); return o
def grid(name,width,length,parent,loc,mat,nx=6,ny=48,thickness=0):
    # Local top attachment is y=0; the free edge is at y=-length.
    verts=[(-width/2+width*c/nx,-length*r/ny,0) for r in range(ny+1) for c in range(nx+1)]
    faces=[]
    for r in range(ny):
        for c in range(nx):
            i=r*(nx+1)+c; faces.append((i,i+nx+1,i+nx+2,i+1))
    me=bpy.data.meshes.new(name+' mesh'); me.from_pydata(verts,[],faces); me.update()
    uv=me.uv_layers.new()
    for poly in me.polygons:
        for li in poly.loop_indices:
            co=me.vertices[me.loops[li].vertex_index].co; uv.data[li].uv=(co.x/width+.5,1+co.y/length)
    o=bpy.data.objects.new('V3 | '+name,me); s.collection.objects.link(o); o.parent=parent; o.location=loc; me.materials.append(mat)
    if thickness:
        sol=o.modifiers.new('Thin paper stock','SOLIDIFY'); sol.thickness=thickness; sol.offset=0
    return o
def key(ob,prop,f,val): setattr(ob,prop,val); ob.keyframe_insert(data_path=prop,frame=f)
def curves(ob):
    if not ob.animation_data or not ob.animation_data.action: return
    for layer in ob.animation_data.action.layers:
        for strip in layer.strips:
            for bag in strip.channelbags:
                yield from bag.fcurves
def smooth(ob):
    for fc in curves(ob):
        for k in fc.keyframe_points: k.interpolation='BEZIER'; k.handle_left_type='AUTO_CLAMPED'; k.handle_right_type='AUTO_CLAMPED'

orientation=empty('FOLDER | portrait orientation',folder)
for f,angle in [(1,90),(82,90),(122,0),(294,0)]: key(orientation,'rotation_euler',f,(0,0,math.radians(angle)))
folder['construction']='Portrait folder stored on its long edge; unchanged V2 storage footprint. One rigid hero throughout.'
box('Folder back',(0,0,0),(1.76,2.38,.035),card,orientation,.012)
box('Folder spine',(-.87,0,.066),(.016,2.35,.132),card,orientation,.005)
box('Portfolio tab',(.91,-.77,0),(.20,.64,.035),paper,orientation,.014)
text('Tab label','PORTFOLIO',(.90,-.53,.025),.062,orientation,rot=-math.pi/2)
hinge=empty('COVER | left spine hinge',orientation,(-.88,0,.14))
box('Outer cover',(.88,0,0),(1.76,2.38,.027),card,hinge,.012)
box('Cover label',(.87,0,.023),(.65,1.50,.012),paper,hinge,.006)
text('Cover eyebrow','PERSONAL ARCHIVE',(.98,.60,.032),.077,hinge,rot=-math.pi/2)
text('Cover title','Field notes',(.75,.60,.032),.18,hinge,rot=-math.pi/2)
text('Cover index','VOL. 01 / SELECTED STUDIES',(.60,.60,.032),.049,hinge,rot=-math.pi/2)
for f,angle in [(1,0),(103,0),(132,-176),(294,-176)]: key(hinge,'rotation_euler',f,(0,math.radians(angle),0))

box('Paper stack lower edge',(0,-.005,.038),(1.49,2.11,.008),paper,orientation,.003)
box('Paper stack middle edge',(.006,0,.049),(1.485,2.105,.007),paper,orientation,.003)
page_two=empty('PAGE 02 | fixed document',orientation,(0,1.055,.061))
turn=empty('PAGE 01 | top attachment hinge',orientation,(0,1.055,.079))
turn['attachment']='Rotates upward around local X at the top edge; independent of the outer cover hinge.'
first=grid('Page 01 paper',1.48,2.10,turn,(0,0,0),paper,thickness=.003)
second=grid('Page 02 paper',1.48,2.10,page_two,(0,0,0),paper,thickness=.003)

def content(parent,index):
    # Native editable text and deformable image quads; no résumé or personal content.
    first_page=index==0
    objs=[]
    objs.append(text('Page %d eyebrow'%(index+1),'FIELD STUDY / 0%d'%(index+1),(-.60,-.24,.005),.048,parent,accent))
    objs.append(text('Page %d heading'%(index+1),'Tideline atlas' if first_page else 'Sunroom studies',(-.60,-.43,.005),.112 if first_page else .10,parent))
    body=('A small map for noticing the coast.\nThis fictional study gathers routes,\nquiet places and seasonal changes\nin a clear, shared field guide.' if first_page else 'A daylight notebook for small rooms.\nThis fictional study compares light,\nshade and materials through a set\nof simple spatial experiments.')
    objs.append(text('Page %d paragraph'%(index+1),body,(-.60,-.60,.005),.052,parent))
    image=grid('Page %d project image'%(index+1),1.20,.67,parent,(0,-.96,.005),photo_mats[index],nx=6,ny=24)
    objs.append(image)
    objs.append(text('Page %d caption'%(index+1),'01 / COASTAL OBSERVATIONS' if first_page else '02 / LIGHT & MATERIAL',(-.60,-1.74,.005),.043,parent))
    objs.append(text('Page %d footer'%(index+1),'FICTIONAL PROJECT     /     IMAGE PLACEHOLDER',(-.60,-1.95,.005),.030,parent))
    return objs
top_content=content(turn,0); content(page_two,1)

# A lattice bends the subdivided paper, native text and image together.
# The 32-point lattice's default V coordinates span -15.5..15.5.
lat_data=bpy.data.lattices.new('V3 | paper flex lattice'); lat_data.points_u=2; lat_data.points_v=32; lat_data.points_w=2
lat_data.interpolation_type_u='KEY_LINEAR'; lat_data.interpolation_type_v='KEY_BSPLINE'; lat_data.interpolation_type_w='KEY_LINEAR'
lat=bpy.data.objects.new('V3 | PAGE FLEX | editable lattice',lat_data); s.collection.objects.link(lat)
lat.parent=turn; lat.location=(0,-1.05,0); lat.scale=(1.48,2.10/31,.3); lat.hide_render=True
lat.shape_key_add(name='Basis'); bend=lat.shape_key_add(name='Free edge lag')
for i,p in enumerate(lat_data.points):
    t=.5-p.co_deform.y/31
    bend.data[i].co.z-=.18*t*t/.3
for o in [first,*top_content]:
    mod=o.modifiers.new('Follow paper flex','LATTICE'); mod.object=lat
    if o==first: o.modifiers.move(len(o.modifiers)-1,0)
for f,angle in [(1,0),(204,0),(246,178),(294,178)]: key(turn,'rotation_euler',f,(-math.radians(angle),0,0))
for f,value in [(1,0),(204,0),(218,.8),(228,1),(238,.45),(246,0),(294,0)]:
    bend.value=value; bend.keyframe_insert(data_path='value',frame=f)
# Two small fastening straps at the shared top edge; no decorative hardware.
for x in [-.43,.43]:
    box('Top fastener base',(x,1.065,.075),(.14,.115,.012),nickel,orientation,.008)
    box('Top fastener strap',(x,1.055,.097),(.042,.13,.012),nickel,orientation,.004)

cam=objects['CAMERA | follow and settle']; s.camera=cam
# Preserve the V2 entrance. After the cover opens, approach and center the paper.
for fc in curves(cam):
    for k in list(fc.keyframe_points):
        if k.co.x>132: fc.keyframe_points.remove(k)
for f in [156,294]:
    target=Vector((0,-7.30,.060)); offset=Vector((0,-.75,4.15))
    key(cam,'location',f,target+offset); key(cam,'rotation_euler',f,(-offset).to_track_quat('-Z','Y').to_euler())
for o in [orientation,hinge,turn,cam,lat.data.shape_keys]: smooth(o)
for f,name in [(1,'ARRIVAL'),(18,'ENTRANCE ACTIVATION'),(50,'DRAWER OPEN'),(70,'FILE CLEAR'),(82,'ROTATE TO PORTRAIT'),(132,'COVER OPEN'),(156,'PAGE 01 READING / CAMERA LOCK'),(204,'PAGE TURN ACTIVATION'),(224,'FLEXIBLE TURN'),(246,'PAGE 02 READING'),(294,'END')]: s.timeline_markers.new(name,frame=f)
ref=Path('C:/Users/teche/OneDrive/Pictures/Screenshots/Screenshot 2026-09-27 100956.png')
if ref.exists():
    im=bpy.data.images.load(str(ref),check_existing=True); im.name='OWNER REFERENCE | content-focused framing'; im.use_fake_user=True
s['version']=3; s['status']='Design prototype for review; browser behavior and readability are unverified.'
s['intentional_crop']='Left cover after frame 132; turned sheet beyond the top attachment after the flip. Reading document must remain fully framed.'
s.frame_set(1)
for area in bpy.context.screen.areas if bpy.context.screen else []:
    if area.type=='VIEW_3D': area.spaces.active.camera=cam; area.spaces.active.region_3d.view_perspective='CAMERA'
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'archive-motion-v3.blend'))
print('Saved',OUT/'archive-motion-v3.blend')
