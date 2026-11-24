"use client";

import { UNTITLED_PROGRAM, plural, type TopicId } from "@/data/development";
import { programsForTopic, topicCounts, topicLinks, topics } from "@/data/topics";
import { ui, useUI } from "@/lib/store";
import { SplitReveal } from "@/components/ui/SplitReveal";

/**
 * Секция «На пересечении дисциплин» (Секция 11):
 * Интерактивное трёхмерное созвездие 14 направлений документально подтверждённого
 * повышения квалификации (z = −126). При выборе сферы камера в WebGL плавно приближается к ней,
 * а в жидкостеклянной панели отображаются соответствующие программы обучения.
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
      className="relative z-10 min-h-screen w-full scroll-mt-24 px-5 pt-28 pb-24 md:px-12 md:pt-32 md:pb-28"
    >
      <div className="mx-auto flex min-h-[calc(100vh-14rem)] max-w-[1440px] flex-col justify-between gap-10">
        {/* Верхняя шапка созвездия */}
        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-4 font-mono text-[11px] font-medium tracking-[0.18em] uppercase text-[var(--fg-mute)] sm:tracking-[0.22em]">
            <span>[ 04.2 / 06 ] · KNOWLEDGE CONSTELLATION</span>
            <span>14 ОБЛАСТЕЙ ПОВЫШЕНИЯ КВАЛИФИКАЦИИ</span>
          </div>

          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <SplitReveal
              as="h2"
              lines={["НА ПЕРЕСЕЧЕНИИ", "ДИСЦИПЛИН"]}
              className="text-halo font-sans text-[clamp(2.1rem,4.6vw,4.4rem)] leading-[0.95] font-semibold tracking-[-0.035em] uppercase text-[var(--fg)]"
            />

            <p className="max-w-md text-sm font-medium leading-relaxed text-[var(--fg-mute)] md:text-base">
              Интерактивная визуализация направлений документально подтверждённого образования и
              повышения квалификации. Выберите сферу в 3D-сцене слева или в списке ниже.
            </p>
          </div>
        </div>

        {/* Центральная область: слева свободная сцена для 3D-созвездия, справа — стеклянная инфопанель */}
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          <div className="pointer-events-none hidden min-h-[380px] lg:col-span-6 lg:block" />

          <div className="lg:col-span-6">
            <div className="liquid-glass-surface relative z-20 rounded-[2rem] p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
                <div>
                  <span className="font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-[#DFC896]">
                    ОБЛАСТЬ ПРОФЕССИОНАЛЬНОГО РАЗВИТИЯ
                  </span>
                  <h3 className="mt-1 font-sans text-2xl font-semibold tracking-tight text-[var(--fg)] md:text-3xl">
                    {selectedTopic.label}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-[#C5B89A]/65 bg-[#C5B89A]/18 px-3 py-1 font-mono text-xs font-medium text-[var(--fg)]">
                    {relatedPrograms.length}{" "}
                    {plural(relatedPrograms.length, ["программа", "программы", "программ"])}
                  </span>
                  {focusTopic && (
                    <button
                      type="button"
                      onClick={() => ui.set({ focusTopic: null })}
                      className="rounded-full border border-[var(--line)] px-3 py-1 font-mono text-[10px] tracking-[0.16em] uppercase text-[var(--fg-mute)] hover:border-[#C5B89A] hover:text-[var(--fg)]"
                    >
                      Общий вид
                    </button>
                  )}
                </div>
              </div>

              {/* Список документированных программ по выбранной теме */}
              <div className="mt-5 max-h-64 space-y-3 overflow-y-auto pr-1">
                {relatedPrograms.map((prog) => (
                  <div
                    key={prog.id}
                    className="rounded-2xl border border-[var(--line)] bg-white/[0.05] p-3.5"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-mono text-xs font-semibold text-[#E5CFA0]">
                        {prog.year}
                      </span>
                      <span className="font-mono text-[10px] tracking-wider text-[var(--fg-mute)]">
                        {prog.organization}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm leading-snug text-[var(--fg)]">
                      {prog.title ?? UNTITLED_PROGRAM}
                    </p>
                  </div>
                ))}
              </div>

              {/* Связанные дисциплины в созвездии */}
              {connectedTopics.length > 0 && (
                <div className="mt-5 border-t border-[var(--line)] pt-4">
                  <span className="block font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-[var(--fg-mute)]">
                    СВЯЗАННЫЕ НАПРАВЛЕНИЯ В СОЗВЕЗДИИ:
                  </span>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {connectedTopics.map((ct) => (
                      <button
                        key={ct.id}
                        type="button"
                        onClick={() => ui.set({ focusTopic: ct.id })}
                        className="rounded-full border border-[var(--line)] bg-white/[0.07] px-3 py-1 font-mono text-[11px] tracking-wider text-[var(--fg)] transition-colors hover:border-[#C5B89A] hover:bg-[#C5B89A]/25"
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

        {/* Нижняя клавиатурно-доступная матрица всех 14 сфер созвездия */}
        <div className="border-t border-[var(--line)] pt-5">
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
