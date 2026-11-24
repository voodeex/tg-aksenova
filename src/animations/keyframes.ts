import { WORLD } from "@/components/three/world";
import { hexToRgb, type RGB } from "@/utils/math";

export type V3 = [number, number, number];

export type SceneState = {
  cam: V3;
  look: V3;
  bg: RGB;
  fog: [number, number];
  /** разлёт нитей скульптуры */
  spread: number;
  /** перестройка в «волновое поле» */
  wave: number;
  /** финальная минималистичная форма — кольцо */
  halo: number;
  sPos: V3;
  sScale: number;
  /** наклон скульптуры (1 — героический диагональный ракурс) */
  sTilt: number;
  glow: number;
  env: number;
  dust: number;
};

export type SectionId =
  | "home"
  | "about"
  | "education"
  | "development"
  | "archive"
  | "expertise"
  | "awards"
  | "degree"
  | "contact";

export const SECTION_IDS: SectionId[] = [
  "home",
  "about",
  "education",
  "development",
  "archive",
  "expertise",
  "awards",
  "degree",
  "contact",
];

export type Keyframe = {
  id: SectionId;
  /** 0 — верх секции у верха экрана, 1 — низ секции у низа экрана */
  at: number;
  /** дополнительное смещение в высотах экрана */
  vh?: number;
  ease?: "smooth" | "linear";
  s: Partial<SceneState>;
};

export const COLORS = {
  pearl: hexToRgb("#E9E9E7"),
  pearlLight: hexToRgb("#ECECEA"),
  gallery: hexToRgb("#E3E1DC"),
  timeline: hexToRgb("#E5E4E1"),
  universe: hexToRgb("#151516"),
  night: hexToRgb("#0E0E0F"),
  intro: hexToRgb("#0B0B0C"),
};

const F = WORLD.focusDist;
const [S1, S2] = WORLD.slabs;
const R0 = WORLD.ribbon.z0;
const L = WORLD.ribbon.length;
const U = WORLD.universeZ;
const A = WORLD.awardZ;
const C = WORLD.contactZ;

export const BASE_STATE: SceneState = {
  cam: [0, 0, 8.6],
  look: [0, 0, 0],
  bg: COLORS.pearl,
  fog: [12, 42],
  spread: 0,
  wave: 0,
  halo: 0,
  sPos: [0.55, 0.55, -0.8],
  sScale: 0.82,
  sTilt: 1,
  glow: 1,
  env: 1,
  dust: 0.55,
};

