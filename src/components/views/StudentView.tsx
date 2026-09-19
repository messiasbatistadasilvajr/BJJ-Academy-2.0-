import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, Award, BarChart3, DollarSign, MessageSquare, 
  Camera, CheckCircle2, ChevronRight, Bell, Sparkles, 
  Flame, Lock, ArrowUpRight, Clock, MapPin, QrCode, Send,
  Timer, BookOpen, ShoppingBag, Trophy, FileText, Play,
  AlertTriangle, Calculator, Building2, Cake
} from 'lucide-react';
import { StudentProfile, ClassSession, Invoice, Announcement, ChatMessage, RankingMember, RegisteredAcademy } from '../../types';
import { BeltBadge } from '../common/BeltBadge';
import { calculateLateFeeAndInterest, formatBRL } from '../../utils/financialCalculations';
import { AcademyOperatingHoursModal } from '../common/AcademyOperatingHoursModal';

interface StudentViewProps {
  student: StudentProfile;
  classes: ClassSession[];
  invoices: Invoice[];
  announcements: Announcement[];
  chatMessages: ChatMessage[];
  rankings: RankingMember[];
  onOpenBiometrics: () => void;
  onOpenCamera: () => void;
  onOpenPix: (invoice: Invoice) => void;
  onOpenReceipt: (invoice: Invoice) => void;
  onToggleCheckIn: (classId: string) => void;
  onSendMessage: (text: string) => void;
  onOpenScoreboard?: () => void;
  onOpenTechniques?: () => void;
  onOpenGraduation?: () => void;
  onOpenProShop?: () => void;
  onOpenContract?: () => void;
  onOpenTournaments?: () => void;
  onOpenFinancial?: () => void;
  onOpenSparringJournal?: () => void;
  onOpenBeltGuide?: () => void;
  academyName?: string;
  activeAcademy?: RegisteredAcademy;
}

