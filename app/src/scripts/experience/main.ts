// Reading-surface view and wiring. The controller decides state; this module
// reflects it in the DOM, owns focus and scroll, and places the HTML pages on the paper.
import sceneUrl from '../../assets/scene/archive-entrance-v3.glb?url';
import { ExperienceController, type ExperienceState, type Reason, type Surface } from './controller';
import { PAGE_ASPECT, quadTransform, readingBox, type Quad, type Rect, type Reserve, type Viewport } from './geometry';
import type { PaperLayout } from './scene';

const root = document.documentElement;
// The inline script may already have shown the document (direct access while
// this module downloaded); adopt that choice instead of starting a load.
const directAccess = root.dataset.phase === 'reading';
root.dataset.booted = 'true'; // Tells the inline script that this module now handles input.

function element<T extends HTMLElement>(selector: string): T {
  const found = document.querySelector<T>(selector);
  if (!found) throw new Error(`Missing ${selector}`);
  return found;
}
const canvas = element<HTMLCanvasElement>('[data-scene-canvas]');
const paper = element('[data-paper]');
const reading = element('#reading');
const entrance = element('[data-entrance]');
const openButton = element<HTMLButtonElement>('[data-action="open"]');
const readButton = element<HTMLButtonElement>('[data-action="read"]');
const status = element('[data-status]');
const header = element('.site-header');
const skipLink = element<HTMLAnchorElement>('.skip-link');
const nav = element('[data-document-nav]');
const previousButton = element<HTMLButtonElement>('[data-action="previous"]');
const nextButton = element<HTMLButtonElement>('[data-action="next"]');
const position = element('[data-document-position]');
/** The documents in reading order; exactly one is shown in `#reading` at a time. */
const articles = Array.from(reading.querySelectorAll<HTMLElement>(':scope > [data-document]'));

// Framing study (`?framing=0.86`); 0.78 is V3's rendered page height.
const requested = Number(new URLSearchParams(location.search).get('framing'));
const framing = requested >= 0.6 && requested <= 0.95 ? requested : 0.78;
// Timing study (`?approach=1` is V3): the camera reaches the cabinet in this fraction of V3's time.
const requestedApproach = Number(new URLSearchParams(location.search).get('approach'));
const approach = requestedApproach >= 0.6 && requestedApproach <= 1 ? requestedApproach : 0.75;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
/**
 * Narrowest settled page, in rem, that still holds readable lines on the paper.
 * Below it (200% zoom, enlarged text, landscape phones) reading uses the plain layout.
 */
const MIN_PAGE_WIDTH = 16;

let layout: PaperLayout | null = null;
let current: ExperienceState | null = null;
/** Document displayed in `#reading`, and the one announced in the navigation. */
let shownDocument = 0;
let announcedDocument = 0;
/** Inert, hidden visual copy of the other document while a sheet turns. */
let copy: HTMLElement | null = null;
/** Reading position within each document for this visit; unvisited documents open at the top. */
const scrollMemory = new Map<number, number>();

/** Page placement on the paper: untransformed at rest, optionally uncovered only below `clipTop`. */
function rest(target: HTMLElement, rect: Rect, clipTop?: number): void {
  const style = target.style;
  style.width = `${rect.width}px`;
  style.height = `${rect.height}px`;
  style.left = `${rect.x}px`;
  style.top = `${rect.y}px`;
  style.transform = '';
  style.opacity = '';
  style.clipPath = clipTop === undefined ? '' : `inset(${Math.min(rect.height, Math.max(0, clipTop))}px 0 0 0)`;
}

/** Page carried by a moving sheet: the settled layout mapped onto the sheet's screen quad. */
function carry(target: HTMLElement, rect: Rect, quad: Quad | null, opacity: number): void {
  const style = target.style;
  style.width = `${rect.width}px`;
  style.height = `${rect.height}px`;
  style.left = '0px';
  style.top = '0px';
  style.transform = quad ? quadTransform(rect.width, rect.height, quad) : '';
  style.opacity = quad ? String(opacity) : '0';
  style.clipPath = '';
}

function removeCopy(): void {
  copy?.remove();
  copy = null;
}

/** A visual copy of a document for the other half of a turn. It has no IDs, focus targets, selection or accessible content. */
function makeCopy(index: number, offset: number): void {
  removeCopy();
  const source = articles[index];
  if (!source) return;
  const article = source.cloneNode(true) as HTMLElement;
  for (const node of [article, ...article.querySelectorAll('[id], [aria-labelledby]')]) {
    node.removeAttribute('id');
    node.removeAttribute('aria-labelledby');
  }
  article.dataset.active = '';
  const frame = document.createElement('div');
  frame.className = 'reading-frame';
  frame.append(article);
  copy = document.createElement('div');
  copy.className = 'paper paper-copy';
  copy.inert = true;
  copy.setAttribute('aria-hidden', 'true');
  copy.append(frame);
  paper.after(copy);
  if (layout) rest(copy, layout.settled);
  frame.scrollTop = offset; // Shows exactly what the reader last saw on that page.
}

