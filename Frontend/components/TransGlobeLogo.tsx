import React from 'react';

export interface TransGlobeEmblemProps {
  className?: string;
  size?: number | string;
}

/**
 * Precision vector brand mark for TransGlobe-Logistics:
 * High-altitude jet aircraft, dual orbital corridors (#FF8619, #DB7112),
 * and global transit arcs (#2595FF, #238AED) derived from assets/logo.svg.
 */
export function TransGlobeEmblem({ className = 'h-9 w-9' }: TransGlobeEmblemProps) {
  return (
    <svg
      viewBox="126 68 244 256"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="TransGlobe-Logistics Logo"
    >
      <g id="EMBLEM">
        {/* Orbiting Jet Aircraft */}
        <path
          fill="#2595FF"
          d="M284.237,78.02c-0.456,2.307,0.58,4.944,9.515,9.958c0.297,0.167,0.599,0.335,0.904,0.505l0.548,6.684l-0.664-0.417c-0.272-0.171-0.63-0.089-0.801,0.183l-0.366,0.583c-0.171,0.272-0.089,0.63,0.183,0.801l1.836,1.152l0.553,6.748l-0.407-0.256c-0.272-0.171-0.63-0.089-0.801,0.183l-0.366,0.583c-0.171,0.272-0.089,0.63,0.183,0.801l1.579,0.992l0.444,5.413l3.84,2.41l2.801-21.254c4.83,2.534,9.579,4.939,12.91,6.607l0.357,7.033l2.554,1.603l1.791-6.768l2.152,0.488l-1.375-1.726l5.317-4.554l-2.554-1.603l-6.488,2.735c-2.95-2.274-7.181-5.507-11.561-8.756l17.925-11.759l-3.84-2.41l-5.068,1.953l-1.579-0.992c-0.272-0.171-0.63-0.089-0.801,0.183l-0.366,0.583c-0.171,0.272-0.089,0.63,0.183,0.801l0.407,0.256l-6.318,2.434l-1.836-1.153c-0.272-0.171-0.63-0.089-0.801,0.183l-0.366,0.583c-0.171,0.272-0.089,0.63,0.183,0.801l0.663,0.416l-6.258,2.411c-0.285-0.201-0.568-0.399-0.847-0.595c-8.399-5.868-11.224-5.655-13.104-4.241C284.363,77.704,284.269,77.854,284.237,78.02z"
        />
        {/* Deep Amber / Rust Orbital Corridor */}
        <path
          fill="#DB7112"
          d="M330.863,122.23c-0.217,6.917-2.633,14.183-7.85,20.399c-11.15,13.316-36.216,24.733-76.481,39.082c-42.815,15.25-88.181,30.966-90.764,62.948c-4.55-11.533-7.083-24.083-7.083-37.216c0-55.965,45.365-101.33,101.313-101.33c2.017,0,4,0.067,5.983,0.183c25.149,1.467,47.815,12.116,64.748,28.632C324.696,132.263,329.113,128.113,330.863,122.23z"
        />
        {/* Solar Orange Swoosh Base */}
        <path
          fill="#FF8619"
          d="M229.549,319.857c-68.448-35.316-38.049-79.148,30.499-109.78C187.484,256.459,205.716,295.824,229.549,319.857z"
        />
        {/* Cobalt Transit Arc */}
        <path
          fill="#2595FF"
          d="M312.813,163.262c-0.6,0.517-1.233,1.017-1.867,1.533c-39.982,33.182-94.031,45.782-121.93,77.331c-21.566,24.399-14.35,41.432-10.683,47.948c-21.266-18.516-20.549-48.565,12.633-69.081C224.149,200.494,266.998,190.227,312.813,163.262z"
        />
        {/* High-Altitude Orbit Track */}
        <path
          fill="#FF8619"
          d="M330.863,122.23c-0.217,6.917-2.633,14.183-7.85,20.399c-11.15,13.316-36.216,24.733-76.481,39.082c-42.815,15.25-88.181,30.966-90.764,62.948c-4.55-11.533-7.083-24.083-7.083-37.216c0-55.965,45.365-101.33,101.313-101.33c2.017,0,4,0.067,5.983,0.183c-45.515,0.083-89.247,43.399-84.764,86.814c12.333-37.032,103.297-31.966,149.512-58.182C324.696,132.263,329.113,128.113,330.863,122.23z"
        />
        {/* Outer Globe Arc */}
        <path
          fill="#2595FF"
          d="M342.545,166.204c9.496-26.073,2.222-49.666-16.548-61.514c38.58,44.679-28.867,85.319-79.147,127.088c-26.155,21.728-30.606,57.771-3.481,71.611c8.275,4.222,17.832,5.167,26.935,3.315c46.223-9.404,81.011-50.266,81.011-99.265C351.315,192.75,348.173,178.801,342.545,166.204z"
        />
        {/* Core Meridian Sweep */}
        <path
          fill="#238AED"
          d="M342.545,166.204c-14.421,34.724-82.572,80.208-90.589,97.063c-12.34,25.944,21.489,36.595,47.847,17.021c-49.975-2.979,42.054-44.812,50.99-83.109"
        />
        {/* Equator Shadow Arc */}
        <path
          fill="#DB7112"
          d="M229.549,319.857c-59.015-46.515-24.116-77.164,30.499-109.78C187.484,256.459,205.716,295.824,229.549,319.857z"
        />
        {/* Forward Propulsion Trail */}
        <path
          fill="#238AED"
          d="M310.947,164.795c-39.982,33.182-94.031,45.782-121.93,77.331c-21.566,24.399-14.35,41.432-10.683,47.948C132.569,222.66,264.098,202.111,310.947,164.795z"
        />
      </g>
    </svg>
  );
}

export interface TransGlobeLogoProps {
  className?: string;
  emblemClassName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  theme?: 'dark' | 'light';
  slogan?: string;
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
 * Custom vector brand mark from assets/logo.svg + "TransGlobe" wordmark
 * + "GLOBAL FREIGHT & LOGISTICS" slogan
 */
export function TransGlobeLogo({
  className = '',
  emblemClassName = '',
  size = 'md',
  showText = true,
  theme = 'dark',
  slogan = 'GLOBAL FREIGHT & LOGISTICS',
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
              className={`font-sans font-bold tracking-tight leading-none ${cfg.title}`}
            >
              <span className="text-[#2595FF]">Trans</span>
              <span className={isDark ? 'text-white' : 'text-[#0F172A]'}>Globe</span>
            </span>
            <span className={`inline-block rounded-full bg-[#FF8619] shrink-0 ${cfg.dot}`}></span>
          </div>
          {slogan && (
            <span
              className={`font-mono uppercase tracking-widest font-semibold leading-tight ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              } ${cfg.sub}`}
            >
              {slogan}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default TransGlobeLogo;
