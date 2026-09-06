import React from 'react';
import { Satellite, ShieldAlert, Heart, ExternalLink, Terminal } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-space-950 border-t border-white/10 text-slate-400 text-xs font-mono py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left Column: Organization & Classification */}
        <div className="flex items-center space-x-3 text-center md:text-left">
          <div className="p-2 bg-space-900 border border-white/10 rounded-lg text-thermal">
            <Satellite className="w-5 h-5" />
          </div>
          <div>
            <div className="text-white font-bold tracking-wider uppercase text-sm">
              Industrial Thermal Intelligence
            </div>
            <div className="text-[11px] text-slate-500">
              National Technical Research Organisation (NTRO) • SIH 2026 Grand Finale
            </div>
          </div>
        </div>

        {/* Center: Classification Tag */}
        <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-slate-400 tracking-widest text-center">
          RESTRICTED PROTOCOL // DEFENSE INTELLIGENCE DISPATCH ENGINE
        </div>

        {/* Right: Technical Badges */}
        <div className="flex items-center space-x-4 text-[11px]">
          <span className="text-geo-light flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-geo-light animate-ping" />
            <span>VIIRS & MODIS TELEMETRY SYNCED</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">TRL-7 READY</span>
        </div>

      </div>
    </footer>
  );
};
