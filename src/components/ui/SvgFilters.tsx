"use client";

/**
 * SVG-фильтры оптического преломления для жидкостеклянных капсул (Apple Liquid Glass).
 */
export function SvgFilters() {
  return (
    <svg
      className="pointer-events-none fixed h-0 w-0 opacity-0"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <filter id="liquid-glass-refract" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.014 0.022"
            numOctaves="2"
            seed="7"
            result="noise"
          />
          <feGaussianBlur in="noise" stdDeviation="1.5" result="smoothNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="smoothNoise"
            scale="5"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}
