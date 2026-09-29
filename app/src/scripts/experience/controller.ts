// The one authority for entrance and document state. The scene reports; only
// this module decides the phase and the current document, and stale
// load/animation callbacks are ignored by ID.

export type Phase = 'loading' | 'idle' | 'entering' | 'reading' | 'turning';
/** `scene`: the document sits on the 3D paper. `flat`: the plain HTML layout. */
export type Surface = 'scene' | 'flat';
export type Reason =
  | 'start' | 'ready' | 'open' | 'complete' | 'direct' | 'reduced-motion' | 'slow' | 'failure'
  | 'navigate' | 'turned' | 'resize';

export interface ExperienceState {
  readonly phase: Phase;
  readonly surface: Surface;
  /** Increases whenever a load, entrance or document change is started or invalidated. */
  readonly transitionId: number;
  readonly failed: boolean;
  /**
   * Index of the current document in reading order. A navigation request
   * commits it immediately; a turn only animates towards it, so every
   * interruption settles on this document.
   */
  readonly document: number;
}

/** What the controller needs from the renderer. */
export interface ArchiveScene {
  /** Start the single entrance timeline; `done` fires once when it finishes. */
  play(done: () => void): void;
  /** Turn the sheets to rest on `document`; `done` fires once when it finishes. */
  turn(document: number, done: () => void): void;
  /** Stop any timeline and show the reading pose with the sheets resting on `document`. */
  settle(document: number): void;
  dispose(): void;
}

export interface SceneHooks {
  /** Pointer activation of the drawer. */
  readonly activate: () => void;
  /** Rendering stopped working after a successful load (for example, context loss). */
  readonly fail: (error: unknown) => void;
  /** An entrance or turn cannot keep pace with real time on this device. */
  readonly slow: () => void;
}

export interface ExperienceView {
  render(state: ExperienceState, reason: Reason): void;
}

export class ExperienceController {
  #state: ExperienceState;
  #scene: ArchiveScene | null = null;
  #reducedMotion: boolean;
  /** Rendering could not keep up once; later document changes skip the turn. */
  #slow = false;
  /** The settled page is large enough to read on the paper at the current viewport and text size. */
  #fits: boolean;
  readonly #documentCount: number;
  readonly #view: ExperienceView;
  readonly #loadScene: (hooks: SceneHooks) => Promise<ArchiveScene>;

