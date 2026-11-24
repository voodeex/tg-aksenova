"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { WORLD } from "@/components/three/world";
import { topicCounts, topicLinks, topics } from "@/data/topics";
import { engine } from "@/lib/engine";
import { cursorStore, ui, useUI } from "@/lib/store";
import { damp, lerp } from "@/utils/math";

/**
 * «На пересечении дисциплин» — трёхмерное созвездие областей повышения квалификации (z = −126).
 * - На iPhone и десктопе каждая сфера оснащена увеличенной невидимой тач-зоной (2.4x)
 *   и надёжным распознаванием тапа (pointerdown/pointerup без блокировки вертикального скролла).
 * - Подпись в 3D показывается только у выбранной (и на десктопе — наведённой) сферы,
 *   а связанные дисциплины подсвечиваются тёплым золотым свечением и яркими линиями связей —
 *   никаких налезающих друг на друга плашек на экране телефона.
 */
export function KnowledgeUniverse() {
  const groupRef = useRef<THREE.Group>(null);
  const nodeGroupRefs = useRef<(THREE.Group | null)[]>([]);
  const sphereRefs = useRef<(THREE.Mesh | null)[]>([]);
  const haloRefs = useRef<(THREE.Mesh | null)[]>([]);

  const focusTopic = useUI("focusTopic");
  const hoverTopic = useUI("hoverTopic");
  const touch = useUI("touch");
  const activeSection = useUI("activeSection");
  const [inView, setInView] = useState(false);

  const tapStartRef = useRef<{ x: number; y: number; id: string | null }>({
    x: 0,
    y: 0,
    id: null,
  });

  const activeId = focusTopic ?? "digital-edu";

  // Связанные сферы подсвечиваются материалом и золотыми линиями (без нагромождения текстовых плашек)
  const connectedIds = useMemo(() => {
    const anchor = hoverTopic ?? activeId;
    const set = new Set<string>();
    for (const [a, b] of topicLinks) {
      if (a === anchor) set.add(b);
      if (b === anchor) set.add(a);
    }
    return set;
  }, [activeId, hoverTopic]);

  const {
    baseMat,
    connectedMat,
    activeMat,
    hoverMat,
    hitMat,
    haloMat,
    dimLineGeo,
    brightLineGeo,
    dimLineMat,
    brightLineMat,
    indexMap,
  } = useMemo(() => {
    const bMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#8F887B"),
      metalness: 0.75,
      roughness: 0.28,
      clearcoat: 0.9,
      clearcoatRoughness: 0.14,
    });

    const cMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#DFCCA4"),
      emissive: new THREE.Color("#C5B89A"),
      emissiveIntensity: 0.45,
      metalness: 0.72,
      roughness: 0.18,
      clearcoat: 1,
    });

    const aMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#FFF6DE"),
      emissive: new THREE.Color("#E5C687"),
      emissiveIntensity: 2.2,
      roughness: 0.14,
      metalness: 0.2,
    });

    const hMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#F5ECD8"),
      emissive: new THREE.Color("#D4BE92"),
      emissiveIntensity: 0.9,
      metalness: 0.65,
      roughness: 0.16,
      clearcoat: 1,
    });

    const invisibleHit = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });

    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#EAD4A6"),
      transparent: true,
      opacity: 0.75,
    });

    const idxMap = new Map<string, number>();
    topics.forEach((t, i) => idxMap.set(t.id, i));

    const dGeo = new THREE.BufferGeometry();
    dGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(topicLinks.length * 6), 3),
    );

    const brGeo = new THREE.BufferGeometry();
    brGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(topicLinks.length * 6), 3),
    );

    const dMat = new THREE.LineBasicMaterial({
      color: new THREE.Color("#9E9585"),
      transparent: true,
      opacity: 0.2,
    });

    const brMat = new THREE.LineBasicMaterial({
      color: new THREE.Color("#EAD2A0"),
      transparent: true,
      opacity: 0.78,
    });

    return {
      baseMat: bMat,
      connectedMat: cMat,
      activeMat: aMat,
      hoverMat: hMat,
      hitMat: invisibleHit,
      haloMat: ringMat,
      dimLineGeo: dGeo,
      brightLineGeo: brGeo,
      dimLineMat: dMat,
      brightLineMat: brMat,
      indexMap: idxMap,
    };
  }, []);

  useEffect(() => {
    return () => {
      baseMat.dispose();
      connectedMat.dispose();
      activeMat.dispose();
      hoverMat.dispose();
      hitMat.dispose();
      haloMat.dispose();
      dimLineGeo.dispose();
      brightLineGeo.dispose();
      dimLineMat.dispose();
      brightLineMat.dispose();
    };
  }, [
    baseMat,
    connectedMat,
    activeMat,
    hoverMat,
    hitMat,
    haloMat,
    dimLineGeo,
    brightLineGeo,
    dimLineMat,
    brightLineMat,
  ]);

  const livePositions = useMemo(() => topics.map((t) => new THREE.Vector3(...t.position)), []);

  const selectSphere = (id: string) => {
    ui.set({ focusTopic: id });
  };

  useFrame((state, dt) => {
    const camZ = engine.state.cam[2];
    const g = groupRef.current;
    if (!g) return;

    const visible = camZ < -98 && camZ > -142;
    g.visible = visible;
    const shouldShowLabels =
      camZ < -104 && camZ > -135 && ui.get().activeSection === "expertise";
    if (shouldShowLabels !== inView) setInView(shouldShowLabels);
    if (!visible) return;

    const t = state.clock.elapsedTime;
    const focused = ui.get().focusTopic;
    const hovered = ui.get().hoverTopic;
    const anchor = hovered ?? focused ?? "digital-edu";

    const targetRotY = (focused ? 0 : engine.pointer.x * 0.16) + Math.sin(t * 0.16) * 0.05;
    const targetRotX = (focused ? 0 : -engine.pointer.y * 0.11) + Math.cos(t * 0.14) * 0.03;
    g.rotation.y = damp(g.rotation.y, targetRotY, 4.2, dt);
    g.rotation.x = damp(g.rotation.x, targetRotX, 4.2, dt);

    // Адаптивное размещение: слева на десктопе, точно в центре витринного окна на iPhone
    const gx = engine.portrait ? 0 : -2.1;
    const gy = engine.portrait ? 0.08 : -0.3;
    const gs = engine.portrait ? 0.5 : 0.58;
    g.position.x = damp(g.position.x, gx, 6, dt);
    g.position.y = damp(g.position.y, gy, 6, dt);
    g.scale.setScalar(damp(g.scale.x, gs, 6, dt));

    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i];
      const nodeGroup = nodeGroupRefs.current[i];
      const mesh = sphereRefs.current[i];
      const halo = haloRefs.current[i];
      if (!nodeGroup || !mesh) continue;

      const isFocused = (focused ?? "digital-edu") === topic.id;
      const isHovered = hovered === topic.id;

      const floatX = Math.sin(t * 0.6 + i * 1.7) * 0.07;
      const floatY = Math.cos(t * 0.52 + i * 1.3) * 0.08;
      const floatZ = Math.sin(t * 0.48 + i * 2.1) * 0.06;

      const tx = topic.position[0] + floatX;
      const ty = topic.position[1] + floatY;
      const tz = topic.position[2] + floatZ + (isFocused ? 0.35 : 0);

      nodeGroup.position.set(
        damp(nodeGroup.position.x, tx, 6, dt),
        damp(nodeGroup.position.y, ty, 6, dt),
        damp(nodeGroup.position.z, tz, 6, dt),
      );
      livePositions[i].copy(nodeGroup.position);

      const countWeight = Math.min(topicCounts[topic.id] ?? 1, 8) / 8;
      const baseRadius = lerp(0.2, 0.32, countWeight);
      const targetScale = isFocused
        ? baseRadius * 1.42
        : isHovered
          ? baseRadius * 1.26
          : baseRadius;
      mesh.scale.setScalar(damp(mesh.scale.x, targetScale, 8, dt));

      if (halo) {
        halo.rotation.z = t * 0.55 + i;
        const haloScale = isFocused || isHovered ? targetScale * 1.78 : 0.001;
        halo.scale.setScalar(damp(halo.scale.x, haloScale, 9, dt));
      }
    }

    const dimAttr = dimLineGeo.attributes.position as THREE.BufferAttribute;
    const dimArr = dimAttr.array as Float32Array;
    const brAttr = brightLineGeo.attributes.position as THREE.BufferAttribute;
    const brArr = brAttr.array as Float32Array;

    let ptr = 0;
    for (let i = 0; i < topicLinks.length; i++) {
      const [aId, bId] = topicLinks[i];
      const ia = indexMap.get(aId) ?? 0;
      const ib = indexMap.get(bId) ?? 0;
      const pa = livePositions[ia];
      const pb = livePositions[ib];
      const isHighlighted = aId === anchor || bId === anchor;

      dimArr[ptr] = pa.x;
      dimArr[ptr + 1] = pa.y;
      dimArr[ptr + 2] = pa.z;
      dimArr[ptr + 3] = pb.x;
      dimArr[ptr + 4] = pb.y;
      dimArr[ptr + 5] = pb.z;

      if (isHighlighted) {
        brArr[ptr] = pa.x;
        brArr[ptr + 1] = pa.y;
        brArr[ptr + 2] = pa.z;
        brArr[ptr + 3] = pb.x;
        brArr[ptr + 4] = pb.y;
        brArr[ptr + 5] = pb.z;
      } else {
        brArr[ptr] = 0;
        brArr[ptr + 1] = 0;
        brArr[ptr + 2] = 0;
        brArr[ptr + 3] = 0;
        brArr[ptr + 4] = 0;
        brArr[ptr + 5] = 0;
      }
      ptr += 6;
    }
    dimAttr.needsUpdate = true;
    brAttr.needsUpdate = true;
  });

  const showHtmlLabels = activeSection === "expertise" && inView;

  return (
    <group ref={groupRef} position={[-2.1, -0.3, WORLD.universeZ]} scale={0.58}>
      <lineSegments geometry={dimLineGeo} material={dimLineMat} />
      <lineSegments geometry={brightLineGeo} material={brightLineMat} />

      {topics.map((topic, i) => {
        const isFocused = activeId === topic.id;
        const isHovered = !touch && hoverTopic === topic.id;
        const isConnected = connectedIds.has(topic.id);
        // Показываем аккуратный бейдж только для выбранной сферы (и на десктопе — для наведённой)
        const showLabel = showHtmlLabels && (isFocused || isHovered);

        const mat = isFocused
          ? activeMat
          : isHovered
            ? hoverMat
            : isConnected
              ? connectedMat
              : baseMat;

        return (
          <group
            key={topic.id}
            ref={(el) => {
              nodeGroupRefs.current[i] = el;
            }}
            position={topic.position}
          >
            {/* Визуальная сфера */}
            <mesh
              ref={(el) => {
                sphereRefs.current[i] = el;
              }}
              material={mat}
            >
              <sphereGeometry args={[1, 22, 22]} />
            </mesh>

            {/* Увеличенная невидимая тач-сфера для лёгкого нажатия пальцем на iPhone */}
            <mesh
              material={hitMat}
              scale={0.68}
              onPointerDown={(e) => {
                e.stopPropagation();
                tapStartRef.current = { x: e.clientX, y: e.clientY, id: topic.id };
              }}
              onPointerUp={(e) => {
                e.stopPropagation();
                const start = tapStartRef.current;
                if (
                  start.id === topic.id &&
                  Math.hypot(e.clientX - start.x, e.clientY - start.y) < 16
                ) {
                  selectSphere(topic.id);
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
                selectSphere(topic.id);
              }}
              onPointerOver={(e) => {
                if (touch) return;
                e.stopPropagation();
                ui.set({ hoverTopic: topic.id });
                cursorStore.set({ label: "EXPLORE", active: true, source: "gl" });
              }}
              onPointerOut={() => {
                if (touch) return;
                if (ui.get().hoverTopic === topic.id) ui.set({ hoverTopic: null });
                if (cursorStore.get().source === "gl") {
                  cursorStore.set({ label: null, active: false, source: null });
                }
              }}
            >
              <sphereGeometry args={[1, 12, 12]} />
            </mesh>

            {/* Орбитальное кольцо активной сферы */}
            <mesh
              ref={(el) => {
                haloRefs.current[i] = el;
              }}
              material={haloMat}
            >
              <torusGeometry args={[1, 0.032, 10, 44]} />
            </mesh>

            {showLabel && (
              <Html
                position={[0, 0.58, 0]}
                center
                zIndexRange={[2, 0]}
                style={{ pointerEvents: "none" }}
              >
                <div
                  className={`w-max max-w-[168px] text-center font-mono text-[10px] leading-tight font-medium tracking-wider rounded-2xl px-3 py-1.5 shadow-lg transition-all duration-200 sm:max-w-[220px] sm:rounded-full sm:py-1 sm:text-[11px] ${
                    isFocused
                      ? "border border-[#EAD2A0] bg-[#161513]/95 text-[#FFF7E3] shadow-[0_4px_20px_rgba(229,207,160,0.38)]"
                      : "border border-white/45 bg-[#161513]/92 text-white"
                  }`}
                >
                  {topic.label}
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}
