import { expect, test, type Page } from '@playwright/test';

// Observable state: <html data-phase data-surface data-transition data-scene-load>.
const TITLE = 'Small tools for shared places';
const PAGE_ASPECT = 1.48 / 2.1;
// Real-time entrance: about 6 s with a GPU, over a minute with software WebGL.
const ENTRANCE_TIMEOUT = 200_000;

async function recordPhases(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const log: string[] = [];
    Object.assign(window, { phaseLog: log });
    new MutationObserver(() => {
      const phase = document.documentElement?.dataset.phase ?? '';
      if (phase && log.at(-1) !== phase) log.push(phase);
    }).observe(document, { subtree: true, attributes: true, attributeFilter: ['data-phase'] });
  });
}
const phaseLog = (page: Page): Promise<string[]> => page.evaluate(() => (window as unknown as { phaseLog: string[] }).phaseLog);

/** Load with a controllable clock, stopped once the cabinet is ready. */
async function readyWithPausedClock(page: Page): Promise<void> {
  await page.clock.install();
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-phase', 'idle', { timeout: 30_000 });
  // Nothing is timed while idle, so pause well ahead: software WebGL can block
  // the page for seconds (shader compilation) before the pause is applied.
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 10_000));
}

async function expectSettledPage(page: Page): Promise<void> {
  const paper = page.locator('[data-paper]');
  expect(await paper.evaluate((element) => getComputedStyle(element).transform)).toBe('none');
  const box = await paper.boundingBox();
  const viewport = page.viewportSize();
  expect(box && viewport).toBeTruthy();
  if (!box || !viewport) return;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
  expect(Math.abs(box.width / box.height - PAGE_ASPECT)).toBeLessThan(0.01);
  await expect(page.getByRole('heading', { level: 1, name: TITLE })).toBeInViewport();
}

test('keyboard activation follows the entrance to selectable, focusable text', async ({ page }) => {
  await recordPhases(page);
  await page.goto('/');
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-phase', 'idle', { timeout: 30_000 });

  await page.keyboard.press('Tab'); // Skip link
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Open the archive' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(html).toHaveAttribute('data-phase', 'entering');
  await expect(html).toHaveAttribute('data-phase', 'reading', { timeout: ENTRANCE_TIMEOUT });

  await expect(html).toHaveAttribute('data-surface', 'scene');
  await expect(page.locator('#reading')).toBeFocused();
  await expectSettledPage(page);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: /lending libraries/ })).toBeFocused();

  await page.getByRole('heading', { level: 1 }).dblclick();
  const selected = await page.evaluate(() => getSelection()?.toString().trim());
  expect(TITLE.split(' ')).toContain(selected);
  expect(await phaseLog(page)).toEqual(['loading', 'idle', 'entering', 'reading']);
});

test('repeated pointer and keyboard activation cannot start a second entrance', async ({ page }) => {
  await recordPhases(page);
  await readyWithPausedClock(page); // Every repeat lands while the entrance is running.
  const html = page.locator('html');

  // The top drawer of the centered cabinet is the pointer target.
  const { width, height } = page.viewportSize() ?? { width: 0, height: 0 };
  await page.mouse.click(width / 2, height * 0.33);
  await expect(html).toHaveAttribute('data-phase', 'entering');
  const transition = await html.getAttribute('data-transition');

  // Playwright will not click an aria-disabled button, so dispatch like a pointer would.
  const open = page.locator('[data-action="open"]');
  await open.dispatchEvent('click');
  await open.focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Space');
  await page.mouse.click(width / 2, height * 0.33);
  await page.clock.runFor(300);
  await expect(html).toHaveAttribute('data-phase', 'entering');
  await expect(html).toHaveAttribute('data-transition', transition ?? '');

  await page.clock.resume();
  await expect(html).toHaveAttribute('data-phase', 'reading', { timeout: ENTRANCE_TIMEOUT });
  // Completion keeps the ID; with software WebGL the slow-rendering settle adds one.
  expect(Number(await html.getAttribute('data-transition'))).toBeLessThanOrEqual(Number(transition) + 1);
  await expect(open).toBeHidden();
  await expectSettledPage(page);
  expect(await phaseLog(page)).toEqual(['loading', 'idle', 'entering', 'reading']);
});

