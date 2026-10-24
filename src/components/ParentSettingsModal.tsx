import React, { useState } from 'react';
import { X, Volume2, VolumeX, ShieldCheck, RotateCcw } from 'lucide-react';
import { soundManager } from '../services/soundManager';

interface ParentSettingsModalProps {
  onClose: () => void;
  onResetMatch: () => void;
  aiDifficulty: 'leicht' | 'schlau';
  onSetAiDifficulty: (d: 'leicht' | 'schlau') => void;
}

export const ParentSettingsModal: React.FC<ParentSettingsModalProps> = ({
  onClose,
  onResetMatch,
  aiDifficulty,
  onSetAiDifficulty
}) => {
  const [unlocked, setUnlocked] = useState(false);
  const [num1] = useState(Math.floor(Math.random() * 4) + 3);
  const [num2] = useState(Math.floor(Math.random() * 4) + 2);
  const [userAnswer, setUserAnswer] = useState('');
  const [errorMsg, setErrorMsg] = useState(false);

  const [muted, setMuted] = useState(soundManager.isMuted());
  const [vol, setVol] = useState(soundManager.getVolume());

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(userAnswer, 10) === num1 + num2) {
      setUnlocked(true);
      setErrorMsg(false);
    } else {
      setErrorMsg(true);
      setUserAnswer('');
    }
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    soundManager.setMuted(next);
  };

  const handleVolumeChange = (newVol: number) => {
    setVol(newVol);
    soundManager.setVolume(newVol);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-sm sm:max-w-md w-full bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 text-white"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-amber-400" />
          <h2 className="text-xl font-black text-amber-300">Eltern-Bereich</h2>
        </div>

        {!unlocked ? (
          <form onSubmit={handleVerify} className="space-y-4">
            <p className="text-sm text-slate-300">
              Bitte lösen, um in die Einstellungen zu gelangen:
            </p>
            <div className="bg-slate-800 p-4 rounded-2xl text-center">
              <span className="text-2xl font-black text-amber-400">
                {num1} + {num2} = ?
              </span>
            </div>

            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Antwort eingeben"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-center text-xl font-bold text-white focus:outline-none focus:border-amber-400"
              autoFocus
            />

            {errorMsg && (
              <p className="text-xs text-rose-400 font-bold text-center">
                Nicht ganz richtig. Bitte versuche es noch einmal!
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-base shadow"
            >
              Öffnen
            </button>
          </form>
        ) : (
          <div className="space-y-5">
            {/* Audio Settings */}
            <div className="space-y-2 bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">Lautstärke & Ton</span>
                <button
                  onClick={toggleMute}
                  className={`p-2 rounded-xl flex items-center gap-1.5 text-xs font-bold ${
                    muted ? 'bg-rose-500/20 text-rose-300 border border-rose-500' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500'
                  }`}
                >
                  {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span>{muted ? 'Stumm' : 'An'}</span>
                </button>
              </div>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={vol}
                disabled={muted}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* AI Difficulty */}
            <div className="space-y-2 bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700">
              <span className="font-bold text-sm block">Gegner-Stärke (KI)</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onSetAiDifficulty('leicht')}
                  className={`py-2 px-3 rounded-xl font-bold text-xs border ${
                    aiDifficulty === 'leicht'
                      ? 'bg-amber-400 text-slate-950 border-white'
                      : 'bg-slate-900 text-slate-300 border-slate-700'
                  }`}
                >
                  Leicht (Kinderfreundlich)
                </button>
                <button
                  onClick={() => onSetAiDifficulty('schlau')}
                  className={`py-2 px-3 rounded-xl font-bold text-xs border ${
                    aiDifficulty === 'schlau'
                      ? 'bg-amber-400 text-slate-950 border-white'
                      : 'bg-slate-900 text-slate-300 border-slate-700'
                  }`}
                >
                  Schlau (Normal)
                </button>
              </div>
            </div>

            {/* Rule Stage Display */}
            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 flex items-center justify-between">
              <div>
                <span className="font-bold text-sm block">Aktuelle Regelstufe</span>
                <span className="text-xs text-amber-300 font-semibold">Stufe 1: Mini-Kampf (Basis-Pokémon)</span>
              </div>
              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-black px-2 py-1 rounded-md">
                AKTIV
              </span>
            </div>

            {/* Reset Match */}
            <button
              onClick={() => {
                onResetMatch();
                onClose();
              }}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/40 font-bold text-sm flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Aktuelles Match abbrechen & neu wählen</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
