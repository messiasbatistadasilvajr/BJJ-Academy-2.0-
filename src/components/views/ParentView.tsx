import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, Award, Calendar, DollarSign, MessageSquare, 
  CheckCircle2, AlertCircle, QrCode, ArrowUpRight, 
  ShieldCheck, Heart, Clock, BellRing, Sparkles, Send,
  FileText, ShoppingBag, Trophy, BookOpen
} from 'lucide-react';
import { DependentStudent, Invoice, Announcement, ChatMessage } from '../../types';
import { BeltBadge } from '../common/BeltBadge';
import { IBJJFBeltGuideModal } from '../common/IBJJFBeltGuideModal';

interface ParentViewProps {
  dependents: DependentStudent[];
  invoices: Invoice[];
  announcements: Announcement[];
  chatMessages: ChatMessage[];
  onOpenPix: (invoice: Invoice) => void;
  onOpenReceipt: (invoice: Invoice) => void;
  onSendMessage: (text: string) => void;
  onOpenContract?: () => void;
  onOpenProShop?: () => void;
  onOpenTournaments?: () => void;
  onOpenBeltGuide?: () => void;
}

export const ParentView: React.FC<ParentViewProps> = ({
  dependents,
  invoices,
  announcements,
  chatMessages,
  onOpenPix,
  onOpenReceipt,
  onSendMessage,
  onOpenContract,
  onOpenProShop,
  onOpenTournaments,
  onOpenBeltGuide,
}) => {
  const [selectedChildIndex, setSelectedChildIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'geral' | 'frequencia' | 'financeiro' | 'mensagens'>('geral');
  const [chatInput, setChatInput] = useState('');
  const [isBeltGuideOpen, setIsBeltGuideOpen] = useState<boolean>(false);

  const currentChild = dependents[selectedChildIndex] || dependents[0];

  // Child-specific invoices
  const childInvoices = currentChild
    ? invoices.filter(i => 
        i.studentId === currentChild.id || (i.studentName && i.studentName.toLowerCase().includes(currentChild.name.split(' ')[0].toLowerCase()))
      )
    : [];
  const pendingChildInvoice = childInvoices.find(i => i.status === 'pending');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !currentChild) return;
    onSendMessage(`[Recado de Pai para ${currentChild.name.split(' ')[0]}]: ${chatInput.trim()}`);
    setChatInput('');
  };

  if (!currentChild) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-400">
        <Users className="w-12 h-12 mb-3 text-slate-600" />
        <h3 className="text-base font-bold text-slate-200">Nenhum dependente vinculado</h3>
        <p className="text-xs text-slate-400 mt-1">Cadastre seus dependentes ou alunos Kids na recepção da academia.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-950/65 backdrop-blur-[0.5px] text-slate-100 overflow-y-auto pb-20 no-scrollbar">
      {/* Portal do Responsável Top Header */}
      <div className="px-5 pt-4 pb-4 bg-gradient-to-b from-blue-950/40 via-slate-900/85 to-slate-950/75 border-b border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                Portal do Responsável
              </span>
              <h2 className="text-sm font-bold text-white">Marcelo Mendes (Pai)</h2>
            </div>
          </div>
          <span className="text-[10px] bg-blue-950 border border-blue-800 text-blue-300 px-2 py-0.5 rounded-full font-semibold">
            {dependents.length} Filhos Ativos
          </span>
        </div>

        {/* Children Selector Chips */}
        <div className="flex items-center gap-2 pt-1 overflow-x-auto no-scrollbar">
          {dependents.map((dep, idx) => {
            const isSelected = selectedChildIndex === idx;
            return (
              <button
                key={dep.id}
                onClick={() => setSelectedChildIndex(idx)}
                className={`flex items-center gap-2.5 p-2 pr-3 rounded-2xl border transition shrink-0 ${
                  isSelected
                    ? 'bg-blue-600/20 border-blue-500 shadow-md shadow-blue-950'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <img
                  src={dep.avatar}
                  alt={dep.name}
                  className={`w-9 h-9 rounded-xl object-cover border ${
                    isSelected ? 'border-blue-400' : 'border-slate-700'
                  }`}
                />
                <div className="text-left">
                  <div className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    {dep.name.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    {dep.age} anos • {dep.category}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Child Hero Banner */}
      <div className="p-4">
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                Dependente Selecionado
              </span>
              <h3 className="text-base font-extrabold text-white">{currentChild.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Turma Kids • {currentChild.schoolGrade}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> No Tatame Hoje
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-400">Faixa Oficial Infantil:</div>
                <div className="mt-1">
                  <BeltBadge belt={currentChild.belt} stripes={currentChild.stripes} size="md" />
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400">Evolução no Grau:</div>
                <div className="text-xs font-bold text-blue-400 mt-1">
                  {currentChild.currentAttendanceCount}/{currentChild.classesForNextDegree} aulas
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenBeltGuide ? onOpenBeltGuide() : setIsBeltGuideOpen(true)}
              className="w-full py-1.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold flex items-center justify-center gap-1.5 transition"
            >
              <BookOpen size={13} />
              <span>Ver Tabela Oficial de Faixas Kids IBJJF (13 Variações)</span>
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[9px] text-slate-400 uppercase font-bold">Frequência</span>
              <div className="text-base font-black text-emerald-400">100%</div>
              <span className="text-[9px] text-slate-500">Sem faltas</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[9px] text-slate-400 uppercase font-bold">Semana</span>
              <div className="text-base font-black text-amber-400">3 treinos</div>
              <span className="text-[9px] text-slate-500">Ter / Qui / Sáb</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[9px] text-slate-400 uppercase font-bold">Próx. Grau</span>
              <div className="text-base font-black text-blue-400">Faltam 7</div>
              <span className="text-[9px] text-slate-500">Exame em Out</span>
            </div>
          </div>

          {/* Quick Shortcuts for Parent */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
            <button
              onClick={onOpenContract}
              className="py-2 px-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px]">Contrato & Termo</span>
            </button>

            <button
              onClick={onOpenProShop}
              className="py-2 px-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[10px]">Kimono & Shop</span>
            </button>

            <button
              onClick={onOpenTournaments}
              className="py-2 px-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px]">Torneios Kids</span>
            </button>
          </div>
        </div>
      </div>

      {/* Subtabs for Parent */}
      <div className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-900/40 border-y border-slate-800/80 overflow-x-auto no-scrollbar">
        {[
          { id: 'geral', label: 'Resumo & Alertas' },
          { id: 'frequencia', label: 'Histórico de Presenças' },
          { id: 'financeiro', label: 'Mensalidades & PIX' },
          { id: 'mensagens', label: 'Falar com Professora' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="p-4 space-y-4">
        {/* RESUMO & ALERTAS */}
        {activeTab === 'geral' && (
          <div className="space-y-4">
            {/* Live Tatame Notification */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-800/50 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <BellRing className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">
                  Presença confirmada hoje às 17:35!
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  Profª Beatriz registrou a presença de {currentChild.name.split(' ')[0]} no tatame 2. Treino de Jiu-Jitsu Kids em andamento com 100% de dedicação.
                </p>
                <div className="text-[10px] text-emerald-400 font-semibold mt-1">
                  Horário de saída previsto: 18:20
                </div>
              </div>
            </div>

            {/* Next Graduation Preview */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" /> Histórico de Graduações do Filho
                </h4>
                <span className="text-[10px] text-slate-400">CBJJ Kids</span>
              </div>
              <div className="space-y-2">
                {currentChild.promotions.map((p) => (
                  <div key={p.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <BeltBadge belt={p.belt} stripes={p.stripes} size="sm" />
                      <div className="text-[10px] text-slate-400 mt-1">{p.instructor} • {p.date}</div>
                      {p.notes && <div className="text-[10px] text-slate-300 italic">"{p.notes}"</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Parent Announcements */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Avisos da Academia para Pais e Mães
              </h4>
              {announcements.filter(a => a.category === 'Kids' || a.category === 'Geral').map((ann) => (
                <div key={ann.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="font-bold text-blue-400">{ann.category}</span>
                    <span className="text-slate-500">{ann.date}</span>
                  </div>
                  <h5 className="text-xs font-bold text-white">{ann.title}</h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FREQUÊNCIA */}
        {activeTab === 'frequencia' && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Assiduidade Semanal de {currentChild.name.split(' ')[0]}
            </h4>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Meta mensal de treinos:</span>
                <span className="font-bold text-emerald-400">12 / 12 aulas cumpridas!</span>
              </div>
              <div className="space-y-2">
                {[
                  { date: 'Hoje (Quinta-feira)', class: 'Jiu-Jitsu Kids - 17:30', status: 'Presente', instructor: 'Profª Beatriz' },
                  { date: 'Terça-feira, 01/09', class: 'Jiu-Jitsu Kids - 17:30', status: 'Presente', instructor: 'Profª Beatriz' },
                  { date: 'Sábado, 29/08', class: 'Treino Pais & Filhos', status: 'Presente', instructor: 'Mestre Rodrigo' },
                  { date: 'Quinta-feira, 27/08', class: 'Jiu-Jitsu Kids - 17:30', status: 'Presente', instructor: 'Profª Beatriz' }
                ].map((item, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-white">{item.date}</div>
                      <div className="text-[10px] text-slate-400">{item.class} • {item.instructor}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-[10px] font-bold text-emerald-400">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FINANCEIRO */}
        {activeTab === 'financeiro' && (
          <div className="space-y-4">
            {pendingChildInvoice ? (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/60 via-slate-900 to-slate-900 border border-blue-800/60 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wide">
                    Mensalidade do Dependente
                  </span>
                  <span className="text-[10px] font-semibold text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded-full">
                    Vence em {pendingChildInvoice.dueDate}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">{pendingChildInvoice.title}</h4>
                  <div className="text-2xl font-black text-white mt-1">
                    R$ {pendingChildInvoice.amount.toFixed(2).replace('.', ',')}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <button
                    onClick={() => onOpenPix(pendingChildInvoice)}
                    className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-teal-950/40"
                  >
                    <QrCode className="w-4 h-4" /> Pagar com PIX
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
                Nenhuma mensalidade pendente para este dependente.
              </div>
            )}

            {/* Family combo notice */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-white">Desconto Família (2 Filhos)</div>
                <div className="text-[10px] text-emerald-400">10% de desconto já aplicado no plano kids.</div>
              </div>
              <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-semibold text-[10px]">
                Plano Ativo
              </span>
            </div>
          </div>
        )}

        {/* MENSAGENS COM PROFESSORA */}
        {activeTab === 'mensagens' && (
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-white">Contato com Profª Beatriz (Kids)</span>
              </div>
              <span className="text-[10px] text-emerald-400">● Tatame Ativo</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              <div className="flex flex-col items-start">
                <div className="max-w-[85%] p-2.5 rounded-2xl text-xs bg-slate-800 text-slate-200 rounded-bl-none">
                  <div className="text-[9px] font-bold text-blue-400 mb-0.5">Profª Beatriz</div>
                  <div>Boa tarde, Marcelo! O Pedro e a Sofia estão muito bem adaptados. O Pedro hoje aprendeu a defesa de guarda com muita facilidade!</div>
                  <div className="text-[9px] opacity-60 text-right mt-1">16:40</div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSend} className="flex gap-2 pt-2 border-t border-slate-800">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Enviar recado sobre seu filho(a)..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center transition"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Modal de Tabela de Faixas IBJJF para os Pais */}
      <IBJJFBeltGuideModal
        isOpen={isBeltGuideOpen}
        onClose={() => setIsBeltGuideOpen(false)}
      />
    </div>
  );
};