/** Режиссура камеры и сцены. portrait — мобильная/вертикальная композиция. */
export function buildKeyframes(portrait: boolean): Keyframe[] {
  const P = portrait;
  return [
    {
      id: "home",
      at: 0,
      s: {
        ...BASE_STATE,
        cam: [0, 0, P ? 13.8 : 8.6],
        sPos: P ? [0.95, 1.95, -3.0] : [0.55, 0.55, -0.8],
        sScale: P ? 0.46 : 0.82,
      },
    },
    {
      id: "home",
      at: 1,
      s: {
        cam: [0.15, 0.1, P ? 11.2 : 5.4],
        look: [0, 0, -2],
        spread: 0.9,
        sPos: P ? [0.65, 1.5, -3.0] : [0.4, 0.2, -1.0],
        sScale: P ? 0.44 : 0.78,
        sTilt: 0.65,
        glow: 1.25,
      },
    },
    {
      id: "about",
      at: 0,
      vh: -0.15,
      s: {
        cam: [-0.8, 0.25, P ? 12.5 : 8.4],
        look: [0.2, 0, -2.2],
        spread: 0.28,
        wave: 1,
        sTilt: 0,
        sPos: P ? [0, 1.8, -3.5] : [0.35, 0.3, -3.0],
        sScale: P ? 0.48 : 0.68,
        glow: 0.8,
      },
    },
    {
      id: "about",
      at: 1,
      s: { cam: [0.7, -0.1, P ? 12 : 7.8], look: [-0.2, 0, -2.5], sScale: P ? 0.35 : 0.55, spread: 0.08 },
    },
    {
      id: "education",
      at: 0,
      s: { cam: [0, 0.15, -6], look: [0, -0.1, S1], bg: COLORS.gallery, fog: [8, 30], spread: 0, sScale: 0, dust: 0.42 },
    },
    { id: "education", at: 0.28, s: { cam: [0, 0, S1 + F], look: [0, -0.1, S1] } },
    { id: "education", at: 0.44, s: { cam: [0, 0, S1 + F - 0.2], look: [0, -0.1, S1] } },
    { id: "education", at: 0.56, s: { cam: [0.25, 0.1, S1 - 3.5], look: [0, -0.1, S2] } },
    { id: "education", at: 0.74, s: { cam: [0, 0, S2 + F], look: [0, -0.1, S2] } },
    { id: "education", at: 0.9, s: { cam: [0, 0, S2 + F - 0.2], look: [0, -0.1, S2] } },
    { id: "education", at: 1, s: { cam: [0.3, 0.25, S2 - 2.5], look: [0, -0.2, S2 - 14], bg: COLORS.timeline } },
    {
      id: "development",
      at: 0,
      s: { cam: [0, 0.6, R0 + 6.5], look: [0, -0.5, R0 - 4], bg: COLORS.timeline, fog: [5, 24], dust: 0.48 },
    },
    { id: "development", at: 1, ease: "linear", s: { cam: [0, 0.6, R0 + 6.5 - L], look: [0, -0.5, R0 - 4 - L] } },
    { id: "archive", at: 0, s: { cam: [0, 0.9, R0 - L + 4], look: [0, 0.2, R0 - L - 6], bg: COLORS.timeline, fog: [5, 22] } },
    { id: "archive", at: 0.85, s: { cam: [0, 0.7, R0 - L], look: [0, 0.2, R0 - L - 10], bg: COLORS.timeline, fog: [5, 22] } },
    {
      id: "expertise",
      at: 0,
      vh: -0.2,
      s: { cam: [0, 0.25, U + (P ? 22 : 14.5)], look: [0, -0.1, U], bg: COLORS.universe, fog: [10, 46], dust: 0.8 },
    },
    { id: "expertise", at: 0.15, s: { cam: [0, 0.1, U + (P ? 20 : 13.8)], look: [P ? 0 : 0.35, P ? -0.8 : -0.15, U] } },
    { id: "expertise", at: 1, s: { cam: [0.45, -0.1, U + (P ? 19.5 : 13.4)], look: [P ? 0 : 0.25, P ? -0.8 : -0.15, U] } },
    {
      id: "awards",
      at: 0,
      vh: -0.35,
      // Ставим золотой 3D-трофей свободно по центру-слева рядом с карточкой, чтобы он не прятался за текстом
      s: {
        cam: [0, 0.25, A + (P ? 11 : 8.6)],
        look: [P ? 0 : 1.05, P ? -0.45 : 0.1, A],
        bg: COLORS.night,
        fog: [6, 32],
        sScale: 0,
        env: 0.82,
        dust: 0.68,
      },
    },
    {
      id: "awards",
      at: 1,
      s: { cam: [-0.65, 0.45, A + (P ? 10.5 : 7.8)], look: [P ? 0 : 0.9, P ? -0.35 : 0.18, A] },
    },
    {
      id: "degree",
      at: 0,
      s: {
        cam: [0, 0.2, A - 6],
        look: [0, 0, A - 22],
        sPos: [P ? 0 : 0.8, 0.15, C - 1.8],
        sScale: 0,
        halo: 0,
        wave: 0,
        env: 0.9,
        bg: COLORS.night,
        dust: 0.85,
      },
    },
    { id: "degree", at: 0.85, s: { cam: [0, 0.15, A - 10], look: [0, 0, C], bg: COLORS.night, sScale: 0, dust: 0.85 } },
    {
      id: "contact",
      at: 0,
      vh: -0.25,
      s: {
        cam: [0, 0.1, C + (P ? 13 : 10.8)],
        look: [0, 0, C],
        bg: COLORS.pearlLight,
        env: 1,
        fog: [10, 42],
        sPos: [P ? 0.25 : 0.95, P ? 1.8 : 0.15, C - 1.8],
        sScale: P ? 0.52 : 0.78,
        halo: 1,
        glow: 0.85,
      },
    },
    {
      id: "contact",
      at: 0.08,
      s: {
        cam: [0, 0, C + (P ? 12.2 : 8.6)],
        look: [0, P ? -0.75 : 0.05, C],
        sPos: [P ? 0.25 : 0.95, P ? 1.8 : 0.15, C - 1.8],
        sScale: P ? 0.52 : 0.78,
        halo: 1,
        glow: 0.75,
      },
    },
    {
      id: "contact",
      at: 1,
      s: {
        cam: [0.15, 0.1, C + (P ? 11.8 : 8.2)],
        look: [0, P ? -0.7 : 0.08, C],
        sPos: [P ? 0.25 : 0.95, P ? 1.8 : 0.15, C - 1.8],
        sScale: P ? 0.52 : 0.78,
      },
    },
  ];
}

/** Поза для кинематографичного интро: тёмный экран, маленький металлический объект. */
export function introPose(p: number, target: SceneState): SceneState {
  const s = structuredClone(target);
  const sm = (a: number, b: number) => {
    const t = Math.min(1, Math.max(0, (p - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  const grow = sm(0.52, 0.96);
  const light = sm(0.18, 0.62);
  const bgMix = sm(0.7, 0.97);
  s.sScale = 0.16 + (target.sScale - 0.16) * grow;
  s.sPos = [target.sPos[0] * grow, target.sPos[1] * grow, target.sPos[2]];
  s.cam = [target.cam[0], target.cam[1], target.cam[2] + (1 - grow) * 1.5];
  s.env = 0.08 + (target.env - 0.08) * light;
  s.glow = 0.25 + (target.glow - 0.25) * light + Math.sin(p * Math.PI) * 0.6;
  s.bg = [0, 1, 2].map((i) => COLORS.intro[i] + (target.bg[i] - COLORS.intro[i]) * bgMix) as RGB;
  s.sTilt = target.sTilt * grow;
  s.dust = 0.9 * (1 - bgMix) + target.dust * bgMix;
  return s;
}
