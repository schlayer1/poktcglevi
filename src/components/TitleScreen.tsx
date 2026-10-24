import React, { useEffect } from 'react';
import { Sparkles, Play, Volume2, VolumeX } from 'lucide-react';
import { soundManager } from '../services/soundManager';

interface TitleScreenProps {
  onStart: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStart }) => {
  const [bgmMuted, setBgmMuted] = React.useState(soundManager.isBgmMuted());

  const handlePlayClick = () => {
    // Resume audio context and play fanfare
    soundManager.getAudioContext();
    soundManager.playSfx('button');
    soundManager.playCry(25); // Pikachu
    soundManager.playBgm('menu');
    onStart();
  };

  const toggleSound = () => {
    const next = soundManager.toggleBgmMute();
    setBgmMuted(next);
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden flex flex-col items-center justify-between p-4 sm:p-8 select-none">
      {/* Dynamic Background Atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-900/60 via-indigo-950/80 to-slate-950 pointer-events-none" />
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />

      {/* Floating Pokémon Cards in Background */}
      <div className="absolute -top-10 -left-10 w-44 sm:w-56 aspect-[5/7] rounded-3xl border-2 border-amber-400/30 bg-slate-900/40 rotate-12 blur-[1px] pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-48 sm:w-60 aspect-[5/7] rounded-3xl border-2 border-sky-400/30 bg-slate-900/40 -rotate-12 blur-[1px] pointer-events-none" />

      {/* Top Bar with Sound Toggle */}
      <div className="relative z-20 w-full flex items-center justify-end">
        <button
          onClick={toggleSound}
          className="p-3 rounded-full bg-slate-900/80 border-2 border-slate-700 text-amber-300 hover:text-white hover:bg-slate-800 shadow-xl transition-transform active:scale-90"
          title="Musik an/aus"
        >
          {bgmMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </button>
      </div>

      {/* Center: Heroic Logo & Starters Showcase */}
      <div className="relative z-10 flex flex-col items-center text-center gap-4 max-w-2xl">
        {/* Glowing Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 border-2 border-amber-400/50 shadow-[0_0_20px_rgba(251,191,36,0.4)]">
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-amber-300">
            Pokémon Trading Card Game
          </span>
        </div>

        {/* 3D-Look Title Logo */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-amber-400 to-orange-500 drop-shadow-[0_8px_16px_rgba(0,0,0,0.9)] tracking-tight">
          Levis Pokémon-Karten
        </h1>

        {/* 4 Starter Pokémon (Bisasam, Glumanda, Schiggy, Pikachu) */}
        <div className="flex items-center justify-center gap-2 sm:gap-6 my-2">
          {[
            { id: 1, name: 'Bisasam', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.5)]' },
            { id: 4, name: 'Glumanda', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.5)]' },
            { id: 7, name: 'Schiggy', glow: 'shadow-[0_0_20px_rgba(14,165,233,0.5)]' },
            { id: 25, name: 'Pikachu', glow: 'shadow-[0_0_25px_rgba(250,204,21,0.7)]' }
          ].map((mon) => (
            <div
              key={mon.id}
              className={`w-20 sm:w-28 md:w-32 aspect-square rounded-full p-2 bg-slate-900/60 border-2 border-white/20 backdrop-blur-sm flex items-center justify-center transform hover:scale-110 transition-transform ${mon.glow}`}
            >
              <img
                src={`/images/pokemon/${mon.id}.png`}
                alt={mon.name}
                className="w-full h-full object-contain filter drop-shadow"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Giant "SPIELEN!" Button at Bottom */}
      <div className="relative z-20 pb-4 sm:pb-8 w-full max-w-md">
        <button
          onClick={handlePlayClick}
          className="w-full py-5 px-8 rounded-3xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-2xl sm:text-3xl border-4 border-white shadow-[0_0_35px_rgba(251,191,36,0.9)] flex items-center justify-center gap-4 transition-transform active:scale-95 animate-bounce"
        >
          <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current" />
          <span>SPIELEN!</span>
        </button>
      </div>
    </div>
  );
};
