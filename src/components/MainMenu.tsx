import React, { useEffect } from 'react';
import { Users, Swords, BookOpen, Lock, Volume2, VolumeX } from 'lucide-react';
import { soundManager } from '../services/soundManager';
import { PikachuCompanion } from './PikachuCompanion';

interface MainMenuProps {
  onSelectSolo: () => void;
  onSelectPvP: () => void;
  onSelectAlbum: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onSelectSolo,
  onSelectPvP,
  onSelectAlbum
}) => {
  const [bgmMuted, setBgmMuted] = React.useState(soundManager.isBgmMuted());

  useEffect(() => {
    soundManager.playBgm('menu');
    soundManager.speakText('Hallo Levi! Was möchtest du heute spielen?');
  }, []);

  const toggleSound = () => {
    const next = soundManager.toggleBgmMute();
    setBgmMuted(next);
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden flex flex-col justify-between p-4 sm:p-6 select-none">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/70 via-slate-900 to-slate-950 pointer-events-none" />
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-amber-400 bg-slate-900 p-1 flex items-center justify-center shadow-lg">
            <img src="/images/trainers/levi.png" alt="Levi" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-300 uppercase tracking-widest block">
              Pokémontrainer
            </span>
            <span className="text-xl font-black text-white drop-shadow">Levi</span>
          </div>
        </div>

        <button
          onClick={toggleSound}
          className="p-3 rounded-full bg-slate-900/80 border-2 border-slate-700 text-amber-300 hover:text-white shadow-xl transition-transform active:scale-90"
        >
          {bgmMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Center: 3 Big Visual Tiles */}
      <div className="relative z-10 w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 px-2">
        {/* Tile 1: Allein kämpfen */}
        <div
          onClick={() => {
            soundManager.playSfx('button');
            onSelectSolo();
          }}
          className="group relative h-48 sm:h-64 rounded-3xl border-3 border-amber-400/80 bg-gradient-to-b from-slate-900/90 via-amber-950/30 to-slate-900/90 p-5 flex flex-col items-center justify-between text-center cursor-pointer shadow-xl hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] transition-all duration-300 transform hover:-translate-y-2 active:scale-95"
        >
          <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 border-3 border-white p-2 shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <Swords className="w-12 h-12 sm:w-16 sm:h-16 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white group-hover:text-amber-300 transition-colors">
              Allein kämpfen
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-bold">
              Gegen die 8 Arenaleiter
            </p>
          </div>
        </div>

        {/* Tile 2: Mit Papa spielen */}
        <div
          onClick={() => {
            soundManager.playSfx('button');
            onSelectPvP();
          }}
          className="group relative h-48 sm:h-64 rounded-3xl border-3 border-sky-400/80 bg-gradient-to-b from-slate-900/90 via-sky-950/30 to-slate-900/90 p-5 flex flex-col items-center justify-between text-center cursor-pointer shadow-xl hover:shadow-[0_0_30px_rgba(56,189,248,0.5)] transition-all duration-300 transform hover:-translate-y-2 active:scale-95"
        >
          <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-sky-400 to-cyan-300 border-3 border-white p-2 shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users className="w-12 h-12 sm:w-16 sm:h-16 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white group-hover:text-sky-300 transition-colors">
              Mit Papa spielen
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-bold">
              Am Tisch gegenüber
            </p>
          </div>
        </div>

        {/* Tile 3: Meine Karten (Album - Locked Milestone 2 Preview) */}
        <div
          onClick={() => {
            soundManager.playSfx('button');
            soundManager.speakText('Dein Sammelalbum öffnet sich mit Meilenstein 2! Gewinne Kämpfe, um Booster zu sammeln!');
            onSelectAlbum();
          }}
          className="group relative h-48 sm:h-64 rounded-3xl border-3 border-purple-400/50 bg-gradient-to-b from-slate-900/70 via-purple-950/20 to-slate-900/70 p-5 flex flex-col items-center justify-between text-center cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(192,132,252,0.4)] transition-all duration-300 transform hover:-translate-y-1 active:scale-95"
        >
          <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-slate-800 border-2 border-purple-400/60 p-2 shadow-md flex items-center justify-center">
            <BookOpen className="w-10 h-10 sm:w-14 sm:h-14 text-purple-300" />
            <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center shadow">
              <Lock className="w-4 h-4 text-slate-950" />
            </div>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white/90">
              Meine Karten
            </h2>
            <p className="text-xs sm:text-sm text-amber-300 font-bold">
              Sammelalbum (Bald da!)
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Pikachu Companion */}
      <div className="relative z-20 flex justify-center pb-2">
        <PikachuCompanion
          promptText="Tippe auf eine Kachel, um loszulegen!"
          emotion="happy"
        />
      </div>
    </div>
  );
};
