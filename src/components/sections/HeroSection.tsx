"use client";

import { profile } from "@/data/profile";
import { scrollToTarget } from "@/lib/engine";
import { useUI } from "@/lib/store";
import { MagneticButton } from "@/components/ui/MagneticButton";

/**
 * Главный экран (Секции 5 и 6):
 * На десктопе — асимметричная редакционная сетка вокруг центральной 3D-скульптуры.
 * На iPhone — выделенная открытая витрина сверху для касания и вращения 3D-скульптуры пальцем,
 * за которой следуют чистый заголовок и жидкостеклянная карточка без наложений.
 */
export function HeroSection() {
  const introDone = useUI("introDone");

  return (
    <section
      id="home"
      aria-label="Главный экран"
      className="relative z-10 min-h-[100svh] w-full lg:min-h-[155vh]"
    >
      <div className="flex min-h-[100svh] w-full flex-col justify-between px-4 pt-20 pb-6 sm:px-6 md:px-12 md:pt-28 md:pb-12 lg:sticky lg:top-0 lg:min-h-screen">
        {/* Верхняя техническая панель */}
        <div
          className={`mx-auto flex w-full max-w-[1440px] items-start justify-between border-b border-[var(--line)] pb-3 transition-all duration-500 md:pb-4 ${
            introDone ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-[var(--fg-mute)] sm:text-[11px]">
              [ 01 / 06 ] · ACADEMIC PROFILE
            </span>
            <span className="font-mono text-[10px] font-medium tracking-[0.14em] uppercase text-[var(--fg)] sm:text-[11px]">
              (ОБРАЗОВАНИЕ БУДУЩЕГО)
            </span>
          </div>

          <div className="hidden max-w-xs text-right font-mono text-[11px] leading-relaxed tracking-[0.12em] uppercase text-[var(--fg-mute)] md:block">
            {profile.college} · {profile.university}
          </div>
        </div>

        {/* Открытое окно для 3D-скульптуры на iPhone (вращается пальцем, не перекрывает заголовок) */}
        <div
          aria-hidden="true"
          className="relative flex h-[175px] w-full items-end justify-end sm:h-[210px] lg:hidden"
        >
          <span className="rounded-full border border-[var(--line)] bg-white/45 px-2.5 py-1 font-mono text-[9px] font-medium tracking-[0.16em] uppercase text-[var(--fg-mute)] backdrop-blur-md">
            3D · ВРАЩАЙТЕ ПАЛЬЦЕМ
          </span>
        </div>

        {/* Центральная и нижняя сетка */}
        <div className="mx-auto my-auto grid w-full max-w-[1440px] grid-cols-1 items-end gap-5 py-2 sm:gap-7 md:py-6 lg:grid-cols-12 lg:gap-8">
          {/* Левая колонка — монументальный заголовок */}
          <div
            className={`lg:col-span-7 transition-all duration-500 delay-75 ${
              introDone ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
            }`}
          >
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/60 px-3 py-1 backdrop-blur-md sm:mb-4 sm:px-3.5 sm:py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C5B89A]" />
              <span className="font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-[var(--fg)]">
                DIGITAL PORTFOLIO / 2026
              </span>
            </div>

            <h1 className="text-halo font-sans text-[clamp(2.05rem,8.8vw,6.15rem)] leading-[0.95] font-semibold tracking-[-0.04em] uppercase text-[var(--fg)]">
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
            <div className="liquid-glass-surface w-full max-w-md rounded-[1.75rem] p-5 sm:rounded-3xl sm:p-6 md:p-7">
              <div className="mb-2.5 flex items-center justify-between gap-2 font-mono text-[10px] font-medium tracking-[0.16em] uppercase text-[var(--fg-mute)] sm:mb-3 sm:tracking-[0.2em]">
                <span>( A )</span>
                <span className="whitespace-nowrap">[ К.П.Н. · ВЫСШАЯ КАТЕГОРИЯ ]</span>
              </div>

              <p className="text-lg font-semibold tracking-tight text-[var(--fg)] sm:text-xl md:text-2xl">
                {profile.fullName}
              </p>

              <p className="mt-1.5 text-sm font-medium leading-relaxed text-[var(--fg)]/85 sm:mt-2 sm:text-[15px]">
                {profile.degree}
                <br />
                {profile.title}
              </p>

              <p className="mt-3 border-t border-[var(--line)] pt-3 text-xs font-medium leading-relaxed text-[var(--fg-mute)] sm:mt-3.5 sm:pt-3.5 sm:text-[13px]">
                {profile.institution}
              </p>

              <div className="mt-5 flex items-center sm:mt-6">
                <MagneticButton
                  variant="solid"
                  cursorLabel="EXPLORE"
                  className="w-full sm:w-auto"
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
          className={`mx-auto mt-4 flex w-full max-w-[1440px] items-center justify-between gap-3 border-t border-[var(--line)] pt-3.5 font-mono text-[10px] tracking-[0.16em] uppercase text-[var(--fg-mute)] transition-opacity duration-500 delay-150 sm:mt-0 sm:pt-4 sm:tracking-[0.22em] ${
            introDone ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="hidden sm:inline">
            ИНТЕРАКТИВНАЯ 3D-СКУЛЬПТУРА · НАВЕДИТЕ ИЛИ ВРАЩАЙТЕ
          </span>
          <span className="sm:hidden">ИНТЕРАКТИВНАЯ 3D-СЦЕНА</span>
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
