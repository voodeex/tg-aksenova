"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { engine } from "@/lib/engine";
import { cursorStore } from "@/lib/store";
import {
  strandGlowFragmentEmissive,
  strandGlowFragmentHeader,
  strandGlowVertexHeader,
  strandGlowVertexMain,
} from "@/shaders/sculpture";
import { clamp, damp, lerp, seeded } from "@/utils/math";

type StrandData = {
  basePoints: THREE.Vector3[];
  spreadDir: THREE.Vector3;
  waveAnchor: THREE.Vector3;
  haloAnchor: THREE.Vector3;
  phase: number;
  radius: number;
  isChampagne: boolean;
};

type Props = {
  quality: "high" | "medium" | "low";
};

/**
 * Центральная интерактивная 3D-скульптура:
 * Оптимизирована для идеально плавных 60–120 FPS:
 * - Микроколебания («дыхание») выполняются на GPU в вершинном шейдере без нагрузки на CPU.
 * - Пересчёт кривых TubeGeometry происходит только при активном скролл-морфинге (spread / wave / halo)
 *   с использованием предвыделенных буферов без аллокаций памяти (0 GC-пауз).
 */
export function Sculpture({ quality }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const tipsRef = useRef<THREE.InstancedMesh>(null);
  const nodesRef = useRef<THREE.InstancedMesh>(null);
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  const strandCount = quality === "high" ? 48 : quality === "medium" ? 34 : 22;
  const segments = quality === "high" ? 24 : quality === "medium" ? 18 : 14;
  const radialSegments = quality === "high" ? 6 : 5;

  const shaderUniforms = useRef({
    uTime: { value: 0 },
    uGlow: { value: 1 },
    uBreath: { value: 0.012 },
    uTipColor: { value: new THREE.Color("#E8CFA0") },
  });

  const { strands, geometries, workingCurves, dummy, frenetScratch } = useMemo(() => {
    const rand = seeded(2026);
    const list: StrandData[] = [];
    const geos: THREE.TubeGeometry[] = [];
    const curves: THREE.CatmullRomCurve3[] = [];
    const CONTROL_COUNT = 7;

    for (let i = 0; i < strandCount; i++) {
      const tNorm = i / strandCount;
      const goldenAngle = i * 2.399963229728653;
      const rBundle = 0.14 + Math.pow(rand(), 0.75) * 0.68;
      const bx = Math.cos(goldenAngle) * rBundle;
      const by = Math.sin(goldenAngle) * rBundle;

      const pts: THREE.Vector3[] = [];
      for (let j = 0; j < CONTROL_COUNT; j++) {
        const u = j / (CONTROL_COUNT - 1);
        const flare = Math.pow(u, 1.55) * 1.38 + 0.34;
        const twist = goldenAngle + (1 - u) * 1.35 + Math.sin(u * Math.PI) * 0.35;
        const localR = rBundle * flare;

        const axisX = lerp(-1.25, 0.48, u);
        const axisY = lerp(1.45, -0.88, u);
        const axisZ = lerp(-0.8, 0.88, u);

        const px = axisX + Math.cos(twist) * localR;
        const py = axisY + Math.sin(twist) * localR * 0.88;
        const pz = axisZ + Math.sin(twist * 1.5) * localR * 0.7;
        pts.push(new THREE.Vector3(px, py, pz));
      }

      const spreadDir = new THREE.Vector3(bx, by, (rand() - 0.5) * 0.7)
        .normalize()
        .multiplyScalar(1.6 + rand() * 1.8);

      const waveAnchor = new THREE.Vector3(
        (tNorm - 0.5) * 5.8,
        Math.sin(tNorm * Math.PI * 3) * 0.8,
        Math.cos(tNorm * Math.PI * 2) * 0.85,
      );

      const haloAngle = tNorm * Math.PI * 2;
      const haloAnchor = new THREE.Vector3(
        Math.cos(haloAngle) * 1.75,
        Math.sin(haloAngle) * 1.75,
        Math.sin(haloAngle * 3) * 0.2,
      );

      const workPts = pts.map((v) => v.clone());
      const curve = new THREE.CatmullRomCurve3(workPts);
      const radius = 0.025 + (i % 5 === 0 ? 0.015 : (i % 3) * 0.005);
      const geo = new THREE.TubeGeometry(curve, segments, radius, radialSegments, false);

      list.push({
        basePoints: pts,
        spreadDir,
        waveAnchor,
        haloAnchor,
        phase: rand() * Math.PI * 2,
        radius,
        isChampagne: i % 3 === 0,
      });
      curves.push(curve);
      geos.push(geo);
    }

    // Предвыделенные массивы векторов для расчёта рамок Френе без аллокаций в кадре
    const tangents = Array.from({ length: segments + 1 }, () => new THREE.Vector3());
    const normals = Array.from({ length: segments + 1 }, () => new THREE.Vector3());
    const binormals = Array.from({ length: segments + 1 }, () => new THREE.Vector3());

    return {
      strands: list,
      geometries: geos,
      workingCurves: curves,
      dummy: new THREE.Object3D(),
      frenetScratch: { tangents, normals, binormals },
    };
  }, [strandCount, segments, radialSegments]);

  const { darkChromeMat, champagneMat, tipMat, coreMat, ringMat } = useMemo(() => {
    const patchShader = (mat: THREE.MeshPhysicalMaterial) => {
      mat.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = shaderUniforms.current.uTime;
        shader.uniforms.uGlow = shaderUniforms.current.uGlow;
        shader.uniforms.uBreath = shaderUniforms.current.uBreath;
        shader.uniforms.uTipColor = shaderUniforms.current.uTipColor;
        shader.vertexShader = shader.vertexShader
          .replace("#include <common>", `#include <common>\n${strandGlowVertexHeader}`)
          .replace("#include <begin_vertex>", strandGlowVertexMain);
        shader.fragmentShader = shader.fragmentShader
          .replace("#include <common>", `#include <common>\n${strandGlowFragmentHeader}`)
          .replace(
            "#include <emissivemap_fragment>",
            `#include <emissivemap_fragment>\n${strandGlowFragmentEmissive}`,
          );
      };
    };

    const chrome = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#2A2520"),
      metalness: 0.9,
      roughness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      iridescence: 0.35,
      iridescenceIOR: 1.3,
    });
    patchShader(chrome);

    const champagne = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#C2AE88"),
      metalness: 0.86,
      roughness: 0.2,
      clearcoat: 0.9,
      clearcoatRoughness: 0.14,
      iridescence: 0.25,
    });
    patchShader(champagne);

    const tip = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#FFF4D4"),
      emissive: new THREE.Color("#E8C478"),
      emissiveIntensity: 2.1,
      roughness: 0.15,
      metalness: 0.1,
    });

    const core = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#F4F1EA"),
      metalness: 0.12,
      roughness: 0.14,
      transparent: true,
      opacity: 0.7,
      iridescence: 0.45,
      iridescenceIOR: 1.32,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
    });

    const ring = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#C5B89A"),
      metalness: 0.94,
      roughness: 0.15,
      clearcoat: 1,
    });

    return {
      darkChromeMat: chrome,
      champagneMat: champagne,
      tipMat: tip,
      coreMat: core,
      ringMat: ring,
    };
  }, []);

  useEffect(() => {
    return () => {
      geometries.forEach((g) => g.dispose());
      darkChromeMat.dispose();
      champagneMat.dispose();
      tipMat.dispose();
      coreMat.dispose();
      ringMat.dispose();
    };
  }, [geometries, darkChromeMat, champagneMat, tipMat, coreMat, ringMat]);

  const smoothState = useRef({
    spread: 0,
    wave: 0,
    halo: 0,
    prevSpread: -1,
    prevWave: -1,
    prevHalo: -1,
    rotX: 0,
    rotY: 0,
    dragX: 0,
    dragY: 0,
    lastX: 0,
    lastY: 0,
    dragging: false,
  });

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const s = engine.state;
    const g = groupRef.current;
    if (!g) return;

    const visible = s.sScale > 0.01 && Math.abs(s.cam[2] - s.sPos[2]) < 32;
    g.visible = visible;
    if (!visible) return;

    const t = state.clock.elapsedTime;
    shaderUniforms.current.uTime.value = t;
    shaderUniforms.current.uGlow.value = s.glow;
    shaderUniforms.current.uBreath.value = engine.reduced ? 0 : 0.011;

    const sm = smoothState.current;
    sm.spread = damp(sm.spread, s.spread, 8, dt);
    sm.wave = damp(sm.wave, s.wave, 7, dt);
    sm.halo = damp(sm.halo, s.halo, 7, dt);

    // Плавное следование за указателем мыши и лёгкое вращение всей скульптуры
    const targetRotY = engine.pointer.x * 0.36 + sm.dragX + Math.sin(t * 0.26) * 0.07;
    const targetRotX = -engine.pointer.y * 0.24 + sm.dragY + Math.cos(t * 0.22) * 0.05;
    sm.rotY = damp(sm.rotY, targetRotY, 5.5, dt);
    sm.rotX = damp(sm.rotX, targetRotX, 5.5, dt);

    g.position.set(
      damp(g.position.x, s.sPos[0], 8.5, dt),
      damp(g.position.y, s.sPos[1], 8.5, dt),
      damp(g.position.z, s.sPos[2], 10, dt),
    );

    const sc = damp(g.scale.x, s.sScale, 7.5, dt);
    g.scale.setScalar(sc);

    g.rotation.set(
      sm.rotX + (1 - s.sTilt) * 0.1,
      sm.rotY,
      lerp(0, -0.22, s.sTilt),
    );

    if (coreRef.current) {
      const coreScale = lerp(0.56, 0.82, sm.halo) * (1 + Math.sin(t * 1.1) * 0.025);
      coreRef.current.scale.setScalar(coreScale);
      coreRef.current.rotation.y = t * 0.22;
      coreRef.current.rotation.x = t * 0.15;
    }

    if (ringRef.current) {
      ringRef.current.scale.setScalar(lerp(0.72, 1.28, sm.halo));
      ringRef.current.rotation.z = t * 0.2;
      ringRef.current.rotation.x = Math.PI * 0.32 + Math.sin(t * 0.35) * 0.1;
    }

    // Пересчитываем геометрию трубок ТОЛЬКО когда параметры морфинга действительно изменились
    const morphDelta =
      Math.abs(sm.spread - sm.prevSpread) +
      Math.abs(sm.wave - sm.prevWave) +
      Math.abs(sm.halo - sm.prevHalo);

    const tips = tipsRef.current;
    const nodes = nodesRef.current;

    if (morphDelta > 0.0004) {
      sm.prevSpread = sm.spread;
      sm.prevWave = sm.wave;
      sm.prevHalo = sm.halo;

      for (let i = 0; i < strandCount; i++) {
        const st = strands[i];
        const curve = workingCurves[i];
        const pts = curve.points;
        const L = pts.length;

        for (let j = 0; j < L; j++) {
          const u = j / (L - 1);
          const base = st.basePoints[j];

          let x = base.x;
          let y = base.y;
          let z = base.z;

          // Разлёт волокон при прокрутке
          const sp = sm.spread * (0.35 + u * 0.95);
          x += st.spreadDir.x * sp;
          y += st.spreadDir.y * sp;
          z += st.spreadDir.z * sp + sm.spread * (u - 0.3) * 1.85;

          // Волновая архитектурная структура (секция О преподавателе)
          if (sm.wave > 0.001) {
            const wx = st.waveAnchor.x + (u - 0.5) * 1.45;
            const wy = st.waveAnchor.y + Math.sin(u * Math.PI * 2 + st.phase) * 0.38;
            const wz = st.waveAnchor.z + Math.cos(u * Math.PI + st.phase) * 0.5;
            x = lerp(x, wx, sm.wave);
            y = lerp(y, wy, sm.wave);
            z = lerp(z, wz, sm.wave);
          }

          // Финальное кольцо-гало (секция Контакты)
          if (sm.halo > 0.001) {
            const angle = (i / strandCount) * Math.PI * 2 + u * 1.65;
            const ringR = 1.58 + Math.sin(u * Math.PI * 2 + st.phase) * 0.2;
            const hx = Math.cos(angle) * ringR;
            const hy = Math.sin(angle) * ringR;
            const hz = Math.cos(u * Math.PI * 2 + st.phase) * 0.22;
            x = lerp(x, hx, sm.halo);
            y = lerp(y, hy, sm.halo);
            z = lerp(z, hz, sm.halo);
          }

          pts[j].set(x, y, z);
        }

        updateTubeZeroAlloc(
          geometries[i],
          curve,
          segments,
          radialSegments,
          st.radius,
          frenetScratch,
        );

        if (tips) {
          const tipPt = pts[L - 1];
          dummy.position.copy(tipPt);
          dummy.scale.setScalar(st.radius * 1.42);
          dummy.updateMatrix();
          tips.setMatrixAt(i, dummy.matrix);
        }
      }

      if (tips) tips.instanceMatrix.needsUpdate = true;
    }

    // Легковесное обновление орбитальных микрочастиц (всего 48 матриц)
    if (nodes) {
      for (let i = 0; i < strandCount; i++) {
        const st = strands[i];
        const pts = workingCurves[i].points;
        const L = pts.length;
        const uOrb = ((t * 0.12 + st.phase * 0.3) % 1 + 1) % 1;
        const idx = clamp(Math.floor(uOrb * (L - 1)), 0, L - 1);
        const p = pts[idx];
        dummy.position.set(
          p.x + Math.cos(t * 1.1 + st.phase) * 0.15,
          p.y + Math.sin(t * 0.95 + st.phase) * 0.15,
          p.z + 0.12,
        );
        const nodeScale = 0.021 * (0.72 + 0.45 * Math.sin(t * 2.4 + st.phase));
        dummy.scale.setScalar(nodeScale);
        dummy.updateMatrix();
        nodes.setMatrixAt(i, dummy.matrix);
      }
      nodes.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerOver={(e) => {
        e.stopPropagation();
        cursorStore.set({ label: "DRAG", active: true, source: "gl" });
      }}
      onPointerOut={() => {
        if (cursorStore.get().source === "gl") {
          cursorStore.set({ label: null, active: false, source: null });
        }
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        smoothState.current.dragging = true;
        smoothState.current.lastX = e.clientX;
        smoothState.current.lastY = e.clientY;
      }}
      onPointerUp={() => {
        smoothState.current.dragging = false;
      }}
      onPointerCancel={() => {
        smoothState.current.dragging = false;
      }}
      onPointerMove={(e) => {
        if (!smoothState.current.dragging) return;
        const dx = e.clientX - smoothState.current.lastX;
        const dy = e.clientY - smoothState.current.lastY;
        smoothState.current.lastX = e.clientX;
        smoothState.current.lastY = e.clientY;
        smoothState.current.dragX = clamp(smoothState.current.dragX + dx * 0.006, -1.1, 1.1);
        smoothState.current.dragY = clamp(smoothState.current.dragY + dy * 0.005, -0.65, 0.65);
      }}
    >
      {/* Внутреннее матово-стеклянное ядро */}
      <mesh ref={coreRef} material={coreMat}>
        <icosahedronGeometry args={[0.54, 3]} />
      </mesh>

      {/* Тонкий шампанский орбитальный контур */}
      <mesh ref={ringRef} material={ringMat}>
        <torusGeometry args={[1.32, 0.011, 14, 84]} />
      </mesh>

      {/* Потоки волокон */}
      {geometries.map((geo, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshRefs.current[i] = el;
          }}
          geometry={geo}
          material={strands[i].isChampagne ? champagneMat : darkChromeMat}
          castShadow={false}
          receiveShadow={false}
        />
      ))}

      {/* Светящиеся шампанские кончики волокон */}
      <instancedMesh ref={tipsRef} args={[undefined, undefined, strandCount]} material={tipMat}>
        <sphereGeometry args={[1, 10, 10]} />
      </instancedMesh>

      {/* Орбитальные светящиеся микросферы вокруг пучка */}
      <instancedMesh ref={nodesRef} args={[undefined, undefined, strandCount]} material={tipMat}>
        <sphereGeometry args={[1, 8, 8]} />
      </instancedMesh>
    </group>
  );
}

