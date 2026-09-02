import React, { useState } from 'react';
import { 
  X, Award, CheckCircle2, Clock, Calendar, FileText, 
  Send, Sparkles, AlertCircle, Shield, Printer, Check
} from 'lucide-react';
import { GraduationEligibility, BeltColor } from '../../types';
import { mockGraduationCandidates } from '../../data/mockData';
import { BeltBadge } from './BeltBadge';

interface GraduationExamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GraduationExamModal: React.FC<GraduationExamModalProps> = ({ isOpen, onClose }) => {
  const [candidates, setCandidates] = useState<GraduationEligibility[]>(mockGraduationCandidates);
  const [selectedCandidate, setSelectedCandidate] = useState<GraduationEligibility | null>(null);
  const [showCertificate, setShowCertificate] = useState<boolean>(false);
  const [certificateCandidate, setCertificateCandidate] = useState<GraduationEligibility | null>(null);

  if (!isOpen) return null;

  const convokeCandidate = (studentId: string) => {
    setCandidates(prev => prev.map(c => {
      if (c.studentId === studentId) {
        return { ...c, convokedForExam: true };
      }
      return c;
    }));
  };

  const openCertificate = (candidate: GraduationEligibility) => {
    setCertificateCandidate(candidate);
    setShowCertificate(true);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col justify-end sm:justify-center items-center sm:p-4"
      id="modal-graduation-exam"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-3xl h-[92vh] sm:h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Award size={20} />
            </div>
            <div>
              <h2 className="font-bold text-white text-base leading-tight">
                Painel de Graduação & Exames de Faixa
              </h2>
              <p className="text-xs text-slate-400">
                Regulamento Oficial CBJJ / IBJJF • Tempo de Carência & Aulas
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Certificate Modal View Overlay */}
        {showCertificate && certificateCandidate && (
          <div className="absolute inset-0 z-20 bg-slate-950/95 p-4 flex flex-col items-center justify-center overflow-y-auto">
            <div className="w-full max-w-xl bg-amber-50 text-slate-950 border-8 border-amber-700/80 rounded-2xl p-6 shadow-2xl relative">
              {/* Seal */}
              <div className="absolute top-4 right-4 w-14 h-14 rounded-full border-2 border-amber-600 flex items-center justify-center text-amber-700 font-bold text-[10px] uppercase text-center rotate-12">
                Selo Oficial<br/>CBJJ
              </div>

              <div className="text-center space-y-2">
                <div className="text-xs font-bold uppercase tracking-widest text-amber-900">
                  BJJ Academy • Confederação de Jiu-Jitsu
                </div>
                <h3 className="text-2xl font-serif font-black tracking-tight text-slate-900">
                  CERTIFICADO DE GRADUAÇÃO
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Certificamos que o atleta cumpriu com excelência todos os requisitos técnicos, disciplinares e tempo de carência para outorga de graduação.
                </p>
              </div>

              <div className="my-6 text-center border-y border-amber-300/80 py-4">
                <div className="text-xs text-slate-500 font-medium">Outorgado a:</div>
                <div className="text-xl font-bold font-serif text-slate-900 mt-0.5">
                  {certificateCandidate.studentName}
                </div>
                <div className="text-xs text-amber-800 font-semibold mt-1">
                  Promovido a: Faixa {certificateCandidate.recommendedNextBelt.toUpperCase()}
                </div>
              </div>

              <div className="flex justify-between items-end pt-4 text-center">
                <div>
                  <div className="w-32 border-b border-slate-700 mx-auto" />
                  <div className="text-[10px] text-slate-600 font-semibold mt-1">Mestre Rodrigo Cavalo</div>
                  <div className="text-[9px] text-slate-500">Faixa Preta 3º Grau</div>
                </div>
                <div className="text-[10px] text-slate-500">
                  Registrado no Livro #04 • Fls 82<br/>
                  Data: 10/12/2026
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg"
              >
                <Printer size={15} /> Imprimir Certificado
              </button>
              <button
                onClick={() => setShowCertificate(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Voltar
              </button>
            </div>
          </div>
        )}

        {/* CBJJ Rules Banner */}
        <div className="p-4 bg-slate-800/40 border-b border-slate-800">
          <div className="flex items-start gap-3">
            <Shield size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-white">Critérios Mínimos da CBJJ: </span>
              <span className="text-slate-300">
                Faixa Branca (mín. 12 meses / 100 aulas) • Faixa Azul (mín. 24 meses / 180 aulas) • Faixa Roxa (mín. 18 meses / 150 aulas) • Faixa Marrom (mín. 12 meses / 120 aulas).
              </span>
            </div>
          </div>
        </div>

        {/* Candidates List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Alunos Monitorados para a Próxima Graduação ({candidates.length})
          </div>

          {candidates.map((cand) => (
            <div 
              key={cand.studentId}
              className={`border rounded-2xl p-4 transition-all ${
                cand.isEligible 
                  ? 'bg-slate-800/80 border-emerald-500/50 shadow-lg shadow-emerald-500/5' 
                  : 'bg-slate-800/40 border-slate-700/60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img 
                    src={cand.avatar} 
                    alt={cand.studentName} 
                    className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                  />
                  <div>
                    <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                      {cand.studentName}
                      {cand.isEligible && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                          Apto para Exame
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <BeltBadge belt={cand.currentBelt} stripes={cand.currentStripes} size="sm" showLabel />
                      <span className="text-xs text-slate-400">→</span>
                      <span className="text-xs font-semibold text-amber-400">
                        Próxima: {cand.recommendedNextBelt.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  {cand.convokedForExam ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-600/40 px-3 py-1.5 rounded-xl">
                      <Check size={14} /> Convocado
                    </span>
                  ) : cand.isEligible ? (
                    <button
                      onClick={() => convokeCandidate(cand.studentId)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-white bg-red-600 hover:bg-red-500 px-3 py-1.5 rounded-xl shadow-md active:scale-95 transition-all"
                    >
                      <Send size={13} /> Convocar Exame
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg">
                      <Clock size={13} /> Em Evolução
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bars: Time & Attendances */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-700/60 text-xs">
                {/* Time requirement */}
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>Tempo de Carência na Faixa:</span>
                    <span className="font-bold text-white">
                      {cand.timeInCurrentBeltMonths}/{cand.minimumTimeMonthsNeeded} meses
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        cand.timeInCurrentBeltMonths >= cand.minimumTimeMonthsNeeded 
                          ? 'bg-emerald-500' 
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, (cand.timeInCurrentBeltMonths / cand.minimumTimeMonthsNeeded) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Attendance requirement */}
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>Presenças em Treinos:</span>
                    <span className="font-bold text-white">
                      {cand.attendancesCount}/{cand.minimumAttendancesNeeded} aulas
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        cand.attendancesCount >= cand.minimumAttendancesNeeded 
                          ? 'bg-emerald-500' 
                          : 'bg-cyan-500'
                      }`}
                      style={{ width: `${Math.min(100, (cand.attendancesCount / cand.minimumAttendancesNeeded) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons (Certificate) */}
              <div className="mt-3 flex justify-end gap-2">
                <button
                  onClick={() => openCertificate(cand)}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                >
                  <FileText size={13} /> Visualizar Modelo de Certificado
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
