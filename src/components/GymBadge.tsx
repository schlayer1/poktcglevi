import React from 'react';

export type BadgeType =
  | 'rocko'
  | 'misty'
  | 'majorbob'
  | 'erika'
  | 'koga'
  | 'sabrina'
  | 'pyro'
  | 'giovanni'
  | 'lorelei'
  | 'bruno'
  | 'agathe'
  | 'siegfried'
  | 'gary'
  | 'falk'
  | 'kai'
  | 'bianka'
  | 'jens'
  | 'hartwig'
  | 'jasmin'
  | 'norbert'
  | 'sandra';

interface GymBadgeProps {
  type: BadgeType;
  earned?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const badgeConfig: Record<
  BadgeType,
  { name: string; city: string; color: string; desc: string }
> = {
  rocko: { name: 'Felsorden', city: 'Marmoria City', color: '#78716c', desc: 'Gestein' },
  misty: { name: 'Quellorden', city: 'Azuria City', color: '#0ea5e9', desc: 'Wasser' },
  majorbob: { name: 'Donnerorden', city: 'Orania City', color: '#eab308', desc: 'Elektro' },
  erika: { name: 'Farborden', city: 'Prismania City', color: '#10b981', desc: 'Pflanze' },
  koga: { name: 'Seelenorden', city: 'Fuchsania City', color: '#ec4899', desc: 'Gift' },
  sabrina: { name: 'Sumpforden', city: 'Saffronia City', color: '#a855f7', desc: 'Psycho' },
  pyro: { name: 'Vulkanorden', city: 'Zinnoberinsel', color: '#f97316', desc: 'Feuer' },
  giovanni: { name: 'Erdorden', city: 'Vertania City', color: '#84cc16', desc: 'Boden' },
  lorelei: { name: 'Eis-Siegel', city: 'Indigo Plateau (Saal 1)', color: '#06b6d4', desc: 'Eis & Wasser' },
  bruno: { name: 'Kampf-Siegel', city: 'Indigo Plateau (Saal 2)', color: '#ea580c', desc: 'Kampf & Stein' },
  agathe: { name: 'Geist-Siegel', city: 'Indigo Plateau (Saal 3)', color: '#9333ea', desc: 'Geist & Gift' },
  siegfried: { name: 'Drachen-Siegel', city: 'Indigo Plateau (Saal 4)', color: '#dc2626', desc: 'Drachen-Kraft' },
  gary: { name: 'Champion-Pokal', city: 'Indigo Plateau (Thronsaal)', color: '#fbbf24', desc: 'Kanto-Meister' },
  falk: { name: 'Flügelorden', city: 'Viola City', color: '#38bdf8', desc: 'Flug' },
  kai: { name: 'Insektenorden', city: 'Azalea City', color: '#84cc16', desc: 'Käfer' },
  bianka: { name: 'Basisorden', city: 'Dukatia City', color: '#f472b6', desc: 'Normal' },
  jens: { name: 'Phantomorden', city: 'Teak City', color: '#818cf8', desc: 'Geist' },
  hartwig: { name: 'Faustorden', city: 'Anemonia City', color: '#ea580c', desc: 'Kampf' },
  jasmin: { name: 'Stahlorden', city: 'Oliviana City', color: '#94a3b8', desc: 'Stahl' },
  norbert: { name: 'Eisorden', city: 'Mahagonia City', color: '#06b6d4', desc: 'Eis' },
  sandra: { name: 'Drachenorden', city: 'Ebenholz City', color: '#6366f1', desc: 'Drache' }
};

export const GymBadge: React.FC<GymBadgeProps> = ({
  type,
  earned = false,
  size = 'md',
  className = ''
}) => {
  const conf = badgeConfig[type];

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full transition-transform select-none ${sizeClasses} ${
        earned
          ? 'drop-shadow-[0_0_12px_rgba(251,191,36,0.8)] scale-105'
          : 'opacity-30 grayscale'
      } ${className}`}
      title={`${conf.name} (${conf.city})`}
    >
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <defs>
          <radialGradient id={`badgeGrad_${type}`} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="40%" stopColor={conf.color} />
            <stop offset="100%" stopColor="#0f172a" />
          </radialGradient>
        </defs>

        {type === 'rocko' && (
          // Gray Octagon
          <polygon points="30,10 70,10 90,30 90,70 70,90 30,90 10,70 10,30" fill={`url(#badgeGrad_${type})`} stroke="#e2e8f0" strokeWidth="4" />
        )}
        {type === 'misty' && (
          // Blue Teardrop
          <path d="M 50,10 C 65,35 85,60 85,75 C 85,90 70,95 50,95 C 30,95 15,90 15,75 C 15,60 35,35 50,10 Z" fill={`url(#badgeGrad_${type})`} stroke="#bae6fd" strokeWidth="4" />
        )}
        {type === 'majorbob' && (
          // Golden 8-pointed Star
          <polygon points="50,5 60,35 90,30 68,55 85,85 50,70 15,85 32,55 10,30 40,35" fill={`url(#badgeGrad_${type})`} stroke="#fef08a" strokeWidth="4" />
        )}
        {type === 'erika' && (
          // Green Rainbow Flower
          <circle cx="50" cy="50" r="38" fill={`url(#badgeGrad_${type})`} stroke="#bbf7d0" strokeWidth="4" />
        )}
        {type === 'koga' && (
          // Pink Soul Heart
          <path d="M 50,25 C 50,15 35,10 25,20 C 15,30 20,50 50,85 C 80,50 85,30 75,20 C 65,10 50,15 50,25 Z" fill={`url(#badgeGrad_${type})`} stroke="#fbcfe8" strokeWidth="4" />
        )}
        {type === 'sabrina' && (
          // Purple Marsh Circle with eye
          <circle cx="50" cy="50" r="40" fill={`url(#badgeGrad_${type})`} stroke="#e9d5ff" strokeWidth="4" />
        )}
        {type === 'pyro' && (
          // Red Volcano Flame
          <path d="M 50,10 Q 75,40 65,65 Q 85,70 70,90 Q 50,95 30,90 Q 15,70 35,65 Q 25,40 50,10 Z" fill={`url(#badgeGrad_${type})`} stroke="#fed7aa" strokeWidth="4" />
        )}
        {type === 'giovanni' && (
          // Green Earth Feather
          <ellipse cx="50" cy="50" rx="30" ry="42" fill={`url(#badgeGrad_${type})`} stroke="#d9f99d" strokeWidth="4" />
        )}
        {type === 'lorelei' && (
          // Ice Crystal Diamond
          <polygon points="50,8 85,50 50,92 15,50" fill={`url(#badgeGrad_${type})`} stroke="#a5f3fc" strokeWidth="4" />
        )}
        {type === 'bruno' && (
          // Martial Cross
          <polygon points="38,15 62,15 62,38 85,38 85,62 62,62 62,85 38,85 38,62 15,62 15,38 38,38" fill={`url(#badgeGrad_${type})`} stroke="#ffedd5" strokeWidth="3" />
        )}
        {type === 'agathe' && (
          // Ghost Spirit Crescent
          <path d="M 50,15 A 35,35 0 1 0 75,75 A 28,28 0 1 1 50,15 Z" fill={`url(#badgeGrad_${type})`} stroke="#f3e8ff" strokeWidth="3" />
        )}
        {type === 'siegfried' && (
          // Dragon Claw Crest
          <polygon points="50,10 65,35 90,45 70,68 75,95 50,80 25,95 30,68 10,45 35,35" fill={`url(#badgeGrad_${type})`} stroke="#fecaca" strokeWidth="3" />
        )}
        {type === 'gary' && (
          // Golden Champion Trophy
          <path d="M 30,20 L 70,20 L 65,55 C 65,65 55,70 50,70 C 45,70 35,65 35,55 Z M 45,70 L 55,70 L 60,88 L 40,88 Z" fill={`url(#badgeGrad_${type})`} stroke="#fef08a" strokeWidth="4" />
        )}
        {type === 'falk' && (
          // Zephyr Wing
          <path d="M 30,85 C 20,60 25,25 65,15 C 60,40 50,60 75,70 C 55,80 40,85 30,85 Z" fill={`url(#badgeGrad_${type})`} stroke="#bae6fd" strokeWidth="3" />
        )}
        {type === 'kai' && (
          // Hive Beetle
          <path d="M 50,15 C 70,15 85,35 85,60 C 85,80 70,88 50,88 C 30,88 15,80 15,60 C 15,35 30,15 50,15 Z" fill={`url(#badgeGrad_${type})`} stroke="#bef264" strokeWidth="3" />
        )}
        {type === 'bianka' && (
          // Plain Diamond
          <polygon points="50,12 85,50 50,88 15,50" fill={`url(#badgeGrad_${type})`} stroke="#fbcfe8" strokeWidth="3" />
        )}
        {type === 'jens' && (
          // Fog Eye / Ghost
          <circle cx="50" cy="50" r="36" fill={`url(#badgeGrad_${type})`} stroke="#c7d2fe" strokeWidth="3" />
        )}
        {type === 'hartwig' && (
          // Storm Fist
          <polygon points="35,15 65,15 85,35 85,65 65,85 35,85 15,65 15,35" fill={`url(#badgeGrad_${type})`} stroke="#fdba74" strokeWidth="3" />
        )}
        {type === 'jasmin' && (
          // Mineral Steel
          <polygon points="50,10 80,30 80,70 50,90 20,70 20,30" fill={`url(#badgeGrad_${type})`} stroke="#e2e8f0" strokeWidth="3" />
        )}
        {type === 'norbert' && (
          // Glacier Ice
          <polygon points="50,12 85,75 15,75" fill={`url(#badgeGrad_${type})`} stroke="#a5f3fc" strokeWidth="3" />
        )}
        {type === 'sandra' && (
          // Rising Dragon
          <path d="M 50,10 Q 80,30 70,60 Q 90,80 50,90 Q 10,80 30,60 Q 20,30 50,10 Z" fill={`url(#badgeGrad_${type})`} stroke="#c7d2fe" strokeWidth="3" />
        )}
      </svg>
    </div>
  );
};
