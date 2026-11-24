"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { WORLD } from "@/components/three/world";
import { engine } from "@/lib/engine";
import { damp, lerp, smoothstep } from "@/utils/math";

type Props = {
  quality: "high" | "medium" | "low";
};

/**
 * Секция «Образование» в 3D-пространстве:
 * два элегантных парящих стеклянных монолита в светлой музейной галерее (z = −16 и z = −26).
 * Сбалансированный масштаб и светлое матовое стекло обеспечивают пространственную глубину
 * без затемнения фона и без наезда на заголовки и навигацию.
 */
export function EducationScene({ quality }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const slab1Ref = useRef<THREE.Group>(null);
  const slab2Ref = useRef<THREE.Group>(null);

  const { glass1, glass2, frameMat, railMat } = useMemo(() => {
    const makeGlass = () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#FAF9F5"),
        metalness: 0.04,
        roughness: 0.14,
        transparent: true,
        opacity: quality === "low" ? 0.24 : 0.34,
        iridescence: 0.32,
        iridescenceIOR: 1.3,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
      });

    const frame = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#C9BC9E"),
      metalness: 0.85,
      roughness: 0.24,
      clearcoat: 0.9,
    });

    const rail = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#C2BCB0"),
      metalness: 0.4,
      roughness: 0.45,
      transparent: true,
      opacity: 0.28,
    });

    return {
      glass1: makeGlass(),
      glass2: makeGlass(),
      frameMat: frame,
      railMat: rail,
    };
  }, [quality]);

  useEffect(() => {
    return () => {
      glass1.dispose();
      glass2.dispose();
      frameMat.dispose();
      railMat.dispose();
    };
  }, [glass1, glass2, frameMat, railMat]);

  useFrame((state, dt) => {
    const camZ = engine.state.cam[2];
    const g = groupRef.current;
    if (!g) return;

    const visible = camZ < 4 && camZ > -40;
    g.visible = visible;
    if (!visible) return;

    const t = state.clock.elapsedTime;
    const [z1, z2] = WORLD.slabs;
    const focus1 = smoothstep(8.0, 1.5, Math.abs(camZ - (z1 + WORLD.focusDist)));
    const focus2 = smoothstep(8.0, 1.5, Math.abs(camZ - (z2 + WORLD.focusDist)));

    const w = engine.portrait ? 1.55 : 2.35;
    const h = engine.portrait ? 1.95 : 1.48;

    if (slab1Ref.current) {
      const targetRotY = lerp(-0.24, 0.08, focus1) + engine.pointer.x * 0.07;
      const targetRotX = lerp(0.05, 0.0, focus1) - engine.pointer.y * 0.04;
      slab1Ref.current.rotation.y = damp(slab1Ref.current.rotation.y, targetRotY, 5, dt);
      slab1Ref.current.rotation.x = damp(slab1Ref.current.rotation.x, targetRotX, 5, dt);
      slab1Ref.current.position.y = -0.15 + Math.sin(t * 0.7) * 0.05;
      slab1Ref.current.scale.set(w, h, 1);
      glass1.roughness = lerp(0.24, 0.1, focus1);
      glass1.opacity = lerp(0.18, 0.36, focus1);
    }

    if (slab2Ref.current) {
      const targetRotY = lerp(0.24, -0.08, focus2) + engine.pointer.x * 0.07;
      const targetRotX = lerp(-0.05, 0.0, focus2) - engine.pointer.y * 0.04;
      slab2Ref.current.rotation.y = damp(slab2Ref.current.rotation.y, targetRotY, 5, dt);
      slab2Ref.current.rotation.x = damp(slab2Ref.current.rotation.x, targetRotX, 5, dt);
      slab2Ref.current.position.y = -0.15 + Math.sin(t * 0.7 + 1.8) * 0.05;
      slab2Ref.current.scale.set(w, h, 1);
      glass2.roughness = lerp(0.24, 0.1, focus2);
      glass2.opacity = lerp(0.18, 0.36, focus2);
    }
  });

  const [z1, z2] = WORLD.slabs;

  return (
    <group ref={groupRef}>
      {/* Тонкие архитектурные направляющие пола галереи */}
      {[-3.2, 3.2].map((x) => (
        <mesh key={x} position={[x, -1.6, -21]} material={railMat}>
          <boxGeometry args={[0.012, 0.012, 24]} />
        </mesh>
      ))}
      {[-12, -16, -21, -26, -31].map((z) => (
        <mesh key={z} position={[0, -1.6, z]} material={railMat}>
          <boxGeometry args={[6.4, 0.008, 0.01]} />
        </mesh>
      ))}

      {/* Панель 01 — МЭСИ (2013) */}
      <group ref={slab1Ref} position={[-0.75, -0.15, z1]}>
        <RoundedBox args={[1, 1, 0.05]} radius={0.04} smoothness={4} material={glass1} />
        <mesh position={[0, 0.506, 0]} material={frameMat}>
          <boxGeometry args={[0.88, 0.007, 0.055]} />
        </mesh>
        <mesh position={[0, -0.506, 0]} material={frameMat}>
          <boxGeometry args={[0.88, 0.007, 0.055]} />
        </mesh>
      </group>

      {/* Панель 02 — СГА (2013) */}
      <group ref={slab2Ref} position={[0.75, -0.15, z2]}>
        <RoundedBox args={[1, 1, 0.05]} radius={0.04} smoothness={4} material={glass2} />
        <mesh position={[0, 0.506, 0]} material={frameMat}>
          <boxGeometry args={[0.88, 0.007, 0.055]} />
        </mesh>
        <mesh position={[0, -0.506, 0]} material={frameMat}>
          <boxGeometry args={[0.88, 0.007, 0.055]} />
        </mesh>
      </group>
    </group>
  );
}
