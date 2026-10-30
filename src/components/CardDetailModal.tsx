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
  const [isSpeaking, setIsSpeaking] = React.useState<boolean>(false);

  React.useEffect(() => {
    // Autoplay authentic cry first, then smoothly introduce card details for Levi
    let isCancelled = false;
    setIsSpeaking(true);

    const timer = setTimeout(() => {
      soundManager.playCry(card.dexId, () => {
        if (!isCancelled) {
          setTimeout(() => {
            soundManager.playCardVoice(card, () => {
              if (!isCancelled) setIsSpeaking(false);
            });
          }, 200);
        }
      });
    }, 200);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
      soundManager.stopVoice();
    };
  }, [card]);

  const handleSpeak = () => {
    setIsSpeaking(true);
    soundManager.playCardVoice(card, () => {
      setIsSpeaking(false);
    });
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 p-safe animate-in fade-in duration-200 select-none overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-sm sm:max-w-md w-full my-auto overflow-visible"
      >
        {/* 3D Overlapping Close Button (Front Layer - Never clipped) */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 z-50 w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-tr from-rose-600 via-rose-500 to-rose-400 hover:from-rose-500 hover:to-rose-300 text-white border-3 border-white rounded-full flex items-center justify-center shadow-[0_8px_25px_rgba(0,0,0,0.75)] transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
          title="Schließen"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
        </button>

        {/* Modal Content Frame */}
        <div className="w-full max-h-[90dvh] bg-slate-900 border-3 border-amber-400 rounded-3xl p-3.5 sm:p-5 shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col items-center gap-3 sm:gap-4 overflow-y-auto overflow-x-hidden">
          {/* Header Title with Sound Button */}
          <div className="flex items-center justify-between w-full px-2 pr-6 sm:pr-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
              <h2 className="text-lg sm:text-2xl font-black text-amber-300 drop-shadow">
                {card.name}
              </h2>
            </div>

            <button
              onClick={handleSpeak}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs shadow transition-all active:scale-95 cursor-pointer ${
                isSpeaking
                  ? 'bg-amber-300 text-slate-950 scale-105 shadow-[0_0_15px_rgba(251,191,36,0.8)] animate-pulse'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
              }`}
            >
              <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-bounce' : ''}`} />
              <span>{isSpeaking ? 'Liest vor...' : 'Vorlesen'}</span>
            </button>
          </div>

          {/* 3D Holographic Card Stage */}
          <div className="relative w-full max-h-[50dvh] aspect-[5/7] flex items-center justify-center">
            <HoloCard card={card} interactive={true} className="w-full h-full" />
          </div>

          {/* Gyroscope / Drag Hint */}
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-amber-300/80 bg-slate-950/60 px-3 py-1 rounded-full border border-amber-400/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>Wische mit dem Finger für 3D-Glanz!</span>
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
    </div>
  );
};
