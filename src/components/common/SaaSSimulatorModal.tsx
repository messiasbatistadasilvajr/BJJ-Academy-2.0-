import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calculator, TrendingUp, DollarSign, Building2, Users, ArrowUpRight, Sparkles, Check } from 'lucide-react';
import { projectSaasScale, formatBRL, SAAS_FIXED_FEE_BRL, SAAS_PER_STUDENT_FEE_BRL } from '../../utils/financialCalculations';

interface SaaSSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SaaSSimulatorModal: React.FC<SaaSSimulatorModalProps> = ({ isOpen, onClose }) => {
  const [academiesCount, setAcademiesCount] = useState<number>(15);
  const [avgStudents, setAvgStudents] = useState<number>(110);

  if (!isOpen) return null;

  const projection = projectSaasScale(academiesCount, avgStudents);

  const presets = [
    { label: 'Piloto (5 Unidades)', academies: 5, students: 60 },
    { label: 'Crescimento (20 Unidades)', academies: 20, students: 100 },
    { label: 'Rede Regional (60 Unidades)', academies: 60, students: 140 },
    { label: 'Escala Brasil (180 Unidades)', academies: 180, students: 180 }
  ];

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
          <div className="px-5 py-4 bg-gradient-to-r from-red-950/60 via-slate-900 to-amber-950/40 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white shadow-md">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-800/40">
                    SaaS Master Engine
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">BJJ Academy Multi-Tenant</span>
                </div>
                <h3 className="text-base font-black text-white">Simulador de Escala de Negócio (MRR / ARR)</h3>
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
          <div className="p-5 overflow-y-auto space-y-5 no-scrollbar">
            {/* Formula Banner */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Fórmula Dinâmica de Precificação Oficial
                </span>
                <div className="text-sm font-black text-white font-mono mt-0.5">
                  Mensalidade = {formatBRL(SAAS_FIXED_FEE_BRL)} (Fixo/Academia) + ({formatBRL(SAAS_PER_STUDENT_FEE_BRL)} × Alunos Ativos)
                </div>
              </div>
              <div className="text-[11px] bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300 font-mono">
                Sem limite de tatames
              </div>
            </div>

            {/* Presets */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Cenários Rápidos de Crescimento:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {presets.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setAcademiesCount(p.academies);
                      setAvgStudents(p.students);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      academiesCount === p.academies && avgStudents === p.students
                        ? 'bg-amber-950/40 border-amber-500/60 text-white shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold truncate">{p.label}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {p.academies} un • ~{p.students} alunos
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              {/* Slider 1: Academias */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-red-400" />
                    Número de Academias & Filiais Contratantes:
                  </span>
                  <span className="text-sm font-black text-red-400 font-mono bg-red-950/60 px-2.5 py-0.5 rounded-lg border border-red-800/40">
                    {academiesCount} {academiesCount === 1 ? 'academia' : 'academias'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="250"
                  step="1"
                  value={academiesCount}
                  onChange={(e) => setAcademiesCount(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>1 filial</span>
                  <span>100 filiais</span>
                  <span>250 filiais</span>
                </div>
              </div>

              {/* Slider 2: Alunos por Academia */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-amber-400" />
                    Média de Alunos Ativos no Tatame por Unidade:
                  </span>
                  <span className="text-sm font-black text-amber-400 font-mono bg-amber-950/60 px-2.5 py-0.5 rounded-lg border border-amber-800/40">
                    {avgStudents} alunos/unidade
                  </span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="400"
                  step="5"
                  value={avgStudents}
                  onChange={(e) => setAvgStudents(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>15 alunos</span>
                  <span>200 alunos</span>
                  <span>400 alunos</span>
                </div>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Atletas</span>
                <div className="text-lg font-black text-white font-mono">
                  {projection.totalActiveStudents.toLocaleString('pt-BR')}
                </div>
                <span className="text-[10px] text-slate-500">nos tatames</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-blue-400 uppercase">MRR Fixo</span>
                <div className="text-lg font-black text-blue-300 font-mono">
                  {formatBRL(projection.fixedMRR)}
                </div>
                <span className="text-[10px] text-slate-500">R$ 130 × {academiesCount}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase">MRR Variável</span>
                <div className="text-lg font-black text-amber-300 font-mono">
                  {formatBRL(projection.variableMRR)}
                </div>
                <span className="text-[10px] text-slate-500">R$ 1,30 × alunos</span>
              </div>

              <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/40 space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Ticket Médio
                </span>
                <div className="text-lg font-black text-emerald-300 font-mono">
                  {formatBRL(projection.totalMRR / academiesCount)}
                </div>
                <span className="text-[10px] text-slate-500">por filial/mês</span>
              </div>
            </div>

            {/* Total MRR & ARR Hero Box */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950/30 to-slate-950 border border-emerald-600/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4" /> Projeção de Faturamento SaaS Consolidado
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                    {formatBRL(projection.totalMRR)}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">/mês (MRR)</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Faturamento anual estimado (ARR): <strong className="text-emerald-400 font-mono font-black">{formatBRL(projection.totalARR)}</strong>
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg transition flex items-center justify-center gap-1.5 shrink-0"
              >
                <Check className="w-4 h-4" /> Aplicar Premissas
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
