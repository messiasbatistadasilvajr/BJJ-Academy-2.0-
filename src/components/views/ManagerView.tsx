import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, Users, DollarSign, TrendingUp, AlertTriangle, 
  Bell, Send, Plus, Calendar, Layers, ShieldCheck, 
  Smartphone, Monitor, UserPlus, CheckCircle, Search, 
  Phone, MessageSquare, ArrowUpRight, Zap, RefreshCw,
  Tablet, ShoppingBag, Award, FileText, Trophy, Volume2,
  Lock, Unlock, Calculator, Building2, ShieldAlert, Copy, Check,
  QrCode, CheckCheck, Edit3, Sparkles
} from 'lucide-react';
import { 
  ClassSession, Invoice, Announcement, PushNotification, 
  RegisteredAcademy, FinancialAccessProfile, PlatformGeneralManager, 
  PlatformAcademyPayment 
} from '../../types';
import { defaultPlatformGeneralManager, mockPlatformAcademyPayments } from '../../data/mockData';
import { calculateLateFeeAndInterest, formatBRL } from '../../utils/financialCalculations';

interface ManagerViewProps {
  classes: ClassSession[];
  invoices: Invoice[];
  announcements: Announcement[];
  isDesktopLayout: boolean;
  onToggleDesktopLayout: () => void;
  onSendPushBroadcast: (title: string, body: string, target: 'all' | 'students' | 'parents') => void;
  onOpenCapacitorDocs: () => void;
  onOpenKiosk?: () => void;
  onOpenProShop?: () => void;
  onOpenGraduation?: () => void;
  onOpenContract?: () => void;
  onOpenTournaments?: () => void;
  onOpenVoiceSettings?: () => void;
  onOpenFinancial?: () => void;
  activeAcademyName?: string;
  activeAcademyId?: string;
  academies?: RegisteredAcademy[];
  generalManager?: PlatformGeneralManager;
  onUpdateGeneralManager?: (gm: PlatformGeneralManager) => void;
  onOpenAcademyRegistration?: () => void;
}

