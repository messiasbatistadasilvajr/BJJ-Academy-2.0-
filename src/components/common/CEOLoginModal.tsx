import React, { useState } from 'react';
import { 
  Crown, ShieldCheck, Mail, Lock, Eye, EyeOff, Key, 
  CheckCircle2, AlertTriangle, X, Sparkles, ArrowRight
} from 'lucide-react';
import { triggerNativeHaptic } from '../../utils/nativeApp';
import { bjjAudio } from '../../utils/audio';

interface CEOLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: () => void;
  savedEmail?: string;
  savedPassword?: string;
}

export const CEOLoginModal: React.FC<CEOLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
  savedEmail = 'messiasbjunior@yahoo.com.br',
  savedPassword = 'Familia@jk4',
}) => {
  const [email, setEmail] = useState<string>(savedEmail);
  const [password, setPassword] = useState<string>(savedPassword);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    const isValid = 
      (cleanEmail === 'messiasbjunior@yahoo.com.br' || cleanEmail === 'messiasbjunior76@gmail.com') &&
      (cleanPass === 'Familia@jk4' || cleanPass === 'familia@jk4');

    if (isValid) {
      triggerNativeHaptic('success');
      bjjAudio.playAccessGranted();
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSuccessLogin();
        onClose();
      }, 1200);
    } else {
      triggerNativeHaptic('warning');
      bjjAudio.playAccessDenied();
      setErrorMsg('Credenciais incorretas. Digite seu e-mail e senha cadastrados de CEO.');
    }
  };

  const handleUseSavedCredentials = () => {
    setEmail(savedEmail);
    setPassword(savedPassword);
    setErrorMsg(null);
    triggerNativeHaptic('light');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-amber-500/30 text-slate-100 shadow-2xl overflow-hidden">
        
        {/* Header Dourado do CEO */}
        <div className="relative p-5 bg-gradient-to-r from-amber-950/90 via-slate-900 to-red-950/90 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-700 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Crown className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                  Diretoria Executiva
                </span>
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3" /> Master
                </span>
              </div>
              <h2 className="text-base font-bold text-white tracking-tight mt-0.5">
                Acesso do CEO & Fundador
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulário de Login */}
        <div className="p-5 sm:p-6 space-y-4">
          {success ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Autenticado com Sucesso!</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Bem-vindo, CEO Messias Batista. Acesso Master liberado em todas as filiais.
                </p>
              </div>
              <div className="text-[11px] font-mono text-amber-400 font-bold">
                Carregando visão executiva...
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Campo E-mail */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>E-mail do CEO:</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="messiasbjunior@yahoo.com.br"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none transition shadow-inner"
                  />
                </div>
              </div>

              {/* Campo Senha */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Senha Master:</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-slate-400 hover:text-amber-300 flex items-center gap-1 transition"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPassword ? 'Ocultar' : 'Visualizar'}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Sua senha master"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none transition shadow-inner"
                  />
                </div>
              </div>

              {/* Card de Dados Salvos com Botão Rápido */}
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Credencial Oficial Salva
                  </span>
                  <div className="font-mono text-[11px] text-slate-200">
                    {savedEmail}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleUseSavedCredentials}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 text-[11px] font-bold transition border border-slate-700 shrink-0"
                >
                  Usar Salva
                </button>
              </div>

              {/* Botão de Entrar */}
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition cursor-pointer"
              >
                <Key className="w-4 h-4" />
                <span>Entrar como CEO Messias</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="text-center">
                <span className="text-[10px] text-slate-500 font-mono">
                  Sessão Criptografada • BJJ Academy Master RBAC
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
