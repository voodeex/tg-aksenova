"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { WORLD } from "@/components/three/world";
import { engine } from "@/lib/engine";
import { damp, lerp, smoothstep } from "@/utils/math";

type Props = {
  quality: "high" | "medium" | "low";
};

/**
 * Секция «Образование» в 3D-пространстве:
 * Минималистичная архитектурная световая галерея без тяжёлых серых прямоугольников за текстом.
 * Две изящные ювелирные композиции из тонких колец шампанского металла и парящих
 * гранёных стеклянных призм мягко вращаются и подсвечиваются при переходе от Панели 01 к Панели 02.
 */
export function EducationScene({ quality }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const totem1Ref = useRef<THREE.Group>(null);
  const totem2Ref = useRef<THREE.Group>(null);
  const crystal1Ref = useRef<THREE.Mesh>(null);
  const crystal2Ref = useRef<THREE.Mesh>(null);

  const { ringMat, accentMat, crystalMat, railMat } = useMemo(() => {
    const ring = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#C9BC9E"),
      metalness: 0.9,
      roughness: 0.18,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      iridescence: 0.3,
    });

    const accent = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#EFE7D6"),
      metalness: 0.65,
      roughness: 0.28,
      transparent: true,
      opacity: 0.55,
    });

    const crystal = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#FFFDF8"),
      metalness: 0.08,
      roughness: 0.08,
      transparent: true,
      opacity: quality === "low" ? 0.35 : 0.48,
      iridescence: 0.55,
      iridescenceIOR: 1.35,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
    });

    const rail = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#C7C0B3"),
      metalness: 0.35,
      roughness: 0.5,
      transparent: true,
      opacity: 0.24,
    });

    return {
      ringMat: ring,
      accentMat: accent,
      crystalMat: crystal,
      railMat: rail,
    };
  }, [quality]);

  useEffect(() => {
    return () => {
      ringMat.dispose();
      accentMat.dispose();
      crystalMat.dispose();
      railMat.dispose();
    };
  }, [ringMat, accentMat, crystalMat, railMat]);

  useFrame((state, dt) => {
    const camZ = engine.state.cam[2];
    const g = groupRef.current;
    if (!g) return;

    const visible = camZ < 4 && camZ > -40;
    g.visible = visible;
    if (!visible) return;

    const t = state.clock.elapsedTime;
    const [z1, z2] = WORLD.slabs;
    const focus1 = smoothstep(8.5, 1.5, Math.abs(camZ - (z1 + WORLD.focusDist)));
    const focus2 = smoothstep(8.5, 1.5, Math.abs(camZ - (z2 + WORLD.focusDist)));
    const baseScale = engine.portrait ? 0.58 : 0.92;

    if (totem1Ref.current) {
      totem1Ref.current.rotation.y = t * 0.24 + engine.pointer.x * 0.22;
      totem1Ref.current.rotation.x = damp(
        totem1Ref.current.rotation.x,
        -engine.pointer.y * 0.14 + Math.sin(t * 0.45) * 0.06,
        5,
        dt,
      );
      totem1Ref.current.position.y = -0.1 + Math.sin(t * 0.75) * 0.07;
      const s1 = baseScale * lerp(0.76, 1.06, focus1);
      totem1Ref.current.scale.setScalar(damp(totem1Ref.current.scale.x, s1, 6, dt));
    }

    if (totem2Ref.current) {
      totem2Ref.current.rotation.y = -t * 0.22 + engine.pointer.x * 0.22;
      totem2Ref.current.rotation.x = damp(
        totem2Ref.current.rotation.x,
        -engine.pointer.y * 0.14 + Math.cos(t * 0.45) * 0.06,
        5,
        dt,
      );
      totem2Ref.current.position.y = -0.1 + Math.sin(t * 0.75 + 1.9) * 0.07;
      const s2 = baseScale * lerp(0.76, 1.06, focus2);
      totem2Ref.current.scale.setScalar(damp(totem2Ref.current.scale.x, s2, 6, dt));
    }

    if (crystal1Ref.current) {
      crystal1Ref.current.rotation.y = -t * 0.4;
      crystal1Ref.current.rotation.z = t * 0.22;
    }
    if (crystal2Ref.current) {
      crystal2Ref.current.rotation.y = t * 0.38;
      crystal2Ref.current.rotation.x = t * 0.2;
    }
  });

  const [z1, z2] = WORLD.slabs;

  return (
    <group ref={groupRef}>
      {/* Перспективные направляющие пола архитектурной галереи */}
      {[-3.4, 3.4].map((x) => (
        <mesh key={x} position={[x, -1.85, -21]} material={railMat}>
          <boxGeometry args={[0.01, 0.01, 24]} />
        </mesh>
      ))}
      {[-12, -16, -21, -26, -31].map((z) => (
        <mesh key={z} position={[0, -1.85, z]} material={railMat}>
          <boxGeometry args={[6.8, 0.008, 0.01]} />
        </mesh>
      ))}

      {/* Станция 01 — архитектурная орбитальная призма (МЭСИ, 2013) */}
      <group ref={totem1Ref} position={[0, -0.1, z1]}>
        <mesh material={ringMat}>
          <torusGeometry args={[1.15, 0.012, 14, 96]} />
        </mesh>
        <mesh rotation={[Math.PI / 2.6, 0.4, 0]} material={accentMat}>
          <torusGeometry args={[0.88, 0.009, 12, 84]} />
        </mesh>
        <mesh rotation={[0.45, Math.PI / 3, 0]} material={ringMat}>
          <torusGeometry args={[1.42, 0.007, 10, 96]} />
        </mesh>
        <mesh ref={crystal1Ref} material={crystalMat}>
          <octahedronGeometry args={[0.46, 0]} />
        </mesh>
      </group>

      {/* Станция 02 — архитектурная орбитальная призма (СГА, 2013) */}
      <group ref={totem2Ref} position={[0, -0.1, z2]}>
        <mesh material={ringMat}>
          <torusGeometry args={[1.15, 0.012, 14, 96]} />
        </mesh>
        <mesh rotation={[-Math.PI / 2.8, 0.5, 0.3]} material={accentMat}>
          <torusGeometry args={[0.88, 0.009, 12, 84]} />
        </mesh>
        <mesh rotation={[0.3, -Math.PI / 3, 0.2]} material={ringMat}>
          <torusGeometry args={[1.42, 0.007, 10, 96]} />
        </mesh>
        <mesh ref={crystal2Ref} material={crystalMat}>
          <icosahedronGeometry args={[0.44, 0]} />
        </mesh>
      </group>
    </group>
  );
}
