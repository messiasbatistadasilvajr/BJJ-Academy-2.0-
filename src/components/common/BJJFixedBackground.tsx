import React from 'react';

interface BJJFixedBackgroundProps {
  opacity?: number;
  className?: string;
  overlayClassName?: string;
}

/**
 * Imagem Fixa de Fundo: Dois lutadores de Jiu-Jitsu em combate no tatame
 * Permanece 100% nítida e visível ao fundo, com enquadramento completo dos atletas
 * e do tatame na parte de cima, adaptando-se perfeitamente a celular (retrato) e computador (paisagem).
 */
export const BJJFixedBackground: React.FC<BJJFixedBackgroundProps> = ({
  opacity = 0.72,
  className = '',
  overlayClassName = '',
}) => {
  return (
    <div 
      className={`absolute inset-0 pointer-events-none z-0 overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      {/* Imagem Adaptativa: Retrato no celular e Paisagem no computador */}
      <picture className="w-full h-full block">
        {/* Celular e telas verticais (proporção 9:16 - ação completa do topo ao chão) */}
        <source media="(max-aspect-ratio: 1/1)" srcSet="/bjj_fighters_portrait.jpg" />
        {/* Computadores e telas panorâmicas (16:9 widescreen) */}
        <source media="(min-aspect-ratio: 1/1)" srcSet="/bjj_fighters_bg.jpg" />
        <img
          src="/bjj_fighters_portrait.jpg"
          alt="Dois Lutadores de Jiu-Jitsu no Tatame"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-top scale-100 filter contrast-115 brightness-110"
          style={{ opacity }}
        />
      </picture>

      {/* Camadas de Gradiente Suave com Topo Translúcido para Máxima Visibilidade da Ação */}
      <div 
        className={`absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/25 to-slate-950/80 ${overlayClassName}`} 
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-transparent via-transparent to-slate-950/60" />
      
      {/* Sutil brilho de iluminação marcial */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
};
