import React, { useState, useEffect } from 'react';
import { 
  Satellite, 
  Flame, 
  BrainCircuit, 
  BarChart3, 
  FileText, 
  Volume2, 
  VolumeX, 
  ShieldAlert, 
  Activity, 
  Clock,
  Crosshair,
  Smartphone,
  KeyRound
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  criticalAlertsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  criticalAlertsCount 
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [timeMode, setTimeMode] = useState<'IST' | 'UTC'>('IST');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [commanderPhone, setCommanderPhone] = useState(() => 
    localStorage.getItem('ntro_commander_phone') || '+91 98765 43210'
  );
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      if (timeMode === 'UTC') {
        setCurrentTime(now.toUTCString().slice(17, 25) + ' UTC');
      } else {
        // IST = UTC+5:30
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istDate = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + istOffset);
        const hours = String(istDate.getHours()).padStart(2, '0');
        const mins = String(istDate.getMinutes()).padStart(2, '0');
        const secs = String(istDate.getSeconds()).padStart(2, '0');
        setCurrentTime(`${hours}:${mins}:${secs} IST`);
      }
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [timeMode]);

  const toggleSound = () => {
    soundFx.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) soundFx.playClick();
  };

  const navItems = [
    { id: 'home', label: 'Overview', icon: Satellite },
    { id: 'dashboard', label: 'Command Map', icon: Crosshair, badge: criticalAlertsCount ? `${criticalAlertsCount} ALERT` : undefined },
    { id: 'explainability', label: 'AI Explainability (SHAP)', icon: BrainCircuit },
    { id: 'analytics', label: 'Analytics Hub', icon: BarChart3 },
    { id: 'about', label: 'Mission Dossier', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#050816]/90 backdrop-blur-md border-b border-white/10 shadow-2xl">
      {/* Top Telemetry Marquee */}
      <div className="bg-space-950/80 px-4 py-1 border-b border-white/5 text-[11px] font-mono flex items-center justify-between text-slate-400 overflow-hidden">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-geo opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-geo"></span>
            </span>
            <span className="text-geo-light font-semibold">SAT-DOWNLINK ACTIVE</span>
          </div>
          <span className="hidden md:inline text-slate-500">|</span>
          <span className="hidden md:inline text-slate-400">
            CONSTELLATIONS: <span className="text-white">VIIRS NOAA-20 / MODIS AQUA / INSAT-3DR</span>
          </span>
          <span className="hidden lg:inline text-slate-500">|</span>
          <span className="hidden lg:inline text-slate-400">
            TARGET SECTOR: <span className="text-thermal-light font-medium">TAMIL NADU & PENINSULAR SHIELD</span>
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Commander Alert Mobile Indicator */}
          <div className="flex items-center space-x-1.5 bg-cyan-950/40 border border-cyan-500/40 px-2.5 py-0.5 rounded-lg text-[10px]">
            <Smartphone className="w-3 h-3 text-cyan-400" />
            <span className="text-slate-400 hidden sm:inline">ALERT MOBILE:</span>
            {isEditingPhone ? (
              <input
                type="tel"
                value={commanderPhone}
                onChange={(e) => setCommanderPhone(e.target.value)}
                onBlur={() => {
                  setIsEditingPhone(false);
                  localStorage.setItem('ntro_commander_phone', commanderPhone);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsEditingPhone(false);
                    localStorage.setItem('ntro_commander_phone', commanderPhone);
                  }
                }}
                className="bg-black/90 border border-cyan-400 rounded px-1 text-white text-[10px] focus:outline-none w-28"
                autoFocus
              />
            ) : (
              <span 
                onClick={() => setIsEditingPhone(true)}
                className="text-cyan-300 font-bold hover:underline cursor-pointer flex items-center space-x-1"
                title="Click to edit mobile number for direct SMS alerts"
              >
                <span>{commanderPhone}</span>
                <span className="text-[9px] text-emerald-400 font-semibold">● LIVE</span>
              </span>
            )}
          </div>

          {/* Telco Gateway Key Config Button */}
          <button
            onClick={() => {
              const current = localStorage.getItem('fast2sms_key') || '';
              const key = window.prompt('Enter your Fast2SMS API Key for direct cellular SMS delivery to Indian SIMs (Airtel/Jio/Vi):\n(Get free ₹50 credits at fast2sms.com - Dev API section)', current);
              if (key !== null) {
                localStorage.setItem('fast2sms_key', key.trim());
                alert(key.trim() ? '✓ Fast2SMS Telco Key Saved! Real SMS will now be transmitted to ' + commanderPhone : 'API key cleared.');
              }
            }}
            className="flex items-center space-x-1 px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono transition-colors"
            title="Configure Fast2SMS API key for real cellular SMS transmission"
          >
            <KeyRound className="w-2.5 h-2.5 text-amber-400" />
            <span className="hidden sm:inline">SMS GATEWAY KEY</span>
          </button>

          <div 
            onClick={() => setTimeMode(m => m === 'IST' ? 'UTC' : 'IST')}
            className="flex items-center space-x-1 cursor-pointer hover:text-white transition-colors bg-white/5 px-2 py-0.5 rounded"
            title="Click to toggle IST / UTC"
          >
            <Clock className="w-3 h-3 text-cyan-400" />
            <span className="text-cyan-300 font-semibold">{currentTime}</span>
          </div>
          <button 
            onClick={toggleSound} 
            className="text-slate-400 hover:text-white transition-colors p-1"
            title={soundEnabled ? 'Mute Tactical Audio' : 'Unmute Tactical Audio'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-slate-300" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div 
            onClick={() => { setActiveTab('home'); soundFx.playClick(); }}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="relative p-2 bg-gradient-to-br from-space-800 to-space-900 rounded-xl border border-thermal/30 group-hover:border-thermal transition-all shadow-thermal-glow">
              <Flame className="w-6 h-6 text-thermal animate-pulse" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-ai rounded-full ring-2 ring-[#050816]"></div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-black tracking-wider text-white uppercase group-hover:text-thermal transition-colors">
                  Thermal<span className="text-thermal">Intel</span>
                </span>
                <span className="px-1.5 py-0.5 bg-ai/20 text-ai-light border border-ai/40 rounded text-[10px] font-mono font-bold tracking-widest">
                  NTRO SIH26162
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono tracking-tight hidden sm:block">
                ISRO/NTRO Geospatial Satellite Anomaly Command Center
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    soundFx.playClick();
                  }}
                  className={`relative flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    isActive 
                      ? 'bg-white/10 text-white border border-white/20 shadow-lg' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-thermal' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-critical text-white animate-pulse">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-thermal via-ai to-geo rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action Header Button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setActiveTab(activeTab === 'dashboard' ? 'analytics' : 'dashboard');
                soundFx.playAlert();
              }}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider bg-gradient-to-r from-critical/80 to-thermal/90 hover:from-critical hover:to-thermal text-white shadow-critical-glow border border-critical/50 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <ShieldAlert className="w-4 h-4 animate-bounce" />
              <span>{activeTab === 'dashboard' ? 'Telemetry Feed' : 'Live Command'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="lg:hidden flex items-center justify-between py-2 border-t border-white/5 overflow-x-auto space-x-2 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  soundFx.playClick();
                }}
                className={`flex-shrink-0 flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium ${
                  isActive 
                    ? 'bg-thermal/20 text-thermal border border-thermal/40 font-semibold' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label.split(' ')[0]}</span>
                {item.badge && (
                  <span className="w-2 h-2 rounded-full bg-critical inline-block" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
