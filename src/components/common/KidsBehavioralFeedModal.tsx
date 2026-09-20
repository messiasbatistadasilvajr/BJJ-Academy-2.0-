import React, { useState } from 'react';
import { 
  X, Heart, Star, CheckCircle2, Plus, 
  Smile, ShieldCheck, Award, MessageSquare 
} from 'lucide-react';
import { KidsBehaviorTask, KidsEvolutionRecord } from '../../types';
import { triggerNativeHaptic } from '../../utils/nativeApp';

interface KidsBehavioralFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  kidsName?: string;
  isParentView?: boolean;
}

const DEFAULT_TASKS: KidsBehaviorTask[] = [
  {
    id: 'task_1',
    title: 'Arrumar a própria cama e dobrar o kimono',
    description: 'Demonstrar disciplina e autonomia antes de sair para a escola.',
    category: 'casa',
    points: 10,
    completed: true,
    completedAt: 'Hoje às 07:30'
  },
  {
    id: 'task_2',
    title: 'Dever de casa concluído sem reclamar',
    description: 'Foco nos estudos e pontualidade na entrega dos exercícios escolares.',
    category: 'escola',
    points: 15,
    completed: true,
    completedAt: 'Ontem às 18:00'
  },
  {
    id: 'task_3',
    title: 'Respeito aos mais velhos e aos pais',
    description: 'Responder com educação, escutar com atenção e praticar a paciência marcial.',
    category: 'respeito',
    points: 15,
    completed: false
  },
  {
    id: 'task_4',
    title: 'Alimentação saudável (sem refrigerante no almoço)',
    description: 'Cuidar da saúde e do corpo de um futuro faixa-preta.',
    category: 'disciplina',
    points: 10,
    completed: true,
    completedAt: 'Hoje às 12:45'
  }
];

export const KidsBehavioralFeedModal: React.FC<KidsBehavioralFeedModalProps> = ({
  isOpen,
  onClose,
  kidsName = 'Davi Lucas',
  isParentView = true
}) => {
  const [tasks, setTasks] = useState<KidsBehaviorTask[]>(DEFAULT_TASKS);
  const [parentComment, setParentComment] = useState('O Davi está muito mais calmo e obediente depois que começou as aulas de Jiu-Jitsu!');

  if (!isOpen) return null;

  const totalPoints = tasks.reduce((acc, t) => t.completed ? acc + t.points : acc, 0);
  const isCandidateForStripe = totalPoints >= 35;

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        triggerNativeHaptic('medium');
        return {
          ...t,
          completed: !t.completed,
          completedAt: !t.completed ? 'Agora' : undefined
        };
      }
      return t;
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Star size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Feed Comportamental & Valores Kids
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  FAMÍLIA + TATAME
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Acompanhamento de metas em casa e na escola que contam pontos para graus e faixas no tatame.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Resumo do Aluno Kids */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/10 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-black text-base">
              🥋
            </div>
            <div>
              <div className="text-xs text-amber-400 font-bold uppercase tracking-wider">Atleta Kids</div>
              <div className="text-base font-extrabold text-white">{kidsName}</div>
              <div className="text-xs text-slate-400">Faixa Cinza • Categoria Infantil</div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-black text-amber-400">{totalPoints} pts</div>
            <div className={`text-[10px] font-bold ${
              isCandidateForStripe ? 'text-emerald-400' : 'text-slate-400'
            }`}>
              {isCandidateForStripe ? '⭐ Apto para Grau de Mérito' : 'Meta semanal: 35 pts'}
            </div>
          </div>
        </div>

        {/* Lista de Metas */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Quadro de Deveres e Comportamento da Semana
            </span>
            <span className="text-xs text-slate-400">Toque para marcar</span>
          </div>

          <div className="space-y-2">
            {tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`w-full p-3 rounded-2xl text-left border flex items-center justify-between gap-3 transition ${
                  task.completed
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-white'
                    : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-1 rounded-lg mt-0.5 shrink-0 ${
                    task.completed ? 'text-emerald-400' : 'text-slate-600'
                  }`}>
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-tight">{task.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{task.description}</div>
                    {task.completedAt && (
                      <div className="text-[10px] text-emerald-400 font-semibold mt-1">
                        Concluído: {task.completedAt}
                      </div>
                    )}
                  </div>
                </div>

                <span className="px-2 py-1 rounded-xl text-xs font-black bg-slate-900 border border-slate-800 text-amber-400 shrink-0">
                  +{task.points} pts
                </span>
              </button>
            ))}
          </div>

          {/* Recado dos Pais para o Mestre */}
          <div className="mt-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <MessageSquare size={14} className="text-amber-400" />
              Recado dos Pais para o Professor no Tatame
            </div>
            <textarea
              value={parentComment}
              onChange={(e) => setParentComment(e.target.value)}
              rows={2}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition"
              placeholder="Escreva uma observação sobre o comportamento em casa..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};
