import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Brain, Award, BookOpen, Volume2, Send, Check, RefreshCw, Flame } from 'lucide-react';
import { AICoachLessonPlan, TechniqueCategory } from '../../types';
import { mockAICoachPlans } from '../../data/mockData';
import confetti from 'canvas-confetti';

interface AICoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublishToAnnouncements?: (title: string, content: string) => void;
  onAnnounceVoice?: (message: string) => void;
}

export const AICoachModal: React.FC<AICoachModalProps> = ({
  isOpen,
  onClose,
  onPublishToAnnouncements,
  onAnnounceVoice
}) => {
  const [selectedLevel, setSelectedLevel] = useState<'Iniciantes' | 'Intermediário / Avançado' | 'Kids' | 'Competição'>('Intermediário / Avançado');
  const [selectedTheme, setSelectedTheme] = useState<string>('Passagem de Guarda Toreando & Pressão Emborcada');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [currentPlan, setCurrentPlan] = useState<AICoachLessonPlan>(mockAICoachPlans[0]);
  const [published, setPublished] = useState<boolean>(false);

  if (!isOpen) return null;

  const quickThemes = [
    'Passagem de Guarda Toreando & Pressão Emborcada',
    'Guarda Fechada Tradicional & Ataque Triplo',
    'Meia Guarda Profunda (Deep Half) com Raspagem de Gancho',
    'Controle de Costas, Cinto de Segurança & Mata-Leão Invisível',
    'No-Gi: Entradas de Asahi & Leg Locks / Chave de Calcanhar',
    'Fundamentos BJJ Kids: Defesa Pessoal & Postura de Campeão'
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    setPublished(false);

    setTimeout(() => {
      const generatedPlan: AICoachLessonPlan = {
        id: `coach_${Date.now()}`,
        title: `Treino de Elite: ${selectedTheme}`,
        targetLevel: selectedLevel,
        theme: selectedTheme,
        warmup: {
          title: `Drill de Aquecimento Específico para ${selectedLevel}`,
          durationMinutes: 10,
          drills: [
            'Rolamento de frente e de costas com recuperação de base em pé (3 min)',
            'Troca de pegadas com parceiro na gola cruzada e quebra de postura (4 min)',
            'Drill de giro sobre o quadril e entrada de raspagem com alavanca (3 min)'
          ]
        },
        techniqueOfTheWeek: {
          name: selectedTheme,
          category: 'Passagem de Guarda' as TechniqueCategory,
          durationMinutes: 25,
          steps: [
            '1. Estabelecer controle bilateral nas calças na altura dos joelhos.',
            '2. Dar um passo lateral falso para induzir a reação da perna adversária.',
            '3. Conectar a pressão do ombro no esterno do oponente colando o quadril.',
            '4. Transicionar com rapidez para a lateral estabilizando os 100kg ou montada.'
          ],
          invisibleDetails: [
            'O peso deve ser projetado na ponta dos pés, não nos joelhos, mantendo pressão viva.',
            'Nunca estique os braços na passagem; mantenha os cotovelos colados às costelas.'
          ]
        },
        sparringDrill: {
          format: 'Treino Situacional com Reinício Imediato',
          durationMinutes: 25,
          situationalRule: 'Quem passa a guarda tem 3 minutos para estabilizar. Se for raspado ou finalizado, o atleta do topo paga 10 flexões e reinicia.'
        },
        coachingAdvice: 'Concentre a turma na respiração nasal durante as trocas de posição: suavidade e técnica superam força bruta.',
        createdAt: '03/09/2026'
      };

      setCurrentPlan(generatedPlan);
      setIsGenerating(false);

      if (onAnnounceVoice) {
        onAnnounceVoice(`Plano de aula gerado com sucesso pelo AI Coach. Tema: ${selectedTheme}`);
      }
    }, 1200);
  };

  const handlePublish = () => {
    if (onPublishToAnnouncements) {
      const content = `🥋 **PLANO DE AULA OFICIAL - AI COACH**\n\nNível: ${currentPlan.targetLevel}\nTema: ${currentPlan.theme}\n\n⏱️ Aquecimento (10 min): ${currentPlan.warmup.drills.join('; ')}\n\n🥋 Técnica da Semana (25 min): ${currentPlan.techniqueOfTheWeek.name}\n\n🔥 Rola Situacional: ${currentPlan.sparringDrill.situationalRule}\n\n💡 Dica do Mestre: ${currentPlan.coachingAdvice}`;
      onPublishToAnnouncements(currentPlan.title, content);
      setPublished(true);
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 }
      });
      setTimeout(() => setPublished(false), 3000);
    }
  };

  const handleVoiceNarrate = () => {
    if (onAnnounceVoice) {
      onAnnounceVoice(`Atenção tatame! Tema do treino de hoje: ${currentPlan.techniqueOfTheWeek.name}. Aquecimento com drills específicos em 3 minutos.`);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-indigo-950/70 via-slate-900 to-purple-950/50 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-800/40 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-400" /> BJJ Academy AI Coach
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Metodologia CBJJ / IBJJF</span>
                </div>
                <h3 className="text-base font-black text-white">Assistente de Treino & Planos de Aula</h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto space-y-4 no-scrollbar">
            {/* Form Controls */}
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Level selector */}
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Nível da Turma:
                  </label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Iniciantes">Iniciantes (Faixa Branca / Fundamentos)</option>
                    <option value="Intermediário / Avançado">Intermediário / Avançado (Azul a Preta)</option>
                    <option value="Kids">BJJ Kids (Disciplina & Lúdico)</option>
                    <option value="Competição">Competição & Sparring Pro</option>
                  </select>
                </div>

                {/* Theme selector */}
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Tema Técnico:
                  </label>
                  <select
                    value={selectedTheme}
                    onChange={(e) => setSelectedTheme(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 truncate"
                  >
                    {quickThemes.map((th, idx) => (
                      <option key={idx} value={th}>
                        {th}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={handleGenerate}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>{isGenerating ? 'Gerando Plano com IA...' : 'Gerar Plano de Aula'}</span>
                </button>
              </div>
            </div>

            {/* Generated Plan Display */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
                <div>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                    {currentPlan.targetLevel} • 60 Minutos de Aula
                  </span>
                  <h4 className="text-sm font-black text-white">{currentPlan.title}</h4>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleVoiceNarrate}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 transition"
                    title="Narrar no Tatame com Voz"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handlePublish}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition ${
                      published
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40'
                    }`}
                  >
                    {published ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                    <span>{published ? 'Publicado!' : 'Mural da Turma'}</span>
                  </button>
                </div>
              </div>

              {/* 1. Warmup */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                  <span className="flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    1. Aquecimento Específico de Tatame:
                  </span>
                  <span className="text-[10px] font-mono bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                    {currentPlan.warmup.durationMinutes} min
                  </span>
                </div>
                <ul className="space-y-1 pl-5 list-disc text-xs text-slate-300">
                  {currentPlan.warmup.drills.map((d, idx) => (
                    <li key={idx}>{d}</li>
                  ))}
                </ul>
              </div>

              {/* 2. Technique */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold text-indigo-400">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                    2. Técnica da Semana: {currentPlan.techniqueOfTheWeek.name}
                  </span>
                  <span className="text-[10px] font-mono bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
                    {currentPlan.techniqueOfTheWeek.durationMinutes} min
                  </span>
                </div>
                <div className="space-y-1 text-xs text-slate-300">
                  {currentPlan.techniqueOfTheWeek.steps.map((st, idx) => (
                    <div key={idx} className="bg-slate-950/50 p-1.5 rounded-lg border border-slate-800/60">
                      {st}
                    </div>
                  ))}
                </div>

                {/* Invisible details */}
                <div className="bg-amber-950/20 border border-amber-500/30 p-2.5 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-amber-400 flex items-center gap-1 text-[11px]">
                    🥋 Detalhes Invisíveis (O Segredo da Alavanca):
                  </span>
                  {currentPlan.techniqueOfTheWeek.invisibleDetails.map((det, idx) => (
                    <p key={idx} className="text-slate-300 text-[11px]">
                      • {det}
                    </p>
                  ))}
                </div>
              </div>

              {/* 3. Sparring */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold text-red-400">
                  <span className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-red-400" />
                    3. Rola Situacional & Sparring:
                  </span>
                  <span className="text-[10px] font-mono bg-red-950/60 px-2 py-0.5 rounded border border-red-800/40">
                    {currentPlan.sparringDrill.durationMinutes} min
                  </span>
                </div>
                <p className="text-xs text-slate-300 bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                  {currentPlan.sparringDrill.situationalRule}
                </p>
              </div>

              {/* Master Advice */}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-1.5">
                <span className="text-indigo-400 text-sm">💡</span>
                <span>
                  <strong>Conselho do Mestre:</strong> {currentPlan.coachingAdvice}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
