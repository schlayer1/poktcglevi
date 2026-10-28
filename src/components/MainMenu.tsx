import React, { useEffect, useState } from 'react';
import { Users, Swords, BookOpen, Volume2, VolumeX, Wrench, PackageOpen, ShieldCheck } from 'lucide-react';
import { soundManager } from '../services/soundManager';
import { storageService } from '../services/storageService';
import { Card } from '../types/game';
import { PikachuCompanion } from './PikachuCompanion';
import { HowToPlayModal } from './HowToPlayModal';
import { ResearchQuestsModal } from './ResearchQuestsModal';
import { TrainingCampModal } from './TrainingCampModal';

interface MainMenuProps {
  allCards?: Card[];
  onSelectSolo: () => void;
  onSelectPvP: () => void;
  onSelectAlbum: () => void;
  onOpenDeckBuilder?: () => void;
  onOpenBoosters?: () => void;
  onOpenSettings?: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  allCards = [],
  onSelectSolo,
  onSelectPvP,
  onSelectAlbum,
  onOpenDeckBuilder,
  onOpenBoosters,
  onOpenSettings
}) => {
  const [bgmMuted, setBgmMuted] = React.useState(soundManager.isBgmMuted());
  const [showRules, setShowRules] = useState<boolean>(false);
  const [showQuests, setShowQuests] = useState<boolean>(false);
  const [showCamp, setShowCamp] = useState<boolean>(false);
  const profile = storageService.loadProfile([]);
  const claimableQuestsCount = storageService.getClaimableQuestCount();

  useEffect(() => {
    soundManager.playBgm('menu');
    soundManager.playVoice('menu_welcome', 'Hallo Levi! Was möchtest du heute spielen?');
  }, []);

  const toggleSound = () => {
    const next = soundManager.toggleBgmMute();
    setBgmMuted(next);
  };

  const hasBoosters = profile.unopenedBoosters > 0;

  return (
    <div className="relative w-full h-full h-dvh bg-slate-950 overflow-hidden flex flex-col justify-between p-safe select-none">
      {/* 1. Fullscreen Illustrated Anime Stadium Backdrop */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/images/arenas/stadium.webp"
          alt="Pokémon Liga Stadion"
          className="w-full h-full object-cover object-center filter brightness-[0.70] contrast-[1.12]"
        />
        {/* Soft Vignette and Edge Shadows */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-slate-950/80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(2,6,23,0.75)_85%)]" />
        {/* Ambient Stadium Lighting */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl" />
      </div>

      {/* Header Bar */}
      <div className="relative z-20 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-amber-400 bg-slate-900 p-0.5 sm:p-1 flex items-center justify-center shadow-lg shrink-0 relative">
            <img src="/images/trainers/levi.png" alt="Levi" className="w-full h-full object-contain" />
            {profile.isChampion && (
              <span className="absolute -top-1.5 -right-1.5 text-sm animate-bounce" title="Kanto Liga-Champion!">👑</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] sm:text-xs font-bold text-amber-300 uppercase tracking-widest block">
                {profile.isChampion ? 'Liga-Champion' : 'Pokémontrainer'}
              </span>
              {profile.isChampion && (
                <span className="text-[10px] font-black bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 px-1.5 py-0.5 rounded-full shadow">
                  CHAMP 🏆
                </span>
              )}
            </div>
            <span className="text-lg sm:text-xl font-black text-white drop-shadow">Levi</span>
          </div>
        </div>

        {/* Quick action buttons: Deck Builder, Booster, Forschung, Camp, Eltern, Regeln, Sound */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Trainingscamp Button */}
          <button
            onClick={() => {
              soundManager.playSfx('button');
              setShowCamp(true);
            }}
            className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 border-2 border-white text-slate-950 font-black text-xs sm:text-sm shadow-[0_0_15px_rgba(251,191,36,0.6)] flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
            title="Trainingscamp (Quiz & Memo)"
          >
            <span className="text-sm">🏕️</span>
            <span className="hidden xs:inline">Camp</span>
          </button>

          {/* Professor Eich Research Quests */}
          <button
            onClick={() => {
              soundManager.playSfx('button');
              setShowQuests(true);
            }}
            className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 border-2 border-white text-white font-black text-xs sm:text-sm shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer relative"
            title="Professor Eichs Forschungs-Aufgaben"
          >
            <span className="text-sm">🔬</span>
            <span className="hidden xs:inline">Forschung</span>
            {claimableQuestsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center animate-bounce border border-white shadow">
                {claimableQuestsCount}
              </span>
            )}
          </button>

          {onOpenBoosters && hasBoosters && (
            <button
              onClick={() => {
                soundManager.playSfx('button');
                onOpenBoosters();
              }}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs sm:text-sm border-2 border-white shadow-[0_0_15px_rgba(251,191,36,0.8)] flex items-center gap-1.5 transition-transform active:scale-95 animate-bounce cursor-pointer"
            >
              <PackageOpen className="w-4 h-4" />
              <span>{profile.unopenedBoosters} Booster! 🎁</span>
            </button>
          )}

          {onOpenDeckBuilder && (
            <button
              onClick={() => {
                soundManager.playSfx('button');
                onOpenDeckBuilder();
              }}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl bg-slate-800/90 hover:bg-slate-700 border border-slate-600 text-white font-extrabold text-xs sm:text-sm shadow flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer backdrop-blur-sm"
            >
              <Wrench className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              <span>Deckbau</span>
            </button>
          )}

          {onOpenSettings && (
            <button
              onClick={() => {
                soundManager.playSfx('button');
                onOpenSettings();
              }}
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border-2 border-slate-700 hover:border-emerald-500/60 text-slate-200 font-extrabold text-xs sm:text-sm shadow flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer backdrop-blur-sm"
              title="Elternmodus & Spieleinstellungen"
            >
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
              <span className="hidden xs:inline">Eltern</span>
            </button>
          )}

          <button
            onClick={() => {
              soundManager.playSfx('button');
              setShowRules(true);
            }}
            className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 border-2 border-white text-slate-950 font-black text-xs sm:text-sm shadow-lg flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Spielregeln 📖</span>
            <span className="xs:hidden">Regeln</span>
          </button>

          <button
            onClick={toggleSound}
            className="p-2 sm:p-3 rounded-full bg-slate-900/80 border-2 border-slate-700 text-amber-300 hover:text-white shadow-xl transition-transform active:scale-90 cursor-pointer"
          >
            {bgmMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>
      </div>

      {/* Center: 3 Big Visual Tiles (Responsive: Bento Row on Mobile Portrait, Grid on Tablet/Desktop) */}
      <div className="relative z-10 w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-6 px-1 sm:px-2">
        {/* Tile 1: Allein kämpfen */}
        <div
          onClick={() => {
            soundManager.playSfx('button');
            onSelectSolo();
          }}
          className="group relative h-22 sm:h-48 md:h-64 rounded-3xl border-3 border-amber-400/80 bg-gradient-to-b from-slate-900/90 via-amber-950/30 to-slate-900/90 p-3 sm:p-5 flex flex-row md:flex-col items-center justify-start md:justify-between text-left md:text-center cursor-pointer shadow-xl hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2 active:scale-95 gap-3.5 sm:gap-0"
        >
          <div className="w-14 h-14 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 border-2 sm:border-3 border-white p-1.5 sm:p-2 shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
            <Swords className="w-7 h-7 sm:w-12 sm:h-12 md:w-16 md:h-16 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-base sm:text-xl md:text-2xl font-black text-white group-hover:text-amber-300 transition-colors">
              Allein kämpfen
            </h2>
            <p className="text-[11px] sm:text-xs md:text-sm text-slate-300 font-bold">
              {profile.isChampion ? '🏆 Kanto-Liga & Arenen' : 'Kanto Arena-Reise & Liga'}
            </p>
          </div>
        </div>

        {/* Tile 2: Mit Papa spielen */}
        <div
          onClick={() => {
            soundManager.playSfx('button');
            onSelectPvP();
          }}
          className="group relative h-22 sm:h-48 md:h-64 rounded-3xl border-3 border-sky-400/80 bg-gradient-to-b from-slate-900/90 via-sky-950/30 to-slate-900/90 p-3 sm:p-5 flex flex-row md:flex-col items-center justify-start md:justify-between text-left md:text-center cursor-pointer shadow-xl hover:shadow-[0_0_30px_rgba(56,189,248,0.5)] transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2 active:scale-95 gap-3.5 sm:gap-0"
        >
          <div className="w-14 h-14 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-tr from-sky-400 to-cyan-300 border-2 sm:border-3 border-white p-1.5 sm:p-2 shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
            <Users className="w-7 h-7 sm:w-12 sm:h-12 md:w-16 md:h-16 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-base sm:text-xl md:text-2xl font-black text-white group-hover:text-sky-300 transition-colors">
              Mit Papa spielen
            </h2>
            <p className="text-[11px] sm:text-xs md:text-sm text-slate-300 font-bold">
              Tisch-Duell am Gerät
            </p>
          </div>
        </div>

        {/* Tile 3: Meine Karten (Sammelalbum) */}
        <div
          onClick={() => {
            soundManager.playSfx('button');
            onSelectAlbum();
          }}
          className="group relative h-22 sm:h-48 md:h-64 rounded-3xl border-3 border-purple-400/80 bg-gradient-to-b from-slate-900/90 via-purple-950/30 to-slate-900/90 p-3 sm:p-5 flex flex-row md:flex-col items-center justify-start md:justify-between text-left md:text-center cursor-pointer shadow-xl hover:shadow-[0_0_30px_rgba(192,132,252,0.5)] transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2 active:scale-95 gap-3.5 sm:gap-0"
        >
          <div className="w-14 h-14 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-tr from-purple-400 to-pink-300 border-2 sm:border-3 border-white p-1.5 sm:p-2 shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
            <BookOpen className="w-7 h-7 sm:w-12 sm:h-12 md:w-16 md:h-16 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-base sm:text-xl md:text-2xl font-black text-white group-hover:text-purple-300 transition-colors">
              Meine Karten
            </h2>
            <p className="text-[11px] sm:text-xs md:text-sm text-purple-200 font-bold">
              Sammelalbum & Pokedex (151)
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Pikachu Companion */}
      <div className="relative z-20 flex justify-center pb-2 pb-safe">
        <PikachuCompanion
          promptText="Tippe auf eine Kachel, um loszulegen!"
          emotion="happy"
        />
      </div>

      {/* Interactive Audio Rulebook */}
      {showRules && <HowToPlayModal onClose={() => setShowRules(false)} />}

      {/* Professor Eich Research Quests Modal */}
      {showQuests && (
        <ResearchQuestsModal
          onClose={() => setShowQuests(false)}
          onOpenBoosters={onOpenBoosters}
        />
      )}

      {/* Trainingscamp Modal (Quiz & Memo) */}
      {showCamp && (
        <TrainingCampModal
          allCards={allCards}
          onClose={() => setShowCamp(false)}
          onOpenBoosters={onOpenBoosters}
        />
      )}
    </div>
  );
};
