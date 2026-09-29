// Pure layout math shared by the scene adapter and the reading surface.

export interface Point { readonly x: number; readonly y: number }
export interface Rect { readonly x: number; readonly y: number; readonly width: number; readonly height: number }
export interface Viewport { readonly width: number; readonly height: number }

/** Screen corners of the page in CSS pixels: top-left, top-right, bottom-right, bottom-left. */
export type Quad = readonly [Point, Point, Point, Point];

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
