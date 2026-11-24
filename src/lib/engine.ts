/**
 * Сценарный движок: связывает положение прокрутки с состоянием единой 3D-сцены.
 * Работает без WebGL (обновляет CSS-переменные темы), а Canvas лишь читает engine.state.
 */
import type Lenis from "lenis";
import {
  BASE_STATE,
  SECTION_IDS,
  buildKeyframes,
  introPose,
  type Keyframe,
  type SceneState,
  type SectionId,
} from "@/animations/keyframes";
import { ui } from "@/lib/store";
import { clamp, lerp, luminance, smoothstep, type RGB } from "@/utils/math";

type Anchor = { px: number; ease: "smooth" | "linear"; s: SceneState };

const cloneState = (s: SceneState): SceneState => ({
  ...s,
  cam: [...s.cam],
  look: [...s.look],
  bg: [...s.bg],
  fog: [...s.fog],
  sPos: [...s.sPos],
});

export const engine = {
  lenis: null as Lenis | null,
  scrollY: 0,
  vw: 1440,
  vh: 900,
  portrait: false,
  sections: {} as Record<SectionId, { top: number; height: number }>,
  anchors: [] as Anchor[],
  state: cloneState(BASE_STATE),
  scrollState: cloneState(BASE_STATE),
  /** 0..1 — прогресс кинематографичного интро */
  intro: 0,
  /** однократный «телепорт» камеры (после мгновенного перехода) */
  snap: false,
  pointer: { x: 0, y: 0 },
  reduced: false,
  /** размеры HTML-панели образования в px — 3D-стекло подстраивается под них */
  eduPanel: { w: 820, h: 520 },
  /** индекс и число лет на ленте времени (с учётом фильтра) */
  timeline: { count: 12, index: 0 },
  time: 0,
  ready: false,
};

const lastCss = { bg: "", fg: -1 };

export function sectionProgress(id: SectionId): number {
  const s = engine.sections[id];
  if (!s) return 0;
  const range = Math.max(s.height - engine.vh, 1);
  return clamp((engine.scrollY - s.top) / range);
}

/** Абсолютная позиция прокрутки для точки внутри секции. */
export function sectionPx(id: SectionId, at = 0, vh = 0): number {
  const s = engine.sections[id];
  if (!s) return 0;
  const range = Math.max(s.height - engine.vh, 0);
  return s.top + at * range + vh * engine.vh;
}

export function measure() {
  if (typeof window === "undefined") return;
  engine.vw = window.innerWidth;
  engine.vh = window.innerHeight;
  engine.portrait = engine.vw / engine.vh < 0.9;
  const scroll = window.scrollY;
  for (const id of SECTION_IDS) {
    const el = document.getElementById(id);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    engine.sections[id] = { top: r.top + scroll, height: r.height };
  }
  buildAnchors(buildKeyframes(engine.portrait));
  engine.ready = true;
  tick();
}

function buildAnchors(kfs: Keyframe[]) {
  let acc = cloneState(BASE_STATE);
  const anchors: Anchor[] = [];
  for (const kf of kfs) {
    acc = cloneState({ ...acc, ...kf.s } as SceneState);
    anchors.push({ px: sectionPx(kf.id, kf.at, kf.vh ?? 0), ease: kf.ease ?? "smooth", s: acc });
  }
  for (let i = 1; i < anchors.length; i++) {
    if (anchors[i].px <= anchors[i - 1].px) anchors[i].px = anchors[i - 1].px + 1;
  }
  engine.anchors = anchors;
}

const lerpV = (out: number[], a: readonly number[], b: readonly number[], t: number) => {
  for (let i = 0; i < a.length; i++) out[i] = lerp(a[i], b[i], t);
};

