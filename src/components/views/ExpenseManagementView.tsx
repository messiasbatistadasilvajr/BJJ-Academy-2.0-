import React, { useState, useMemo } from 'react';
import {
  TrendingDown, Plus, Search, Calendar, DollarSign, Building2, Users, Zap,
  Receipt, CheckCircle2, Clock, AlertTriangle, Filter, Download, Trash2,
  Edit3, ArrowLeft, ShieldAlert, Lock, Check, X, ShieldCheck, ChevronLeft,
  ChevronRight, ArrowUpDown, FileText, Info, HelpCircle, Smartphone, Eye
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  PayableExpense, PayableExpenseCategory, UserRole, RegisteredAcademy,
  canAccessExpenseManagement, OFFICIAL_EXPENSE_CATEGORIES, getExpenseCategoryMeta
} from '../../types';
import { formatBRL } from '../../utils/financialCalculations';

interface ExpenseManagementViewProps {
  expenses: PayableExpense[];
  activeAcademy: RegisteredAcademy;
  academies: RegisteredAcademy[];
  currentUserRole: UserRole;
  currentUserId?: string;
  currentUserName?: string;
  onAddExpense: (expense: PayableExpense) => void;
  onUpdateExpense: (expense: PayableExpense) => void;
  onDeleteExpense: (expenseId: string) => void;
  onBackToDashboard?: () => void;
}

