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
  onOpenLeagueHall?: () => void;
}

export const GYM_CAMPAIGN: GymNode[] = [
  { id: 'rocko', order: 1, name: 'Rocko', city: 'Marmoria City', type: 'Kampf', avatar: 'rocko', aceDexId: 95, deckId: 'deck_bruno', arena: 'rocko', x: 23, y: 26 },
  { id: 'misty', order: 2, name: 'Misty', city: 'Azuria City', type: 'Wasser', avatar: 'misty', aceDexId: 120, deckId: 'deck_wasser', arena: 'misty', x: 72, y: 20 },
  { id: 'majorbob', order: 3, name: 'Major Bob', city: 'Orania City', type: 'Elektro', avatar: 'majorbob', aceDexId: 26, deckId: 'deck_elektro', arena: 'majorbob', x: 66, y: 64 },
  { id: 'erika', order: 4, name: 'Erika', city: 'Prismania City', type: 'Pflanze', avatar: 'erika', aceDexId: 44, deckId: 'deck_pflanze', arena: 'erika', x: 40, y: 44 },
  { id: 'koga', order: 5, name: 'Koga', city: 'Fuchsania City', type: 'Finsternis', avatar: 'koga', aceDexId: 110, deckId: 'deck_agathe', arena: 'koga', x: 50, y: 80 },
  { id: 'sabrina', order: 6, name: 'Sabrina', city: 'Saffronia City', type: 'Psycho', avatar: 'sabrina', aceDexId: 65, deckId: 'deck_agathe', arena: 'sabrina', x: 57, y: 44 },
  { id: 'pyro', order: 7, name: 'Pyro', city: 'Zinnoberinsel', type: 'Feuer', avatar: 'pyro', aceDexId: 59, deckId: 'deck_feuer', arena: 'pyro', x: 18, y: 86 },
  { id: 'giovanni', order: 8, name: 'Giovanni', city: 'Vertania City', type: 'Kampf', avatar: 'giovanni', aceDexId: 112, deckId: 'deck_bruno', arena: 'giovanni', x: 18, y: 52 },
  { id: 'lorelei', order: 9, name: 'Lorelei', city: 'Top Vier: Eishalle', type: 'Wasser', avatar: 'lorelei', aceDexId: 131, deckId: 'deck_lorelei', arena: 'lorelei', x: 14, y: 38 },
  { id: 'bruno', order: 10, name: 'Bruno', city: 'Top Vier: Kampfsaal', type: 'Kampf', avatar: 'bruno', aceDexId: 68, deckId: 'deck_bruno', arena: 'bruno', x: 12, y: 29 },
  { id: 'agathe', order: 11, name: 'Agathe', city: 'Top Vier: Geistergruft', type: 'Psycho', avatar: 'agathe', aceDexId: 94, deckId: 'deck_agathe', arena: 'agathe', x: 15, y: 21 },
  { id: 'siegfried', order: 12, name: 'Siegfried', city: 'Top Vier: Drachenschrein', type: 'Drache', avatar: 'siegfried', aceDexId: 149, deckId: 'deck_siegfried', arena: 'siegfried', x: 11, y: 15 },
  { id: 'gary', order: 13, name: 'Champ Gary', city: 'Indigo Plateau Finale', type: 'Wasser', avatar: 'gary', aceDexId: 9, deckId: 'deck_gary_champion', arena: 'gary', x: 8, y: 8 }
];

export const JOHTO_CAMPAIGN: GymNode[] = [
  { id: 'falk', order: 1, name: 'Falk', city: 'Viola City', type: 'Farblos', avatar: 'falk', aceDexId: 187, deckId: 'deck_falk', arena: 'falk', x: 58, y: 44 },
  { id: 'kai', order: 2, name: 'Kai', city: 'Azalea City', type: 'Pflanze', avatar: 'kai', aceDexId: 212, deckId: 'deck_kai', arena: 'kai', x: 48, y: 76 },
  { id: 'bianka', order: 3, name: 'Bianka', city: 'Dukatia City', type: 'Farblos', avatar: 'bianka', aceDexId: 175, deckId: 'deck_bianka', arena: 'bianka', x: 26, y: 64 },
  { id: 'jens', order: 4, name: 'Jens', city: 'Teak City', type: 'Psycho', avatar: 'jens', aceDexId: 122, deckId: 'deck_jens', arena: 'jens', x: 42, y: 32 },
  { id: 'hartwig', order: 5, name: 'Hartwig', city: 'Anemonia City', type: 'Kampf', avatar: 'hartwig', aceDexId: 145, deckId: 'deck_hartwig', arena: 'hartwig', x: 10, y: 55 },
  { id: 'jasmin', order: 6, name: 'Jasmin', city: 'Oliviana City', type: 'Metall', avatar: 'jasmin', aceDexId: 208, deckId: 'deck_jasmin', arena: 'jasmin', x: 20, y: 42 },
  { id: 'norbert', order: 7, name: 'Norbert', city: 'Mahagonia City', type: 'Wasser', avatar: 'norbert', aceDexId: 65, deckId: 'deck_norbert', arena: 'norbert', x: 68, y: 28 },
  { id: 'sandra', order: 8, name: 'Sandra', city: 'Ebenholz City', type: 'Drache', avatar: 'sandra', aceDexId: 185, deckId: 'deck_sandra', arena: 'sandra', x: 82, y: 36 }
];

