import React, { useState, useEffect } from 'react';
import { Card, PokemonType } from '../types/game';
import { GymBadge, BadgeType } from './GymBadge';
import { EnergyBadge } from './EnergyBadge';
import { ArenaType } from './ArenaBackground';
import { storageService } from '../services/storageService';
import { soundManager } from '../services/soundManager';
import { ArrowLeft, Play, MapPin, Sparkles, Trophy, Lock, Swords, Compass, ShieldCheck } from 'lucide-react';

interface GymNode {
  id: BadgeType;
  order: number;
  name: string;
  city: string;
  type: PokemonType;
  avatar: string;
  aceDexId: number;
  deckId: string;
  arena: ArenaType;
  x: number; // percentage on map (0-100)
  y: number; // percentage on map (0-100)
}

interface ArenaMapScreenProps {
  onBack: () => void;
  onSelectGym: (config: {
    opponentName: string;
    opponentAvatar: string;
    opponentDeckId: string;
    arena: ArenaType;
    badgeId: BadgeType;
  }) => void;
  onOpenSettings?: () => void;
}

export const GYM_CAMPAIGN: GymNode[] = [
  { id: 'rocko', order: 1, name: 'Rocko', city: 'Marmoria City', type: 'Kampf', avatar: 'rocko', aceDexId: 95, deckId: 'deck_pflanze', arena: 'rocko', x: 23, y: 26 },
  { id: 'misty', order: 2, name: 'Misty', city: 'Azuria City', type: 'Wasser', avatar: 'misty', aceDexId: 120, deckId: 'deck_wasser', arena: 'misty', x: 72, y: 20 },
  { id: 'majorbob', order: 3, name: 'Major Bob', city: 'Orania City', type: 'Elektro', avatar: 'majorbob', aceDexId: 26, deckId: 'deck_elektro', arena: 'majorbob', x: 66, y: 64 },
  { id: 'erika', order: 4, name: 'Erika', city: 'Prismania City', type: 'Pflanze', avatar: 'erika', aceDexId: 44, deckId: 'deck_pflanze', arena: 'erika', x: 40, y: 44 },
  { id: 'koga', order: 5, name: 'Koga', city: 'Fuchsania City', type: 'Finsternis', avatar: 'koga', aceDexId: 110, deckId: 'deck_pflanze', arena: 'koga', x: 50, y: 80 },
  { id: 'sabrina', order: 6, name: 'Sabrina', city: 'Saffronia City', type: 'Psycho', avatar: 'sabrina', aceDexId: 65, deckId: 'deck_elektro', arena: 'sabrina', x: 57, y: 44 },
  { id: 'pyro', order: 7, name: 'Pyro', city: 'Zinnoberinsel', type: 'Feuer', avatar: 'pyro', aceDexId: 59, deckId: 'deck_feuer', arena: 'pyro', x: 18, y: 86 },
  { id: 'giovanni', order: 8, name: 'Giovanni', city: 'Vertania City', type: 'Kampf', avatar: 'giovanni', aceDexId: 112, deckId: 'deck_pflanze', arena: 'giovanni', x: 18, y: 52 },
  { id: 'gary', order: 9, name: 'Gary', city: 'Indigo Plateau', type: 'Farblos', avatar: 'gary', aceDexId: 9, deckId: 'deck_wasser', arena: 'gary', x: 10, y: 12 }
];

