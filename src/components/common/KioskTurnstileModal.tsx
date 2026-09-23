import React, { useState, useEffect } from 'react';
import { 
  X, QrCode, CheckCircle2, AlertTriangle, UserCheck, 
  Delete, RefreshCw, Lock, Unlock, Camera, Shield
} from 'lucide-react';
import { bjjAudio } from '../../utils/audio';
import { mockStudent } from '../../data/mockData';
import { BeltBadge } from './BeltBadge';
import { academyVoiceEngine } from '../../utils/voiceNotification';

interface KioskTurnstileModalProps {
  isOpen: boolean;
  onClose: () => void;
  academyName?: string;
  academyBranch?: string;
}

export const KioskTurnstileModal: React.FC<KioskTurnstileModalProps> = ({ 
  isOpen, 
  onClose,
  academyName = 'BJJ Academy',
  academyBranch = 'Jardins (Matriz)'
}) => {
  const [pin, setPin] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'success' | 'denied' | 'camera_scan'>('idle');
  const [recognizedStudent, setRecognizedStudent] = useState<any>(null);
  const [attendanceCount, setAttendanceCount] = useState<number>(39);
  const [countdown, setCountdown] = useState<number>(3);

  // Auto-reset countdown when in success state
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === 'success') {
      setCountdown(3);
      const interval = setInterval(() => {
        setCountdown((prev) => (prev > 1 ? prev - 1 : 1));
      }, 1000);

      timer = setTimeout(() => {
        setPin('');
        setStatus('idle');
        setRecognizedStudent(null);
        clearInterval(interval);
      }, 3000);

      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [status]);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length < 6 && (status === 'idle' || status === 'denied')) {
      const nextPin = pin + digit;
      setPin(nextPin);
      bjjAudio.playBeep(520, 0.04);

      // Auto trigger if 4 digits (e.g. phone last digits or code)
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
    setStatus('idle');
    setRecognizedStudent(null);
  };

  const [pendingNoticeStudent, setPendingNoticeStudent] = useState<any>(null);

  const verifyPin = (code: string) => {
    // Código de teste de pendência financeira: '9999' ou '0000'
    const isPendingDemo = code === '9999' || code === '0000';

    if (isPendingDemo) {
      // Aluno com mensalidade pendente -> Aviso sonoro discreto direcionando à recepção
      bjjAudio.playBeep(440, 0.15);
      academyVoiceEngine.announceKioskCheckin('Lucas Gabriel', false, academyName);
      setStatus('denied');
      setPendingNoticeStudent({
        name: 'Lucas Gabriel',
        status: 'Mensalidade Pendente',
        message: 'Por gentileza, dirija-se à recepção para regularização.'
      });
      setTimeout(() => {
        setPin('');
        setStatus('idle');
        setPendingNoticeStudent(null);
      }, 4000);
      return;
    }

    if (code === '1024' || code === '1234' || code === '2024' || code.length === 4) {
      // Mensalidade em dia (pago) -> Libera o treino com saudação vocal positiva
      bjjAudio.playAccessGranted();
      academyVoiceEngine.announceKioskCheckin(mockStudent.name, true, academyName);
      setStatus('success');
      setAttendanceCount(prev => prev + 1);
      setRecognizedStudent({
        name: mockStudent.name,
        avatar: mockStudent.avatar,
        belt: mockStudent.belt,
        stripes: mockStudent.stripes,
        financialStatus: 'Plano Ativo (Em Dia)',
        sessionName: 'Fundamentos Adulto • Tatame 1',
        totalCheckins: attendanceCount + 1
      });
    } else {
      bjjAudio.playAccessDenied();
      setStatus('denied');
      setTimeout(() => {
        setPin('');
        setStatus('idle');
      }, 2000);
    }
  };

  const simulateCameraScan = () => {
    setStatus('camera_scan');
    bjjAudio.playBeep(640, 0.08);
    setTimeout(() => {
      verifyPin('1024');
    }, 1500);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950 flex flex-col text-slate-100 select-none font-sans"
      id="modal-kiosk-turnstile"
    >
      {/* Kiosk Header Sóbrio */}
      <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-950 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center font-serif font-black text-amber-400 text-sm">
            BJJ
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-white flex items-center gap-2">
              {academyName} • Totem de Check-in
              <span className="text-[9px] bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono uppercase font-bold">
                Online
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Unidade {academyBranch} • Acesso ao Tatame</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition border border-slate-800"
        >
          <X size={14} /> Sair do Totem
        </button>
      </div>

      {/* Main Kiosk Area */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center p-6 gap-8 max-w-4xl mx-auto w-full">
        {/* Left Side: Instructions & Scan Action */}
        <div className="w-full md:w-1/2 flex flex-col items-center text-center space-y-4">
          {status === 'idle' && (
            <>
              <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 shadow-sm">
                <Lock size={32} className="text-slate-400" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Check-in no Tatame</h2>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                  Digite os 4 últimos dígitos do seu telefone ou matrícula no teclado numérico ao lado.
                </p>
              </div>

              <button
                type="button"
                onClick={simulateCameraScan}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 text-xs font-semibold transition active:scale-95"
              >
                <Camera size={16} className="text-amber-400" />
                <span>Biometria Facial / Leitura de QR</span>
              </button>
            </>
          )}

          {status === 'camera_scan' && (
            <div className="flex flex-col items-center space-y-3 py-6">
              <div className="w-28 h-28 rounded-full border-2 border-dashed border-amber-400 flex items-center justify-center animate-pulse bg-slate-900/50">
                <Camera size={36} className="text-amber-400" />
              </div>
              <p className="text-xs font-medium text-slate-300">Posicione seu rosto ou QR Code na moldura...</p>
            </div>
          )}

          {status === 'success' && recognizedStudent && (
            <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl p-5 w-full max-w-sm shadow-xl flex flex-col items-center animate-fadeIn text-slate-100">
              <div className="relative mb-2">
                <img 
                  src={recognizedStudent.avatar} 
                  alt={recognizedStudent.name} 
                  className="w-20 h-20 rounded-xl object-cover border-2 border-emerald-500 shadow-md"
                />
                <div className="absolute -bottom-1.5 -right-1.5 p-1 bg-emerald-500 text-slate-950 rounded-full shadow">
                  <CheckCircle2 size={16} />
                </div>
              </div>

              <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                <Unlock size={12} /> Acesso Liberado
              </div>

              <h3 className="text-base font-bold text-white text-center">{recognizedStudent.name}</h3>

              <div className="my-1.5">
                <BeltBadge belt={recognizedStudent.belt} stripes={recognizedStudent.stripes} size="sm" showLabel />
              </div>

              <div className="bg-slate-950 rounded-xl px-3.5 py-2 border border-slate-800 text-[11px] space-y-0.5 text-center w-full mt-1.5">
                <div className="text-emerald-400 font-semibold">{recognizedStudent.financialStatus}</div>
                <div className="text-slate-400">Presença #{recognizedStudent.totalCheckins} registrada no sistema</div>
              </div>

              <p className="text-xs font-serif font-bold text-amber-400 mt-3">
                Bom treino, guerreiro. Oss! 🥋
              </p>

              <div className="mt-3 w-full bg-slate-950 rounded-full h-1 overflow-hidden">
                <div className="bg-emerald-500 h-full w-full animate-pulse" />
              </div>
              <span className="text-[10px] text-slate-500 mt-1">Retornando em {countdown}s...</span>
            </div>
          )}

          {status === 'denied' && (
            <div className="bg-slate-900 border border-amber-500/50 rounded-2xl p-5 w-full max-w-sm shadow-xl flex flex-col items-center animate-fadeIn text-slate-100">
              <div className="w-12 h-12 rounded-xl bg-amber-950/60 border border-amber-800/60 text-amber-400 flex items-center justify-center mb-2">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-sm font-bold text-white">
                {pendingNoticeStudent ? pendingNoticeStudent.name : 'Matrícula não localizada'}
              </h3>
              <div className="text-[11px] font-bold text-amber-400 mt-0.5">
                {pendingNoticeStudent ? pendingNoticeStudent.status : 'Acesso Pendente'}
              </div>
              <p className="text-xs text-slate-400 mt-1.5 text-center">
                {pendingNoticeStudent
                  ? pendingNoticeStudent.message
                  : 'Verifique os números digitados ou dirija-se à recepção da academia.'}
              </p>
            </div>
          )}
        </div>

        {/* Right Side: Clean Numeric Keypad */}
        <div className="w-full md:w-1/2 max-w-xs bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          {/* Display screen */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 mb-4 text-center">
            <div className="text-[11px] text-slate-400 font-medium mb-1">Matrícula / 4 Dígitos</div>
            <div className="font-mono text-2xl font-bold tracking-widest text-amber-400 h-8 flex items-center justify-center">
              {pin ? pin : <span className="text-slate-700 text-xl font-normal">_ _ _ _</span>}
            </div>
          </div>

          {/* 3x4 Touch Grid */}
          <div className="grid grid-cols-3 gap-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleDigit(digit)}
                className="h-13 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-lg font-bold text-white active:scale-95 transition shadow-sm flex items-center justify-center"
              >
                {digit}
              </button>
            ))}

            <button
              type="button"
              onClick={handleClear}
              className="h-13 rounded-xl bg-slate-950/50 hover:bg-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider active:scale-95 transition flex items-center justify-center"
            >
              Limpar
            </button>

            <button
              type="button"
              onClick={() => handleDigit('0')}
              className="h-13 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-lg font-bold text-white active:scale-95 transition shadow-sm flex items-center justify-center"
            >
              0
            </button>

            <button
              type="button"
              onClick={handleBackspace}
              className="h-13 rounded-xl bg-slate-950/50 hover:bg-slate-800 text-slate-400 active:scale-95 transition flex items-center justify-center"
            >
              <Delete size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="py-2.5 px-6 text-center text-[11px] text-slate-500 border-t border-slate-800/60 bg-slate-950 font-mono">
        BJJ ACADEMY OS • TOTEM KIOSK v2.4 • PROTOCOLO DE ACESSO CRIPTOGRAFADO
      </div>
    </div>
  );
};
