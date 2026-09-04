import React from 'react';
import { BeltColor } from '../../types';
import { getBeltInfo } from '../../utils/beltRegulations';

interface BeltBadgeProps {
  belt: BeltColor | string;
  stripes?: number;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showLabel?: boolean;
  showDivisionBadge?: boolean;
}

export const BeltBadge: React.FC<BeltBadgeProps> = ({
  belt,
  stripes = 0,
  size = 'md',
  showLabel = true,
  showDivisionBadge = false,
}) => {
  const beltDef = getBeltInfo(belt);

  const sizeClasses = {
    sm: 'h-3.5 w-16 text-[9px]',
    md: 'h-5 w-24 text-[10px]',
    lg: 'h-7 w-36 text-xs',
    hero: 'h-10 w-full max-w-[280px] text-sm shadow-xl'
  }[size];

  const barWidthClass = {
    sm: 'w-5',
    md: 'w-7',
    lg: 'w-10',
    hero: 'w-16'
  }[size];

  const stripeWidth = {
    sm: 'w-[1.5px] h-2.5',
    md: 'w-[2px] h-3.5',
    lg: 'w-[2.5px] h-5',
    hero: 'w-[3px] h-7'
  }[size];

  // Custom styling for coral belts
  const isCoralBlack = beltDef.bicolorType === 'coral_black';
  const isCoralWhite = beltDef.bicolorType === 'coral_white';
  const isCoral = isCoralBlack || isCoralWhite;

  const coralStyle: React.CSSProperties | undefined = isCoralBlack
    ? {
        background: 'repeating-linear-gradient(90deg, #dc2626 0px, #dc2626 12px, #0f172a 12px, #0f172a 24px)',
      }
    : isCoralWhite
    ? {
        background: 'repeating-linear-gradient(90deg, #dc2626 0px, #dc2626 12px, #f8fafc 12px, #f8fafc 24px)',
      }
    : undefined;

  return (
    <div className="inline-flex items-center gap-2">
      {/* Belt Graphic */}
      <div
        style={coralStyle}
        className={`relative overflow-hidden rounded-[2px] flex items-center justify-between border ${
          isCoral ? 'border-red-950' : `${beltDef.baseColorClass} ${beltDef.borderColorClass}`
        } ${sizeClasses}`}
        title={`Faixa ${beltDef.name} IBJJF (${stripes} graus)`}
      >
        {/* Subtle fabric stitch lines */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-black/15 pointer-events-none z-10" />

        {/* Central horizontal stripe for IBJJF Bicolor Kids Belts */}
        {beltDef.bicolorType === 'center_white' && (
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[34%] bg-white/95 shadow-sm border-y border-black/15 pointer-events-none" />
        )}
        {beltDef.bicolorType === 'center_black' && (
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[34%] bg-slate-950 shadow-sm border-y border-black/30 pointer-events-none" />
        )}

        {/* Empty left side */}
        <div className="flex-1" />

        {/* Rank Bar (Tarja) on the right */}
        <div 
          className={`h-full ${beltDef.barBgClass} ${barWidthClass} relative z-20 flex items-center justify-evenly px-0.5 border-l border-black/40 shrink-0`}
        >
          {/* Black Belt White Tip (Ponteira de Atleta/Instrutor) */}
          {beltDef.id === 'black' && (
            <>
              <div className="absolute left-0 inset-y-0 w-[2px] bg-white pointer-events-none" />
              <div className="absolute right-0 inset-y-0 w-[2px] bg-white pointer-events-none" />
            </>
          )}

          {/* Degrees / Stripes */}
          {Array.from({ length: Math.min(4, Math.max(0, stripes)) }).map((_, i) => (
            <span
              key={i}
              className={`${stripeWidth} bg-white shadow-sm rounded-[0.5px] z-30`}
            />
          ))}
        </div>
      </div>

      {showLabel && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`font-bold tracking-wide capitalize ${beltDef.textColorClass} ${size === 'hero' ? 'text-base' : 'text-xs'}`}>
            Faixa {beltDef.name} {stripes > 0 ? `• ${stripes}º Grau` : '• Lisa'}
          </span>
          {showDivisionBadge && beltDef.category === 'kids' && (
            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full">
              Kids IBJJF
            </span>
          )}
        </div>
      )}
    </div>
  );
};
