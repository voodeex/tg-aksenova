"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useUI } from "@/lib/store";

/**
 * Секция учёной степени (Секция 13):
 * Выделенный визуальный и типографический акцент:
 * КАНДИДАТ / ПЕДАГОГИЧЕСКИХ / НАУК на переходе от глубокого графита к жемчужному свету финала.
 */
export function DegreeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const playedRef = useRef(false);
  const reduced = useUI("reducedMotion");

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const lines = el.querySelectorAll<HTMLElement>("[data-degree-line]");
    if (!lines.length) return;

    if (reduced || playedRef.current) {
      gsap.set(lines, { yPercent: 0, opacity: 1 });
      return;
    }

    const reveal = () => {
      if (playedRef.current) return;
      playedRef.current = true;
      gsap.to(lines, {
        yPercent: 0,
        opacity: 1,
        duration: 0.9,
        stagger: 0.1,
        ease: "power3.out",
        overwrite: true,
      });
    };

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 1.05) {
      reveal();
      return;
    }

    gsap.set(lines, { yPercent: 36, opacity: 0 });

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight) {
            reveal();
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.05, rootMargin: "80px 0px 80px 0px" },
    );

    io.observe(el);

    return () => {
      io.disconnect();
    };
  }, [reduced]);

  return (
    <section
      id="degree"
      ref={sectionRef}
      aria-label="Учёная степень: Кандидат педагогических наук"
      className="relative z-10 flex min-h-[110vh] w-full items-center justify-center px-5 py-28 md:px-12"
    >
      <div className="mx-auto w-full max-w-[1440px] text-center">
        <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-[var(--line)] px-4 py-1.5 font-mono text-[11px] font-medium tracking-[0.2em] uppercase text-[var(--fg-mute)] sm:tracking-[0.26em]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#C5B89A]" />
          <span>ACADEMIC DEGREE // УЧЁНАЯ СТЕПЕНЬ</span>
        </div>

        <h2 className="font-sans text-[clamp(1.65rem,7.2vw,8.2rem)] leading-[0.98] font-semibold tracking-[-0.035em] uppercase text-[var(--fg)]">
          <span data-degree-line className="block py-1">
            КАНДИДАТ
          </span>
          <span
            data-degree-line
            className="block py-1 text-[#DEC899] drop-shadow-[0_10px_35px_rgba(222,200,153,0.24)]"
          >
            ПЕДАГОГИЧЕСКИХ
          </span>
          <span data-degree-line className="block py-1">
            НАУК
          </span>
        </h2>

        <div className="mx-auto mt-10 h-px w-40 bg-gradient-to-r from-transparent via-[#C5B89A] to-transparent" />
      </div>
    </section>
  );
}
