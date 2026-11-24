"use client";

import { useEffect, useMemo, useState } from "react";
import {
  TIMELINE_END,
  TIMELINE_START,
  UNTITLED_PROGRAM,
  categories,
  categoryLabel,
  filterPrograms,
  groupByYear,
  plural,
  type CategoryId,
} from "@/data/development";
import { engine, scrollToTarget, sectionProgress, sectionPx } from "@/lib/engine";
import { ui, useUI } from "@/lib/store";
import { SplitReveal } from "@/components/ui/SplitReveal";
import { clamp } from "@/utils/math";

/**
 * Секция «Непрерывное развитие» (Секция 10):
 * - На десктопе: пространственный 3D-таймлайн 2007–2026 со скролл-камерой вдоль 3D-ленты.
 * - На iPhone: нативные горизонтальные карусели категорий и лет прямо над стеклянной карточкой
 *   (по умолчанию открыт свежий 2026 год) + раскрывающийся полный реестр всех 37 программ.
 */
export function DevelopmentSection() {
  const reduced = useUI("reducedMotion");
  const touch = useUI("touch");
  const [selectedCategory, setSelectedCategory] = useState<"all" | CategoryId>("all");
  const [activeYearIdx, setActiveYearIdx] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredPrograms = useMemo(() => filterPrograms(selectedCategory), [selectedCategory]);
  const yearGroups = useMemo(() => groupByYear(filteredPrograms), [filteredPrograms]);
  const archiveGroups = useMemo(() => [...yearGroups].reverse(), [yearGroups]);

  // На мобильных по умолчанию показываем самый свежий год (2026), на десктопе — по скроллу с начала ленты
  const defaultIdx = touch ? Math.max(yearGroups.length - 1, 0) : 0;
  const safeIdx = clamp(activeYearIdx ?? defaultIdx, 0, Math.max(yearGroups.length - 1, 0));
  const currentGroup = yearGroups[safeIdx] ?? yearGroups[0];

  useEffect(() => {
    engine.timeline.count = yearGroups.length;
    engine.timeline.index = safeIdx;
    ui.set({ timelineIndex: safeIdx });
  }, [yearGroups.length, safeIdx]);

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const syncFromScroll = () => {
      if (!engine.portrait) {
        const s = engine.sections.development;
        if (s && engine.scrollY >= s.top - 40 && engine.scrollY <= s.top + s.height) {
          const p = sectionProgress("development");
          const count = Math.max(yearGroups.length, 1);
          const idx = clamp(Math.floor(p * count), 0, count - 1);
          setActiveYearIdx((prev) => (prev === idx ? prev : idx));
        }
      }
      raf = requestAnimationFrame(syncFromScroll);
    };
    raf = requestAnimationFrame(syncFromScroll);
    return () => cancelAnimationFrame(raf);
  }, [yearGroups.length, reduced]);

  const selectYearIndex = (idx: number, scrollCamera = true) => {
    const count = Math.max(yearGroups.length, 1);
    const clamped = clamp(idx, 0, count - 1);
    setActiveYearIdx(clamped);
    if (scrollCamera && !reduced && !engine.portrait && engine.ready) {
      const at = count <= 1 ? 0.5 : (clamped + 0.35) / count;
      scrollToTarget(sectionPx("development", clamp(at, 0.02, 0.96)), { duration: 1.05 });
    }
  };

  const handleCategoryChange = (cat: "all" | CategoryId) => {
    setSelectedCategory(cat);
    const nextGroups = groupByYear(filterPrograms(cat));
    setActiveYearIdx(touch ? Math.max(nextGroups.length - 1, 0) : 0);
    setExpandedId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      selectYearIndex(safeIdx + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      selectYearIndex(safeIdx - 1);
    }
  };

  return (
    <>
      <section
        id="development"
        aria-labelledby="development-heading"
        onKeyDown={handleKeyDown}
        className={`relative z-10 w-full ${reduced ? "py-20" : "py-18 lg:min-h-[340vh] lg:py-0"}`}
      >
        <div
          className={`${
            reduced
              ? "mx-auto max-w-[1440px] px-4 sm:px-6 md:px-12"
              : "mx-auto flex w-full max-w-[1440px] flex-col justify-between gap-5 px-4 sm:px-6 md:px-12 lg:sticky lg:top-0 lg:min-h-screen lg:max-w-none lg:gap-0 lg:pt-26 lg:pb-10"
          }`}
        >
          {/* Заголовок и фильтры */}
          <div className="mx-auto w-full max-w-[1440px]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] pb-3 font-mono text-[10px] font-medium tracking-[0.18em] uppercase text-[var(--fg-mute)] sm:text-[11px] sm:tracking-[0.22em]">
              <span>
                [ 04 / 06 ] · TIMELINE ({TIMELINE_START} — {TIMELINE_END})
              </span>
              <span>
                {filteredPrograms.length}{" "}
                {plural(filteredPrograms.length, ["ПРОГРАММА", "ПРОГРАММЫ", "ПРОГРАММ"])}
              </span>
            </div>

            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
              <div>
                <SplitReveal
                  as="h2"
                  lines={["НЕПРЕРЫВНОЕ", "РАЗВИТИЕ"]}
                  className="text-halo font-sans text-[clamp(1.95rem,6.8vw,4.3rem)] leading-[0.95] font-semibold tracking-[-0.035em] uppercase text-[var(--fg)]"
                />
                <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-[var(--fg-mute)] md:text-base">
                  Профессиональное развитие в области цифровых технологий, педагогики и современных
                  образовательных практик.
                </p>
              </div>

              {/* Горизонтально-свайпаемые фильтры категорий на iPhone, flex-wrap на десктопе */}
              <div
                role="toolbar"
                aria-label="Фильтр программ повышения квалификации"
                className="no-scrollbar -mx-4 flex items-center gap-1.5 overflow-x-auto px-4 py-1 sm:mx-0 sm:flex-wrap sm:px-0"
              >
                {categories.map((cat) => {
                  const active = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryChange(cat.id)}
                      aria-pressed={active}
                      className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 font-mono text-[11px] tracking-[0.13em] uppercase transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C5B89A] ${
                        active
                          ? "bg-[#171717] font-semibold text-[#F5F2EB] shadow-sm"
                          : "liquid-glass-pill text-[var(--fg)] opacity-85 hover:opacity-100"
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Мобильная свайп-лента лет прямо под фильтрами (от 2026 к 2007 для удобства с телефона) */}
            <div
              role="tablist"
              aria-label="Выбор года (мобильная навигация)"
              className="no-scrollbar -mx-4 mt-4 flex flex-row-reverse items-center justify-end gap-1.5 overflow-x-auto px-4 pb-1 lg:hidden"
            >
              {yearGroups.map((yg, i) => {
                const isCurrent = i === safeIdx;
                return (
                  <button
                    key={yg.year}
                    type="button"
                    role="tab"
                    aria-selected={isCurrent}
                    onClick={() => selectYearIndex(i, false)}
                    className={`shrink-0 rounded-2xl px-3.5 py-2 font-mono text-xs transition-all ${
                      isCurrent
                        ? "bg-[#171717] font-semibold text-[#F5F2EB] shadow-sm"
                        : "liquid-glass-pill text-[var(--fg)] opacity-80"
                    }`}
                  >
                    <span>{yg.year}</span>
                    <span className="ml-1 text-[10px] opacity-65">({yg.programs.length})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Центральная сцена: выбранный год + стеклянная панель программ */}
          {currentGroup && (
            <div className="mx-auto my-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-4 py-1 sm:gap-6 lg:grid-cols-12 lg:py-4">
              {/* Левая часть — скульптурная типографика года */}
              <div className="flex items-end justify-between gap-4 lg:col-span-5 lg:block">
                <div>
                  <span className="font-mono text-[11px] font-medium tracking-[0.2em] uppercase text-[#5A5143] sm:text-xs">
                    [ ГОД {String(safeIdx + 1).padStart(2, "0")} /{" "}
                    {String(yearGroups.length).padStart(2, "0")} ]
                  </span>

                  <div
                    key={currentGroup.year}
                    className="mt-1 font-sans text-[clamp(3.3rem,12vw,9.6rem)] leading-[0.88] font-semibold tracking-[-0.05em] text-[var(--fg)]"
                  >
                    {currentGroup.year}
                  </div>

                  <p className="mt-2 font-mono text-[11px] font-medium tracking-[0.15em] uppercase text-[var(--fg-mute)] sm:mt-3 sm:text-xs">
                    {currentGroup.programs.length}{" "}
                    {plural(currentGroup.programs.length, [
                      "ПРОГРАММА",
                      "ПРОГРАММЫ",
                      "ПРОГРАММ",
                    ])}
                  </p>
                </div>

                {/* Кнопки пошаговой навигации */}
                <div className="flex flex-wrap items-center gap-2 lg:mt-5">
                  <button
                    type="button"
                    onClick={() => selectYearIndex(safeIdx - 1)}
                    disabled={safeIdx === 0}
                    aria-label="Предыдущий год"
                    className="liquid-glass-pill rounded-full px-3.5 py-2 font-mono text-[11px] font-medium tracking-[0.14em] uppercase text-[var(--fg)] transition-opacity disabled:opacity-35 sm:px-4 sm:text-xs"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => selectYearIndex(safeIdx + 1)}
                    disabled={safeIdx >= yearGroups.length - 1}
                    aria-label="Следующий год"
                    className="liquid-glass-pill rounded-full px-3.5 py-2 font-mono text-[11px] font-medium tracking-[0.14em] uppercase text-[var(--fg)] transition-opacity disabled:opacity-35 sm:px-4 sm:text-xs"
                  >
                    →
                  </button>
                  <a
                    href="#archive"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToTarget("archive");
                    }}
                    className="hidden font-mono text-[11px] tracking-[0.16em] uppercase text-[#5A5143] underline underline-offset-4 hover:text-[var(--fg)] lg:ml-2 lg:inline"
                  >
                    Полный реестр ↓
                  </a>
                </div>
              </div>

              {/* Правая часть — жидкостеклянная панель программ выбранного года */}
              <div className="lg:col-span-7">
                <div className="liquid-glass-surface rounded-[1.6rem] px-4 pt-4 pb-5 sm:rounded-[2rem] sm:px-6 sm:pt-6 sm:pb-7 md:px-8 md:pt-7 md:pb-9 lg:max-h-[58vh] lg:overflow-y-auto">
                  <div className="mb-3 flex items-center justify-between gap-2 border-b border-[var(--line)] pb-3 font-mono text-[10px] font-medium tracking-[0.18em] uppercase text-[var(--fg-mute)]">
                    <span>ПРОГРАММЫ · {currentGroup.year}</span>
                    <span className="hidden sm:inline">НАЖМИТЕ ДЛЯ ДЕТАЛЕЙ</span>
                  </div>

                  <ol className="divide-y divide-[var(--line)]">
                    {currentGroup.programs.map((prog, idx) => {
                      const isExpanded = expandedId === prog.id;
                      const isUntitled = prog.title === null;
                      return (
                        <li key={prog.id} className="py-3 first:pt-1 last:pb-1 sm:py-3.5">
                          <button
                            type="button"
                            onClick={() => setExpandedId(isExpanded ? null : prog.id)}
                            aria-expanded={isExpanded}
                            className="flex w-full items-start justify-between gap-3 text-left transition-colors hover:text-[#6E6759]"
                          >
                            <div className="flex items-start gap-2.5 sm:gap-3.5">
                              <span className="mt-0.5 font-mono text-xs font-medium text-[#6E6759]">
                                {String(idx + 1).padStart(2, "0")}.
                              </span>
                              <span
                                className={`text-sm leading-snug sm:text-base ${
                                  isUntitled
                                    ? "italic text-[var(--fg-mute)]"
                                    : "font-medium text-[var(--fg)]"
                                }`}
                              >
                                {prog.title ?? UNTITLED_PROGRAM}
                              </span>
                            </div>
                            <span
                              className="mt-0.5 shrink-0 font-mono text-sm font-medium text-[var(--fg-mute)]"
                              aria-hidden="true"
                            >
                              {isExpanded ? "−" : "+"}
                            </span>
                          </button>

                          <div
                            className={`grid transition-all duration-300 ${
                              isExpanded
                                ? "mt-2.5 grid-rows-[1fr] opacity-100"
                                : "mt-1.5 grid-rows-[1fr] opacity-85"
                            }`}
                          >
                            <div className="overflow-hidden pl-6 sm:pl-7">
                              <p className="text-xs leading-relaxed text-[var(--fg-mute)]">
                                <span className="font-mono uppercase tracking-wider">
                                  Организация:{" "}
                                </span>
                                {prog.organization}.
                              </p>
                              {isExpanded && (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {prog.categories.map((c) => (
                                    <span
                                      key={c}
                                      className="rounded-full border border-[#C5B89A]/60 bg-[#C5B89A]/18 px-2.5 py-0.5 font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--fg)]"
                                    >
                                      {categoryLabel[c]}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* Нижняя интерактивная шкала лет на десктопе */}
          <div className="mx-auto hidden w-full max-w-[1440px] border-t border-[var(--line)] pt-4 lg:block">
            <div
              role="tablist"
              aria-label="Шкала лет повышения квалификации"
              className="flex items-center justify-between gap-1.5 overflow-x-auto pb-1"
            >
              {yearGroups.map((yg, i) => {
                const isCurrent = i === safeIdx;
                return (
                  <button
                    key={yg.year}
                    type="button"
                    role="tab"
                    aria-selected={isCurrent}
                    onClick={() => selectYearIndex(i)}
                    className={`group flex flex-col items-center rounded-2xl px-3 py-1.5 transition-all ${
                      isCurrent
                        ? "bg-[#171717] text-[#F5F2EB] shadow-sm"
                        : "text-[var(--fg)] opacity-65 hover:bg-white/25 hover:opacity-100"
                    }`}
                  >
                    <span className="font-mono text-xs font-semibold tracking-wider">
                      {yg.year}
                    </span>
                    <span className="font-mono text-[9px] opacity-70">
                      ({yg.programs.length})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Полный доступный хронологический реестр всех 37 программ (аккуратная раскрываемая панель на мобильных) */}
      <section
        id="archive"
        aria-label="Полный хронологический реестр программ повышения квалификации"
        className="relative z-10 w-full px-4 pt-6 pb-24 sm:px-6 md:px-12 md:pt-16 md:pb-36"
      >
        <div className="mx-auto max-w-[1440px]">
          <details className="group liquid-glass-surface rounded-[1.75rem] p-5 sm:rounded-[2rem] sm:p-7 md:p-9">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
              <div>
                <span className="font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-[var(--fg-mute)] sm:text-[11px]">
                  [ CHRONOLOGICAL ARCHIVE // 2026 — 2007 ]
                </span>
                <h3 className="mt-1 font-sans text-lg font-semibold tracking-tight text-[var(--fg)] sm:text-2xl md:text-3xl">
                  Полный реестр всех программ ({filteredPrograms.length})
                </h3>
              </div>
              <span className="liquid-glass-pill inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 font-mono text-[11px] font-semibold tracking-[0.14em] uppercase text-[var(--fg)]">
                <span className="group-open:hidden">Показать</span>
                <span className="hidden group-open:inline">Свернуть</span>
                <span className="transition-transform duration-300 group-open:rotate-180">↓</span>
              </span>
            </summary>

            <div className="mt-6 grid grid-cols-1 gap-5 border-t border-[var(--line)] pt-6 md:grid-cols-2 xl:grid-cols-3">
              {archiveGroups.map((yg) => (
                <article
                  key={yg.year}
                  className="rounded-2xl border border-[var(--line)] bg-white/40 p-5"
                >
                  <div className="mb-3 flex items-center justify-between border-b border-[var(--line)] pb-2.5">
                    <span className="font-sans text-2xl font-semibold tracking-tight text-[var(--fg)]">
                      {yg.year}
                    </span>
                    <span className="rounded-full border border-[var(--line)] px-2.5 py-0.5 font-mono text-[10px] tracking-[0.16em] uppercase text-[var(--fg-mute)]">
                      {yg.programs.length}{" "}
                      {plural(yg.programs.length, ["программа", "программы", "программ"])}
                    </span>
                  </div>

                  <ol className="space-y-3">
                    {yg.programs.map((prog, idx) => (
                      <li key={prog.id} className="text-sm leading-snug">
                        <div className="flex items-start gap-2">
                          <span className="font-mono text-xs text-[#6E6759]">{idx + 1}.</span>
                          <div>
                            <p
                              className={
                                prog.title === null
                                  ? "italic text-[var(--fg-mute)]"
                                  : "font-medium text-[var(--fg)]"
                              }
                            >
                              {prog.title ?? UNTITLED_PROGRAM}
                            </p>
                            <p className="mt-0.5 text-xs text-[var(--fg-mute)]">
                              Организация: {prog.organization}.
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </article>
              ))}
            </div>
          </details>
        </div>
      </section>
    </>
  );
}
