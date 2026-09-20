import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Swords, Play, Pause, RotateCcw, Users, 
  ShieldAlert, Sparkles, Volume2, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { StudentProfile, ClassSession, SparringPair, BeltColor } from '../../types';
import { pairAthletesIntelligently } from '../../utils/sparringMatchmaker';
import { triggerNativeHaptic } from '../../utils/nativeApp';

interface SparringMatchmakerModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentProfile[];
  activeClass?: ClassSession;
}

export const SparringMatchmakerModal: React.FC<SparringMatchmakerModalProps> = ({
  isOpen,
  onClose,
  students,
  activeClass
}) => {
  const [roundMinutes, setRoundMinutes] = useState(5);
  const [restSeconds, setRestSeconds] = useState(60);
  const [currentSeconds, setCurrentSeconds] = useState(5 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [roundNumber, setRoundNumber] = useState(1);
  const [pairs, setPairs] = useState<SparringPair[]>([]);
  const [unpaired, setUnpaired] = useState<any>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Inicializa o pareamento automático
  const generatePairs = () => {
    const candidates = students.slice(0, 16).map(s => ({
      id: s.id,
      name: s.name,
      belt: (s.belt as BeltColor) || 'white',
      weightKg: s.weightKg || 75,
      injuryNote: s.activeInjuries,
      hasInjuryWarning: !!s.activeInjuries
    }));

    const result = pairAthletesIntelligently(candidates);
    setPairs(result.pairs);
    setUnpaired(result.unpaired);
    triggerNativeHaptic('heavy');
  };

  useEffect(() => {
    if (isOpen && pairs.length === 0) {
      generatePairs();
    }
  }, [isOpen]);

  // Timer loop
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setCurrentSeconds(prev => {
          if (prev <= 1) {
            triggerNativeHaptic('heavy');
            // Alterna entre rola e descanso
            if (!isResting) {
              setIsResting(true);
              return restSeconds;
            } else {
              setIsResting(false);
              setRoundNumber(r => r + 1);
              generatePairs(); // Sorteia novas duplas a cada round!
              return roundMinutes * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isResting, roundMinutes, restSeconds]);

  if (!isOpen) return null;

  const minutes = Math.floor(currentSeconds / 60);
  const seconds = currentSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-red-600/20 text-red-400 border border-red-500/30">
              <Swords size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Temporizador & Matchmaker Inteligente de Rola
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500/20 text-red-300 border border-red-500/30">
                  ANTI-LESIÔES & BALANCEADO
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sorteia duplas por graduação, categoria de peso e proteção a atletas em reabilitação física.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cronômetro Central */}
        <div className="p-5 bg-gradient-to-b from-slate-950/80 to-slate-900 border-b border-slate-800 flex flex-col items-center justify-center">
          <div className="text-xs uppercase font-extrabold tracking-widest text-slate-400 mb-1">
            {isResting ? '🔔 INTERVALO & TROCA DE DUPLAS' : `🥋 ROUND ${roundNumber} EM ANDAMENTO`}
          </div>

          <div className={`text-6xl sm:text-7xl font-mono font-black tracking-tight ${
            isResting ? 'text-amber-400' : 'text-white'
          }`}>
            {formattedTime}
          </div>

          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-6 py-2.5 rounded-2xl font-black text-sm flex items-center gap-2 transition shadow-lg ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-500 text-slate-950'
                  : 'bg-red-600 hover:bg-red-500 text-white'
              }`}
            >
              {isRunning ? <Pause size={18} /> : <Play size={18} />}
              {isRunning ? 'Pausar Rola' : 'Iniciar Rola'}
            </button>

            <button
              onClick={() => {
                setIsRunning(false);
                setIsResting(false);
                setCurrentSeconds(roundMinutes * 60);
              }}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Resetar tempo"
            >
              <RotateCcw size={18} />
            </button>

            <button
              onClick={generatePairs}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Sparkles size={16} className="text-amber-400" /> Sorteio de Duplas
            </button>
          </div>
        </div>

        {/* Duplas Pareadas na Tela */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Duplas Sugeridas no Tatame ({pairs.length} pares)
            </span>
            {unpaired && (
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
                Pega a vez: <strong>{unpaired.name}</strong>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pairs.map((pair, idx) => (
              <div
                key={pair.id}
                className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 space-y-2.5 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-400">DUPLA #{idx + 1}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    pair.balanceScore === 'Perfeito'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : pair.balanceScore === 'Equilibrado'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {pair.balanceScore} (dif. {pair.weightDiffKg}kg)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Atleta 1 */}
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="font-bold text-white truncate">{pair.athlete1.name}</div>
                    <div className="text-[11px] text-slate-400">
                      Faixa {pair.athlete1.belt} • {pair.athlete1.weightKg}kg
                    </div>
                    {pair.athlete1.hasInjuryWarning && (
                      <div className="text-[10px] text-amber-400 flex items-center gap-1 mt-1 font-semibold">
                        <ShieldAlert size={12} /> Cuidado com lesão
                      </div>
                    )}
                  </div>

                  {/* Atleta 2 */}
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="font-bold text-white truncate">{pair.athlete2.name}</div>
                    <div className="text-[11px] text-slate-400">
                      Faixa {pair.athlete2.belt} • {pair.athlete2.weightKg}kg
                    </div>
                    {pair.athlete2.hasInjuryWarning && (
                      <div className="text-[10px] text-amber-400 flex items-center gap-1 mt-1 font-semibold">
                        <ShieldAlert size={12} /> Cuidado com lesão
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
