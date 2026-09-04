import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, BookOpen, Plus, Flame, Award, Shield, Target, 
  TrendingUp, BarChart3, Star, Clock, Calendar, Users, 
  CheckCircle2, AlertTriangle, Sparkles, Filter, ChevronRight,
  Trash2, Edit3, Zap, Dumbbell, Trophy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SparringSession, SparringSubmission, BeltColor, StudentProfile } from '../../types';
import { BeltBadge } from './BeltBadge';

interface SparringJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: SparringSession[];
  onUpdateSessions: (sessions: SparringSession[]) => void;
  student: StudentProfile;
  onAnnounceVoice?: (title: string, body: string) => void;
}

const COMMON_TECHNIQUES = [
  'Triângulo',
  'Armlock',
  'Mata-Leão',
  'Kimura',
  'Guilhotina',
  'Americana',
  'Omoplata',
  'Chave de Pé / Botinha',
  'Katagatame',
  'Ezequiel',
  'Estrangulamento Cruzado',
  'Heel Hook (No-Gi)',
  'Anaconda Choke',
  'Darce Choke',
  'Gogoplata'
];

const POSITIONS: SparringSubmission['position'][] = [
  'Guarda Fechada',
  'Meia-Guarda',
  'Passagem',
  'Montada',
  'Costas',
  '100kg / Norte-Sul',
  'Outro'
];

