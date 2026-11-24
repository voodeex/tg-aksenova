"use client";

import { UNTITLED_PROGRAM, plural, type TopicId } from "@/data/development";
import { programsForTopic, topicCounts, topicLinks, topics } from "@/data/topics";
import { ui, useUI } from "@/lib/store";
import { SplitReveal } from "@/components/ui/SplitReveal";

/**
 * Секция «На пересечении дисциплин» (Секция 11):
 * Интерактивное трёхмерное созвездие 14 направлений повышения квалификации.
 * На iPhone: открытое интерактивное окно 3D-созвездия (сферы кликаются пальцем!),
 * компактная горизонтальная свайп-лента всех 14 тем и карточка выбранного направления.
 */
export function ExpertiseSection() {
  const focusTopic = useUI("focusTopic") as TopicId | null;
  const activeId: TopicId = focusTopic ?? "digital-edu";
  const selectedTopic = topics.find((t) => t.id === activeId) ?? topics[0];
  const relatedPrograms = programsForTopic(selectedTopic.id);

  const connectedTopics = topicLinks
    .filter(([a, b]) => a === selectedTopic.id || b === selectedTopic.id)
    .map(([a, b]) => (a === selectedTopic.id ? b : a))
    .map((id) => topics.find((t) => t.id === id))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <section
      id="expertise"
      aria-labelledby="expertise-heading"
      className="relative z-10 min-h-screen w-full scroll-mt-24 px-4 pt-24 pb-20 sm:px-6 md:px-12 md:pt-32 md:pb-28"
    >
      <div className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-[1440px] flex-col justify-between gap-6 lg:gap-10">
        {/* Верхняя шапка созвездия */}
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] pb-3 font-mono text-[10px] font-medium tracking-[0.16em] uppercase text-[var(--fg-mute)] sm:mb-5 sm:text-[11px] sm:tracking-[0.22em]">
            <span>[ 04.2 / 06 ] · KNOWLEDGE CONSTELLATION</span>
            <span>14 ДИСЦИПЛИН</span>
          </div>

          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-end lg:gap-5">
            <SplitReveal
              as="h2"
              lines={["НА ПЕРЕСЕЧЕНИИ", "ДИСЦИПЛИН"]}
              className="text-halo font-sans text-[clamp(1.95rem,6.8vw,4.4rem)] leading-[0.95] font-semibold tracking-[-0.035em] uppercase text-[var(--fg)]"
            />

            <p className="max-w-md text-xs font-medium leading-relaxed text-[var(--fg-mute)] sm:text-sm md:text-base">
              Интерактивное созвездие областей повышения квалификации. Нажмите на любую сферу в
              3D-сцене или выберите тему в ленте ниже.
            </p>
          </div>
        </div>

        {/* Центральная область: прозрачное интерактивное окно 3D-созвездия + карточка */}
        <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-12 lg:gap-8">
          {/* Прозрачное окно для кликов/тапов прямо по 3D-сферам */}
          <div className="pointer-events-none relative flex h-[265px] flex-col justify-end rounded-3xl border border-white/10 sm:h-[310px] lg:col-span-6 lg:h-auto lg:min-h-[390px] lg:border-none">
            <div className="flex items-center justify-between px-3.5 py-2.5 font-mono text-[9px] tracking-[0.18em] uppercase text-white/60 lg:hidden">
              <span>3D · НАЖМИТЕ НА СФЕРУ</span>
              <span>АКТИВНО: {selectedTopic.label}</span>
            </div>
          </div>

          {/* Мобильная горизонтальная свайп-лента всех 14 сфер прямо над карточкой */}
          <div
            role="listbox"
            aria-label="Быстрый выбор направления"
            className="no-scrollbar -mx-4 flex items-center gap-1.5 overflow-x-auto px-4 py-1 lg:hidden"
          >
            {topics.map((topic) => {
              const isSelected = selectedTopic.id === topic.id;
              return (
                <button
                  key={topic.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => ui.set({ focusTopic: topic.id })}
                  className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 font-mono text-[11px] tracking-wider transition-all ${
                    isSelected
                      ? "border border-[#E5CFA0] bg-[#E5CFA0] font-semibold text-[#171717] shadow-[0_0_20px_rgba(229,207,160,0.35)]"
                      : "border border-white/20 bg-white/[0.08] text-white/90"
                  }`}
                >
                  <span>{topic.label}</span>
                  <span className="text-[10px] opacity-70">({topicCounts[topic.id]})</span>
                </button>
              );
            })}
          </div>

          {/* Стеклянная инфопанель выбранной дисциплины */}
          <div className="lg:col-span-6">
            <div className="liquid-glass-surface relative z-20 rounded-[1.6rem] p-5 sm:rounded-[2rem] sm:p-6 md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-2.5 border-b border-[var(--line)] pb-3.5 sm:items-center sm:pb-4">
                <div>
                  <span className="font-mono text-[10px] font-medium tracking-[0.18em] uppercase text-[#DFC896]">
                    ОБЛАСТЬ ПРОФЕССИОНАЛЬНОГО РАЗВИТИЯ
                  </span>
                  <h3 className="mt-1 font-sans text-xl font-semibold tracking-tight text-[var(--fg)] sm:text-2xl md:text-3xl">
                    {selectedTopic.label}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-[#C5B89A]/65 bg-[#C5B89A]/18 px-3 py-1 font-mono text-[11px] font-medium text-[var(--fg)] sm:text-xs">
                    {relatedPrograms.length}{" "}
                    {plural(relatedPrograms.length, ["программа", "программы", "программ"])}
                  </span>
                  {focusTopic && (
                    <button
                      type="button"
                      onClick={() => ui.set({ focusTopic: null })}
                      className="rounded-full border border-[var(--line)] px-3 py-1 font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--fg-mute)] hover:border-[#C5B89A] hover:text-[var(--fg)]"
                    >
                      Сброс
                    </button>
                  )}
                </div>
              </div>

              {/* Список документированных программ по выбранной теме */}
              <div className="mt-4 max-h-60 space-y-2.5 overflow-y-auto pr-1 sm:mt-5 sm:max-h-64 sm:space-y-3">
                {relatedPrograms.map((prog) => (
                  <div
                    key={prog.id}
                    className="rounded-2xl border border-[var(--line)] bg-white/[0.05] p-3 sm:p-3.5"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-mono text-xs font-semibold text-[#E5CFA0]">
                        {prog.year}
                      </span>
                      <span className="font-mono text-[10px] tracking-wider text-[var(--fg-mute)]">
                        {prog.organization}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-snug text-[var(--fg)]">
                      {prog.title ?? UNTITLED_PROGRAM}
                    </p>
                  </div>
                ))}
              </div>

              {/* Связанные дисциплины в созвездии */}
              {connectedTopics.length > 0 && (
                <div className="mt-4 border-t border-[var(--line)] pt-3.5 sm:mt-5 sm:pt-4">
                  <span className="block font-mono text-[10px] font-medium tracking-[0.18em] uppercase text-[var(--fg-mute)]">
                    СВЯЗАННЫЕ НАПРАВЛЕНИЯ:
                  </span>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {connectedTopics.map((ct) => (
                      <button
                        key={ct.id}
                        type="button"
                        onClick={() => ui.set({ focusTopic: ct.id })}
                        className="rounded-full border border-[var(--line)] bg-white/[0.08] px-3 py-1.5 font-mono text-[11px] tracking-wider text-[var(--fg)] transition-colors active:scale-95 hover:border-[#C5B89A] hover:bg-[#C5B89A]/25"
                      >
                        {ct.label} ↗
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Десктопная клавиатурно-доступная матрица всех 14 сфер */}
        <div className="hidden border-t border-[var(--line)] pt-5 lg:block">
          <div
            role="listbox"
            aria-label="Направления повышения квалификации"
            className="flex flex-wrap items-center gap-2"
          >
            {topics.map((topic) => {
              const isSelected = selectedTopic.id === topic.id;
              return (
                <button
                  key={topic.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() =>
                    ui.set({ focusTopic: focusTopic === topic.id ? null : topic.id })
                  }
                  onPointerEnter={() => ui.set({ hoverTopic: topic.id })}
                  onPointerLeave={() => ui.set({ hoverTopic: null })}
                  className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 font-mono text-xs tracking-wider transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C5B89A] ${
                    isSelected
                      ? "border border-[#E5CFA0] bg-[#E5CFA0] font-semibold text-[#171717] shadow-[0_0_24px_rgba(229,207,160,0.35)]"
                      : "border border-[var(--line)] bg-white/[0.08] text-[var(--fg)] opacity-90 hover:border-[#C5B89A]/80 hover:opacity-100"
                  }`}
                >
                  <span>{topic.label}</span>
                  <span className="text-[10px] opacity-70">({topicCounts[topic.id]})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
