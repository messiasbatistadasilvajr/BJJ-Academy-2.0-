import React, { useState } from 'react';
import { Building2, Search, MapPin, Users, Check, Sparkles, Clock, Phone, ChevronRight, UserPlus } from 'lucide-react';
import { RegisteredAcademy } from '../../types';
import { StudentEnrollmentButton } from './StudentEnrollmentButton';

interface AcademyFilterBarProps {
  academies: RegisteredAcademy[];
  activeAcademyId: string;
  onSelectAcademy: (academyId: string) => void;
  onOpenOperatingHours?: (academy: RegisteredAcademy) => void;
  onOpenStudentEnrollment?: (academy?: RegisteredAcademy) => void;
  showSearch?: boolean;
}

export const AcademyFilterBar: React.FC<AcademyFilterBarProps> = ({
  academies,
  activeAcademyId,
  onSelectAcademy,
  onOpenOperatingHours,
  onOpenStudentEnrollment,
  showSearch = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredAcademies = academies.filter((acad) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      acad.name.toLowerCase().includes(term) ||
      (acad.shortName && acad.shortName.toLowerCase().includes(term)) ||
      (acad.city && acad.city.toLowerCase().includes(term)) ||
      (acad.branch && acad.branch.toLowerCase().includes(term))
    );
  });

  const selectedAcademy = academies.find((a) => a.id === activeAcademyId) || academies[0];

  return (
    <div className="w-full max-w-5xl mb-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-xl p-2.5 sm:p-3 relative z-20">
      {/* Top Header of the Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 px-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-black border border-slate-800 flex items-center justify-center text-amber-400">
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white uppercase tracking-wider">
                BJJACADEMY • Filtro de Academias
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black text-amber-300 border border-amber-500/30">
                {academies.length} Cadastradas
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Selecione o tatame ativo para filtrar treinos, alunos e horários
            </p>
          </div>
        </div>

        {/* Search Input & Quick Actions */}
        <div className="flex items-center gap-2">
          {showSearch && (
            <div className="relative">
              <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome ou cidade..."
                className="w-36 sm:w-56 pl-7 pr-2.5 py-1 rounded-full bg-black text-white placeholder-slate-500 text-xs border border-slate-800 focus:outline-hidden focus:border-amber-500 transition"
              />
            </div>
          )}

          {onOpenOperatingHours && selectedAcademy && (
            <button
              onClick={() => onOpenOperatingHours(selectedAcademy)}
              className="px-2.5 py-1 rounded-full bg-black hover:bg-slate-950 text-amber-300 hover:text-amber-200 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1 transition shadow-xs whitespace-nowrap"
              title="Ver Grade de Horários da Academia Selecionada"
            >
              <Clock className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">Grade de Horários</span>
            </button>
          )}

          {onOpenStudentEnrollment && selectedAcademy && (
            <StudentEnrollmentButton
              academy={selectedAcademy}
              onOpenEnrollment={onOpenStudentEnrollment}
              variant="header"
              label="+ Cadastrar Aluno"
            />
          )}
        </div>
      </div>

      {/* Buttons Container: Rounded, Black Background, White Text */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
        {/* Button "Todas / Visão Geral" */}
        <button
          onClick={() => onSelectAcademy('all')}
          className={`px-3.5 py-2 rounded-full font-bold text-xs transition-all shrink-0 flex items-center gap-1.5 shadow-md ${
            activeAcademyId === 'all'
              ? 'bg-black text-white border-2 border-amber-400 ring-2 ring-amber-400/30'
              : 'bg-black text-white border border-slate-800 hover:border-slate-600 hover:bg-slate-950'
          }`}
          title="Ver dados consolidados de todas as academias"
        >
          <Sparkles className={`w-3.5 h-3.5 ${activeAcademyId === 'all' ? 'text-amber-400' : 'text-slate-400'}`} />
          <span>Todas as Academias</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-850 text-slate-300 border border-slate-700">
            {academies.length}
          </span>
        </button>

        {/* Individual Academy Buttons */}
        {filteredAcademies.map((academy) => {
          const isSelected = activeAcademyId === academy.id;
          const isLoyalty = academy.id === 'acad_loyalty_jiujitsu' || academy.name.toLowerCase().includes('loyalty');

          return (
            <button
              key={academy.id}
              onClick={() => onSelectAcademy(academy.id)}
              className={`px-3.5 py-2 rounded-full font-bold text-xs transition-all shrink-0 flex items-center gap-2 shadow-md ${
                isSelected
                  ? 'bg-black text-white border-2 border-amber-400 ring-2 ring-amber-400/40 shadow-amber-950/40'
                  : 'bg-black text-white border border-slate-800 hover:border-slate-600 hover:bg-slate-950 hover:text-white'
              }`}
              title={`${academy.name} - ${academy.branch || academy.city || ''}`}
            >
              {/* Status indicator dot / logo */}
              {isSelected ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              ) : (
                <span className={`w-2 h-2 rounded-full shrink-0 ${isLoyalty ? 'bg-amber-400' : 'bg-slate-600'}`} />
              )}

              {/* Academy Name */}
              <span className="whitespace-nowrap tracking-wide">
                {academy.name}
              </span>

              {/* City or Branch Badge */}
              {(academy.state || academy.city) && (
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full uppercase shrink-0 ${
                  isSelected 
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-500/40 font-black' 
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}>
                  {academy.state || academy.city?.split('-')[1]?.trim() || academy.city?.slice(0, 3)}
                </span>
              )}

              {/* Checkmark icon for selected */}
              {isSelected && (
                <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 stroke-[2.5]" />
              )}
            </button>
          );
        })}

        {filteredAcademies.length === 0 && (
          <div className="px-3 py-1.5 text-xs text-slate-400 italic">
            Nenhuma academia encontrada para "{searchTerm}".
          </div>
        )}
      </div>

      {/* Quick Info Bar for Active Selected Academy */}
      {selectedAcademy && activeAcademyId !== 'all' && (
        <div className="mt-2 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-slate-300">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-bold text-white flex items-center gap-1">
              <span>Tatame Ativo:</span>
              <strong className="text-amber-300">{selectedAcademy.name}</strong>
            </span>

            {selectedAcademy.branch && (
              <span className="text-slate-400">
                • {selectedAcademy.branch}
              </span>
            )}

            {selectedAcademy.city && (
              <span className="flex items-center gap-1 text-slate-400">
                <MapPin className="w-3 h-3 text-slate-500" />
                <span>{selectedAcademy.city}</span>
              </span>
            )}

            {selectedAcademy.activeStudentsCount !== undefined && (
              <span className="flex items-center gap-1 text-slate-400">
                <Users className="w-3 h-3 text-slate-500" />
                <span>{selectedAcademy.activeStudentsCount} alunos ativos</span>
              </span>
            )}

            {selectedAcademy.phone && (
              <span className="hidden md:flex items-center gap-1 text-slate-400">
                <Phone className="w-3 h-3 text-slate-500" />
                <span>{selectedAcademy.phone}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="text-[10px] text-slate-400 font-mono">
              {selectedAcademy.headInstructor ? `Resp: ${selectedAcademy.headInstructor.split(' ')[0]}` : ''}
            </div>

            {onOpenStudentEnrollment && (
              <StudentEnrollmentButton
                academy={selectedAcademy}
                onOpenEnrollment={onOpenStudentEnrollment}
                variant="compact"
                label="+ Aluno"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
