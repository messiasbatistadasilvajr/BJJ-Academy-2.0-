import React, { useState } from 'react';
import { 
  X, Search, BookOpen, CheckCircle2, Circle, ChevronRight, 
  Sparkles, Award, PlayCircle, Filter, Bookmark, AlertCircle
} from 'lucide-react';
import { TechniqueItem, TechniqueCategory, BeltColor } from '../../types';
import { mockTechniques } from '../../data/mockData';
import { BeltBadge } from './BeltBadge';

interface TechniquesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: ('Todas' | TechniqueCategory)[] = [
  'Todas',
  'Guarda & Defesa',
  'Passagem de Guarda',
  'Raspagens',
  'Finalizações',
  'Quedas & Projeções',
  'Defesa Pessoal'
];

export const TechniquesModal: React.FC<TechniquesModalProps> = ({ isOpen, onClose }) => {
  const [techniques, setTechniques] = useState<TechniqueItem[]>(mockTechniques);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'Todas' | TechniqueCategory>('Todas');
  const [selectedBelt, setSelectedBelt] = useState<'all' | BeltColor>('all');
  const [selectedTech, setSelectedTech] = useState<TechniqueItem | null>(null);
  const [showOnlyLearned, setShowOnlyLearned] = useState<boolean>(false);

  if (!isOpen) return null;

  const toggleLearned = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setTechniques(prev => prev.map(t => {
      if (t.id === id) {
        const next = !t.learned;
        if (selectedTech?.id === id) {
          setSelectedTech({ ...selectedTech, learned: next });
        }
        return { ...t, learned: next };
      }
      return t;
    }));
  };

  const filteredTechniques = techniques.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
      (t.japaneseName && t.japaneseName.toLowerCase().includes(search.toLowerCase())) ||
      t.masterTip.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === 'Todas' || t.category === selectedCategory;
    const matchBelt = selectedBelt === 'all' || t.minimumBelt === selectedBelt;
    const matchLearned = !showOnlyLearned || t.learned;
    return matchSearch && matchCategory && matchBelt && matchLearned;
  });

  const learnedCount = techniques.filter(t => t.learned).length;

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col justify-end sm:justify-center items-center sm:p-4"
      id="modal-technique-library"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-2xl h-[92vh] sm:h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="font-bold text-white text-base leading-tight">Videoteca & Guia de Posições</h2>
              <p className="text-xs text-slate-400">
                {learnedCount} de {techniques.length} posições dominadas
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

        {/* Search and Category Filters */}
        <div className="p-4 border-b border-slate-800/80 space-y-3 bg-slate-900/50">
          {/* Search bar */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input 
              type="text"
              placeholder="Buscar posição, golpe (ex: triângulo, armlock, queda)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Category Chips Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                  selectedCategory === cat 
                    ? 'bg-red-600 text-white shadow-sm' 
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sub-bar: Belt Filter & Learned Only */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Faixa mínima:</span>
              <select
                value={selectedBelt}
                onChange={(e) => setSelectedBelt(e.target.value as any)}
                className="bg-slate-800 text-white rounded-md px-2 py-1 border border-slate-700 focus:outline-none"
              >
                <option value="all">Todas as Faixas</option>
                <option value="white">Branca</option>
                <option value="blue">Azul</option>
                <option value="purple">Roxa</option>
                <option value="brown">Marrom</option>
                <option value="black">Preta</option>
              </select>
            </div>

            <button
              onClick={() => setShowOnlyLearned(!showOnlyLearned)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-colors ${
                showOnlyLearned 
                  ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-400 font-semibold' 
                  : 'bg-slate-800/60 border-slate-700 text-slate-400'
              }`}
            >
              <CheckCircle2 size={13} />
              Apenas Aprendidas
            </button>
          </div>
        </div>

        {/* Content: List or Detail */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {selectedTech ? (
            /* Technique Detail View */
            <div className="space-y-4">
              <button
                onClick={() => setSelectedTech(null)}
                className="text-xs text-red-400 hover:underline flex items-center gap-1 font-semibold"
              >
                ← Voltar para lista de técnicas
              </button>

              {/* Header card */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 uppercase">
                        {selectedTech.category}
                      </span>
                      <BeltBadge belt={selectedTech.minimumBelt} stripes={0} size="sm" showLabel />
                    </div>
                    <h3 className="text-lg font-bold text-white leading-snug">
                      {selectedTech.title}
                    </h3>
                    {selectedTech.japaneseName && (
                      <p className="text-xs text-slate-400 italic">{selectedTech.japaneseName}</p>
                    )}
                  </div>

                  <button
                    onClick={() => toggleLearned(selectedTech.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      selectedTech.learned 
                        ? 'bg-emerald-500 text-white shadow-lg' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {selectedTech.learned ? (
                      <><CheckCircle2 size={15} /> Dominada</>
                    ) : (
                      <><Circle size={15} /> Marcar Treinada</>
                    )}
                  </button>
                </div>

                {/* Video thumbnail banner */}
                <div className="relative mt-3 rounded-xl overflow-hidden border border-slate-700/80 aspect-video bg-slate-900 group">
                  <img 
                    src={selectedTech.videoThumb} 
                    alt={selectedTech.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                      <PlayCircle size={28} />
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-3 text-[11px] font-medium text-white/90">
                    Demonstração Técnica da Posição • 1080p
                  </div>
                </div>
              </div>

              {/* Step by step */}
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Bookmark size={14} className="text-red-400" />
                  Passo a Passo de Execução
                </h4>
                <ol className="space-y-2.5">
                  {selectedTech.steps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                      <span className="w-5 h-5 rounded-full bg-slate-700 text-white flex-shrink-0 flex items-center justify-center font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Master Tip Box */}
              <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-4">
                <div className="flex items-start gap-2.5">
                  <Sparkles size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-amber-300 uppercase tracking-wide mb-1">
                      Dica de Ouro do Mestre
                    </h5>
                    <p className="text-xs text-amber-100/90 leading-relaxed italic">
                      "{selectedTech.masterTip}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Key anatomical details */}
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertCircle size={14} className="text-cyan-400" />
                  Detalhes Críticos de Alavanca
                </h4>
                <ul className="space-y-1.5">
                  {selectedTech.keyDetails.map((det, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-red-500 font-bold">•</span>
                      <span>{det}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            /* Technique List */
            filteredTechniques.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                Nenhuma técnica encontrada com os filtros selecionados.
              </div>
            ) : (
              filteredTechniques.map((tech) => (
                <div
                  key={tech.id}
                  onClick={() => setSelectedTech(tech)}
                  className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 rounded-2xl p-3 flex items-center gap-3 cursor-pointer transition-all active:scale-[0.99]"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0 relative border border-slate-700">
                    <img 
                      src={tech.videoThumb} 
                      alt={tech.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <PlayCircle size={18} className="text-white/90" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] font-bold text-red-400 uppercase">
                        {tech.category}
                      </span>
                      <span className="text-slate-500 text-[10px]">•</span>
                      <BeltBadge belt={tech.minimumBelt} stripes={0} size="sm" />
                    </div>
                    <h4 className="font-bold text-white text-sm truncate">
                      {tech.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {tech.masterTip}
                    </p>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={(e) => toggleLearned(tech.id, e)}
                    className="p-2 text-slate-400 hover:text-emerald-400 transition-colors"
                    title={tech.learned ? 'Aprendida' : 'Marcar como aprendida'}
                  >
                    {tech.learned ? (
                      <CheckCircle2 size={20} className="text-emerald-400" />
                    ) : (
                      <Circle size={20} className="text-slate-600 hover:text-slate-400" />
                    )}
                  </button>

                  <ChevronRight size={16} className="text-slate-500" />
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
};
