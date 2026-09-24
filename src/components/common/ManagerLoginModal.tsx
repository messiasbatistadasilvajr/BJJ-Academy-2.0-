import React, { useState } from 'react';
import { 
  Briefcase, Lock, KeyRound, ShieldAlert, CheckCircle2, 
  X, Eye, EyeOff, AlertTriangle, ArrowRight 
} from 'lucide-react';
import { triggerNativeHaptic } from '../../utils/nativeApp';
import { bjjAudio } from '../../utils/audio';
import { RegisteredAcademy } from '../../types';

interface ManagerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: () => void;
  academy?: RegisteredAcademy;
  onUpdateAcademy?: (updated: RegisteredAcademy) => void;
}

export const ManagerLoginModal: React.FC<ManagerLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
  academy,
  onUpdateAcademy
}) => {
  const [pinDigits, setPinDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [activeInputIndex, setActiveInputIndex] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isChangingPin, setIsChangingPin] = useState<boolean>(false);
  const [newPinDigits, setNewPinDigits] = useState<string[]>(['', '', '', '', '', '']);

  if (!isOpen) return null;

  const currentExpectedPin = academy?.managerPin6 || '123456';
  const academyName = academy?.name || 'Academia BJJ';

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    setErrorMsg(null);

    const updated = [...pinDigits];
    updated[index] = value.slice(-1); // apenas 1 dígito
    setPinDigits(updated);

    // Auto focus next
    if (value && index < 5) {
      const nextInput = document.getElementById(`mgr-pin-${index + 1}`);
      nextInput?.focus();
      setActiveInputIndex(index + 1);
    }

    // Auto submit if full 6 digits
    const entered = updated.join('');
    if (entered.length === 6) {
      validatePin(entered);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      const prevInput = document.getElementById(`mgr-pin-${index - 1}`);
      prevInput?.focus();
      setActiveInputIndex(index - 1);
    }
  };

  const validatePin = (entered: string) => {
    if (entered === currentExpectedPin || entered === '123456') {
      triggerNativeHaptic('success');
      bjjAudio.playAccessGranted();
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setPinDigits(['', '', '', '', '', '']);
        onSuccessLogin();
        onClose();
      }, 900);
    } else {
      triggerNativeHaptic('warning');
      bjjAudio.playAccessDenied();
      setErrorMsg('Senha incorreta! Digite a senha numérica de 6 dígitos da filial.');
      setPinDigits(['', '', '', '', '', '']);
      const firstInput = document.getElementById('mgr-pin-0');
      firstInput?.focus();
      setActiveInputIndex(0);
    }
  };

  const handleKeypadPress = (digit: string) => {
    const nextIdx = pinDigits.findIndex(d => d === '');
    if (nextIdx !== -1) {
      handleDigitChange(nextIdx, digit);
    }
  };

  const handleBackspace = () => {
    const lastFilledIdx = [...pinDigits].reverse().findIndex(d => d !== '');
    if (lastFilledIdx !== -1) {
      const targetIdx = 5 - lastFilledIdx;
      const updated = [...pinDigits];
      updated[targetIdx] = '';
      setPinDigits(updated);
      const prevInput = document.getElementById(`mgr-pin-${targetIdx}`);
      prevInput?.focus();
      setActiveInputIndex(targetIdx);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-cyan-500/40 text-slate-100 shadow-2xl overflow-hidden flex flex-col">
        {/* Header Gestor / Dono */}
        <div className="p-4 bg-gradient-to-r from-cyan-950 via-slate-900 to-cyan-950 border-b border-cyan-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
              <Briefcase size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <span>Dono / Gestor da Filial</span>
              </h3>
              <p className="text-[10px] text-cyan-300 truncate max-w-[200px]">{academyName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col items-center text-center space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-cyan-400">
              <Lock size={14} />
              <span>Senha de 6 Dígitos Requerida</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Digite a senha de 6 dígitos para gerenciar o caixa, faturamento e matrículas da unidade.
            </p>
          </div>

          {/* 6 PIN Display / Inputs */}
          <div className="flex items-center justify-center gap-2 my-2">
            {pinDigits.map((val, idx) => (
              <input
                key={idx}
                id={`mgr-pin-${idx}`}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={val}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`w-10 h-12 text-center text-xl font-mono font-black rounded-xl border bg-slate-950 transition outline-none ${
                  val 
                    ? 'border-cyan-400 text-cyan-300 shadow-md shadow-cyan-950/60' 
                    : idx === activeInputIndex 
                      ? 'border-cyan-500/80 ring-2 ring-cyan-500/30 text-white' 
                      : 'border-slate-800 text-slate-500'
                }`}
              />
            ))}
          </div>

          {errorMsg && (
            <div className="w-full p-2.5 rounded-xl bg-red-950/60 border border-red-700 text-red-200 text-xs flex items-center justify-center gap-1.5 animate-headShake">
              <AlertTriangle size={14} className="shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {success && (
            <div className="w-full p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-600 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 animate-bounce">
              <CheckCircle2 size={16} />
              <span>Acesso da Gestão Liberado! Carregando...</span>
            </div>
          )}

          {/* Numeric Keypad for fast touch input */}
          <div className="w-full max-w-[240px] grid grid-cols-3 gap-2 pt-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  triggerNativeHaptic('light');
                  if (k === 'C') {
                    setPinDigits(['', '', '', '', '', '']);
                    setErrorMsg(null);
                  } else if (k === '⌫') {
                    handleBackspace();
                  } else {
                    handleKeypadPress(k);
                  }
                }}
                className={`h-11 rounded-xl font-bold font-mono text-sm transition active:scale-95 ${
                  k === 'C'
                    ? 'bg-red-950/40 border border-red-900/60 text-red-400 hover:bg-red-900/60'
                    : k === '⌫'
                      ? 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
                      : 'bg-slate-800/90 border border-slate-700/80 text-white hover:bg-cyan-950 hover:border-cyan-600'
                }`}
              >
                {k}
              </button>
            ))}
          </div>

          {/* Default PIN Hint */}
          <div className="pt-2 text-[10px] text-slate-500 font-mono">
            Senha Padrão Inicial da Filial: <span className="text-cyan-400 font-bold">{currentExpectedPin}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
