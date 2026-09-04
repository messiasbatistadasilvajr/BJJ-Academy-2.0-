import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, AlertTriangle, Phone, MessageCircle, Send, CheckCircle2, 
  Clock, Flame, ShieldAlert, Users, DollarSign, RefreshCw, 
  Search, Filter, Sparkles, Building2, ChevronRight, Edit3, 
  HelpCircle, ThumbsUp, HeartPulse, Briefcase, Award, Download
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RetentionAlertItem, ChurnRiskLevel, RetentionContactStatus, RegisteredAcademy } from '../../types';
import { BeltBadge } from './BeltBadge';
import { sendRetentionRescueWhatsApp } from '../../utils/whatsappHelper';
import { formatBRL } from '../../utils/financialCalculations';

interface RetentionRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: RetentionAlertItem[];
  onUpdateAlerts: (alerts: RetentionAlertItem[]) => void;
  academies?: RegisteredAcademy[];
  activeAcademyId?: string;
  isGeneralManager?: boolean;
  onAnnounceVoice?: (title: string, body: string) => void;
}

export const RetentionRadarModal: React.FC<RetentionRadarModalProps> = ({
  isOpen,
  onClose,
  alerts,
  onUpdateAlerts,
  academies = [],
  activeAcademyId,
  isGeneralManager = false,
  onAnnounceVoice
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<'all' | ChurnRiskLevel>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | RetentionContactStatus>('all');
  const [selectedAcademyFilter, setSelectedAcademyFilter] = useState<string>(
    isGeneralManager ? 'all' : (activeAcademyId || 'all')
  );

  // Rescue WhatsApp Drawer / Composer State
  const [activeRescueStudent, setActiveRescueStudent] = useState<RetentionAlertItem | null>(null);
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number>(0);
  const [customMessageDraft, setCustomMessageDraft] = useState<string>('');

  // Editing Note State
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState<string>('');

  // Filtered Alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      if (!isGeneralManager && activeAcademyId && alert.academyId !== activeAcademyId) {
        return false;
      }
      if (selectedAcademyFilter !== 'all' && alert.academyId !== selectedAcademyFilter) {
        return false;
      }
      if (selectedRiskFilter !== 'all' && alert.churnRisk !== selectedRiskFilter) {
        return false;
      }
      if (selectedStatusFilter !== 'all' && alert.contactStatus !== selectedStatusFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = alert.studentName.toLowerCase().includes(query);
        const matchesPhone = alert.studentPhone.includes(query);
        const matchesAcademy = alert.academyName.toLowerCase().includes(query);
        if (!matchesName && !matchesPhone && !matchesAcademy) return false;
      }
      return true;
    });
  }, [alerts, isGeneralManager, activeAcademyId, selectedAcademyFilter, selectedRiskFilter, selectedStatusFilter, searchTerm]);

  // Key Metrics
  const metrics = useMemo(() => {
    const relevant = isGeneralManager && selectedAcademyFilter === 'all'
      ? alerts
      : alerts.filter(a => selectedAcademyFilter === 'all' ? (activeAcademyId ? a.academyId === activeAcademyId : true) : a.academyId === selectedAcademyFilter);

    const totalAtRisk = relevant.filter(a => a.daysAbsent >= 7 && a.contactStatus !== 'resgatado').length;
    const criticalCount = relevant.filter(a => a.churnRisk === 'critico' && a.contactStatus !== 'resgatado').length;
    const rescuedCount = relevant.filter(a => a.contactStatus === 'resgatado').length;
    const revenueAtRisk = relevant
      .filter(a => a.contactStatus !== 'resgatado' && a.contactStatus !== 'pausado')
      .reduce((sum, a) => sum + a.monthlyFee, 0);

    return {
      totalAtRisk,
      criticalCount,
      rescuedCount,
      revenueAtRisk
    };
  }, [alerts, isGeneralManager, selectedAcademyFilter, activeAcademyId]);

  // Message templates for WhatsApp
  const getTemplates = (student: RetentionAlertItem) => [
    {
      id: 'acolhimento',
      title: '🥋 Acolhimento & Saudade do Tatame',
      text: `Fala ${student.studentName}! Tudo bem? Sentimos sua falta essa semana no tatame da ${student.academyName}. O treino hoje tá imperdível com a galera reunida. Dá uma passada aqui nem que seja pra soltar o corpo e rever os amigos! OSS! 🥋`
    },
    {
      id: 'motivacional',
      title: '🔥 Foco na Faixa & Consistência',
      text: `Fala guerreiro(a) ${student.studentName}! Notamos que faz ${student.daysAbsent} dias desde seu último treino. A constância no tatame é o que constrói a casca e garante seus próximos graus. Bora colocar o kimono hoje? 🥋🔥`
    },
    {
      id: 'saude_lesao',
      title: '🩺 Cuidado & Apoio (Lesão ou Rotina)',
      text: `Olá ${student.studentName}, tudo bem? Passando para saber como você está e se tá tudo certo com a sua saúde e rotina de trabalho. Se precisar de qualquer ajuste nos seus horários, conte com a nossa equipe! OSS!`
    },
    {
      id: 'convite_amigo',
      title: '🤝 Treino Leve & Sem Pressão',
      text: `Fala ${student.studentName}! Que tal dar uma passada no tatame hoje só pra rever a galera e fazer aquele rola soltinho e técnico? Sem compromisso com ritmo pesado, só pra desestressar! Te esperamos!`
    }
  ];

  const handleOpenRescueDrawer = (student: RetentionAlertItem) => {
    setActiveRescueStudent(student);
    const templates = getTemplates(student);
    setSelectedTemplateIndex(0);
    setCustomMessageDraft(templates[0].text);
  };

  const handleSendRescueWhatsApp = () => {
    if (!activeRescueStudent) return;
    sendRetentionRescueWhatsApp(
      activeRescueStudent.studentName,
      activeRescueStudent.studentPhone,
      activeRescueStudent.daysAbsent,
      activeRescueStudent.academyName,
      customMessageDraft,
      activeRescueStudent.preferredClassTime
    );

    // Auto mark as 'contatado'
    handleUpdateStatus(activeRescueStudent.id, 'contatado', 'Mensagem de resgate enviada via WhatsApp.');
    setActiveRescueStudent(null);
  };

  const handleUpdateStatus = (
    alertId: string, 
    newStatus: RetentionContactStatus, 
    customNote?: string
  ) => {
    const updated = alerts.map(a => {
      if (a.id === alertId) {
        return {
          ...a,
          contactStatus: newStatus,
          lastContactDate: new Date().toLocaleDateString('pt-BR'),
          contactNotes: customNote || a.contactNotes
        };
      }
      return a;
    });

    onUpdateAlerts(updated);
    localStorage.setItem('bjj_retention_alerts', JSON.stringify(updated));

    if (newStatus === 'resgatado') {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
      if (onAnnounceVoice) {
        onAnnounceVoice('Resgate no Tatame', 'Atleta resgatado com sucesso! Mais uma vitória na retenção.');
      }
    }
  };

  const handleSaveNote = (alertId: string) => {
    if (!noteInput.trim()) return;
    const updated = alerts.map(a => {
      if (a.id === alertId) {
        return {
          ...a,
          contactNotes: noteInput.trim()
        };
      }
      return a;
    });
    onUpdateAlerts(updated);
    localStorage.setItem('bjj_retention_alerts', JSON.stringify(updated));
    setEditingNoteId(null);
    setNoteInput('');
  };

  const handleExportCSV = () => {
    const headers = ['Nome', 'Telefone', 'Faixa', 'Academia', 'UltimaPresenca', 'DiasAusente', 'Risco', 'Status', 'Mensalidade', 'Notas'];
    const rows = filteredAlerts.map(a => [
      `"${a.studentName}"`,
      `"${a.studentPhone}"`,
      `"${a.studentBelt}"`,
      `"${a.academyName}"`,
      `"${a.lastAttendanceDate}"`,
      a.daysAbsent,
      `"${a.churnRisk}"`,
      `"${a.contactStatus}"`,
      a.monthlyFee,
      `"${a.contactNotes || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `radar_evasao_bjj_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-hidden animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
      >
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-red-950/40 via-slate-900 to-amber-950/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Radar Anti-Evasão & Retenção Ativa
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500/20 text-red-400 border border-red-500/30 uppercase tracking-wide">
                  IA Churn Alert
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Monitore ausências do tatame, previna cancelamentos e resgate alunos via WhatsApp com 1 clique
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition"
              title="Exportar Lista CSV para Follow-up"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Exportar</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 4 Top KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 border-b border-slate-800/80 bg-slate-950/40">
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800/80 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Alunos em Risco
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black text-amber-400">{metrics.totalAtRisk}</span>
              <span className="text-[10px] text-slate-500 font-medium">≥ 7 dias ausentes</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/90 border border-red-900/40 bg-red-950/10 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-red-500" /> Risco Crítico
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black text-red-400">{metrics.criticalCount}</span>
              <span className="text-[10px] text-red-300/80 font-medium">≥ 14-30 dias</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800/80 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" /> Resgatados
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black text-emerald-400">{metrics.rescuedCount}</span>
              <span className="text-[10px] text-emerald-300/80 font-medium">Voltaram ao tatame!</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800/80 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-cyan-400" /> Receita em Risco
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-lg sm:text-xl font-black text-white">{formatBRL(metrics.revenueAtRisk)}</span>
              <span className="text-[10px] text-slate-500 font-medium">mensalidades</span>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5 bg-slate-900/60">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por atleta, telefone ou filial..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {/* Academy filter (if GM) */}
            {isGeneralManager && (
              <select
                value={selectedAcademyFilter}
                onChange={(e) => setSelectedAcademyFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
              >
                <option value="all">Todas as Unidades</option>
                {academies.map(a => (
                  <option key={a.id} value={a.id}>{a.shortName || a.name}</option>
                ))}
              </select>
            )}

            {/* Risk filter */}
            <select
              value={selectedRiskFilter}
              onChange={(e) => setSelectedRiskFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-red-500"
            >
              <option value="all">Todos os Riscos</option>
              <option value="critico">🚨 Crítico (14d+)</option>
              <option value="alto">⚠️ Alto (8-14d)</option>
              <option value="moderado">🟡 Moderado (7d)</option>
            </select>

            {/* Status filter */}
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Todos os Status</option>
              <option value="pendente">⏳ Pendente</option>
              <option value="contatado">📱 Contatado</option>
              <option value="resgatado">🎉 Resgatado</option>
              <option value="pausado">⏸️ Matrícula Pausada</option>
            </select>
          </div>
        </div>

        {/* Athlete List Table / Cards */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
          {filteredAlerts.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-slate-800/80">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-white">Nenhum aluno em risco com esses filtros!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Excelente trabalho de retenção. Todos os atletas estão ativos ou já foram atendidos pela equipe.
              </p>
            </div>
          ) : (
            filteredAlerts.map(alert => {
              const isCritical = alert.churnRisk === 'critico';
              const isRescued = alert.contactStatus === 'resgatado';
              const isPaused = alert.contactStatus === 'pausado';

              return (
                <div 
                  key={alert.id}
                  className={`p-3 sm:p-4 rounded-2xl border transition ${
                    isRescued 
                      ? 'bg-emerald-950/20 border-emerald-800/40' 
                      : isCritical 
                        ? 'bg-red-950/20 border-red-800/50 hover:border-red-500/60 shadow-lg shadow-red-950/20'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left: Student info */}
                    <div className="flex items-start gap-3">
                      <div className="relative shrink-0">
                        <img 
                          src={alert.studentAvatar} 
                          alt={alert.studentName}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-700" 
                        />
                        {isCritical && (
                          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-slate-900 animate-ping" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-white">{alert.studentName}</h4>
                          <BeltBadge belt={alert.studentBelt} stripes={1} size="sm" />
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
                            <Building2 className="w-3 h-3 text-slate-500" />
                            {alert.academyName}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-500" />
                            {alert.studentPhone}
                          </span>
                          <span>•</span>
                          <span className="text-slate-300">
                            Última presença: <strong className="text-white">{alert.lastAttendanceDate}</strong>
                          </span>
                          <span>•</span>
                          <span className="text-cyan-300 font-semibold">
                            {formatBRL(alert.monthlyFee)}/mês
                          </span>
                        </div>

                        {alert.preferredClassTime && (
                          <div className="mt-1 text-[11px] text-slate-400">
                            Horário preferido: <span className="text-amber-300 font-medium">{alert.preferredClassTime}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Absence Badge & Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 sm:self-center">
                      <div className="flex flex-col items-start sm:items-end">
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${
                          isRescued 
                            ? 'bg-emerald-950 border-emerald-700/60 text-emerald-300'
                            : isCritical
                              ? 'bg-red-950 border-red-700 text-red-300 animate-pulse'
                              : 'bg-amber-950 border-amber-700 text-amber-300'
                        }`}>
                          {isRescued ? '🎉 Resgatado!' : `${alert.daysAbsent} dias ausente`}
                        </span>
                        {alert.detectedCause && (
                          <span className="text-[10px] text-slate-400 mt-0.5 capitalize">
                            Motivo provável: <strong className="text-slate-300">{alert.detectedCause}</strong>
                          </span>
                        )}
                      </div>

                      {/* WhatsApp Rescue Button */}
                      <button
                        onClick={() => handleOpenRescueDrawer(alert)}
                        className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950 transition"
                        title="Enviar Mensagem de Resgate no WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4 fill-white" />
                        <span>Resgatar</span>
                      </button>

                      {/* Quick Status Dropdown */}
                      <select
                        value={alert.contactStatus}
                        onChange={(e) => handleUpdateStatus(alert.id, e.target.value as RetentionContactStatus)}
                        className="bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
                      >
                        <option value="pendente">⏳ Pendente</option>
                        <option value="contatado">📱 Contatado</option>
                        <option value="resgatado">🎉 Resgatado</option>
                        <option value="pausado">⏸️ Pausar</option>
                      </select>
                    </div>
                  </div>

                  {/* Notes / Follow-up section */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                    {editingNoteId === alert.id ? (
                      <div className="flex items-center gap-2 w-full">
                        <input
                          type="text"
                          value={noteInput}
                          onChange={(e) => setNoteInput(e.target.value)}
                          placeholder="Ex: Aluno viajou a trabalho, volta semana que vem..."
                          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1 text-xs text-white focus:outline-none focus:border-amber-500"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveNote(alert.id)}
                          className="px-2.5 py-1 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => setEditingNoteId(null)}
                          className="px-2 py-1 text-slate-400 hover:text-white"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-1.5 text-slate-400 truncate">
                          <Edit3 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">
                            {alert.contactNotes ? (
                              <strong className="text-slate-300 font-medium italic">"{alert.contactNotes}"</strong>
                            ) : (
                              <span className="text-slate-500 italic">Sem notas registradas</span>
                            )}
                          </span>
                          {alert.lastContactDate && (
                            <span className="text-[10px] text-slate-500 shrink-0 ml-1">
                              (Contato: {alert.lastContactDate})
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setEditingNoteId(alert.id);
                            setNoteInput(alert.contactNotes || '');
                          }}
                          className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold shrink-0"
                        >
                          {alert.contactNotes ? 'Editar nota' : '+ Adicionar nota'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* WhatsApp Composer Drawer / Modal */}
        <AnimatePresence>
          {activeRescueStudent && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="absolute inset-x-0 bottom-0 bg-slate-950 border-t-2 border-emerald-500/80 p-4 sm:p-5 shadow-2xl rounded-t-3xl z-20 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 fill-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Disparar Mensagem de Resgate via WhatsApp
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Para <strong>{activeRescueStudent.studentName}</strong> • {activeRescueStudent.studentPhone}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveRescueStudent(null)}
                  className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Template selection pills */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
                {getTemplates(activeRescueStudent).map((tpl, idx) => (
                  <button
                    key={tpl.id}
                    onClick={() => {
                      setSelectedTemplateIndex(idx);
                      setCustomMessageDraft(tpl.text);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold shrink-0 transition border ${
                      selectedTemplateIndex === idx
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {tpl.title}
                  </button>
                ))}
              </div>

              {/* Editable text area */}
              <div className="space-y-1">
                <textarea
                  rows={3}
                  value={customMessageDraft}
                  onChange={(e) => setCustomMessageDraft(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-3 text-xs text-white leading-relaxed focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  placeholder="Edite a mensagem antes de disparar..."
                />
              </div>

              {/* Drawer actions */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(customMessageDraft);
                    alert('Mensagem copiada para a área de transferência!');
                  }}
                  className="text-xs text-slate-400 hover:text-slate-200 font-semibold"
                >
                  Copiar Mensagem
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveRescueStudent(null)}
                    className="px-3 py-2 rounded-xl bg-slate-900 text-slate-300 font-bold text-xs hover:bg-slate-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSendRescueWhatsApp}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-950 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Abrir WhatsApp & Enviar</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
