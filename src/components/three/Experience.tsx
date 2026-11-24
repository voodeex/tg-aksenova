"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { AmbientParticles } from "@/components/three/AmbientParticles";
import { AwardSculpture } from "@/components/three/AwardSculpture";
import { EducationScene } from "@/components/three/EducationScene";
import { KnowledgeUniverse } from "@/components/three/KnowledgeUniverse";
import { Sculpture } from "@/components/three/Sculpture";
import { TimelineRibbon } from "@/components/three/TimelineRibbon";
import { WORLD } from "@/components/three/world";
import { topics } from "@/data/topics";
import { engine } from "@/lib/engine";
import { ui, useUI } from "@/lib/store";
import { damp } from "@/utils/math";

function SceneRig() {
  const { scene, camera } = useThree();
  const keyLightRef = useRef<THREE.DirectionalLight>(null);
  const rimLightRef = useRef<THREE.PointLight>(null);

  const bgColor = useMemo(() => new THREE.Color("#E9E9E7"), []);
  const lookTarget = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const fogInstance = useMemo(() => new THREE.Fog("#E9E9E7", 12, 42), []);

  useEffect(() => {
    scene.background = bgColor;
    scene.fog = fogInstance;
  }, [scene, bgColor, fogInstance]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const s = engine.state;

    // Фон и атмосферная дымка
    bgColor.setRGB(s.bg[0], s.bg[1], s.bg[2]);
    fogInstance.color.copy(bgColor);
    fogInstance.near = s.fog[0];
    fogInstance.far = s.fog[1];

    // Целевая точка камеры (с учётом выбранной сферы в «Созвездии дисциплин»)
    let tx = s.cam[0];
    let ty = s.cam[1];
    let tz = s.cam[2];
    let lx = s.look[0];
    let ly = s.look[1];
    let lz = s.look[2];

    const focusedId = ui.get().focusTopic;
    if (focusedId && ui.get().activeSection === "expertise") {
      const topic = topics.find((t) => t.id === focusedId);
      if (topic) {
        const [px, py, pz] = topic.position;
        // Мягкий кинематографичный фокус на выбранной сфере без обрезки созвездия
        tx = px * 0.25 + (engine.portrait ? 0 : 0.25);
        ty = py * 0.22;
        tz = WORLD.universeZ + (engine.portrait ? 16.5 : 11.8) + pz * 0.35;
        lx = -1.6 + px * 0.32 + (engine.portrait ? 1.6 : 1.75);
        ly = -0.25 + py * 0.26;
        lz = WORLD.universeZ + pz * 0.35;
      }
    }

    // Тонкий параллакс от указателя мыши
    const parallax = engine.reduced ? 0 : 0.24;
    tx += engine.pointer.x * parallax;
    ty += engine.pointer.y * parallax * 0.65;

    if (engine.snap) {
      camera.position.set(tx, ty, tz);
      lookTarget.set(lx, ly, lz);
      engine.snap = false;
    } else {
      const speed = 9.5;
      camera.position.set(
        damp(camera.position.x, tx, speed, dt),
        damp(camera.position.y, ty, speed, dt),
        damp(camera.position.z, tz, speed, dt),
      );
      lookTarget.set(
        damp(lookTarget.x, lx, speed, dt),
        damp(lookTarget.y, ly, speed, dt),
        damp(lookTarget.z, lz, speed, dt),
      );
    }

    camera.lookAt(lookTarget);

    // Следящий рисующий и контровой свет вдоль маршрута камеры
    if (keyLightRef.current) {
      keyLightRef.current.position.set(camera.position.x + 4.5, camera.position.y + 5.5, camera.position.z + 3.5);
      keyLightRef.current.intensity = 2.1 * s.env;
    }
    if (rimLightRef.current) {
      rimLightRef.current.position.set(camera.position.x - 3.5, camera.position.y - 2.0, camera.position.z - 2.5);
      rimLightRef.current.intensity = 7.5 * s.glow;
    }
  });

  return (
    <>
      <ambientLight intensity={0.65} color="#F5F2EB" />
      <directionalLight ref={keyLightRef} position={[4, 6, 10]} intensity={2.1} color="#FFFBF2" />
      <pointLight ref={rimLightRef} position={[-3.5, -2, 5]} intensity={7.5} distance={26} color="#E2C792" />

      {/* Процедурное студийное HDR-окружение без внешних сетевых запросов */}
      <Environment resolution={256}>
        <group rotation={[-Math.PI / 4, -0.3, 0]}>
          <Lightformer
            form="rect"
            intensity={3.4}
            color="#FFFDF8"
            scale={[10, 4, 1]}
            position={[0, 5, -6]}
            rotation={[Math.PI / 2.5, 0, 0]}
          />
          <Lightformer
            form="ring"
            intensity={2.2}
            color="#E5CFA3"
            scale={6}
            position={[5, 2, 4]}
            target={[0, 0, 0]}
          />
          <Lightformer
            form="rect"
            intensity={1.8}
            color="#D9D7D0"
            scale={[12, 3, 1]}
            position={[-6, -3, 2]}
            rotation={[0, Math.PI / 2, 0]}
          />
          <Lightformer
            form="circle"
            intensity={2.5}
            color="#FFF4DA"
            scale={4}
            position={[0, -5, -4]}
            rotation={[-Math.PI / 2, 0, 0]}
          />
        </group>
      </Environment>
    </>
  );
}

export function Experience() {
  const webgl = useUI("webgl");
  const quality = useUI("quality");
  const [tabHidden, setTabHidden] = useState(false);

  useEffect(() => {
    const onVis = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  if (webgl === false) return null;

  const dpr: [number, number] =
    quality === "high" ? [1, 1.85] : quality === "medium" ? [1, 1.4] : [1, 1.15];

  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      <Canvas
        frameloop={tabHidden ? "never" : "always"}
        dpr={dpr}
        camera={{ position: [0, 0, 8], fov: WORLD.fov, near: 0.1, far: 70 }}
        gl={{
          antialias: quality !== "low",
          alpha: false,
          powerPreference: "high-performance",
          stencil: false,
        }}
      >
        <Suspense fallback={null}>
          <SceneRig />
          <Sculpture quality={quality} />
          <EducationScene quality={quality} />
          <TimelineRibbon />
          <KnowledgeUniverse />
          <AwardSculpture />
          <AmbientParticles quality={quality} />
        </Suspense>
      </Canvas>
    </div>
  );
}
