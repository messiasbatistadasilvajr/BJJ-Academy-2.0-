import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, Share2, PlusSquare, X, CheckCircle, Smartphone, 
  RotateCcw, Copy, Check, ExternalLink, HelpCircle, AlertCircle, 
  Sparkles, MoreVertical, ArrowUpRight, Trash2, RefreshCw
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
  const { 
    isInstallable, 
    isInstalled, 
    isIOS, 
    isAndroid, 
    isIframe, 
    install, 
    forceReinstall,
    openInNativeChrome,
    clearCacheAndReload
  } = usePWAInstall();

  const [activePlatform, setActivePlatform] = useState<'android' | 'ios'>(() => isIOS ? 'ios' : 'android');
  const [copiedLink, setCopiedLink] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showChromeVisualGuide, setShowChromeVisualGuide] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    triggerNativeHaptic('medium');
    setIsProcessing(true);
    
    if (isIframe) {
      triggerNativeHaptic('warning');
      setStatusFeedback('Você está visualizando o app em modo de prévia. Abrindo diretamente no navegador do celular para liberar a instalação...');
      setTimeout(() => {
        openInNativeChrome();
        setIsProcessing(false);
      }, 700);
      return;
    }

    const success = await install();
    setIsProcessing(false);
    if (success) {
      triggerNativeHaptic('success');
      onClose();
    } else {
      triggerNativeHaptic('warning');
      setShowChromeVisualGuide(true);
      setStatusFeedback('O Android solicitou a instalação pelo menu do Google Chrome. Veja o passo a passo ilustrado abaixo:');
    }
  };

  const handleForceReinstall = async () => {
    triggerNativeHaptic('medium');
    setIsProcessing(true);
    forceReinstall();

    // If inside an iframe (like preview mode), browser never allows PWA install inside the frame
    if (isIframe) {
      triggerNativeHaptic('warning');
      setStatusFeedback('Abrindo o aplicativo diretamente no Google Chrome do seu celular para permitir a instalação fora do frame...');
      setTimeout(() => {
        openInNativeChrome();
        setIsProcessing(false);
      }, 700);
      return;
    }

    // Try triggering prompt if browser holds it
    const success = await install();
    setIsProcessing(false);

    if (success) {
      triggerNativeHaptic('success');
      setStatusFeedback('Instalação autorizada com sucesso!');
      setTimeout(() => onClose(), 1200);
    } else {
      triggerNativeHaptic('warning');
      setShowChromeVisualGuide(true);
      setStatusFeedback('O Android detectou uma versão anterior ou bloqueou a janela automática. Siga o passo a passo abaixo para concluir em 2 cliques:');
    }
  };

  const handleOpenChrome = () => {
    triggerNativeHaptic('light');
    openInNativeChrome();
  };

  const handleCopyLink = () => {
    triggerNativeHaptic('light');
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {
      // Fallback
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleClearCache = async () => {
    triggerNativeHaptic('warning');
    setIsProcessing(true);
    setStatusFeedback('Limpando dados em cache e service worker...');
    await clearCacheAndReload();
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
          className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700/80 p-5 text-slate-100 shadow-2xl my-auto max-h-[92vh] overflow-y-auto"
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
          <p className="text-xs text-center text-slate-400 mb-3">
            BJJ Academy 2.0 • Acesso em tela cheia, offline e com alta performance
          </p>

          {/* Platform Switcher */}
          <div className="flex p-1 rounded-2xl bg-slate-950 border border-slate-800 mb-3.5">
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
            <div className="space-y-3">
              {/* If preview mode / iframe detected */}
              {isIframe && (
                <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-left space-y-1">
                  <div className="flex items-center gap-2 text-blue-300 text-xs font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0 text-blue-400" />
                    <span>Visualização Prévia Detectada</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    O Android impede a instalação de aplicativos quando executados dentro de uma janela de prévia. Toque no botão vermelho abaixo para abrir diretamente no Google Chrome e instalar!
                  </p>
                </div>
              )}

              {/* Already installed alert */}
              {isInstalled && !isIframe && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left space-y-1">
                  <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>O Android acusa que o app já está cadastrado</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Mesmo falando que já está instalado, você pode forçar a reinstalação ou recriar o ícone tocando no botão vermelho abaixo.
                  </p>
                </div>
              )}

              {/* Status or feedback message */}
              {statusFeedback && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-amber-300 flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400 animate-pulse" />
                  <span className="leading-relaxed">{statusFeedback}</span>
                </div>
              )}

              {/* Primary Action Button: Reinstall */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleForceReinstall}
                  disabled={isProcessing}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-black transition flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                  <span>{isProcessing ? 'Processando Reinstalação...' : 'Reinstalar Aplicativo no Android Agora'}</span>
                </button>

                {/* Secondary Button: Direct Open in Chrome */}
                <button
                  type="button"
                  onClick={handleOpenChrome}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Abrir Diretamente no Google Chrome</span>
                </button>
              </div>

              {/* Visual Illustrated Guide for Google Chrome on Android */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-3">
                <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-red-500" />
                    Como Reinstalar pelo Menu do Chrome:
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">100% Garantido</span>
                </div>

                {/* Illustrated Chrome Top Bar Mockup */}
                <div className="rounded-xl bg-slate-900 border border-slate-700 p-2.5 space-y-2">
                  <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400">
                    <span className="truncate">bjj-academy...run.app</span>
                    <div className="flex items-center gap-2 text-white">
                      <span className="px-1.5 py-0.5 rounded bg-red-600 text-[10px] font-sans font-bold text-white animate-pulse">
                        Passo 1 ➔
                      </span>
                      <div className="p-1 rounded bg-slate-800 text-amber-400 border border-amber-500/40">
                        <MoreVertical className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-850 text-[11px] text-slate-300 space-y-1.5 border border-slate-800">
                    <div className="flex items-center justify-between text-slate-400 text-[10px]">
                      <span>Menu suspenso do Google Chrome:</span>
                    </div>
                    <div className="p-2 rounded-lg bg-red-600/20 border border-red-500/50 text-white font-bold flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-red-400" />
                        <span>Instalar aplicativo (ou Adicionar à tela)</span>
                      </div>
                      <span className="text-[10px] bg-red-600 px-1.5 py-0.5 rounded text-white font-bold">
                        Passo 2
                      </span>
                    </div>
                  </div>
                </div>

                {/* Steps Text */}
                <ol className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <span>
                      Toque nos <strong>3 pontinhos verticais (⋮)</strong> no canto superior direito do Chrome.
                    </span>
                  </li>

                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <span>
                      Selecione <strong className="text-white">"Instalar aplicativo"</strong> ou <strong className="text-white">"Adicionar à tela inicial"</strong>.
                    </span>
                  </li>

                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      <strong className="text-amber-400">Dica se o celular não criar o ícone novo:</strong> Vá na tela inicial do celular, segure o ícone antigo do <em>BJJ Academy</em> e toque em <strong>Desinstalar</strong>. Depois retorne aqui e toque em instalar.
                    </span>
                  </li>
                </ol>
              </div>

              {/* Utility Tools */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition border border-slate-700 cursor-pointer"
                  title="Copiar link para colar na barra de endereços do Chrome"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearCache}
                  disabled={isProcessing}
                  className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition border border-slate-700 cursor-pointer disabled:opacity-50"
                  title="Limpar Service Worker e Cache e Recarregar"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isProcessing ? 'animate-spin' : ''}`} />
                  <span>Limpar Cache</span>
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
          <div className="mt-3.5 pt-3 border-t border-slate-800 flex justify-end">
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
