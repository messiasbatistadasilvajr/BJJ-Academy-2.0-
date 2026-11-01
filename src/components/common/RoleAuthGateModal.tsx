import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, ShieldCheck, Crown, Briefcase, GraduationCap, 
  User, Users, Key, Eye, EyeOff, AlertCircle, CheckCircle2, 
  X, Sparkles, ArrowRight, Building2, TrendingDown, UserPlus,
  ShieldAlert, Fingerprint
} from 'lucide-react';
import { UserRole, RegisteredAcademy } from '../../types';
import { triggerNativeHaptic } from '../../utils/nativeApp';
import { bjjAudio } from '../../utils/audio';

export interface RoleAuthGateModalProps {
  isOpen: boolean;
  targetRole: UserRole | null;
  onConfirm: (role: UserRole) => void;
  onCancel: () => void;
  academy?: RegisteredAcademy;
  contextMessage?: string; // Optional custom message (e.g. "Retorno ao CEO Messias")
}

interface RoleConfig {
  name: string;
  badge: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badgeColor: string;
  borderColor: string;
  bgGlow: string;
  buttonGradient: string;
  placeholder: string;
  validCredentials: string[];
  quickDemoValue: string;
  quickDemoLabel: string;
  credentialTypeLabel: string;
}

export const RoleAuthGateModal: React.FC<RoleAuthGateModalProps> = ({
  isOpen,
  targetRole,
  onConfirm,
  onCancel,
  academy,
  contextMessage,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Configuration map per target role
  const getRoleConfig = (role: UserRole | null): RoleConfig => {
    switch (role) {
      case 'ceo':
        return {
          name: 'CEO Messias',
          badge: 'ACESSO MASTER TOTAL',
          description: 'Acesso Executivo Master do Fundador e Governança Global BJJ Academy.',
          icon: Crown,
          accentColor: 'text-amber-400',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          borderColor: 'border-amber-500/40',
          bgGlow: 'from-amber-600/20 via-slate-900 to-slate-950',
          buttonGradient: 'from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950',
          placeholder: 'Senha Master do CEO ou PIN 2026',
          validCredentials: ['familia@jk4', '2026', 'messias2026', 'ceo2026', 'messias'],
          quickDemoValue: 'Familia@jk4',
          quickDemoLabel: 'Senha Master: Familia@jk4 (ou PIN 2026)',
          credentialTypeLabel: 'Senha Master Executiva',
        };

      case 'general_manager':
      case 'SUPER_ADMIN':
      case 'saas_superadmin':
        return {
          name: 'Super Admin Master',
          badge: 'MASTER GESTÃO REDE',
          description: 'Painel Geral de Redes, Assinaturas SaaS e Split de Pagamentos Asaas.',
          icon: ShieldCheck,
          accentColor: 'text-purple-400',
          badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          borderColor: 'border-purple-500/40',
          bgGlow: 'from-purple-900/30 via-slate-900 to-slate-950',
          buttonGradient: 'from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white',
          placeholder: 'Senha do Super Admin ou PIN 998877',
          validCredentials: ['familia@jk4', '998877', 'admin123', 'superadmin', '2026'],
          quickDemoValue: 'Familia@jk4',
          quickDemoLabel: 'Senha: Familia@jk4 (ou PIN 998877)',
          credentialTypeLabel: 'Credencial Super Admin',
        };

      case 'manager':
        return {
          name: 'Gestor Filial Academia',
          badge: 'ADMINISTRAÇÃO DA UNIDADE',
          description: 'Acesso aos caixas, contratos, controle de alunos e mural da academia.',
          icon: Briefcase,
          accentColor: 'text-cyan-400',
          badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          borderColor: 'border-cyan-500/40',
          bgGlow: 'from-cyan-900/30 via-slate-900 to-slate-950',
          buttonGradient: 'from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white',
          placeholder: 'PIN de 6 dígitos ou Senha do Gestor',
          validCredentials: [
            '123456', 
            'gestor@123', 
            'gestor123', 
            'familia@jk4',
            (academy?.managerPin6 || '123456').toLowerCase()
          ],
          quickDemoValue: '123456',
          quickDemoLabel: 'PIN 6 dígitos: 123456 (ou Gestor@123)',
          credentialTypeLabel: 'PIN de 6 dígitos da Filial',
        };

      case 'teacher':
        return {
          name: 'Professor Tatame',
          badge: 'INSTRUTOR & TATAME',
          description: 'Chamada eletrônica de alunos, graduações IBJJF e rolamento monitorado.',
          icon: GraduationCap,
          accentColor: 'text-emerald-400',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          borderColor: 'border-emerald-500/40',
          bgGlow: 'from-emerald-900/30 via-slate-900 to-slate-950',
          buttonGradient: 'from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white',
          placeholder: 'Senha do Professor ou PIN 071600',
          validCredentials: ['pedro@loyalty1', '071600', 'prof@123', 'prof123', '1234', 'tatame123', 'familia@jk4'],
          quickDemoValue: 'Pedro@loyalty1',
          quickDemoLabel: 'Senha: Pedro@loyalty1 (ou PIN 071600)',
          credentialTypeLabel: 'Senha ou PIN do Professor',
        };

      case 'student':
        return {
          name: 'Área do Aluno',
          badge: 'ALUNO NO TATAME',
          description: 'Acesso a treinos, check-in, histórico de presenças e faturas PIX.',
          icon: User,
          accentColor: 'text-red-400',
          badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
          borderColor: 'border-red-500/40',
          bgGlow: 'from-red-950/40 via-slate-900 to-slate-950',
          buttonGradient: 'from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white',
          placeholder: 'PIN de 4 dígitos ou Senha do Aluno',
          validCredentials: ['1234', 'aluno@123', 'aluno123', '0000', 'familia@jk4'],
          quickDemoValue: '1234',
          quickDemoLabel: 'PIN 4 dígitos: 1234 (ou Aluno@123)',
          credentialTypeLabel: 'PIN ou Senha do Aluno',
        };

      case 'parent':
        return {
          name: 'Portal do Responsável',
          badge: 'KIDS & FAMÍLIA',
          description: 'Acompanhamento de dependentes, evolução infantil e financeiro familiar.',
          icon: Users,
          accentColor: 'text-blue-400',
          badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          borderColor: 'border-blue-500/40',
          bgGlow: 'from-blue-950/40 via-slate-900 to-slate-950',
          buttonGradient: 'from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white',
          placeholder: 'PIN de 4 dígitos ou Senha do Responsável',
          validCredentials: ['4321', 'pais@123', 'pais123', '1234', 'familia@jk4'],
          quickDemoValue: '4321',
          quickDemoLabel: 'PIN 4 dígitos: 4321 (ou Pais@123)',
          credentialTypeLabel: 'PIN ou Senha do Responsável',
        };

      case 'student_registration':
        return {
          name: 'Matrícula de Novo Aluno',
          badge: 'SECRETARIA',
          description: 'Acesso à ficha oficial de matrícula civil, anamnese e emissão de contrato.',
          icon: UserPlus,
          accentColor: 'text-cyan-400',
          badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          borderColor: 'border-cyan-500/40',
          bgGlow: 'from-cyan-950/40 via-slate-900 to-slate-950',
          buttonGradient: 'from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white',
          placeholder: 'PIN do Gestor ou Senha Master',
          validCredentials: ['123456', 'gestor@123', 'familia@jk4', '2026'],
          quickDemoValue: '123456',
          quickDemoLabel: 'PIN Gestor: 123456',
          credentialTypeLabel: 'Credencial de Secretaria',
        };

      case 'academy_registration':
        return {
          name: 'Cadastro de Nova Filial',
          badge: 'EXPANSÃO DA REDE',
          description: 'Criação de novas unidades, alvará esportivo e configuração de taxas.',
          icon: Building2,
          accentColor: 'text-amber-400',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          borderColor: 'border-amber-500/40',
          bgGlow: 'from-amber-950/40 via-slate-900 to-slate-950',
          buttonGradient: 'from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950',
          placeholder: 'Senha Master do CEO',
          validCredentials: ['familia@jk4', '2026', 'messias2026'],
          quickDemoValue: 'Familia@jk4',
          quickDemoLabel: 'Senha CEO: Familia@jk4',
          credentialTypeLabel: 'Senha Master da Diretoria',
        };

      case 'expense_management':
        return {
          name: 'Gestão de Despesas & Custos',
          badge: 'FINANCEIRO & CAIXA',
          description: 'Contas a pagar da academia, controle de despesas operacionais e DRE.',
          icon: TrendingDown,
          accentColor: 'text-rose-400',
          badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          borderColor: 'border-rose-500/40',
          bgGlow: 'from-rose-950/40 via-slate-900 to-slate-950',
          buttonGradient: 'from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white',
          placeholder: 'PIN do Gestor ou Senha Master',
          validCredentials: ['123456', 'gestor@123', 'familia@jk4', '2026'],
          quickDemoValue: '123456',
          quickDemoLabel: 'PIN Gestor: 123456',
          credentialTypeLabel: 'Credencial Financeira',
        };

      default:
        return {
          name: 'Perfil Restrito',
          badge: 'SEGURANÇA RBAC',
          description: 'Confirmação de identidade requerida para acessar esta área.',
          icon: Lock,
          accentColor: 'text-slate-300',
          badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
          borderColor: 'border-slate-700',
          bgGlow: 'from-slate-900 to-slate-950',
          buttonGradient: 'from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white',
          placeholder: 'Digite a senha de confirmação',
          validCredentials: ['familia@jk4', '123456', '1234'],
          quickDemoValue: 'Familia@jk4',
          quickDemoLabel: 'Senha Padrão: Familia@jk4',
          credentialTypeLabel: 'Senha de Acesso',
        };
    }
  };

  const config = getRoleConfig(targetRole);
  const Icon = config.icon;

  // Reset inputs when opened
  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setErrorMsg(null);
      setIsSuccess(false);
      setIsShaking(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, targetRole]);

  if (!isOpen || !targetRole) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    const cleanInput = (password || '').trim().toLowerCase();

    // Check validity
    const isValid = config.validCredentials.some(
      (valid) => cleanInput === valid.toLowerCase()
    );

    if (isValid) {
      setIsSuccess(true);
      triggerNativeHaptic('success');
      bjjAudio.playAccessGranted();

      setTimeout(() => {
        onConfirm(targetRole);
      }, 700);
    } else {
      triggerNativeHaptic('warning');
      bjjAudio.playAccessDenied();
      setIsShaking(true);
      setErrorMsg(`Senha ou PIN incorreto para o perfil "${config.name}".`);
      setTimeout(() => setIsShaking(false), 600);
    }
  };

  const handleQuickAutofill = (val: string) => {
    setPassword(val);
    setErrorMsg(null);
    triggerNativeHaptic('light');
  };

  // Quick Keypad for PIN entry
  const handleKeypadPress = (digit: string) => {
    triggerNativeHaptic('light');
    setPassword((prev) => prev + digit);
    setErrorMsg(null);
  };

  const handleKeypadBackspace = () => {
    triggerNativeHaptic('light');
    setPassword((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const handleKeypadClear = () => {
    triggerNativeHaptic('light');
    setPassword('');
    setErrorMsg(null);
  };

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn"
      onClick={onCancel}
    >
      <div 
        className={`w-full max-w-md bg-gradient-to-b ${config.bgGlow} border ${config.borderColor} rounded-3xl p-5 sm:p-6 shadow-2xl relative select-none transition-all ${
          isShaking ? 'animate-shake ring-2 ring-red-500' : ''
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
          title="Cancelar e permanecer no perfil atual"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Security Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-950/90 border border-slate-700/80 flex items-center justify-center shadow-lg relative">
            <Icon className={`w-6 h-6 ${config.accentColor}`} />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
              <Lock className="w-2.5 h-2.5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${config.badgeColor}`}>
                {config.badge}
              </span>
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-amber-400" />
                Segurança Ativa
              </span>
            </div>
            <h2 className="text-lg font-black text-white tracking-tight mt-0.5">
              {contextMessage || `Acesso: ${config.name}`}
            </h2>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-300 leading-relaxed mb-4 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
          {config.description}
        </p>

        {/* Status: Success Alert */}
        {isSuccess ? (
          <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex items-center gap-3 mb-4 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="font-black text-sm text-emerald-300">Acesso Autorizado!</div>
              <div className="text-[11px] text-emerald-200/80">Carregando painel de {config.name}...</div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password Input Group */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1.5">
                <label htmlFor="role-auth-input" className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>{config.credentialTypeLabel}</span>
                </label>
                <span className="text-[10px] text-slate-400 font-mono">Confirmação RBAC</span>
              </div>

              <div className="relative">
                <input
                  ref={inputRef}
                  id="role-auth-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder={config.placeholder}
                  className="w-full h-12 bg-slate-950/90 border border-slate-700 focus:border-amber-400 rounded-2xl pl-3.5 pr-20 text-white placeholder-slate-500 text-sm font-semibold tracking-wide outline-none transition shadow-inner"
                  autoComplete="current-password"
                />

                <div className="absolute right-2 top-2 flex items-center gap-1">
                  {password.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setPassword('')}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white transition"
                      title="Limpar campo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white transition"
                    title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="mt-2 p-2.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Quick Demo Autofill Hint (Crucial for testability & seamless demonstration) */}
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-[11px] text-slate-300 truncate">
                  {config.quickDemoLabel}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleQuickAutofill(config.quickDemoValue)}
                className="shrink-0 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase transition cursor-pointer active:scale-95"
              >
                Preencher
              </button>
            </div>

            {/* Quick Numeric Keypad (for touchscreens and numeric PINs) */}
            <div className="bg-slate-950/50 p-2.5 rounded-2xl border border-slate-800/60">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Teclado Numérico Rápido</span>
                <span className="text-[9px] text-slate-500 font-mono">PIN Touch</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleKeypadPress(digit)}
                    className="h-10 rounded-xl bg-slate-900/90 hover:bg-slate-800 active:bg-slate-700 text-white font-mono font-bold text-base border border-slate-800/80 transition cursor-pointer active:scale-95"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleKeypadClear}
                  className="h-10 rounded-xl bg-slate-900/50 hover:bg-slate-800 text-slate-400 font-bold text-xs border border-slate-800/80 transition cursor-pointer active:scale-95"
                >
                  Limpar
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('0')}
                  className="h-10 rounded-xl bg-slate-900/90 hover:bg-slate-800 active:bg-slate-700 text-white font-mono font-bold text-base border border-slate-800/80 transition cursor-pointer active:scale-95"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleKeypadBackspace}
                  className="h-10 rounded-xl bg-slate-900/50 hover:bg-slate-800 text-slate-400 font-bold text-xs border border-slate-800/80 transition cursor-pointer active:scale-95 flex items-center justify-center"
                  title="Apagar último dígito"
                >
                  ⌫
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer active:scale-95"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`flex-[1.6] py-3 px-4 rounded-xl bg-gradient-to-r ${config.buttonGradient} font-black text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer active:scale-95`}
              >
                <span>Confirmar Acesso</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
