import React, { useEffect, useState } from 'react';
import { Satellite, Flame, ShieldAlert, Cpu } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "ACQUIRING ORBITAL TELEMETRY...",
    "SYNCING VIIRS NOAA-20 (375M) & MODIS...",
    "BUFFERING TAMIL NADU INDUSTRIAL MESH...",
    "INITIALIZING XGBOOST & TREESHAP ENGINE...",
    "NTRO TACTICAL COMMAND ONLINE."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 300);
          return 100;
        }
        const next = prev + 5;
        if (next > 20 && next <= 40) setCurrentStep(1);
        else if (next > 40 && next <= 65) setCurrentStep(2);
        else if (next > 65 && next <= 90) setCurrentStep(3);
        else if (next > 90) setCurrentStep(4);
        return next;
      });
    }, 45);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-[#050816] flex flex-col items-center justify-center p-4 bg-grid-pattern">
      <div className="w-full max-w-md text-center space-y-6">
        
        {/* Animated Radar Pulse Center */}
        <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-thermal/40 animate-ping" />
          <div className="absolute inset-2 rounded-full border border-ai/40 animate-pulse" />
          <div className="w-20 h-20 rounded-full bg-space-900 border border-white/20 flex items-center justify-center shadow-thermal-glow">
            <Flame className="w-10 h-10 text-thermal animate-bounce" />
          </div>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-xl font-black tracking-wider text-white uppercase">
            Industrial Thermal Intelligence
          </h2>
          <div className="text-xs font-mono text-ai-light mt-1">
            NTRO COMMAND CENTER // SIH26162
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-space-850 h-2 rounded-full overflow-hidden border border-white/10">
            <div 
              className="bg-gradient-to-r from-thermal via-orange-500 to-ai h-full rounded-full transition-all duration-75 shadow-thermal-glow"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="text-geo-light">{steps[currentStep]}</span>
            <span className="text-white font-bold">{progress}%</span>
          </div>
        </div>

        {/* Skip button */}
        <div>
          <button
            onClick={onComplete}
            className="text-[11px] font-mono text-slate-500 hover:text-white transition-colors underline"
          >
            Skip Initialization &rarr;
          </button>
        </div>

      </div>
    </div>
  );
};
