// The one authority for entrance state. The scene reports; only this module
// decides the phase, and stale load/animation callbacks are ignored by ID.

export type Phase = 'loading' | 'idle' | 'entering' | 'reading';
/** `scene`: the document sits on the 3D paper. `flat`: the plain HTML layout. */
export type Surface = 'scene' | 'flat';
export type Reason = 'start' | 'ready' | 'open' | 'complete' | 'direct' | 'reduced-motion' | 'failure';

export interface ExperienceState {
  readonly phase: Phase;
  readonly surface: Surface;
  /** Increases whenever a load or entrance is started or invalidated. */
  readonly transitionId: number;
  readonly failed: boolean;
}

/** What the controller needs from the renderer. */
export interface EntranceScene {
  /** Start the single entrance timeline; `done` fires once when it finishes. */
  play(done: () => void): void;
  /** Stop any timeline and show the settled reading pose immediately. */
  settle(): void;
  dispose(): void;
}

export interface SceneHooks {
  /** Pointer activation of the drawer. */
  readonly activate: () => void;
  /** Rendering stopped working after a successful load (for example, context loss). */
  readonly fail: (error: unknown) => void;
}

export interface ExperienceView {
  render(state: ExperienceState, reason: Reason): void;
}

export class ExperienceController {
  #state: ExperienceState;
  #scene: EntranceScene | null = null;
  #reducedMotion: boolean;
  readonly #view: ExperienceView;
  readonly #loadScene: (hooks: SceneHooks) => Promise<EntranceScene>;

  constructor(options: {
    view: ExperienceView;
    loadScene: (hooks: SceneHooks) => Promise<EntranceScene>;
    reducedMotion: boolean;
    sceneSupported: boolean;
  }) {
    this.#view = options.view;
    this.#loadScene = options.loadScene;
    this.#reducedMotion = options.reducedMotion;
    const direct = options.reducedMotion || !options.sceneSupported;
    this.#state = { phase: direct ? 'reading' : 'loading', surface: direct ? 'flat' : 'scene', transitionId: 1, failed: !options.sceneSupported };
  }

  get state(): ExperienceState { return this.#state; }

  start(): void {
    this.#view.render(this.#state, 'start');
    if (this.#state.phase !== 'loading') return;
    const id = this.#state.transitionId;
    const hooks: SceneHooks = {
      activate: () => this.open(),
      fail: (error) => { if (this.#scene) this.#fail(error); },
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
      scene.settle();
      this.#set({ phase: 'reading', transitionId: this.#state.transitionId + 1 }, 'open');
      return;
    }
    const id = this.#state.transitionId + 1;
    this.#set({ phase: 'entering', transitionId: id }, 'open');
    scene.play(() => {
      if (id === this.#state.transitionId && this.#state.phase === 'entering') this.#set({ phase: 'reading' }, 'complete');
    });
  }

  /** Direct content access: while loading, or to skip the entrance. */
  readNow(reason: 'direct' | 'reduced-motion' = 'direct'): void {
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
    this.#scene.settle();
    this.#set({ phase: 'reading', transitionId }, reason);
  }

  reducedMotionChanged(reduce: boolean): void {
    this.#reducedMotion = reduce;
    // An idle cabinet stays available; Open then settles without motion.
    if (reduce && (this.#state.phase === 'loading' || this.#state.phase === 'entering')) this.readNow('reduced-motion');
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
