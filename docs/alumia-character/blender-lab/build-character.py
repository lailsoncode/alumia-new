"""Native 3D volume study, not PNG-to-3D reconstruction or final character art.
Run with Blender --background --python build-character.py.
Only writes inside this isolated lab. Does not modify the Rive project or app.
"""
import bpy
import math
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'build'
OUT.mkdir(exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def material(name, color, roughness=.65, metallic=0):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1)
    m.use_nodes = True
    bs = m.node_tree.nodes.get('Principled BSDF')
    bs.inputs['Base Color'].default_value = (*color, 1)
    bs.inputs['Roughness'].default_value = roughness
    bs.inputs['Metallic'].default_value = metallic
    return m

skin = material('Pele quente', (.58, .235, .09))
ear = material('Interior das orelhas', (.40, .12, .046))
hair = material('Cachos castanhos', (.055, .019, .009), .72)
hair_soft = material('Mechas iluminadas', (.074, .027, .012), .73)
gold = material('Armação dourado-amarronzada', (.38, .17, .033), .3, .65)
shirt = material('Camiseta coral', (.68, .115, .065), .9)
seam = material('Costura coral', (.46, .067, .035), .9)
white = material('Olhos creme', (.94, .87, .71), .45)
iris = material('Íris castanha', (.095, .029, .008), .4)
dark = material('Pupilas e cílios', (.023, .007, .003), .5)
lip = material('Sorriso', (.23, .046, .017), .7)

def empty(name, location, parent=None):
    ob = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(ob)
    ob.location = location
    ob.parent = parent
    return ob

root = empty('Alumia_3D_Study', (0, 0, 0))
torso = empty('Torso', (0, 0, 0), root)
head = empty('Head', (0, 0, 1.47), torso)
geometry = []

def finish(ob, name, mat, parent):
    ob.name = name
    ob.data.materials.append(mat)
    ob.parent = parent
    for p in ob.data.polygons:
        p.use_smooth = True
    geometry.append(ob)
    return ob

def ellipsoid(name, loc, scale, mat, parent=head, rot=0):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=20, location=loc)
    ob = bpy.context.object
    ob.scale = scale
    ob.rotation_euler[1] = rot
    return finish(ob, name, mat, parent)

def rings(name, rows, mat, parent, segments=64):
    # Each ring: height, half-width, front/back depth, depth offset.
    verts, faces = [], []
    for z, w, d, cy in rows:
        for i in range(segments):
            a = i * math.tau / segments
            verts.append((w * math.cos(a), cy + d * math.sin(a), z))
    for j in range(len(rows)-1):
        for i in range(segments):
            k = j*segments+i
            nxt = j*segments+(i+1)%segments
            faces.append((k, nxt, nxt+segments, k+segments))
    faces.append(tuple(reversed(range(segments))))
    faces.append(tuple((len(rows)-1)*segments+i for i in range(segments)))
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    ob = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(ob)
    finish(ob, name, mat, parent)
    mod = ob.modifiers.new('Superfície suave', 'SUBSURF')
    mod.levels = 2
    return ob

def curve(name, points, radius, mat, parent=head, cyclic=False):
    c = bpy.data.curves.new(name, 'CURVE')
    c.dimensions = '3D'
    c.resolution_u = 10
    c.bevel_depth = radius
    c.bevel_resolution = 3
    s = c.splines.new('BEZIER')
    s.bezier_points.add(len(points)-1)
    for b, p in zip(s.bezier_points, points):
        b.co = p[:3]
        b.radius = p[3] if len(p)>3 else 1
        b.handle_left_type = b.handle_right_type = 'AUTO'
    s.use_cyclic_u = cyclic
    ob = bpy.data.objects.new(name, c)
    bpy.context.collection.objects.link(ob)
    ob.parent = parent
    c.materials.append(mat)
    geometry.append(ob)
    return ob

# Shaped jaw, cheek and forehead rings, rather than a spherical head.
rings('Rosto', [(-.14,.05,.05,-.03),(-.11,.23,.18,-.035),
    (-.025,.40,.28,-.025),(.10,.53,.33,0),(.29,.585,.37,.025),
    (.51,.57,.395,.03),(.72,.51,.36,.04),(.89,.38,.29,.045),
    (.97,.15,.12,.04),(.985,.02,.02,.04)], skin, head)
rings('Pescoço', [(1.05,.21,.18,.045),(1.19,.20,.18,.045),
    (1.38,.16,.16,.04),(1.52,.17,.17,.035)], skin, torso)
