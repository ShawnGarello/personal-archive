import { expect, test, type Page } from '@playwright/test';

// Document navigation (Wave 1C). Observable state: <html data-phase data-surface
// data-transition data-document data-sheet>. `data-document` is the committed
// document; `data-sheet` is the document the 3D sheets rest on (scene only).
const DOCS = [
  { id: 'fictional-field-notes', title: 'Small tools for shared places' },
  { id: 'fictional-sunroom-studies', title: 'A daylight notebook for small rooms' },
] as const;
const PAGE_ASPECT = 1.48 / 2.1;
/** V3 turn: 42 frames at 24 fps. */
const TURN_MS = 1750;

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
const turns = async (page: Page): Promise<number> => (await phaseLog(page)).filter((phase) => phase === 'turning').length;

const html = (page: Page) => page.locator('html');
const next = (page: Page) => page.getByRole('button', { name: 'Next document' });
const previous = (page: Page) => page.getByRole('button', { name: 'Previous document' });
const transition = async (page: Page): Promise<number> => Number(await html(page).getAttribute('data-transition'));

/**
 * Reading on the scene surface with the clock stopped, so turns advance only when
 * the test says. Tests jump the clock (`fastForward` fires each due frame once):
 * turns use real elapsed time, so a jump lands at the same pose as many small
 * frames, and software WebGL (about 1.3 s per frame in CI) stays fast.
 */
async function readingWithPausedClock(page: Page): Promise<void> {
  await page.clock.install();
  await page.goto('/');
  await expect(html(page)).toHaveAttribute('data-phase', 'idle', { timeout: 30_000 });
  // Nothing is timed while idle, so pause well ahead: software WebGL can block
  // the page for seconds (shader compilation) before the pause is applied.
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 10_000));
  await page.getByRole('button', { name: 'Open the archive' }).click();
  await page.clock.fastForward(100);
  await page.getByRole('button', { name: 'Skip the animation' }).click();
  await expect(html(page)).toHaveAttribute('data-phase', 'reading');
  await expect(html(page)).toHaveAttribute('data-surface', 'scene');
}

/** Document links a visitor could reach: rendered and not inside an inert layer. */
const reachableLinks = (page: Page): Promise<number> => page.evaluate(() => [...document.querySelectorAll('.paper a[href]')]
  .filter((link) => link.checkVisibility() && !link.closest('[inert]')).length);

/** The visual sheet, the semantic content and the navigation all agree on one settled document. */
async function expectSettledOn(page: Page, index: 0 | 1): Promise<void> {
  const doc = DOCS[index];
  const other = DOCS[1 - index]!;
  await expect(html(page)).toHaveAttribute('data-phase', 'reading');
  await expect(html(page)).toHaveAttribute('data-document', doc.id);
  if (await html(page).getAttribute('data-surface') === 'scene') {
    await expect(html(page)).toHaveAttribute('data-sheet', doc.id);
    const paper = page.locator('[data-paper]');
    expect(await paper.evaluate((element) => getComputedStyle(element).transform)).toBe('none');
    expect(await paper.evaluate((element) => getComputedStyle(element).clipPath)).toBe('none');
    const box = await paper.boundingBox();
    const viewport = page.viewportSize();
    expect(box && viewport).toBeTruthy();
    if (box && viewport) {
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
      expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
      expect(Math.abs(box.width / box.height - PAGE_ASPECT)).toBeLessThan(0.01);
    }
  }
  await expect(page.getByRole('heading', { level: 1, name: doc.title })).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: other.title })).toHaveCount(0);
  await expect(page.locator('.paper-copy')).toHaveCount(0);
  await expect(page.locator('[data-document-position]')).toHaveText(`Document ${index + 1} of 2: ${doc.title}`);
  await expect(previous(page)).toHaveAttribute('aria-disabled', String(index === 0));
  await expect(next(page)).toHaveAttribute('aria-disabled', String(index === 1));
  expect(await reachableLinks(page)).toBe(1);
}

