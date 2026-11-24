"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { engine } from "@/lib/engine";
import { dustFragmentShader, dustVertexShader } from "@/shaders/sculpture";
import { seeded } from "@/utils/math";

type Props = {
  quality: "high" | "medium" | "low";
};

/**
 * Тонкая атмосферная взвесь микрочастиц вдоль всего маршрута камеры (z = +10..−190).
 */
export function AmbientParticles({ quality }: Props) {
  const pointsRef = useRef<THREE.Points>(null);
  const { gl } = useThree();

  const count = quality === "high" ? 650 : quality === "medium" ? 360 : 180;

  const { geometry, material } = useMemo(() => {
    const rand = seeded(77);
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const phases = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (rand() - 0.5) * 18;
      positions[i * 3 + 1] = (rand() - 0.5) * 10;
      positions[i * 3 + 2] = 8 - rand() * 196;
      scales[i] = 0.5 + rand() * 1.4;
      phases[i] = rand() * Math.PI * 2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: dustVertexShader,
      fragmentShader: dustFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
        uSize: { value: 36.0 },
        uColor: { value: new THREE.Color("#DEC99E") },
        uOpacity: { value: 0.55 },
      },
    });

    return { geometry: geo, material: mat };
  }, [count, gl]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uOpacity.value = engine.state.dust;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} frustumCulled={false} />;
}
