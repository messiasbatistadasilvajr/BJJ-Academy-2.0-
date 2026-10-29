import React, { useState, useMemo } from 'react';
import { 
  X, MessageCircle, Send, CheckCircle2, Copy, 
  Clock, ShieldAlert, Sparkles, AlertCircle, Lock, 
  ShieldCheck, AlertTriangle, Info, ArrowRight, CornerDownRight
} from 'lucide-react';
import { Invoice, StudentProfile } from '../../types';
import { 
  getRespectfulBillingMessage, 
  analyzeStudentOverdueDebts,
  generatePriorityDebtCollectionMessage,
  generateRecentInvoiceRefusalMessage
} from '../../utils/respectfulBilling';
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
  const [activeTabMode, setActiveTabMode] = useState<'priority_oldest' | 'refusal_recent' | 'guidelines'>('priority_oldest');
  const [copiedPix, setCopiedPix] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [attemptedRecentInvoice, setAttemptedRecentInvoice] = useState<Invoice | null>(null);

  if (!isOpen) return null;

  const currentInvoice = selectedInvoice || invoices[0];
  const currentStudentId = currentInvoice?.studentId || '';
  const matchedStudent = students.find(s => s.id === currentStudentId);
  const studentName = matchedStudent?.name || currentInvoice?.studentName || 'Aluno do Tatame';

  // Análise de prioridade e múltiplos débitos conforme Instruções do Sistema
  const debtAnalysis = useMemo(() => {
    return analyzeStudentOverdueDebts(currentStudentId || studentName, invoices, academyName);
  }, [currentStudentId, studentName, invoices, academyName]);

  // Se tiver múltiplos débitos, o boleto selecionado para pagamento é OBRIGATORIAMENTE o mais antigo
  const activeInvoice = (debtAnalysis.hasMultipleDebts && debtAnalysis.oldestInvoice)
    ? debtAnalysis.oldestInvoice
    : currentInvoice;

  const invoiceAmount = activeInvoice?.totalUpdatedAmount || activeInvoice?.amount || 100;
  const pixKey = activeInvoice?.pixCode || `pix-${academyName.toLowerCase().replace(/\s+/g, '')}@bjjacademy.com.br`;

  // Construção do texto da mensagem conforme modo ativo
  let messageTitle = 'Cobrança do Tatame';
  let messageBody = '';

  if (activeTabMode === 'refusal_recent') {
    messageTitle = 'Recusa Amigável: Quitação Obrigatória da Fatura Mais Antiga';
    messageBody = generateRecentInvoiceRefusalMessage({
      studentName,
      totalOverdueCount: debtAnalysis.totalOverdueCount,
      oldestInvoice: debtAnalysis.oldestInvoice || activeInvoice
    });
  } else if (debtAnalysis.hasMultipleDebts && debtAnalysis.oldestInvoice) {
    messageTitle = `Trava de Segurança Ativa: Boleto Mais Antigo Prioritário (${debtAnalysis.totalOverdueCount} pendências)`;
    messageBody = generatePriorityDebtCollectionMessage({
      studentName,
      totalOverdueCount: debtAnalysis.totalOverdueCount,
      oldestInvoice: debtAnalysis.oldestInvoice,
      academyName
    });
  } else {
    const isLate = activeInvoice ? new Date(activeInvoice.dueDate) < new Date() : false;
    const billingType = isLate ? 'polite_late' : 'preventive';
    const standardTemplate = getRespectfulBillingMessage(
      billingType,
      studentName,
      academyName,
      invoiceAmount,
      activeInvoice?.dueDate || '20/09/2026',
      pixKey
    );
    messageTitle = standardTemplate.title;
    messageBody = standardTemplate.body;
  }

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
    triggerNativeHaptic('success');
    const textEncoded = encodeURIComponent(messageBody);
    const phone = matchedStudent?.phone ? matchedStudent.phone.replace(/\D/g, '') : '';
    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${textEncoded}`, '_blank');
  };

  const handleSelectInvoiceFromList = (inv: Invoice) => {
    triggerNativeHaptic('light');
    setSelectedInvoice(inv);

    // Se o aluno tiver múltiplos débitos e o usuário clicar em uma fatura que NÃO é a mais antiga:
    if (debtAnalysis.hasMultipleDebts && debtAnalysis.oldestInvoice && inv.id !== debtAnalysis.oldestInvoice.id) {
      setAttemptedRecentInvoice(inv);
      setActiveTabMode('refusal_recent');
      triggerNativeHaptic('warning');
    } else {
      setAttemptedRecentInvoice(null);
      setActiveTabMode('priority_oldest');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <MessageCircle size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Assistente de Cobrança • Ordem Cronológica (FIFO)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
                  <ShieldCheck size={11} /> TRAVA DE SEGURANÇA
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Garante que a quitação siga a ordem cronológica, liberando exclusivamente a fatura mais antiga.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Banner de Trava de Segurança se houver múltiplos débitos */}
        {debtAnalysis.hasMultipleDebts && (
          <div className="bg-amber-950/40 border-b border-amber-500/30 px-4 py-2.5 flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>{studentName}</strong> possui <strong>{debtAnalysis.totalOverdueCount} boletos pendentes</strong>. A liberação de chave/PIX foi travada exclusivamente para o <strong>boleto mais antigo ({debtAnalysis.oldestInvoice?.title})</strong>.
              </span>
            </div>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[10px] border border-amber-500/40">
              Regra Cronológica Ativa
            </span>
          </div>
        )}

        {/* Content */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Faturas Pendentes / Mapeamento de Prioridade */}
          <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-3 max-h-[58vh] overflow-y-auto space-y-2">
            <div className="flex items-center justify-between px-2 pb-1 border-b border-slate-800 text-xs">
              <span className="font-semibold text-slate-400 uppercase tracking-wider">
                Faturas ({invoices.length})
              </span>
              <span className="text-[10px] text-slate-500">Ordem de Prioridade</span>
            </div>

            {invoices.map((inv) => {
              const isSelected = activeInvoice?.id === inv.id;
              const isOldest = debtAnalysis.hasMultipleDebts && debtAnalysis.oldestInvoice?.id === inv.id;
              const isLockedRecent = debtAnalysis.hasMultipleDebts && !isOldest && inv.status === 'overdue';

              return (
                <button
                  key={inv.id}
                  onClick={() => handleSelectInvoiceFromList(inv)}
                  className={`w-full p-2.5 rounded-xl text-left flex flex-col gap-1 transition cursor-pointer border ${
                    isSelected
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-white shadow-md'
                      : isOldest
                      ? 'bg-amber-950/30 border-amber-500/40 text-amber-200 hover:bg-amber-900/30'
                      : isLockedRecent
                      ? 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                      : 'hover:bg-slate-800/60 border-transparent text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold truncate">{inv.studentName}</span>
                    <span className="text-xs font-mono font-extrabold text-emerald-400 shrink-0">
                      R$ {(inv.totalUpdatedAmount || inv.amount).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Venc: {inv.dueDate}</span>
                    <span className="text-[10px] truncate max-w-[120px]">{inv.title.split('-')[1]?.trim() || inv.title}</span>
                  </div>

                  {/* Badge de Prioridade / Trava */}
                  {isOldest && (
                    <div className="mt-1 px-2 py-0.5 rounded bg-red-600/30 border border-red-500/50 text-red-300 text-[10px] font-black flex items-center gap-1">
                      <AlertCircle size={10} className="text-red-400 shrink-0" />
                      <span>1º PRIORITÁRIO (Pagar Primeiro)</span>
                    </div>
                  )}

                  {isLockedRecent && (
                    <div className="mt-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-semibold flex items-center gap-1">
                      <Lock size={10} className="text-slate-500 shrink-0" />
                      <span>Bloqueado (Aguardando Quitação da Anterior)</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Mensagem Formatada & Abas de Operação */}
          <div className="md:col-span-2 space-y-3">
            {/* Navegação entre Mensagem do Boleto Mais Antigo e Recusa Amigável */}
            <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  triggerNativeHaptic('light');
                  setActiveTabMode('priority_oldest');
                }}
                className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTabMode === 'priority_oldest'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles size={13} />
                <span>Boleto Mais Antigo ({debtAnalysis.totalOverdueCount})</span>
              </button>

              {debtAnalysis.hasMultipleDebts && (
                <button
                  type="button"
                  onClick={() => {
                    triggerNativeHaptic('light');
                    setActiveTabMode('refusal_recent');
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTabMode === 'refusal_recent'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Resposta caso o cliente peça especificamente o boleto recente"
                >
                  <Lock size={13} />
                  <span>Recusa de Fatura Recente</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  triggerNativeHaptic('light');
                  setActiveTabMode('guidelines');
                }}
                className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTabMode === 'guidelines'
                    ? 'bg-slate-800 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Visualizar Diretrizes e Regras de Negócio do Assistente"
              >
                <Info size={13} />
                <span>Regras</span>
              </button>
            </div>

            {/* Painel de Diretrizes / Regras de Negócio do Assistente */}
            {activeTabMode === 'guidelines' ? (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-3">
                <h4 className="font-black text-white text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Diretrizes de Comportamento e Regras de Negócio:</span>
                </h4>
                <ul className="space-y-2 list-disc list-inside text-slate-300 leading-relaxed text-[11px]">
                  <li>
                    <strong>Análise das Pendências:</strong> Verifica a lista de boletos com status de atrasado e contabiliza o total de boletos em atraso.
                  </li>
                  <li>
                    <strong>Mapeamento de Prioridade:</strong> Ordena pela data de vencimento e seleciona o boleto mais antigo (com maior tempo de atraso).
                  </li>
                  <li>
                    <strong>Aviso Explícito de Múltiplos Débitos:</strong> Informa ao cliente que existem <code>{debtAnalysis.totalOverdueCount}</code> boletos pendentes no sistema.
                  </li>
                  <li>
                    <strong>Trava de Segurança:</strong> Envia a chave PIX/código exclusivamente do boleto mais antigo para evitar que faturas recentes sejam pagas mantendo a antiga em aberto.
                  </li>
                  <li>
                    <strong>Recusa de Envio do Boleto Recente:</strong> Se o cliente solicitar a chave de um boleto mais recente, o assistente recusa amigavelmente esclarecendo que a liberação é sequencial.
                  </li>
                </ul>
              </div>
            ) : (
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                {/* Header da Mensagem */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    {activeTabMode === 'refusal_recent' ? (
                      <AlertTriangle size={14} className="text-amber-400" />
                    ) : (
                      <Sparkles size={14} />
                    )}
                    <span>{messageTitle}</span>
                  </span>
                  <span className="text-xs text-slate-400">
                    Cliente: <strong className="text-white">{studentName}</strong>
                  </span>
                </div>

                {/* Se o usuário clicou em boleto recente */}
                {attemptedRecentInvoice && activeTabMode === 'refusal_recent' && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-start gap-2">
                    <Info size={14} className="shrink-0 mt-0.5 text-amber-400" />
                    <span>
                      O cliente solicitou a fatura mais recente (<strong>{attemptedRecentInvoice.title}</strong>), mas possui o débito anterior de <strong>{debtAnalysis.oldestInvoice?.title} ({debtAnalysis.oldestInvoice?.dueDate})</strong> em aberto. Envie o texto abaixo para orientá-lo:
                    </span>
                  </div>
                )}

                {/* Caixa de Texto Formatado com a Mensagem Oficial */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 whitespace-pre-line leading-relaxed font-sans select-all">
                  {messageBody}
                </div>

                {/* Exibição da Chave PIX do Boleto Mais Antigo */}
                {activeTabMode === 'priority_oldest' && activeInvoice && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                    <div className="truncate mr-2">
                      <span className="text-[10px] text-slate-500 block">
                        CÓDIGO PIX EXCLUSIVO DO BOLETO MAIS ANTIGO ({activeInvoice.dueDate})
                      </span>
                      <strong className="text-white font-mono truncate block">{pixKey}</strong>
                    </div>
                    <button
                      onClick={() => handleCopy(pixKey, true)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1 transition shrink-0 cursor-pointer"
                    >
                      {copiedPix ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span>{copiedPix ? 'Copiado!' : 'Copiar PIX'}</span>
                    </button>
                  </div>
                )}

                {/* Botões de Envio via WhatsApp e Copiar Mensagem */}
                <div className="flex gap-2.5 pt-1">
                  <button
                    onClick={handleOpenWhatsApp}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition cursor-pointer"
                  >
                    <Send size={15} />
                    <span>Enviar Mensagem no WhatsApp</span>
                  </button>

                  <button
                    onClick={() => handleCopy(messageBody, false)}
                    className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition border border-slate-700 cursor-pointer"
                  >
                    {copiedMessage ? <CheckCircle2 size={15} className="text-emerald-400" /> : <Copy size={15} />}
                    <span>{copiedMessage ? 'Copiado!' : 'Copiar Texto'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
