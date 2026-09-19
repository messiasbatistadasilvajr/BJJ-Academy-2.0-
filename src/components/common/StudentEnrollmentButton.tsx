import React from 'react';
import { UserPlus, Sparkles } from 'lucide-react';
import { RegisteredAcademy } from '../../types';

export interface StudentEnrollmentButtonProps {
  academy?: RegisteredAcademy | { id?: string; name: string; shortName?: string };
  onOpenEnrollment: (targetAcademy?: RegisteredAcademy) => void;
  variant?: 'hero' | 'card' | 'compact' | 'header';
  className?: string;
  label?: string;
}

/**
 * Componente Padrão de Cadastro de Novos Alunos
 * Replicável e padronizado para a academia Loyalty e todas as outras academias da rede.
 */
export const StudentEnrollmentButton: React.FC<StudentEnrollmentButtonProps> = ({
  academy,
  onOpenEnrollment,
  variant = 'hero',
  className = '',
  label,
}) => {
  const academyDisplayName = academy?.shortName || academy?.name || 'Academia';

  if (variant === 'header') {
    return (
      <button
        type="button"
        id={`btn-enroll-header-${academy?.id || 'default'}`}
        onClick={() => onOpenEnrollment(academy as RegisteredAcademy)}
        className={`px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white text-[11px] font-black flex items-center gap-1.5 shadow-md shadow-blue-950/50 border border-blue-400/40 transition-all cursor-pointer shrink-0 ${className}`}
        title={`Cadastrar Novo Aluno (Normal ou Kids) em ${academyDisplayName}`}
      >
        <UserPlus size={13} className="text-blue-200" />
        <span className="hidden sm:inline">{label || '+ Cadastrar Aluno'}</span>
        <span className="sm:hidden">{label || '+ Aluno'}</span>
      </button>
    );
  }

  if (variant === 'card') {
    return (
      <button
        type="button"
        id={`btn-enroll-card-${academy?.id || 'default'}`}
        onClick={() => onOpenEnrollment(academy as RegisteredAcademy)}
        className={`py-1.5 px-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 hover:border-blue-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${className}`}
        title={`Cadastrar Novo Aluno nesta unidade (${academyDisplayName})`}
      >
        <UserPlus size={13} />
        <span>{label || '+ Aluno'}</span>
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        type="button"
        id={`btn-enroll-compact-${academy?.id || 'default'}`}
        onClick={() => onOpenEnrollment(academy as RegisteredAcademy)}
        className={`px-2.5 py-1 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer ${className}`}
        title={`Cadastrar Aluno em ${academyDisplayName}`}
      >
        <UserPlus size={12} />
        <span>{label || 'Cadastrar Aluno'}</span>
      </button>
    );
  }

  // Default 'hero' prominent variant
  return (
    <button
      type="button"
      id={`btn-enroll-hero-${academy?.id || 'default'}`}
      onClick={() => onOpenEnrollment(academy as RegisteredAcademy)}
      className={`px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-950/60 border border-blue-400/40 transition-all hover:scale-[1.02] active:scale-98 cursor-pointer ${className}`}
      title={`Fluxo Oficial: Cadastro de Novos Alunos (Adulto & Kids com Responsável) em ${academyDisplayName}`}
    >
      <UserPlus size={15} className="text-blue-200" />
      <span>{label || 'Cadastrar Novo Aluno'}</span>
      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-blue-950/80 text-blue-200 border border-blue-400/40 tracking-wider">
        Adulto & Kids
      </span>
    </button>
  );
};
