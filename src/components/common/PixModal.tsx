import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, QrCode, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Invoice } from '../../types';

interface PixModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onPaymentSuccess: (invoiceId: string) => void;
}

export const PixModal: React.FC<PixModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onPaymentSuccess,
}) => {
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !invoice) return null;

  const handleCopy = () => {
    if (invoice.pixCode) {
      navigator.clipboard?.writeText(invoice.pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        onPaymentSuccess(invoice.id);
        setIsSuccess(false);
        onClose();
      }, 1500);
    }, 1200);
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
            className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-teal-400 tracking-wider uppercase">PIX Instantâneo</span>
              <h3 className="text-sm font-bold text-white">Pagamento de Mensalidade</h3>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-3 mb-4">
            <div className="text-xs text-slate-400 mb-1">{invoice.title}</div>
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-400">Valor Total:</span>
              <span className="text-2xl font-black text-white">
                R$ {invoice.amount.toFixed(2).replace('.', ',')}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
              <span>Vencimento: {invoice.dueDate}</span>
              <span className="text-emerald-400">Sem taxas adicionais</span>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white text-slate-950 mb-4 shadow-md">
            <div className="relative p-2 border-2 border-dashed border-slate-300 rounded-xl">
              {/* Dynamic QR Code representation */}
              <svg viewBox="0 0 160 160" width="140" height="140" className="shape-rendering-crispEdges">
                <rect width="160" height="160" fill="white" />
                {/* QR Finder patterns */}
                <rect x="10" y="10" width="40" height="40" fill="black" />
                <rect x="16" y="16" width="28" height="28" fill="white" />
                <rect x="22" y="22" width="16" height="16" fill="black" />

                <rect x="110" y="10" width="40" height="40" fill="black" />
                <rect x="116" y="16" width="28" height="28" fill="white" />
                <rect x="122" y="22" width="16" height="16" fill="black" />

                <rect x="10" y="110" width="40" height="40" fill="black" />
                <rect x="16" y="116" width="28" height="28" fill="white" />
                <rect x="22" y="122" width="16" height="16" fill="black" />

                {/* Random matrix modules */}
                <rect x="60" y="20" width="10" height="10" fill="black" />
                <rect x="80" y="20" width="10" height="10" fill="black" />
                <rect x="70" y="40" width="10" height="10" fill="black" />
                <rect x="90" y="40" width="10" height="10" fill="black" />
                <rect x="20" y="60" width="10" height="10" fill="black" />
                <rect x="40" y="60" width="10" height="10" fill="black" />
                <rect x="60" y="70" width="20" height="20" fill="#0d9488" />
                <rect x="90" y="70" width="10" height="10" fill="black" />
                <rect x="120" y="60" width="10" height="10" fill="black" />
                <rect x="140" y="80" width="10" height="10" fill="black" />
                <rect x="60" y="110" width="10" height="10" fill="black" />
                <rect x="80" y="120" width="10" height="10" fill="black" />
                <rect x="100" y="110" width="10" height="10" fill="black" />
                <rect x="130" y="130" width="10" height="10" fill="black" />
              </svg>
            </div>
            <span className="text-[10px] text-slate-500 font-medium mt-2">
              Escaneie com o app do seu banco ou copie o código abaixo
            </span>
          </div>

          {/* Copia e Cola */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
              <span>Código PIX Copia e Cola</span>
              {copied && <span className="text-emerald-400 font-bold flex items-center gap-1"><Check className="w-3 h-3" /> Copiado!</span>}
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800">
              <input
                type="text"
                readOnly
                value={invoice.pixCode || ''}
                className="w-full bg-transparent text-xs text-slate-300 font-mono focus:outline-none truncate"
              />
              <button
                onClick={handleCopy}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>

          {/* Simulate Bank Webhook (Asaas) */}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={handleSimulatePayment}
              disabled={isProcessing || isSuccess}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg ${
                isSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 hover:text-white'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Processando confirmação Asaas...
                </>
              ) : isSuccess ? (
                <>
                  <Check className="w-4 h-4" /> Pagamento Confirmado!
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> Simular Confirmação Bancária (Asaas)
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-slate-500 mt-2">
              Integração via Webhook Asaas • Baixa instantânea na sua frequência
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
