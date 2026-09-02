import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, 
  Minimize2, Plus, Minus, Trophy, Flame, ShieldAlert, Award
} from 'lucide-react';
import { BeltColor, FighterScore } from '../../types';
import { bjjAudio } from '../../utils/audio';

interface ScoreboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScoreboardModal: React.FC<ScoreboardModalProps> = ({ isOpen, onClose }) => {
  // Timer state
  const [roundDuration, setRoundDuration] = useState<number>(300); // 5 min
  const [restDuration, setRestDuration] = useState<number>(60); // 1 min
  const [totalRounds, setTotalRounds] = useState<number>(5);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [secondsLeft, setSecondsLeft] = useState<number>(300);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isRest, setIsRest] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fighter 1 (Branco / Atleta 1)
  const [f1, setF1] = useState<FighterScore>({
    name: 'Atleta Branco',
    belt: 'blue',
    points: 0,
    advantages: 0,
    penalties: 0
  });

  // Fighter 2 (Azul ou Escuro / Atleta 2)
  const [f2, setF2] = useState<FighterScore>({
    name: 'Atleta Azul',
    belt: 'purple',
    points: 0,
    advantages: 0,
    penalties: 0
  });

  // Countdown timer loop
  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          // Warning beeps in last 3 seconds
          if (prev <= 4 && prev > 1 && soundEnabled) {
            bjjAudio.playBeep(800, 0.15);
          }

          if (prev <= 1) {
            // End of current period
            if (soundEnabled) bjjAudio.playGong();

            if (!isRest) {
              // Round just finished -> Go to rest
              if (currentRound >= totalRounds) {
                // All rounds finished
                setIsRunning(false);
                return 0;
              } else {
                setIsRest(true);
                return restDuration;
              }
            } else {
              // Rest finished -> Next round starts
              setIsRest(false);
              setCurrentRound((r) => r + 1);
              return roundDuration;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isRest, currentRound, totalRounds, restDuration, roundDuration, soundEnabled]);

  if (!isOpen) return null;

  const toggleStartPause = () => {
    if (!isRunning && soundEnabled) {
      bjjAudio.playGong();
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsRest(false);
    setCurrentRound(1);
    setSecondsLeft(roundDuration);
  };

  const resetAllPoints = () => {
    setF1(prev => ({ ...prev, points: 0, advantages: 0, penalties: 0 }));
    setF2(prev => ({ ...prev, points: 0, advantages: 0, penalties: 0 }));
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Point modifiers
  const modifyF1 = (field: 'points' | 'advantages' | 'penalties', delta: number) => {
    setF1(prev => ({
      ...prev,
      [field]: Math.max(0, prev[field] + delta)
    }));
  };

  const modifyF2 = (field: 'points' | 'advantages' | 'penalties', delta: number) => {
    setF2(prev => ({
      ...prev,
      [field]: Math.max(0, prev[field] + delta)
    }));
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col text-white overflow-y-auto"
      id="modal-bjj-scoreboard"
    >
      {/* Top Controls Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/90">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-black text-sm">
            BJJ
          </div>
          <div>
            <h2 className="font-bold text-sm sm:text-base leading-tight">Placar Oficial & Cronômetro de Rola</h2>
            <p className="text-xs text-slate-400">Regras Oficiais CBJJ / IBJJF</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg transition-colors ${soundEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}
            title={soundEnabled ? 'Som ativado' : 'Sem som'}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Tela cheia para TV"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Timer Display */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-4xl mx-auto w-full">
        {/* Round & State Badge */}
        <div className="flex items-center gap-3 mb-2">
          <span className={`px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider ${
            isRest 
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse' 
              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
          }`}>
            {isRest ? 'Descanso' : `Round ${currentRound} de ${totalRounds}`}
          </span>
          <span className="text-xs text-slate-400">
            {roundDuration / 60} min treino / {restDuration}s descanso
          </span>
        </div>

        {/* Large Digits */}
        <div className={`font-mono text-7xl sm:text-9xl font-black tracking-tight my-2 drop-shadow-2xl ${
          isRest ? 'text-amber-400' : secondsLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-white'
        }`}>
          {formatTime(secondsLeft)}
        </div>

        {/* Play/Pause/Reset Controls */}
        <div className="flex items-center gap-4 mb-6">
          <button
            id="btn-scoreboard-start-pause"
            onClick={toggleStartPause}
            className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-lg shadow-xl transition-transform active:scale-95 ${
              isRunning 
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isRunning ? <><Pause size={22} /> Pausar</> : <><Play size={22} /> Iniciar Rola</>}
          </button>

          <button
            onClick={resetTimer}
            className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Reiniciar Cronômetro"
          >
            <RotateCcw size={22} />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <span className="text-xs text-slate-400 mr-1">Rounds:</span>
          {[
            { label: '3 min (Kids)', round: 180, rest: 45, count: 5 },
            { label: '5 min (Normal)', round: 300, rest: 60, count: 5 },
            { label: '6 min (Roxa)', round: 360, rest: 60, count: 6 },
            { label: '8 min (Marrom)', round: 480, rest: 60, count: 5 },
            { label: '10 min (Preta)', round: 600, rest: 90, count: 4 },
          ].map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setIsRunning(false);
                setIsRest(false);
                setRoundDuration(preset.round);
                setRestDuration(preset.rest);
                setTotalRounds(preset.count);
                setCurrentRound(1);
                setSecondsLeft(preset.round);
              }}
              className={`px-3 py-1 text-xs rounded-lg font-medium border transition-colors ${
                roundDuration === preset.round 
                  ? 'bg-red-600 text-white border-red-500' 
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Fighters Scoreboard Section */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Fighter 1 (Branco/Amarelo) */}
          <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <input
                  type="text"
                  value={f1.name}
                  onChange={(e) => setF1({ ...f1, name: e.target.value })}
                  className="bg-transparent font-bold text-base text-white border-b border-transparent hover:border-slate-600 focus:border-red-500 focus:outline-none w-2/3"
                />
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold uppercase">
                  Kimono Branco
                </span>
              </div>

              {/* Big Score */}
              <div className="text-center py-2">
                <div className="text-6xl font-mono font-black text-white">{f1.points}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Pontos CBJJ</div>
              </div>
            </div>

            {/* Quick Scoring Buttons */}
            <div className="space-y-2 mt-2">
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  onClick={() => modifyF1('points', 2)}
                  className="py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-center"
                >
                  <div className="font-black text-emerald-400 text-sm">+2</div>
                  <div className="text-[9px] text-slate-400 leading-tight">Queda / Rasp</div>
                </button>
                <button
                  onClick={() => modifyF1('points', 3)}
                  className="py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-center"
                >
                  <div className="font-black text-emerald-400 text-sm">+3</div>
                  <div className="text-[9px] text-slate-400 leading-tight">Passagem</div>
                </button>
                <button
                  onClick={() => modifyF1('points', 4)}
                  className="py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-center"
                >
                  <div className="font-black text-emerald-400 text-sm">+4</div>
                  <div className="text-[9px] text-slate-400 leading-tight">Montada / Costas</div>
                </button>
                <button
                  onClick={() => modifyF1('points', -1)}
                  className="py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-center"
                >
                  <div className="font-black text-slate-400 text-sm">-1</div>
                  <div className="text-[9px] text-slate-400 leading-tight">Desfazer</div>
                </button>
              </div>

              {/* Vantagens & Punições */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-amber-950/40 border border-amber-800/40">
                  <span className="text-xs text-amber-400 font-semibold">Vantagem: {f1.advantages}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => modifyF1('advantages', -1)} className="p-1 text-slate-400 hover:text-white"><Minus size={12} /></button>
                    <button onClick={() => modifyF1('advantages', 1)} className="p-1 text-amber-400 hover:text-white"><Plus size={12} /></button>
                  </div>
                </div>

                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-red-950/40 border border-red-800/40">
                  <span className="text-xs text-red-400 font-semibold">Punição: {f1.penalties}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => modifyF1('penalties', -1)} className="p-1 text-slate-400 hover:text-white"><Minus size={12} /></button>
                    <button onClick={() => modifyF1('penalties', 1)} className="p-1 text-red-400 hover:text-white"><Plus size={12} /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fighter 2 (Azul/Escuro) */}
          <div className="bg-blue-950/40 border-2 border-blue-700 rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <input
                  type="text"
                  value={f2.name}
                  onChange={(e) => setF2({ ...f2, name: e.target.value })}
                  className="bg-transparent font-bold text-base text-white border-b border-transparent hover:border-blue-600 focus:border-blue-400 focus:outline-none w-2/3"
                />
                <span className="text-xs px-2 py-0.5 rounded bg-blue-800 text-blue-200 font-semibold uppercase">
                  Kimono Azul
                </span>
              </div>

              {/* Big Score */}
              <div className="text-center py-2">
                <div className="text-6xl font-mono font-black text-blue-300">{f2.points}</div>
                <div className="text-xs text-blue-300/70 uppercase tracking-wider font-semibold">Pontos CBJJ</div>
              </div>
            </div>

            {/* Quick Scoring Buttons */}
            <div className="space-y-2 mt-2">
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  onClick={() => modifyF2('points', 2)}
                  className="py-2 bg-blue-900/60 hover:bg-blue-900 rounded-lg text-center"
                >
                  <div className="font-black text-cyan-300 text-sm">+2</div>
                  <div className="text-[9px] text-blue-200 leading-tight">Queda / Rasp</div>
                </button>
                <button
                  onClick={() => modifyF2('points', 3)}
                  className="py-2 bg-blue-900/60 hover:bg-blue-900 rounded-lg text-center"
                >
                  <div className="font-black text-cyan-300 text-sm">+3</div>
                  <div className="text-[9px] text-blue-200 leading-tight">Passagem</div>
                </button>
                <button
                  onClick={() => modifyF2('points', 4)}
                  className="py-2 bg-blue-900/60 hover:bg-blue-900 rounded-lg text-center"
                >
                  <div className="font-black text-cyan-300 text-sm">+4</div>
                  <div className="text-[9px] text-blue-200 leading-tight">Montada / Costas</div>
                </button>
                <button
                  onClick={() => modifyF2('points', -1)}
                  className="py-2 bg-blue-900/60 hover:bg-blue-900 rounded-lg text-center"
                >
                  <div className="font-black text-slate-400 text-sm">-1</div>
                  <div className="text-[9px] text-blue-200 leading-tight">Desfazer</div>
                </button>
              </div>

              {/* Vantagens & Punições */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-amber-950/40 border border-amber-800/40">
                  <span className="text-xs text-amber-400 font-semibold">Vantagem: {f2.advantages}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => modifyF2('advantages', -1)} className="p-1 text-slate-400 hover:text-white"><Minus size={12} /></button>
                    <button onClick={() => modifyF2('advantages', 1)} className="p-1 text-amber-400 hover:text-white"><Plus size={12} /></button>
                  </div>
                </div>

                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-red-950/40 border border-red-800/40">
                  <span className="text-xs text-red-400 font-semibold">Punição: {f2.penalties}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => modifyF2('penalties', -1)} className="p-1 text-slate-400 hover:text-white"><Minus size={12} /></button>
                    <button onClick={() => modifyF2('penalties', 1)} className="p-1 text-red-400 hover:text-white"><Plus size={12} /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reset Points button */}
        <div className="mt-4 flex justify-end w-full">
          <button
            onClick={resetAllPoints}
            className="text-xs text-slate-400 hover:text-slate-200 underline transition-colors"
          >
            Zerar Placar de Luta
          </button>
        </div>
      </div>
    </div>
  );
};
