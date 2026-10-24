import React from 'react';
import { PokemonType } from '../types/game';
import { Flame, Droplets, Leaf, Zap, Eye, Shield, Sparkles, Circle } from 'lucide-react';

interface EnergyBadgeProps {
  type: PokemonType;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  count?: number;
  pulse?: boolean;
  className?: string;
}

export const typeConfig: Record<
  PokemonType,
  {
    bg: string;
    border: string;
    glow: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  Feuer: {
    bg: 'bg-gradient-to-br from-amber-500 via-orange-600 to-red-600',
    border: 'border-amber-300',
    glow: 'shadow-[0_0_15px_rgba(234,88,12,0.7)]',
    label: 'Feuer',
    icon: Flame
  },
  Wasser: {
    bg: 'bg-gradient-to-br from-sky-400 via-blue-600 to-cyan-700',
    border: 'border-cyan-200',
    glow: 'shadow-[0_0_15px_rgba(14,165,233,0.7)]',
    label: 'Wasser',
    icon: Droplets
  },
  Pflanze: {
    bg: 'bg-gradient-to-br from-lime-400 via-emerald-600 to-green-800',
    border: 'border-lime-200',
    glow: 'shadow-[0_0_15px_rgba(16,185,129,0.7)]',
    label: 'Pflanze',
    icon: Leaf
  },
  Elektro: {
    bg: 'bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600',
    border: 'border-yellow-100',
    glow: 'shadow-[0_0_15px_rgba(250,204,21,0.8)]',
    label: 'Elektro',
    icon: Zap
  },
  Psycho: {
    bg: 'bg-gradient-to-br from-pink-400 via-purple-600 to-indigo-800',
    border: 'border-pink-200',
    glow: 'shadow-[0_0_15px_rgba(168,85,247,0.7)]',
    label: 'Psycho',
    icon: Eye
  },
  Kampf: {
    bg: 'bg-gradient-to-br from-amber-700 via-orange-800 to-stone-800',
    border: 'border-amber-400',
    glow: 'shadow-[0_0_15px_rgba(180,83,9,0.6)]',
    label: 'Kampf',
    icon: Shield
  },
  Finsternis: {
    bg: 'bg-gradient-to-br from-slate-700 via-slate-900 to-zinc-950',
    border: 'border-slate-400',
    glow: 'shadow-[0_0_15px_rgba(71,85,105,0.7)]',
    label: 'Finsternis',
    icon: Circle
  },
  Metall: {
    bg: 'bg-gradient-to-br from-slate-300 via-slate-400 to-slate-600',
    border: 'border-slate-100',
    glow: 'shadow-[0_0_15px_rgba(148,163,184,0.7)]',
    label: 'Metall',
    icon: Sparkles
  },
  Drache: {
    bg: 'bg-gradient-to-br from-amber-500 via-yellow-600 to-emerald-700',
    border: 'border-amber-200',
    glow: 'shadow-[0_0_15px_rgba(217,119,6,0.7)]',
    label: 'Drache',
    icon: Sparkles
  },
  Farblos: {
    bg: 'bg-gradient-to-br from-slate-100 via-slate-200 to-slate-400 text-slate-800',
    border: 'border-white',
    glow: 'shadow-[0_0_10px_rgba(255,255,255,0.6)]',
    label: 'Farblos',
    icon: Sparkles
  }
};

export const EnergyBadge: React.FC<EnergyBadgeProps> = ({
  type,
  size = 'md',
  count,
  pulse = false,
  className = ''
}) => {
  const conf = typeConfig[type] || typeConfig.Farblos;
  const Icon = conf.icon;

  const sizeClasses = {
    sm: 'w-5 h-5 text-[10px]',
    md: 'w-7 h-7 text-xs',
    lg: 'w-10 h-10 text-sm',
    xl: 'w-14 h-14 text-base'
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  }[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full border-2 ${conf.bg} ${conf.border} text-white font-bold select-none shadow-md ${sizeClasses} ${
        pulse ? `animate-pulse ${conf.glow} scale-105` : ''
      } ${className}`}
      title={conf.label}
    >
      <Icon className={`${iconSizes} drop-shadow-sm`} />
      {count !== undefined && count > 1 && (
        <span className="absolute -bottom-1 -right-1 bg-slate-900 border border-white text-white text-[10px] rounded-full px-1 leading-none shadow">
          {count}
        </span>
      )}
    </div>
  );
};