function interpolate(out: SceneState, a: SceneState, b: SceneState, t: number) {
  lerpV(out.cam, a.cam, b.cam, t);
  lerpV(out.look, a.look, b.look, t);
  lerpV(out.bg, a.bg, b.bg, t);
  lerpV(out.fog, a.fog, b.fog, t);
  lerpV(out.sPos, a.sPos, b.sPos, t);
  out.spread = lerp(a.spread, b.spread, t);
  out.wave = lerp(a.wave, b.wave, t);
  out.halo = lerp(a.halo, b.halo, t);
  out.sScale = lerp(a.sScale, b.sScale, t);
  out.sTilt = lerp(a.sTilt, b.sTilt, t);
  out.glow = lerp(a.glow, b.glow, t);
  out.env = lerp(a.env, b.env, t);
  out.dust = lerp(a.dust, b.dust, t);
}

function computeScrollState() {
  const y = engine.scrollY;
  const a = engine.anchors;
  const out = engine.scrollState;
  if (!a.length) return;
  if (y <= a[0].px) return interpolate(out, a[0].s, a[0].s, 0);
  if (y >= a[a.length - 1].px) return interpolate(out, a[a.length - 1].s, a[a.length - 1].s, 0);
  for (let i = 0; i < a.length - 1; i++) {
    const A = a[i];
    const B = a[i + 1];
    if (y >= A.px && y <= B.px) {
      const t = (y - A.px) / (B.px - A.px);
      interpolate(out, A.s, B.s, B.ease === "linear" ? t : smoothstep(0, 1, t));
      return;
    }
  }
}

function updateActive() {
  const probe = engine.scrollY + engine.vh * 0.45;
  let active: SectionId = "home";
  for (const id of SECTION_IDS) {
    const s = engine.sections[id];
    if (s && probe >= s.top) active = id;
  }
  ui.set({ activeSection: active, compactNav: engine.scrollY > 60 });
}

function updateCss(bg: RGB) {
  const key = bg.map((v) => Math.round(v * 255)).join(",");
  if (key === lastCss.bg) return;
  lastCss.bg = key;
  const root = document.documentElement.style;
  root.setProperty("--bg", `rgb(${key})`);
  // 0 — тёмная сцена (светлый текст), 1 — светлая сцена (тёмный текст)
  const lum = luminance(bg);
  const light = smoothstep(0.3, 0.5, lum);
  const q = Math.round(light * 25) / 25;
  if (q !== lastCss.fg) {
    lastCss.fg = q;
    root.setProperty("--light", String(q));
    const fg = Math.round(lerp(245, 20, q));
    const muteR = Math.round(lerp(198, 76, q));
    const muteG = Math.round(lerp(194, 72, q));
    const muteB = Math.round(lerp(185, 65, q));
    root.setProperty("--fg", `rgb(${fg},${fg},${Math.round(lerp(240, 20, q))})`);
    root.setProperty("--fg-mute", `rgb(${muteR},${muteG},${muteB})`);
    root.setProperty("--line", q > 0.5 ? "rgba(23,23,23,0.16)" : "rgba(245,242,235,0.2)");
    document.documentElement.dataset.scene = q > 0.5 ? "light" : "dark";
  }
}

export function tick() {
  if (!engine.ready) return;
  engine.scrollY = engine.lenis ? engine.lenis.scroll : window.scrollY;
  computeScrollState();
  if (engine.intro < 1) {
    const pose = introPose(engine.intro, engine.scrollState);
    Object.assign(engine.state, pose);
  } else {
    const s = engine.state;
    const src = engine.scrollState;
    interpolate(s, src, src, 0);
  }
  updateCss(engine.state.bg);
  updateActive();
}

export function scrollToTarget(target: string | number, opts: { immediate?: boolean; duration?: number } = {}) {
  const lenis = engine.lenis;
  const y = typeof target === "number" ? target : (document.getElementById(target)?.getBoundingClientRect().top ?? 0) + window.scrollY;
  if (opts.immediate) engine.snap = true;
  if (lenis) {
    lenis.scrollTo(y, {
      immediate: opts.immediate,
      duration: opts.duration ?? 1.35,
      easing: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
      force: true,
    });
  } else {
    window.scrollTo({ top: y, behavior: opts.immediate || engine.reduced ? "auto" : "smooth" });
  }
}
