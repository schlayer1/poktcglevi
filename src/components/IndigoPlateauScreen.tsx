import React from 'react';
import { BadgeType, GymBadge } from './GymBadge';
import { EnergyBadge } from './EnergyBadge';
import { ArenaType } from './ArenaBackground';
import { storageService } from '../services/storageService';
import { soundManager } from '../services/soundManager';
import { ArrowLeft, Trophy, Swords, Lock, CheckCircle2, Sparkles, Shield, Flame } from 'lucide-react';

export interface EliteFourTrainer {
  id: BadgeType;
  order: number;
  chamberNumber: number;
  name: string;
  title: string;
  specialty: string;
  avatar: string;
  aceName: string;
  aceDexId: number;
  deckId: string;
  arena: ArenaType;
  primaryColor: string;
  glowColor: string;
  quote: string;
}

export const ELITE_FOUR: EliteFourTrainer[] = [
  {
    id: 'lorelei',
    order: 9,
    chamberNumber: 1,
    name: 'Lorelei',
    title: 'Eis- & Wasser-Meisterin',
    specialty: 'Eis & Wasser',
    avatar: 'lorelei',
    aceName: 'Lapras',
    aceDexId: 131,
    deckId: 'deck_lorelei',
    arena: 'lorelei',
    primaryColor: 'from-cyan-500/30 to-blue-600/30 border-cyan-400',
    glowColor: 'shadow-[0_0_25px_rgba(6,182,212,0.4)]',
    quote: '„Hüte dich vor eisiger Kälte! Mein Lapras und Arktos sind unaufhaltsam!“'
  },
  {
    id: 'bruno',
    order: 10,
    chamberNumber: 2,
    name: 'Bruno',
    title: 'Faust- & Kampf-Meister',
    specialty: 'Kampf & Stein',
    avatar: 'bruno',
    aceName: 'Machomei',
    aceDexId: 68,
    deckId: 'deck_bruno',
    arena: 'bruno',
    primaryColor: 'from-amber-600/30 to-orange-700/30 border-amber-500',
    glowColor: 'shadow-[0_0_25px_rgba(245,158,11,0.4)]',
    quote: '„Reine Muskelkraft und eiserner Wille! Zeig mir, was du gelernt hast!“'
  },
  {
    id: 'agathe',
    order: 11,
    chamberNumber: 3,
    name: 'Agathe',
    title: 'Geist- & Gift-Meisterin',
    specialty: 'Geist & Gift',
    avatar: 'agathe',
    aceName: 'Gengar',
    aceDexId: 94,
    deckId: 'deck_agathe',
    arena: 'agathe',
    primaryColor: 'from-purple-600/30 to-fuchsia-800/30 border-purple-400',
    glowColor: 'shadow-[0_0_25px_rgba(168,85,247,0.4)]',
    quote: '„Erschrickst du vor Schatten? Mein Gengar kennt keine Gnade!“'
  },
  {
    id: 'siegfried',
    order: 12,
    chamberNumber: 4,
    name: 'Siegfried',
    title: 'Gebieter der Drachen',
    specialty: 'Drache & Flug',
    avatar: 'siegfried',
    aceName: 'Dragoran',
    aceDexId: 149,
    deckId: 'deck_siegfried',
    arena: 'siegfried',
    primaryColor: 'from-rose-600/30 to-red-800/30 border-rose-500',
    glowColor: 'shadow-[0_0_25px_rgba(244,63,94,0.4)]',
    quote: '„Drachen sind erhaben und voller Kraft! Nur ein wahrer Meister kann sie bezwingen!“'
  }
];

export const CHAMPION_GARY: EliteFourTrainer = {
  id: 'gary',
  order: 13,
  chamberNumber: 5,
  name: 'Champ Gary',
  title: 'Kanto-Liga Champion',
  specialty: 'Allrounder-Meister',
  avatar: 'gary',
  aceName: 'Turtok',
  aceDexId: 9,
  deckId: 'deck_gary_champion',
  arena: 'gary',
  primaryColor: 'from-amber-400/40 via-yellow-500/30 to-amber-600/40 border-yellow-300',
  glowColor: 'shadow-[0_0_40px_rgba(251,191,36,0.6)]',
  quote: '„Ich bin der stärkste Trainer der Welt! Das Finale entscheidet alles, Levi!“'
};

interface IndigoPlateauScreenProps {
  onBack: () => void;
  onSelectBattle: (config: {
    opponentName: string;
    opponentAvatar: string;
    opponentDeckId: string;
    arena: ArenaType;
    badgeId: BadgeType;
  }) => void;
  onOpenSettings?: () => void;
}