export const ArenaMapScreen: React.FC<ArenaMapScreenProps> = ({
  onBack,
  onSelectGym,
  onOpenSettings
}) => {
  const profile = storageService.loadProfile([]);
  const earnedBadges = profile.badges;

  const isNodeUnlocked = (node: GymNode) => {
    if (profile.allChaptersUnlocked) return true;
    const idx = GYM_CAMPAIGN.findIndex((g) => g.id === node.id);
    if (idx <= 0) return true; // Rocko is always unlocked
    const prevGym = GYM_CAMPAIGN[idx - 1];
    return earnedBadges.includes(prevGym.id);
  };

  // Find current active gym node
  const [selectedGym, setSelectedGym] = useState<GymNode>(() => {
    const nextUnbeaten = GYM_CAMPAIGN.find((g) => isNodeUnlocked(g) && !earnedBadges.includes(g.id));
    return nextUnbeaten || GYM_CAMPAIGN[0];
  });

  useEffect(() => {
    soundManager.playBgm('menu');
  }, []);

  const handleNodeClick = (node: GymNode) => {
    const unlocked = isNodeUnlocked(node);
    setSelectedGym(node);
    soundManager.playSfx('button');
    if (!unlocked) {
      soundManager.playVoice('gym_locked', 'Diese Arena ist noch verschlossen! Gewinne zuerst den vorherigen Orden!');
    } else {
      soundManager.playVoice(`vs_${node.id}`, `${node.name} aus ${node.city} fordert dich heraus!`);
    }
  };

  const isEarned = (id: BadgeType) => earnedBadges.includes(id);

  // SVG route path between nodes in order
  const routePoints = GYM_CAMPAIGN.map((g) => `${g.x}%,${g.y}%`).join(' ');

  return (
    <div className="relative w-full h-full h-dvh bg-slate-950 overflow-hidden flex flex-col justify-between p-safe select-none font-sans">
      {/* 1. Fullscreen Illustrated Anime Kanto Region Map Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/map/kanto_anime_region_map.webp"
          alt="Kanto Anime Region"
          className="w-full h-full object-cover object-center filter brightness-[0.88] contrast-[1.08]"
        />
        {/* Soft Vignette and Edge Shadow for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-transparent to-slate-950/70 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(2,6,23,0.7)_90%)] pointer-events-none" />
      </div>

      {/* 2. Top Header Bar */}
      <div className="relative z-20 flex items-center justify-between bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 sm:p-3 rounded-2xl border border-amber-400/50 shadow-2xl gap-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs sm:text-sm border border-slate-600 transition-transform active:scale-95 cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
          <span>Zurück</span>
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-950/70 px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-xl border border-amber-400/30 truncate">
          <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 animate-spin shrink-0" />
          <h1 className="text-xs sm:text-base md:text-lg font-black text-amber-300 drop-shadow truncate">
            Kanto Arena-Reise (8 Orden & Champ Gary)
          </h1>
        </div>

        {/* Badges Progress Pill & Eltern */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl border border-amber-400/50 shadow-md">
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            <span className="text-xs sm:text-sm font-black text-white">
              {earnedBadges.length} / 8 Orden
            </span>
          </div>

          {onOpenSettings && (
            <button
              onClick={() => {
                soundManager.playSfx('button');
                onOpenSettings();
              }}
              className="p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 hover:text-white transition-transform active:scale-95 cursor-pointer shrink-0"
              title="Elternmodus"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Center: Interactive Map Stage with Connected Waypoints */}
      <div className="relative z-10 flex-1 my-2 rounded-3xl overflow-hidden border-2 border-amber-400/30 shadow-inner">
        {/* Animated Golden Route Connections SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {/* Base Glow */}
          <polyline
            points={routePoints}
            fill="none"
            stroke="#fbbf24"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.3"
          />
          {/* Animated Dashed Pulse Line */}
          <polyline
            points={routePoints}
            fill="none"
            stroke="#fef08a"
            strokeWidth="3.5"
            strokeDasharray="8,8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-pulse"
          />
        </svg>

        {/* 9 Gym Nodes across the Kanto landscape */}
        {GYM_CAMPAIGN.map((node) => {
          const earned = isEarned(node.id);
          const unlocked = isNodeUnlocked(node);
          const isSelected = selectedGym.id === node.id;

          return (
            <div
              key={node.id}
              onClick={() => handleNodeClick(node)}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 transform ${
                isSelected ? 'scale-125 z-30' : 'hover:scale-115 z-20'
              }`}
            >
              {/* Pulsing Active Pin Ring */}
              {isSelected && (
                <div className="absolute -inset-2 rounded-full border-2 border-amber-400 animate-ping pointer-events-none" />
              )}

              <div
                className={`relative p-1 rounded-full border-3 flex items-center justify-center shadow-2xl transition-all ${
                  isSelected
                    ? 'border-white bg-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.95)]'
                    : earned
                    ? 'border-emerald-400 bg-slate-900 shadow-[0_0_15px_rgba(16,185,129,0.8)]'
                    : unlocked
                    ? 'border-amber-400/90 bg-slate-900/95 shadow-[0_0_15px_rgba(251,191,36,0.6)]'
                    : 'border-slate-700 bg-slate-950/90 opacity-60 grayscale'
                }`}
              >
                {/* Gym Order Badge Pill */}
                <div className="absolute -top-2 -left-2 z-30 w-5 h-5 rounded-full bg-slate-950 border border-amber-400 flex items-center justify-center text-[10px] font-black text-amber-300 shadow">
                  {node.order}
                </div>

                <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-slate-950 p-0.5">
                  <img
                    src={`/images/trainers/${node.avatar}.png`}
                    alt={node.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Badge Marker if Earned or Lock if Locked */}
                {earned ? (
                  <div className="absolute -bottom-1 -right-1 sm:-bottom-1.5 sm:-right-1.5 z-30 animate-bounce">
                    <GymBadge type={node.id} earned size="sm" />
                  </div>
                ) : !unlocked ? (
                  <div className="absolute -bottom-1 -right-1 z-30 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-slate-900 border border-slate-600 flex items-center justify-center text-amber-400 shadow">
                    <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </div>
                ) : null}
              </div>

              {/* City & Name Tag */}
              <div
                className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 sm:mt-1.5 whitespace-nowrap px-1.5 sm:px-2.5 py-0.5 rounded-lg border text-[9px] sm:text-[11px] font-black shadow-xl transition-all ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 border-white scale-105'
                    : earned
                    ? 'bg-slate-950/90 text-emerald-300 border-emerald-500/60'
                    : 'bg-slate-950/90 text-white border-slate-700'
                }`}
              >
                {node.name}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Bottom Selected Arena Preview & Challenge Banner */}
      <div className="relative z-20 bg-slate-900/95 backdrop-blur-md p-2 sm:p-4 rounded-3xl border-2 border-amber-400/80 shadow-[0_0_30px_rgba(0,0,0,0.8)] flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        {/* Left: Arena Battlefield Thumbnail Preview */}
        <div className="flex items-center gap-2 sm:gap-3.5">
          <div className="relative w-16 sm:w-32 aspect-video rounded-xl sm:rounded-2xl overflow-hidden border-2 border-amber-400 shadow-xl shrink-0 group">
            <img
              src={`/images/arenas/${selectedGym.arena}.webp`}
              alt={selectedGym.city}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-0.5 sm:p-1">
              <span className="text-[8px] sm:text-[9px] font-black text-amber-300 truncate">
                Arena {selectedGym.order}
              </span>
            </div>
          </div>

          <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-full border-2 border-amber-400 bg-slate-950 p-0.5 sm:p-1 flex items-center justify-center shadow shrink-0">
            <img
              src={`/images/trainers/${selectedGym.avatar}.png`}
              alt={selectedGym.name}
              className="w-full h-full object-contain"
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h2 className="text-sm sm:text-xl font-black text-white">
                {selectedGym.name}
              </h2>
              <EnergyBadge type={selectedGym.type} size="sm" />
              {isEarned(selectedGym.id) && (
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400 text-[9px] sm:text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  BESIEGT ⭐
                </span>
              )}
            </div>
            <span className="text-[10px] sm:text-xs text-amber-300 font-bold block">
              {selectedGym.city} • {selectedGym.type}-Typ
            </span>
          </div>
        </div>

        {/* Center: Badge Preview */}
        <div className="hidden xs:flex items-center gap-2 sm:gap-3">
          <GymBadge type={selectedGym.id} earned={isEarned(selectedGym.id)} size="md" />
          <div className="text-left hidden md:block">
            <span className="text-[10px] uppercase font-black text-slate-400 block">
              Offizieller Arenapreis
            </span>
            <span className="text-xs font-black text-white">
              {GYM_CAMPAIGN.find((g) => g.id === selectedGym.id)?.name}-Orden
            </span>
          </div>
        </div>

        {/* Right: Action Challenge Button */}
        <button
          disabled={!isNodeUnlocked(selectedGym)}
          onClick={() => {
            if (!isNodeUnlocked(selectedGym)) return;
            soundManager.playSfx('button');
            onSelectGym({
              opponentName: selectedGym.name,
              opponentAvatar: selectedGym.avatar,
              opponentDeckId: selectedGym.deckId,
              arena: selectedGym.arena,
              badgeId: selectedGym.id
            });
          }}
          className={`py-2 sm:py-3.5 px-4 sm:px-7 rounded-2xl font-black text-xs sm:text-base shadow-2xl flex items-center gap-2 transition-transform active:scale-95 ${
            isNodeUnlocked(selectedGym)
              ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 border-2 border-white shadow-[0_0_25px_rgba(251,191,36,0.85)] animate-bounce cursor-pointer'
              : 'bg-slate-800 border border-slate-700 text-slate-500 opacity-60 cursor-not-allowed'
          }`}
        >
          {isNodeUnlocked(selectedGym) ? (
            <>
              <Swords className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              <span>ARENA BETRETEN! ⚡</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>GESPERRT 🔒</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
