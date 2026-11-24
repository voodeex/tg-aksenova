"use client";

import { useEffect, useRef, useState } from "react";
import { navItems } from "@/data/navigation";
import { profile } from "@/data/profile";
import { scrollToTarget } from "@/lib/engine";
import { useUI } from "@/lib/store";

/**
 * Парящая жидкостеклянная навигационная капсула (Apple Liquid Glass).
 * Мобильная шторка и полноэкранный размытый фон рендерятся вне трансформируемого контейнера,
 * поэтому fixed inset-0 полностью перекрывает весь экран без просвечивания фоновых заголовков.
 */
export function GlassNav() {
  const activeSection = useUI("activeSection");
  const compact = useUI("compactNav");
  const introDone = useUI("introDone");
  const reduced = useUI("reducedMotion");
  const touch = useUI("touch");

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const capsuleRef = useRef<HTMLElement>(null);

  const currentNav =
    navItems.find((item) => item.sections.includes(activeSection)) ?? navItems[0];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.preventDefault();
    setMobileOpen(false);
    scrollToTarget(target, { duration: 1.2 });
  };

  const handleCapsuleMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduced || touch || !capsuleRef.current) return;
    const rect = capsuleRef.current.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.035;
    const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.1;
    capsuleRef.current.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
  };

  const handleCapsuleLeave = () => {
    setHoveredId(null);
    if (!capsuleRef.current) return;
    capsuleRef.current.style.transform = "translate3d(0px, 0px, 0)";
  };

  return (
    <>
      {/* Полноэкранная матовая шторка под открытым мобильным меню */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
          className="mobile-drawer-scrim fixed inset-0 z-[55] lg:hidden"
        />
      )}

      {/* Мобильное раскрывающееся меню поверх полноэкранного scrim */}
      {mobileOpen && (
        <div
          id="mobile-glass-menu"
          role="dialog"
          aria-label="Мобильное меню навигации"
          className="mobile-glass-drawer fixed top-20 right-4 left-4 z-[60] rounded-3xl p-5 shadow-2xl lg:hidden"
        >
          <div className="mb-3 flex items-center justify-between border-b border-[var(--line)] pb-2.5 font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-[var(--fg-mute)]">
            <span>Навигация по экспозиции</span>
            <span>[ {currentNav.index} / 06 ]</span>
          </div>
          <ul className="grid gap-1.5">
            {navItems.map((item) => {
              const isActive = currentNav.id === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.target}`}
                    onClick={(e) => handleNavClick(e, item.target)}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3.5 font-mono text-xs tracking-[0.14em] uppercase transition-all ${
                      isActive
                        ? "bg-[#171717] font-semibold text-[#F5F2EB] shadow-sm"
                        : "nav-drawer-link font-medium"
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="text-[10px] opacity-70">[{item.index}]</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <header
        className={`fixed top-0 right-0 left-0 z-[65] flex justify-center px-4 transition-[padding,opacity] duration-500 ${
          compact ? "pt-3" : "pt-4 md:pt-6"
        } ${introDone ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <nav
          ref={capsuleRef}
          aria-label="Основная навигация"
          onPointerMove={handleCapsuleMove}
          onPointerLeave={handleCapsuleLeave}
          className={`liquid-glass-capsule relative flex items-center justify-between transition-all duration-400 ${
            compact
              ? "rounded-full px-3 py-1.5 md:px-4 md:py-2"
              : "rounded-full px-4 py-2 md:px-5 md:py-2.5"
          } w-full max-w-[960px]`}
        >
          {/* Монограмма / бренд */}
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, "home")}
            className="nav-brand flex items-center gap-2.5 rounded-full px-2 py-1 text-xs font-semibold tracking-tight transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C5B89A]"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-[#C5B89A] shadow-[0_0_12px_rgba(197,184,154,0.9)]" />
            <span className="font-mono text-[11px] tracking-[0.14em] uppercase">
              {profile.shortName}
            </span>
          </a>

          {/* Десктопные пункты меню */}
          <ul className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const isActive = currentNav.id === item.id;
              const isHovered = hoveredId === item.id;
              return (
                <li key={item.id} className="relative">
                  <a
                    href={`#${item.target}`}
                    onClick={(e) => handleNavClick(e, item.target)}
                    onPointerEnter={() => setHoveredId(item.id)}
                    aria-current={isActive ? "page" : undefined}
                    className={`relative z-10 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-mono text-[11px] tracking-[0.13em] uppercase transition-colors duration-250 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C5B89A] ${
                      isActive ? "font-semibold text-[#171717]" : "nav-link-idle"
                    }`}
                  >
                    {isActive && (
                      <span
                        className="absolute inset-0 -z-10 rounded-full bg-[#F5F2EB] shadow-[0_2px_14px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.95)]"
                        aria-hidden="true"
                      />
                    )}
                    {!isActive && isHovered && (
                      <span
                        className="absolute inset-0 -z-10 rounded-full bg-[#C5B89A]/25"
                        aria-hidden="true"
                      />
                    )}
                    <span>{item.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>

          {/* Индикатор секции / кнопка мобильного меню */}
          <div className="flex items-center gap-2">
            <span className="nav-counter hidden rounded-full border px-2.5 py-1 font-mono text-[10px] font-medium tracking-[0.18em] sm:inline-block">
              [ {currentNav.index} / 06 ]
            </span>

            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-glass-menu"
              aria-label={mobileOpen ? "Закрыть меню" : "Открыть меню"}
              className="nav-mobile-btn inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-[11px] font-medium tracking-[0.14em] uppercase transition-colors hover:border-[#C5B89A] lg:hidden"
            >
              <span>{mobileOpen ? "Закрыть" : "Меню"}</span>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#C5B89A]" />
            </button>
          </div>
        </nav>
      </header>
    </>
  );
}
