import React, { useState } from 'react';
import { 
  X, Award, Shield, CheckCircle2, AlertCircle, Info, 
  Clock, Calendar, Sparkles, BookOpen, Search, Filter, Printer, Share2
} from 'lucide-react';
import { BeltColor } from '../../types';
import { 
  ALL_IBJJF_BELTS, 
  IBJJF_KIDS_BELTS, 
  IBJJF_ADULT_BELTS, 
  IBJJFBeltDefinition,
  getBeltInfo 
} from '../../utils/beltRegulations';
import { BeltBadge } from './BeltBadge';

interface IBJJFBeltGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  academyName?: string;
}

export const IBJJFBeltGuideModal: React.FC<IBJJFBeltGuideModalProps> = ({
  isOpen,
  onClose,
  academyName = 'BJJ Academy',
}) => {
  const [activeTab, setActiveTab] = useState<'kids' | 'adult' | 'all' | 'rules'>('kids');
  const [previewStripes, setPreviewStripes] = useState<number>(2);
  const [searchTerm, setSearchTerm] = useState<string>('');

  if (!isOpen) return null;

  const currentList = activeTab === 'kids' 
    ? IBJJF_KIDS_BELTS 
    : activeTab === 'adult' 
    ? IBJJF_ADULT_BELTS 
    : ALL_IBJJF_BELTS;

  const filteredBelts = currentList.filter(belt => 
    belt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    belt.ageRange.toLowerCase().includes(searchTerm.toLowerCase()) ||
    belt.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex flex-col justify-end sm:justify-center items-center sm:p-4"
      id="modal-ibjjf-belt-guide"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-4xl h-[94vh] sm:h-[88vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-white text-base sm:text-lg leading-tight">
                  Tabela Oficial de Graduação IBJJF / CBJJ
                </h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                  Regulamento BJJ
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {academyName} • Sistema Geral de Graduação Adulto e Infantil Oficial
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-header Navigation & Controls */}
        <div className="px-5 py-3 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('kids')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'kids'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Infantil (4 a 15 anos)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-black">13 Faixas</span>
            </button>

            <button
              onClick={() => setActiveTab('adult')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'adult'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Adulto & Mestres (16+)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-black">8 Faixas</span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'all'
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todas (20)
            </button>

            <button
              onClick={() => setActiveTab('rules')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                activeTab === 'rules'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Regras & Carência</span>
            </button>
          </div>

          {/* Search and Interactive Stripe Simulator */}
          <div className="flex items-center gap-3">
            {activeTab !== 'rules' && (
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Simular Graus:</span>
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map(s => (
                    <button
                      key={s}
                      onClick={() => setPreviewStripes(s)}
                      className={`w-5 h-5 rounded text-[10px] font-black transition ${
                        previewStripes === s 
                          ? 'bg-amber-500 text-slate-950 shadow-sm' 
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar faixa..."
                className="bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 w-36 sm:w-44"
              />
            </div>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 no-scrollbar">

          {/* Special Banner for Kids IBJJF System */}
          {activeTab === 'kids' && (
            <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-950/50 via-slate-900 to-amber-900/30 border border-amber-500/40 shadow-sm space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white">
                    Sistema Oficial de Graduação Infantil IBJJF / CBJJ (4 aos 15 anos)
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    O regulamento oficial da IBJJF divide as crianças em <strong>4 grupos de cores</strong> (Cinza, Amarela, Laranja e Verde). 
                    Cada cor é subdividida rigorosamente em <strong>3 variações bicolores</strong>: listra central branca, cor lisa e listra central preta, permitindo até <strong>4 graus (stripes)</strong> na tarja preta de cada faixa.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="font-bold text-slate-300 block">Grupo Cinza</span>
                  <span className="text-slate-400">4 a 15 anos</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="font-bold text-amber-400 block">Grupo Amarelo</span>
                  <span className="text-slate-400">7 a 15 anos</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="font-bold text-orange-400 block">Grupo Laranja</span>
                  <span className="text-slate-400">10 a 15 anos</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="font-bold text-emerald-400 block">Grupo Verde</span>
                  <span className="text-slate-400">13 a 15 anos</span>
                </div>
              </div>
            </div>
          )}

          {/* Special Banner for Adult IBJJF System */}
          {activeTab === 'adult' && (
            <div className="p-4 rounded-3xl bg-gradient-to-r from-blue-950/50 via-slate-900 to-indigo-950/40 border border-blue-500/40 shadow-sm space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white">
                    Sistema Oficial de Graduação Adulto & Mestres IBJJF (A partir de 16 anos)
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Carências mínimas oficiais obrigatórias por lei federativa: <strong>Azul (2 anos)</strong>, <strong>Roxa (1 ano e meio)</strong>, <strong>Marrom (1 ano)</strong>, <strong>Preta (31 anos até Coral 7º Grau)</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab Rules & Regulations Explanation */}
          {activeTab === 'rules' ? (
            <div className="space-y-4">
              {/* Card 1: Requisitos de Idade e Carência */}
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-5 h-5 text-amber-400" />
                  <h3 className="font-black text-white text-sm">Tabela de Idade Mínima e Carências Obrigatórias (IBJJF)</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Faixa</th>
                        <th className="py-2.5 px-3">Idade Mínima</th>
                        <th className="py-2.5 px-3">Tempo Mínimo de Permanência</th>
                        <th className="py-2.5 px-3">Graus</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-slate-300">
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-white">⚪ Branca</td>
                        <td className="py-2.5 px-3">Qualquer idade</td>
                        <td className="py-2.5 px-3">A critério do professor</td>
                        <td className="py-2.5 px-3">Até 4 graus</td>
                      </tr>
                      <tr className="bg-slate-950/40">
                        <td className="py-2.5 px-3 font-bold text-slate-300">🔘 Grupo Cinza (Kids)</td>
                        <td className="py-2.5 px-3">4 a 15 anos</td>
                        <td className="py-2.5 px-3">Frequência pedagógica (3 a 12 meses)</td>
                        <td className="py-2.5 px-3">Até 4 graus / variação</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-amber-400">🟡 Grupo Amarelo (Kids)</td>
                        <td className="py-2.5 px-3">7 a 15 anos</td>
                        <td className="py-2.5 px-3">1 ano por cor recomendada</td>
                        <td className="py-2.5 px-3">Até 4 graus / variação</td>
                      </tr>
                      <tr className="bg-slate-950/40">
                        <td className="py-2.5 px-3 font-bold text-orange-400">🟠 Grupo Laranja (Kids)</td>
                        <td className="py-2.5 px-3">10 a 15 anos</td>
                        <td className="py-2.5 px-3">1 ano por cor recomendada</td>
                        <td className="py-2.5 px-3">Até 4 graus / variação</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-emerald-400">🟢 Grupo Verde (Kids)</td>
                        <td className="py-2.5 px-3">13 a 15 anos</td>
                        <td className="py-2.5 px-3">1 ano por cor recomendada</td>
                        <td className="py-2.5 px-3">Até 4 graus / variação</td>
                      </tr>
                      <tr className="bg-blue-950/30">
                        <td className="py-2.5 px-3 font-bold text-blue-400">🔵 Azul</td>
                        <td className="py-2.5 px-3 font-bold text-blue-300">16 anos completos</td>
                        <td className="py-2.5 px-3 font-bold text-white">2 anos de carência mínima</td>
                        <td className="py-2.5 px-3">Até 4 graus</td>
                      </tr>
                      <tr className="bg-purple-950/30">
                        <td className="py-2.5 px-3 font-bold text-purple-400">🟣 Roxa</td>
                        <td className="py-2.5 px-3 font-bold text-purple-300">17 anos completos</td>
                        <td className="py-2.5 px-3 font-bold text-white">1 ano e 6 meses de carência mínima</td>
                        <td className="py-2.5 px-3">Até 4 graus</td>
                      </tr>
                      <tr className="bg-amber-950/30">
                        <td className="py-2.5 px-3 font-bold text-amber-600">🟤 Marrom</td>
                        <td className="py-2.5 px-3 font-bold text-amber-400">18 anos completos</td>
                        <td className="py-2.5 px-3 font-bold text-white">1 ano de carência mínima</td>
                        <td className="py-2.5 px-3">Até 4 graus</td>
                      </tr>
                      <tr className="bg-slate-950">
                        <td className="py-2.5 px-3 font-bold text-red-500">⚫ Preta</td>
                        <td className="py-2.5 px-3 font-bold text-red-400">19 anos completos</td>
                        <td className="py-2.5 px-3">1º ao 3º grau: 3 anos cada • 4º ao 6º grau: 5 anos cada</td>
                        <td className="py-2.5 px-3 font-bold text-red-400">Até 6º Grau</td>
                      </tr>
                      <tr className="bg-red-950/40">
                        <td className="py-2.5 px-3 font-bold text-red-400">🔴 Coral (Vermelha e Preta)</td>
                        <td className="py-2.5 px-3 font-bold text-red-300">50 anos completos</td>
                        <td className="py-2.5 px-3 font-bold text-white">7 anos de carência (7º Grau - Mestre)</td>
                        <td className="py-2.5 px-3">Mestre</td>
                      </tr>
                      <tr className="bg-red-950/40">
                        <td className="py-2.5 px-3 font-bold text-red-400">🔴 Coral (Vermelha e Branca)</td>
                        <td className="py-2.5 px-3 font-bold text-red-300">57 anos completos</td>
                        <td className="py-2.5 px-3 font-bold text-white">7 anos de carência (8º Grau - Mestre)</td>
                        <td className="py-2.5 px-3">Mestre</td>
                      </tr>
                      <tr className="bg-red-950/60">
                        <td className="py-2.5 px-3 font-bold text-red-500">🔴 Vermelha</td>
                        <td className="py-2.5 px-3 font-bold text-red-400">67 anos completos</td>
                        <td className="py-2.5 px-3 font-bold text-white">10 anos de carência (9º Grau - Grande Mestre)</td>
                        <td className="py-2.5 px-3">Grande Mestre</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Card 2: Regra de Transição aos 16 anos */}
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-black text-white text-sm">Regra Oficial de Transição Infantil para Adulto (Aos 16 anos)</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  No ano em que o atleta infantil completa 16 anos, ele ingressa na divisão de Adulto/Juvenil. A IBJJF estipula a seguinte correspondência direta:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-xs font-bold text-white block">Faixa Branca Infantil</span>
                    <span className="text-[11px] text-slate-400 block mt-1">Transita para: <strong>Faixa Branca Adulto</strong></span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-xs font-bold text-white block">Faixas Cinza / Amarela / Laranja</span>
                    <span className="text-[11px] text-slate-400 block mt-1">Transita para: <strong>Faixa Branca ou Azul</strong> (critério técnico do Mestre)</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-emerald-500/40 bg-emerald-950/20">
                    <span className="text-xs font-bold text-emerald-300 block">Faixa Verde Infantil</span>
                    <span className="text-[11px] text-slate-300 block mt-1">Geralmente promovido diretamente para: <strong className="text-blue-400">Faixa Azul Adulto</strong></span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Belt Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredBelts.map((beltDef) => {
                const isKid = beltDef.category === 'kids';
                return (
                  <div
                    key={beltDef.id}
                    className="p-4 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition shadow-md flex flex-col justify-between gap-3 group"
                  >
                    <div>
                      {/* Top Row: Belt Badge with interactive stripes + Category Pill */}
                      <div className="flex items-center justify-between gap-2">
                        <BeltBadge belt={beltDef.id} stripes={previewStripes} size="md" showLabel={false} />
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          isKid 
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' 
                            : beltDef.category === 'master'
                            ? 'bg-red-500/15 text-red-300 border-red-500/30'
                            : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                        }`}>
                          {beltDef.ageRange}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div className="mt-3">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-white group-hover:text-amber-300 transition">
                            Faixa {beltDef.name}
                          </h4>
                          {beltDef.bicolorType === 'center_white' && (
                            <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-semibold">
                              Listra Branca
                            </span>
                          )}
                          {beltDef.bicolorType === 'center_black' && (
                            <span className="text-[9px] bg-slate-950 text-slate-300 border border-slate-700 px-1.5 py-0.2 rounded font-semibold">
                              Listra Preta
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {beltDef.description}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Metadata: Minimum time and transition */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span className="font-medium">{beltDef.minTimeDescription}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">
                        Ordem #{beltDef.order}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filteredBelts.length === 0 && activeTab !== 'rules' && (
            <div className="text-center py-12 text-slate-500">
              <Info className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p className="text-sm font-semibold">Nenhuma faixa encontrada com o termo "{searchTerm}".</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Regulamentação 100% alinhada à <strong>IBJJF / CBJJ</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition shadow-md"
            >
              Fechar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
