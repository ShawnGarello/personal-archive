// Reading-surface view and wiring. The controller decides state; this module
// reflects it in the DOM, owns focus, and places the HTML page on the paper.
import sceneUrl from '../../assets/scene/archive-entrance-v3.glb?url';
import { ExperienceController, type ExperienceState, type Reason } from './controller';
import { quadTransform, type Reserve, type Viewport } from './geometry';
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

// Framing study (`?framing=0.86`); 0.78 is V3's rendered page height.
const requested = Number(new URLSearchParams(location.search).get('framing'));
const framing = requested >= 0.6 && requested <= 0.95 ? requested : 0.78;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

let layout: PaperLayout | null = null;
let current: ExperienceState | null = null;

function applyPaper(): void {
  const style = paper.style;
  const placed = current?.surface === 'scene' && (current.phase === 'entering' || current.phase === 'reading');
  if (!layout || !placed) {
    paper.removeAttribute('style');
    return;
  }
  const { settled } = layout;
  style.width = `${settled.width}px`;
  style.height = `${settled.height}px`;
  if (layout.kind === 'settled' || current?.phase === 'reading') {
    // Untransformed at rest: crisp, selectable text in the same box as the moving copy.
    style.left = `${settled.x}px`;
    style.top = `${settled.y}px`;
    style.transform = '';
    style.opacity = '';
    return;
  }
  style.left = '0px';
  style.top = '0px';
  style.transform = layout.quad ? quadTransform(settled.width, settled.height, layout.quad) : '';
  style.opacity = layout.quad ? String(layout.opacity) : '0';
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
    const focusWasInEntrance = entrance.contains(document.activeElement);
    current = state;
    root.dataset.phase = state.phase;
    root.dataset.surface = state.surface;
    root.dataset.transition = String(state.transitionId);
    reading.inert = state.phase !== 'reading';
    openButton.setAttribute('aria-disabled', String(state.phase !== 'idle'));
    openButton.textContent = state.phase === 'entering' ? 'Opening…' : 'Open the archive';
    readButton.textContent = state.phase === 'entering' ? 'Skip the animation' : 'Go straight to the document';
    status.textContent = message(state);
    applyPaper();
    // Deliberate actions move focus to the document; passive changes only
    // rescue focus from controls that have just disappeared.
    if (state.phase === 'reading' && (USER_REASONS.includes(reason) || focusWasInEntrance)) {
      reading.focus({ preventScroll: true });
    }
  },
};

function reserve(viewport: Viewport): Reserve {
  if (viewport.width >= 640) return { top: 16, bottom: 16, side: 16 };
  return { top: header.getBoundingClientRect().height, bottom: 12, side: 12 };
}

const controller = new ExperienceController({
  view,
  reducedMotion: reduceMotion.matches,
  sceneSupported: 'WebGL2RenderingContext' in window,
  directAccess,
  loadScene: async (hooks) => {
    // Observable load outcome for diagnostics and tests; the controller decides what it means.
    root.dataset.sceneLoad = 'pending';
    try {
      const { loadArchiveScene } = await import('./scene');
      const scene = await loadArchiveScene({
        ...hooks, canvas, url: sceneUrl, framing, reserve,
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
skipLink.addEventListener('click', (event) => {
  if (controller.state.phase === 'reading') return; // Ordinary in-page link.
  event.preventDefault();
  controller.readNow();
});
reduceMotion.addEventListener('change', () => controller.reducedMotionChanged(reduceMotion.matches));
controller.start();
