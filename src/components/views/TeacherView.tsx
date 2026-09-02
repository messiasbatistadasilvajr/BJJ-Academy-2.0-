import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, XCircle, Camera, Award, UserCheck, 
  Clock, MapPin, Users, Edit3, Plus, Sparkles, 
  ChevronDown, Flame, FileText, Check, AlertCircle,
  Timer, BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ClassSession, BeltColor } from '../../types';
import { BeltBadge } from '../common/BeltBadge';

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
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[1]?.id || classes[0]?.id);
  const [selectedStudentForNote, setSelectedStudentForNote] = useState<{ id: string; name: string } | null>(null);
  const [noteText, setNoteText] = useState('');
  
  // Promotion modal state
  const [promotionModalStudent, setPromotionModalStudent] = useState<{ id: string; name: string; belt: BeltColor } | null>(null);
  const [promotedBelt, setPromotedBelt] = useState<BeltColor>('blue');
  const [promotedStripes, setPromotedStripes] = useState<number>(4);
  const [promotionComment, setPromotionComment] = useState('');

  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];

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

  const presentCount = currentClass.registeredStudents.filter(s => s.status === 'present').length;

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto pb-20 no-scrollbar">
      {/* Teacher Operational Top Header */}
      <div className="px-5 pt-4 pb-4 bg-gradient-to-b from-red-950/40 via-slate-900 to-slate-950 border-b border-slate-800">
        <div className="flex items-center justify-between mb-3">
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

        {/* Quick Class Selector Dropdown / Scroll */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase text-slate-400">
            Selecione a Turma em Andamento:
          </label>
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

          {/* Operational Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => onMarkAllPresent(currentClass.id)}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition"
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              Marcar Todos
            </button>

            <button
              onClick={() => onOpenCamera('Foto Coletiva do Tatame', 'Registre a turma reunida no final do treino com a Câmera Nativa')}
              className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition shadow-lg shadow-red-950"
            >
              <Camera className="w-4 h-4" />
              Câmera Tatame
            </button>
          </div>

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
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Alunos no Tatame ({currentClass.registeredStudents.length})
            </h4>
            <span className="text-[10px] text-slate-400">Toque para alternar presença</span>
          </div>

          <div className="space-y-2">
            {currentClass.registeredStudents.map((stu) => {
              const isPresent = stu.status === 'present';
              return (
                <div
                  key={stu.id}
                  className={`p-3 rounded-2xl border transition flex items-center justify-between ${
                    isPresent
                      ? 'bg-slate-900/90 border-emerald-500/40'
                      : 'bg-slate-900/50 border-slate-800/80 opacity-75'
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
                      {stu.note && (
                        <div className="text-[10px] text-amber-400 italic mt-0.5 truncate max-w-[180px]">
                          Obs: {stu.note}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions for this student */}
                  <div className="flex items-center gap-1.5 shrink-0">
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
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {isPresent ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {isPresent ? 'Presente' : 'Falta'}
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
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-500 capitalize"
                  >
                    <option value="white">Faixa Branca</option>
                    <option value="grey">Faixa Cinza (Kids)</option>
                    <option value="yellow">Faixa Amarela (Kids)</option>
                    <option value="orange">Faixa Laranja (Kids)</option>
                    <option value="green">Faixa Verde (Kids)</option>
                    <option value="blue">Faixa Azul</option>
                    <option value="purple">Faixa Roxa</option>
                    <option value="brown">Faixa Marrom</option>
                    <option value="black">Faixa Preta</option>
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

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400">Prévia da Nova Faixa:</span>
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
      </AnimatePresence>
    </div>
  );
};
