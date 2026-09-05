import React, { useState, useMemo } from 'react';
import { 
  Building2, Plus, Search, MapPin, Phone, Mail, UserCheck, 
  DollarSign, ShieldCheck, Sparkles, Check, CheckCircle2, AlertCircle, 
  Trash2, Edit3, Volume2, Play, QrCode, Copy, ArrowRight, ExternalLink,
  Percent, Award, Users, Compass, Eye, Filter, Sliders, RefreshCw,
  Download, ArrowLeft, CheckCheck, Shield
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  RegisteredAcademy, AcademyVoiceStyle, NotificationFormat, 
  ChimeType, PlatformGeneralManager, AcademyPricingPlan 
} from '../../types';
import { defaultPlatformGeneralManager } from '../../data/mockData';
import { academyVoiceEngine } from '../../utils/voiceNotification';
import { formatBRL } from '../../utils/financialCalculations';
import { exportAcademiesListCSV } from '../../utils/csvExport';

interface AcademyRegistrationViewProps {
  academies: RegisteredAcademy[];
  activeAcademy: RegisteredAcademy;
  onSelectActiveAcademy: (academy: RegisteredAcademy) => void;
  onAddAcademy: (academy: RegisteredAcademy) => void;
  onUpdateAcademy: (academy: RegisteredAcademy) => void;
  onDeleteAcademy?: (academyId: string) => void;
  generalManager?: PlatformGeneralManager;
  onOpenVoiceNotice?: (title: string, body: string) => void;
  onBackToManager?: () => void;
}

// Preset logos or martial shields
const PRESET_LOGOS = [
  { id: 'bjj_gold', label: 'BJJ Dourado', icon: '🥋', bg: 'from-amber-600 to-yellow-800' },
  { id: 'red_shield', label: 'Escudo Vermelho', icon: '🛡️', bg: 'from-red-600 to-red-900' },
  { id: 'eagle', label: 'Águia Marcial', icon: '🦅', bg: 'from-blue-600 to-slate-900' },
  { id: 'tiger', label: 'Tigre Tatame', icon: '🐅', bg: 'from-orange-600 to-amber-950' },
  { id: 'lion', label: 'Leão Black Belt', icon: '🦁', bg: 'from-emerald-600 to-slate-900' },
  { id: 'dragon', label: 'Dragão Combat', icon: '🐉', bg: 'from-purple-600 to-slate-950' },
];

