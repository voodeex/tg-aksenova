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
 * Для идеальной читаемости без столкновения подписей полные плашки показываются
 * для выбранной, наведённой и непосредственно связанных с ней сфер, а остальные сферы
 * остаются интерактивными светящимися узлами созвездия.
 */
export function KnowledgeUniverse() {
  const groupRef = useRef<THREE.Group>(null);
  const sphereRefs = useRef<(THREE.Mesh | null)[]>([]);
  const haloRefs = useRef<(THREE.Mesh | null)[]>([]);
  const lineRef = useRef<THREE.LineSegments>(null);

  const focusTopic = useUI("focusTopic");
  const hoverTopic = useUI("hoverTopic");
  const activeSection = useUI("activeSection");
  const [inView, setInView] = useState(false);

  const activeId = focusTopic ?? "digital-edu";

  // Множество связанных узлов для текущей выбранной/наведённой дисциплины
  const visibleLabelIds = useMemo(() => {
    const anchor = hoverTopic ?? activeId;
    const set = new Set<string>([anchor]);
    for (const [a, b] of topicLinks) {
      if (a === anchor) set.add(b);
      if (b === anchor) set.add(a);
    }
    return set;
  }, [activeId, hoverTopic]);

  const { baseMat, activeMat, hoverMat, haloMat, lineGeo, lineMat, indexMap } = useMemo(() => {
    const bMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#C7BEAE"),
      metalness: 0.78,
      roughness: 0.22,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      iridescence: 0.35,
    });

    const aMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#FFF4D4"),
      emissive: new THREE.Color("#DFC186"),
      emissiveIntensity: 2.1,
      roughness: 0.14,
      metalness: 0.25,
    });

    const hMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#EFE6D3"),
      emissive: new THREE.Color("#C5B89A"),
      emissiveIntensity: 0.75,
      metalness: 0.65,
      roughness: 0.16,
      clearcoat: 1,
    });

    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#E2CDA0"),
      transparent: true,
      opacity: 0.6,
    });

    const idxMap = new Map<string, number>();
    topics.forEach((t, i) => idxMap.set(t.id, i));

    const positions = new Float32Array(topicLinks.length * 6);
    const lGeo = new THREE.BufferGeometry();
    lGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const lMat = new THREE.LineBasicMaterial({
      color: new THREE.Color("#C5B89A"),
      transparent: true,
      opacity: 0.3,
    });

    return {
      baseMat: bMat,
      activeMat: aMat,
      hoverMat: hMat,
      haloMat: ringMat,
      lineGeo: lGeo,
      lineMat: lMat,
      indexMap: idxMap,
    };
  }, []);

  useEffect(() => {
    return () => {
      baseMat.dispose();
      activeMat.dispose();
      hoverMat.dispose();
      haloMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
    };
  }, [baseMat, activeMat, hoverMat, haloMat, lineGeo, lineMat]);

  const livePositions = useMemo(() => topics.map((t) => new THREE.Vector3(...t.position)), []);

  useFrame((state, dt) => {
    const camZ = engine.state.cam[2];
    const g = groupRef.current;
    if (!g) return;

    const visible = camZ < -106 && camZ > -140;
    g.visible = visible;
    const shouldShowLabels =
      camZ < -110.5 && camZ > -134 && ui.get().activeSection === "expertise";
    if (shouldShowLabels !== inView) setInView(shouldShowLabels);
    if (!visible) return;

    const t = state.clock.elapsedTime;
    const focused = ui.get().focusTopic;
    const hovered = ui.get().hoverTopic;

    const targetRotY = (focused ? 0 : engine.pointer.x * 0.18) + Math.sin(t * 0.16) * 0.05;
    const targetRotX = (focused ? 0 : -engine.pointer.y * 0.12) + Math.cos(t * 0.14) * 0.03;
    g.rotation.y = damp(g.rotation.y, targetRotY, 4.2, dt);
    g.rotation.x = damp(g.rotation.x, targetRotX, 4.2, dt);

    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i];
      const mesh = sphereRefs.current[i];
      const halo = haloRefs.current[i];
      if (!mesh) continue;

      const isFocused = (focused ?? "digital-edu") === topic.id;
      const isHovered = hovered === topic.id;

      const floatX = Math.sin(t * 0.6 + i * 1.7) * 0.08;
      const floatY = Math.cos(t * 0.52 + i * 1.3) * 0.09;
      const floatZ = Math.sin(t * 0.48 + i * 2.1) * 0.07;

      const magX = isHovered ? engine.pointer.x * 0.18 : 0;
      const magY = isHovered ? engine.pointer.y * 0.18 : 0;

      const tx = topic.position[0] + floatX + magX;
      const ty = topic.position[1] + floatY + magY;
      const tz = topic.position[2] + floatZ + (isFocused ? 0.35 : 0);

      mesh.position.set(
        damp(mesh.position.x, tx, 6, dt),
        damp(mesh.position.y, ty, 6, dt),
        damp(mesh.position.z, tz, 6, dt),
      );
      livePositions[i].copy(mesh.position);

      const countWeight = Math.min(topicCounts[topic.id] ?? 1, 8) / 8;
      const baseRadius = lerp(0.18, 0.3, countWeight);
      const targetScale = isFocused ? baseRadius * 1.38 : isHovered ? baseRadius * 1.24 : baseRadius;
      mesh.scale.setScalar(damp(mesh.scale.x, targetScale, 8, dt));

      if (halo) {
        halo.position.copy(mesh.position);
        halo.rotation.z = t * 0.55 + i;
        const haloScale = isFocused || isHovered ? targetScale * 1.72 : 0.001;
        halo.scale.setScalar(damp(halo.scale.x, haloScale, 9, dt));
      }
    }

    const posAttr = lineGeo.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    let ptr = 0;
    for (let i = 0; i < topicLinks.length; i++) {
      const [aId, bId] = topicLinks[i];
      const ia = indexMap.get(aId) ?? 0;
      const ib = indexMap.get(bId) ?? 0;
      const pa = livePositions[ia];
      const pb = livePositions[ib];
      arr[ptr++] = pa.x;
      arr[ptr++] = pa.y;
      arr[ptr++] = pa.z;
      arr[ptr++] = pb.x;
      arr[ptr++] = pb.y;
      arr[ptr++] = pb.z;
    }
    posAttr.needsUpdate = true;
  });

  const showHtmlLabels = activeSection === "expertise" && inView;

  return (
    <group ref={groupRef} position={[-2.1, -0.35, WORLD.universeZ]} scale={0.58}>
      <lineSegments ref={lineRef} geometry={lineGeo} material={lineMat} />

      {topics.map((topic, i) => {
        const isFocused = activeId === topic.id;
        const isHovered = hoverTopic === topic.id;
        const showLabel = showHtmlLabels && visibleLabelIds.has(topic.id);
        const mat = isFocused ? activeMat : isHovered ? hoverMat : baseMat;

        return (
          <group key={topic.id}>
            <mesh
              ref={(el) => {
                sphereRefs.current[i] = el;
              }}
              position={topic.position}
              material={mat}
              onClick={(e) => {
                e.stopPropagation();
                ui.set({ focusTopic: focusTopic === topic.id ? null : topic.id });
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                ui.set({ hoverTopic: topic.id });
                cursorStore.set({ label: "EXPLORE", active: true, source: "gl" });
              }}
              onPointerOut={() => {
                if (ui.get().hoverTopic === topic.id) ui.set({ hoverTopic: null });
                if (cursorStore.get().source === "gl") {
                  cursorStore.set({ label: null, active: false, source: null });
                }
              }}
            >
              <sphereGeometry args={[1, 22, 22]} />
              {showLabel && (
                <Html
                  position={[0, 1.45, 0]}
                  center
                  distanceFactor={12}
                  zIndexRange={[1, 0]}
                  style={{ pointerEvents: "none" }}
                >
                  <div
                    className={`whitespace-nowrap rounded-full px-2.5 py-0.5 font-mono text-[10px] tracking-wider transition-all duration-300 ${
                      isFocused
                        ? "border border-[#E5CFA0] bg-[#181715]/95 text-[#FFF7E3] shadow-[0_0_18px_rgba(229,207,160,0.4)]"
                        : isHovered
                          ? "border border-white/50 bg-[#181715]/90 text-white"
                          : "border border-white/20 bg-[#181715]/78 text-white/85"
                    }`}
                  >
                    {topic.label}
                  </div>
                </Html>
              )}
            </mesh>

            <mesh
              ref={(el) => {
                haloRefs.current[i] = el;
              }}
              position={topic.position}
              material={haloMat}
            >
              <torusGeometry args={[1, 0.03, 10, 44]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
