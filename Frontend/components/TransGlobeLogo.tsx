import React from 'react';

export interface TransGlobeEmblemProps {
  className?: string;
  size?: number | string;
}

/**
 * Precision vector brand mark for TransGlobe-Logistics:
 * Dark navy badge (#0F172A) + precision meridian globe (#94A3B8, #64748B)
 * + cobalt-blue global transit arc & sky-blue directional arrow (#2563EB, #38BDF8)
 */
export function TransGlobeEmblem({ className = 'h-9 w-9' }: TransGlobeEmblemProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="TransGlobe-Logistics Logo"
    >
      {/* Navy Badge Container */}
      <rect width="48" height="48" rx="10" fill="#0F172A" />
      <rect x="0.75" y="0.75" width="46.5" height="46.5" rx="9.25" stroke="#1E293B" strokeWidth="1.5" />

      {/* Outer Globe Circle */}
      <circle cx="24" cy="24" r="13" stroke="#94A3B8" strokeWidth="2" />

      {/* Vertical Meridian & Equator */}
      <ellipse cx="24" cy="24" rx="6.2" ry="13" stroke="#64748B" strokeWidth="1.6" />
      <line x1="11.5" y1="24" x2="36.5" y2="24" stroke="#64748B" strokeWidth="1.6" />

      {/* Cobalt Blue Global Transit Arc + Arrow */}
      <path
        d="M9 30.5C15.5 29.5 26.5 24.5 36.5 14.5"
        stroke="#2563EB"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M30.5 13.5H37.5V20.5"
        stroke="#38BDF8"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export interface TransGlobeLogoProps {
  className?: string;
  emblemClassName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  theme?: 'dark' | 'light';
}

const sizeConfig = {
  xs: {
    emblem: 'w-7 h-7',
    title: 'text-base',
    dot: 'w-1.5 h-1.5',
    sub: 'text-[8px] -mt-0.5',
    gap: 'gap-2',
  },
  sm: {
    emblem: 'w-9 h-9',
    title: 'text-lg sm:text-xl',
    dot: 'w-1.5 h-1.5',
    sub: 'text-[9px] -mt-0.5',
    gap: 'gap-2.5',
  },
  md: {
    emblem: 'w-11 h-11 sm:w-12 sm:h-12',
    title: 'text-2xl',
    dot: 'w-2 h-2',
    sub: 'text-[10px] -mt-1',
    gap: 'gap-3',
  },
  lg: {
    emblem: 'w-12 h-12 sm:w-14 sm:h-14',
    title: 'text-2xl sm:text-3xl',
    dot: 'w-2 h-2',
    sub: 'text-[11px] -mt-1',
    gap: 'gap-3.5',
  },
  xl: {
    emblem: 'w-16 h-16',
    title: 'text-3xl sm:text-4xl',
    dot: 'w-2.5 h-2.5',
    sub: 'text-xs -mt-1',
    gap: 'gap-4',
  },
};

/**
 * Full corporate logo lockup:
 * Custom vector brand mark + "TransGlobe" wordmark (Inter font-semibold 600)
 * + "TRANSGLOBE-LOGISTICS" subtitle (IBM Plex Mono tracking-widest)
 */
export function TransGlobeLogo({
  className = '',
  emblemClassName = '',
  size = 'md',
  showText = true,
  theme = 'dark',
}: TransGlobeLogoProps) {
  const cfg = sizeConfig[size] || sizeConfig.md;
  const isDark = theme === 'dark';

  return (
    <div className={`inline-flex items-center ${cfg.gap} select-none ${className}`}>
      {/* Precision Vector Emblem */}
      <div className="shrink-0 transition-transform duration-200">
        <TransGlobeEmblem className={emblemClassName || cfg.emblem} />
      </div>

      {/* Wordmark Lockup */}
      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-sans font-semibold tracking-tight leading-none ${
                isDark ? 'text-white' : 'text-slate-900'
              } ${cfg.title}`}
            >
              TransGlobe
            </span>
            <span className={`inline-block rounded-full bg-[#2563EB] shrink-0 ${cfg.dot}`}></span>
          </div>
          <span
            className={`font-mono uppercase tracking-widest font-semibold leading-tight ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            } ${cfg.sub}`}
          >
            TransGlobe-Logistics
          </span>
        </div>
      )}
    </div>
  );
}

export default TransGlobeLogo;
