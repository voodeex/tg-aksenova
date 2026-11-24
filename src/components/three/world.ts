/** Мировые координаты «станций» единой сцены. Камера путешествует по оси −Z. */
export const WORLD = {
  slabs: [-16, -26] as const,
  /** расстояние камеры до стеклянной панели в момент фокуса */
  focusDist: 5.8,
  ribbon: { z0: -36, length: 64, y: -1.48 },
  universeZ: -126,
  awardZ: -152,
  contactZ: -180,
  fov: 35,
} as const;

export const ribbonX = (z: number) => Math.sin(z * 0.11) * 1.15;
export const ribbonY = (z: number) => WORLD.ribbon.y + Math.sin(z * 0.07 + 1.3) * 0.12;

/** z-координата маркера года i из n */
export const yearMarkerZ = (i: number, n: number) => WORLD.ribbon.z0 - ((i + 0.5) / Math.max(n, 1)) * WORLD.ribbon.length;
