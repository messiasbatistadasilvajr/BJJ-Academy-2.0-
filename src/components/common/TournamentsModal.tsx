import React, { useState, useEffect } from 'react';
import {
  X,
  Trophy,
  Medal,
  Calendar,
  MapPin,
  Users,
  Send,
  Check,
  Award,
  Sparkles,
  Building2,
  BellRing,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageSquare,
  AlertTriangle,
  Play,
  RotateCcw,
  Share2,
  Copy
} from 'lucide-react';
import {
  TournamentItem,
  TeamMedal,
  RegisteredAcademy,
  Announcement,
  AcademyTournamentBroadcast,
  TournamentBroadcastLog
} from '../../types';
import { mockTeamMedals, mockRegisteredAcademies } from '../../data/mockData';
import { BeltBadge } from './BeltBadge';
import {
  INITIAL_COMPETITIONS_LIST,
  getStoredCompetitions,
  saveCompetitions,
  getAllAcademyBroadcasts,
  getBroadcastLogs,
  broadcastTournamentToAcademies,
  BroadcastExecutionResult
} from '../../services/competitionsBroadcastService';
import { safeLocalStorageGet } from '../../utils/safeStorage';
import { academyVoiceEngine } from '../../utils/voiceNotification';

interface TournamentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  academies?: RegisteredAcademy[];
  activeAcademy?: RegisteredAcademy;
  onAnnouncementsUpdated?: (announcements: Announcement[]) => void;
  onSendPushBroadcast?: (title: string, body: string, target: 'all' | 'students' | 'parents') => void;
}

