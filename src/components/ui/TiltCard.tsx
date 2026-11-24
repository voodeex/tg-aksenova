"use client";

import { useRef } from "react";
import { useUI } from "@/lib/store";

type Props = {
  children: React.ReactNode;
  className?: string;
  cursorLabel?: "OPEN" | "EXPLORE";
  intensity?: number;
};

/**
 * Жидкостеклянная карточка с перспективным 3D-наклоном и динамическим световым бликом.
 */
export function TiltCard({
  children,
  className = "",
  cursorLabel,
  intensity = 6,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const reduced = useUI("reducedMotion");
  const touch = useUI("touch");

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced || touch || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rx = (0.5 - py) * intensity;
    const ry = (px - 0.5) * intensity;
    cardRef.current.style.transform = `perspective(1100px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateZ(0)`;
    if (glowRef.current) {
      glowRef.current.style.background = `radial-gradient(420px circle at ${(px * 100).toFixed(1)}% ${(py * 100).toFixed(1)}%, rgba(255,250,235,0.22), transparent 65%)`;
    }
  };

  const onLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = "perspective(1100px) rotateX(0deg) rotateY(0deg) translateZ(0)";
    if (glowRef.current) {
      glowRef.current.style.background = "transparent";
    }
  };

  return (
    <div
      ref={cardRef}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      data-cursor={cursorLabel}
      className={`liquid-glass-surface relative overflow-hidden transition-transform duration-300 ease-out ${className}`}
    >
      <div
        ref={glowRef}
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        aria-hidden="true"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
