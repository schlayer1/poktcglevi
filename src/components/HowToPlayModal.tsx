import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ArrowLeft,
  ArrowRight,
  Trophy,
  Zap,
  Shield,
  ArrowUpCircle,
  Swords,
  Crown,
  Sparkles,
  Moon,
  Skull
} from 'lucide-react';
import { soundManager } from '../services/soundManager';

interface HowToPlayModalProps {
  onClose: () => void;
}

interface Chapter {
  id: number;
  title: string;
  subtitle: string;
  voiceKey: string;
  icon: React.ReactNode;
  bgGradient: string;
  borderColor: string;
  accentColor: string;
  badge: string;
  content: string[];
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  const [activeChapterIdx, setActiveChapterIdx] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const autoPlayTimerRef = useRef<number | null>(null);

  const chapters: Chapter[] = [
    {
      id: 1,
      title: 'Wer wird Pokémon-Meister?',
      subtitle: 'Ziel des Spiels: 3 Siegespunkte',
      voiceKey: 'rule_goal',
      icon: <Trophy className="w-12 h-12 text-amber-300 stroke-[2.5]" />,
      bgGradient: 'from-amber-950/80 via-slate-900 to-slate-950',
      borderColor: 'border-amber-400',
      accentColor: 'text-amber-300',
      badge: '🏆 ZIEL DES SPIELS',
      content: [
        'Besiege 3 gegnerische Pokémon, um 3 Siegespunkte zu sammeln!',
        'Jedes normale besiegte Pokémon bringt dir 1 Siegespunkt.',
        'Besiegst du ein mächtiges EX-Pokémon, erhältst du sogar 2 Punkte auf einmal!',
        'Sobald du 3 Punkte hast, gewinnst du den goldenen Siegerpokal! 🎉'
      ]
    },
    {
      id: 2,
      title: 'Energie anlegen',
      subtitle: '1 Energie pro Runde aus der Energiezone',
      voiceKey: 'rule_energy',
      icon: <Zap className="w-12 h-12 text-yellow-300 stroke-[2.5]" />,
      bgGradient: 'from-yellow-950/80 via-slate-900 to-slate-950',
      borderColor: 'border-yellow-400',
      accentColor: 'text-yellow-300',
      badge: '⚡ SCHRITT 1: ENERGIE',
      content: [
        'Jede Runde bekommst du 1 neue Energie in deine Energiezone.',
        'Tippe auf deine Energie und ziehe sie auf ein beliebiges Pokémon.',
        'Pokémon brauchen Energie, um ihre mächtigen Attacken einzusetzen!',
        'Du kannst Energie an dein aktives Pokémon oder an deine Bank anlegen.'
      ]
    },
    {
      id: 3,
      title: 'Deine Pokémon-Bank',
      subtitle: 'Bis zu 3 Pokémon auf der Ersatzbank',
      voiceKey: 'rule_bench',
      icon: <Shield className="w-12 h-12 text-sky-300 stroke-[2.5]" />,
      bgGradient: 'from-sky-950/80 via-slate-900 to-slate-950',
      borderColor: 'border-sky-400',
      accentColor: 'text-sky-300',
      badge: '🪑 SCHRITT 2: DIE BANK',
      content: [
        'Auf deiner Bank können bis zu 3 Basis-Pokémon Platz nehmen.',
        'Tippe auf eine Basis-Karte in deiner Hand, um sie auf die Bank zu setzen.',
        'Auf der Bank können Pokémon sicher Energie sammeln, während vorne gekämpft wird.',
        'Geht dein aktives Pokémon K.O., schickst du sofort ein Pokémon von der Bank nach vorne!'
      ]
    },
    {
      id: 4,
      title: 'Pokémon entwickeln',
      subtitle: 'Aus Glumanda wird Glutexo und Glurak!',
      voiceKey: 'rule_evolve',
      icon: <ArrowUpCircle className="w-12 h-12 text-emerald-300 stroke-[2.5]" />,
      bgGradient: 'from-emerald-950/80 via-slate-900 to-slate-950',
      borderColor: 'border-emerald-400',
      accentColor: 'text-emerald-300',
      badge: '🆙 SCHRITT 3: ENTWICKLUNG',
      content: [
        'Hast du eine Entwicklungsstufe auf der Hand (z.B. Glutexo für Glumanda)?',
        'Tippe auf die Karte und lege sie direkt auf das passende Pokémon!',
        'Durch die Entwicklung bekommt dein Pokémon mehr Kraftpunkte und stärkere Attacken.',
        'Bereits angelegte Energien bleiben bei der Entwicklung voll erhalten!'
      ]
    },
    {
      id: 5,
      title: 'Angreifen & Schaden',
      subtitle: 'Attacken wählen und Treffer landen',
      voiceKey: 'rule_attack',
      icon: <Swords className="w-12 h-12 text-rose-300 stroke-[2.5]" />,
      bgGradient: 'from-rose-950/80 via-slate-900 to-slate-950',
      borderColor: 'border-rose-400',
      accentColor: 'text-rose-300',
      badge: '💥 SCHRITT 4: ANGRIFF',
      content: [
        'Prüfe, ob dein aktives Pokémon genug Energie für seine Attacke hat.',
        'Tippe einmal auf die Attacke für die Voransicht, und ein zweites Mal zum Feuern!',
        'Triffst du die Schwäche des Gegners (z.B. Wasser gegen Feuer), machst du +20 Extraschaden!',
        'Ein Angriff beendet deinen Spielzug – danach ist der Gegner an der Reihe.'
      ]
    },
    {
      id: 6,
      title: 'K.O. & Siegespunkte',
      subtitle: 'Wenn die Kraftpunkte auf 0 sinken',
      voiceKey: 'rule_ko',
      icon: <Crown className="w-12 h-12 text-purple-300 stroke-[2.5]" />,
      bgGradient: 'from-purple-950/80 via-slate-900 to-slate-950',
      borderColor: 'border-purple-400',
      accentColor: 'text-purple-300',
      badge: '🥊 SCHRITT 5: K.O. & SIEG',
      content: [
        'Sinkt die KP-Leiste des Gegners auf 0, ist das Pokémon kampfunfähig (K.O.)!',
        'Du erhältst sofort 1 Siegespunkt (bei EX-Pokémon sogar 2 Punkte!).',
        'Der Gegner muss sofort ein Ersatz-Pokémon von seiner Bank ins Spiel schicken.',
        'Hat der Gegner keine Pokémon mehr auf der Bank, hast du sofort gewonnen!'
      ]
    },
    {
      id: 7,
      title: 'Schlaf, Gift & Paralyse',
      subtitle: 'Besondere Zustände im Kampf',
      voiceKey: 'rule_status',
      icon: <Moon className="w-12 h-12 text-indigo-300 stroke-[2.5]" />,
      bgGradient: 'from-indigo-950/80 via-slate-900 to-slate-950',
      borderColor: 'border-indigo-400',
      accentColor: 'text-indigo-300',
      badge: '💤 ZUSTÄNDE EINFACH ERKLÄRT',
      content: [
        '💤 SCHLAF: Das Pokémon schläft ein und kann nicht angreifen. Am Rundenende entscheidet eine Münze, ob es aufwacht!',
        '☠️ GIFT: Das Pokémon leidet unter Gift und verliert jede Runde 10 Kraftpunkte.',
        '⚡ PARALYSE: Ein elektrischer Schock! Das Pokémon muss eine Runde pausieren und kann danach wieder kämpfen.',
        'Tippe im Kampf auf die Status-Plakette am Pokémon, um dir die Erklärung vorlesen zu lassen!'
      ]
    }
  ];

