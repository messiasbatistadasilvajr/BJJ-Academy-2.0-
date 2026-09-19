import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, XCircle, Camera, Award, UserCheck, 
  Clock, MapPin, Users, Edit3, Plus, Sparkles, 
  ChevronDown, Flame, FileText, Check, AlertCircle,
  Timer, BookOpen, Download, MessageCircle, Zap, ShieldCheck,
  Bell, Send, Trophy, Calendar, Shield, Megaphone, Flag, Volume2, ShieldAlert, Cake
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ClassSession, BeltColor } from '../../types';
import { BeltBadge } from '../common/BeltBadge';
import { exportAttendanceReportCSV } from '../../utils/csvExport';
import { sendMissedClassWhatsApp } from '../../utils/whatsappHelper';
import { MedicalInjuryModal, StudentInjuryRecord } from '../common/MedicalInjuryModal';

interface TeacherViewProps {
  classes: ClassSession[];
  onOpenCamera: (title: string, subtitle: string) => void;
  onPromoteStudent: (studentId: string, studentName: string, newBelt: BeltColor, newStripes: number, note: string) => void;
  onAddStudentNote: (studentId: string, studentName: string, note: string) => void;
  onUpdateAttendance: (classId: string, studentId: string, status: 'present' | 'absent') => void;
  onMarkAllPresent: (classId: string) => void;
  onOpenScoreboard?: () => void;
  onOpenTechniques?: () => void;
  onOpenGraduation?: () => void;
  onOpenPhotoAttendance?: () => void;
  onOpenAICoach?: () => void;
  onOpenTournaments?: () => void;
  onOpenRetentionRadar?: () => void;
  onOpenBirthdayAlert?: () => void;
  todayBirthdaysCount?: number;
  academyName?: string;
  onOpenBeltGuide?: () => void;
  // Teacher actions requested by user:
  onAddClass?: (newClass: ClassSession) => void;
  onSendClassAnnouncement?: (title: string, content: string, priority: 'urgent' | 'normal', target: string) => void;
  onAddTournamentReminder?: (reminder: {
    name: string;
    federation: 'CBJJ' | 'IBJJF' | 'FPJJ' | 'Local Open';
    date: string;
    registrationDeadline: string;
    location: string;
    categories: string;
    notes: string;
  }) => void;
}

