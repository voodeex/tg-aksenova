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
 * 1) Пространственный 3D-таймлайн 2007–2026, синхронизированный с парящей 3D-лентой в WebGL.
 * 2) Рабочие фильтры: ВСЕ / ТЕХНОЛОГИИ / ПЕДАГОГИКА / БЕЗОПАСНОСТЬ / ПРОФЕССИОНАЛЬНЫЕ НАВЫКИ.
 * 3) Навигация скроллом, мышью, тачем и клавиатурой (← / →).
 * 4) Полный хронологический реестр всех 37 программ в доступной семантической HTML-разметке (#archive).
 */
export function DevelopmentSection() {
  const reduced = useUI("reducedMotion");
  const [selectedCategory, setSelectedCategory] = useState<"all" | CategoryId>("all");
  const [activeYearIdx, setActiveYearIdx] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredPrograms = useMemo(() => filterPrograms(selectedCategory), [selectedCategory]);

  // По возрастанию (2007 → 2026) вдоль движения камеры по 3D-ленте
  const yearGroups = useMemo(() => groupByYear(filteredPrograms), [filteredPrograms]);
  // По убыванию (2026 → 2007) для полного реестра
  const archiveGroups = useMemo(() => [...yearGroups].reverse(), [yearGroups]);

  const safeIdx = clamp(activeYearIdx, 0, Math.max(yearGroups.length - 1, 0));
  const currentGroup = yearGroups[safeIdx] ?? yearGroups[0];

  useEffect(() => {
    engine.timeline.count = yearGroups.length;
    engine.timeline.index = safeIdx;
    ui.set({ timelineIndex: safeIdx });
  }, [yearGroups.length, safeIdx]);

  // Синхронизация активного года с положением прокрутки вдоль 3D-ленты (на десктопе)
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
    setActiveYearIdx(0);
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
      {/* 1. Интерактивная пространственная сцена с 3D-лентой времени */}
      <section
        id="development"
        aria-labelledby="development-heading"
        onKeyDown={handleKeyDown}
        className={`relative z-10 w-full ${reduced ? "py-20" : "py-20 lg:min-h-[340vh] lg:py-0"}`}
      >
        <div
          className={`${
            reduced
              ? "mx-auto max-w-[1440px] px-5 md:px-12"
              : "mx-auto flex w-full max-w-[1440px] flex-col justify-between gap-6 px-5 md:px-12 lg:sticky lg:top-0 lg:min-h-screen lg:max-w-none lg:gap-0 lg:pt-26 lg:pb-10"
          }`}
        >
          {/* Заголовок и фильтры */}
          <div className="mx-auto w-full max-w-[1440px]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] pb-3 font-mono text-[11px] tracking-[0.22em] uppercase text-[var(--fg-mute)]">
              <span>
                [ 04 / 06 ] · INTERACTIVE TIMELINE ({TIMELINE_START} — {TIMELINE_END})
              </span>
              <span>
                {filteredPrograms.length}{" "}
                {plural(filteredPrograms.length, ["ПРОГРАММА", "ПРОГРАММЫ", "ПРОГРАММ"])}
              </span>
            </div>

            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div>
                <SplitReveal
                  as="h2"
                  lines={["НЕПРЕРЫВНОЕ", "РАЗВИТИЕ"]}
                  className="font-sans text-[clamp(2.1rem,4.6vw,4.3rem)] leading-[0.95] font-semibold tracking-[-0.035em] uppercase text-[var(--fg)]"
                />
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--fg-mute)] md:text-base">
                  Профессиональное развитие в области цифровых технологий, педагогики и современных
                  образовательных практик.
                </p>
              </div>

              {/* Фильтры категорий */}
              <div
                role="toolbar"
                aria-label="Фильтр программ повышения квалификации"
                className="flex flex-wrap items-center gap-1.5"
              >
                {categories.map((cat) => {
                  const active = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryChange(cat.id)}
                      aria-pressed={active}
                      data-cursor="OPEN"
                      className={`rounded-full px-3.5 py-2 font-mono text-[11px] tracking-[0.14em] uppercase transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C5B89A] ${
                        active
                          ? "bg-[#171717] text-[#F5F2EB] shadow-sm"
                          : "liquid-glass-pill text-[var(--fg)] opacity-80 hover:opacity-100"
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Центральная сцена: крупный парящий год + интерактивная стеклянная панель программ */}
          {currentGroup && (
            <div className="mx-auto my-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-6 py-4 lg:grid-cols-12">
              {/* Левая часть — скульптурная типографика года */}
              <div className="lg:col-span-5">
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-xs tracking-[0.24em] uppercase text-[#6E6759]">
                    [ ГОД {String(safeIdx + 1).padStart(2, "0")} /{" "}
                    {String(yearGroups.length).padStart(2, "0")} ]
                  </span>
                </div>

                <div
                  key={currentGroup.year}
                  className="mt-1 font-sans text-[clamp(4.2rem,11vw,9.6rem)] leading-[0.88] font-semibold tracking-[-0.05em] text-[var(--fg)] transition-all duration-500"
                >
                  {currentGroup.year}
                </div>

                <p className="mt-3 font-mono text-xs tracking-[0.18em] uppercase text-[var(--fg-mute)]">
                  {currentGroup.programs.length}{" "}
                  {plural(currentGroup.programs.length, [
                    "ДОКУМЕНТИРОВАННАЯ ПРОГРАММА",
                    "ДОКУМЕНТИРОВАННЫЕ ПРОГРАММЫ",
                    "ДОКУМЕНТИРОВАННЫХ ПРОГРАММ",
                  ])}
                </p>

                {/* Кнопки пошаговой навигации */}
                <div className="mt-5 flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => selectYearIndex(safeIdx - 1)}
                    disabled={safeIdx === 0}
                    data-cursor="EXPLORE"
                    aria-label="Предыдущий год"
                    className="liquid-glass-pill rounded-full px-4 py-2 font-mono text-xs tracking-[0.16em] uppercase text-[var(--fg)] transition-opacity disabled:opacity-35"
                  >
                    ← Пред.
                  </button>
                  <button
                    type="button"
                    onClick={() => selectYearIndex(safeIdx + 1)}
                    disabled={safeIdx >= yearGroups.length - 1}
                    data-cursor="EXPLORE"
                    aria-label="Следующий год"
                    className="liquid-glass-pill rounded-full px-4 py-2 font-mono text-xs tracking-[0.16em] uppercase text-[var(--fg)] transition-opacity disabled:opacity-35"
                  >
                    След. →
                  </button>
                  <a
                    href="#archive"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToTarget("archive");
                    }}
                    data-cursor="OPEN"
                    className="ml-2 font-mono text-[11px] tracking-[0.16em] uppercase text-[#6E6759] underline underline-offset-4 hover:text-[var(--fg)]"
                  >
                    Полный реестр ↓
                  </a>
                </div>
              </div>

              {/* Правая часть — жидкостеклянная панель программ выбранного года */}
              <div className="lg:col-span-7">
                <div className="liquid-glass-surface rounded-[1.75rem] px-5 pt-5 pb-7 sm:rounded-[2rem] md:px-8 md:pt-7 md:pb-9 lg:max-h-[58vh] lg:overflow-y-auto">
                  <div className="mb-4 flex items-center justify-between border-b border-[var(--line)] pb-3 font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--fg-mute)]">
                    <span>ПРОГРАММЫ {currentGroup.year} ГОДА</span>
                    <span>НАЖМИТЕ НА ПРОГРАММУ ДЛЯ ДЕТАЛЕЙ</span>
                  </div>

                  <ol className="divide-y divide-[var(--line)]">
                    {currentGroup.programs.map((prog, idx) => {
                      const isExpanded = expandedId === prog.id;
                      const isUntitled = prog.title === null;
                      return (
                        <li key={prog.id} className="py-3.5 first:pt-1 last:pb-1">
                          <button
                            type="button"
                            onClick={() => setExpandedId(isExpanded ? null : prog.id)}
                            aria-expanded={isExpanded}
                            data-cursor="OPEN"
                            className="flex w-full items-start justify-between gap-4 text-left transition-colors hover:text-[#6E6759]"
                          >
                            <div className="flex items-start gap-3.5">
                              <span className="mt-0.5 font-mono text-xs text-[#6E6759]">
                                {String(idx + 1).padStart(2, "0")}.
                              </span>
                              <span
                                className={`text-sm leading-snug md:text-base ${
                                  isUntitled
                                    ? "italic text-[var(--fg-mute)]"
                                    : "font-medium text-[var(--fg)]"
                                }`}
                              >
                                {prog.title ?? UNTITLED_PROGRAM}
                              </span>
                            </div>
                            <span
                              className="mt-0.5 shrink-0 font-mono text-xs text-[var(--fg-mute)]"
                              aria-hidden="true"
                            >
                              {isExpanded ? "−" : "+"}
                            </span>
                          </button>

                          {/* Раскрывающиеся сведения об организации и направлении */}
                          <div
                            className={`grid transition-all duration-300 ${
                              isExpanded
                                ? "mt-3 grid-rows-[1fr] opacity-100"
                                : "grid-rows-[0fr] opacity-75"
                            }`}
                          >
                            <div className="overflow-hidden pl-7">
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
                                      className="rounded-full border border-[#C5B89A]/50 bg-[#C5B89A]/15 px-2.5 py-0.5 font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--fg)]"
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

          {/* Нижняя интерактивная шкала лет вдоль 3D-ленты */}
          <div className="mx-auto w-full max-w-[1440px] border-t border-[var(--line)] pt-4">
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
                    data-cursor="EXPLORE"
                    className={`group flex flex-col items-center rounded-2xl px-3 py-1.5 transition-all ${
                      isCurrent
                        ? "bg-[#171717] text-[#F5F2EB] shadow-sm"
                        : "text-[var(--fg)] opacity-65 hover:opacity-100 hover:bg-white/25"
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

      {/* 2. Полный доступный хронологический реестр всех программ (2026 — 2007) */}
      <section
        id="archive"
        aria-label="Полный хронологический реестр программ повышения квалификации"
        className="relative z-10 w-full px-5 pt-20 pb-36 md:px-12 md:pt-28 md:pb-48"
      >
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--line)] pb-5">
            <div>
              <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[var(--fg-mute)]">
                [ CHRONOLOGICAL ARCHIVE // 2026 — 2007 ]
              </span>
              <h3 className="mt-2 font-sans text-2xl font-semibold tracking-tight text-[var(--fg)] md:text-3xl">
                Полный реестр программ повышения квалификации и переподготовки
              </h3>
            </div>
            <span className="font-mono text-xs tracking-[0.18em] uppercase text-[var(--fg-mute)]">
              ОТОБРАЖЕНО: {filteredPrograms.length}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {archiveGroups.map((yg) => (
              <article
                key={yg.year}
                className="liquid-glass-surface flex flex-col justify-between rounded-3xl p-6"
              >
                <div>
                  <div className="mb-4 flex items-center justify-between border-b border-[var(--line)] pb-3">
                    <span className="font-sans text-3xl font-semibold tracking-tight text-[var(--fg)]">
                      {yg.year}
                    </span>
                    <span className="rounded-full border border-[var(--line)] px-3 py-0.5 font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--fg-mute)]">
                      {yg.programs.length}{" "}
                      {plural(yg.programs.length, ["программа", "программы", "программ"])}
                    </span>
                  </div>

                  <ol className="space-y-3.5">
                    {yg.programs.map((prog, idx) => (
                      <li key={prog.id} className="text-sm leading-snug">
                        <div className="flex items-start gap-2.5">
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
                            <p className="mt-1 text-xs text-[var(--fg-mute)]">
                              Организация: {prog.organization}.
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
