import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, DollarSign, Calculator, TrendingUp, AlertTriangle, CheckCircle2, 
  Clock, ShieldAlert, ShieldCheck, Lock, Unlock, Building2, 
  Receipt, ArrowUpRight, Copy, Check, MessageSquare, QrCode, 
  Calendar, RefreshCw, Plus, Filter, Sparkles, ChevronRight, Award, Sliders,
  Edit3, Zap, FileSpreadsheet, Printer, Download, FileText
} from 'lucide-react';
import { 
  Invoice, RegisteredAcademy, AcademyPricingPlan, FinancialAccessProfile, 
  PlatformGeneralManager, PlatformAcademyPayment 
} from '../../types';
import { defaultPlatformGeneralManager, mockPlatformAcademyPayments } from '../../data/mockData';
import { calculateLateFeeAndInterest, formatBRL } from '../../utils/financialCalculations';
import { safeLocalStorageGet, safeLocalStorageSet } from '../../utils/safeStorage';

interface FinancialHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  academies: RegisteredAcademy[];
  invoices: Invoice[];
  activeAcademy: RegisteredAcademy;
  onUpdateInvoices?: (invoices: Invoice[]) => void;
  onOpenVoiceNotice?: (title: string, body: string) => void;
  generalManager?: PlatformGeneralManager;
  onUpdateGeneralManager?: (gm: PlatformGeneralManager) => void;
  isGeneralManager?: boolean;
}

