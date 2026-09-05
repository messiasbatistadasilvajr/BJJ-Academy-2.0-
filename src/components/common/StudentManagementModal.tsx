import React, { useState } from 'react';
import { 
  X, Users, UserPlus, Search, Shield, Award, 
  Phone, Mail, CheckCircle2, ChevronRight, Trash2, 
  Sparkles, Cloud, RefreshCw, AlertCircle
} from 'lucide-react';
import { StudentProfile, BeltColor } from '../../types';
import { BeltBadge } from './BeltBadge';
import { saveStudentToFirestore, removeStudentFromFirestore } from '../../firebase/firestoreService';

interface StudentManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentProfile[];
  activeStudentId: string;
  onSelectStudent: (student: StudentProfile) => void;
  onStudentSaved?: (student: StudentProfile) => void;
  academyName: string;
}

export const StudentManagementModal: React.FC<StudentManagementModalProps> = ({
  isOpen,
  onClose,
  students,
  activeStudentId,
  onSelectStudent,
  onStudentSaved,
  academyName
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State for new student
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [belt, setBelt] = useState<BeltColor>('white');
  const [stripes, setStripes] = useState<number>(0);
  const [category, setCategory] = useState<'Adulto Médio' | 'Infantil B' | 'Master 1 Pesado' | 'Juvenil Leve'>('Adulto Médio');
  const [weightKg, setWeightKg] = useState<number>(75);

  if (!isOpen) return null;

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    s.belt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    const newStudentId = 'stu_' + Date.now().toString(36);
    const newStudent: StudentProfile = {
      id: newStudentId,
      name: name.trim(),
      email: email.trim() || `${name.trim().toLowerCase().replace(/\s+/g, '.')}@bjjacademy.com`,
      phone: phone.trim() || '(11) 99999-0000',
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80`,
      belt,
      stripes,
      degreesNeededForNext: 4,
      currentAttendanceCount: 0,
      classesForNextDegree: belt === 'white' ? 30 : 40,
      joinDate: new Date().toLocaleDateString('pt-BR'),
      rankingPosition: students.length + 1,
      rankingPoints: 100,
      category,
      weightKg: Number(weightKg) || 75,
      streakWeeks: 1,
      promotions: [
        {
          id: 'prom_init_' + Date.now(),
          belt,
          stripes,
          date: new Date().toLocaleDateString('pt-BR'),
          instructor: 'Registro Inicial no Sistema',
          notes: 'Matrícula efetuada com sucesso no banco de dados em nuvem.'
        }
      ]
    };

    try {
      await saveStudentToFirestore(newStudent);
      if (onStudentSaved) onStudentSaved(newStudent);
      setIsRegistering(false);
      setName('');
      setEmail('');
      setPhone('');
      setStripes(0);
    } catch (err) {
      console.error('Erro ao salvar aluno na nuvem:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStudent = async (studentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja remover este aluno da base em nuvem?')) {
      try {
        await removeStudentFromFirestore(studentId);
      } catch (err) {
        console.error('Erro ao deletar aluno:', err);
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
      id="modal-student-management"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Users size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-white text-base leading-tight">
                  Alunos Cadastrados na Nuvem
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <Cloud size={10} />
                  Firestore Ativo
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {students.length} alunos sincronizados • {academyName}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action / Search Bar */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/40 flex items-center gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Buscar aluno por nome, faixa ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 shadow-lg shadow-blue-600/20"
          >
            <UserPlus size={15} />
            <span>{isRegistering ? 'Ver Lista' : 'Novo Aluno'}</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isRegistering ? (
            /* Registration Form */
            <form onSubmit={handleCreateStudent} className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-700/50">
                <Sparkles className="text-blue-400" size={18} />
                <h3 className="font-bold text-sm text-white">Cadastrar Novo Aluno no Banco em Nuvem</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Gabriel Martins"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">E-mail</label>
                  <input
                    type="email"
                    placeholder="gabriel@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="(11) 98888-7777"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Faixa Atual</label>
                  <select
                    value={belt}
                    onChange={(e) => setBelt(e.target.value as BeltColor)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
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
                  <label className="block text-slate-300 font-semibold mb-1">Graus na Faixa (0 a 4)</label>
                  <input
                    type="number"
                    min="0"
                    max="4"
                    value={stripes}
                    onChange={(e) => setStripes(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Categoria CBJJ</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Adulto Médio">Adulto Médio</option>
                    <option value="Infantil B">Infantil B (Kids)</option>
                    <option value="Juvenil Leve">Juvenil Leve</option>
                    <option value="Master 1 Pesado">Master 1 Pesado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Peso (kg)</label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 size={15} />
                  <span>{isSaving ? 'Salvando na Nuvem...' : 'Cadastrar e Salvar'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Students List */
            filteredStudents.map((s) => {
              const isActive = s.id === activeStudentId;
              return (
                <div
                  key={s.id}
                  onClick={() => {
                    onSelectStudent(s);
                    onClose();
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isActive 
                      ? 'bg-blue-600/10 border-blue-500/50 shadow-md shadow-blue-500/5' 
                      : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={s.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'} 
                      alt={s.name}
                      className="w-11 h-11 rounded-full object-cover border-2 border-slate-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white truncate">{s.name}</span>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-500 text-white uppercase tracking-wider shrink-0">
                            Ativo no App
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <BeltBadge belt={s.belt} stripes={s.stripes} />
                        <span className="text-[11px] text-slate-400">
                          {s.currentAttendanceCount || 0} aulas
                        </span>
                        {s.weightKg && (
                          <span className="text-[11px] text-slate-500">• {s.weightKg} kg</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => handleDeleteStudent(s.id, e)}
                      title="Excluir aluno da nuvem"
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                    <ChevronRight size={16} className="text-slate-500" />
                  </div>
                </div>
              );
            })
          )}

          {!isRegistering && filteredStudents.length === 0 && (
            <div className="text-center py-10 text-slate-400 space-y-2">
              <Users className="mx-auto text-slate-600" size={32} />
              <p className="text-sm">Nenhum aluno encontrado para "{searchTerm}"</p>
              <button
                onClick={() => setIsRegistering(true)}
                className="text-xs text-blue-400 hover:underline font-semibold"
              >
                Cadastrar novo aluno agora
              </button>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Cloud size={14} className="text-emerald-400" />
            <span>Sincronizado com Google Firebase Firestore</span>
          </div>
          <span className="text-[11px] text-slate-500">
            Clique em qualquer aluno para carregar o perfil dele
          </span>
        </div>
      </div>
    </div>
  );
};