export const IndigoPlateauScreen: React.FC<IndigoPlateauScreenProps> = ({
  onBack,
  onSelectBattle,
  onOpenSettings
}) => {
  const profile = storageService.loadProfile([]);
  const earnedBadges = profile.badges || [];

  // Check which chambers are beaten
  const isLoreleiBeaten = earnedBadges.includes('lorelei');
  const isBrunoBeaten = earnedBadges.includes('bruno');
  const isAgatheBeaten = earnedBadges.includes('agathe');
  const isSiegfriedBeaten = earnedBadges.includes('siegfried');
  const isGaryBeaten = earnedBadges.includes('gary');

  // Sequential unlock logic (with bypass for allChaptersUnlocked)
  const isTrainerUnlocked = (trainer: EliteFourTrainer) => {
    if (profile.allChaptersUnlocked) return true;
    if (trainer.id === 'lorelei') return true; // Lorelei always open in Elite Four
    if (trainer.id === 'bruno') return isLoreleiBeaten;
    if (trainer.id === 'agathe') return isBrunoBeaten;
    if (trainer.id === 'siegfried') return isAgatheBeaten;
    if (trainer.id === 'gary') return isLoreleiBeaten && isBrunoBeaten && isAgatheBeaten && isSiegfriedBeaten;
    return false;
  };

  const allEliteFourBeaten = isLoreleiBeaten && isBrunoBeaten && isAgatheBeaten && isSiegfriedBeaten;

  const handleStartBattle = (trainer: EliteFourTrainer) => {
    const unlocked = isTrainerUnlocked(trainer);
    if (!unlocked) {
      soundManager.playVoice('gym_locked', 'Dieser Saal ist noch verschlossen! Besiege zuerst den vorherigen Meister!');
      return;
    }

    soundManager.playSfx('button');
    if (trainer.id === 'gary') {
      soundManager.playVoice('vs_gary_champ', `${trainer.name} erwartet dich zum Finale!`);
    } else {
      soundManager.playVoice(`vs_${trainer.id}`, `${trainer.name} fordert dich heraus!`);
    }

    onSelectBattle({
      opponentName: trainer.name,
      opponentAvatar: trainer.avatar,
      opponentDeckId: trainer.deckId,
      arena: trainer.arena,
      badgeId: trainer.id
    });
  };

  return (
    <div className="relative w-full h-full h-dvh bg-slate-950 overflow-hidden flex flex-col justify-between p-safe select-none font-sans text-white">
      {/* 1. Dramatic League Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/arenas/stadium.webp"
          alt="Indigo Plateau"
          className="w-full h-full object-cover object-center filter brightness-[0.6] contrast-[1.15]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/60 to-slate-950/95" />
        <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-slate-950/80 pointer-events-none" />
      </div>

      {/* 2. Top Header Navigation */}
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-6 pt-3 pb-2 border-b border-amber-500/30 bg-slate-950/70 backdrop-blur-md">
        <button
          onClick={() => {
            soundManager.playSfx('button');
            onBack();
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 hover:bg-slate-700 active:scale-95 text-xs sm:text-sm font-bold text-amber-300 shadow-md transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Kanto-Karte</span>
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5">
            <Trophy className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-bounce" />
            <h1 className="text-base sm:text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 drop-shadow">
              INDIGO PLATEAU • TOP VIER
            </h1>
          </div>
          <p className="text-[11px] text-amber-200/80 font-medium">
            Levis Meisterschafts-Prüfung • 4 Säle bis zum Thronsaal
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isGaryBeaten && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-[11px] font-bold text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
              <span>Kanto Champ!</span>
            </div>
          )}
        </div>
      </header>

      {/* 3. Main Center Stage: 4 Elite Four Chambers + Golden Champion Gate */}
      <main className="relative z-10 flex-1 overflow-y-auto px-4 py-3 flex flex-col justify-center max-w-6xl mx-auto w-full gap-4">
        
        {/* Top Feature: Golden Champion Gate (Gary) */}
        <section
          onClick={() => allEliteFourBeaten && handleStartBattle(CHAMPION_GARY)}
          className={`relative rounded-2xl border-2 p-3 sm:p-4 transition-all duration-300 cursor-pointer overflow-hidden ${
            allEliteFourBeaten
              ? 'bg-gradient-to-r from-amber-950/80 via-yellow-900/60 to-amber-950/80 border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.5)] hover:scale-[1.01] active:scale-[0.99]'
              : 'bg-slate-900/80 border-slate-700/80 opacity-75'
          }`}
        >
          {/* Subtle background glow */}
          {allEliteFourBeaten && (
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-amber-400/20 to-yellow-500/10 animate-pulse pointer-events-none" />
          )}

          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Champion Avatar */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-950 border-2 border-amber-400/60 p-1 flex items-center justify-center overflow-hidden shadow-lg flex-shrink-0">
                <img
                  src="/images/trainers/gary.png"
                  alt="Gary"
                  className="w-full h-full object-contain filter drop-shadow"
                />
                {isGaryBeaten ? (
                  <div className="absolute top-1 right-1 bg-emerald-500 rounded-full p-0.5 shadow">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                ) : !allEliteFourBeaten ? (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Lock className="w-6 h-6 text-slate-400" />
                  </div>
                ) : null}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/30 border border-amber-400/50 text-amber-300">
                    🏆 Thronsaal des Meisters
                  </span>
                  {isGaryBeaten && (
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Besiegt!
                    </span>
                  )}
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-white flex items-center gap-2 mt-0.5">
                  <span>Champ Gary</span>
                  <span className="text-xs sm:text-sm text-amber-300/90 font-bold">
                    (Partner: Turtok-ex)
                  </span>
                </h2>
                <p className="text-xs text-amber-100/70 hidden sm:block italic">
                  {allEliteFourBeaten
                    ? '„Das große Finale wartet! Zeig Gary, dass Levi der wahre Pokémon-Meister ist!“'
                    : 'Besiege zuerst Lorelei, Bruno, Agathe und Siegfried, um das goldene Tor zu öffnen!'}
                </p>
              </div>
            </div>

            {/* Action CTA */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {allEliteFourBeaten ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartBattle(CHAMPION_GARY);
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 active:scale-95 font-black text-slate-950 text-sm shadow-[0_0_20px_rgba(251,191,36,0.6)] transition-all"
                >
                  <Swords className="w-4 h-4" />
                  <span>{isGaryBeaten ? 'Erneut herausfordern' : 'Finalkampf starten!'}</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 text-xs text-slate-400 font-bold px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <Lock className="w-4 h-4 text-amber-500/70" />
                  <span>Tor versiegelt (4 Meister fehlen)</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 4 Thematic Chambers Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ELITE_FOUR.map((trainer) => {
            const unlocked = isTrainerUnlocked(trainer);
            const isBeaten = earnedBadges.includes(trainer.id);

            return (
              <div
                key={trainer.id}
                onClick={() => handleStartBattle(trainer)}
                className={`relative rounded-2xl border-2 p-3.5 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer ${
                  trainer.primaryColor
                } ${unlocked ? `${trainer.glowColor} hover:scale-[1.02] active:scale-[0.98]` : 'opacity-60 grayscale-[40%] bg-slate-950/60 border-slate-800'}`}
              >
                {/* Chamber Header */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-black text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full bg-slate-950/80 border border-white/10 text-slate-200">
                      Saal {trainer.chamberNumber}
                    </span>
                    {isBeaten ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40">
                        <CheckCircle2 className="w-3 h-3" /> Besiegt
                      </span>
                    ) : unlocked ? (
                      <span className="text-[11px] font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/30">
                        Offen
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded-full">
                        <Lock className="w-3 h-3" /> Gesperrt
                      </span>
                    )}
                  </div>

                  {/* Trainer Avatar & Info */}
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-xl bg-slate-950/80 border border-white/20 p-1 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md">
                      <img
                        src={`/images/trainers/${trainer.avatar}.png`}
                        alt={trainer.name}
                        className="w-full h-full object-contain filter drop-shadow"
                      />
                    </div>
                    <div>
                      <h3 className="font-black text-base text-white leading-tight">
                        {trainer.name}
                      </h3>
                      <p className="text-[11px] text-slate-300 font-medium">
                        {trainer.title}
                      </p>
                      <p className="text-[10px] text-amber-300/90 font-bold mt-0.5">
                        Ace: {trainer.aceName}
                      </p>
                    </div>
                  </div>

                  {/* Quote */}
                  <p className="text-[11px] text-slate-300/80 italic mt-2.5 line-clamp-2">
                    {trainer.quote}
                  </p>
                </div>

                {/* Bottom Action Button */}
                <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <GymBadge type={trainer.id} earned={isBeaten} size="sm" />
                    <span className="text-[10px] font-bold text-slate-300">
                      {isBeaten ? 'Siegel aktiv' : 'Siegel offen'}
                    </span>
                  </div>

                  {unlocked ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartBattle(trainer);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-bold text-white transition-all shadow"
                    >
                      <Swords className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isBeaten ? 'Kämpfen' : 'Herausfordern'}</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Lock className="w-3 h-3" />
                      <span>Gesperrt</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      </main>

      {/* 4. Bottom Footer Info Bar */}
      <footer className="relative z-10 px-4 py-2 border-t border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-400" />
          <span>Sanfter Modus: Besiegte Meister bleiben dauerhaft besiegt!</span>
        </div>
        <div className="font-bold text-amber-300/90">
          Fortschritt: {earnedBadges.filter((b) => ['lorelei', 'bruno', 'agathe', 'siegfried', 'gary'].includes(b)).length} / 5 Meister besiegt
        </div>
      </footer>
    </div>
  );
};