export const FinancialHubModal: React.FC<FinancialHubModalProps> = ({
  isOpen,
  onClose,
  academies,
  invoices: initialInvoices,
  activeAcademy,
  onUpdateInvoices,
  onOpenVoiceNotice,
  generalManager = defaultPlatformGeneralManager,
  onUpdateGeneralManager,
  isGeneralManager = true
}) => {
  // Local Invoices State
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  
  // Financial RBAC Profile: 'general_manager' (Super Admin BJJ ACADEMY) vs 'unit_manager' (Unit Local Manager)
  const [accessProfile, setAccessProfile] = useState<FinancialAccessProfile>(
    isGeneralManager ? 'general_manager' : 'unit_manager'
  );
  
  // When unit_manager, lock to this academyId
  const [assignedUnitId, setAssignedUnitId] = useState<string>(activeAcademy.id || academies[0]?.id);
  
  // Selected Academy Filter for view ('all' only allowed for general_manager)
  const [selectedAcademyFilter, setSelectedAcademyFilter] = useState<string>(
    isGeneralManager ? 'all' : (activeAcademy.id || academies[0]?.id)
  );

  useEffect(() => {
    if (isGeneralManager) {
      setAccessProfile('general_manager');
    } else {
      setAccessProfile('unit_manager');
      const unitId = activeAcademy.id || academies[0]?.id;
      setAssignedUnitId(unitId);
      setSelectedAcademyFilter(unitId);
    }
  }, [isGeneralManager, activeAcademy.id, academies]);
  
  // Sub-tabs: 'overview' | 'invoices' | 'calculator' | 'plans' | 'repasses' | 'new_charge' | 'accounting'
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'calculator' | 'plans' | 'repasses' | 'new_charge' | 'accounting'>('overview');
  
  // State for Fechamento Contábil (Item 4)
  const [accountingMonth, setAccountingMonth] = useState<string>('09/2026');
  const [copiedDre, setCopiedDre] = useState<boolean>(false);
  
  // Filter for invoices status
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');

  // Platform General Manager state (Messias Batista da Silva junior)
  const [gmData, setGmData] = useState<PlatformGeneralManager>(generalManager);
  const [copiedPlatformPix, setCopiedPlatformPix] = useState(false);
  const [isEditingGm, setIsEditingGm] = useState(false);
  const [editGmName, setEditGmName] = useState(generalManager.name);
  const [editGmCpf, setEditGmCpf] = useState(generalManager.cpf);
  const [editGmPix, setEditGmPix] = useState(generalManager.pixKey);
  const [editGmPurpose, setEditGmPurpose] = useState(generalManager.purpose);
  const [gmSaveSuccess, setGmSaveSuccess] = useState(false);

  // Platform payments from academies
  const [platformPayments, setPlatformPayments] = useState<PlatformAcademyPayment[]>(() => {
    return safeLocalStorageGet<PlatformAcademyPayment[]>('bjj_platform_payments', mockPlatformAcademyPayments);
  });
  const [selectedRepasseForPix, setSelectedRepasseForPix] = useState<PlatformAcademyPayment | null>(null);

  const handleCopyPlatformPix = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(gmData.pixKey);
    }
    setCopiedPlatformPix(true);
    setTimeout(() => setCopiedPlatformPix(false), 2500);
  };

  const handleSaveGm = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCpf = editGmCpf.replace(/\D/g, '');
    const formatted = cleanCpf.length === 11 
      ? cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
      : editGmCpf;

    const updated: PlatformGeneralManager = {
      ...gmData,
      name: editGmName.trim(),
      cpf: cleanCpf,
      formattedCpf: formatted,
      pixKey: editGmPix.trim(),
      purpose: editGmPurpose.trim(),
    };
    setGmData(updated);
    safeLocalStorageSet('bjj_general_manager', updated);
    if (onUpdateGeneralManager) {
      onUpdateGeneralManager(updated);
    }
    setGmSaveSuccess(true);
    setTimeout(() => {
      setGmSaveSuccess(false);
      setIsEditingGm(false);
    }, 1200);
  };

  const handleTogglePlatformPayment = (id: string) => {
    const updated = platformPayments.map(p => {
      if (p.id === id) {
        const isNowPaid = p.status !== 'paid';
        return {
          ...p,
          status: isNowPaid ? 'paid' : 'pending',
          paidDate: isNowPaid ? '02/09/2026' : undefined
        } as PlatformAcademyPayment;
      }
      return p;
    });
    setPlatformPayments(updated);
    safeLocalStorageSet('bjj_platform_payments', updated);
  };
  
  // Interactive Calculator State
  const [simBaseAmount, setSimBaseAmount] = useState<number>(260);
  const [simDaysOverdue, setSimDaysOverdue] = useState<number>(18);
  const [simFinePercent, setSimFinePercent] = useState<number>(2.0);
  const [simMonthlyInterest, setSimMonthlyInterest] = useState<number>(1.0);
  const [copiedInvoiceId, setCopiedInvoiceId] = useState<string | null>(null);

  // New Charge Modal/Form State
  const [newStudentName, setNewStudentName] = useState('');
  const [newPlanName, setNewPlanName] = useState('Mensal Ilimitado');
  const [newAmount, setNewAmount] = useState(260);
  const [newDueDate, setNewDueDate] = useState('10/09/2026');
  const [newAcademyId, setNewAcademyId] = useState(activeAcademy.id);
  const [newChargeSuccess, setNewChargeSuccess] = useState(false);

  // Security check: if in 'unit_manager' mode, force selection to assignedUnitId
  const effectiveAcademyId = accessProfile === 'general_manager' ? selectedAcademyFilter : assignedUnitId;

  // Sync effective academy pricing
  const currentAcademyData = useMemo(() => {
    return academies.find(a => a.id === (effectiveAcademyId === 'all' ? activeAcademy.id : effectiveAcademyId)) || academies[0];
  }, [academies, effectiveAcademyId, activeAcademy]);

  // Filtered invoices according to permissions and unit filter
  const visibleInvoices = useMemo(() => {
    return invoices.filter(inv => {
      // Security Enforcement: unit manager can ONLY see invoices from assignedUnitId
      if (accessProfile === 'unit_manager') {
        if (inv.academyId !== assignedUnitId) return false;
      } else {
        // general_manager can see all or specific unit
        if (selectedAcademyFilter !== 'all' && inv.academyId !== selectedAcademyFilter) {
          return false;
        }
      }
      // Status filter
      if (invoiceStatusFilter !== 'all' && inv.status !== invoiceStatusFilter) {
        return false;
      }
      return true;
    });
  }, [invoices, accessProfile, assignedUnitId, selectedAcademyFilter, invoiceStatusFilter]);

  // Financial Metrics Calculation
  const metrics = useMemo(() => {
    // Invoices under current scope (ignoring status filter)
    const scopeInvoices = invoices.filter(inv => {
      if (accessProfile === 'unit_manager') {
        return inv.academyId === assignedUnitId;
      }
      return selectedAcademyFilter === 'all' ? true : inv.academyId === selectedAcademyFilter;
    });

    let totalPaid = 0;
    let totalPending = 0;
    let totalOverdueOriginal = 0;
    let totalOverdueCalculated = 0;
    let totalFines = 0;
    let totalInterest = 0;
    let countPaid = 0;
    let countPending = 0;
    let countOverdue = 0;

    scopeInvoices.forEach(inv => {
      if (inv.status === 'paid') {
        totalPaid += inv.amount;
        countPaid++;
      } else if (inv.status === 'pending') {
        totalPending += inv.amount;
        countPending++;
      } else if (inv.status === 'overdue') {
        countOverdue++;
        totalOverdueOriginal += inv.amount;
        
        // Compute dynamically if not pre-computed
        const calc = calculateLateFeeAndInterest(
          inv.amount,
          inv.dueDate,
          new Date(2026, 8, 2), // 02/09/2026
          inv.lateFeePercent || 2.0,
          (inv.dailyInterestPercent ? inv.dailyInterestPercent * 30 : 1.0)
        );
        totalFines += calc.fineAmount;
        totalInterest += calc.interestAmount;
        totalOverdueCalculated += calc.totalUpdatedAmount;
      }
    });

    const totalEmitted = totalPaid + totalPending + totalOverdueOriginal;
    const defaultRate = totalEmitted > 0 ? (totalOverdueOriginal / totalEmitted) * 100 : 0;

    return {
      totalPaid,
      totalPending,
      totalOverdueOriginal,
      totalOverdueCalculated,
      totalFines,
      totalInterest,
      countPaid,
      countPending,
      countOverdue,
      totalEmitted,
      defaultRate
    };
  }, [invoices, accessProfile, assignedUnitId, selectedAcademyFilter]);

  // Comparative Academy Performance for General Manager
  const academyComparatives = useMemo(() => {
    return academies.map(acad => {
      const acadInvoices = invoices.filter(inv => inv.academyId === acad.id);
      const paid = acadInvoices.filter(i => i.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
      const overdue = acadInvoices.filter(i => i.status === 'overdue').reduce((acc, curr) => acc + curr.amount, 0);
      const pending = acadInvoices.filter(i => i.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0);
      const total = paid + overdue + pending;
      const defaultRate = total > 0 ? (overdue / total) * 100 : 0;
      return {
        ...acad,
        paid,
        overdue,
        pending,
        total,
        defaultRate,
        invoicesCount: acadInvoices.length
      };
    });
  }, [academies, invoices]);

  // Mark invoice as paid
  const handleMarkAsPaid = (invoiceId: string) => {
    const updated = invoices.map(inv => {
      if (inv.id === invoiceId) {
        return {
          ...inv,
          status: 'paid' as const,
          paidDate: 'Hoje às 14:10',
          paymentMethod: 'pix' as const
        };
      }
      return inv;
    });
    setInvoices(updated);
    if (onUpdateInvoices) onUpdateInvoices(updated);
  };

  // Copy PIX & Details
  const handleCopyPix = (inv: Invoice, updatedAmount: number) => {
    const textToCopy = `BJJ ACADEMY - 2ª Via Atualizada com Juros e Multa\nAluno: ${inv.studentName}\nAcademia: ${inv.academyName}\nValor Original: ${formatBRL(inv.amount)}\nValor Atualizado: ${formatBRL(updatedAmount)}\nCódigo PIX:\n${inv.pixCode || '00020126580014br.gov.bcb.pix0136bjjacademy-asaas-pix'}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedInvoiceId(inv.id);
    setTimeout(() => setCopiedInvoiceId(null), 2500);
  };

  // Create new charge
  const handleCreateCharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName) return;

    const targetAcademy = academies.find(a => a.id === (accessProfile === 'unit_manager' ? assignedUnitId : newAcademyId)) || academies[0];

    const newInv: Invoice = {
      id: `inv_${Date.now()}`,
      studentId: `stu_${Date.now()}`,
      studentName: newStudentName,
      title: `${newPlanName} - ${newDueDate.split('/')[1] || '09'}/2026`,
      amount: Number(newAmount),
      dueDate: newDueDate,
      status: 'pending',
      academyId: targetAcademy.id,
      academyName: targetAcademy.name,
      planName: newPlanName,
      lateFeePercent: targetAcademy.defaultFinePercent || 2.0,
      dailyInterestPercent: (targetAcademy.defaultMonthlyInterestPercent || 1.0) / 30,
      pixCode: `00020126580014br.gov.bcb.pix0136${targetAcademy.id}-pix-${Number(newAmount)}`,
      invoiceNumber: `FAT-${targetAcademy.shortName.toUpperCase().replace(/\s+/g, '')}-${Date.now().toString().slice(-4)}`
    };

    const updated = [newInv, ...invoices];
    setInvoices(updated);
    if (onUpdateInvoices) onUpdateInvoices(updated);
    setNewChargeSuccess(true);
    setTimeout(() => {
      setNewChargeSuccess(false);
      setNewStudentName('');
      setActiveTab('invoices');
    }, 1500);
  };

  // Simulator calculation
  const simCalc = useMemo(() => {
    // 1. Multa
    const fine = Math.round((simBaseAmount * (simFinePercent / 100)) * 100) / 100;
    // 2. Juros diários
    const dailyRate = (simMonthlyInterest / 30) / 100;
    const interest = Math.round((simBaseAmount * dailyRate * simDaysOverdue) * 100) / 100;
    const total = Math.round((simBaseAmount + fine + interest) * 100) / 100;

    return {
      fine,
      interest,
      total,
      dailyRatePercent: simMonthlyInterest / 30
    };
  }, [simBaseAmount, simDaysOverdue, simFinePercent, simMonthlyInterest]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* TOP BAR / RBAC HEADER */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-lg shrink-0">
                <DollarSign className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                    Financeiro & Gestão de Mensalidades
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={11} /> Multi-Academia
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Cálculo automático de juros e multas por atraso com segregação de contas por filial.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Fechar"
            >
              <X size={20} />
            </button>
          </div>

          {/* RBAC CONTROLLER SWITCHER */}
          <div className="p-2.5 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                Perfil de Acesso:
              </span>
              {isGeneralManager ? (
                <div className="inline-flex p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setAccessProfile('general_manager')}
                    className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition ${
                      accessProfile === 'general_manager'
                        ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Unlock size={13} />
                    <span>Gestor Geral BJJ ACADEMY (Super Admin)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAccessProfile('unit_manager');
                      setSelectedAcademyFilter(assignedUnitId);
                    }}
                    className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition ${
                      accessProfile === 'unit_manager'
                        ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Lock size={13} />
                    <span>Simular Visão Filial</span>
                  </button>
                </div>
              ) : (
                <div className="px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 font-bold text-xs flex items-center gap-2">
                  <Lock size={13} className="text-cyan-400" />
                  <span>Gestor da Academia (Blindagem Ativa - Apenas {activeAcademy.name})</span>
                </div>
              )}
            </div>

            {/* If Unit Manager: Select Assigned Unit; If General Manager: Filter Academy */}
            {accessProfile === 'unit_manager' ? (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-[11px] text-cyan-400 font-bold flex items-center gap-1">
                  <ShieldCheck size={14} /> Minha Academia:
                </span>
                {isGeneralManager ? (
                  <select
                    value={assignedUnitId}
                    onChange={(e) => {
                      setAssignedUnitId(e.target.value);
                      setSelectedAcademyFilter(e.target.value);
                    }}
                    className="bg-slate-900 border border-cyan-500/40 text-white text-xs rounded-xl px-3 py-1.5 font-bold focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  >
                    {academies.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.branch})
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="bg-slate-900 border border-cyan-500/40 text-cyan-200 text-xs rounded-xl px-3 py-1.5 font-bold">
                    {activeAcademy.name} ({activeAcademy.branch})
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
                  <Building2 size={14} /> Filtrar Academia:
                </span>
                <select
                  value={selectedAcademyFilter}
                  onChange={(e) => setSelectedAcademyFilter(e.target.value)}
                  className="bg-slate-900 border border-amber-500/40 text-white text-xs rounded-xl px-3 py-1.5 font-bold focus:outline-none focus:ring-1 focus:ring-amber-400"
                >
                  <option value="all">🌐 Todas as Academias (Consolidado Rede)</option>
                  {academies.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.city})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Privacy & Security Enforcement Notice */}
          {accessProfile === 'unit_manager' ? (
            <div className="px-3 py-2 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-cyan-300 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  <strong>Acesso Restrito:</strong> Você tem permissão de visualização exclusivamente para <strong>{academies.find(a => a.id === assignedUnitId)?.name}</strong>. Finanças de outras filiais estão inacessíveis.
                </span>
              </div>
              <span className="text-[10px] bg-cyan-900/60 text-cyan-200 px-2 py-0.5 rounded font-mono font-bold">
                ISOLAMENTO ATIVO
              </span>
            </div>
          ) : (
            <div className="px-3 py-2 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Unlock className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <strong>Gestor Geral BJJ ACADEMY:</strong> <span className="text-white font-black">{gmData.name}</span> (CPF: <span className="font-mono text-slate-300">{gmData.formattedCpf || gmData.cpf}</span> • PIX: <span className="font-mono text-emerald-300 font-bold">{gmData.pixKey}</span>)
                  <div className="text-[11px] text-amber-400/80">Visão total e irrestrita de todas as unidades da rede BJJ ACADEMY e recebimento de repasses da plataforma.</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditingGm(true)}
                  className="text-[10px] bg-slate-900 hover:bg-slate-850 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition"
                >
                  <Edit3 size={11} /> Editar Gestor
                </button>
                <span className="text-[10px] bg-amber-900/60 text-amber-200 px-2 py-0.5 rounded font-mono font-bold">
                  ACESSO TOTAL
                </span>
              </div>
            </div>
          )}
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center gap-1 sm:gap-2 px-4 py-2.5 bg-slate-950 border-b border-slate-800 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'overview'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <TrendingUp size={14} />
            <span>Visão Geral & Métricas</span>
          </button>

          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'invoices'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Receipt size={14} />
            <span>Faturas & Cobranças ({visibleInvoices.length})</span>
            {metrics.countOverdue > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-black animate-pulse">
                {metrics.countOverdue}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'calculator'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Calculator size={14} />
            <span>Calculadora de Juros & Multas</span>
          </button>

          <button
            onClick={() => setActiveTab('plans')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'plans'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sliders size={14} />
            <span>Planos & Tabela de Preços</span>
          </button>

          <button
            onClick={() => setActiveTab('repasses')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'repasses'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-amber-400/90 hover:text-amber-300 hover:bg-amber-950/40 border border-amber-500/30'
            }`}
          >
            <Sparkles size={14} />
            <span>Repasses da Plataforma (Gestor Geral)</span>
          </button>

          <button
            onClick={() => setActiveTab('new_charge')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'new_charge'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Plus size={14} />
            <span>Emitir Nova Cobrança</span>
          </button>

          {/* Item 4: Relatório Fechado para Contabilidade */}
          <button
            onClick={() => setActiveTab('accounting')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'accounting'
                ? 'bg-slate-200 text-slate-950 shadow-md font-black'
                : 'text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60'
            }`}
          >
            <FileSpreadsheet size={14} className={activeTab === 'accounting' ? 'text-slate-950' : 'text-amber-400'} />
            <span>Fechamento Contábil</span>
          </button>
        </div>

        {/* BODY CONTENT SCROLLABLE */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* TAB 1: OVERVIEW & METRICS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* SUMMARY STATS GRID */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* 1. Total Liquidado */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-800/40 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                    <span>Total Liquidado</span>
                    <CheckCircle2 size={16} />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white">
                    {formatBRL(metrics.totalPaid)}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {metrics.countPaid} mensalidades pagas
                  </div>
                </div>

                {/* 2. A Vencer / Pendente */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/40 to-slate-900 border border-blue-800/40 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-blue-400">
                    <span>A Vencer (No Prazo)</span>
                    <Clock size={16} />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white">
                    {formatBRL(metrics.totalPending)}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {metrics.countPending} mensalidades aguardando
                  </div>
                </div>

                {/* 3. Em Atraso (Valor Original) */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-red-950/40 to-slate-900 border border-red-800/40 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-red-400">
                    <span>Em Atraso (Base)</span>
                    <AlertTriangle size={16} />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white">
                    {formatBRL(metrics.totalOverdueOriginal)}
                  </div>
                  <div className="text-[11px] text-red-300 font-semibold">
                    Inadimplência: {metrics.defaultRate.toFixed(1)}%
                  </div>
                </div>

                {/* 4. Total Corrigido com Multa & Juros */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 to-slate-900 border border-amber-700/50 space-y-1 shadow-lg shadow-amber-950/20">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                    <span>Atualizado c/ Juros</span>
                    <Calculator size={16} />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-amber-300">
                    {formatBRL(metrics.totalOverdueCalculated)}
                  </div>
                  <div className="text-[11px] text-amber-400/90 font-mono">
                    +{formatBRL(metrics.totalFines + metrics.totalInterest)} (Multa + Juros)
                  </div>
                </div>
              </div>

              {/* LATE FEE CALCULATION BANNER */}
              <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <h4 className="text-sm font-bold text-white">
                      Regra de Juros & Multas Automática Ativa
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400">
                    Multa fixa de <strong>2,00%</strong> após o vencimento + Juros diários de <strong>0,033% ao dia</strong> (1,0% ao mês pro-rata die).
                    O sistema atualiza o código PIX dinamicamente com o valor total recalculado.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('calculator')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs flex items-center gap-1.5 border border-slate-700 shrink-0 transition"
                >
                  <Calculator size={14} /> Abrir Simulador de Juros
                </button>
              </div>

              {/* MULTI-ACADEMY COMPARATIVE (ONLY FOR GENERAL MANAGER) */}
              {accessProfile === 'general_manager' ? (
                <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-amber-400" />
                        Desempenho Financeiro por Unidade Cadastrada
                      </h4>
                      <p className="text-xs text-slate-400">
                        Cada filial possui planos, mensalidades e contas financeiras individualizadas.
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-800">
                      Rede BJJ ACADEMY ({academies.length} Filiais)
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="pb-3">Academia / Filial</th>
                          <th className="pb-3">Mensalidade Base</th>
                          <th className="pb-3">Liquidado</th>
                          <th className="pb-3">Em Atraso</th>
                          <th className="pb-3">Inadimplência</th>
                          <th className="pb-3 text-right">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850">
                        {academyComparatives.map((acad) => (
                          <tr key={acad.id} className="hover:bg-slate-900/50 transition">
                            <td className="py-3 pr-2">
                              <div className="font-bold text-white">{acad.name}</div>
                              <div className="text-[11px] text-slate-400">{acad.branch} • {acad.city}</div>
                            </td>
                            <td className="py-3">
                              <span className="font-mono font-bold text-emerald-400">
                                {formatBRL(acad.pricingPlans?.[0]?.price || 220)}
                              </span>
                              <div className="text-[10px] text-slate-400">
                                {acad.pricingPlans?.[0]?.name || 'Plano Padrão'}
                              </div>
                            </td>
                            <td className="py-3 font-mono font-bold text-white">
                              {formatBRL(acad.paid)}
                            </td>
                            <td className="py-3 font-mono font-bold text-red-400">
                              {formatBRL(acad.overdue)}
                            </td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                acad.defaultRate > 15
                                  ? 'bg-red-950 text-red-400 border border-red-800'
                                  : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              }`}>
                                {acad.defaultRate.toFixed(1)}%
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => {
                                  setSelectedAcademyFilter(acad.id);
                                  setActiveTab('invoices');
                                }}
                                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition inline-flex items-center gap-1"
                              >
                                <span>Ver Faturas</span>
                                <ChevronRight size={12} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* UNIT MANAGER VIEW BANNER */
                <div className="p-5 rounded-3xl bg-slate-950 border border-cyan-800/40 space-y-3">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                    <Building2 size={16} />
                    <span>Dados da Sua Unidade: {currentAcademyData.name}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400">Conta Bancária da Unidade:</span>
                      <p className="font-bold text-white mt-0.5">{currentAcademyData.bankAccount || 'Banco Itaú Ag 0920 CC 44210-9'}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400">Chave PIX da Filial:</span>
                      <p className="font-bold text-emerald-400 mt-0.5 font-mono">{currentAcademyData.pixKey || 'pix@bjjacademy.com.br'}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400">Meta Mensal da Unidade:</span>
                      <p className="font-bold text-amber-400 mt-0.5 font-mono">{formatBRL(currentAcademyData.monthlyRevenueTarget || 60000)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INVOICES & COBRANÇAS */}
          {activeTab === 'invoices' && (
            <div className="space-y-4">
              {/* FILTERS & STATUS BAR */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <button
                    onClick={() => setInvoiceStatusFilter('all')}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      invoiceStatusFilter === 'all'
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Todas ({invoices.length})
                  </button>
                  <button
                    onClick={() => setInvoiceStatusFilter('overdue')}
                    className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                      invoiceStatusFilter === 'overdue'
                        ? 'bg-red-600 text-white'
                        : 'text-red-400 hover:text-white'
                    }`}
                  >
                    <AlertTriangle size={12} />
                    Em Atraso ({invoices.filter(i => i.status === 'overdue').length})
                  </button>
                  <button
                    onClick={() => setInvoiceStatusFilter('pending')}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      invoiceStatusFilter === 'pending'
                        ? 'bg-blue-600 text-white'
                        : 'text-blue-400 hover:text-white'
                    }`}
                  >
                    A Vencer ({invoices.filter(i => i.status === 'pending').length})
                  </button>
                  <button
                    onClick={() => setInvoiceStatusFilter('paid')}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      invoiceStatusFilter === 'paid'
                        ? 'bg-emerald-600 text-white'
                        : 'text-emerald-400 hover:text-white'
                    }`}
                  >
                    Pagas ({invoices.filter(i => i.status === 'paid').length})
                  </button>
                </div>

                <div className="text-xs text-slate-400">
                  Visualizando: <span className="font-bold text-white">{visibleInvoices.length} faturas</span>
                  {selectedAcademyFilter !== 'all' && (
                    <span className="text-amber-400 ml-1">
                      (Filtrado por filial)
                    </span>
                  )}
                </div>
              </div>

              {/* INVOICES LIST */}
              <div className="space-y-3">
                {visibleInvoices.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 text-sm">
                    Nenhuma fatura encontrada com os filtros selecionados.
                  </div>
                ) : (
                  visibleInvoices.map((inv) => {
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
                        className={`p-4 rounded-2xl border transition-all ${
                          inv.status === 'overdue'
                            ? 'bg-red-950/20 border-red-800/60 shadow-md'
                            : inv.status === 'paid'
                            ? 'bg-slate-900/60 border-slate-800'
                            : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 font-bold">
                              {inv.studentName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-white text-sm">{inv.studentName}</h4>
                                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                                  {inv.invoiceNumber}
                                </span>
                              </div>
                              <p className="text-xs text-slate-300">{inv.title}</p>
                              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                <span className="text-amber-400 font-semibold">{inv.academyName}</span>
                                <span>•</span>
                                <span>Vencimento: {inv.dueDate}</span>
                              </div>
                            </div>
                          </div>

                          {/* AMOUNTS & STATUS */}
                          <div className="flex items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto gap-4">
                            <div className="sm:text-right">
                              {inv.status === 'overdue' ? (
                                <div>
                                  <div className="text-[10px] text-slate-400 line-through">
                                    Base: {formatBRL(inv.amount)}
                                  </div>
                                  <div className="text-base font-black text-red-400 flex items-center gap-1 sm:justify-end">
                                    <span>{formatBRL(calc.totalUpdatedAmount)}</span>
                                  </div>
                                  <div className="text-[10px] text-amber-300 font-bold">
                                    +{formatBRL(calc.fineAmount + calc.interestAmount)} (Multa + Juros)
                                  </div>
                                </div>
                              ) : (
                                <div className="text-base font-black text-white">
                                  {formatBRL(inv.amount)}
                                </div>
                              )}

                              <div className="mt-1">
                                {inv.status === 'paid' && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                                    Liquidado ({inv.paidDate || 'Pago'})
                                  </span>
                                )}
                                {inv.status === 'pending' && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950 text-blue-400 border border-blue-800">
                                    Aguardando Pagamento
                                  </span>
                                )}
                                {inv.status === 'overdue' && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-950 text-red-400 border border-red-800 flex items-center gap-1">
                                    <AlertTriangle size={10} />
                                    {calc.daysOverdue} dias em atraso
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* ACTIONS */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              {inv.status !== 'paid' && (
                                <button
                                  type="button"
                                  onClick={() => handleCopyPix(inv, calc.totalUpdatedAmount)}
                                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition"
                                  title="Copiar PIX e Dados Atualizados com Juros"
                                >
                                  {copiedInvoiceId === inv.id ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                                </button>
                              )}

                              {inv.status !== 'paid' && (
                                <button
                                  type="button"
                                  onClick={() => handleMarkAsPaid(inv.id)}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
                                >
                                  Dar Baixa
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* DETAILED FORMULA ACCORDION FOR OVERDUE */}
                        {inv.status === 'overdue' && (
                          <div className="mt-3 pt-2.5 border-t border-red-900/40 text-[11px] text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-red-950/30 p-2.5 rounded-xl">
                            <div className="space-y-0.5">
                              <span className="font-bold text-red-300 flex items-center gap-1">
                                <Calculator size={12} /> Detalhamento do Cálculo Legal:
                              </span>
                              <p className="text-slate-400">
                                Valor Base: <strong>{formatBRL(inv.amount)}</strong> | Multa ({inv.lateFeePercent || 2}%): <strong>{formatBRL(calc.fineAmount)}</strong> | Juros ({calc.daysOverdue} dias x 0,033%/dia): <strong>{formatBRL(calc.interestAmount)}</strong>
                              </p>
                            </div>

                            <button
                              onClick={() => {
                                const msg = `Olá ${inv.studentName}! Notificação de cobrança da ${inv.academyName}: Sua mensalidade de ${formatBRL(inv.amount)} venceu em ${inv.dueDate} (${calc.daysOverdue} dias de atraso). O total atualizado com multa e juros é de ${formatBRL(calc.totalUpdatedAmount)}. Chave PIX: ${inv.pixCode || 'financeiro@bjjacademy.com.br'}`;
                                window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                              }}
                              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm shrink-0 transition"
                            >
                              <MessageSquare size={12} /> Cobrar via WhatsApp
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CALCULADORA INTERATIVA DE JUROS E MULTAS */}
          {activeTab === 'calculator' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    <Calculator size={16} />
                  </div>
                  <h3 className="text-base font-bold text-white">
                    Simulador & Calculadora Oficial de Atraso
                  </h3>
                </div>
                <p className="text-xs text-slate-400">
                  Simule qualquer mensalidade com a taxa de multa e juros diários configurados para cada filial da BJJ ACADEMY.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* INPUTS PANEL */}
                <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Parâmetros da Mensalidade
                  </h4>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-semibold">
                      Valor Original da Mensalidade (R$)
                    </label>
                    <input
                      type="number"
                      value={simBaseAmount}
                      onChange={(e) => setSimBaseAmount(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-semibold">Dias Corridos em Atraso</span>
                      <span className="text-amber-400 font-mono font-bold">{simDaysOverdue} dias</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="120"
                      value={simDaysOverdue}
                      onChange={(e) => setSimDaysOverdue(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-semibold">
                        Multa Fixa (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={simFinePercent}
                        onChange={(e) => setSimFinePercent(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-xs"
                      />
                      <span className="text-[10px] text-slate-500">Padrão legal: 2,0%</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-semibold">
                        Juros Mensais (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={simMonthlyInterest}
                        onChange={(e) => setSimMonthlyInterest(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-xs"
                      />
                      <span className="text-[10px] text-slate-500">Padrão legal: 1,0%/mês</span>
                    </div>
                  </div>
                </div>

                {/* RESULT BREAKDOWN PANEL */}
                <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-amber-500/30 space-y-4 shadow-xl">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={14} /> Memória de Cálculo Detalhada
                  </h4>

                  <div className="space-y-3 divide-y divide-slate-800 text-xs">
                    <div className="flex items-center justify-between pb-2">
                      <span className="text-slate-400">Valor Base da Mensalidade:</span>
                      <span className="font-mono font-bold text-white text-sm">{formatBRL(simBaseAmount)}</span>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div>
                        <span className="text-slate-400">Multa por Atraso ({simFinePercent}%):</span>
                        <div className="text-[10px] text-slate-500">Aplicada uma única vez sobre o principal</div>
                      </div>
                      <span className="font-mono font-bold text-amber-400">+{formatBRL(simCalc.fine)}</span>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div>
                        <span className="text-slate-400">Juros de Mora ({simDaysOverdue} dias x {(simCalc.dailyRatePercent).toFixed(3)}%/dia):</span>
                        <div className="text-[10px] text-slate-500">Pro-rata die (1% a cada 30 dias corridos)</div>
                      </div>
                      <span className="font-mono font-bold text-amber-400">+{formatBRL(simCalc.interest)}</span>
                    </div>

                    <div className="flex items-center justify-between pt-3 text-sm">
                      <span className="font-bold text-white">TOTAL ATUALIZADO A COBRAR:</span>
                      <span className="font-mono font-black text-xl text-emerald-400">{formatBRL(simCalc.total)}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        const copyTxt = `BJJ ACADEMY - Cálculo de Atraso\nValor Original: ${formatBRL(simBaseAmount)}\nDias em atraso: ${simDaysOverdue}\nMulta (2%): ${formatBRL(simCalc.fine)}\nJuros Mora (${simDaysOverdue}d): ${formatBRL(simCalc.interest)}\nTotal a pagar: ${formatBRL(simCalc.total)}`;
                        navigator.clipboard.writeText(copyTxt);
                        alert('Cálculo copiado para a área de transferência!');
                      }}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition"
                    >
                      <Copy size={14} /> Copiar Discriminação para WhatsApp / Recibo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRICING PLANS BY ACADEMY */}
          {activeTab === 'plans' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-amber-400" />
                    Tabela de Planos da Academia: {currentAcademyData.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Valores específicos praticados na filial ({currentAcademyData.branch}).
                  </p>
                </div>

                {accessProfile === 'general_manager' && (
                  <select
                    value={currentAcademyData.id}
                    onChange={(e) => setSelectedAcademyFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-1.5 font-bold"
                  >
                    {academies.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {currentAcademyData.pricingPlans?.map((plan) => (
                  <div
                    key={plan.id}
                    className={`p-5 rounded-3xl border flex flex-col justify-between space-y-4 relative ${
                      plan.isPopular
                        ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-amber-500/50 shadow-xl'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    {plan.isPopular && (
                      <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wide shadow-md">
                        Mais Escolhido
                      </span>
                    )}

                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-white">{plan.name}</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {plan.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 space-y-1">
                      <div className="text-xs text-slate-400">Valor do Plano:</div>
                      <div className="text-2xl font-black text-emerald-400 font-mono">
                        {formatBRL(plan.price)}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {plan.periodMonths > 1
                          ? `Equivalente a ${formatBRL(plan.monthlyEquivalent)}/mês`
                          : 'Cobrança mensal recorrente'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: NEW CHARGE EMISSION */}
          {activeTab === 'new_charge' && (
            <div className="max-w-xl mx-auto p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Plus size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Emitir Nova Fatura / Mensalidade</h3>
                  <p className="text-xs text-slate-400">Gera código PIX instantâneo e notificação de cobrança.</p>
                </div>
              </div>

              {newChargeSuccess ? (
                <div className="p-6 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <h4 className="font-bold text-sm">Fatura emitida com sucesso!</h4>
                  <p className="text-xs text-emerald-400/80">O aluno já pode visualizar e pagar via PIX.</p>
                </div>
              ) : (
                <form onSubmit={handleCreateCharge} className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Nome do Aluno / Atleta</label>
                    <input
                      type="text"
                      placeholder="Ex: Carlos Eduardo Silveira"
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-400 font-semibold">Filial / Academia</label>
                      <select
                        value={accessProfile === 'unit_manager' ? assignedUnitId : newAcademyId}
                        disabled={accessProfile === 'unit_manager'}
                        onChange={(e) => setNewAcademyId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium"
                      >
                        {academies.map(a => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-400 font-semibold">Plano de Mensalidade</label>
                      <select
                        value={newPlanName}
                        onChange={(e) => {
                          setNewPlanName(e.target.value);
                          // Auto set amount based on selected plan
                          const plan = currentAcademyData.pricingPlans?.find(p => p.name === e.target.value);
                          if (plan) setNewAmount(plan.price);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium"
                      >
                        {currentAcademyData.pricingPlans?.map(p => (
                          <option key={p.id} value={p.name}>{p.name} - {formatBRL(p.price)}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-400 font-semibold">Valor da Fatura (R$)</label>
                      <input
                        type="number"
                        value={newAmount}
                        onChange={(e) => setNewAmount(Number(e.target.value))}
                        required
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-400 font-semibold">Data de Vencimento</label>
                      <input
                        type="text"
                        value={newDueDate}
                        onChange={(e) => setNewDueDate(e.target.value)}
                        placeholder="DD/MM/AAAA"
                        required
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 mt-4"
                  >
                    <QrCode size={16} /> Emitir Fatura & Gerar PIX
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 6: REPASSES À PLATAFORMA (GESTOR GERAL MESSIAS BATISTA DA SILVA JUNIOR) */}
          {activeTab === 'repasses' && (
            <div className="space-y-6">
              {/* Header Box */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/40 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-2xl shadow-md shrink-0">
                      🏛️
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles size={11} /> Plataforma Central BJJ ACADEMY
                        </span>
                        <span className="px-2 py-0.2 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[9px] font-bold">
                          Conta Oficial Ativa
                        </span>
                      </div>
                      <h3 className="text-base font-black text-white">
                        Conta Oficial de Repasses da Plataforma
                      </h3>
                      <p className="text-xs text-slate-400">
                        Destinada ao recebimento dos valores que as academias filiadas pagam à plataforma BJJ ACADEMY.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingGm(true)}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <Edit3 size={13} /> Editar Dados
                    </button>
                  </div>
                </div>

                {/* Gestor Geral Credentials Box */}
                <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-b border-slate-800/80 pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Nome Completo do Gestor Geral
                      </span>
                      <div className="text-sm font-black text-white flex items-center gap-2 mt-0.5">
                        <span>{gmData.name}</span>
                        <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                          {gmData.role}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        CPF do Gestor Geral
                      </span>
                      <div className="text-sm font-mono font-bold text-slate-200 mt-0.5">
                        {gmData.formattedCpf || gmData.cpf}
                      </div>
                    </div>
                  </div>

                  {/* PIX Key Section */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <div>
                      <span className="text-[10px] font-bold text-amber-400 uppercase flex items-center gap-1 tracking-wider">
                        <Zap size={11} /> Chave PIX Oficial para Repasses (CPF):
                      </span>
                      <div className="text-lg font-mono font-black text-emerald-400 tracking-wider select-all mt-0.5">
                        {gmData.pixKey}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyPlatformPix}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-md ${
                        copiedPlatformPix
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {copiedPlatformPix ? (
                        <>
                          <Check size={14} />
                          <span>Chave PIX Copiada com Sucesso!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Copiar Chave PIX (58087630378)</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-amber-400 text-sm shrink-0">ℹ️</span>
                    <div>
                      <strong className="text-white">Finalidade Oficial dos Pagamentos:</strong> {gmData.purpose}
                    </div>
                  </div>
                </div>
              </div>

              {/* Repasses Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Receita Prevista da Plataforma</span>
                  <div className="text-xl font-black text-white">
                    {formatBRL(platformPayments.reduce((acc, curr) => acc + curr.amount, 0))}
                  </div>
                  <span className="text-[10px] text-slate-500">5 filiais x R$ 250,00/mês</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-800/40 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">Repasses Quitados</span>
                  <div className="text-xl font-black text-emerald-400">
                    {formatBRL(platformPayments.filter(p => p.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0))}
                  </div>
                  <span className="text-[10px] text-emerald-500 font-semibold">
                    {platformPayments.filter(p => p.status === 'paid').length} academias já pagaram
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-amber-800/40 space-y-1">
                  <span className="text-[10px] font-bold text-amber-400 uppercase">Aguardando Pagamento PIX</span>
                  <div className="text-xl font-black text-amber-400">
                    {formatBRL(platformPayments.filter(p => p.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0))}
                  </div>
                  <span className="text-[10px] text-amber-500 font-semibold">
                    {platformPayments.filter(p => p.status === 'pending').length} academias pendentes
                  </span>
                </div>
              </div>

              {/* Repasses List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Building2 size={13} className="text-amber-400" />
                    Status de Pagamento por Unidade / Academia
                  </h4>
                  <span className="text-xs text-slate-400 font-mono">
                    Referência: 09/2026
                  </span>
                </div>

                <div className="space-y-2">
                  {platformPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-sm font-black text-white">{payment.academyName}</h5>
                          <span className="text-xs text-slate-400">({payment.branch})</span>
                        </div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">
                          Fatura: <span className="text-slate-300">{payment.invoiceRef}</span> • Vencimento: {payment.dueDate}
                          {payment.paidDate && (
                            <span className="text-emerald-400 ml-2">✓ Quitado em {payment.paidDate}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <div className="text-right">
                          <div className="text-sm font-black text-white font-mono">
                            {formatBRL(payment.amount)}
                          </div>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            payment.status === 'paid'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}>
                            {payment.status === 'paid' ? '✓ Pago ao Gestor Geral' : '⏳ Aguardando PIX'}
                          </span>
                        </div>

                        {payment.status === 'pending' ? (
                          <button
                            type="button"
                            onClick={() => setSelectedRepasseForPix(payment)}
                            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                          >
                            <QrCode size={14} /> Pagar PIX
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleTogglePlatformPayment(payment.id)}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1 transition"
                            title="Alternar status do repasse"
                          >
                            <RefreshCw size={12} /> Reabrir
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: FECHAMENTO CONTÁBIL (Item 4) */}
          {activeTab === 'accounting' && (
            <div className="space-y-6 animate-fadeIn" id="tab-accounting">
              {/* Header de Controle Contábil */}
              <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                      DOCUMENTO FISCAL CONSOLIDADO
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Simples Nacional • Anexo III</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight mt-1">
                    Relatório Fechado para Contabilidade
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Demonstrativo Sintético e Extrato Conciliado pronto para o contador da academia
                  </p>
                </div>

                {/* Seletores de Mês e Unidade */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
                    <Calendar size={13} className="text-slate-400" />
                    <span className="text-slate-400 text-[11px]">Competência:</span>
                    <select
                      value={accountingMonth}
                      onChange={(e) => setAccountingMonth(e.target.value)}
                      className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="09/2026">Setembro / 2026</option>
                      <option value="08/2026">Agosto / 2026</option>
                      <option value="07/2026">Julho / 2026</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const paid = visibleInvoices.filter(i => i.status === 'paid');
                        const gross = paid.reduce((a, c) => a + c.amount, 0);
                        const gateway = paid.reduce((a, c) => a + (c.amount * 0.0215 + 0.89), 0);
                        const license = 250;
                        const net = Math.max(0, gross - gateway - license);
                        const das = gross * 0.06;

                        const dreText = 
`📑 FECHAMENTO CONTÁBIL CONSOLIDADO • BJJ ACADEMY
Competência: ${accountingMonth}
Unidade: ${activeAcademy.name}
CNPJ: ${activeAcademy.cnpj || '45.123.890/0001-92'} • Simples Nacional Anexo III
Razão Social: ${activeAcademy.legalName || activeAcademy.name + ' Treinamentos Esportivos LTDA'}

(+) Faturamento Bruto (${paid.length} mensalidades pagas): ${formatBRL(gross)}
(-) Dedução Taxas de Gateway (Asaas / Efí / Cartão / PIX): ${formatBRL(gateway)}
(-) Dedução Licença BJJ Academy SaaS: ${formatBRL(license)}
(=) Faturamento Líquido Disponível: ${formatBRL(net)}

[*] Provisão Tributária Estimada DAS (6%): ${formatBRL(das)}
Status da Conciliação: Conciliado 100% com Extratos e Chave PIX.`;

                        navigator.clipboard.writeText(dreText);
                        setCopiedDre(true);
                        setTimeout(() => setCopiedDre(false), 2500);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
                      title="Copiar texto formatado do DRE para enviar ao contador"
                    >
                      {copiedDre ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      <span>{copiedDre ? 'DRE Copiado!' : 'Copiar DRE'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const paid = visibleInvoices.filter(i => i.status === 'paid');
                        const headers = 'ID Fatura;Aluno;Competência;Vencimento;Pagamento;Forma Pagamento;Valor Bruto (R$);Taxa Gateway (R$);Valor Líquido (R$);Status\n';
                        const rows = paid.map(inv => {
                          const gw = (inv.amount * 0.0215 + 0.89);
                          const net = Math.max(0, inv.amount - gw);
                          return `"${inv.id}";"${inv.studentName}";"${accountingMonth}";"${inv.dueDate}";"${inv.paidDate || inv.dueDate}";"${inv.paymentMethod || 'PIX'}";"${inv.amount.toFixed(2).replace('.', ',')}";"${gw.toFixed(2).replace('.', ',')}";"${net.toFixed(2).replace('.', ',')}";"Quitado"`;
                        }).join('\n');

                        const csvContent = '\uFEFF' + headers + rows;
                        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', `fechamento_contabil_${accountingMonth.replace('/', '_')}.csv`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition shadow"
                    >
                      <Download size={13} />
                      <span>Exportar CSV Oficial</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Balancete Sintético / DRE Oficial */}
              {(() => {
                const paid = visibleInvoices.filter(i => i.status === 'paid');
                const gross = paid.reduce((a, c) => a + c.amount, 0);
                const gateway = paid.reduce((a, c) => a + (c.amount * 0.0215 + 0.89), 0);
                const license = 250;
                const net = Math.max(0, gross - gateway - license);
                const das = gross * 0.06;

                return (
                  <div className="p-5 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-5 text-slate-200 shadow-xl">
                    {/* Cabeçalho da Empresa */}
                    <div className="pb-4 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="text-sm font-bold text-white uppercase tracking-tight">
                          {activeAcademy.legalName || (activeAcademy.name + ' Treinamentos Esportivos LTDA')}
                        </div>
                        <div className="text-slate-400 mt-0.5">
                          Nome Fantasia: <span className="text-slate-300 font-semibold">{activeAcademy.name}</span>
                        </div>
                        <div className="text-slate-400 mt-0.5">
                          CNPJ: <span className="font-mono text-slate-300">{activeAcademy.cnpj || '45.123.890/0001-92'}</span> • Inscrição Municipal: <span className="font-mono text-slate-300">8.942.110-3</span>
                        </div>
                      </div>

                      <div className="text-left sm:text-right text-xs">
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">Enquadramento Tributário</span>
                        <span className="font-bold text-amber-400">Simples Nacional (Anexo III - CNAE 9313-1/00)</span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">Atividades de Condicionamento Físico & Lutas</span>
                      </div>
                    </div>

                    {/* DRE Sintético Linha por Linha */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 border-b border-slate-800/60 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-emerald-950 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0">
                            +
                          </span>
                          <span className="font-medium text-slate-200">
                            Faturamento Bruto Arrecadado ({paid.length} mensalidades e planos quitados)
                          </span>
                        </div>
                        <span className="font-mono font-bold text-emerald-400 text-sm">
                          {formatBRL(gross)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2 border-b border-slate-800/60 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-red-950 text-red-400 font-bold flex items-center justify-center text-[10px] shrink-0">
                            -
                          </span>
                          <div>
                            <span className="font-medium text-slate-300">
                              Custos Operacionais de Pagamento (Gateway Asaas / Efí / Cartão / PIX)
                            </span>
                            <span className="text-[10px] text-slate-500 block">Tarifas bancárias automáticas deduzidas na liquidação</span>
                          </div>
                        </div>
                        <span className="font-mono font-medium text-red-400 text-xs">
                          {formatBRL(gateway)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2 border-b border-slate-800/60 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-red-950 text-red-400 font-bold flex items-center justify-center text-[10px] shrink-0">
                            -
                          </span>
                          <div>
                            <span className="font-medium text-slate-300">
                              Repasse Licença Tecnologia BJJ Academy SaaS
                            </span>
                            <span className="text-[10px] text-slate-500 block">Assinatura mensal do software de gestão marcial</span>
                          </div>
                        </div>
                        <span className="font-mono font-medium text-red-400 text-xs">
                          {formatBRL(license)}
                        </span>
                      </div>

                      {/* Resultado Líquido */}
                      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            Resultado Operacional Líquido Disponível
                          </span>
                          <span className="text-xs text-slate-300">
                            Saldo em conta corrente da filial após todas as deduções
                          </span>
                        </div>
                        <span className="font-mono font-black text-white text-lg sm:text-xl">
                          {formatBRL(net)}
                        </span>
                      </div>

                      {/* Provisão de Imposto */}
                      <div className="p-3 rounded-2xl bg-slate-900/50 border border-amber-900/30 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-amber-300 flex items-center gap-1.5">
                            <span>🏛️</span> Provisão Tributária Estimada (Guia DAS - Simples Nacional)
                          </span>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            Alíquota efetiva média calculada: 6,00% sobre receita bruta de serviços esportivos
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-amber-400 text-sm">
                            {formatBRL(das)}
                          </span>
                          <span className="text-[10px] text-slate-500 block">Vencimento: dia 20/{accountingMonth.split('/')[0]}</span>
                        </div>
                      </div>
                    </div>

                    {/* Notas Explicativas Finais */}
                    <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                      <div className="font-bold text-slate-300">Nota da Auditoria BJJ Academy:</div>
                      <div>• Este relatório foi gerado automaticamente pelo motor financeiro RBAC com integridade de dados verificada.</div>
                      <div>• Todas as baixas de pagamento possuem log de transação e reconciliação com o extrato bancário.</div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

        </div>

        {/* MODAL: EDITAR GESTOR GERAL */}
        {isEditingGm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-5 text-slate-100 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🥋</span>
                  <h3 className="text-sm font-black text-white">Editar Gestor Geral</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingGm(false)}
                  className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveGm} className="space-y-3 pt-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Nome Completo:
                  </label>
                  <input
                    type="text"
                    value={editGmName}
                    onChange={(e) => setEditGmName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    CPF (somente números ou formatado):
                  </label>
                  <input
                    type="text"
                    value={editGmCpf}
                    onChange={(e) => setEditGmCpf(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Chave PIX da Plataforma (CPF):
                  </label>
                  <input
                    type="text"
                    value={editGmPix}
                    onChange={(e) => setEditGmPix(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Finalidade dos Pagamentos:
                  </label>
                  <textarea
                    value={editGmPurpose}
                    onChange={(e) => setEditGmPurpose(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                    required
                  />
                </div>

                {gmSaveSuccess && (
                  <div className="p-2 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-800 text-center font-bold">
                    ✓ Alterações salvas com sucesso!
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingGm(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: PIX REPASSE PARA O GESTOR GERAL */}
        {selectedRepasseForPix && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-5 text-slate-100 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    Repasse à Plataforma BJJ ACADEMY
                  </span>
                  <h3 className="text-sm font-black text-white">{selectedRepasseForPix.academyName}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRepasseForPix(null)}
                  className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="py-4 space-y-3 text-center">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-left">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Favorecido (Gestor Geral)</div>
                  <div className="text-sm font-black text-white">{gmData.name}</div>
                  <div className="text-xs text-slate-400 font-mono">CPF: {gmData.formattedCpf || gmData.cpf}</div>
                  <div className="text-xs text-emerald-400 font-mono font-bold">Chave PIX: {gmData.pixKey}</div>
                </div>

                {/* QR Code */}
                <div className="mx-auto w-44 h-44 bg-white p-3 rounded-2xl flex flex-col items-center justify-center shadow-lg">
                  <div className="w-36 h-36 bg-slate-950 rounded-xl p-2 flex flex-col items-center justify-center text-center">
                    <QrCode size={80} className="text-white mx-auto" />
                    <span className="text-[8px] font-mono text-emerald-400 mt-1">PIX BJJ ACADEMY</span>
                  </div>
                </div>

                <div className="text-lg font-black text-white font-mono">
                  {formatBRL(selectedRepasseForPix.amount)}
                </div>

                <p className="text-[11px] text-slate-400">
                  Transfira pelo app bancário lendo o QR Code ou copiando a chave PIX CPF do Gestor Geral.
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
                    handleTogglePlatformPayment(selectedRepasseForPix.id);
                    setSelectedRepasseForPix(null);
                  }}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5 transition border border-emerald-900/50"
                >
                  <CheckCircle2 size={13} /> Confirmar Pagamento Quitado
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL FOOTER */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Módulo Financeiro Integrado BJJ ACADEMY v2.4</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition"
          >
            Fechar
          </button>
        </div>
      </motion.div>
    </div>
  );
};
