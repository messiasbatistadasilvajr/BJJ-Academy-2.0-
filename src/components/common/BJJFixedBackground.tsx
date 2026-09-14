import React from 'react';

interface BJJFixedBackgroundProps {
  opacity?: number;
  className?: string;
  overlayClassName?: string;
}

/**
 * Imagem Fixa de Fundo: Dois lutadores de Jiu-Jitsu em combate no tatame
 * Permanece estática ao fundo enquanto o conteúdo das telas principais desliza suavemente.
 */
export const BJJFixedBackground: React.FC<BJJFixedBackgroundProps> = ({
  opacity = 0.38,
  className = '',
  overlayClassName = '',
}) => {
  return (
    <div 
      className={`absolute inset-0 pointer-events-none z-0 overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      {/* Imagem de Alta Resolução dos Dois Lutadores de BJJ */}
      <img
        src="/bjj_fighters_bg.jpg"
        alt="Dois Lutadores de Jiu-Jitsu no Tatame"
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover object-center scale-105 filter contrast-115 brightness-95"
        style={{ opacity }}
      />

      {/* Camadas de Gradiente e Vinheta Cinematográfica Marcial */}
      <div 
        className={`absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/50 to-slate-950/90 ${overlayClassName}`} 
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-slate-950/30 to-slate-950/80" />
      
      {/* Sutil brilho de iluminação de borda vermelho/dourado */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
};
