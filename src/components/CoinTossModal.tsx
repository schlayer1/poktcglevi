import React, { useState } from 'react';
import { X, Sparkles, RotateCw } from 'lucide-react';
import { PikachuCoin } from './PikachuCoin';
import { soundManager } from '../services/soundManager';

interface CoinTossModalProps {
  onClose: () => void;
  title?: string;
}

export const CoinTossModal: React.FC<CoinTossModalProps> = ({
  onClose,
  title = 'Münzwurf'
}) => {
  const [result, setResult] = useState<'heads' | 'tails' | null>(null);
  const [isFlipping, setIsFlipping] = useState<boolean>(true);

  const handleFlipEnd = (outcome: 'heads' | 'tails') => {
    setResult(outcome);
    setIsFlipping(false);
    if (outcome === 'heads') {
      soundManager.playVoice('coin_heads', 'Kopf! Pikachu bringt dir Glück!');
    } else {
      soundManager.playVoice('coin_tails', 'Zahl! Der Pokéball liegt oben!');
    }
  };

  const handleReroll = () => {
    setIsFlipping(true);
    setResult(null);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-safe animate-in fade-in duration-200 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-sm w-full max-h-[92dvh] bg-slate-900 border-2 border-amber-400 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col items-center gap-4 sm:gap-6 text-white my-auto overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-400" />
          <h2 className="text-xl sm:text-2xl font-black text-amber-300 drop-shadow">
            {title}
          </h2>
        </div>

        {/* 3D Pikachu Coin */}
        <div className="py-4">
          <PikachuCoin
            size="lg"
            isFlipping={isFlipping}
            onFlipEnd={handleFlipEnd}
            interactive={true}
            showLabel={true}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={handleReroll}
            disabled={isFlipping}
            className={`flex-1 py-3 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 border-2 transition-all ${
              isFlipping
                ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                : 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-white shadow-lg active:scale-95 cursor-pointer'
            }`}
          >
            <RotateCw className={`w-4 h-4 ${isFlipping ? 'animate-spin' : ''}`} />
            <span>Nochmal werfen</span>
          </button>

          <button
            onClick={onClose}
            className="py-3 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold text-sm"
          >
            Fertig
          </button>
        </div>
      </div>
    </div>
  );
};