export const SparringJournalModal: React.FC<SparringJournalModalProps> = ({
  isOpen,
  onClose,
  sessions,
  onUpdateSessions,
  student,
  onAnnounceVoice
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'history' | 'new_entry'>('analytics');
  const [giFilter, setGiFilter] = useState<'all' | 'Gi' | 'No-Gi'>('all');

  // Form State for New Sparring Session
  const [partnerName, setPartnerName] = useState('');
  const [partnerBelt, setPartnerBelt] = useState<BeltColor>('blue');
  const [sessionGiType, setSessionGiType] = useState<'Gi' | 'No-Gi'>('Gi');
  const [roundsCount, setRoundsCount] = useState<number>(4);
  const [durationMinutes, setDurationMinutes] = useState<number>(25);
  const [intensity, setIntensity] = useState<'Leve (Técnico)' | 'Moderado' | 'Guerra (Intenso)'>('Moderado');
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [notes, setNotes] = useState('');
  const [sweepsCount, setSweepsCount] = useState<number>(2);
  const [guardPassesCount, setGuardPassesCount] = useState<number>(1);
  const [takedownsCount, setTakedownsCount] = useState<number>(0);

  // Submissions Applied list
  const [appliedList, setAppliedList] = useState<SparringSubmission[]>([]);
  const [selectedAppliedTech, setSelectedAppliedTech] = useState(COMMON_TECHNIQUES[0]);
  const [selectedAppliedPos, setSelectedAppliedPos] = useState<SparringSubmission['position']>('Guarda Fechada');

  // Submissions Conceded list
  const [concededList, setConcededList] = useState<SparringSubmission[]>([]);
  const [selectedConcededTech, setSelectedConcededTech] = useState(COMMON_TECHNIQUES[1]);
  const [selectedConcededPos, setSelectedConcededPos] = useState<SparringSubmission['position']>('Passagem');

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      if (giFilter !== 'all' && s.giType !== giFilter) return false;
      return true;
    });
  }, [sessions, giFilter]);

  // Analytics Computation
  const analytics = useMemo(() => {
    const totalSessions = sessions.length;
    let totalRounds = 0;
    let totalMinutes = 0;
    let totalSweeps = 0;
    let totalPasses = 0;
    let totalTakedowns = 0;

    const appliedCounts: Record<string, number> = {};
    const concededCounts: Record<string, number> = {};
    const appliedPositions: Record<string, number> = {};
    const concededPositions: Record<string, number> = {};

    let totalApplied = 0;
    let totalConceded = 0;

    sessions.forEach(s => {
      totalRounds += s.roundsCount || 0;
      totalMinutes += s.durationMinutes || 0;
      totalSweeps += s.sweepsCount || 0;
      totalPasses += s.guardPassesCount || 0;
      totalTakedowns += s.takedownsCount || 0;

      s.submissionsApplied.forEach(sub => {
        totalApplied += sub.count;
        appliedCounts[sub.technique] = (appliedCounts[sub.technique] || 0) + sub.count;
        appliedPositions[sub.position] = (appliedPositions[sub.position] || 0) + sub.count;
      });

      s.submissionsConceded.forEach(con => {
        totalConceded += con.count;
        concededCounts[con.technique] = (concededCounts[con.technique] || 0) + con.count;
        concededPositions[con.position] = (concededPositions[con.position] || 0) + con.count;
      });
    });

    const ratio = (totalApplied + totalConceded) > 0 
      ? Math.round((totalApplied / (totalApplied + totalConceded)) * 100) 
      : 100;

    // Top applied technique
    const topAppliedList = Object.entries(appliedCounts)
      .map(([technique, count]) => ({ technique, count }))
      .sort((a, b) => b.count - a.count);

    // Top conceded technique (vulnerability)
    const topConcededList = Object.entries(concededCounts)
      .map(([technique, count]) => ({ technique, count }))
      .sort((a, b) => b.count - a.count);

    // Top attack position
    const topAttackPosition = Object.entries(appliedPositions)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Guarda Fechada';

    // Top danger position
    const topDangerPosition = Object.entries(concededPositions)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || '100kg / Norte-Sul';

    // Style profile classification
    let styleProfile = 'Lutador Completo';
    if (totalSweeps > totalPasses * 1.5) {
      styleProfile = 'Guardista Técnico';
    } else if (totalPasses > totalSweeps * 1.5) {
      styleProfile = 'Passador Agressivo';
    } else if (ratio >= 80) {
      styleProfile = 'Finalizador Rápido';
    }

    // AI Coach recommendation based on vulnerabilities
    let advice = 'Mantenha o foco em conectar raspagens diretas para a montada.';
    if (topConcededList.length > 0) {
      const worst = topConcededList[0].technique;
      advice = `Atenção na defesa de ${worst} a partir de ${topDangerPosition}. Mantenha cotovelos fechados colados às costelas e controle de pegadas.`;
    }

    return {
      totalSessions,
      totalRounds,
      totalMinutes,
      totalSweeps,
      totalPasses,
      totalTakedowns,
      totalApplied,
      totalConceded,
      ratio,
      topAppliedList,
      topConcededList,
      topAttackPosition,
      topDangerPosition,
      styleProfile,
      advice
    };
  }, [sessions]);

  // Add applied technique to draft
  const handleAddApplied = () => {
    setAppliedList(prev => [
      ...prev,
      {
        id: `app_${Date.now()}_${Math.random()}`,
        technique: selectedAppliedTech,
        position: selectedAppliedPos,
        count: 1
      }
    ]);
  };

  // Add conceded technique to draft
  const handleAddConceded = () => {
    setConcededList(prev => [
      ...prev,
      {
        id: `con_${Date.now()}_${Math.random()}`,
        technique: selectedConcededTech,
        position: selectedConcededPos,
        count: 1
      }
    ]);
  };

  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName.trim()) {
      alert('Por favor, informe o nome do parceiro de treino.');
      return;
    }

    const newSession: SparringSession = {
      id: `spar_${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      date: new Date().toLocaleDateString('pt-BR'),
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      trainingPartner: partnerName.trim(),
      partnerBelt,
      giType: sessionGiType,
      durationMinutes,
      roundsCount,
      intensity,
      submissionsApplied: appliedList,
      submissionsConceded: concededList,
      sweepsCount,
      guardPassesCount,
      takedownsCount,
      notes: notes.trim(),
      rating,
      createdAt: 'Agora mesmo'
    };

    const updated = [newSession, ...sessions];
    onUpdateSessions(updated);
    localStorage.setItem('bjj_sparring_sessions', JSON.stringify(updated));

    // Reset Form
    setPartnerName('');
    setNotes('');
    setAppliedList([]);
    setConcededList([]);
    setSweepsCount(2);
    setGuardPassesCount(1);
    setTakedownsCount(0);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });

    if (onAnnounceVoice) {
      onAnnounceVoice('Diário de Rola', 'Rola computado com sucesso no seu Raio-X Técnico!');
    }

    setActiveTab('analytics');
  };

  const handleDeleteSession = (sessionId: string) => {
    if (!confirm('Deseja realmente remover esta sessão do seu diário?')) return;
    const updated = sessions.filter(s => s.id !== sessionId);
    onUpdateSessions(updated);
    localStorage.setItem('bjj_sparring_sessions', JSON.stringify(updated));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-hidden animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-red-950/40 via-slate-900 to-blue-950/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Diário de Rola & Raio-X Técnico
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase tracking-wide">
                  Game Analysis
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Atleta: <strong>{student.name}</strong> • Registre seus treinos e descubra seus pontos fortes e vulnerabilidades
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 bg-slate-950/50 border-b border-slate-800/80">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === 'analytics'
                  ? 'bg-red-600 text-white shadow-md shadow-red-950'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Raio-X do Jogo</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === 'history'
                  ? 'bg-red-600 text-white shadow-md shadow-red-950'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Histórico ({sessions.length})</span>
            </button>
          </div>

          <button
            onClick={() => setActiveTab('new_entry')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'new_entry'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Registrar Rola</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 no-scrollbar">

          {/* 1. RAIO-X / ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <div className="space-y-4">
              {/* Profile Card & KPI Highlights */}
              <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <img 
                      src={student.avatar} 
                      alt={student.name}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-red-500" 
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">{student.name}</h3>
                        <BeltBadge belt={student.belt} stripes={student.stripes} size="sm" />
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-800/40">
                          {analytics.styleProfile}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {analytics.totalSessions} sessões computadas
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800">
                    <div className="text-center px-2">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Taxa Finalização</span>
                      <div className="text-lg font-black text-emerald-400">{analytics.ratio}%</div>
                    </div>
                    <div className="h-7 w-[1px] bg-slate-800" />
                    <div className="text-center px-2">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Rounds Lutados</span>
                      <div className="text-lg font-black text-white">{analytics.totalRounds}</div>
                    </div>
                    <div className="h-7 w-[1px] bg-slate-800" />
                    <div className="text-center px-2">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Minutos de Rola</span>
                      <div className="text-lg font-black text-amber-400">{analytics.totalMinutes}m</div>
                    </div>
                  </div>
                </div>

                {/* Submissions comparison bar */}
                <div className="mt-3 pt-1">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {analytics.totalApplied} Finalizações Aplicadas
                    </span>
                    <span className="text-red-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {analytics.totalConceded} Submissões Sofridas (Bateu)
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-red-950/80 overflow-hidden flex border border-slate-800">
                    <div 
                      style={{ width: `${analytics.ratio}%` }}
                      className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500" 
                    />
                  </div>
                </div>
              </div>

              {/* Scoring & Ground Work Grid */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Raspagens (Sweeps)</span>
                  <div className="text-2xl font-black text-white mt-0.5">{analytics.totalSweeps}</div>
                  <span className="text-[10px] text-cyan-400 font-medium">Reversões bem-sucedidas</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Passagens de Guarda</span>
                  <div className="text-2xl font-black text-white mt-0.5">{analytics.totalPasses}</div>
                  <span className="text-[10px] text-emerald-400 font-medium">Estabilização nos 100kg</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Quedas (Takedowns)</span>
                  <div className="text-2xl font-black text-white mt-0.5">{analytics.totalTakedowns}</div>
                  <span className="text-[10px] text-amber-400 font-medium">Luta em pé iniciada</span>
                </div>
              </div>

              {/* Strength vs Vulnerability Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Attack / Strengths */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <Target className="w-4 h-4" />
                      Arsenal Ofensivo (Top Finalizações)
                    </h4>
                    <span className="text-[10px] text-slate-400">Partida: {analytics.topAttackPosition}</span>
                  </div>

                  {analytics.topAppliedList.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">Nenhuma finalização registrada ainda.</p>
                  ) : (
                    <div className="space-y-2">
                      {analytics.topAppliedList.slice(0, 4).map((item, idx) => {
                        const pct = Math.round((item.count / analytics.totalApplied) * 100);
                        return (
                          <div key={item.technique} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="font-bold text-slate-200">
                                {idx + 1}. {item.technique}
                              </span>
                              <span className="text-emerald-400 font-semibold">{item.count}x ({pct}%)</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                              <div 
                                style={{ width: `${pct}%` }} 
                                className="h-full bg-emerald-500 rounded-full"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Vulnerabilities / Where you tapped */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-red-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                      <Shield className="w-4 h-4" />
                      Raio-X de Vulnerabilidades (Onde Bateu)
                    </h4>
                    <span className="text-[10px] text-slate-400">Atenção: {analytics.topDangerPosition}</span>
                  </div>

                  {analytics.topConcededList.length === 0 ? (
                    <p className="text-xs text-emerald-400 italic">Defesa impenetrável! Nenhuma submissão sofrida registrada.</p>
                  ) : (
                    <div className="space-y-2">
                      {analytics.topConcededList.slice(0, 4).map((item, idx) => {
                        const pct = Math.round((item.count / analytics.totalConceded) * 100);
                        return (
                          <div key={item.technique} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="font-bold text-slate-200">
                                {idx + 1}. {item.technique}
                              </span>
                              <span className="text-red-400 font-semibold">{item.count}x ({pct}%)</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                              <div 
                                style={{ width: `${pct}%` }} 
                                className="h-full bg-red-500 rounded-full"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* AI Coach Tactical Recommendation */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-800/40 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wide text-blue-300">
                    Recomendação Tática do AI Coach
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {analytics.advice}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. SESSIONS HISTORY TAB */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Histórico de Rolas Registrados
                </h3>

                {/* Gi Filter */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setGiFilter('all')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition ${
                      giFilter === 'all' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setGiFilter('Gi')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition ${
                      giFilter === 'Gi' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Gi (Kimono)
                  </button>
                  <button
                    onClick={() => setGiFilter('No-Gi')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition ${
                      giFilter === 'No-Gi' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    No-Gi
                  </button>
                </div>
              </div>

              {filteredSessions.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-slate-800">
                  <Dumbbell className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-white">Nenhum treino encontrado nesta categoria.</p>
                  <button
                    onClick={() => setActiveTab('new_entry')}
                    className="mt-3 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-500 transition"
                  >
                    Registrar Meu Primeiro Rola
                  </button>
                </div>
              ) : (
                filteredSessions.map(session => (
                  <div
                    key={session.id}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-slate-800 text-amber-400">
                          <Flame className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">
                              Rola com {session.trainingPartner}
                            </h4>
                            <BeltBadge belt={session.partnerBelt} stripes={0} size="sm" />
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {session.date} • {session.giType} • {session.durationMinutes} min ({session.roundsCount} rounds) • <strong className="text-slate-300">{session.intensity}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3.5 h-3.5 ${i < session.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} 
                            />
                          ))}
                        </div>

                        <button
                          onClick={() => handleDeleteSession(session.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 transition"
                          title="Remover sessão"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Applied / Conceded Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {session.submissionsApplied.map((sub, i) => (
                        <span 
                          key={i}
                          className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 flex items-center gap-1"
                        >
                          ⚡ {sub.technique} ({sub.position}) {sub.count > 1 ? `x${sub.count}` : ''}
                        </span>
                      ))}

                      {session.submissionsConceded.map((sub, i) => (
                        <span 
                          key={i}
                          className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-red-950/80 border border-red-700/60 text-red-300 flex items-center gap-1"
                        >
                          🛡️ Bateu: {sub.technique} ({sub.position})
                        </span>
                      ))}

                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-slate-950 border border-slate-800 text-slate-400">
                        {session.sweepsCount} Raspagens • {session.guardPassesCount} Passagens • {session.takedownsCount} Quedas
                      </span>
                    </div>

                    {session.notes && (
                      <p className="text-xs text-slate-300 italic pt-1 border-t border-slate-800/60">
                        "{session.notes}"
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* 3. NEW ENTRY FORM TAB */}
          {activeTab === 'new_entry' && (
            <form onSubmit={handleSaveSession} className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Flame className="w-4 h-4" /> Dados Gerais do Treino
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Parceiro(a) de Treino *
                    </label>
                    <input
                      type="text"
                      required
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      placeholder="Ex: Rodrigo Cavalo, Gabriel..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Faixa do Parceiro
                    </label>
                    <select
                      value={partnerBelt}
                      onChange={(e) => setPartnerBelt(e.target.value as BeltColor)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="white">Branca</option>
                      <option value="grey">Cinza / Infantil</option>
                      <option value="yellow">Amarela</option>
                      <option value="orange">Laranja</option>
                      <option value="green">Verde</option>
                      <option value="blue">Azul</option>
                      <option value="purple">Roxa</option>
                      <option value="brown">Marrom</option>
                      <option value="black">Preta</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Modalidade
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSessionGiType('Gi')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                          sessionGiType === 'Gi'
                            ? 'bg-red-600 text-white border-red-500'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        🥋 Gi (Kimono)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSessionGiType('No-Gi')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                          sessionGiType === 'No-Gi'
                            ? 'bg-red-600 text-white border-red-500'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        🩳 No-Gi
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Duração & Rounds
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        value={roundsCount}
                        onChange={(e) => setRoundsCount(Number(e.target.value))}
                        className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        placeholder="Rounds"
                      />
                      <span className="text-xs text-slate-500">rds</span>
                      <input
                        type="number"
                        min={1}
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(Number(e.target.value))}
                        className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        placeholder="Minutos"
                      />
                      <span className="text-xs text-slate-500">min</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Intensidade do Rola
                    </label>
                    <select
                      value={intensity}
                      onChange={(e) => setIntensity(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="Leve (Técnico)">Leve (Soltinho / Técnico)</option>
                      <option value="Moderado">Moderado (Treino Firme)</option>
                      <option value="Guerra (Intenso)">Guerra (Ritmo de Competição)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Sua Autoavaliação
                    </label>
                    <div className="flex items-center gap-1 py-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star as any)}
                          className="p-1 hover:scale-110 transition"
                        >
                          <Star 
                            className={`w-5 h-5 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submissions Section: Applied vs Conceded */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* 1. Submissions Applied */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-900/40 space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Finalizações que VOCÊ Aplicou
                  </h4>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedAppliedTech}
                      onChange={(e) => setSelectedAppliedTech(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                    >
                      {COMMON_TECHNIQUES.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>

                    <select
                      value={selectedAppliedPos}
                      onChange={(e) => setSelectedAppliedPos(e.target.value as any)}
                      className="w-32 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-white"
                    >
                      {POSITIONS.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={handleAddApplied}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                    >
                      + Add
                    </button>
                  </div>

                  {appliedList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {appliedList.map((item, idx) => (
                        <span
                          key={item.id}
                          className="px-2 py-1 rounded-lg text-xs bg-emerald-950 border border-emerald-700 text-emerald-300 flex items-center gap-1"
                        >
                          {item.technique} ({item.position})
                          <button
                            type="button"
                            onClick={() => setAppliedList(prev => prev.filter((_, i) => i !== idx))}
                            className="hover:text-white"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Submissions Conceded */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-red-900/40 space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> Golpes que VOCÊ Bateu (Sofridas)
                  </h4>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedConcededTech}
                      onChange={(e) => setSelectedConcededTech(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                    >
                      {COMMON_TECHNIQUES.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>

                    <select
                      value={selectedConcededPos}
                      onChange={(e) => setSelectedConcededPos(e.target.value as any)}
                      className="w-32 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-white"
                    >
                      {POSITIONS.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={handleAddConceded}
                      className="px-2.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
                    >
                      + Add
                    </button>
                  </div>

                  {concededList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {concededList.map((item, idx) => (
                        <span
                          key={item.id}
                          className="px-2 py-1 rounded-lg text-xs bg-red-950 border border-red-700 text-red-300 flex items-center gap-1"
                        >
                          {item.technique} ({item.position})
                          <button
                            type="button"
                            onClick={() => setConcededList(prev => prev.filter((_, i) => i !== idx))}
                            className="hover:text-white"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sweeps, Passes and Takedowns */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Transições & Pontuações Conquistadas
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Raspagens
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={sweepsCount}
                      onChange={(e) => setSweepsCount(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Passagens de Guarda
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={guardPassesCount}
                      onChange={(e) => setGuardPassesCount(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Quedas (Takedowns)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={takedownsCount}
                      onChange={(e) => setTakedownsCount(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Notas Técnicas do Dia (O que você sentiu no rola?)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Consegui defender bem a guarda laçada, mas cansei nos minutos finais e tomei um armlock..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('analytics')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs shadow-lg shadow-red-950 transition"
                >
                  Salvar Rola no Diário
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
