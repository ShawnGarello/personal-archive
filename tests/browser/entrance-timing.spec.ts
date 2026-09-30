import { expect, test } from '@playwright/test';
import { entranceClock } from '../../app/src/scripts/experience/geometry';

// Entrance timing study. The clock is checked directly: with software WebGL
// (CI) a real-time entrance settles early, so its duration cannot be observed.
const FPS = 24;
const clipTime = (frame: number): number => (frame - 18) / FPS;
const CLIP = clipTime(156); // V3 frames 18–156: 5.75 s.
const APPROACH_END = clipTime(66); // The camera has reached the cabinet.
const ROTATION_START = clipTime(83); // The extracted folder starts turning to portrait.
const STEP = 1 / 240;

/** Real time at which the clock reaches `clip` seconds. */
function realTime(clock: ReturnType<typeof entranceClock>, clip: number): number {
  let low = 0, high = clock.duration;
  for (let i = 0; i < 60; i += 1) {
    const mid = (low + high) / 2;
    if (clock.clipTime(mid) < clip) low = mid;
    else high = mid;
  }
  return high;
}

test('an approach factor of 1 keeps V3 timing exactly', () => {
  const clock = entranceClock(CLIP, APPROACH_END, 1);
  expect(clock.duration).toBeCloseTo(CLIP, 9);
  for (let t = 0; t <= CLIP; t += 0.05) expect(clock.clipTime(t)).toBeCloseTo(t, 9);
});

for (const approach of [0.7, 0.75, 0.8]) {
  test(`a ${Math.round((1 - approach) * 100)}% shorter approach arrives sooner, without a hitch, then keeps V3's pace`, () => {
    const clock = entranceClock(CLIP, APPROACH_END, approach);
    expect(clock.clipTime(approach * APPROACH_END)).toBeCloseTo(APPROACH_END, 6);
    expect(clock.clipTime(0)).toBe(0);
    expect(clock.clipTime(clock.duration)).toBe(CLIP);

    // Never slower than V3 (nothing waits) and no sudden change of speed.
    let clip = clock.clipTime(STEP), speed = clip / STEP;
    for (let t = 2 * STEP; t < clock.duration; t += STEP) {
      const next = clock.clipTime(t);
      const nextSpeed = (next - clip) / STEP;
      expect(nextSpeed).toBeGreaterThan(0.999);
      expect(Math.abs(nextSpeed - speed)).toBeLessThan(0.01);
      clip = next;
      speed = nextSpeed;
    }

    // From the folder's rotation onwards (cover opening and reading approach
    // included), motion keeps V3's duration; the time saved is all before it.
    const rotation = realTime(clock, ROTATION_START);
    expect(clock.duration - rotation).toBeCloseTo(CLIP - ROTATION_START, 6);
    expect(CLIP - clock.duration).toBeCloseTo(ROTATION_START - rotation, 6);
  });
}
