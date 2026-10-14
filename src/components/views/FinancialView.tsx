import React, { useState, useMemo, useEffect } from 'react';
import {
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Receipt,
  QrCode,
  Copy,
  Check,
  MessageSquare,
  Calculator,
  Search,
  Filter,
  Building2,
  UserCheck,
  CreditCard,
  Banknote,
  Smartphone,
  ShieldCheck,
  Sparkles,
  Download,
  X,
  ArrowUpRight
} from 'lucide-react';
import { Invoice, RegisteredAcademy, canManageFinancesOrDiscounts } from '../../types';
import { calculateLateFeeAndInterest, formatBRL } from '../../utils/financialCalculations';
import { sendReceiptViaWhatsApp, sendReminderViaWhatsApp } from '../../utils/whatsappHelper';
import { exportFinancialInvoicesCSV } from '../../utils/csvExport';
import { saveInvoiceToFirestore } from '../../firebase/firestoreService';

export type ManualSettlementMethod = 'PIX' | 'DINHEIRO' | 'CARTÃO (MAQUININHA)';

export interface FinancialViewProps {
  invoices: Invoice[];
  academies?: RegisteredAcademy[];
  activeAcademy?: RegisteredAcademy;
  activeAcademyId?: string;
  activeAcademyName?: string;
  defaultPixKey?: string;
  currentUserRole?: string;
  currentUserId?: string;
  currentUserName?: string;
  onUpdateInvoices?: (updatedInvoices: Invoice[]) => void;
  onOpenFullHub?: () => void;
}

