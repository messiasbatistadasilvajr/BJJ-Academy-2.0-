import React, { useState } from 'react';
import { 
  X, Zap, ShieldCheck, CheckCircle2, ArrowRight, 
  Crown, Sparkles, AlertTriangle, Users, Building2 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RegisteredAcademy, SaasPlanTier, SAAS_PLAN_DETAILS, SAAS_PLAN_LIMITS } from '../../types';
import { StudentEnrollmentService } from '../../services/studentEnrollmentService';

interface PlanUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  academy: RegisteredAcademy;
  activeStudentsCount: number;
  blockedStudentName?: string;
  onPlanUpgraded: (updatedAcademy: RegisteredAcademy) => void;
}

export const PlanUpgradeModal: React.FC<PlanUpgradeModalProps> = ({
  isOpen,
  onClose,
  academy,
  activeStudentsCount,
  blockedStudentName,
  onPlanUpgraded
}) => {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [selectedTier, setSelectedTier] = useState<SaasPlanTier>(
    academy.saasPlanTier === 'BRONZE' ? 'PRATA' : 'OURO'
  );

  if (!isOpen) return null;

  const currentTier: SaasPlanTier = academy.saasPlanTier || 'BRONZE';
  const currentLimit = academy.maxActiveStudentsLimit || SAAS_PLAN_LIMITS[currentTier];
  const isFull = activeStudentsCount >= currentLimit;

  const handlePerformUpgrade = async (targetTier: SaasPlanTier) => {
    setIsUpgrading(true);
    try {
      const result = await StudentEnrollmentService.upgradeAcademyPlan(academy, targetTier);
      
      // Efeito de celebração tatame
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      onPlanUpgraded(result.updatedAcademy);
      onClose();
    } catch (err) {
      console.error('Erro ao realizar upgrade de plano:', err);
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      id="modal-plan-upgrade"
    >
      <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 my-8">
        
        {/* Glow Header Decorative */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-20 bg-amber-500/20 blur-3xl rounded-full pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30">
              <Zap className="w-6 h-6 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-slate-100">
                  {isFull ? 'Limite do Plano Atingido' : 'Upgrade de Capacidade SaaS'}
                </h3>
                <span className="px-2 py-0.5 text-xs font-black rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                  {academy.name}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Regra corporativa de proteção de banco de dados e controle de alunos ativos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Block Alert Banner (if blocked) */}
        {isFull && (
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/50 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 space-y-1">
              <p className="font-bold text-red-300">
                A matrícula {blockedStudentName ? `de ${blockedStudentName}` : 'de novo aluno'} foi pausada pela trava de banco de dados.
              </p>
              <p className="text-slate-400">
                Sua unidade atingiu <span className="text-red-300 font-bold">{activeStudentsCount}/{currentLimit} alunos ativos</span> no <strong className="text-amber-300">{SAAS_PLAN_DETAILS[currentTier].label}</strong>. Para liberar novas matrículas imediatamente, escolha um dos planos superiores abaixo.
              </p>
            </div>
          </div>
        )}

        {/* Current Meter Status */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              Alunos Ativos no Banco de Dados
            </span>
            <span className="font-black text-slate-200">
              {activeStudentsCount} / {currentLimit === 999999 ? 'Ilimitado' : currentLimit}
              <span className={`ml-2 text-xs font-bold ${isFull ? 'text-red-400' : 'text-emerald-400'}`}>
                ({currentLimit === 999999 ? '0% usado' : `${Math.round((activeStudentsCount / currentLimit) * 100)}% ocupado`})
              </span>
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                isFull ? 'bg-red-500' : activeStudentsCount / currentLimit >= 0.85 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${currentLimit === 999999 ? 15 : Math.min(100, (activeStudentsCount / currentLimit) * 100)}%` }}
            />
          </div>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(['BRONZE', 'PRATA', 'OURO'] as SaasPlanTier[]).map((tier) => {
            const plan = SAAS_PLAN_DETAILS[tier];
            const isCurrent = currentTier === tier;
            const isSelected = selectedTier === tier;
            const isDowngrade = (tier === 'BRONZE' && currentTier !== 'BRONZE') || (tier === 'PRATA' && currentTier === 'OURO');

            return (
              <div
                key={tier}
                onClick={() => !isCurrent && !isDowngrade && setSelectedTier(tier)}
                className={`relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-slate-800/40 border-slate-700 opacity-60 cursor-default'
                    : isSelected
                    ? 'bg-gradient-to-b from-amber-500/20 to-slate-900 border-amber-400 shadow-xl shadow-amber-950/40'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Popular / Recommended Tag */}
                {tier === 'PRATA' && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-blue-500 text-[10px] font-black uppercase text-white shadow-md">
                    Mais Escolhido
                  </div>
                )}
                {tier === 'OURO' && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-amber-500 text-[10px] font-black uppercase text-slate-950 shadow-md flex items-center gap-1">
                    <Crown className="w-3 h-3 fill-slate-950" /> Sem Teto
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black px-2 py-0.5 rounded-lg border ${plan.badgeColor}`}>
                      {plan.label}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                        Atual
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="text-xl font-extrabold text-slate-100">
                      R$ {plan.monthlyBRL.toFixed(2).replace('.', ',')}
                      <span className="text-xs font-normal text-slate-400">/mês</span>
                    </div>
                    <p className="text-[11px] font-bold text-amber-300">
                      {plan.limit === 999999 ? 'Alunos Ilimitados' : `Até ${plan.limit} alunos ativos`}
                    </p>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {plan.description}
                  </p>

                  <ul className="space-y-1.5 pt-2 border-t border-slate-800/80">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="text-[10px] text-slate-300 flex items-start gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3">
                  {isCurrent ? (
                    <button 
                      disabled 
                      className="w-full py-1.5 text-xs rounded-xl bg-slate-800 text-slate-500 font-bold cursor-not-allowed"
                    >
                      Plano Atual
                    </button>
                  ) : isDowngrade ? (
                    <button 
                      disabled 
                      className="w-full py-1.5 text-xs rounded-xl bg-slate-800/30 text-slate-600 font-medium cursor-not-allowed"
                    >
                      Inferior
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePerformUpgrade(tier);
                      }}
                      disabled={isUpgrading}
                      className={`w-full py-2 text-xs rounded-xl font-extrabold transition flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md shadow-amber-500/20'
                          : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Upgrade Agora
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Asaas Subaccounts & Split Architecture Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-emerald-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h4 className="text-xs font-black text-slate-200 uppercase tracking-wide">
                Arquitetura Asaas: Subconta & Split de Pagamentos
              </h4>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Subconta Conectada
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-[10px] text-slate-400">Subconta da Academia</p>
              <p className="font-bold text-slate-200 truncate">
                {academy.shortName || 'Loyalty BJJ'}
              </p>
              <p className="text-[9px] text-emerald-400 font-mono">
                Recebe 100% líquido direto
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-[10px] text-slate-400">Carteira Master BJJACADEMY</p>
              <p className="font-bold text-amber-300 font-mono text-[11px]">
                wallet_master_bjjacademy_01
              </p>
              <p className="text-[9px] text-amber-400">
                Retém R$ 2,00 por aluno
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-[10px] text-slate-400">Regra de Inadimplência SaaS</p>
              <p className="font-bold text-slate-200">
                Carência de 3 dias
              </p>
              <p className="text-[9px] text-slate-400">
                Bloqueio automático após 72h
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Validação de cota executada no Database Tier (Anti-fraude e multi-tenant)</span>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 text-xs font-bold text-slate-300 hover:bg-slate-700 transition"
            >
              Fechar
            </button>
            <button
              onClick={() => handlePerformUpgrade(selectedTier)}
              disabled={isUpgrading || selectedTier === currentTier}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-black hover:from-amber-400 hover:to-amber-500 transition shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isUpgrading ? (
                'Processando Upgrade...'
              ) : (
                <>
                  Confirmar Upgrade para {SAAS_PLAN_DETAILS[selectedTier].label}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