export const TeacherView: React.FC<TeacherViewProps> = ({
  classes,
  onOpenCamera,
  onPromoteStudent,
  onAddStudentNote,
  onUpdateAttendance,
  onMarkAllPresent,
  onOpenScoreboard,
  onOpenTechniques,
  onOpenGraduation,
  onOpenPhotoAttendance,
  onOpenAICoach,
  onOpenTournaments,
  onOpenRetentionRadar,
  onOpenBirthdayAlert,
  todayBirthdaysCount,
  academyName = 'BJJ Academy',
  onOpenBeltGuide,
  onAddClass,
  onSendClassAnnouncement,
  onAddTournamentReminder,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[1]?.id || classes[0]?.id);
  const [selectedStudentForNote, setSelectedStudentForNote] = useState<{ id: string; name: string } | null>(null);
  const [noteText, setNoteText] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState<'all' | 'present' | 'absent'>('all');
  const [attendanceSavedMessage, setAttendanceSavedMessage] = useState<string | null>(null);
  
  // Promotion modal state
  const [promotionModalStudent, setPromotionModalStudent] = useState<{ id: string; name: string; belt: BeltColor } | null>(null);
  const [promotedBelt, setPromotedBelt] = useState<BeltColor>('blue');
  const [promotedStripes, setPromotedStripes] = useState<number>(4);
  const [promotionComment, setPromotionComment] = useState('');

  // ➕ Cadastrar Nova Aula Modal State
  const [isCreateClassModalOpen, setIsCreateClassModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassType, setNewClassType] = useState<'Gi' | 'No-Gi' | 'Kids' | 'Competição' | 'Fundamentos'>('Gi');
  const [newClassTime, setNewClassTime] = useState('19:00 - 20:15');
  const [newClassDuration, setNewClassDuration] = useState('1h 15m');
  const [newClassTatame, setNewClassTatame] = useState('Tatame 1 - Principal');
  const [newClassCapacity, setNewClassCapacity] = useState(30);
  const [newClassInstructor, setNewClassInstructor] = useState('Mestre Rodrigo "Cavalo" (3º Grau)');

  // 📢 Enviar Mensagem / Mural Modal State
  const [isSendMessageModalOpen, setIsSendMessageModalOpen] = useState(false);
  const [messageTarget, setMessageTarget] = useState<'current_class' | 'all_students'>('current_class');
  const [messageTitle, setMessageTitle] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [messagePriority, setMessagePriority] = useState<'normal' | 'urgent'>('normal');

  // 🏆 Lembretes de Competições Modal State
  const [isTournamentModalOpen, setIsTournamentModalOpen] = useState(false);
  const [tournName, setTournName] = useState('');
  const [tournFederation, setTournFederation] = useState<'CBJJ' | 'IBJJF' | 'FPJJ' | 'Local Open'>('CBJJ');
  const [tournDate, setTournDate] = useState('24/10/2026');
  const [tournDeadline, setTournDeadline] = useState('14/10/2026');
  const [tournLocation, setTournLocation] = useState('Ginásio Poliesportivo do Ibirapuera - SP');
  const [tournCategories, setTournCategories] = useState('Juvenil, Adulto e Master - Todas as Faixas');
  const [tournNotes, setTournNotes] = useState('Atenção ao peso no dia anterior! Treinos de gás e ritmo às terças e quintas.');

  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const registeredStudents = currentClass?.registeredStudents || [];
  const presentCount = registeredStudents.filter(s => s.status === 'present').length;
  const presentStudents = registeredStudents.filter(s => s.status === 'present');

  const handleExportAttendanceCSV = () => {
    if (!currentClass) return;
    exportAttendanceReportCSV(currentClass);
  };

  const handleSaveAttendance = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });
    setAttendanceSavedMessage(`✓ Chamada confirmada! ${presentCount} presenças computadas para graduação CBJJ.`);
    setTimeout(() => setAttendanceSavedMessage(null), 4000);
  };

  const handleSaveNote = () => {
    if (selectedStudentForNote && noteText.trim()) {
      onAddStudentNote(selectedStudentForNote.id, selectedStudentForNote.name, noteText.trim());
      setSelectedStudentForNote(null);
      setNoteText('');
    }
  };

  const handleConfirmPromotion = () => {
    if (promotionModalStudent) {
      onPromoteStudent(
        promotionModalStudent.id,
        promotionModalStudent.name,
        promotedBelt,
        promotedStripes,
        promotionComment || 'Graduado com mérito no tatame.'
      );
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 }
      });
      setPromotionModalStudent(null);
      setPromotionComment('');
    }
  };

  // Submit Nova Aula
  const handleConfirmCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const newClass: ClassSession = {
      id: `class_${Date.now()}`,
      name: newClassName.trim(),
      instructor: newClassInstructor.trim() || 'Mestre Rodrigo "Cavalo"',
      instructorAvatar: '/bjj_media/bjj_professor_mestre.jpg',
      time: newClassTime.trim() || '19:00 - 20:15',
      duration: newClassDuration.trim() || '1h 15m',
      type: newClassType,
      tatame: newClassTatame.trim() || 'Tatame 1',
      capacity: Number(newClassCapacity) || 30,
      enrolledCount: 3,
      checkedIn: false,
      registeredStudents: [
        {
          id: 'student_1',
          name: 'Lucas Silva (Você)',
          belt: 'blue',
          avatar: '/bjj_media/bjj_student_male.jpg',
          status: 'pending',
          note: 'Regular no treino'
        },
        {
          id: 'stu_matheus',
          name: 'Matheus Oliveira',
          belt: 'purple',
          avatar: '/bjj_media/bjj_student_male.jpg',
          status: 'pending',
          note: 'Treino de competição'
        },
        {
          id: 'stu_gabriel',
          name: 'Gabriel Costa',
          belt: 'white',
          avatar: '/bjj_media/bjj_student_male.jpg',
          status: 'pending'
        }
      ]
    };

    if (onAddClass) {
      onAddClass(newClass);
    }
    setSelectedClassId(newClass.id);
    setIsCreateClassModalOpen(false);
    setNewClassName('');

    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 }
    });
    setAttendanceSavedMessage(`✓ Nova aula "${newClass.name}" cadastrada com sucesso e pronta para chamada!`);
    setTimeout(() => setAttendanceSavedMessage(null), 4500);
  };

  // Submit Enviar Mensagem da Turma
  const handleConfirmSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageTitle.trim() || !messageContent.trim()) return;

    if (onSendClassAnnouncement) {
      const targetLabel = messageTarget === 'current_class' ? `Turma ${currentClass.name}` : 'Todos os Alunos da Academia';
      onSendClassAnnouncement(messageTitle.trim(), messageContent.trim(), messagePriority, targetLabel);
    }

    setIsSendMessageModalOpen(false);
    setMessageTitle('');
    setMessageContent('');

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });
    setAttendanceSavedMessage(`📢 Mensagem publicada no mural dos alunos com sucesso!`);
    setTimeout(() => setAttendanceSavedMessage(null), 4500);
  };

  // Submit Lembrete de Competição
  const handleConfirmTournamentReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tournName.trim()) return;

    if (onAddTournamentReminder) {
      onAddTournamentReminder({
        name: tournName.trim(),
        federation: tournFederation,
        date: tournDate.trim(),
        registrationDeadline: tournDeadline.trim(),
        location: tournLocation.trim(),
        categories: tournCategories.trim(),
        notes: tournNotes.trim()
      });
    }

    setIsTournamentModalOpen(false);
    setTournName('');

    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 }
    });
    setAttendanceSavedMessage(`🏆 Lembrete de competição cadastrado e convocações enviadas aos atletas!`);
    setTimeout(() => setAttendanceSavedMessage(null), 4500);
  };

  // State for Medical / Injury Modal (Item 2)
  const [selectedStudentForInjury, setSelectedStudentForInjury] = useState<StudentInjuryRecord | null>(null);
  
  // State for Sparring Rounds Splitter Modal (Item 3)
  const [isSparringRoundsOpen, setIsSparringRoundsOpen] = useState<boolean>(false);
  const [activeRoundTab, setActiveRoundTab] = useState<'A' | 'B'>('A');

  // Item 3: Densidade e Capacidade do Tatame (Cálculo Físico-Marcial)
  const matArea = currentClass?.tatameAreaM2 || (currentClass?.tatame?.includes('2') ? 50 : 80);
  const sparringPairs = Math.floor(presentCount / 2);
  const m2PerPair = sparringPairs > 0 ? (matArea / sparringPairs).toFixed(1) : matArea.toFixed(1);
  const maxSafePairs = currentClass?.maxSafeSparringPairs || Math.floor(matArea / 8);

  const densityStatus: 'safe' | 'moderate' | 'full' = 
    sparringPairs <= maxSafePairs * 0.7 ? 'safe' :
    sparringPairs <= maxSafePairs ? 'moderate' : 'full';

  const densityLabel = 
    densityStatus === 'safe' ? 'Espaçamento Ideal' :
    densityStatus === 'moderate' ? 'Atenção às Bordas' : 'Lotação Máxima (Dividir)';

  const densityBadgeColor = 
    densityStatus === 'safe' ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400' :
    densityStatus === 'moderate' ? 'bg-amber-950/60 border-amber-500/40 text-amber-400' :
    'bg-red-950/60 border-red-500/40 text-red-400';

  const handleOpenInjuryModal = (stu: any) => {
    setSelectedStudentForInjury({
      studentId: stu.id,
      studentName: stu.name,
      belt: stu.belt,
      avatar: stu.avatar,
      bloodType: 'A+',
      hasInjuryWarning: !!stu.hasInjuryWarning,
      injuryNote: stu.injuryNote || '',
      injurySeverity: stu.injurySeverity || 'moderate',
      sparringRestrictions: stu.injuryNote ? 'Evitar membro afetado e quedas duras' : '',
    });
  };

  const handleSaveInjuryRecord = (updated: StudentInjuryRecord) => {
    currentClass.registeredStudents = currentClass.registeredStudents.map(stu => {
      if (stu.id === updated.studentId) {
        return {
          ...stu,
          hasInjuryWarning: updated.hasInjuryWarning,
          injuryNote: updated.injuryNote,
          injurySeverity: updated.injurySeverity
        };
      }
      return stu;
    });
    setAttendanceSavedMessage(`🛡️ Ficha médica de ${updated.studentName} atualizada.`);
    setTimeout(() => setAttendanceSavedMessage(null), 3500);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/65 backdrop-blur-[0.5px] text-slate-100 overflow-y-auto pb-20 no-scrollbar">
      {/* Teacher Operational Top Header */}
      <div className="px-5 pt-4 pb-3 bg-gradient-to-b from-red-950/40 via-slate-900/85 to-slate-950/75 border-b border-slate-800 space-y-3">
        {/* Blindagem Pedagógica Banner */}
        <div className="p-2.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 flex items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-xs shrink-0">
              🛡️
            </div>
            <div>
              <div className="text-[11px] font-black text-emerald-300 flex items-center gap-1.5">
                <span>Blindagem do Professor Ativa</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded-full font-bold">
                  TATAME & ALUNOS
                </span>
              </div>
              <p className="text-[10px] text-emerald-200/80 leading-tight">
                Acesso exclusivo a Aulas, Alunos, Graduações, Mensagens e Lembretes de Torneios na unidade <strong>{academyName}</strong>. Finanças restritas à gerência.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 font-black">
              🥋
            </div>
            <div>
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                Tatame Operacional • Professor
              </span>
              <h2 className="text-sm font-bold text-white">Mestre Rodrigo "Cavalo" (3º Grau)</h2>
            </div>
          </div>
          <span className="text-[10px] bg-red-950 border border-red-800 text-red-300 px-2 py-0.5 rounded-full font-bold">
            MODO TREINO
          </span>
        </div>

        {/* Teacher Responsibilities Quick Actions Bar */}
        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => setIsCreateClassModalOpen(true)}
            className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition shadow-sm"
          >
            <Plus size={14} className="text-emerald-400" />
            <span>+ Nova Aula</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSendMessageModalOpen(true)}
            className="p-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition shadow-sm"
          >
            <Megaphone size={14} className="text-blue-400" />
            <span>Mensagens</span>
          </button>

          <button
            type="button"
            onClick={() => setIsTournamentModalOpen(true)}
            className="p-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition shadow-sm"
          >
            <Trophy size={14} className="text-amber-400" />
            <span>Torneios</span>
          </button>

          <button
            type="button"
            onClick={onOpenGraduation}
            className="p-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition shadow-sm"
          >
            <Award size={14} className="text-purple-400" />
            <span>Graduar</span>
          </button>

          <button
            type="button"
            onClick={onOpenPhotoAttendance}
            className="p-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition shadow-sm"
          >
            <Camera size={14} className="text-cyan-400" />
            <span>Foto IA</span>
          </button>

          <button
            type="button"
            onClick={onOpenAICoach}
            className="p-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition shadow-sm"
          >
            <Sparkles size={14} className="text-red-400" />
            <span>AI Coach</span>
          </button>

          {onOpenRetentionRadar && (
            <button
              type="button"
              onClick={onOpenRetentionRadar}
              className="p-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition shadow-sm"
            >
              <ShieldAlert size={14} className="text-rose-400" />
              <span>Evasão</span>
            </button>
          )}

          {onOpenBirthdayAlert && (
            <button
              type="button"
              onClick={onOpenBirthdayAlert}
              className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition shadow-sm relative"
              title="Aniversariantes: Parabenize em nome da academia"
            >
              <Cake size={14} className="text-amber-400" />
              <span>Aniversários</span>
              {todayBirthdaysCount !== undefined && todayBirthdaysCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 font-black rounded-full text-[9px] flex items-center justify-center">
                  {todayBirthdaysCount}
                </span>
              )}
            </button>
          )}

          {onOpenBeltGuide && (
            <button
              type="button"
              onClick={onOpenBeltGuide}
              className="p-2 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/40 flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition shadow-sm"
              title="Tabela Oficial de Graduação IBJJF (Adulto e Kids)"
            >
              <Award size={14} className="text-yellow-400" />
              <span>Faixas IBJJF</span>
            </button>
          )}
        </div>

        {/* 🎂 Aniversariantes Banner in Teacher View */}
        {todayBirthdaysCount !== undefined && todayBirthdaysCount > 0 && onOpenBirthdayAlert && (
          <div 
            onClick={onOpenBirthdayAlert}
            className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-yellow-950/40 border border-amber-500/50 hover:border-amber-400 cursor-pointer flex items-center justify-between transition group shadow-md"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-inner">
                <Cake className="w-4 h-4 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white">🎉 Aniversariante(s) no Tatame Hoje!</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-500 text-slate-950 font-black">
                    {todayBirthdaysCount} hoje
                  </span>
                </div>
                <p className="text-[10px] text-amber-200/80">
                  Lembre-se de parabenizar no final da aula em nome da <strong>{academyName}</strong>!
                </p>
              </div>
            </div>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2.5 py-1 rounded-xl border border-amber-500/30 group-hover:bg-amber-500 group-hover:text-slate-950 transition">
              Ver & WhatsApp →
            </span>
          </div>
        )}

        {/* Quick Class Selector Dropdown / Scroll with + button */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase text-slate-400">
              Selecione a Turma em Andamento:
            </label>
            <button
              type="button"
              onClick={() => setIsCreateClassModalOpen(true)}
              className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <Plus size={11} /> Cadastrar Nova Turma
            </button>
          </div>
          
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {classes.map((c) => {
              const isSelected = c.id === selectedClassId;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedClassId(c.id)}
                  className={`p-2.5 rounded-2xl border text-left shrink-0 transition min-w-[200px] ${
                    isSelected
                      ? 'bg-red-600/20 border-red-500 shadow-md shadow-red-950'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate max-w-[130px]">{c.name}</span>
                    <span className="text-[10px] font-bold text-red-400">{c.time}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                    <span>{c.tatame}</span>
                    <span>•</span>
                    <span>{c.registeredStudents.length} alunos</span>
                  </div>
                </button>
              );
            })}

            {/* Quick Add Class Card in Scroll */}
            <button
              type="button"
              onClick={() => setIsCreateClassModalOpen(true)}
              className="p-2.5 rounded-2xl border border-dashed border-slate-700 hover:border-emerald-500 bg-slate-900/50 hover:bg-emerald-950/20 text-slate-400 hover:text-emerald-300 shrink-0 transition min-w-[150px] flex flex-col items-center justify-center gap-1 text-center"
            >
              <Plus size={16} className="text-emerald-400" />
              <span className="text-xs font-bold">Adicionar Turma</span>
              <span className="text-[9px] text-slate-500">Gi, No-Gi ou Kids</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Operational Tatame Action Bar */}
      <div className="p-4 space-y-4">
        {/* Class Info & Quick Actions Banner */}
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Chamada & Tatame
              </span>
              <h3 className="text-base font-extrabold text-white">{currentClass.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span>{currentClass.tatame}</span>
                <span>•</span>
                <span>{currentClass.duration}</span>
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-black text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded-full">
                {presentCount} / {currentClass.registeredStudents.length} Presentes
              </span>
            </div>
          </div>

          {/* Item 3: Densidade & Capacidade do Tatame (Segurança de Treino) */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${densityBadgeColor}`}>
                ⏱️
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-white">Tatame: {matArea}m²</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${densityBadgeColor}`}>
                    {densityLabel}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {presentCount} presentes • {sparringPairs} duplas no rola ({m2PerPair} m²/dupla • máx seguro: {maxSafePairs} duplas)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setIsSparringRoundsOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
                title="Organizar rounds intercalados de sparring com segurança"
              >
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>Rounds A / B</span>
              </button>
            </div>
          </div>

          {/* AI Tatame Superpowers (Gemini Vision + AI Coach) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              onClick={onOpenPhotoAttendance}
              className="py-2.5 px-3 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900/60 border border-indigo-500/50 hover:border-indigo-400 text-left flex items-center justify-between group transition shadow-md"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-white flex items-center gap-1">
                    Chamada por Foto IA
                    <span className="text-[9px] bg-indigo-500/20 text-indigo-300 font-bold px-1.5 py-0.2 rounded border border-indigo-500/30">
                      Gemini Vision
                    </span>
                  </div>
                  <div className="text-[10px] text-indigo-200/80">Identificar atletas e registrar em lote</div>
                </div>
              </div>
              <span className="text-indigo-400 text-xs font-bold">Abrir →</span>
            </button>

            <button
              onClick={onOpenAICoach}
              className="py-2.5 px-3 rounded-2xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950/60 border border-purple-500/50 hover:border-purple-400 text-left flex items-center justify-between group transition shadow-md"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-white flex items-center gap-1">
                    BJJ AI Coach
                    <span className="text-[9px] bg-purple-500/20 text-purple-300 font-bold px-1.5 py-0.2 rounded border border-purple-500/30">
                      CBJJ / IBJJF
                    </span>
                  </div>
                  <div className="text-[10px] text-purple-200/80">Planos de aula, drills e sparring</div>
                </div>
              </div>
              <span className="text-purple-400 text-xs font-bold">Abrir →</span>
            </button>
          </div>

          {/* Operational Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => onMarkAllPresent(currentClass.id)}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition"
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              Marcar Todos Presentes
            </button>

            <button
              onClick={handleSaveAttendance}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-black text-white flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-950"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirmar Chamada
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => onOpenCamera('Foto Coletiva do Tatame', 'Registre a turma reunida no final do treino com a Câmera Nativa')}
              className="flex-1 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition shadow-md shadow-red-950"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Câmera Tatame</span>
            </button>

            <button
              onClick={handleExportAttendanceCSV}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition"
              title="Exportar Lista de Presença em CSV / Excel"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exportar CSV</span>
            </button>
          </div>

          {attendanceSavedMessage && (
            <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{attendanceSavedMessage}</span>
            </div>
          )}

          {/* Tatame 2.0 Interactive Tools */}
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/80">
            <button
              onClick={onOpenScoreboard}
              className="py-2 px-2 rounded-xl bg-slate-800/80 hover:bg-red-600/30 border border-slate-700/80 hover:border-red-500/60 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition"
            >
              <Timer className="w-4 h-4 text-red-400" />
              <span>Placar / Rola</span>
            </button>

            <button
              onClick={onOpenTechniques}
              className="py-2 px-2 rounded-xl bg-slate-800/80 hover:bg-blue-600/30 border border-slate-700/80 hover:border-blue-500/60 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition"
            >
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span>Posições</span>
            </button>

            <button
              onClick={onOpenGraduation}
              className="py-2 px-2 rounded-xl bg-slate-800/80 hover:bg-amber-600/30 border border-slate-700/80 hover:border-amber-500/60 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>Exames CBJJ</span>
            </button>
          </div>
        </div>

        {/* Student Call Sheet (Lista de Chamada) */}
        <div className="space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Chamada Express • Alunos ({currentClass.registeredStudents.length})</span>
              </h4>
              <span className="text-[10px] text-slate-400">Toque no botão para alternar presença instantaneamente</span>
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setAttendanceFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                  attendanceFilter === 'all'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Todos ({currentClass.registeredStudents.length})
              </button>
              <button
                type="button"
                onClick={() => setAttendanceFilter('present')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                  attendanceFilter === 'present'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-emerald-400'
                }`}
              >
                Presentes ({presentCount})
              </button>
              <button
                type="button"
                onClick={() => setAttendanceFilter('absent')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                  attendanceFilter === 'absent'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                Faltas ({currentClass.registeredStudents.length - presentCount})
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {currentClass.registeredStudents
              .filter((stu) => {
                if (attendanceFilter === 'present') return stu.status === 'present';
                if (attendanceFilter === 'absent') return stu.status !== 'present';
                return true;
              })
              .map((stu) => {
                const isPresent = stu.status === 'present';
                return (
                  <div
                    key={stu.id}
                    className={`p-3 rounded-2xl border transition flex items-center justify-between ${
                      isPresent
                        ? 'bg-slate-900/90 border-emerald-500/40'
                        : 'bg-slate-900/50 border-slate-800/80 opacity-80'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={stu.avatar}
                        alt={stu.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{stu.name}</div>
                        <div className="mt-0.5">
                          <BeltBadge belt={stu.belt} size="sm" />
                        </div>
                        {/* Item 2: Alerta Discreto de Lesão / Restrição de Tatame */}
                        {stu.hasInjuryWarning && (
                          <button
                            type="button"
                            onClick={() => handleOpenInjuryModal(stu)}
                            className="flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-md bg-amber-950/40 border border-amber-500/30 text-amber-300 text-[10px] hover:bg-amber-950/70 transition max-w-fit"
                            title="Clique para ver ou editar restrições médicas do atleta"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
                            <span className="font-medium truncate max-w-[190px]">{stu.injuryNote || 'Restrição Médica'}</span>
                          </button>
                        )}
                        {stu.note && (
                          <div className="text-[10px] text-amber-400 italic mt-0.5 truncate max-w-[180px]">
                            Obs: {stu.note}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions for this student */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Ficha Médica / Alerta de Lesão */}
                      <button
                        type="button"
                        onClick={() => handleOpenInjuryModal(stu)}
                        className={`p-2 rounded-xl transition ${
                          stu.hasInjuryWarning
                            ? 'bg-amber-950/70 text-amber-300 border border-amber-500/50 hover:bg-amber-900/80'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white'
                        }`}
                        title={stu.hasInjuryWarning ? `Restrição Ativa: ${stu.injuryNote}` : 'Ficha Médica & Lesões'}
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                      </button>

                      {/* WhatsApp absence notice if absent */}
                      {!isPresent && (
                        <button
                          type="button"
                          onClick={() => sendMissedClassWhatsApp(stu.name, currentClass.name, academyName)}
                          className="p-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60 transition"
                          title="Avisar no WhatsApp que faltou no treino"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Add Observation Note */}
                      <button
                        onClick={() => setSelectedStudentForNote({ id: stu.id, name: stu.name })}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition"
                        title="Adicionar Observação Técnica"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Promote Student Button */}
                      <button
                        onClick={() => setPromotionModalStudent({ id: stu.id, name: stu.name, belt: stu.belt })}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-red-400 transition"
                        title="Registrar Graduação / Grau"
                      >
                        <Award className="w-3.5 h-3.5" />
                      </button>

                      {/* Attendance Toggle */}
                      <button
                        onClick={() => onUpdateAttendance(currentClass.id, stu.id, isPresent ? 'absent' : 'present')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 transition ${
                          isPresent
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                            : 'bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white border border-slate-700'
                        }`}
                      >
                        {isPresent ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        <span>{isPresent ? 'Presente' : 'Falta'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Observation Note Modal */}
      <AnimatePresence>
        {selectedStudentForNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700/80 p-5 text-slate-100 shadow-2xl"
            >
              <h3 className="text-sm font-bold text-white mb-1">
                Observar Aluno: {selectedStudentForNote.name}
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                Registre uma anotação técnica, elogio ou lembrete de lesão para o diário do aluno.
              </p>

              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Ex: Excelente passagem de guarda toreando. Atenção com postura defensiva..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500 mb-4"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedStudentForNote(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveNote}
                  className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
                >
                  Salvar Observação
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Promotion Modal */}
      <AnimatePresence>
        {promotionModalStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700/80 p-5 text-slate-100 shadow-2xl"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Graduar no Tatame</h3>
                  <p className="text-[11px] text-slate-400">{promotionModalStudent.name}</p>
                </div>
              </div>

              <div className="space-y-3 my-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase">
                    Nova Faixa:
                  </label>
                  <select
                    value={promotedBelt}
                    onChange={(e) => setPromotedBelt(e.target.value as BeltColor)}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <optgroup label="Adulto & Mestres (16+ anos) IBJJF">
                      <option value="white">Faixa Branca (Iniciante)</option>
                      <option value="blue">Faixa Azul (mín. 16 anos)</option>
                      <option value="purple">Faixa Roxa (mín. 17 anos)</option>
                      <option value="brown">Faixa Marrom (mín. 18 anos)</option>
                      <option value="black">Faixa Preta (mín. 19 anos)</option>
                      <option value="red_black">Coral Vermelha e Preta (7º Grau - Mestre)</option>
                      <option value="red_white">Coral Vermelha e Branca (8º Grau - Mestre)</option>
                      <option value="red">Faixa Vermelha (9º Grau - Grande Mestre)</option>
                    </optgroup>
                    <optgroup label="Infantil - Grupo Cinza (4-15 anos) IBJJF">
                      <option value="grey_white">Faixa Cinza e Branca (Kids)</option>
                      <option value="grey">Faixa Cinza Lisa (Kids)</option>
                      <option value="grey_black">Faixa Cinza e Preta (Kids)</option>
                    </optgroup>
                    <optgroup label="Infantil - Grupo Amarelo (7-15 anos) IBJJF">
                      <option value="yellow_white">Faixa Amarela e Branca (Kids)</option>
                      <option value="yellow">Faixa Amarela Lisa (Kids)</option>
                      <option value="yellow_black">Faixa Amarela e Preta (Kids)</option>
                    </optgroup>
                    <optgroup label="Infantil - Grupo Laranja (10-15 anos) IBJJF">
                      <option value="orange_white">Faixa Laranja e Branca (Kids)</option>
                      <option value="orange">Faixa Laranja Lisa (Kids)</option>
                      <option value="orange_black">Faixa Laranja e Preta (Kids)</option>
                    </optgroup>
                    <optgroup label="Infantil - Grupo Verde (13-15 anos) IBJJF">
                      <option value="green_white">Faixa Verde e Branca (Kids)</option>
                      <option value="green">Faixa Verde Lisa (Kids)</option>
                      <option value="green_black">Faixa Verde e Preta (Kids)</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase">
                    Graus na Tarja (Stripes):
                  </label>
                  <div className="flex gap-2 mt-1">
                    {[0, 1, 2, 3, 4].map((g) => (
                      <button
                        key={g}
                        onClick={() => setPromotedStripes(g)}
                        className={`flex-1 py-1.5 rounded-lg border text-xs font-bold ${
                          promotedStripes === g
                            ? 'bg-red-600 border-red-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        {g}º
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase">
                    Mensagem de Honra / Certificação:
                  </label>
                  <input
                    type="text"
                    value={promotionComment}
                    onChange={(e) => setPromotionComment(e.target.value)}
                    placeholder="Ex: Dedicação exemplar e técnica refinada no tatame."
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Prévia da Nova Faixa:</span>
                    {onOpenBeltGuide && (
                      <button
                        type="button"
                        onClick={onOpenBeltGuide}
                        className="text-amber-400 hover:text-amber-300 font-bold underline flex items-center gap-1"
                      >
                        <BookOpen size={10} /> Tabela IBJJF
                      </button>
                    )}
                  </div>
                  <div className="flex justify-center mt-1">
                    <BeltBadge belt={promotedBelt} stripes={promotedStripes} size="md" />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setPromotionModalStudent(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmPromotion}
                  className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-950"
                >
                  Confirmar Graduação!
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal: Cadastrar Nova Aula */}
        {isCreateClassModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold">
                    ➕
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Cadastrar Nova Aula / Turma</h3>
                    <p className="text-[10px] text-slate-400">Ativação imediata no tatame da academia</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateClassModalOpen(false)}
                  className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <XCircle size={18} />
                </button>
              </div>

              <form onSubmit={handleConfirmCreateClass} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase">
                    Nome da Turma / Modalidade:
                  </label>
                  <input
                    type="text"
                    required
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="Ex: Jiu-Jitsu No-Gi Noite ou BJJ Kids Fundamentos"
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase">
                      Tipo de Treino:
                    </label>
                    <select
                      value={newClassType}
                      onChange={(e) => setNewClassType(e.target.value as any)}
                      className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Gi">Gi (Com Kimono)</option>
                      <option value="No-Gi">No-Gi (Sem Kimono)</option>
                      <option value="Kids">BJJ Kids</option>
                      <option value="Competição">Equipe Competição</option>
                      <option value="Fundamentos">Fundamentos BJJ</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase">
                      Tatame / Área:
                    </label>
                    <select
                      value={newClassTatame}
                      onChange={(e) => setNewClassTatame(e.target.value)}
                      className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Tatame 1 - Principal">Tatame 1 - Principal</option>
                      <option value="Tatame 2 - Anexo">Tatame 2 - Anexo</option>
                      <option value="Tatame Kids / Confort">Tatame Kids</option>
                      <option value="Área de Sparring Livre">Área de Sparring Livre</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase">
                      Horário:
                    </label>
                    <input
                      type="text"
                      value={newClassTime}
                      onChange={(e) => setNewClassTime(e.target.value)}
                      placeholder="Ex: 19:30 - 20:45"
                      className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase">
                      Duração:
                    </label>
                    <input
                      type="text"
                      value={newClassDuration}
                      onChange={(e) => setNewClassDuration(e.target.value)}
                      placeholder="Ex: 1h 15m"
                      className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase">
                      Capacidade Máxima:
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={100}
                      value={newClassCapacity}
                      onChange={(e) => setNewClassCapacity(Number(e.target.value))}
                      className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase">
                      Instrutor:
                    </label>
                    <input
                      type="text"
                      value={newClassInstructor}
                      onChange={(e) => setNewClassInstructor(e.target.value)}
                      className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[10px] text-slate-400 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                  <span>A turma é criada instantaneamente com lista de chamada e integrada ao app dos alunos.</span>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCreateClassModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950 flex items-center justify-center gap-1.5"
                  >
                    <Check size={14} /> Salvar Nova Aula
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Modal: Enviar Mensagens da Turma / Mural */}
        {isSendMessageModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center justify-center font-bold">
                    📢
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Enviar Mensagem / Mural da Turma</h3>
                    <p className="text-[10px] text-slate-400">Comunicação direta do professor aos alunos</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSendMessageModalOpen(false)}
                  className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <XCircle size={18} />
                </button>
              </div>

              {/* Quick Template Chips */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">
                  Modelos Rápidos do Tatame:
                </label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {[
                    { title: '🥋 Kimono Branco Obrigatório', body: 'Atenção alunos: no próximo treino será obrigatório o uso do kimono branco oficial para fotos e graduação.' },
                    { title: '🔥 Aulão Geral de Sexta-feira', body: 'Nesta sexta teremos aulão unificado com sparring livre e ritmo de competição às 19:30. Presença de todos os graduados!' },
                    { title: '🏆 Convocação Torneio Regional', body: 'Convocamos os atletas inscritos no campeonato deste mês para o treino específico de regras e gás amanhã.' },
                    { title: '⏰ Ajuste no Horário de Treino', body: 'Avisamos que o treino de fundamentos começará 15 minutos mais cedo esta semana.' }
                  ].map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setMessageTitle(tpl.title);
                        setMessageContent(tpl.body);
                      }}
                      className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[10px] font-medium border border-slate-750 transition"
                    >
                      {tpl.title}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleConfirmSendMessage} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase">
                    Destinatários:
                  </label>
                  <select
                    value={messageTarget}
                    onChange={(e) => setMessageTarget(e.target.value as any)}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="current_class">Apenas Alunos da Turma Atual ({currentClass.name})</option>
                    <option value="all_students">Todos os Alunos da Academia ({academyName})</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase">
                    Título do Comunicado:
                  </label>
                  <input
                    type="text"
                    required
                    value={messageTitle}
                    onChange={(e) => setMessageTitle(e.target.value)}
                    placeholder="Ex: Treino Especial de Sparring neste Sábado"
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase">
                    Conteúdo da Mensagem:
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="Escreva a mensagem ou orientação técnica para os atletas..."
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] text-slate-300 font-semibold">Prioridade Alta / Alerta no App:</span>
                  <button
                    type="button"
                    onClick={() => setMessagePriority(p => p === 'urgent' ? 'normal' : 'urgent')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                      messagePriority === 'urgent' 
                        ? 'bg-red-600 text-white' 
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {messagePriority === 'urgent' ? '🚨 Urgente' : 'Normal'}
                  </button>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsSendMessageModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-950 flex items-center justify-center gap-1.5"
                  >
                    <Send size={14} /> Publicar no Mural
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Modal: Lembretes de Competições & Torneios */}
        {isTournamentModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold">
                    🏆
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Lembrete de Competição & Torneio</h3>
                    <p className="text-[10px] text-slate-400">Convocação e avisos oficiais de campeonato</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTournamentModalOpen(false)}
                  className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <XCircle size={18} />
                </button>
              </div>

              <form onSubmit={handleConfirmTournamentReminder} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase">
                    Nome do Campeonato:
                  </label>
                  <input
                    type="text"
                    required
                    value={tournName}
                    onChange={(e) => setTournName(e.target.value)}
                    placeholder="Ex: Campeonato Sul-Americano de Jiu-Jitsu 2026"
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase">
                      Federação:
                    </label>
                    <select
                      value={tournFederation}
                      onChange={(e) => setTournFederation(e.target.value as any)}
                      className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="CBJJ">CBJJ</option>
                      <option value="IBJJF">IBJJF</option>
                      <option value="FPJJ">FPJJ (Paulista)</option>
                      <option value="Local Open">Open Regional / Outro</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase">
                      Data do Evento:
                    </label>
                    <input
                      type="text"
                      value={tournDate}
                      onChange={(e) => setTournDate(e.target.value)}
                      placeholder="Ex: 24/10/2026"
                      className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase">
                      Prazo Limite de Inscrição:
                    </label>
                    <input
                      type="text"
                      value={tournDeadline}
                      onChange={(e) => setTournDeadline(e.target.value)}
                      placeholder="Ex: 14/10/2026"
                      className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase">
                      Local / Ginásio:
                    </label>
                    <input
                      type="text"
                      value={tournLocation}
                      onChange={(e) => setTournLocation(e.target.value)}
                      placeholder="Ex: Ibirapuera - SP"
                      className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase">
                    Categorias Convocadas:
                  </label>
                  <input
                    type="text"
                    value={tournCategories}
                    onChange={(e) => setTournCategories(e.target.value)}
                    placeholder="Ex: Juvenil, Adulto e Master - Todas as Faixas"
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase">
                    Instruções & Dicas de Peso do Mestre:
                  </label>
                  <textarea
                    rows={2}
                    value={tournNotes}
                    onChange={(e) => setTournNotes(e.target.value)}
                    placeholder="Orientação sobre pesagem, kimono oficial e horários de aquecimento..."
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsTournamentModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-950 flex items-center justify-center gap-1.5"
                  >
                    <Trophy size={14} /> Publicar Lembrete
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
        {/* Modal Item 2: Ficha Médica e Restrições de Rola */}
        <MedicalInjuryModal
          isOpen={!!selectedStudentForInjury}
          onClose={() => setSelectedStudentForInjury(null)}
          record={selectedStudentForInjury}
          onSave={handleSaveInjuryRecord}
        />

        {/* Modal Item 3: Divisão de Rounds A/B para Tatame Cheio */}
        {isSparringRoundsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" id="modal-sparring-rounds">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col text-slate-100"
            >
              <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">Divisão de Rounds • Sparring Seguro</h3>
                    <p className="text-[11px] text-slate-400">Tatame: {matArea}m² • {presentCount} atletas presentes ({sparringPairs} duplas)</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSparringRoundsOpen(false)}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400">Densidade física: </span>
                    <span className="font-bold text-white">{m2PerPair} m²/dupla</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${densityBadgeColor}`}>
                    {densityLabel}
                  </span>
                </div>

                <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveRoundTab('A')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      activeRoundTab === 'A'
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>Turma A (Rounds Ímpares)</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-black/20 rounded-full font-mono">
                      {Math.ceil(presentStudents.length / 2)}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveRoundTab('B')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      activeRoundTab === 'B'
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>Turma B (Rounds Pares)</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-black/20 rounded-full font-mono">
                      {Math.floor(presentStudents.length / 2)}
                    </span>
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {presentStudents
                    .filter((_, idx) => (activeRoundTab === 'A' ? idx % 2 === 0 : idx % 2 === 1))
                    .map((s, idx) => (
                      <div
                        key={s.id}
                        className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-[10px] font-mono text-slate-500 w-4">{idx + 1}.</span>
                          <img src={s.avatar} alt={s.name} className="w-7 h-7 rounded-lg object-cover border border-slate-700" />
                          <span className="font-bold text-white truncate max-w-[180px]">{s.name}</span>
                          <BeltBadge belt={s.belt} size="sm" />
                        </div>
                        {s.hasInjuryWarning && (
                          <span className="text-[10px] font-medium text-amber-400 bg-amber-950/60 border border-amber-800/50 px-2 py-0.5 rounded-md">
                            ⚠️ Restrição
                          </span>
                        )}
                      </div>
                    ))}
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="font-bold text-slate-200">Protocolo de Rola Seguro:</div>
                  <div>• Cada round dura 6 minutos com 1 minuto de transição.</div>
                  <div>• A turma em espera hidrata e observa os detalhes técnicos do rola.</div>
                  <div>• Duplas com atletas sob restrição médica não podem ser projetadas para fora da área segura.</div>
                </div>
              </div>

              <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsSparringRoundsOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenScoreboard) onOpenScoreboard();
                    setIsSparringRoundsOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow"
                >
                  <Timer className="w-3.5 h-3.5" />
                  Abrir Placar / Cronômetro Oficial
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
