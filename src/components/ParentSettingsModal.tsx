import React, { useState } from 'react';
import { X, Volume2, VolumeX, ShieldCheck, RotateCcw, Download, Upload, Sparkles, Clock, Trophy } from 'lucide-react';
import { soundManager } from '../services/soundManager';
import { storageService, UserProfile } from '../services/storageService';
import { Card } from '../types/game';

interface ParentSettingsModalProps {
  allCards: Card[];
  onClose: () => void;
  onResetMatch: () => void;
  ruleLevel: 1 | 2 | 3;
  onSetRuleLevel: (lvl: 1 | 2 | 3) => void;
  aiDifficulty: 'leicht' | 'normal' | 'schlau';
  onSetAiDifficulty: (d: 'leicht' | 'normal' | 'schlau') => void;
}

export const ParentSettingsModal: React.FC<ParentSettingsModalProps> = ({
  allCards,
  onClose,
  onResetMatch,
  ruleLevel,
  onSetRuleLevel,
  aiDifficulty,
  onSetAiDifficulty
}) => {
  const [unlocked, setUnlocked] = useState(false);
  const [num1] = useState(Math.floor(Math.random() * 4) + 4);
  const [num2] = useState(Math.floor(Math.random() * 4) + 3);
  const [userAnswer, setUserAnswer] = useState('');
  const [errorMsg, setErrorMsg] = useState(false);

  const [muted, setMuted] = useState(soundManager.isMuted());
  const [bgmMuted, setBgmMuted] = useState(soundManager.isBgmMuted());
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

  const handleExport = () => {
    const json = storageService.exportSavegame();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `poktcglevi_spielstand_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        const ok = storageService.importSavegame(text, allCards);
        if (ok) {
          alert('Spielstand erfolgreich geladen!');
          window.location.reload();
        } else {
          alert('Fehler beim Laden des Spielstands.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleUnlockChapters = () => {
    if (confirm('Möchtest du alle 8 Arenen und das Champ-Duell gegen Gary für Levi freischalten?')) {
      storageService.unlockAllChapters();
      alert('Alle Kapitel und Orden freigeschaltet! Levi kann nun jeden Arenaleiter herausfordern.');
    }
  };

  const handleUnlockAll = () => {
    if (confirm('Wirklich alle 255 Karten für Levi freischalten?')) {
      storageService.unlockAllCards(allCards);
      alert('Alle Karten freigeschaltet! Viel Spaß beim Sammeln & Deckbauen!');
    }
  };

  const handleResetSave = () => {
    if (confirm('Möchtest du den gesamten Spielstand wirklich auf den Anfangszustand zurücksetzen?')) {
      storageService.resetSavegame(allCards);
      alert('Spielstand zurückgesetzt.');
      window.location.reload();
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-md w-full bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 text-white my-auto max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-amber-400" />
          <h2 className="text-xl font-black text-amber-300">Eltern-Einstellungen</h2>
        </div>

        {!unlocked ? (
          <form onSubmit={handleVerify} className="space-y-4">
            <p className="text-sm text-slate-300">
              Kindersicherung: Bitte einfache Rechenaufgabe lösen:
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
              placeholder="Ergebnis"
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
              Einstellungen öffnen
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            {/* 1. Regelstufe Switcher */}
            <div className="space-y-2 bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700">
              <span className="font-black text-sm block text-amber-300">
                Regelstufe (Schwierigkeitsgrad)
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { lvl: 1, label: 'Stufe 1', sub: 'Mini (Basis)' },
                  { lvl: 2, label: 'Stufe 2', sub: 'Profi (+Evo)' },
                  { lvl: 3, label: 'Stufe 3', sub: 'Meister (+Items)' }
                ].map((s) => (
                  <button
                    key={s.lvl}
                    onClick={() => onSetRuleLevel(s.lvl as 1 | 2 | 3)}
                    className={`py-2 px-2 rounded-xl text-center border transition-all ${
                      ruleLevel === s.lvl
                        ? 'bg-amber-400 text-slate-950 border-white shadow-md font-black'
                        : 'bg-slate-900 text-slate-300 border-slate-700 font-bold'
                    }`}
                  >
                    <span className="text-xs block">{s.label}</span>
                    <span className="text-[10px] opacity-80 block">{s.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Audio & Musik */}
            <div className="space-y-2 bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">Musik & Geräusche</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const next = soundManager.toggleBgmMute();
                      setBgmMuted(next);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${
                      bgmMuted ? 'bg-rose-500/20 text-rose-300 border-rose-500' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                    }`}
                  >
                    {bgmMuted ? 'Musik: Aus' : 'Musik: An'}
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={vol}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setVol(val);
                  soundManager.setVolume(val);
                }}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* 3. KI Stärke */}
            <div className="space-y-2 bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700">
              <span className="font-bold text-sm block">Gegnerstärke</span>
              <div className="grid grid-cols-3 gap-2">
                {(['leicht', 'normal', 'schlau'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => onSetAiDifficulty(d)}
                    className={`py-1.5 px-2 rounded-xl text-xs capitalize font-bold border ${
                      aiDifficulty === d
                        ? 'bg-amber-400 text-slate-950 border-white shadow'
                        : 'bg-slate-900 text-slate-400 border-slate-700'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Spielstand Export / Import */}
            <div className="space-y-2 bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700">
              <span className="font-bold text-sm block">Spielstand-Sicherung</span>
              <div className="flex gap-2">
                <button
                  onClick={handleExport}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-950 border border-slate-600 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Speichern</span>
                </button>

                <label className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-950 border border-slate-600 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-sky-400" />
                  <span>Laden</span>
                  <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                </label>
              </div>
            </div>

            {/* 5. Special Options / Cheats */}
            <div className="space-y-2 bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700">
              <span className="font-bold text-sm block text-amber-300">Freischaltungen & Cheats</span>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleUnlockChapters}
                  className="w-full py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300 text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow"
                >
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Alle Kapitel & Arenaleiter freischalten</span>
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={handleUnlockAll}
                    className="flex-1 py-2 px-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 text-purple-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                    <span>Alle Karten freischalten</span>
                  </button>

                  <button
                    onClick={handleResetSave}
                    className="py-2 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-bold cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
