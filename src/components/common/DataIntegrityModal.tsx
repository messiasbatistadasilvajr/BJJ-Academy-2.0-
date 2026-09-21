import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, CheckCircle2, RefreshCw, AlertTriangle, 
  Database, HardDrive, ArrowRightLeft, Download, X, 
  ExternalLink, Search, Check, AlertCircle, FileText, Users, DollarSign
} from 'lucide-react';
import { 
  runDataIntegrityCheck, 
  reconcileIntegrityDiscrepancies, 
  DataIntegrityReport, 
  DataIntegrityIssue 
} from '../../utils/dataIntegrityChecker';

interface DataIntegrityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeAcademyName?: string;
}

export const DataIntegrityModal: React.FC<DataIntegrityModalProps> = ({
  isOpen,
  onClose,
  activeAcademyName = 'Loyalty Jiu-Jitsu'
}) => {
  const [report, setReport] = useState<DataIntegrityReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [reconcileLoading, setReconcileLoading] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [filterCategory, setFilterCategory] = useState<'all' | 'student' | 'invoice'>('all');

  const executeCheck = async () => {
    setIsLoading(true);
    setFeedbackMessage(null);
    try {
      const result = await runDataIntegrityCheck();
      setReport(result);
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: 'Erro ao conectar ao Firestore para diagnóstico: ' + (err?.message || 'Falha de rede')
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      executeCheck();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleReconcile = async (strategy: 'local_to_cloud' | 'cloud_to_local') => {
    setReconcileLoading(true);
    setFeedbackMessage(null);
    const res = await reconcileIntegrityDiscrepancies(strategy);
    if (res.success) {
      setFeedbackMessage({ type: 'success', text: res.message });
      // Re-executa checagem para atualizar o diagnóstico
      await executeCheck();
    } else {
      setFeedbackMessage({ type: 'error', text: res.message });
    }
    setReconcileLoading(false);
  };

  const filteredIssues = (report?.issues || []).filter((issue) => {
    if (filterCategory === 'all') return true;
    return issue.category === filterCategory;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div 
        className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Auditoria de Integridade de Dados</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/80 text-cyan-300 font-mono">
                  Firestore ↔ IndexedDB Nativo
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Diagnóstico em tempo real para o Gestor de {activeAcademyName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 no-scrollbar">
          {/* Quick Metrics Comparison */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/90 flex flex-col">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span className="flex items-center gap-1 font-semibold">
                  <Users className="w-3.5 h-3.5 text-blue-400" /> Alunos Local
                </span>
                <HardDrive className="w-3 h-3 text-slate-500" />
              </div>
              <span className="text-xl font-mono font-black text-white">
                {report ? report.totalStudentsLocal : '—'}
              </span>
              <span className="text-[10px] text-slate-400">Navegador (Cache)</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/90 flex flex-col">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span className="flex items-center gap-1 font-semibold">
                  <Users className="w-3.5 h-3.5 text-emerald-400" /> Alunos Nuvem
                </span>
                <Database className="w-3 h-3 text-emerald-400" />
              </div>
              <span className="text-xl font-mono font-black text-emerald-400">
                {report ? report.totalStudentsCloud : '—'}
              </span>
              <span className="text-[10px] text-slate-400">Google Firestore</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/90 flex flex-col">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span className="flex items-center gap-1 font-semibold">
                  <DollarSign className="w-3.5 h-3.5 text-amber-400" /> Faturas Local
                </span>
                <HardDrive className="w-3 h-3 text-slate-500" />
              </div>
              <span className="text-xl font-mono font-black text-white">
                {report ? report.totalInvoicesLocal : '—'}
              </span>
              <span className="text-[10px] text-slate-400">Navegador (Cache)</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/90 flex flex-col">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span className="flex items-center gap-1 font-semibold">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Faturas Nuvem
                </span>
                <Database className="w-3 h-3 text-emerald-400" />
              </div>
              <span className="text-xl font-mono font-black text-emerald-400">
                {report ? report.totalInvoicesCloud : '—'}
              </span>
              <span className="text-[10px] text-slate-400">Google Firestore</span>
            </div>
          </div>

          {/* Feedback banner */}
          {feedbackMessage && (
            <div className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 border ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                : 'bg-red-950/60 border-red-500/50 text-red-300'
            }`}>
              {feedbackMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{feedbackMessage.text}</span>
            </div>
          )}

          {/* Status Verdict Header */}
          {report && !isLoading && (
            <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              report.isConsistent 
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
            }`}>
              <div className="flex items-center gap-3">
                {report.isConsistent ? (
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 animate-pulse">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-black text-white">
                    {report.isConsistent 
                      ? '100% Consistente e Sincronizado' 
                      : `${report.issuesCount} Inconsistência(s) Detectada(s)`}
                  </h4>
                  <p className="text-xs text-slate-300">
                    {report.isConsistent
                      ? 'Não há discrepância entre os alunos e faturas do seu navegador e a base de dados Firestore.'
                      : 'Foram identificadas divergências de registros ou valores entre o cache local e o banco de dados.'}
                  </p>
                </div>
              </div>

              <button
                onClick={executeCheck}
                disabled={isLoading}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition shrink-0 border border-slate-700"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Re-analisar</span>
              </button>
            </div>
          )}

          {/* Issue List & Diagnostic Log */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Log de Diagnóstico Detalhado
                </h4>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setFilterCategory('all')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                    filterCategory === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Todos ({report?.issues.length || 0})
                </button>
                <button
                  onClick={() => setFilterCategory('student')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                    filterCategory === 'student' ? 'bg-slate-800 text-blue-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Alunos ({(report?.issues || []).filter(i => i.category === 'student').length})
                </button>
                <button
                  onClick={() => setFilterCategory('invoice')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                    filterCategory === 'invoice' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Faturas ({(report?.issues || []).filter(i => i.category === 'invoice').length})
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
                <RefreshCw className="w-7 h-7 text-amber-400 animate-spin" />
                <p className="text-xs font-medium">Cruzando tabelas do Firestore com o LocalStorage...</p>
              </div>
            ) : filteredIssues.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h5 className="text-sm font-bold text-white">Nenhuma inconsistência encontrada nesta categoria</h5>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  A integridade referencial de identificadores, matrículas e histórico financeiro está íntegra.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[320px] overflow-y-auto no-scrollbar pr-1">
                {filteredIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 flex flex-col gap-2 transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          issue.category === 'student'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}>
                          {issue.category === 'student' ? 'Aluno' : 'Fatura'}
                        </span>
                        <span className="text-xs font-bold text-white">
                          {issue.entityName}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        issue.severity === 'high' 
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40' 
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {issue.severity === 'high' ? 'Alta Prioridade' : 'Aviso de Sincronia'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300">
                      {issue.description}
                    </p>

                    {/* Previews if divergence */}
                    {(issue.localPreview || issue.cloudPreview) && (
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-900 p-2.5 rounded-xl border border-slate-800/80">
                        <div>
                          <span className="text-slate-400 font-sans block text-[10px] uppercase font-bold">
                            Local (Navegador):
                          </span>
                          <pre className="text-slate-300 truncate">
                            {JSON.stringify(issue.localPreview, null, 1) || '— ausente —'}
                          </pre>
                        </div>
                        <div>
                          <span className="text-emerald-400 font-sans block text-[10px] uppercase font-bold">
                            Nuvem (Firestore):
                          </span>
                          <pre className="text-emerald-300 truncate">
                            {JSON.stringify(issue.cloudPreview, null, 1) || '— ausente —'}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Reconcile Panel */}
          {report && !report.isConsistent && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/40 via-slate-950 to-red-950/40 border border-red-500/40 space-y-3">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-red-400" />
                <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                  Ações de Auto-Recuperação e Reconciliação
                </h5>
              </div>
              <p className="text-xs text-slate-300">
                Escolha a direção de sincronização para forçar a paridade exata de dados:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={() => handleReconcile('local_to_cloud')}
                  disabled={reconcileLoading}
                  className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition flex flex-col gap-1 text-slate-200"
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                    <Database className="w-3.5 h-3.5 text-blue-400" />
                    <span>Gravar Local ➔ Nuvem Firestore</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Envia os alunos e faturas do navegador para atualizar o banco na nuvem.
                  </span>
                </button>

                <button
                  onClick={() => handleReconcile('cloud_to_local')}
                  disabled={reconcileLoading}
                  className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition flex flex-col gap-1 text-slate-200"
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                    <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Restaurar Nuvem Firestore ➔ Local</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Substitui o cache do navegador pelos registros oficiais do Firestore.
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            {report?.timestamp ? `Última verificação: ${new Date(report.timestamp).toLocaleTimeString()}` : ''}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition"
          >
            Fechar Diagnóstico
          </button>
        </div>
      </div>
    </div>
  );
};
