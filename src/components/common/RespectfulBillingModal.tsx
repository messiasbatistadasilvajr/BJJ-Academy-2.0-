import React, { useState } from 'react';
import { 
  X, MessageCircle, Send, CheckCircle2, Copy, 
  Clock, ShieldAlert, Sparkles, AlertCircle 
} from 'lucide-react';
import { Invoice, StudentProfile } from '../../types';
import { getRespectfulBillingMessage } from '../../utils/respectfulBilling';
import { triggerNativeHaptic } from '../../utils/nativeApp';

interface RespectfulBillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: Invoice[];
  students: StudentProfile[];
  academyName: string;
}

export const RespectfulBillingModal: React.FC<RespectfulBillingModalProps> = ({
  isOpen,
  onClose,
  invoices,
  students,
  academyName
}) => {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(invoices[0] || null);
  const [copiedPix, setCopiedPix] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  if (!isOpen) return null;

  const activeInvoice = selectedInvoice || invoices[0];
  const matchedStudent = students.find(s => s.id === activeInvoice?.studentId);
  const studentName = matchedStudent?.name || activeInvoice?.studentName || 'Aluno do Tatame';
  const invoiceAmount = activeInvoice?.amount || 100;
  const pixKey = activeInvoice?.pixCode || `pix-${academyName.toLowerCase().replace(/\s+/g, '')}@bjjacademy.com.br`;

  const isLate = activeInvoice ? new Date(activeInvoice.dueDate) < new Date() : false;
  const billingType = isLate ? 'polite_late' : 'preventive';

  const messageTemplate = getRespectfulBillingMessage(
    billingType,
    studentName,
    academyName,
    invoiceAmount,
    activeInvoice?.dueDate || '20/09/2026',
    pixKey
  );

  const handleCopy = (text: string, isPix: boolean) => {
    navigator.clipboard.writeText(text);
    triggerNativeHaptic('medium');
    if (isPix) {
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2000);
    } else {
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2000);
    }
  };

  const handleOpenWhatsApp = () => {
    const textEncoded = encodeURIComponent(messageTemplate.body);
    const phone = matchedStudent?.phone ? matchedStudent.phone.replace(/\D/g, '') : '';
    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${textEncoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <MessageCircle size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Cobrança Inteligente & Sem Constrangimento
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  WHATSAPP MARCIAL
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Disparos respeitosos via WhatsApp e aviso discreto para a catraca de recepção.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Faturas Pendentes */}
          <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-3 max-h-[55vh] overflow-y-auto space-y-1.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block px-2 pb-1">
              Pendências ({invoices.length})
            </span>
            {invoices.map((inv) => {
              const isSelected = activeInvoice?.id === inv.id;
              return (
                <button
                  key={inv.id}
                  onClick={() => setSelectedInvoice(inv)}
                  className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition ${
                    isSelected
                      ? 'bg-emerald-500/20 border border-emerald-500/40 text-white'
                      : 'hover:bg-slate-800/60 border border-transparent text-slate-300'
                  }`}
                >
                  <div className="truncate">
                    <div className="text-xs font-bold text-white truncate">{inv.studentName}</div>
                    <div className="text-[11px] text-slate-400">Venc: {inv.dueDate}</div>
                  </div>
                  <span className="text-xs font-mono font-extrabold text-emerald-400 shrink-0">
                    R$ {inv.amount.toFixed(2)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Mensagem Formatada */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles size={14} /> {messageTemplate.title}
                </span>
                <span className="text-xs text-slate-400">Aluno: <strong className="text-white">{studentName}</strong></span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                {messageTemplate.body}
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">CHAVE PIX COPIA E COLA</span>
                  <strong className="text-white font-mono">{pixKey}</strong>
                </div>
                <button
                  onClick={() => handleCopy(pixKey, true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1 transition"
                >
                  {copiedPix ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  {copiedPix ? 'Copiado!' : 'Copiar PIX'}
                </button>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={handleOpenWhatsApp}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg transition"
                >
                  <Send size={16} /> Enviar Mensagem no WhatsApp
                </button>

                <button
                  onClick={() => handleCopy(messageTemplate.body, false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition"
                >
                  {copiedMessage ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
                  {copiedMessage ? 'Copiado' : 'Copiar Texto'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
