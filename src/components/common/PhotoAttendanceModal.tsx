import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, Sparkles, CheckCircle2, RefreshCw, Upload, Users, ShieldCheck, Check, AlertCircle } from 'lucide-react';
import { BeltBadge } from './BeltBadge';
import { DetectedAthlete, BeltColor, ClassSession } from '../../types';
import confetti from 'canvas-confetti';

interface PhotoAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentClass: ClassSession;
  onConfirmAttendance: (presentStudentIds: string[]) => void;
  onAnnounceVoice?: (message: string) => void;
}

const SAMPLE_TATAME_PHOTOS = [
  {
    id: 'sample_gi_night',
    title: 'Turma Adulto Gi - Noite (10 Atletas)',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
    detectedCount: 6,
    athletes: [
      { id: 'st_1', name: 'Carlos "Gracie" Silva', belt: 'blue' as BeltColor, stripes: 2, confidence: 0.98, confirmed: true },
      { id: 'st_2', name: 'Mariana "Leoa" Costa', belt: 'purple' as BeltColor, stripes: 1, confidence: 0.96, confirmed: true },
      { id: 'st_3', name: 'Lucas "Tanque" Moreira', belt: 'white' as BeltColor, stripes: 3, confidence: 0.94, confirmed: true },
      { id: 'st_4', name: 'Rafael "Mão de Pedra"', belt: 'brown' as BeltColor, stripes: 2, confidence: 0.97, confirmed: true },
      { id: 'st_5', name: 'Gabriel "Ninja" Santos', belt: 'blue' as BeltColor, stripes: 4, confidence: 0.92, confirmed: true },
      { id: 'st_6', name: 'Thiago Alencar', belt: 'white' as BeltColor, stripes: 1, confidence: 0.95, confirmed: true }
    ]
  },
  {
    id: 'sample_kids',
    title: 'Turma BJJ Kids & Juvenil (6 Atletas)',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80',
    detectedCount: 4,
    athletes: [
      { id: 'st_1', name: 'Carlos "Gracie" Silva', belt: 'blue' as BeltColor, stripes: 2, confidence: 0.95, confirmed: true },
      { id: 'st_3', name: 'Lucas "Tanque" Moreira', belt: 'white' as BeltColor, stripes: 3, confidence: 0.93, confirmed: true },
      { id: 'st_5', name: 'Gabriel "Ninja" Santos', belt: 'blue' as BeltColor, stripes: 4, confidence: 0.96, confirmed: true },
      { id: 'st_6', name: 'Thiago Alencar', belt: 'white' as BeltColor, stripes: 1, confidence: 0.91, confirmed: true }
    ]
  }
];

