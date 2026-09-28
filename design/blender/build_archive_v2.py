"""Version 2: clone and revise the preserved V1 scene without modifying it.

Blender 5.1: blender -b --python design/blender/build_archive_v2.py
ARCHIVE_OUTPUT may be supplied through runpy.init_globals for an isolated rebuild.
"""
import bpy
import math
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT/'artifacts'/'archive-motion-draft'
OUT = Path(globals().get('ARCHIVE_OUTPUT', BASE/'v2'))
OUT.mkdir(parents=True, exist_ok=True)
NAME = 'Archive_Motion_V2'
if NAME in bpy.data.scenes:
    raise RuntimeError('V2 already exists. Use a fresh session to rebuild without changing existing work.')
if 'Archive_Motion_Draft' not in bpy.data.scenes:
    with bpy.data.libraries.load(str(BASE/'v1'/'archive-motion-v1.blend'), link=False) as (src,dst):
        dst.scenes=['Archive_Motion_Draft']
source=bpy.data.scenes['Archive_Motion_Draft']
source_frame=source.frame_current
source.frame_set(1)
s=bpy.data.scenes.new(NAME)
bpy.context.window.scene=s
objects={}
materials={}
for old in source.objects:
    new=old.copy(); new.name='V2 | '+old.name
    new.animation_data_clear()
    if old.data:
        new.data=old.data.copy()
        new.data.animation_data_clear()
        if hasattr(new.data,'materials'):
            for i,m in enumerate(old.data.materials):
                if m not in materials:
                    materials[m]=m.copy(); materials[m].name='V2 | '+m.name
                new.data.materials[i]=materials[m]
    s.collection.objects.link(new); objects[old.name]=new
for old in source.objects:
    objects[old.name].parent=objects.get(old.parent.name) if old.parent else None
source.frame_set(source_frame)
s.world=source.world.copy(); s.world.name='V2 | pale studio'
next(n for n in s.world.node_tree.nodes if n.type=='BACKGROUND').inputs['Strength'].default_value=.18
try: s.render.engine='BLENDER_EEVEE'
except TypeError: raise RuntimeError('Eevee is required')
s.render.resolution_x=960; s.render.resolution_y=600; s.render.resolution_percentage=100
s.render.fps=24; s.frame_start=1; s.frame_end=180
s.eevee.taa_render_samples=48
s.render.image_settings.file_format='PNG'
s.render.film_transparent=False

def mat(name,color,rough=.6,metal=0):
    m=bpy.data.materials.new('V2 | '+name); m.use_nodes=True
    p=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
    p.inputs['Base Color'].default_value=(*color,1)
    p.inputs['Roughness'].default_value=rough; p.inputs['Metallic'].default_value=metal
    p.inputs['Specular IOR Level'].default_value=.22
    m.diffuse_color=(*color,1)
    return m
def recolor(old,color,rough,metal):
    m=materials[bpy.data.materials[old]]
    p=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
    p.inputs['Base Color'].default_value=(*color,1); m.diffuse_color=(*color,1)
    p.inputs['Roughness'].default_value=rough; p.inputs['Metallic'].default_value=metal
    return m
