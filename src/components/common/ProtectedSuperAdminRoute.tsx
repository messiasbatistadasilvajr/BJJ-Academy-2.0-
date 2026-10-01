import React from 'react';
import { ShieldAlert, Lock, ArrowLeft } from 'lucide-react';
import { UserRole, canAccessSuperAdmin } from '../../types';

interface ProtectedSuperAdminRouteProps {
  currentUserRole: UserRole;
  children: React.ReactNode;
  onUnauthorizedBack?: () => void;
}

export const ProtectedSuperAdminRoute: React.FC<ProtectedSuperAdminRouteProps> = ({
  currentUserRole,
  children,
  onUnauthorizedBack
}) => {
  const isAuthorized = canAccessSuperAdmin(currentUserRole);

  if (!isAuthorized) {
    return (
      <div className="w-full h-full min-h-[500px] flex items-center justify-center p-6 bg-slate-950 text-slate-100">
        <div className="max-w-md w-full bg-slate-900 border border-rose-900/60 rounded-2xl p-6 shadow-2xl text-center space-y-4 relative overflow-hidden">
          {/* Subtle background warning glow */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-rose-600/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-700/50 flex items-center justify-center mx-auto text-rose-400 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">
              <ShieldAlert className="w-3.5 h-3.5" />
              Acesso Estritamente Restrito
            </span>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Área Exclusiva Super Admin (SaaS)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              O módulo de <strong>Gestão de Assinaturas SaaS</strong> é confidencial e de uso exclusivo do 
              <strong> Criador / Dono da Plataforma BJJACADEMY</strong>. Gestores de academias, professores 
              e alunos não possuem permissão de acesso a este painel.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 text-left font-mono">
            <div className="text-slate-500 mb-1">// RBAC Security Protocol</div>
            <div>STATUS: 403 Forbidden</div>
            <div>PERFIL_ATUAL: {String(currentUserRole)}</div>
            <div>PERMISSAO_REQUERIDA: SUPER_ADMIN</div>
          </div>

          {onUnauthorizedBack && (
            <button
              onClick={onUnauthorizedBack}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retornar para Área Autorizada
            </button>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
