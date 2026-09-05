import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Clock, X, MessageCircle, DollarSign, Download, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Invoice } from '../../types';
import { sendReminderViaWhatsApp } from '../../utils/whatsappHelper';
import { exportFinancialInvoicesCSV } from '../../utils/csvExport';

interface DueAlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: Invoice[];
  academyName?: string;
  activeAcademyName?: string;
  pixKey?: string;
  onOpenInvoicePix?: (inv: Invoice) => void;
  onMarkAsPaid?: (invId: string) => void;
}

export const DueAlertsDrawer: React.FC<DueAlertsDrawerProps> = ({
  isOpen,
  onClose,
  invoices,
  academyName,
  activeAcademyName,
  pixKey,
  onOpenInvoicePix,
  onMarkAsPaid,
}) => {
  if (!isOpen) return null;

  const currentAcademyName = activeAcademyName || academyName || 'BJJ Academy';

  // Filter overdue and pending invoices
  const overdueInvoices = invoices.filter((inv) => inv.status === 'overdue');
  const pendingInvoices = invoices.filter((inv) => inv.status === 'pending');
  const attentionList = [...overdueInvoices, ...pendingInvoices];

  const totalOverdue = overdueInvoices.reduce((acc, curr) => acc + curr.amount, 0);

  const handleExportCSV = () => {
    exportFinancialInvoicesCSV(attentionList, `${currentAcademyName}_cobranca_vencimentos`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-end p-3 sm:p-6 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 50, scale: 0.95 }}
          className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Top Header */}
          <div className="p-4 bg-gradient-to-r from-red-950/80 via-slate-900 to-amber-950/50 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                  <span>Alertas de Vencimento</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold">
                    {attentionList.length} faturas
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  {academyName} • Cobrança amigável em 1 clique
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-red-950/30 border border-red-900/50">
              <span className="text-[10px] uppercase font-bold text-red-400 block">Total em Atraso</span>
              <span className="text-base font-black text-white">
                R$ {totalOverdue.toFixed(2).replace('.', ',')}
              </span>
              <span className="text-[10px] text-red-300 block">{overdueInvoices.length} alunos</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Exportar Lista</span>
              <button
                type="button"
                onClick={handleExportCSV}
                className="mt-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] flex items-center gap-1.5 transition border border-slate-700"
              >
                <Download className="w-3 h-3 text-emerald-400" />
                <span>Baixar CSV</span>
              </button>
            </div>
          </div>

          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 no-scrollbar">
            {attentionList.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto opacity-70" />
                <p className="font-bold text-white">Tudo em dia!</p>
                <p className="text-[11px] text-slate-500">Nenhuma fatura em atraso ou pendente no momento.</p>
              </div>
            ) : (
              attentionList.map((inv) => {
                const isOverdue = inv.status === 'overdue';

                return (
                  <div
                    key={inv.id}
                    className={`p-3 rounded-2xl border transition ${
                      isOverdue
                        ? 'bg-red-950/20 border-red-900/60 ring-1 ring-red-500/20'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-black text-white">{inv.studentName}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{inv.title}</div>
                        <div className="text-[10px] font-mono text-slate-500">Doc: {inv.invoiceNumber}</div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black text-white font-mono block">
                          R$ {inv.amount.toFixed(2).replace('.', ',')}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full inline-block mt-0.5 ${
                            isOverdue
                              ? 'bg-red-950 text-red-300 border border-red-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {isOverdue ? `Venceu em ${inv.dueDate}` : `Vence em ${inv.dueDate}`}
                        </span>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => sendReminderViaWhatsApp(inv, academyName, pixKey)}
                        className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
                        title="Enviar lembrete amigável no WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-white" />
                        <span>Cobrar WhatsApp</span>
                      </button>

                      {onOpenInvoicePix && (
                        <button
                          type="button"
                          onClick={() => {
                            onOpenInvoicePix(inv);
                            onClose();
                          }}
                          className="py-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center gap-1 transition border border-slate-700"
                        >
                          <DollarSign className="w-3 h-3 text-emerald-400" />
                          <span>PIX</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer note */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 text-center text-[10px] text-slate-500">
            Lembretes enviados diretamente pelo app com a chave PIX oficial.
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
