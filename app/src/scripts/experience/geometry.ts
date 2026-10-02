// Pure layout math shared by the scene adapter and the reading surface.

export interface Point { readonly x: number; readonly y: number }
export interface Rect { readonly x: number; readonly y: number; readonly width: number; readonly height: number }
export interface Viewport { readonly width: number; readonly height: number }

/** Screen corners of the page in CSS pixels: top-left, top-right, bottom-right, bottom-left. */
export type Quad = readonly [Point, Point, Point, Point];

/** V3 document sheet, 1.48 × 2.10: width over height. */
export const PAGE_ASPECT = 1.48 / 2.1;
/** V3 camera: 55 mm lens on a 36 mm sensor, rendered at 1600 × 1000. */
export const DESIGN_VERTICAL_FOV = 2 * Math.atan(11.25 / 55);
/** Narrower viewports keep this much of the V3 frame's width (as a width/height ratio) in view. */
const SAFE_ASPECT = 1;

/** Vertical field of view that keeps the centered V3 action visible on narrow screens. */
export function verticalFov({ width, height }: Viewport): number {
  const aspect = width / height;
  if (aspect >= SAFE_ASPECT) return DESIGN_VERTICAL_FOV;
  return 2 * Math.atan((Math.tan(DESIGN_VERTICAL_FOV / 2) * SAFE_ASPECT) / aspect);
}

export interface ReadingBox {
  /** Target page center and height, in CSS pixels. */
  readonly centerX: number;
  readonly centerY: number;
  readonly pageHeight: number;
}

export interface Reserve { readonly top: number; readonly bottom: number; readonly side: number }

/**
 * Settled page size and position. `framing` is the page height as a fraction of
 * the viewport height (the 78% / 85-88% study); narrow screens are limited by width.
 */
export function readingBox(viewport: Viewport, pageAspect: number, framing: number, reserve: Reserve): ReadingBox {
  const available = viewport.height - reserve.top - reserve.bottom;
  let pageHeight = Math.min(framing * viewport.height, available);
  const maxWidth = viewport.width - 2 * reserve.side;
  if (pageHeight * pageAspect > maxWidth) pageHeight = maxWidth / pageAspect;
  return { centerX: viewport.width / 2, centerY: reserve.top + available / 2, pageHeight };
}

/**
 * CSS matrix3d that maps an untransformed width × height element onto a screen
 * quad (projective square-to-quad mapping; Heckbert 1989).
 */
export function quadTransform(width: number, height: number, [p0, p1, p2, p3]: Quad): string {
  const dx1 = p1.x - p2.x, dx2 = p3.x - p2.x, dx3 = p0.x - p1.x + p2.x - p3.x;
  const dy1 = p1.y - p2.y, dy2 = p3.y - p2.y, dy3 = p0.y - p1.y + p2.y - p3.y;
  let g = 0, h = 0;
  if (Math.abs(dx3) > 1e-9 || Math.abs(dy3) > 1e-9) {
    const den = dx1 * dy2 - dx2 * dy1;
    g = (dx3 * dy2 - dx2 * dy3) / den;
    h = (dx1 * dy3 - dx3 * dy1) / den;
  }
  const a = p1.x - p0.x + g * p1.x, b = p3.x - p0.x + h * p3.x, c = p0.x;
  const d = p1.y - p0.y + g * p1.y, e = p3.y - p0.y + h * p3.y, f = p0.y;
  const m = [a / width, d / width, 0, g / width, b / height, e / height, 0, h / height, 0, 0, 1, 0, c, f, 0, 1];
  return `matrix3d(${m.map((v) => +v.toFixed(8)).join(',')})`;
}

export function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export interface EntranceClock {
  /** Real duration of the entrance, in seconds. */
  readonly duration: number;
  /** Clip time reached `elapsed` real seconds after activation. */
  clipTime(elapsed: number): number;
}