const BRAZIL_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export const AcademyRegistrationView: React.FC<AcademyRegistrationViewProps> = ({
  academies,
  activeAcademy,
  onSelectActiveAcademy,
  onAddAcademy,
  onUpdateAcademy,
  onDeleteAcademy,
  generalManager = defaultPlatformGeneralManager,
  onOpenVoiceNotice,
  onBackToManager
}) => {
  // Navigation tabs: 'form' (Formulário de Cadastro/Edição) | 'list' (Filiais Cadastradas) | 'repasses' (Repasses Gestor Geral)
  const [activeTab, setActiveTab] = useState<'form' | 'list' | 'repasses'>('form');

  // Search filter in list view
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStateFilter, setSelectedStateFilter] = useState('ALL');

  // Editing mode
  const [editingAcademyId, setEditingAcademyId] = useState<string | null>(null);

  // Form State: 1. Informações Básicas
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [branch, setBranch] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [selectedLogoPreset, setSelectedLogoPreset] = useState(PRESET_LOGOS[0].id);

  // Form State: 2. Endereço & Localização
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('São Paulo');
  const [state, setState] = useState('SP');

  // Form State: 3. Contato & Instrutor Responsável
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [headInstructor, setHeadInstructor] = useState('');
  const [crefNumber, setCrefNumber] = useState('');
  const [studentCapacity, setStudentCapacity] = useState<number>(200);
  const [tatamiAreaM2, setTatamiAreaM2] = useState<number>(140);

  // Form State: 4. Configurações Financeiras da Academia
  const [pixKey, setPixKey] = useState('');
  const [pixKeyType, setPixKeyType] = useState<'cnpj' | 'cpf' | 'email' | 'phone' | 'random'>('cnpj');
  const [bankAccount, setBankAccount] = useState('');
  const [defaultFinePercent, setDefaultFinePercent] = useState<number>(2.0);
  const [defaultMonthlyInterestPercent, setDefaultMonthlyInterestPercent] = useState<number>(1.0);
  const [monthlyRevenueTarget, setMonthlyRevenueTarget] = useState<number>(50000);

  // Form State: 5. Contrato com a Plataforma BJJacademy
  const [platformPlan, setPlatformPlan] = useState<'basic' | 'pro' | 'enterprise'>('pro');

  // Form State: 6. Notificações com Voz
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceStyle, setVoiceStyle] = useState<AcademyVoiceStyle>('commercial');
  const [voiceSpeed, setVoiceSpeed] = useState<number>(1.0);
  const [voiceVolume, setVoiceVolume] = useState<number>(1.0);
  const [chimeType, setChimeType] = useState<ChimeType>('gong');
  const [customWelcomeMessage, setCustomWelcomeMessage] = useState('Atenção Tatame! Bem-vindo aos treinos da BJJ Academy.');

  // Form State: 7. Planos de Mensalidade
  const [pricingPlans, setPricingPlans] = useState<AcademyPricingPlan[]>([
    {
      id: 'plan-1',
      name: 'Plano Adulto Ilimitado (Gi & No-Gi)',
      periodMonths: 1,
      price: 249.90,
      monthlyEquivalent: 249.90,
      billingCycle: 'monthly',
      description: 'Acesso livre a todas as aulas de segunda a sábado, inclusive treinos livres e open mat.',
      isPopular: true
    },
    {
      id: 'plan-2',
      name: 'Plano Kids & Juvenil Tatame',
      periodMonths: 1,
      price: 189.90,
      monthlyEquivalent: 189.90,
      billingCycle: 'monthly',
      description: 'Formação marcial infantil, anti-bullying e fundamentos CBJJ com acompanhamento.',
      isPopular: false
    },
    {
      id: 'plan-3',
      name: 'Plano Anual Fidelidade Black Belt',
      periodMonths: 12,
      price: 209.90,
      monthlyEquivalent: 209.90,
      billingCycle: 'annual',
      description: '12 parcelas mensais com 15% de desconto e kimono oficial da academia incluso.',
      isPopular: true
    }
  ]);

  // Messages
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);
  const [copiedPixKey, setCopiedPixKey] = useState(false);

  // Filtered academies list
  const filteredAcademies = useMemo(() => {
    return academies.filter(acad => {
      const matchesSearch = 
        acad.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (acad.shortName && acad.shortName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        acad.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acad.headInstructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acad.cnpj.includes(searchTerm);
      
      const matchesState = selectedStateFilter === 'ALL' || acad.state === selectedStateFilter;
      return matchesSearch && matchesState;
    });
  }, [academies, searchTerm, selectedStateFilter]);

  // Load academy into form for editing
  const handleEditAcademy = (academy: RegisteredAcademy) => {
    setEditingAcademyId(academy.id);
    setName(academy.name);
    setShortName(academy.shortName || academy.name);
    setBranch(academy.branch || '');
    setCnpj(academy.cnpj);
    setSelectedLogoPreset(academy.logoPresetId || PRESET_LOGOS[0].id);

    setCep(academy.cep || '');
    setAddress(academy.address);
    setNeighborhood(academy.neighborhood || '');
    setCity(academy.city);
    setState(academy.state);

    setPhone(academy.phone);
    setEmail(academy.email);
    setHeadInstructor(academy.headInstructor);
    setCrefNumber(academy.crefNumber || '');
    setStudentCapacity(academy.studentCapacity || 200);
    setTatamiAreaM2(academy.tatamiAreaM2 || 140);

    setPixKey(academy.pixKey);
    setPixKeyType(academy.pixKeyType || 'cnpj');
    setBankAccount(academy.bankAccount || '');
    setDefaultFinePercent(academy.defaultFinePercent || 2.0);
    setDefaultMonthlyInterestPercent(academy.defaultMonthlyInterestPercent || 1.0);
    setMonthlyRevenueTarget(academy.monthlyRevenueTarget || 50000);

    setPlatformPlan(academy.platformPlan || 'pro');

    if (academy.voiceSettings) {
      setVoiceEnabled(academy.voiceSettings.enabled);
      setVoiceStyle(academy.voiceSettings.voiceStyle);
      setVoiceSpeed(academy.voiceSettings.voiceSpeed);
      setVoiceVolume(academy.voiceSettings.voiceVolume);
      setChimeType(academy.voiceSettings.chimeType);
      setCustomWelcomeMessage(academy.voiceSettings.customWelcomeMessage || '');
    } else {
      setVoiceEnabled(academy.voiceEnabled ?? true);
      if (academy.voiceStyle) setVoiceStyle(academy.voiceStyle);
      if (academy.speechRate) setVoiceSpeed(academy.speechRate);
      if (academy.chimeType) setChimeType(academy.chimeType);
      if (academy.customPhrasePrefix) setCustomWelcomeMessage(academy.customPhrasePrefix);
    }

    if (academy.pricingPlans && academy.pricingPlans.length > 0) {
      setPricingPlans(academy.pricingPlans);
    }

    setActiveTab('form');
    setFormSuccessMessage(null);
    setFormErrorMessage(null);
  };

  // Reset form
  const handleResetForm = () => {
    setEditingAcademyId(null);
    setName('');
    setShortName('');
    setBranch('');
    setCnpj('');
    setSelectedLogoPreset(PRESET_LOGOS[0].id);
    setCep('');
    setAddress('');
    setNeighborhood('');
    setCity('São Paulo');
    setState('SP');
    setPhone('');
    setEmail('');
    setHeadInstructor('');
    setCrefNumber('');
    setStudentCapacity(200);
    setTatamiAreaM2(140);
    setPixKey('');
    setPixKeyType('cnpj');
    setBankAccount('');
    setDefaultFinePercent(2.0);
    setDefaultMonthlyInterestPercent(1.0);
    setMonthlyRevenueTarget(50000);
    setPlatformPlan('pro');
    setCustomWelcomeMessage('Atenção Tatame! Bem-vindo aos treinos da BJJ Academy.');
    setFormSuccessMessage(null);
    setFormErrorMessage(null);
  };

  // Auto fill demo values for quick testing
  const handleFillDemoValues = () => {
    setName('Alliance BJJ Moema Premium');
    setShortName('Alliance Moema');
    setBranch('Unidade Moema Pássaros');
    setCnpj('14.289.442/0001-88');
    setSelectedLogoPreset('lion');
    setCep('04515-010');
    setAddress('Avenida Ibirapuera, 2450');
    setNeighborhood('Moema');
    setCity('São Paulo');
    setState('SP');
    setPhone('(11) 98877-4433');
    setEmail('contato@alliancemoema.com.br');
    setHeadInstructor('Prof. Marcelo Peixoto (Faixa Preta 4º Grau)');
    setCrefNumber('048123-G/SP');
    setStudentCapacity(320);
    setTatamiAreaM2(180);
    setPixKey('14.289.442/0001-88');
    setPixKeyType('cnpj');
    setBankAccount('Banco Itaú (341) Ag: 0524 CC: 45890-2');
    setDefaultFinePercent(2.0);
    setDefaultMonthlyInterestPercent(1.0);
    setMonthlyRevenueTarget(65000);
    setPlatformPlan('enterprise');
    setCustomWelcomeMessage('Atenção Tatame Alliance Moema: Respeito, disciplina e OSS!');
    setFormSuccessMessage('Dados de exemplo preenchidos! Pronto para cadastrar.');
    setTimeout(() => setFormSuccessMessage(null), 3000);
  };

  // Auto populate shortName when typing name
  const handleNameBlur = () => {
    if (!shortName && name) {
      setShortName(name.split(' ').slice(0, 3).join(' '));
    }
  };

  // Auto populate pixKey when typing CNPJ
  const handleCnpjBlur = () => {
    if (!pixKey && cnpj && pixKeyType === 'cnpj') {
      setPixKey(cnpj);
    }
  };

  // Test Voice Audio
  const handleTestVoice = () => {
    const textToSpeak = `${customWelcomeMessage} Sistema de chamada e tatame ativado para ${shortName || name || 'sua academia'}. Oss!`;
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'pt-BR';
      utterance.rate = voiceSpeed;
      utterance.volume = voiceVolume;
      window.speechSynthesis.speak(utterance);
    }
    if (onOpenVoiceNotice) {
      onOpenVoiceNotice('🔊 Teste Sonoro de Tatame', textToSpeak);
    }
  };

  // Add plan
  const handleAddPricingPlan = () => {
    const newPlan: AcademyPricingPlan = {
      id: `plan-${Date.now()}`,
      name: 'Novo Plano de Treino',
      periodMonths: 1,
      price: 199.90,
      monthlyEquivalent: 199.90,
      billingCycle: 'monthly',
      description: 'Descrição do plano de aulas, faixas e horários inclusos.',
      isPopular: false
    };
    setPricingPlans([...pricingPlans, newPlan]);
  };

  const handleUpdatePlanField = (index: number, field: keyof AcademyPricingPlan, value: any) => {
    const updated = [...pricingPlans];
    updated[index] = { ...updated[index], [field]: value };
    setPricingPlans(updated);
  };

  const handleRemovePlan = (index: number) => {
    setPricingPlans(pricingPlans.filter((_, i) => i !== index));
  };

  // Submit Form
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setFormErrorMessage('Por favor, informe a Razão Social ou Nome da Academia.');
      return;
    }
    if (!cnpj.trim()) {
      setFormErrorMessage('Por favor, informe o CNPJ da academia para emissão e cobrança via PIX.');
      return;
    }
    if (!headInstructor.trim()) {
      setFormErrorMessage('Por favor, informe o Professor / Faixa Preta Responsável técnico.');
      return;
    }
    if (!pixKey.trim()) {
      setFormErrorMessage('Por favor, informe a Chave PIX oficial onde os alunos pagarão as mensalidades.');
      return;
    }

    const academyData: RegisteredAcademy = {
      id: editingAcademyId || `acad-${Date.now()}`,
      name: name.trim(),
      shortName: shortName.trim() || name.trim(),
      branch: branch.trim() || 'Matriz',
      cnpj: cnpj.trim(),
      logoPresetId: selectedLogoPreset,
      address: address.trim(),
      neighborhood: neighborhood.trim(),
      city: city.trim(),
      state: state,
      cep: cep.trim(),
      phone: phone.trim(),
      email: email.trim(),
      headInstructor: headInstructor.trim(),
      crefNumber: crefNumber.trim(),
      studentCapacity,
      tatamiAreaM2,
      activeStudentsCount: editingAcademyId 
        ? (academies.find(a => a.id === editingAcademyId)?.activeStudentsCount || 0)
        : 45, // initial demo students
      pixKey: pixKey.trim(),
      pixKeyType,
      bankAccount: bankAccount.trim(),
      defaultFinePercent,
      defaultMonthlyInterestPercent,
      monthlyRevenueTarget,
      platformPlan,
      monthlyPlatformFeeBRL: platformPlan === 'basic' ? 149.00 : platformPlan === 'pro' ? 249.00 : 449.00,
      platformFeeStatus: 'paid',
      lastPlatformPaymentDate: '10/05/2026',
      voiceEnabled,
      voiceStyle,
      notificationFormat: 'name_and_title',
      chimeType,
      speechRate: voiceSpeed,
      speechPitch: 1.0,
      customPhrasePrefix: 'Aviso da filial',
      voiceSettings: {
        enabled: voiceEnabled,
        voiceStyle,
        voiceSpeed,
        voiceVolume,
        chimeType,
        customWelcomeMessage: customWelcomeMessage.trim()
      },
      pricingPlans,
      createdAt: editingAcademyId 
        ? (academies.find(a => a.id === editingAcademyId)?.createdAt || new Date().toISOString())
        : new Date().toISOString()
    };

    if (editingAcademyId) {
      onUpdateAcademy(academyData);
      setFormSuccessMessage(`Academia "${academyData.name}" atualizada com sucesso!`);
    } else {
      onAddAcademy(academyData);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setFormSuccessMessage(`🎉 Parabéns! Filial "${academyData.name}" cadastrada e ativada no sistema!`);
    }

    setFormErrorMessage(null);

    // Speak welcome message
    if (voiceEnabled) {
      setTimeout(() => {
        academyVoiceEngine.announceAcademyMessage(
          academyData,
          'Nova Academia Registrada',
          `Filial ${academyData.shortName} foi credenciada com sucesso na plataforma BJJ Academy. Oss!`
        );
      }, 500);
    }

    // Reset after short delay or switch to list
    setTimeout(() => {
      setActiveTab('list');
      setFormSuccessMessage(null);
    }, 2000);
  };

  const handleCopyGeneralManagerPix = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(generalManager.pixKey);
      setCopiedPixKey(true);
      setTimeout(() => setCopiedPixKey(false), 3000);
    }
  };

  const handleExportCSV = () => {
    exportAcademiesListCSV(academies, generalManager.name);
  };

  // Find preset logo object
  const currentLogoPreset = PRESET_LOGOS.find(l => l.id === selectedLogoPreset) || PRESET_LOGOS[0];

  return (
    <div className="w-full h-full overflow-y-auto p-3 sm:p-6 space-y-4 pb-20 no-scrollbar animate-in fade-in">
      
      {/* TOP HERO BANNER */}
      <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Decorative ambient martial glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            {onBackToManager && (
              <button
                type="button"
                onClick={onBackToManager}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white transition mb-1"
              >
                <ArrowLeft size={14} />
                <span>Voltar ao Painel do Gestor</span>
              </button>
            )}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 via-amber-600 to-yellow-600 flex items-center justify-center text-2xl shadow-lg shadow-red-950/50 shrink-0">
                🏛️
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>Cadastro de Novas Academias</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wide">
                    Multi-Unidades 2.0
                  </span>
                </h1>
                <p className="text-xs text-slate-400">
                  Gerencie filiais, tatames credenciados, chaves PIX de recebimento e taxas da plataforma BJJ.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <div className="px-3 py-2 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Filiais Ativas</div>
              <div className="text-sm font-black text-white">{academies.length} Academias</div>
            </div>

            <div className="px-3 py-2 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Unidade Atual</div>
              <div className="text-sm font-black text-amber-400 truncate max-w-[140px]">
                {activeAcademy.shortName || activeAcademy.name}
              </div>
            </div>

            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-emerald-400 hover:text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition"
              title="Exportar Lista de Academias em CSV (Excel)"
            >
              <Download size={14} />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>

        {/* PRIMARY TABS SWITCHER */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => {
                setActiveTab('form');
                if (!editingAcademyId) handleResetForm();
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
                activeTab === 'form'
                  ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-lg shadow-red-950/60 font-black'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Plus size={15} />
              <span>{editingAcademyId ? 'Editar Dados da Academia' : '+ Cadastrar Nova Academia'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
                activeTab === 'list'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-950/40'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Building2 size={15} />
              <span>Filiais da Rede ({academies.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('repasses')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
                activeTab === 'repasses'
                  ? 'bg-emerald-600 text-white font-black shadow-lg shadow-emerald-950/40'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <DollarSign size={15} />
              <span>Repasses & Gestor Geral</span>
            </button>
          </div>

          {activeTab === 'form' && !editingAcademyId && (
            <button
              type="button"
              onClick={handleFillDemoValues}
              className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-amber-300 text-[11px] font-bold flex items-center gap-1.5 transition"
              title="Preencher automaticamente campos com dados reais de exemplo"
            >
              <Sparkles size={13} className="text-amber-400" />
              <span>Preencher Exemplo de Academia</span>
            </button>
          )}
        </div>
      </div>

      {/* SUCCESS / ERROR ALERTS */}
      {formSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500 text-emerald-200 text-xs font-bold flex items-center gap-3 shadow-lg animate-in fade-in">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span className="flex-1">{formSuccessMessage}</span>
        </div>
      )}

      {formErrorMessage && (
        <div className="p-4 rounded-2xl bg-red-950/90 border border-red-500 text-red-200 text-xs font-bold flex items-center gap-3 shadow-lg animate-in fade-in">
          <AlertCircle size={18} className="text-red-400 shrink-0" />
          <span className="flex-1">{formErrorMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: FORMULÁRIO COMPLETO DE CADASTRO                                    */}
      {/* ========================================================================= */}
      {activeTab === 'form' && (
        <form onSubmit={handleSubmitForm} className="space-y-6">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT 2 COLUMNS: FORM STEPS */}
            <div className="lg:col-span-2 space-y-5">
              
              {/* Box 1: Identidade da Academia & CNPJ */}
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🥋</span>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">
                      1. Identidade & Dados Oficiais da Filial
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">* Campos Obrigatórios</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                      Razão Social / Nome Oficial da Academia *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={handleNameBlur}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-semibold focus:border-red-500 focus:outline-none transition"
                      placeholder="Ex: Gracie Barra Alphaville ou Alliance BJJ Moema"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                      Nome Fantasia / Apelido no App *
                    </label>
                    <input
                      type="text"
                      value={shortName}
                      onChange={(e) => setShortName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-semibold focus:border-red-500 focus:outline-none transition"
                      placeholder="Ex: GB Alphaville ou Alliance Moema"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                      Unidade / Filial
                    </label>
                    <input
                      type="text"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-semibold focus:border-red-500 focus:outline-none transition"
                      placeholder="Ex: Matriz, Unidade Jardins, Filial Centro"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                      CNPJ da Academia *
                    </label>
                    <input
                      type="text"
                      value={cnpj}
                      onChange={(e) => setCnpj(e.target.value)}
                      onBlur={handleCnpjBlur}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-semibold focus:border-red-500 focus:outline-none font-mono transition"
                      placeholder="00.000.000/0001-00"
                      required
                    />
                  </div>
                </div>

                {/* Preset Logo Selection */}
                <div className="pt-2">
                  <label className="block text-[11px] font-bold uppercase text-slate-300 mb-2">
                    Brasão & Identidade Visual no App
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                    {PRESET_LOGOS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedLogoPreset(p.id)}
                        className={`p-2.5 rounded-2xl border text-center transition flex flex-col items-center gap-1 ${
                          selectedLogoPreset === p.id
                            ? 'bg-red-950/60 border-red-500 ring-2 ring-red-500/50 shadow-md'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${p.bg} flex items-center justify-center text-lg shadow-sm`}>
                          {p.icon}
                        </div>
                        <span className="text-[10px] font-bold text-slate-300 leading-tight">
                          {p.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Box 2: Endereço & Localização do Tatame */}
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <span className="text-xl">📍</span>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    2. Localização & Infraestrutura do Tatame
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                      CEP
                    </label>
                    <input
                      type="text"
                      value={cep}
                      onChange={(e) => setCep(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-semibold focus:border-red-500 focus:outline-none font-mono"
                      placeholder="00000-000"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                      Endereço Completo (Rua / Av. / Nº)
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-semibold focus:border-red-500 focus:outline-none"
                      placeholder="Av. Paulista, 1000 - 3º Andar"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                      Bairro
                    </label>
                    <input
                      type="text"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-semibold focus:border-red-500 focus:outline-none"
                      placeholder="Bela Vista"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                      Cidade *
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-semibold focus:border-red-500 focus:outline-none"
                      placeholder="São Paulo"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                      Estado (UF) *
                    </label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-semibold focus:border-red-500 focus:outline-none"
                    >
                      {BRAZIL_STATES.map((uf) => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                      Área do Tatame (m²)
                    </label>
                    <input
                      type="number"
                      value={tatamiAreaM2}
                      onChange={(e) => setTatamiAreaM2(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-semibold focus:border-red-500 focus:outline-none"
                      placeholder="140"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                      Capacidade Máxima de Alunos
                    </label>
                    <input
                      type="number"
                      value={studentCapacity}
                      onChange={(e) => setStudentCapacity(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-semibold focus:border-red-500 focus:outline-none"
                      placeholder="200"
                    />
                  </div>
                </div>
              </div>

              {/* Box 3: Responsável Técnico & Contato */}
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <span className="text-xl">🥋</span>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    3. Responsável Técnico & Contato Direto
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                      Professor / Faixa Preta Responsável *
                    </label>
                    <input
                      type="text"
                      value={headInstructor}
                      onChange={(e) => setHeadInstructor(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-semibold focus:border-red-500 focus:outline-none"
                      placeholder="Ex: Mestre Carlos Gracie Jr (Faixa Coral)"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                      Registro CREF
                    </label>
                    <input
                      type="text"
                      value={crefNumber}
                      onChange={(e) => setCrefNumber(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-semibold focus:border-red-500 focus:outline-none font-mono"
                      placeholder="012345-G/SP"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                      WhatsApp / Telefone da Recepção
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-semibold focus:border-red-500 focus:outline-none font-mono"
                      placeholder="(11) 99999-8888"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                      E-mail Administrativo
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-semibold focus:border-red-500 focus:outline-none"
                      placeholder="contato@minhaacademia.com.br"
                    />
                  </div>
                </div>
              </div>

              {/* Box 4: Chave PIX & Financeiro da Academia */}
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💰</span>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">
                      4. Chave PIX da Academia (Recebimento dos Alunos)
                    </h3>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold">100% Direto na Conta</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300">
                  💡 <strong>Recebimento Direto:</strong> As mensalidades pagas pelos alunos pelo app são creditadas diretamente na chave PIX cadastrada abaixo, sem intermediários.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                      Tipo de Chave PIX *
                    </label>
                    <select
                      value={pixKeyType}
                      onChange={(e) => setPixKeyType(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-semibold focus:border-red-500 focus:outline-none"
                    >
                      <option value="cnpj">CNPJ</option>
                      <option value="cpf">CPF</option>
                      <option value="email">E-mail</option>
                      <option value="phone">Telefone Celular</option>
                      <option value="random">Chave Aleatória (EVP)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                      Chave PIX Oficial *
                    </label>
                    <input
                      type="text"
                      value={pixKey}
                      onChange={(e) => setPixKey(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-semibold focus:border-red-500 focus:outline-none font-mono"
                      placeholder="Informe o CNPJ, celular ou chave aleatória"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                      Multa por Atraso (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={defaultFinePercent}
                      onChange={(e) => setDefaultFinePercent(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-semibold focus:border-red-500 focus:outline-none"
                      placeholder="2.0"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                      Juros Mensais (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={defaultMonthlyInterestPercent}
                      onChange={(e) => setDefaultMonthlyInterestPercent(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-semibold focus:border-red-500 focus:outline-none"
                      placeholder="1.0"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                      Meta Faturamento Mensal (R$)
                    </label>
                    <input
                      type="number"
                      value={monthlyRevenueTarget}
                      onChange={(e) => setMonthlyRevenueTarget(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-semibold focus:border-red-500 focus:outline-none"
                      placeholder="50000"
                    />
                  </div>
                </div>
              </div>

              {/* Box 5: Planos de Mensalidade da Unidade */}
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🏷️</span>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">
                      5. Planos de Mensalidade da Filial ({pricingPlans.length})
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddPricingPlan}
                    className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 text-xs font-bold flex items-center gap-1 transition"
                  >
                    <Plus size={13} />
                    <span>Adicionar Plano</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {pricingPlans.map((plan, index) => (
                    <div
                      key={plan.id || index}
                      className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={plan.name}
                          onChange={(e) => handleUpdatePlanField(index, 'name', e.target.value)}
                          className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-bold"
                          placeholder="Nome do Plano"
                        />
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400 font-bold">R$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={plan.price}
                            onChange={(e) => handleUpdatePlanField(index, 'price', Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-bold font-mono"
                            placeholder="Valor"
                          />
                        </div>
                        <select
                          value={plan.billingCycle}
                          onChange={(e) => handleUpdatePlanField(index, 'billingCycle', e.target.value)}
                          className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-semibold"
                        >
                          <option value="monthly">Mensal</option>
                          <option value="quarterly">Trimestral</option>
                          <option value="semiannual">Semestral</option>
                          <option value="annual">Anual</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <label className="flex items-center gap-1.5 text-[11px] text-slate-300 font-semibold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={plan.isPopular || false}
                            onChange={(e) => handleUpdatePlanField(index, 'isPopular', e.target.checked)}
                            className="rounded border-slate-700 text-red-600 focus:ring-0"
                          />
                          <span>Destaque</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemovePlan(index)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-950 text-slate-400 hover:text-red-400 transition"
                          title="Remover plano"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box 6: Voz do Tatame 2.0 */}
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🔊</span>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">
                      6. Voz do Tatame (Anúncios Sonoros na Recepção)
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleTestVoice}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Play size={13} />
                    <span>Testar Voz Agora</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                      Estilo da Voz
                    </label>
                    <select
                      value={voiceStyle}
                      onChange={(e) => setVoiceStyle(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-semibold focus:border-red-500 focus:outline-none"
                    >
                      <option value="commercial">Comercial & Dinâmica (Padrão)</option>
                      <option value="martial">Marcial Séria (Faixa Coral)</option>
                      <option value="calm">Suave & Acolhedora (Tatame Kids)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                      Toque de Entrada (Chime)
                    </label>
                    <select
                      value={chimeType}
                      onChange={(e) => setChimeType(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-semibold focus:border-red-500 focus:outline-none"
                    >
                      <option value="gong">Gongo Oriental Tradicional 🥋</option>
                      <option value="bell">Sino Eletrônico Tatame 🔔</option>
                      <option value="none">Sem Toque Sonoro</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                      Mensagem de Boas-Vindas Personalizada
                    </label>
                    <input
                      type="text"
                      value={customWelcomeMessage}
                      onChange={(e) => setCustomWelcomeMessage(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-semibold focus:border-red-500 focus:outline-none"
                      placeholder="Ex: Atenção Tatame! Bem-vindo aos treinos da BJJ Academy Moema."
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: LIVE PREVIEW & FINAL ACTIONS */}
            <div className="space-y-5">

              {/* LIVE CARD PREVIEW */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-2xl space-y-4 sticky top-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                    <Eye size={14} />
                    <span>Pré-visualização do Brasão</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-700/50">
                    Ao Vivo
                  </span>
                </div>

                {/* Academy Badge Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-700/80 shadow-xl space-y-3 relative overflow-hidden">
                  <div className="flex items-center gap-3">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${currentLogoPreset.bg} flex items-center justify-center text-3xl shadow-lg shrink-0`}>
                      {currentLogoPreset.icon}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-base font-black text-white truncate">
                        {shortName || name || 'Nome da Academia'}
                      </h4>
                      <p className="text-xs text-amber-400 font-semibold truncate">
                        {branch || 'Unidade Principal'}
                      </p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={10} className="text-red-400" />
                        <span>{city || 'Cidade'}, {state}</span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px] text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Head Coach:</span>
                      <strong className="text-white truncate max-w-[160px]">
                        {headInstructor || 'Não informado'}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">CNPJ:</span>
                      <span className="font-mono text-slate-200">
                        {cnpj || '00.000.000/0001-00'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Chave PIX:</span>
                      <span className="font-mono text-emerald-400 truncate max-w-[150px]">
                        {pixKey || 'Não cadastrada'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Tatame:</span>
                      <span className="text-white font-bold">
                        {tatamiAreaM2} m² ({studentCapacity} alunos)
                      </span>
                    </div>
                  </div>
                </div>

                {/* SaaS Master License Badge */}
                <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                      <Sparkles size={11} /> Licenciamento SaaS Master
                    </span>
                    <span className="text-[10px] font-mono font-bold text-white bg-amber-950 px-2 py-0.5 rounded-full border border-amber-800">
                      R$ 130 + R$ 1,30/aluno
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Acesso completo ao Painel Web, Simulador PWA, Chamada Facial por Foto IA (Gemini Vision), BJJ AI Coach, CRM de Captação e Voz de Tatame.
                  </p>
                </div>

                {/* Submit button */}
                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-amber-600 to-yellow-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-sm shadow-xl shadow-red-950/60 flex items-center justify-center gap-2 transition hover:scale-[1.01]"
                  >
                    <CheckCheck size={18} />
                    <span>{editingAcademyId ? 'Salvar Alterações da Filial' : 'Cadastrar e Ativar Academia'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white text-xs font-bold transition"
                  >
                    Limpar Formulário
                  </button>
                </div>

                {/* Licensing terms */}
                <div className="text-[10px] text-slate-400 leading-relaxed border-t border-slate-800 pt-3">
                  🛡️ <strong>Garantia BJJ Academy:</strong> Ao registrar uma filial, você concorda com o regulamento técnico CBJJ, acesso ao sistema de faixas e integração com o totem de recepção.
                </div>
              </div>

            </div>

          </div>

        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LISTA DE FILIAIS DA REDE                                           */}
      {/* ========================================================================= */}
      {activeTab === 'list' && (
        <div className="space-y-4">

          {/* Search & State Filter Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome, cidade, CNPJ ou professor responsável..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              <select
                value={selectedStateFilter}
                onChange={(e) => setSelectedStateFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white font-semibold focus:border-red-500 focus:outline-none"
              >
                <option value="ALL">Todos os Estados</option>
                {BRAZIL_STATES.map((uf) => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => {
                  handleResetForm();
                  setActiveTab('form');
                }}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-red-950 whitespace-nowrap"
              >
                <Plus size={14} />
                <span>Nova Filial</span>
              </button>
            </div>
          </div>

          {/* Academies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAcademies.map((acad) => {
              const isActive = acad.id === activeAcademy.id;
              const logo = PRESET_LOGOS.find(l => l.id === acad.logoPresetId) || PRESET_LOGOS[0];

              return (
                <div
                  key={acad.id}
                  className={`p-5 rounded-3xl border transition flex flex-col justify-between gap-4 ${
                    isActive
                      ? 'bg-slate-900/95 border-amber-500/80 shadow-xl shadow-amber-950/30 ring-1 ring-amber-500/40'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${logo.bg} flex items-center justify-center text-2xl shadow-md shrink-0`}>
                          {logo.icon}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-black text-white truncate">
                            {acad.name}
                          </h4>
                          <div className="text-xs text-amber-400 font-bold truncate">
                            {acad.branch || 'Matriz'}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin size={10} className="text-red-400" />
                            <span>{acad.city}, {acad.state}</span>
                          </div>
                        </div>
                      </div>

                      {isActive && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 shrink-0">
                          ATIVA
                        </span>
                      )}
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Head Coach:</span>
                        <strong className="text-slate-200 truncate max-w-[150px]">
                          {acad.headInstructor}
                        </strong>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Alunos no App:</span>
                        <span className="text-emerald-400 font-bold font-mono">
                          {acad.activeStudentsCount} alunos
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Chave PIX:</span>
                        <span className="text-slate-300 font-mono text-[10px] truncate max-w-[140px]">
                          {acad.pixKey}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">CNPJ:</span>
                        <span className="text-slate-400 font-mono text-[10px]">
                          {acad.cnpj}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditAcademy(acad)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1 transition"
                      title="Editar academia"
                    >
                      <Edit3 size={13} />
                      <span>Editar</span>
                    </button>

                    {!isActive ? (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectActiveAcademy(acad);
                          confetti({ particleCount: 40, spread: 50 });
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-amber-600 hover:text-white text-amber-300 font-bold text-xs text-center transition"
                      >
                        Tornar Unidade Ativa
                      </button>
                    ) : (
                      <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                        <Check size={14} />
                        Unidade Selecionada
                      </span>
                    )}

                    {onDeleteAcademy && academies.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Excluir a academia ${acad.name}?`)) {
                            onDeleteAcademy(acad.id);
                          }
                        }}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 transition"
                        title="Excluir filial"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: REPASSES À PLATAFORMA & GESTOR GERAL                               */}
      {/* ========================================================================= */}
      {activeTab === 'repasses' && (
        <div className="space-y-5">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-2xl shadow-lg">
                  🛡️
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Gestor Geral da Rede BJJ Academy
                  </h3>
                  <p className="text-xs text-slate-400">
                    Messias Batista da Silva junior • Chave PIX oficial para repasses e suporte
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyGeneralManagerPix}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-md shadow-emerald-950 self-start sm:self-auto"
              >
                <Copy size={14} />
                <span>{copiedPixKey ? '✓ Chave Copiada!' : 'Copiar PIX do Gestor'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400 font-bold mb-1">Nome Completo</div>
                <div className="text-sm font-black text-white">{generalManager.name}</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400 font-bold mb-1">Chave PIX da Plataforma</div>
                <div className="text-sm font-black text-emerald-400 font-mono truncate">{generalManager.pixKey}</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400 font-bold mb-1">Telefone / WhatsApp</div>
                <div className="text-sm font-black text-white font-mono">{generalManager.phone}</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 leading-relaxed">
              🥋 Cada filial cadastrada possui licença operacional no app móvel, painel de professor para chamada, cronômetro CBJJ e controle financeiro de mensalidades. Os repasses da taxa mensal de sistema são liquidados diretamente via PIX para o Gestor Geral.
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
