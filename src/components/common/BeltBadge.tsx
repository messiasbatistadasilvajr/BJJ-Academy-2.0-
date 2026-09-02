import React from 'react';
import { BeltColor } from '../../types';

interface BeltBadgeProps {
  belt: BeltColor;
  stripes?: number;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showLabel?: boolean;
}

const BELT_CONFIG: Record<BeltColor, { name: string; bg: string; border: string; barBg: string; text: string }> = {
  white: {
    name: 'Branca',
    bg: 'bg-white',
    border: 'border-slate-300 shadow-inner',
    barBg: 'bg-slate-900',
    text: 'text-slate-800'
  },
  grey: {
    name: 'Cinza',
    bg: 'bg-slate-400',
    border: 'border-slate-500',
    barBg: 'bg-slate-900',
    text: 'text-slate-200'
  },
  yellow: {
    name: 'Amarela',
    bg: 'bg-amber-400',
    border: 'border-amber-500',
    barBg: 'bg-slate-900',
    text: 'text-amber-400'
  },
  orange: {
    name: 'Laranja',
    bg: 'bg-orange-500',
    border: 'border-orange-600',
    barBg: 'bg-slate-900',
    text: 'text-orange-400'
  },
  green: {
    name: 'Verde',
    bg: 'bg-emerald-600',
    border: 'border-emerald-700',
    barBg: 'bg-slate-900',
    text: 'text-emerald-400'
  },
  blue: {
    name: 'Azul',
    bg: 'bg-blue-600',
    border: 'border-blue-700',
    barBg: 'bg-slate-900',
    text: 'text-blue-400'
  },
  purple: {
    name: 'Roxa',
    bg: 'bg-purple-700',
    border: 'border-purple-800',
    barBg: 'bg-slate-900',
    text: 'text-purple-400'
  },
  brown: {
    name: 'Marrom',
    bg: 'bg-amber-900',
    border: 'border-amber-950',
    barBg: 'bg-slate-900',
    text: 'text-amber-600'
  },
  black: {
    name: 'Preta',
    bg: 'bg-slate-950',
    border: 'border-slate-800',
    barBg: 'bg-red-600', // Tarja vermelha
    text: 'text-red-500'
  }
};

export const BeltBadge: React.FC<BeltBadgeProps> = ({
  belt,
  stripes = 0,
  size = 'md',
  showLabel = true,
}) => {
  const config = BELT_CONFIG[belt] || BELT_CONFIG.white;

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

  return (
    <div className="inline-flex items-center gap-2">
      {/* Belt Graphic */}
      <div
        className={`relative overflow-hidden rounded-sm flex items-center justify-between border ${config.bg} ${config.border} ${sizeClasses}`}
        title={`Faixa ${config.name} (${stripes} graus)`}
      >
        {/* Subtle fabric stitch lines */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-black/10 pointer-events-none" />

        {/* Empty left side */}
        <div className="flex-1" />

        {/* Black/Red Rank Bar (Tarja) on the right */}
        <div className={`h-full ${config.barBg} ${barWidthClass} flex items-center justify-evenly px-0.5 border-l border-black/30 shrink-0`}>
          {Array.from({ length: Math.min(4, Math.max(0, stripes)) }).map((_, i) => (
            <span
              key={i}
              className={`${stripeWidth} bg-white shadow-sm rounded-[0.5px]`}
            />
          ))}
        </div>
      </div>

      {showLabel && (
        <span className={`font-semibold tracking-wide capitalize ${config.text} ${size === 'hero' ? 'text-base' : 'text-xs'}`}>
          Faixa {config.name} {stripes > 0 ? `• ${stripes}º Grau` : '• Lisa'}
        </span>
      )}
    </div>
  );
};