shell=recolor('Archive | chalk enamel',(.32,.305,.28),.4,.45)
drawer_mat=recolor('Archive | drawer enamel',(.40,.385,.355),.38,.35)
metal=recolor('Archive | brushed nickel',(.14,.145,.145),.3,.72)
card=recolor('Archive | oat folder card',(.58,.37,.16),.8,0)
paper=recolor('Archive | warm paper',(.89,.87,.81),.82,0)
ink=materials[bpy.data.materials['Archive | graphite ink']]
floor_mat=recolor('Archive | ivory surround',(.87,.865,.845),.85,0)
floor_shader=next(n for n in floor_mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
floor_shader.inputs['Emission Color'].default_value=(.55,.56,.58,1)
floor_shader.inputs['Emission Strength'].default_value=4
for v in objects['Seamless pale ground'].data.vertices:
    v.co.x*=10; v.co.y*=10
context_card=mat('neighbor folder card',(.52,.37,.21),.85)
context_paper=mat('neighbor page edge',(.72,.70,.62),.85)

def empty(name,parent=None,loc=(0,0,0)):
    o=bpy.data.objects.new('V2 | '+name,None); s.collection.objects.link(o)
    o.parent=parent; o.location=loc; return o
def box(name,loc,size,material,parent=None,bevel=.008):
    x,y,z=[v/2 for v in size]
    me=bpy.data.meshes.new(name+' mesh')
    me.from_pydata([(-x,-y,-z),(-x,-y,z),(-x,y,-z),(-x,y,z),(x,-y,-z),(x,-y,z),(x,y,-z),(x,y,z)],[],[(2,6,4,0),(5,7,3,1),(4,5,1,0),(3,7,6,2),(1,3,2,0),(6,7,5,4)])
    me.update(); o=bpy.data.objects.new('V2 | '+name,me); s.collection.objects.link(o)
    o.location=loc; o.parent=parent; me.materials.append(material)
    if bevel:
        b=o.modifiers.new('Soft edges','BEVEL'); b.width=bevel; b.segments=3
        o.modifiers.new('Corner normals','WEIGHTED_NORMAL')
    return o
def label(name,body,loc,size,parent,material=ink):
    cu=bpy.data.curves.new(name,'FONT'); cu.body=body; cu.size=size; cu.extrude=.0001
    ob=bpy.data.objects.new('V2 | '+name,cu); s.collection.objects.link(ob)
    ob.parent=parent; ob.location=loc; cu.materials.append(material); return ob

cab=objects['CABINET | fixed assembly']; drawer=objects['DRAWER | slide Y']; slides=objects['SLIDES | telescoping intermediate']
# Revise V1's manufactured pieces, preserving handles, seams and holders.
for root in [cab,drawer,slides]:
    for o in root.children_recursive:
        o.location=Vector((o.location.x*.68,o.location.y*.8,o.location.z*1.32))
        if o.type=='MESH':
            for v in o.data.vertices: v.co=Vector((v.co.x*.68,v.co.y*.8,v.co.z*1.32))
        elif o.type=='FONT':
            o.scale=(.68,1.32,1)
cab.location.z=-.25
for o in cab.children:
    if 'Rubber foot' in o.name:
        o.location.z=.285
        for v in o.data.vertices: v.co.z*=.08/(.27*1.32)
for name,height in [('Lower drawer face',1.23),('Middle drawer face',1.35),('Active drawer face',1.234)]:
    o=objects[name]
    previous=max(v.co.z for v in o.data.vertices)-min(v.co.z for v in o.data.vertices)
    for v in o.data.vertices: v.co.z*=height/previous
objects['Active tray bottom'].location.z=3.108
for name in ['Active tray side','Active tray side.001','Active tray rear']:
    objects[name].location.z=3.34
objects['Active drawer label text'].data.body='01 / PORTFOLIO'
objects['Middle drawer label text'].data.body='02 / NOTES'
objects['Lower drawer label text'].data.body='03 / RECORDS'
for prefix in ['Lower drawer','Middle drawer','Active drawer']:
    for suffix,height in [(' label frame',.25),(' label',.18)]:
        o=objects[prefix+suffix]
        previous=max(v.co.z for v in o.data.vertices)-min(v.co.z for v in o.data.vertices)
        for v in o.data.vertices: v.co.z*=height/previous
    objects[prefix+' label text'].scale=(.68,.68,1)

folder=objects['FOLDER | continuous hero']; cover=objects['COVER | left spine hinge']
folder.scale=(.65,.65,.65)
folder['note']='One upright selected folder, then rigid rotation into reading; no swaps or scale animation.'
objects['Index tab'].data.materials[0]=paper
objects['Tab label'].data.body='PORTFOLIO'; objects['Tab label'].data.size=.064
objects['Tab label'].location.x=.49
objects['Cover eyebrow'].data.body='PERSONAL ARCHIVE'
# A visible flexible spine strip is fixed to the same folder throughout.
box('Folder spine',(-1.18,0,.067),( .022,1.73,.13),card,folder,.005)

neighbors=empty('NEIGHBORS | retained files',drawer)
for i,y in enumerate([-.79,-.19,.11,.41,.71]):
    n=empty('Neighbor %02d'%(i+1),neighbors,(0,y,3.74))
    n.rotation_euler.x=math.pi/2; n.scale=(.65,.65,.65)
    box('Neighbor %02d back'%i,(0,0,0),(2.38,1.76,.024),context_card,n)
    box('Neighbor %02d pages'%i,(0,0,.035),(2.2,1.62,.04),context_paper,n,.004)
    box('Neighbor %02d front'%i,(0,0,.07),(2.38,1.76,.024),context_card,n)
    tx=[-.73,0,.73,-.73,0][i]
    box('Neighbor %02d tab'%i,(tx,.92,0),(.55,.20,.024),paper,n)
    label('Neighbor %02d index'%i,['NOTES','STUDIES','DRAFTS','OBJECTS','PLACES'][i],(tx-.23,.895,.014),.055,n)

# Keep reference visible as a local editable image datablock, without packing or uploading it.
ref_path=Path('C:/Users/teche/Downloads/ChatGPT Image Sep 26, 2026, 02_15_45 PM.png')
if ref_path.exists():
    reference=bpy.data.images.load(str(ref_path),check_existing=True)
    reference.name='OWNER REFERENCE | V2 arrival direction'
    reference.use_fake_user=True

# Smaller key source and restrained fill provide tonal separation and grounded shadows.
for name,loc,power,size,target in [
    ('Large softbox',(-4,-4,9),1100,5,(0,0,2)),
    ('Soft fill',(5,-6,7),220,5,(0,0,2)),
    ('Reading softbox',(-1,-8,7),600,5,(0,-7,0))]:
    o=objects[name]; o.location=loc; o.data.energy=power; o.data.size=size
    o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()

cam=objects['CAMERA | follow and settle']; s.camera=cam
cam.data.type='PERSP'; cam.data.lens=55; cam.data.clip_start=.05; cam.data.clip_end=250
def key(ob,prop,f,val):
    setattr(ob,prop,val); ob.keyframe_insert(data_path=prop,frame=f)
for f,y in [(1,0),(18,0),(50,-1.9),(180,-1.9)]:
    key(drawer,'location',f,(0,y,-.25)); key(slides,'location',f,(0,y/2,-.25))
for f,loc,angle in [
    (1,(0,-.49,3.49),90),(18,(0,-.49,3.49),90),
    (50,(0,-2.39,3.49),90),(70,(0,-2.39,4.9),90),
    (82,(0,-3.9,4.9),90),(106,(0,-6.0,2.7),24),
    (122,(0,-7.3,.018),0),(180,(0,-7.3,.018),0)]:
    key(folder,'location',f,loc); key(folder,'rotation_euler',f,(math.radians(angle),0,0))
for f,a in [(1,0),(103,0),(132,-176),(180,-176)]:
    key(cover,'rotation_euler',f,(0,math.radians(a),0))
for f,target,offset in [
    (1,(0,0,2.1),(0,-22,5.8)),(18,(0,0,2.1),(0,-22,5.8)),
    (50,(0,-2.0,3.4),(0,-8,5)),
    (70,(0,-2.55,4.9),(0,-6.3,4.5)),
    (82,(0,-3.9,4.85),(0,-5.2,4.4)),
    (106,(-.20,-6,2.7),(0,-3.6,5.25)),
    (122,(-.55,-7.3,.50),(0,-3.3,5.5)),
    (132,(-.75,-7.3,.08),(0,-2.9,5.02)),
    (180,(-.75,-7.3,.08),(0,-2.9,5.02))]:
    pos=Vector(target)+Vector(offset)
    key(cam,'location',f,pos)
    key(cam,'rotation_euler',f,(-Vector(offset)).to_track_quat('-Z','Y').to_euler())
for ob in [drawer,slides,folder,cover,cam]:
    for layer in ob.animation_data.action.layers:
        for strip in layer.strips:
            for bag in strip.channelbags:
                for fc in bag.fcurves:
                    for k in fc.keyframe_points:
                        k.interpolation='BEZIER'; k.handle_left_type='AUTO_CLAMPED'; k.handle_right_type='AUTO_CLAMPED'
for f,name in [(1,'ARRIVAL'),(18,'SIMULATED ACTIVATION'),(50,'DRAWER OPEN'),(70,'UPRIGHT FILE CLEAR'),(82,'OUTWARD / BEGIN ROTATION'),(103,'COVER BEGINS'),(122,'FOLDER LANDED'),(132,'READING HOLD'),(180,'END')]:
    s.timeline_markers.new(name,frame=f)
s['version']=2
s['proposal']='Reference-led arrival; upright extraction; 4.75 s activation to reading, plus 0.75 s arrival and 2 s final hold.'
s['source']='Independent editable clone of preserved V1 scene.'
s.frame_set(1)
for a in bpy.context.screen.areas if bpy.context.screen else []:
    if a.type=='VIEW_3D':
        a.spaces.active.camera=cam; a.spaces.active.region_3d.view_perspective='CAMERA'
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'archive-motion-v2.blend'))
print('Saved V2',OUT)
