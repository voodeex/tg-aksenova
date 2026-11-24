"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { WORLD } from "@/components/three/world";
import { engine } from "@/lib/engine";
import { damp } from "@/utils/math";

/**
 * Секция «Признание и достижения» (z = −152):
 * медленно вращающаяся абстрактная металлическая скульптура в тёплом шампанском освещении.
 * Вдохновлена пластикой физического трофея без воспроизведения официальных знаков университета.
 */
export function AwardSculpture() {
  const groupRef = useRef<THREE.Group>(null);
  const sculptureRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  const { ribbonGeo, goldMat, darkMetalMat, coreMat } = useMemo(() => {
    // Восходящая спиральная лента
    const pts: THREE.Vector3[] = [];
    const steps = 80;
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const angle = u * Math.PI * 3.2;
      const r = (1 - Math.pow(u - 0.45, 2) * 1.4) * 0.72;
      const y = (u - 0.5) * 2.85;
      pts.push(new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const geo = new THREE.TubeGeometry(curve, 110, 0.085, 16, false);

    const gold = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#D4C19C"),
      metalness: 0.94,
      roughness: 0.14,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      iridescence: 0.22,
    });

    const dark = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#1E1D1B"),
      metalness: 0.9,
      roughness: 0.24,
      clearcoat: 0.85,
    });

    const core = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#FFF2D0"),
      emissive: new THREE.Color("#D9B87A"),
      emissiveIntensity: 1.5,
      roughness: 0.2,
    });

    return { ribbonGeo: geo, goldMat: gold, darkMetalMat: dark, coreMat: core };
  }, []);

  useEffect(() => {
    return () => {
      ribbonGeo.dispose();
      goldMat.dispose();
      darkMetalMat.dispose();
      coreMat.dispose();
    };
  }, [ribbonGeo, goldMat, darkMetalMat, coreMat]);

  useFrame((state, dt) => {
    const camZ = engine.state.cam[2];
    const g = groupRef.current;
    if (!g) return;

    const visible = camZ < -130 && camZ > -168;
    g.visible = visible;
    if (!visible) return;

    const t = state.clock.elapsedTime;
    if (sculptureRef.current) {
      const targetScale = engine.portrait ? 0.68 : 1.0;
      sculptureRef.current.scale.setScalar(damp(sculptureRef.current.scale.x, targetScale, 6, dt));
      sculptureRef.current.rotation.y = t * 0.32 + engine.pointer.x * 0.35;
      sculptureRef.current.rotation.x = damp(
        sculptureRef.current.rotation.x,
        -engine.pointer.y * 0.18 + Math.sin(t * 0.5) * 0.05,
        4,
        dt,
      );
      sculptureRef.current.position.y = (engine.portrait ? 0.45 : 0) + Math.sin(t * 0.8) * 0.08;
    }

    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = t * 0.25;
      ring1Ref.current.rotation.x = Math.PI * 0.38 + Math.sin(t * 0.4) * 0.1;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = -t * 0.2;
      ring2Ref.current.rotation.x = -Math.PI * 0.28;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, WORLD.awardZ]}>
      {/* Тёплое шампанское локальное освещение трофея */}
      <pointLight position={[2.2, 2.6, 2.5]} intensity={14} distance={14} color="#F2D9A6" />
      <pointLight position={[-2.4, -1.5, 1.8]} intensity={7} distance={12} color="#C5B89A" />

      <group ref={sculptureRef}>
        {/* Спиральная золотисто-титановая скульптура */}
        <mesh geometry={ribbonGeo} material={goldMat} />

        {/* Внутренняя вертикальная ось со светящимся ядром */}
        <mesh material={darkMetalMat}>
          <cylinderGeometry args={[0.04, 0.12, 2.6, 24]} />
        </mesh>
        <mesh position={[0, 0.2, 0]} material={coreMat}>
          <octahedronGeometry args={[0.24, 2]} />
        </mesh>

        {/* Орбитальные кольца */}
        <mesh ref={ring1Ref} material={goldMat}>
          <torusGeometry args={[1.18, 0.014, 14, 72]} />
        </mesh>
        <mesh ref={ring2Ref} material={darkMetalMat}>
          <torusGeometry args={[1.45, 0.01, 12, 72]} />
        </mesh>

        {/* Архитектурный постамент */}
        <mesh position={[0, -1.55, 0]} material={darkMetalMat}>
          <cylinderGeometry args={[0.68, 0.82, 0.22, 36]} />
        </mesh>
        <mesh position={[0, -1.43, 0]} rotation={[Math.PI / 2, 0, 0]} material={goldMat}>
          <torusGeometry args={[0.68, 0.012, 12, 48]} />
        </mesh>
      </group>
    </group>
  );
}
