"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { engine, measure, tick } from "@/lib/engine";
import { ui } from "@/lib/store";

gsap.registerPlugin(ScrollTrigger);

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    return Boolean(gl);
  } catch {
    return false;
  }
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touch = window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
    const webgl = detectWebGL();
    const cores = navigator.hardwareConcurrency ?? 4;
    const small = window.innerWidth < 768;

    const quality: "high" | "medium" | "low" =
      small || cores <= 4 ? (small && cores <= 4 ? "low" : "medium") : "high";

    engine.reduced = reduced;
    if (reduced) {
      engine.intro = 1;
    }

    ui.set({
      reducedMotion: reduced,
      touch,
      webgl,
      quality,
      ...(reduced ? { introDone: true } : {}),
    });

    let lenis: Lenis | null = null;
    if (!reduced) {
      lenis = new Lenis({
        lerp: 0.095,
        smoothWheel: true,
        wheelMultiplier: 0.95,
        touchMultiplier: 1.15,
      });
      engine.lenis = lenis;
      lenis.on("scroll", ScrollTrigger.update);
    }

    const onTicker = (time: number) => {
      lenis?.raf(time * 1000);
      tick();
    };
    gsap.ticker.add(onTicker);
    gsap.ticker.lagSmoothing(0);

    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // На iPhone (iOS Safari) скрытие/показ адресной строки меняет только innerHeight на ~70–110px.
      // Игнорируем такие микро-ресайзы на тач-устройствах, чтобы камера и скролл не дёргались.
      if (touch && Math.abs(w - lastWidth) < 2 && Math.abs(h - lastHeight) < 160) {
        return;
      }
      lastWidth = w;
      lastHeight = h;
      measure();
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);

    const onPointerMove = (e: PointerEvent) => {
      engine.pointer.x = (e.clientX / Math.max(window.innerWidth, 1) - 0.5) * 2;
      engine.pointer.y = -(e.clientY / Math.max(window.innerHeight, 1) - 0.5) * 2;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    measure();
    const ro = new ResizeObserver(() => {
      measure();
      ScrollTrigger.refresh();
    });
    const main = document.querySelector("main");
    if (main) ro.observe(main);

    const t1 = window.setTimeout(onResize, 250);
    const t2 = window.setTimeout(onResize, 900);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      ro.disconnect();
      gsap.ticker.remove(onTicker);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      lenis?.destroy();
      engine.lenis = null;
    };
  }, []);

  return <>{children}</>;
}
