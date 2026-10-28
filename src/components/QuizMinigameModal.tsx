import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Card } from '../types/game';
import { soundManager } from '../services/soundManager';
import { storageService } from '../services/storageService';
import { Sparkles, Trophy, Volume2, CheckCircle2, XCircle, ArrowRight, RotateCcw, X, Star, Award } from 'lucide-react';

interface QuizMinigameModalProps {
  allCards: Card[];
  onClose: () => void;
  onOpenBoosters?: () => void;
}

interface Question {
  id: number;
  type: 'cry' | 'evolve' | 'weakness';
  prompt: string;
  subPrompt?: string;
  targetDexId?: number;
  options: {
    card: Card;
    label: string;
    isCorrect: boolean;
  }[];
}

export const QuizMinigameModal: React.FC<QuizMinigameModalProps> = ({
  allCards,
  onClose,
  onOpenBoosters
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIdx, setCurrentQIdx] = useState<number>(0);
  const [selectedOptIdx, setSelectedOptIdx] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Generate 5 questions on mount
  useEffect(() => {
    soundManager.playVoice(
      'quiz_welcome',
      'Willkommen zu Professor Eichs Pokémon-Quiz! Hör gut zu und zeig mir, wie gut du die Pokémon kennst!'
    );

    const generated: Question[] = [];
    const basisCards = allCards.filter((c) => c.stage === 'Basis' && !c.isEx);
    const evoCards = allCards.filter((c) => c.evolvesFrom && c.stage !== 'Basis');

    // Q1: Guess Cry
    const cryCandidate = basisCards[Math.floor(Math.random() * basisCards.length)] || allCards[0];
    const wrong1 = basisCards.filter((c) => c.dexId !== cryCandidate.dexId);
    const wrongCry1 = wrong1[Math.floor(Math.random() * wrong1.length)] || allCards[1];
    const wrongCry2 = wrong1.filter((c) => c.dexId !== wrongCry1.dexId)[0] || allCards[2];
    const cryOptions = [
      { card: cryCandidate, label: cryCandidate.name, isCorrect: true },
      { card: wrongCry1, label: wrongCry1.name, isCorrect: false },
      { card: wrongCry2, label: wrongCry2.name, isCorrect: false }
    ].sort(() => Math.random() - 0.5);

    generated.push({
      id: 1,
      type: 'cry',
      prompt: 'Hör gut hin! Welches Pokémon macht diesen Ruf?',
      subPrompt: 'Tippe auf den Lautsprecher, um den Ruf noch einmal zu hören!',
      targetDexId: cryCandidate.dexId,
      options: cryOptions
    });

    // Q2: Evolution Quiz
    const evoTarget = evoCards[Math.floor(Math.random() * evoCards.length)] || evoCards[0];
    const baseTarget = allCards.find((c) => c.name === evoTarget.evolvesFrom) || basisCards[0];
    const wrongEvoCandidates = evoCards.filter((c) => c.name !== evoTarget.name);
    const wrongEvo1 = wrongEvoCandidates[0] || allCards[3];
    const wrongEvo2 = wrongEvoCandidates[1] || allCards[4];
    const evoOptions = [
      { card: evoTarget, label: evoTarget.name, isCorrect: true },
      { card: wrongEvo1, label: wrongEvo1.name, isCorrect: false },
      { card: wrongEvo2, label: wrongEvo2.name, isCorrect: false }
    ].sort(() => Math.random() - 0.5);

    generated.push({
      id: 2,
      type: 'evolve',
      prompt: `Wer entwickelt sich aus ${baseTarget.name}?`,
      subPrompt: 'Finde die richtige nächste Entwicklungsstufe!',
      options: evoOptions
    });

    // Q3: Type effectiveness (Wasser schlägt Feuer, Elektro schlägt Wasser, Feuer schlägt Pflanze)
    const typeRiddles = [
      { attacker: 'Schiggy (Wasser)', defender: 'Glumanda (Feuer)', correctType: 'Wasser', wrong: ['Pflanze', 'Feuer'] },
      { attacker: 'Pikachu (Elektro)', defender: 'Garados (Wasser)', correctType: 'Elektro', wrong: ['Pflanze', 'Psycho'] },
      { attacker: 'Glumanda (Feuer)', defender: 'Bisasam (Pflanze)', correctType: 'Feuer', wrong: ['Wasser', 'Elektro'] }
    ];
    const riddle = typeRiddles[Math.floor(Math.random() * typeRiddles.length)];
    const matchingCard = allCards.find((c) => c.types.includes(riddle.correctType as any)) || allCards[0];
    const wrongCard1 = allCards.find((c) => c.types.includes(riddle.wrong[0] as any)) || allCards[1];
    const wrongCard2 = allCards.find((c) => c.types.includes(riddle.wrong[1] as any)) || allCards[2];
    const typeOptions = [
      { card: matchingCard, label: `${matchingCard.name} (${riddle.correctType})`, isCorrect: true },
      { card: wrongCard1, label: `${wrongCard1.name} (${riddle.wrong[0]})`, isCorrect: false },
      { card: wrongCard2, label: `${wrongCard2.name} (${riddle.wrong[1]})`, isCorrect: false }
    ].sort(() => Math.random() - 0.5);

    generated.push({
      id: 3,
      type: 'weakness',
      prompt: `Welches Pokémon teilt extra viel Schaden gegen ${riddle.defender} aus?`,
      subPrompt: 'Denke an die Typen-Vorteile!',
      options: typeOptions
    });

    // Q4: Second Cry
    const cryCandidate2 = basisCards.filter((c) => c.dexId !== cryCandidate.dexId)[Math.floor(Math.random() * 20)] || basisCards[2];
    const wrong2 = basisCards.filter((c) => c.dexId !== cryCandidate2.dexId);
    const wrongCry3 = wrong2[0] || allCards[5];
    const wrongCry4 = wrong2[1] || allCards[6];
    const cryOptions2 = [
      { card: cryCandidate2, label: cryCandidate2.name, isCorrect: true },
      { card: wrongCry3, label: wrongCry3.name, isCorrect: false },
      { card: wrongCry4, label: wrongCry4.name, isCorrect: false }
    ].sort(() => Math.random() - 0.5);

    generated.push({
      id: 4,
      type: 'cry',
      prompt: 'Zweites Ruf-Rätsel: Zu wem gehört dieser Sound?',
      subPrompt: 'Hör genau hin!',
      targetDexId: cryCandidate2.dexId,
      options: cryOptions2
    });

    // Q5: Big Legend / Boss Riddle
    const legendCandidates = allCards.filter((c) => c.hp >= 120 || c.isEx);
    const legendTarget = legendCandidates[Math.floor(Math.random() * legendCandidates.length)] || allCards[0];
    const wrongLegends = allCards.filter((c) => c.id !== legendTarget.id && c.stage === 'Basis');
    const legendOptions = [
      { card: legendTarget, label: legendTarget.name, isCorrect: true },
      { card: wrongLegends[0] || allCards[7], label: wrongLegends[0]?.name || 'Pikachu', isCorrect: false },
      { card: wrongLegends[1] || allCards[8], label: wrongLegends[1]?.name || 'Evoli', isCorrect: false }
    ].sort(() => Math.random() - 0.5);

    generated.push({
      id: 5,
      type: 'weakness',
      prompt: `Meister-Frage: Wer besitzt gewaltige ${legendTarget.hp} Kraftpunkte?`,
      subPrompt: 'Ein mächtiger Partner für dein Deck!',
      options: legendOptions
    });

    setQuestions(generated);
  }, [allCards]);

  const currentQ = questions[currentQIdx];

  // Play cry automatically when a cry question appears
  useEffect(() => {
    if (currentQ && currentQ.type === 'cry' && currentQ.targetDexId) {
      const timer = setTimeout(() => {
        soundManager.playCry(currentQ.targetDexId!);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentQIdx, currentQ]);

  const handleSelectOption = (idx: number) => {
    if (isAnswerChecked) return;
    setSelectedOptIdx(idx);
    setIsAnswerChecked(true);

    const isCorrect = currentQ.options[idx].isCorrect;
    if (isCorrect) {
      soundManager.playSfx('ok');
      soundManager.playVoice('quiz_correct', 'Richtig geraten! Tolle Leistung!');
      setScore((prev) => prev + 1);
    } else {
      soundManager.playSfx('defeat');
      soundManager.playVoice('quiz_wrong', 'Oh, fast! Probier die nächste Frage!');
    }
  };

  const handleNext = () => {
    if (currentQIdx < questions.length - 1) {
      setCurrentQIdx((prev) => prev + 1);
      setSelectedOptIdx(null);
      setIsAnswerChecked(false);
    } else {
      // Finished!
      setIsFinished(true);
      const finalScore = score + (selectedOptIdx !== null && currentQ.options[selectedOptIdx].isCorrect ? 0 : 0);
      
      // If score >= 3: Reward a booster pack!
      if (finalScore >= 3) {
        storageService.addBooster(1);
        soundManager.playSfx('victory');
        soundManager.playVoice('quiz_victory', 'Spitze, Levi! Du hast das Quiz bestanden! Hier ist dein Belohnungs-Booster!');
        confetti({
          particleCount: 160,
          spread: 100,
          origin: { y: 0.55 },
          colors: ['#fbbf24', '#f59e0b', '#10b981', '#3b82f6', '#ec4899']
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-safe select-none overflow-y-auto font-sans">
      {/* Backdrop */}
      <div onClick={onClose} className="absolute inset-0 bg-slate-950/85 backdrop-blur-md cursor-pointer" />

      {/* Main Container */}
      <div className="relative z-50 max-w-xl w-full max-h-[92dvh] bg-gradient-to-b from-slate-900 via-slate-900/98 to-slate-950 border-3 border-amber-400 rounded-3xl p-4 sm:p-6 shadow-[0_0_50px_rgba(251,191,36,0.35)] flex flex-col justify-between my-auto overflow-y-auto text-white gap-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-xl shrink-0">
              🎓
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block">
                Professor Eichs Trainingscamp
              </span>
              <h2 className="text-base sm:text-xl font-black text-white">
                Pokémon Ruf- & Wissens-Quiz
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 active:scale-95 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        {!isFinished && currentQ ? (
          <div className="flex flex-col gap-4">
            {/* Progress & Score */}
            <div className="flex items-center justify-between text-xs text-slate-300 font-bold px-1">
              <span>Frage {currentQIdx + 1} von {questions.length}</span>
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{score} Punkte</span>
              </div>
            </div>

            {/* Question Card Banner */}
            <div className="bg-slate-950/80 rounded-2xl border-2 border-slate-700 p-4 text-center space-y-2 shadow-inner">
              <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                {currentQ.prompt}
              </h3>
              {currentQ.subPrompt && (
                <p className="text-xs text-amber-200/80 font-medium">
                  {currentQ.subPrompt}
                </p>
              )}

              {/* Sound replay button for cry questions */}
              {currentQ.type === 'cry' && currentQ.targetDexId && (
                <div className="pt-2">
                  <button
                    onClick={() => soundManager.playCry(currentQ.targetDexId!)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-md transition-transform active:scale-95 cursor-pointer animate-pulse"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Ruf noch einmal anhören! 🔊</span>
                  </button>
                </div>
              )}
            </div>

            {/* 3 Answer Options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOptIdx === idx;
                let optBorder = 'border-slate-700 bg-slate-950/70 hover:border-slate-500';

                if (isAnswerChecked) {
                  if (opt.isCorrect) {
                    optBorder = 'border-emerald-400 bg-emerald-950/60 shadow-[0_0_20px_rgba(16,185,129,0.5)]';
                  } else if (isSelected && !opt.isCorrect) {
                    optBorder = 'border-rose-500 bg-rose-950/60 opacity-80';
                  } else {
                    optBorder = 'border-slate-800 bg-slate-950/40 opacity-50';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswerChecked}
                    onClick={() => handleSelectOption(idx)}
                    className={`relative rounded-2xl border-2 p-3 flex flex-col items-center justify-between text-center gap-2 transition-all cursor-pointer ${optBorder} active:scale-95`}
                  >
                    <div className="w-20 h-20 rounded-xl bg-slate-900 border border-slate-700 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                      <img
                        src={opt.card.artworkUrl}
                        alt={opt.card.name}
                        className="w-full h-full object-contain filter drop-shadow"
                      />
                    </div>
                    <span className="text-xs sm:text-sm font-black text-white block">
                      {opt.label}
                    </span>

                    {/* Result checkmark or cross */}
                    {isAnswerChecked && opt.isCorrect && (
                      <div className="absolute top-2 right-2 bg-emerald-500 rounded-full p-0.5 text-white shadow">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    )}
                    {isAnswerChecked && isSelected && !opt.isCorrect && (
                      <div className="absolute top-2 right-2 bg-rose-500 rounded-full p-0.5 text-white shadow">
                        <XCircle className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            {isAnswerChecked && (
              <button
                onClick={handleNext}
                className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 animate-bounce cursor-pointer mt-1"
              >
                <span>{currentQIdx < questions.length - 1 ? 'Nächste Frage' : 'Quiz-Auswertung'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          /* Finished Screen */
          <div className="flex flex-col items-center text-center gap-4 py-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center border-3 border-white shadow-[0_0_30px_rgba(251,191,36,0.8)] animate-bounce">
              <Trophy className="w-10 h-10 text-slate-950" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-white">
                {score >= 4 ? 'Hervorragend, Meister-Forscher! 🌟' : 'Gut gemacht, Levi! 👏'}
              </h3>
              <p className="text-sm text-slate-300 mt-1">
                Du hast {score} von {questions.length} Fragen richtig beantwortet!
              </p>
            </div>

            {score >= 3 ? (
              <div className="w-full bg-gradient-to-r from-amber-500/20 via-yellow-400/25 to-amber-500/20 rounded-2xl border-2 border-amber-300/60 p-3 sm:p-4 flex items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center text-xl font-black shrink-0">
                    🎁
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-300 block">
                      Forschungs-Diplom Belohnung!
                    </span>
                    <span className="text-xs font-bold text-white block">
                      1x Kostenloser Booster-Pack hinzugefügt!
                    </span>
                  </div>
                </div>
                <Sparkles className="w-5 h-5 text-amber-300 animate-spin shrink-0" />
              </div>
            ) : null}

            <div className="w-full flex flex-col sm:flex-row gap-2 pt-2">
              {score >= 3 && onOpenBoosters && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenBoosters();
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                  <span>Booster jetzt öffnen! 🎁</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 active:scale-95 cursor-pointer"
              >
                Zurück zum Trainingslager
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