export const FinancialView: React.FC<FinancialViewProps> = ({
  invoices: propInvoices,
  academies = [],
  activeAcademy,
  activeAcademyId = 'acad_bjj_jardins',
  activeAcademyName = 'BJJ Academy',
  defaultPixKey = '58087630378',
  currentUserRole = 'manager',
  currentUserId = 'staff_01',
  currentUserName = 'Recepção / Gerência',
  onUpdateInvoices,
  onOpenFullHub,
}) => {
  const [localInvoices, setLocalInvoices] = useState<Invoice[]>(propInvoices);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'overdue' | 'paid'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Estado do Modal de Baixa Manual (Recepcionistas / Gerentes)
  const [selectedInvoiceForSettle, setSelectedInvoiceForSettle] = useState<Invoice | null>(null);
  const [settlementMethod, setSettlementMethod] = useState<ManualSettlementMethod>('PIX');
  const [settlementAmount, setSettlementAmount] = useState<number>(0);
  const [settlementNotes, setSettlementNotes] = useState<string>('');
  const [isSubmittingSettle, setIsSubmittingSettle] = useState(false);
  const [settleSuccessMsg, setSettleSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setLocalInvoices(propInvoices);
  }, [propInvoices]);

  const effectivePixKey = activeAcademy?.pixKey || defaultPixKey || '58087630378';
  const hasPermission = canManageFinancesOrDiscounts(currentUserRole);

  // Filtragem de faturas
  const filteredInvoices = useMemo(() => {
    return localInvoices.filter((inv) => {
      if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchStudent = inv.studentName.toLowerCase().includes(q);
        const matchNumber = inv.invoiceNumber?.toLowerCase().includes(q);
        const matchTitle = inv.title.toLowerCase().includes(q);
        if (!matchStudent && !matchNumber && !matchTitle) return false;
      }
      return true;
    });
  }, [localInvoices, statusFilter, searchQuery]);

  // Métricas resumidas
  const metrics = useMemo(() => {
    let paid = 0;
    let pending = 0;
    let overdueOriginal = 0;
    let overdueUpdated = 0;
    let countPaid = 0;
    let countOpen = 0;

    localInvoices.forEach((inv) => {
      if (inv.status === 'paid') {
        paid += inv.amount;
        countPaid++;
      } else if (inv.status === 'pending') {
        pending += inv.amount;
        countOpen++;
      } else if (inv.status === 'overdue') {
        countOpen++;
        overdueOriginal += inv.amount;
        const calc = calculateLateFeeAndInterest(
          inv.amount,
          inv.dueDate,
          new Date(2026, 8, 2),
          inv.lateFeePercent || 2.0,
          inv.dailyInterestPercent ? inv.dailyInterestPercent * 30 : 1.0
        );
        overdueUpdated += calc.totalUpdatedAmount;
      }
    });

    return { paid, pending, overdueOriginal, overdueUpdated, countPaid, countOpen };
  }, [localInvoices]);

  // Abrir Modal de Baixa Manual
  const handleOpenManualSettle = (inv: Invoice, defaultMethod: ManualSettlementMethod = 'PIX') => {
    const calc =
      inv.status === 'overdue'
        ? calculateLateFeeAndInterest(
            inv.amount,
            inv.dueDate,
            new Date(2026, 8, 2),
            inv.lateFeePercent || 2.0,
            inv.dailyInterestPercent ? inv.dailyInterestPercent * 30 : 1.0
          )
        : null;

    setSelectedInvoiceForSettle(inv);
    setSettlementMethod(defaultMethod);
    setSettlementAmount(calc ? calc.totalUpdatedAmount : inv.amount);
    setSettlementNotes('');
    setSettleSuccessMsg(null);
  };

  // Confirmar Baixa Manual (PIX, Dinheiro ou Cartão na maquininha física)
  const handleConfirmManualSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForSettle || !hasPermission) return;

    setIsSubmittingSettle(true);
    setSettleSuccessMsg(null);

    try {
      const targetTenant = selectedInvoiceForSettle.academyId || activeAcademyId;
      try {
        await fetch(`/api/tenants/${targetTenant}/invoices/${selectedInvoiceForSettle.id}/manual-settle`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentMethod: settlementMethod,
            amount: settlementAmount,
            receivedByUserId: currentUserId,
            receivedByUserName: currentUserName,
            userRole: currentUserRole,
            notes: settlementNotes,
            asaasPaymentId: selectedInvoiceForSettle.asaasPaymentId || selectedInvoiceForSettle.id,
          }),
        });
      } catch (err) {
        console.warn('[FinancialView] Backend offline ou em modo direto, aplicando baixa local/Firestore:', err);
      }

      const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const mappedPaymentMethod: Invoice['paymentMethod'] =
        settlementMethod === 'PIX'
          ? 'pix'
          : settlementMethod === 'DINHEIRO'
          ? 'dinheiro'
          : 'cartao_balcao';

      const updatedInvoice: Invoice = {
        ...selectedInvoiceForSettle,
        status: 'paid',
        amount: Number(settlementAmount),
        paidDate: `Baixa Manual (${settlementMethod}) às ${nowTime}`,
        confirmedDate: new Date().toISOString(),
        paymentMethod: mappedPaymentMethod,
        isManualReceived: true,
        manualPaymentMethod: settlementMethod,
        manualReceivedByUserId: currentUserId,
        manualReceivedByUserName: currentUserName,
        settledBy: currentUserName,
        settlementChannel: 'RECEPCAO_DIRETA',
      };

      const nextList = localInvoices.map((item) =>
        item.id === updatedInvoice.id ? updatedInvoice : item
      );

      setLocalInvoices(nextList);
      if (onUpdateInvoices) {
        onUpdateInvoices(nextList);
      }
      await saveInvoiceToFirestore(updatedInvoice);

      setSettleSuccessMsg(
        `✅ Baixa manual confirmada com sucesso via ${settlementMethod} (${formatBRL(settlementAmount)})!`
      );

      setTimeout(() => {
        setSelectedInvoiceForSettle(null);
        setSettleSuccessMsg(null);
        setIsSubmittingSettle(false);
      }, 1200);
    } catch (error: any) {
      setSettleSuccessMsg(`Erro ao registrar baixa: ${error?.message || 'Tente novamente'}`);
      setIsSubmittingSettle(false);
    }
  };

  // Copiar chave PIX + instrução de comprovante
  const handleCopyPixInstruction = (inv: Invoice, updatedVal: number) => {
    const pix = inv.pixCode || effectivePixKey;
    const msg = `🥋 *${inv.academyName || activeAcademyName}*\nOlá, *${inv.studentName}*!\nReferente à mensalidade *"${inv.title}"* (Vencimento: ${inv.dueDate}).\n💰 *Valor:* ${formatBRL(updatedVal)}\n🔑 *Chave PIX da Academia:* ${pix}\n📲 *Importante:* Envie o comprovante para este número para darmos baixa imediata no seu acesso. Oss!`;
    navigator.clipboard.writeText(msg);
    setCopiedId(inv.id);
    setTimeout(() => setCopiedId(null), 2200);
  };

  return (
    <div className="space-y-4">
      {/* Banner Operação Direta (Sem Gateway / Sem Taxas de Boleto) */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/40 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
              <ShieldCheck size={11} /> Operação Direta na Academia (Zero Taxa Gateway)
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-black text-white">
            Controle de Mensalidades & Baixa Manual na Recepção
          </h3>
          <p className="text-xs text-slate-300">
            Receba diretamente via <strong>PIX da Academia</strong>, <strong>Dinheiro</strong> ou{' '}
            <strong>Cartão na Maquininha Física</strong> e dê baixa em 1 clique após conferir o comprovante.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="p-2.5 rounded-2xl bg-slate-950/90 border border-slate-800 text-right">
            <span className="text-[9px] font-bold uppercase text-amber-400 block">
              Chave PIX Oficial da Academia
            </span>
            <span className="text-xs font-mono font-black text-emerald-400 select-all">
              {effectivePixKey}
            </span>
          </div>
          {onOpenFullHub && (
            <button
              type="button"
              onClick={onOpenFullHub}
              className="px-3 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1 shadow-md transition"
            >
              <span>Hub Completo</span>
              <ArrowUpRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Cards de Resumo Rápido */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-[10px] font-bold text-emerald-400 uppercase flex items-center justify-between">
            <span>Liquidado (Caixa)</span>
            <CheckCircle2 size={13} />
          </div>
          <div className="text-lg sm:text-xl font-black text-white">{formatBRL(metrics.paid)}</div>
          <div className="text-[10px] text-slate-400">{metrics.countPaid} faturas baixadas</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-[10px] font-bold text-blue-400 uppercase flex items-center justify-between">
            <span>A Vencer</span>
            <Clock size={13} />
          </div>
          <div className="text-lg sm:text-xl font-black text-white">{formatBRL(metrics.pending)}</div>
          <div className="text-[10px] text-slate-400">No prazo de pagamento</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-[10px] font-bold text-red-400 uppercase flex items-center justify-between">
            <span>Em Atraso (Base)</span>
            <AlertTriangle size={13} />
          </div>
          <div className="text-lg sm:text-xl font-black text-white">{formatBRL(metrics.overdueOriginal)}</div>
          <div className="text-[10px] text-red-400">Aguardando comprovante</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-950/30 to-slate-900 border border-amber-600/40 space-y-1">
          <div className="text-[10px] font-bold text-amber-400 uppercase flex items-center justify-between">
            <span>Com Multa/Juros</span>
            <Calculator size={13} />
          </div>
          <div className="text-lg sm:text-xl font-black text-amber-300">{formatBRL(metrics.overdueUpdated)}</div>
          <div className="text-[10px] text-amber-400/90 font-mono">Multa 2% + 1% a.m.</div>
        </div>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar aluno, nº da fatura ou plano..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition ${
              statusFilter === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Todas ({localInvoices.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('overdue')}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition ${
              statusFilter === 'overdue'
                ? 'bg-red-600 text-white'
                : 'bg-slate-950 text-red-400 hover:text-white border border-slate-800'
            }`}
          >
            Vencidas ({localInvoices.filter((i) => i.status === 'overdue').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition ${
              statusFilter === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-950 text-blue-400 hover:text-white border border-slate-800'
            }`}
          >
            A Vencer ({localInvoices.filter((i) => i.status === 'pending').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('paid')}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition ${
              statusFilter === 'paid'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-950 text-emerald-400 hover:text-white border border-slate-800'
            }`}
          >
            Pagas ({localInvoices.filter((i) => i.status === 'paid').length})
          </button>
          <button
            type="button"
            onClick={() => exportFinancialInvoicesCSV(filteredInvoices, activeAcademyName)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-[11px] font-bold flex items-center gap-1 whitespace-nowrap transition"
            title="Exportar CSV"
          >
            <Download size={12} />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Lista de Faturas com Botão de Baixa Manual */}
      <div className="space-y-2.5">
        {filteredInvoices.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
            Nenhuma mensalidade encontrada para o filtro selecionado.
          </div>
        ) : (
          filteredInvoices.map((inv) => {
            const calc = calculateLateFeeAndInterest(
              inv.amount,
              inv.dueDate,
              new Date(2026, 8, 2),
              inv.lateFeePercent || 2.0,
              inv.dailyInterestPercent ? inv.dailyInterestPercent * 30 : 1.0
            );
            const effectiveAmount = inv.status === 'overdue' ? calc.totalUpdatedAmount : inv.amount;

            return (
              <div
                key={inv.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  inv.status === 'overdue'
                    ? 'bg-red-950/20 border-red-800/50'
                    : inv.status === 'paid'
                    ? 'bg-slate-900/70 border-slate-800'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-black text-white">{inv.studentName}</span>
                      <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                        {inv.invoiceNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          inv.status === 'paid'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : inv.status === 'overdue'
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : 'bg-blue-950 text-blue-400 border border-blue-800'
                        }`}
                      >
                        {inv.status === 'paid'
                          ? `Pago (${inv.paidDate || 'Confirmado'})`
                          : inv.status === 'overdue'
                          ? `${calc.daysOverdue}d em atraso`
                          : 'A Vencer'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300">{inv.title}</div>
                    <div className="text-[11px] text-slate-400">
                      <span className="text-amber-400 font-semibold">{inv.academyName}</span> • Vencimento:{' '}
                      <strong className="text-slate-200">{inv.dueDate}</strong>
                      {inv.settledBy && (
                        <span className="ml-2 text-emerald-400">
                          • Baixado por: <strong>{inv.settledBy}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Valores + Ações de Baixa Manual e Cobrança PIX */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                    <div className="text-left sm:text-right">
                      {inv.status === 'overdue' ? (
                        <>
                          <div className="text-[10px] text-slate-400 line-through">
                            Original: {formatBRL(inv.amount)}
                          </div>
                          <div className="text-sm sm:text-base font-black text-red-400 font-mono">
                            {formatBRL(calc.totalUpdatedAmount)}
                          </div>
                          <div className="text-[9px] text-amber-400 font-bold">
                            +{formatBRL(calc.fineAmount + calc.interestAmount)} (Multa + Juros)
                          </div>
                        </>
                      ) : (
                        <div className="text-sm sm:text-base font-black text-white font-mono">
                          {formatBRL(inv.amount)}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {inv.status !== 'paid' && hasPermission && (
                        <button
                          type="button"
                          onClick={() => handleOpenManualSettle(inv, 'PIX')}
                          className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md transition active:scale-95"
                          title="Dar baixa manual (PIX, Dinheiro ou Cartão na maquininha física)"
                        >
                          <CheckCircle2 size={14} />
                          <span>Dar Baixa Manual</span>
                        </button>
                      )}

                      {inv.status !== 'paid' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleCopyPixInstruction(inv, effectiveAmount)}
                            className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-[11px] font-bold flex items-center gap-1 transition"
                            title="Copiar Chave PIX e pedido de comprovante"
                          >
                            {copiedId === inv.id ? (
                              <>
                                <Check size={13} className="text-emerald-400" />
                                <span>Copiado</span>
                              </>
                            ) : (
                              <>
                                <Copy size={13} />
                                <span>PIX</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              sendReminderViaWhatsApp(
                                inv,
                                effectiveAmount,
                                inv.academyName || activeAcademyName,
                                effectivePixKey
                              )
                            }
                            className="px-2.5 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 text-[11px] font-bold flex items-center gap-1 transition"
                            title="Cobrar pelo WhatsApp com Chave PIX e pedido de comprovante"
                          >
                            <MessageSquare size={13} />
                            <span>WhatsApp PIX</span>
                          </button>
                        </>
                      )}

                      {inv.status === 'paid' && (
                        <button
                          type="button"
                          onClick={() => sendReceiptViaWhatsApp(inv, inv.academyName || activeAcademyName)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-[11px] font-bold flex items-center gap-1.5 transition"
                        >
                          <Receipt size={13} />
                          <span>Enviar Recibo WhatsApp</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL DE BAIXA MANUAL (RECEPCIONISTAS / GERENTES) */}
      {selectedInvoiceForSettle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                  <UserCheck size={18} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white">
                    Baixa Manual de Mensalidade
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Recepção / Gerência • Confirmação de Recebimento Direto
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoiceForSettle(null)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleConfirmManualSettlement} className="space-y-4">
              {/* Resumo do Aluno e Fatura */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Aluno / Atleta</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {selectedInvoiceForSettle.invoiceNumber}
                  </span>
                </div>
                <div className="text-sm font-black text-white">{selectedInvoiceForSettle.studentName}</div>
                <div className="text-xs text-slate-400">
                  {selectedInvoiceForSettle.title} • Venc: {selectedInvoiceForSettle.dueDate}
                </div>
              </div>

              {/* Seleção do Método de Pagamento: PIX, Dinheiro ou Cartão na maquininha física */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-slate-300">
                  Como o aluno realizou o pagamento?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSettlementMethod('PIX')}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1.5 ${
                      settlementMethod === 'PIX'
                        ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300 font-black shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone size={18} className={settlementMethod === 'PIX' ? 'text-emerald-400' : ''} />
                    <span className="text-[11px] leading-tight">PIX (Comprovante)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettlementMethod('DINHEIRO')}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1.5 ${
                      settlementMethod === 'DINHEIRO'
                        ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300 font-black shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Banknote size={18} className={settlementMethod === 'DINHEIRO' ? 'text-emerald-400' : ''} />
                    <span className="text-[11px] leading-tight">Dinheiro (Espécie)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettlementMethod('CARTÃO (MAQUININHA)')}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1.5 ${
                      settlementMethod === 'CARTÃO (MAQUININHA)'
                        ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300 font-black shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <CreditCard
                      size={18}
                      className={settlementMethod === 'CARTÃO (MAQUININHA)' ? 'text-emerald-400' : ''}
                    />
                    <span className="text-[11px] leading-tight">Cartão (Maquininha)</span>
                  </button>
                </div>
              </div>

              {/* Valor Recebido */}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-slate-300">
                  Valor Recebido (R$):
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={settlementAmount}
                  onChange={(e) => setSettlementAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono font-black text-base focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Observação opcional (Ex: Comprovante conferido no WhatsApp / NSU Maquininha) */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase text-slate-400">
                  Observação da Recepção (Opcional):
                </label>
                <input
                  type="text"
                  value={settlementNotes}
                  onChange={(e) => setSettlementNotes(e.target.value)}
                  placeholder="Ex: Comprovante PIX verificado no WhatsApp / NSU Cartão"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {settleSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-600 text-xs font-bold text-emerald-300 text-center">
                  {settleSuccessMsg}
                </div>
              )}

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceForSettle(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSettle}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition flex items-center justify-center gap-1.5 shadow-lg disabled:opacity-50"
                >
                  <CheckCircle2 size={15} />
                  <span>{isSubmittingSettle ? 'Confirmando...' : 'Confirmar Pagamento'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