test('Next turns up to the second document and Previous turns back to the first', async ({ page }) => {
  await recordPhases(page);
  await readingWithPausedClock(page);
  await expectSettledOn(page, 0);
  const start = await transition(page);

  await next(page).click();
  // Committed at once; the turn only animates towards it.
  await expect(html(page)).toHaveAttribute('data-phase', 'turning');
  await expect(html(page)).toHaveAttribute('data-document', DOCS[1].id);
  await expect(html(page)).toHaveAttribute('data-sheet', 'turning');
  await expect(page.locator('[data-document-position]')).toHaveText(`Document 2 of 2: ${DOCS[1].title}`);
  // One inert, hidden visual copy of the outgoing page; nothing in either layer can take focus.
  const copy = page.locator('.paper-copy');
  await expect(copy).toHaveCount(1);
  expect(await copy.evaluate((element) => element.inert && element.getAttribute('aria-hidden') === 'true')).toBe(true);
  expect(await copy.locator('[id]').count()).toBe(0);
  expect(await reachableLinks(page)).toBe(0);
  expect(await page.locator('#reading').evaluate((element) => element.inert)).toBe(true);

  await page.clock.fastForward(TURN_MS / 2);
  await expect(html(page)).toHaveAttribute('data-phase', 'turning');
  await page.clock.fastForward(TURN_MS);
  await expectSettledOn(page, 1);
  await expect(next(page)).toBeFocused(); // Focus stays on the control that was used.
  expect(await transition(page)).toBe(start + 1);

  await previous(page).click();
  await expect(html(page)).toHaveAttribute('data-phase', 'turning');
  await expect(html(page)).toHaveAttribute('data-document', DOCS[0].id);
  await page.clock.fastForward(TURN_MS * 1.5);
  await expectSettledOn(page, 0);
  await expect(previous(page)).toBeFocused();
  expect(await transition(page)).toBe(start + 2);
  expect(await phaseLog(page)).toEqual(['loading', 'idle', 'entering', 'reading', 'turning', 'reading', 'turning', 'reading']);
});

test('the first and last documents do not wrap', async ({ page }) => {
  await recordPhases(page);
  await readingWithPausedClock(page);
  const start = await transition(page);

  // Playwright will not click an aria-disabled button, so dispatch like a pointer would.
  await previous(page).dispatchEvent('click');
  await previous(page).focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Space');
  await page.clock.fastForward(TURN_MS * 2);
  await expectSettledOn(page, 0);
  expect(await transition(page)).toBe(start);

  await next(page).click();
  await page.clock.fastForward(TURN_MS * 2);
  await expectSettledOn(page, 1);
  await next(page).dispatchEvent('click');
  await page.keyboard.press('Enter'); // Focus is still on Next.
  await page.clock.fastForward(TURN_MS * 2);
  await expectSettledOn(page, 1);
  expect(await transition(page)).toBe(start + 1);
  expect(await turns(page)).toBe(1);
});

test('repeated navigation during a turn is ignored, not queued, in both directions', async ({ page }) => {
  await recordPhases(page);
  await readingWithPausedClock(page);
  const start = await transition(page);

  await next(page).click();
  await next(page).dispatchEvent('click');
  await previous(page).dispatchEvent('click');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Space');
  await page.clock.fastForward(300);
  await next(page).dispatchEvent('click');
  await previous(page).dispatchEvent('click');
  await expect(html(page)).toHaveAttribute('data-phase', 'turning');
  await expect(html(page)).toHaveAttribute('data-document', DOCS[1].id);
  expect(await transition(page)).toBe(start + 1);

  await page.clock.fastForward(TURN_MS);
  await expectSettledOn(page, 1);
  await page.clock.fastForward(TURN_MS * 3); // Nothing was queued behind the turn.
  await expectSettledOn(page, 1);
  expect(await transition(page)).toBe(start + 1);

  await previous(page).click();
  await previous(page).dispatchEvent('click');
  await next(page).dispatchEvent('click');
  await page.keyboard.press('Enter');
  await page.clock.fastForward(600);
  await next(page).dispatchEvent('click');
  await page.clock.fastForward(TURN_MS);
  await expectSettledOn(page, 0);
  await page.clock.fastForward(TURN_MS * 3);
  await expectSettledOn(page, 0);
  expect(await transition(page)).toBe(start + 2);
  expect(await turns(page)).toBe(2);
});