test('skipping during the entrance settles reading and the old timeline never replays', async ({ page }) => {
  await recordPhases(page);
  await readyWithPausedClock(page);
  const html = page.locator('html');

  await page.getByRole('button', { name: 'Open the archive' }).click();
  await page.clock.runFor(300);
  await expect(html).toHaveAttribute('data-phase', 'entering');
  await page.getByRole('button', { name: 'Skip the animation' }).click();

  await expect(html).toHaveAttribute('data-phase', 'reading');
  await expect(page.locator('#reading')).toBeFocused();
  await expectSettledPage(page);
  const paper = page.locator('[data-paper]');
  const settled = await paper.getAttribute('style');

  await page.clock.runFor(10_000); // Well past the original 5.75 s timeline.
  await expect(html).toHaveAttribute('data-phase', 'reading');
  expect(await paper.getAttribute('style')).toBe(settled);
  expect(await phaseLog(page)).toEqual(['loading', 'idle', 'entering', 'reading']);
});

test('a failed scene load leaves the document readable', async ({ page }) => {
  await page.route('**/*.glb', (route) => route.abort());
  await page.goto('/');
  const html = page.locator('html');

  await expect(html).toHaveAttribute('data-phase', 'reading');
  await expect(html).toHaveAttribute('data-surface', 'flat');
  await expect(html).toHaveAttribute('data-scene-load', 'failed');
  await expect(page.getByRole('status')).toHaveText(/3D archive is unavailable/);
  await expect(page.getByRole('button', { name: 'Open the archive' })).toBeHidden();
  await expect(page.getByRole('heading', { level: 1, name: TITLE })).toBeVisible();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: /lending libraries/ })).toBeFocused();
});

test('without WebGL 2 the document is shown directly and no scene is requested', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.addInitScript(() => { Reflect.deleteProperty(window, 'WebGL2RenderingContext'); });
  await page.goto('/', { waitUntil: 'load' });

  await expect(page.locator('html')).toHaveAttribute('data-surface', 'flat');
  await expect(page.getByRole('status')).toHaveText(/3D archive is unavailable/);
  await expect(page.getByRole('heading', { level: 1, name: TITLE })).toBeVisible();
  expect(requests.filter((url) => url.endsWith('.glb'))).toEqual([]);
});

test('direct access while loading keeps the plain document when the scene arrives late', async ({ page }) => {
  await recordPhases(page);
  let release = (): void => {};
  const held = new Promise<void>((resolve) => { release = resolve; });
  await page.route('**/*.glb', async (route) => { await held; await route.continue(); });
  await page.goto('/');
  const html = page.locator('html');

  await expect(html).toHaveAttribute('data-phase', 'loading');
  await page.getByRole('button', { name: 'Go straight to the document' }).click();
  await expect(html).toHaveAttribute('data-phase', 'reading');
  await expect(html).toHaveAttribute('data-surface', 'flat');
  await expect(page.locator('#reading')).toBeFocused();

  release();
  await expect(html).toHaveAttribute('data-scene-load', 'loaded', { timeout: 30_000 });
  await expect(html).toHaveAttribute('data-phase', 'reading');
  await expect(html).toHaveAttribute('data-surface', 'flat');
  await expect(page.locator('[data-scene-canvas]')).toBeHidden();
  expect(await phaseLog(page)).toEqual(['loading', 'reading']);
});

for (const control of ['button', 'skip link'] as const) {
  test(`direct access by ${control} works while the experience module is still downloading`, async ({ page }) => {
    const requests: string[] = [];
    page.on('request', (request) => requests.push(request.url()));
    let release = (): void => {};
    const held = new Promise<void>((resolve) => { release = resolve; });
    await page.route('**/_astro/index.astro_astro_type_script*.js', async (route) => { await held; await route.continue(); });
    await page.goto('/', { waitUntil: 'commit' });
    const html = page.locator('html');

    await expect(html).toHaveAttribute('data-phase', 'loading');
    if (control === 'button') {
      await page.getByRole('button', { name: 'Go straight to the document' }).click();
    } else {
      await page.keyboard.press('Tab');
      await expect(page.getByRole('link', { name: 'Skip to document' })).toBeFocused();
      await page.keyboard.press('Enter');
    }
    await expect(html).toHaveAttribute('data-phase', 'reading');
    await expect(html).toHaveAttribute('data-surface', 'flat');
    await expect(page.locator('#reading')).toBeFocused();
    await expect(page.getByRole('heading', { level: 1, name: TITLE })).toBeVisible();
    expect(await html.getAttribute('data-booted')).toBeNull();

    // The late module must adopt the choice: no load, no layout change.
    release();
    await expect(html).toHaveAttribute('data-booted', 'true');
    await expect(html).toHaveAttribute('data-phase', 'reading');
    await expect(html).toHaveAttribute('data-surface', 'flat');
    expect(await html.getAttribute('data-scene-load')).toBeNull();
    await expect(page.locator('#reading')).toBeFocused();
    expect(requests.filter((url) => url.endsWith('.glb'))).toEqual([]);
  });
}