  const currentChapter = chapters[activeChapterIdx];

  // Play voice when chapter changes or on request
  const playCurrentVoice = () => {
    soundManager.stopVoice();
    soundManager.playVoice(currentChapter.voiceKey);
  };

  const handleSelectChapter = (idx: number) => {
    soundManager.playSfx('button');
    setActiveChapterIdx(idx);
    setIsAutoPlaying(false);
    if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
    soundManager.playVoice(chapters[idx].voiceKey);
  };

  const handleNext = () => {
    if (activeChapterIdx < chapters.length - 1) {
      handleSelectChapter(activeChapterIdx + 1);
    }
  };

  const handlePrev = () => {
    if (activeChapterIdx > 0) {
      handleSelectChapter(activeChapterIdx - 1);
    }
  };

  // Autoplay mode
  const toggleAutoPlay = () => {
    if (isAutoPlaying) {
      setIsAutoPlaying(false);
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
      soundManager.stopVoice();
    } else {
      setIsAutoPlaying(true);
      playCurrentVoice();
    }
  };

  // Initial welcome voice on mount
  useEffect(() => {
    soundManager.playVoice('rule_welcome');
    return () => {
      soundManager.stopVoice();
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
    };
  }, []);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 p-safe animate-in fade-in duration-200 select-none overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-2xl w-full my-auto overflow-visible"
      >
        {/* Overlapping 3D Close Button in Front Layer */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 z-50 w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-tr from-rose-600 to-rose-400 hover:from-rose-500 hover:to-rose-300 text-white border-3 border-white rounded-full flex items-center justify-center shadow-[0_8px_25px_rgba(0,0,0,0.75)] transition-all duration-200 hover:scale-110 active:scale-95 z-50 cursor-pointer"
          title="Schließen"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
        </button>

        <div
          className={`w-full max-h-[90dvh] bg-gradient-to-b ${currentChapter.bgGradient} border-3 ${currentChapter.borderColor} rounded-3xl p-4 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col justify-between gap-3 sm:gap-5 transition-all duration-300 text-white overflow-y-auto`}
        >

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/80 pb-3">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                Levis Pokémon-Fahrschule
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow">
                Wie spielt man? 📖
              </h2>
            </div>
          </div>

          {/* Autoplay & Audio Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleAutoPlay}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-xs border shadow transition-all active:scale-95 cursor-pointer ${
                isAutoPlaying
                  ? 'bg-amber-400 text-slate-950 border-white shadow-[0_0_15px_rgba(251,191,36,0.8)] animate-pulse'
                  : 'bg-slate-800 text-slate-200 border-slate-600 hover:bg-slate-700'
              }`}
            >
              {isAutoPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isAutoPlaying ? 'Pause' : '▶️ Alles vorlesen'}</span>
            </button>

            <button
              onClick={playCurrentVoice}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs border border-white shadow-[0_0_15px_rgba(251,191,36,0.7)] hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>Vorlesen 🔊</span>
            </button>
          </div>
        </div>

        {/* 7 Chapter Step Pills Navigation */}
        <div className="flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto py-1">
          {chapters.map((ch, idx) => {
            const isActive = idx === activeChapterIdx;
            return (
              <button
                key={ch.id}
                onClick={() => handleSelectChapter(idx)}
                className={`flex-1 py-1.5 sm:py-2 px-1 rounded-xl text-[10px] sm:text-xs font-black transition-all flex flex-col items-center gap-0.5 border cursor-pointer ${
                  isActive
                    ? 'bg-white text-slate-950 border-white shadow-[0_0_15px_rgba(255,255,255,0.7)] scale-105'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-600'
                }`}
              >
                <span>{ch.id}</span>
                <span className="hidden sm:inline truncate max-w-[70px]">{ch.title.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Main Chapter Card Content */}
        <div className="relative bg-slate-950/70 border border-slate-800 rounded-3xl p-5 sm:p-6 backdrop-blur-md shadow-2xl flex flex-col gap-4">
          {/* Badge & Big Icon */}
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-slate-900 border ${currentChapter.borderColor} ${currentChapter.accentColor}`}>
              {currentChapter.badge}
            </span>

            <div className={`w-16 h-16 rounded-2xl bg-slate-900/90 border-2 ${currentChapter.borderColor} p-2 flex items-center justify-center shadow-lg`}>
              {currentChapter.icon}
            </div>
          </div>

          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white drop-shadow">
              {currentChapter.title}
            </h3>
            <p className={`text-xs sm:text-sm font-extrabold ${currentChapter.accentColor} mt-0.5`}>
              {currentChapter.subtitle}
            </p>
          </div>

          {/* Child-friendly bullet points */}
          <div className="space-y-2.5 my-1">
            {currentChapter.content.map((point, pIdx) => (
              <div key={pIdx} className="flex items-start gap-2.5 bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800/80">
                <span className="text-sm font-black text-amber-400 mt-0.5">⭐</span>
                <p className="text-xs sm:text-sm font-bold text-slate-200 leading-snug">
                  {point}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="flex items-center justify-between pt-1">
          <button
            disabled={activeChapterIdx === 0}
            onClick={handlePrev}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm border transition-all active:scale-95 cursor-pointer ${
              activeChapterIdx > 0
                ? 'bg-slate-800 text-white border-slate-600 hover:bg-slate-700'
                : 'bg-slate-900 text-slate-600 border-slate-800 opacity-40 cursor-not-allowed'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Zurück</span>
          </button>

          <span className="text-xs font-extrabold text-slate-400">
            Regel {activeChapterIdx + 1} von {chapters.length}
          </span>

          <button
            disabled={activeChapterIdx === chapters.length - 1}
            onClick={handleNext}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm border transition-all active:scale-95 cursor-pointer ${
              activeChapterIdx < chapters.length - 1
                ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 border-white shadow-[0_0_15px_rgba(251,191,36,0.8)] hover:scale-105'
                : 'bg-slate-900 text-slate-600 border-slate-800 opacity-40 cursor-not-allowed'
            }`}
          >
            <span>Weiter</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};
