import React, { useState } from 'react';
import { 
  X, QrCode, CheckCircle, AlertTriangle, UserCheck, ShieldCheck, 
  Delete, Sparkles, RefreshCw, Volume2, Lock, Unlock, Camera
} from 'lucide-react';
import { bjjAudio } from '../../utils/audio';
import { mockStudent } from '../../data/mockData';
import { BeltBadge } from './BeltBadge';

interface KioskTurnstileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KioskTurnstileModal: React.FC<KioskTurnstileModalProps> = ({ isOpen, onClose }) => {
  const [pin, setPin] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'success' | 'denied' | 'scanning'>('idle');
  const [recognizedStudent, setRecognizedStudent] = useState<any>(null);
  const [attendanceCount, setAttendanceCount] = useState<number>(38);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length < 6 && status === 'idle') {
      const nextPin = pin + digit;
      setPin(nextPin);
      bjjAudio.playBeep(600, 0.05);

      // Auto trigger if 4 digits (e.g. 1024 or 2024 or 1234)
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

  const verifyPin = (code: string) => {
    // If student pin or mock demo codes
    if (code === '1024' || code === '1234' || code === '2024' || code.length === 4) {
      // Access granted
      bjjAudio.playAccessGranted();
      setStatus('success');
      setAttendanceCount(prev => prev + 1);
      setRecognizedStudent({
        name: mockStudent.name,
        avatar: mockStudent.avatar,
        belt: mockStudent.belt,
        stripes: mockStudent.stripes,
        financialStatus: 'Mensalidade em Dia (Set/2026)',
        lastGraduation: '3º Grau',
        trainingType: 'Jiu-Jitsu Noturno • Tatame 1'
      });

      // Auto reset back to idle after 4 seconds
      setTimeout(() => {
        setPin('');
        setStatus('idle');
        setRecognizedStudent(null);
      }, 4000);
    } else {
      // Access denied
      bjjAudio.playAccessDenied();
      setStatus('denied');
      setTimeout(() => {
        setPin('');
        setStatus('idle');
      }, 2500);
    }
  };

  const simulateQrScan = () => {
    setStatus('scanning');
    bjjAudio.playBeep(700, 0.1);
    setTimeout(() => {
      verifyPin('1024');
    }, 1200);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950 flex flex-col text-white"
      id="modal-kiosk-turnstile"
    >
      {/* Kiosk Header */}
      <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-900/90 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center font-black text-lg shadow-lg shadow-red-600/30">
            BJJ
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-wide flex items-center gap-2">
              TOTEM DE RECEPÇÃO & CATRACA ELETRÔNICA
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold uppercase">
                Online
              </span>
            </h1>
            <p className="text-xs text-slate-400">BJJ Academy • Unidade Jardins • Check-in por Matrícula ou QR</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <X size={16} /> Sair do Totem
        </button>
      </div>

      {/* Main Kiosk Area */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center p-6 gap-8 max-w-5xl mx-auto w-full">
        {/* Left Side: Instructions & Scan Action */}
        <div className="w-full md:w-1/2 flex flex-col items-center text-center space-y-5">
          {status === 'idle' && (
            <>
              <div className="w-24 h-24 rounded-3xl bg-slate-900 border-2 border-slate-700 flex items-center justify-center shadow-inner text-slate-400">
                <Lock size={42} className="text-red-500 animate-pulse" />
              </div>

              <div>
                <h2 className="text-2xl font-black text-white">BEM-VINDO AO TATAME</h2>
                <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">
                  Digite sua matrícula no teclado ao lado ou aponte a câmera para o QR Code do seu app.
                </p>
              </div>

              {/* QR Code fast check-in button */}
              <button
                onClick={simulateQrScan}
                className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-bold shadow-lg transition-all active:scale-95"
              >
                <QrCode size={20} className="text-red-400" />
                Simular Leitura de QR Code / Face ID
              </button>
            </>
          )}

          {status === 'scanning' && (
            <div className="flex flex-col items-center space-y-4 py-8">
              <div className="w-20 h-20 rounded-full border-4 border-red-500 border-t-transparent animate-spin" />
              <p className="text-sm font-bold text-slate-300">Lendo código do app do aluno...</p>
            </div>
          )}

          {status === 'success' && recognizedStudent && (
            <div className="bg-emerald-950/40 border-2 border-emerald-500/60 rounded-3xl p-6 w-full max-w-md shadow-2xl flex flex-col items-center animate-in fade-in zoom-in duration-300">
              <div className="relative mb-3">
                <img 
                  src={recognizedStudent.avatar} 
                  alt={recognizedStudent.name} 
                  className="w-24 h-24 rounded-full object-cover border-4 border-emerald-500 shadow-xl"
                />
                <div className="absolute -bottom-2 -right-2 p-2 bg-emerald-500 text-white rounded-full shadow-md">
                  <CheckCircle size={22} />
                </div>
              </div>

              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Unlock size={14} /> Catraca Liberada
              </span>

              <h3 className="text-xl font-black text-white">{recognizedStudent.name}</h3>

              <div className="my-2">
                <BeltBadge belt={recognizedStudent.belt} stripes={recognizedStudent.stripes} size="md" showLabel />
              </div>

              <div className="bg-emerald-900/40 rounded-xl px-4 py-2 border border-emerald-600/30 text-xs text-emerald-200 font-medium space-y-0.5 mt-2 text-center w-full">
                <div>✓ {recognizedStudent.financialStatus}</div>
                <div>🥋 Treino #{attendanceCount} computado para grau</div>
              </div>

              <p className="text-xs text-emerald-400/80 font-bold mt-3 animate-pulse">
                Bom treino, guerreiro! Oss!
              </p>
            </div>
          )}

          {status === 'denied' && (
            <div className="bg-red-950/40 border-2 border-red-500/60 rounded-3xl p-6 w-full max-w-md shadow-2xl flex flex-col items-center animate-in fade-in duration-200">
              <div className="w-20 h-20 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center mb-3">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-lg font-bold text-white">Matrícula não identificada</h3>
              <p className="text-xs text-red-300 mt-1 text-center">
                Verifique os números digitados ou dirija-se à recepção para regularização.
              </p>
            </div>
          )}
        </div>

        {/* Right Side: Big Touch Keypad */}
        <div className="w-full md:w-1/2 max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          {/* Display screen */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 mb-5 text-center">
            <div className="text-xs text-slate-400 font-medium mb-1">Matrícula do Aluno</div>
            <div className="font-mono text-3xl font-black tracking-widest text-red-400 h-10 flex items-center justify-center">
              {pin ? pin : <span className="text-slate-700 text-2xl font-normal">_ _ _ _</span>}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Dica teste: digite 1024</div>
          </div>

          {/* 3x4 Touch Grid */}
          <div className="grid grid-cols-3 gap-3">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                onClick={() => handleDigit(digit)}
                className="h-16 rounded-2xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-2xl font-black text-white active:scale-95 transition-all shadow-md flex items-center justify-center"
              >
                {digit}
              </button>
            ))}

            <button
              onClick={handleClear}
              className="h-16 rounded-2xl bg-slate-800/40 hover:bg-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center"
            >
              Limpar
            </button>

            <button
              onClick={() => handleDigit('0')}
              className="h-16 rounded-2xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-2xl font-black text-white active:scale-95 transition-all shadow-md flex items-center justify-center"
            >
              0
            </button>

            <button
              onClick={handleBackspace}
              className="h-16 rounded-2xl bg-slate-800/40 hover:bg-slate-800 text-slate-300 active:scale-95 transition-all flex items-center justify-center"
            >
              <Delete size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="py-3 px-6 text-center text-xs text-slate-500 border-t border-slate-800/60 bg-slate-950">
        Modo Kiosk Tablet • Suporta leitor USB/NFC de proximidade ou teclado de tela de toque.
      </div>
    </div>
  );
};
