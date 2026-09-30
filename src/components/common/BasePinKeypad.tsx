import React from 'react';
import { triggerNativeHaptic } from '../../utils/nativeApp';

export interface BasePinKeypadProps {
  pinDigits: string[];
  onChange: (updated: string[]) => void;
  onComplete?: (fullPin: string) => void;
  accentColor?: 'cyan' | 'emerald' | 'amber' | 'red';
  idPrefix?: string;
  disabled?: boolean;
}

export const BasePinKeypad: React.FC<BasePinKeypadProps> = ({
  pinDigits,
  onChange,
  onComplete,
  accentColor = 'cyan',
  idPrefix = 'pin',
  disabled = false
}) => {
  const colorMap = {
    cyan: {
      borderFilled: 'border-cyan-400 text-cyan-300 shadow-cyan-950/60',
      activeRing: 'border-cyan-500/80 ring-2 ring-cyan-500/30',
      keyHover: 'hover:bg-cyan-950 hover:border-cyan-600'
    },
    emerald: {
      borderFilled: 'border-emerald-400 text-emerald-300 shadow-emerald-950/60',
      activeRing: 'border-emerald-500/80 ring-2 ring-emerald-500/30',
      keyHover: 'hover:bg-emerald-950 hover:border-emerald-600'
    },
    amber: {
      borderFilled: 'border-amber-400 text-amber-300 shadow-amber-950/60',
      activeRing: 'border-amber-500/80 ring-2 ring-amber-500/30',
      keyHover: 'hover:bg-amber-950 hover:border-amber-600'
    },
    red: {
      borderFilled: 'border-red-400 text-red-300 shadow-red-950/60',
      activeRing: 'border-red-500/80 ring-2 ring-red-500/30',
      keyHover: 'hover:bg-red-950 hover:border-red-600'
    }
  };

  const scheme = colorMap[accentColor];

  const handleDigitChange = (index: number, val: string) => {
    if (disabled || !/^\d*$/.test(val)) return;
    const updated = [...pinDigits];
    updated[index] = val.slice(-1);
    onChange(updated);

    if (val && index < pinDigits.length - 1) {
      const nextInput = document.getElementById(`${idPrefix}-${index + 1}`);
      nextInput?.focus();
    }

    const entered = updated.join('');
    if (entered.length === pinDigits.length && onComplete) {
      onComplete(entered);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      const prevInput = document.getElementById(`${idPrefix}-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleKeypadPress = (digit: string) => {
    if (disabled) return;
    const nextIdx = pinDigits.findIndex(d => d === '');
    if (nextIdx !== -1) {
      handleDigitChange(nextIdx, digit);
    }
  };

  const handleBackspace = () => {
    if (disabled) return;
    const lastFilledIdx = [...pinDigits].reverse().findIndex(d => d !== '');
    if (lastFilledIdx !== -1) {
      const targetIdx = (pinDigits.length - 1) - lastFilledIdx;
      const updated = [...pinDigits];
      updated[targetIdx] = '';
      onChange(updated);
      const prevInput = document.getElementById(`${idPrefix}-${targetIdx}`);
      prevInput?.focus();
    }
  };

  const handleClear = () => {
    if (disabled) return;
    onChange(pinDigits.map(() => ''));
    const firstInput = document.getElementById(`${idPrefix}-0`);
    firstInput?.focus();
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* PIN Boxes Display */}
      <div className="flex items-center justify-center gap-2 my-2">
        {pinDigits.map((val, idx) => (
          <input
            key={idx}
            id={`${idPrefix}-${idx}`}
            type="password"
            inputMode="numeric"
            maxLength={1}
            disabled={disabled}
            value={val}
            onChange={(e) => handleDigitChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            className={`w-10 h-12 text-center text-xl font-mono font-black rounded-xl border bg-slate-950 transition outline-none shadow-md ${
              val
                ? `${scheme.borderFilled}`
                : `${scheme.activeRing} text-slate-500`
            }`}
          />
        ))}
      </div>

      {/* Numeric Touch Keypad */}
      <div className="w-full max-w-[240px] grid grid-cols-3 gap-2 pt-1">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
          <button
            key={k}
            type="button"
            disabled={disabled}
            onClick={() => {
              triggerNativeHaptic('light');
              if (k === 'C') {
                handleClear();
              } else if (k === '⌫') {
                handleBackspace();
              } else {
                handleKeypadPress(k);
              }
            }}
            className={`h-11 rounded-xl font-bold font-mono text-sm transition active:scale-95 disabled:opacity-50 ${
              k === 'C'
                ? 'bg-red-950/40 border border-red-900/60 text-red-400 hover:bg-red-900/60'
                : k === '⌫'
                  ? 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
                  : `bg-slate-800/90 border border-slate-700/80 text-white ${scheme.keyHover}`
            }`}
          >
            {k}
          </button>
        ))}
      </div>
    </div>
  );
};
