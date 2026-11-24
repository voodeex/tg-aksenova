/**
 * Пользовательские GLSL-фрагменты для органических волокон скульптуры
 * с золотисто-шампанским свечением кончиков и плавным GPU-дыханием без нагрузки на CPU.
 */

export const strandGlowVertexHeader = /* glsl */ `
  uniform float uTime;
  uniform float uBreath;
  varying vec2 vStrandUv;
  varying float vTipFactor;
`;

export const strandGlowVertexMain = /* glsl */ `
  #include <begin_vertex>
  vStrandUv = uv;
  vTipFactor = clamp(smoothstep(0.68, 1.0, uv.x), 0.0, 1.0);
  float waveOffset = sin(uTime * 1.15 + uv.x * 4.5 + position.y * 1.4) * uBreath * (0.3 + uv.x * 0.7);
  transformed += objectNormal * waveOffset;
`;

export const strandGlowFragmentHeader = /* glsl */ `
  uniform float uTime;
  uniform float uGlow;
  uniform vec3 uTipColor;
  varying vec2 vStrandUv;
  varying float vTipFactor;
`;

export const strandGlowFragmentEmissive = /* glsl */ `
  float safeTip = clamp(vTipFactor, 0.0, 1.0);
  float safeGlow = clamp(uGlow, 0.0, 2.5);
  float pulse = 0.78 + 0.22 * sin(uTime * 1.6 + vStrandUv.y * 6.2831);
  float tipGlow = (safeTip * safeTip) * safeGlow * pulse;
  float coreFlow = smoothstep(0.0, 0.35, sin(vStrandUv.x * 10.0 - uTime * 1.4) * 0.5 + 0.5) * 0.14 * safeGlow;
  totalEmissiveRadiance += uTipColor * (tipGlow * 1.45 + coreFlow);
`;

/** Вершинный и фрагментный шейдер для атмосферной пыли с мягким затуханием по глубине. */
export const dustVertexShader = /* glsl */ `
  attribute float aScale;
  attribute float aPhase;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSize;
  varying float vAlpha;

  void main() {
    vec3 pos = position;
    pos.y += sin(uTime * 0.45 + aPhase) * 0.18;
    pos.x += cos(uTime * 0.35 + aPhase * 1.3) * 0.14;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    float dist = max(-mvPosition.z, 1.2);
    gl_PointSize = clamp((uSize * aScale * uPixelRatio) / dist, 1.5, 18.0);
    vAlpha = smoothstep(42.0, 6.0, dist) * smoothstep(0.8, 2.8, dist) * (0.55 + 0.45 * sin(uTime * 0.9 + aPhase));
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const dustFragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlpha;

  void main() {
    vec2 c = gl_PointCoord - vec2(0.5);
    float r = length(c);
    if (r > 0.5) discard;
    float soft = clamp(1.0 - r * 2.0, 0.0, 1.0);
    gl_FragColor = vec4(uColor, (soft * soft) * clamp(vAlpha * uOpacity, 0.0, 1.0));
  }
`;
