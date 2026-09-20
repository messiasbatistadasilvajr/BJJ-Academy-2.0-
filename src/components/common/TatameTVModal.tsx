import React, { useState, useEffect } from 'react';
import { 
  X, Tv, Trophy, Calendar, Cake, ShieldCheck, 
  Flame, Bell, Clock, Users, Maximize2 
} from 'lucide-react';
import { StudentProfile, ClassSession, BirthdayPerson } from '../../types';

interface TatameTVModalProps {
  isOpen: boolean;
  onClose: () => void;
  academyName: string;
  students: StudentProfile[];
  classes: ClassSession[];
  birthdays?: BirthdayPerson[];
}

export const TatameTVModal: React.FC<TatameTVModalProps> = ({
  isOpen,
  onClose,
  academyName,
  students,
  classes,
  birthdays = []
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isOpen) return null;

  // Top 5 Alunos com maior frequência
  const topStudents = [...students]
    .sort((a, b) => (b.currentAttendanceCount || 0) - (a.currentAttendanceCount || 0))
    .slice(0, 5);

  const formattedTime = currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col overflow-hidden select-none">
      {/* Top TV Bar */}
      <div className="p-4 sm:p-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center font-black text-2xl shadow-lg shadow-red-600/30">
            🥋
          </div>
          <div>
            <div className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> PAINEL DIGITAL DA RECEPÇÃO & TATAME
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white capitalize">{academyName}</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-mono font-black text-white">{formattedTime}</div>
            <div className="text-xs text-slate-400 capitalize">{formattedDate}</div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            title="Sair do Modo TV"
          >
            <X size={22} />
          </button>
        </div>
      </div>

      {/* Grade Principal da TV */}
      <div className="flex-1 p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-5 overflow-y-auto">
        {/* Próximas Aulas de Hoje */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 flex flex-col space-y-4">
          <div className="flex items-center gap-2.5 text-amber-400 border-b border-slate-800 pb-3">
            <Clock size={20} />
            <h3 className="text-sm font-extrabold tracking-wider uppercase text-white">Próximos Treinos do Dia</h3>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {classes.slice(0, 4).map((c) => (
              <div key={c.id} className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-black text-red-400 bg-red-500/10 px-2 py-0.5 rounded-lg border border-red-500/20">
                    {c.time}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1">{c.name}</h4>
                  <div className="text-xs text-slate-400">{c.instructor} • {c.tatame}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-300 block">{c.enrolledCount}/{c.capacity}</span>
                  <span className="text-[10px] text-emerald-400">Vagas abertas</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quadro de Honra / Ranking de Frequência */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 flex flex-col space-y-4">
          <div className="flex items-center gap-2.5 text-amber-400 border-b border-slate-800 pb-3">
            <Trophy size={20} />
            <h3 className="text-sm font-extrabold tracking-wider uppercase text-white">Quadro de Honra (Assiduidade)</h3>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto">
            {topStudents.map((st, idx) => (
              <div key={st.id} className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                    idx === 0 ? 'bg-amber-500 text-slate-950' : idx === 1 ? 'bg-slate-300 text-slate-950' : 'bg-amber-700 text-white'
                  }`}>
                    {idx + 1}º
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{st.name}</div>
                    <div className="text-[11px] text-slate-400">Faixa {st.belt} • {st.stripes || 0}º Grau</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-amber-400">{st.currentAttendanceCount || 120} aulas</div>
                  <div className="text-[10px] text-emerald-400 font-semibold">Guerreiro Dedicado</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Aniversariantes & Filosofia Marcial */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 text-pink-400 border-b border-slate-800 pb-3">
              <Cake size={20} />
              <h3 className="text-sm font-extrabold tracking-wider uppercase text-white">Aniversariantes do Mês</h3>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-950/30 to-slate-950 border border-pink-500/20">
              <div className="text-xs font-bold text-pink-400">Parabéns aos aniversariantes!</div>
              <p className="text-xs text-slate-300 mt-1">
                Celebre a vida e o Jiu-Jitsu junto aos seus irmãos de tatame. Desejamos muita saúde, disciplina e evolução no tatame!
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Código Samurai do Tatame</div>
            <p className="text-xs italic text-slate-300 mt-2">
              "No tatame não existem derrotas. Ou você vence, ou você aprende."
            </p>
            <div className="text-[11px] text-red-500 font-bold mt-1">Grand Master Carlos Gracie</div>
          </div>
        </div>
      </div>

      {/* Letreiro Inferior de Avisos (Ticker) */}
      <div className="p-3 bg-red-700 text-white text-xs font-bold flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Bell size={16} />
          <span>AVISO DO MESTRE: Exame oficial de faixas CBJJ confirmado para o final do mês. Mantenha sua assiduidade e kimono limpo!</span>
        </div>
        <div className="font-mono text-red-200 text-[11px]">BJJACADEMY DIGITAL SIGNAGE</div>
      </div>
    </div>
  );
};
