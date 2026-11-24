"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { profile } from "@/data/profile";
import { useUI } from "@/lib/store";
import { SplitReveal } from "@/components/ui/SplitReveal";
import { TiltCard } from "@/components/ui/TiltCard";

gsap.registerPlugin(ScrollTrigger);

/**
 * Секция «О преподавателе» (Секция 8):
 * Редакционная швейцарская вёрстка, построчное раскрытие текста при прокрутке,
 * абстрактная параметрическая визуальная композиция (без вымышленного портрета)
 * и кинетическая типографика EDUCATION / TECHNOLOGY / INNOVATION.
 */
export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const kineticRef = useRef<HTMLDivElement>(null);
  const reduced = useUI("reducedMotion");

  useEffect(() => {
    const el = sectionRef.current;
    const kinetic = kineticRef.current;
    if (!el || !kinetic || reduced) return;

    const rows = kinetic.querySelectorAll<HTMLElement>("[data-kinetic-row]");
    const ctx = gsap.context(() => {
      rows.forEach((row, i) => {
        const dir = i % 2 === 0 ? -1 : 1;
        gsap.fromTo(
          row,
          { xPercent: dir * 2.2 },
          {
            xPercent: dir * -2.2,
            ease: "none",
            scrollTrigger: {
              trigger: kinetic,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.1,
            },
          },
        );
      });
    }, el);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      id="about"
      ref={sectionRef}
      aria-labelledby="about-heading"
      className="relative z-10 w-full px-5 py-20 md:px-12 md:py-36"
    >
      <div className="mx-auto max-w-[1440px]">
        {/* Верхний индекс секции */}
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] pb-4 font-mono text-[11px] tracking-[0.22em] uppercase text-[var(--fg-mute)]">
          <span>[ 02 / 06 ] · ACADEMIC PROFILE</span>
          <span>EDITORIAL OVERVIEW</span>
        </div>

        {/* Крупный заголовок секции */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7">
            <SplitReveal
              as="h2"
              lines={["ЧЕЛОВЕК.", "ЗНАНИЯ.", "ТЕХНОЛОГИИ."]}
              className="text-halo font-sans text-[clamp(2.4rem,5.8vw,5.4rem)] leading-[0.95] font-semibold tracking-[-0.035em] uppercase text-[var(--fg)]"
            />

            {/* Построчное редакционное раскрытие верифицированной информации */}
            <div className="liquid-glass-surface mt-10 max-w-2xl space-y-5 rounded-[2rem] p-7 md:p-9">
              <SplitReveal
                as="p"
                lines={[profile.fullName]}
                className="font-sans text-2xl font-semibold tracking-tight text-[var(--fg)] md:text-3xl"
              />

              <p className="text-lg font-medium leading-relaxed text-[var(--fg)] md:text-xl">
                {profile.title} Колледжа информатики и программирования Финансового университета при Правительстве Российской Федерации.
              </p>

              <p className="font-mono text-sm font-semibold tracking-[0.16em] uppercase text-[#5A5143]">
                {profile.degree}.
              </p>

              <p className="border-t border-[var(--line)] pt-5 text-base leading-relaxed text-[var(--fg-mute)]">
                Профессиональная траектория объединяет фундаментальную педагогическую подготовку,
                прикладную информатику, экономическое образование и непрерывное освоение современных
                цифровых инструментов образовательной среды.
              </p>
            </div>
          </div>

          {/* Правая колонка — абстрактная параметрическая визуальная композиция */}
          <div className="lg:col-span-5">
            <TiltCard className="rounded-[2rem] p-7 md:p-9" cursorLabel="EXPLORE">
              <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--fg-mute)]">
                <span>[ АРХИТЕКТУРА ПРОФИЛЯ ]</span>
                <span>FINU · КИП</span>
              </div>

              {/* Абстрактная геометрическая скульптурная схема */}
              <div className="my-7 flex items-center justify-center py-4">
                <svg
                  viewBox="0 0 320 260"
                  className="h-56 w-full max-w-[300px]"
                  aria-hidden="true"
                >
                  <defs>
                    <radialGradient id="champagne-core" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#E6CFA0" stopOpacity="0.65" />
                      <stop offset="65%" stopColor="#C5B89A" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#C5B89A" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <circle cx="160" cy="130" r="106" fill="url(#champagne-core)" />
                  <circle
                    cx="160"
                    cy="130"
                    r="96"
                    fill="none"
                    stroke="currentColor"
                    strokeOpacity="0.18"
                    strokeWidth="1"
                  />
                  <ellipse
                    cx="160"
                    cy="130"
                    rx="96"
                    ry="42"
                    fill="none"
                    stroke="#C5B89A"
                    strokeOpacity="0.7"
                    strokeWidth="1.2"
                    transform="rotate(-24 160 130)"
                  />
                  <ellipse
                    cx="160"
                    cy="130"
                    rx="96"
                    ry="42"
                    fill="none"
                    stroke="currentColor"
                    strokeOpacity="0.32"
                    strokeWidth="1"
                    transform="rotate(36 160 130)"
                  />
                  <ellipse
                    cx="160"
                    cy="130"
                    rx="72"
                    ry="24"
                    fill="none"
                    stroke="#C5B89A"
                    strokeOpacity="0.55"
                    strokeWidth="1"
                    transform="rotate(78 160 130)"
                  />
                  <line
                    x1="36"
                    y1="130"
                    x2="284"
                    y2="130"
                    stroke="currentColor"
                    strokeOpacity="0.18"
                    strokeDasharray="3 4"
                  />
                  <line
                    x1="160"
                    y1="18"
                    x2="160"
                    y2="242"
                    stroke="currentColor"
                    strokeOpacity="0.18"
                    strokeDasharray="3 4"
                  />
                  <circle cx="160" cy="130" r="6" fill="#C5B89A" />
                  <circle cx="96" cy="96" r="3.5" fill="currentColor" fillOpacity="0.6" />
                  <circle cx="222" cy="158" r="3.5" fill="currentColor" fillOpacity="0.6" />
                  <circle cx="182" cy="68" r="3" fill="#C5B89A" />
                </svg>
              </div>

              <dl className="grid grid-cols-1 gap-4 border-t border-[var(--line)] pt-5 text-xs">
                <div className="flex flex-col gap-1">
                  <dt className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--fg-mute)]">
                    УЧЁНАЯ СТЕПЕНЬ
                  </dt>
                  <dd className="font-medium text-sm text-[var(--fg)]">{profile.degree}</dd>
                </div>
                <div className="flex flex-col gap-1 border-t border-[var(--line)] pt-3">
                  <dt className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--fg-mute)]">
                    КВАЛИФИКАЦИЯ ПРЕПОДАВАТЕЛЯ
                  </dt>
                  <dd className="font-medium text-sm text-[var(--fg)]">{profile.title}</dd>
                </div>
                <div className="flex flex-col gap-1 border-t border-[var(--line)] pt-3">
                  <dt className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--fg-mute)]">
                    ОБРАЗОВАТЕЛЬНАЯ ОРГАНИЗАЦИЯ
                  </dt>
                  <dd className="font-medium text-sm leading-snug text-[var(--fg)]">
                    {profile.institution}
                  </dd>
                </div>
              </dl>
            </TiltCard>
          </div>
        </div>

        {/* Анимированная типографическая композиция EDUCATION / TECHNOLOGY / INNOVATION */}
        <div
          ref={kineticRef}
          aria-label="Ключевые измерения: Education, Technology, Innovation"
          className="liquid-glass-surface mt-16 overflow-hidden rounded-[1.75rem] px-5 py-8 md:mt-28 md:rounded-[2rem] md:px-10 md:py-14"
        >
          <div
            data-kinetic-row
            className="flex flex-wrap items-baseline justify-between gap-2 font-sans text-[clamp(1.25rem,5.5vw,4.35rem)] leading-[1.08] font-semibold tracking-[-0.03em] uppercase text-[var(--fg)] sm:gap-4"
          >
            <span>EDUCATION</span>
            <span className="hidden font-mono text-xs tracking-[0.24em] text-[var(--fg-mute)] md:inline">
              [ ПЕДАГОГИЧЕСКАЯ НАУКА ]
            </span>
            <span className="text-[#9B8D71]">ОБРАЗОВАНИЕ</span>
          </div>

          <div
            data-kinetic-row
            className="mt-3 flex flex-wrap items-baseline justify-between gap-2 font-sans text-[clamp(1.25rem,5.5vw,4.35rem)] leading-[1.08] font-semibold tracking-[-0.03em] uppercase text-[var(--fg)] sm:mt-4 sm:gap-4"
          >
            <span className="text-[#6E6759] italic font-normal">ЦИФРОВАЯ СРЕДА</span>
            <span>TECHNOLOGY</span>
            <span className="hidden font-mono text-xs tracking-[0.24em] text-[var(--fg-mute)] md:inline">
              [ ИНФОРМАЦИОННЫЕ СИСТЕМЫ ]
            </span>
          </div>

          <div
            data-kinetic-row
            className="mt-3 flex flex-wrap items-baseline justify-between gap-2 font-sans text-[clamp(1.25rem,5.5vw,4.35rem)] leading-[1.08] font-semibold tracking-[-0.03em] uppercase text-[var(--fg)] sm:mt-4 sm:gap-4"
          >
            <span>INNOVATION</span>
            <span className="hidden font-mono text-xs tracking-[0.24em] text-[var(--fg-mute)] md:inline">
              [ 2007 — 2026 ]
            </span>
            <span className="text-[#9B8D71]">РАЗВИТИЕ</span>
          </div>
        </div>
      </div>
    </section>
  );
}
