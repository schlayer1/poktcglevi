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
  | 'gary';

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
  gary: { name: 'Champion-Pokal', city: 'Indigo Plateau', color: '#fbbf24', desc: 'Meister' }
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
        {type === 'gary' && (
          // Golden Champion Trophy
          <path d="M 30,20 L 70,20 L 65,55 C 65,65 55,70 50,70 C 45,70 35,65 35,55 Z M 45,70 L 55,70 L 60,88 L 40,88 Z" fill={`url(#badgeGrad_${type})`} stroke="#fef08a" strokeWidth="4" />
        )}
      </svg>
    </div>
  );
};