test('sustained slow rendering settles into reading instead of stretching the entrance', async ({ page }) => {
  await recordPhases(page);
  await page.goto('/');
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-phase', 'idle', { timeout: 30_000 });
  // Simulate a device that renders about four frames per second.
  await page.evaluate(() => {
    const native = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (callback) => native((time) => {
      const until = performance.now() + 250;
      while (performance.now() < until) { /* busy */ }
      callback(time);
    });
  });
  const transition = Number(await html.getAttribute('data-transition'));

  await page.getByRole('button', { name: 'Open the archive' }).click();
  // Well inside the 5.75 s entrance (the old clamp took 15.6 s at 250 ms per frame).
  await expect(html).toHaveAttribute('data-phase', 'reading', { timeout: 5_000 });
  await expect(html).toHaveAttribute('data-transition', String(transition + 2)); // open + settle
  await expect(page.locator('#reading')).toBeFocused();
  await expectSettledPage(page);
  expect(await phaseLog(page)).toEqual(['loading', 'idle', 'entering', 'reading']);
});

test('a hidden tab pauses the entrance without counting as slow rendering', async ({ page }) => {
  await readyWithPausedClock(page);
  const html = page.locator('html');
  const setHidden = (hidden: boolean): Promise<void> => page.evaluate((value) => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (value ? 'hidden' : 'visible') });
    document.dispatchEvent(new Event('visibilitychange'));
  }, hidden);

  await page.getByRole('button', { name: 'Open the archive' }).click();
  await page.clock.runFor(300);
  const transition = await html.getAttribute('data-transition');
  await setHidden(true);
  await page.clock.runFor(10_000); // Longer than the whole entrance.
  await expect(html).toHaveAttribute('data-phase', 'entering');

  await setHidden(false);
  await page.clock.runFor(200);
  await expect(html).toHaveAttribute('data-phase', 'entering');
  await expect(html).toHaveAttribute('data-transition', transition ?? '');
});

test('enabling reduced motion mid-entrance settles on the page', async ({ page }) => {
  await recordPhases(page);
  await readyWithPausedClock(page);
  const html = page.locator('html');

  await page.getByRole('button', { name: 'Open the archive' }).click();
  await page.clock.runFor(300);
  await expect(html).toHaveAttribute('data-phase', 'entering');
  await page.emulateMedia({ reducedMotion: 'reduce' });

  await expect(html).toHaveAttribute('data-phase', 'reading');
  await expect(html).toHaveAttribute('data-surface', 'scene');
  await expectSettledPage(page);
  await page.clock.runFor(8_000);
  expect(await phaseLog(page)).toEqual(['loading', 'idle', 'entering', 'reading']);
});

test('resizing during the entrance still settles an aligned page', async ({ page }) => {
  await page.goto('/');
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-phase', 'idle', { timeout: 30_000 });

  await page.getByRole('button', { name: 'Open the archive' }).click(); // Enters synchronously.
  await page.setViewportSize({ width: 600, height: 800 });

  await expect(html).toHaveAttribute('data-phase', 'reading', { timeout: ENTRANCE_TIMEOUT });
  await expectSettledPage(page);
});

test.describe('with reduced motion preferred', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the document is shown without loading the entrance', async ({ page }) => {
    const requests: string[] = [];
    page.on('request', (request) => requests.push(request.url()));
    await page.goto('/', { waitUntil: 'load' });

    await expect(page.locator('html')).toHaveAttribute('data-phase', 'reading');
    await expect(page.locator('html')).toHaveAttribute('data-surface', 'flat');
    await expect(page.getByRole('heading', { level: 1, name: TITLE })).toBeVisible();
    await expect(page.getByRole('status')).toBeHidden();
    expect(requests.filter((url) => url.endsWith('.glb'))).toEqual([]);
  });
});
