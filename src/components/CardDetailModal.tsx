import React from 'react';
import { Card } from '../types/game';
import { X, Volume2, Sparkles, Compass } from 'lucide-react';
import { soundManager } from '../services/soundManager';
import { HoloCard } from './HoloCard';

interface CardDetailModalProps {
  card: Card | null;
  onClose: () => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({ card, onClose }) => {
  if (!card) return null;

  const handleSpeak = () => {
    soundManager.playCry(card.dexId);
    const attackText = card.attacks
      .map((a) => `${a.name}: ${a.damage} Schaden`)
      .join('. ');
    soundManager.speakText(`${card.name}! ${card.hp} Kraftpunkte. Attacken: ${attackText}`);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-sm sm:max-w-md w-full bg-slate-900 border-2 border-amber-400 rounded-3xl p-5 shadow-2xl flex flex-col items-center gap-4"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-11 h-11 bg-rose-500 hover:bg-rose-600 text-white border-2 border-white rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90"
        >
          <X className="w-6 h-6 stroke-[3]" />
        </button>

        {/* Header Title with Sound Button */}
        <div className="flex items-center justify-between w-full px-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl sm:text-2xl font-black text-amber-300 drop-shadow">
              {card.name}
            </h2>
          </div>

          <button
            onClick={handleSpeak}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow active:scale-95 transition-transform"
          >
            <Volume2 className="w-4 h-4" />
            <span>Vorlesen</span>
          </button>
        </div>

        {/* 3D Holographic Card Stage */}
        <div className="relative w-full max-h-[62vh] aspect-[5/7] flex items-center justify-center">
          <HoloCard card={card} interactive={true} className="w-full h-full" />
        </div>

        {/* Gyroscope / Drag Hint */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300/80 bg-slate-950/60 px-3 py-1 rounded-full border border-amber-400/30">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span>Wische mit dem Finger oder neige dein Tablet für 3D-Glanz!</span>
        </div>

        {/* Quick Didactic Summary */}
        <div className="flex items-center justify-around w-full bg-slate-800/80 rounded-2xl py-2 px-4 border border-slate-700 text-sm">
          <div className="flex flex-col items-center">
            <span className="text-xs text-slate-400">Typ</span>
            <span className="font-extrabold text-amber-300">{card.types.join(' / ')}</span>
          </div>
          <div className="h-6 w-px bg-slate-700" />
          <div className="flex flex-col items-center">
            <span className="text-xs text-slate-400">Leben</span>
            <span className="font-extrabold text-emerald-400">{card.hp} KP</span>
          </div>
          <div className="h-6 w-px bg-slate-700" />
          <div className="flex flex-col items-center">
            <span className="text-xs text-slate-400">Stufe</span>
            <span className="font-extrabold text-sky-300">{card.stage}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
