import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, Users, DollarSign, TrendingUp, AlertTriangle, 
  Bell, Send, Plus, Calendar, Layers, ShieldCheck, 
  Smartphone, Monitor, UserPlus, CheckCircle, Search, 
  Phone, MessageSquare, ArrowUpRight, Zap, RefreshCw,
  Tablet, ShoppingBag, Award, FileText, Trophy, Volume2,
  Lock, Unlock, Calculator, Building2, ShieldAlert, Copy, Check,
  QrCode, CheckCheck, Edit3, Sparkles, Download, AlertCircle, MessageCircle, Cake,
  Database, Cloud, Crown, Clock, Swords, Star, Tv
} from 'lucide-react';
import { 
  ClassSession, Invoice, Announcement, PushNotification, 
  RegisteredAcademy, FinancialAccessProfile, PlatformGeneralManager, 
  PlatformAcademyPayment, CRMLead, CRMLeadStage
} from '../../types';
import { defaultPlatformGeneralManager, mockPlatformAcademyPayments, mockCRMLeads } from '../../data/mockData';
import { calculateLateFeeAndInterest, formatBRL, calculateSaasLicenseFee, SAAS_FIXED_FEE_BRL, SAAS_PER_STUDENT_FEE_BRL } from '../../utils/financialCalculations';
import { exportFinancialInvoicesCSV, exportAcademiesListCSV } from '../../utils/csvExport';
import { sendReceiptViaWhatsApp, sendReminderViaWhatsApp } from '../../utils/whatsappHelper';
import { DueAlertsDrawer } from '../common/DueAlertsDrawer';
import { AcademyOperatingHoursModal } from '../common/AcademyOperatingHoursModal';
import { DataIntegrityModal } from '../common/DataIntegrityModal';
import { safeLocalStorageGet, safeLocalStorageSet } from '../../utils/safeStorage';
import { StudentEnrollmentButton } from '../common/StudentEnrollmentButton';
import { saveCRMLeadToFirestore, subscribeToCRMLeads } from '../../firebase/firestoreService';

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
  onOpenSaaSSimulator?: () => void;
  onOpenMySaaSSubscription?: () => void;
  onOpenDataMigration?: () => void;
  onOpenAICoach?: () => void;
  activeAcademyName?: string;
  activeAcademyId?: string;
  academies?: RegisteredAcademy[];
  generalManager?: PlatformGeneralManager;
  onUpdateGeneralManager?: (gm: PlatformGeneralManager) => void;
  onOpenAcademyRegistration?: () => void;
  isGeneralManager?: boolean;
  isCEO?: boolean;
  onOpenRetentionRadar?: () => void;
  retentionAlertsCount?: number;
  onOpenBirthdayAlert?: () => void;
  todayBirthdaysCount?: number;
  onOpenStudentManagement?: () => void;
  onOpenStudentEnrollment?: (academy?: RegisteredAcademy) => void;
  onOpenCloudStatus?: () => void;
  studentsCount?: number;
  onOpenCEOProfile?: () => void;
  onOpenCBJJGraduation?: () => void;
  onOpenSparringMatchmaker?: () => void;
  onOpenRespectfulBilling?: () => void;
  onOpenKidsBehavioralFeed?: () => void;
  onOpenTatameTV?: () => void;
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
  onOpenSaaSSimulator,
  onOpenMySaaSSubscription,
  onOpenDataMigration,
  onOpenAICoach,
  activeAcademyName = 'BJJ Academy',
  activeAcademyId = 'acad_bjj_jardins',
  academies = [],
  generalManager = defaultPlatformGeneralManager,
  onUpdateGeneralManager,
  onOpenAcademyRegistration,
  isGeneralManager = false,
  isCEO = false,
  onOpenRetentionRadar,
  retentionAlertsCount,
  onOpenBirthdayAlert,
  todayBirthdaysCount,
  onOpenStudentManagement,
  onOpenStudentEnrollment,
  onOpenCloudStatus,
  studentsCount,
  onOpenCEOProfile,
  onOpenCBJJGraduation,
  onOpenSparringMatchmaker,
  onOpenRespectfulBilling,
  onOpenKidsBehavioralFeed,
  onOpenTatameTV,
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'financeiro' | 'crm' | 'push' | 'academies'>('dashboard');

  const activeRegisteredAcademy = useMemo(() => {
    return academies.find(a => a.id === activeAcademyId) || academies[0];
  }, [academies, activeAcademyId]);
  
  // CRM Kanban Leads state
  const [leads, setLeads] = useState<CRMLead[]>(() => {
    return safeLocalStorageGet<CRMLead[]>('bjj_crm_leads', mockCRMLeads);
  });
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadInterest, setNewLeadInterest] = useState('Jiu-Jitsu Adulto Fundamentos');
  const [newLeadChannel, setNewLeadChannel] = useState<'instagram' | 'indicacao' | 'google' | 'passante' | 'whatsapp'>('instagram');
  const [newLeadNotes, setNewLeadNotes] = useState('');

  useEffect(() => {
    const unsub = subscribeToCRMLeads((cloudLeads) => {
      if (cloudLeads && cloudLeads.length > 0) {
        setLeads(cloudLeads);
        safeLocalStorageSet('bjj_crm_leads', cloudLeads);
      }
    });
    return () => unsub();
  }, []);

  const saveLeadsToStorage = (updated: CRMLead[]) => {
    setLeads(updated);
    safeLocalStorageSet('bjj_crm_leads', updated);
  };

  const handleMoveLeadStage = (leadId: string, direction: 'next' | 'prev') => {
    const stageOrder: CRMLeadStage[] = [
      'novo_lead',
      'contato_realizado',
      'aula_agendada',
      'compareceu',
      'matricula_fechada',
      'perdido'
    ];

    let targetLead: CRMLead | null = null;
    const updated = leads.map(ld => {
      if (ld.id === leadId) {
        const currentIdx = stageOrder.indexOf(ld.stage);
        const newIdx = direction === 'next' 
          ? Math.min(stageOrder.length - 1, currentIdx + 1)
          : Math.max(0, currentIdx - 1);
        const modified = { ...ld, stage: stageOrder[newIdx] };
        targetLead = modified;
        return modified;
      }
      return ld;
    });

    saveLeadsToStorage(updated);
    if (targetLead) {
      saveCRMLeadToFirestore(targetLead).catch(err => console.warn('Falha ao salvar lead no Firestore:', err));
    }
  };

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName.trim() || !newLeadPhone.trim()) return;

    const created: CRMLead = {
      id: `lead_${Date.now()}`,
      name: newLeadName.trim(),
      phone: newLeadPhone.trim(),
      interest: newLeadInterest,
      channel: newLeadChannel,
      stage: 'novo_lead',
      status: 'Aguardando Primeiro Contato',
      date: new Date().toLocaleDateString('pt-BR'),
      createdAt: new Date().toISOString(),
      notes: newLeadNotes.trim() || undefined,
      estimatedMonthlyFee: 260
    };

    saveLeadsToStorage([created, ...leads]);
    saveCRMLeadToFirestore(created).catch(err => console.warn('Falha ao salvar novo lead no Firestore:', err));
    setNewLeadName('');
    setNewLeadPhone('');
    setNewLeadNotes('');
    setIsNewLeadOpen(false);
  };

  const handleSendLeadWhatsApp = (lead: CRMLead, templateType: 'boas_vindas' | 'lembrete_aula' | 'matricula' | 'reengajamento') => {
    const cleanPhone = lead.phone.replace(/\D/g, '');
    let text = '';

    if (templateType === 'boas_vindas') {
      text = `Olá ${lead.name}! Tudo bem? Vi que você tem interesse em treinar Jiu-Jitsu conosco na ${activeAcademyName}. Gostaria de agendar uma aula experimental gratuita para conhecer nosso tatame e metodologia? Oss! 🥋`;
    } else if (templateType === 'lembrete_aula') {
      text = `Olá ${lead.name}! Passando para lembrar da sua aula experimental de Jiu-Jitsu amanhã na ${activeAcademyName}. Chegue 10 minutos antes com roupa confortável (bermuda e camiseta). Temos kimono higienizado para você. Te esperamos no tatame! Oss!`;
    } else if (templateType === 'matricula') {
      text = `Parabéns ${lead.name}! Seja muito bem-vindo(a) à família ${activeAcademyName}! Seu cadastro foi concluído com sucesso. Baixe nosso app para acompanhar seus graus, frequência e treinos. Oss!`;
    } else {
      text = `Olá ${lead.name}, tudo bem? Sentimos sua falta aqui no tatame da ${activeAcademyName}! Estamos com novas turmas e horários flexíveis. Vamos retomar seus treinos de Jiu-Jitsu nesta semana?`;
    }

    window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };
  
  // Financial RBAC & Filter state inside ManagerView
  const [managerFinancialProfile, setManagerFinancialProfile] = useState<FinancialAccessProfile>(
    isGeneralManager ? 'general_manager' : 'unit_manager'
  );
  const [selectedAcademyId, setSelectedAcademyId] = useState<string>(
    isGeneralManager ? 'all' : (activeAcademyId || 'acad_bjj_jardins')
  );
  const [copiedPixId, setCopiedPixId] = useState<string | null>(null);

  useEffect(() => {
    if (isGeneralManager) {
      setManagerFinancialProfile('general_manager');
    } else {
      setManagerFinancialProfile('unit_manager');
      setSelectedAcademyId(activeAcademyId || 'acad_bjj_jardins');
    }
  }, [isGeneralManager, activeAcademyId]);

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
    return safeLocalStorageGet<PlatformAcademyPayment[]>('bjj_platform_payments', mockPlatformAcademyPayments);
  });
  const [selectedPlatformPixItem, setSelectedPlatformPixItem] = useState<PlatformAcademyPayment | null>(null);

  // Filter platform payments for the current view
  const displayedPlatformPayments = useMemo(() => {
    if (managerFinancialProfile === 'unit_manager') {
      return platformPayments.filter(p => p.academyId === activeAcademyId);
    }
    return platformPayments;
  }, [platformPayments, managerFinancialProfile, activeAcademyId]);

  // Smart Due Alerts Drawer State
  const [isDueAlertsOpen, setIsDueAlertsOpen] = useState(false);
  const [isOperatingHoursModalOpen, setIsOperatingHoursModalOpen] = useState(false);
  const [isDataIntegrityModalOpen, setIsDataIntegrityModalOpen] = useState(false);
  const overdueInvoicesCount = invoices.filter(inv => inv.status === 'overdue').length;

  const handleExportInvoicesCSV = () => {
    exportFinancialInvoicesCSV(invoices, activeAcademyName);
  };

  const handleExportAcademiesCSV = () => {
    exportAcademiesListCSV(academies, gmData.name);
  };

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
    safeLocalStorageSet('bjj_general_manager', updated);
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
    safeLocalStorageSet('bjj_platform_payments', updated);
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
    <div className="flex flex-col h-full bg-slate-950/65 backdrop-blur-[0.5px] text-slate-100 overflow-y-auto pb-20 no-scrollbar">
      {/* Manager Top Bar */}
      <div className="px-5 pt-4 pb-4 bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-950/75 border-b border-slate-800">
        {/* CEO Exclusive Executive Welcome & Global RBAC Priority Header */}
        {isCEO && (
          <div className="mb-3.5 p-3 rounded-2xl bg-gradient-to-r from-amber-500/25 via-amber-600/15 to-red-600/20 border-2 border-amber-400/60 shadow-xl shadow-amber-950/40 animate-fadeIn backdrop-blur-sm">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black text-lg shadow-md ring-2 ring-amber-300/50">
                  👑
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-sm sm:text-base font-black text-white tracking-tight">
                      Olá, CEO Messias! Oss. 🥋
                    </h1>
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-sm">
                      PODER TOTAL & IRRESTRITO
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-200/90 font-medium mt-0.5">
                    Acesso Master Ativo • Visão global de todas as academias (Multi-Tenant), Faturamento Consolidado, Split Asaas e Monitor de Churn por IA.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] font-mono">
                <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  RBAC: CEO_MASTER
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center font-black shadow-lg ${
              isGeneralManager
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
            }`}>
              {isGeneralManager ? '👑' : '🏢'}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`text-[10px] font-black uppercase tracking-wider ${
                  isGeneralManager ? 'text-amber-400' : 'text-cyan-400'
                }`}>
                  {isGeneralManager ? '👑 CEO & Fundador BJJ ACADEMY' : 'Responsável da Academia Cadastrada'}
                </span>
                <span className={`text-[9px] border px-1.5 py-0.2 rounded-full font-bold flex items-center gap-0.5 ${
                  isGeneralManager 
                    ? 'bg-amber-950 text-amber-300 border-amber-700/60'
                    : 'bg-cyan-950 text-cyan-300 border-cyan-700/60'
                }`}>
                  <ShieldCheck size={10} /> {isGeneralManager ? 'Super Admin' : 'Blindagem Ativa'}
                </span>
                {isGeneralManager && (
                  <button
                    type="button"
                    onClick={() => onOpenCEOProfile ? onOpenCEOProfile() : setIsEditGmOpen(true)}
                    className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-[9px] font-black flex items-center gap-1 transition shadow-sm"
                  >
                    <Crown size={9} />
                    <span>Cadastro CEO</span>
                  </button>
                )}
              </div>
              <h2 className="text-sm font-black text-white leading-snug">
                {isGeneralManager ? gmData.name : activeAcademyName}
              </h2>
              {isGeneralManager ? (
                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className="text-amber-300 font-bold">{gmData.title || 'CEO & Fundador'}, ({gmData.martialArtsRank || '• Mestre Fundador'})</span>
                  <span>•</span>
                  <span>CPF: {gmData.formattedCpf || gmData.cpf}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-bold">PIX: {gmData.pixKey}</span>
                  <button
                    type="button"
                    onClick={() => onOpenCEOProfile ? onOpenCEOProfile() : setIsEditGmOpen(true)}
                    className="text-slate-400 hover:text-amber-300 transition p-0.5 ml-1"
                    title="Editar Cadastro Oficial do CEO"
                  >
                    <Edit3 size={11} />
                  </button>
                </div>
              ) : (
                <div className="text-[10px] text-cyan-200/80 flex items-center gap-1 mt-0.5">
                  <span>Gestão Financeira & Operacional restrita a esta unidade</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Radar Anti-Evasão Quick Indicator Button */}
            {onOpenRetentionRadar && (
              <button
                onClick={onOpenRetentionRadar}
                className="px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1 transition shadow-sm bg-red-950/60 hover:bg-red-900/80 border-red-500/60 text-red-300 ring-1 ring-red-500/30"
                title="Radar Anti-Evasão: Alunos com risco de abandono"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                <span>Radar Evasão</span>
                {retentionAlertsCount !== undefined && retentionAlertsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-red-500 text-white font-black">
                    {retentionAlertsCount}
                  </span>
                )}
              </button>
            )}

            {/* Aniversariantes do Mês / Hoje Quick Indicator Button */}
            {onOpenBirthdayAlert && (
              <button
                onClick={onOpenBirthdayAlert}
                className="px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1 transition shadow-sm bg-amber-950/60 hover:bg-amber-900/80 border-amber-500/60 text-amber-300 ring-1 ring-amber-500/30"
                title="Aniversariantes: Felicitações com o nome oficial da academia"
              >
                <Cake className="w-3.5 h-3.5 text-amber-400" />
                <span>Aniversariantes</span>
                {todayBirthdaysCount !== undefined && todayBirthdaysCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-500 text-slate-950 font-black">
                    {todayBirthdaysCount} hoje
                  </span>
                )}
              </button>
            )}

            {/* Smart Due Alerts Indicator Button */}
            <button
              onClick={() => setIsDueAlertsOpen(true)}
              className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1 transition shadow-sm ${
                overdueInvoicesCount > 0
                  ? 'bg-amber-950/60 hover:bg-amber-900/80 border-amber-500/60 text-amber-300 ring-1 ring-amber-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
              title="Alertas Inteligentes de Vencimento e Cobrança Rápida"
            >
              <AlertCircle className={`w-3.5 h-3.5 ${overdueInvoicesCount > 0 ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>{overdueInvoicesCount > 0 ? `${overdueInvoicesCount} Vencidos` : 'Faturas'}</span>
            </button>

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

            {/* Standard Button: Cadastrar Novo Aluno (Adulto ou Kids) */}
            <StudentEnrollmentButton
              academy={activeRegisteredAcademy || { id: activeAcademyId, name: activeAcademyName }}
              onOpenEnrollment={(acad) => {
                if (onOpenStudentEnrollment) {
                  onOpenStudentEnrollment(acad || activeRegisteredAcademy);
                } else if (onOpenStudentManagement) {
                  onOpenStudentManagement();
                }
              }}
              variant="header"
              label="+ Cadastrar Aluno"
            />

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
            {/* 🚨 Radar Anti-Evasão Warning Banner */}
            {onOpenRetentionRadar && (
              <div 
                onClick={onOpenRetentionRadar}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-red-950/70 via-slate-900 to-amber-950/50 border border-red-800/50 hover:border-red-500/70 cursor-pointer flex items-center justify-between transition group shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-600/20 text-red-400 border border-red-500/40 flex items-center justify-center group-hover:scale-105 transition">
                    <ShieldAlert className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white group-hover:text-red-300 transition">
                        🚨 Radar Anti-Evasão Ativo
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500/20 text-red-400 border border-red-500/40">
                        {retentionAlertsCount ?? 4} Alunos em Risco
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-tight mt-0.5">
                      Alunos com mais de 7 dias sem check-in no tatame. Clique para abrir o Radar e disparar o WhatsApp de acolhimento.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenRetentionRadar();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-xs shadow-md shadow-red-950 transition shrink-0 cursor-pointer"
                >
                  <span className="hidden sm:inline">Resgatar Alunos</span>
                  <span className="sm:hidden">Resgatar</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* 🎂 Aniversariantes do Tatame Banner */}
            {onOpenBirthdayAlert && (
              <div 
                onClick={onOpenBirthdayAlert}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-yellow-950/40 border border-amber-500/40 hover:border-amber-400 cursor-pointer flex items-center justify-between transition group shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center group-hover:scale-105 transition shadow-inner">
                    <Cake className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white group-hover:text-amber-300 transition">
                        🎂 Aniversariantes no Tatame
                      </span>
                      {todayBirthdaysCount !== undefined && todayBirthdaysCount > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                          🎉 {todayBirthdaysCount} Hoje!
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-800 text-slate-300 border border-slate-700">
                          Setembro
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-tight mt-0.5">
                      Felicitações oficiais aos alunos e professores com o nome da <strong className="text-amber-300 font-bold">{activeAcademyName}</strong>.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition shrink-0">
                  <span className="hidden sm:inline">Parabenizar</span>
                  <span className="sm:hidden">Ver</span>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            )}

            {/* Cloud Database Multi-Access Banner */}
            <div 
              onClick={onOpenCloudStatus}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 flex items-center justify-between gap-3 cursor-pointer hover:border-emerald-500/50 transition-colors shadow-lg shadow-emerald-950/20"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  <Database size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-white">Banco em Nuvem Ativo (Firebase)</span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      MULTI-ACESSO
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Multi-acesso simultâneo com persistência total • {studentsCount ?? 6} alunos em nuvem
                  </p>
                </div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenStudentManagement && onOpenStudentManagement();
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shrink-0 transition-colors flex items-center gap-1"
              >
                <Users size={13} />
                <span>Gerenciar</span>
              </button>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div 
                onClick={onOpenStudentManagement}
                className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 cursor-pointer hover:border-blue-500/40 transition-colors"
                title="Clique para abrir lista e cadastro de alunos na nuvem"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold">
                  <span>Alunos Cadastrados</span>
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div className="text-2xl font-black text-white">{studentsCount || activeStudents}</div>
                <div className="text-[10px] text-blue-400 font-semibold flex items-center gap-1">
                  <Cloud className="w-3 h-3 text-emerald-400" /> Nuvem Firestore
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

            {/* Destaque Oficial: Cadastro de Novos Alunos (Adulto & Kids com Responsável) */}
            <div className="p-4 rounded-3xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/70 border border-blue-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-600/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-black text-white">
                      Matrícula de Novos Alunos
                    </h4>
                    <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                      {activeAcademyName}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Fluxo oficial para alunos adultos e <strong>Turma Kids</strong> com campos obrigatórios do responsável legal.
                  </p>
                </div>
              </div>

              <StudentEnrollmentButton
                academy={activeRegisteredAcademy || { id: activeAcademyId, name: activeAcademyName }}
                onOpenEnrollment={(acad) => {
                  if (onOpenStudentEnrollment) {
                    onOpenStudentEnrollment(acad || activeRegisteredAcademy);
                  } else if (onOpenStudentManagement) {
                    onOpenStudentManagement();
                  }
                }}
                variant="hero"
                label="Cadastrar Novo Aluno"
              />
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

                {onOpenRetentionRadar && (
                  <button
                    onClick={onOpenRetentionRadar}
                    className="p-3 rounded-2xl bg-gradient-to-br from-rose-950/40 via-slate-950 to-slate-900 border border-rose-500/40 hover:border-rose-400 flex flex-col items-start gap-1 text-left transition group shadow-sm col-span-2"
                  >
                    <div className="w-full flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">🚨 Radar Anti-Evasão & Retenção de Alunos</span>
                          <span className="text-[10px] text-rose-300/80">Identifique alunos ausentes & resgate via WhatsApp humanizado</span>
                        </div>
                      </div>
                      <span className="text-[10px] bg-rose-500/20 text-rose-300 font-bold px-2 py-0.5 rounded-full border border-rose-500/40">
                        {retentionAlertsCount ?? 4} em risco →
                      </span>
                    </div>
                  </button>
                )}

                {onOpenBirthdayAlert && (
                  <button
                    onClick={onOpenBirthdayAlert}
                    className="p-3 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-950 to-slate-900 border border-amber-500/40 hover:border-amber-400 flex flex-col items-start gap-1 text-left transition group shadow-sm col-span-2"
                  >
                    <div className="w-full flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Cake className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">🎂 Aniversariantes & Felicitações Oficiais</span>
                          <span className="text-[10px] text-amber-300/80">Envie parabéns via WhatsApp e mural com o nome da {activeAcademyName}</span>
                        </div>
                      </div>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/40">
                        {todayBirthdaysCount !== undefined && todayBirthdaysCount > 0 ? `${todayBirthdaysCount} hoje!` : 'Ver Todos →'}
                      </span>
                    </div>
                  </button>
                )}

                <button
                  onClick={onOpenAcademyRegistration}
                  className="p-3 rounded-2xl bg-gradient-to-br from-red-950/50 via-slate-950 to-amber-950/40 border border-amber-500/40 hover:border-amber-400 flex flex-col items-start gap-1 text-left transition group col-span-2 shadow-sm"
                >
                  <div className="w-full flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-white block">Página de Cadastro de Academias & Rede</span>
                        <span className="text-[10px] text-amber-300/90 font-medium">Cadastrar filiais, CNPJ, PIX, Tatames, Voz e Repasses</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/40">
                      Abrir Página →
                    </span>
                  </div>
                </button>

                {/* SaaS Scale Simulator */}
                <button
                  onClick={onOpenSaaSSimulator}
                  className="p-3 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-950 to-slate-900 border border-emerald-500/40 hover:border-emerald-400 flex flex-col items-start gap-1 text-left transition group shadow-sm"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-white mt-1">Simulador SaaS</span>
                  <span className="text-[10px] text-emerald-300/80">Projetar MRR, ARR e Escala</span>
                </button>

                {/* My SaaS Subscription */}
                <button
                  onClick={onOpenMySaaSSubscription}
                  className="p-3 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-950 to-slate-900 border border-amber-500/40 hover:border-amber-400 flex flex-col items-start gap-1 text-left transition group shadow-sm"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-white mt-1">Minha Assinatura</span>
                  <span className="text-[10px] text-amber-300/80">Licença & PIX do Gestor</span>
                </button>

                {/* Data Migration CSV */}
                <button
                  onClick={onOpenDataMigration}
                  className="p-3 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-950 to-slate-900 border border-indigo-500/40 hover:border-indigo-400 flex flex-col items-start gap-1 text-left transition group shadow-sm"
                >
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Download className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-white mt-1">Migração em Lote</span>
                  <span className="text-[10px] text-indigo-300/80">Importar alunos via CSV</span>
                </button>

                {/* AI Coach */}
                <button
                  onClick={onOpenAICoach}
                  className="p-3 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-950 to-slate-900 border border-purple-500/40 hover:border-purple-400 flex flex-col items-start gap-1 text-left transition group shadow-sm"
                >
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-white mt-1">BJJ AI Coach</span>
                  <span className="text-[10px] text-purple-300/80">Planos de aula & drills</span>
                </button>
              </div>

              <button
                onClick={() => setIsOperatingHoursModalOpen(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-600/20 via-slate-900 to-amber-600/20 hover:from-amber-600/30 hover:to-amber-600/30 border border-amber-500/40 text-xs font-bold text-amber-300 flex items-center justify-between transition shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>Horários de Funcionamento & Grade de Treinos</span>
                </div>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                  {activeAcademyName || 'Loyalty Jiu-Jitsu'}
                </span>
              </button>

              {/* Botão de Auditoria de Integridade (Firestore ↔ LocalStorage) */}
              <button
                onClick={() => setIsDataIntegrityModalOpen(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600/20 via-slate-900 to-emerald-600/20 hover:from-emerald-600/30 hover:to-emerald-600/30 border border-emerald-500/40 text-xs font-bold text-emerald-300 flex items-center justify-between transition shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>Auditoria de Integridade (Firestore ↔ Cache Local)</span>
                </div>
                <span className="text-[10px] bg-emerald-400/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  Alunos & Faturas
                </span>
              </button>

              {/* 5 Pilares Master BJJ */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Crown size={12} /> Recursos de Excelência Tatame 10/10
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {onOpenCBJJGraduation && (
                    <button
                      type="button"
                      onClick={onOpenCBJJGraduation}
                      className="p-3 rounded-2xl bg-gradient-to-br from-amber-950/40 to-slate-950 border border-amber-500/40 hover:border-amber-400 text-left transition flex items-center gap-2.5"
                    >
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                        <Award size={16} />
                      </div>
                      <div>
                        <strong className="text-xs text-white block">Certificados CBJJ / IBJJF</strong>
                        <span className="text-[10px] text-amber-300/80">Regulamento & QR Code</span>
                      </div>
                    </button>
                  )}

                  {onOpenSparringMatchmaker && (
                    <button
                      type="button"
                      onClick={onOpenSparringMatchmaker}
                      className="p-3 rounded-2xl bg-gradient-to-br from-red-950/40 to-slate-950 border border-red-500/40 hover:border-red-400 text-left transition flex items-center gap-2.5"
                    >
                      <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-300 flex items-center justify-center shrink-0">
                        <Swords size={16} />
                      </div>
                      <div>
                        <strong className="text-xs text-white block">Temporizador & Rola</strong>
                        <span className="text-[10px] text-red-300/80">Sorteio por peso & lesão</span>
                      </div>
                    </button>
                  )}

                  {onOpenRespectfulBilling && (
                    <button
                      type="button"
                      onClick={onOpenRespectfulBilling}
                      className="p-3 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-950 border border-emerald-500/40 hover:border-emerald-400 text-left transition flex items-center gap-2.5"
                    >
                      <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-300 flex items-center justify-center shrink-0">
                        <DollarSign size={16} />
                      </div>
                      <div>
                        <strong className="text-xs text-white block">Cobrança Amigável WhatsApp</strong>
                        <span className="text-[10px] text-emerald-300/80">Sem constrangimento</span>
                      </div>
                    </button>
                  )}

                  {onOpenKidsBehavioralFeed && (
                    <button
                      type="button"
                      onClick={onOpenKidsBehavioralFeed}
                      className="p-3 rounded-2xl bg-gradient-to-br from-amber-950/30 to-slate-950 border border-amber-500/30 hover:border-amber-400 text-left transition flex items-center gap-2.5"
                    >
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                        <Star size={16} />
                      </div>
                      <div>
                        <strong className="text-xs text-white block">Valores & Feed Kids</strong>
                        <span className="text-[10px] text-amber-300/80">Metas em casa & escola</span>
                      </div>
                    </button>
                  )}
                </div>

                {onOpenTatameTV && (
                  <button
                    type="button"
                    onClick={onOpenTatameTV}
                    className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-red-700/80 via-slate-900 to-red-700/80 hover:from-red-600 hover:to-red-600 border border-red-500/50 text-xs font-black text-white flex items-center justify-between transition shadow-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Tv size={16} className="text-red-400 animate-pulse" />
                      <span>Ativar Modo TV do Tatame (Digital Signage / Totem de Recepção)</span>
                    </div>
                    <span className="text-[10px] bg-red-500/30 text-white px-2 py-0.5 rounded-full font-extrabold border border-red-400/40">
                      Tela Cheia TV
                    </span>
                  </button>
                )}
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
                  isGeneralManager
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                }`}>
                  {isGeneralManager ? '👑 Gestor Geral (Rede Toda)' : '🔒 Gestor de Unidade (Blindado)'}
                </span>
              </div>

              {/* Profile Controls based on Role */}
              {isGeneralManager ? (
                <>
                  <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-800/40 text-amber-300 text-[11px] flex items-center gap-2">
                    <ShieldAlert size={14} className="text-amber-400 shrink-0" />
                    <span>
                      <strong>Super Admin Ativo:</strong> Você pode visualizar e modificar tudo em qualquer página e filial da rede.
                    </span>
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
                        <Building2 size={13} className="text-amber-400" /> Navegação & Filtro BJJACADEMY:
                      </span>
                      <span className="text-[10px] text-amber-400 font-mono">
                        {selectedAcademyId === 'all' ? 'Rede Completa' : academies.find(a => a.id === selectedAcademyId)?.shortName || 'Filial Ativa'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                      <button
                        type="button"
                        onClick={() => setSelectedAcademyId('all')}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                          selectedAcademyId === 'all'
                            ? 'bg-black text-white border-2 border-amber-400 ring-2 ring-amber-400/40 shadow-sm'
                            : 'bg-black text-white border border-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <span>🌐 Todas as Filiais</span>
                      </button>
                      {academies.map((a) => {
                        const isSel = selectedAcademyId === a.id;
                        return (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => setSelectedAcademyId(a.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                              isSel
                                ? 'bg-black text-white border-2 border-amber-400 ring-2 ring-amber-400/40 shadow-sm'
                                : 'bg-black text-white border border-slate-800 hover:border-slate-600'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isSel ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                            <span>{a.name}</span>
                            {a.state && (
                              <span className="text-[9px] font-mono text-slate-400">({a.state})</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-cyan-300 text-xs flex items-center gap-2">
                  <Lock size={15} className="text-cyan-400 shrink-0" />
                  <div>
                    <div className="font-bold text-[11px]">Blindagem de Unidade Ativa</div>
                    <div className="text-[10px] text-cyan-200/80">
                      Você tem acesso restrito e exclusivo às finanças, mensalidades e alunos de <strong>{activeAcademyName}</strong>. Dados de outras filiais e repasses gerais estão blindados.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* PLATFORM MANAGER OFFICIAL ACCOUNT & ACADEMY REPASSES */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/40 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-base shadow-sm ${
                    isGeneralManager
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                      : 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
                  }`}>
                    🏛️
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles size={11} /> Plataforma BJJacademy • {isGeneralManager ? 'Gestor Geral Master' : 'Sua Licença'}
                    </span>
                    <h3 className="text-xs font-black text-white">
                      {isGeneralManager ? 'Repasses & Mensalidades de Todas as Academias' : 'Assinatura SaaS da Sua Unidade'}
                    </h3>
                  </div>
                </div>

                {isGeneralManager && (
                  <button
                    type="button"
                    onClick={() => setIsEditGmOpen(true)}
                    className="px-2.5 py-1 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 text-[10px] font-bold flex items-center gap-1 transition border border-slate-750"
                  >
                    <Edit3 size={11} /> Editar Perfil
                  </button>
                )}
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                  <span className="font-bold text-slate-300 flex items-center gap-1">
                    <Building2 size={12} className="text-amber-400" />
                    Faturamento SaaS Master: R$ 130,00 fixo + R$ 1,30/aluno ativo
                  </span>
                  <div className="flex items-center gap-2">
                    {onOpenSaaSSimulator && (
                      <button
                        type="button"
                        onClick={onOpenSaaSSimulator}
                        className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                      >
                        <TrendingUp size={11} /> Simular Escala MRR →
                      </button>
                    )}
                    <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                      {platformPayments.filter(p => p.status === 'paid').length}/{platformPayments.length} Pagos
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar pr-0.5">
                  {displayedPlatformPayments.map(p => (
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
                          Ref: {p.referenceMonth} • {p.activeStudentsCount || 85} alunos ativos • Venc: {p.dueDate}
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Faturas & Mensalidades ({filteredInvoices.length})
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportInvoicesCSV}
                    className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-400 hover:text-emerald-300 text-[11px] font-bold flex items-center gap-1.5 transition shadow-sm"
                    title="Exportar faturas em formato CSV para Excel"
                  >
                    <Download size={12} />
                    <span>Exportar CSV</span>
                  </button>
                  <button
                    onClick={onOpenFinancial}
                    className="text-emerald-400 hover:text-emerald-300 text-[11px] font-bold flex items-center gap-0.5"
                  >
                    Ver todas no Hub <ArrowUpRight size={12} />
                  </button>
                </div>
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

                      {/* Paid invoice WhatsApp receipt action */}
                      {inv.status === 'paid' && (
                        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                          <span className="text-emerald-400/80 font-medium">
                            ✓ Pagamento confirmado
                          </span>
                          <button
                            type="button"
                            onClick={() => sendReceiptViaWhatsApp(inv)}
                            className="px-2 py-0.5 rounded bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60 font-bold flex items-center gap-1 transition"
                            title="Enviar Comprovante de Quitação via WhatsApp"
                          >
                            <MessageCircle size={10} />
                            <span>Comprovante WhatsApp</span>
                          </button>
                        </div>
                      )}

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
                              onClick={() => sendReminderViaWhatsApp(inv, calc.totalUpdatedAmount)}
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

        {/* 3. CRM FUNIL DE VENDAS KANBAN */}
        {activeTab === 'crm' && (
          <div className="space-y-4">
            {/* Header with Stats & New Lead button */}
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                      CRM & Captação
                    </span>
                    <span className="text-xs text-slate-400">Funil de Vendas de Novos Alunos</span>
                  </div>
                  <h3 className="text-base font-black text-white mt-0.5">Pipeline Comercial do Tatame</h3>
                </div>

                <button
                  onClick={() => setIsNewLeadOpen(true)}
                  className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Lead / Interessado</span>
                </button>
              </div>

              {/* Conversion Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-800/80 text-center">
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Leads</span>
                  <span className="text-base font-black text-white font-mono">{leads.length}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] font-bold text-blue-400 uppercase block">Em Contato</span>
                  <span className="text-base font-black text-blue-300 font-mono">
                    {leads.filter(l => l.stage === 'contato_realizado').length}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] font-bold text-amber-400 uppercase block">Aulas Agendadas</span>
                  <span className="text-base font-black text-amber-300 font-mono">
                    {leads.filter(l => l.stage === 'aula_agendada' || l.stage === 'compareceu').length}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase block">Matrículas Fechadas</span>
                  <span className="text-base font-black text-emerald-400 font-mono">
                    {leads.filter(l => l.stage === 'matricula_fechada').length}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase block">Taxa Conversão</span>
                  <span className="text-base font-black text-indigo-300 font-mono">
                    {leads.length > 0
                      ? Math.round((leads.filter(l => l.stage === 'matricula_fechada').length / leads.length) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Kanban Columns */}
            <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
              {(
                [
                  { id: 'novo_lead', title: '1. Novo Lead', color: 'border-slate-700 text-slate-300 bg-slate-900/80', badge: 'bg-slate-800 text-slate-300' },
                  { id: 'contato_realizado', title: '2. Contato Feito', color: 'border-blue-800/80 text-blue-300 bg-blue-950/20', badge: 'bg-blue-950 text-blue-400 border border-blue-800' },
                  { id: 'aula_agendada', title: '3. Aula Agendada', color: 'border-amber-800/80 text-amber-300 bg-amber-950/20', badge: 'bg-amber-950 text-amber-400 border border-amber-800' },
                  { id: 'compareceu', title: '4. Compareceu', color: 'border-purple-800/80 text-purple-300 bg-purple-950/20', badge: 'bg-purple-950 text-purple-400 border border-purple-800' },
                  { id: 'matricula_fechada', title: '5. Matrícula Fechada', color: 'border-emerald-800/80 text-emerald-300 bg-emerald-950/30', badge: 'bg-emerald-950 text-emerald-400 border border-emerald-800' },
                  { id: 'perdido', title: '6. Perdido', color: 'border-red-900/60 text-red-400 bg-red-950/20', badge: 'bg-red-950 text-red-400 border border-red-900' }
                ] as const
              ).map(col => {
                const stageLeads = leads.filter(l => l.stage === col.id);
                return (
                  <div
                    key={col.id}
                    className={`min-w-[280px] max-w-[300px] rounded-2xl border p-3 flex flex-col gap-2.5 shrink-0 ${col.color}`}
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
                      <span className="text-xs font-black uppercase tracking-wider">{col.title}</span>
                      <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full ${col.badge}`}>
                        {stageLeads.length}
                      </span>
                    </div>

                    {/* Cards List */}
                    <div className="space-y-2.5 flex-1 min-h-[140px]">
                      {stageLeads.length === 0 ? (
                        <div className="h-full flex items-center justify-center p-4 text-[11px] text-slate-500 border border-dashed border-slate-800 rounded-xl">
                          Nenhum lead nesta etapa
                        </div>
                      ) : (
                        stageLeads.map(lead => (
                          <div
                            key={lead.id}
                            className="p-3 rounded-xl bg-slate-950 border border-slate-800 shadow-md space-y-2"
                          >
                            <div className="flex items-start justify-between gap-1">
                              <div className="min-w-0">
                                <h5 className="text-xs font-black text-white truncate">{lead.name}</h5>
                                <p className="text-[10px] text-slate-400 truncate">{lead.interest}</p>
                              </div>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0">
                                {lead.channel.toUpperCase()}
                              </span>
                            </div>

                            {lead.notes && (
                              <p className="text-[10px] text-slate-400 bg-slate-900 p-1.5 rounded border border-slate-800/80 italic">
                                "{lead.notes}"
                              </p>
                            )}

                            {lead.estimatedMonthlyFee && (
                              <div className="text-[10px] text-slate-400 flex items-center justify-between">
                                <span>Mensalidade prevista:</span>
                                <span className="font-mono font-bold text-emerald-400">
                                  {formatBRL(lead.estimatedMonthlyFee)}
                                </span>
                              </div>
                            )}

                            {/* WhatsApp Automations Buttons */}
                            <div className="pt-1.5 border-t border-slate-800/80 space-y-1">
                              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                Automação WhatsApp:
                              </div>
                              <div className="grid grid-cols-2 gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleSendLeadWhatsApp(lead, 'boas_vindas')}
                                  className="py-1 px-1.5 rounded bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-[10px] font-bold truncate transition"
                                  title="Enviar mensagem de Boas-Vindas & Convite de Aula"
                                >
                                  💬 Boas-Vindas
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSendLeadWhatsApp(lead, 'lembrete_aula')}
                                  className="py-1 px-1.5 rounded bg-amber-950/60 hover:bg-amber-900 border border-amber-800 text-amber-300 text-[10px] font-bold truncate transition"
                                  title="Enviar Lembrete de Aula Experimental"
                                >
                                  🥋 Lembrete Aula
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSendLeadWhatsApp(lead, 'matricula')}
                                  className="py-1 px-1.5 rounded bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-800 text-indigo-300 text-[10px] font-bold truncate transition"
                                  title="Boas-vindas à Família (Matrícula Fechada)"
                                >
                                  🎉 Matrícula
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSendLeadWhatsApp(lead, 'reengajamento')}
                                  className="py-1 px-1.5 rounded bg-purple-950/60 hover:bg-purple-900 border border-purple-800 text-purple-300 text-[10px] font-bold truncate transition"
                                  title="Reengajar contato antigo"
                                >
                                  🔄 Reengajar
                                </button>
                              </div>
                            </div>

                            {/* Move Pipeline Buttons */}
                            <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                              <button
                                type="button"
                                disabled={col.id === 'novo_lead'}
                                onClick={() => handleMoveLeadStage(lead.id, 'prev')}
                                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-[10px] font-bold text-slate-400 hover:text-white disabled:opacity-30 transition"
                              >
                                ← Voltar
                              </button>
                              <span className="text-[9px] text-slate-500 font-mono">{lead.date}</span>
                              <button
                                type="button"
                                disabled={col.id === 'perdido' || col.id === 'matricula_fechada'}
                                onClick={() => handleMoveLeadStage(lead.id, 'next')}
                                className="px-2 py-0.5 rounded bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-[10px] font-bold disabled:opacity-30 transition"
                              >
                                Avançar →
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Novo Lead */}
            {isNewLeadOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
                <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                      <UserPlus className="w-4 h-4 text-emerald-400" /> Cadastrar Novo Lead
                    </h4>
                    <button
                      onClick={() => setIsNewLeadOpen(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleAddLead} className="space-y-2.5">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                        Nome do Interessado:
                      </label>
                      <input
                        type="text"
                        required
                        value={newLeadName}
                        onChange={e => setNewLeadName(e.target.value)}
                        placeholder="Ex: Roberto Silveira"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                        WhatsApp (com DDD):
                      </label>
                      <input
                        type="text"
                        required
                        value={newLeadPhone}
                        onChange={e => setNewLeadPhone(e.target.value)}
                        placeholder="(11) 98888-7777"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                          Interesse:
                        </label>
                        <select
                          value={newLeadInterest}
                          onChange={e => setNewLeadInterest(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white"
                        >
                          <option value="Jiu-Jitsu Adulto Fundamentos">Adulto Fundamentos</option>
                          <option value="Jiu-Jitsu Feminino">Jiu-Jitsu Feminino</option>
                          <option value="BJJ Kids (Infantil)">BJJ Kids (Infantil)</option>
                          <option value="No-Gi & Submission">No-Gi & Submission</option>
                          <option value="Defesa Pessoal">Defesa Pessoal</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                          Canal de Origem:
                        </label>
                        <select
                          value={newLeadChannel}
                          onChange={e => setNewLeadChannel(e.target.value as any)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white"
                        >
                          <option value="instagram">Instagram</option>
                          <option value="indicacao">Indicação de Aluno</option>
                          <option value="google">Google / Site</option>
                          <option value="passante">Passante / Recepção</option>
                          <option value="whatsapp">WhatsApp Direto</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                        Observações / Histórico:
                      </label>
                      <textarea
                        rows={2}
                        value={newLeadNotes}
                        onChange={e => setNewLeadNotes(e.target.value)}
                        placeholder="Ex: Treinou 1 ano no passado, quer voltar para perder peso."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsNewLeadOpen(false)}
                        className="px-3 py-2 rounded-xl bg-slate-900 text-slate-400 text-xs font-bold"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md"
                      >
                        Salvar no Funil
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
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

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportAcademiesCSV}
                    className="px-3 py-3 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 transition shrink-0"
                    title="Exportar dados das filiais em CSV"
                  >
                    <Download size={14} />
                    <span className="hidden sm:inline">Exportar CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={onOpenAcademyRegistration}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs shadow-xl shadow-red-950 flex items-center justify-center gap-2 transition shrink-0"
                  >
                    <Plus size={15} />
                    <span>Cadastrar Nova Academia</span>
                  </button>
                </div>
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

      {/* Due Alerts Drawer */}
      <DueAlertsDrawer
        isOpen={isDueAlertsOpen}
        onClose={() => setIsDueAlertsOpen(false)}
        invoices={invoices}
        activeAcademyName={activeAcademyName}
      />

      {/* Modal de Horários de Funcionamento da Academia Ativa */}
      {isOperatingHoursModalOpen && (
        <AcademyOperatingHoursModal
          isOpen={isOperatingHoursModalOpen}
          onClose={() => setIsOperatingHoursModalOpen(false)}
          academy={
            (academies && academies.find(a => a.id === activeAcademyId)) ||
            (academies && academies[0]) || {
              id: 'acad_loyalty_jiujitsu',
              name: activeAcademyName || 'Loyalty Jiu-Jitsu',
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
              operatingHours: undefined,
              createdAt: new Date().toISOString()
            } as RegisteredAcademy
          }
        />
      )}

      {/* Modal de Auditoria e Integridade Firestore ↔ LocalStorage */}
      {isDataIntegrityModalOpen && (
        <DataIntegrityModal
          isOpen={isDataIntegrityModalOpen}
          onClose={() => setIsDataIntegrityModalOpen(false)}
          activeAcademyName={activeAcademyName}
        />
      )}
    </div>
  );
};
