import React, { useState, useEffect } from 'react';
import { 
  Smartphone, Monitor, Layers, Download, Wifi, 
  RotateCcw, Sparkles, Shield, User, Users, UserPlus, GraduationCap, Briefcase, Crown,
  Timer, BookOpen, Tablet, Award, ShoppingBag, FileText, Trophy, Volume2, DollarSign, Building2,
  Database, Cloud, Key, ChevronDown, Menu, X, Check, ArrowRight, Maximize2, Minimize2, SlidersHorizontal, Code,
  TrendingDown, ShieldCheck, Package, Share2
} from 'lucide-react';
import { UserRole, isCeoRole, isSuperAdminOrCeoRole, RegisteredAcademy, canAccessExpenseManagement, canAccessSuperAdmin } from '../../types';
import { NativeStatusBar } from './NativeStatusBar';
import { BJJFixedBackground } from './BJJFixedBackground';
import { AcademyFilterBar } from './AcademyFilterBar';

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
  onOpenProShopFulfillment?: () => void;
  onOpenContract?: () => void;
  onOpenTournaments?: () => void;
  onOpenVoiceSettings?: () => void;
  onOpenFinancial?: () => void;
  onOpenExpenseManagement?: () => void;
  onOpenSuperAdminSaas?: () => void;
  onOpenAcademyRegistration?: () => void;
  activeAcademyName?: string;
  onOpenCloudStatus?: () => void;
  onOpenStudentManagement?: () => void;
  studentsCount?: number;
  isCloudSynced?: boolean;
  onOpenCEOProfile?: () => void;
  onOpenCEOLogin?: () => void;
  onOpenManagerLogin?: () => void;
  onOpenTeacherLogin?: () => void;
  academies?: RegisteredAcademy[];
  activeAcademyId?: string;
  onSelectAcademy?: (academyId: string) => void;
  onOpenOperatingHours?: (academy: RegisteredAcademy) => void;
  onOpenStudentEnrollment?: (academy?: RegisteredAcademy) => void;
  onOpenR2Backup?: () => void;
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
  onOpenProShopFulfillment,
  onOpenContract,
  onOpenTournaments,
  onOpenVoiceSettings,
  onOpenFinancial,
  onOpenExpenseManagement,
  onOpenSuperAdminSaas,
  onOpenAcademyRegistration,
  activeAcademyName,
  onOpenCloudStatus,
  onOpenStudentManagement,
  studentsCount,
  isCloudSynced = true,
  onOpenCEOProfile,
  onOpenCEOLogin,
  onOpenManagerLogin,
  onOpenTeacherLogin,
  academies,
  activeAcademyId,
  onSelectAcademy,
  onOpenOperatingHours,
  onOpenStudentEnrollment,
  onOpenR2Backup,
}) => {
  const isSuperAdminOrCEO = isSuperAdminOrCeoRole(activeRole);

  // Screen size detection
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  // Mobile drawer states
  const [isMobileRolesOpen, setIsMobileRolesOpen] = useState(false);
  const [isMobileModulesOpen, setIsMobileModulesOpen] = useState(false);
  const [isMobileBranchOpen, setIsMobileBranchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Presentation mode for mobile platform on desktop: 'fluid' (100% responsive) or 'mockup' (device bezel)
  const [mobilePresentation, setMobilePresentation] = useState<'fluid' | 'mockup'>('fluid');
  const [forceMobileFullscreen, setForceMobileFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setIsMobileScreen(isMobile);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const allRoles: { id: UserRole; label: string; icon: React.FC<{ className?: string }>; color: string; badge?: string }[] = [
    { id: 'ceo', label: '👑 CEO Messias', icon: Crown, color: 'text-amber-400', badge: 'ACESSO TOTAL' },
    { id: 'general_manager', label: 'Super Admin', icon: Shield, color: 'text-amber-300', badge: 'MASTER' },
    { id: 'saas_superadmin', label: 'SaaS Super Admin', icon: ShieldCheck, color: 'text-amber-300', badge: 'ASSINATURAS' },
    { id: 'manager', label: 'Gestor Filial', icon: Briefcase, color: 'text-cyan-400', badge: 'ACADEMIA' },
    { id: 'teacher', label: 'Professor Tatame', icon: GraduationCap, color: 'text-emerald-400' },
    { id: 'student', label: 'Aluno', icon: User, color: 'text-red-400' },
    { id: 'parent', label: 'Portal Responsável', icon: Users, color: 'text-blue-400' },
    { id: 'student_registration', label: 'Cadastrar Aluno', icon: UserPlus, color: 'text-blue-400', badge: 'MATRÍCULA' },
    { id: 'academy_registration', label: 'Cadastrar Academia', icon: Building2, color: 'text-amber-400', badge: 'FILIAIS' },
    { id: 'expense_management', label: 'Gestão de Despesas', icon: TrendingDown, color: 'text-rose-400', badge: 'DESPESAS' },
  ];

  // Regra de Sigilo Estrito: Os donos de academia e alunos NÃO podem sequer saber que a rota Super Admin SaaS existe
  const roles = allRoles.filter(r => {
    if (r.id === 'saas_superadmin') {
      return canAccessSuperAdmin(activeRole);
    }
    return true;
  });

  const currentRoleObj = roles.find(r => r.id === activeRole) || roles[4];
  const CurrentRoleIcon = currentRoleObj.icon;

  // Selected academy object
  const currentAcademy = academies?.find(a => a.id === activeAcademyId) || academies?.[0];

  // Whenever !isDesktopView, the user explicitly selected the Mobile Platform!
  // If user explicitly chose 'mockup' on a large screen, show the calibrated smartphone shell.
  // Otherwise, render the 100% responsive fluid Mobile Platform view!
  const shouldUseMobileMockup = !isDesktopView && !isMobileScreen && mobilePresentation === 'mockup' && !forceMobileFullscreen;
  const shouldUseMobileNative = !isDesktopView && !shouldUseMobileMockup;

  // =========================================================================
  // 1. NATIVE RESPONSIVE MOBILE PLATFORM (Fluido, 100% Responsivo e sem quebras)
  // =========================================================================
  if (shouldUseMobileNative) {
    return (
      <div className="fixed inset-0 w-full h-[100dvh] bg-slate-950 text-slate-100 flex flex-col items-center justify-start overflow-hidden font-sans select-none z-10">
        {/* Imagem Fixa Global de Fundo: Dois Lutadores de Jiu-Jitsu (100% Visível no Topo) */}
        <BJJFixedBackground opacity={0.48} className="fixed" />

        {/* Responsive Mobile Container: 100% width on phone, generously wide on tablet/desktop */}
        <div className="w-full max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl h-full flex flex-col relative z-20 overflow-hidden shadow-2xl bg-slate-950/20 backdrop-blur-[0.5px] sm:border-x sm:border-slate-800/80">
          {/* Enhanced Mobile Top App Bar com Transparência de Vidro (Imagem 100% Visível no Topo) e Fontes Ampliadas */}
          <header className="h-15 shrink-0 px-3 sm:px-4 bg-slate-950/40 border-b border-white/10 backdrop-blur-md flex items-center justify-between gap-2.5 z-30 shadow-lg">
            {/* Logo + Academy selector pill */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-red-800 p-0.5 shadow-md flex items-center justify-center font-black text-sm text-white shrink-0 ring-1 ring-white/20">
                BJJ
              </div>
              <button
                onClick={() => setIsMobileBranchOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-white text-sm font-extrabold truncate max-w-[130px] sm:max-w-[170px] transition cursor-pointer shadow-sm"
                title="Alternar academia ou filial"
              >
                <span className="truncate">{currentAcademy?.shortName || currentAcademy?.name || activeAcademyName || 'BJJ Academy'}</span>
                <ChevronDown className="w-4 h-4 text-slate-300 shrink-0" />
              </button>
            </div>

            {/* Center Role Switcher Pill (Alimentado com Fonte Maior e Mais Nítida) */}
            <button
              onClick={() => setIsMobileRolesOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-600/80 text-sm font-black transition shadow-md truncate max-w-[135px] sm:max-w-[165px] cursor-pointer"
              title="Alternar Perfil de Acesso"
            >
              <CurrentRoleIcon className={`w-4 h-4 ${currentRoleObj.color} shrink-0`} />
              <span className="truncate text-white text-sm font-black">{currentRoleObj.label.replace('👑 ', '').replace('🥋 ', '')}</span>
              <ChevronDown className="w-4 h-4 text-slate-300 shrink-0" />
            </button>

            {/* Right Action Icons: Direct Desktop Switcher, Modules & More Menu */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Instant 1-tap Desktop Toggle */}
              <button
                onClick={onToggleDesktopView}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-cyan-300 hover:text-white text-xs font-black flex items-center gap-1 transition shadow-sm cursor-pointer"
                title="Alternar para Painel Desktop (Computador)"
              >
                <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-black hidden xs:inline">PC</span>
              </button>

              {/* Toggle to smartphone shell mockup if on desktop */}
              {!isMobileScreen && (
                <button
                  onClick={() => setMobilePresentation('mockup')}
                  className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs transition cursor-pointer"
                  title="Ver com Moldura de Celular (Simulador)"
                >
                  <Tablet className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => setIsMobileModulesOpen(true)}
                className="p-2 rounded-xl bg-gradient-to-r from-red-600/40 to-amber-600/30 hover:bg-red-600/50 border border-red-500/50 text-amber-300 text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                title="Abrir Módulos do Tatame"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black hidden sm:inline">Módulos</span>
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white transition cursor-pointer"
                title="Menu e ferramentas adicionais"
              >
                <Menu className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Offline Alert if disconnected */}
          {!isOnline && (
            <div className="w-full shrink-0 px-3 py-1 bg-amber-500/20 border-b border-amber-500/40 text-amber-300 text-[11px] text-center font-medium">
              Modo Offline PWA ativo — dados locais e histórico preservados
            </div>
          )}

          {/* Dynamic Island Banner Notice if active */}
          {dynamicIslandNotice && (
            <div className="w-full shrink-0 px-3 py-1.5 bg-slate-900/95 border-b border-red-500/40 text-red-300 text-xs text-center font-bold flex items-center justify-center gap-2 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>{dynamicIslandNotice}</span>
            </div>
          )}

          {/* Fullscreen Mobile Viewport Content */}
          <main className="flex-1 w-full h-full min-h-0 overflow-hidden relative flex flex-col">
            <div className="relative z-10 flex-1 h-full overflow-hidden flex flex-col">
              {children}
            </div>
          </main>
        </div>

        {/* ========================================================================= */}
        {/* MOBILE BOTTOM SHEET: SELEÇÃO DE PERFIL / PAPEL                           */}
        {/* ========================================================================= */}
        {isMobileRolesOpen && (
          <div 
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setIsMobileRolesOpen(false)}
          >
            <div 
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 pb-8 shadow-2xl max-h-[85vh] overflow-y-auto no-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-red-500" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Alternar Perfil de Acesso</h3>
                </div>
                <button
                  onClick={() => setIsMobileRolesOpen(false)}
                  className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                {roles.map((r) => {
                  const Icon = r.icon;
                  const isSelected = activeRole === r.id;
                  const isAcademyTab = r.id === 'academy_registration';
                  return (
                    <button
                      key={r.id}
                      onClick={() => {
                        onSelectRole(r.id);
                        setIsMobileRolesOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl text-left font-bold transition ${
                        isSelected
                          ? isAcademyTab
                            ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-lg'
                            : 'bg-slate-800 text-white border border-slate-700 shadow-md'
                          : isAcademyTab
                            ? 'bg-amber-950/30 text-amber-300 border border-amber-500/30 hover:bg-amber-900/40'
                            : 'bg-slate-950/60 text-slate-300 border border-slate-800/80 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isSelected ? 'bg-black/30' : 'bg-slate-800'
                        }`}>
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : r.color}`} />
                        </div>
                        <div>
                          <div className="text-xs font-black">{r.label}</div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            {r.id === 'ceo' && 'Visão Global Multi-Tenant, Split Asaas e Churn por IA'}
                            {r.id === 'general_manager' && 'Gestão Executiva de Todas as Unidades'}
                            {r.id === 'manager' && 'Administração da Filial, Matrículas e Caixa'}
                            {r.id === 'teacher' && 'Chamada no Tatame, Rola Seguro e Exame de Faixa'}
                            {r.id === 'student' && 'Aulas, Check-in, PIX, Frequência e Graduação'}
                            {r.id === 'parent' && 'Portal do Responsável com Filhos e Dependentes'}
                            {r.id === 'student_registration' && 'Ficha completa de matrícula, dados civis, anamnese e contrato'}
                            {r.id === 'academy_registration' && 'Cadastrar e gerenciar filiais da rede'}
                          </div>
                        </div>
                      </div>
                      {isSelected ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : r.badge ? (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          {r.badge}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MOBILE BOTTOM SHEET: MÓDULOS RÁPIDOS DO TATAME                           */}
        {/* ========================================================================= */}
        {isMobileModulesOpen && (
          <div 
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setIsMobileModulesOpen(false)}
          >
            <div 
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 pb-8 shadow-2xl max-h-[85vh] overflow-y-auto no-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Módulos & Ferramentas Tatame</h3>
                </div>
                <button
                  onClick={() => setIsMobileModulesOpen(false)}
                  className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => {
                    setIsMobileModulesOpen(false);
                    if (onOpenScoreboard) onOpenScoreboard();
                  }}
                  className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-red-500/50 flex flex-col items-start gap-1.5 transition text-left"
                >
                  <Timer className="w-5 h-5 text-red-500" />
                  <span className="text-xs font-bold text-white">Cronômetro / Placar</span>
                  <span className="text-[10px] text-slate-400">Regras oficiais CBJJ</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileModulesOpen(false);
                    if (onOpenTechniques) onOpenTechniques();
                  }}
                  className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-blue-500/50 flex flex-col items-start gap-1.5 transition text-left"
                >
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  <span className="text-xs font-bold text-white">Videoteca Posições</span>
                  <span className="text-[10px] text-slate-400">Currículo por faixa</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileModulesOpen(false);
                    if (onOpenKiosk) onOpenKiosk();
                  }}
                  className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 flex flex-col items-start gap-1.5 transition text-left"
                >
                  <Tablet className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Totem Catraca</span>
                  <span className="text-[10px] text-slate-400">Tablet da recepção</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileModulesOpen(false);
                    if (onOpenGraduation) onOpenGraduation();
                  }}
                  className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/50 flex flex-col items-start gap-1.5 transition text-left"
                >
                  <Award className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-bold text-white">Exame de Faixa</span>
                  <span className="text-[10px] text-slate-400">Elegibilidade e graus</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileModulesOpen(false);
                    if (onOpenProShop) onOpenProShop();
                  }}
                  className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-purple-500/50 flex flex-col items-start gap-1.5 transition text-left"
                >
                  <ShoppingBag className="w-5 h-5 text-purple-400" />
                  <span className="text-xs font-bold text-white">Pro-Shop Kimonos</span>
                  <span className="text-[10px] text-slate-400">Loja oficial BJJ</span>
                </button>

                {(activeRole === 'manager' || activeRole === 'ceo' || activeRole === 'teacher' || activeRole === 'general_manager') && onOpenProShopFulfillment && (
                  <button
                    onClick={() => {
                      setIsMobileModulesOpen(false);
                      onOpenProShopFulfillment();
                    }}
                    className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/50 hover:border-purple-400 flex flex-col items-start gap-1.5 transition text-left"
                  >
                    <Package className="w-5 h-5 text-purple-400" />
                    <span className="text-xs font-bold text-white">Separação Estoque</span>
                    <span className="text-[10px] text-slate-400">Recepção & pedidos</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsMobileModulesOpen(false);
                    if (onOpenTournaments) onOpenTournaments();
                  }}
                  className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/50 flex flex-col items-start gap-1.5 transition text-left"
                >
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <span className="text-xs font-bold text-white">Torneios & Medalhas</span>
                  <span className="text-[10px] text-slate-400">Pódios e convocações</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileModulesOpen(false);
                    if (onOpenContract) onOpenContract();
                  }}
                  className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 flex flex-col items-start gap-1.5 transition text-left"
                >
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <span className="text-xs font-bold text-white">Contrato & Termo</span>
                  <span className="text-[10px] text-slate-400">Isenção e assinatura</span>
                </button>

                {(activeRole === 'manager' || isSuperAdminOrCEO) && (
                  <button
                    onClick={() => {
                      setIsMobileModulesOpen(false);
                      if (onOpenFinancial) onOpenFinancial();
                    }}
                    className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 hover:border-emerald-400 flex flex-col items-start gap-1.5 transition text-left"
                  >
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-300">Financeiro & Split</span>
                    <span className="text-[10px] text-emerald-400/80">Gestão Asaas PIX</span>
                  </button>
                )}

                {canAccessExpenseManagement(activeRole) && (
                  <button
                    onClick={() => {
                      setIsMobileModulesOpen(false);
                      onSelectRole('expense_management');
                      if (onOpenExpenseManagement) onOpenExpenseManagement();
                    }}
                    className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/50 hover:border-rose-400 flex flex-col items-start gap-1.5 transition text-left"
                  >
                    <TrendingDown className="w-5 h-5 text-rose-400" />
                    <span className="text-xs font-bold text-rose-300">Gestão de Despesas</span>
                    <span className="text-[10px] text-rose-400/80">Custos operacionais</span>
                  </button>
                )}

                {canAccessSuperAdmin(activeRole) && (
                  <button
                    onClick={() => {
                      setIsMobileModulesOpen(false);
                      onSelectRole('saas_superadmin');
                      if (onOpenSuperAdminSaas) onOpenSuperAdminSaas();
                    }}
                    className="p-3 rounded-2xl bg-amber-950/50 border border-amber-500/60 hover:border-amber-400 flex flex-col items-start gap-1.5 transition text-left"
                  >
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                    <span className="text-xs font-bold text-amber-300">SaaS Super Admin</span>
                    <span className="text-[10px] text-amber-400/80">Gestão de Assinaturas</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsMobileModulesOpen(false);
                    onSelectRole('academy_registration');
                    if (onOpenAcademyRegistration) onOpenAcademyRegistration();
                  }}
                  className="p-3 rounded-2xl bg-gradient-to-r from-red-600/30 to-amber-600/30 border border-amber-500/50 flex flex-col items-start gap-1.5 transition text-left col-span-2"
                >
                  <Building2 className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-bold text-amber-200">+ Cadastrar / Gerenciar Academias</span>
                  <span className="text-[10px] text-slate-300">Expansão de filiais da rede BJJ ACADEMY</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileModulesOpen(false);
                    if (onOpenVoiceSettings) onOpenVoiceSettings();
                  }}
                  className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-yellow-500/50 flex flex-col items-start gap-1.5 transition text-left col-span-2"
                >
                  <Volume2 className="w-5 h-5 text-yellow-400 animate-pulse" />
                  <span className="text-xs font-bold text-yellow-300">Voz da Academia (Notificações Faladas)</span>
                  <span className="text-[10px] text-slate-400">Locução inteligente no tatame</span>
                </button>

                {onOpenR2Backup && (
                  <button
                    onClick={() => {
                      setIsMobileModulesOpen(false);
                      onOpenR2Backup();
                    }}
                    className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-orange-950/60 border border-amber-500/50 hover:border-amber-400 flex flex-col items-start gap-1.5 transition text-left col-span-2 shadow-lg shadow-amber-950/20 cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          <Cloud className="w-4 h-4 text-amber-400" />
                        </div>
                        <span className="text-xs font-black text-amber-200">Mídias Externas & Backup (Cloudflare R2)</span>
                      </div>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        10 GB Grátis
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-300">
                      Upload fora da máquina + Backup do banco/app para recuperação em erro de deploy
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MOBILE BOTTOM SHEET: SELEÇÃO RÁPIDA DE FILIAIS                          */}
        {/* ========================================================================= */}
        {isMobileBranchOpen && academies && (
          <div 
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setIsMobileBranchOpen(false)}
          >
            <div 
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 pb-8 shadow-2xl max-h-[85vh] overflow-y-auto no-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Tatames & Filiais BJJ</h3>
                </div>
                <button
                  onClick={() => setIsMobileBranchOpen(false)}
                  className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Botão de Todas as Academias */}
              <button
                onClick={() => {
                  if (onSelectAcademy) onSelectAcademy('all');
                  setIsMobileBranchOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl mb-2 text-left font-bold transition ${
                  activeAcademyId === 'all'
                    ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md'
                    : 'bg-slate-950/60 text-slate-300 border border-slate-800 hover:bg-slate-800'
                }`}
              >
                <div>
                  <div className="text-xs font-black">🌐 Todas as Unidades (Rede Global)</div>
                  <div className="text-[10px] text-slate-400">Consolidado das {academies.length} filiais ativas</div>
                </div>
                {activeAcademyId === 'all' && <Check className="w-4 h-4 text-white" />}
              </button>

              <div className="space-y-2">
                {academies.map((acad) => {
                  const isSelected = activeAcademyId === acad.id;
                  return (
                    <button
                      key={acad.id}
                      onClick={() => {
                        if (onSelectAcademy) onSelectAcademy(acad.id);
                        setIsMobileBranchOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl text-left font-bold transition ${
                        isSelected
                          ? 'bg-slate-800 text-white border border-red-500/50 shadow-md'
                          : 'bg-slate-950/60 text-slate-300 border border-slate-800/80 hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-black text-white">{acad.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {acad.branch || acad.city} • {acad.activeStudentsCount ?? 0} alunos • {acad.tatamiAreaM2 ?? 80}m²
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-red-500" />}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800">
                <button
                  onClick={() => {
                    setIsMobileBranchOpen(false);
                    onSelectRole('academy_registration');
                    if (onOpenAcademyRegistration) onOpenAcademyRegistration();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md"
                >
                  <Building2 className="w-4 h-4" />
                  <span>+ Cadastrar Nova Filial</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MOBILE MORE MENU (Configurações, Cloud, CEO, Modos de Tela)                */}
        {/* ========================================================================= */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div 
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 pb-8 shadow-2xl max-h-[85vh] overflow-y-auto no-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <Menu className="w-5 h-5 text-red-500" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Ajustes & Sistema</h3>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                {/* Formato de Visualização da Plataforma */}
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <div className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-cyan-400" />
                    <span>Plataforma & Modo de Visualização:</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => {
                        setMobilePresentation('fluid');
                        setIsMobileMenuOpen(false);
                      }}
                      className={`p-2 rounded-xl text-[10px] font-bold border transition text-center ${
                        mobilePresentation === 'fluid'
                          ? 'bg-red-600 border-red-500 text-white'
                          : 'bg-slate-900 border-slate-700 text-slate-300'
                      }`}
                    >
                      📱 Mobile Fluido
                    </button>
                    <button
                      onClick={() => {
                        setMobilePresentation('mockup');
                        setIsMobileMenuOpen(false);
                      }}
                      className={`p-2 rounded-xl text-[10px] font-bold border transition text-center ${
                        mobilePresentation === 'mockup'
                          ? 'bg-red-600 border-red-500 text-white'
                          : 'bg-slate-900 border-slate-700 text-slate-300'
                      }`}
                    >
                      🖼️ Moldura
                    </button>
                    <button
                      onClick={() => {
                        onToggleDesktopView();
                        setIsMobileMenuOpen(false);
                      }}
                      className="p-2 rounded-xl text-[10px] font-bold border border-slate-700 bg-slate-900 text-cyan-300 hover:text-white transition text-center"
                    >
                      💻 Desktop
                    </button>
                  </div>
                </div>

                {/* CEO Login */}
                {onOpenCEOLogin && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenCEOLogin();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-amber-500/30 text-amber-300 text-xs font-bold"
                  >
                    <div className="flex items-center gap-2.5">
                      <Key className="w-4 h-4 text-amber-400" />
                      <span>Login Oficial do CEO</span>
                    </div>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                {/* Manager Login (Senha 6 Dígitos) */}
                {onOpenManagerLogin && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenManagerLogin();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-bold"
                  >
                    <div className="flex items-center gap-2.5">
                      <Briefcase className="w-4 h-4 text-cyan-400" />
                      <span>Login Dono / Gestor (PIN 6 Dígitos)</span>
                    </div>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                {/* Teacher Login & Aula Início */}
                {onOpenTeacherLogin && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenTeacherLogin();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-bold"
                  >
                    <div className="flex items-center gap-2.5">
                      <GraduationCap className="w-4 h-4 text-emerald-400" />
                      <span>Login Professor & Início de Aula</span>
                    </div>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                {/* CEO Profile */}
                {onOpenCEOProfile && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenCEOProfile();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/40 text-amber-300 text-xs font-bold"
                  >
                    <div className="flex items-center gap-2.5">
                      <Crown className="w-4 h-4 text-amber-400" />
                      <span>Perfil Mestre Messias (CEO)</span>
                    </div>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                {/* Cloud Status */}
                {onOpenCloudStatus && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenCloudStatus();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-bold"
                  >
                    <div className="flex items-center gap-2.5">
                      <Database className="w-4 h-4 text-emerald-400" />
                      <span>Status Nuvem Firebase Firestore</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </button>
                )}

                {/* Cloudflare R2 Mídias & Backup Automático */}
                {onOpenR2Backup && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenR2Backup();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-950/50 via-slate-950/70 to-slate-950/70 border border-amber-500/40 text-amber-300 text-xs font-bold hover:border-amber-400 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Cloud className="w-4 h-4 text-amber-400" />
                      <span>Mídias Externas & Backup (Cloudflare R2)</span>
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      10 GB
                    </span>
                  </button>
                )}

                {/* Student Management */}
                {onOpenStudentManagement && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenStudentManagement();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-blue-500/30 text-blue-300 text-xs font-bold"
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span>Alunos Cadastrados na Nuvem</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                      {studentsCount ?? 6}
                    </span>
                  </button>
                )}

                {/* Compartilhar App com Clientes (Link sem Erro 44) */}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenPWAInstall();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-700 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Share2 className="w-4 h-4 text-emerald-200" />
                    <span>📲 Enviar App aos Clientes (Sem Erro 44)</span>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* PWA Install */}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenPWAInstall();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold shadow-md"
                >
                  <div className="flex items-center gap-2.5">
                    <Download className="w-4 h-4" />
                    <span>Instalar Aplicativo (PWA / Celular)</span>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Capacitor Docs */}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenCapacitorDocs();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-slate-300 text-xs font-bold"
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-red-500" />
                    <span>Guia de Publicação (Google Play / App Store)</span>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Autoria & Engenharia */}
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs">
                    <Code className="w-3.5 h-3.5" />
                    <span>Engenharia do Software</span>
                    <span className="text-[9px] bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800 text-cyan-300 ml-auto font-mono">
                      50% Dev + 50% IA
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Desenvolvido por Programador de Software com 50% de apoio de Inteligência Artificial.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 2. DESKTOP / LARGE SCREEN VIEW (Com simulador de moldura e modo expandido)
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start py-2 sm:py-3 px-2 sm:px-4 font-sans selection:bg-red-600 selection:text-white relative overflow-x-hidden">
      {/* Imagem Fixa Global de Fundo: Dois Lutadores de Jiu-Jitsu (100% Visível) */}
      <BJJFixedBackground opacity={0.65} className="fixed" />

      {/* Top Global Control Toolbar com Fundo de Vidro e Fontes Ampliadas */}
      <header className="w-full max-w-5xl mb-2.5 p-3.5 sm:p-4 rounded-2xl bg-slate-950/40 border border-slate-700/60 backdrop-blur-md shadow-xl flex flex-wrap items-center justify-between gap-3 relative z-20">
        {/* Brand & Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 p-0.5 shadow-md flex items-center justify-center font-black text-sm text-white ring-1 ring-white/20">
            BJJ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                BJJ ACADEMY <span className="text-red-500">MOBILE 2.0</span>
              </h1>
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-800 text-slate-100 border border-slate-600">
                Capacitor + PWA
              </span>
              <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-cyan-950/60 text-cyan-300 border border-cyan-800/60" title="Desenvolvido por Programador de Software com 50% de apoio de IA">
                <Code className="w-3.5 h-3.5 text-cyan-400" />
                <span>50% Dev + 50% IA</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-medium hidden sm:block">
              Web • PWA • Android • iOS • Desenvolvido por Programador (50% IA Assist)
            </p>
          </div>
        </div>

        {/* Profile Switcher Pills com Fontes Maiores */}
        <div className="flex items-center bg-slate-950/80 p-1.5 rounded-xl border border-slate-700/80 overflow-x-auto max-w-full no-scrollbar gap-1.5 shadow-inner">
          {roles.map((r) => {
            const Icon = r.icon;
            const isSelected = activeRole === r.id;
            const isAcademyTab = r.id === 'academy_registration';
            return (
              <button
                key={r.id}
                onClick={() => onSelectRole(r.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-black transition shrink-0 cursor-pointer ${
                  isSelected
                    ? isAcademyTab 
                      ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md font-black ring-1 ring-amber-400/50' 
                      : 'bg-slate-800 text-white shadow-sm ring-1 ring-white/10'
                    : isAcademyTab
                      ? 'text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? (isAcademyTab ? 'text-white' : r.color) : (isAcademyTab ? 'text-amber-400' : 'text-slate-400')}`} />
                <span>{r.label}</span>
                {r.badge && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
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
          {/* CEO Login Quick Button */}
          {onOpenCEOLogin && (
            <button
              onClick={onOpenCEOLogin}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              title="Acesso com Login e Senha do CEO"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Login CEO</span>
            </button>
          )}

          {/* Dono / Gestor Login (PIN 6 Dígitos) */}
          {onOpenManagerLogin && (
            <button
              onClick={onOpenManagerLogin}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 hover:text-cyan-200 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              title="Acesso do Dono / Gestor com Senha de 6 Dígitos"
            >
              <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Dono (PIN 6)</span>
            </button>
          )}

          {/* Professor Login & Início de Aula */}
          {onOpenTeacherLogin && (
            <button
              onClick={onOpenTeacherLogin}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 hover:text-emerald-200 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              title="Login do Professor e Identificação de Início de Aula"
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Login Prof</span>
            </button>
          )}

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
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Nuvem</span>
          </button>

          {/* Cloudflare R2 External Media & Disaster Recovery Backup */}
          {onOpenR2Backup && (
            <button
              onClick={onOpenR2Backup}
              className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 to-orange-500/15 hover:from-amber-500/25 hover:to-orange-500/25 border border-amber-500/40 text-amber-300 hover:text-amber-100 text-xs font-black flex items-center gap-1.5 transition shadow-sm cursor-pointer"
              title="Cloudflare R2: Mídias Externas (10 GB Free) & Backup Automático com Disaster Recovery"
            >
              <Cloud className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">R2 & Backup</span>
              <span className="hidden xl:inline text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-200 font-mono">10 GB</span>
            </button>
          )}

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

          {/* Platform Switcher to Mobile */}
          <button
            onClick={onToggleDesktopView}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition shadow-sm ${
              isDesktopView
                ? 'bg-slate-800 hover:bg-slate-700 border-red-500/80 text-red-400 hover:text-white'
                : 'bg-red-600 border-red-500 text-white'
            }`}
            title="Alternar para Plataforma Mobile (PWA / Celular 100% Responsivo)"
          >
            <Smartphone className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">📱 Plataforma Mobile</span>
            <span className="sm:hidden">📱 Mobile</span>
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

          {/* Compartilhar com Clientes (Link sem Erro 44) */}
          <button
            onClick={onOpenPWAInstall}
            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-emerald-950 transition cursor-pointer"
            title="Enviar link sem Erro 44 para clientes e alunos baixarem"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-200" />
            <span className="hidden md:inline">Enviar aos Clientes</span>
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
      <nav className="w-full max-w-5xl mb-2 px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm flex items-center justify-between gap-2 overflow-x-auto text-xs no-scrollbar">
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

          {(activeRole === 'manager' || activeRole === 'ceo' || activeRole === 'teacher' || activeRole === 'general_manager') && onOpenProShopFulfillment && (
            <button
              onClick={onOpenProShopFulfillment}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-950/70 hover:bg-purple-900 text-purple-200 border border-purple-500/50 font-semibold text-[11px] whitespace-nowrap transition-colors"
              title="Central de Separação de Pedidos e Estoque Físico da Pro-Shop"
            >
              <Package className="w-3.5 h-3.5 text-purple-400" />
              <span>Separação Estoque</span>
            </button>
          )}

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

          {canAccessExpenseManagement(activeRole) && (
            <button
              onClick={() => {
                onSelectRole('expense_management');
                if (onOpenExpenseManagement) onOpenExpenseManagement();
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-rose-600/30 to-red-600/30 hover:from-rose-600/50 hover:to-red-600/50 text-rose-300 border border-rose-500/50 font-black text-[11px] whitespace-nowrap transition-all shadow-md"
              title="Módulo de Gestão de Despesas e Custos Operacionais da Academia"
            >
              <TrendingDown className="w-3.5 h-3.5 text-rose-400 stroke-[3]" />
              <span>Gestão de Despesas</span>
            </button>
          )}

          {canAccessSuperAdmin(activeRole) && (
            <button
              onClick={() => {
                onSelectRole('saas_superadmin');
                if (onOpenSuperAdminSaas) onOpenSuperAdminSaas();
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-amber-600/40 via-yellow-600/30 to-amber-500/40 hover:from-amber-600/60 hover:to-yellow-600/50 text-amber-200 border border-amber-500/60 font-black text-[11px] whitespace-nowrap transition-all shadow-md"
              title="Painel Exclusivo do Dono do Software: Gestão de Assinaturas SaaS"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 stroke-[3]" />
              <span>SaaS Super Admin</span>
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
            title="Configurar Notificações com Voz da Academia"
          >
            <Volume2 className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
            <span>Voz da Academia {activeAcademyName ? `(${activeAcademyName})` : ''}</span>
          </button>
        </div>
      </nav>

      {/* BJJACADEMY — Barra de Navegação e Filtros Individuais */}
      {academies && academies.length > 0 && onSelectAcademy && (
        <AcademyFilterBar
          academies={academies}
          activeAcademyId={activeAcademyId || (academies[0]?.id ?? '')}
          onSelectAcademy={onSelectAcademy}
          onOpenOperatingHours={onOpenOperatingHours}
          onOpenStudentEnrollment={onOpenStudentEnrollment}
        />
      )}

      {/* Offline Alert if disconnected */}
      {!isOnline && (
        <div className="w-full max-w-sm mb-2 p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs text-center font-medium animate-pulse">
          Modo Offline PWA ativo — dados locais e histórico preservados
        </div>
      )}

      {/* Frame Container */}
      <main className="w-full flex justify-center items-center flex-1 py-1">
        {isDesktopView ? (
          // Expanded Desktop Layout (for Managers / Front Desk / Fullscreen)
          <div className="w-full max-w-7xl h-[calc(100vh-140px)] min-h-[640px] bg-slate-950/40 border border-slate-700/70 rounded-3xl overflow-hidden shadow-2xl flex flex-col relative backdrop-blur-md">
            <div className="h-11 px-5 bg-slate-950/70 backdrop-blur-md border-b border-white/10 flex items-center justify-between text-xs text-slate-300 relative z-20">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-red-500/80 inline-block" />
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-3 font-mono text-xs font-bold text-slate-200">
                  https://app.bjjacademy.com.br/{activeRole}
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-300 hidden sm:inline">
                Visualização Computador • Gestão Integral do Tatame • BJJ ACADEMY
              </span>
            </div>
            <div className="flex-1 overflow-hidden relative flex flex-col">
              {/* Imagem Fixa de Fundo: Dois Lutadores de Jiu-Jitsu no Tatame */}
              <BJJFixedBackground opacity={0.65} />
              
              <div className="relative z-10 flex-1 h-full overflow-hidden flex flex-col">
                {children}
              </div>
            </div>
          </div>
        ) : (
          // Realistic Calibrated Mobile Device Frame (iPhone / Android)
          <div className="relative flex flex-col items-center">
            {/* Top Switcher Helper */}
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => setMobilePresentation('fluid')}
                className="px-3.5 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 hover:text-cyan-300 flex items-center gap-1.5 transition shadow-sm"
              >
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                <span>📱 Modo Mobile Fluido</span>
              </button>
              <button
                onClick={onToggleDesktopView}
                className="px-3.5 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white flex items-center gap-1.5 transition shadow-sm"
              >
                <Monitor className="w-3.5 h-3.5 text-slate-300" />
                <span>💻 Painel Desktop</span>
              </button>
            </div>

            {/* Outer Smartphone Shell (Calibrated height to fit screen comfortably without page scroll) */}
            <div className={`relative w-[395px] max-w-[94vw] h-[min(844px,calc(100vh-140px))] bg-slate-950/90 rounded-[44px] p-2.5 shadow-[0_25px_70px_rgba(0,0,0,0.8)] border-[4px] ${
              os === 'ios' ? 'border-slate-800/90 ring-1 ring-slate-700/50' : 'border-slate-700'
            } flex flex-col overflow-hidden`}>
              
              {/* Native Screen Bezel and Display */}
              <div className="relative w-full h-full rounded-[36px] bg-slate-950/40 overflow-hidden flex flex-col border border-slate-900">
                {/* Native OS Status Bar */}
                <NativeStatusBar os={os} dynamicIslandContent={dynamicIslandNotice} />

                {/* Inner View Content with Fixed BJJ Fighters Background */}
                <div className="flex-1 overflow-hidden relative flex flex-col">
                  {/* Imagem Fixa de Fundo: Dois Lutadores de Jiu-Jitsu no Tatame */}
                  <BJJFixedBackground opacity={0.72} />

                  <div className="relative z-10 flex-1 h-full overflow-hidden flex flex-col">
                    {children}
                  </div>
                </div>

                {/* iPhone Home Indicator Bar / Android nav line */}
                <div className="w-full h-4 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center shrink-0 relative z-20">
                  <div className="w-28 h-1 rounded-full bg-slate-600/60" />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Rodapé Oficial da Aplicação */}
      <footer className="w-full max-w-5xl py-2 mt-auto flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-1 border-t border-slate-900/80 px-2 relative z-10">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-400">BJJ ACADEMY MOBILE 2.0</span>
          <span>•</span>
          <span className="text-slate-400">Desenvolvido por Programador de Software com 50% de apoio de IA</span>
        </div>
        <div className="text-[10px] text-slate-400 font-mono">
          50% Engenharia Humana • 50% Co-pilotado por IA
        </div>
      </footer>
    </div>
  );
};