export const TournamentsModal: React.FC<TournamentsModalProps> = ({
  isOpen,
  onClose,
  academies = mockRegisteredAcademies,
  activeAcademy = mockRegisteredAcademies[0],
  onAnnouncementsUpdated,
  onSendPushBroadcast
}) => {
  // Tabs: 'calendar' (Competições) | 'inbox' (Mensagens das Academias) | 'logs' (Logs de Disparo) | 'medals' (Medalhas)
  const [activeTab, setActiveTab] = useState<'calendar' | 'inbox' | 'logs' | 'medals'>('calendar');

  // Competitions State
  const [competitions, setCompetitions] = useState<TournamentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [federationFilter, setFederationFilter] = useState<'Todos' | 'IBJJF' | 'CBJJ' | 'AJP Tour'>('Todos');

  // Broadcasts & Logs State
  const [broadcasts, setBroadcasts] = useState<AcademyTournamentBroadcast[]>([]);
  const [broadcastLogs, setBroadcastLogs] = useState<TournamentBroadcastLog[]>([]);
  const [selectedAcademyForInbox, setSelectedAcademyForInbox] = useState<string>(activeAcademy.id || academies[0]?.id);

  // Sending Action State
  const [sendingTournamentId, setSendingTournamentId] = useState<string | null>(null);
  const [broadcastFeedback, setBroadcastFeedback] = useState<{
    summary: string;
    targetCount: number;
    tournamentName: string;
  } | null>(null);

  // Enrolled State for Student Registration
  const [enrolledMap, setEnrolledMap] = useState<Record<string, boolean>>({
    tourn_fortaleza_open: true
  });

  // Copied message state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Medals State
  const [medals] = useState<TeamMedal[]>(mockTeamMedals);

  // Load competitions and broadcasts on mount or open
  useEffect(() => {
    if (isOpen) {
      const stored = getStoredCompetitions();
      setCompetitions(stored.length > 0 ? stored : INITIAL_COMPETITIONS_LIST);
      setBroadcasts(getAllAcademyBroadcasts());
      setBroadcastLogs(getBroadcastLogs());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Partner academies list
  const partnerAcademies = academies.length > 0 ? academies : mockRegisteredAcademies;

  // Filtered Competitions
  const filteredCompetitions = competitions.filter((comp) => {
    const matchesSearch =
      comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (comp.city && comp.city.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFed = federationFilter === 'Todos' || comp.federation === federationFilter;
    return matchesSearch && matchesFed;
  });

  // Inbound messages for the selected academy inbox
  const currentAcademyBroadcasts = broadcasts.filter((b) => b.academyId === selectedAcademyForInbox);
  const currentSelectedAcademy = partnerAcademies.find((a) => a.id === selectedAcademyForInbox) || partnerAcademies[0];

  // Core Dispatch Handler
  const handleBroadcastTournament = (tournament: TournamentItem) => {
    setSendingTournamentId(tournament.id);

    setTimeout(() => {
      const result: BroadcastExecutionResult = broadcastTournamentToAcademies(
        tournament,
        partnerAcademies,
        'Central BJJ ACADEMY Mobile'
      );

      // Update state
      setBroadcasts(getAllAcademyBroadcasts());
      setBroadcastLogs(getBroadcastLogs());
      setCompetitions(getStoredCompetitions());

      // Trigger announcements update in the parent App if callback exists
      if (onAnnouncementsUpdated) {
        const updatedAnnouncements = safeLocalStorageGet<Announcement[]>('bjj_announcements', []);
        onAnnouncementsUpdated(updatedAnnouncements);
      }

      // Voice / Sound Notification Chime
      try {
        if (activeAcademy) {
          academyVoiceEngine.announceAcademyMessage(
            activeAcademy,
            `Convocação: ${tournament.name}`,
            `Transmitido para todas as filiais parceiras.`
          );
        } else {
          academyVoiceEngine.playChime('tatame_bell');
        }
      } catch {
        // audio fallback
      }

      if (onSendPushBroadcast) {
        onSendPushBroadcast(
          `📢 Convocação: ${tournament.name}`,
          `Edital de competição transmitido para todas as ${partnerAcademies.length} academias cadastradas!`,
          'all'
        );
      }

      setBroadcastFeedback({
        summary: result.logSummary,
        targetCount: result.totalAcademies,
        tournamentName: tournament.name
      });

      setSendingTournamentId(null);
    }, 600);
  };

  // Run automated test simulation requested in requirements
  const handleRunTestSimulation = () => {
    const targetTourn =
      competitions.find((c) => c.name.includes('Fortaleza Open')) || competitions[0];
    if (targetTourn) {
      handleBroadcastTournament(targetTourn);
    }
  };

  // Student enroll toggle
  const toggleEnroll = (id: string) => {
    setEnrolledMap((prev) => {
      const current = !!prev[id];
      const next = !current;
      setCompetitions((list) => {
        const updated = list.map((t) => {
          if (t.id === id) {
            return { ...t, enrolledAcademyCount: t.enrolledAcademyCount + (next ? 1 : -1) };
          }
          return t;
        });
        saveCompetitions(updated);
        return updated;
      });
      return { ...prev, [id]: next };
    });
  };

  // Copy message for WhatsApp sharing
  const handleCopyMessage = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const goldCount = medals.filter((m) => m.medal === 'gold').length;
  const silverCount = medals.filter((m) => m.medal === 'silver').length;
  const bronzeCount = medals.filter((m) => m.medal === 'bronze').length;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col justify-end sm:justify-center items-center sm:p-4 animate-fadeIn"
      id="modal-competitions-central"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-3xl h-[94vh] sm:h-[88vh] flex flex-col overflow-hidden shadow-2xl">
        {/* TOP HEADER */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 text-white shadow-md shadow-red-950/50">
              <Trophy size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-white text-base leading-tight">
                  Central de Competições & Notificações
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold border border-red-500/30">
                  {partnerAcademies.length} ACADEMIAS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Calendário oficial e disparo automático de comunicados para academias parceiras
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunTestSimulation}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-amber-400 hover:text-amber-300 text-xs font-bold transition border border-amber-500/30"
              title="Testar disparo automático de mensagem"
            >
              <Play size={12} className="fill-amber-400" />
              <span>Simular Disparo</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* FEEDBACK BANNER OF DISPATCH SUCCESS */}
        {broadcastFeedback && (
          <div className="px-5 py-3 bg-emerald-950/40 border-b border-emerald-800/60 flex items-center justify-between text-xs text-emerald-300 animate-slideDown">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-white">{broadcastFeedback.summary}</span>
                <div className="text-[11px] text-emerald-400/90">
                  Injetado automaticamente no mural e na caixa de entrada das {broadcastFeedback.targetCount} filiais.
                </div>
              </div>
            </div>
            <button
              onClick={() => setBroadcastFeedback(null)}
              className="text-emerald-400 hover:text-white p-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* NAVIGATION TABS */}
        <div className="flex border-b border-slate-800 bg-slate-950/70 p-1.5 gap-1 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'calendar'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Calendar size={14} />
            <span>Competições ({competitions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('inbox')}
            className={`flex-1 min-w-[150px] py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'inbox'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 size={14} />
            <span>Caixa das Academias</span>
            {broadcasts.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-black">
                {broadcasts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'logs'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Clock size={14} />
            <span>Logs de Disparo ({broadcastLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('medals')}
            className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'medals'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Medal size={14} />
            <span>Medalhas ({medals.length})</span>
          </button>
        </div>

        {/* BODY CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* TAB 1: LISTA DE COMPETIÇÕES (MOBILE CARDS) */}
          {activeTab === 'calendar' && (
            <div className="space-y-4 animate-fadeIn">
              {/* FILTROS & BUSCA */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar evento por nome ou cidade (ex: Fortaleza, Salvador, Grand Slam)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-red-500 transition"
                  />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                  {(['Todos', 'IBJJF', 'CBJJ', 'AJP Tour'] as const).map((fed) => (
                    <button
                      key={fed}
                      onClick={() => setFederationFilter(fed)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                        federationFilter === fed
                          ? 'bg-slate-750 text-white border border-slate-600'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {fed}
                    </button>
                  ))}
                </div>
              </div>

              {/* LISTA DE CARDS DE TORNEIOS */}
              <div className="space-y-3.5">
                {filteredCompetitions.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-3xl">
                    Nenhum campeonato encontrado com os filtros selecionados.
                  </div>
                ) : (
                  filteredCompetitions.map((tourn) => {
                    const isEnrolled = !!enrolledMap[tourn.id];
                    const isSending = sendingTournamentId === tourn.id;

                    return (
                      <div
                        key={tourn.id}
                        className="bg-slate-950 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-3.5 transition shadow-lg"
                      >
                        {/* CARD HEADER */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                                  tourn.federation === 'IBJJF'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : tourn.federation === 'CBJJ'
                                    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                    : tourn.federation === 'AJP Tour'
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                                }`}
                              >
                                {tourn.federation}
                              </span>

                              <span className="text-xs text-slate-300 font-medium flex items-center gap-1">
                                <Calendar size={13} className="text-slate-400" />
                                {tourn.date}
                              </span>

                              {tourn.registrationOpen && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                                  Inscrições Abertas
                                </span>
                              )}
                            </div>

                            <h3 className="font-bold text-white text-sm sm:text-base leading-snug pt-0.5">
                              {tourn.name}
                            </h3>

                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                              <MapPin size={13} className="text-red-400 shrink-0" />
                              <span>{tourn.location}</span>
                              {tourn.city && (
                                <span className="font-medium text-slate-300">
                                  • {tourn.city}/{tourn.state}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-[11px] bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-xl font-medium flex items-center gap-1.5 shadow-inner">
                              <Users size={12} className="text-cyan-400" />
                              <span>{tourn.enrolledAcademyCount} no tatame</span>
                            </span>
                          </div>
                        </div>

                        {/* CATEGORIES PILLS */}
                        <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-400">
                          {tourn.categories.map((cat, idx) => (
                            <span
                              key={idx}
                              className="bg-slate-900/90 px-2.5 py-0.5 rounded-lg border border-slate-800/90 font-medium"
                            >
                              {cat}
                            </span>
                          ))}
                        </div>

                        {/* BROADCAST STATUS BADGE */}
                        {tourn.broadcastCount && tourn.broadcastCount > 0 ? (
                          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                              <Check size={13} /> Transmitido para as {partnerAcademies.length} academias parceiras
                            </span>
                            <span className="text-slate-500 text-[10px]">
                              Último envio: {tourn.lastBroadcastAt}
                            </span>
                          </div>
                        ) : null}

                        {/* CARD ACTIONS */}
                        <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div className="text-[11px] text-slate-400">
                            Inscrições até:{' '}
                            <strong className="text-slate-200">{tourn.registrationDeadline}</strong>
                            {tourn.registrationFee && (
                              <span className="ml-2 text-slate-400">
                                • Taxa: <span className="text-emerald-400 font-bold">R$ {tourn.registrationFee.toFixed(2)}</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {/* BOTÃO PRINCIPAL: ENVIAR PARA ACADEMIAS */}
                            <button
                              onClick={() => handleBroadcastTournament(tourn)}
                              disabled={isSending}
                              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-red-950/40 transition active:scale-95 disabled:opacity-60"
                            >
                              {isSending ? (
                                <>
                                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  <span>Transmitindo...</span>
                                </>
                              ) : (
                                <>
                                  <Send size={13} />
                                  <span>Enviar para Academias</span>
                                </>
                              )}
                            </button>

                            {/* BOTÃO DE INSCRIÇÃO INDIVIDUAL DO ALUNO */}
                            <button
                              onClick={() => toggleEnroll(tourn.id)}
                              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                                isEnrolled
                                  ? 'bg-emerald-950/60 border border-emerald-600 text-emerald-300'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                              }`}
                            >
                              {isEnrolled ? (
                                <>
                                  <Check size={13} className="text-emerald-400" />
                                  <span>Inscrito</span>
                                </>
                              ) : (
                                <span>Quero Competir</span>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CAIXA DE MENSAGENS DAS ACADEMIAS (INBOX DAS FILIAIS) */}
          {activeTab === 'inbox' && (
            <div className="space-y-4 animate-fadeIn">
              {/* ACADEMY SELECTOR SWITCH */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-white flex items-center gap-1.5">
                    <Building2 size={14} className="text-red-400" />
                    <span>Selecione a Academia para Pré-Visualizar a Caixa de Mensagens:</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {partnerAcademies.length} filiais cadastradas
                  </span>
                </div>

                <select
                  value={selectedAcademyForInbox}
                  onChange={(e) => setSelectedAcademyForInbox(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-red-500"
                >
                  {partnerAcademies.map((acad) => (
                    <option key={acad.id} value={acad.id}>
                      {acad.name} — {acad.city} ({acad.branch || 'Unidade Oficial'})
                    </option>
                  ))}
                </select>
              </div>

              {/* MURAL / INBOX DA ACADEMIA SELECIONADA */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span>
                    Mensagens e Anúncios recebidos por:{' '}
                    <strong className="text-white">{currentSelectedAcademy.name}</strong>
                  </span>
                  <span className="font-mono text-emerald-400 font-semibold">
                    {currentAcademyBroadcasts.length} comunicados recebidos
                  </span>
                </div>

                {currentAcademyBroadcasts.length === 0 ? (
                  <div className="p-10 rounded-3xl bg-slate-950 border border-dashed border-slate-800 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center mx-auto text-slate-500">
                      <MessageSquare size={22} />
                    </div>
                    <div className="text-xs text-slate-400 max-w-sm mx-auto">
                      Esta academia ainda não possui convocações em sua caixa. Volte à aba{' '}
                      <strong className="text-white">Competições</strong> e clique em{' '}
                      <span className="text-red-400 font-bold">"Enviar para Academias"</span> em qualquer torneio.
                    </div>
                    <button
                      onClick={handleRunTestSimulation}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold inline-flex items-center gap-2 transition"
                    >
                      <Play size={12} className="fill-white" />
                      <span>Simular Envio do Fortaleza Open</span>
                    </button>
                  </div>
                ) : (
                  currentAcademyBroadcasts.map((bcast) => (
                    <div
                      key={bcast.id}
                      className="p-4 sm:p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-3.5 shadow-xl relative overflow-hidden"
                    >
                      {/* ACCENT STRIP */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500" />

                      <div className="flex items-start justify-between gap-2 pt-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 uppercase">
                            {bcast.federation}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                            CONVOCAÇÃO OFICIAL
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                          <Clock size={11} /> {bcast.sentAt}
                        </span>
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                        {bcast.messageTitle}
                      </h4>

                      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
                        <p>{bcast.messageBody}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
                          <div>
                            <span className="text-slate-500">Local do Tatame:</span>{' '}
                            <span className="text-slate-200">{bcast.location}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Prazo de Inscrição:</span>{' '}
                            <span className="text-amber-400 font-bold">{bcast.registrationDeadline}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1">
                        <span className="text-[10px] text-slate-500">
                          Transmitido por: <strong className="text-slate-400">{bcast.broadcastBy}</strong>
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyMessage(bcast.messageBody, bcast.id)}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition border border-slate-800"
                          >
                            {copiedId === bcast.id ? (
                              <>
                                <Check size={12} className="text-emerald-400" />
                                <span className="text-emerald-400">Copiado!</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>Copiar para WhatsApp</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: LOGS DE TRANSMISSÃO & TESTES */}
          {activeTab === 'logs' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 sm:p-5 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span>Auditoria de Transmissões em Massa</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Histórico imutável de eventos disparados para a rede de academias cadastradas
                  </p>
                </div>

                <button
                  onClick={handleRunTestSimulation}
                  className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow"
                >
                  <Play size={12} className="fill-white" />
                  <span>Executar Teste de Disparo</span>
                </button>
              </div>

              {/* LISTA DE LOGS */}
              <div className="space-y-2.5">
                {broadcastLogs.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-3xl">
                    Nenhum disparo registrado ainda. Clique em "Executar Teste de Disparo" acima.
                  </div>
                ) : (
                  broadcastLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 text-xs space-y-2 font-mono"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold uppercase text-[10px]">
                          STATUS: {log.status}
                        </span>
                        <span className="text-slate-500 text-[11px]">{log.timestamp}</span>
                      </div>

                      <div className="text-white font-bold text-xs font-sans">
                        {log.logSummary}
                      </div>

                      <div className="text-[11px] text-slate-400 font-sans flex items-center gap-1.5 flex-wrap">
                        <span className="text-slate-500">Destinatários ({log.totalAcademies}):</span>
                        {log.targetAcademyNames.map((name, i) => (
                          <span
                            key={i}
                            className="bg-slate-900 text-slate-300 px-2 py-0.5 rounded text-[10px] border border-slate-800"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: GALERIA DE MEDALHAS (PRESERVADA) */}
          {activeTab === 'medals' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Medal Counters Summary */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-3 text-center">
                  <div className="text-2xl font-black text-amber-400">{goldCount}</div>
                  <div className="text-[10px] uppercase font-bold text-amber-300">Ouro 🥇</div>
                </div>
                <div className="bg-slate-800 border border-slate-600 rounded-2xl p-3 text-center">
                  <div className="text-2xl font-black text-slate-200">{silverCount}</div>
                  <div className="text-[10px] uppercase font-bold text-slate-300">Prata 🥈</div>
                </div>
                <div className="bg-amber-900/30 border border-amber-700/40 rounded-2xl p-3 text-center">
                  <div className="text-2xl font-black text-amber-600">{bronzeCount}</div>
                  <div className="text-[10px] uppercase font-bold text-amber-500">Bronze 🥉</div>
                </div>
              </div>

              {/* Medals List */}
              <div className="space-y-2.5">
                {medals.map((m) => (
                  <div
                    key={m.id}
                    className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex items-center gap-3"
                  >
                    <div className="text-2xl flex-shrink-0">
                      {m.medal === 'gold' && '🥇'}
                      {m.medal === 'silver' && '🥈'}
                      {m.medal === 'bronze' && '🥉'}
                    </div>

                    <img
                      src={m.athleteAvatar}
                      alt={m.athleteName}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-700 flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-white text-xs truncate">{m.athleteName}</h4>
                        <BeltBadge belt={m.belt} stripes={0} size="sm" />
                      </div>
                      <div className="text-[11px] text-slate-300 font-medium truncate">
                        {m.tournamentName} • {m.year}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{m.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
