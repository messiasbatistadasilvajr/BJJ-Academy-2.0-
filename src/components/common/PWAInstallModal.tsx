import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Share2, PlusSquare, X, CheckCircle, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700/80 p-5 text-slate-100 shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 mb-3 mx-auto">
            <Smartphone className="w-6 h-6" />
          </div>

          <h3 className="text-base font-bold text-center text-white mb-1">
            Instalar BJJ Academy no Celular
          </h3>
          <p className="text-xs text-center text-slate-400 mb-5">
            Acesse direto da tela inicial, em tela cheia com resposta rápida, modo offline e biometria.
          </p>

          {isInstalled ? (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/50 text-center space-y-2">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-xs font-semibold text-emerald-300">
                O aplicativo já está instalado no seu aparelho!
              </p>
            </div>
          ) : isInstallable ? (
            <div className="space-y-3">
              <button
                onClick={handleInstallClick}
                className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-red-900/40"
              >
                <Download className="w-4 h-4" /> Instalar Aplicativo Agora
              </button>
              <p className="text-[11px] text-center text-slate-500">
                Compatível com Android (Chrome/Edge) e computadores
              </p>
            </div>
          ) : (
            // iOS Guide or General Browser guide
            <div className="space-y-3 rounded-2xl bg-slate-950/80 border border-slate-800 p-4 text-left">
              <div className="text-xs font-bold text-slate-200 mb-2 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-blue-400" />
                Como instalar no iPhone / iPad (Safari):
              </div>
              <ol className="space-y-2.5 text-xs text-slate-300 list-decimal list-inside">
                <li>
                  No navegador Safari, toque no botão <strong className="text-white">Compartilhar</strong> (ícone com quadrado e seta para cima).
                </li>
                <li>
                  Role para baixo e toque em <strong className="text-white flex items-center gap-1.5 inline"><PlusSquare className="w-3.5 h-3.5 text-slate-400 inline" /> Adicionar à Tela de Início</strong>.
                </li>
                <li>
                  Toque em <strong className="text-red-400">Adicionar</strong> no canto superior direito.
                </li>
              </ol>
            </div>
          )}

          <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
            >
              Fechar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
