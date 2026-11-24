"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useUI } from "@/lib/store";

type Props = {
  lines: string[];
  as?: "h1" | "h2" | "h3" | "div" | "p";
  className?: string;
  lineClassName?: string;
  stagger?: number;
  delay?: number;
};

/**
 * Построчное раскрытие крупной редакционной типографики.
 * Защищено от повторного скрытия при ререндерах и гарантированно раскрывается
 * при попадании в область просмотра (как при скролле, так и при переходе по якорю).
 */
export function SplitReveal({
  lines,
  as: Tag = "h2",
  className = "",
  lineClassName = "",
  stagger = 0.06,
  delay = 0,
}: Props) {
  const containerRef = useRef<HTMLElement>(null);
  const playedRef = useRef(false);
  const reduced = useUI("reducedMotion");
  const linesKey = lines.join("|");

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const innerLines = el.querySelectorAll<HTMLElement>("[data-reveal-line]");
    if (!innerLines.length) return;

    if (reduced || playedRef.current) {
      gsap.set(innerLines, { yPercent: 0, opacity: 1 });
      return;
    }

    const reveal = () => {
      if (playedRef.current) return;
      playedRef.current = true;
      gsap.to(innerLines, {
        yPercent: 0,
        opacity: 1,
        duration: 0.72,
        delay,
        stagger,
        ease: "power3.out",
        overwrite: true,
      });
    };

    // Если элемент уже в кадре или выше текущей позиции скролла — показываем сразу
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 1.05) {
      gsap.set(innerLines, { yPercent: 24, opacity: 0 });
      reveal();
      return;
    }

    gsap.set(innerLines, { yPercent: 60, opacity: 0 });

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight) {
            reveal();
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.01, rootMargin: "80px 0px 80px 0px" },
    );

    io.observe(el);

    return () => {
      io.disconnect();
    };
  }, [linesKey, reduced, stagger, delay]);

  return (
    <Tag ref={containerRef as React.RefObject<never>} className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden py-[0.07em] -my-[0.05em]">
          <span
            data-reveal-line
            className={`block will-change-transform ${lineClassName}`}
          >
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}
