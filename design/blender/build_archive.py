"""Editable entrance study. Run in Blender 5.1 with --python, or via MCP.

Creates a separate scene; never removes or edits pre-existing scenes/objects.
All geometry, typography and animation are native editable Blender data.
"""
import bpy
import math
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(globals().get('ARCHIVE_OUTPUT', ROOT / 'artifacts' / 'archive-motion-draft'))
OUT.mkdir(parents=True, exist_ok=True)
SCENE_NAME = 'Archive_Motion_Draft'
if SCENE_NAME in bpy.data.scenes:
    raise RuntimeError('Draft scene already exists. Rebuild in a fresh Blender file to preserve work.')
s = bpy.data.scenes.new(SCENE_NAME)
bpy.context.window.scene = s
try:
    s.render.engine = 'BLENDER_EEVEE'
except TypeError:
    raise RuntimeError('This study requires an installed Eevee engine')
s.render.resolution_x = 960
s.render.resolution_y = 600
s.render.resolution_percentage = 100
s.render.fps = 24
s.frame_start, s.frame_end = 1, 240
s.render.image_settings.file_format = 'PNG'
s.render.film_transparent = False
s.world = bpy.data.worlds.new('Archive | warm studio')
s.world.use_nodes = True
bg = next(n for n in s.world.node_tree.nodes if n.type == 'BACKGROUND')
bg.inputs['Color'].default_value = (0.82, 0.85, 0.9, 1)
bg.inputs['Strength'].default_value = 0.25

def material(name, color, rough=0.6, metal=0):
    m = bpy.data.materials.new('Archive | '+name)
    m.use_nodes = True
    p = next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Roughness'].default_value = rough
    p.inputs['Metallic'].default_value = metal
    if not metal: p.inputs['Specular IOR Level'].default_value = .18
    m.diffuse_color = (*color, 1)
    return m

shell = material('chalk enamel', (0.49, 0.56, 0.53), .48)
drawer_mat = material('drawer enamel', (.61,.67,.62), .5)
dark = material('graphite ink', (.012,.025,.019))
metal = material('brushed nickel', (.36,.4,.38), .3, .7)
folder_mat = material('oat folder card', (.66,.47,.27), .85)
paper = material('warm paper', (.94,.91,.83), .87)
white = material('photograph border', (.98,.98,.95), .65)
accent = material('oxide index', (.39,.12,.065))
floor_mat = material('ivory surround', (.88,.87,.82), .8)

def empty(name, loc=(0,0,0), parent=None):
    o=bpy.data.objects.new(name,None); s.collection.objects.link(o)
    o.location=loc; o.parent=parent
    return o

def box(name, loc, size, mat, parent=None, bevel=.025):
    x,y,z=[v/2 for v in size]
    mesh=bpy.data.meshes.new(name+' mesh')
    mesh.from_pydata([(-x,-y,-z),(-x,-y,z),(-x,y,-z),(-x,y,z),(x,-y,-z),(x,-y,z),(x,y,-z),(x,y,z)],[],[(2,6,4,0),(5,7,3,1),(4,5,1,0),(3,7,6,2),(1,3,2,0),(6,7,5,4)])
    mesh.update()
    o=bpy.data.objects.new(name,mesh); s.collection.objects.link(o)
    o.location=loc; o.parent=parent; o.data.materials.append(mat)
    if bevel:
        mod=o.modifiers.new('Soft manufactured edges','BEVEL'); mod.width=bevel; mod.segments=3
        o.modifiers.new('Weighted corner normals','WEIGHTED_NORMAL')
    return o

def text(name, body, loc, size, parent=None, mat=dark, rot=(0,0,0)):
    cu=bpy.data.curves.new(name,'FONT'); cu.body=body; cu.size=size; cu.extrude=.0001
    cu.space_character=1.1
    ob=bpy.data.objects.new(name,cu); s.collection.objects.link(ob)
    ob.location=loc; ob.rotation_euler=rot; ob.parent=parent; cu.materials.append(mat)
    return ob

cabinet = empty('CABINET | fixed assembly')
box('Cabinet left side',(-1.48,0,1.85),(.13,2.5,3.1),shell,cabinet)
box('Cabinet right side',(1.48,0,1.85),(.13,2.5,3.1),shell,cabinet)
box('Cabinet rear',(0,1.19,1.85),(2.9,.12,3.1),shell,cabinet)
box('Cabinet crown',(0,0,3.43),(3.13,2.56,.16),shell,cabinet,.04)
box('Cabinet plinth',(0,0,.34),(3.0,2.5,.17),shell,cabinet)
for x in [-1.25,1.25]:
    for y in [-.98,.98]:
        box('Rubber foot',(x,y,.16),(.18,.18,.27),dark,cabinet)

