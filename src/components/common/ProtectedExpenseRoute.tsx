import React from 'react';
import { Lock, ShieldAlert, ArrowLeft } from 'lucide-react';
import { UserRole, canAccessExpenseManagement } from '../../types';

interface ProtectedExpenseRouteProps {
  currentUserRole: UserRole;
  children: React.ReactNode;
  onUnauthorizedBack?: () => void;
}

/**
 * 🛡️ COMPONENTE DE ROTA PROTEGIDA: GESTÃO DE DESPESAS
 * 
 * Regra de Segurança do Sistema (Crítico):
 * - Esta página lida com dados financeiros sensíveis (saídas de caixa, despesas, folha salarial).
 * - Acesso e visibilidade estritamente restritos aos perfis:
 *     1. Responsável pela Academia (Gerente/Dono: 'manager', 'ADMIN_ACADEMIA')
 *     2. CEO do Projeto (Admin Geral: 'ceo', 'general_manager', 'SUPER_ADMIN')
 * - Bloqueia a rota e nega acesso (403 Forbidden) para alunos, pais e professores comuns.
 */
export const ProtectedExpenseRoute: React.FC<ProtectedExpenseRouteProps> = ({
  currentUserRole,
  children,
  onUnauthorizedBack
}) => {
  const isAuthorized = canAccessExpenseManagement(currentUserRole);

  if (!isAuthorized) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border-2 border-red-700/70 rounded-3xl p-6 text-center shadow-2xl space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-950 border border-red-600 flex items-center justify-center text-red-400 shadow-lg shadow-red-950/50">
            <Lock size={32} />
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-950 px-2.5 py-1 rounded-full border border-red-800">
              403 FORBIDDEN • ROTA PROTEGIDA
            </span>
            <h2 className="text-xl font-black text-white mt-2">Área Financeira Confidencial</h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              O módulo de <strong>Gestão de Despesas & Fluxo de Saída de Caixa</strong> é estritamente isolado contra acessos não autorizados.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 text-left text-xs space-y-2 text-slate-400">
            <div className="flex items-center gap-1.5 text-red-400 font-bold">
              <ShieldAlert size={14} /> Regra de Isolamento de Rota:
            </div>
            <p>
              Privilégio concedido única e exclusivamente ao <strong>Responsável pela Academia (Gerente/Dono)</strong> e ao <strong>CEO do Projeto (Admin Geral)</strong>.
            </p>
            <p className="text-[11px] text-slate-500">
              Tentativas de acesso direto por alunos, responsáveis legais ou professores sem permissão administrativa são imediatamente barradas.
            </p>
          </div>

          {onUnauthorizedBack && (
            <button
              onClick={onUnauthorizedBack}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <ArrowLeft size={14} />
              Voltar ao Meu Painel
            </button>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
