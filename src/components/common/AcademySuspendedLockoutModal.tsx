import React from 'react';
import { AlertTriangle, Lock, ShieldAlert, Phone, Mail, Building2, RefreshCw } from 'lucide-react';
import { AcademyAccessLockoutStatus, RegisteredAcademy } from '../../types';

interface AcademySuspendedLockoutModalProps {
  lockoutStatus: AcademyAccessLockoutStatus;
  academies: RegisteredAcademy[];
  onSelectAlternativeAcademy?: (academyId: string) => void;
  onOpenManagerLogin?: () => void;
  onRefreshStatus?: () => void;
}

export const AcademySuspendedLockoutModal: React.FC<AcademySuspendedLockoutModalProps> = ({
  lockoutStatus,
  academies,
  onSelectAlternativeAcademy,
  onOpenManagerLogin,
  onRefreshStatus
}) => {
  const otherAcademies = academies.filter(a => a.id !== lockoutStatus.academyId && a.id !== 'all');

  return (
    <div className="w-full min-h-[550px] flex items-center justify-center p-4 sm:p-6 bg-slate-950 text-slate-100">
      <div className="max-w-lg w-full bg-slate-900 border-2 border-rose-600/70 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-xl">
        {/* Glow effect */}
        <div className="absolute -top-20 -left-20 w-44 h-44 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Icon */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-950 to-slate-900 border-2 border-rose-500/60 flex items-center justify-center text-rose-400 shadow-xl shadow-rose-950/50">
              <Lock className="w-10 h-10 animate-pulse" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-rose-600 border-2 border-slate-900 flex items-center justify-center text-white">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">
              <AlertTriangle className="w-3.5 h-3.5" />
              Bloqueio Automático de Acesso
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Acesso Temporariamente Suspenso
            </h2>
            <p className="text-xs text-rose-300/90 font-medium">
              Unidade: <strong className="text-white">{lockoutStatus.academyName}</strong>
            </p>
          </div>
        </div>

        {/* Detailed Explanation */}
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/50 space-y-2 text-xs leading-relaxed text-slate-300">
          <div className="font-semibold text-rose-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Regra Financeira SaaS (BJJACADEMY):
          </div>
          <p>
            O acesso dos professores e alunos desta academia foi bloqueado temporariamente 
            devido à <strong>mensalidade SaaS em atraso</strong> ou suspensão de licença.
          </p>
          {lockoutStatus.reason && (
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-rose-900/60 font-mono text-[11px] text-rose-300">
              {lockoutStatus.reason}
            </div>
          )}
          <p className="text-[11px] text-slate-400">
            Assim que o responsável pela unidade regularizar o pagamento com o Super Admin da plataforma, 
            o acesso de todos os alunos, check-in de presença e turmas será restabelecido automaticamente.
          </p>
        </div>

        {/* Responsible Contact Info */}
        {lockoutStatus.responsibleName && (
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Responsável pela Academia
              </span>
              <div className="font-semibold text-white">{lockoutStatus.responsibleName}</div>
            </div>
            <div className="flex gap-2">
              <a
                href={`tel:${lockoutStatus.responsibleName}`}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                title="Ligar para Responsável"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

        {/* Alternative Actions */}
        <div className="space-y-2.5 pt-2">
          {onRefreshStatus && (
            <button
              onClick={onRefreshStatus}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/30 transition-all active:scale-[0.98]"
            >
              <RefreshCw className="w-4 h-4" />
              Já Quitei! Verificar Status Agora
            </button>
          )}

          {otherAcademies.length > 0 && onSelectAlternativeAcademy && (
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-semibold text-slate-400 text-center">
                Treina em outra filial da rede?
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {otherAcademies.map(acad => (
                  <button
                    key={acad.id}
                    onClick={() => onSelectAlternativeAcademy(acad.id)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 text-left text-xs text-slate-200 transition-colors"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <Building2 className="w-4 h-4 text-amber-400" />
                      {acad.name}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold uppercase">
                      Acessar Filial →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {onOpenManagerLogin && (
            <button
              onClick={onOpenManagerLogin}
              className="w-full text-center py-2 text-[11px] font-medium text-slate-400 hover:text-slate-200 underline transition-colors"
            >
              Sou o Gestor / Dono desta Academia (Acessar Área Administrativa)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
