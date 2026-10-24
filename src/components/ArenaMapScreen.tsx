import React, { useState } from 'react';
import { Card, PokemonType } from '../types/game';
import { GymBadge, BadgeType } from './GymBadge';
import { EnergyBadge } from './EnergyBadge';
import { ArenaType } from './ArenaBackground';
import { storageService } from '../services/storageService';
import { soundManager } from '../services/soundManager';
import { ArrowLeft, Play, MapPin, Sparkles, Trophy } from 'lucide-react';

interface GymNode {
  id: BadgeType;
  name: string;
  city: string;
  type: PokemonType;
  avatar: string;
  aceDexId: number;
  deckId: string;
  arena: ArenaType;
  x: number; // percentage on map
  y: number; // percentage on map
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
}

export const GYM_CAMPAIGN: GymNode[] = [
  { id: 'rocko', name: 'Rocko', city: 'Marmoria City', type: 'Kampf', avatar: 'rocko', aceDexId: 95, deckId: 'deck_pflanze', arena: 'rocko', x: 20, y: 30 },
  { id: 'misty', name: 'Misty', city: 'Azuria City', type: 'Wasser', avatar: 'misty', aceDexId: 120, deckId: 'deck_wasser', arena: 'misty', x: 55, y: 22 },
  { id: 'majorbob', name: 'Major Bob', city: 'Orania City', type: 'Elektro', avatar: 'majorbob', aceDexId: 26, deckId: 'deck_elektro', arena: 'majorbob', x: 55, y: 65 },
  { id: 'erika', name: 'Erika', city: 'Prismania City', type: 'Pflanze', avatar: 'erika', aceDexId: 44, deckId: 'deck_pflanze', arena: 'erika', x: 38, y: 48 },
  { id: 'koga', name: 'Koga', city: 'Fuchsania City', type: 'Finsternis', avatar: 'koga', aceDexId: 110, deckId: 'deck_pflanze', arena: 'koga', x: 48, y: 82 },
  { id: 'sabrina', name: 'Sabrina', city: 'Saffronia City', type: 'Psycho', avatar: 'sabrina', aceDexId: 65, deckId: 'deck_elektro', arena: 'sabrina', x: 55, y: 45 },
  { id: 'pyro', name: 'Pyro', city: 'Zinnoberinsel', type: 'Feuer', avatar: 'pyro', aceDexId: 59, deckId: 'deck_feuer', arena: 'pyro', x: 22, y: 85 },
  { id: 'giovanni', name: 'Giovanni', city: 'Vertania City', type: 'Kampf', avatar: 'giovanni', aceDexId: 112, deckId: 'deck_pflanze', arena: 'giovanni', x: 20, y: 55 },
  { id: 'gary', name: 'Gary', city: 'Indigo Plateau', type: 'Farblos', avatar: 'gary', aceDexId: 9, deckId: 'deck_wasser', arena: 'gary', x: 10, y: 18 }
];