export const ManagerView: React.FC<ManagerViewProps> = ({
  classes,
  invoices,
  announcements,
  isDesktopLayout,
  onToggleDesktopLayout,
  onSendPushBroadcast,
  onOpenCapacitorDocs,
  onOpenKiosk,
  onOpenProShop,
  onOpenGraduation,
  onOpenContract,
  onOpenTournaments,
  onOpenVoiceSettings,
  onOpenFinancial,
  activeAcademyName = 'BJJ Academy',
  activeAcademyId = 'acad_bjj_jardins',
  academies = [],
  generalManager = defaultPlatformGeneralManager,
  onUpdateGeneralManager,
  onOpenAcademyRegistration,
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'financeiro' | 'crm' | 'push' | 'academies'>('dashboard');
  
  // Financial RBAC & Filter state inside ManagerView
  const [managerFinancialProfile, setManagerFinancialProfile] = useState<FinancialAccessProfile>('general_manager');
  const [selectedAcademyId, setSelectedAcademyId] = useState<string>('all');
  const [copiedPixId, setCopiedPixId] = useState<string | null>(null);

  // Platform General Manager credentials & state
  const [gmData, setGmData] = useState<PlatformGeneralManager>(generalManager);
  const [copiedPlatformPix, setCopiedPlatformPix] = useState(false);
  const [isEditGmOpen, setIsEditGmOpen] = useState(false);
  const [editName, setEditName] = useState(generalManager.name);
  const [editCpf, setEditCpf] = useState(generalManager.cpf);
  const [editPix, setEditPix] = useState(generalManager.pixKey);
  const [editPurpose, setEditPurpose] = useState(generalManager.purpose);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Platform monthly payments from partner academies
  const [platformPayments, setPlatformPayments] = useState<PlatformAcademyPayment[]>(() => {
    const saved = localStorage.getItem('bjj_platform_payments');
    return saved ? JSON.parse(saved) : mockPlatformAcademyPayments;
  });
  const [selectedPlatformPixItem, setSelectedPlatformPixItem] = useState<PlatformAcademyPayment | null>(null);

  const handleCopyPlatformPix = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(gmData.pixKey);
    }
    setCopiedPlatformPix(true);
    setTimeout(() => setCopiedPlatformPix(false), 2500);
  };

  const handleSaveGeneralManager = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCpf = editCpf.replace(/\D/g, '');
    const formatted = cleanCpf.length === 11 
      ? cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
      : editCpf;

    const updated: PlatformGeneralManager = {
      ...gmData,
      name: editName.trim(),
      cpf: cleanCpf,
      formattedCpf: formatted,
      pixKey: editPix.trim(),
      purpose: editPurpose.trim(),
    };

    setGmData(updated);
    localStorage.setItem('bjj_general_manager', JSON.stringify(updated));
    if (onUpdateGeneralManager) {
      onUpdateGeneralManager(updated);
    }
    setSaveSuccessMsg(true);
    setTimeout(() => {
      setSaveSuccessMsg(false);
      setIsEditGmOpen(false);
    }, 1200);
  };

  const handleMarkPlatformPayment = (id: string, newStatus: 'paid' | 'pending') => {
    const updated = platformPayments.map(p => {
      if (p.id === id) {
        return {
          ...p,
          status: newStatus,
          paidDate: newStatus === 'paid' ? '02/09/2026' : undefined
        };
      }
      return p;
    });
    setPlatformPayments(updated);
    localStorage.setItem('bjj_platform_payments', JSON.stringify(updated));
  };

  // Filter invoices for financeiro tab
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      if (managerFinancialProfile === 'unit_manager') {
        return inv.academyId === activeAcademyId;
      }
      if (selectedAcademyId !== 'all') {
        return inv.academyId === selectedAcademyId;
      }
      return true;
    });
  }, [invoices, managerFinancialProfile, activeAcademyId, selectedAcademyId]);

  // Financial summary metrics
  const financialMetrics = useMemo(() => {
    let paid = 0;
    let pending = 0;
    let overdueOriginal = 0;
    let overdueWithFees = 0;
    let totalFine = 0;
    let totalInterest = 0;

    filteredInvoices.forEach(inv => {
      if (inv.status === 'paid') paid += inv.amount;
      else if (inv.status === 'pending') pending += inv.amount;
      else if (inv.status === 'overdue') {
        overdueOriginal += inv.amount;
        const calc = calculateLateFeeAndInterest(
          inv.amount,
          inv.dueDate,
          new Date(2026, 8, 2),
          inv.lateFeePercent || 2.0,
          (inv.dailyInterestPercent ? inv.dailyInterestPercent * 30 : 1.0)
        );
        totalFine += calc.fineAmount;
        totalInterest += calc.interestAmount;
        overdueWithFees += calc.totalUpdatedAmount;
      }
    });

    return {
      paid,
      pending,
      overdueOriginal,
      overdueWithFees,
      totalFine,
      totalInterest,
      totalCount: filteredInvoices.length
    };
  }, [filteredInvoices]);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState<'all' | 'students' | 'parents'>('all');
  const [broadcastSent, setBroadcastSent] = useState(false);

  // CRM trial leads
  const [leads, setLeads] = useState([
    { id: '1', name: 'Rodrigo Santoro', phone: '(11) 98765-4321', interest: 'Adulto No-Gi', date: 'Hoje 10:15', status: 'Agendado' },
    { id: '2', name: 'Mariana Costa (Mãe do Leo, 7a)', phone: '(11) 97654-3210', interest: 'Kids Manhã', date: 'Hoje 09:30', status: 'Contato Feito' },
    { id: '3', name: 'Guilherme Silva', phone: '(11) 96543-2109', interest: 'Fundamentos Noite', date: 'Ontem', status: 'Matrícula Pendente' },
    { id: '4', name: 'Amanda Torres', phone: '(11) 95432-1098', interest: 'Feminino Defesa', date: '01/09', status: 'Aula Feita' }
  ]);

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastBody.trim()) return;
    onSendPushBroadcast(broadcastTitle.trim(), broadcastBody.trim(), broadcastTarget);
    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastSent(false);
      setBroadcastTitle('');
      setBroadcastBody('');
    }, 2500);
  };

  const totalRevenue = 64890.00;
  const activeStudents = 284;
  const defaultRate = 4.2;

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto pb-20 no-scrollbar">
      {/* Manager Top Bar */}
      <div className="px-5 pt-4 pb-4 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-b border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black shadow-lg">
              🥋
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  {gmData.role}
                </span>
                <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-1.5 py-0.2 rounded-full font-bold flex items-center gap-0.5">
                  <ShieldCheck size={10} /> Verificado
                </span>
              </div>
              <h2 className="text-sm font-black text-white leading-snug">{gmData.name}</h2>
              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                <span>CPF: {gmData.formattedCpf || gmData.cpf}</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">PIX: {gmData.pixKey}</span>
                <button
                  type="button"
                  onClick={() => setIsEditGmOpen(true)}
                  className="text-slate-400 hover:text-amber-300 transition p-0.5"
                  title="Editar Dados do Gestor Geral"
                >
                  <Edit3 size={11} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* New Academy Quick Button */}
            <button
              onClick={onOpenAcademyRegistration}
              className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600/30 to-amber-600/30 hover:from-red-600/50 hover:to-amber-600/50 border border-amber-500/40 text-amber-300 text-[11px] font-bold flex items-center gap-1 transition shadow-sm"
              title="Cadastrar Nova Academia ou Filial"
            >
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">+ Cadastrar Academia</span>
              <span className="sm:hidden">+ Academia</span>
            </button>

            {/* View Mode Toggle Button */}
            <button
              onClick={onToggleDesktopLayout}
              className={`p-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                isDesktopLayout
                  ? 'bg-red-600 border-red-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title={isDesktopLayout ? 'Voltar para Modo Celular' : 'Expandir para Modo Computador (Desktop)'}
            >
              {isDesktopLayout ? <Smartphone className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}
              <span className="text-[10px]">{isDesktopLayout ? 'Celular' : 'Painel PC'}</span>
            </button>

            <button
              onClick={onOpenCapacitorDocs}
              className="p-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-red-400 transition"
              title="Ver Arquitetura Capacitor & Multiplataforma"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {[
            { id: 'dashboard', label: 'Métricas & Tatame', icon: BarChart3 },
            { id: 'financeiro', label: 'Receita & Asaas', icon: DollarSign },
            { id: 'academies', label: `Cadastrar Academia (${academies.length})`, icon: Building2 },
            { id: 'crm', label: 'Novos Leads (CRM)', icon: UserPlus },
            { id: 'push', label: 'Push em Massa', icon: Bell },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 flex items-center gap-1.5 transition ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="p-4 space-y-4">
        {/* 1. DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold">
                  <span>Alunos Ativos</span>
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div className="text-2xl font-black text-white">{activeStudents}</div>
                <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +14 matrículas no mês
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold">
                  <span>Faturamento Mês</span>
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-emerald-400">
                  R$ {(totalRevenue / 1000).toFixed(1)}k
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> 95.8% adimplência
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold">
                  <span>Inadimplência</span>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-white">{defaultRate}%</div>
                <div className="text-[10px] text-amber-400 font-medium">
                  R$ 2.720 em cobrança
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold">
                  <span>Presenças Hoje</span>
                  <CheckCircle className="w-3.5 h-3.5 text-red-400" />
                </div>
                <div className="text-2xl font-black text-white">88</div>
                <div className="text-[10px] text-slate-400">
                  Ocupação média: 82%
                </div>
              </div>
            </div>

            {/* Módulos Operacionais Tatame 2.0 */}
            <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Módulos de Gestão Operacional
                </h4>
                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                  7 Ferramentas Ativas
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onOpenKiosk}
                  className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 flex flex-col items-start gap-1 text-left transition group"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Tablet className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-white mt-1">Totem Recepção</span>
                  <span className="text-[10px] text-slate-400">Modo tablet para catraca</span>
                </button>

                <button
                  onClick={onOpenProShop}
                  className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 flex flex-col items-start gap-1 text-left transition group"
                >
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-white mt-1">Pro-Shop Oficial</span>
                  <span className="text-[10px] text-slate-400">Kimonos, rashguards & vendas</span>
                </button>

                <button
                  onClick={onOpenGraduation}
                  className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 flex flex-col items-start gap-1 text-left transition group"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Award className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-white mt-1">Painel Graduações</span>
                  <span className="text-[10px] text-slate-400">Elegibilidade & certificados</span>
                </button>

                <button
                  onClick={onOpenContract}
                  className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 flex flex-col items-start gap-1 text-left transition group"
                >
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-white mt-1">Contratos & Termos</span>
                  <span className="text-[10px] text-slate-400">Assinaturas e atestados</span>
                </button>
              </div>

              <button
                onClick={onOpenTournaments}
                className="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-amber-400 flex items-center justify-center gap-2 transition"
              >
                <Trophy className="w-4 h-4" />
                <span>Mural de Torneios & Quadro de Medalhas da Academia</span>
              </button>

              <button
                onClick={onOpenVoiceSettings}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-500/20 hover:from-amber-500/30 hover:to-yellow-500/25 border border-amber-500/40 text-xs font-bold text-yellow-300 flex items-center justify-between transition shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-yellow-400 animate-pulse" />
                  <span>Voz da Academia nas Notificações (Estilo Mercado Livre)</span>
                </div>
                <span className="text-[10px] bg-yellow-400/20 text-yellow-300 px-2 py-0.5 rounded-full font-bold">
                  {activeAcademyName}
                </span>
              </button>
            </div>

            {/* Tatame Occupancy Monitor */}
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Ocupação dos Tatames em Tempo Real</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h4>
                <span className="text-[10px] text-slate-400">2 Áreas</span>
              </div>

              <div className="space-y-2.5">
                {classes.slice(0, 2).map((cls) => {
                  const percentage = Math.round((cls.enrolledCount / cls.capacity) * 100);
                  return (
                    <div key={cls.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-white">{cls.name}</span>
                          <span className="text-[10px] text-slate-400 ml-2">({cls.time})</span>
                        </div>
                        <span className="font-mono font-bold text-amber-400">
                          {cls.enrolledCount}/{cls.capacity} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${percentage > 85 ? 'bg-red-500' : 'bg-emerald-500'}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-400 flex justify-between">
                        <span>{cls.instructor}</span>
                        <span>{cls.tatame}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Architecture Banner */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border border-red-800/50 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> BJJ Academy Mobile 2.0 Ativo
                </div>
                <div className="text-[10px] text-slate-300 mt-0.5">
                  Capacitor + PWA + Web integrados no mesmo core.
                </div>
              </div>
              <button
                onClick={onOpenCapacitorDocs}
                className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold shrink-0 shadow-md"
              >
                Ver Arquitetura
              </button>
            </div>
          </div>
        )}

        {/* 2. FINANCEIRO MULTI-ACADEMIA COM JUROS & MULTAS */}
        {activeTab === 'financeiro' && (
          <div className="space-y-4">
            {/* RBAC PROFILE BANNER */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  Perfil de Acesso Financeiro:
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  managerFinancialProfile === 'general_manager'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                }`}>
                  {managerFinancialProfile === 'general_manager' ? '👑 Gestor Geral (Rede Toda)' : '🔒 Gestor de Unidade'}
                </span>
              </div>

              {/* Profile Toggle */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setManagerFinancialProfile('general_manager');
                    setSelectedAcademyId('all');
                  }}
                  className={`p-2 rounded-xl border text-left flex items-center gap-2 transition ${
                    managerFinancialProfile === 'general_manager'
                      ? 'bg-amber-500/10 border-amber-500/50 text-amber-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Unlock size={14} className="text-amber-400 shrink-0" />
                  <div className="truncate">
                    <div className="font-bold text-[11px]">Gestor Geral BJJ ACADEMY</div>
                    <div className="text-[9px] text-slate-400">Acesso irrestrito a todas filiais</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setManagerFinancialProfile('unit_manager');
                    setSelectedAcademyId(activeAcademyId);
                  }}
                  className={`p-2 rounded-xl border text-left flex items-center gap-2 transition ${
                    managerFinancialProfile === 'unit_manager'
                      ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Lock size={14} className="text-cyan-400 shrink-0" />
                  <div className="truncate">
                    <div className="font-bold text-[11px]">Gestor da Unidade</div>
                    <div className="text-[9px] text-slate-400">Acesso apenas às suas finanças</div>
                  </div>
                </button>
              </div>

              {/* Security Status Message */}
              {managerFinancialProfile === 'unit_manager' ? (
                <div className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-cyan-300 text-[11px] flex items-center gap-2">
                  <ShieldAlert size={14} className="text-cyan-400 shrink-0" />
                  <span>
                    Visão isolada para: <strong>{academies.find(a => a.id === activeAcademyId)?.name || activeAcademyName}</strong>. Finanças de outras academias estão protegidas e restritas ao Gestor Geral.
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
                    <Building2 size={13} className="text-amber-400" /> Filtrar Filial:
                  </span>
                  <select
                    value={selectedAcademyId}
                    onChange={(e) => setSelectedAcademyId(e.target.value)}
                    className="bg-slate-950 border border-slate-700 text-xs text-white rounded-xl px-2.5 py-1 font-bold"
                  >
                    <option value="all">🌐 Todas as Filiais (Consolidado)</option>
                    {academies.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* PLATFORM MANAGER OFFICIAL ACCOUNT & ACADEMY REPASSES */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/40 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-base shadow-sm">
                    🏛️
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles size={11} /> Plataforma BJJacademy • Gestor Geral
                    </span>
                    <h3 className="text-xs font-black text-white">Repasses & Mensalidades das Academias</h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditGmOpen(true)}
                  className="px-2.5 py-1 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 text-[10px] font-bold flex items-center gap-1 transition border border-slate-750"
                >
                  <Edit3 size={11} /> Editar Perfil
                </button>
              </div>

              {/* General Manager Profile Box */}
              <div className="p-3 rounded-2xl bg-slate-950/85 border border-slate-800/90 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-800/80 pb-2">
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                      Gestor Geral Cadastrado
                    </span>
                    <div className="text-xs font-black text-white flex items-center gap-1.5">
                      <span>{gmData.name}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                        Oficial
                      </span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                      CPF do Gestor
                    </span>
                    <div className="text-xs font-mono font-bold text-slate-300">
                      {gmData.formattedCpf || gmData.cpf}
                    </div>
                  </div>
                </div>

                {/* PIX Key Box */}
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <div>
                    <span className="text-[9px] font-bold text-amber-400 uppercase flex items-center gap-1">
                      <Zap size={10} /> Chave PIX Oficial (CPF):
                    </span>
                    <div className="text-sm font-mono font-black text-emerald-400 tracking-wider select-all">
                      {gmData.pixKey}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyPlatformPix}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-sm ${
                      copiedPlatformPix
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {copiedPlatformPix ? (
                      <>
                        <Check size={12} />
                        <span>Chave Copiada!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copiar PIX</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-[10px] text-slate-400 bg-slate-900/80 p-2 rounded-xl border border-slate-800/70 flex items-start gap-1.5">
                  <span className="text-amber-400 text-xs shrink-0 mt-0.5">💡</span>
                  <span>
                    <strong>Finalidade cadastrada:</strong> {gmData.purpose}
                  </span>
                </div>
              </div>

              {/* Repasses das Academias */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-300 flex items-center gap-1">
                    <Building2 size={12} className="text-amber-400" /> Repasses Mensais das Academias ({formatBRL(gmData.monthlyPlatformFeePerAcademy || 250)}/mês cada)
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                    {platformPayments.filter(p => p.status === 'paid').length}/{platformPayments.length} Pagos
                  </span>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar pr-0.5">
                  {platformPayments.map(p => (
                    <div
                      key={p.id}
                      className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                          <span>{p.academyName}</span>
                          <span className="text-[9px] text-slate-400 font-normal">({p.branch})</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Ref: {p.referenceMonth} • Vencimento: {p.dueDate}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <div className="text-xs font-black text-white font-mono">
                            {formatBRL(p.amount)}
                          </div>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                            p.status === 'paid' 
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}>
                            {p.status === 'paid' ? 'Pago ao Gestor' : 'Aguardando PIX'}
                          </span>
                        </div>

                        {p.status === 'pending' ? (
                          <button
                            type="button"
                            onClick={() => setSelectedPlatformPixItem(p)}
                            className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white transition text-[10px] font-bold flex items-center gap-1 border border-emerald-500/40"
                            title="Ver QR Code PIX para pagamento"
                          >
                            <QrCode size={12} /> Pagar PIX
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleMarkPlatformPayment(p.id, 'pending')}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition text-[9px]"
                            title="Reabrir cobrança"
                          >
                            <RefreshCw size={11} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* FINANCIAL SUMMARY CARDS */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-[10px] font-bold text-emerald-400 uppercase">Liquidado (Recebido)</div>
                <div className="text-xl font-black text-white">{formatBRL(financialMetrics.paid)}</div>
                <div className="text-[10px] text-slate-400">Mensalidades quitadas</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-[10px] font-bold text-blue-400 uppercase">A Vencer (No Prazo)</div>
                <div className="text-xl font-black text-white">{formatBRL(financialMetrics.pending)}</div>
                <div className="text-[10px] text-slate-400">Previsão de entrada</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-[10px] font-bold text-red-400 uppercase">Em Atraso (Original)</div>
                <div className="text-xl font-black text-white">{formatBRL(financialMetrics.overdueOriginal)}</div>
                <div className="text-[10px] text-red-400">Valor principal em atraso</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-950/30 to-slate-900 border border-amber-600/40 space-y-1">
                <div className="text-[10px] font-bold text-amber-400 uppercase flex items-center gap-1">
                  <Calculator size={11} /> Atualizado c/ Juros
                </div>
                <div className="text-xl font-black text-amber-300">{formatBRL(financialMetrics.overdueWithFees)}</div>
                <div className="text-[10px] text-amber-400/90 font-mono">
                  +{formatBRL(financialMetrics.totalFine + financialMetrics.totalInterest)} (Multa 2% + Juros)
                </div>
              </div>
            </div>

            {/* ACTION BANNER FOR FULL FINANCIAL HUB */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border border-emerald-700/50 flex items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                  <DollarSign size={14} className="text-emerald-400" />
                  Módulo Financeiro Completo
                </h4>
                <p className="text-[10px] text-emerald-300/80">
                  Calculadora de atraso, emissão de cobranças e tabelas de planos.
                </p>
              </div>
              <button
                onClick={onOpenFinancial}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shrink-0 shadow-md flex items-center gap-1 transition"
              >
                <span>Abrir Hub</span>
                <ArrowUpRight size={13} />
              </button>
            </div>

            {/* TRANSACTIONS & OVERDUE INVOICES */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Faturas & Mensalidades ({filteredInvoices.length})
                </h4>
                <button
                  onClick={onOpenFinancial}
                  className="text-emerald-400 hover:text-emerald-300 text-[11px] font-bold flex items-center gap-0.5"
                >
                  Ver todas no Hub <ArrowUpRight size={12} />
                </button>
              </div>

              <div className="space-y-2">
                {filteredInvoices.map((inv) => {
                  const calc = calculateLateFeeAndInterest(
                    inv.amount,
                    inv.dueDate,
                    new Date(2026, 8, 2),
                    inv.lateFeePercent || 2.0,
                    (inv.dailyInterestPercent ? inv.dailyInterestPercent * 30 : 1.0)
                  );

                  return (
                    <div
                      key={inv.id}
                      className={`p-3 rounded-2xl border transition-all ${
                        inv.status === 'overdue'
                          ? 'bg-red-950/20 border-red-800/50'
                          : 'bg-slate-900 border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 text-xs">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white">{inv.studentName}</span>
                            <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-mono">
                              {inv.invoiceNumber}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400">{inv.title}</div>
                          <div className="text-[10px] text-amber-400/90 font-medium">
                            {inv.academyName} • Venceu: {inv.dueDate}
                          </div>
                        </div>

                        <div className="text-right">
                          {inv.status === 'overdue' ? (
                            <div>
                              <div className="text-[10px] text-slate-400 line-through">
                                {formatBRL(inv.amount)}
                              </div>
                              <div className="font-black text-red-400 text-sm">
                                {formatBRL(calc.totalUpdatedAmount)}
                              </div>
                              <div className="text-[9px] text-amber-400 font-bold">
                                +{formatBRL(calc.fineAmount + calc.interestAmount)} (Juros)
                              </div>
                            </div>
                          ) : (
                            <div className="font-black text-white text-sm">
                              {formatBRL(inv.amount)}
                            </div>
                          )}

                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                            inv.status === 'paid'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : inv.status === 'overdue'
                              ? 'bg-red-950 text-red-400 border border-red-800'
                              : 'bg-blue-950 text-blue-400 border border-blue-800'
                          }`}>
                            {inv.status === 'paid'
                              ? 'Liquidado'
                              : inv.status === 'overdue'
                              ? `${calc.daysOverdue}d em atraso`
                              : 'A vencer'}
                          </span>
                        </div>
                      </div>

                      {/* Overdue Calculation Details & WhatsApp button */}
                      {inv.status === 'overdue' && (
                        <div className="mt-2 pt-2 border-t border-red-900/30 flex items-center justify-between text-[10px]">
                          <span className="text-slate-400">
                            Multa 2%: {formatBRL(calc.fineAmount)} | Juros: {formatBRL(calc.interestAmount)}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                const text = `Cobrança ${inv.academyName}: Mensalidade de ${inv.studentName} em atraso. Valor original: ${formatBRL(inv.amount)}, atualizado com juros e multa: ${formatBRL(calc.totalUpdatedAmount)}. PIX: ${inv.pixCode || 'financeiro@bjjacademy.com.br'}`;
                                navigator.clipboard.writeText(text);
                                setCopiedPixId(inv.id);
                                setTimeout(() => setCopiedPixId(null), 2000);
                              }}
                              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold flex items-center gap-1"
                            >
                              {copiedPixId === inv.id ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                              <span>Copiar PIX</span>
                            </button>
                            <button
                              onClick={() => {
                                const msg = `Olá ${inv.studentName}! Notificação ${inv.academyName}: Sua mensalidade de ${formatBRL(inv.amount)} venceu em ${inv.dueDate}. O total atualizado com multa e juros é ${formatBRL(calc.totalUpdatedAmount)}.`;
                                window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                              }}
                              className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1"
                            >
                              <MessageSquare size={10} />
                              <span>WhatsApp</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 3. CRM LEADS */}
        {activeTab === 'crm' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Aulas Experimentais & Contatos Recentes
              </h4>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                4 Novos Leads
              </span>
            </div>

            <div className="space-y-2.5">
              {leads.map((ld) => (
                <div key={ld.id} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-white">{ld.name}</h5>
                      <p className="text-[11px] text-slate-400">{ld.interest} • {ld.date}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/60 border border-amber-800/40 text-amber-400">
                      {ld.status}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-1 border-t border-slate-800/80">
                    <a
                      href={`https://wa.me/55${ld.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                    </a>
                    <a
                      href={`tel:${ld.phone.replace(/\D/g, '')}`}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" /> Ligar
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. PUSH EM MASSA */}
        {activeTab === 'push' && (
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div>
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
                <Bell className="w-3 h-3" /> Disparo de Push Notifications
              </span>
              <h3 className="text-sm font-bold text-white mt-1">
                Enviar Notificação Push para Celulares
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Envia notificação nativa para os apps Android, iPhone e PWA dos membros.
              </p>
            </div>

            <form onSubmit={handleBroadcastSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase">
                  Público Alvo:
                </label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {[
                    { id: 'all', label: 'Toda Academia' },
                    { id: 'students', label: 'Só Alunos' },
                    { id: 'parents', label: 'Só Responsáveis' },
                  ].map((tg) => (
                    <button
                      type="button"
                      key={tg.id}
                      onClick={() => setBroadcastTarget(tg.id as any)}
                      className={`py-1.5 rounded-xl border text-[11px] font-bold transition ${
                        broadcastTarget === tg.id
                          ? 'bg-red-600 border-red-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {tg.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase">
                  Título da Notificação:
                </label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="Ex: 🥋 Troca de Tatame ou Treino Especial"
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase">
                  Mensagem Push:
                </label>
                <textarea
                  value={broadcastBody}
                  onChange={(e) => setBroadcastBody(e.target.value)}
                  placeholder="Escreva a mensagem que aparecerá na tela de bloqueio dos alunos/pais..."
                  rows={3}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Voice Notification Indicator (Mercado Livre Style) */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                    <Volume2 size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">Voz Ativa: {activeAcademyName}</span>
                      <span className="text-[9px] bg-yellow-400/20 text-yellow-300 px-1.5 py-0.2 rounded font-bold uppercase">
                        Estilo Mercado Livre
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      O cliente escutará o jingle de marca seguido da voz: "{activeAcademyName}! {broadcastTitle || '[Título]'}"
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onOpenVoiceSettings}
                  className="px-2.5 py-1 rounded-xl bg-slate-850 hover:bg-slate-800 text-amber-400 text-xs font-bold shrink-0 border border-slate-700 transition"
                >
                  Configurar Voz
                </button>
              </div>

              {broadcastSent && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Push e áudio transmitidos com sucesso para todos os alunos conectados!
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-950 transition"
              >
                <Send className="w-3.5 h-3.5" /> Disparar Push Agora
              </button>
            </form>
          </div>
        )}

        {/* 5. ACADEMIAS & CADASTRO DE FILIAIS */}
        {activeTab === 'academies' && (
          <div className="space-y-4">
            {/* Banner Callout to Open Full Responsive Registration */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-red-950/40 via-slate-900 to-amber-950/30 border border-amber-500/40 shadow-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white text-2xl shadow-lg shrink-0">
                    🏛️
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-white">
                      Rede de Academias & Novas Filiais BJJ
                    </h3>
                    <p className="text-xs text-slate-300">
                      Cadastre novas unidades, gerencie CNPJ, chaves PIX de mensalidade e voz de tatame personalizada.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onOpenAcademyRegistration}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs shadow-xl shadow-red-950 flex items-center justify-center gap-2 transition shrink-0"
                >
                  <Plus size={15} />
                  <span>Cadastrar Nova Academia</span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-amber-400" />
                  <span>Gestor Geral: <strong className="text-white">{gmData.name}</strong></span>
                </div>
                <div className="text-[11px] font-mono text-emerald-400">
                  PIX Plataforma: {gmData.pixKey}
                </div>
              </div>
            </div>

            {/* Academies Mini List / Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Unidades Filiadas Cadastradas ({academies.length})
                </span>
                <button
                  type="button"
                  onClick={onOpenAcademyRegistration}
                  className="text-xs text-amber-400 hover:underline font-bold"
                >
                  Ver Todas & Gerenciar →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {academies.map((acad) => {
                  const isCurrent = acad.id === activeAcademyId;

                  return (
                    <div
                      key={acad.id}
                      className={`p-4 rounded-2xl border transition ${
                        isCurrent
                          ? 'bg-slate-900 border-amber-500/80 ring-1 ring-amber-500/40'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">🥋</span>
                          <div>
                            <div className="text-xs font-black text-white flex items-center gap-1.5">
                              <span>{acad.name}</span>
                              {isCurrent && (
                                <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.2 rounded font-bold">
                                  Ativa
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-amber-400 font-semibold">{acad.branch}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{acad.city}</span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-1.5 text-[10px] text-slate-300">
                        <div className="p-1.5 rounded-lg bg-slate-950/80 border border-slate-800">
                          <span className="text-slate-500 block">WhatsApp</span>
                          <span className="font-mono text-white">{acad.phone}</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-slate-950/80 border border-slate-800">
                          <span className="text-slate-500 block">PIX da Academia</span>
                          <span className="font-mono text-emerald-400 truncate block">{acad.pixKey || 'Não config.'}</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Volume2 size={11} className={acad.voiceEnabled ? 'text-amber-400' : 'text-slate-500'} />
                          {acad.voiceEnabled ? 'Voz de Tatame Ativa' : 'Sem voz'}
                        </span>

                        <button
                          type="button"
                          onClick={onOpenAcademyRegistration}
                          className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                        >
                          <Edit3 size={11} />
                          <span>Editar / Detalhes</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: EDITAR GESTOR GERAL (MESSIAS BATISTA DA SILVA JUNIOR) */}
      {isEditGmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-5 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-lg">🥋</span>
                <h3 className="text-sm font-black text-white">Dados do Gestor Geral</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditGmOpen(false)}
                className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGeneralManager} className="space-y-3 pt-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Nome Completo do Gestor Geral:
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  placeholder="Nome do Gestor"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  CPF do Gestor Geral:
                </label>
                <input
                  type="text"
                  value={editCpf}
                  onChange={(e) => setEditCpf(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  placeholder="58087630378"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Chave PIX da Plataforma (CPF):
                </label>
                <input
                  type="text"
                  value={editPix}
                  onChange={(e) => setEditPix(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold"
                  placeholder="58087630378"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Finalidade dos Pagamentos:
                </label>
                <textarea
                  value={editPurpose}
                  onChange={(e) => setEditPurpose(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                  required
                />
              </div>

              {saveSuccessMsg && (
                <div className="p-2 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-800 text-center font-bold">
                  ✓ Dados salvos com sucesso no sistema!
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditGmOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black"
                >
                  Salvar Dados
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PAGAR PIX PARA PLATAFORMA BJJ ACADEMY */}
      {selectedPlatformPixItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-5 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  Repasse à Plataforma BJJ ACADEMY
                </span>
                <h3 className="text-sm font-black text-white">{selectedPlatformPixItem.academyName}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlatformPixItem(null)}
                className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3 text-center">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Favorecido (Gestor Geral)</div>
                <div className="text-sm font-black text-white">{gmData.name}</div>
                <div className="text-xs text-slate-400 font-mono">CPF: {gmData.formattedCpf || gmData.cpf}</div>
                <div className="text-xs text-emerald-400 font-mono font-bold">Chave PIX: {gmData.pixKey}</div>
              </div>

              {/* QR Code Canvas Mockup */}
              <div className="mx-auto w-44 h-44 bg-white p-3 rounded-2xl flex flex-col items-center justify-center shadow-lg">
                <div className="w-36 h-36 bg-slate-950 rounded-xl p-2 flex flex-col items-center justify-center text-center">
                  <QrCode size={80} className="text-white mx-auto" />
                  <span className="text-[8px] font-mono text-emerald-400 mt-1">PIX PLATAFORMA BJJ</span>
                </div>
              </div>

              <div className="text-lg font-black text-white">
                {formatBRL(selectedPlatformPixItem.amount)}
              </div>

              <p className="text-[11px] text-slate-400">
                Pague pelo app do seu banco lendo o QR Code ou copiando a chave PIX CPF do Gestor Geral.
              </p>

              <button
                type="button"
                onClick={handleCopyPlatformPix}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <Copy size={13} />
                <span>{copiedPlatformPix ? 'Chave Copiada!' : `Copiar Chave PIX: ${gmData.pixKey}`}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleMarkPlatformPayment(selectedPlatformPixItem.id, 'paid');
                  setSelectedPlatformPixItem(null);
                }}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5 transition border border-emerald-900/50"
              >
                <CheckCircle size={13} /> Confirmar Pagamento Quitado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