const _P = new THREE.Vector3();
const _N = new THREE.Vector3();
const _vec = new THREE.Vector3();
const _mat = new THREE.Matrix4();

type FrenetScratch = {
  tangents: THREE.Vector3[];
  normals: THREE.Vector3[];
  binormals: THREE.Vector3[];
};

/**
 * Обновляет вершины и нормали TubeGeometry без единой аллокации объектов в куче.
 */
function updateTubeZeroAlloc(
  geo: THREE.TubeGeometry,
  curve: THREE.CatmullRomCurve3,
  tubularSegments: number,
  radialSegments: number,
  baseRadius: number,
  scratch: FrenetScratch,
) {
  const { tangents, normals, binormals } = scratch;

  for (let i = 0; i <= tubularSegments; i++) {
    curve.getTangent(i / tubularSegments, tangents[i]);
  }

  normals[0].set(0, 0, 0);
  const tx = Math.abs(tangents[0].x);
  const ty = Math.abs(tangents[0].y);
  const tz = Math.abs(tangents[0].z);
  if (tx <= ty && tx <= tz) {
    _vec.set(1, 0, 0);
  } else if (ty <= tx && ty <= tz) {
    _vec.set(0, 1, 0);
  } else {
    _vec.set(0, 0, 1);
  }

  _vec.crossVectors(tangents[0], _vec).normalize();
  normals[0].crossVectors(tangents[0], _vec);
  binormals[0].crossVectors(tangents[0], normals[0]);

  for (let i = 1; i <= tubularSegments; i++) {
    normals[i].copy(normals[i - 1]);
    binormals[i].copy(binormals[i - 1]);
    _vec.crossVectors(tangents[i - 1], tangents[i]);
    if (_vec.length() > Number.EPSILON) {
      _vec.normalize();
      const theta = Math.acos(clamp(tangents[i - 1].dot(tangents[i]), -1, 1));
      normals[i].applyMatrix4(_mat.makeRotationAxis(_vec, theta));
    }
    binormals[i].crossVectors(tangents[i], normals[i]);
  }

  const posAttr = geo.attributes.position as THREE.BufferAttribute;
  const normAttr = geo.attributes.normal as THREE.BufferAttribute;
  const posArr = posAttr.array as Float32Array;
  const normArr = normAttr.array as Float32Array;

  let idx = 0;
  for (let i = 0; i <= tubularSegments; i++) {
    const u = i / tubularSegments;
    curve.getPoint(u, _P);
    const N = normals[i];
    const B = binormals[i];
    const r = baseRadius * (0.58 + 0.55 * Math.pow(u, 0.8));

    for (let j = 0; j <= radialSegments; j++) {
      const v = (j / radialSegments) * Math.PI * 2;
      const sin = Math.sin(v);
      const cos = -Math.cos(v);

      _N.x = cos * N.x + sin * B.x;
      _N.y = cos * N.y + sin * B.y;
      _N.z = cos * N.z + sin * B.z;
      _N.normalize();

      posArr[idx] = _P.x + r * _N.x;
      posArr[idx + 1] = _P.y + r * _N.y;
      posArr[idx + 2] = _P.z + r * _N.z;

      normArr[idx] = _N.x;
      normArr[idx + 1] = _N.y;
      normArr[idx + 2] = _N.z;
      idx += 3;
    }
  }

  posAttr.needsUpdate = true;
  normAttr.needsUpdate = true;
}
