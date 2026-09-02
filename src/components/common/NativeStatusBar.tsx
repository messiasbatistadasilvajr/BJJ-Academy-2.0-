import React, { useState, useEffect } from 'react';
import { Wifi, Battery } from 'lucide-react';

interface NativeStatusBarProps {
  os: 'ios' | 'android';
  dynamicIslandContent?: string | null;
}

export const NativeStatusBar: React.FC<NativeStatusBarProps> = ({
  os,
  dynamicIslandContent,
}) => {
  const [time, setTime] = useState('19:42');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    };
    update();
    const timer = setInterval(update, 10000);
    return () => clearInterval(timer);
  }, []);

  if (os === 'android') {
    return (
      <div className="w-full h-8 px-5 flex items-center justify-between text-xs text-slate-300 select-none bg-transparent shrink-0">
        <span className="font-medium text-[11px] tracking-tight">{time}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold">5G</span>
          <Wifi className="w-3.5 h-3.5" />
          <div className="flex items-center gap-0.5">
            <span className="text-[10px]">87%</span>
            <Battery className="w-4 h-4 fill-slate-200 text-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  // iOS Style with Dynamic Island
  return (
    <div className="relative w-full h-11 px-6 flex items-center justify-between text-xs text-slate-100 select-none bg-transparent shrink-0 z-20">
      {/* Time */}
      <span className="font-semibold text-sm tracking-tight">{time}</span>

      {/* Dynamic Island */}
      <div className="absolute left-1/2 -translate-x-1/2 top-2 h-6 px-3 min-w-[90px] rounded-full bg-black border border-slate-800/60 shadow-lg flex items-center justify-center gap-2">
        {dynamicIslandContent ? (
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="truncate max-w-[110px]">{dynamicIslandContent}</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700/80" />
            <div className="w-2 h-2 rounded-full bg-blue-950 border border-blue-900/60" />
          </div>
        )}
      </div>

      {/* Cellular, Wifi, Battery */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-bold tracking-tighter">5G</span>
        <Wifi className="w-3.5 h-3.5" />
        <div className="w-5 h-2.5 rounded-[3px] border border-slate-300 p-0.5 flex items-center">
          <div className="w-3.5 h-full bg-slate-100 rounded-[1px]" />
        </div>
      </div>
    </div>
  );
};
