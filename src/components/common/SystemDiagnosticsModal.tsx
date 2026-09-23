import React, { useState } from 'react';
import { 
  ShieldCheck, Play, CheckCircle2, AlertCircle, 
  RefreshCw, Terminal, Activity, Layers, Server,
  Lock, Bell, FileText, Database, X
} from 'lucide-react';
import { runFullSystemDiagnostics, FullSystemTestReport } from '../../utils/systemTestRunner';

interface SystemDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemDiagnosticsModal: React.FC<SystemDiagnosticsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [report, setReport] = useState<FullSystemTestReport | null>(null);

  if (!isOpen) return null;

  const handleRunTests = async () => {
    setIsRunning(true);
    try {
      const rep = await runFullSystemDiagnostics();
      setReport(rep);
    } catch (err) {
      console.error('Erro ao executar testes do sistema:', err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div 
        className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Plano de Testes & Auditoria do Sistema</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-700/80 text-emerald-300 font-mono">
                  SaaS Multi-Tenant E2E
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Validação automatizada dos 8 pilares: Baixa Manual Balcão, Cancelamento PIX Asaas, Fechamento de Caixa, RBAC e Mensageria
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

        {/* Action Banner */}
        <div className="p-4 bg-slate-950 border-b border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>Testa Offline IndexedDB, RBAC, Cron 02h00, Webhooks, Storage, Push FCM e LGPD.</span>
          </div>
          <button
            onClick={handleRunTests}
            disabled={isRunning}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/50 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Executando Testes...' : 'Executar Bateria de Testes'}</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 no-scrollbar">
          {report ? (
            <div className="space-y-4">
              {/* Summary Metric */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status Geral</h4>
                  <p className="text-lg font-black text-emerald-400 flex items-center gap-2 mt-0.5">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{report.passedCount} de {report.totalTests} Módulos Validados com Sucesso</span>
                  </p>
                </div>
                <div className="text-right font-mono text-xs text-slate-400">
                  <span>{new Date(report.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>

              {/* Steps Results */}
              <div className="space-y-2.5">
                {report.results.map((res, idx) => (
                  <div 
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-cyan-300 font-bold">
                          {res.step}
                        </span>
                        <h5 className="text-xs font-bold text-white">{res.name}</h5>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        res.status === 'PASSED' 
                          ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
                          : 'bg-amber-950/80 border border-amber-500/50 text-amber-300'
                      }`}>
                        {res.status === 'PASSED' ? 'APROVADO' : 'AVISO'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 pl-1">{res.details}</p>
                    <div className="text-[10px] text-slate-400 text-right font-mono">
                      Tempo de resposta: {res.executionTimeMs}ms
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 text-slate-400">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-300">
                <Play className="w-6 h-6 text-cyan-400" />
              </div>
              <p className="text-sm font-medium">
                Clique no botão <span className="text-cyan-300 font-bold">"Executar Bateria de Testes"</span> acima para validar todas as rotinas em tempo real.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>BJJ ACADEMY Architecture Suite v2.6.0</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
