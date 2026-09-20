import React, { useState } from 'react';
import { 
  X, Award, ShieldCheck, CheckCircle2, QrCode, Printer, 
  Share2, ChevronRight, UserCheck, AlertCircle, FileText
} from 'lucide-react';
import { StudentProfile, BeltColor } from '../../types';
import { checkCBJJEligibility, generateOfficialCertificate } from '../../utils/cbjjGraduationHelper';

interface CBJJGraduationModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentProfile[];
  academyName: string;
  academyId: string;
  masterName?: string;
  masterCref?: string;
  onGraduateStudent?: (studentId: string, newBelt: BeltColor) => void;
}

export const CBJJGraduationModal: React.FC<CBJJGraduationModalProps> = ({
  isOpen,
  onClose,
  students,
  academyName,
  academyId,
  masterName = 'Mestre Messias Batista',
  masterCref = 'CREF 009841-G/CE',
  onGraduateStudent
}) => {
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(students[0] || null);
  const [showCertificateView, setShowCertificateView] = useState(false);
  const [certificateData, setCertificateData] = useState<any>(null);

  if (!isOpen) return null;

  const activeStudent = selectedStudent || students[0];
  const eligibility = activeStudent ? checkCBJJEligibility(activeStudent) : null;

  const handleGenerateCertificate = () => {
    if (!activeStudent || !eligibility) return;
    const cert = generateOfficialCertificate(
      activeStudent,
      academyName,
      academyId,
      masterName,
      masterCref,
      eligibility.nextBelt,
      activeStudent.stripes || 0
    );
    setCertificateData(cert);
    setShowCertificateView(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Award size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Régua de Graduação Oficial CBJJ / IBJJF
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  PADRÃO INTERNACIONAL
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Auditoria de carência de idade e meses de tatame com emissão de certificado oficial e QR Code.
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {!showCertificateView ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Lista de Alunos */}
              <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-3 max-h-[60vh] overflow-y-auto space-y-1.5">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block px-2 pb-1">
                  Atletas da Academia ({students.length})
                </span>
                {students.map((student) => {
                  const check = checkCBJJEligibility(student);
                  const isSelected = activeStudent?.id === student.id;
                  return (
                    <button
                      key={student.id}
                      onClick={() => setSelectedStudent(student)}
                      className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition ${
                        isSelected 
                          ? 'bg-amber-500/20 border border-amber-500/40 text-white' 
                          : 'hover:bg-slate-800/60 border border-transparent text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs shrink-0 text-white border border-slate-700">
                          {student.name.charAt(0)}
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold truncate text-white">{student.name}</div>
                          <div className="text-[11px] text-slate-400">
                            Faixa {student.belt} • {student.stripes || 0}º Grau
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        check.isEligible 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {check.isEligible ? 'Apto CBJJ' : 'Em carência'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Painel de Auditoria do Aluno Selecionado */}
              {activeStudent && eligibility && (
                <div className="md:col-span-2 space-y-4">
                  <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[11px] text-amber-400 font-bold uppercase tracking-wider">
                          Análise Regulatória CBJJ
                        </span>
                        <h4 className="text-lg font-black text-white mt-0.5">
                          {activeStudent.name}
                        </h4>
                        <p className="text-xs text-slate-400">
                          Faixa Atual: <strong className="text-white">{activeStudent.belt}</strong> ({activeStudent.stripes || 0} graus) ➔ Próxima: <strong className="text-amber-400">{eligibility.nextBelt}</strong>
                        </p>
                      </div>
                      <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold ${
                        eligibility.isEligible
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                          : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      }`}>
                        {eligibility.isEligible ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        {eligibility.isEligible ? 'Elegível pela CBJJ' : 'Carência Pendente'}
                      </div>
                    </div>

                    {/* Métricas CBJJ */}
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                        <div className="text-[11px] text-slate-400">Idade Mínima</div>
                        <div className="text-sm sm:text-base font-extrabold text-white mt-1">
                          {eligibility.currentAge} / {eligibility.minAgeRequired} anos
                        </div>
                        <div className="text-[10px] text-emerald-400 mt-0.5">
                          {eligibility.currentAge >= eligibility.minAgeRequired ? 'Aprovado' : 'Abaixo da idade'}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                        <div className="text-[11px] text-slate-400">Tempo na Faixa</div>
                        <div className="text-sm sm:text-base font-extrabold text-white mt-1">
                          {eligibility.monthsInCurrentBelt} / {eligibility.minMonthsRequired} meses
                        </div>
                        <div className="text-[10px] text-amber-400 mt-0.5">
                          {eligibility.monthsInCurrentBelt >= eligibility.minMonthsRequired ? 'Cumprido' : 'Em andamento'}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                        <div className="text-[11px] text-slate-400">Presenças Mínimas</div>
                        <div className="text-sm sm:text-base font-extrabold text-white mt-1">
                          {eligibility.attendanceCompleted} aulas
                        </div>
                        <div className="text-[10px] text-emerald-400 mt-0.5">
                          Assiduidade Ativa
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                      <strong>Parecer do Regulamento:</strong> {eligibility.reason}
                    </div>

                    {/* Ação */}
                    <div className="mt-4 flex flex-wrap gap-2.5">
                      <button
                        onClick={handleGenerateCertificate}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition"
                      >
                        <Award size={16} />
                        Emitir Certificado Oficial com QR Code
                      </button>
                      {eligibility.isEligible && onGraduateStudent && (
                        <button
                          onClick={() => {
                            onGraduateStudent(activeStudent.id, eligibility.nextBelt);
                            handleGenerateCertificate();
                          }}
                          className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition"
                        >
                          <CheckCircle2 size={16} />
                          Promover para {eligibility.nextBelt}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Visualização e Impressão do Certificado Oficial */
            <div className="space-y-4">
              <div className="p-2 flex justify-between items-center">
                <button
                  onClick={() => setShowCertificateView(false)}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5"
                >
                  ← Voltar para lista de atletas
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Printer size={14} /> Imprimir Certificado
                  </button>
                </div>
              </div>

              {/* Certificado Documental Padrão CBJJ */}
              <div className="p-6 sm:p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-4 border-amber-500/40 rounded-3xl text-center space-y-4 relative shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="text-xs font-extrabold tracking-widest text-amber-400 uppercase">
                  CONFEDERAÇÃO BRASILEIRA DE JIU-JITSU • IBJJF STANDARD
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-black text-white tracking-wide">
                  CERTIFICADO OFICIAL DE GRADUAÇÃO
                </h2>
                <p className="text-xs text-slate-400 max-w-lg mx-auto">
                  Certificamos para os devidos fins de honra e reconhecimento marcial que o atleta abaixo cumpriu todos os pré-requisitos técnicos, comportamentais e de carência temporal.
                </p>

                <div className="py-2">
                  <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-sans tracking-tight">
                    {certificateData?.studentName}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    CPF: {certificateData?.studentCpf} • Registro: {certificateData?.id}
                  </div>
                </div>

                <div className="inline-block px-5 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm font-bold">
                  Promovido(a) com louvor à Faixa <strong>{certificateData?.awardedBelt}</strong>
                </div>

                <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-800 text-left text-xs text-slate-300">
                  <div>
                    <span className="text-[10px] text-slate-500 block">ACADEMIA EMISSORA</span>
                    <strong className="text-white">{certificateData?.academyName}</strong>
                    <div className="text-[10px] text-slate-400 mt-0.5">{certificateData?.cbjjFederationNumber}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">MESTRE RESPONSÁVEL</span>
                    <strong className="text-white">{certificateData?.headMasterName}</strong>
                    <div className="text-[10px] text-slate-400 mt-0.5">{certificateData?.masterCref}</div>
                  </div>
                  <div className="flex items-center gap-2 sm:justify-end">
                    <QrCode size={40} className="text-amber-400 shrink-0" />
                    <div>
                      <span className="text-[9px] text-slate-500 block">AUTENTICIDADE</span>
                      <strong className="text-[10px] text-amber-300 font-mono block">{certificateData?.verificationHash}</strong>
                      <span className="text-[9px] text-emerald-400">Verificado em Nuvem</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