export const ExpenseManagementView: React.FC<ExpenseManagementViewProps> = ({
  expenses,
  activeAcademy,
  academies,
  currentUserRole,
  currentUserId,
  currentUserName = 'Gestor BJJ',
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onBackToDashboard
}) => {
  // =========================================================================
  // 🛡️ REGRA CRÍTICA DE ACESSO E SEGURANÇA (RBAC GATEWAY)
  // Bloqueio rigoroso: Apenas Responsável pela Academia (Gerente/Dono) e CEO
  // =========================================================================
  const isAuthorized = canAccessExpenseManagement(currentUserRole);

  if (!isAuthorized) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border-2 border-red-700/60 rounded-3xl p-6 text-center shadow-2xl space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-950/80 border border-red-600 flex items-center justify-center text-red-400">
            <Lock size={32} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-950 px-2.5 py-1 rounded-full border border-red-800">
              403 FORBIDDEN • ÁREA BLINDADA
            </span>
            <h2 className="text-xl font-black text-white mt-2">Acesso Estritamente Restrito</h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              O módulo de <strong>Gestão de Despesas & Custos Operacionais</strong> contém dados bancários e de saída de caixa confidenciais.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-left text-xs space-y-1.5 text-slate-400">
            <div className="flex items-center gap-1.5 text-red-400 font-bold">
              <ShieldAlert size={14} /> Regra de Segurança do Sistema:
            </div>
            <p>
              Acesso exclusivo concedido ao <strong>Responsável pela Academia (Gerente/Dono)</strong> e ao <strong>CEO do Projeto (Admin Geral)</strong>.
            </p>
            <p className="text-[11px] text-slate-500">
              Alunos, professores comuns e responsáveis não possuem autorização de leitura ou modificação deste painel.
            </p>
          </div>

          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <ArrowLeft size={14} />
              Voltar para Área Permitida
            </button>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // ESTADOS DE FILTRO & NAVEGAÇÃO
  // =========================================================================
  const today = new Date();
  const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthKey);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'paid' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTenantId, setSelectedTenantId] = useState<string>('all');

  // Modais de Criação e Edição
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingExpense, setEditingExpense] = useState<PayableExpense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<PayableExpense | null>(null);

  // Form State para Nova Despesa
  const [formDescription, setFormDescription] = useState<string>('');
  const [formCategory, setFormCategory] = useState<PayableExpenseCategory>('aluguel_fixos');
  const [formAmount, setFormAmount] = useState<string>('');
  const [formDueDate, setFormDueDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [formStatus, setFormStatus] = useState<'pending' | 'paid'>('pending');
  const [formRecipient, setFormRecipient] = useState<string>('');
  const [formPaymentMethod, setFormPaymentMethod] = useState<'pix' | 'boleto' | 'ted' | 'cash' | 'credit_card'>('pix');
  const [formNotes, setFormNotes] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  // Navegador de Mês
  const handleMonthChange = (delta: number) => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    const newY = d.getFullYear();
    const newM = String(d.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${newY}-${newM}`);
  };

  const handleResetToCurrentMonth = () => {
    setSelectedMonth(currentMonthKey);
  };

  // Formatação amigável do Mês Selecionado (ex: "Setembro de 2026")
  const formattedSelectedMonth = useMemo(() => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const date = new Date(y, m - 1, 1);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }, [selectedMonth]);

  const isViewingCurrentMonth = selectedMonth === currentMonthKey;

  // =========================================================================
  // DADOS FILTRADOS PELO MÊS SELECIONADO & FILTROS DE PESQUISA
  // =========================================================================
  const monthFilteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      // Filtro de mês pelo dueDate (YYYY-MM)
      const expMonth = exp.dueDate ? exp.dueDate.slice(0, 7) : '';
      if (expMonth !== selectedMonth) return false;

      // Multi-tenant check se não for 'all'
      if (selectedTenantId !== 'all' && exp.tenantId !== selectedTenantId) {
        return false;
      }

      return true;
    });
  }, [expenses, selectedMonth, selectedTenantId]);

  // Lista com filtros adicionais de busca, categoria e status
  const visibleExpenses = useMemo(() => {
    return monthFilteredExpenses.filter((exp) => {
      // Categoria
      if (selectedCategory !== 'all') {
        const meta = getExpenseCategoryMeta(exp.category);
        if (meta.id !== selectedCategory && exp.category !== selectedCategory) {
          return false;
        }
      }

      // Status
      if (selectedStatus !== 'all' && exp.status !== selectedStatus) {
        return false;
      }

      // Busca por descrição ou beneficiário
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const descMatch = (exp.description || '').toLowerCase().includes(q);
        const recipientMatch = (exp.recipientName || '').toLowerCase().includes(q);
        const notesMatch = (exp.notes || '').toLowerCase().includes(q);
        if (!descMatch && !recipientMatch && !notesMatch) return false;
      }

      return true;
    }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [monthFilteredExpenses, selectedCategory, selectedStatus, searchQuery]);

  // =========================================================================
  // CARDS DE TOTAIS NO TOPO (MÊS SELECIONADO)
  // =========================================================================
  const metrics = useMemo(() => {
    let totalMonth = 0;
    let totalPaid = 0;
    let totalPending = 0;

    let totalAluguelFixos = 0;
    let countAluguelFixos = 0;

    let totalFolha = 0;
    let countFolha = 0;

    let totalServicosExtras = 0;
    let countServicosExtras = 0;

    let totalAvulsas = 0;
    let countAvulsas = 0;

    monthFilteredExpenses.forEach((exp) => {
      const val = Number(exp.amount) || 0;
      totalMonth += val;

      if (exp.status === 'paid') {
        totalPaid += val;
      } else {
        totalPending += val;
      }

      const catMeta = getExpenseCategoryMeta(exp.category);
      if (catMeta.id === 'aluguel_fixos') {
        totalAluguelFixos += val;
        countAluguelFixos++;
      } else if (catMeta.id === 'folha_pagamento') {
        totalFolha += val;
        countFolha++;
      } else if (catMeta.id === 'servicos_extras') {
        totalServicosExtras += val;
        countServicosExtras++;
      } else {
        totalAvulsas += val;
        countAvulsas++;
      }
    });

    return {
      totalMonth,
      totalPaid,
      totalPending,
      totalAluguelFixos,
      countAluguelFixos,
      totalFolha,
      countFolha,
      totalServicosExtras,
      countServicosExtras,
      totalAvulsas,
      countAvulsas,
      totalCount: monthFilteredExpenses.length
    };
  }, [monthFilteredExpenses]);

  // =========================================================================
  // AÇÕES: ADICIONAR, EDITAR, EXCLUIR E MARCAR COMO PAGO
  // =========================================================================
  const handleOpenAddModal = (initialCategory?: PayableExpenseCategory) => {
    setFormDescription('');
    setFormCategory(initialCategory || 'aluguel_fixos');
    setFormAmount('');
    setFormDueDate(new Date().toISOString().slice(0, 10));
    setFormStatus('pending');
    setFormRecipient('');
    setFormPaymentMethod('pix');
    setFormNotes('');
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleSaveNewExpense = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formDescription.trim()) {
      setFormError('Por favor, informe a descrição detalhada da despesa.');
      return;
    }

    const numAmount = parseFloat(formAmount.replace(',', '.'));
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError('Informe um valor monetário válido maior que zero.');
      return;
    }

    if (!formDueDate) {
      setFormError('Informe a data de vencimento / competência da despesa.');
      return;
    }

    const targetCategoryMeta = getExpenseCategoryMeta(formCategory);

    const newExpense: PayableExpense = {
      id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      tenantId: activeAcademy.id || 'acad_loyalty_jiujitsu',
      category: formCategory,
      categoryLabel: targetCategoryMeta.label,
      description: formDescription.trim(),
      amount: numAmount,
      dueDate: formDueDate,
      status: formStatus,
      paidDate: formStatus === 'paid' ? formDueDate : undefined,
      recipientName: formRecipient.trim() || undefined,
      paymentMethod: formPaymentMethod,
      notes: formNotes.trim() || undefined,
      createdAt: new Date().toISOString(),
      createdBy: {
        id: currentUserId || 'current_user',
        name: currentUserName,
        role: currentUserRole
      }
    };

    onAddExpense(newExpense);
    setIsAddModalOpen(false);

    confetti({
      particleCount: 25,
      spread: 60,
      origin: { y: 0.8 }
    });
  };

  const handleQuickTogglePaid = (exp: PayableExpense) => {
    const updatedStatus = exp.status === 'paid' ? 'pending' : 'paid';
    const updated: PayableExpense = {
      ...exp,
      status: updatedStatus,
      paidDate: updatedStatus === 'paid' ? new Date().toISOString().slice(0, 10) : undefined
    };
    onUpdateExpense(updated);
  };

  const handleConfirmDelete = () => {
    if (expenseToDelete) {
      onDeleteExpense(expenseToDelete.id);
      setExpenseToDelete(null);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Vencimento', 'Categoria', 'Descricao', 'Favorecido', 'Valor_BRL', 'Status', 'Data_Pagamento', 'Forma_Pagamento'];
    const rows = visibleExpenses.map((e) => [
      e.dueDate,
      getExpenseCategoryMeta(e.category).label,
      `"${e.description.replace(/"/g, '""')}"`,
      `"${(e.recipientName || '').replace(/"/g, '""')}"`,
      e.amount.toFixed(2),
      e.status === 'paid' ? 'Pago' : 'Pendente',
      e.paidDate || '',
      e.paymentMethod || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Despesas_BJJACADEMY_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* ===================================================================== */}
      {/* 1. TOP HEADER DA GESTÃO DE DESPESAS */}
      {/* ===================================================================== */}
      <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="p-2 rounded-2xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition shrink-0"
                title="Voltar ao Painel Geral"
              >
                <ArrowLeft size={16} />
              </button>
            )}

            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-600 to-red-800 border border-red-500/50 flex items-center justify-center text-white shadow-lg shrink-0">
              <TrendingDown size={22} className="stroke-[2.5]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-black text-white tracking-tight">
                  Gestão de Despesas & Custos
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-950 border border-red-700/60 text-red-300 flex items-center gap-1">
                  <Lock size={10} /> Área Restrita
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Acompanhamento e controle rigoroso do fluxo de saída de caixa da academia
              </p>
            </div>
          </div>

          {/* Botão de Adicionar Despesa (Simples e Direto conforme requisito) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenAddModal()}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs shadow-lg shadow-red-900/40 border border-red-400/40 flex items-center gap-2 transition-all transform active:scale-95"
            >
              <Plus size={16} className="stroke-[3]" />
              <span>Adicionar Despesa</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="p-2.5 rounded-2xl bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white transition"
              title="Exportar Relatório Mensal em CSV"
            >
              <Download size={15} />
            </button>
          </div>
        </div>

        {/* Barra de Filtro de Mês e Filial */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => handleMonthChange(-1)}
              className="p-1 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title="Mês Anterior"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-1.5 px-2">
              <Calendar size={13} className="text-amber-400" />
              <span className="text-xs font-bold text-white capitalize">
                {formattedSelectedMonth}
              </span>
            </div>

            <button
              onClick={() => handleMonthChange(1)}
              className="p-1 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title="Próximo Mês"
            >
              <ChevronRight size={16} />
            </button>

            {!isViewingCurrentMonth && (
              <button
                onClick={handleResetToCurrentMonth}
                className="ml-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition border border-amber-500/30"
              >
                Voltar ao Mês Atual
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 hidden sm:inline">Unidade:</span>
            <div className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Building2 size={13} className="text-cyan-400" />
              <span>{activeAcademy.shortName || activeAcademy.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. CARDS NO TOPO DA TELA (SOMANDO O TOTAL GASTO NO MÊS) */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
        {/* Card 1: TOTAL GASTO NO MÊS */}
        <div className="col-span-2 md:col-span-1 p-3.5 rounded-2xl bg-gradient-to-br from-rose-950/70 via-slate-900 to-black border-2 border-rose-600/50 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-400 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider">Total Gasto no Mês</span>
            <DollarSign size={16} className="text-rose-400" />
          </div>
          <div>
            <div className="text-xl md:text-2xl font-black text-white tracking-tight">
              {formatBRL(metrics.totalMonth)}
            </div>
            <div className="flex items-center justify-between mt-1 pt-1 border-t border-rose-900/40 text-[10px]">
              <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                <CheckCircle2 size={10} /> Pago: {formatBRL(metrics.totalPaid)}
              </span>
              <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                <Clock size={10} /> Aberto: {formatBRL(metrics.totalPending)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: ALUGUEL E CUSTOS FIXOS */}
        <div 
          onClick={() => setSelectedCategory(selectedCategory === 'aluguel_fixos' ? 'all' : 'aluguel_fixos')}
          className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            selectedCategory === 'aluguel_fixos'
              ? 'bg-amber-950/60 border-amber-500 shadow-md shadow-amber-950/50'
              : 'bg-slate-900/80 border-slate-800 hover:border-amber-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-amber-400 mb-1">
            <span className="text-[10px] font-bold">Aluguel & Fixos</span>
            <Building2 size={15} />
          </div>
          <div>
            <div className="text-base md:text-lg font-black text-white">
              {formatBRL(metrics.totalAluguelFixos)}
            </div>
            <span className="text-[10px] text-slate-400">
              {metrics.countAluguelFixos} {metrics.countAluguelFixos === 1 ? 'registro' : 'registros'}
            </span>
          </div>
        </div>

        {/* Card 3: FOLHA DE PAGAMENTO */}
        <div 
          onClick={() => setSelectedCategory(selectedCategory === 'folha_pagamento' ? 'all' : 'folha_pagamento')}
          className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            selectedCategory === 'folha_pagamento'
              ? 'bg-purple-950/60 border-purple-500 shadow-md shadow-purple-950/50'
              : 'bg-slate-900/80 border-slate-800 hover:border-purple-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-purple-400 mb-1">
            <span className="text-[10px] font-bold">Folha Pagamento</span>
            <Users size={15} />
          </div>
          <div>
            <div className="text-base md:text-lg font-black text-white">
              {formatBRL(metrics.totalFolha)}
            </div>
            <span className="text-[10px] text-slate-400">
              {metrics.countFolha} {metrics.countFolha === 1 ? 'registro' : 'registros'}
            </span>
          </div>
        </div>

        {/* Card 4: SERVIÇOS EXTRAS */}
        <div 
          onClick={() => setSelectedCategory(selectedCategory === 'servicos_extras' ? 'all' : 'servicos_extras')}
          className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            selectedCategory === 'servicos_extras'
              ? 'bg-cyan-950/60 border-cyan-500 shadow-md shadow-cyan-950/50'
              : 'bg-slate-900/80 border-slate-800 hover:border-cyan-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-cyan-400 mb-1">
            <span className="text-[10px] font-bold">Serviços Extras</span>
            <Zap size={15} />
          </div>
          <div>
            <div className="text-base md:text-lg font-black text-white">
              {formatBRL(metrics.totalServicosExtras)}
            </div>
            <span className="text-[10px] text-slate-400">
              {metrics.countServicosExtras} {metrics.countServicosExtras === 1 ? 'registro' : 'registros'}
            </span>
          </div>
        </div>

        {/* Card 5: DESPESAS AVULSAS */}
        <div 
          onClick={() => setSelectedCategory(selectedCategory === 'despesas_avulsas' ? 'all' : 'despesas_avulsas')}
          className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            selectedCategory === 'despesas_avulsas'
              ? 'bg-rose-950/60 border-rose-500 shadow-md shadow-rose-950/50'
              : 'bg-slate-900/80 border-slate-800 hover:border-rose-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-rose-400 mb-1">
            <span className="text-[10px] font-bold">Despesas Avulsas</span>
            <Receipt size={15} />
          </div>
          <div>
            <div className="text-base md:text-lg font-black text-white">
              {formatBRL(metrics.totalAvulsas)}
            </div>
            <span className="text-[10px] text-slate-400">
              {metrics.countAvulsas} {metrics.countAvulsas === 1 ? 'registro' : 'registros'}
            </span>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. FILTROS RÁPIDOS E BUSCA */}
      {/* ===================================================================== */}
      <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por descrição, credor, professor ou nota..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filtros em Pílulas */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition ${
              selectedCategory === 'all'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            Todas ({monthFilteredExpenses.length})
          </button>

          {OFFICIAL_EXPENSE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? 'all' : cat.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition flex items-center gap-1 ${
                selectedCategory === cat.id
                  ? `${cat.badgeBg} ${cat.color} border ${cat.badgeBorder}`
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <span>{cat.shortLabel}</span>
            </button>
          ))}

          {/* Filtro de Status */}
          <div className="h-4 w-px bg-slate-800 mx-1" />

          <button
            onClick={() => setSelectedStatus(selectedStatus === 'paid' ? 'all' : 'paid')}
            className={`px-2 py-1 rounded-lg text-xs font-semibold shrink-0 transition flex items-center gap-1 ${
              selectedStatus === 'paid'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 size={12} /> Pagas
          </button>

          <button
            onClick={() => setSelectedStatus(selectedStatus === 'pending' ? 'all' : 'pending')}
            className={`px-2 py-1 rounded-lg text-xs font-semibold shrink-0 transition flex items-center gap-1 ${
              selectedStatus === 'pending'
                ? 'bg-amber-950 text-amber-300 border border-amber-600'
                : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            <Clock size={12} /> A Pagar
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 4. TABELA DE HISTÓRICO DE GASTOS FILTRADO PELO MÊS ATUAL */}
      {/* ===================================================================== */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-amber-400" />
            <h2 className="text-sm font-bold text-white">
              Histórico de Saídas • {formattedSelectedMonth}
            </h2>
            <span className="text-[11px] font-mono text-slate-400">
              ({visibleExpenses.length} {visibleExpenses.length === 1 ? 'despesa' : 'despesas'})
            </span>
          </div>

          <span className="text-xs font-mono font-bold text-rose-400">
            Subtotal: {formatBRL(visibleExpenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0))}
          </span>
        </div>

        {visibleExpenses.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500">
              <Receipt size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-300">Nenhuma despesa encontrada para este filtro</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Não há registros de custos operacionais com os critérios selecionados para {formattedSelectedMonth}.
              </p>
            </div>
            <button
              onClick={() => handleOpenAddModal()}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs inline-flex items-center gap-1.5 transition"
            >
              <Plus size={14} /> Cadastrar Nova Despesa
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Desktop / Tablet Table (md+) */}
            <table className="hidden md:table w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Vencimento</th>
                  <th className="py-3 px-3">Categoria</th>
                  <th className="py-3 px-4">Descrição da Despesa</th>
                  <th className="py-3 px-3">Favorecido / Fornecedor</th>
                  <th className="py-3 px-4 text-right">Valor</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {visibleExpenses.map((exp) => {
                  const catMeta = getExpenseCategoryMeta(exp.category);
                  const isPaid = exp.status === 'paid';

                  // Vencimento formatado (DD/MM)
                  const [y, m, d] = (exp.dueDate || '').split('-');
                  const formattedDate = d && m ? `${d}/${m}` : exp.dueDate;

                  return (
                    <tr key={exp.id} className="hover:bg-slate-800/40 transition">
                      {/* Vencimento */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono text-white font-bold">{formattedDate}</div>
                        <span className="text-[10px] text-slate-500">{y}</span>
                      </td>

                      {/* Categoria */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${catMeta.badgeBg} ${catMeta.badgeBorder} ${catMeta.color}`}>
                          {catMeta.shortLabel}
                        </span>
                      </td>

                      {/* Descrição */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{exp.description}</div>
                        {exp.notes && (
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">{exp.notes}</div>
                        )}
                      </td>

                      {/* Favorecido */}
                      <td className="py-3 px-3 whitespace-nowrap text-slate-300">
                        {exp.recipientName || <span className="text-slate-500 italic">Não informado</span>}
                        {exp.paymentMethod && (
                          <div className="text-[10px] font-mono uppercase text-slate-500">
                            via {exp.paymentMethod}
                          </div>
                        )}
                      </td>

                      {/* Valor */}
                      <td className="py-3 px-4 text-right whitespace-nowrap font-mono font-black text-rose-400 text-sm">
                        {formatBRL(exp.amount)}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleQuickTogglePaid(exp)}
                          title="Clique para alternar entre Pago e Pendente"
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition ${
                            isPaid
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60 hover:bg-emerald-900/60'
                              : 'bg-amber-950 text-amber-300 border border-amber-700/60 hover:bg-amber-900/60'
                          }`}
                        >
                          {isPaid ? (
                            <>
                              <CheckCircle2 size={11} className="text-emerald-400" />
                              <span>Pago</span>
                            </>
                          ) : (
                            <>
                              <Clock size={11} className="text-amber-400" />
                              <span>A Pagar</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Ações */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleQuickTogglePaid(exp)}
                            className={`p-1.5 rounded-lg border transition ${
                              isPaid
                                ? 'bg-slate-800 text-slate-400 hover:text-amber-400 border-slate-700'
                                : 'bg-emerald-950 text-emerald-400 border-emerald-700/60 hover:bg-emerald-900'
                            }`}
                            title={isPaid ? 'Reabrir despesa (Marcar como Pendente)' : 'Dar baixa imediata (Marcar como Pago)'}
                          >
                            <Check size={13} />
                          </button>

                          <button
                            onClick={() => setEditingExpense(exp)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                            title="Editar Despesa"
                          >
                            <Edit3 size={13} />
                          </button>

                          <button
                            onClick={() => setExpenseToDelete(exp)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-800 transition"
                            title="Excluir Despesa"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Mobile Cards View (Phones < md) */}
            <div className="md:hidden divide-y divide-slate-800/80">
              {visibleExpenses.map((exp) => {
                const catMeta = getExpenseCategoryMeta(exp.category);
                const isPaid = exp.status === 'paid';
                const [y, m, d] = (exp.dueDate || '').split('-');
                const formattedDate = d && m ? `${d}/${m}/${y}` : exp.dueDate;

                return (
                  <div key={`m_${exp.id}`} className="p-3.5 space-y-2.5 hover:bg-slate-800/30 transition">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${catMeta.badgeBg} ${catMeta.badgeBorder} ${catMeta.color}`}>
                        {catMeta.shortLabel}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-slate-400 font-bold">{formattedDate}</span>
                        <button
                          onClick={() => handleQuickTogglePaid(exp)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition ${
                            isPaid
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                              : 'bg-amber-950 text-amber-300 border border-amber-700/60'
                          }`}
                        >
                          {isPaid ? <CheckCircle2 size={11} className="text-emerald-400" /> : <Clock size={11} className="text-amber-400" />}
                          <span>{isPaid ? 'Pago' : 'A Pagar'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white leading-snug">{exp.description}</div>
                        {exp.recipientName && (
                          <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                            {exp.recipientName} {exp.paymentMethod && <span className="text-slate-500 font-mono">({exp.paymentMethod.toUpperCase()})</span>}
                          </div>
                        )}
                        {exp.notes && (
                          <div className="text-[10px] text-slate-500 truncate mt-0.5">{exp.notes}</div>
                        )}
                      </div>
                      <div className="text-base font-black font-mono text-rose-400 shrink-0">
                        {formatBRL(exp.amount)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
                      <span className="text-[10px] text-slate-500">
                        {isPaid && exp.paidDate ? `Baixa em: ${exp.paidDate}` : 'Vencimento próximo'}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleQuickTogglePaid(exp)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition flex items-center gap-1 ${
                            isPaid
                              ? 'bg-slate-800 text-slate-300 hover:text-amber-400 border-slate-700'
                              : 'bg-emerald-950 text-emerald-300 border-emerald-700/60'
                          }`}
                        >
                          <Check size={12} />
                          <span>{isPaid ? 'Reabrir' : 'Dar Baixa'}</span>
                        </button>

                        <button
                          onClick={() => setEditingExpense(exp)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700"
                          title="Editar"
                        >
                          <Edit3 size={13} />
                        </button>

                        <button
                          onClick={() => setExpenseToDelete(exp)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400 border border-slate-700"
                          title="Excluir"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 5. MODAL SIMPLES E DIRETO: ADICIONAR DESPESA */}
      {/* ===================================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-600/30 border border-red-500/50 flex items-center justify-center text-red-400">
                  <TrendingDown size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Nova Despesa Operacional</h3>
                  <p className="text-[11px] text-slate-400">Registro de saída de caixa para {activeAcademy.shortName || activeAcademy.name}</p>
                </div>
              </div>

              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X size={16} />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-700/60 text-xs text-red-300 flex items-center gap-2">
                <AlertTriangle size={15} className="shrink-0 text-red-400" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveNewExpense} className="space-y-3.5">
              {/* Categoria (4 opções obrigatórias) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                  Categoria da Despesa <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {OFFICIAL_EXPENSE_CATEGORIES.map((cat) => {
                    const isSelected = formCategory === cat.id;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setFormCategory(cat.id)}
                        className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                          isSelected
                            ? `${cat.badgeBg} border-red-500 ring-2 ring-red-500/30 text-white`
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${isSelected ? 'text-white' : cat.color}`}>
                            {cat.shortLabel}
                          </span>
                          {isSelected && <Check size={13} className="text-red-400" />}
                        </div>
                        <span className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">
                          {cat.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Descrição da Despesa <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Ex: Aluguel do Tatame Matriz, Salário Prof. Carlos, Conta Enel, Faixas..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Valor e Data de Vencimento */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Valor (R$) <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500">R$</span>
                    <input
                      type="text"
                      required
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      placeholder="0,00"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Vencimento <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Status Inicial & Forma de Pagamento */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Status de Baixa</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="pending">A Pagar (Pendente)</option>
                    <option value="paid">Pago (Baixa Imediata)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Forma de Pagamento</label>
                  <select
                    value={formPaymentMethod}
                    onChange={(e) => setFormPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="pix">PIX</option>
                    <option value="boleto">Boleto Bancário</option>
                    <option value="ted">TED / Transferência</option>
                    <option value="cash">Dinheiro em Espécie</option>
                    <option value="credit_card">Cartão de Crédito</option>
                  </select>
                </div>
              </div>

              {/* Favorecido e Observações Opcionais */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Beneficiário / Favorecido (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formRecipient}
                    onChange={(e) => setFormRecipient(e.target.value)}
                    placeholder="Nome da pessoa, imobiliária ou empresa"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Observações / Notas (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Contrato, chave PIX ou detalhes"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs shadow-lg transition"
                >
                  Confirmar e Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 6. MODAL DE EDIÇÃO DE DESPESA */}
      {/* ===================================================================== */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Edit3 size={18} className="text-amber-400" />
                <h3 className="text-base font-black text-white">Editar Despesa</h3>
              </div>
              <button
                onClick={() => setEditingExpense(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Categoria</label>
                <select
                  value={editingExpense.category}
                  onChange={(e) => setEditingExpense({ ...editingExpense, category: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                >
                  {OFFICIAL_EXPENSE_CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Descrição</label>
                <input
                  type="text"
                  value={editingExpense.description}
                  onChange={(e) => setEditingExpense({ ...editingExpense, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingExpense.amount}
                    onChange={(e) => setEditingExpense({ ...editingExpense, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Vencimento</label>
                  <input
                    type="date"
                    value={editingExpense.dueDate}
                    onChange={(e) => setEditingExpense({ ...editingExpense, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Status</label>
                  <select
                    value={editingExpense.status}
                    onChange={(e) => setEditingExpense({ ...editingExpense, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    <option value="pending">A Pagar (Pendente)</option>
                    <option value="paid">Pago</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Beneficiário</label>
                  <input
                    type="text"
                    value={editingExpense.recipientName || ''}
                    onChange={(e) => setEditingExpense({ ...editingExpense, recipientName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setEditingExpense(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onUpdateExpense(editingExpense);
                  setEditingExpense(null);
                }}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
              >
                Atualizar Despesa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 7. MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {/* ===================================================================== */}
      {expenseToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-slate-900 border border-red-800/80 rounded-3xl p-5 shadow-2xl text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-red-950 border border-red-700 flex items-center justify-center text-red-400">
              <Trash2 size={20} />
            </div>
            <h3 className="text-base font-black text-white">Excluir Despesa?</h3>
            <p className="text-xs text-slate-300">
              Deseja realmente remover <strong>"{expenseToDelete.description}"</strong> ({formatBRL(expenseToDelete.amount)}) do fluxo financeiro?
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setExpenseToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
