import React, { useState, useMemo } from 'react';
import {
  ShieldCheck, ShieldAlert, DollarSign, Calendar, AlertTriangle, CheckCircle2,
  Clock, Filter, Search, Plus, Edit3, Lock, Unlock, ArrowLeft, RefreshCw,
  Database, Copy, Check, ChevronRight, X, Building2, Phone, Mail, Award,
  Sparkles, Download, Layers, TrendingUp, AlertCircle
} from 'lucide-react';
import {
  SaasSubscription,
  SaasPaymentStatus,
  SaasPlanType,
  SaasPaymentRecord,
  RegisteredAcademy
} from '../../types';
import { SaasSubscriptionService } from '../../services/saasSubscriptionService';

interface SuperAdminSaasViewProps {
  onBackToApp: () => void;
  academies?: RegisteredAcademy[];
}

export const SuperAdminSaasView: React.FC<SuperAdminSaasViewProps> = ({
  onBackToApp,
  academies = []
}) => {
  // Estado local das assinaturas
  const [subscriptions, setSubscriptions] = useState<SaasSubscription[]>(() => {
    return SaasSubscriptionService.getSubscriptions();
  });

  // Filtros rápidos
  const [quickFilter, setQuickFilter] = useState<'ALL' | 'OVERDUE' | 'THIS_MONTH_PAID'>('ALL');
  const [selectedPlanTier, setSelectedPlanTier] = useState<'ALL' | SaasPlanType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modais de Ação
  const [paymentModalSub, setPaymentModalSub] = useState<SaasSubscription | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<SaasPaymentRecord['paymentMethod']>('PIX');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentTxCode, setPaymentTxCode] = useState('');

  const [editPlanModalSub, setEditPlanModalSub] = useState<SaasSubscription | null>(null);
  const [editPlanTier, setEditPlanTier] = useState<SaasPlanType>('BASICO');
  const [editMonthlyFee, setEditMonthlyFee] = useState<number>(99.90);
  const [editDueDay, setEditDueDay] = useState<number>(10);

  const [suspendModalSub, setSuspendModalSub] = useState<SaasSubscription | null>(null);
  const [suspendReason, setSuspendReason] = useState('');

  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'warning' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setFeedbackToast({ message, type });
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  // Recarregar dados do serviço
  const reloadData = () => {
    const list = SaasSubscriptionService.getSubscriptions();
    setSubscriptions([...list]);
  };

  // Executar varredura automática de bloqueio
  const handleRunAutoLockout = () => {
    const result = SaasSubscriptionService.runAutoLockoutRoutine();
    reloadData();
    if (result.locked > 0) {
      showToast(
        `⚡ Varredura Concluída: ${result.locked} academia(s) com mensalidade vencida foram bloqueadas automaticamente!`,
        'warning'
      );
    } else {
      showToast(
        `✅ Varredura Concluída: Todas as ${result.checked} academias estão com pagamentos checados. Nenhuma nova inadimplência.`,
        'success'
      );
    }
  };

  // 1. Filtragem da Tabela Principal
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(sub => {
      // Filtro de texto (Academia, Responsável, CNPJ, Cidade)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = sub.academyName.toLowerCase().includes(q);
        const matchResp = sub.responsibleName.toLowerCase().includes(q);
        const matchBranch = sub.branchName?.toLowerCase().includes(q) || false;
        const matchCnpj = sub.responsibleCpfCnpj?.toLowerCase().includes(q) || false;
        if (!matchName && !matchResp && !matchBranch && !matchCnpj) {
          return false;
        }
      }

      // Filtro de Plano
      if (selectedPlanTier !== 'ALL' && sub.planTier !== selectedPlanTier) {
        return false;
      }

      // Filtro Rápido 1: 'Ver Inadimplentes'
      if (quickFilter === 'OVERDUE') {
        return sub.paymentStatus === 'ATRASADO' || sub.isAccessSuspended === true;
      }

      // Filtro Rápido 2: 'Recebimentos do Mês'
      if (quickFilter === 'THIS_MONTH_PAID') {
        const currentMonthPrefix = new Date().toISOString().substring(0, 7); // Ex: '2026-10'
        const hasPaymentThisMonth = sub.paymentHistory?.some(p => p.referenceMonth === currentMonthPrefix || p.paymentDate.startsWith(currentMonthPrefix));
        const isPaidStatus = sub.paymentStatus === 'EM_DIA';
        return isPaidStatus || hasPaymentThisMonth;
      }

      return true;
    });
  }, [subscriptions, searchQuery, selectedPlanTier, quickFilter]);

  // Cálculos de KPIs do SaaS
  const kpiStats = useMemo(() => {
    const totalAcademies = subscriptions.length;
    const mrrTotal = subscriptions.reduce((acc, sub) => acc + (sub.monthlyFeeBRL || 0), 0);
    const overdueList = subscriptions.filter(s => s.paymentStatus === 'ATRASADO' || s.isAccessSuspended);
    const overdueCount = overdueList.length;
    const overdueAmount = overdueList.reduce((acc, sub) => acc + (sub.monthlyFeeBRL || 0), 0);

    const currentMonthPrefix = new Date().toISOString().substring(0, 7);
    const thisMonthReceived = subscriptions.reduce((acc, sub) => {
      const monthPayments = sub.paymentHistory?.filter(p => p.referenceMonth === currentMonthPrefix || p.paymentDate.startsWith(currentMonthPrefix)) || [];
      const subTotal = monthPayments.reduce((sum, p) => sum + p.amountPaidBRL, 0);
      return acc + (subTotal > 0 ? subTotal : (sub.paymentStatus === 'EM_DIA' ? sub.monthlyFeeBRL : 0));
    }, 0);

    return {
      totalAcademies,
      mrrTotal,
      overdueCount,
      overdueAmount,
      thisMonthReceived
    };
  }, [subscriptions]);

  // Ação: Abrir modal Registrar Pagamento
  const handleOpenPaymentModal = (sub: SaasSubscription) => {
    setPaymentModalSub(sub);
    setPaymentAmount(sub.monthlyFeeBRL);
    setPaymentMethod('PIX');
    setPaymentTxCode(`PIX-E2E-${Date.now().toString().slice(-6)}`);
    setPaymentNotes('');
  };

  // Ação: Confirmar Registro de Pagamento
  const handleConfirmPayment = () => {
    if (!paymentModalSub) return;
    try {
      const updated = SaasSubscriptionService.registerPayment(paymentModalSub.id, {
        amountPaidBRL: paymentAmount,
        paymentMethod,
        transactionCode: paymentTxCode,
        notes: paymentNotes,
        registeredBy: 'Super Admin (Criador do Software)'
      });

      reloadData();
      showToast(
        `💳 Pagamento de R$ ${paymentAmount.toFixed(2)} registrado com sucesso! O acesso da academia ${updated.academyName} (alunos e professores) foi liberado instantaneamente.`,
        'success'
      );
      setPaymentModalSub(null);
    } catch (e) {
      console.error(e);
      showToast('Erro ao registrar pagamento.', 'warning');
    }
  };

  // Ação: Abrir modal Editar Plano
  const handleOpenEditPlanModal = (sub: SaasSubscription) => {
    setEditPlanModalSub(sub);
    setEditPlanTier(sub.planTier);
    setEditMonthlyFee(sub.monthlyFeeBRL);
    setEditDueDay(sub.billingDueDay || 10);
  };

  // Ação: Confirmar Edição de Plano
  const handleConfirmEditPlan = () => {
    if (!editPlanModalSub) return;
    try {
      const updated = SaasSubscriptionService.editPlan(editPlanModalSub.id, {
        planTier: editPlanTier,
        monthlyFeeBRL: editMonthlyFee,
        billingDueDay: editDueDay
      });

      reloadData();
      showToast(
        `⚙️ Plano da ${updated.academyName} atualizado para ${updated.planName} (R$ ${editMonthlyFee.toFixed(2)}/mês, vencimento dia ${editDueDay}).`,
        'success'
      );
      setEditPlanModalSub(null);
    } catch (e) {
      console.error(e);
      showToast('Erro ao atualizar plano.', 'warning');
    }
  };

  // Ação: Abrir modal Suspender / Reativar
  const handleOpenSuspendModal = (sub: SaasSubscription) => {
    if (sub.isAccessSuspended) {
      // Se já está suspenso, reativa diretamente
      try {
        const updated = SaasSubscriptionService.reactivateAccess(sub.id);
        reloadData();
        showToast(`🟢 Acesso da academia ${updated.academyName} reativado com sucesso! Professores e alunos liberados.`, 'success');
      } catch (e) {
        showToast('Erro ao reativar acesso.', 'warning');
      }
    } else {
      // Abre modal para confirmar suspensão
      setSuspendModalSub(sub);
      setSuspendReason('Suspensão administrativa por solicitação do Super Admin.');
    }
  };

  // Ação: Confirmar Suspensão
  const handleConfirmSuspend = () => {
    if (!suspendModalSub) return;
    try {
      const updated = SaasSubscriptionService.suspendAccess(suspendModalSub.id, suspendReason);
      reloadData();
      showToast(`🚫 Acesso da academia ${updated.academyName} suspenso. Professores e alunos bloqueados até regularização.`, 'warning');
      setSuspendModalSub(null);
    } catch (e) {
      showToast('Erro ao suspender acesso.', 'warning');
    }
  };

  // Helper para copiar código SQL
  const handleCopySql = () => {
    const sqlCode = `-- BJJACADEMY SaaS • SCHEMA DO BANCO DE DADOS
CREATE TABLE IF NOT EXISTS saas_subscriptions (
    id VARCHAR(64) PRIMARY KEY,
    academy_id VARCHAR(64) NOT NULL UNIQUE,
    academy_name VARCHAR(255) NOT NULL,
    branch_name VARCHAR(150),
    responsible_name VARCHAR(255) NOT NULL,
    responsible_email VARCHAR(255) NOT NULL,
    responsible_phone VARCHAR(50),
    plan_tier VARCHAR(32) NOT NULL DEFAULT 'BASICO',
    monthly_fee_brl NUMERIC(10, 2) NOT NULL DEFAULT 99.90,
    billing_due_day INT NOT NULL DEFAULT 10,
    next_due_date DATE NOT NULL,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'EM_DIA',
    is_access_suspended BOOLEAN NOT NULL DEFAULT FALSE,
    suspension_reason TEXT,
    last_payment_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`;
    navigator.clipboard.writeText(sqlCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-3 sm:p-6 space-y-6 font-sans select-none">
      {/* Toast Notification */}
      {feedbackToast && (
        <div className={`fixed top-4 right-4 z-50 max-w-md p-4 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${
          feedbackToast.type === 'warning'
            ? 'bg-rose-950/95 border-rose-600 text-rose-100'
            : feedbackToast.type === 'info'
            ? 'bg-blue-950/95 border-blue-600 text-blue-100'
            : 'bg-emerald-950/95 border-emerald-500 text-emerald-100'
        }`}>
          {feedbackToast.type === 'warning' ? (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span className="text-xs font-semibold leading-relaxed">{feedbackToast.message}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3.5">
          <button
            onClick={onBackToApp}
            className="p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-all hover:scale-105 active:scale-95"
            title="Voltar ao App Principal"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                Painel Super Admin • Rota Nível 0
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <Sparkles className="w-3 h-3" />
                Dono do Software BJJACADEMY
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 mt-1">
              Gestão de Assinaturas (SaaS Multi-Tenant)
            </h1>
            <p className="text-xs text-slate-400">
              Controle de mensalidades, bloqueio automático por inadimplência e licenciamento das academias clientes.
            </p>
          </div>
        </div>

        {/* Global Control Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRunAutoLockout}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-950/30 transition-all active:scale-95"
            title="Executa varredura de vencimentos e bloqueia inadimplentes imediatamente"
          >
            <AlertTriangle className="w-4 h-4" />
            Varredura Auto-Lockout
          </button>

          <button
            onClick={() => setIsSqlModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-200 text-xs font-bold transition-all active:scale-95"
            title="Visualizar script SQL DDL para PostgreSQL/Supabase"
          >
            <Database className="w-4 h-4 text-cyan-400" />
            Código SQL Banco
          </button>

          <button
            onClick={reloadData}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Recarregar Dados"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Academias */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Total Academias</span>
            <Building2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">{kpiStats.totalAcademies}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="text-emerald-400 font-bold">{subscriptions.filter(s => s.paymentStatus === 'EM_DIA').length} Em dia</span>
            <span>•</span>
            <span className="text-rose-400 font-bold">{kpiStats.overdueCount} Bloqueadas</span>
          </div>
        </div>

        {/* MRR Recorrente */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px]">MRR (Recorrente)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            R$ {kpiStats.mrrTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Faturamento previsto mensal
          </div>
        </div>

        {/* Inadimplência / Atraso */}
        <div className={`p-4 rounded-2xl border relative overflow-hidden transition-all ${
          kpiStats.overdueCount > 0
            ? 'bg-rose-950/30 border-rose-800/80 shadow-lg shadow-rose-950/20'
            : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-rose-300">
              Inadimplência (Atrasados)
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">
            R$ {kpiStats.overdueAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-rose-300/80 mt-1 font-medium">
            {kpiStats.overdueCount} academia(s) com acesso bloqueado
          </div>
        </div>

        {/* Recebimentos do Mês */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Recebimentos Mês</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">
            R$ {kpiStats.thisMonthReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Quitados e conciliados
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Quick Filters Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setQuickFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                quickFilter === 'ALL'
                  ? 'bg-slate-200 text-slate-950 shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Todas ({subscriptions.length})
            </button>

            <button
              onClick={() => setQuickFilter('OVERDUE')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                quickFilter === 'OVERDUE'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/40'
                  : 'bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Ver Inadimplentes ({kpiStats.overdueCount})
            </button>

            <button
              onClick={() => setQuickFilter('THIS_MONTH_PAID')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                quickFilter === 'THIS_MONTH_PAID'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40'
                  : 'bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-800/40'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Recebimentos do Mês
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar academia, responsável, cidade..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Secondary Filter: Plan Tier */}
        <div className="flex items-center gap-2 text-xs pt-1 border-t border-slate-800/60 text-slate-400">
          <span className="font-semibold text-[11px] uppercase tracking-wider text-slate-500">Filtrar por Plano:</span>
          {(['ALL', 'BASICO', 'AVANCADO', 'OURO'] as const).map(tier => (
            <button
              key={tier}
              onClick={() => setSelectedPlanTier(tier)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                selectedPlanTier === tier
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tier === 'ALL' ? 'Todos os Planos' : tier === 'BASICO' ? 'Básico (40)' : tier === 'AVANCADO' ? 'Avançado (150)' : 'Ouro (Enterprise)'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Client Table (Listagem de Clientes) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                <th className="py-3 px-4">Nome da Academia & Responsável</th>
                <th className="py-3 px-4">Plano Contratado</th>
                <th className="py-3 px-4">Valor Mensalidade</th>
                <th className="py-3 px-4">Data Vencimento</th>
                <th className="py-3 px-4">Status Pagamento</th>
                <th className="py-3 px-4">Acesso (Tatame)</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200 font-medium">
              {filteredSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Filter className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
                      <p className="font-semibold text-sm text-slate-400">Nenhuma academia encontrada</p>
                      <p className="text-xs text-slate-500">
                        Nenhum registro corresponde aos filtros ou pesquisa selecionados.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map(sub => {
                  const isOverdue = sub.paymentStatus === 'ATRASADO';
                  const isBlocked = isOverdue || sub.isAccessSuspended;
                  const isPending = sub.paymentStatus === 'PENDENTE';

                  // Cálculo de dias de vencimento
                  let dueDateInfo = { text: sub.dueDate, label: '', isPast: false };
                  if (sub.dueDate) {
                    const d = new Date(sub.dueDate);
                    const diffDays = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    if (diffDays < 0) {
                      dueDateInfo.label = `${Math.abs(diffDays)} dia(s) em atraso`;
                      dueDateInfo.isPast = true;
                    } else if (diffDays === 0) {
                      dueDateInfo.label = 'Vence hoje!';
                    } else {
                      dueDateInfo.label = `Vence em ${diffDays} dias`;
                    }
                  }

                  return (
                    <tr
                      key={sub.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isBlocked ? 'bg-rose-950/10' : ''
                      }`}
                    >
                      {/* 1. Nome da Academia e Responsável */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="font-bold text-white text-sm flex items-center gap-1.5">
                            {sub.academyName}
                            {sub.branchName && (
                              <span className="text-[10px] font-normal text-slate-400 px-1.5 py-0.5 rounded bg-slate-800">
                                {sub.branchName}
                              </span>
                            )}
                          </div>
                          <div className="text-slate-300 font-semibold text-xs flex items-center gap-1">
                            <span className="text-slate-500">Mestre:</span> {sub.responsibleName}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-0.5">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-emerald-400" />
                              {sub.responsiblePhone}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 truncate max-w-[150px]">
                              <Mail className="w-3 h-3 text-cyan-400" />
                              {sub.responsibleEmail}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Plano Contratado */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider ${
                            sub.planTier === 'OURO'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : sub.planTier === 'AVANCADO'
                              ? 'bg-slate-700/60 text-slate-200 border border-slate-500/40'
                              : 'bg-amber-950/40 text-amber-400 border border-amber-800/40'
                          }`}>
                            <Award className="w-3 h-3" />
                            {sub.planTier}
                          </span>
                          <div className="text-[10px] text-slate-400">
                            {sub.maxActiveStudents === 999999 ? 'Alunos Ilimitados' : `Até ${sub.maxActiveStudents} alunos`}
                          </div>
                        </div>
                      </td>

                      {/* 3. Valor da Mensalidade */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-black text-slate-100 text-sm">
                          R$ {sub.monthlyFeeBRL.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Recorrência SaaS
                        </div>
                      </td>

                      {/* 4. Data de Vencimento */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-200 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {sub.dueDate}
                        </div>
                        <div className={`text-[10px] font-bold ${
                          dueDateInfo.isPast ? 'text-rose-400 animate-pulse' : 'text-slate-400'
                        }`}>
                          {dueDateInfo.label} (Dia {sub.billingDueDay})
                        </div>
                      </td>

                      {/* 5. Status do Pagamento (Em dia, Pendente, Atrasado) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {sub.paymentStatus === 'EM_DIA' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            Em dia
                          </span>
                        ) : sub.paymentStatus === 'PENDENTE' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            Pendente
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                            Atrasado
                          </span>
                        )}
                      </td>

                      {/* 6. Status do Acesso (Bloqueio Automático) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isBlocked ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white">
                              <Lock className="w-3 h-3" />
                              Acesso Bloqueado
                            </span>
                            <div className="text-[10px] text-rose-400 font-medium">
                              Alunos & Profs travados
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              <Unlock className="w-3 h-3" />
                              Liberado
                            </span>
                            <div className="text-[10px] text-slate-400">
                              Tatame funcionando
                            </div>
                          </div>
                        )}
                      </td>

                      {/* 7. Ações por linha */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Registrar Pagamento */}
                          <button
                            onClick={() => handleOpenPaymentModal(sub)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 border border-emerald-500/50 hover:border-emerald-400 text-emerald-200 hover:text-white text-[11px] font-bold transition-all active:scale-95"
                            title="Registrar Pagamento recebido e desbloquear a academia"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            Registrar Pagamento
                          </button>

                          {/* Suspender / Reativar Acesso */}
                          <button
                            onClick={() => handleOpenSuspendModal(sub)}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all active:scale-95 ${
                              isBlocked
                                ? 'bg-amber-600/30 hover:bg-amber-600 text-amber-200 hover:text-slate-950 border border-amber-500/50'
                                : 'bg-rose-950/40 hover:bg-rose-800 text-rose-300 hover:text-white border border-rose-800/50'
                            }`}
                            title={isBlocked ? 'Reativar Acesso Imediatamente' : 'Suspender Acesso desta academia'}
                          >
                            {isBlocked ? (
                              <>
                                <Unlock className="w-3.5 h-3.5" />
                                Reativar Acesso
                              </>
                            ) : (
                              <>
                                <Lock className="w-3.5 h-3.5" />
                                Suspender Acesso
                              </>
                            )}
                          </button>

                          {/* Editar Plano */}
                          <button
                            onClick={() => handleOpenEditPlanModal(sub)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-all active:scale-95"
                            title="Editar Plano, Mensalidade e Vencimento"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                            Editar Plano
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: REGISTRAR PAGAMENTO SAAS                             */}
      {/* ------------------------------------------------------------- */}
      {paymentModalSub && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-emerald-500/60 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-700/60">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Registrar Pagamento SaaS</h3>
                  <p className="text-[11px] text-slate-400">{paymentModalSub.academyName}</p>
                </div>
              </div>
              <button
                onClick={() => setPaymentModalSub(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Valor Recebido (R$):</label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-emerald-400 font-black text-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Forma de Pagamento:</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="PIX">PIX Direto / Asaas</option>
                  <option value="BOLETO">Boleto Bancário</option>
                  <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                  <option value="TRANSFERENCIA">Transferência Bancária</option>
                  <option value="DINHEIRO">Dinheiro em Espécie</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Código / Comprovante (Opcional):</label>
                <input
                  type="text"
                  value={paymentTxCode}
                  onChange={(e) => setPaymentTxCode(e.target.value)}
                  placeholder="Ex: PIX-E2E-182910..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Observações Internas:</label>
                <textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Ex: Pago via chave PIX CNPJ. Liberado pelo Super Admin..."
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-[11px] text-emerald-300 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Efeito Imediato:
                </div>
                <p>
                  O status mudará para <strong>'Em dia'</strong>, a data de vencimento avançará 1 mês e o 
                  <strong> bloqueio de professores e alunos será desativado na hora</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setPaymentModalSub(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmPayment}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
              >
                Confirmar Pagamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: EDITAR PLANO SAAS                                    */}
      {/* ------------------------------------------------------------- */}
      {editPlanModalSub && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-cyan-500/60 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-400">
                <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-700/60">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Editar Plano Contratado</h3>
                  <p className="text-[11px] text-slate-400">{editPlanModalSub.academyName}</p>
                </div>
              </div>
              <button
                onClick={() => setEditPlanModalSub(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Plano SaaS:</label>
                <select
                  value={editPlanTier}
                  onChange={(e) => {
                    const tier = e.target.value as SaasPlanType;
                    setEditPlanTier(tier);
                    if (tier === 'BASICO') setEditMonthlyFee(99.90);
                    else if (tier === 'AVANCADO') setEditMonthlyFee(149.90);
                    else if (tier === 'OURO') setEditMonthlyFee(249.90);
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="BASICO">Plano Básico (Até 40 Alunos) • R$ 99,90/mês</option>
                  <option value="AVANCADO">Plano Avançado (Até 150 Alunos) • R$ 149,90/mês</option>
                  <option value="OURO">Plano Ouro Enterprise (Alunos Ilimitados) • R$ 249,90/mês</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Valor da Mensalidade Personalizado (R$):</label>
                <input
                  type="number"
                  step="0.01"
                  value={editMonthlyFee}
                  onChange={(e) => setEditMonthlyFee(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-cyan-400 font-bold text-base focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Dia de Vencimento Todo Mês:</label>
                <select
                  value={editDueDay}
                  onChange={(e) => setEditDueDay(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="5">Dia 05 de cada mês</option>
                  <option value="10">Dia 10 de cada mês</option>
                  <option value="15">Dia 15 de cada mês</option>
                  <option value="20">Dia 20 de cada mês</option>
                  <option value="25">Dia 25 de cada mês</option>
                  <option value="30">Dia 30 de cada mês</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setEditPlanModalSub(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmEditPlan}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg transition-all active:scale-95"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: SUSPENDER ACESSO MANUAL                              */}
      {/* ------------------------------------------------------------- */}
      {suspendModalSub && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-rose-600 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-400">
                <div className="p-2 rounded-xl bg-rose-950 border border-rose-800/60">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Suspender Acesso da Academia</h3>
                  <p className="text-[11px] text-slate-400">{suspendModalSub.academyName}</p>
                </div>
              </div>
              <button
                onClick={() => setSuspendModalSub(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                Tem certeza que deseja suspender o acesso desta academia?
              </p>
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-[11px] leading-relaxed">
                <strong>Atenção:</strong> Ao suspender o acesso, todos os professores e alunos desta academia 
                ficarão bloqueados e verão a mensagem de suspensão temporária até que você reative o acesso ou registre o pagamento.
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Motivo da Suspensão:</label>
                <textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-rose-500 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setSuspendModalSub(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmSuspend}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950/40 transition-all active:scale-95"
              >
                Confirmar Suspensão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 4: CÓDIGO DO BANCO DE DADOS (SQL DDL / TABELA SAAS)     */}
      {/* ------------------------------------------------------------- */}
      {isSqlModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full max-h-[85vh] bg-slate-900 border border-cyan-500/60 rounded-3xl p-6 shadow-2xl flex flex-col space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-400">
                <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-700/60">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Código do Banco de Dados (SaaS)</h3>
                  <p className="text-[11px] text-slate-400">Tabela de assinaturas, histórico e funções de auto-lockout</p>
                </div>
              </div>
              <button
                onClick={() => setIsSqlModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-[11px] text-cyan-300 leading-relaxed space-y-2 select-text">
              <div className="text-slate-500">-- PostgreSQL / Cloud SQL / Supabase DDL</div>
              <div className="text-amber-300">CREATE TABLE IF NOT EXISTS saas_subscriptions (</div>
              <div className="pl-4">id VARCHAR(64) PRIMARY KEY,</div>
              <div className="pl-4">academy_id VARCHAR(64) NOT NULL UNIQUE,</div>
              <div className="pl-4">academy_name VARCHAR(255) NOT NULL,</div>
              <div className="pl-4">responsible_name VARCHAR(255) NOT NULL,</div>
              <div className="pl-4">responsible_email VARCHAR(255) NOT NULL,</div>
              <div className="pl-4">responsible_phone VARCHAR(50),</div>
              <div className="pl-4 text-emerald-400">plan_tier VARCHAR(32) NOT NULL DEFAULT 'BASICO',</div>
              <div className="pl-4 text-emerald-400">monthly_fee_brl NUMERIC(10, 2) NOT NULL DEFAULT 99.90,</div>
              <div className="pl-4">billing_due_day INT NOT NULL DEFAULT 10,</div>
              <div className="pl-4">next_due_date DATE NOT NULL,</div>
              <div className="pl-4 text-rose-400">payment_status VARCHAR(20) NOT NULL DEFAULT 'EM_DIA',</div>
              <div className="pl-4 text-rose-400">is_access_suspended BOOLEAN NOT NULL DEFAULT FALSE,</div>
              <div className="pl-4">suspension_reason TEXT,</div>
              <div className="pl-4">last_payment_date TIMESTAMP WITH TIME ZONE,</div>
              <div className="pl-4">created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),</div>
              <div className="pl-4">updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()</div>
              <div className="text-amber-300">);</div>
              <br />
              <div className="text-slate-500">-- Índices para alta performance e verificação de bloqueio em milissegundos</div>
              <div>CREATE INDEX idx_saas_status ON saas_subscriptions(payment_status);</div>
              <div>CREATE INDEX idx_saas_suspended ON saas_subscriptions(is_access_suspended);</div>
              <div>CREATE INDEX idx_saas_due_date ON saas_subscriptions(next_due_date);</div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <span className="text-[11px] text-slate-400">
                Arquivo salvo em: <code className="text-cyan-400 font-mono">/src/db/saas_subscriptions.sql</code>
              </span>
              <button
                onClick={handleCopySql}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all active:scale-95"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar Código SQL
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