function documentTop(): number {
  return reading.getBoundingClientRect().top + window.scrollY;
}

/** Scroll offset within the shown document: the paper scrolls in the scene, the window in the plain layout. */
function readingOffset(surface: Surface): number {
  return surface === 'scene' ? reading.scrollTop : Math.max(0, window.scrollY - documentTop());
}

function restoreOffset(index: number, surface: Surface): void {
  const offset = scrollMemory.get(index);
  if (surface === 'scene') {
    reading.scrollTop = offset ?? 0;
    return;
  }
  // From the top of the document; the header stays in view when there is no position to return to.
  const top = documentTop();
  window.scrollTo(0, offset ? top + offset : Math.min(window.scrollY, top));
}

function showInReading(index: number): void {
  articles.forEach((article, i) => { article.toggleAttribute('data-active', i === index); });
  shownDocument = index;
}

function title(index: number): string {
  return articles[index]?.querySelector('h1')?.textContent?.trim() ?? '';
}

function applyPaper(): void {
  const phase = current?.phase;
  const placed = current?.surface === 'scene' && (phase === 'entering' || phase === 'reading' || phase === 'turning');
  if (!layout || !placed) {
    paper.removeAttribute('style');
    removeCopy();
    delete root.dataset.sheet;
    return;
  }
  const { settled } = layout;
  if (layout.kind === 'moving' && phase === 'entering') {
    carry(paper, settled, layout.quad, layout.opacity);
    delete root.dataset.sheet;
    return;
  }
  if (layout.kind === 'turning' && phase === 'turning' && copy) {
    // The document printed on the turning sheet rides it; the one beneath
    // stays at rest and is uncovered only below the sheet, so neither text
    // is drawn over the wrong paper.
    const carried = current?.document === layout.upper ? paper : copy;
    carry(carried, settled, layout.quad, layout.opacity);
    rest(carried === paper ? copy : paper, settled, layout.cover - settled.y);
    root.dataset.sheet = 'turning';
    return;
  }
  // Untransformed at rest: crisp, selectable text in the same box as the moving copy.
  if (phase !== 'turning') removeCopy();
  rest(paper, settled);
  if (layout.kind === 'settled') root.dataset.sheet = articles[layout.sheet]?.dataset.document ?? '';
  else delete root.dataset.sheet;
}

function message(state: ExperienceState): string {
  if (state.failed) return 'The 3D archive is unavailable, so the document is shown directly.';
  if (state.phase === 'loading') return 'Preparing the archive…';
  if (state.phase === 'idle') return 'The archive is ready.';
  if (state.phase === 'entering') return 'Opening the archive…';
  return '';
}

// A slow-device settle ends an entrance the visitor started, like completion.
const USER_REASONS: readonly Reason[] = ['open', 'complete', 'direct', 'slow'];

const view = {
  render(state: ExperienceState, reason: Reason): void {
    const active = document.activeElement;
    const focusWasInEntrance = entrance.contains(active);
    const focusWasInDocument = reading.contains(active);
    const previous = current;
    const changed = state.document !== shownDocument;
    // Moving between the paper and the plain layout keeps the reading position.
    const moved = !changed && previous && previous.surface !== state.surface && state.phase === 'reading';
    const offset = moved ? readingOffset(previous.surface) : 0;
    if (changed) {
      // Remember where the reader was, and keep that view on the outgoing sheet.
      const offset = readingOffset(previous?.surface ?? state.surface);
      scrollMemory.set(shownDocument, offset);
      if (state.phase === 'turning') makeCopy(shownDocument, offset);
      showInReading(state.document);
    }
    current = state;
    root.dataset.phase = state.phase;
    root.dataset.surface = state.surface;
    root.dataset.transition = String(state.transitionId);
    root.dataset.document = articles[state.document]?.dataset.document ?? '';
    reading.inert = state.phase !== 'reading';
    openButton.setAttribute('aria-disabled', String(state.phase !== 'idle'));
    openButton.textContent = state.phase === 'entering' ? 'Opening…' : 'Open the archive';
    readButton.textContent = state.phase === 'entering' ? 'Skip the animation' : 'Go straight to the document';
    status.textContent = message(state);
    // Both directions are unavailable while a sheet turns (not queued); the
    // first and last documents disable the direction that would wrap.
    const last = articles.length - 1;
    previousButton.setAttribute('aria-disabled', String(state.phase !== 'reading' || state.document <= 0));
    nextButton.setAttribute('aria-disabled', String(state.phase !== 'reading' || state.document >= last));
    if (state.document !== announcedDocument) {
      // Polite live region: announces the committed document once per change.
      const hidden = document.createElement('span');
      hidden.className = 'visually-hidden';
      hidden.textContent = `: ${title(state.document)}`;
      const word = document.createElement('span');
      word.className = 'position-word';
      word.textContent = 'Document ';
      position.replaceChildren(word, `${state.document + 1} of ${articles.length}`, hidden);
      announcedDocument = state.document;
    }
    if (state.phase !== 'turning') removeCopy();
    applyPaper();
    if (changed) restoreOffset(state.document, state.surface);
    if (moved) {
      scrollMemory.set(state.document, offset);
      restoreOffset(state.document, state.surface);
    }

    // Deliberate entrance actions move focus to the document; passive changes
    // only rescue focus from controls that have just disappeared. Document
    // navigation keeps focus on the control that was used.
    const fromTurn = previous?.phase === 'turning' || reason === 'navigate';
    if (state.phase === 'reading' && (reason === 'direct' || focusWasInEntrance || (!fromTurn && USER_REASONS.includes(reason)))) {
      reading.focus({ preventScroll: true });
    } else if (reason === 'navigate' && focusWasInDocument && previous) {
      // Focus inside the outgoing document (for example, a browser that does not focus clicked buttons).
      (state.document > previous.document ? nextButton : previousButton).focus();
    }
  },
};

