import React, { useState } from 'react';
import { Clock, Calendar, CheckCircle2, XCircle, MapPin, Phone, ShieldCheck, Sparkles, X, Users, Sun, Moon, Coffee } from 'lucide-react';
import { RegisteredAcademy, AcademyOperatingDay } from '../../types';
import { loyaltyOfficialScheduleGroups, loyaltyOfficialKidsSchedule, loyaltyOfficialOperatingHours } from '../../data/mockData';

interface AcademyOperatingHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  academy: RegisteredAcademy;
  onUpdateOperatingHours?: (updatedHours: AcademyOperatingDay[]) => void;
}

export const AcademyOperatingHoursModal: React.FC<AcademyOperatingHoursModalProps> = ({
  isOpen,
  onClose,
  academy,
}) => {
  if (!isOpen) return null;

  const isLoyaltyAcademy = academy.id === 'acad_loyalty_jiujitsu' || academy.name?.toLowerCase().includes('loyalty');
  const [activeTab, setActiveTab] = useState<'grade_oficial' | 'turmas_kids' | 'dia_a_dia'>('grade_oficial');

  const hours: AcademyOperatingDay[] = isLoyaltyAcademy
    ? loyaltyOfficialOperatingHours
    : (academy.operatingHours && academy.operatingHours.length > 0
      ? academy.operatingHours
      : [
          { dayOfWeek: 'segunda', dayLabel: 'segunda-feira', isOpen: true, slots: ['07:00–08:00', '12:00–13:00', '16:00–21:30'] },
          { dayOfWeek: 'terca', dayLabel: 'terça-feira', isOpen: true, slots: ['12:00–13:00', '18:00–21:30'] },
          { dayOfWeek: 'quarta', dayLabel: 'quarta-feira', isOpen: true, slots: ['07:00–08:00', '12:00–13:00', '16:00–21:30'] },
          { dayOfWeek: 'quinta', dayLabel: 'quinta-feira', isOpen: true, slots: ['12:00–13:00', '18:00–21:30'] },
          { dayOfWeek: 'sexta', dayLabel: 'sexta-feira', isOpen: true, slots: ['07:00–08:00', '12:00–13:00', '16:00–21:30'] },
          { dayOfWeek: 'sabado', dayLabel: 'sábado', isOpen: false, slots: [] },
          { dayOfWeek: 'domingo', dayLabel: 'domingo', isOpen: false, slots: [] }
        ]);

  // Helper to determine today's status
  const todayDayMap: Record<number, string> = {
    0: 'domingo',
    1: 'segunda',
    2: 'terca',
    3: 'quarta',
    4: 'quinta',
    5: 'sexta',
    6: 'sabado'
  };
  const todayKey = todayDayMap[new Date().getDay()];
  const todaySchedule = hours.find(h => h.dayOfWeek === todayKey);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-amber-500/40 shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 border-b border-slate-800 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-red-600/20 border border-amber-500/40 flex items-center justify-center shadow-md">
              <Clock className="w-6 h-6 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                  {isLoyaltyAcademy ? 'Nova Grade Oficial Atualizada' : 'Horário Oficial de Treinos'}
                </span>
                <span className="text-[10px] text-slate-400 font-bold">MM XXIII</span>
              </div>
              <h2 className="text-lg font-black text-white leading-tight mt-0.5">
                {academy.name}
              </h2>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                <span>{academy.branch || 'Matriz Oficial • CE'} • {academy.city}, {academy.state || 'CE'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current status banner */}
        <div className="px-5 py-3 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              {todaySchedule?.isOpen ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-500"></span>
              )}
            </span>
            <span className="text-xs font-bold text-slate-200">
              Hoje ({todaySchedule?.dayLabel}):{' '}
              {todaySchedule?.isOpen ? (
                <strong className="text-emerald-400">Tatame Aberto</strong>
              ) : (
                <span className="text-slate-400">Fechado</span>
              )}
            </span>
          </div>

          {todaySchedule?.isOpen && todaySchedule.slots.length > 0 && (
            <span className="text-[11px] text-amber-300 font-mono font-semibold">
              {todaySchedule.slots.length} horários hoje
            </span>
          )}
        </div>

        {/* Tabs de navegação (Especialmente ricas para Loyalty Jiu-Jitsu) */}
        {isLoyaltyAcademy && (
          <div className="px-5 pt-3 pb-2 bg-slate-950/60 border-b border-slate-800/70 flex gap-2 overflow-x-auto shrink-0">
            <button
              onClick={() => setActiveTab('grade_oficial')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'grade_oficial'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Grade Oficial (Adulto & Kids)</span>
            </button>
            <button
              onClick={() => setActiveTab('turmas_kids')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'turmas_kids'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Turmas Infantis (Kids)</span>
            </button>
            <button
              onClick={() => setActiveTab('dia_a_dia')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'dia_a_dia'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Visão Dia a Dia</span>
            </button>
          </div>
        )}

        {/* Conteúdo Principal */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* TAB 1: GRADE OFICIAL LOYALTY (ADULTO & KIDS) */}
          {isLoyaltyAcademy && activeTab === 'grade_oficial' && (
            <div className="space-y-4">
              {loyaltyOfficialScheduleGroups.map((group, gIdx) => (
                <div
                  key={gIdx}
                  className="rounded-2xl bg-slate-950/80 border border-slate-800/90 overflow-hidden shadow-sm"
                >
                  <div className="px-4 py-2.5 bg-gradient-to-r from-amber-950/40 to-slate-900 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      <h3 className="text-xs font-black text-amber-300 uppercase tracking-wider">
                        {group.groupName}
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-850 px-2 py-0.5 rounded-md border border-slate-750">
                      {group.classes.length} aulas
                    </span>
                  </div>

                  <div className="p-3 divide-y divide-slate-850/80">
                    {group.classes.map((cls, cIdx) => (
                      <div
                        key={cIdx}
                        className="py-2 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-750 font-mono text-xs font-black text-amber-400 min-w-[58px] text-center shadow-xs">
                            {cls.time}
                          </span>
                          <div>
                            <span className="font-bold text-white block">
                              {cls.title}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {cls.modality}
                            </span>
                          </div>
                        </div>

                        {cls.tag && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                              cls.tag === 'Infantil'
                                ? 'bg-purple-950/80 text-purple-300 border-purple-800/60'
                                : cls.tag === 'Horário de Almoço'
                                ? 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                                : cls.tag === 'Noite'
                                ? 'bg-blue-950/80 text-blue-300 border-blue-800/60'
                                : 'bg-slate-850 text-slate-300 border-slate-700'
                            }`}
                          >
                            {cls.tag}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Box Rápido de Turmas Infantis */}
              <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-900/40 flex items-start gap-3">
                <Users className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <span className="font-black text-purple-300 uppercase text-[11px] tracking-wider block">
                    Turmas Infantis (Kids)
                  </span>
                  <div className="text-[11px] text-slate-300 space-y-0.5">
                    <div>• <strong>Kids 1:</strong> Segunda e Quarta às 18:00</div>
                    <div>• <strong>Kids 2:</strong> Terça, Quinta e Sexta às 18:00</div>
                    <div>• <strong>Kids 3:</strong> Terça e Quinta às 19:00</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TURMAS INFANTIS (KIDS) DETALHADAS */}
          {isLoyaltyAcademy && activeTab === 'turmas_kids' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-amber-950/30 border border-purple-900/50">
                <span className="text-[10px] font-black uppercase text-purple-400 tracking-wider block">
                  Metodologia Infantojuvenil Loyalty
                </span>
                <h3 className="text-sm font-black text-white mt-0.5">
                  Turmas Infantis Divididas por Nível & Idade
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Desenvolvimento psicomotor, disciplina, combate ao bullying e respeito ao próximo dentro e fora do tatame.
                </p>
              </div>

              {loyaltyOfficialKidsSchedule.map((kid, kIdx) => (
                <div
                  key={kIdx}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center font-black text-purple-300 text-sm">
                      {kIdx + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white flex items-center gap-2">
                        <span>{kid.turma}</span>
                        {kid.faixaEtaria && (
                          <span className="text-[10px] font-normal text-slate-400 bg-slate-850 px-2 py-0.5 rounded-md border border-slate-750">
                            {kid.faixaEtaria}
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {kid.dias}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-3 py-1.5 rounded-xl bg-purple-900/40 border border-purple-700/60 font-mono text-xs font-black text-purple-300 inline-block shadow-xs">
                      {kid.horario}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3 OU VIEW PADRÃO PARA OUTRAS ACADEMIAS: VISÃO DIA A DIA */}
          {(!isLoyaltyAcademy || activeTab === 'dia_a_dia') && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                <span className="font-semibold uppercase text-[10px] tracking-wider">Dia da Semana</span>
                <span className="font-semibold uppercase text-[10px] tracking-wider">Horários das Turmas</span>
              </div>

              {hours.map((item) => {
                const isToday = item.dayOfWeek === todayKey;

                return (
                  <div
                    key={item.dayOfWeek}
                    className={`p-3.5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                      isToday
                        ? 'bg-slate-850 border-amber-500/60 shadow-lg shadow-amber-950/20 ring-1 ring-amber-500/30'
                        : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-[130px]">
                      {item.isOpen ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-800/60 border border-slate-700/60 flex items-center justify-center shrink-0">
                          <XCircle className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                      )}

                      <div>
                        <span className={`text-xs font-black capitalize block leading-tight ${
                          isToday ? 'text-amber-300' : 'text-slate-200'
                        }`}>
                          {item.dayLabel}
                        </span>
                        {isToday && (
                          <span className="text-[9px] font-black uppercase text-amber-400 bg-amber-500/10 px-1 rounded">
                            Hoje
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 flex flex-wrap items-center justify-start sm:justify-end gap-1.5">
                      {item.isOpen && item.slots.length > 0 ? (
                        item.slots.map((slot, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-750 text-white font-mono text-xs font-bold shadow-xs"
                          >
                            {slot}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs font-bold text-slate-500 italic px-2 py-0.5">
                          Fechado
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick info note */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-slate-300">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-amber-300 block">
                {isLoyaltyAcademy ? 'Grade Oficial Loyalty Jiu-Jitsu (MM XXIII)' : 'Horários Oficiais de Tatame'}
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {isLoyaltyAcademy
                  ? 'Grade balanceada entre No-Gi matinal e vespertino, Gi tradicional com kimono e turmas infantis direcionadas por faixa etária. Acesso liberado conforme plano ativo do aluno.'
                  : 'Grade com aulas matinais, treino executivo ao meio-dia e período noturno para adultos e competição.'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Phone className="w-3.5 h-3.5 text-slate-500" />
            <span>Contato: <strong className="text-slate-300">{academy.phone || '(85) 98765-4321'}</strong></span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs shadow-md transition"
          >
            Entendido, Oss!
          </button>
        </div>

      </div>
    </div>
  );
};

