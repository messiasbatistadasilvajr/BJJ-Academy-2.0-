import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScanFace, Fingerprint, CheckCircle2, ShieldCheck, X } from 'lucide-react';

interface BiometricModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userName?: string;
  reason?: string;
}

export const BiometricModal: React.FC<BiometricModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userName = 'Lucas Gracie',
  reason = 'Desbloquear BJJ Academy & Check-in Rápido',
}) => {
  const [step, setStep] = useState<'scanning' | 'success' | 'pin'>('scanning');
  const [pin, setPin] = useState('');
  const [mode, setMode] = useState<'face' | 'finger'>('face');

  useEffect(() => {
    if (isOpen) {
      setStep('scanning');
      setPin('');
      // Simulate biometric verification delay
      const timer = setTimeout(() => {
        setStep('success');
        const successTimer = setTimeout(() => {
          onSuccess();
          onClose();
        }, 900);
        return () => clearTimeout(successTimer);
      }, 1600);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-xs rounded-3xl bg-slate-900 border border-slate-700/80 p-6 text-center shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex justify-center mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/60 border border-red-800/40 text-[11px] font-semibold text-red-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Biometria Nativa BJJ
            </span>
          </div>

          <h3 className="text-base font-bold text-white mb-1">
            {step === 'success' ? 'Identidade Confirmada' : (mode === 'face' ? 'Face ID Nativo' : 'Touch ID Digital')}
          </h3>
          <p className="text-xs text-slate-400 mb-6">{reason}</p>

          {/* Scanner Graphic Area */}
          <div className="relative w-28 h-28 mx-auto mb-6 flex items-center justify-center rounded-2xl bg-slate-950 border border-slate-800 shadow-inner overflow-hidden">
            {step === 'scanning' && (
              <>
                {/* Laser scan bar */}
                <motion.div
                  initial={{ top: '0%' }}
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                  className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_12px_#ef4444] z-10"
                />
                {mode === 'face' ? (
                  <ScanFace className="w-14 h-14 text-slate-300 animate-pulse" />
                ) : (
                  <Fingerprint className="w-14 h-14 text-slate-300 animate-pulse" />
                )}
              </>
            )}

            {step === 'success' && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1.1, opacity: 1 }}
                className="flex flex-col items-center gap-1"
              >
                <CheckCircle2 className="w-16 h-16 text-emerald-400" />
              </motion.div>
            )}

            {step === 'pin' && (
              <div className="text-xs text-slate-300 px-2">
                Digite seu PIN de 4 dígitos cadastrado
              </div>
            )}
          </div>

          {step === 'scanning' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300 font-medium">
                Reconhecendo {userName}...
              </p>
              <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setMode(m => m === 'face' ? 'finger' : 'face')}
                  className="text-[11px] text-red-400 hover:text-red-300 underline font-medium"
                >
                  Usar {mode === 'face' ? 'Impressão Digital' : 'Face ID'}
                </button>
                <span className="text-slate-600">•</span>
                <button
                  onClick={() => setStep('pin')}
                  className="text-[11px] text-slate-400 hover:text-slate-200"
                >
                  Usar Senha
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <p className="text-xs text-emerald-400 font-semibold">
              Acesso liberado com sucesso!
            </p>
          )}

          {step === 'pin' && (
            <div className="space-y-4">
              <div className="flex justify-center gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full border border-slate-600 ${
                      pin.length > i ? 'bg-red-500 border-red-500' : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 max-w-[180px] mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '✓'].map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      if (key === 'C') setPin('');
                      else if (key === '✓') {
                        if (pin.length >= 4) {
                          setStep('success');
                          setTimeout(() => { onSuccess(); onClose(); }, 700);
                        }
                      } else if (pin.length < 4) {
                        const newPin = pin + key;
                        setPin(newPin);
                        if (newPin.length === 4) {
                          setStep('success');
                          setTimeout(() => { onSuccess(); onClose(); }, 700);
                        }
                      }
                    }}
                    className="h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
