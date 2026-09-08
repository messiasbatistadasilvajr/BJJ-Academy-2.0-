import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldAlert, Heart, CheckCircle2, AlertTriangle, Activity, User, Save, Trash2 } from 'lucide-react';
import { BeltBadge } from './BeltBadge';
import { BeltColor } from '../../types';

export interface StudentInjuryRecord {
  studentId: string;
  studentName: string;
  belt: BeltColor;
  avatar?: string;
  bloodType?: string;
  hasInjuryWarning: boolean;
  injuryNote: string;
  injurySeverity: 'mild' | 'moderate' | 'strict';
  sparringRestrictions: string;
  updatedAt?: string;
}

interface MedicalInjuryModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: StudentInjuryRecord | null;
  onSave: (updated: StudentInjuryRecord) => void;
}

export const MedicalInjuryModal: React.FC<MedicalInjuryModalProps> = ({
  isOpen,
  onClose,
  record,
  onSave
}) => {
  if (!isOpen || !record) return null;

  const [hasWarning, setHasWarning] = useState<boolean>(record.hasInjuryWarning);
  const [note, setNote] = useState<string>(record.injuryNote || '');
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'strict'>(record.injurySeverity || 'moderate');
  const [restrictions, setRestrictions] = useState<string>(record.sparringRestrictions || '');
  const [bloodType, setBloodType] = useState<string>(record.bloodType || 'A+');

  const handleSave = () => {
    onSave({
      ...record,
      hasInjuryWarning: hasWarning,
      injuryNote: hasWarning ? note : '',
      injurySeverity: severity,
      sparringRestrictions: hasWarning ? restrictions : '',
      bloodType,
      updatedAt: new Date().toLocaleDateString('pt-BR')
    });
    onClose();
  };

  const handleClear = () => {
    onSave({
      ...record,
      hasInjuryWarning: false,
      injuryNote: '',
      injurySeverity: 'mild',
      sparringRestrictions: '',
      bloodType,
      updatedAt: new Date().toLocaleDateString('pt-BR')
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
        id="modal-medical-injury"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.15 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col text-slate-100"
        >
          {/* Header Sóbrio */}
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Ficha Médica & Restrições de Rola</h3>
                <p className="text-[11px] text-slate-400">Alerta discreto visível apenas para os mestres no tatame</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Atleta Info */}
          <div className="p-5 space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {record.avatar ? (
                  <img src={record.avatar} alt={record.studentName} className="w-10 h-10 rounded-xl object-cover border border-slate-700" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                    <User className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-bold text-white">{record.studentName}</h4>
                  <div className="mt-0.5">
                    <BeltBadge belt={record.belt} size="sm" showLabel />
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase font-mono">Tipo Sanguíneo</span>
                <span className="text-xs font-bold text-red-400 bg-red-950/40 border border-red-800/40 px-2 py-0.5 rounded-md mt-0.5 inline-block">
                  {bloodType}
                </span>
              </div>
            </div>

            {/* Toggle de Lesão / Restrição Ativa */}
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">Status no Tatame</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setHasWarning(false)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border transition flex items-center justify-center gap-2 ${
                    !hasWarning
                      ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Apto 100% (Sem Lesão)
                </button>
                <button
                  type="button"
                  onClick={() => setHasWarning(true)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border transition flex items-center justify-center gap-2 ${
                    hasWarning
                      ? 'bg-amber-950/50 border-amber-500/50 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Lesão / Restrição Ativa
                </button>
              </div>
            </div>

            {hasWarning && (
              <div className="space-y-3 pt-1 animate-fadeIn">
                <div>
                  <label className="text-[11px] font-medium text-slate-400 mb-1 block">
                    Gravidade da Restrição
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'mild', label: 'Leve', desc: 'Apenas alerta' },
                      { id: 'moderate', label: 'Moderada', desc: 'Evitar membro' },
                      { id: 'strict', label: 'Rigorosa', desc: 'Sem rola livre' },
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSeverity(s.id as any)}
                        className={`py-1.5 px-2 rounded-lg text-center border transition ${
                          severity === s.id
                            ? 'bg-amber-500/20 border-amber-500/60 text-amber-200'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-xs font-bold block">{s.label}</span>
                        <span className="text-[9px] text-slate-400 block">{s.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-400 mb-1 block">
                    Descrição da Lesão / Membro Afetado
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ex: Ombro direito em reabilitação — evitar projeções"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-400 mb-1 block">
                    Orientação Prática para o Rola
                  </label>
                  <input
                    type="text"
                    value={restrictions}
                    onChange={(e) => setRestrictions(e.target.value)}
                    placeholder="Ex: Apenas rola posicional controlado / Proibido americana e kimura"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer de Ações Sóbrio */}
          <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
            {hasWarning ? (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Liberar 100%
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-xs font-bold text-slate-950 flex items-center gap-1.5 transition shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                Salvar Ficha
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