export const ArenaMapScreen: React.FC<ArenaMapScreenProps> = ({
  onBack,
  onSelectGym,
  onOpenSettings,
  onOpenLeagueHall
}) => {
  const profile = storageService.loadProfile([]);
  const earnedBadges = profile.badges || [];
  const [region, setRegion] = useState<'kanto' | 'johto'>('kanto');

  const isJohtoUnlocked = profile.isChampion || profile.allChaptersUnlocked || earnedBadges.includes('gary');
  const campaign = region === 'kanto' ? GYM_CAMPAIGN : JOHTO_CAMPAIGN;

  const isNodeUnlocked = (node: GymNode) => {
    if (profile.allChaptersUnlocked) return true;
    const currentList = region === 'kanto' ? GYM_CAMPAIGN : JOHTO_CAMPAIGN;
    const idx = currentList.findIndex((g) => g.id === node.id);
    if (idx <= 0) return true;
    const prevGym = currentList[idx - 1];
    return earnedBadges.includes(prevGym.id);
  };

  // Find current active gym node
  const [selectedGym, setSelectedGym] = useState<GymNode>(() => {
    const nextUnbeaten = campaign.find((g) => isNodeUnlocked(g) && !earnedBadges.includes(g.id));
    return nextUnbeaten || campaign[0];
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
  const routePoints = campaign.map((g) => `${g.x}%,${g.y}%`).join(' ');
  const mapImage = region === 'kanto' ? '/images/map/kanto_anime_region_map.webp' : '/images/map/johto_anime_region_map.webp';

  return (
    <div className="relative w-full h-full h-dvh bg-slate-950 overflow-hidden flex flex-col justify-between p-safe select-none font-sans">
      {/* 1. Fullscreen Illustrated Anime Region Map Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={mapImage}
          alt={`${region} Region`}
          className="w-full h-full object-cover object-center filter brightness-[0.88] contrast-[1.08] transition-all duration-700"
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

        {/* Region Switcher: Kanto ↔ Johto */}
        <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-700 shadow-inner">
          <button
            onClick={() => {
              soundManager.playSfx('button');
              setRegion('kanto');
              setSelectedGym(GYM_CAMPAIGN[0]);
            }}
            className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
              region === 'kanto'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🗼 Kanto
          </button>

          <button
            onClick={() => {
              if (!isJohtoUnlocked) {
                soundManager.playVoice('gym_locked', 'Die Johto-Reise ist noch verschlossen! Werde zuerst Kanto-Champion!');
                return;
              }
              soundManager.playSfx('button');
              setRegion('johto');
              setSelectedGym(JOHTO_CAMPAIGN[0]);
            }}
            className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-black transition-all ${
              region === 'johto'
                ? 'bg-gradient-to-r from-sky-400 to-indigo-400 text-slate-950 shadow-md'
                : isJohtoUnlocked
                ? 'text-slate-300 hover:text-white cursor-pointer'
                : 'text-slate-600 cursor-not-allowed opacity-60'
            }`}
            title={isJohtoUnlocked ? 'Nach Johto reisen' : 'Besiege zuerst Champ Gary'}
          >
            <span>🚂 Johto</span>
            {!isJohtoUnlocked && <Lock className="w-3 h-3 text-slate-500" />}
          </button>
        </div>

        {/* Badges Progress Pill & Eltern */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {region === 'kanto' && onOpenLeagueHall && (
            <button
              onClick={() => {
                soundManager.playSfx('button');
                onOpenLeagueHall();
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 active:scale-95 text-slate-950 font-black text-xs shadow-[0_0_15px_rgba(251,191,36,0.6)] border border-white/60 transition-all cursor-pointer animate-pulse"
              title="Indigo Plateau Liga-Halle betreten"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Zur Liga-Halle</span>
              <span className="md:hidden">Liga</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl border border-amber-400/50 shadow-md">
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            <span className="text-xs sm:text-sm font-black text-white">
              {region === 'kanto'
                ? `${earnedBadges.filter((b) => ['rocko', 'misty', 'majorbob', 'erika', 'koga', 'sabrina', 'pyro', 'giovanni'].includes(b)).length} / 8 Kanto`
                : `${earnedBadges.filter((b) => ['falk', 'kai', 'bianka', 'jens', 'hartwig', 'jasmin', 'norbert', 'sandra'].includes(b)).length} / 8 Johto`}
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

        {/* Gym Nodes across the region landscape */}
        {campaign.map((node) => {
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
              {campaign.find((g) => g.id === selectedGym.id)?.name || selectedGym.name}-Orden
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
