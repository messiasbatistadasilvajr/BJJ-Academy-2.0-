import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Printer, Download, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Invoice } from '../../types';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  invoice,
}) => {
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700/80 p-5 text-slate-100 shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white print:hidden"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="text-center pb-4 border-b border-slate-800">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" /> Comprovante Quitado
            </div>
            <h3 className="text-base font-extrabold text-white tracking-tight">
              BJJ ACADEMY BRASIL
            </h3>
            <p className="text-[11px] text-slate-400">CNPJ: 42.198.840/0001-92 • Filiada CBJJ</p>
          </div>

          {/* Receipt Body */}
          <div className="py-4 space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Nº do Recibo:</span>
              <span className="font-mono font-semibold text-slate-200">{invoice.invoiceNumber}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Aluno / Pagador:</span>
              <span className="font-semibold text-white">{invoice.studentName}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Descrição:</span>
              <span className="font-medium text-slate-200 text-right max-w-[190px]">{invoice.title}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Data de Pagamento:</span>
              <span className="text-slate-200">{invoice.paidDate || 'Confirmado via PIX'}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Forma de Pagamento:</span>
              <span className="text-teal-400 font-semibold uppercase">PIX Asaas Instantâneo</span>
            </div>

            <div className="rounded-xl bg-slate-950 p-3 mt-2 flex justify-between items-center border border-slate-800">
              <span className="text-slate-400 font-medium">Valor Pago:</span>
              <span className="text-xl font-black text-white">
                R$ {invoice.amount.toFixed(2).replace('.', ',')}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <p className="text-[10px] text-slate-400 leading-tight">
                Autenticação digital <span className="font-mono text-slate-300">#SHA256-BJJ99481X</span>. Válido para prestação e fins de declaração.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-slate-800 flex gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" /> Imprimir
            </button>
            <button
              onClick={() => {
                alert('Recibo gerado em PDF com sucesso!');
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-md"
            >
              <Download className="w-3.5 h-3.5" /> Salvar PDF
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
