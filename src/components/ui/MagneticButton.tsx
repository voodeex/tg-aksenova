"use client";

import { useRef } from "react";
import { useUI } from "@/lib/store";

type Props = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "solid" | "glass" | "outline";
  cursorLabel?: "OPEN" | "EXPLORE" | "DRAG";
  className?: string;
  ariaLabel?: string;
  arrow?: boolean;
};

/**
 * Магнитная кнопка / ссылка с плавным притяжением к курсору,
 * жидкостеклянным бликом, анимированной стрелкой ↗ и тактильным нажатием.
 */
export function MagneticButton({
  children,
  href,
  onClick,
  variant = "glass",
  cursorLabel = "OPEN",
  className = "",
  ariaLabel,
  arrow = true,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useUI("reducedMotion");
  const touch = useUI("touch");

  const handleMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduced || touch || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    ref.current.style.transform = `translate3d(${dx * 0.24}px, ${dy * 0.28}px, 0)`;
  };

  const handleLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = "translate3d(0px, 0px, 0)";
  };

  const baseStyles =
    "group relative inline-flex items-center justify-center gap-3 rounded-full px-6 py-3.5 font-mono text-xs tracking-[0.16em] uppercase transition-[background-color,border-color,color,box-shadow,transform] duration-300 ease-out active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C5B89A]";

  const variantStyles = {
    solid:
      "bg-[#171717] text-[#F4F2EC] border border-[#171717] hover:bg-[#2A2825] hover:border-[#C5B89A]/60 shadow-[0_12px_34px_rgba(23,23,23,0.18)]",
    glass:
      "liquid-glass-pill text-[var(--fg)] hover:border-[#C5B89A]/75 hover:shadow-[0_14px_40px_rgba(197,184,154,0.22)]",
    outline:
      "border border-[var(--line)] bg-transparent text-[var(--fg)] hover:border-[#C5B89A] hover:bg-[#C5B89A]/12",
  }[variant];

  const content = (
    <>
      <span className="relative z-10">{children}</span>
      {arrow && (
        <span
          className="relative z-10 inline-block transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden="true"
        >
          ↗
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        onClick={onClick}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        data-cursor={cursorLabel}
        aria-label={ariaLabel}
        className={`${baseStyles} ${variantStyles} ${className}`}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type="button"
      onClick={onClick}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      data-cursor={cursorLabel}
      aria-label={ariaLabel}
      className={`${baseStyles} ${variantStyles} ${className}`}
    >
      {content}
    </button>
  );
}
