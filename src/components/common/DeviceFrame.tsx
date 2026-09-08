import React from 'react';
import { 
  Smartphone, Monitor, Layers, Download, Wifi, 
  RotateCcw, Sparkles, Shield, User, Users, GraduationCap, Briefcase, Crown,
  Timer, BookOpen, Tablet, Award, ShoppingBag, FileText, Trophy, Volume2, DollarSign, Building2,
  Database, Cloud
} from 'lucide-react';
import { UserRole, isCeoRole, isSuperAdminOrCeoRole } from '../../types';
import { NativeStatusBar } from './NativeStatusBar';

interface DeviceFrameProps {
  children: React.ReactNode;
  activeRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  isDesktopView: boolean;
  onToggleDesktopView: () => void;
  os: 'ios' | 'android';
  onToggleOs: () => void;
  onOpenCapacitorDocs: () => void;
  onOpenPWAInstall: () => void;
  isOnline: boolean;
  dynamicIslandNotice?: string | null;
  onOpenScoreboard?: () => void;
  onOpenTechniques?: () => void;
  onOpenKiosk?: () => void;
  onOpenGraduation?: () => void;
  onOpenProShop?: () => void;
  onOpenContract?: () => void;
  onOpenTournaments?: () => void;
  onOpenVoiceSettings?: () => void;
  onOpenFinancial?: () => void;
  onOpenAcademyRegistration?: () => void;
  activeAcademyName?: string;
  onOpenCloudStatus?: () => void;
  onOpenStudentManagement?: () => void;
  studentsCount?: number;
  isCloudSynced?: boolean;
  onOpenCEOProfile?: () => void;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  children,
  activeRole,
  onSelectRole,
  isDesktopView,
  onToggleDesktopView,
  os,
  onToggleOs,
  onOpenCapacitorDocs,
  onOpenPWAInstall,
  isOnline,
  dynamicIslandNotice,
  onOpenScoreboard,
  onOpenTechniques,
  onOpenKiosk,
  onOpenGraduation,
  onOpenProShop,
  onOpenContract,
  onOpenTournaments,
  onOpenVoiceSettings,
  onOpenFinancial,
  onOpenAcademyRegistration,
  activeAcademyName,
  onOpenCloudStatus,
  onOpenStudentManagement,
  studentsCount,
  isCloudSynced = true,
  onOpenCEOProfile,
}) => {
  const isSuperAdminOrCEO = isSuperAdminOrCeoRole(activeRole);

  const roles: { id: UserRole; label: string; icon: React.FC<{ className?: string }>; color: string; badge?: string }[] = [
    { id: 'ceo', label: '👑 CEO Messias', icon: Crown, color: 'text-amber-400', badge: 'ACESSO TOTAL' },
    { id: 'general_manager', label: 'Super Admin', icon: Shield, color: 'text-amber-300', badge: 'MASTER' },
    { id: 'manager', label: 'Gestor Filial', icon: Briefcase, color: 'text-cyan-400', badge: 'ACADEMIA' },
    { id: 'teacher', label: 'Professor Tatame', icon: GraduationCap, color: 'text-emerald-400' },
    { id: 'student', label: 'Aluno', icon: User, color: 'text-red-400' },
    { id: 'parent', label: 'Portal Responsável', icon: Users, color: 'text-blue-400' },
    { id: 'academy_registration', label: 'Cadastrar Academia', icon: Building2, color: 'text-amber-400', badge: 'FILIAIS' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start py-2 sm:py-4 px-2 sm:px-4 font-sans selection:bg-red-600 selection:text-white">
      {/* Top Global Control Toolbar */}
      <header className="w-full max-w-5xl mb-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-xl flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 to-red-800 p-0.5 shadow-md flex items-center justify-center font-black text-xs text-white">
            BJJ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm font-extrabold text-white tracking-tight">
                BJJ ACADEMY <span className="text-red-500">MOBILE 2.0</span>
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                Capacitor + PWA
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Web • PWA • Android (Google Play) • iOS (App Store)
            </p>
          </div>
        </div>

        {/* Profile Switcher Pills */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
          {roles.map((r) => {
            const Icon = r.icon;
            const isSelected = activeRole === r.id;
            const isAcademyTab = r.id === 'academy_registration';
            return (
              <button
                key={r.id}
                onClick={() => onSelectRole(r.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
                  isSelected
                    ? isAcademyTab 
                      ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md font-black ring-1 ring-amber-400/50' 
                      : 'bg-slate-800 text-white shadow-sm'
                    : isAcademyTab
                      ? 'text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/30'
                      : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? (isAcademyTab ? 'text-white' : r.color) : (isAcademyTab ? 'text-amber-400' : 'text-slate-400')}`} />
                <span>{r.label}</span>
                {r.badge && (
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase ${
                    isSelected ? 'bg-slate-950/60 text-amber-300' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    {r.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Viewport, OS and Tech Tools */}
        <div className="flex items-center gap-1.5">
          {/* CEO Profile Quick Button */}
          {onOpenCEOProfile && (
            <button
              onClick={onOpenCEOProfile}
              className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-black flex items-center gap-1.5 transition shadow-sm"
              title="Cadastro Oficial do CEO: Messias Batista da Silva Jr"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Perfil CEO</span>
            </button>
          )}

          {/* Cloud Database Firestore Status Chip */}
          <button
            onClick={onOpenCloudStatus}
            className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:text-emerald-200 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
            title="Google Firebase Firestore: Multi-acesso e Tempo Real Ativo"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Nuvem</span>
          </button>

          {/* Student Roster / Management Button */}
          <button
            onClick={onOpenStudentManagement}
            className="px-2.5 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:text-blue-200 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
            title="Ver e gerenciar alunos cadastrados na nuvem"
          >
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">{studentsCount ?? 6} Alunos</span>
          </button>

          {/* OS Switcher */}
          <button
            onClick={onToggleOs}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition"
            title="Alternar estilo do dispositivo (iOS / Android)"
          >
            <span className="text-[10px] font-bold uppercase">{os}</span>
          </button>

          {/* Desktop/Mobile Toggle */}
          <button
            onClick={onToggleDesktopView}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
              isDesktopView
                ? 'bg-red-600 border-red-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Alternar entre visualização de celular e tela cheia"
          >
            {isDesktopView ? <Monitor className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isDesktopView ? 'Desktop' : 'Celular'}</span>
          </button>

          {/* Capacitor Guide Button */}
          <button
            onClick={onOpenCapacitorDocs}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-red-400 text-xs font-semibold flex items-center gap-1 transition"
            title="Guia de Arquitetura Capacitor (iOS / Android / PWA)"
          >
            <Layers className="w-3.5 h-3.5 text-red-500" />
            <span className="hidden md:inline">Capacitor</span>
          </button>

          {/* PWA Install Button */}
          <button
            onClick={onOpenPWAInstall}
            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-red-950 transition"
            title="Instalar como PWA no celular"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PWA</span>
          </button>
        </div>
      </header>

      {/* Quick Tools & Tatame Modules Bar */}
      <nav className="w-full max-w-5xl mb-2.5 px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm flex items-center justify-between gap-2 overflow-x-auto text-xs no-scrollbar">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap hidden sm:inline-block">
          Módulos BJJ:
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
          <button
            onClick={onOpenScoreboard}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-red-600/30 text-slate-200 hover:text-red-400 border border-slate-700 font-semibold text-[11px] whitespace-nowrap transition-colors"
            title="Cronômetro de Rola e Placar CBJJ"
          >
            <Timer className="w-3.5 h-3.5 text-red-500" />
            <span>Cronômetro / Placar</span>
          </button>

          <button
            onClick={onOpenTechniques}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-red-600/30 text-slate-200 hover:text-red-400 border border-slate-700 font-semibold text-[11px] whitespace-nowrap transition-colors"
            title="Videoteca e Posições"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span>Videoteca Posições</span>
          </button>

          <button
            onClick={onOpenKiosk}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-red-600/30 text-slate-200 hover:text-red-400 border border-slate-700 font-semibold text-[11px] whitespace-nowrap transition-colors"
            title="Totem de Recepção / Catraca Tablet"
          >
            <Tablet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Totem Catraca</span>
          </button>

          <button
            onClick={onOpenGraduation}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-red-600/30 text-slate-200 hover:text-red-400 border border-slate-700 font-semibold text-[11px] whitespace-nowrap transition-colors"
            title="Elegibilidade para Graduação CBJJ"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Exame de Faixa</span>
          </button>

          <button
            onClick={onOpenProShop}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-red-600/30 text-slate-200 hover:text-red-400 border border-slate-700 font-semibold text-[11px] whitespace-nowrap transition-colors"
            title="Pro-Shop Oficial BJJ"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-purple-400" />
            <span>Pro-Shop Kimonos</span>
          </button>

          <button
            onClick={onOpenTournaments}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-red-600/30 text-slate-200 hover:text-red-400 border border-slate-700 font-semibold text-[11px] whitespace-nowrap transition-colors"
            title="Torneios e Medalhas da Academia"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Torneios & Medalhas</span>
          </button>

          <button
            onClick={onOpenContract}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-red-600/30 text-slate-200 hover:text-red-400 border border-slate-700 font-semibold text-[11px] whitespace-nowrap transition-colors"
            title="Contrato e Termo de Isenção"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Contrato & Termo</span>
          </button>

          {(activeRole === 'manager' || isSuperAdminOrCEO) && (
            <button
              onClick={onOpenFinancial}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-600/30 to-teal-600/30 hover:from-emerald-600/50 hover:to-teal-600/50 text-emerald-300 border border-emerald-500/50 font-black text-[11px] whitespace-nowrap transition-all shadow-md"
              title={
                isSuperAdminOrCEO
                  ? 'Financeiro Global da Rede BJJ ACADEMY (Consolidado & Split Asaas)'
                  : 'Financeiro e Mensalidades da sua Academia'
              }
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
              <span>{isSuperAdminOrCEO ? 'Financeiro Global & Split' : 'Financeiro da Filial'}</span>
            </button>
          )}

          <button
            onClick={() => {
              onSelectRole('academy_registration');
              if (onOpenAcademyRegistration) onOpenAcademyRegistration();
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-red-600/40 via-amber-600/40 to-yellow-600/30 hover:from-red-600/60 hover:to-amber-600/60 text-amber-200 border border-amber-500/60 font-black text-[11px] whitespace-nowrap transition-all shadow-md"
            title="Página Completa para Cadastrar Nova Academia ou Gerenciar Filiais da Rede"
          >
            <Building2 className="w-3.5 h-3.5 text-amber-400 stroke-[2.5]" />
            <span>+ Cadastrar Academia</span>
          </button>

          <button
            onClick={onOpenVoiceSettings}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-yellow-300 border border-amber-500/40 font-bold text-[11px] whitespace-nowrap transition-all shadow-sm"
            title="Configurar Notificações com Voz da Academia (Estilo Mercado Livre)"
          >
            <Volume2 className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
            <span>Voz da Academia {activeAcademyName ? `(${activeAcademyName})` : ''}</span>
          </button>
        </div>
      </nav>

      {/* Offline Alert if disconnected */}
      {!isOnline && (
        <div className="w-full max-w-sm mb-2 p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs text-center font-medium animate-pulse">
          Modo Offline PWA ativo — dados locais e histórico preservados
        </div>
      )}

      {/* Frame Container */}
      <main className="w-full flex justify-center items-center flex-1">
        {isDesktopView ? (
          // Expanded Desktop Layout (for Managers / Front Desk / Fullscreen)
          <div className="w-full max-w-5xl h-[84vh] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="h-10 px-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-3 font-mono text-[11px] text-slate-300">
                  https://app.bjjacademy.com.br/{activeRole}
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                Visualização Computador • Gestão Integral
              </span>
            </div>
            <div className="flex-1 overflow-hidden relative">
              {children}
            </div>
          </div>
        ) : (
          // Realistic Mobile Device Frame (iPhone 16 Pro / Android Material)
          <div className="relative">
            {/* Outer Smartphone Shell */}
            <div className={`relative w-[380px] max-w-[96vw] h-[780px] max-h-[88vh] bg-slate-950 rounded-[48px] p-3 shadow-[0_25px_70px_rgba(0,0,0,0.8)] border-[5px] ${
              os === 'ios' ? 'border-slate-800/90 ring-1 ring-slate-700/50' : 'border-slate-700'
            } flex flex-col overflow-hidden`}>
              
              {/* Native Screen Bezel and Display */}
              <div className="relative w-full h-full rounded-[40px] bg-slate-950 overflow-hidden flex flex-col border border-slate-900">
                {/* Native OS Status Bar */}
                <NativeStatusBar os={os} dynamicIslandContent={dynamicIslandNotice} />

                {/* Inner View Content */}
                <div className="flex-1 overflow-hidden relative flex flex-col">
                  {children}
                </div>

                {/* iPhone Home Indicator Bar / Android nav line */}
                <div className="w-full h-5 bg-slate-950 flex items-center justify-center shrink-0">
                  <div className="w-32 h-1 rounded-full bg-slate-600/60" />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