rings('Camiseta', [(.23,.44,.22,.06),(.25,.45,.23,.06),
    (.55,.47,.255,.065),(.83,.51,.24,.065),
    (1.02,.46,.21,.065),(1.13,.28,.17,.06),(1.14,.23,.16,.06)], shirt, torso)
for side in [-1,1]:
    ellipsoid('Manga_'+str(side),(side*.47,.045,.87),(.19,.22,.30),shirt,torso,side*.33)
    ellipsoid('Braço_'+str(side),(side*.53,.045,.52),(.13,.15,.27),skin,torso,side*.09)
    ellipsoid('Orelha_'+str(side),(side*.57,-.005,.23),(.13,.083,.17),skin)
    ellipsoid('Orelha_interna_'+str(side),(side*.605,-.074,.235),(.065,.016,.103),ear)
curve('Gola', [(-.22,-.105,1.14),(-.16,-.205,1.035),(0,-.223,1.00),
    (.16,-.205,1.035),(.22,-.105,1.14)], .014,seam,torso)

# Short bob: rear mass sits behind the face, side locks end beside the neck.
ellipsoid('Cabelo_traseiro',(0,.18,.40),(.64,.43,.69),hair)
for side in [-1,1]:
    for j in range(4):
        z=.66-j*.21
        x=side*(.565 + (.015 if j%2 else -.015))
        curve('Cacho_lateral_'+str(side)+'_'+str(j),[
            (x*.91,-.025,z+.17,.72),(x+side*.055,-.085,z+.09,1),
            (x+side*.035,-.095,z-.015,1),(x-side*.045,-.035,z-.14,.35)
        ], .145, hair_soft if j%2 else hair)
    for j in range(4):
        curve('Cacho_traseiro_'+str(side)+'_'+str(j),[
            (side*(.12+j*.13),.42,.81-j*.045,.5),
            (side*(.15+j*.145),.51,.48,1),
            (side*(.10+j*.13),.44,.06,.8),
            (side*(.06+j*.13),.32,-.17,.3)], .14,hair)
# Swept part and broad wave, explicitly clear of the central neck/chest.
curve('Mecha_frontal_esquerda',[(.09,-.21,.96,.45),(-.12,-.31,.965,1),
    (-.35,-.33,.86,1.12),(-.48,-.28,.71,.85),(-.57,-.19,.56,.35)],.16,hair_soft)
curve('Mecha_frontal_direita',[(.09,-.20,.96,.4),(.27,-.28,.92,.9),
    (.43,-.28,.79,1),(.51,-.22,.66,.7),(.57,-.14,.52,.3)],.15,hair)

eye_groups = []
for side in [-1,1]:
    x = side*.252
    group = empty('Eye_'+('L' if side<0 else 'R'), (x,-.347,.43), head)
    eye_groups.append(group)
    ellipsoid('Branco_'+str(side),(0,0,0),(.157,.067,.18),white,group)
    ellipsoid('Iris_'+str(side),(-side*.014,-.058,-.005),(.096,.026,.135),iris,group)
    ellipsoid('Pupila_'+str(side),(-side*.014,-.082,-.005),(.065,.012,.103),dark,group)
    ellipsoid('Reflexo_'+str(side),(-.04,-.094,.059),(.025,.008,.031),white,group)
    curve('Cilio_'+str(side),[(-.143,-.024,.045,.5),(-.11,-.044,.135,1),
        (0,-.048,.179,1),(.10,-.04,.14,.9),(.15,-.02,.073,.25)],.012,dark,group)
    curve('Sobrancelha_'+str(side),[(x-.13,-.305,.697,.4),
        (x-.045,-.343,.728,1),(x+.055,-.328,.72,.9),(x+.125,-.305,.682,.25)],.029,hair)
    # Full 3D frame plus temple arms. No opaque disk over the eye.
    points=[(x+.207*math.cos(a),-.432+.025*math.cos(a)**2,
             .43+.222*math.sin(a)) for a in [i*math.tau/24 for i in range(24)]]
    curve('Aro_'+str(side), points,.022,gold,cyclic=True)
    curve('Haste_'+str(side),[(side*.455,-.412,.45),(side*.56,-.22,.46),
        (side*.615,.035,.41),(side*.60,.06,.29)],.018,gold)
curve('Ponte_oculos',[(-.045,-.423,.45),(0,-.457,.474),(.045,-.423,.45)],.019,gold)
ellipsoid('Nariz',(0,-.376,.256),(.092,.108,.083),skin)
curve('Sorriso',[(-.145,-.286,.082,.38),(-.093,-.322,.046,.9),
    (0,-.34,.03,1),(.093,-.322,.046,.9),(.145,-.286,.082,.38)],.014,lip)

