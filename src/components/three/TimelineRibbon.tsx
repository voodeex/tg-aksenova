"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { WORLD, ribbonX, ribbonY, yearMarkerZ } from "@/components/three/world";
import { groupByYear, programs } from "@/data/development";
import { engine } from "@/lib/engine";
import { damp, lerp } from "@/utils/math";

const ALL_YEAR_GROUPS = groupByYear(programs);

/**
 * Пространственная 3D-лента времени (2007–2026), парящая вдоль нижней оси коридора z = −36..−100.
 * Чистая архитектурная линия без тёмных вертикальных штырей, чтобы цифры лет оставались безупречно чистыми.
 */
export function TimelineRibbon() {
  const groupRef = useRef<THREE.Group>(null);
  const beaconRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const nodeRefs = useRef<(THREE.Mesh | null)[]>([]);

  const { ribbonGeo, railGeo, ribbonMat, railMat, nodeMat, activeMat } = useMemo(() => {
    const z0 = WORLD.ribbon.z0;
    const len = WORLD.ribbon.length;
    const steps = 120;
    const ptsSide: THREE.Vector3[] = [];
    const ptsCenter: THREE.Vector3[] = [];

    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const z = z0 - u * len;
      const x = ribbonX(z);
      const y = ribbonY(z);
      ptsCenter.push(new THREE.Vector3(x, y, z));
      ptsSide.push(new THREE.Vector3(x + 0.36, y - 0.04, z));
    }

    const centerCurve = new THREE.CatmullRomCurve3(ptsCenter);
    const sideCurve = new THREE.CatmullRomCurve3(ptsSide);

    const rGeo = new THREE.TubeGeometry(centerCurve, 130, 0.042, 10, false);
    const sGeo = new THREE.TubeGeometry(sideCurve, 130, 0.012, 6, false);

    const rMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#C9BC9E"),
      metalness: 0.8,
      roughness: 0.24,
      clearcoat: 1,
      iridescence: 0.25,
    });

    const sMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#ACA495"),
      metalness: 0.55,
      roughness: 0.38,
    });

    const nMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#9B9180"),
      metalness: 0.78,
      roughness: 0.24,
      clearcoat: 0.9,
    });

    const aMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#FFF4D4"),
      emissive: new THREE.Color("#DFC38C"),
      emissiveIntensity: 1.9,
      roughness: 0.16,
    });

    return {
      ribbonGeo: rGeo,
      railGeo: sGeo,
      ribbonMat: rMat,
      railMat: sMat,
      nodeMat: nMat,
      activeMat: aMat,
    };
  }, []);

  useEffect(() => {
    return () => {
      ribbonGeo.dispose();
      railGeo.dispose();
      ribbonMat.dispose();
      railMat.dispose();
      nodeMat.dispose();
      activeMat.dispose();
    };
  }, [ribbonGeo, railGeo, ribbonMat, railMat, nodeMat, activeMat]);

  useFrame((state, dt) => {
    const camZ = engine.state.cam[2];
    const g = groupRef.current;
    if (!g) return;

    const visible = camZ < -24 && camZ > -114;
    g.visible = visible;
    if (!visible) return;

    const t = state.clock.elapsedTime;
    const count = Math.max(engine.timeline.count, 1);
    const activeIdx = engine.timeline.index;
    const targetZ = yearMarkerZ(activeIdx, count);
    const tx = ribbonX(targetZ);
    const ty = ribbonY(targetZ);

    if (beaconRef.current) {
      beaconRef.current.position.set(
        damp(beaconRef.current.position.x, tx, 8, dt),
        damp(beaconRef.current.position.y, ty, 8, dt),
        damp(beaconRef.current.position.z, targetZ, 8, dt),
      );
      beaconRef.current.scale.setScalar(1 + Math.sin(t * 2.8) * 0.1);
    }

    if (ringRef.current && beaconRef.current) {
      ringRef.current.position.copy(beaconRef.current.position);
      ringRef.current.rotation.z = t * 0.65;
      ringRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.06);
    }

    for (let i = 0; i < ALL_YEAR_GROUPS.length; i++) {
      const m = nodeRefs.current[i];
      if (!m) continue;
      const dist = Math.abs(i - activeIdx);
      const sc = lerp(1.35, 0.8, Math.min(dist, 3) / 3);
      m.scale.setScalar(damp(m.scale.x, sc, 7, dt));
    }
  });

  const total = ALL_YEAR_GROUPS.length;

  return (
    <group ref={groupRef}>
      <mesh geometry={ribbonGeo} material={ribbonMat} />
      <mesh geometry={railGeo} material={railMat} />

      {/* Сферические узлы лет вдоль ленты (без пересекающих текст штырей) */}
      {ALL_YEAR_GROUPS.map((yg, i) => {
        const z = yearMarkerZ(i, total);
        const x = ribbonX(z);
        const y = ribbonY(z);
        return (
          <mesh
            key={yg.year}
            position={[x, y, z]}
            ref={(el) => {
              nodeRefs.current[i] = el;
            }}
            material={nodeMat}
          >
            <sphereGeometry args={[0.11, 16, 16]} />
          </mesh>
        );
      })}

      {/* Светящийся маяк текущего выбранного года */}
      <mesh ref={beaconRef} material={activeMat} position={[0, WORLD.ribbon.y, WORLD.ribbon.z0]}>
        <sphereGeometry args={[0.16, 18, 18]} />
      </mesh>
      <mesh ref={ringRef} material={ribbonMat} position={[0, WORLD.ribbon.y, WORLD.ribbon.z0]}>
        <torusGeometry args={[0.34, 0.012, 12, 44]} />
      </mesh>
    </group>
  );
}
