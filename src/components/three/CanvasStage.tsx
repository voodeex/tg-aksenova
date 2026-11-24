"use client";

import dynamic from "next/dynamic";

const Experience = dynamic(
  () => import("@/components/three/Experience").then((m) => m.Experience),
  { ssr: false },
);

export function CanvasStage() {
  return <Experience />;
}