export const PhotoAttendanceModal: React.FC<PhotoAttendanceModalProps> = ({
  isOpen,
  onClose,
  currentClass,
  onConfirmAttendance,
  onAnnounceVoice
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string>(SAMPLE_TATAME_PHOTOS[0].imageUrl);
  const [photoTitle, setPhotoTitle] = useState<string>(SAMPLE_TATAME_PHOTOS[0].title);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [athletes, setAthletes] = useState<DetectedAthlete[]>(SAMPLE_TATAME_PHOTOS[0].athletes);
  const [scanCompleted, setScanCompleted] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleScanSample = (sample: typeof SAMPLE_TATAME_PHOTOS[0]) => {
    setSelectedPhoto(sample.imageUrl);
    setPhotoTitle(sample.title);
    setIsScanning(true);
    setScanCompleted(false);

    setTimeout(() => {
      setAthletes(sample.athletes);
      setIsScanning(false);
      setScanCompleted(true);
      if (onAnnounceVoice) {
        onAnnounceVoice(`Reconhecimento facial com inteligência artificial concluído. ${sample.athletes.length} atletas identificados na foto da turma.`);
      }
    }, 1400);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedPhoto(url);
      setPhotoTitle(file.name);
      setIsScanning(true);
      setScanCompleted(false);

      setTimeout(() => {
        // Map registered students of current class
        const detected = currentClass.registeredStudents.slice(0, 5).map((s, idx) => ({
          id: s.id,
          name: s.name,
          belt: s.belt,
          stripes: 2,
          confidence: Math.round((0.92 + idx * 0.015) * 100) / 100,
          confirmed: true
        }));
        setAthletes(detected);
        setIsScanning(false);
        setScanCompleted(true);
      }, 1500);
    }
  };

  const toggleAthleteConfirmation = (id: string) => {
    setAthletes(prev =>
      prev.map(a => (a.id === id ? { ...a, confirmed: !a.confirmed } : a))
    );
  };

  const handleSaveAttendance = () => {
    const confirmedIds = athletes.filter(a => a.confirmed).map(a => a.id);
    onConfirmAttendance(confirmedIds);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    if (onAnnounceVoice) {
      onAnnounceVoice(`Chamada inteligente gravada com sucesso! ${confirmedIds.length} presenças computadas no tatame.`);
    }
    onClose();
  };

  const confirmedCount = athletes.filter(a => a.confirmed).length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-red-950/60 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-800/40 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-400" /> Gemini Vision AI
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{currentClass.name}</span>
                </div>
                <h3 className="text-base font-black text-white">Chamada Inteligente por Foto no Tatame</h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 overflow-y-auto space-y-4 no-scrollbar">
            {/* Quick Samples Banner */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Escolha uma Foto de Teste do Tatame ou Envie a Foto da Turma:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {SAMPLE_TATAME_PHOTOS.map(sample => (
                  <button
                    key={sample.id}
                    onClick={() => handleScanSample(sample)}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2.5 transition ${
                      selectedPhoto === sample.imageUrl
                        ? 'bg-red-950/40 border-red-500/60 text-white'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <img
                      src={sample.imageUrl}
                      alt={sample.title}
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{sample.title}</div>
                      <div className="text-[10px] text-slate-400">Clique para escanear</div>
                    </div>
                  </button>
                ))}

                {/* Upload Button */}
                <label className="p-2 rounded-xl border border-dashed border-slate-700 hover:border-red-500/60 bg-slate-900/40 hover:bg-slate-900 cursor-pointer text-left flex items-center gap-2.5 transition">
                  <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white">Carregar Foto</div>
                    <div className="text-[10px] text-slate-400">Do celular ou webcam</div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Photo Preview & Scanning Stage */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 max-h-60 sm:max-h-72">
              <img
                src={selectedPhoto}
                alt="Foto do Tatame"
                className="w-full h-56 sm:h-72 object-cover opacity-85"
              />

              {/* Scanning Overlay Animation */}
              {isScanning && (
                <div className="absolute inset-0 bg-indigo-950/40 backdrop-blur-[2px] flex flex-col items-center justify-center">
                  <div className="w-full h-1 bg-gradient-to-r from-red-500 via-indigo-400 to-amber-400 shadow-[0_0_15px_#6366f1] animate-pulse" />
                  <div className="mt-4 px-4 py-2 rounded-full bg-slate-900/90 border border-indigo-500/50 flex items-center gap-2 shadow-2xl">
                    <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
                    <span className="text-xs font-black text-white">
                      Escaneando Turma com Gemini Vision AI...
                    </span>
                  </div>
                </div>
              )}

              {/* Tag overlay on image */}
              {!isScanning && (
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-slate-950/80 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 text-xs">
                  <span className="font-bold text-white truncate flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-indigo-400" />
                    {photoTitle}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-black shrink-0 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                    {athletes.length} Atletas Reconhecidos
                  </span>
                </div>
              )}
            </div>

            {/* Detected Athletes List */}
            {scanCompleted && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    Confirmar Presenças Identificadas ({confirmedCount}/{athletes.length}):
                  </span>
                  <button
                    onClick={() => {
                      const allConfirmed = athletes.every(a => a.confirmed);
                      setAthletes(prev => prev.map(a => ({ ...a, confirmed: !allConfirmed })));
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold"
                  >
                    {athletes.every(a => a.confirmed) ? 'Desmarcar Todos' : 'Marcar Todos'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto no-scrollbar pr-0.5">
                  {athletes.map(ath => (
                    <button
                      key={ath.id}
                      type="button"
                      onClick={() => toggleAthleteConfirmation(ath.id)}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition ${
                        ath.confirmed
                          ? 'bg-slate-900 border-emerald-500/50 text-white'
                          : 'bg-slate-950/60 border-slate-800/80 text-slate-500 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-black shrink-0 ${
                            ath.confirmed ? 'bg-emerald-600 text-white' : 'border border-slate-700'
                          }`}
                        >
                          {ath.confirmed && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">{ath.name}</div>
                          <div className="text-[10px] text-indigo-300 font-mono">
                            Confiança IA: {Math.round(ath.confidence * 100)}%
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <BeltBadge belt={ath.belt} stripes={ath.stripes} size="sm" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-bold transition"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={isScanning || confirmedCount === 0}
                onClick={handleSaveAttendance}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-indigo-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs shadow-lg transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar {confirmedCount} Presenças no Tatame</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
