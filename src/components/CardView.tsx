import React, { useRef } from 'react';
import { Card, InPlayPokemon, PokemonType } from '../types/game';
import { EnergyBadge, typeConfig } from './EnergyBadge';
import { soundManager } from '../services/soundManager';
import { Sparkles, ShieldAlert, Heart } from 'lucide-react';

interface CardViewProps {
  card: Card;
  inPlay?: InPlayPokemon | null;
  size?: 'hand' | 'bench' | 'active' | 'preview';
  isSelectable?: boolean;
  isSelected?: boolean;
  isOpponent?: boolean;
  canAttack?: boolean;
  usableAttackIndices?: number[];
  onSelect?: () => void;
  onAttack?: (attackIndex: number) => void;
  onInspect?: () => void;
  className?: string;
}

export const CardView: React.FC<CardViewProps> = ({
  card,
  inPlay,
  size = 'hand',
  isSelectable = false,
  isSelected = false,
  isOpponent = false,
  canAttack = false,
  usableAttackIndices = [],
  onSelect,
  onAttack,
  onInspect,
  className = ''
}) => {
  const primaryType: PokemonType = card.types[0] || 'Farblos';
  const typeStyle = typeConfig[primaryType] || typeConfig.Farblos;

  const pressTimer = useRef<number | null>(null);

  const handlePointerDown = () => {
    pressTimer.current = window.setTimeout(() => {
      if (onInspect) {
        onInspect();
      }
    }, 450); // Long-press opens inspector
  };

  const handlePointerUp = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Play card cry and name sound
    soundManager.playCry(card.dexId);
    soundManager.playSfx('card_play');
    if (onSelect) {
      onSelect();
    }
  };

  // Dimensions based on size
  const dimensionClasses = {
    hand: 'w-24 sm:w-28 md:w-32 aspect-[5/7] text-xs',
    bench: 'w-20 sm:w-24 md:w-28 aspect-[5/7] text-xs',
    active: 'w-36 sm:w-44 md:w-52 aspect-[5/7] text-sm',
    preview: 'w-64 sm:w-72 md:w-80 aspect-[5/7] text-base'
  }[size];

  // HP calculation
  const currentHp = inPlay ? inPlay.currentHp : card.hp;
  const maxHp = card.hp;
  const hpPercent = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));
  const hpBarColor =
    hpPercent > 50
      ? 'bg-emerald-500'
      : hpPercent > 20
      ? 'bg-amber-400'
      : 'bg-rose-500 animate-pulse';

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={handleClick}
      style={{ touchAction: 'manipulation', WebkitUserSelect: 'none', userSelect: 'none' }}
      className={`relative group rounded-2xl flex flex-col justify-between overflow-hidden cursor-pointer transition-all duration-200 transform select-none ${dimensionClasses} ${
        isSelectable
          ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-slate-900 scale-105 shadow-[0_0_20px_rgba(251,191,36,0.8)] z-20'
          : ''
      } ${
        isSelected
          ? 'ring-4 ring-cyan-400 ring-offset-2 ring-offset-slate-900 scale-105 shadow-[0_0_20px_rgba(34,211,238,0.9)] z-30'
          : 'shadow-lg hover:shadow-xl'
      } ${card.isEx ? 'border-2 border-amber-300' : 'border border-slate-700/60'} ${
        isOpponent ? 'opacity-95' : ''
      } ${className}`}
    >
      {/* Background Foil / Type Gradient */}
      <div className={`absolute inset-0 ${typeStyle.bg} opacity-25`} />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/90 to-slate-950/40" />

      {/* Holographic Sheen for EX cards */}
      {card.isEx && (
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-200/20 to-transparent pointer-events-none animate-pulse" />
      )}

      {/* Card Header: Stage, Name, HP, Type */}
      <div className="relative z-10 px-2 pt-1.5 flex items-center justify-between gap-1">
        <div className="flex items-center gap-1 min-w-0">
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-300 truncate">
            {card.stage}
          </span>
          <span className="font-extrabold text-white truncate text-xs sm:text-sm drop-shadow">
            {card.name}
          </span>
          {card.isEx && (
            <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-[9px] font-black px-1 rounded-sm shadow">
              EX
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span className="font-black text-xs sm:text-sm text-emerald-300 drop-shadow">
            {currentHp}
          </span>
          <span className="text-[9px] text-slate-400">KP</span>
          <EnergyBadge type={primaryType} size="sm" />
        </div>
      </div>

      {/* HP Bar (inPlay only) */}
      {inPlay && (
        <div className="relative z-10 mx-2 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
          <div
            className={`h-full transition-all duration-300 ${hpBarColor}`}
            style={{ width: `${hpPercent}%` }}
          />
        </div>
      )}

      {/* Official Artwork */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-1 overflow-hidden">
        <img
          src={card.artworkUrl}
          alt={card.name}
          className="w-full h-full object-contain filter drop-shadow-[0_8px_10px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          decoding="async"
        />

        {/* Attached Energy Badges Overlaid at bottom-left of artwork */}
        {inPlay && inPlay.attachedEnergy.length > 0 && (
          <div className="absolute bottom-1 left-1.5 flex flex-wrap gap-0.5 bg-slate-950/80 backdrop-blur-sm p-1 rounded-lg border border-amber-400/50 shadow-md z-20">
            {inPlay.attachedEnergy.map((eType, idx) => (
              <EnergyBadge key={idx} type={eType} size="sm" />
            ))}
          </div>
        )}
      </div>

      {/* Attacks Section */}
      <div className="relative z-10 px-1.5 pb-2 pt-1 bg-slate-950/70 backdrop-blur-sm border-t border-slate-800/80 space-y-1">
        {card.attacks.slice(0, size === 'bench' ? 1 : 2).map((atk, idx) => {
          const isAttackUsable = usableAttackIndices.includes(idx) && canAttack && !isOpponent;

          return (
            <div
              key={idx}
              onClick={(e) => {
                if (isAttackUsable && onAttack) {
                  e.stopPropagation();
                  onAttack(idx);
                }
              }}
              className={`flex items-center justify-between px-1.5 py-1 rounded-lg transition-all ${
                isAttackUsable
                  ? 'bg-gradient-to-r from-amber-500/30 to-orange-500/40 border border-amber-400/80 cursor-pointer shadow-[0_0_12px_rgba(251,191,36,0.5)] hover:scale-102 active:scale-98 animate-pulse'
                  : 'bg-slate-900/40'
              }`}
            >
              {/* Cost icons */}
              <div className="flex items-center gap-0.5 shrink-0">
                {atk.cost.map((cType, cIdx) => (
                  <EnergyBadge key={cIdx} type={cType} size="sm" />
                ))}
              </div>

              {/* Attack name */}
              <span className="font-bold text-slate-200 truncate text-[11px] sm:text-xs px-1">
                {atk.name}
              </span>

              {/* Damage badge */}
              <div className="flex items-center gap-0.5 shrink-0">
                <span
                  className={`font-black text-xs sm:text-sm px-1.5 py-0.5 rounded ${
                    isAttackUsable
                      ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                      : 'text-amber-300'
                  }`}
                >
                  {atk.damage}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