export const StudentView: React.FC<StudentViewProps> = ({
  student,
  classes,
  invoices,
  announcements,
  chatMessages,
  rankings,
  onOpenBiometrics,
  onOpenCamera,
  onOpenPix,
  onOpenReceipt,
  onToggleCheckIn,
  onSendMessage,
  onOpenScoreboard,
  onOpenTechniques,
  onOpenGraduation,
  onOpenProShop,
  onOpenContract,
  onOpenTournaments,
  onOpenFinancial,
  onOpenSparringJournal,
  onOpenBeltGuide,
  academyName,
  activeAcademy,
}) => {
  const [activeTab, setActiveTab] = useState<'treinos' | 'graduacao' | 'frequencia' | 'financeiro' | 'comunicados'>('treinos');
  const [chatInput, setChatInput] = useState('');
  const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);

  const pendingInvoice = invoices.find(i => i.status === 'pending' || i.status === 'overdue');
  const nextDegreeProgress = (student && student.classesForNextDegree > 0)
    ? Math.min(100, Math.max(0, Math.round(((student.currentAttendanceCount || 0) / student.classesForNextDegree) * 100)))
    : 0;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendMessage(chatInput.trim());
    setChatInput('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/65 backdrop-blur-[0.5px] text-slate-100 overflow-y-auto pb-20 no-scrollbar">
      {/* Student Hero Header */}
      <div className="relative px-5 pt-4 pb-5 bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-950/75 border-b border-slate-800/80">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={student.avatar}
                alt={student.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-red-600/80 shadow-lg"
              />
              <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-slate-900 border border-slate-700 text-amber-400">
                <Flame className="w-3 h-3 fill-amber-400" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">{student.name}</h2>
                <button
                  onClick={onOpenBiometrics}
                  title="Bloquear/Autenticar com Biometria"
                  className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-red-400 hover:bg-slate-700 transition"
                >
                  <Lock className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Matrícula #9821 • {student.category}
              </p>
              <div className="mt-1">
                <BeltBadge belt={student.belt} stripes={student.stripes} size="sm" />
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="inline-flex flex-col items-end px-2.5 py-1 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[9px] text-slate-400 font-bold uppercase">Ranking</span>
              <span className="text-xs font-black text-amber-400">#{student.rankingPosition} Geral</span>
            </div>
          </div>
        </div>

        {/* 🎂 Birthday Congratulations Banner */}
        <div className="mb-3 p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-950/40 border border-amber-500/40 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center shrink-0">
            <Cake className="w-5 h-5 animate-bounce text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-amber-300">🎉 Parabéns pelo seu dia, {student.name.split(' ')[0]}!</span>
              <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded-full">HOJE</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-tight mt-0.5">
              Toda a família da <strong className="text-amber-200">{academyName || 'BJJ Academy'}</strong> te parabeniza por mais um ano de vida, saúde e muita garra no tatame! OSS! 🥋🎈
            </p>
          </div>
        </div>

        {/* Next Degree Progress Card */}
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-red-500" />
              Rumo ao 4º Grau na Faixa Azul
            </span>
            <span className="font-bold text-red-400">{student.currentAttendanceCount}/{student.classesForNextDegree} aulas ({nextDegreeProgress}%)</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, nextDegreeProgress)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-red-600 via-red-500 to-amber-500 rounded-full"
            />
          </div>
          <div className="flex justify-between items-center mt-1.5 text-[10px] text-slate-400">
            <span>Faltam apenas 3 aulas para o exame</span>
            <span className="text-emerald-400 font-medium">Frequência Alta ⭐</span>
          </div>
        </div>

        {/* Quick Action Pills */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <button
            onClick={onOpenCamera}
            className="p-2.5 rounded-xl bg-gradient-to-br from-red-600/20 to-red-900/10 border border-red-500/30 hover:border-red-500/60 flex flex-col items-center justify-center gap-1 text-center transition"
          >
            <Camera className="w-4 h-4 text-red-400" />
            <span className="text-[10px] font-bold text-slate-200">Foto de Presença</span>
          </button>

          <button
            onClick={() => {
              if (pendingInvoice) onOpenPix(pendingInvoice);
              else setActiveTab('financeiro');
            }}
            className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-teal-500/40 flex flex-col items-center justify-center gap-1 text-center transition"
          >
            <QrCode className="w-4 h-4 text-teal-400" />
            <span className="text-[10px] font-bold text-slate-200">Pagar PIX</span>
          </button>

          <button
            onClick={() => setActiveTab('treinos')}
            className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 flex flex-col items-center justify-center gap-1 text-center transition"
          >
            <Calendar className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-bold text-slate-200">Fazer Check-in</span>
          </button>
        </div>

        {/* Tatame 2.0 Quick Features Bar */}
        <div className="grid grid-cols-5 gap-1.5 mt-2.5">
          <button
            onClick={onOpenTechniques}
            className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 flex flex-col items-center gap-1 text-center transition group"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-semibold text-slate-300 leading-tight">Videoteca</span>
          </button>

          <button
            onClick={onOpenScoreboard}
            className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-red-500/50 flex flex-col items-center gap-1 text-center transition group"
          >
            <Timer className="w-3.5 h-3.5 text-red-400 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-semibold text-slate-300 leading-tight">Placar</span>
          </button>

          <button
            onClick={onOpenTournaments}
            className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 flex flex-col items-center gap-1 text-center transition group"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-semibold text-slate-300 leading-tight">Torneios</span>
          </button>

          <button
            onClick={onOpenProShop}
            className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 flex flex-col items-center gap-1 text-center transition group"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-semibold text-slate-300 leading-tight">Pro-Shop</span>
          </button>

          <button
            onClick={onOpenSparringJournal}
            className="p-2 rounded-xl bg-gradient-to-b from-red-950/80 to-slate-900/90 border border-red-800/60 hover:border-red-500/80 flex flex-col items-center gap-1 text-center transition group shadow-sm"
          >
            <Flame className="w-3.5 h-3.5 text-red-400 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-black text-red-300 leading-tight">Diário Rola</span>
          </button>
        </div>

        {/* Diário de Rola & Raio-X Técnico Banner */}
        {onOpenSparringJournal && (
          <div 
            onClick={onOpenSparringJournal}
            className="mt-2.5 p-2.5 rounded-2xl bg-gradient-to-r from-red-950/60 via-slate-900 to-amber-950/40 border border-red-800/40 hover:border-red-500/60 cursor-pointer flex items-center justify-between transition group shadow-md"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-400 border border-red-500/40 flex items-center justify-center group-hover:scale-105 transition">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white group-hover:text-red-300 transition">
                    📓 Diário de Rola & Raio-X Técnico
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-red-500/20 text-red-400 border border-red-500/30">
                    Game Analysis
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Registre seus rolas do dia, descubra seus golpes favoritos e onde você mais bate
                </p>
              </div>
            </div>
            <div className="p-1.5 rounded-xl bg-slate-800 text-slate-400 group-hover:text-white transition">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>

      {/* Internal Navigation Subtabs */}
      <div className="flex items-center gap-1 px-4 py-2.5 bg-slate-900/50 border-b border-slate-800/80 overflow-x-auto no-scrollbar">
        {[
          { id: 'treinos', label: 'Agenda & Treinos', icon: Calendar },
          { id: 'graduacao', label: 'Graduações', icon: Award },
          { id: 'frequencia', label: 'Frequência', icon: BarChart3 },
          { id: 'financeiro', label: 'Mensalidades', icon: DollarSign },
          { id: 'comunicados', label: 'Mural & Chat', icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 flex items-center gap-1.5 transition ${
                isActive
                  ? 'bg-red-600 text-white shadow-md shadow-red-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content Area */}
      <div className="p-4 space-y-4">
        {/* 1. TREINOS & AGENDA */}
        {activeTab === 'treinos' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Grade de Treinos de Hoje (Quinta-feira)
              </h3>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsHoursModalOpen(true)}
                  className="text-[10px] text-amber-300 font-bold bg-amber-500/15 hover:bg-amber-500/25 px-2.5 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1 transition"
                  title="Ver todos os horários e dias de funcionamento da academia"
                >
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>Horários Gerais</span>
                </button>
                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
                  Tatames Abertos
                </span>
              </div>
            </div>

            {classes.map((cls) => {
              const isCheckedIn = cls.checkedIn;
              return (
                <div
                  key={cls.id}
                  className={`p-3.5 rounded-2xl border transition ${
                    isCheckedIn
                      ? 'bg-slate-900/90 border-emerald-500/50 shadow-lg shadow-emerald-950/20'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-white">{cls.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                          {cls.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-red-400" /> {cls.time} ({cls.duration})
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" /> {cls.tatame}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onToggleCheckIn(cls.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-md ${
                        isCheckedIn
                          ? 'bg-emerald-600 text-white'
                          : 'bg-red-600 hover:bg-red-700 text-white shadow-red-950'
                      }`}
                    >
                      {isCheckedIn ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Confirmado
                        </>
                      ) : (
                        'Check-in'
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <img
                        src={cls.instructorAvatar}
                        alt={cls.instructor}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span>{cls.instructor}</span>
                    </div>
                    <span className="text-slate-500 font-medium">
                      {cls.enrolledCount}/{cls.capacity} atletas
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 2. GRADUAÇÃO */}
        {activeTab === 'graduacao' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">
                Graduação Oficial CBJJ
              </span>
              <div className="my-3 flex justify-center">
                <BeltBadge belt={student.belt} stripes={student.stripes} size="hero" />
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Faixa Azul com 3 Graus • Próxima etapa: 4º Grau
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Certificado por Mestre Rodrigo "Cavalo" (Faixa Preta 3º Grau)
              </p>

              <div className="mt-3 flex flex-col sm:flex-row gap-2">
                {onOpenGraduation && (
                  <button
                    onClick={onOpenGraduation}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-950/40 transition"
                  >
                    <Award className="w-4 h-4" />
                    <span>Verificar Elegibilidade & Simulado</span>
                  </button>
                )}
                {onOpenBeltGuide && (
                  <button
                    type="button"
                    onClick={onOpenBeltGuide}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition"
                  >
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span>Tabela Oficial IBJJF</span>
                  </button>
                )}
              </div>
            </div>

            {onOpenContract && (
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Contrato & Termo de Isenção</h5>
                    <p className="text-[10px] text-slate-400">Assinatura digital e atestado médico</p>
                  </div>
                </div>
                <button
                  onClick={onOpenContract}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold text-[11px] border border-slate-700"
                >
                  Visualizar
                </button>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Histórico de Graduações & Conquistas
              </h4>
              <div className="space-y-2.5">
                {student.promotions.map((prom) => (
                  <div
                    key={prom.id}
                    className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/90 flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-xl bg-red-950/60 border border-red-800/40 flex items-center justify-center text-red-400 shrink-0">
                      <Award className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <BeltBadge belt={prom.belt} stripes={prom.stripes} size="sm" />
                        <span className="text-[10px] text-slate-500">{prom.date}</span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium mt-1">{prom.instructor}</p>
                      {prom.notes && (
                        <p className="text-[11px] text-slate-400 mt-0.5 italic">"{prom.notes}"</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. FREQUÊNCIA */}
        {activeTab === 'frequencia' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Treinos Mês</div>
                <div className="text-2xl font-black text-white mt-1">16</div>
                <div className="text-[10px] text-emerald-400 font-semibold">+4 vs mês ant.</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Sequência</div>
                <div className="text-2xl font-black text-amber-400 mt-1">5 sem.</div>
                <div className="text-[10px] text-amber-300/80 font-medium">Invicto no tatame</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Assiduidade</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">92%</div>
                <div className="text-[10px] text-slate-400 font-medium">Excepcional</div>
              </div>
            </div>

            {/* Attendance Days of Week */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-white">Treinos por Dia da Semana</h4>
              <div className="grid grid-cols-6 gap-1.5 text-center pt-2">
                {[
                  { day: 'Seg', count: 4, active: true },
                  { day: 'Ter', count: 3, active: true },
                  { day: 'Qua', count: 4, active: true },
                  { day: 'Qui', count: 3, active: true },
                  { day: 'Sex', count: 2, active: true },
                  { day: 'Sáb', count: 0, active: false }
                ].map((d) => (
                  <div
                    key={d.day}
                    className={`p-2 rounded-xl border ${
                      d.active ? 'bg-red-950/40 border-red-800/50 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="text-[10px] font-bold">{d.day}</div>
                    <div className="text-base font-black mt-0.5">{d.count}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ranking Preview */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" /> Guerreiros do Mês (Ranking)
                </h4>
                <span className="text-[10px] text-slate-400">Atualizado hoje</span>
              </div>
              <div className="space-y-2">
                {rankings.slice(0, 4).map((rk) => (
                  <div
                    key={rk.id}
                    className={`flex items-center justify-between p-2 rounded-xl border ${
                      rk.isCurrentUser
                        ? 'bg-red-950/40 border-red-500/60 text-white'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-5 text-center font-extrabold text-xs ${
                        rk.position === 1 ? 'text-amber-400' : rk.position === 2 ? 'text-slate-300' : rk.position === 3 ? 'text-amber-600' : 'text-slate-400'
                      }`}>
                        #{rk.position}
                      </span>
                      <img src={rk.avatar} alt={rk.name} className="w-7 h-7 rounded-full object-cover" />
                      <div>
                        <div className="text-xs font-bold truncate max-w-[130px]">{rk.name}</div>
                        <div className="text-[10px] text-slate-400">{rk.classesAttended} treinos</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-amber-400">{rk.points} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. FINANCEIRO & PIX */}
        {activeTab === 'financeiro' && (
          <div className="space-y-4">
            {pendingInvoice && (() => {
              const isOverdue = pendingInvoice.status === 'overdue';
              const calc = calculateLateFeeAndInterest(
                pendingInvoice.amount,
                pendingInvoice.dueDate,
                new Date(2026, 8, 2),
                pendingInvoice.lateFeePercent || 2.0,
                (pendingInvoice.dailyInterestPercent ? pendingInvoice.dailyInterestPercent * 30 : 1.0)
              );

              return (
                <div className={`p-4 rounded-2xl border shadow-xl space-y-3 ${
                  isOverdue
                    ? 'bg-gradient-to-br from-red-950/60 via-slate-900 to-slate-900 border-red-700/60'
                    : 'bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900 border-blue-800/50'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 ${
                      isOverdue ? 'text-red-400' : 'text-blue-400'
                    }`}>
                      {isOverdue ? <AlertTriangle size={12} /> : <DollarSign size={12} />}
                      {isOverdue ? 'Mensalidade em Atraso' : 'Mensalidade Vigente'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isOverdue
                        ? 'bg-red-950 text-red-300 border border-red-800 animate-pulse'
                        : 'bg-blue-950 text-blue-300 border border-blue-800'
                    }`}>
                      {isOverdue ? `${calc.daysOverdue} dias de atraso` : `Vence em ${pendingInvoice.dueDate}`}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white">{pendingInvoice.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{pendingInvoice.academyName || academyName || 'BJJ Academy'}</p>
                    
                    {isOverdue ? (
                      <div className="mt-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1">
                        <div className="flex justify-between text-slate-400">
                          <span>Valor Original:</span>
                          <span className="font-mono">{formatBRL(pendingInvoice.amount)}</span>
                        </div>
                        <div className="flex justify-between text-amber-400">
                          <span>Multa por Atraso (2%):</span>
                          <span className="font-mono">+{formatBRL(calc.fineAmount)}</span>
                        </div>
                        <div className="flex justify-between text-amber-400">
                          <span>Juros ({calc.daysOverdue}d x 0,033%/dia):</span>
                          <span className="font-mono">+{formatBRL(calc.interestAmount)}</span>
                        </div>
                        <div className="pt-1 border-t border-slate-800 flex justify-between font-bold text-white text-sm">
                          <span>Total Atualizado c/ Juros:</span>
                          <span className="text-red-400 font-mono font-black">{formatBRL(calc.totalUpdatedAmount)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-2xl font-black text-white mt-1">
                        {formatBRL(pendingInvoice.amount)}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex gap-2">
                    <button
                      onClick={() => onOpenPix({
                        ...pendingInvoice,
                        amount: isOverdue ? calc.totalUpdatedAmount : pendingInvoice.amount
                      })}
                      className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-teal-950/40"
                    >
                      <QrCode className="w-4 h-4" /> Pagar via PIX Instantâneo
                    </button>

                    {onOpenFinancial && (
                      <button
                        onClick={onOpenFinancial}
                        className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1 border border-slate-700 transition"
                        title="Ver Planos e Calculadora Financeira"
                      >
                        <Calculator size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Histórico & Recibos Fiscais
              </h4>
              <div className="space-y-2">
                {invoices.filter(i => i.status === 'paid').map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{inv.title}</div>
                      <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Pago via PIX • {inv.paidDate}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-extrabold text-white">
                        {formatBRL(inv.amount)}
                      </span>
                      <button
                        onClick={() => onOpenReceipt(inv)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold flex items-center gap-1"
                      >
                        Recibo <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. COMUNICADOS & CHAT */}
        {activeTab === 'comunicados' && (
          <div className="space-y-4">
            {/* Academy Announcements */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Comunicados Oficiais da Academia
              </h4>
              <div className="space-y-2.5">
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-red-400 bg-red-950/60 px-2 py-0.5 rounded-full border border-red-800/40">
                        {ann.category}
                      </span>
                      <span className="text-[10px] text-slate-500">{ann.date}</span>
                    </div>
                    <h5 className="text-xs font-bold text-white">{ann.title}</h5>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{ann.content}</p>
                    <div className="text-[10px] text-slate-500 font-medium">Por {ann.author}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Chat with Sensei / Secretary */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-bold text-white">Canal Direto com o Mestre & Secretaria</span>
                </div>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online
                </span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-2.5 rounded-2xl text-xs ${
                        msg.isMe
                          ? 'bg-red-600 text-white rounded-br-none'
                          : 'bg-slate-800 text-slate-200 rounded-bl-none'
                      }`}
                    >
                      <div className="text-[9px] font-bold opacity-75 mb-0.5">{msg.senderName}</div>
                      <div>{msg.text}</div>
                      <div className="text-[9px] opacity-60 text-right mt-1">{msg.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSend} className="flex gap-2 pt-2 border-t border-slate-800">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Escreva sua mensagem para a academia..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center justify-center transition"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Horários Gerais da Academia */}
      {isHoursModalOpen && (
        <AcademyOperatingHoursModal
          isOpen={isHoursModalOpen}
          onClose={() => setIsHoursModalOpen(false)}
          academy={
            activeAcademy || {
              id: 'acad_loyalty_jiujitsu',
              name: academyName || 'Loyalty Jiu-Jitsu',
              shortName: 'Loyalty BJJ',
              branch: 'Matriz Oficial • CE',
              cnpj: '58.087.630/0001-78',
              phone: '(85) 98765-4321',
              city: 'Fortaleza',
              state: 'CE',
              address: 'Av. Beira Mar, 2800',
              neighborhood: 'Meireles',
              cep: '60165-121',
              headInstructor: 'Messias Batista da Silva Junior (• Mestre Fundador)',
              crefNumber: '019844-G/CE',
              activeStudentsCount: 350,
              studentCapacity: 350,
              tatamiAreaM2: 220,
              pixKey: '58087630378',
              pixKeyType: 'cpf',
              createdAt: new Date().toISOString()
            } as RegisteredAcademy
          }
        />
      )}
    </div>
  );
};
