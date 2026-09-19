import React, { useState, useEffect } from 'react';
import { 
  X, Users, UserPlus, Search, Shield, Award, 
  Phone, Mail, CheckCircle2, ChevronRight, Trash2, 
  Sparkles, Cloud, RefreshCw, AlertCircle, Zap, 
  Lock, UserCheck, UserX, ArrowUpRight, Baby,
  HeartHandshake, FileText, Calendar, ShieldCheck
} from 'lucide-react';
import { StudentProfile, BeltColor, RegisteredAcademy, SaasPlanTier, SAAS_PLAN_DETAILS, SAAS_PLAN_LIMITS } from '../../types';
import { BeltBadge } from './BeltBadge';
import { saveStudentToFirestore, removeStudentFromFirestore } from '../../firebase/firestoreService';
import { StudentEnrollmentService } from '../../services/studentEnrollmentService';
import { PlanUpgradeModal } from './PlanUpgradeModal';
import { validateCPF, formatCPF, formatPhone } from '../../utils/brazilianDocValidators';

interface StudentManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentProfile[];
  activeStudentId: string;
  onSelectStudent: (student: StudentProfile) => void;
  onStudentSaved?: (student: StudentProfile) => void;
  academyName: string;
  activeAcademy?: RegisteredAcademy;
  onUpdateAcademy?: (academy: RegisteredAcademy) => void;
  initialRegistering?: boolean;
}

