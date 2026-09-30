import { expect, test, type Locator, type Page } from '@playwright/test';

// Charcoal entrance study. The backdrop is observed in rendered frames; page
// chrome must stay legible on it, and reading must look exactly as before.
type RGB = readonly [number, number, number];
const PALE: RGB = [0xf4, 0xf3, 0xef];

async function ready(page: Page, query = ''): Promise<void> {
  await page.goto(`/${query}`);
  await expect(page.locator('html')).toHaveAttribute('data-phase', 'idle', { timeout: 30_000 });
}

async function readDirectly(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Go straight to the document' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-phase', 'reading');
  await expect(page.locator('html')).toHaveAttribute('data-surface', 'scene');
}

/** Decodes screenshots in the page: average colours of 9 × 9 patches, or the share of pixels that differ. */
function inPage<T>(page: Page, shots: Buffer[], points: readonly (readonly [number, number])[]): Promise<T> {
  return page.evaluate(async ([images, at]) => {
    const decode = async (base64: string): Promise<ImageData> => {
      const bitmap = await createImageBitmap(await (await fetch(`data:image/png;base64,${base64}`)).blob());
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const context = canvas.getContext('2d');
      if (!context) throw new Error('No 2D context');
      context.drawImage(bitmap, 0, 0);
      return context.getImageData(0, 0, bitmap.width, bitmap.height);
    };
    const [first, second] = await Promise.all(images.map(decode));
    if (!first) throw new Error('No screenshot');
    if (second) {
      let changed = 0;
      for (let i = 0; i < first.data.length; i += 4) {
        for (let c = 0; c < 3; c += 1) {
          if (Math.abs((first.data[i + c] ?? 0) - (second.data[i + c] ?? 0)) > 2) {
            changed += 1;
            break;
          }
        }
      }
      return changed / (first.data.length / 4);
    }
    return at.map(([x, y]) => {
      const total = [0, 0, 0];
      for (let dy = -4; dy <= 4; dy += 1) {
        for (let dx = -4; dx <= 4; dx += 1) {
          const i = ((Math.round(y) + dy) * first.width + Math.round(x) + dx) * 4;
          for (let c = 0; c < 3; c += 1) total[c] = (total[c] ?? 0) + (first.data[i + c] ?? 0);
        }
      }
      return total.map((value) => value / 81);
    });
  }, [shots.map((shot) => shot.toString('base64')), points] as const) as Promise<T>;
}

/** Rendered colour beside an element's left edge (its padding, clear of text). */
async function beside(page: Page, locator: Locator): Promise<RGB> {
  const box = await locator.boundingBox();
  if (!box) throw new Error('Element is not rendered');
  const [colour] = await inPage<RGB[]>(page, [await page.screenshot()], [[Math.max(4, box.x - 8), box.y + box.height / 2]]);
  return colour ?? [0, 0, 0];
}

/** A computed CSS colour as sRGB bytes (Canvas converts any CSS colour space). */
function cssColour(locator: Locator, property: 'color' | 'outline-color' | 'background-color'): Promise<RGB> {
  return locator.evaluate((element, name) => {
    const context = new OffscreenCanvas(1, 1).getContext('2d');
    if (!context) throw new Error('No 2D context');
    context.fillStyle = getComputedStyle(element).getPropertyValue(name);
    context.fillRect(0, 0, 1, 1);
    const [r = 0, g = 0, b = 0] = context.getImageData(0, 0, 1, 1).data;
    return [r, g, b] as const;
  }, property);
}

/** WCAG 2 relative luminance and contrast ratio. */
function luminance(colour: RGB): number {
  const [r, g, b] = colour.map((value) => {
    const c = value / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a: RGB, b: RGB): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (light + 0.05) / (dark + 0.05);
}

function expectPale(colour: RGB): void {
  colour.forEach((value, c) => expect(Math.abs(value - (PALE[c] ?? 0))).toBeLessThanOrEqual(3));
}

test('the charcoal entrance keeps its chrome legible, then reads exactly as the pale reading view', async ({ page, context }) => {
  await ready(page);
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-backdrop', 'dark');
  const header = page.locator('.site-header p').first();
  const surround = await beside(page, header);
  expect(luminance(surround)).toBeLessThan(0.05);
  expect(contrast(await cssColour(header, 'color'), surround)).toBeGreaterThanOrEqual(4.5);
  const status = page.getByRole('status');
  expect(contrast(await cssColour(status, 'color'), await beside(page, status))).toBeGreaterThanOrEqual(4.5);
  // The focus indicator stands out against the charcoal backdrop.
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  const open = page.getByRole('button', { name: 'Open the archive' });
  await expect(open).toBeFocused();
  expect(contrast(await cssColour(open, 'outline-color'), surround)).toBeGreaterThanOrEqual(3);

  await readDirectly(page);
  await expect(html).toHaveAttribute('data-backdrop', 'pale');
  const reading = await beside(page, header);
  expectPale(reading);
  expect(contrast(await cssColour(header, 'color'), reading)).toBeGreaterThanOrEqual(4.5);

  // No trace of the stage remains: the frame matches the established appearance.
  const established = await context.newPage();
  await ready(established, '?look=pale');
  await readDirectly(established);
  const changed = await inPage<number>(page, [await page.screenshot(), await established.screenshot()], []);
  expect(changed).toBeLessThan(0.001);
});

test('the look study parameter keeps the pale surround from the start', async ({ page }) => {
  await ready(page, '?look=pale');
  await expect(page.locator('html')).toHaveAttribute('data-backdrop', 'pale');
  const header = page.locator('.site-header p').first();
  const surround = await beside(page, header);
  expectPale(surround);
  expect(contrast(await cssColour(header, 'color'), surround)).toBeGreaterThanOrEqual(4.5);
});

test('while the scene loads, the backdrop is already charcoal and the status legible', async ({ page }) => {
  let release = (): void => {};
  const held = new Promise<void>((resolve) => { release = resolve; });
  await page.route('**/*.glb', async (route) => { await held; await route.continue(); });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-phase', 'loading');
  const status = page.getByRole('status');
  await expect(status).toHaveText('Preparing the archive…');
  const surround = await beside(page, status);
  expect(luminance(surround)).toBeLessThan(0.05);
  expect(contrast(await cssColour(status, 'color'), surround)).toBeGreaterThanOrEqual(4.5);
  release();
});

test('a failed scene load reads in the usual plain colours', async ({ page }) => {
  await page.route('**/*.glb', (route) => route.abort());
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-surface', 'flat');
  const status = page.getByRole('status');
  await expect(status).toHaveText(/3D archive is unavailable/);
  const surround = await beside(page, status);
  expect(luminance(surround)).toBeGreaterThan(0.8);
  expect(contrast(await cssColour(status, 'color'), surround)).toBeGreaterThanOrEqual(4.5);
});
