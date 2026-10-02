import { expect, test, type Page } from '@playwright/test';

// Idle pointer orbit (entrance study). The camera is observed through the
// rendered frame: screenshots are compared in the page, above the entrance
// controls, whose labels change when the entrance starts.
const PAGE_ASPECT = 1.48 / 2.1;

/** Load with a controllable clock, stopped once the cabinet is ready. */
async function readyWithPausedClock(page: Page, query = ''): Promise<void> {
  await page.clock.install();
  await page.goto(`/${query}`);
  await expect(page.locator('html')).toHaveAttribute('data-phase', 'idle', { timeout: 30_000 });
  // Nothing is timed while idle, so pause well ahead: software WebGL can block
  // the page for seconds (shader compilation) before the pause is applied.
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 10_000));
}

/** The scene above the entrance controls. */
async function frame(page: Page): Promise<Buffer> {
  const { width, height } = page.viewportSize() ?? { width: 0, height: 0 };
  return page.screenshot({ clip: { x: 0, y: 48, width, height: height * 0.7 } });
}

/** Mean absolute channel difference between two screenshots, 0–255. */
function difference(page: Page, a: Buffer, b: Buffer): Promise<number> {
  return page.evaluate(async ([first, second]) => {
    const pixels = async (base64: string): Promise<Uint8ClampedArray> => {
      const bitmap = await createImageBitmap(await (await fetch(`data:image/png;base64,${base64}`)).blob());
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const context = canvas.getContext('2d');
      if (!context) throw new Error('No 2D context');
      context.drawImage(bitmap, 0, 0);
      return context.getImageData(0, 0, bitmap.width, bitmap.height).data;
    };
    const [x, y] = await Promise.all([pixels(first), pixels(second)]);
    let sum = 0;
    for (let i = 0; i < x.length; i += 4) {
      for (let c = 0; c < 3; c += 1) sum += Math.abs((x[i + c] ?? 0) - (y[i + c] ?? 0));
    }
    return sum / ((x.length / 4) * 3);
  }, [a.toString('base64'), b.toString('base64')] as const);
}

/** Two frames: the first eases from the current view, the second has a full second to settle. */
async function letViewSettle(page: Page): Promise<void> {
  await page.clock.fastForward(16);
  await page.clock.fastForward(1000);
}

async function pointAt(page: Page, x: number, y: number): Promise<void> {
  const { width, height } = page.viewportSize() ?? { width: 0, height: 0 };
  await page.mouse.move(width * x, height * y);
}

test('the mouse turns the idle cabinet, and the entrance continues from that view', async ({ page }) => {
  await readyWithPausedClock(page);
  const still = await frame(page);
  await pointAt(page, 0.98, 0.3);
  await letViewSettle(page);
  const turned = await frame(page);
  const orbit = await difference(page, still, turned);
  expect(orbit).toBeGreaterThan(1);

  // Keyboard activation leaves the pointer where it is.
  await page.locator('[data-action="open"]').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('data-phase', 'entering');
  await page.clock.fastForward(16);
  await page.clock.fastForward(16);
  // The first entrance frames start from the turned view instead of snapping back.
  expect(await difference(page, turned, await frame(page))).toBeLessThan(orbit / 4);

  await page.clock.resume();
  await expect(page.locator('html')).toHaveAttribute('data-phase', 'reading', { timeout: 200_000 });
  const box = await page.locator('[data-paper]').boundingBox();
  expect(Math.abs((box?.width ?? 0) / (box?.height ?? 1) - PAGE_ASPECT)).toBeLessThan(0.01);
});

test('the reading camera stays fixed when the mouse moves', async ({ page }) => {
  await readyWithPausedClock(page);
  await pointAt(page, 0.02, 0.9);
  await letViewSettle(page);
  await page.getByRole('button', { name: 'Go straight to the document' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-phase', 'reading');
  await expect(page.locator('html')).toHaveAttribute('data-surface', 'scene');
  const reading = await frame(page);

  await pointAt(page, 0.98, 0.1);
  await letViewSettle(page);
  await pointAt(page, 0.02, 0.5);
  await letViewSettle(page);
  expect(await difference(page, reading, await frame(page))).toBeLessThan(0.05);
});

test('the idle view is still again at once when reduced motion is switched on', async ({ page }) => {
  await readyWithPausedClock(page);
  const still = await frame(page);
  await pointAt(page, 0.02, 0.2);
  await letViewSettle(page);
  expect(await difference(page, still, await frame(page))).toBeGreaterThan(1);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  // Back to the arrival view without easing: no clock time has passed.
  expect(await difference(page, still, await frame(page))).toBeLessThan(0.05);
  await pointAt(page, 0.98, 0.8);
  await letViewSettle(page);
  expect(await difference(page, still, await frame(page))).toBeLessThan(0.05);
  await expect(page.locator('html')).toHaveAttribute('data-phase', 'idle');
});

test('the study parameter keeps the arrival view still, as before', async ({ page }) => {
  await readyWithPausedClock(page, '?orbit=off');
  const still = await frame(page);
  await pointAt(page, 0.98, 0.2);
  await letViewSettle(page);
  expect(await difference(page, still, await frame(page))).toBeLessThan(0.05);
});

test.describe('on a touch screen', () => {
  test.use({ hasTouch: true });

  test('dragging and tapping leave the cabinet still', async ({ page }) => {
    await readyWithPausedClock(page);
    const still = await frame(page);
    const { width, height } = page.viewportSize() ?? { width: 0, height: 0 };
    const touch = await page.context().newCDPSession(page);
    const at = (x: number, y: number) => [{ x: width * x, y: height * y }];
    await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: at(0.9, 0.2) });
    for (let step = 1; step <= 8; step += 1) {
      await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: at(0.9 - step * 0.02, 0.2 + step * 0.05) });
    }
    await letViewSettle(page); // Still touching: lifting the finger could otherwise recentre the view.
    expect(await difference(page, still, await frame(page))).toBeLessThan(0.05);
    await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.touchscreen.tap(width * 0.95, height * 0.5); // Beside the cabinet.
    await letViewSettle(page);
    expect(await difference(page, still, await frame(page))).toBeLessThan(0.05);
    await expect(page.locator('html')).toHaveAttribute('data-phase', 'idle');
  });
});
