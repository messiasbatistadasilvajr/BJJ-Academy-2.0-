import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, Share2, PlusSquare, X, CheckCircle, Smartphone, 
  RotateCcw, Copy, Check, ExternalLink, HelpCircle, AlertCircle, Sparkles
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { triggerNativeHaptic } from '../../utils/nativeApp';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install, forceReinstall } = usePWAInstall();
  const [activePlatform, setActivePlatform] = useState<'android' | 'ios'>(() => isIOS ? 'ios' : 'android');
  const [copiedLink, setCopiedLink] = useState(false);
  const [reinstallMessage, setReinstallMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    triggerNativeHaptic('medium');
    const success = await install();
    if (success) {
      triggerNativeHaptic('success');
      onClose();
    } else {
      triggerNativeHaptic('warning');
      setReinstallMessage('Para concluir no Android, toque no menu de 3 pontinhos (⋮) no topo do Chrome e selecione "Instalar aplicativo".');
    }
  };

  const handleForceReinstall = async () => {
    triggerNativeHaptic('medium');
    forceReinstall();
    setReinstallMessage('Modo de reinstalação ativado! Tentando acionar instalador nativo...');
    
    // Attempt prompt if possible
    const success = await install();
    if (success) {
      triggerNativeHaptic('success');
      onClose();
    } else {
      setReinstallMessage('Siga os 2 passos rápidos abaixo para reinstalar pelo menu do Google Chrome:');
    }
  };

  const handleCopyLink = () => {
    triggerNativeHaptic('light');
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleClearCacheAndReload = async () => {
    triggerNativeHaptic('warning');
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
        id="modal-pwa-install"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700/80 p-5 text-slate-100 shadow-2xl my-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header Icon */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 shadow-md">
              <Smartphone className="w-6 h-6" />
            </div>
          </div>

          <h3 className="text-base font-black text-center text-white">
            Instalar ou Reinstalar no Celular
          </h3>
          <p className="text-xs text-center text-slate-400 mb-4">
            BJJ Academy 2.0 • Acesso em tela cheia, offline e com alta performance
          </p>

          {/* Platform Switcher */}
          <div className="flex p-1 rounded-2xl bg-slate-950 border border-slate-800 mb-4">
            <button
              type="button"
              onClick={() => {
                triggerNativeHaptic('light');
                setActivePlatform('android');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                activePlatform === 'android'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🤖 Android (Chrome)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                triggerNativeHaptic('light');
                setActivePlatform('ios');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                activePlatform === 'ios'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🍎 iPhone / iPad (Safari)</span>
            </button>
          </div>

          {/* Android Section */}
          {activePlatform === 'android' && (
            <div className="space-y-3.5">
              {/* If browser flagged as already installed */}
              {isInstalled && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>O sistema informou que o app já está no aparelho</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Se você desinstalou o atalho ou deseja <strong>reinstalar do zero</strong>, clique no botão abaixo para forçar uma nova instalação ou siga os passos pelo menu do Chrome.
                  </p>
                </div>
              )}

              {/* Status Message if user triggered reinstall */}
              {reinstallMessage && (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-amber-300 flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                  <span>{reinstallMessage}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleForceReinstall}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reinstalar Aplicativo no Android Agora</span>
                </button>

                {isInstallable && (
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-red-400" />
                    <span>Abrir Janela Padrão de Instalação</span>
                  </button>
                )}
              </div>

              {/* Step-by-step Guide for Android Reinstallation */}
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 text-left space-y-2.5">
                <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-red-400" />
                  <span>Passo a passo no Google Chrome do Android:</span>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <span>
                      No Chrome, toque no menu de <strong>3 pontinhos verticais (⋮)</strong> no canto superior direito.
                    </span>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <span>
                      Toque na opção <strong className="text-white">"Instalar aplicativo"</strong> ou <strong className="text-white">"Adicionar à tela inicial"</strong>.
                    </span>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <span className="text-[11px] text-slate-400">
                      <strong>Caso o Android continue dizendo que já existe:</strong> segure o ícone antigo na tela inicial do celular e escolha <em>"Desinstalar"</em>, ou vá em <em>Configurações do Android &gt; Aplicativos &gt; BJJ Academy &gt; Desinstalar</em>. Em seguida, toque em Instalar aqui!
                    </span>
                  </div>
                </div>
              </div>

              {/* Utility Tools: Copy link & Clear Cache */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="py-2 px-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition border border-slate-700 cursor-pointer"
                  title="Copiar link para abrir diretamente no Google Chrome"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link Direto'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearCacheAndReload}
                  className="py-2 px-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition border border-slate-700 cursor-pointer"
                  title="Limpar Service Worker e Cache e Recarregar"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Limpar Cache e Recarregar</span>
                </button>
              </div>
            </div>
          )}

          {/* iOS Section */}
          {activePlatform === 'ios' && (
            <div className="space-y-3 rounded-2xl bg-slate-950/90 border border-slate-800 p-4 text-left">
              <div className="text-xs font-bold text-slate-200 mb-1 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-blue-400" />
                Como instalar ou reinstalar no iPhone / iPad (Safari):
              </div>
              <ol className="space-y-2.5 text-xs text-slate-300 list-decimal list-inside">
                <li>
                  No navegador Safari, toque no botão <strong className="text-white">Compartilhar</strong> (ícone do quadrado com seta para cima no rodapé).
                </li>
                <li>
                  Role para baixo e toque em <strong className="text-white flex items-center gap-1.5 inline"><PlusSquare className="w-3.5 h-3.5 text-slate-400 inline" /> Adicionar à Tela de Início</strong>.
                </li>
                <li>
                  Confirme tocando em <strong className="text-red-400 font-bold">Adicionar</strong> no canto superior direito.
                </li>
              </ol>
            </div>
          )}

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
