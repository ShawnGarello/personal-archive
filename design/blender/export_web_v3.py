"""Export the V3 entrance objects for the Wave 1B browser prototype.

Blender 5.1.2, from the repository root:
  blender -b artifacts/archive-motion-draft/v3/archive-motion-v3.blend --python-exit-code 1 --python design/blender/export_web_v3.py

Reads the saved V3 scene and never saves it. Writes one GLB and a provenance
manifest to app/src/assets/scene/. Page-content text/images, the paper-flex
lattice, lights and the ground are excluded: the browser supplies semantic
HTML, lighting and a shadow-only floor. Frames 18-156 (activation to the V3
reading lock) are sampled at 24 fps into one clip that starts at zero.
"""
import bpy
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'app' / 'src' / 'assets' / 'scene'
GLB = OUT / 'archive-entrance-v3.glb'
MANIFEST = OUT / 'archive-entrance-v3.json'
SCENE = 'Archive_Motion_V3'
FIRST, LAST = 18, 156  # ENTRANCE ACTIVATION marker to PAGE 01 READING / CAMERA LOCK
PAGE_ROOTS = ('V3 | PAGE 01 | top attachment hinge', 'V3 | PAGE 02 | fixed document')
KEEP_ON_PAGES = ('V3 | Page 01 paper', 'V3 | Page 02 paper')
EXCLUDED_NAMES = ('V3 | Seamless pale ground',)

if SCENE not in bpy.data.scenes:
    raise RuntimeError(f'{SCENE} not found; open the saved V3 .blend.')
s = bpy.data.scenes[SCENE]
bpy.context.window.scene = s


def excluded(o):
    if o.type in {'LIGHT', 'LATTICE'} or o.name in EXCLUDED_NAMES:
        return True
    return o.parent is not None and o.parent.name in PAGE_ROOTS and o.name not in KEEP_ON_PAGES


selected = [o for o in s.objects if not excluded(o)]
for o in s.objects:
    o.select_set(False)
for o in selected:
    o.hide_set(False)
    o.select_set(True)
bpy.context.view_layer.objects.active = s.camera
# Labels are 0.0001 deep in V3; export them flat and coarser to keep the GLB small.
for o in selected:
    if o.type == 'FONT':
        o.data.extrude = 0
        o.data.resolution_u = 3

# Temporary in-memory range and label settings; the source file is not saved.
s.frame_start, s.frame_end = FIRST, LAST
s.frame_set(FIRST)
OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.export_scene.gltf(
    filepath=str(GLB), export_format='GLB', use_selection=True, use_active_scene=True,
    export_yup=True, export_apply=True, export_cameras=True, export_lights=False,
    export_extras=True, export_materials='EXPORT', export_image_format='NONE', export_texcoords=False,
    export_morph=False, export_animations=True, export_animation_mode='SCENE',
    export_anim_scene_split_object=False, export_frame_range=True, export_anim_slide_to_zero=True,
    export_force_sampling=True, export_frame_step=1, export_optimize_animation_size=True,
    export_nla_strips_merged_animation_name='V3 entrance')

data = GLB.read_bytes()
json_len = int.from_bytes(data[12:16], 'little')
gltf = json.loads(data[20:20 + json_len])
if gltf.get('images') or gltf.get('textures'):
    raise RuntimeError('Unexpected image data in the web export.')
nodes = gltf['nodes']
parent = {c: i for i, n in enumerate(nodes) for c in n.get('children', [])}
animated = sorted({nodes[ch['target']['node']]['name'] for a in gltf.get('animations', []) for ch in a['channels']})
manifest = {
    'asset': GLB.name,
    'bytes': len(data),
    'sha256': hashlib.sha256(data).hexdigest(),
    'source': {
        'scene': SCENE,
        'blend': 'artifacts/archive-motion-draft/v3/archive-motion-v3.blend (local, rebuildable)',
        'builders': ['design/blender/rebuild_all.py', 'design/blender/build_archive_v3.py'],
        'exporter': 'design/blender/export_web_v3.py',
        'blender': bpy.app.version_string,
    },
    'frames': {'first': FIRST, 'last': LAST, 'fps': s.render.fps, 'clip_seconds': round((LAST - FIRST) / s.render.fps, 4)},
    'coordinates': 'glTF Y-up metres-as-Blender-units: Blender (x, y, z) -> glTF (x, z, -y). Scale unchanged.',
    'excluded': ['page text and image placeholders (HTML supplies content)', 'PAGE FLEX lattice (paper at rest)', 'lights', 'Seamless pale ground'],
    'simplified': 'Label text exported flat (extrude 0) at curve resolution 3; geometry otherwise as evaluated at frame 18 with modifiers applied.',
    'animated_nodes': animated,
    'nodes': [{'name': n['name'], 'parent': nodes[parent[i]]['name'] if i in parent else None} for i, n in enumerate(nodes)],
}
MANIFEST.write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
print('Exported', GLB, len(data), 'bytes;', len(nodes), 'nodes;', 'animated:', animated)
sys.stdout.flush()
