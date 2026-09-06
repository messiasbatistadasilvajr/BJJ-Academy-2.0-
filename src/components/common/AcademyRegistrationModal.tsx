import React, { useState, useMemo } from 'react';
import { 
  X, Building2, Plus, Search, MapPin, Phone, Mail, UserCheck, 
  DollarSign, ShieldCheck, Sparkles, Check, CheckCircle2, AlertCircle, 
  Trash2, Edit3, Volume2, Play, QrCode, Copy, ArrowRight, ExternalLink,
  Percent, Award, Users, Compass, Eye, Filter, Sliders, RefreshCw
} from 'lucide-react';
import { 
  RegisteredAcademy, AcademyVoiceStyle, NotificationFormat, 
  ChimeType, PlatformGeneralManager, AcademyPricingPlan 
} from '../../types';
import { defaultPlatformGeneralManager } from '../../data/mockData';
import { academyVoiceEngine } from '../../utils/voiceNotification';
import { formatBRL } from '../../utils/financialCalculations';

interface AcademyRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  academies: RegisteredAcademy[];
  activeAcademy: RegisteredAcademy;
  onSelectActiveAcademy: (academy: RegisteredAcademy) => void;
  onAddAcademy: (academy: RegisteredAcademy) => void;
  onUpdateAcademy: (academy: RegisteredAcademy) => void;
  onDeleteAcademy?: (academyId: string) => void;
  generalManager?: PlatformGeneralManager;
  onOpenVoiceNotice?: (title: string, body: string) => void;
}