function reserve(viewport: Viewport): Reserve {
  // The document controls are fixed at the bottom in one row; keep the page clear of them.
  // Measured from the control height and offset, so it holds on either surface.
  const controls = nav.hidden ? 0 : previousButton.offsetHeight + parseFloat(getComputedStyle(nav).bottom) + 8;
  if (viewport.width >= 640) {
    const margin = Math.max(16, controls);
    return { top: margin, bottom: margin, side: 16 };
  }
  return { top: header.getBoundingClientRect().height, bottom: Math.max(12, controls), side: 12 };
}

/** Whether the settled page would be wide enough to read on the paper at this viewport and text size. */
function sceneFits(): boolean {
  const viewport = { width: window.innerWidth, height: window.innerHeight };
  const box = readingBox(viewport, PAGE_ASPECT, framing, reserve(viewport));
  return box.pageHeight * PAGE_ASPECT >= MIN_PAGE_WIDTH * parseFloat(getComputedStyle(root).fontSize);
}

nav.hidden = articles.length < 2;

/**
 * Until now every document was shown in order: the inline script's direct
 * access and reduced-motion layouts must not hide content behind controls that
 * do not exist yet. Show one document at a time from here, starting on the one
 * the reader is using (holding focus, or else at the top of the window), and
 * keep it where it was on screen.
 */
function startPaging(): number {
  // Only the plain layout has shown the documents; the scene always opens on the first.
  const shown = root.dataset.surface === 'flat';
  let index = shown ? articles.findIndex((article) => article.contains(document.activeElement)) : 0;
  if (index < 0) {
    const line = window.innerHeight / 3;
    index = Math.max(0, articles.findLastIndex((article) => article.getBoundingClientRect().top <= line));
  }
  const screenTop = articles[index]?.getBoundingClientRect().top ?? 0;
  root.dataset.paged = '';
  showInReading(index);
  if (shown && index > 0) {
    window.scrollTo(0, (articles[index]?.getBoundingClientRect().top ?? 0) + window.scrollY - screenTop);
  }
  return index;
}

const controller = new ExperienceController({
  view,
  reducedMotion: reduceMotion.matches,
  sceneSupported: 'WebGL2RenderingContext' in window,
  directAccess,
  documentCount: articles.length,
  document: startPaging(),
  sceneFits: sceneFits(),
  loadScene: async (hooks) => {
    // Observable load outcome for diagnostics and tests; the controller decides what it means.
    root.dataset.sceneLoad = 'pending';
    try {
      const { loadArchiveScene } = await import('./scene');
      const scene = await loadArchiveScene({
        ...hooks, canvas, url: sceneUrl, framing, approach, reserve,
        layout: (next) => { layout = next; applyPaper(); },
      });
      root.dataset.sceneLoad = 'loaded';
      return scene;
    } catch (error) {
      root.dataset.sceneLoad = 'failed';
      throw error;
    }
  },
});

openButton.addEventListener('click', () => controller.open());
readButton.addEventListener('click', () => controller.readNow());
previousButton.addEventListener('click', () => controller.navigate(-1));
nextButton.addEventListener('click', () => controller.navigate(1));
skipLink.addEventListener('click', (event) => {
  if (controller.state.phase === 'reading') return; // Ordinary in-page link.
  event.preventDefault();
  controller.readNow();
});
reduceMotion.addEventListener('change', () => controller.reducedMotionChanged(reduceMotion.matches));
// Registered before the scene's own listener, which then re-poses the camera for the new size.
window.addEventListener('resize', () => controller.sceneFits(sceneFits()));
controller.start();
