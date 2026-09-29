// Scene adapter: owns the renderer, the exported V3 clip and the camera.
// Reports page placement to the reading surface; never changes navigation.
import {
  AgXToneMapping, AnimationMixer, Color, DirectionalLight, LoopOnce, Matrix4, Mesh, Object3D,
  PCFShadowMap, PerspectiveCamera, PlaneGeometry, PMREMGenerator, Quaternion, Raycaster,
  Scene, ShadowMaterial, SRGBColorSpace, Vector2, Vector3, WebGLRenderer,
  type AnimationAction, type Material,
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { EntranceScene, SceneHooks } from './controller';
import { readingBox, smoothstep, verticalFov, type Quad, type Rect, type Reserve, type Viewport } from './geometry';

const FPS = 24;
const FIRST_FRAME = 18; // V3 "ENTRANCE ACTIVATION"; clip time 0.
const frameTime = (frame: number): number => (frame - FIRST_FRAME) / FPS;
/** V3 hands over from the exported follow camera to the reading camera between these frames. */
const APPROACH = [frameTime(132), frameTime(156)] as const;
/** The HTML text appears once the opening cover has swung clear of the page. */
const TEXT_FADE = [frameTime(116), frameTime(130)] as const;
const BACKGROUND = new Color('#f4f3ef');
/** Frames longer than this (under 10 fps) count as slow rendering. */
const SLOW_FRAME = 0.1;
/** This many consecutive slow frames settle into reading; one hitch does not. */
const SLOW_FRAMES_TO_SETTLE = 3;
/** Largest timeline advance for a single frame, in seconds. */
const MAX_STEP = 0.25;

export type PaperLayout =
  | { readonly kind: 'moving'; readonly quad: Quad | null; readonly settled: Rect; readonly opacity: number }
  | { readonly kind: 'settled'; readonly settled: Rect };

export interface SceneOptions extends SceneHooks {
  readonly canvas: HTMLCanvasElement;
  readonly url: string;
  /** Reading page height as a fraction of viewport height (framing study). */
  readonly framing: number;
  readonly reserve: (viewport: Viewport) => Reserve;
  readonly layout: (layout: PaperLayout) => void;
}

const name = (label: string): string => label.replace(/\s/g, '_').replace(/[[\]./:]/g, '');

export async function loadArchiveScene(options: SceneOptions): Promise<EntranceScene> {
  const renderer = new WebGLRenderer({ canvas: options.canvas, antialias: true, powerPreference: 'high-performance' });
  try {
    return await build(renderer, options);
  } catch (error) {
    renderer.dispose();
    throw error;
  }
}

async function build(renderer: WebGLRenderer, options: SceneOptions): Promise<EntranceScene> {
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
  const page = find('V3 | Page 01 paper');
  const drawer = find('V3 | DRAWER | slide Y');
  if (!clip) throw new Error('Scene export has no entrance clip');

  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = AgXToneMapping;
  renderer.toneMappingExposure = 1.35;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;

  const scene = new Scene();
  scene.background = BACKGROUND;
  const pmrem = new PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  scene.environment = pmrem.fromScene(room, 0.04).texture;
  scene.environmentIntensity = 0.75;
  room.dispose();
  pmrem.dispose();

  // Key light comes from V2's "Large softbox" side, raised to shorten the hard
  // shadow; shadows fall behind the cabinet, away from the reading position.
  const key = new DirectionalLight(0xffffff, 1.6);
  key.position.set(-2.5, 10, 1.5);
  key.target.position.set(0, 0, 3);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 30 });
  key.shadow.bias = -0.0004;
  key.shadow.radius = 6;
  scene.add(key, key.target);

  // Shadow-only floor: the background colour is the floor everywhere else.
  const floor = new Mesh(new PlaneGeometry(60, 60), new ShadowMaterial({ opacity: 0.1 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.01;
  floor.receiveShadow = true;
  scene.add(floor, root);
  root.traverse((object) => {
    if ((object as Mesh).isMesh) (object as Mesh).castShadow = true;
  });

  const mixer = new AnimationMixer(root);
  const action: AnimationAction = mixer.clipAction(clip);
  action.setLoop(LoopOnce, 1);
  action.clampWhenFinished = true;
  action.play();
  const duration = clip.duration;

  const camera = new PerspectiveCamera(30, 1, 0.05, 250);
  const reading = { position: new Vector3(), quaternion: new Quaternion(), rect: { x: 0, y: 0, width: 0, height: 0 } as Rect };
  const corners = [new Vector3(-0.74, 0.0015, 0), new Vector3(0.74, 0.0015, 0), new Vector3(0.74, 0.0015, 2.1), new Vector3(-0.74, 0.0015, 2.1)];
  const viewport = { width: 1, height: 1 };
  let elapsed = 0;
  let running = false;
  let frame = 0;
  let last = 0;
  let done: (() => void) | null = null;
  let slowFrames = 0;

  const sample = (time: number): void => {
    action.paused = false;
    action.time = Math.min(time, duration);
    mixer.update(0);
    root.updateMatrixWorld(true);
  };

  const pageCorners = (): Vector3[] => corners.map((corner) => corner.clone().applyMatrix4(page.matrixWorld));

  /** Perpendicular camera above the settled page, sized to the framing study. */
  const computeReadingPose = (): void => {
    sample(duration);
    const [tl, tr, , bl] = pageCorners() as [Vector3, Vector3, Vector3, Vector3];
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
    const quad = project();
    const xs = quad.map((p) => p.x), ys = quad.map((p) => p.y);
    const x = Math.round(Math.min(...xs)), y = Math.round(Math.min(...ys));
    reading.rect = { x, y, width: Math.round(Math.max(...xs)) - x, height: Math.round(Math.max(...ys)) - y };
  };

  const project = (): Quad => {
    const [a, b, c, d] = pageCorners().map((corner) => {
      const p = corner.project(camera);
      return { x: ((p.x + 1) / 2) * viewport.width, y: ((1 - p.y) / 2) * viewport.height, z: p.z };
    }) as [{ x: number; y: number; z: number }, { x: number; y: number; z: number }, { x: number; y: number; z: number }, { x: number; y: number; z: number }];
    return [a, b, c, d];
  };

  const pose = (time: number): void => {
    sample(time);
    exportedCamera.matrixWorld.decompose(camera.position, camera.quaternion, new Vector3());
    const weight = smoothstep(APPROACH[0], APPROACH[1], time);
    if (weight > 0) {
      camera.position.lerp(reading.position, weight);
      camera.quaternion.slerp(reading.quaternion, weight);
    }
    camera.updateMatrixWorld(true);
    renderer.render(scene, camera);
    if (time >= duration) {
      options.layout({ kind: 'settled', settled: reading.rect });
      return;
    }
    const opacity = smoothstep(TEXT_FADE[0], TEXT_FADE[1], time);
    options.layout({ kind: 'moving', quad: opacity > 0 ? project() : null, settled: reading.rect, opacity });
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
    if (!running) pose(elapsed);
  };

  const tick = (now: number): void => {
    if (!running) return;
    if (document.visibilityState === 'hidden') {
      // Background tab: pause, and do not count the gap when visible again.
      last = 0;
      frame = requestAnimationFrame(tick);
      return;
    }
    // Foreground time is real time. A single long gap (window occluded, a
    // hitch) is capped so the motion resumes instead of jumping; sustained
    // slow rendering hands over to reading instead of stretching the entrance.
    const step = last ? (now - last) / 1000 : 0;
    last = now;
    slowFrames = step > SLOW_FRAME ? slowFrames + 1 : 0;
    if (slowFrames >= SLOW_FRAMES_TO_SETTLE) {
      options.slow(); // The controller settles the scene and changes phase.
      return;
    }
    elapsed += Math.min(step, MAX_STEP);
    pose(elapsed);
    if (elapsed >= duration) {
      running = false;
      const finished = done;
      done = null;
      finished?.();
      return;
    }
    frame = requestAnimationFrame(tick);
  };

  // Pointer activation: the active drawer (face, label or pull) is the handle.
  const raycaster = new Raycaster();
  const pointer = new Vector2();
  const overDrawer = (event: PointerEvent | MouseEvent): boolean => {
    if (elapsed > 0 || running) return false;
    pointer.set((event.clientX / viewport.width) * 2 - 1, -(event.clientY / viewport.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObject(drawer, true).length > 0;
  };
  const onMove = (event: PointerEvent): void => { canvas.style.cursor = overDrawer(event) ? 'pointer' : ''; };
  const onClick = (event: MouseEvent): void => { if (overDrawer(event)) options.activate(); };
  const onContextLost = (event: Event): void => { event.preventDefault(); options.fail(new Error('WebGL context lost')); };
  const onVisibility = (): void => { last = 0; };

  window.addEventListener('resize', resize);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('click', onClick);
  canvas.addEventListener('webglcontextlost', onContextLost);
  document.addEventListener('visibilitychange', onVisibility);
  resize();
  renderer.compile(scene, camera);

  const stop = (): void => {
    running = false;
    done = null;
    cancelAnimationFrame(frame);
  };

  return {
    play(finished) {
      if (running || elapsed > 0) return; // One entrance per scene; never restart.
      running = true;
      done = finished;
      last = 0;
      slowFrames = 0;
      canvas.style.cursor = '';
      frame = requestAnimationFrame(tick);
    },
    settle() {
      stop();
      elapsed = duration;
      canvas.style.cursor = '';
      pose(elapsed);
    },
    dispose() {
      stop();
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
