// Scene adapter: owns the renderer, the exported V3 clip, the turning sheet and
// the camera. Reports page placement to the reading surface; never changes navigation.
import {
  AgXToneMapping, AnimationMixer, Box3, CircleGeometry, Color, DirectionalLight, Fog, LoopOnce, Matrix4, Mesh,
  MeshStandardMaterial, Object3D, PCFShadowMap, PerspectiveCamera, PlaneGeometry, PMREMGenerator, Quaternion,
  Raycaster, Scene, ShadowMaterial, SpotLight, SRGBColorSpace, Vector2, Vector3, WebGLRenderer,
  type AnimationAction, type BufferAttribute, type Material, type RGB,
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { ArchiveScene, SceneHooks } from './controller';
import {
  entranceClock, readingBox, smoothstep, turnPose, verticalFov, TURN_ANGLE,
  type Quad, type Rect, type Reserve, type SheetPose, type Viewport,
} from './geometry';

const FPS = 24;
const FIRST_FRAME = 18; // V3 "ENTRANCE ACTIVATION"; clip time 0.
const frameTime = (frame: number): number => (frame - FIRST_FRAME) / FPS;
/** V3 hands over from the exported follow camera to the reading camera between these frames. */
const APPROACH = [frameTime(132), frameTime(156)] as const;
/** The HTML text appears once the opening cover has swung clear of the page. */
const TEXT_FADE = [frameTime(116), frameTime(130)] as const;
/** V3's camera approaches the cabinet until frame 66, while the drawer opens (frames 18–50). */
const CABINET_APPROACH_END = frameTime(66);
const BACKGROUND = new Color('#f4f3ef');
/** Reading setup (Wave 1B): key light, environment and shadow-only floor. */
const KEY_INTENSITY = 1.6;
const READING_ENVIRONMENT = 0.75;
const FLOOR_SHADOW = 0.1;
/**
 * Charcoal entrance study: a spotlit cabinet on a charcoal stage whose floor
 * fades into matching fog. The environment stays on, dimmed, so the cabinet's
 * sides still read.
 */
const CHARCOAL = new Color('#232427');
const STAGE_FLOOR = new Color('#3f3f43');
const SPOT_INTENSITY = 360;
const ENTRANCE_ENVIRONMENT = 0.3;
const STAGE_FOG = [26, 60] as const;
/** The stage changes to the reading setup as the folder becomes the page (cover opening). */
const LIGHT_CHANGE = [frameTime(100), frameTime(124)] as const;
/** Frames longer than this (under 10 fps) count as slow rendering. */
const SLOW_FRAME = 0.1;
/** This many consecutive slow frames settle the entrance or a turn; one hitch does not. */
const SLOW_FRAMES_TO_SETTLE = 3;
/** Largest entrance timeline advance for a single frame, in real seconds. */
const MAX_STEP = 0.25;
/** V3 page turn, frames 204–246. */
const TURN_DURATION = 42 / FPS;
/** Sheet length along its local z axis; the top attachment is z = 0. */
const SHEET_LENGTH = 2.1;
/** V3 "Free edge lag" displacement of the free edge at full weight, in sheet units. */
const BEND_DEPTH = 0.18;
const degrees = (value: number): number => (value * Math.PI) / 180;
/**
 * Text carried by a lifting sheet fades out between these angles, before the
 * sheet is too foreshortened (and too curved) for a flat mapping; it fades back
 * in over the same range as a returning sheet lands.
 */
const CARRIED_TEXT_FADE = [degrees(40), degrees(70)] as const;
const X_AXIS = new Vector3(1, 0, 0);
const Y_AXIS = new Vector3(0, 1, 0);
/** Idle pointer orbit (study): turn about the cabinet with the pointer at a viewport edge. */
const ORBIT_YAW = degrees(7);
const ORBIT_PITCH = degrees(2.5);
/** Easing towards the pointer, per second: about 95% of the way in 0.75 s. */
const ORBIT_RATE = 4;

export type PaperLayout =
  /** Entrance: the page follows the moving folder. */
  | { readonly kind: 'moving'; readonly quad: Quad | null; readonly settled: Rect; readonly opacity: number }
  /**
   * Page turn: `upper` is the document printed on the turning sheet, carried by
   * `quad` at `opacity`; the document beneath is uncovered below screen y `cover`.
   */
  | {
    readonly kind: 'turning'; readonly settled: Rect; readonly upper: number;
    readonly quad: Quad | null; readonly opacity: number; readonly cover: number;
  }
  /** At rest; `sheet` is the document the sheets currently show. */
  | { readonly kind: 'settled'; readonly settled: Rect; readonly sheet: number };

export type Look = 'charcoal' | 'pale';

export interface SceneOptions extends SceneHooks {
  readonly canvas: HTMLCanvasElement;
  readonly url: string;
  /** Reading page height as a fraction of viewport height (framing study). */
  readonly framing: number;
  /** Real duration of the camera's approach to the cabinet as a fraction of V3's (timing study). */
  readonly approach: number;
  /** A mouse turns the idle arrival view about the cabinet (orbit study). */
  readonly orbit: boolean;
  /** Entrance appearance: the charcoal stage (study) or Wave 1B's pale surround throughout. */
  readonly look: Look;
  /** Whether the backdrop behind the page chrome is pale, reported when it changes. */
  readonly backdrop: (pale: boolean) => void;
  readonly reserve: (viewport: Viewport) => Reserve;
  readonly layout: (layout: PaperLayout) => void;
}

/** One real-time timeline: the entrance or a single turn. */
interface Motion {
  time: number;
  readonly duration: number;
  /** Cap on a single frame's advance, so one hitch resumes instead of jumping. */
  readonly maxStep: number;
  readonly advance: (time: number) => void;
  readonly finish: () => void;
}

const name = (label: string): string => label.replace(/\s/g, '_').replace(/[[\]./:]/g, '');

export async function loadArchiveScene(options: SceneOptions): Promise<ArchiveScene> {
  const renderer = new WebGLRenderer({ canvas: options.canvas, antialias: true, powerPreference: 'high-performance' });
  try {
    return await build(renderer, options);
  } catch (error) {
    renderer.dispose();
    throw error;
  }
}

async function build(renderer: WebGLRenderer, options: SceneOptions): Promise<ArchiveScene> {
  const { canvas } = options;
  const gltf = await new GLTFLoader().loadAsync(options.url);
  const clip = gltf.animations[0];
  const root = gltf.scene;
  const find = (label: string): Object3D => {
    const found = root.getObjectByName(name(label));
    if (!found) throw new Error(`Scene export is missing ${label}`);
    return found;
  };
  const exportedCamera = find('V3 | CAMERA | follow and settle');
  const cabinet = find('V3 | CABINET | fixed assembly');
  // The first sheet is both the entrance's reading page and the sheet that turns.
  const hinge = find('V3 | PAGE 01 | top attachment hinge');
  const sheet = find('V3 | Page 01 paper');
  const drawer = find('V3 | DRAWER | slide Y');
  if (!clip) throw new Error('Scene export has no entrance clip');
  if (!(sheet instanceof Mesh)) throw new Error('Scene export page is not a single mesh');

  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = AgXToneMapping;
  renderer.toneMappingExposure = 1.35;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;

  const scene = new Scene();
  const backdrop = BACKGROUND.clone();
  scene.background = backdrop;
  const pmrem = new PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  scene.environment = pmrem.fromScene(room, 0.04).texture;
  scene.environmentIntensity = READING_ENVIRONMENT;
  room.dispose();
  pmrem.dispose();

  // Key light comes from V2's "Large softbox" side, raised to shorten the hard
  // shadow; shadows fall behind the cabinet, away from the reading position.
  const key = new DirectionalLight(0xffffff, KEY_INTENSITY);
  key.position.set(-2.5, 10, 1.5);
  key.target.position.set(0, 0, 3);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 30 });
  key.shadow.bias = -0.0004;
  key.shadow.radius = 6;
  scene.add(key, key.target);

  // Shadow-only floor: the background colour is the floor everywhere else.
  const floorShadow = new ShadowMaterial({ opacity: FLOOR_SHADOW });
  const floor = new Mesh(new PlaneGeometry(60, 60), floorShadow);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.01;
  floor.receiveShadow = true;
  scene.add(floor, root);

  // Charcoal stage (study). A soft spotlight from above and in front leaves a
  // pool of light around the cabinet and a blurred shadow behind it; the lit
  // floor beneath the shadow-only one fades into fog of the backdrop colour.
  const charcoal = options.look === 'charcoal';
  const spot = new SpotLight(0xfff5ea, SPOT_INTENSITY, 0, degrees(22), 0.8, 2);
  const stageMaterial = new MeshStandardMaterial({ color: STAGE_FLOOR, roughness: 0.95, transparent: true });
  const stage = new Mesh(new CircleGeometry(90, 96), stageMaterial);
  const fog = new Fog(CHARCOAL.clone(), STAGE_FOG[0], STAGE_FOG[1]);
  if (charcoal) {
    spot.position.set(-1.4, 12, 5.5);
    spot.target.position.set(0, 1.2, 0.4);
    spot.castShadow = true;
    spot.shadow.mapSize.set(1024, 1024);
    spot.shadow.bias = -0.0006;
    spot.shadow.radius = 12;
    Object.assign(spot.shadow.camera, { near: 4, far: 30 });
    stage.rotation.x = -Math.PI / 2;
    stage.position.y = -0.02;
    stage.receiveShadow = true;
    stage.renderOrder = -1; // Beneath the shadow-only floor as it fades in.
    scene.fog = fog;
    scene.add(spot, spot.target, stage);
  }
  root.traverse((object) => {
    if ((object as Mesh).isMesh) (object as Mesh).castShadow = true;
  });

  let lighting = -1;
  let paleBackdrop: boolean | null = null;
  // The backdrop blends in sRGB so that it brightens evenly to the eye.
  const [dark, pale] = [CHARCOAL, BACKGROUND].map((color) => color.getRGB({ r: 0, g: 0, b: 0 }, SRGBColorSpace)) as [RGB, RGB];
  /** 0 is the charcoal stage; 1 is exactly the reading setup. */
  const light = (mix: number): void => {
    if (mix === lighting) return;
    lighting = mix;
    const mixed = (from: number, to: number): number => from * (1 - mix) + to * mix;
    if (mix >= 1) backdrop.copy(BACKGROUND);
    else backdrop.setRGB(mixed(dark.r, pale.r), mixed(dark.g, pale.g), mixed(dark.b, pale.b), SRGBColorSpace);
    fog.color.copy(backdrop);
    key.intensity = mixed(0, KEY_INTENSITY);
    key.shadow.autoUpdate = mix > 0;
    spot.intensity = mixed(SPOT_INTENSITY, 0);
    spot.shadow.autoUpdate = mix < 1;
    scene.environmentIntensity = mixed(ENTRANCE_ENVIRONMENT, READING_ENVIRONMENT);
    stageMaterial.opacity = 1 - mix;
    stage.visible = mix < 1;
    floorShadow.opacity = mixed(0, FLOOR_SHADOW);
    floor.visible = mix > 0;
    if (paleBackdrop !== mix >= 0.5) {
      paleBackdrop = mix >= 0.5;
      options.backdrop(paleBackdrop);
    }
  };
  light(charcoal ? 0 : 1);
  // An unlit light skips shadow updates, but its map must exist: WebGL rejects draws sampling a missing one.
  key.shadow.needsUpdate = true;
  spot.shadow.needsUpdate = true;

  const mixer = new AnimationMixer(root);
  const action: AnimationAction = mixer.clipAction(clip);
  action.setLoop(LoopOnce, 1);
  action.clampWhenFinished = true;
  action.play();
  const duration = clip.duration;
  const clock = entranceClock(duration, CABINET_APPROACH_END, options.approach);

  // Sheet flex: V3's lattice moved the free edge along the sheet normal in
  // proportion to the squared distance from the attachment. The same profile
  // is applied to the sheet's vertices on the CPU (910 vertices).
  const positions = sheet.geometry.getAttribute('position') as BufferAttribute;
  const normals = sheet.geometry.getAttribute('normal') as BufferAttribute;
  const flatY = Float32Array.from({ length: positions.count }, (_, i) => positions.getY(i));
  const along = Float32Array.from({ length: positions.count }, (_, i) => (positions.getZ(i) / SHEET_LENGTH) ** 2);
  const flatNormals = Float32Array.from(normals.array);
  const restHinge = hinge.quaternion.clone();
  const hingeTurn = new Quaternion();
  sheet.frustumCulled = false; // Bending changes the bounds.
  let bent = 0;

  const poseSheet = ({ angle, bend }: SheetPose): void => {
    // V3 rotates the attachment by −angle about local X, lifting the free edge towards the camera.
    hinge.quaternion.copy(restHinge).multiply(hingeTurn.setFromAxisAngle(X_AXIS, -angle));
    if (bend === bent) return;
    bent = bend;
    for (let i = 0; i < positions.count; i += 1) positions.setY(i, (flatY[i] ?? 0) + bend * BEND_DEPTH * (along[i] ?? 0));
    positions.needsUpdate = true;
    if (bend === 0) {
      normals.copyArray(flatNormals);
      normals.needsUpdate = true;
    } else {
      sheet.geometry.computeVertexNormals();
    }
  };
  /** With two V3 sheets, the first document rests flat and the second shows once the sheet is turned over. */
  const restPose = (index: number): SheetPose => ({ angle: index > 0 ? TURN_ANGLE : 0, bend: 0 });

  const camera = new PerspectiveCamera(30, 1, 0.05, 250);
  const reading = { position: new Vector3(), quaternion: new Quaternion(), rect: { x: 0, y: 0, width: 0, height: 0 } as Rect };
  const viewport = { width: 1, height: 1 };
  const scratch = new Vector3();
  let motion: Motion | null = null;
  let entranceTime = 0;
  /** Document the sheets rest on when no turn is running. */
  let shown = 0;
  let turning: { readonly to: number; readonly forward: boolean; progress: number } | null = null;
  let frame = 0;
  let last = 0;
  let slowFrames = 0;
  /** Orbit angles in radians: `aim` follows the mouse while idle; `view` eases towards it and is frozen by the entrance. */
  const aim = { yaw: 0, pitch: 0 };
  const view = { yaw: 0, pitch: 0 };
  const orbitTurn = new Quaternion();
  const pitchTurn = new Quaternion();
  let orbitAllowed = options.orbit;
  let orbitFrame = 0;
  let orbitLast = 0;

  const sample = (time: number): void => {
    action.paused = false;
    action.time = Math.min(time, duration);
    mixer.update(0);
    root.updateMatrixWorld(true);
  };

  // The orbit pivot: the point on the arrival camera's axis nearest the cabinet's centre.
  sample(0);
  const arrivalPosition = new Vector3().setFromMatrixPosition(exportedCamera.matrixWorld);
  const arrivalAxis = new Vector3(0, 0, -1).transformDirection(exportedCamera.matrixWorld);
  const cabinetCentre = new Box3().setFromObject(cabinet).getCenter(new Vector3());
  const pivot = arrivalPosition.clone().addScaledVector(arrivalAxis, cabinetCentre.sub(arrivalPosition).dot(arrivalAxis));

  /** Turn the camera about the pivot: pitch raises it (looking further down), then yaw moves it right. */
  const orbitCamera = (yaw: number, pitch: number): void => {
    orbitTurn.setFromAxisAngle(Y_AXIS, yaw).multiply(pitchTurn.setFromAxisAngle(X_AXIS, -pitch));
    camera.position.sub(pivot).applyQuaternion(orbitTurn).add(pivot);
    camera.quaternion.premultiply(orbitTurn);
  };

  /** Sheet corners (top-left, top-right, bottom-right, bottom-left) in world space, following the flex. */
  const sheetCorners = (bend = 0): Vector3[] => {
    const y = 0.0015, drop = bend * BEND_DEPTH;
    return [[-0.74, y, 0], [0.74, y, 0], [0.74, y + drop, SHEET_LENGTH], [-0.74, y + drop, SHEET_LENGTH]]
      .map(([cx, cy, cz]) => new Vector3(cx, cy, cz).applyMatrix4(sheet.matrixWorld));
  };

  const project = (points: Vector3[]): Quad => {
    const [a, b, c, d] = points.map((point) => {
      const p = point.clone().project(camera);
      return { x: ((p.x + 1) / 2) * viewport.width, y: ((1 - p.y) / 2) * viewport.height };
    }) as [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }, { x: number; y: number }];
    return [a, b, c, d];
  };

  /** Lowest screen y covered by the turning sheet; the document beneath is visible below it. */
  const coverBottom = (): number => {
    let lowest = -Infinity;
    for (let i = 0; i < positions.count; i += 1) {
      scratch.fromBufferAttribute(positions, i).applyMatrix4(sheet.matrixWorld).project(camera);
      lowest = Math.max(lowest, ((1 - scratch.y) / 2) * viewport.height);
    }
    return lowest;
  };

  /** Perpendicular camera above the settled page, sized to the framing study. */
  const computeReadingPose = (): void => {
    poseSheet(restPose(0)); // The reading page is the first sheet at rest.
    sample(duration);
    const [tl, tr, , bl] = sheetCorners() as [Vector3, Vector3, Vector3, Vector3];
    const across = tr.clone().sub(tl), down = bl.clone().sub(tl);
    const center = tl.clone().addScaledVector(across, 0.5).addScaledVector(down, 0.5);
    const xAxis = across.clone().normalize(), yAxis = down.clone().normalize().negate();
    const zAxis = new Vector3().crossVectors(xAxis, yAxis).normalize();
    const box = readingBox(viewport, across.length() / down.length(), options.framing, options.reserve(viewport));
    const tanHalf = Math.tan(camera.fov * Math.PI / 360);
    const distance = (down.length() * viewport.height) / (2 * tanHalf * box.pageHeight);
    const worldPerPixel = (2 * distance * tanHalf) / viewport.height;
    const offsetX = (box.centerX - viewport.width / 2) * worldPerPixel;
    const offsetY = (viewport.height / 2 - box.centerY) * worldPerPixel;
    reading.position.copy(center).addScaledVector(zAxis, distance).addScaledVector(xAxis, -offsetX).addScaledVector(yAxis, -offsetY);
    reading.quaternion.setFromRotationMatrix(new Matrix4().makeBasis(xAxis, yAxis, zAxis));
    camera.position.copy(reading.position);
    camera.quaternion.copy(reading.quaternion);
    camera.updateMatrixWorld(true);
    const quad = project(sheetCorners());
    const xs = quad.map((p) => p.x), ys = quad.map((p) => p.y);
    const x = Math.round(Math.min(...xs)), y = Math.round(Math.min(...ys));
    reading.rect = { x, y, width: Math.round(Math.max(...xs)) - x, height: Math.round(Math.max(...ys)) - y };
  };

  const layout = (): PaperLayout => {
    const settled = reading.rect;
    if (entranceTime < duration) {
      const opacity = smoothstep(TEXT_FADE[0], TEXT_FADE[1], entranceTime);
      return { kind: 'moving', quad: opacity > 0 ? project(sheetCorners()) : null, settled, opacity };
    }
    if (turning) {
      const pose = turnPose(turning.progress, turning.forward);
      const opacity = 1 - smoothstep(CARRIED_TEXT_FADE[0], CARRIED_TEXT_FADE[1], pose.angle);
      return {
        kind: 'turning', settled, upper: Math.min(shown, turning.to),
        quad: opacity > 0 ? project(sheetCorners(pose.bend)) : null, opacity, cover: coverBottom(),
      };
    }
    return { kind: 'settled', settled, sheet: shown };
  };

  /** Render the current entrance time and sheet pose, then report the page placement. */
  const draw = (): void => {
    poseSheet(turning ? turnPose(turning.progress, turning.forward) : restPose(shown));
    sample(entranceTime);
    exportedCamera.matrixWorld.decompose(camera.position, camera.quaternion, scratch);
    // The approach to the cabinet releases the idle orbit, continuing from the angle the visitor left.
    const orbitWeight = 1 - smoothstep(0, CABINET_APPROACH_END, entranceTime);
    if (orbitWeight > 0 && (view.yaw !== 0 || view.pitch !== 0)) orbitCamera(view.yaw * orbitWeight, view.pitch * orbitWeight);
    // At the end of the entrance the weight is 1: the camera is exactly the
    // reading pose and stays there. Turns never move it.
    const weight = smoothstep(APPROACH[0], APPROACH[1], entranceTime);
    if (weight > 0) {
      camera.position.lerp(reading.position, weight);
      camera.quaternion.slerp(reading.quaternion, weight);
    }
    camera.updateMatrixWorld(true);
    if (charcoal) light(smoothstep(LIGHT_CHANGE[0], LIGHT_CHANGE[1], entranceTime));
    renderer.render(scene, camera);
    options.layout(layout());
  };

  const resize = (): void => {
    viewport.width = Math.max(1, window.innerWidth);
    viewport.height = Math.max(1, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(viewport.width, viewport.height, false);
    camera.aspect = viewport.width / viewport.height;
    camera.fov = verticalFov(viewport) * 180 / Math.PI;
    camera.updateProjectionMatrix();
    computeReadingPose();
    if (!motion) draw();
  };

  const tick = (now: number): void => {
    const current = motion;
    if (!current) return;
    if (document.visibilityState === 'hidden') {
      // Background tab: pause, and do not count the gap when visible again.
      last = 0;
      frame = requestAnimationFrame(tick);
      return;
    }
    // Foreground time is real time. Sustained slow rendering hands over to
    // reading instead of stretching the motion.
    const step = last ? Math.max(0, now - last) / 1000 : 0;
    last = now;
    slowFrames = step > SLOW_FRAME ? slowFrames + 1 : 0;
    if (slowFrames >= SLOW_FRAMES_TO_SETTLE) {
      options.slow(); // The controller settles the scene and changes phase.
      return;
    }
    current.time = Math.min(current.duration, current.time + Math.min(step, current.maxStep));
    current.advance(current.time);
    if (current.time >= current.duration) {
      motion = null;
      current.finish();
      return;
    }
    draw();
    frame = requestAnimationFrame(tick);
  };

  const start = (next: Motion, from: number): void => {
    motion = next;
    last = from;
    slowFrames = 0;
    frame = requestAnimationFrame(tick);
  };

  const stop = (): void => {
    motion = null;
    cancelAnimationFrame(frame);
  };

  const idle = (): boolean => entranceTime === 0 && !motion;
  const stopOrbit = (): void => {
    cancelAnimationFrame(orbitFrame);
    orbitFrame = 0;
  };
  const orbitTick = (now: number): void => {
    orbitFrame = 0;
    if (!orbitAllowed || !idle()) return;
    // Frame-rate independent easing; after a long frame the view simply arrives sooner.
    const step = orbitLast ? Math.max(0, now - orbitLast) / 1000 : 1 / 60;
    orbitLast = now;
    const ease = 1 - Math.exp(-ORBIT_RATE * step);
    view.yaw += (aim.yaw - view.yaw) * ease;
    view.pitch += (aim.pitch - view.pitch) * ease;
    const settled = Math.abs(aim.yaw - view.yaw) < 1e-4 && Math.abs(aim.pitch - view.pitch) < 1e-4;
    if (settled) Object.assign(view, aim);
    draw();
    if (!settled) orbitFrame = requestAnimationFrame(orbitTick);
  };
  const wakeOrbit = (): void => {
    if (!orbitAllowed || !idle() || orbitFrame) return;
    orbitLast = 0;
    orbitFrame = requestAnimationFrame(orbitTick);
  };
  // Only a mouse moves the view; touch and pen leave the cabinet still.
  const clamp = (value: number): number => Math.min(1, Math.max(-1, value));
  const onOrbitPointer = (event: PointerEvent): void => {
    if (event.pointerType !== 'mouse') return;
    aim.yaw = ORBIT_YAW * clamp((event.clientX / viewport.width) * 2 - 1);
    aim.pitch = ORBIT_PITCH * clamp(1 - (event.clientY / viewport.height) * 2);
    wakeOrbit();
  };
  const onOrbitLeave = (event: PointerEvent): void => {
    if (event.pointerType !== 'mouse') return;
    aim.yaw = 0;
    aim.pitch = 0;
    wakeOrbit();
  };

  // Pointer activation: the active drawer (face, label or pull) is the handle.
  const raycaster = new Raycaster();
  const pointer = new Vector2();
  const overDrawer = (event: PointerEvent | MouseEvent): boolean => {
    if (entranceTime > 0 || motion) return false;
    pointer.set((event.clientX / viewport.width) * 2 - 1, -(event.clientY / viewport.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObject(drawer, true).length > 0;
  };
  const onMove = (event: PointerEvent): void => { canvas.style.cursor = overDrawer(event) ? 'pointer' : ''; };
  const onClick = (event: MouseEvent): void => { if (overDrawer(event)) options.activate(); };
  const onContextLost = (event: Event): void => { event.preventDefault(); options.fail(new Error('WebGL context lost')); };
  const onVisibility = (): void => { last = 0; orbitLast = 0; };

  window.addEventListener('resize', resize);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('click', onClick);
  canvas.addEventListener('webglcontextlost', onContextLost);
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pointermove', onOrbitPointer);
  document.documentElement.addEventListener('pointerleave', onOrbitLeave);
  resize();
  renderer.compile(scene, camera);

  return {
    play(finished) {
      if (motion || entranceTime > 0) return; // One entrance per scene; never restart.
      canvas.style.cursor = '';
      stopOrbit(); // `view` stays where the visitor left it; the approach releases it.
      start({
        time: 0, duration: clock.duration, maxStep: MAX_STEP,
        advance: (time) => { entranceTime = clock.clipTime(time); },
        finish: () => { draw(); finished(); },
      }, 0);
    },
    turn(target, finished) {
      stop();
      entranceTime = duration;
      if (target === shown) {
        draw();
        finished();
        return;
      }
      const state = { to: target, forward: target > shown, progress: 0 };
      turning = state;
      // A turn is short: real time with no per-frame cap, so a slow or
      // hitching device finishes on schedule (or settles) instead of dragging.
      start({
        time: 0, duration: TURN_DURATION, maxStep: Infinity,
        advance: (time) => { state.progress = time / TURN_DURATION; },
        finish: () => {
          turning = null;
          shown = target;
          draw();
          finished();
        },
      }, performance.now());
      draw(); // First frame now, so the reading surface never shows an unplaced page.
    },
    reduceMotion(reduce) {
      orbitAllowed = options.orbit && !reduce;
      if (orbitAllowed) return;
      // Still at once: the idle cabinet returns to the arrival view without easing.
      stopOrbit();
      const moved = view.yaw !== 0 || view.pitch !== 0;
      Object.assign(aim, { yaw: 0, pitch: 0 });
      Object.assign(view, { yaw: 0, pitch: 0 });
      if (moved && idle()) draw();
    },
    settle(target) {
      stop();
      entranceTime = duration;
      turning = null;
      shown = target;
      canvas.style.cursor = '';
      draw();
    },
    dispose() {
      stop();
      stopOrbit();
      window.removeEventListener('pointermove', onOrbitPointer);
      document.documentElement.removeEventListener('pointerleave', onOrbitLeave);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      document.removeEventListener('visibilitychange', onVisibility);
      scene.traverse((object) => {
        const mesh = object as Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry.dispose();
        (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach((material: Material) => material.dispose());
      });
      scene.environment?.dispose();
      renderer.dispose();
    },
  };
}
