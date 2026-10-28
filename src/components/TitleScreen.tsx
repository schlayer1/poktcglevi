import React, { useState, useEffect } from 'react';
import { Sparkles, Play, Volume2, VolumeX, Info, Heart } from 'lucide-react';
import { soundManager } from '../services/soundManager';
import { storageService } from '../services/storageService';
import { ChangelogModal } from './ChangelogModal';
import { APP_BUILD_TAG } from '../data/changelog';

type StarterKey = 'bisasam' | 'glumanda' | 'schiggy' | 'pikachu';

interface StarterConfig {
  key: StarterKey;
  id: number;
  name: string;
  themeColor: string;
  glow: string;
  accentBg: string;
  splash: string;
}

const STARTERS: StarterConfig[] = [
  {
    key: 'bisasam',
    id: 1,
    name: 'Bisasam',
    themeColor: '#10b981',
    glow: 'shadow-[0_0_25px_rgba(16,185,129,0.8)] border-emerald-400',
    accentBg: 'from-emerald-950/80 via-slate-900/60 to-slate-950',
    splash: '/images/starters/splash_bisasam.webp'
  },
  {
    key: 'glumanda',
    id: 4,
    name: 'Glumanda',
    themeColor: '#f97316',
    glow: 'shadow-[0_0_25px_rgba(249,115,22,0.85)] border-orange-400',
    accentBg: 'from-orange-950/80 via-slate-900/60 to-slate-950',
    splash: '/images/starters/splash_glumanda.webp'
  },
  {
    key: 'schiggy',
    id: 7,
    name: 'Schiggy',
    themeColor: '#0ea5e9',
    glow: 'shadow-[0_0_25px_rgba(14,165,233,0.85)] border-sky-400',
    accentBg: 'from-sky-950/80 via-slate-900/60 to-slate-950',
    splash: '/images/starters/splash_schiggy.webp'
  },
  {
    key: 'pikachu',
    id: 25,
    name: 'Pikachu',
    themeColor: '#fbbf24',
    glow: 'shadow-[0_0_30px_rgba(251,191,36,0.95)] border-amber-300',
    accentBg: 'from-amber-950/80 via-slate-900/60 to-slate-950',
    splash: '/images/starters/splash_pikachu.webp'
  }
];

