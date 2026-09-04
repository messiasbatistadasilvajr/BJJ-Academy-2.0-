import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, QrCode, Copy, Check, Sparkles, Building2, Users, Calendar, AlertCircle, MessageSquare } from 'lucide-react';
import { RegisteredAcademy, PlatformGeneralManager } from '../../types';
import { calculateSaasLicenseFee, formatBRL } from '../../utils/financialCalculations';

interface MySaaSSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeAcademy: RegisteredAcademy;
  generalManager: PlatformGeneralManager;
}

export const MySaaSSubscriptionModal: React.FC<MySaaSSubscriptionModalProps> = ({
  isOpen,
  onClose,
  activeAcademy,
  generalManager
}) => {
  const [copiedPix, setCopiedPix] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(activeAcademy.platformFeeStatus === 'paid');

  if (!isOpen) return null;

  const activeStudents = activeAcademy.activeStudentsCount || 85;
  const breakdown = calculateSaasLicenseFee(activeStudents);

  const pixCopyPasteCode = `00020126580014br.gov.bcb.pix0111${generalManager.pixKey}520400005303986540${breakdown.totalFee.toFixed(2).padStart(6, '0')}5802BR5925${generalManager.name.toUpperCase().slice(0, 25)}6009SAO PAULO62170513BJJPLAT${activeAcademy.id.slice(0, 6)}6304D1A2`;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCopyPasteCode);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const handleSendWhatsAppNotification = () => {
    const text = `Olá Mestre Messias! Segue a confirmação do pagamento da assinatura do BJJ Academy SaaS da nossa unidade ${activeAcademy.name} (${activeAcademy.branch}).\n\nAlunos ativos: ${activeStudents}\nValor: ${formatBRL(breakdown.totalFee)}\nCompetência: 09/2026\nChave PIX utilizada: ${generalManager.pixKey} (CPF)\n\nObrigado! Oss!`;
    const url = `https://wa.me/55${(generalManager.phone || '11987654321').replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-950 px-2 py-0.5 rounded-full border border-amber-800/40">
                  Minha Assinatura do Software
                </span>
                <h3 className="text-sm font-black text-white">{activeAcademy.name}</h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto space-y-4 no-scrollbar">
            {/* Status Card */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Status da Licença da Unidade</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-black text-white">
                    {paymentConfirmed ? 'Licença Ativa & Em Dia' : 'Aguardando Pagamento Mensal'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">Vencimento: 05 de cada mês</span>
              </div>
              <span className={`px-2.5 py-1 rounded-xl text-xs font-black border ${
                paymentConfirmed 
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800' 
                  : 'bg-amber-950 text-amber-300 border-amber-800'
              }`}>
                {paymentConfirmed ? '✓ Quitado' : 'Pendente'}
              </span>
            </div>

            {/* Breakdown Formula Box */}
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-3">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Detalhamento do Cálculo de Mensalidade
              </span>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    Taxa Fixa da Plataforma BJJ Academy:
                  </span>
                  <span className="font-mono font-bold text-white">{formatBRL(breakdown.fixedFee)}</span>
                </div>

                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    {breakdown.activeStudents} Alunos Ativos no Tatame ({formatBRL(1.30)}/aluno):
                  </span>
                  <span className="font-mono font-bold text-amber-300">{formatBRL(breakdown.variableFee)}</span>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                  <span className="font-bold text-white text-sm">Valor Total da Fatura:</span>
                  <span className="text-base font-black text-emerald-400 font-mono">
                    {formatBRL(breakdown.totalFee)}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800/60 leading-relaxed">
                ℹ️ <strong>Transparência SaaS:</strong> A mensalidade acompanha o crescimento do seu tatame de forma justa. Você só paga R$ 1,30 por aluno que está de fato ativo treinando.
              </p>
            </div>

            {/* Beneficiary Details */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 space-y-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Dados do Beneficiário da Plataforma (Gestor Geral)
              </span>

              <div className="space-y-1 text-xs">
                <div className="text-white font-bold">{generalManager.name}</div>
                <div className="text-[11px] text-slate-400">{generalManager.role}</div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-400">Chave PIX (CPF):</span>
                  <span className="font-mono font-black text-emerald-400 text-sm">{generalManager.pixKey}</span>
                </div>
              </div>

              {/* PIX Copy Box */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                <div className="truncate text-[10px] text-slate-400 font-mono bg-slate-950 px-2.5 py-2 rounded-xl border border-slate-800 flex-1">
                  {pixCopyPasteCode.slice(0, 32)}...
                </div>
                <button
                  type="button"
                  onClick={handleCopyPix}
                  className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-sm shrink-0 ${
                    copiedPix
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {copiedPix ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPix ? 'Copiado!' : 'Copiar PIX'}</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPaymentConfirmed(!paymentConfirmed)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
                >
                  {paymentConfirmed ? 'Marcar como Pendente' : 'Marcar como Pago'}
                </button>

                <button
                  type="button"
                  onClick={handleSendWhatsAppNotification}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition flex items-center justify-center gap-1.5 shadow-md"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Avisar Gestor</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
