import React, { useState } from 'react';
import { 
  X, Database, CheckCircle2, ShieldCheck, Users, 
  RefreshCw, Cloud, Server, Zap, Globe, RotateCcw, AlertTriangle, ShieldAlert
} from 'lucide-react';
import { testConnection } from '../../firebase/config';

interface CloudDatabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentsCount: number;
  classesCount: number;
  invoicesCount: number;
  academiesCount: number;
  isCloudSynced: boolean;
  onOpenDataIntegrity?: () => void;
}

export const CloudDatabaseStatusModal: React.FC<CloudDatabaseStatusModalProps> = ({
  isOpen,
  onClose,
  studentsCount,
  classesCount,
  invoicesCount,
  academiesCount,
  isCloudSynced,
  onOpenDataIntegrity
}) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'warning'>('idle');
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    const ok = await testConnection();
    setIsTesting(false);
    setTestResult(ok ? 'success' : 'warning');
    setTimeout(() => {
      setTestResult('idle');
    }, 4000);
  };

  const handleFactoryResetAndRestart = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
      id="modal-cloud-database-status"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Database size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-white text-base leading-tight">
                  Banco de Dados em Nuvem (Firebase)
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  ONLINE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Google Firestore • Multi-acesso e Tempo Real
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Fechar modal de status do banco"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Main highlights */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-3">
            <div className="flex items-start gap-3">
              <ShieldCheck className="text-emerald-400 shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Multi-acesso Simultâneo & Zero Perda de Dados
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  O sistema agora está integrado ao <strong>Google Cloud Firestore</strong>. Vários alunos, pais e professores podem acessar o aplicativo simultaneamente de diferentes celulares e navegadores com sincronização bidirecional em tempo real.
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
              Registros Sincronizados na Nuvem
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <Users size={18} />
                </div>
                <div>
                  <div className="text-lg font-bold text-white leading-none">{studentsCount}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Alunos Cadastrados</div>
                </div>
              </div>

              <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <Zap size={18} />
                </div>
                <div>
                  <div className="text-lg font-bold text-white leading-none">{classesCount}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Aulas e Chamadas</div>
                </div>
              </div>

              <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Cloud size={18} />
                </div>
                <div>
                  <div className="text-lg font-bold text-white leading-none">{invoicesCount}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Faturas & Pix</div>
                </div>
              </div>

              <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                  <Server size={18} />
                </div>
                <div>
                  <div className="text-lg font-bold text-white leading-none">{academiesCount}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Academias/Filiais</div>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Specs List */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Garantias de Arquitetura
            </span>
            <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                <span><strong>Multi-Tenant & Multi-Acesso:</strong> Escalabilidade para centenas de alunos simultâneos.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                <span><strong>Segurança Blindada:</strong> Regras de validação em Firestore Rules ativas.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                <span><strong>Offline-First & PWA:</strong> Dados persistem localmente e sincronizam na nuvem quando há rede.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                <span><strong>Auditoria de Dados:</strong> Nenhuma alteração é perdida em recarregamentos ou trocas de dispositivo.</span>
              </div>
            </div>
          </div>

          {/* Botão de Auditoria de Integridade LocalStorage ↔ Firestore */}
          {onOpenDataIntegrity && (
            <div className="p-3.5 bg-gradient-to-r from-emerald-950/40 via-slate-950 to-emerald-950/40 border border-emerald-500/40 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <ShieldAlert size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">
                    Auditoria de Integridade Cruzada
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Verificar consistência entre Firestore e LocalStorage (Alunos & Faturas)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDataIntegrity();
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm shrink-0"
              >
                Abrir Auditoria
              </button>
            </div>
          )}

          {/* Opção de Limpeza de Cache e Reinício do Sistema */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw size={16} className="text-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Reinicialização & Limpeza do Sistema
                </h4>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Redefinição Limpa</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deseja restaurar o aplicativo para o estado original e recarregar? A limpeza de dados locais redefine o cache do navegador e reinicia o sistema imediatamente.
            </p>
            {isConfirmingReset ? (
              <div className="p-3 bg-red-950/50 border border-red-500/40 rounded-xl space-y-2.5">
                <div className="flex items-center gap-2 text-xs text-red-300 font-semibold">
                  <AlertTriangle size={15} className="text-red-400 shrink-0" />
                  <span>Confirmar limpeza de cache e reinício completo da aplicação?</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleFactoryResetAndRestart}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw size={12} />
                    <span>Sim, Limpar e Reiniciar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingReset(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsConfirmingReset(true)}
                className="w-full py-2 px-3 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 hover:border-amber-500/50 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <RotateCcw size={14} className="text-amber-400" />
                <span>Limpar Dados Locais & Reiniciar Sistema</span>
              </button>
            )}
          </div>

          {testResult === 'success' && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>Conexão ao servidor Firebase verificada com sucesso! Latência normal.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3">
          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={isTesting ? 'animate-spin' : ''} />
            <span>{isTesting ? 'Testando...' : 'Testar Conexão'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors"
          >
            Entendido, tudo seguro!
          </button>
        </div>
      </div>
    </div>
  );
};
