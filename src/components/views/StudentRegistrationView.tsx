import React, { useState } from 'react';
import { 
  ArrowLeft, UserPlus, FileText, CheckCircle2, AlertCircle, 
  User, Phone, Mail, Calendar, Shield, Award, MapPin, 
  HeartPulse, Sparkles, Cloud, RefreshCw, Lock, ArrowUpRight,
  Eye, Check, Users, ShieldCheck, ChevronRight
} from 'lucide-react';
import { 
  StudentProfile, BeltColor, RegisteredAcademy, 
  SaasPlanTier, SAAS_PLAN_DETAILS, SAAS_PLAN_LIMITS 
} from '../../types';
import { BeltBadge } from '../common/BeltBadge';
import { saveStudentToFirestore } from '../../firebase/firestoreService';
import { StudentEnrollmentService } from '../../services/studentEnrollmentService';
import { validateCPF, formatCPF, formatPhone, formatCEP, fetchAddressByCEP } from '../../utils/brazilianDocValidators';
import { LoyaltyOfficialContractView } from '../common/LoyaltyOfficialContractView';
import { R2StorageClient } from '../../services/r2StorageClient';
import confetti from 'canvas-confetti';

interface StudentRegistrationViewProps {
  activeAcademy: RegisteredAcademy;
  onBack: () => void;
  onStudentSaved: (student: StudentProfile) => void;
  students: StudentProfile[];
  onOpenR2Backup?: () => void;
  onOpenPlanUpgrade?: () => void;
}