test('keyboard navigation in real time keeps focus on the control and text selectable', async ({ page }) => {
  await page.goto('/');
  await expect(html(page)).toHaveAttribute('data-phase', 'idle', { timeout: 30_000 });
  await page.getByRole('button', { name: 'Go straight to the document' }).click();
  await expect(html(page)).toHaveAttribute('data-phase', 'reading');
  await expect(page.locator('#reading')).toBeFocused();

  await page.keyboard.press('Tab'); // The document's link comes first,
  await expect(page.getByRole('link', { name: /lending libraries/ })).toBeFocused();
  await page.keyboard.press('Tab'); // then the controls that follow the page.
  await expect(previous(page)).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(next(page)).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(html(page)).toHaveAttribute('data-document', DOCS[1].id);
  await expectSettledOn(page, 1);
  await expect(next(page)).toBeFocused();

  // The new document's own content is next in reverse order, and selectable.
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('link', { name: /daylighting/ })).toBeFocused();
  // Double-click the centre of the heading's longest word. The box centre (or a
  // one-letter word) can fall on a word boundary depending on font metrics.
  const heading = page.getByRole('heading', { level: 1, name: DOCS[1].title });
  await heading.scrollIntoViewIfNeeded(); // Focusing the link scrolled the page to its end.
  const word = await heading.evaluate((element) => {
    const text = element.firstChild as Text;
    const range = document.createRange();
    const longest = text.data.split(' ').reduce((a, b) => (b.length > a.length ? b : a));
    const index = text.data.indexOf(longest);
    range.setStart(text, index);
    range.setEnd(text, index + longest.length);
    const rect = range.getBoundingClientRect();
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2, text: range.toString() };
  });
  await page.mouse.dblclick(word.x, word.y);
  expect(await page.evaluate(() => getSelection()?.toString().trim())).toBe(word.text);
});

test('each document keeps its reading position; an unvisited one opens at the top', async ({ page }) => {
  await readingWithPausedClock(page);
  const reading = page.locator('#reading');
  await reading.evaluate((element) => { element.scrollTop = 200; });
  const kept = await reading.evaluate((element) => element.scrollTop);
  expect(kept).toBeGreaterThan(100);

  await next(page).click();
  // The outgoing sheet shows what the reader last saw.
  expect(await page.locator('.paper-copy .reading-frame').evaluate((element) => element.scrollTop)).toBe(kept);
  await page.clock.fastForward(TURN_MS * 1.5);
  await expectSettledOn(page, 1);
  expect(await reading.evaluate((element) => element.scrollTop)).toBe(0);

  await previous(page).click();
  await page.clock.fastForward(TURN_MS * 1.5);
  await expectSettledOn(page, 0);
  expect(await reading.evaluate((element) => element.scrollTop)).toBe(kept);
});

test('enabling reduced motion mid-turn settles on the committed document; later changes are instant', async ({ page }) => {
  await recordPhases(page);
  await readingWithPausedClock(page);

  await next(page).click();
  await page.clock.fastForward(500);
  await expect(html(page)).toHaveAttribute('data-phase', 'turning');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expectSettledOn(page, 1);
  await expect(next(page)).toBeFocused();

  await previous(page).click();
  await expectSettledOn(page, 0); // Without advancing the clock: no turn.
  await expect(previous(page)).toBeFocused();
  expect(await turns(page)).toBe(1);
});

