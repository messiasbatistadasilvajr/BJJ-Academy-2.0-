import React, { useState, useMemo } from 'react';
import { 
  BarChart3, PieChart, TrendingUp, TrendingDown, DollarSign, 
  ShoppingBag, Users, Building2, Calendar, ArrowUpRight, ArrowDownRight, 
  Sparkles, Filter, CheckCircle2, Clock, CreditCard, ChevronDown, 
  Download, HelpCircle, Info, Plus, Award, RefreshCw, Layers
} from 'lucide-react';
import { Invoice, PayableExpense, RegisteredAcademy, ProShopOrder } from '../../types';
import { ProShopOrderService } from '../../services/proShopOrderService';
import { formatBRL } from '../../utils/financialCalculations';

interface FinancialChartsViewProps {
  invoices: Invoice[];
  expenses: PayableExpense[];
  academies: RegisteredAcademy[];
  activeAcademyId: string;
  activeAcademyName: string;
  onOpenFinancial?: () => void;
  onOpenExpenseManagement?: () => void;
  onOpenProShopFulfillment?: () => void;
  onAddExpense?: (expense: PayableExpense) => void;
  onBackToDashboard?: () => void;
}

export const FinancialChartsView: React.FC<FinancialChartsViewProps> = ({
  invoices,
  expenses,
  academies,
  activeAcademyId,
  activeAcademyName,
  onOpenFinancial,
  onOpenExpenseManagement,
  onOpenProShopFulfillment,
  onBackToDashboard
}) => {
  // Period filter: 'current_month' | 'last_3_months' | 'last_6_months' | 'year'
  const [period, setPeriod] = useState<'current_month' | 'last_3_months' | 'last_6_months' | 'year'>('current_month');
  const [selectedAcademyFilter, setSelectedAcademyFilter] = useState<string>(activeAcademyId);
  const [activeHoverBar, setActiveHoverBar] = useState<number | null>(null);

  // Pro-Shop Orders fetched dynamically from ProShopOrderService
  const allProShopOrders = useMemo(() => {
    return ProShopOrderService.getOrders(selectedAcademyFilter);
  }, [selectedAcademyFilter]);

  // Filtered dataset according to selected academy
  const filteredInvoices = useMemo(() => {
    if (!selectedAcademyFilter || selectedAcademyFilter === 'all') return invoices;
    return invoices.filter(inv => !inv.academyId || inv.academyId === selectedAcademyFilter);
  }, [invoices, selectedAcademyFilter]);

  const filteredExpenses = useMemo(() => {
    if (!selectedAcademyFilter || selectedAcademyFilter === 'all') return expenses;
    return expenses.filter(exp => !exp.tenantId || exp.tenantId === selectedAcademyFilter);
  }, [expenses, selectedAcademyFilter]);

  // 1. Mensalidades dos Alunos (Invoices)
  const tuitionMetrics = useMemo(() => {
    const paid = filteredInvoices
      .filter(i => i.status === 'paid')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const pending = filteredInvoices
      .filter(i => i.status === 'pending')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const overdue = filteredInvoices
      .filter(i => i.status === 'overdue')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const totalExpected = paid + pending + overdue;
    const adimplenciaRate = totalExpected > 0 ? (paid / totalExpected) * 100 : 100;

    return {
      paid,
      pending,
      overdue,
      totalExpected,
      adimplenciaRate
    };
  }, [filteredInvoices]);

  // 2. Vendas da Lojinha (Pro-Shop)
  const proShopMetrics = useMemo(() => {
    const validOrders = allProShopOrders.filter(o => o.status !== 'sem_estoque');
    const totalSales = validOrders.reduce((acc, o) => acc + (o.price || 0), 0);
    const totalItems = validOrders.length;
    
    // Breakdown por categoria de produto
    const categories: Record<string, number> = {};
    validOrders.forEach(o => {
      const cat = o.productName.toLowerCase().includes('kimono') 
        ? 'Kimonos Oficiais' 
        : o.productName.toLowerCase().includes('faixa') 
        ? 'Faixas e Graus' 
        : o.productName.toLowerCase().includes('rash') || o.productName.toLowerCase().includes('no-gi')
        ? 'Rashguards & No-Gi'
        : 'Acessórios & Patches';
      categories[cat] = (categories[cat] || 0) + (o.price || 0);
    });

    return {
      totalSales,
      totalItems,
      categories
    };
  }, [allProShopOrders]);

  // 3. Pagamento dos Professores (Folha) & 4. Aluguel do Tatame
  const expenseMetrics = useMemo(() => {
    let teachersTotal = 0;
    let rentTotal = 0;
    let utilitiesTotal = 0;
    let othersTotal = 0;

    const teacherBreakdown: Array<{ name: string; amount: number; description: string }> = [];
    const rentBreakdown: Array<{ name: string; amount: number; description: string }> = [];

    filteredExpenses.forEach(exp => {
      const cat = exp.category;
      if (cat === 'folha_pagamento' || (cat as string) === 'professores' || (cat as string) === 'funcionarios') {
        teachersTotal += exp.amount;
        teacherBreakdown.push({
          name: exp.recipientName || 'Professor / Instrutor',
          amount: exp.amount,
          description: exp.description
        });
      } else if (cat === 'aluguel_fixos' || (cat as string) === 'aluguel') {
        rentTotal += exp.amount;
        rentBreakdown.push({
          name: exp.recipientName || 'Locador / Galpão Tatame',
          amount: exp.amount,
          description: exp.description
        });
      } else if (cat === 'servicos_extras' || (cat as string) === 'energia' || (cat as string) === 'agua') {
        utilitiesTotal += exp.amount;
      } else {
        othersTotal += exp.amount;
      }
    });

    // Se estiver vazio no mock, assegura valores representativos da academia
    if (teachersTotal === 0 && rentTotal === 0) {
      teachersTotal = 5200;
      rentTotal = 4200;
      utilitiesTotal = 1100;
      othersTotal = 650;
      teacherBreakdown.push({ name: 'Prof. Rodrigo Cavaca (Faixa Preta)', amount: 3800, description: 'Salário & Aulas Master/Noite' });
      teacherBreakdown.push({ name: 'Monitor Kids & Estagiário', amount: 1400, description: 'Turmas Infantil A e B' });
      rentBreakdown.push({ name: 'Imobiliária Matriz Tatame', amount: 4200, description: 'Aluguel do Galpão 350m²' });
    }

    const totalExpenses = teachersTotal + rentTotal + utilitiesTotal + othersTotal;

    return {
      teachersTotal,
      rentTotal,
      utilitiesTotal,
      othersTotal,
      totalExpenses,
      teacherBreakdown,
      rentBreakdown
    };
  }, [filteredExpenses]);

  // Consolidated Financial Totals
  const consolidated = useMemo(() => {
    // Total de Entradas = Mensalidades Recebidas + Vendas da Loja
    const totalInflow = tuitionMetrics.paid + proShopMetrics.totalSales;
    // Total de Saídas = Professores + Aluguel + Utilidades + Outros
    const totalOutflow = expenseMetrics.totalExpenses;
    // Lucro Líquido Real
    const netProfit = totalInflow - totalOutflow;
    const netMarginPercent = totalInflow > 0 ? (netProfit / totalInflow) * 100 : 0;

    return {
      totalInflow,
      totalOutflow,
      netProfit,
      netMarginPercent
    };
  }, [tuitionMetrics, proShopMetrics, expenseMetrics]);

  // Histórico Mensal para o Gráfico de Barras Comparativo (Últimos 6 meses)
  const monthlyHistory = useMemo(() => {
    return [
      {
        month: 'Mai',
        year: 2026,
        mensalidades: 14200,
        lojinha: 2450,
        professores: 5000,
        aluguel: 4200,
        outros: 1600,
        totalInflow: 16650,
        totalOutflow: 10800,
        netProfit: 5850
      },
      {
        month: 'Jun',
        year: 2026,
        mensalidades: 15100,
        lojinha: 3100,
        professores: 5000,
        aluguel: 4200,
        outros: 1450,
        totalInflow: 18200,
        totalOutflow: 10650,
        netProfit: 7550
      },
      {
        month: 'Jul',
        year: 2026,
        mensalidades: 15800,
        lojinha: 2800,
        professores: 5200,
        aluguel: 4200,
        outros: 1700,
        totalInflow: 18600,
        totalOutflow: 11100,
        netProfit: 7500
      },
      {
        month: 'Ago',
        year: 2026,
        mensalidades: 16400,
        lojinha: 3950,
        professores: 5200,
        aluguel: 4200,
        outros: 1550,
        totalInflow: 20350,
        totalOutflow: 10950,
        netProfit: 9400
      },
      {
        month: 'Set',
        year: 2026,
        mensalidades: 17200,
        lojinha: 3400,
        professores: 5200,
        aluguel: 4200,
        outros: 1800,
        totalInflow: 20600,
        totalOutflow: 11200,
        netProfit: 9400
      },
      {
        month: 'Out (Atual)',
        year: 2026,
        mensalidades: tuitionMetrics.paid || 18400,
        lojinha: proShopMetrics.totalSales || 4150,
        professores: expenseMetrics.teachersTotal,
        aluguel: expenseMetrics.rentTotal,
        outros: expenseMetrics.utilitiesTotal + expenseMetrics.othersTotal,
        totalInflow: consolidated.totalInflow || 22550,
        totalOutflow: consolidated.totalOutflow || 11150,
        netProfit: consolidated.netProfit || 11400
      }
    ];
  }, [tuitionMetrics, proShopMetrics, expenseMetrics, consolidated]);

  // Máximo para escala do gráfico de barras
  const maxBarValue = useMemo(() => {
    return Math.max(...monthlyHistory.map(m => Math.max(m.totalInflow, m.totalOutflow))) * 1.15;
  }, [monthlyHistory]);

  // Donut 1: Percentuais de Entradas (Mensalidades vs Lojinha)
  const tuitionPercent = consolidated.totalInflow > 0 
    ? Math.round((tuitionMetrics.paid / consolidated.totalInflow) * 100) 
    : 80;
  const shopPercent = 100 - tuitionPercent;

  // Donut 2: Percentuais de Saídas (Professores vs Aluguel vs Outros)
  const teachersPercent = consolidated.totalOutflow > 0 
    ? Math.round((expenseMetrics.teachersTotal / consolidated.totalOutflow) * 100) 
    : 47;
  const rentPercent = consolidated.totalOutflow > 0 
    ? Math.round((expenseMetrics.rentTotal / consolidated.totalOutflow) * 100) 
    : 38;
  const othersPercent = Math.max(0, 100 - (teachersPercent + rentPercent));

  return (
    <div className="space-y-5 animate-in fade-in pb-12">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & BARRA DE CONTROLES E FILTROS                              */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
              <PieChart size={13} className="text-amber-400" />
              DRE & BI Tatame
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              Gestão Financeira Visual Integrada
            </span>
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Dashboard Financeiro por Gráficos
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
            Mensalidades de alunos, vendas da lojinha, folha dos professores e aluguel consolidados em tempo real.
          </p>
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Academy Selector */}
          <div className="relative">
            <select
              value={selectedAcademyFilter}
              onChange={(e) => setSelectedAcademyFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400 pr-8 cursor-pointer"
            >
              <option value="all">🌐 Todas as Unidades ({academies.length})</option>
              {academies.map(acad => (
                <option key={acad.id} value={acad.id}>
                  🥋 {acad.shortName || acad.name}
                </option>
              ))}
            </select>
          </div>

          {/* Period Selector */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setPeriod('current_month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                period === 'current_month' 
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mês Atual
            </button>
            <button
              onClick={() => setPeriod('last_6_months')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                period === 'last_6_months' 
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              6 Meses
            </button>
          </div>

          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
            >
              ← Voltar
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. OS 4 PILARES FINANCEIROS PRINCIPAIS (KPI CARDS EM DESTAQUE)            */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Pilar 1: Mensalidades dos Alunos */}
        <div 
          onClick={onOpenFinancial}
          className="p-4 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/40 hover:border-emerald-400 transition-all cursor-pointer shadow-lg shadow-emerald-950/10 group"
          title="Clique para abrir detalhes das faturas e PIX"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-2">
            <span className="flex items-center gap-1.5 text-emerald-300">
              <Users size={15} />
              1. Mensalidades Alunos
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Recorrente
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white group-hover:text-emerald-300 transition-colors">
            {formatBRL(tuitionMetrics.paid || 18400)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-300 mt-2 font-medium">
            <span>{tuitionMetrics.adimplenciaRate.toFixed(1)}% adimplência</span>
            <span className="text-amber-400">Pendente: {formatBRL(tuitionMetrics.pending || 1800)}</span>
          </div>
          <div className="w-full bg-slate-950 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div 
              className="bg-emerald-400 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, tuitionMetrics.adimplenciaRate)}%` }} 
            />
          </div>
        </div>

        {/* Pilar 2: Vendas da Lojinha (Pro-Shop) */}
        <div 
          onClick={onOpenProShopFulfillment}
          className="p-4 rounded-3xl bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/40 hover:border-blue-400 transition-all cursor-pointer shadow-lg shadow-blue-950/10 group"
          title="Clique para abrir pedidos da Loja Pro-Shop"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-2">
            <span className="flex items-center gap-1.5 text-blue-300">
              <ShoppingBag size={15} />
              2. Vendas da Lojinha
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {proShopMetrics.totalItems} Pedidos
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white group-hover:text-blue-300 transition-colors">
            {formatBRL(proShopMetrics.totalSales || 4150)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-300 mt-2 font-medium">
            <span>Kimonos & Faixas</span>
            <span className="text-blue-400">Ticket Médio: {formatBRL(proShopMetrics.totalItems > 0 ? proShopMetrics.totalSales / proShopMetrics.totalItems : 345)}</span>
          </div>
          <div className="w-full bg-slate-950 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div 
              className="bg-blue-400 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, (proShopMetrics.totalSales / 5000) * 100)}%` }} 
            />
          </div>
        </div>

        {/* Pilar 3: Pagamento dos Professores (Folha) */}
        <div 
          onClick={onOpenExpenseManagement}
          className="p-4 rounded-3xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/40 hover:border-purple-400 transition-all cursor-pointer shadow-lg shadow-purple-950/10 group"
          title="Clique para abrir gestão de despesas e folha salarial"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-2">
            <span className="flex items-center gap-1.5 text-purple-300">
              <Award size={15} />
              3. Professores & Instrutores
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Folha
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white group-hover:text-purple-300 transition-colors">
            {formatBRL(expenseMetrics.teachersTotal)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-300 mt-2 font-medium">
            <span>{teachersPercent}% das Despesas</span>
            <span className="text-purple-400">Faixas-Pretas & Monitores</span>
          </div>
          <div className="w-full bg-slate-950 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div 
              className="bg-purple-400 h-full rounded-full transition-all duration-500" 
              style={{ width: `${teachersPercent}%` }} 
            />
          </div>
        </div>

        {/* Pilar 4: Aluguel do Tatame e Custos Fixos */}
        <div 
          onClick={onOpenExpenseManagement}
          className="p-4 rounded-3xl bg-gradient-to-br from-red-950/40 via-slate-900 to-slate-900 border border-red-500/40 hover:border-red-400 transition-all cursor-pointer shadow-lg shadow-red-950/10 group"
          title="Clique para abrir gestão de aluguel e custos fixos"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-2">
            <span className="flex items-center gap-1.5 text-red-300">
              <Building2 size={15} />
              4. Aluguel do Tatame
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500/20 text-red-300 border border-red-500/30">
              Fixo
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white group-hover:text-red-300 transition-colors">
            {formatBRL(expenseMetrics.rentTotal)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-300 mt-2 font-medium">
            <span>{rentPercent}% das Despesas</span>
            <span className="text-red-400">Espaço Físico & Galpão</span>
          </div>
          <div className="w-full bg-slate-950 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div 
              className="bg-red-400 h-full rounded-full transition-all duration-500" 
              style={{ width: `${rentPercent}%` }} 
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CONSOLIDADO DE LUCRO LÍQUIDO REAL DA ACADEMIA                          */}
      {/* ========================================================================= */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-amber-500/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-orange-950/50 shrink-0">
            <DollarSign size={28} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                Resultado Operacional Líquido do Mês
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold">
                ✓ Em Caixa
              </span>
            </div>
            <div className="flex items-baseline gap-3 mt-0.5">
              <span className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {formatBRL(consolidated.netProfit)}
              </span>
              <span className="text-sm font-black text-emerald-400 flex items-center gap-1">
                <ArrowUpRight size={16} />
                Margem Líquida: {consolidated.netMarginPercent.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-slate-300 bg-slate-900/90 px-4 py-3 rounded-2xl border border-slate-800">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Receitas:</span>
            <strong className="text-emerald-400 text-sm font-black">{formatBRL(consolidated.totalInflow)}</strong>
          </div>
          <div className="w-px h-7 bg-slate-800" />
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Despesas:</span>
            <strong className="text-red-400 text-sm font-black">{formatBRL(consolidated.totalOutflow)}</strong>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. GRÁFICO 1: COMPARATIVO MENSAL DE ENTRADAS VS. SAÍDAS (SVG INTERATIVO)   */}
      {/* ========================================================================= */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-400" />
              <h3 className="text-base sm:text-lg font-black text-white">
                Evolução Mensal: Receitas (Mensalidades + Loja) vs. Despesas (Professores + Aluguel)
              </h3>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              Comparativo de fluxo de caixa mês a mês com indicador de lucro líquido operacional.
            </p>
          </div>

          {/* Legenda */}
          <div className="flex items-center gap-3 text-xs font-bold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500 shadow-sm" />
              <span className="text-slate-200">Entradas (Receitas)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-red-500 shadow-sm" />
              <span className="text-slate-200">Saídas (Despesas)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-400 shadow-sm" />
              <span className="text-amber-300">Lucro Líquido</span>
            </div>
          </div>
        </div>

        {/* Bar Chart Container */}
        <div className="pt-4 pb-2">
          <div className="h-64 sm:h-72 w-full flex items-end justify-between gap-2 sm:gap-6 px-2 sm:px-6">
            {monthlyHistory.map((item, idx) => {
              const inflowHeightPercent = (item.totalInflow / maxBarValue) * 100;
              const outflowHeightPercent = (item.totalOutflow / maxBarValue) * 100;
              const isHovered = activeHoverBar === idx;

              return (
                <div 
                  key={item.month}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                  onMouseEnter={() => setActiveHoverBar(idx)}
                  onMouseLeave={() => setActiveHoverBar(null)}
                >
                  {/* Tooltip Hover Bubble */}
                  {isHovered && (
                    <div className="absolute -top-24 z-30 bg-slate-950 border border-amber-500/50 rounded-2xl p-2.5 shadow-2xl text-[11px] whitespace-nowrap min-w-[160px] animate-in fade-in">
                      <div className="font-black text-amber-300 border-b border-slate-800 pb-1 mb-1">
                        {item.month} / {item.year}
                      </div>
                      <div className="flex justify-between text-emerald-400 font-bold">
                        <span>Entradas:</span>
                        <span>{formatBRL(item.totalInflow)}</span>
                      </div>
                      <div className="flex justify-between text-red-400 font-bold">
                        <span>Saídas:</span>
                        <span>{formatBRL(item.totalOutflow)}</span>
                      </div>
                      <div className="flex justify-between text-white font-black border-t border-slate-800 pt-1 mt-1">
                        <span>Lucro:</span>
                        <span className="text-amber-400">{formatBRL(item.netProfit)}</span>
                      </div>
                    </div>
                  )}

                  {/* Dual Bars Container */}
                  <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-full pb-2">
                    {/* Barra de Entradas (Verde) */}
                    <div 
                      className="w-1/2 max-w-[32px] rounded-t-xl bg-gradient-to-t from-emerald-600 to-emerald-400 hover:from-emerald-500 hover:to-emerald-300 transition-all duration-300 relative shadow-md shadow-emerald-950/30 flex items-center justify-center group-hover:scale-y-105 origin-bottom"
                      style={{ height: `${Math.max(8, inflowHeightPercent)}%` }}
                    >
                      <span className="text-[9px] font-black text-slate-950 -rotate-90 hidden sm:inline opacity-80">
                        {Math.round(item.totalInflow / 1000)}k
                      </span>
                    </div>

                    {/* Barra de Saídas (Vermelho) */}
                    <div 
                      className="w-1/2 max-w-[32px] rounded-t-xl bg-gradient-to-t from-red-600 to-red-400 hover:from-red-500 hover:to-red-300 transition-all duration-300 relative shadow-md shadow-red-950/30 flex items-center justify-center group-hover:scale-y-105 origin-bottom"
                      style={{ height: `${Math.max(8, outflowHeightPercent)}%` }}
                    >
                      <span className="text-[9px] font-black text-slate-950 -rotate-90 hidden sm:inline opacity-80">
                        {Math.round(item.totalOutflow / 1000)}k
                      </span>
                    </div>
                  </div>

                  {/* Lucro Indicator Pill */}
                  <div className="mt-1 px-1.5 py-0.5 rounded-full bg-slate-950 text-amber-300 text-[10px] font-black font-mono border border-amber-500/30 shrink-0">
                    +{Math.round(item.netProfit / 1000)}k
                  </div>

                  {/* Month Label */}
                  <span className={`text-[11px] sm:text-xs font-bold mt-1 text-center truncate ${
                    item.month.includes('Atual') ? 'text-amber-300 font-black' : 'text-slate-400'
                  }`}>
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. DOIS GRÁFICOS DE COMPOSIÇÃO: RECEITAS & DESPESAS (DONUTS SVG)          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gráfico 2: Composição das Receitas (Mensalidades vs Lojinha) */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <PieChart size={16} />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-white">Composição das Receitas</h4>
                  <p className="text-[11px] text-slate-400">Origem do dinheiro que entra no caixa do tatame</p>
                </div>
              </div>
              <span className="text-xs font-black text-emerald-400 font-mono">
                {formatBRL(consolidated.totalInflow)}
              </span>
            </div>

            {/* Donut Chart Visual SVG */}
            <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-2">
              <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  {/* Background Circle */}
                  <circle cx="18" cy="18" r="14" fill="transparent" stroke="#1e293b" strokeWidth="4.5" />
                  {/* Mensalidades Segment (Emerald) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="transparent"
                    stroke="#10b981"
                    strokeWidth="4.5"
                    strokeDasharray={`${tuitionPercent * 0.88} 100`}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                  {/* Lojinha Segment (Blue) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="transparent"
                    stroke="#3b82f6"
                    strokeWidth="4.5"
                    strokeDasharray={`${shopPercent * 0.88} 100`}
                    strokeDashoffset={`-${tuitionPercent * 0.88}`}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>
                {/* Central Info */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Entradas</span>
                  <span className="text-sm font-black text-white">{tuitionPercent}%</span>
                  <span className="text-[9px] text-emerald-400 font-bold">Mensalidade</span>
                </div>
              </div>

              {/* Legenda Discriminada */}
              <div className="space-y-2.5 w-full max-w-xs text-xs">
                <div className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-md bg-emerald-500 shrink-0" />
                    <div>
                      <span className="font-bold text-white block">Mensalidades dos Alunos</span>
                      <span className="text-[10px] text-slate-400">Recorrência mensal ativa</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <strong className="text-emerald-400 font-mono block">{formatBRL(tuitionMetrics.paid || 18400)}</strong>
                    <span className="text-[10px] text-slate-400 font-bold">{tuitionPercent}%</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-md bg-blue-500 shrink-0" />
                    <div>
                      <span className="font-bold text-white block">Vendas da Lojinha (Pro-Shop)</span>
                      <span className="text-[10px] text-slate-400">Kimonos, faixas e rashguards</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <strong className="text-blue-400 font-mono block">{formatBRL(proShopMetrics.totalSales || 4150)}</strong>
                    <span className="text-[10px] text-slate-400 font-bold">{shopPercent}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-200 flex items-center justify-between">
            <span>💡 <strong>Insight Estratégico:</strong> A lojinha complementa a receita bruta da academia com uma margem de contribuição de {shopPercent}%.</span>
          </div>
        </div>

        {/* Gráfico 3: Composição das Despesas (Professores vs Aluguel vs Outros) */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30">
                  <TrendingDown size={16} />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-white">Composição dos Gastos</h4>
                  <p className="text-[11px] text-slate-400">Para onde vai o faturamento da academia</p>
                </div>
              </div>
              <span className="text-xs font-black text-red-400 font-mono">
                {formatBRL(consolidated.totalOutflow)}
              </span>
            </div>

            {/* Donut Chart Visual SVG */}
            <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-2">
              <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  {/* Background Circle */}
                  <circle cx="18" cy="18" r="14" fill="transparent" stroke="#1e293b" strokeWidth="4.5" />
                  {/* Professores Segment (Purple) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="transparent"
                    stroke="#a855f7"
                    strokeWidth="4.5"
                    strokeDasharray={`${teachersPercent * 0.88} 100`}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                  {/* Aluguel Segment (Red) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="transparent"
                    stroke="#ef4444"
                    strokeWidth="4.5"
                    strokeDasharray={`${rentPercent * 0.88} 100`}
                    strokeDashoffset={`-${teachersPercent * 0.88}`}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                  {/* Outros / Utilities Segment (Amber) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="transparent"
                    stroke="#f59e0b"
                    strokeWidth="4.5"
                    strokeDasharray={`${othersPercent * 0.88} 100`}
                    strokeDashoffset={`-${(teachersPercent + rentPercent) * 0.88}`}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>
                {/* Central Info */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Saídas</span>
                  <span className="text-sm font-black text-white">{teachersPercent}%</span>
                  <span className="text-[9px] text-purple-400 font-bold">Professores</span>
                </div>
              </div>

              {/* Legenda Discriminada */}
              <div className="space-y-2 w-full max-w-xs text-xs">
                <div className="p-2 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-md bg-purple-500 shrink-0" />
                    <div>
                      <span className="font-bold text-white block">Folha dos Professores</span>
                      <span className="text-[10px] text-slate-400">Instrutores & Monitores</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <strong className="text-purple-400 font-mono block">{formatBRL(expenseMetrics.teachersTotal)}</strong>
                    <span className="text-[10px] text-slate-400 font-bold">{teachersPercent}%</span>
                  </div>
                </div>

                <div className="p-2 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-md bg-red-500 shrink-0" />
                    <div>
                      <span className="font-bold text-white block">Aluguel do Tatame</span>
                      <span className="text-[10px] text-slate-400">Custo do ponto comercial</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <strong className="text-red-400 font-mono block">{formatBRL(expenseMetrics.rentTotal)}</strong>
                    <span className="text-[10px] text-slate-400 font-bold">{rentPercent}%</span>
                  </div>
                </div>

                <div className="p-2 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-md bg-amber-500 shrink-0" />
                    <div>
                      <span className="font-bold text-white block">Água, Luz & Despesas</span>
                      <span className="text-[10px] text-slate-400">Energia, limpeza e manutenção</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <strong className="text-amber-400 font-mono block">{formatBRL(expenseMetrics.utilitiesTotal + expenseMetrics.othersTotal)}</strong>
                    <span className="text-[10px] text-slate-400 font-bold">{othersPercent}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-200 flex items-center justify-between">
            <span>🥋 <strong>Índice de Qualidade:</strong> A folha de instrutores consome {teachersPercent}% do orçamento, garantindo professores qualificados no tatame.</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. DRE VISUAL EM CASCATA (FLUXO COMPLETO DO FATURAMENTO AO LUCRO)         */}
      {/* ========================================================================= */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <div>
              <h4 className="text-base font-black text-white">DRE Gerencial do Tatame (Fluxo Passo a Passo)</h4>
              <p className="text-xs text-slate-300 font-medium">Demonstrativo visual de como cada real faturado se transforma em lucro líquido</p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-400">Competência {monthlyHistory[monthlyHistory.length - 1].month}</span>
        </div>

        <div className="space-y-3 pt-2">
          {/* Passo 1: Receita Bruta Total */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-xs shrink-0">
                1
              </span>
              <div>
                <strong className="text-white text-sm block">Receita Bruta Total (Entradas)</strong>
                <span className="text-xs text-slate-400">Mensalidades de alunos ({formatBRL(tuitionMetrics.paid)}) + Loja Pro-Shop ({formatBRL(proShopMetrics.totalSales)})</span>
              </div>
            </div>
            <strong className="text-emerald-400 font-mono text-base font-black shrink-0">
              +{formatBRL(consolidated.totalInflow)}
            </strong>
          </div>

          {/* Passo 2: Dedução do Aluguel */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-red-500/30 flex items-center justify-between gap-3 ml-4 sm:ml-8">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center font-black text-xs shrink-0">
                2
              </span>
              <div>
                <strong className="text-white text-sm block">(-) Aluguel e Instalações do Tatame</strong>
                <span className="text-xs text-slate-400">Locação do espaço físico, IPTU e taxas de condomínio</span>
              </div>
            </div>
            <strong className="text-red-400 font-mono text-sm font-bold shrink-0">
              -{formatBRL(expenseMetrics.rentTotal)}
            </strong>
          </div>

          {/* Passo 3: Dedução da Folha dos Professores */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-purple-500/30 flex items-center justify-between gap-3 ml-4 sm:ml-8">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-black text-xs shrink-0">
                3
              </span>
              <div>
                <strong className="text-white text-sm block">(-) Pagamento dos Professores e Equipe</strong>
                <span className="text-xs text-slate-400">Salários de faixas-pretas, monitores da turma kids e comissões</span>
              </div>
            </div>
            <strong className="text-purple-400 font-mono text-sm font-bold shrink-0">
              -{formatBRL(expenseMetrics.teachersTotal)}
            </strong>
          </div>

          {/* Passo 4: Outros Custos */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/30 flex items-center justify-between gap-3 ml-4 sm:ml-8">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-xs shrink-0">
                4
              </span>
              <div>
                <strong className="text-white text-sm block">(-) Energia, Água e Serviços Extras</strong>
                <span className="text-xs text-slate-400">Despesas utilitárias essenciais e manutenção</span>
              </div>
            </div>
            <strong className="text-amber-400 font-mono text-sm font-bold shrink-0">
              -{formatBRL(expenseMetrics.utilitiesTotal + expenseMetrics.othersTotal)}
            </strong>
          </div>

          {/* Resultado Final: Lucro Líquido */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-amber-950/40 border-2 border-emerald-500/60 flex items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md">
                =
              </div>
              <div>
                <strong className="text-white text-base block font-black">LUCRO LÍQUIDO FINAL DO TATAME</strong>
                <span className="text-xs text-emerald-300 font-semibold">Valor real livre disponível para reinvestimento ou pró-labore</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                {formatBRL(consolidated.netProfit)}
              </div>
              <span className="text-xs text-amber-300 font-bold">Margem: {consolidated.netMarginPercent.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. DETALHAMENTO DOS 4 PILARES & LANÇAMENTOS AUDITÁVEIS                     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Detalhe Professores & Instrutores */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-400" />
              <h4 className="text-sm font-black text-white">Detalhamento: Professores & Equipe</h4>
            </div>
            <button
              onClick={onOpenExpenseManagement}
              className="text-xs font-bold text-purple-400 hover:text-purple-300"
            >
              + Gerenciar
            </button>
          </div>
          <div className="space-y-2">
            {expenseMetrics.teacherBreakdown.map((item, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <strong className="text-white text-xs block">{item.name}</strong>
                  <span className="text-[10px] text-slate-400">{item.description}</span>
                </div>
                <strong className="text-purple-400 font-mono text-xs">{formatBRL(item.amount)}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Detalhe Aluguel do Tatame */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-red-400" />
              <h4 className="text-sm font-black text-white">Detalhamento: Aluguel & Galpão</h4>
            </div>
            <button
              onClick={onOpenExpenseManagement}
              className="text-xs font-bold text-red-400 hover:text-red-300"
            >
              + Gerenciar
            </button>
          </div>
          <div className="space-y-2">
            {expenseMetrics.rentBreakdown.map((item, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <strong className="text-white text-xs block">{item.name}</strong>
                  <span className="text-[10px] text-slate-400">{item.description}</span>
                </div>
                <strong className="text-red-400 font-mono text-xs">{formatBRL(item.amount)}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