export const StudentRegistrationView: React.FC<StudentRegistrationViewProps> = ({
  activeAcademy,
  onBack,
  onStudentSaved,
  students,
  onOpenR2Backup,
  onOpenPlanUpgrade,
}) => {
  const [subTab, setSubTab] = useState<'form' | 'contract'>('form');
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [savedStudentName, setSavedStudentName] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [studentCpf, setStudentCpf] = useState('');
  const [studentRg, setStudentRg] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [belt, setBelt] = useState<BeltColor>('white');
  const [stripes, setStripes] = useState<number>(0);
  const [category, setCategory] = useState<'Adulto Médio' | 'Infantil B' | 'Master 1 Pesado' | 'Juvenil Leve'>('Adulto Médio');
  const [weightKg, setWeightKg] = useState<number>(75);
  const [studentStatus, setStudentStatus] = useState<'ATIVO' | 'INATIVO'>('ATIVO');

  // Cloudflare R2 Avatar
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false);
  const [avatarUploadSuccess, setAvatarUploadSuccess] = useState<boolean>(false);

  // Minor / Responsible State
  const [isMinor, setIsMinor] = useState<boolean>(false);
  const [parentName, setParentName] = useState('');
  const [parentRelationship, setParentRelationship] = useState('Mãe');
  const [parentCpf, setParentCpf] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentRg, setParentRg] = useState('');
  const [parentProfession, setParentProfession] = useState('');

  // Address via ViaCEP
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [addressComplement, setAddressComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [isSearchingCep, setIsSearchingCep] = useState(false);

  // Plan & Tuition
  const [planName, setPlanName] = useState('Plano Mensal Livre (Tatame)');
  const [monthlyFee, setMonthlyFee] = useState('100.00');
  const [dueDay, setDueDay] = useState('10');

  // Medical Info
  const [bloodType, setBloodType] = useState('O+');
  const [healthInsurance, setHealthInsurance] = useState('');
  const [allergies, setAllergies] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');

  // Terms & Contract Signature
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [contractSignature, setContractSignature] = useState<string | null>(null);
  const [contractSignedAt, setContractSignedAt] = useState<string | null>(null);

  // SaaS Capacity Limit
  const planTier: SaasPlanTier = activeAcademy.saasPlanTier || 'PRATA';
  const planLimit = activeAcademy.maxActiveStudentsLimit || SAAS_PLAN_LIMITS[planTier] || 150;
  const activeStudentsCount = students.filter(s => s.status !== 'INATIVO').length;
  const isPlanAtLimit = activeStudentsCount >= planLimit && studentStatus === 'ATIVO';

  // Handle CEP change
  const handleCepChange = async (val: string) => {
    const formatted = formatCEP(val);
    setCep(formatted);
    const cleanNumbers = formatted.replace(/\D/g, '');
    if (cleanNumbers.length === 8) {
      setIsSearchingCep(true);
      try {
        const addr = await fetchAddressByCEP(formatted);
        if (addr && !addr.erro) {
          if (addr.logradouro) setAddress(addr.logradouro);
          if (addr.bairro) setNeighborhood(addr.bairro);
          if (addr.localidade) setCity(addr.localidade);
          if (addr.uf) setState(addr.uf);
        }
      } catch (err) {
        console.warn('Erro ao consultar CEP:', err);
      } finally {
        setIsSearchingCep(false);
      }
    }
  };

  // Avatar Upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    setAvatarUploadSuccess(false);
    try {
      const res = await R2StorageClient.uploadMedia(file, {
        originalName: file.name,
        mimeType: file.type,
        folder: 'avatars',
        tenantId: activeAcademy.id
      });
      setAvatarUrl(res.url);
      setAvatarUploadSuccess(true);
    } catch (err) {
      console.error('[Student View] Falha no upload para R2:', err);
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = '';
    }
  };

  // CPF change with auto mask
  const handleCpfChange = (val: string) => {
    setStudentCpf(formatCPF(val));
    setValidationError(null);
  };

  const handleParentCpfChange = (val: string) => {
    setParentCpf(formatCPF(val));
  };

  const handlePhoneChange = (val: string) => {
    setPhone(formatPhone(val));
  };

  const handleParentPhoneChange = (val: string) => {
    setParentPhone(formatPhone(val));
  };

  // Form Submit
  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!name.trim()) {
      setValidationError('Por favor, informe o nome completo do aluno.');
      return;
    }

    if (studentCpf.trim()) {
      const clean = studentCpf.replace(/\D/g, '');
      if (clean.length === 11 && !validateCPF(clean)) {
        setValidationError('O CPF digitado é inválido. Por favor, verifique os dígitos.');
        return;
      }
    }

    if (isMinor) {
      if (!parentName.trim()) {
        setValidationError('Para alunos menores de idade, o nome do responsável legal é obrigatório.');
        return;
      }
      if (!parentPhone.trim()) {
        setValidationError('Para alunos menores de idade, o WhatsApp/telefone do responsável é obrigatório.');
        return;
      }
    }

    if (isPlanAtLimit) {
      setValidationError(`Limite de ${planLimit} alunos ativos no plano atingido.`);
      return;
    }

    setIsSaving(true);
    try {
      const newStudent: StudentProfile = {
        id: `stu_${Date.now()}`,
        name: name.trim(),
        email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.') || 'aluno'}@loyaltyjiujitsu.com.br`,
        phone: phone.trim() || (isMinor ? parentPhone.trim() : '(85) 9-9136-2789'),
        avatar: avatarUrl || (isMinor ? '/bjj_media/bjj_kid_student.jpg' : '/bjj_media/bjj_student_male.jpg'),
        belt,
        stripes,
        degreesNeededForNext: 4,
        currentAttendanceCount: 0,
        classesForNextDegree: 30,
        joinDate: new Date().toISOString().split('T')[0],
        rankingPosition: students.length + 1,
        rankingPoints: 0,
        category,
        weightKg,
        streakWeeks: 0,
        promotions: [],
        status: studentStatus,
        tenantId: activeAcademy.id,
        academyId: activeAcademy.id,
        academyName: activeAcademy.name,
        birthDate: birthDate.trim() || undefined,
        cpf: studentCpf.trim() || undefined,
        studentCpf: studentCpf.trim() || undefined,
        rg: studentRg.trim() || undefined,
        gender,
        planName: planName.trim() || undefined,
        billingDueDay: dueDay ? Number(dueDay) : 10,
        monthlyFee: monthlyFee ? Number(monthlyFee) : 100,
        cep: cep.trim() || undefined,
        address: address.trim() || undefined,
        addressNumber: addressNumber.trim() || undefined,
        addressComplement: addressComplement.trim() || undefined,
        neighborhood: neighborhood.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        bloodType: bloodType.trim() || undefined,
        healthInsurance: healthInsurance.trim() || undefined,
        allergies: allergies.trim() || undefined,
        isMinor,
        parentName: isMinor ? parentName.trim() : undefined,
        parentRelationship: isMinor ? parentRelationship.trim() : undefined,
        parentCpf: isMinor ? parentCpf.trim() : undefined,
        parentPhone: isMinor ? parentPhone.trim() : undefined,
        parentEmail: isMinor ? parentEmail.trim() : undefined,
        parentRg: isMinor ? parentRg.trim() : undefined,
        parentProfession: isMinor ? parentProfession.trim() : undefined,
        emergencyContactName: emergencyContactName.trim() || undefined,
        emergencyContactPhone: emergencyContactPhone.trim() || undefined,
        termsAccepted,
        signatureDate: new Date().toISOString()
      };

      await saveStudentToFirestore(newStudent);
      const nextStudentsList = [newStudent, ...students];
      await StudentEnrollmentService.syncActiveStudentsCount(activeAcademy, nextStudentsList);

      onStudentSaved(newStudent);
      setSavedStudentName(newStudent.name);
      setSaveSuccess(true);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error('Erro ao salvar matrícula de aluno:', err);
      setValidationError('Erro ao salvar no banco em nuvem. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetForNew = () => {
    setName('');
    setEmail('');
    setPhone('');
    setBirthDate('');
    setStudentCpf('');
    setStudentRg('');
    setBelt('white');
    setStripes(0);
    setCategory('Adulto Médio');
    setWeightKg(75);
    setStudentStatus('ATIVO');
    setAvatarUrl('');
    setIsMinor(false);
    setParentName('');
    setParentCpf('');
    setParentPhone('');
    setParentEmail('');
    setCep('');
    setAddress('');
    setAddressNumber('');
    setAddressComplement('');
    setNeighborhood('');
    setCity('');
    setState('');
    setSaveSuccess(false);
    setValidationError(null);
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none relative overflow-x-hidden">
      
      {/* 1. TOP HEADER DA PÁGINA COMPLETA */}
      <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 text-xs sm:text-sm font-bold transition cursor-pointer"
            title="Voltar ao Tatame / Dashboard"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span className="hidden xs:inline">Voltar</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-xl font-black text-white tracking-tight flex items-center gap-1.5">
                <UserPlus className="w-5 h-5 text-blue-400" />
                <span>Cadastro Oficial de Aluno</span>
              </h1>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Página Completa
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Matrícula individual, dados civis, anamnese médica e contrato digital • {activeAcademy.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Subtab Switcher */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setSubTab('form')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
                subTab === 'form'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Formulário
            </button>
            <button
              type="button"
              onClick={() => setSubTab('contract')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1 cursor-pointer ${
                subTab === 'contract'
                  ? 'bg-amber-500 text-black shadow-sm font-black'
                  : 'text-amber-300 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Contrato (PDF)</span>
            </button>
          </div>

          <span className="text-xs font-mono text-slate-400 hidden md:inline-block px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
            {activeStudentsCount}/{planLimit === 999999 ? '∞' : planLimit} Ativos
          </span>
        </div>
      </header>

      {/* 2. CONTEÚDO PRINCIPAL (100% VISÍVEL, SEM MODAL, COM SCROLL NATURAL) */}
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-8 flex-1 flex flex-col space-y-6">
        
        {/* Banner de Sucesso pós-salvamento */}
        {saveSuccess && (
          <div className="p-5 rounded-3xl bg-emerald-950/70 border border-emerald-500/60 shadow-xl space-y-3 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  Matrícula Realizada com Sucesso!
                </h3>
                <p className="text-xs text-emerald-300">
                  O aluno <strong className="text-white underline">{savedStudentName}</strong> foi cadastrado e sincronizado no banco de dados da academia.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-emerald-500/30">
              <button
                type="button"
                onClick={handleResetForNew}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition shadow cursor-pointer flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>Cadastrar Outro Aluno</span>
              </button>
              <button
                type="button"
                onClick={() => setSubTab('contract')}
                className={`px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 border ${
                  contractSignature
                    ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300'
                    : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-amber-500/40'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>{contractSignature ? '✓ Contrato Assinado no App' : 'Ver Contrato & Assinar'}</span>
              </button>
              <button
                type="button"
                onClick={onBack}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer ml-auto"
              >
                ← Voltar ao Tatame
              </button>
            </div>
          </div>
        )}

        {/* SUBTAB 2: CONTRATO OFICIAL LOYALTY (PDF) */}
        {subTab === 'contract' ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/40 flex items-center justify-between gap-3 text-xs text-amber-200">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <h4 className="font-black text-white text-sm">Contrato Oficial de Prestação de Serviços & Regras</h4>
                  <p className="text-[11px] text-amber-300/90">
                    {name.trim() ? (
                      <>Aluno vinculado em tempo real: <strong className="text-white underline">{name}</strong> {isMinor && parentName ? `(Resp: ${parentName})` : ''}</>
                    ) : (
                      <>Os dados digitados na aba "Formulário" preenchem este contrato automaticamente.</>
                    )}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSubTab('form')}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs shrink-0 cursor-pointer"
              >
                ← Voltar ao Formulário
              </button>
            </div>

            <LoyaltyOfficialContractView
              studentData={{
                name: name.trim() || undefined,
                rg: studentRg.trim() || undefined,
                cpf: studentCpf.trim() || undefined,
                address: address.trim() || undefined,
                neighborhood: neighborhood.trim() || undefined,
                cep: cep.trim() || undefined,
                city: city.trim() || undefined,
                state: state.trim() || undefined,
                phone: phone.trim() || undefined,
                email: email.trim() || undefined,
                isMinor,
                parentName: parentName.trim() || undefined,
                parentRelationship: parentRelationship.trim() || undefined,
                parentCpf: parentCpf.trim() || undefined,
                parentRg: parentRg.trim() || undefined,
                parentPhone: parentPhone.trim() || undefined,
                parentEmail: parentEmail.trim() || undefined,
                planName: planName.trim() || undefined,
                monthlyFee: monthlyFee ? Number(monthlyFee) : undefined,
                dueDay: dueDay ? Number(dueDay) : undefined,
              }}
              isEmbedded={true}
              onClose={() => setSubTab('form')}
              onSignContract={(sigUrl, meta) => {
                setContractSignature(sigUrl);
                setContractSignedAt(meta.signedAt);
              }}
              initialSignature={contractSignature || undefined}
            />
          </div>
        ) : (
          /* SUBTAB 1: FORMULÁRIO COMPLETO COM TODAS AS SEÇÕES ESPAÇOSAS */
          <form onSubmit={handleSaveStudent} className="space-y-6">
            
            {/* Banner de Erro de Validação */}
            {validationError && (
              <div className="p-4 rounded-2xl bg-red-950/70 border border-red-500 flex items-center gap-3 text-red-200 text-xs sm:text-sm animate-shake">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* SEÇÃO 1: IDENTIFICAÇÃO CIVIL DO ALUNO */}
            <div className="p-5 sm:p-7 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-lg">
              <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-black text-sm">
                  1
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Dados Pessoais & Identificação Civil</h3>
                  <p className="text-xs text-slate-400">Informações principais para cadastro e contrato</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {/* Nome Completo */}
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="font-bold text-slate-300 block mb-1.5">
                    Nome Completo do Aluno: <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setValidationError(null);
                    }}
                    placeholder="Ex: Gabriel Silveira da Rocha"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                {/* CPF do Aluno */}
                <div>
                  <label className="font-bold text-slate-300 block mb-1.5">
                    CPF do Aluno:
                  </label>
                  <input
                    type="text"
                    value={studentCpf}
                    onChange={(e) => handleCpfChange(e.target.value)}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white font-mono placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                {/* RG do Aluno */}
                <div>
                  <label className="font-bold text-slate-300 block mb-1.5">
                    RG / Documento:
                  </label>
                  <input
                    type="text"
                    value={studentRg}
                    onChange={(e) => setStudentRg(e.target.value)}
                    placeholder="Ex: 200801020304-5 SSP"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                {/* Data de Nascimento */}
                <div>
                  <label className="font-bold text-slate-300 block mb-1.5">
                    Data de Nascimento:
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => {
                      setBirthDate(e.target.value);
                      if (e.target.value) {
                        const birth = new Date(e.target.value);
                        const ageDiff = Date.now() - birth.getTime();
                        const ageDate = new Date(ageDiff);
                        const age = Math.abs(ageDate.getUTCFullYear() - 1970);
                        if (age < 18) {
                          setIsMinor(true);
                        }
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                {/* WhatsApp / Telefone */}
                <div>
                  <label className="font-bold text-slate-300 block mb-1.5">
                    WhatsApp / Telefone Celular:
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="(85) 90000-0000"
                    maxLength={15}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white font-mono placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                {/* E-mail */}
                <div>
                  <label className="font-bold text-slate-300 block mb-1.5">
                    E-mail do Aluno:
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aluno@email.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                {/* Gênero */}
                <div>
                  <label className="font-bold text-slate-300 block mb-1.5">
                    Gênero:
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="male">Masculino</option>
                    <option value="female">Feminino</option>
                    <option value="other">Outro</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SEÇÃO 2: FOTO DO ALUNO & CLOUDFLARE R2 */}
            <div className="p-5 sm:p-7 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-lg">
              <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-black text-sm">
                  2
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Foto Oficial do Aluno & Mídia R2</h3>
                  <p className="text-xs text-slate-400">Armazenamento externo na nuvem Cloudflare R2 (fora da máquina)</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-950 border-2 border-amber-500/60 shrink-0 flex items-center justify-center shadow-md relative">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar Aluno" className="w-full h-full object-cover" />
                  ) : (
                    <img 
                      src={isMinor ? '/bjj_media/bjj_kid_student.jpg' : '/bjj_media/bjj_student_male.jpg'} 
                      alt="Avatar Padrão" 
                      className="w-full h-full object-cover opacity-70" 
                    />
                  )}
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 text-amber-400 animate-spin" />
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex-1 text-center sm:text-left">
                  <div className="text-xs font-bold text-white">
                    {avatarUrl ? 'Foto anexada à ficha do aluno' : 'Nenhuma foto personalizada anexada (usando avatar padrão do kimono)'}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                    <label className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs transition cursor-pointer shadow flex items-center gap-1.5">
                      <Cloud className="w-3.5 h-3.5" />
                      <span>{isUploadingAvatar ? 'Enviando...' : 'Carregar Foto para R2'}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleAvatarUpload} 
                        disabled={isUploadingAvatar}
                        className="hidden" 
                      />
                    </label>

                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl('')}
                        className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                      >
                        Remover Foto
                      </button>
                    )}

                    {onOpenR2Backup && (
                      <button
                        type="button"
                        onClick={onOpenR2Backup}
                        className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 hover:text-white text-xs font-semibold"
                      >
                        Painel Mídias R2
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SEÇÃO 3: GRADUAÇÃO, CATEGORIA & TATAME */}
            <div className="p-5 sm:p-7 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-lg">
              <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-sm">
                  3
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Graduação, Faixa & Categoria</h3>
                  <p className="text-xs text-slate-400">Classificação esportiva e controle de graus</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                {/* Faixa */}
                <div>
                  <label className="font-bold text-slate-300 block mb-1.5 flex items-center justify-between">
                    <span>Faixa Atual:</span>
                    <BeltBadge belt={belt} stripes={stripes} size="sm" />
                  </label>
                  <select
                    value={belt}
                    onChange={(e) => setBelt(e.target.value as BeltColor)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-hidden focus:border-amber-500"
                  >
                    <optgroup label="Faixas Adulto / Juvenil">
                      <option value="white">Branca</option>
                      <option value="blue">Azul</option>
                      <option value="purple">Roxa</option>
                      <option value="brown">Marrom</option>
                      <option value="black">Preta</option>
                    </optgroup>
                    <optgroup label="Faixas Infantis (Kids)">
                      <option value="grey_white">Cinza e Branca</option>
                      <option value="grey">Cinza</option>
                      <option value="grey_black">Cinza e Preta</option>
                      <option value="yellow_white">Amarela e Branca</option>
                      <option value="yellow">Amarela</option>
                      <option value="yellow_black">Amarela e Preta</option>
                      <option value="orange_white">Laranja e Branca</option>
                      <option value="orange">Laranja</option>
                      <option value="orange_black">Laranja e Preta</option>
                      <option value="green_white">Verde e Branca</option>
                      <option value="green">Verde</option>
                      <option value="green_black">Verde e Preta</option>
                    </optgroup>
                  </select>
                </div>

                {/* Graus */}
                <div>
                  <label className="font-bold text-slate-300 block mb-1.5">
                    Graus na Faixa:
                  </label>
                  <select
                    value={stripes}
                    onChange={(e) => setStripes(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-hidden focus:border-amber-500"
                  >
                    <option value={0}>0 Graus (Lisa)</option>
                    <option value={1}>1º Grau</option>
                    <option value={2}>2º Grau</option>
                    <option value={3}>3º Grau</option>
                    <option value={4}>4º Grau</option>
                  </select>
                </div>

                {/* Categoria */}
                <div>
                  <label className="font-bold text-slate-300 block mb-1.5">
                    Categoria de Peso:
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="Adulto Médio">Adulto Médio</option>
                    <option value="Juvenil Leve">Juvenil Leve</option>
                    <option value="Infantil B">Infantil B</option>
                    <option value="Master 1 Pesado">Master 1 Pesado</option>
                  </select>
                </div>

                {/* Peso em Kg */}
                <div>
                  <label className="font-bold text-slate-300 block mb-1.5">
                    Peso em Balança (Kg):
                  </label>
                  <input
                    type="number"
                    min={15}
                    max={180}
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-hidden focus:border-amber-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* SEÇÃO 4: MENOR DE IDADE & RESPONSÁVEL LEGAL */}
            <div className={`p-5 sm:p-7 rounded-3xl border transition-all duration-300 space-y-5 ${
              isMinor 
                ? 'bg-blue-950/30 border-blue-500/50 shadow-xl' 
                : 'bg-slate-900/90 border-slate-800 shadow-lg'
            }`}>
              <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black text-sm">
                    4
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Menor de Idade & Responsável Legal</h3>
                    <p className="text-xs text-slate-400">Obrigatório para crianças e adolescentes (Kids & Juvenil)</p>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-700">
                  <input
                    type="checkbox"
                    checked={isMinor}
                    onChange={(e) => setIsMinor(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-blue-500 focus:ring-blue-500 bg-slate-900"
                  />
                  <span className="text-xs font-bold text-blue-300">Aluno é Menor de Idade</span>
                </label>
              </div>

              {isMinor && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs animate-fadeIn">
                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-300 block mb-1.5">
                      Nome Completo do Responsável: <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required={isMinor}
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      placeholder="Ex: Ana Cláudia Silveira"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1.5">
                      Parentesco:
                    </label>
                    <select
                      value={parentRelationship}
                      onChange={(e) => setParentRelationship(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-hidden focus:border-blue-500"
                    >
                      <option value="Mãe">Mãe</option>
                      <option value="Pai">Pai</option>
                      <option value="Responsável Legal">Responsável Legal / Tutor</option>
                      <option value="Avô / Avó">Avô / Avó</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1.5">
                      CPF do Responsável:
                    </label>
                    <input
                      type="text"
                      value={parentCpf}
                      onChange={(e) => handleParentCpfChange(e.target.value)}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white font-mono placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1.5">
                      WhatsApp do Responsável: <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required={isMinor}
                      value={parentPhone}
                      onChange={(e) => handleParentPhoneChange(e.target.value)}
                      placeholder="(85) 90000-0000"
                      maxLength={15}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white font-mono placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1.5">
                      E-mail do Responsável:
                    </label>
                    <input
                      type="email"
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      placeholder="responsavel@email.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* SEÇÃO 5: ENDEREÇO RESIDENCIAL & VIACEP */}
            <div className="p-5 sm:p-7 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-lg">
              <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-sm">
                  5
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Endereço Residencial (Busca Automática por CEP)</h3>
                  <p className="text-xs text-slate-400">Preenchimento instantâneo integrado à base oficial dos Correios (ViaCEP)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                {/* CEP */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="font-bold text-slate-300 block mb-1.5 flex items-center justify-between">
                    <span>CEP:</span>
                    {isSearchingCep && <span className="text-[10px] text-amber-400 font-bold animate-pulse">Buscando...</span>}
                  </label>
                  <input
                    type="text"
                    value={cep}
                    onChange={(e) => handleCepChange(e.target.value)}
                    placeholder="60000-000"
                    maxLength={9}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white font-mono placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                {/* Rua / Logradouro */}
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="font-bold text-slate-300 block mb-1.5">
                    Rua / Avenida (Logradouro):
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ex: Rua Barão de Studart"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                {/* Número */}
                <div>
                  <label className="font-bold text-slate-300 block mb-1.5">
                    Número:
                  </label>
                  <input
                    type="text"
                    value={addressNumber}
                    onChange={(e) => setAddressNumber(e.target.value)}
                    placeholder="Ex: 1250"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                {/* Complemento */}
                <div>
                  <label className="font-bold text-slate-300 block mb-1.5">
                    Complemento / Bloco:
                  </label>
                  <input
                    type="text"
                    value={addressComplement}
                    onChange={(e) => setAddressComplement(e.target.value)}
                    placeholder="Apto 402, Bloco B"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                {/* Bairro */}
                <div>
                  <label className="font-bold text-slate-300 block mb-1.5">
                    Bairro:
                  </label>
                  <input
                    type="text"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="Ex: Aldeota"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                {/* Cidade e UF */}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="font-bold text-slate-300 block mb-1.5">
                      Cidade:
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Fortaleza"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                  <div className="w-20">
                    <label className="font-bold text-slate-300 block mb-1.5">
                      UF:
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value.toUpperCase())}
                      placeholder="CE"
                      maxLength={2}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-3 text-sm text-white font-mono uppercase focus:outline-hidden focus:border-emerald-500 text-center"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SEÇÃO 6: PLANO, MENSALIDADE & VENCIMENTO */}
            <div className="p-5 sm:p-7 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-lg">
              <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-black text-sm">
                  6
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Plano de Matrícula & Mensalidade</h3>
                  <p className="text-xs text-slate-400">Valores cadastrais para cobrança e contrato</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-300 block mb-1.5">
                    Nome do Plano:
                  </label>
                  <input
                    type="text"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    placeholder="Ex: Plano Mensal Livre"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-hidden focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1.5">
                    Valor da Mensalidade (R$):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={monthlyFee}
                    onChange={(e) => setMonthlyFee(e.target.value)}
                    placeholder="100.00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white font-mono focus:outline-hidden focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1.5">
                    Melhor Dia de Vencimento:
                  </label>
                  <select
                    value={dueDay}
                    onChange={(e) => setDueDay(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-hidden focus:border-teal-500"
                  >
                    <option value="5">Todo dia 05</option>
                    <option value="10">Todo dia 10</option>
                    <option value="15">Todo dia 15</option>
                    <option value="20">Todo dia 20</option>
                    <option value="25">Todo dia 25</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SEÇÃO 7: FICHA MÉDICA & CONTATO DE EMERGÊNCIA */}
            <div className="p-5 sm:p-7 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-lg">
              <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
                <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center font-black text-sm">
                  7
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Ficha Médica & Emergência no Tatame</h3>
                  <p className="text-xs text-slate-400">Segurança do praticante durante o treino e rola</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-300 block mb-1.5">
                    Tipo Sanguíneo:
                  </label>
                  <select
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-hidden focus:border-red-500"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="Não informado">Não sei informar</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1.5">
                    Plano de Saúde / Convênio:
                  </label>
                  <input
                    type="text"
                    value={healthInsurance}
                    onChange={(e) => setHealthInsurance(e.target.value)}
                    placeholder="Ex: Unimed, Hapvida, SUS"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1.5">
                    Contato de Emergência (Nome):
                  </label>
                  <input
                    type="text"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    placeholder="Ex: Mariana Silveira (Esposa)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1.5">
                    Telefone de Emergência:
                  </label>
                  <input
                    type="text"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(formatPhone(e.target.value))}
                    placeholder="(85) 90000-0000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white font-mono placeholder-slate-500 focus:outline-hidden focus:border-red-500"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-4">
                  <label className="font-bold text-slate-300 block mb-1.5">
                    Alergias ou Condições Médicas Pré-existentes:
                  </label>
                  <input
                    type="text"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="Ex: Asma moderada, alergia a dipirona, lesão antiga no ombro direito..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500"
                  />
                </div>
              </div>
            </div>

            {/* BARRA FIXA DE AÇÃO FINAL */}
            <div className="sticky bottom-4 z-30 p-4 sm:p-5 rounded-3xl bg-slate-900/95 border border-slate-700 shadow-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-xs text-slate-300">
                  Ao salvar, a ficha é gravada imediatamente no Firebase Firestore e no cadastro oficial da academia.
                </span>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onBack}
                  className="flex-1 sm:flex-none px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs sm:text-sm transition cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={() => setSubTab('contract')}
                  className="flex-1 sm:flex-none px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 font-bold text-xs sm:text-sm transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  <span>Ver Contrato (PDF)</span>
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 sm:flex-none px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-emerald-950/60 transition cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Salvando no Banco Nuvem...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Salvar e Matricular Aluno</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>
        )}

      </main>
    </div>
  );
};