test('losing the renderer mid-turn leaves the committed document readable with working navigation', async ({ page }) => {
  await readingWithPausedClock(page);

  await next(page).click();
  await page.clock.fastForward(500);
  await expect(html(page)).toHaveAttribute('data-phase', 'turning');
  await page.evaluate(() => {
    const gl = document.querySelector('canvas')?.getContext('webgl2');
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  });

  await expect(html(page)).toHaveAttribute('data-surface', 'flat');
  await expectSettledOn(page, 1);
  await expect(page.getByRole('status')).toHaveText(/3D archive is unavailable/);
  await expect(page.locator('[data-scene-canvas]')).toBeHidden();
  await expect(next(page)).toBeFocused();

  await previous(page).click();
  await expectSettledOn(page, 0);
  await next(page).click();
  await expectSettledOn(page, 1);
});

test('when the scene fails to load, the plain layout navigates both ways', async ({ page }) => {
  await recordPhases(page);
  await page.route('**/*.glb', (route) => route.abort());
  await page.goto('/');
  await expect(html(page)).toHaveAttribute('data-scene-load', 'failed');
  await expectSettledOn(page, 0);

  await next(page).click();
  await expectSettledOn(page, 1);
  await expect(next(page)).toBeFocused();
  await previous(page).click();
  await expectSettledOn(page, 0);
  expect(await turns(page)).toBe(0);
});

test('sustained slow rendering settles a turn quickly, and later changes skip the turn', async ({ page }) => {
  await recordPhases(page);
  await readingWithPausedClock(page);
  const start = await transition(page);

  // Three consecutive 200 ms frames (under 10 fps): each clock jump fires one frame,
  // well inside the 1.75 s turn whatever the real renderer speed.
  await next(page).click();
  await page.clock.fastForward(200);
  await page.clock.fastForward(200);
  await expect(html(page)).toHaveAttribute('data-phase', 'turning');
  await page.clock.fastForward(200);
  await expectSettledOn(page, 1);
  expect(await transition(page)).toBe(start + 2); // navigate + slow settle
  await expect(next(page)).toBeFocused(); // A passive settle does not move focus.

  await previous(page).click();
  await expectSettledOn(page, 0); // Without advancing the clock: no turn.
  expect(await turns(page)).toBe(1);
});

test('a hidden tab pauses a turn, which completes after returning', async ({ page }) => {
  await readingWithPausedClock(page);
  const setHidden = (hidden: boolean): Promise<void> => page.evaluate((value) => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (value ? 'hidden' : 'visible') });
    document.dispatchEvent(new Event('visibilitychange'));
  }, hidden);

  await next(page).click();
  await page.clock.fastForward(300);
  const id = await transition(page);
  await setHidden(true);
  await page.clock.fastForward(10_000);
  await expect(html(page)).toHaveAttribute('data-phase', 'turning');

  await setHidden(false);
  await page.clock.fastForward(200);
  await expect(html(page)).toHaveAttribute('data-phase', 'turning');
  await page.clock.fastForward(TURN_MS);
  await expectSettledOn(page, 1);
  expect(await transition(page)).toBe(id);
});

test('the skip link during a turn settles it and moves focus to the document', async ({ page }) => {
  await readingWithPausedClock(page);
  await next(page).click();
  await page.clock.fastForward(300);

  await page.getByRole('link', { name: 'Skip to document' }).focus();
  await page.keyboard.press('Enter');
  await expectSettledOn(page, 1);
  await expect(page.locator('#reading')).toBeFocused();
});

test('resizing during a turn settles an aligned page on the committed document', async ({ page }) => {
  await readingWithPausedClock(page);
  await next(page).click();
  await page.clock.fastForward(400);
  await page.setViewportSize({ width: 600, height: 800 });
  await page.clock.fastForward(TURN_MS);
  await expectSettledOn(page, 1);
  await expect(html(page)).toHaveAttribute('data-surface', 'scene');
});

