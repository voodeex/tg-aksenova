"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cursorStore, useUI } from "@/lib/store";
import { damp } from "@/utils/math";

/**
 * Контекстный кастомный курсор для десктопа.
 * Показывает точку и смещённый бейдж DRAG / EXPLORE / OPEN,
 * и автоматически растворяется при бездействии указателя, чтобы никогда не перекрывать чтение.
 */
export function CustomCursor() {
  const touch = useUI("touch");
  const reduced = useUI("reducedMotion");
  const cursor = useSyncExternalStore(cursorStore.subscribe, cursorStore.get, cursorStore.get);
  const [visible, setVisible] = useState(false);

  const dotRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (touch || reduced) return;

    const pos = { x: -100, y: -100, tx: -100, ty: -100 };
    let raf = 0;
    let lastTime = performance.now();
    let idleTimer = 0;

    const onMove = (e: PointerEvent) => {
      pos.tx = e.clientX;
      pos.ty = e.clientY;
      setVisible(true);
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => setVisible(false), 1600);

      const target = (e.target as HTMLElement | null)?.closest?.("[data-cursor]") as HTMLElement | null;
      if (target) {
        const label = target.getAttribute("data-cursor") || null;
        cursorStore.set({ label, active: true, source: "dom" });
      } else if (cursorStore.get().source === "dom") {
        cursorStore.set({ label: null, active: false, source: null });
      }
    };

    const onLeave = () => setVisible(false);

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      pos.x = damp(pos.x, pos.tx, 18, dt);
      pos.y = damp(pos.y, pos.ty, 18, dt);

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pos.tx}px, ${pos.ty}px, 0) translate(-50%, -50%)`;
      }
      if (pillRef.current) {
        const hasLbl = Boolean(cursorStore.get().label);
        const offset = hasLbl ? "translate(18px, 18px)" : "translate(-50%, -50%)";
        pillRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) ${offset}`;
      }
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(loop);

    return () => {
      window.clearTimeout(idleTimer);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [touch, reduced]);

  if (touch || reduced) return null;

  const hasLabel = Boolean(cursor.label);

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[90] hidden transition-opacity duration-300 md:block ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden="true"
    >
      <div
        ref={dotRef}
        className="fixed top-0 left-0 h-2 w-2 rounded-full bg-[#C5B89A] shadow-[0_0_8px_rgba(197,184,154,0.8)]"
      />
      <div
        ref={pillRef}
        className={`fixed top-0 left-0 flex items-center justify-center rounded-full border transition-[width,height,padding,background-color,border-color,opacity] duration-200 ${
          hasLabel
            ? "h-6 px-2.5 border-[#C5B89A]/70 bg-[#171717]/90 text-[#F5F2EB] shadow-[0_6px_18px_rgba(0,0,0,0.28)] backdrop-blur-md"
            : cursor.active
              ? "h-9 w-9 border-[#C5B89A]/60 bg-[#C5B89A]/15"
              : "h-7 w-7 border-current/25 bg-transparent"
        }`}
      >
        {hasLabel && (
          <span className="font-mono text-[9px] font-medium tracking-[0.2em] uppercase">
            {cursor.label}
          </span>
        )}
      </div>
    </div>
  );
}
