'use client';

import React, { useState, useEffect } from 'react';

export const TimecodeHUD: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [timecode, setTimecode] = useState('00:00:00:00');
  const isRecording = true;

  useEffect(() => {
    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      const hours = String(Math.floor(frame / (24 * 3600))).padStart(2, '0');
      const minutes = String(Math.floor((frame % (24 * 3600)) / (24 * 60))).padStart(2, '0');
      const seconds = String(Math.floor((frame % (24 * 60)) / 24)).padStart(2, '0');
      const frames = String(frame % 24).padStart(2, '0');
      setTimecode(`${hours}:${minutes}:${seconds}:${frames}`);
    }, 1000 / 24);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`flex items-center justify-between text-[11px] font-mono-tech text-zinc-400 bg-black/60 backdrop-blur-xs border border-white/10 px-3 py-1.5 ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-bold">
          <span
            className={`w-2 h-2 rounded-full transition-opacity duration-300 ${
              isRecording ? 'bg-red-500 animate-pulse' : 'bg-zinc-600'
            }`}
          />
          <span className="text-red-400 tracking-wider">REC</span>
        </div>
        <span className="text-white font-bold tracking-widest">{timecode}</span>
        <span className="hidden sm:inline-block text-zinc-500">|</span>
        <span className="hidden sm:inline-block text-zinc-300">24.00 FPS</span>
      </div>

      <div className="flex items-center gap-3 text-zinc-400">
        <span className="text-[#FFE500] font-semibold">ARRI ALEXA 4K RAW</span>
        <span className="hidden md:inline text-zinc-500">SHUTTER 180.0°</span>
        <span className="hidden lg:inline text-zinc-500">ISO 800</span>
        <div className="w-6 h-2.5 border border-zinc-500 p-0.5 flex items-center">
          <div className="w-full h-full bg-[#FFE500]"></div>
        </div>
      </div>
    </div>
  );
};