test('a viewport too small for readable text on the paper reads in the plain layout, then returns', async ({ page }) => {
  await readingWithPausedClock(page);
  await next(page).click();
  await page.clock.fastForward(400);

  // Like a landscape phone: the settled page would be under 16rem wide.
  await page.setViewportSize({ width: 740, height: 360 });
  await expect(html(page)).toHaveAttribute('data-surface', 'flat');
  await expectSettledOn(page, 1);
  await previous(page).click();
  await expectSettledOn(page, 0);

  await page.setViewportSize({ width: 1024, height: 640 });
  await expect(html(page)).toHaveAttribute('data-surface', 'scene');
  await expectSettledOn(page, 0);
});

/** Hold the experience module's download until `release` (a stalled script). */
async function holdModule(page: Page): Promise<() => void> {
  let release = (): void => {};
  const held = new Promise<void>((resolve) => { release = resolve; });
  await page.route('**/_astro/index.astro_astro_type_script*.js', async (route) => { await held; await route.continue(); });
  return release;
}

/** Before the module boots, every document is readable and there are no controls. */
async function expectAllDocumentsWithoutControls(page: Page): Promise<void> {
  for (const doc of DOCS) await expect(page.getByRole('heading', { level: 1, name: doc.title })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Documents' })).toBeHidden();
  expect(await html(page).getAttribute('data-paged')).toBeNull();
}

test('a reader already on the second document before the module boots stays on it', async ({ page }) => {
  const release = await holdModule(page);
  await page.goto('/', { waitUntil: 'commit' });
  await expect(html(page)).toHaveAttribute('data-phase', 'loading');
  await page.getByRole('button', { name: 'Go straight to the document' }).click();
  await expect(html(page)).toHaveAttribute('data-surface', 'flat');
  await expectAllDocumentsWithoutControls(page);

  const heading = page.getByRole('heading', { level: 1, name: DOCS[1].title });
  await heading.evaluate((element) => element.scrollIntoView({ block: 'start' }));
  const before = await heading.boundingBox();
  release();
  await expect(html(page)).toHaveAttribute('data-booted', 'true');
  await expectSettledOn(page, 1);
  // Paging hid the first document without moving the one being read.
  const after = await heading.boundingBox();
  expect(Math.abs((after?.y ?? 0) - (before?.y ?? 0))).toBeLessThan(2);
  await previous(page).click();
  await expectSettledOn(page, 0);
});

test('a module that fails to download leaves every document readable without dead controls', async ({ page }) => {
  await page.route('**/_astro/index.astro_astro_type_script*.js', (route) => route.abort());
  await page.goto('/');
  await expect(html(page)).toHaveAttribute('data-phase', 'reading');
  await expect(html(page)).toHaveAttribute('data-surface', 'flat');
  await expectAllDocumentsWithoutControls(page);
});

test.describe('with reduced motion preferred', () => {
  test.use({ reducedMotion: 'reduce' });

  test('every document is readable while the module downloads, then navigation takes over', async ({ page }) => {
    const release = await holdModule(page);
    await page.goto('/', { waitUntil: 'commit' });
    await expect(html(page)).toHaveAttribute('data-phase', 'reading');
    await expect(html(page)).toHaveAttribute('data-surface', 'flat');
    await expectAllDocumentsWithoutControls(page);

    release();
    await expect(html(page)).toHaveAttribute('data-booted', 'true');
    await expectSettledOn(page, 0);
    await next(page).click();
    await expectSettledOn(page, 1);
  });

  test('documents change instantly on the plain layout', async ({ page }) => {
    await recordPhases(page);
    await page.goto('/');
    await expect(html(page)).toHaveAttribute('data-surface', 'flat');
    await expectSettledOn(page, 0);

    await next(page).click();
    await expectSettledOn(page, 1);
    await expect(next(page)).toBeFocused();
    await previous(page).click();
    await expectSettledOn(page, 0);
    expect(await phaseLog(page)).toEqual(['reading']);
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('every document is shown in order and there are no dead controls', async ({ page }) => {
    await page.goto('/');
    for (const doc of DOCS) await expect(page.getByRole('heading', { level: 1, name: doc.title })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Documents' })).toBeHidden();
  });
});