/**
 * Entrance timing study. V3's camera approaches the cabinet until `approachEnd`
 * (clip seconds); `approach` scales the real time that approach takes (1 is
 * V3). The whole clip shares one clock so the follow camera stays on the
 * folder: it runs faster from activation, then eases back to V3's speed
 * (a smoothstep) just after the approach, so later motion keeps V3's pace.
 */
export function entranceClock(clipDuration: number, approachEnd: number, approach: number): EntranceClock {
  const arrival = approach * approachEnd;
  const ease = [arrival * (2 / 3), arrival * (7 / 6)] as const;
  // Clip time gained per unit of extra speed by real time t: the integral of 1 − smoothstep.
  const gain = (t: number): number => {
    const u = Math.min(1, Math.max(0, (t - ease[0]) / (ease[1] - ease[0])));
    return Math.min(t, ease[0]) + (ease[1] - ease[0]) * (u - u ** 3 + u ** 4 / 2);
  };
  const extra = arrival > 0 ? (approachEnd - arrival) / gain(arrival) : 0;
  const duration = clipDuration - extra * gain(Infinity);
  return {
    duration,
    clipTime: (elapsed) => (elapsed >= duration ? clipDuration : Math.max(0, elapsed + extra * gain(elapsed))),
  };
}

/** V3 turns the first sheet 178° about its top attachment (frames 204–246). */
export const TURN_ANGLE = (178 * Math.PI) / 180;
/** V3 "Free edge lag" shape-key keys over the forward turn: [progress, weight]. */
const LAG_KEYS: readonly (readonly [number, number])[] = [[0, 0], [14 / 42, 0.8], [24 / 42, 1], [34 / 42, 0.45], [1, 0]];

export interface SheetPose {
  /** Rotation about the top attachment, in radians; 0 lies on the stack. */
  readonly angle: number;
  /** Signed free-edge lag as a fraction of the full V3 bend; negative bends against the lift. */
  readonly bend: number;
}

/**
 * Sheet pose at `progress` (0–1) through a turn. V3's two-key rotation with
 * flat Bézier handles is exactly a smoothstep. A reverse turn replays the
 * forward pose backwards, but the free edge still trails the motion.
 */
export function turnPose(progress: number, forward: boolean): SheetPose {
  const t = Math.min(1, Math.max(0, progress));
  const along = forward ? t : 1 - t;
  const lag = monotoneCubic(LAG_KEYS, along);
  return { angle: TURN_ANGLE * smoothstep(0, 1, along), bend: forward ? -lag : lag };
}

/**
 * Monotone cubic interpolation (Fritsch–Carlson) with flat ends and flat
 * extrema, approximating Blender's auto-clamped Bézier keys without overshoot.
 */
export function monotoneCubic(keys: readonly (readonly [number, number])[], x: number): number {
  const last = keys.length - 1;
  if (x <= keys[0]![0]) return keys[0]![1];
  if (x >= keys[last]![0]) return keys[last]![1];
  const slopes = keys.slice(0, last).map(([x0, y0], k) => (keys[k + 1]![1] - y0) / (keys[k + 1]![0] - x0));
  const tangent = (k: number): number => {
    if (k === 0 || k === last) return 0;
    const before = slopes[k - 1]!, after = slopes[k]!;
    if (before * after <= 0) return 0;
    return Math.sign(before) * Math.min(Math.abs((before + after) / 2), 3 * Math.abs(before), 3 * Math.abs(after));
  };
  let k = 0;
  while (x > keys[k + 1]![0]) k += 1;
  const [x0, y0] = keys[k]!, [x1, y1] = keys[k + 1]!;
  const h = x1 - x0, s = (x - x0) / h;
  const h00 = 2 * s ** 3 - 3 * s ** 2 + 1, h10 = s ** 3 - 2 * s ** 2 + s;
  const h01 = -2 * s ** 3 + 3 * s ** 2, h11 = s ** 3 - s ** 2;
  return h00 * y0 + h10 * h * tangent(k) + h01 * y1 + h11 * h * tangent(k + 1);
}
