"use client";

import { profile, site } from "@/data/profile";
import { scrollToTarget } from "@/lib/engine";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { SplitReveal } from "@/components/ui/SplitReveal";
import { TiltCard } from "@/components/ui/TiltCard";

/**
 * Финальная секция «Контакты» (Секция 14):
 * Центральная 3D-скульптура возвращается в минималистичной кольцевой форме (z = −180),
 * освещение переходит в жемчужно-серебристую гамму, на переднем плане — крупная жидкостеклянная панель.
 */
export function ContactSection() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="relative z-10 flex min-h-screen w-full flex-col justify-between px-5 pt-28 pb-10 md:px-12 md:pt-36 md:pb-14"
    >
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] pb-4 font-mono text-[11px] tracking-[0.22em] uppercase text-[var(--fg-mute)]">
          <span>[ 06 / 06 ] · CONTACT &amp; DIALOGUE</span>
          <span>МОСКВА · ФИНУНИВЕРСИТЕТ</span>
        </div>

        <div className="grid grid-cols-1 items-end gap-12 lg:grid-cols-12">
          {/* Левая колонка — монументальный финальный заголовок */}
          <div className="lg:col-span-6">
            <SplitReveal
              as="h2"
              lines={["БУДУЩЕЕ", "НАЧИНАЕТСЯ", "С ДИАЛОГА."]}
              className="text-halo font-sans text-[clamp(2.4rem,5.8vw,5.4rem)] leading-[0.94] font-semibold tracking-[-0.038em] uppercase text-[var(--fg)]"
            />
          </div>

          {/* Правая колонка — крупная жидкостеклянная контактная панель */}
          <div className="lg:col-span-6">
            <TiltCard className="rounded-[2.2rem] p-7 md:p-11" intensity={4}>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] pb-4 font-mono text-[10px] font-medium tracking-[0.14em] uppercase text-[var(--fg-mute)] sm:tracking-[0.22em]">
                <span className="whitespace-nowrap">DIRECT CONTACT</span>
                <span className="whitespace-nowrap">[ ОФИЦИАЛЬНЫЕ КОНТАКТЫ ]</span>
              </div>

              <div className="mt-6">
                <h3 className="font-sans text-2xl font-semibold tracking-tight text-[var(--fg)] md:text-3xl">
                  {profile.fullName}
                </h3>
                <p className="mt-2 text-base font-medium leading-relaxed text-[var(--fg-mute)]">
                  {profile.college}
                  <br />
                  {profile.university}
                </p>
              </div>

              <dl className="mt-8 grid grid-cols-1 gap-6 border-y border-[var(--line)] py-6 sm:grid-cols-2">
                <div>
                  <dt className="font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--fg-mute)]">
                    Телефон
                  </dt>
                  <dd className="mt-1.5 font-mono text-base font-medium text-[var(--fg)] md:text-lg">
                    <a
                      href={profile.phoneHref}
                      data-cursor="OPEN"
                      className="transition-colors hover:text-[#6E6759] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C5B89A]"
                    >
                      {profile.phone}
                    </a>
                  </dd>
                </div>

                <div>
                  <dt className="font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--fg-mute)]">
                    Электронная почта
                  </dt>
                  <dd className="mt-1.5 font-mono text-base font-medium text-[var(--fg)] md:text-lg">
                    <a
                      href={profile.emailHref}
                      data-cursor="OPEN"
                      className="transition-colors hover:text-[#6E6759] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C5B89A]"
                    >
                      {profile.email}
                    </a>
                  </dd>
                </div>
              </dl>

              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <MagneticButton
                  href={profile.emailHref}
                  variant="solid"
                  cursorLabel="OPEN"
                >
                  НАПИСАТЬ ПИСЬМО
                </MagneticButton>

                <MagneticButton
                  href={profile.phoneHref}
                  variant="glass"
                  cursorLabel="OPEN"
                >
                  ПОЗВОНИТЬ
                </MagneticButton>
              </div>
            </TiltCard>
          </div>
        </div>
      </div>

      {/* Футер и анимированный возврат к началу */}
      <footer className="mx-auto mt-20 w-full max-w-[1440px] border-t border-[var(--line)] pt-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-1">
            <div className="font-mono text-xs font-medium tracking-[0.24em] uppercase text-[var(--fg)]">
              {site.footer} &nbsp;·&nbsp; © {site.year}
            </div>
            <p className="text-xs text-[var(--fg-mute)]">{site.disclaimer}</p>
          </div>

          <button
            type="button"
            onClick={() => scrollToTarget("home", { duration: 1.8 })}
            data-cursor="OPEN"
            className="group inline-flex items-center gap-3 rounded-full border border-[var(--line)] bg-white/25 px-5 py-2.5 font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--fg)] backdrop-blur-md transition-all hover:border-[#C5B89A] hover:bg-[#C5B89A]/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C5B89A]"
          >
            <span>НАВЕРХ</span>
            <span
              aria-hidden="true"
              className="inline-block transition-transform duration-300 group-hover:-translate-y-0.5"
            >
              ↑
            </span>
          </button>
        </div>
      </footer>
    </section>
  );
}