export const ArenaMapScreen: React.FC<ArenaMapScreenProps> = ({
  onBack,
  onSelectGym
}) => {
  const profile = storageService.loadProfile([]);
  const earnedBadges = profile.badges;

  // Find current active gym node
  const [selectedGym, setSelectedGym] = useState<GymNode>(() => {
    const nextUnbeaten = GYM_CAMPAIGN.find((g) => !earnedBadges.includes(g.id));
    return nextUnbeaten || GYM_CAMPAIGN[0];
  });

  const handleNodeClick = (node: GymNode) => {
    setSelectedGym(node);
    soundManager.playSfx('button');
    soundManager.playVoice(`vs_${node.id}`, `${node.name} aus ${node.city} fordert dich heraus!`);
  };

  const isEarned = (id: BadgeType) => earnedBadges.includes(id);

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden flex flex-col justify-between p-3 sm:p-5 select-none">
      {/* Background Anime Kanto Map Canvas */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/40 via-sky-950/50 to-slate-950 pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-20 flex items-center justify-between bg-slate-900/90 p-3 rounded-2xl border border-slate-700 shadow-xl">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs sm:text-sm border border-slate-600 transition-transform active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Zurück</span>
        </button>

        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-amber-400" />
          <h1 className="text-base sm:text-xl font-black text-white">
            Kanto Arena-Reise
          </h1>
        </div>

        {/* Badges Bar Summary */}
        <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="font-black text-xs text-amber-300">
            {earnedBadges.length} / 8 Orden
          </span>
        </div>
      </div>

      {/* Center: Interactive Kanto Map Area */}
      <div className="relative z-10 flex-1 my-2 bg-slate-900/60 rounded-3xl border-2 border-slate-800 overflow-hidden flex items-center justify-center p-4">
        {/* Simplified Vector Map Illustration of Kanto */}
        <div className="relative w-full max-w-4xl h-full max-h-[500px]">
          {/* Routes connecting cities */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <polyline
              points="20%,55% 20%,30% 55%,22% 55%,45% 38%,48% 55%,65% 48%,82% 22%,85% 10%,18%"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="3"
              strokeDasharray="6,6"
              opacity="0.4"
            />
          </svg>

          {/* Gym Nodes on the Map */}
          {GYM_CAMPAIGN.map((node) => {
            const earned = isEarned(node.id);
            const isSelected = selectedGym.id === node.id;

            return (
              <div
                key={node.id}
                onClick={() => handleNodeClick(node)}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 transform ${
                  isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-20'
                }`}
              >
                <div
                  className={`relative p-1 rounded-full border-3 flex items-center justify-center shadow-2xl ${
                    isSelected
                      ? 'border-white bg-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.9)] animate-bounce'
                      : earned
                      ? 'border-emerald-400 bg-slate-900 shadow-[0_0_12px_rgba(16,185,129,0.7)]'
                      : 'border-slate-600 bg-slate-950 opacity-80'
                  }`}
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-slate-950 p-0.5">
                    <img
                      src={`/images/trainers/${node.avatar}.png`}
                      alt={node.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Badge Marker if Earned */}
                  {earned && (
                    <div className="absolute -top-2 -right-2">
                      <GymBadge type={node.id} earned size="sm" />
                    </div>
                  )}
                </div>

                {/* City & Name Tag */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap bg-slate-950/90 px-2 py-0.5 rounded-lg border border-slate-700 text-[10px] font-black text-white shadow">
                  {node.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Selected Gym Preview Bar */}
      <div className="relative z-20 bg-slate-900/90 p-3 sm:p-4 rounded-3xl border-2 border-amber-400/80 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full border-2 border-amber-400 bg-slate-950 p-1 flex items-center justify-center shadow">
            <img
              src={`/images/trainers/${selectedGym.avatar}.png`}
              alt={selectedGym.name}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white">
                {selectedGym.name}
              </h2>
              <EnergyBadge type={selectedGym.type} size="sm" />
              {isEarned(selectedGym.id) && (
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full">
                  BESIEGT ⭐
                </span>
              )}
            </div>
            <span className="text-xs text-amber-300 font-bold block">
              {selectedGym.city}
            </span>
          </div>
        </div>

        {/* Badge Preview */}
        <div className="flex items-center gap-3">
          <GymBadge type={selectedGym.id} earned={isEarned(selectedGym.id)} size="md" />
          <div className="text-left hidden sm:block">
            <span className="text-[10px] uppercase font-black text-slate-400 block">
              Orden der Arena
            </span>
            <span className="text-xs font-black text-white">
              {GYM_CAMPAIGN.find((g) => g.id === selectedGym.id)?.name}-Orden
            </span>
          </div>
        </div>

        {/* Challenge Button */}
        <button
          onClick={() => {
            soundManager.playSfx('button');
            onSelectGym({
              opponentName: selectedGym.name,
              opponentAvatar: selectedGym.avatar,
              opponentDeckId: selectedGym.deckId,
              arena: selectedGym.arena,
              badgeId: selectedGym.id
            });
          }}
          className="py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-sm sm:text-base shadow-xl flex items-center gap-2 transition-transform active:scale-95 animate-bounce"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>ARENA BETRETEN! ⚡</span>
        </button>
      </div>
    </div>
  );
};