def front(name, z, height, parent):
    box(name+' face',(0,-1.29,z),(2.82,.13,height),drawer_mat,parent,.04)
    box(name+' label frame',(0,-1.372,z+.16),(.77,.045,.27),metal,parent,.015)
    box(name+' label',(0,-1.398,z+.16),(.67,.012,.19),paper,parent,.005)
    label='01 / FIELD NOTES' if name=='Active drawer' else '02 / COLLECTION' if name=='Middle drawer' else '03 / RECORDS'
    text(name+' label text',label,(-.295,-1.408,z+.135),.052,parent,rot=(math.pi/2,0,0))
    for x in [-.4,.4]:
        box(name+' handle mount',(x,-1.42,z-.18),(.09,.19,.09),metal,parent,.025)
    box(name+' pull',(0,-1.52,z-.18),(.88,.09,.10),metal,parent,.038)

front('Lower drawer',.89,.91,cabinet)
front('Middle drawer',1.88,.95,cabinet)
drawer=empty('DRAWER | slide Y')
front('Active drawer',2.88,.92,drawer)
box('Active tray bottom',(0,-.03,2.47),(2.73,2.33,.085),shell,drawer)
for x in [-1.32,1.32]:
    box('Active tray side',(x,-.02,2.69),(.075,2.34,.4),drawer_mat,drawer,.015)
box('Active tray rear',(0,1.10,2.69),(2.67,.07,.4),drawer_mat,drawer,.015)
slide=empty('SLIDES | telescoping intermediate')
for x in [-1.39,1.39]:
    box('Stationary slide',(x,0,2.55),(.045,2.25,.11),metal,cabinet,.006)
    box('Intermediate slide',(x,0,2.56),(.04,2.2,.075),metal,slide,.006)
    box('Extended slide',(x,0,2.55),(.04,2.2,.055),metal,drawer,.006)

folder=empty('FOLDER | continuous hero', (0,-.08,2.55))
folder['note']='Same assembly throughout; no swaps, visibility cuts or dissolves.'
box('Folder back',(0,0,0),(2.38,1.76,.035),folder_mat,folder,.022)
box('Index tab',(.77,.91,0),(.64,.20,.035),folder_mat,folder,.025)
text('Tab label','FIELD / 01',(.53,.90,.025),.065,folder)
for i in range(3):
    box('Page %02d'%(i+1),(.015*i,-.006*i,.031+i*.015),(2.21,1.59,.009),paper,folder,.006)

hinge=empty('COVER | left spine hinge',(-1.19,0,.14),folder)
box('Folder opening cover',(1.19,0,0),(2.38,1.76,.027),folder_mat,hinge,.021)
box('Cover title label',(1.23,.23,.023),(1.72,.65,.012),paper,hinge,.012)
text('Cover eyebrow','PERSONAL ARCHIVE',(.49,.40,.032),.09,hinge)
text('Cover title','Field notes',(.49,.14,.032),.20,hinge)
text('Cover metadata','VOL. 01    /    SELECTED STUDIES',(.49,-.015,.032),.048,hinge)
box('Cover accent',(.31,.23,.026),(.025,.64,.012),accent,hinge,.003)

# All public content below is fictional, manually authored placeholder text.
text('Page eyebrow','01   /   SELECTED WORK',(-.96,.62,.089),.069,folder,accent)
text('Page title','Field studies',(-.96,.39,.089),.17,folder)
text('Page intro','An archive of objects, places and small experiments.',(-.96,.24,.089),.045,folder)

# Procedural camera-like landscape placeholders, packed into the .blend.
# These are synthetic stand-ins, not claims about portfolio projects.
def landscape(name, warm=False):
    w,h=256,192
    im=bpy.data.images.new(name,width=w,height=h)
    pix=[]
    for j in range(h):
        v=j/(h-1)
        for i in range(w):
            u=i/(w-1)
            grain=.016*math.sin(i*42.31+j*91.7)
            ridge=.34+.13*math.sin(u*5.9)+.05*math.sin(u*17.1)
            near=.19+.075*math.sin(u*8+1.8)
            if v<near: c=(.17,.24,.22) if not warm else (.28,.23,.18)
            elif v<ridge: c=(.30,.40,.39) if not warm else (.55,.40,.26)
            else: c=(.69+.13*v,.77+.10*v,.78+.09*v) if not warm else (.83,.77,.63)
            if (u-.75)**2+(v-.77)**2 < .003: c=(.96,.91,.75)
            pix.extend([max(0,min(1,a+grain)) for a in c]+[1])
    im.pixels.foreach_set(pix); im.pack()
    m=material(name,(1,1,1))
    p=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
    tex=m.node_tree.nodes.new('ShaderNodeTexImage'); tex.image=im
    m.node_tree.links.new(tex.outputs['Color'],p.inputs['Base Color'])
    return m