interface TitleScreenProps {
  onStart: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStart }) => {
  const [bgmMuted, setBgmMuted] = useState(soundManager.isBgmMuted());
  const [activeStarterKey, setActiveStarterKey] = useState<StarterKey>(() => storageService.getFavoriteStarter());
  const [showChangelog, setShowChangelog] = useState<boolean>(false);
  const profile = storageService.loadProfile([]);

  useEffect(() => {
    soundManager.playBgm('title');
  }, []);

  const activeStarter = STARTERS.find((s) => s.key === activeStarterKey) || STARTERS[3];

  const handleStarterSelect = (starter: StarterConfig) => {
    setActiveStarterKey(starter.key);
    storageService.setFavoriteStarter(starter.key);

    // Audio presentation
    soundManager.playCry(starter.id);
    soundManager.playVoice(`starter_${starter.key}`);
  };

  const handlePlayClick = () => {
    soundManager.getAudioContext();
    soundManager.playSfx('button');
    soundManager.playCry(activeStarter.id);
    soundManager.playBgm('menu');
    onStart();
  };

  const toggleSound = () => {
    const next = soundManager.toggleBgmMute();
    setBgmMuted(next);
  };

  return (
    <div className="relative w-full h-full h-dvh bg-slate-950 overflow-hidden flex flex-col items-center justify-between p-safe select-none font-sans">
      {/* 1. Dynamic Full-Screen Biome Splashscreens (Layered Crossfade) */}
      {STARTERS.map((starter) => {
        const isActive = starter.key === activeStarterKey;
        return (
          <div
            key={starter.key}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out pointer-events-none ${
              isActive ? 'opacity-75 sm:opacity-85 scale-105 transition-transform duration-[6000ms]' : 'opacity-0 scale-100'
            }`}
          >
            <img
              src={starter.splash}
              alt={starter.name}
              className="w-full h-full object-cover object-center"
            />
          </div>
        );
      })}

      {/* Atmospheric Contrast Gradients */}
      <div className={`absolute inset-0 bg-gradient-to-b ${activeStarter.accentBg} opacity-80 pointer-events-none transition-all duration-700`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(2,6,23,0.85)_80%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />

      {/* Top Bar with Sound Toggle & Hint */}
      <div className="relative z-20 w-full flex items-center justify-between">
        <div className="flex items-center gap-2 bg-slate-950/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-amber-400/40 shadow-lg">
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
          <span className="text-xs font-black text-amber-200 uppercase tracking-wider hidden sm:inline">
            Tippe auf dein Lieblings-Pokémon!
          </span>
          <span className="text-xs font-black text-amber-200 uppercase tracking-wider sm:hidden">
            Wähle dein Pokémon!
          </span>
        </div>

        <button
          onClick={toggleSound}
          className="p-3 rounded-full bg-slate-900/80 border-2 border-slate-700 text-amber-300 hover:text-white hover:bg-slate-800 shadow-xl transition-transform active:scale-90 cursor-pointer"
          title="Musik an/aus"
        >
          {bgmMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </button>
      </div>

      {/* Center: Title Logo & Dynamic Starters Showcase */}
      <div className="relative z-10 flex flex-col items-center text-center gap-4 max-w-2xl">
        {profile.isChampion && (
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500/30 via-yellow-400/40 to-amber-500/30 border-2 border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.7)] backdrop-blur-md animate-pulse">
            <span className="text-base">👑</span>
            <span className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-widest drop-shadow">
              KANTO LIGA-CHAMPION LEVI
            </span>
            <span className="text-base">🏆</span>
          </div>
        )}

        {/* Pokémon TCG Golden Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950/80 border-2 border-amber-400/70 shadow-[0_0_20px_rgba(251,191,36,0.5)] backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
          <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-amber-300 drop-shadow">
            POKÉMON TRADING CARD GAME
          </span>
        </div>

        {/* 3D-Look Title Logo */}
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-amber-400 to-orange-500 drop-shadow-[0_8px_20px_rgba(0,0,0,0.95)] tracking-tight">
          Levis Pokémon-Karten
        </h1>

        {/* 4 Interactive Starter Pokémon Buttons */}
        <div className="flex items-center justify-center gap-2.5 sm:gap-6 my-1 sm:my-2">
          {STARTERS.map((mon) => {
            const isSelected = mon.key === activeStarterKey;
            return (
              <div
                key={mon.key}
                onClick={() => handleStarterSelect(mon)}
                className={`relative group cursor-pointer transition-all duration-300 transform ${
                  isSelected ? 'scale-115 sm:scale-120 z-30' : 'hover:scale-110 opacity-75 hover:opacity-100 z-10'
                }`}
              >
                <div
                  className={`w-16 xs:w-18 sm:w-28 md:w-32 aspect-square rounded-full p-1.5 sm:p-2 bg-slate-950/85 border-3 backdrop-blur-md flex items-center justify-center transition-all ${
                    isSelected ? `${mon.glow} animate-bounce` : 'border-white/30 shadow-lg'
                  }`}
                >
                  <img
                    src={`/images/pokemon/${mon.id}.webp`}
                    alt={mon.name}
                    className="w-full h-full object-contain filter drop-shadow-[0_10px_14px_rgba(0,0,0,0.9)]"
                  />
                </div>

                {/* Selected Indicator Tag */}
                {isSelected && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] sm:text-xs shadow-xl border border-white animate-in zoom-in-50">
                    ⭐ {mon.name}!
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Giant "SPIELEN!" Button at Bottom */}
      <div className="relative z-20 pb-2 sm:pb-6 w-full max-w-md">
        <button
          onClick={handlePlayClick}
          className="w-full py-3.5 sm:py-5 px-6 sm:px-8 rounded-3xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xl sm:text-3xl border-3 sm:border-4 border-white shadow-[0_0_40px_rgba(251,191,36,0.95)] flex items-center justify-center gap-3 sm:gap-4 transition-transform active:scale-95 animate-pulse hover:animate-none hover:scale-105 cursor-pointer"
        >
          <Play className="w-6 h-6 sm:w-10 sm:h-10 fill-current" />
          <span>MIT {activeStarter.name.toUpperCase()} SPIELEN!</span>
        </button>
      </div>

      {/* Bottom-Right Clickable Build Badge */}
      <button
        onClick={() => setShowChangelog(true)}
        className="absolute bottom-[max(0.5rem,env(safe-area-inset-bottom))] right-[max(0.5rem,env(safe-area-inset-right))] flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono font-bold text-amber-300/90 hover:text-white bg-slate-950/85 hover:bg-slate-900 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-amber-400/50 shadow-xl backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer z-30"
        title="Klicken für Versionsverlauf & Neuerungen"
      >
        <Info className="w-3.5 h-3.5 text-amber-400" />
        <span>{APP_BUILD_TAG}</span>
      </button>

      {/* Changelog Modal */}
      {showChangelog && <ChangelogModal onClose={() => setShowChangelog(false)} />}
    </div>
  );
};
