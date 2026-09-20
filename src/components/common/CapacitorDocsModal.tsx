import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Layers, Copy, Check, Terminal, Apple, Play, Globe, Shield, Sparkles } from 'lucide-react';

interface CapacitorDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CapacitorDocsModal: React.FC<CapacitorDocsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyCode = (code: string, idx: number) => {
    navigator.clipboard?.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      title: '1. Sincronizar Web & Android',
      desc: 'Compila a aplicação React/Vite e copia os assets para o Android nativo:',
      code: 'npm run cap:build'
    },
    {
      title: '2. Gerar Chave de Assinatura (Keystore)',
      desc: 'Cria o arquivo release-key.jks para assinar o pacote na Google Play:',
      code: 'keytool -genkey -v -keystore release-key.jks -alias bjjacademy -keyalg RSA -keysize 2048 -validity 10000'
    },
    {
      title: '3. Configurar android/key.properties',
      desc: 'Configura o caminho da chave e senhas (ignorado no git):',
      code: 'RELEASE_STORE_FILE=../release-key.jks\nRELEASE_STORE_PASSWORD=sua_senha\nRELEASE_KEY_ALIAS=bjjacademy\nRELEASE_KEY_PASSWORD=sua_senha'
    },
    {
      title: '4. Compilar o Pacote .AAB de Produção',
      desc: 'Gera o bundle otimizado pronto para upload no Google Play Console:',
      code: 'cd android\n./gradlew bundleRelease'
    },
    {
      title: '5. Localização do .AAB Final',
      desc: 'Arquivo gerado para upload no Google Play Console:',
      code: 'android/app/build/outputs/bundle/release/app-release.aab'
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/80 p-5 text-slate-100 shadow-2xl flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Arquitetura Mobile 2.0 BJJ</h3>
                <span className="text-[10px] text-slate-400">Web + PWA + Android (Play Store) + iOS (App Store)</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto py-3 space-y-4 pr-1 text-xs">
            {/* Architecture Diagram */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 leading-tight">
              <div className="text-center font-bold text-red-400 pb-1">ESTRUTURA MULTI-CANAL BJJ ACADEMY</div>
              <pre className="text-slate-400 text-center py-1">
{`             ┌─────────────────────────┐
             │     BJJ-ACADEMY         │
             │     CORE PLATFORM       │
             └────────────┬────────────┘
                          │
                 ┌────────┴────────┐
                 │                 │
              WEB/PWA          CAPACITOR
                 │                 │
             Navegador       ┌─────┴─────┐
                             │           │
                          Android       iOS`}
              </pre>
            </div>

            {/* Apple Guidelines Note */}
            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-[11px]">
                <Shield className="w-3.5 h-3.5" /> Requisito Apple Store (Diretriz 4.2 - Minimum Functionality)
              </div>
              <p className="text-[10px] text-amber-200/80 leading-relaxed">
                A Apple rejeita sites que são apenas encapsulados em WebView. O BJJ Academy Mobile 2.0 atende a isso utilizando:
                câmera nativa para fotos de presença, biometria local (Face ID), notificações push, cache offline e navegação tátil por perfil.
              </p>
            </div>

            {/* Steps with code */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-200">Comandos para compilação local / CI:</div>
              {steps.map((st, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <div className="font-semibold text-white flex items-center justify-between">
                    <span>{st.title}</span>
                    <button
                      onClick={() => copyCode(st.code, i)}
                      className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded"
                    >
                      {copiedIndex === i ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedIndex === i ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">{st.desc}</p>
                  <div className="bg-slate-900 rounded-lg p-2 font-mono text-[10px] text-red-300 overflow-x-auto whitespace-pre">
                    {st.code}
                  </div>
                </div>
              ))}
            </div>

            {/* Platforms badging */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-center">
                <Globe className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                <div className="font-bold text-[11px] text-white">Web / PWA</div>
                <div className="text-[9px] text-slate-400">Qualquer tela</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-center">
                <Play className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <div className="font-bold text-[11px] text-white">Android</div>
                <div className="text-[9px] text-slate-400">Google Play AAB</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-center">
                <Apple className="w-4 h-4 text-slate-100 mx-auto mb-1" />
                <div className="font-bold text-[11px] text-white">iOS</div>
                <div className="text-[9px] text-slate-400">Apple App Store</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-800 shrink-0">
            <button
              onClick={onClose}
              className="w-full py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition"
            >
              Entendido, Fechar Guia
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