export const StudentManagementModal: React.FC<StudentManagementModalProps> = ({
  isOpen,
  onClose,
  students,
  activeStudentId,
  onSelectStudent,
  onStudentSaved,
  academyName,
  activeAcademy,
  onUpdateAcademy,
  initialRegistering = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isRegistering, setIsRegistering] = useState(initialRegistering);
  const [isSaving, setIsSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ATIVO' | 'INATIVO'>('ALL');
  
  // Upgrade Modal State
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [blockedStudentName, setBlockedStudentName] = useState('');
  const [planErrorMessage, setPlanErrorMessage] = useState<string | null>(null);
  const [formValidationError, setFormValidationError] = useState<string | null>(null);

  // Form State for new student
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [studentCpf, setStudentCpf] = useState('');
  const [belt, setBelt] = useState<BeltColor>('white');
  const [stripes, setStripes] = useState<number>(0);
  const [category, setCategory] = useState<'Adulto Médio' | 'Infantil B' | 'Master 1 Pesado' | 'Juvenil Leve'>('Adulto Médio');
  const [weightKg, setWeightKg] = useState<number>(75);
  const [studentStatus, setStudentStatus] = useState<'ATIVO' | 'INATIVO'>('ATIVO');

  // Kids / Minor Responsible State (Mandatory when isMinor is true)
  const [isMinor, setIsMinor] = useState<boolean>(false);
  const [parentName, setParentName] = useState('');
  const [parentRelationship, setParentRelationship] = useState('Mãe');
  const [parentCpf, setParentCpf] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentRg, setParentRg] = useState('');
  const [parentProfession, setParentProfession] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');

  // Sync initialRegistering prop when modal opens
  useEffect(() => {
    if (isOpen && initialRegistering) {
      setIsRegistering(true);
    }
  }, [isOpen, initialRegistering]);

  if (!isOpen) return null;

  // Resolved academy fallback
  const currentAcademy: RegisteredAcademy = activeAcademy || {
    id: 'acad_loyalty_jiujitsu',
    name: academyName || 'Loyalty Jiu-Jitsu',
    shortName: 'Loyalty BJJ',
    branch: 'Matriz Oficial',
    city: 'Fortaleza - CE',
    phone: '(85) 98765-4321',
    voiceEnabled: true,
    voiceStyle: 'tatame_master',
    notificationFormat: 'name_and_title',
    chimeType: 'tatame_bell',
    speechRate: 1.0,
    speechPitch: 1.0,
    saasPlanTier: 'OURO',
    maxActiveStudentsLimit: 999999,
    activeStudentsCount: students.length
  };

  const planTier: SaasPlanTier = currentAcademy.saasPlanTier || 'BRONZE';
  const planLimit = currentAcademy.maxActiveStudentsLimit || SAAS_PLAN_LIMITS[planTier];
  const activeStudentsCount = students.filter(s => (s.status === 'ATIVO' || s.status === undefined)).length;
  const isPlanAtLimit = planLimit < 999999 && activeStudentsCount >= planLimit;
  const planUsagePercent = planLimit >= 999999 ? 0 : Math.min(100, Math.round((activeStudentsCount / planLimit) * 100));

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      s.belt.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'ATIVO' && (s.status === 'ATIVO' || s.status === undefined)) ||
      (statusFilter === 'INATIVO' && s.status === 'INATIVO');

    return matchesSearch && matchesStatus;
  });

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormValidationError(null);

    if (!name.trim()) {
      setFormValidationError('O Nome Completo do aluno é obrigatório.');
      return;
    }

    // Regra e Validação para Aluno Menor de Idade / Turma Kids
    if (isMinor) {
      if (!parentName.trim()) {
        setFormValidationError('⚠️ Campo Obrigatório: Informe o Nome Completo do Responsável Legal do aluno Kids.');
        return;
      }
      if (!parentRelationship.trim()) {
        setFormValidationError('⚠️ Campo Obrigatório: Selecione o Grau de Parentesco do Responsável Legal.');
        return;
      }
      if (!parentCpf.trim()) {
        setFormValidationError('⚠️ Campo Obrigatório: Informe o CPF do Responsável Legal para o contrato.');
        return;
      }
      if (!validateCPF(parentCpf)) {
        setFormValidationError('⚠️ CPF Inválido: O CPF informado para o Responsável Legal não possui dígitos verificadores válidos.');
        return;
      }
      if (!parentPhone.trim()) {
        setFormValidationError('⚠️ Campo Obrigatório: Informe o Telefone / WhatsApp de contato do Responsável Legal.');
        return;
      }
      if (!parentEmail.trim() || !parentEmail.includes('@')) {
        setFormValidationError('⚠️ Campo Obrigatório: Informe um E-mail válido para o Responsável Legal receber faturas e contrato.');
        return;
      }
    }

    setPlanErrorMessage(null);
    setIsSaving(true);
    
    const newStudentId = 'stu_' + Date.now().toString(36);
    const newStudent: StudentProfile = {
      id: newStudentId,
      name: name.trim(),
      email: email.trim() || (isMinor && parentEmail.trim() ? parentEmail.trim() : `${name.trim().toLowerCase().replace(/\s+/g, '.')}@bjjacademy.com`),
      phone: phone.trim() || (isMinor && parentPhone.trim() ? parentPhone.trim() : '(11) 99999-0000'),
      avatar: isMinor ? '/bjj_media/bjj_kid_student.jpg' : '/bjj_media/bjj_student_male.jpg',
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
      status: studentStatus,
      tenantId: currentAcademy.id,
      academyId: currentAcademy.id,
      academyName: currentAcademy.name,
      // Kids / Menor de Idade & Responsável Legal
      isMinor: !!isMinor,
      birthDate: birthDate.trim() || undefined,
      cpf: studentCpf.trim() || undefined,
      studentCpf: studentCpf.trim() || undefined,
      parentName: isMinor ? parentName.trim() : undefined,
      parentRelationship: isMinor ? parentRelationship.trim() : undefined,
      parentCpf: isMinor ? parentCpf.trim() : undefined,
      parentRg: isMinor && parentRg.trim() ? parentRg.trim() : undefined,
      parentPhone: isMinor ? parentPhone.trim() : undefined,
      parentEmail: isMinor ? parentEmail.trim() : undefined,
      parentProfession: isMinor && parentProfession.trim() ? parentProfession.trim() : undefined,
      emergencyContactName: emergencyContactName.trim() || undefined,
      emergencyContactPhone: emergencyContactPhone.trim() || undefined,
      promotions: [
        {
          id: 'prom_init_' + Date.now(),
          belt,
          stripes,
          date: new Date().toLocaleDateString('pt-BR'),
          instructor: 'Registro Inicial no Sistema',
          notes: isMinor 
            ? `Matrícula Kids efetuada. Responsável Legal: ${parentName.trim()} (${parentRelationship.trim()}).`
            : 'Matrícula efetuada com validação no Database Tier.'
        }
      ]
    };

    // -------------------------------------------------------------
    // REGRA DE BLOQUEIO NO BANCO DE DADOS (DATABASE TIER)
    // Valida cota do plano antes de autorizar o insert no Firestore
    // -------------------------------------------------------------
    const validation = await StudentEnrollmentService.validateAndEnroll({
      academy: currentAcademy,
      student: newStudent,
      allStudents: students
    });

    if (!validation.allowed) {
      setIsSaving(false);
      setBlockedStudentName(newStudent.name);
      setPlanErrorMessage(validation.message);
      setIsUpgradeModalOpen(true);
      return;
    }

    try {
      await saveStudentToFirestore(newStudent);
      await StudentEnrollmentService.syncActiveStudentsCount(currentAcademy, [...students, newStudent]);
      
      if (onStudentSaved) onStudentSaved(newStudent);
      setIsRegistering(false);
      setName('');
      setEmail('');
      setPhone('');
      setBirthDate('');
      setStudentCpf('');
      setStripes(0);
      setStudentStatus('ATIVO');
      setIsMinor(false);
      setParentName('');
      setParentRelationship('Mãe');
      setParentCpf('');
      setParentPhone('');
      setParentEmail('');
      setParentRg('');
      setParentProfession('');
      setEmergencyContactName('');
      setEmergencyContactPhone('');
      setFormValidationError(null);
    } catch (err) {
      console.error('Erro ao salvar aluno na nuvem:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStudentStatus = async (studentToToggle: StudentProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus: 'ATIVO' | 'INATIVO' = (studentToToggle.status === 'INATIVO') ? 'ATIVO' : 'INATIVO';

    // Se estiver reativando um aluno e o plano estiver cheio, bloqueia!
    if (newStatus === 'ATIVO' && isPlanAtLimit) {
      setBlockedStudentName(studentToToggle.name);
      setPlanErrorMessage(`Não é possível reativar ${studentToToggle.name}: o limite de ${planLimit} alunos ativos do ${SAAS_PLAN_DETAILS[planTier].label} foi atingido.`);
      setIsUpgradeModalOpen(true);
      return;
    }

    const updated: StudentProfile = {
      ...studentToToggle,
      status: newStatus
    };

    try {
      await saveStudentToFirestore(updated);
      const updatedList = students.map(s => s.id === updated.id ? updated : s);
      await StudentEnrollmentService.syncActiveStudentsCount(currentAcademy, updatedList);
      if (onStudentSaved) onStudentSaved(updated);
    } catch (err) {
      console.error('Erro ao alternar status do aluno:', err);
    }
  };

  const handleDeleteStudent = async (studentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja remover este aluno da base em nuvem?')) {
      try {
        await removeStudentFromFirestore(studentId);
        const remaining = students.filter(s => s.id !== studentId);
        await StudentEnrollmentService.syncActiveStudentsCount(currentAcademy, remaining);
      } catch (err) {
        console.error('Erro ao deletar aluno:', err);
      }
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
        id="modal-student-management"
      >
        <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Users size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-white text-base leading-tight">
                    Gestão de Alunos & Tatame
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    <Cloud size={10} />
                    Multi-Tenant DB
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {students.length} cadastrados ({activeStudentsCount} ativos) • {currentAcademy.name}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Database Tier SaaS Plan Capacity Bar */}
          <div className="px-6 py-3 bg-slate-950/70 border-b border-slate-800/80 shrink-0">
            <div className="flex items-center justify-between gap-3 text-xs mb-1.5">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-lg border text-[11px] font-extrabold flex items-center gap-1 ${SAAS_PLAN_DETAILS[planTier].badgeColor}`}>
                  <Zap className="w-3 h-3" />
                  {SAAS_PLAN_DETAILS[planTier].label}
                </span>
                <span className="text-slate-300 font-medium">
                  {activeStudentsCount} / {planLimit === 999999 ? 'Ilimitado' : `${planLimit} ativos`}
                </span>
                {isPlanAtLimit && (
                  <span className="px-1.5 py-0.5 rounded bg-red-500/20 border border-red-500/40 text-red-300 text-[10px] font-bold flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> Trava Ativa
                  </span>
                )}
              </div>

              <button
                onClick={() => setIsUpgradeModalOpen(true)}
                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>Upgrade de Plano</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
              <div 
                className={`h-full transition-all duration-500 ${
                  isPlanAtLimit 
                    ? 'bg-red-500' 
                    : planUsagePercent >= 85 
                    ? 'bg-amber-500' 
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${planLimit === 999999 ? 20 : Math.min(100, planUsagePercent)}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
              <span>Regra de Bloqueio no Banco: validação ativa antes de cada inserção</span>
              <span>{planLimit === 999999 ? 'Sem limite de alunos' : `${Math.max(0, planLimit - activeStudentsCount)} vagas livres no plano`}</span>
            </div>
          </div>

          {/* Action Bar (Search, Status Filter, Add Button) */}
          <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome, faixa ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Status Filter */}
              <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-0.5 text-[11px] font-bold">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg transition ${statusFilter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setStatusFilter('ATIVO')}
                  className={`px-2.5 py-1 rounded-lg transition ${statusFilter === 'ATIVO' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-white'}`}
                >
                  Ativos ({activeStudentsCount})
                </button>
                <button
                  onClick={() => setStatusFilter('INATIVO')}
                  className={`px-2.5 py-1 rounded-lg transition ${statusFilter === 'INATIVO' ? 'bg-slate-700 text-slate-200' : 'text-slate-400 hover:text-white'}`}
                >
                  Inativos ({students.length - activeStudentsCount})
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                if (isPlanAtLimit) {
                  setBlockedStudentName('Novo Aluno');
                  setPlanErrorMessage(`O limite de ${planLimit} alunos ativos no ${SAAS_PLAN_DETAILS[planTier].label} foi atingido. Faça upgrade ou inative alunos sem frequência.`);
                  setIsUpgradeModalOpen(true);
                } else {
                  setIsRegistering(!isRegistering);
                }
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                isRegistering 
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
                  : isPlanAtLimit
                  ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
              }`}
            >
              {isPlanAtLimit ? (
                <>
                  <Lock size={14} />
                  <span>Limite Atingido (Upgrade)</span>
                </>
              ) : isRegistering ? (
                <>
                  <X size={15} />
                  <span>Fechar Formulário</span>
                </>
              ) : (
                <>
                  <UserPlus size={15} />
                  <span>Cadastrar Aluno</span>
                </>
              )}
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {planErrorMessage && (
              <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/50 flex items-start gap-2.5 text-xs text-red-200">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-red-300">Trava de Banco de Dados Disparada</p>
                  <p className="text-[11px] text-slate-300">{planErrorMessage}</p>
                </div>
                <button
                  onClick={() => setIsUpgradeModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-black text-[10px] uppercase hover:bg-amber-400"
                >
                  Upgrade
                </button>
              </div>
            )}

            {isRegistering ? (
              /* New Student Form */
              <form onSubmit={handleCreateStudent} className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <UserPlus size={14} className="text-blue-400" />
                    Novo Aluno • Validação Automática de Cota
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Cota atual: <strong className="text-slate-200">{activeStudentsCount}/{planLimit === 999999 ? '∞' : planLimit}</strong>
                  </span>
                </div>

                {/* Validation Feedback Error */}
                {formValidationError && (
                  <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/80 text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle size={16} className="text-red-400 shrink-0" />
                    <span>{formValidationError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-300 font-semibold mb-1">Nome Completo do Aluno *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Carlos Eduardo de Oliveira"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (formValidationError) setFormValidationError(null);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Data de Nascimento</label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      CPF do Aluno {isMinor ? '(Opcional para Kids)' : '*'}
                    </label>
                    <input
                      type="text"
                      maxLength={14}
                      placeholder="000.000.000-00"
                      value={studentCpf}
                      onChange={(e) => setStudentCpf(formatCPF(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  {/* PERGUNTA INTERATIVA: O aluno é menor de idade / Turma Kids? */}
                  <div className="sm:col-span-2 p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-700/80 space-y-2.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40">
                          <Baby size={18} />
                        </div>
                        <div>
                          <label className="text-xs font-black text-white flex items-center gap-1.5">
                            O aluno é menor de idade / Turma Kids?
                            <span className="text-amber-400">*</span>
                          </label>
                          <p className="text-[10px] text-slate-400">
                            Define a obrigatoriedade dos dados do responsável legal para validade jurídica e contrato.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                        <button
                          type="button"
                          onClick={() => {
                            setIsMinor(false);
                            setFormValidationError(null);
                            if (category === 'Infantil B') setCategory('Adulto Médio');
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                            !isMinor 
                              ? 'bg-slate-800 text-white shadow-xs border border-slate-700' 
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          NÃO (Adulto / 18+)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsMinor(true);
                            setFormValidationError(null);
                            if (category === 'Adulto Médio' || category === 'Master 1 Pesado') setCategory('Infantil B');
                            if (belt === 'blue' || belt === 'purple' || belt === 'brown' || belt === 'black') setBelt('grey');
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                            isMinor 
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950 border border-purple-400/40' 
                              : 'text-slate-400 hover:text-purple-300'
                          }`}
                        >
                          <span>SIM (Kids / Menor)</span>
                          <span className="text-[9px] px-1 rounded bg-purple-950 text-purple-200 border border-purple-400/30">Obrigatório</span>
                        </button>
                      </div>
                    </div>

                    {/* SE A RESPOSTA FOR SIM: CAMPOS OBRIGATÓRIOS DO RESPONSÁVEL LEGAL */}
                    {isMinor && (
                      <div className="mt-3 pt-3 border-t border-purple-500/30 bg-purple-950/20 rounded-xl p-3 space-y-3 border border-purple-500/30">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-extrabold text-purple-200 uppercase tracking-wider flex items-center gap-1.5">
                            <HeartHandshake size={14} className="text-purple-300" />
                            Dados Obrigatórios do Responsável Legal (Contrato & Cobrança)
                          </span>
                          <span className="text-[10px] text-purple-300 bg-purple-900/60 px-2 py-0.5 rounded-full border border-purple-500/40 font-mono">
                            Exigência Jurídica & ECA
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div className="sm:col-span-2">
                            <label className="block text-slate-200 font-bold mb-1 text-[11px]">
                              Nome Completo do Responsável Legal *
                            </label>
                            <input
                              type="text"
                              required={isMinor}
                              placeholder="Ex: Patrícia Cristina da Silva"
                              value={parentName}
                              onChange={(e) => setParentName(e.target.value)}
                              className="w-full bg-slate-900 border border-purple-500/40 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-200 font-bold mb-1 text-[11px]">
                              Grau de Parentesco *
                            </label>
                            <select
                              value={parentRelationship}
                              onChange={(e) => setParentRelationship(e.target.value)}
                              className="w-full bg-slate-900 border border-purple-500/40 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-400 text-xs font-semibold"
                            >
                              <option value="Mãe">Mãe</option>
                              <option value="Pai">Pai</option>
                              <option value="Tutor(a) Legal">Tutor(a) Legal / Guardião</option>
                              <option value="Avó / Avô">Avó / Avô</option>
                              <option value="Tia / Tio">Tia / Tio</option>
                              <option value="Outro Responsável Legal">Outro Responsável Legal</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-slate-200 font-bold mb-1 text-[11px] flex items-center justify-between">
                              <span>CPF do Responsável *</span>
                              {parentCpf && (
                                <span className={`text-[10px] font-mono ${validateCPF(parentCpf) ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {validateCPF(parentCpf) ? '✓ CPF Válido' : '✕ CPF Inválido'}
                                </span>
                              )}
                            </label>
                            <input
                              type="text"
                              required={isMinor}
                              maxLength={14}
                              placeholder="000.000.000-00"
                              value={parentCpf}
                              onChange={(e) => setParentCpf(formatCPF(e.target.value))}
                              className={`w-full bg-slate-900 border rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none text-xs font-mono ${
                                parentCpf && !validateCPF(parentCpf) ? 'border-red-500 focus:border-red-400' : 'border-purple-500/40 focus:border-purple-400'
                              }`}
                            />
                          </div>

                          <div>
                            <label className="block text-slate-200 font-bold mb-1 text-[11px]">
                              WhatsApp / Telefone do Responsável *
                            </label>
                            <input
                              type="text"
                              required={isMinor}
                              maxLength={15}
                              placeholder="(11) 98888-7777"
                              value={parentPhone}
                              onChange={(e) => setParentPhone(formatPhone(e.target.value))}
                              className="w-full bg-slate-900 border border-purple-500/40 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 text-xs font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-200 font-bold mb-1 text-[11px]">
                              E-mail do Responsável (Faturas & Contrato) *
                            </label>
                            <input
                              type="email"
                              required={isMinor}
                              placeholder="responsavel@exemplo.com"
                              value={parentEmail}
                              onChange={(e) => setParentEmail(e.target.value)}
                              className="w-full bg-slate-900 border border-purple-500/40 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-300 mb-1 text-[11px]">
                              RG do Responsável (Opcional)
                            </label>
                            <input
                              type="text"
                              placeholder="Ex: 12.345.678-9 SSP"
                              value={parentRg}
                              onChange={(e) => setParentRg(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-300 mb-1 text-[11px]">
                              Profissão do Responsável (Opcional p/ Contrato)
                            </label>
                            <input
                              type="text"
                              placeholder="Ex: Engenheira / Advogado"
                              value={parentProfession}
                              onChange={(e) => setParentProfession(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none text-xs"
                            />
                          </div>

                          <div className="sm:col-span-2 pt-1 border-t border-purple-500/20">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                              Contato de Emergência Secundário (Opcional):
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <input
                                type="text"
                                placeholder="Nome do Contato (Ex: Avó Maria)"
                                value={emergencyContactName}
                                onChange={(e) => setEmergencyContactName(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white placeholder-slate-500 text-xs"
                              />
                              <input
                                type="text"
                                placeholder="Telefone Emergência"
                                value={emergencyContactPhone}
                                onChange={(e) => setEmergencyContactPhone(formatPhone(e.target.value))}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white placeholder-slate-500 text-xs font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      E-mail do Aluno {isMinor && '(Opcional se fornecido do Responsável)'}
                    </label>
                    <input
                      type="email"
                      placeholder="carlos@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Telefone do Aluno {isMinor && '(Opcional se fornecido do Responsável)'}
                    </label>
                    <input
                      type="text"
                      maxLength={15}
                      placeholder="(11) 98888-7777"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Status da Matrícula</label>
                    <select
                      value={studentStatus}
                      onChange={(e) => setStudentStatus(e.target.value as 'ATIVO' | 'INATIVO')}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-medium"
                    >
                      <option value="ATIVO">🟢 ATIVO (Consome vaga no plano)</option>
                      <option value="INATIVO">⚪ INATIVO (Trancado / Não consome vaga)</option>
                    </select>
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
                    <span>{isSaving ? 'Validando no Banco...' : 'Validar e Salvar'}</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Students List */
              filteredStudents.map((s) => {
                const isActiveInApp = s.id === activeStudentId;
                const isStudentActive = s.status === 'ATIVO' || s.status === undefined;

                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      onSelectStudent(s);
                      onClose();
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isActiveInApp 
                        ? 'bg-blue-600/10 border-blue-500/50 shadow-md shadow-blue-500/5' 
                        : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img 
                        src={s.avatar || (s.isMinor ? '/bjj_media/bjj_kid_student.jpg' : '/bjj_media/bjj_student_male.jpg')} 
                        alt={s.name}
                        className="w-11 h-11 rounded-full object-cover border-2 border-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-white truncate">{s.name}</span>
                          
                          {/* Kids Badge */}
                          {s.isMinor && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                              🧒 Turma Kids
                            </span>
                          )}

                          {/* Student Status Badge (ATIVO vs INATIVO) */}
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 border ${
                            isStudentActive 
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                              : 'bg-slate-700/60 text-slate-400 border-slate-600'
                          }`}>
                            {isStudentActive ? 'Ativo (Tatame)' : 'Inativo (Trancado)'}
                          </span>

                          {isActiveInApp && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-500 text-white uppercase tracking-wider shrink-0">
                              Perfil Selecionado
                            </span>
                          )}
                        </div>

                        {/* Info do Responsável Legal para Alunos Kids */}
                        {s.isMinor && s.parentName && (
                          <div className="text-[11px] text-purple-300/90 font-medium flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <HeartHandshake size={12} className="text-purple-400 shrink-0" />
                            <span>
                              Resp: <strong className="text-white">{s.parentName}</strong> ({s.parentRelationship || 'Resp.'})
                            </span>
                            {s.parentPhone && <span className="text-slate-400 font-mono">• {s.parentPhone}</span>}
                            {s.parentCpf && <span className="text-slate-500 font-mono text-[10px]">({s.parentCpf})</span>}
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-1">
                          <BeltBadge belt={s.belt} stripes={s.stripes} />
                          <span className="text-[11px] text-slate-400">
                            {s.currentAttendanceCount || 0} aulas
                          </span>
                          {s.weightKg && (
                            <span className="text-[11px] text-slate-500">• {s.weightKg} kg</span>
                          )}
                          {s.category && (
                            <span className="text-[10px] text-slate-400 bg-slate-800/80 px-1.5 py-0.2 rounded border border-slate-700">
                              {s.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Toggle Active / Inactive Status Button */}
                      <button
                        onClick={(e) => handleToggleStudentStatus(s, e)}
                        title={isStudentActive ? 'Inativar aluno (libera vaga no plano SaaS)' : 'Reativar aluno no tatame'}
                        className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                          isStudentActive 
                            ? 'text-slate-400 hover:text-amber-300 hover:bg-amber-500/10' 
                            : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
                        }`}
                      >
                        {isStudentActive ? (
                          <>
                            <UserX size={15} />
                            <span className="hidden sm:inline text-[11px]">Inativar</span>
                          </>
                        ) : (
                          <>
                            <UserCheck size={15} />
                            <span className="hidden sm:inline text-[11px]">Reativar</span>
                          </>
                        )}
                      </button>

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
              <span>Validação no Database Tier: {currentAcademy.name}</span>
            </div>
            <button
              onClick={() => setIsUpgradeModalOpen(true)}
              className="text-[11px] font-bold text-amber-400 hover:underline"
            >
              Gerenciar Plano ({SAAS_PLAN_DETAILS[planTier].label})
            </button>
          </div>
        </div>
      </div>

      {/* Plan Upgrade & Lock Modal */}
      <PlanUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        academy={currentAcademy}
        activeStudentsCount={activeStudentsCount}
        blockedStudentName={blockedStudentName}
        onPlanUpgraded={(updatedAcademy) => {
          if (onUpdateAcademy) {
            onUpdateAcademy(updatedAcademy);
          }
          setPlanErrorMessage(null);
        }}
      />
    </>
  );
};
