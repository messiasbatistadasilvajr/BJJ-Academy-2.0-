import React, { useState } from 'react';
import { 
  Clock, Calendar, CheckCircle2, XCircle, MapPin, Phone, 
  Sparkles, X, Users, MessageCircle, Instagram, ShieldCheck, Share2, Layers
} from 'lucide-react';
import { RegisteredAcademy, AcademyOperatingDay } from '../../types';
import { 
  loyaltyOfficialAdultSchedule, 
  loyaltyOfficialKidsTatame01, 
  loyaltyOfficialKidsTatame02, 
  loyaltyOfficialOperatingHours 
} from '../../data/mockData';

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
  const [activeTab, setActiveTab] = useState<'adultos' | 'kids' | 'professores' | 'dia_a_dia'>('adultos');

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-fadeIn select-none">
      <div className="w-full max-w-2xl rounded-3xl bg-black border border-white/20 shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[96vh]">
        
        {/* Navigation / Action Bar */}
        <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between gap-2 shrink-0">
          {/* Tabs */}
          {isLoyaltyAcademy ? (
            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab('adultos')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'adultos'
                    ? 'bg-white text-black shadow'
                    : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                <span>🥋 Adultos</span>
              </button>
              <button
                onClick={() => setActiveTab('kids')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'kids'
                    ? 'bg-white text-black shadow'
                    : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                <span>🧒 Kids</span>
              </button>
              <button
                onClick={() => setActiveTab('professores')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'professores'
                    ? 'bg-amber-400 text-black shadow font-black'
                    : 'bg-zinc-900 text-amber-300 hover:bg-zinc-800'
                }`}
              >
                <span>👨‍🏫 Professores</span>
              </button>
              <button
                onClick={() => setActiveTab('dia_a_dia')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'dia_a_dia'
                    ? 'bg-white text-black shadow'
                    : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Dia a Dia</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-sm text-white">{academy.name}</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto flex-1 p-3 sm:p-6 bg-black relative">
          
          {/* Subtle smoke vignette background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 via-black to-black pointer-events-none" />

          {/* ============================================================== */}
          {/* 1. POSTER OFICIAL: GRADE DE TREINOS ADULTOS                    */}
          {/* Idêntico à imagem IMG-20260930-WA0185.jpg                      */}
          {/* ============================================================== */}
          {isLoyaltyAcademy && activeTab === 'adultos' && (
            <div className="relative z-10 max-w-lg mx-auto space-y-4 py-2">
              {/* Header Logo */}
              <div className="flex flex-col items-center justify-center text-center space-y-2">
                <div className="w-20 h-20 rounded-full border-2 border-white flex items-center justify-center overflow-hidden bg-black p-1 shadow-lg shadow-white/5">
                  <img
                    src="/loyalty_logo.jpg"
                    alt="Loyalty Jiu-Jitsu MM XXIII"
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      // Fallback visual com estilização circular idêntica
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="text-[10px] font-black text-white text-center leading-tight">
                    LOYALTY<br/>
                    <span className="text-base font-black">LT</span><br/>
                    MM XXIII
                  </div>
                </div>

                {/* Title and Category */}
                <div className="space-y-1">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-[0.08em] uppercase">
                    GRADE DE TREINOS
                  </h1>
                  <div className="flex items-center justify-center gap-3 pt-1">
                    <div className="h-[1.5px] bg-white w-14 sm:w-20 opacity-80" />
                    <span className="text-xs sm:text-sm font-black text-white tracking-[0.45em] uppercase">
                      A D U L T O S
                    </span>
                    <div className="h-[1.5px] bg-white w-14 sm:w-20 opacity-80" />
                  </div>
                </div>
              </div>

              {/* Adult Table */}
              <div className="pt-2">
                <div className="grid grid-cols-12 pb-2 border-b border-white text-white font-black text-[11px] sm:text-xs tracking-wider uppercase">
                  <div className="col-span-3 text-left">HORÁRIO</div>
                  <div className="col-span-6 text-left">MODALIDADE E NÍVEL</div>
                  <div className="col-span-3 text-right">DIAS</div>
                </div>

                <div className="divide-y divide-white/20">
                  {loyaltyOfficialAdultSchedule.map((row, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 py-3 sm:py-3.5 items-center hover:bg-white/[0.04] transition-colors"
                    >
                      {/* Horário */}
                      <div className="col-span-3 text-left">
                        <span className="text-lg sm:text-2xl font-black text-white font-mono tracking-tight">
                          {row.time}
                        </span>
                      </div>

                      {/* Modalidade e Nível + Professor */}
                      <div className="col-span-6 text-left pr-2">
                        <div className="text-sm sm:text-base font-black text-white leading-tight">
                          {row.modality}
                        </div>
                        {row.level && (
                          <div className="text-[11px] sm:text-xs text-slate-300 font-medium mt-0.5 leading-snug">
                            {row.level}
                          </div>
                        )}
                        {row.instructor && (
                          <div className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] sm:text-xs font-black">
                            <span>🥋 {row.instructor}</span>
                          </div>
                        )}
                      </div>

                      {/* Dias */}
                      <div className="col-span-3 text-right">
                        <span className="text-[10px] sm:text-xs font-black text-white uppercase tracking-wider block">
                          {row.days}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Poster Footer (WhatsApp & Instagram) */}
              <div className="pt-4 border-t border-white/30 flex items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-white font-bold">
                <a
                  href="https://wa.me/5585991362789"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>(85) 9-9136-2789</span>
                </a>
                <span className="text-white/40">|</span>
                <a
                  href="https://instagram.com/loyaltyjiujitsu"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-pink-400 transition-colors"
                >
                  <Instagram className="w-4 h-4 text-pink-400" />
                  <span>@loyaltyjiujitsu</span>
                </a>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 2. POSTER OFICIAL: GRADE DE TREINOS KIDS                       */}
          {/* Idêntico à imagem IMG-20260930-WA0186.jpg                      */}
          {/* ============================================================== */}
          {isLoyaltyAcademy && activeTab === 'kids' && (
            <div className="relative z-10 max-w-lg mx-auto space-y-4 py-2">
              {/* Header Logo */}
              <div className="flex flex-col items-center justify-center text-center space-y-2">
                <div className="w-20 h-20 rounded-full border-2 border-white flex items-center justify-center overflow-hidden bg-black p-1 shadow-lg shadow-white/5">
                  <img
                    src="/loyalty_logo.jpg"
                    alt="Loyalty Jiu-Jitsu MM XXIII"
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="text-[10px] font-black text-white text-center leading-tight">
                    LOYALTY<br/>
                    <span className="text-base font-black">LT</span><br/>
                    MM XXIII
                  </div>
                </div>

                {/* Title and Category */}
                <div className="space-y-1">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-[0.08em] uppercase">
                    GRADE DE TREINOS
                  </h1>
                  <div className="flex items-center justify-center gap-3 pt-1">
                    <div className="h-[1.5px] bg-white w-14 sm:w-20 opacity-80" />
                    <span className="text-xs sm:text-sm font-black text-white tracking-[0.45em] uppercase">
                      K I D S
                    </span>
                    <div className="h-[1.5px] bg-white w-14 sm:w-20 opacity-80" />
                  </div>
                </div>
              </div>

              {/* SEÇÃO 1: TATAME 01 */}
              <div className="space-y-2 pt-1">
                {/* Tatame 01 Header Divider */}
                <div className="flex items-center justify-center gap-3 py-1">
                  <div className="h-[1.5px] bg-white flex-1 max-w-[100px] sm:max-w-[130px]" />
                  <span className="text-xs sm:text-sm font-black text-white tracking-[0.3em] uppercase">
                    T A T A M E &nbsp; 0 1
                  </span>
                  <div className="h-[1.5px] bg-white flex-1 max-w-[100px] sm:max-w-[130px]" />
                </div>

                {/* Table Tatame 01 */}
                <div>
                  <div className="grid grid-cols-12 pb-2 border-b border-white text-white font-black text-[11px] sm:text-xs tracking-wider uppercase">
                    <div className="col-span-3 text-left">HORÁRIO</div>
                    <div className="col-span-6 text-left">TURMA / IDADE</div>
                    <div className="col-span-3 text-right">DIAS</div>
                  </div>

                  <div className="divide-y divide-white/20">
                    {loyaltyOfficialKidsTatame01.map((row, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-12 py-2.5 sm:py-3 items-center hover:bg-white/[0.04] transition-colors"
                      >
                        {/* Horário */}
                        <div className="col-span-3 text-left">
                          <span className="text-lg sm:text-2xl font-black text-white font-mono tracking-tight">
                            {row.time}
                          </span>
                        </div>

                        {/* Turma / Idade */}
                        <div className="col-span-6 text-left pr-2">
                          <div className="text-sm sm:text-base font-black text-white leading-tight">
                            {row.turma}
                          </div>
                          <div className="text-[11px] sm:text-xs text-slate-300 font-medium mt-0.5">
                            {row.ageGroup}
                          </div>
                        </div>

                        {/* Dias */}
                        <div className="col-span-3 text-right">
                          <span className="text-[10px] sm:text-xs font-black text-white uppercase tracking-wider block">
                            {row.days}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SEÇÃO 2: TATAME 02 */}
              <div className="space-y-2 pt-3">
                {/* Tatame 02 Header Divider */}
                <div className="flex items-center justify-center gap-3 py-1">
                  <div className="h-[1.5px] bg-white flex-1 max-w-[100px] sm:max-w-[130px]" />
                  <span className="text-xs sm:text-sm font-black text-white tracking-[0.3em] uppercase">
                    T A T A M E &nbsp; 0 2
                  </span>
                  <div className="h-[1.5px] bg-white flex-1 max-w-[100px] sm:max-w-[130px]" />
                </div>

                {/* Table Tatame 02 */}
                <div>
                  <div className="grid grid-cols-12 pb-2 border-b border-white text-white font-black text-[11px] sm:text-xs tracking-wider uppercase">
                    <div className="col-span-3 text-left">HORÁRIO</div>
                    <div className="col-span-6 text-left">TURMA / IDADE</div>
                    <div className="col-span-3 text-right">DIAS</div>
                  </div>

                  <div className="divide-y divide-white/20">
                    {loyaltyOfficialKidsTatame02.map((row, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-12 py-2.5 sm:py-3 items-center hover:bg-white/[0.04] transition-colors"
                      >
                        {/* Horário */}
                        <div className="col-span-3 text-left">
                          <span className="text-lg sm:text-2xl font-black text-white font-mono tracking-tight">
                            {row.time}
                          </span>
                        </div>

                        {/* Turma / Idade */}
                        <div className="col-span-6 text-left pr-2">
                          <div className="text-sm sm:text-base font-black text-white leading-tight">
                            {row.turma}
                          </div>
                          <div className="text-[11px] sm:text-xs text-slate-300 font-medium mt-0.5">
                            {row.ageGroup}
                          </div>
                          {row.isCompetitionTeam && (
                            <div className="text-[9px] sm:text-[10px] font-black text-amber-400 tracking-wider uppercase mt-0.5">
                              TIME DE COMPETIÇÃO
                            </div>
                          )}
                        </div>

                        {/* Dias */}
                        <div className="col-span-3 text-right">
                          <span className="text-[10px] sm:text-xs font-black text-white uppercase tracking-wider block">
                            {row.days}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Poster Footer (WhatsApp & Instagram) */}
              <div className="pt-4 border-t border-white/30 flex items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-white font-bold">
                <a
                  href="https://wa.me/5585991362789"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>(85) 9-9136-2789</span>
                </a>
                <span className="text-white/40">|</span>
                <a
                  href="https://instagram.com/loyaltyjiujitsu"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-pink-400 transition-colors"
                >
                  <Instagram className="w-4 h-4 text-pink-400" />
                  <span>@loyaltyjiujitsu</span>
                </a>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 3. QUADRO OFICIAL: PROFESSORES LOYALTY JIU-JITSU               */}
          {/* Corpo docente e horários de aula discriminados                 */}
          {/* ============================================================== */}
          {isLoyaltyAcademy && activeTab === 'professores' && (
            <div className="relative z-10 max-w-lg mx-auto space-y-4 py-2">
              <div className="flex flex-col items-center justify-center text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-wider">
                  <span>🥋 Corpo Docente Oficial</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase">
                  Professores & Horários
                </h2>
                <p className="text-xs text-zinc-400">
                  Grade de instrutores responsáveis pelo tatame • Loyalty Jiu-Jitsu
                </p>
              </div>

              {/* Professores Grid */}
              <div className="space-y-3 pt-2">
                {/* 1. Prof. Pedro Erick */}
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-amber-500/30 hover:border-amber-400/60 transition shadow-lg">
                  <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-black text-amber-300 text-base">
                        PE
                      </div>
                      <div>
                        <h4 className="font-black text-white text-sm sm:text-base leading-tight">
                          Professor: Pedro Erick
                        </h4>
                        <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                          Instrutor Oficial • No-Gi & Luta-Livre
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] sm:text-xs font-bold">
                      Seg a Sex
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between bg-zinc-900/80 px-2.5 py-1.5 rounded-lg border border-zinc-850">
                      <span className="text-zinc-300 font-medium">Dias de Aula:</span>
                      <strong className="text-white">Segunda a Sexta-feira</strong>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                      <div className="bg-zinc-900 px-2.5 py-1.5 rounded-lg border border-zinc-800">
                        <span className="text-[10px] text-zinc-400 block font-mono">07:00hs</span>
                        <strong className="text-white text-xs">No-gi</strong>
                      </div>
                      <div className="bg-zinc-900 px-2.5 py-1.5 rounded-lg border border-zinc-800">
                        <span className="text-[10px] text-zinc-400 block font-mono">16:00hs</span>
                        <strong className="text-amber-300 text-xs">Luta-Livre</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Prof. Anilton */}
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-amber-500/30 hover:border-amber-400/60 transition shadow-lg">
                  <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center font-black text-blue-300 text-base">
                        AN
                      </div>
                      <div>
                        <h4 className="font-black text-white text-sm sm:text-base leading-tight">
                          Professor: Anilton
                        </h4>
                        <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                          Instrutor Oficial • Gi & No-Gi
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] sm:text-xs font-bold">
                      Seg a Sex
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between bg-zinc-900/80 px-2.5 py-1.5 rounded-lg border border-zinc-850">
                      <span className="text-zinc-300 font-medium">Dias de Aula:</span>
                      <strong className="text-white">Segunda a Sexta-feira</strong>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                      <div className="bg-zinc-900 px-2.5 py-1.5 rounded-lg border border-zinc-800">
                        <span className="text-[10px] text-zinc-400 block font-mono">11:00hs</span>
                        <strong className="text-white text-xs">Gi (Com Kimono)</strong>
                      </div>
                      <div className="bg-zinc-900 px-2.5 py-1.5 rounded-lg border border-zinc-800">
                        <span className="text-[10px] text-zinc-400 block font-mono">12:00hs</span>
                        <strong className="text-white text-xs">No-gi (Sem Kimono)</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Prof. Dudu */}
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-amber-500/30 hover:border-amber-400/60 transition shadow-lg">
                  <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-black text-emerald-300 text-base">
                        DU
                      </div>
                      <div>
                        <h4 className="font-black text-white text-sm sm:text-base leading-tight">
                          Professor: Dudu
                        </h4>
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                          Instrutor Oficial • Gi
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] sm:text-xs font-bold">
                      Seg / Qua / Sex
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between bg-zinc-900/80 px-2.5 py-1.5 rounded-lg border border-zinc-850">
                      <span className="text-zinc-300 font-medium">Dias de Aula:</span>
                      <strong className="text-white">Segunda, Quarta e Sexta-feira</strong>
                    </div>
                    <div className="bg-zinc-900 px-2.5 py-1.5 rounded-lg border border-zinc-800 flex items-center justify-between">
                      <span className="text-zinc-300">Horário:</span>
                      <span className="font-mono font-bold text-white text-sm">15:00hs</span>
                    </div>
                  </div>
                </div>

                {/* 4. Prof. Emanuel (Badel) */}
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-amber-500/30 hover:border-amber-400/60 transition shadow-lg">
                  <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center font-black text-purple-300 text-base">
                        EB
                      </div>
                      <div>
                        <h4 className="font-black text-white text-sm sm:text-base leading-tight">
                          Professor: Emanuel (Badel)
                        </h4>
                        <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">
                          Instrutor Oficial • Adulto e Juvenil
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] sm:text-xs font-bold">
                      Seg / Qua / Sex
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between bg-zinc-900/80 px-2.5 py-1.5 rounded-lg border border-zinc-850">
                      <span className="text-zinc-300 font-medium">Dias de Aula:</span>
                      <strong className="text-white">Segunda, Quarta e Sexta-feira</strong>
                    </div>
                    <div className="bg-zinc-900 px-2.5 py-1.5 rounded-lg border border-zinc-800 flex items-center justify-between">
                      <div>
                        <span className="text-zinc-300 block">Horário:</span>
                        <span className="text-[11px] text-purple-300 font-medium">Gi • Adulto e Juvenil</span>
                      </div>
                      <span className="font-mono font-bold text-white text-sm">19:00hs</span>
                    </div>
                  </div>
                </div>

                {/* 5. Prof. Anderson */}
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-amber-500/30 hover:border-amber-400/60 transition shadow-lg">
                  <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center font-black text-red-300 text-base">
                        AD
                      </div>
                      <div>
                        <h4 className="font-black text-white text-sm sm:text-base leading-tight">
                          Professor: Anderson
                        </h4>
                        <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">
                          Instrutor Oficial • Adulto Avançado
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] sm:text-xs font-bold">
                      Seg a Sex
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between bg-zinc-900/80 px-2.5 py-1.5 rounded-lg border border-zinc-850">
                      <span className="text-zinc-300 font-medium">Dias de Aula:</span>
                      <strong className="text-white">Segunda a Sexta-feira</strong>
                    </div>
                    <div className="bg-zinc-900 px-2.5 py-1.5 rounded-lg border border-zinc-800 flex items-center justify-between">
                      <div>
                        <span className="text-zinc-300 block">Horário:</span>
                        <span className="text-[11px] text-amber-300 font-medium">Gi • Adulto Avançado</span>
                      </div>
                      <span className="font-mono font-bold text-white text-sm">20:00hs</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Poster Footer (WhatsApp & Instagram) */}
              <div className="pt-4 border-t border-white/30 flex items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-white font-bold">
                <a
                  href="https://wa.me/5585991362789"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>(85) 9-9136-2789</span>
                </a>
                <span className="text-white/40">|</span>
                <a
                  href="https://instagram.com/loyaltyjiujitsu"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-pink-400 transition-colors"
                >
                  <Instagram className="w-4 h-4 text-pink-400" />
                  <span>@loyaltyjiujitsu</span>
                </a>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 4. VISÃO DIA A DIA (OU VISÃO PADRÃO PARA OUTRAS ACADEMIAS)      */}
          {/* ============================================================== */}
          {(!isLoyaltyAcademy || activeTab === 'dia_a_dia') && (
            <div className="space-y-3 max-w-lg mx-auto py-2">
              <div className="text-center pb-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                  Visão Consolidada por Dia
                </span>
                <h3 className="text-base font-black text-white">
                  Funcionamento Semanal do Tatame
                </h3>
              </div>

              <div className="space-y-2">
                {hours.map((item) => {
                  const isToday = item.dayOfWeek === todayKey;

                  return (
                    <div
                      key={item.dayOfWeek}
                      className={`p-3.5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                        isToday
                          ? 'bg-zinc-900 border-amber-500 shadow-lg shadow-amber-950/20 ring-1 ring-amber-500/40'
                          : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-[130px]">
                        {item.isOpen ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-zinc-800/60 border border-zinc-700/60 flex items-center justify-center shrink-0">
                            <XCircle className="w-3.5 h-3.5 text-zinc-500" />
                          </div>
                        )}

                        <div>
                          <span className={`text-xs font-black capitalize block leading-tight ${
                            isToday ? 'text-amber-300' : 'text-zinc-200'
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
                              className="px-2.5 py-1 rounded-xl bg-black border border-zinc-800 text-white font-mono text-xs font-bold"
                            >
                              {slot}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs font-bold text-zinc-500 italic px-2 py-0.5">
                            Fechado
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Contact Footer */}
              <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs text-zinc-400 mt-4">
                <span>WhatsApp: <strong className="text-white">(85) 9-9136-2789</strong></span>
                <span>Instagram: <strong className="text-white">@loyaltyjiujitsu</strong></span>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Close Bar */}
        <div className="p-3.5 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Grade Oficial Loyalty Jiu-Jitsu (MM XXIII)</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-black text-xs shadow-md transition active:scale-95"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
