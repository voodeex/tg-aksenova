/** Минималистичное внешнее хранилище для React (useSyncExternalStore) без лишних зависимостей. */
import { useSyncExternalStore } from "react";

type Listener = () => void;

export function createStore<T extends object>(initial: T) {
  let state = initial;
  const listeners = new Set<Listener>();
  return {
    get: () => state,
    set(partial: Partial<T>) {
      let changed = false;
      for (const key in partial) {
        if (!Object.is(state[key], partial[key])) {
          changed = true;
          break;
        }
      }
      if (!changed) return;
      state = { ...state, ...partial };
      listeners.forEach((l) => l());
    },
    subscribe(listener: Listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export type UIState = {
  introDone: boolean;
  activeSection: string;
  compactNav: boolean;
  webgl: boolean | null;
  quality: "high" | "medium" | "low";
  reducedMotion: boolean;
  touch: boolean;
  focusTopic: string | null;
  hoverTopic: string | null;
  timelineIndex: number;
  veil: { label: string; index: string } | null;
};

export const ui = createStore<UIState>({
  introDone: false,
  activeSection: "home",
  compactNav: false,
  webgl: null,
  quality: "high",
  reducedMotion: false,
  touch: false,
  focusTopic: null,
  hoverTopic: null,
  timelineIndex: 0,
  veil: null,
});

export function useUI<K extends keyof UIState>(key: K): UIState[K] {
  return useSyncExternalStore(
    ui.subscribe,
    () => ui.get()[key],
    () => ui.get()[key],
  );
}

/** Состояние курсора (метки DRAG / EXPLORE / OPEN), выставляется из DOM и из WebGL. */
export const cursorStore = createStore<{ label: string | null; active: boolean; source: "dom" | "gl" | null }>({
  label: null,
  active: false,
  source: null,
});
