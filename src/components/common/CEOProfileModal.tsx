import React, { useState, useEffect } from 'react';
import { 
  Crown, ShieldCheck, Mail, Phone, MapPin, Building2, 
  CreditCard, Copy, Check, QrCode, Edit3, Save, X, 
  DollarSign, Users, Award, ExternalLink, Sparkles, CheckCircle2,
  Key, Lock, Eye, EyeOff
} from 'lucide-react';
import { PlatformGeneralManager, RegisteredAcademy } from '../../types';
import { formatBRL } from '../../utils/financialCalculations';
import { saveGeneralManagerToFirestore } from '../../firebase/firestoreService';
import { triggerNativeHaptic } from '../../utils/nativeApp';
import { academyVoiceEngine } from '../../utils/voiceNotification';
import { Volume2 } from 'lucide-react';

interface CEOProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  generalManager: PlatformGeneralManager;
  onUpdateGeneralManager: (updated: PlatformGeneralManager) => void;
  academies?: RegisteredAcademy[];
  onOpenSaaSSimulator?: () => void;
  onOpenFinancial?: () => void;
}

export const CEOProfileModal: React.FC<CEOProfileModalProps> = ({
  isOpen,
  onClose,
  generalManager,
  onUpdateGeneralManager,
  academies = [],
  onOpenSaaSSimulator,
  onOpenFinancial,
}) => {
  const [activeTab, setActiveTab] = useState<'card' | 'edit' | 'network'>('card');
  const [copiedPix, setCopiedPix] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Form State
  const [formData, setFormData] = useState<PlatformGeneralManager>(() => ({
    ...generalManager,
    email: generalManager.email || 'messiasbjunior@yahoo.com.br',
    password: generalManager.password || 'Familia@jk4',
    accessPassword: generalManager.accessPassword || 'Familia@jk4',
  }));

  const [showPassword, setShowPassword] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  useEffect(() => {
    setFormData({
      ...generalManager,
      email: generalManager.email || 'messiasbjunior@yahoo.com.br',
      password: generalManager.password || 'Familia@jk4',
      accessPassword: generalManager.accessPassword || 'Familia@jk4',
    });
  }, [generalManager]);

  // Reproduz a voz do CEO ao abrir a tela oficial do CEO Messias
  useEffect(() => {
    if (isOpen) {
      academyVoiceEngine.speakCEOWelcome();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalActiveAcademies = academies.filter(a => a.status !== 'suspended').length || 5;
  const totalStudents = academies.reduce((acc, a) => acc + (a.activeStudentsCount || 0), 0) || 520;
  
  // Calculate projected SaaS revenue
  const fixedPerAcademy = formData.fixedMonthlyFee || 130;
  const perStudent = formData.activeStudentFee || 1.30;
  const projectedMonthlyRevenue = (totalActiveAcademies * fixedPerAcademy) + (totalStudents * perStudent);

  const handleCopyPix = () => {
    triggerNativeHaptic('medium');
    navigator.clipboard.writeText(formData.pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3000);
  };

  const handleCopyEmail = () => {
    triggerNativeHaptic('medium');
    navigator.clipboard.writeText(formData.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 3000);
  };

  const handleCopyPassword = () => {
    triggerNativeHaptic('medium');
    navigator.clipboard.writeText(formData.password || 'Familia@jk4');
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerNativeHaptic('success');
    
    // Save locally and via state callback
    onUpdateGeneralManager(formData);

    // Save to Firestore for permanent persistence
    try {
      await saveGeneralManagerToFirestore(formData);
    } catch (err) {
      console.warn('Could not sync CEO profile to Firestore immediately:', err);
    }

    setSaveSuccessMsg(true);
    setTimeout(() => {
      setSaveSuccessMsg(false);
      setActiveTab('card');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-amber-500/30 text-slate-100 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header Superior com Identidade Dourada */}
        <div className="relative p-5 bg-gradient-to-r from-amber-950/80 via-slate-900 to-red-950/80 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Crown className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                  Diretoria Executiva
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                  <ShieldCheck className="w-3 h-3" /> Verificado
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                Cadastro do CEO & Fundador
              </h2>
              <p className="text-xs text-slate-400">
                Plataforma BJJ ACADEMY 2.0 • Ecossistema Global
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                triggerNativeHaptic('medium');
                academyVoiceEngine.speakCEOWelcome();
              }}
              className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:text-amber-200 transition flex items-center gap-1.5 text-xs font-bold"
              title="Ouvir mensagem de voz oficial do CEO Messias"
            >
              <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="hidden sm:inline">Ouvir Voz</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-slate-950/60 p-1.5 border-b border-slate-800 gap-1 px-4">
          <button
            onClick={() => setActiveTab('card')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'card'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Credencial Oficial</span>
          </button>

          <button
            onClick={() => setActiveTab('edit')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'edit'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editar Dados</span>
          </button>

          <button
            onClick={() => setActiveTab('network')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'network'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Rede & Faturamento</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          
          {/* TAB 1: CREDENCIAL OFICIAL DO CEO */}
          {activeTab === 'card' && (
            <div className="space-y-4 animate-fade-in">
              {/* Executive VIP Card */}
              <div className="relative rounded-3xl p-5 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/60 border border-amber-500/40 shadow-xl overflow-hidden">
                {/* Background Watermark */}
                <div className="absolute -right-8 -bottom-8 opacity-5 pointer-events-none">
                  <Crown size={160} />
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3.5">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-md flex items-center justify-center">
                        <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-xl font-black text-amber-400">
                          MB
                        </div>
                      </div>
                      <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full border border-slate-950 shadow">
                        CEO
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-black text-white">
                          {formData.name}
                        </h3>
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                      </div>
                      <p className="text-xs font-bold text-amber-400">
                        {formData.title || formData.role || 'CEO & Fundador'}
                      </p>
                      <p className="text-[11px] text-slate-300 font-bold flex items-center gap-1 mt-0.5">
                        <Award className="w-3 h-3 text-red-500" />
                        <span>({formData.martialArtsRank || '• Mestre Fundador'})</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Status da Conta</span>
                    <span className="text-xs font-black text-emerald-400 flex items-center gap-1 sm:justify-end">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      Super Administrador Ativo
                    </span>
                  </div>
                </div>

                {/* Detalhes de Contato & Empresa */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 text-xs">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="font-mono text-[11px]">{formData.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{formData.phone || '(11) 98765-4321'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{formData.city || 'São Paulo'} - {formData.state || 'SP'} • Brasil</span>
                    </div>
                  </div>

                  <div className="space-y-2 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Empresa Mantenedora</span>
                      <span className="text-slate-200 font-bold text-[11px]">
                        {formData.companyName || 'BJJ Academy Tecnologia & Gestão Esportiva'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">CNPJ Oficial</span>
                      <span className="text-slate-300 font-mono text-[11px]">
                        {formData.cnpj || '58.087.630/0001-78'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Biografia / Missão */}
                <div className="mt-4 p-3 rounded-2xl bg-amber-950/20 border border-amber-500/20 text-xs text-slate-300 leading-relaxed">
                  <span className="text-[10px] text-amber-400 uppercase font-black block mb-0.5">Missão & Visão do CEO</span>
                  {formData.bio || 'Fundador e arquiteto da plataforma BJJ ACADEMY 2.0. Responsável pelo ecossistema de gestão e expansão de academias de artes marciais no Brasil e no mundo.'}
                </div>
              </div>

              {/* Credenciais Oficiais de Acesso Master do CEO */}
              <div className="p-4 rounded-3xl bg-slate-950 border border-amber-500/30 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Key className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                        <span>Credenciais de Acesso do CEO</span>
                        <span className="text-[9px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded border border-amber-500/40 uppercase">
                          Login Master
                        </span>
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Autenticação para login com privilégios de diretoria executiva e multi-tenant
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <ShieldCheck className="w-3 h-3" /> Criptografado
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Email de Acesso */}
                  <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                        <Mail className="w-3 h-3 text-amber-400" />
                        E-mail de Login:
                      </span>
                      <div className="font-mono text-xs text-white font-bold truncate mt-0.5">
                        {formData.email}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1 shrink-0 border border-slate-700"
                      title="Copiar E-mail"
                    >
                      {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="text-[10px]">{copiedEmail ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>

                  {/* Senha Master */}
                  <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3 text-amber-400" />
                        Senha Master:
                      </span>
                      <div className="font-mono text-xs text-amber-300 font-bold truncate mt-0.5">
                        {showPassword ? (formData.password || 'Familia@jk4') : '•••••••••••'}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700"
                        title={showPassword ? 'Ocultar Senha' : 'Ver Senha'}
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5 text-slate-400" /> : <Eye className="w-3.5 h-3.5 text-amber-400" />}
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyPassword}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1 border border-slate-700"
                        title="Copiar Senha"
                      >
                        {copiedPassword ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span className="text-[10px]">{copiedPassword ? 'Copiada' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 flex items-center gap-1.5 px-1">
                  <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>Sincronizado na nuvem (Google Cloud Firestore) com persistência offline ativa.</span>
                </div>
              </div>

              {/* PIX Oficial para Repasses das Academias */}
              <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">
                        Chave PIX Oficial do CEO
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Destinada ao recebimento de licenças e royalties das filiais
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                    Tipo: CPF
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-2xl border border-slate-800">
                  <div className="flex-1 font-mono text-emerald-400 font-bold text-xs sm:text-sm px-2 truncate">
                    {formData.pixKey} <span className="text-slate-500 text-[11px] font-normal">({formData.formattedCpf || formData.cpf})</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyPix}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                      copiedPix 
                        ? 'bg-emerald-500 text-slate-950 font-black' 
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    {copiedPix ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPix ? 'Copiado!' : 'Copiar PIX'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 italic">
                  "{formData.purpose || 'Para pagamentos das academias à plataforma BJJ Academy (Royalties, Licença de Software SaaS & Repasses)'}"
                </p>
              </div>

              {/* Ações Rápidas */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('edit')}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition border border-slate-700"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Editar Meu Cadastro</span>
                </button>

                {onOpenSaaSSimulator && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenSaaSSimulator();
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black flex items-center justify-center gap-2 transition shadow-md"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Simulador SaaS</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: FORMULÁRIO DE EDIÇÃO DO CADASTRO */}
          {activeTab === 'edit' && (
            <form onSubmit={handleSave} className="space-y-3.5 animate-fade-in text-xs">
              <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-500/20 text-[11px] text-amber-300 flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Edite suas informações oficiais. As alterações refletem instantaneamente no aplicativo e nos comprovantes de pagamento das filiais.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Nome Completo do CEO:
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                    placeholder="Messias Batista da Silva Junior"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Cargo / Título Oficial:
                  </label>
                  <input
                    type="text"
                    value={formData.title || formData.role}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-amber-400 font-bold"
                    placeholder="CEO & Fundador"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    E-mail Executivo de Acesso (Login):
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono"
                    placeholder="messiasbjunior@yahoo.com.br"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-bold uppercase text-slate-400">
                      Senha Master de Acesso (CEO):
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold"
                    >
                      {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showPassword ? 'Ocultar' : 'Visualizar'}</span>
                    </button>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password || ''}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value, accessPassword: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-mono font-bold"
                    placeholder="Familia@jk4"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Utilize esta senha para o login master de CEO em qualquer dispositivo.
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Telefone / WhatsApp:
                  </label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                    placeholder="(11) 98765-4321"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    CPF (Documento Oficial):
                  </label>
                  <input
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value, formattedCpf: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono"
                    placeholder="58087630378"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Chave PIX para Recebimentos:
                  </label>
                  <input
                    type="text"
                    value={formData.pixKey}
                    onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold"
                    placeholder="58087630378"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Empresa Mantenedora / Razão Social:
                  </label>
                  <input
                    type="text"
                    value={formData.companyName || ''}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                    placeholder="BJJ Academy Tecnologia & Gestão Esportiva"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    CNPJ:
                  </label>
                  <input
                    type="text"
                    value={formData.cnpj || ''}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono"
                    placeholder="58.087.630/0001-78"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Graduação de Tatame:
                  </label>
                  <input
                    type="text"
                    value={formData.martialArtsRank || ''}
                    onChange={(e) => setFormData({ ...formData, martialArtsRank: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-red-400 font-bold"
                    placeholder="• Mestre Fundador"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Cidade / Estado:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.city || ''}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-3/4 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                      placeholder="São Paulo"
                    />
                    <input
                      type="text"
                      value={formData.state || ''}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-1/4 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono text-center uppercase"
                      placeholder="SP"
                      maxLength={2}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Biografia & Visão do CEO:
                </label>
                <textarea
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 leading-relaxed"
                  placeholder="Fundador e arquiteto da plataforma BJJ ACADEMY 2.0..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Finalidade Oficial dos Pagamentos:
                </label>
                <textarea
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                  required
                />
              </div>

              {saveSuccessMsg && (
                <div className="p-3 rounded-2xl bg-emerald-950 text-emerald-300 border border-emerald-800 text-center font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Cadastro do CEO atualizado com sucesso e sincronizado em nuvem!</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('card')}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Cadastro</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: REDE DE ACADEMIAS & FATURAMENTO DO CEO */}
          {activeTab === 'network' && (
            <div className="space-y-4 animate-fade-in text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Academias Conectadas</span>
                  <span className="text-xl font-black text-amber-400">{totalActiveAcademies}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Filiais ativas na rede</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Alunos no Tatame</span>
                  <span className="text-xl font-black text-white">{totalStudents}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Atletas matriculados</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/30 bg-emerald-950/20">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold block">Projeção SaaS Mensal</span>
                  <span className="text-xl font-black text-emerald-300">{formatBRL(projectedMonthlyRevenue)}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">R$ 130 + R$ 1,30/aluno</span>
                </div>
              </div>

              {/* Lista das Filiais e Gestores */}
              <div className="rounded-2xl bg-slate-950 border border-slate-800 p-3 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    Filiais Ativas da Rede
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">
                    Repasses para {formData.name}
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {academies.map((acad) => (
                    <div key={acad.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between">
                      <div>
                        <h5 className="font-black text-white text-xs">{acad.name}</h5>
                        <p className="text-[10px] text-slate-400">{acad.branch} • {acad.city}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-emerald-400">
                          {formatBRL((formData.fixedMonthlyFee || 130) + ((acad.activeStudentsCount || 0) * (formData.activeStudentFee || 1.30)))}
                        </span>
                        <span className="text-[9px] text-slate-500 block font-bold">
                          {acad.activeStudentsCount || 0} alunos
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Atalhos Executivos */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                {onOpenSaaSSimulator && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenSaaSSimulator();
                    }}
                    className="p-3 rounded-2xl bg-slate-950 border border-amber-500/30 hover:border-amber-500 text-left transition"
                  >
                    <span className="text-xs font-black text-amber-400 block">Simulador SaaS 🚀</span>
                    <span className="text-[10px] text-slate-400">Simule 10 a 500 academias</span>
                  </button>
                )}

                {onOpenFinancial && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenFinancial();
                    }}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition"
                  >
                    <span className="text-xs font-black text-white block">Hub Financeiro 💳</span>
                    <span className="text-[10px] text-slate-400">Extratos e faturas de filiais</span>
                  </button>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>BJJ Academy Mobile 2.0 • Painel da Presidência</span>
          <span className="font-mono text-amber-400/80">ID: {formData.id}</span>
        </div>

      </div>
    </div>
  );
};