for idx,x in enumerate([-.54,.54]):
    box('Polaroid %d border'%idx,(x,-.17,.091),(.90,.73,.012),white,folder,.008)
    mesh=bpy.data.meshes.new('Photo UV quad')
    mesh.from_pydata([(-.40,-.255,0),(.40,-.255,0),(.40,.255,0),(-.40,.255,0)],[],[(0,1,2,3)])
    uv=mesh.uv_layers.new()
    for li,co in enumerate([(0,0),(1,0),(1,1),(0,1)]): uv.data[li].uv=co
    ob=bpy.data.objects.new('Synthetic photo placeholder %d'%idx,mesh); s.collection.objects.link(ob)
    ob.parent=folder; ob.location=(x,-.105,.099)
    mesh.materials.append(landscape('Landscape placeholder %d'%idx,bool(idx)))
    text('Photo caption %d'%idx,['01 / TIDELINE','02 / SUNROOM'][idx],(x-.37,-.47,.105),.057,folder)
text('Page footer','FICTIONAL CONTENT     /     IMAGE PLACEHOLDERS',(-.96,-.68,.088),.049,folder)

box('Seamless pale ground',(0,-5,-.11),(200,200,.2),floor_mat,None,.02)
def area(name,loc,power,size,target):
    d=bpy.data.lights.new(name,'AREA'); d.energy=power; d.shape='DISK'; d.size=size
    o=bpy.data.objects.new(name,d); s.collection.objects.link(o); o.location=loc
    o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
area('Large softbox',(-4,-6,11),1800,8,(0,-3,0))
area('Soft fill',(6,-1,8),500,7,(0,-3,1))
area('Reading softbox',(-1,-11,8),950,7,(0,-8,0))
cam_data=bpy.data.cameras.new('Archive camera'); cam_data.type='ORTHO'; cam_data.clip_start=.05; cam_data.clip_end=250
cam=bpy.data.objects.new('CAMERA | follow and settle',cam_data); s.collection.objects.link(cam); s.camera=cam

def key(ob,prop,frame,value):
    setattr(ob,prop,value); ob.keyframe_insert(data_path=prop,frame=frame)

for f,y in [(1,0),(24,0),(66,-2.72),(240,-2.72)]: key(drawer,'location',f,(0,y,0))
for f,y in [(1,0),(24,0),(66,-1.36),(240,-1.36)]: key(slide,'location',f,(0,y,0))
for f,loc in [(1,(0,-.08,2.55)),(24,(0,-.08,2.55)),(66,(0,-2.80,2.55)),(94,(0,-2.80,3.55)),(122,(0,-5.2,3.55)),(166,(0,-8.2,.0175)),(240,(0,-8.2,.0175))]:
    key(folder,'location',f,loc)
for f,a in [(1,0),(135,0),(197,-math.radians(176)),(240,-math.radians(176))]: key(hinge,'rotation_euler',f,(0,a,0))
for f,target,offset,scale in [
    (1,(0,0,1.8),(1.3,-9,11),8.2),
    (24,(0,0,1.8),(1.3,-9,11),8.2),
    (66,(0,-1.9,2.0),(1.3,-7,11),7.6),
    (94,(0,-2.8,3.0),(1.2,-6.5,11),6.7),
    (122,(-.1,-5.1,3.2),(1,-5.5,11.5),6.7),
    (166,(-.9,-8.2,.25),(.3,-3.3,12),6.4),
    (197,(-1.12,-8.2,.18),(0,-2.3,12),6.1),
    (240,(-1.12,-8.2,.18),(0,-2.3,12),6.1)]:
    position=Vector(target)+Vector(offset)
    key(cam,'location',f,position)
    key(cam,'rotation_euler',f,(Vector(target)-position).to_track_quat('-Z','Y').to_euler())
    key(cam_data,'ortho_scale',f,scale)

# Clamped Bezier handles give gentle starts/stops without spatial overshoot.
for ob in [drawer,slide,folder,hinge,cam,cam_data]:
    action=ob.animation_data.action
    for layer in action.layers:
        for strip in layer.strips:
            for bag in strip.channelbags:
                for fc in bag.fcurves:
                    for k in fc.keyframe_points:
                        k.interpolation='BEZIER'; k.handle_left_type='AUTO_CLAMPED'; k.handle_right_type='AUTO_CLAMPED'
for f,label in [(1,'ARRIVAL'),(24,'SIMULATED CLICK'),(66,'DRAWER CLEAR'),(94,'FOLDER LIFTED'),(135,'COVER BEGINS'),(166,'FOLDER SETTLES'),(197,'READING HOLD'),(240,'END')]:
    s.timeline_markers.new(label,frame=f)
s['status']='First motion proposal; materials, timing and pale floor are unapproved studies.'
s['content']='Fictional project labels and synthetic photographic placeholders only.'
s.frame_set(1)
for area_ui in bpy.context.screen.areas if bpy.context.screen else []:
    if area_ui.type=='VIEW_3D':
        area_ui.spaces.active.region_3d.view_perspective='CAMERA'
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'archive-motion-draft.blend'))
print('Draft saved:',OUT)