// Preset logos or martial shields
const PRESET_LOGOS = [
  { 
    id: 'loyalty_official', 
    label: 'Loyalty Jiu-Jitsu', 
    icon: '/loyalty_logo.jpg', 
    isCustomImage: true, 
    bg: 'from-slate-950 via-slate-900 to-black',
    badge: 'MM XXIII'
  },
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

export const AcademyRegistrationModal: React.FC<AcademyRegistrationModalProps> = ({
  isOpen,
  onClose,
  academies,
  activeAcademy,
  onSelectActiveAcademy,
  onAddAcademy,
  onUpdateAcademy,
  onDeleteAcademy,
  generalManager = defaultPlatformGeneralManager,
  onOpenVoiceNotice
}) => {
  // Navigation tabs: 'list' (Academias Cadastradas) | 'form' (Formulário de Cadastro/Edição) | 'repasses' (Repasses Gestor Geral)
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

  // Form State: 6. Notificações com Voz (Estilo Mercado Livre)
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceStyle, setVoiceStyle] = useState<AcademyVoiceStyle>('mercado_livre');
  const [notificationFormat, setNotificationFormat] = useState<NotificationFormat>('name_and_title');
  const [chimeType, setChimeType] = useState<ChimeType>('mercado_livre');
  const [customPhrasePrefix, setCustomPhrasePrefix] = useState('');
  const [speechRate, setSpeechRate] = useState<number>(1.05);
  const [speechPitch, setSpeechPitch] = useState<number>(1.12);

  // Form Feedback
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [copiedGmPix, setCopiedGmPix] = useState(false);

  if (!isOpen) return null;

  // Mask helpers
  const handleCnpjChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 14);
    let formatted = raw;
    if (raw.length > 2) formatted = `${raw.slice(0, 2)}.${raw.slice(2)}`;
    if (raw.length > 5) formatted = `${formatted.slice(0, 6)}.${raw.slice(5)}`;
    if (raw.length > 8) formatted = `${formatted.slice(0, 10)}/${raw.slice(8)}`;
    if (raw.length > 12) formatted = `${formatted.slice(0, 15)}-${raw.slice(12)}`;
    setCnpj(formatted);
  };

  const handleCepChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 8);
    let formatted = raw;
    if (raw.length > 5) formatted = `${raw.slice(0, 5)}-${raw.slice(5)}`;
    setCep(formatted);
  };

  const handlePhoneChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 11);
    let formatted = raw;
    if (raw.length > 0) formatted = `(${raw.slice(0, 2)}`;
    if (raw.length > 2) formatted = `${formatted}) ${raw.slice(2, 7)}`;
    if (raw.length > 7) formatted = `${formatted}-${raw.slice(7)}`;
    setPhone(formatted);
  };

  // CEP Autocomplete Simulation / Fast filler
  const handleFetchCep = async () => {
    const raw = cep.replace(/\D/g, '');
    if (raw.length !== 8) {
      setFormErrorMessage('Digite um CEP válido com 8 dígitos para consultar.');
      setTimeout(() => setFormErrorMessage(null), 3000);
      return;
    }

    setIsCepLoading(true);
    setFormErrorMessage(null);

    try {
      // Attempt quick Viacep lookup
      const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
      if (res.ok) {
        const data = await res.json();
        if (!data.erro) {
          setAddress(data.logradouro || '');
          setNeighborhood(data.bairro || '');
          setCity(data.localidade || city);
          setState(data.uf || state);
          setIsCepLoading(false);
          return;
        }
      }
    } catch {
      // Fallback local if offline/network restriction
    }

    // Friendly fallback
    setAddress('Avenida Principal do Tatame, 1000');
    setNeighborhood('Centro');
    setCity('São Paulo');
    setState('SP');
    setIsCepLoading(false);
  };

  // Pre-populate default voice phrase prefix when name changes
  const handleNameBlur = () => {
    if (name && !customPhrasePrefix) {
      setCustomPhrasePrefix(`${shortName || name} avisa`);
    }
  };

  // Test voice in tatame
  const handleTestVoice = () => {
    const previewAcademy: RegisteredAcademy = {
      id: 'preview',
      name: name || 'BJJ Academy Nova Unidade',
      shortName: shortName || name || 'BJJ Nova Unidade',
      branch: branch || 'Nova Filial',
      city: `${city} - ${state}`,
      phone: phone || '(11) 99999-9999',
      voiceEnabled,
      voiceStyle,
      notificationFormat,
      chimeType,
      speechRate,
      speechPitch,
      customPhrasePrefix: customPhrasePrefix || `${shortName || name || 'Academia'} informa`,
    };

    academyVoiceEngine.announceAcademyMessage(
      previewAcademy,
      '🥋 Tatame Conectado!',
      'Check-in realizado com sucesso e áudio calibrado para os treinos.'
    );
  };

  // Reset form to blank
  const handleResetForm = () => {
    setEditingAcademyId(null);
    setName('');
    setShortName('');
    setBranch('');
    setCnpj('');
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
    setVoiceEnabled(true);
    setVoiceStyle('mercado_livre');
    setNotificationFormat('name_and_title');
    setChimeType('mercado_livre');
    setCustomPhrasePrefix('');
    setSpeechRate(1.05);
    setSpeechPitch(1.12);
    setFormErrorMessage(null);
    setFormSuccessMessage(null);
  };

  // Load an existing academy into form for editing
  const handleEditAcademy = (acad: RegisteredAcademy) => {
    setEditingAcademyId(acad.id);
    setName(acad.name);
    setShortName(acad.shortName);
    setBranch(acad.branch);
    setCnpj(acad.cnpj || '');
    setCep(acad.cep || '');
    setAddress(acad.address || '');
    setNeighborhood(acad.neighborhood || '');
    
    // Split city and state if in "Cidade - UF" format
    if (acad.city.includes('-')) {
      const parts = acad.city.split('-');
      setCity(parts[0].trim());
      setState(parts[1].trim());
    } else {
      setCity(acad.city);
      setState(acad.state || 'SP');
    }

    setPhone(acad.phone);
    setEmail(acad.email || '');
    setHeadInstructor(acad.headInstructor || '');
    setCrefNumber(acad.crefNumber || '');
    setStudentCapacity(acad.studentCapacity || 200);
    setTatamiAreaM2(acad.tatamiAreaM2 || 140);
    setPixKey(acad.pixKey || '');
    setPixKeyType(acad.pixKeyType || 'cnpj');
    setBankAccount(acad.bankAccount || '');
    setDefaultFinePercent(acad.defaultFinePercent ?? 2.0);
    setDefaultMonthlyInterestPercent(acad.defaultMonthlyInterestPercent ?? 1.0);
    setMonthlyRevenueTarget(acad.monthlyRevenueTarget || 50000);
    setPlatformPlan(acad.platformPlan || 'pro');
    setVoiceEnabled(acad.voiceEnabled);
    setVoiceStyle(acad.voiceStyle);
    setNotificationFormat(acad.notificationFormat);
    setChimeType(acad.chimeType);
    setCustomPhrasePrefix(acad.customPhrasePrefix || '');
    setSpeechRate(acad.speechRate);
    setSpeechPitch(acad.speechPitch);

    setActiveTab('form');
  };

  // Handle Form Submission
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setFormErrorMessage('Por favor, informe a Razão Social ou Nome Oficial da Academia.');
      return;
    }
    if (!shortName.trim()) {
      setFormErrorMessage('Por favor, informe o Nome Fantasia / Apelido no App.');
      return;
    }
    if (!branch.trim()) {
      setFormErrorMessage('Por favor, identifique a Unidade ou Filial (ex: Unidade 01 - Centro).');
      return;
    }
    if (!phone.trim()) {
      setFormErrorMessage('Informe o telefone ou WhatsApp de atendimento da academia.');
      return;
    }

    // Generate standard pricing plans for this academy if not existing
    const generatedPricingPlans: AcademyPricingPlan[] = [
      {
        id: `plan_${Date.now()}_1`,
        name: 'Mensal Livre Tatame',
        periodMonths: 1,
        price: 250.00,
        monthlyEquivalent: 250.00,
        description: `Acesso livre a todos os horários e treinos na unidade ${shortName.trim()}.`,
        isPopular: true
      },
      {
        id: `plan_${Date.now()}_3`,
        name: 'Trimestral Fidelidade',
        periodMonths: 3,
        price: 690.00,
        monthlyEquivalent: 230.00,
        description: 'Desconto trimestral com acesso ilimitado ao tatame.'
      },
      {
        id: `plan_${Date.now()}_12`,
        name: 'Anual Black Belt Club',
        periodMonths: 12,
        price: 2520.00,
        monthlyEquivalent: 210.00,
        description: 'Plano anual com maior economia e brinde exclusivo da academia.'
      },
      {
        id: `plan_${Date.now()}_kids`,
        name: 'Kids Tatame Disciplina',
        periodMonths: 1,
        price: 190.00,
        monthlyEquivalent: 190.00,
        description: 'Aulas para crianças e jovens com foco em respeito e defesa pessoal.'
      }
    ];

    const academyData: RegisteredAcademy = {
      id: editingAcademyId || `acad_${Date.now()}`,
      name: name.trim(),
      shortName: shortName.trim(),
      branch: branch.trim(),
      city: `${city.trim()} - ${state.trim()}`,
      state: state.trim(),
      cnpj: cnpj.trim() || undefined,
      cep: cep.trim() || undefined,
      address: address.trim() || undefined,
      neighborhood: neighborhood.trim() || undefined,
      phone: phone.trim(),
      email: email.trim() || undefined,
      headInstructor: headInstructor.trim() || undefined,
      crefNumber: crefNumber.trim() || undefined,
      studentCapacity: studentCapacity || 200,
      tatamiAreaM2: tatamiAreaM2 || 140,
      voiceEnabled,
      voiceStyle,
      notificationFormat,
      chimeType,
      speechRate,
      speechPitch,
      customPhrasePrefix: customPhrasePrefix.trim() || `${shortName.trim()} avisa`,
      defaultFinePercent,
      defaultMonthlyInterestPercent,
      pixKey: pixKey.trim() || undefined,
      pixKeyType,
      bankAccount: bankAccount.trim() || undefined,
      monthlyRevenueTarget,
      status: 'active',
      platformPlan,
      createdAt: editingAcademyId ? undefined : new Date().toLocaleDateString('pt-BR'),
      pricingPlans: generatedPricingPlans
    };

    if (editingAcademyId) {
      onUpdateAcademy(academyData);
      setFormSuccessMessage(`✓ Academia "${academyData.shortName}" atualizada com sucesso!`);
    } else {
      onAddAcademy(academyData);
      setFormSuccessMessage(`✓ Nova academia "${academyData.shortName}" cadastrada com sucesso!`);
      // Select as active
      onSelectActiveAcademy(academyData);
    }

    // Voice announcement
    if (onOpenVoiceNotice) {
      onOpenVoiceNotice(
        `🥋 Academia ${academyData.shortName} Cadastrada!`,
        `A unidade ${academyData.branch} foi inserida com sucesso no ecossistema BJJ ACADEMY.`
      );
    }

    setTimeout(() => {
      setFormSuccessMessage(null);
      handleResetForm();
      setActiveTab('list');
    }, 1800);
  };

  // Copy GM Pix
  const handleCopyGmPix = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(generalManager.pixKey);
    }
    setCopiedGmPix(true);
    setTimeout(() => setCopiedGmPix(false), 2200);
  };

  // Filtered academies for list
  const filteredAcademies = useMemo(() => {
    return academies.filter(a => {
      const matchSearch = 
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.city.toLowerCase().includes(searchTerm.toLowerCase());

      const matchState = 
        selectedStateFilter === 'ALL' || 
        a.city.toUpperCase().includes(`- ${selectedStateFilter}`) ||
        a.state === selectedStateFilter;

      return matchSearch && matchState;
    });
  }, [academies, searchTerm, selectedStateFilter]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[92vh] rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 p-0.5 shadow-lg flex items-center justify-center text-white text-xl shrink-0">
              🏛️
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-white tracking-tight">
                  Cadastro & Gestão de Novas Academias
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Rede BJJ ACADEMY 2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Cadastre novas filiais, configure dados fiscais, PIX da academia e voz de tatame personalizada.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SUB-HEADER / GESTOR GERAL BANNER */}
        <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldCheck size={14} className="text-amber-400 shrink-0" />
            <span>
              <strong>Gestor Geral Responsável:</strong> <span className="text-white font-bold">{generalManager.name}</span> (CPF: <span className="font-mono text-slate-300">{generalManager.formattedCpf || generalManager.cpf}</span>)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-slate-800 text-emerald-400 px-2 py-0.5 rounded-md font-mono font-bold">
              PIX Plataforma: {generalManager.pixKey}
            </span>
            <button
              type="button"
              onClick={handleCopyGmPix}
              className="text-[10px] text-slate-400 hover:text-white underline font-semibold"
            >
              {copiedGmPix ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="px-4 pt-3 pb-1 bg-slate-900 border-b border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              setActiveTab('form');
              if (!editingAcademyId) handleResetForm();
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
              activeTab === 'form'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-slate-850 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Plus size={14} />
            <span>{editingAcademyId ? 'Editar Academia' : 'Cadastrar Nova Academia'}</span>
          </button>

          <button
            onClick={() => setActiveTab('list')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
              activeTab === 'list'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-850 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 size={14} />
            <span>Academias Cadastradas ({academies.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('repasses')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
              activeTab === 'repasses'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-850 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <DollarSign size={14} />
            <span>Repasses à Plataforma</span>
          </button>
        </div>

        {/* BODY CONTENT SCROLLABLE */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* SUCCESS OR ERROR ALERTS */}
          {formSuccessMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-600 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>{formSuccessMessage}</span>
            </div>
          )}

          {formErrorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-950/80 border border-red-600 text-red-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle size={16} className="text-red-400 shrink-0" />
              <span>{formErrorMessage}</span>
            </div>
          )}

          {/* TAB 1: FORMULÁRIO DE CADASTRO / EDIÇÃO */}
          {activeTab === 'form' && (
            <form onSubmit={handleSubmitForm} className="space-y-6">
              
              {/* Box 1: Identidade da Academia */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-850/90 border border-slate-750 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-750 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🥋</span>
                    <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                      1. Identidade & Dados Cadastrais
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">Campos com * obrigatórios</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                      Razão Social / Nome Oficial da Academia *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={handleNameBlur}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-semibold focus:border-red-500 focus:outline-none"
                      placeholder="Ex: Gracie Barra Alphaville ou Alliance Campinas"
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
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-semibold focus:border-red-500 focus:outline-none"
                      placeholder="Ex: GB Alphaville ou Alliance Campinas"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                      Unidade / Filial *
                    </label>
                    <input
                      type="text"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-semibold focus:border-red-500 focus:outline-none"
                      placeholder="Ex: Unidade 01 - Centro ou Filial Shopping"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                      CNPJ da Unidade (Opcional / Formatação automática)
                    </label>
                    <input
                      type="text"
                      value={cnpj}
                      onChange={(e) => handleCnpjChange(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono focus:border-red-500 focus:outline-none"
                      placeholder="00.000.000/0001-00"
                    />
                  </div>
                </div>

                {/* Seletor de Brasão / Logo */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-300 mb-2">
                    Brasão / Identidade Visual da Academia no Tatame
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                    {PRESET_LOGOS.map((logo) => (
                      <button
                        type="button"
                        key={logo.id}
                        onClick={() => setSelectedLogoPreset(logo.id)}
                        className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
                          selectedLogoPreset === logo.id
                            ? 'bg-slate-800 border-amber-500 ring-2 ring-amber-500/50 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${logo.bg} flex items-center justify-center text-base shadow overflow-hidden p-1`}>
                          {logo.isCustomImage ? (
                            <img src={logo.icon} alt={logo.label} className="w-full h-full object-contain rounded" referrerPolicy="no-referrer" />
                          ) : (
                            logo.icon
                          )}
                        </div>
                        <span className="text-[10px] font-bold truncate max-w-full">{logo.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Box 2: Endereço & Localização com Busca Rápida de CEP */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-850/90 border border-slate-750 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-750 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📍</span>
                    <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                      2. Localização & Endereço Completo
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-400">Preenchimento via CEP</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                      CEP
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={cep}
                        onChange={(e) => handleCepChange(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                        placeholder="01415-000"
                      />
                      <button
                        type="button"
                        onClick={handleFetchCep}
                        disabled={isCepLoading}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-bold shrink-0 transition flex items-center gap-1"
                      >
                        {isCepLoading ? <RefreshCw size={12} className="animate-spin" /> : 'Buscar'}
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                      Logradouro (Rua, Avenida, Número e Complemento)
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                      placeholder="Ex: Rua Oscar Freire, 1200 - Conjunto 401"
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
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                      placeholder="Ex: Cerqueira César"
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
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-bold"
                      placeholder="Ex: São Paulo, Campinas, Curitiba"
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
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-bold"
                    >
                      {BRAZIL_STATES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Box 3: Contato & Mestre Responsável */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-850/90 border border-slate-750 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-750 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🥋</span>
                    <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                      3. Contatos & Instrutor Responsável
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                      WhatsApp / Telefone da Recepção *
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono"
                      placeholder="(11) 98765-4321"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                      E-mail Administrativo da Academia
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                      placeholder="contato@minhaacademia.com.br"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                      Faixa Preta Responsável / Head Coach
                    </label>
                    <input
                      type="text"
                      value={headInstructor}
                      onChange={(e) => setHeadInstructor(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-semibold"
                      placeholder="Ex: Mestre Rodrigo Cavalo (4º Grau)"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                      Registro CREF / CBJJ do Responsável
                    </label>
                    <input
                      type="text"
                      value={crefNumber}
                      onChange={(e) => setCrefNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono"
                      placeholder="Ex: CREF 098765-G/SP • CBJJ 14220"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                      Capacidade Máxima de Alunos no Sistema
                    </label>
                    <input
                      type="number"
                      value={studentCapacity}
                      onChange={(e) => setStudentCapacity(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono"
                      min={10}
                      max={2000}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                      Área de Tatame (m²)
                    </label>
                    <input
                      type="number"
                      value={tatamiAreaM2}
                      onChange={(e) => setTatamiAreaM2(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono"
                      min={20}
                      max={1000}
                    />
                  </div>
                </div>
              </div>

              {/* Box 4: Configurações Financeiras & PIX da Academia (Para cobrança de alunos) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-850/90 border border-slate-750 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-750 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💰</span>
                    <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                      4. Cobrança de Alunos & Financeiro da Unidade
                    </h3>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold">PIX Direto na Conta da Academia</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                      Tipo de Chave PIX da Academia
                    </label>
                    <select
                      value={pixKeyType}
                      onChange={(e) => setPixKeyType(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-bold"
                    >
                      <option value="cnpj">CNPJ</option>
                      <option value="cpf">CPF</option>
                      <option value="email">E-mail</option>
                      <option value="phone">Telefone</option>
                      <option value="random">Chave Aleatória (EVP)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                      Chave PIX da Academia (Onde alunos pagam mensalidade)
                    </label>
                    <input
                      type="text"
                      value={pixKey}
                      onChange={(e) => setPixKey(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-emerald-400 font-mono font-bold"
                      placeholder="Ex: financeiro@academia.com.br ou CNPJ"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                      Multa Padrão por Atraso de Alunos (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={defaultFinePercent}
                      onChange={(e) => setDefaultFinePercent(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Padrão nacional: 2.0%</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                      Juros Mensais por Atraso (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={defaultMonthlyInterestPercent}
                      onChange={(e) => setDefaultMonthlyInterestPercent(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Padrão legal: 1.0% ao mês (0.0333% ao dia)</span>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                      Dados Bancários da Academia (Banco, Agência, Conta Corrente)
                    </label>
                    <input
                      type="text"
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 font-mono"
                      placeholder="Ex: Banco Itaú (341) Ag 1234 CC 56789-0 - Titular: Gracie Barra Ltda"
                    />
                  </div>
                </div>
              </div>

              {/* Box 5: Plano na Plataforma Central & Repasse ao Gestor Geral */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-950/30 via-slate-850 to-slate-850 border border-amber-500/40 space-y-4">
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🏛️</span>
                    <h3 className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wider">
                      5. Licenciamento na Plataforma BJJ ACADEMY
                    </h3>
                  </div>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-bold">
                    Repasse ao Gestor Geral
                  </span>
                </div>

                {/* Seleção do Plano da Plataforma */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'basic', name: 'Plano Básico', price: 150, desc: 'Até 80 alunos • Gestão de aulas e frequência' },
                    { id: 'pro', name: 'Plano Profissional', price: 250, desc: 'Até 250 alunos • Totem Catraca • Voz de Tatame', popular: true },
                    { id: 'enterprise', name: 'Plano Enterprise', price: 450, desc: 'Ilimitado • Multi-Tatames • Integração Asaas Master' },
                  ].map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setPlatformPlan(p.id as any)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                        platformPlan === p.id
                          ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/50'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-white">{p.name}</span>
                          {p.popular && (
                            <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded">
                              RECOMENDADO
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">{p.desc}</p>
                      </div>
                      <div className="mt-3 text-base font-black text-amber-400 font-mono">
                        {formatBRL(p.price)}<span className="text-[10px] text-slate-400 font-normal">/mês</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Card de Repasse ao Gestor Geral */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                      Favorecido dos Repasses da Plataforma:
                    </div>
                    <div className="text-sm font-black text-white">{generalManager.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      CPF: {generalManager.formattedCpf || generalManager.cpf} • Chave PIX: <span className="text-emerald-400 font-bold">{generalManager.pixKey}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyGmPix}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-emerald-400 text-xs font-bold flex items-center gap-1.5 shrink-0 transition border border-emerald-900/40"
                  >
                    <Copy size={13} />
                    <span>{copiedGmPix ? 'Chave Copiada!' : `Copiar PIX: ${generalManager.pixKey}`}</span>
                  </button>
                </div>
              </div>

              {/* Box 6: Voz da Academia no Tatame (Estilo Mercado Livre) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-850/90 border border-slate-750 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-750 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📢</span>
                    <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                      6. Voz Personalizada da Academia (Estilo Mercado Livre)
                    </h3>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={voiceEnabled}
                      onChange={(e) => setVoiceEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                    />
                    <span className="font-bold text-white">Ativar Voz</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                      Estilo da Voz
                    </label>
                    <select
                      value={voiceStyle}
                      onChange={(e) => setVoiceStyle(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-bold"
                    >
                      <option value="mercado_livre">Estilo Mercado Livre (Dinâmica & Assertiva)</option>
                      <option value="tatame_master">Mestre do Tatame (Grave & Solene)</option>
                      <option value="energetic">Energética & Competição</option>
                      <option value="gentle">Suave & Kids</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                      Jingle / Toque de Abertura
                    </label>
                    <select
                      value={chimeType}
                      onChange={(e) => setChimeType(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-bold"
                    >
                      <option value="mercado_livre">Jingle Mercado Livre BJJ (3 notas)</option>
                      <option value="tatame_bell">Sino do Tatame (Gong Marcial)</option>
                      <option value="chime_bright">Toque Moderno Cristal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                      Frase de Abertura da Academia
                    </label>
                    <input
                      type="text"
                      value={customPhrasePrefix}
                      onChange={(e) => setCustomPhrasePrefix(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                      placeholder="Ex: Gracie Barra Alphaville avisa"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleTestVoice}
                    className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-2 transition"
                  >
                    <Play size={13} />
                    <span>Testar Voz com Nome da Academia</span>
                  </button>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                {editingAcademyId && (
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold"
                  >
                    Cancelar Edição e Limpar
                  </button>
                )}

                <div className="flex items-center gap-3 w-full sm:w-auto sm:ml-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold"
                  >
                    Fechar
                  </button>

                  <button
                    type="submit"
                    className="flex-1 sm:flex-initial px-8 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-sm shadow-xl shadow-red-950 flex items-center justify-center gap-2 transition"
                  >
                    <Check size={16} />
                    <span>{editingAcademyId ? 'Salvar Alterações da Academia' : 'Cadastrar e Ativar Academia'}</span>
                  </button>
                </div>
              </div>

            </form>
          )}

          {/* TAB 2: LISTA DE ACADEMIAS CADASTRADAS (MULTI-UNIDADES) */}
          {activeTab === 'list' && (
            <div className="space-y-5">
              
              {/* Top Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nome, filial ou cidade..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedStateFilter}
                    onChange={(e) => setSelectedStateFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2 text-xs text-white font-bold"
                  >
                    <option value="ALL">Todos os Estados</option>
                    {BRAZIL_STATES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => {
                      handleResetForm();
                      setActiveTab('form');
                    }}
                    className="px-4 py-2 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md shrink-0 transition"
                  >
                    <Plus size={14} /> Cadastrar Nova
                  </button>
                </div>
              </div>

              {/* Academies Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAcademies.map((acad) => {
                  const isActive = activeAcademy.id === acad.id;

                  return (
                    <div
                      key={acad.id}
                      className={`p-5 rounded-3xl border transition flex flex-col justify-between gap-4 ${
                        isActive
                          ? 'bg-gradient-to-br from-slate-850 via-slate-900 to-slate-900 border-amber-500/80 ring-2 ring-amber-500/30 shadow-xl'
                          : 'bg-slate-850/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700 flex items-center justify-center text-xl shadow-md shrink-0 overflow-hidden p-1">
                              {acad.logo ? (
                                <img src={acad.logo} alt={acad.name} className="w-full h-full object-contain rounded-xl" referrerPolicy="no-referrer" />
                              ) : (
                                '🥋'
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-black text-white">{acad.name}</h4>
                                {isActive && (
                                  <span className="px-2 py-0.2 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[9px] font-black tracking-wide">
                                    ATIVA NO MOMENTO
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-amber-400 font-bold">{acad.branch}</span>
                            </div>
                          </div>

                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 shrink-0">
                            {acad.city}
                          </span>
                        </div>

                        {/* Details List */}
                        <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800/80">
                            <span className="text-[9px] text-slate-500 uppercase font-bold block">WhatsApp</span>
                            <span className="font-mono font-semibold text-white">{acad.phone}</span>
                          </div>

                          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800/80">
                            <span className="text-[9px] text-slate-500 uppercase font-bold block">Chave PIX</span>
                            <span className="font-mono text-emerald-400 truncate block font-bold" title={acad.pixKey}>
                              {acad.pixKey || 'Não configurada'}
                            </span>
                          </div>

                          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800/80">
                            <span className="text-[9px] text-slate-500 uppercase font-bold block">Multa & Juros</span>
                            <span className="font-semibold text-white">
                              {acad.defaultFinePercent ?? 2}% + {acad.defaultMonthlyInterestPercent ?? 1}% a.m.
                            </span>
                          </div>

                          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800/80">
                            <span className="text-[9px] text-slate-500 uppercase font-bold block">Voz no Tatame</span>
                            <span className="font-semibold text-white flex items-center gap-1">
                              <Volume2 size={11} className={acad.voiceEnabled ? 'text-amber-400' : 'text-slate-500'} />
                              {acad.voiceEnabled ? acad.voiceStyle : 'Desativada'}
                            </span>
                          </div>
                        </div>

                        {/* Mensalidade Plan preview */}
                        {acad.pricingPlans && acad.pricingPlans.length > 0 && (
                          <div className="mt-3 text-[10px] text-slate-400 flex items-center gap-2">
                            <span>Planos ativos:</span>
                            <span className="text-slate-200 font-semibold font-mono">
                              {acad.pricingPlans.map(p => `${p.name} (${formatBRL(p.price)})`).join(' • ')}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Card Action Buttons */}
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEditAcademy(acad)}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition"
                            title="Editar dados cadastrais"
                          >
                            <Edit3 size={12} /> Editar
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              academyVoiceEngine.announceAcademyMessage(
                                acad,
                                `Aviso da ${acad.shortName}`,
                                `Tatame aberto para treino de Jiu-Jitsu. Bom treino!`
                              );
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-amber-300 text-xs font-semibold flex items-center gap-1 transition"
                            title="Ouvir voz da academia"
                          >
                            <Volume2 size={12} /> Testar Áudio
                          </button>

                          {onDeleteAcademy && academies.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Deseja remover a academia "${acad.name}"?`)) {
                                  onDeleteAcademy(acad.id);
                                }
                              }}
                              className="p-1.5 rounded-xl bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-400 text-xs transition"
                              title="Remover filial"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>

                        {!isActive ? (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectActiveAcademy(acad);
                              if (onOpenVoiceNotice) {
                                onOpenVoiceNotice(
                                  `🥋 Academia Selecionada!`,
                                  `Você está operando como ${acad.name} (${acad.branch}).`
                                );
                              }
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition"
                          >
                            <Check size={12} />
                            <span>Tornar Ativa</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-400 font-bold px-2 py-1 bg-emerald-950/50 rounded-lg border border-emerald-900/60">
                            ✓ Em Uso no App
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredAcademies.length === 0 && (
                <div className="py-12 text-center text-slate-400 space-y-3">
                  <div className="text-3xl">🔍</div>
                  <p className="text-sm">Nenhuma academia encontrada com o filtro aplicado.</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedStateFilter('ALL');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                  >
                    Limpar Filtros
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: REPASSES DAS ACADEMIAS AO GESTOR GERAL */}
          {activeTab === 'repasses' && (
            <div className="space-y-5">
              <div className="p-5 rounded-3xl bg-slate-850 border border-amber-500/40 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">
                      Conta Oficial de Repasses BJJ ACADEMY
                    </span>
                    <h3 className="text-base font-black text-white">
                      {generalManager.name} ({generalManager.role})
                    </h3>
                    <p className="text-xs text-slate-400">
                      Mensalidade das filiais pela utilização da plataforma, servidores e módulos de tatame.
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Total Previsto das {academies.length} Academias</span>
                    <div className="text-2xl font-black text-white font-mono">
                      {formatBRL(academies.length * 250)}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                      Chave PIX da Plataforma (CPF):
                    </span>
                    <div className="text-lg font-black text-white font-mono select-all">
                      {generalManager.pixKey}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Titular: <strong>{generalManager.name}</strong> • CPF: {generalManager.formattedCpf || generalManager.cpf}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyGmPix}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-md"
                  >
                    <Copy size={14} />
                    <span>{copiedGmPix ? 'Chave Copiada!' : `Copiar Chave PIX: ${generalManager.pixKey}`}</span>
                  </button>
                </div>
              </div>

              {/* Tabela de Unidades e Repasses */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Status de Repasse Mensal por Unidade Cadastrada
                </h4>

                <div className="space-y-2">
                  {academies.map((acad, idx) => (
                    <div
                      key={acad.id}
                      className="p-4 rounded-2xl bg-slate-850 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-xs text-amber-400">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="text-sm font-black text-white">{acad.name}</div>
                          <div className="text-xs text-slate-400 font-mono">
                            {acad.branch} • {acad.city} • Contato: {acad.phone}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <div className="text-right font-mono">
                          <div className="text-sm font-black text-white">{formatBRL(250.00)}</div>
                          <span className="text-[10px] text-emerald-400 font-bold">Vencimento: Dia 10</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                          ✓ Repasse Registrado
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Rede Ativa: <strong className="text-white">{academies.length} academias</strong> cadastradas</span>
            <span>•</span>
            <span>Unidade Selecionada: <strong className="text-amber-400">{activeAcademy.name}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs transition"
            >
              Fechar Painel
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
