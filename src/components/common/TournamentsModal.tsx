import React, { useState } from 'react';
import { 
  X, Trophy, Medal, Calendar, MapPin, Users, 
  ExternalLink, Check, Award, Flame, Sparkles
} from 'lucide-react';
import { TournamentItem, TeamMedal } from '../../types';
import { mockTournaments, mockTeamMedals } from '../../data/mockData';
import { BeltBadge } from './BeltBadge';

interface TournamentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TournamentsModal: React.FC<TournamentsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'medals'>('calendar');
  const [tournaments, setTournaments] = useState<TournamentItem[]>(mockTournaments);
  const [medals] = useState<TeamMedal[]>(mockTeamMedals);
  const [enrolledMap, setEnrolledMap] = useState<Record<string, boolean>>({
    tourn_1: true // Lucas already confirmed for Brasileiro
  });

  if (!isOpen) return null;

  const toggleEnroll = (id: string) => {
    setEnrolledMap(prev => {
      const current = !!prev[id];
      const next = !current;
      // Update count
      setTournaments(list => list.map(t => {
        if (t.id === id) {
          return { ...t, enrolledAcademyCount: t.enrolledAcademyCount + (next ? 1 : -1) };
        }
        return t;
      }));
      return { ...prev, [id]: next };
    });
  };

  const goldCount = medals.filter(m => m.medal === 'gold').length;
  const silverCount = medals.filter(m => m.medal === 'silver').length;
  const bronzeCount = medals.filter(m => m.medal === 'bronze').length;

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col justify-end sm:justify-center items-center sm:p-4"
      id="modal-tournaments-hall"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-2xl h-[92vh] sm:h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Trophy size={20} />
            </div>
            <div>
              <h2 className="font-bold text-white text-base leading-tight">
                Mural de Campeonatos & Conquistas
              </h2>
              <p className="text-xs text-slate-400">
                Calendário de Torneios & Quadro de Medalhas da Academia
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'calendar' 
                ? 'bg-red-600 text-white shadow' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar size={14} /> Próximos Campeonatos
          </button>
          <button
            onClick={() => setActiveTab('medals')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'medals' 
                ? 'bg-red-600 text-white shadow' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Medal size={14} /> Galeria de Medalhas ({medals.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeTab === 'calendar' ? (
            /* Tournaments Calendar */
            <div className="space-y-3">
              {tournaments.map((t) => {
                const isEnrolled = !!enrolledMap[t.id];
                return (
                  <div 
                    key={t.id}
                    className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 uppercase">
                            {t.federation}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {t.date}
                          </span>
                        </div>
                        <h3 className="font-bold text-white text-sm leading-snug">
                          {t.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                          <MapPin size={13} className="text-red-400" />
                          <span>{t.location}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1">
                          <Users size={12} className="text-cyan-400" />
                          {t.enrolledAcademyCount} atletas inscritos
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-400">
                      {t.categories.map((cat, i) => (
                        <span key={i} className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {cat}
                        </span>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        Inscrições até: <strong className="text-slate-200">{t.registrationDeadline}</strong>
                      </span>

                      <button
                        onClick={() => toggleEnroll(t.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          isEnrolled 
                            ? 'bg-emerald-600 text-white shadow-md' 
                            : 'bg-red-600 hover:bg-red-500 text-white'
                        }`}
                      >
                        {isEnrolled ? (
                          <><Check size={14} /> Minha Inscrição Confirmada</>
                        ) : (
                          <>Quero Competir</>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Team Medals Hall */
            <div className="space-y-4">
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
                    className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-3 flex items-center gap-3"
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
                        <h4 className="font-bold text-white text-xs truncate">
                          {m.athleteName}
                        </h4>
                        <BeltBadge belt={m.belt} stripes={0} size="sm" />
                      </div>
                      <div className="text-[11px] text-slate-300 font-medium truncate">
                        {m.tournamentName} • {m.year}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {m.category}
                      </div>
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