# Reference planes are editor-only empties, never exported as character geometry.
references = bpy.data.collections.new('REFERÊNCIAS · não exportar')
bpy.context.scene.collection.children.link(references)
for name,file,x in [('Busto canônico','alumia-bust-master-v2.png',-2),
                     ('Vistas','alumia-bust-turnaround-v2.png',2.8)]:
    ob=bpy.data.objects.new(name,None)
    references.objects.link(ob)
    ob.empty_display_type='IMAGE'
    ob.data=bpy.data.images.load(str(ROOT.parent/'reference-pack-v2'/file))
    ob.data.pack()
    ob.empty_display_size=2.8
    ob.location=(x,.8,1.35)
    ob.rotation_euler=(math.pi/2,0,0)
    ob.hide_render=True

# Transform animations test the .blend -> GLB -> real-time pipeline.
# Eye squash is a placeholder: final facial rig needs eyelid meshes/shape keys.
for frame,angle in [(1,0),(60,-.035),(120,.03),(180,0)]:
    head.rotation_euler=(0,angle,angle*.35)
    head.keyframe_insert(data_path='rotation_euler',frame=frame)
for frame,z in [(1,1),(90,1.008),(180,1)]:
    torso.scale=(1,1,z)
    torso.keyframe_insert(data_path='scale',frame=frame)
for group in eye_groups:
    for frame,z in [(1,1),(65,1),(68,.055),(72,.055),(76,1),(180,1)]:
        group.scale=(1,1,z)
        group.keyframe_insert(data_path='scale',frame=frame)
for ob in [head,torso,*eye_groups]:
    action=ob.animation_data.action
    action.name='Idle_'+ob.name
    track=ob.animation_data.nla_tracks.new()
    track.name='Idle'
    track.strips.new(action.name,1,action)
    ob.animation_data.action=None

scene=bpy.context.scene
scene.frame_start=1
scene.frame_end=180
scene.render.fps=30
scene.frame_set(1)
scene.world.color=(.3,.3,.3)
scene.render.engine='CYCLES'
scene.cycles.samples=24
scene.render.resolution_x=800
scene.render.resolution_y=900
scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'
scene.render.film_transparent=True
scene.view_settings.view_transform='AgX'

def aim(ob, target):
    ob.rotation_euler=(Vector(target)-ob.location).to_track_quat('-Z','Y').to_euler()
for name,loc,power,size in [('Key',(-3,-4,5),550,4),('Fill',(3,-2,3),250,3),('Rim',(1,3,4),400,3)]:
    bpy.ops.object.light_add(type='AREA',location=loc)
    ob=bpy.context.object
    ob.name=name
    ob.data.energy=power
    ob.data.shape='DISK'
    ob.data.size=size
    aim(ob,(0,0,1.3))
bpy.ops.object.camera_add(location=(0,-6,2.25))
camera=bpy.context.object
camera.data.type='ORTHO'
camera.data.ortho_scale=2.85
aim(camera,(0,0,1.35))
scene.camera=camera

# Bake smoothing, curves and object dimensions to ordinary mesh geometry.
for ob in geometry:
    bpy.ops.object.select_all(action='DESELECT')
    ob.select_set(True)
    bpy.context.view_layer.objects.active=ob
    bpy.ops.object.convert(target='MESH')
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
scene.frame_set(1)
bpy.ops.object.select_all(action='DESELECT')
for ob in [root,torso,head,*eye_groups,*geometry]:
    ob.select_set(True)
bpy.context.view_layer.objects.active=root

props={p.identifier for p in bpy.ops.export_scene.gltf.get_rna_type().properties}
options=dict(filepath=str(OUT/'alumia-volume-study.glb'),export_format='GLB',
             use_selection=True,export_animations=True,export_cameras=False,export_lights=False)
if 'export_animation_mode' in props:
    options['export_animation_mode']='NLA_TRACKS'
bpy.ops.export_scene.gltf(**options)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'alumia-volume-study.blend'))
for view,loc in [('front',(0,-6,2.0)),('three-quarter',(3,-6,2.2)),('profile',(6,-.1,2.0))]:
    camera.location=loc
    aim(camera,(0,0,1.35))
    scene.render.filepath=str(OUT/(view+'.png'))
    bpy.ops.render.render(write_still=True)
print('ALUMIA_LAB_COMPLETE',OUT)
