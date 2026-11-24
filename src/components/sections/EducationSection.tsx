"use client";

import { useEffect, useRef, useState } from "react";
import { education } from "@/data/education";
import { engine, scrollToTarget, sectionPx, sectionProgress } from "@/lib/engine";
import { useUI } from "@/lib/store";
import { SplitReveal } from "@/components/ui/SplitReveal";
import { TiltCard } from "@/components/ui/TiltCard";

/**
 * Секция «Образование» (Секция 9):
 * Пространственная 3D-экспозиция с двумя парящими стеклянными монолитами (z = −16 и z = −26).
 * Оптимизирована без лишних React-ререндеров на каждый кадр прокрутки.
 */
export function EducationSection() {
  const reduced = useUI("reducedMotion");
  const webgl = useUI("webgl");
  const [activePanel, setActivePanel] = useState<0 | 1>(0);
  const activePanelRef = useRef<0 | 1>(0);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const p = sectionProgress("education");
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${p.toFixed(3)})`;
      }
      const nextPanel: 0 | 1 = p >= 0.54 ? 1 : 0;
      if (nextPanel !== activePanelRef.current) {
        activePanelRef.current = nextPanel;
        setActivePanel(nextPanel);
      }
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, []);

  const focusPanel = (index: 0 | 1) => {
    activePanelRef.current = index;
    setActivePanel(index);
    if (!engine.ready) return;
    const targetAt = index === 0 ? 0.34 : 0.78;
    scrollToTarget(sectionPx("education", targetAt), { duration: 1.15 });
  };

  return (
    <section
      id="education"
      aria-labelledby="education-heading"
      className={`relative z-10 w-full ${reduced || webgl === false ? "py-24" : "min-h-[250vh]"}`}
    >
      <div
        className={`${
          reduced || webgl === false
            ? "mx-auto max-w-[1440px] px-5 md:px-12"
            : "sticky top-0 flex min-h-screen w-full flex-col justify-between px-5 py-24 md:px-12 md:py-28"
        }`}
      >
        {/* Верхняя шапка экспозиции */}
        <div className="mx-auto w-full max-w-[1440px]">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] pb-4 font-mono text-[11px] font-medium tracking-[0.22em] uppercase text-[var(--fg-mute)]">
            <span>[ 03 / 06 ] · SPATIAL EXHIBITION</span>
            <span>ВЫСШЕЕ ОБРАЗОВАНИЕ · 2013</span>
          </div>

          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <SplitReveal
              as="h2"
              lines={["ФУНДАМЕНТ", "ПРОФЕССИОНАЛИЗМА"]}
              className="text-halo font-sans text-[clamp(2.2rem,5vw,4.6rem)] leading-[0.95] font-semibold tracking-[-0.035em] uppercase text-[var(--fg)]"
            />

            {/* Переключатель экспонатов в зале */}
            <div
              role="tablist"
              aria-label="Экспонаты зала образования"
              className="inline-flex items-center gap-2 self-start rounded-full border border-[var(--line)] bg-white/55 p-1.5 backdrop-blur-md lg:self-end"
            >
              {education.map((item, idx) => {
                const isSelected = activePanel === idx;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => focusPanel(idx as 0 | 1)}
                    data-cursor="OPEN"
                    className={`rounded-full px-4 py-2 font-mono text-[11px] font-medium tracking-[0.16em] uppercase transition-all ${
                      isSelected
                        ? "bg-[#171717] text-[#F5F2EB] shadow-sm"
                        : "text-[var(--fg)] opacity-75 hover:opacity-100"
                    }`}
                  >
                    Панель {item.index}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Пространственная витрина двух стеклянных панелей */}
        <div className="mx-auto my-auto grid w-full max-w-[1440px] grid-cols-1 gap-7 py-8 lg:grid-cols-12 lg:items-center">
          {education.map((item, idx) => {
            const isFocused = activePanel === idx;
            return (
              <div
                key={item.id}
                onClick={() => focusPanel(idx as 0 | 1)}
                className={`lg:col-span-6 transition-all duration-500 ${
                  reduced || webgl === false
                    ? "opacity-100 scale-100"
                    : isFocused
                      ? "translate-y-0 scale-100 opacity-100 z-20"
                      : "translate-y-2 scale-[0.96] opacity-75 hover:opacity-95 z-10 cursor-pointer"
                }`}
              >
                <TiltCard
                  cursorLabel="EXPLORE"
                  className={`rounded-[2rem] p-7 md:p-10 transition-all duration-500 ${
                    isFocused
                      ? "ring-1 ring-[#C5B89A]/90 shadow-[0_28px_70px_rgba(23,23,23,0.14)]"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
                    <span className="font-mono text-xs font-medium tracking-[0.22em] uppercase text-[#5A5143]">
                      PANEL {item.index} // DIPLOMA
                    </span>
                    <span className="rounded-full border border-[#C5B89A]/70 bg-[#C5B89A]/20 px-3.5 py-1 font-mono text-xs font-semibold tracking-[0.16em] text-[var(--fg)]">
                      {item.year}
                    </span>
                  </div>

                  <h3 className="mt-6 font-sans text-xl leading-snug font-semibold tracking-tight text-[var(--fg)] md:text-2xl">
                    {item.institution}
                  </h3>

                  <dl className="mt-8 grid grid-cols-1 gap-5 border-t border-[var(--line)] pt-6 sm:grid-cols-2">
                    <div>
                      <dt className="font-mono text-[11px] font-medium tracking-[0.18em] uppercase text-[var(--fg-mute)]">
                        {item.fieldLabel}
                      </dt>
                      <dd className="mt-1.5 text-base font-semibold text-[var(--fg)]">
                        {item.field}
                      </dd>
                    </div>

                    <div>
                      <dt className="font-mono text-[11px] font-medium tracking-[0.18em] uppercase text-[var(--fg-mute)]">
                        Квалификация
                      </dt>
                      <dd className="mt-1.5 text-base font-semibold text-[var(--fg)]">
                        {item.qualification}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-7 flex items-center justify-between pt-2 font-mono text-[11px] font-medium tracking-[0.18em] uppercase text-[var(--fg-mute)]">
                    <span>
                      {isFocused ? "В ФОКУСЕ КАМЕРЫ" : "В ГЛУБИНЕ ГАЛЕРЕИ · НАЖМИТЕ ДЛЯ ФОКУСА"}
                    </span>
                    <span>[ Z = {idx === 0 ? "-16.0m" : "-26.0m"} ]</span>
                  </div>
                </TiltCard>
              </div>
            );
          })}
        </div>

        {/* Нижняя шкала продвижения по галерее */}
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-6 border-t border-[var(--line)] pt-4 font-mono text-[11px] font-medium tracking-[0.2em] uppercase text-[var(--fg-mute)]">
          <span>ГАЛЕРЕЯ ОБРАЗОВАНИЯ · 0{activePanel + 1} / 02</span>
          <div className="hidden h-1 w-48 overflow-hidden rounded-full bg-black/10 sm:block">
            <div
              ref={progressBarRef}
              className="h-full w-full origin-left bg-[#171717] will-change-transform"
              style={{ transform: "scaleX(0)" }}
            />
          </div>
          <span>ПРОКРУЧИВАЙТЕ ДЛЯ ПЕРЕХОДА МЕЖДУ ПАНЕЛЯМИ</span>
        </div>
      </div>
    </section>
  );
}
