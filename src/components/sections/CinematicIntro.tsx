"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { engine, tick } from "@/lib/engine";
import { ui, useUI } from "@/lib/store";

const SESSION_KEY = "tg_aksenova_intro_seen_v1";

/**
 * Кинематографичное вступление (Секция 5):
 * Почти чёрный графитовый экран, в центре — вращающийся металлический объект в WebGL.
 * Появляются титры TATIANA AKSENOVA → DIGITAL EDUCATION / 2026,
 * объект освещается и приближается к зрителю, световой луч открывает главный экран.
 */
export function CinematicIntro() {
  const reduced = useUI("reducedMotion");
  const introDone = useUI("introDone");
  const [hidden, setHidden] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const sweepRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const finishIntro = () => {
    tlRef.current?.kill();
    engine.intro = 1;
    tick();
    ui.set({ introDone: true });
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // игнорируем ограничения хранилища
    }
    window.setTimeout(() => setHidden(true), 650);
  };

  useEffect(() => {
    if (reduced) {
      engine.intro = 1;
      tick();
      ui.set({ introDone: true });
      setHidden(true);
      return;
    }

    let alreadySeen = false;
    try {
      alreadySeen = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      alreadySeen = false;
    }

    if (alreadySeen) {
      const quickState = { p: 0.45 };
      engine.intro = quickState.p;
      tick();
      const tween = gsap.to(quickState, {
        p: 1,
        duration: 0.9,
        ease: "power3.out",
        onUpdate: () => {
          engine.intro = quickState.p;
          tick();
        },
        onComplete: finishIntro,
      });
      return () => {
        tween.kill();
      };
    }

    const proxy = { p: 0 };
    engine.intro = 0;
    tick();

    const tl = gsap.timeline({
      onComplete: finishIntro,
    });
    tlRef.current = tl;

    tl.to(
      proxy,
      {
        p: 1,
        duration: 3.4,
        ease: "power2.inOut",
        onUpdate: () => {
          engine.intro = proxy.p;
          tick();
        },
      },
      0,
    );

    if (lineRef.current) {
      tl.fromTo(
        lineRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 1.4, ease: "power3.inOut" },
        0.15,
      );
    }

    if (nameRef.current) {
      tl.fromTo(
        nameRef.current,
        { opacity: 0, y: 14, filter: "blur(6px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.9, ease: "power3.out" },
        0.25,
      );
    }

    if (metaRef.current) {
      tl.fromTo(
        metaRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.85, ease: "power3.out" },
        0.85,
      );
    }

    if (sweepRef.current) {
      tl.fromTo(
        sweepRef.current,
        { xPercent: -120, opacity: 0 },
        { xPercent: 120, opacity: 1, duration: 1.25, ease: "power2.inOut" },
        1.95,
      );
    }

    if (nameRef.current && metaRef.current && lineRef.current) {
      tl.to(
        [nameRef.current, metaRef.current, lineRef.current],
        { opacity: 0, y: -12, duration: 0.65, ease: "power2.in" },
        2.35,
      );
    }

    return () => {
      tl.kill();
    };
  }, [reduced]);

  if (hidden) return null;

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-label="Вступительная заставка"
      className={`fixed inset-0 z-[80] flex flex-col justify-between p-6 md:p-12 transition-opacity duration-700 ${
        introDone ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      {/* Световой луч при раскрытии сцены */}
      <div
        ref={sweepRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-y-0 left-0 w-[55vw] -skew-x-12 bg-gradient-to-r from-transparent via-[#F5E6C4]/25 to-transparent opacity-0 blur-2xl"
      />

      {/* Верхняя строка */}
      <div className="relative z-10 flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-[0.26em] uppercase text-[#E9E9E7]/55">
          [ EXHIBITION // 00 ]
        </span>
        <button
          type="button"
          onClick={finishIntro}
          data-cursor="OPEN"
          className="rounded-full border border-white/20 bg-white/5 px-4 py-1.5 font-mono text-[11px] tracking-[0.18em] uppercase text-[#F4F1EA] backdrop-blur-md transition-colors hover:border-[#C5B89A] hover:bg-[#C5B89A]/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C5B89A]"
        >
          Пропустить ↗
        </button>
      </div>

      {/* Центральный типографический фокус поверх 3D-скульптуры */}
      <div className="pointer-events-none relative z-10 my-auto flex flex-col items-center text-center">
        <div
          ref={nameRef}
          className="font-mono text-xs tracking-[0.42em] uppercase text-[#F5F2EB] opacity-0 md:text-sm"
        >
          TATIANA AKSENOVA
        </div>
        <div
          ref={lineRef}
          className="my-4 h-px w-36 origin-center bg-gradient-to-r from-transparent via-[#C5B89A] to-transparent"
        />
        <div
          ref={metaRef}
          className="font-mono text-[11px] tracking-[0.34em] uppercase text-[#C5B89A] opacity-0"
        >
          DIGITAL EDUCATION / 2026
        </div>
      </div>

      {/* Нижняя техническая подпись */}
      <div className="relative z-10 flex items-center justify-between font-mono text-[10px] tracking-[0.22em] uppercase text-[#E9E9E7]/45">
        <span>МОСКВА · ФИНУНИВЕРСИТЕТ</span>
        <span>ИНТЕРАКТИВНОЕ ПОРТФОЛИО</span>
      </div>
    </div>
  );
}
