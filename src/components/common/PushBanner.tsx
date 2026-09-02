import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Volume2 } from 'lucide-react';
import { PushNotification } from '../../types';

interface PushBannerProps {
  notification: PushNotification | null;
  onDismiss: () => void;
  onOpen: () => void;
  academyName?: string;
  onReplayVoice?: () => void;
}

export const PushBanner: React.FC<PushBannerProps> = ({
  notification,
  onDismiss,
  onOpen,
  academyName = 'BJJ Academy',
  onReplayVoice,
}) => {
  if (!notification) return null;

  return (
    <AnimatePresence>
      <div className="fixed top-2 inset-x-2 z-50 flex justify-center pointer-events-none">
        <motion.div
          initial={{ y: -60, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -60, opacity: 0, scale: 0.95 }}
          className="pointer-events-auto w-full max-w-sm rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 p-3 shadow-2xl flex items-start gap-3 cursor-pointer hover:bg-slate-800/90 transition"
          onClick={onOpen}
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 shrink-0 shadow-md">
            <Bell className="w-4 h-4 stroke-[2.5]" />
          </div>

          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide truncate">
                  {academyName}
                </span>
                <span className="text-[9px] bg-yellow-400/20 text-yellow-300 px-1.5 py-0.2 rounded font-bold flex items-center gap-0.5">
                  <Volume2 size={9} /> Voz Ativa
                </span>
              </div>
              <span className="text-[10px] text-slate-500">{notification.timestamp}</span>
            </div>
            <h4 className="text-xs font-bold text-white truncate">{notification.title}</h4>
            <p className="text-[11px] text-slate-300 line-clamp-2 leading-tight mt-0.5">
              {notification.body}
            </p>

            {onReplayVoice && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReplayVoice();
                }}
                className="mt-1 text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 hover:underline"
              >
                <Volume2 size={11} /> Ouvir voz da academia novamente
              </button>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            className="p-1 rounded-full text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