  constructor(options: {
    view: ExperienceView;
    loadScene: (hooks: SceneHooks) => Promise<ArchiveScene>;
    reducedMotion: boolean;
    sceneSupported: boolean;
    /** The visitor already chose the plain document before this module ran. */
    directAccess: boolean;
    documentCount: number;
    sceneFits: boolean;
  }) {
    this.#view = options.view;
    this.#loadScene = options.loadScene;
    this.#reducedMotion = options.reducedMotion;
    this.#documentCount = options.documentCount;
    this.#fits = options.sceneFits;
    const direct = options.reducedMotion || !options.sceneSupported || options.directAccess;
    this.#state = {
      phase: direct ? 'reading' : 'loading', surface: direct ? 'flat' : 'scene',
      transitionId: 1, failed: !options.sceneSupported, document: 0,
    };
  }

  get state(): ExperienceState { return this.#state; }

  start(): void {
    this.#view.render(this.#state, 'start');
    if (this.#state.phase !== 'loading') return;
    const id = this.#state.transitionId;
    const hooks: SceneHooks = {
      activate: () => this.open(),
      fail: (error) => { if (this.#scene) this.#fail(error); },
      slow: () => {
        const { phase } = this.#state;
        if (phase !== 'entering' && phase !== 'turning') return;
        this.#slow = true;
        this.readNow('slow');
      },
    };
    this.#loadScene(hooks).then(
      (scene) => {
        if (id !== this.#state.transitionId || this.#state.phase !== 'loading') {
          scene.dispose(); // The visitor already chose the plain document; do not replace it.
          return;
        }
        this.#scene = scene;
        this.#set({ phase: 'idle' }, 'ready');
      },
      (error: unknown) => {
        if (id === this.#state.transitionId && this.#state.phase === 'loading') this.#fail(error);
      },
    );
  }

  /** Deliberate activation. Ignored unless the cabinet is ready and closed. */
  open(): void {
    const scene = this.#scene;
    if (this.#state.phase !== 'idle' || !scene) return;
    if (this.#reducedMotion) {
      scene.settle(this.#state.document);
      this.#set({ phase: 'reading', surface: this.#readingSurface(), transitionId: this.#state.transitionId + 1 }, 'open');
      return;
    }
    const id = this.#state.transitionId + 1;
    this.#set({ phase: 'entering', transitionId: id }, 'open');
    scene.play(() => {
      if (id === this.#state.transitionId && this.#state.phase === 'entering') this.#set({ phase: 'reading', surface: this.#readingSurface() }, 'complete');
    });
  }

  /**
   * Move to the adjacent document. Only accepted while reading, and never past
   * the first or last document; requests during a turn are ignored, not queued.
   */
  navigate(step: 1 | -1): void {
    const { phase, surface, transitionId } = this.#state;
    const document = this.#state.document + step;
    if (phase !== 'reading' || document < 0 || document >= this.#documentCount) return;
    const scene = surface === 'scene' ? this.#scene : null;
    const id = transitionId + 1;
    if (!scene || this.#reducedMotion || this.#slow) {
      scene?.settle(document);
      this.#set({ document, transitionId: id }, 'navigate');
      return;
    }
    this.#set({ phase: 'turning', document, transitionId: id }, 'navigate');
    scene.turn(document, () => {
      if (id === this.#state.transitionId && this.#state.phase === 'turning') this.#set({ phase: 'reading' }, 'turned');
    });
  }

  /** Direct content access: while loading, to skip the entrance, or to finish a turn at once. */
  readNow(reason: 'direct' | 'reduced-motion' | 'slow' = 'direct'): void {
    const { phase } = this.#state;
    if (phase === 'reading') {
      this.#view.render(this.#state, reason);
      return;
    }
    const transitionId = this.#state.transitionId + 1; // Invalidates pending load/animation callbacks.
    if (phase === 'loading' || !this.#scene) {
      this.#set({ phase: 'reading', surface: 'flat', transitionId }, reason);
      return;
    }
    this.#scene.settle(this.#state.document);
    this.#set({ phase: 'reading', surface: this.#readingSurface(), transitionId }, reason);
  }

  /**
   * Viewport or text size changed whether the settled page can hold readable
   * text. Reading (or a turn, which settles) moves between the paper and the
   * plain layout; the entrance picks the surface when it ends.
   */
  sceneFits(fits: boolean): void {
    if (fits === this.#fits) return;
    this.#fits = fits;
    const scene = this.#scene;
    const { phase, surface } = this.#state;
    if (!scene || (phase !== 'reading' && phase !== 'turning')) return;
    const next = this.#readingSurface();
    if (phase === 'reading' && next === surface) return;
    scene.settle(this.#state.document);
    this.#set({ phase: 'reading', surface: next, transitionId: this.#state.transitionId + 1 }, 'resize');
  }

  reducedMotionChanged(reduce: boolean): void {
    this.#reducedMotion = reduce;
    // An idle cabinet stays available; Open then settles without motion.
    const { phase } = this.#state;
    if (reduce && (phase === 'loading' || phase === 'entering' || phase === 'turning')) this.readNow('reduced-motion');
  }

  #readingSurface(): Surface {
    return this.#fits ? 'scene' : 'flat';
  }

  #fail(error: unknown): void {
    console.warn('Archive scene unavailable; showing the document directly.', error);
    this.#scene?.dispose();
    this.#scene = null;
    this.#set({ phase: 'reading', surface: 'flat', transitionId: this.#state.transitionId + 1, failed: true }, 'failure');
  }

  #set(change: Partial<ExperienceState>, reason: Reason): void {
    this.#state = { ...this.#state, ...change };
    this.#view.render(this.#state, reason);
  }
}
