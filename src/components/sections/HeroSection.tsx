"use client";

import { profile } from "@/data/profile";
import { scrollToTarget } from "@/lib/engine";
import { useUI } from "@/lib/store";
import { MagneticButton } from "@/components/ui/MagneticButton";

/**
 * Главный экран (Секции 5 и 6):
 * Асимметричная редакционная композиция в духе IRIS AI и швейцарской типографики,
 * обрамляющая центральную интерактивную 3D-скульптуру.
 */
export function HeroSection() {
  const introDone = useUI("introDone");

  return (
    <section
      id="home"
      aria-label="Главный экран"
      className="relative z-10 min-h-screen w-full lg:min-h-[155vh]"
    >
      <div className="flex min-h-screen w-full flex-col justify-between px-5 pt-22 pb-7 md:px-12 md:pt-28 md:pb-12 lg:sticky lg:top-0">
        {/* Верхняя техническая панель */}
        <div
          className={`mx-auto flex w-full max-w-[1440px] items-start justify-between border-b border-[var(--line)] pb-4 transition-all duration-500 ${
            introDone ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[var(--fg-mute)]">
              [ 01 / 06 ] · ACADEMIC PROFILE
            </span>
            <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--fg)]">
              (ОБРАЗОВАНИЕ БУДУЩЕГО)
            </span>
          </div>

          <div className="hidden max-w-xs text-right font-mono text-[11px] leading-relaxed tracking-[0.12em] uppercase text-[var(--fg-mute)] md:block">
            {profile.college} · {profile.university}
          </div>
        </div>

        {/* Центральная и нижняя асимметричная сетка вокруг 3D-скульптуры */}
        <div className="mx-auto my-auto grid w-full max-w-[1440px] grid-cols-1 items-end gap-8 py-6 lg:grid-cols-12">
          {/* Левая колонка — монументальный заголовок */}
          <div
            className={`lg:col-span-7 transition-all duration-500 delay-75 ${
              introDone ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
            }`}
          >
            <div className="mb-4 inline-flex items-center gap-2.5 rounded-full border border-[var(--line)] bg-white/25 px-3.5 py-1.5 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C5B89A]" />
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--fg)]">
                DIGITAL PORTFOLIO / 2026
              </span>
            </div>

            <h1 className="text-halo font-sans text-[clamp(2.05rem,9vw,6.15rem)] leading-[0.95] font-semibold tracking-[-0.04em] uppercase text-[var(--fg)]">
              <span className="block">ОБРАЗОВАНИЕ</span>
              <span className="block pl-[2%] text-[#524A3E] italic font-medium sm:pl-[4%]">
                ЗА ПРЕДЕЛАМИ
              </span>
              <span className="block pl-[4%] sm:pl-[8%]">ПРИВЫЧНОГО.</span>
            </h1>
          </div>

          {/* Правая колонка — карточка владельца сайта и кнопка исследования */}
          <div
            className={`lg:col-span-5 lg:justify-self-end transition-all duration-500 delay-100 ${
              introDone ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
            }`}
          >
            <div className="liquid-glass-surface max-w-md rounded-3xl p-6 md:p-7">
              <div className="mb-3 flex items-center justify-between font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--fg-mute)]">
                <span>( A )</span>
                <span>[ К.П.Н. · ВЫСШАЯ КАТЕГОРИЯ ]</span>
              </div>

              <p className="text-xl font-semibold tracking-tight text-[var(--fg)] md:text-2xl">
                {profile.fullName}
              </p>

              <p className="mt-2 text-[15px] font-medium leading-relaxed text-[var(--fg)]/85">
                {profile.degree}
                <br />
                {profile.title}
              </p>

              <p className="mt-3.5 border-t border-[var(--line)] pt-3.5 text-[13px] font-medium leading-relaxed text-[var(--fg-mute)]">
                {profile.institution}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <MagneticButton
                  variant="solid"
                  cursorLabel="EXPLORE"
                  onClick={() => scrollToTarget("about")}
                >
                  ИССЛЕДОВАТЬ САЙТ
                </MagneticButton>
              </div>
            </div>
          </div>
        </div>

        {/* Нижняя строка состояния и подсказка прокрутки */}
        <div
          className={`mx-auto flex w-full max-w-[1440px] items-center justify-between gap-3 border-t border-[var(--line)] pt-4 font-mono text-[10px] tracking-[0.16em] uppercase text-[var(--fg-mute)] transition-opacity duration-500 delay-150 sm:tracking-[0.22em] ${
            introDone ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="hidden sm:inline">ИНТЕРАКТИВНАЯ 3D-СКУЛЬПТУРА · НАВЕДИТЕ ИЛИ ВРАЩАЙТЕ</span>
          <span className="sm:hidden">3D-СЦЕНА · ПОРТФОЛИО</span>
          <button
            type="button"
            onClick={() => scrollToTarget("about")}
            data-cursor="EXPLORE"
            className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[var(--fg)] transition-opacity hover:opacity-70"
          >
            <span>SCROLL TO EXPLORE</span>
            <span aria-hidden="true">↓</span>
          </button>
        </div>
      </div>
    </section>
  );
}
