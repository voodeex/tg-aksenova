"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { award } from "@/data/award";
import { useUI } from "@/lib/store";
import { SplitReveal } from "@/components/ui/SplitReveal";

gsap.registerPlugin(ScrollTrigger);

/**
 * Секция «Признание и достижения» (Секция 12):
 * Тёмная кинематографичная сцена с вращающейся абстрактной металлической скульптурой
 * в тёплом шампанском свете (z = −152) и световой анимацией раскрытия типографики.
 */
export function AwardsSection() {
  const cardRef = useRef<HTMLDivElement>(null);
  const sweepRef = useRef<HTMLDivElement>(null);
  const reduced = useUI("reducedMotion");

  useEffect(() => {
    const card = cardRef.current;
    const sweep = sweepRef.current;
    if (!card || !sweep || reduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        sweep,
        { xPercent: -120, opacity: 0 },
        {
          xPercent: 140,
          opacity: 1,
          duration: 1.9,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: card,
            start: "top 75%",
            toggleActions: "play none none none",
          },
        },
      );
    }, card);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      id="awards"
      aria-labelledby="awards-heading"
      className="relative z-10 flex min-h-screen w-full items-center px-4 py-20 sm:px-6 md:px-12 md:py-36 lg:min-h-[125vh]"
    >
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] pb-3.5 font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--fg-mute)] sm:mb-12 sm:text-[11px] sm:tracking-[0.22em]">
          <span>[ 05 / 06 ] · RECOGNITION &amp; AWARDS</span>
          <span>ФИНАНСОВЫЙ УНИВЕРСИТЕТ</span>
        </div>

        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-12">
          {/* Левая колонка — заголовок и витринное окно для золотого 3D-трофея на мобильных */}
          <div className="lg:col-span-6">
            <SplitReveal
              as="h2"
              lines={["ПРИЗНАНИЕ", "И ДОСТИЖЕНИЯ"]}
              className="text-halo font-sans text-[clamp(1.95rem,6.8vw,4.8rem)] leading-[0.95] font-semibold tracking-[-0.035em] uppercase text-[var(--fg)]"
            />
            <p className="mt-3 whitespace-nowrap font-mono text-[11px] font-medium tracking-[0.14em] uppercase text-[#E2CDA0] sm:mt-4 sm:text-xs sm:tracking-[0.22em]">
              [ ОФИЦИАЛЬНАЯ БЛАГОДАРНОСТЬ · {award.year} ]
            </p>
            {/* Открытое окно для 3D-трофея на iPhone, чтобы скульптура была видна целиком над карточкой */}
            <div aria-hidden="true" className="h-[190px] w-full sm:h-[220px] lg:hidden" />
          </div>

          {/* Правая колонка — карточка награды со световым лучом */}
          <div className="lg:col-span-6">
            <div
              ref={cardRef}
              className="liquid-glass-surface relative overflow-hidden rounded-[2.2rem] p-8 md:p-12"
            >
              {/* Световой луч, открывающий типографику */}
              <div
                ref={sweepRef}
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 w-2/3 -skew-x-12 bg-gradient-to-r from-transparent via-[#F3DDA8]/25 to-transparent opacity-0 blur-xl"
              />

              <div className="flex items-center justify-between border-b border-[var(--line)] pb-5">
                <span className="font-mono text-xs tracking-[0.24em] uppercase text-[#C5B89A]">
                  НАГРАДА
                </span>
                <span className="rounded-full border border-[#C5B89A]/60 bg-[#C5B89A]/15 px-4 py-1 font-mono text-sm font-semibold tracking-[0.18em] text-[var(--fg)]">
                  {award.year}
                </span>
              </div>

              <h3 className="mt-8 font-sans text-[clamp(1.65rem,3vw,2.65rem)] leading-[1.08] font-semibold tracking-[-0.025em] uppercase text-[var(--fg)]">
                {award.titleLines.map((line, i) => (
                  <span key={i} className="block">
                    {line}
                  </span>
                ))}
              </h3>

              <p className="mt-6 border-t border-[var(--line)] pt-6 text-base leading-relaxed text-[var(--fg-mute)] md:text-lg">
                {award.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
