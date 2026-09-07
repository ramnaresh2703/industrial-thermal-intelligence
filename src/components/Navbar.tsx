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
  KeyRound,
  Wifi,
  Signal,
  Zap
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      if (timeMode === 'UTC') {
        setCurrentTime(now.toUTCString().slice(17, 25) + ' UTC');
      } else {
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
    { id: 'home',          label: 'Overview',             icon: Satellite },
    { id: 'dashboard',     label: 'Command Map',          icon: Crosshair,    badge: criticalAlertsCount ? `${criticalAlertsCount}` : undefined },
    { id: 'explainability',label: 'AI Explainability',    icon: BrainCircuit },
    { id: 'analytics',     label: 'Analytics Hub',        icon: BarChart3 },
    { id: 'about',         label: 'Mission Dossier',      icon: FileText },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-[#03050c]/98 shadow-[0_4px_40px_rgba(0,0,0,0.8)] border-b border-thermal/10' 
        : 'bg-[#03050c]/95 border-b border-white/08'
    } backdrop-blur-xl`}>

      {/* ── TOP TELEMETRY STRIP ── */}
      <div className="bg-space-950/90 px-4 py-1 border-b border-white/05 text-[10px] font-mono flex items-center justify-between overflow-hidden">
        
        {/* Left: Satellite status */}
        <div className="flex items-center space-x-4">
          {/* Live downlink indicator */}
          <div className="flex items-center space-x-1.5 group cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-geo-light opacity-70" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-geo-light" />
            </span>
            <span className="text-geo-light font-bold tracking-widest">SAT-DOWNLINK ACTIVE</span>
          </div>

          <span className="hidden md:inline text-white/20">│</span>
          <span className="hidden md:inline text-slate-500">
            CONSTELLATIONS: <span className="text-slate-300">VIIRS NOAA-20 / MODIS AQUA / INSAT-3DR</span>
          </span>
          <span className="hidden lg:inline text-white/20">│</span>
          <span className="hidden lg:inline text-slate-500">
            SECTOR: <span className="text-thermal-light font-medium">TAMIL NADU &amp; PENINSULAR SHIELD</span>
          </span>
          <span className="hidden xl:inline text-white/20">│</span>
          <span className="hidden xl:inline flex items-center space-x-1">
            <Zap className="w-2.5 h-2.5 text-amber-400" />
            <span className="text-amber-300">SIH 2026 GRAND FINALE — PROBLEM SIH26162</span>
          </span>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center space-x-2.5">
          {/* Commander phone */}
          <div className="flex items-center space-x-1.5 bg-cyan-950/50 border border-cyan-500/30 px-2 py-0.5 rounded-md">
            <Smartphone className="w-2.5 h-2.5 text-cyan-400 flex-shrink-0" />
            <span className="text-slate-400 hidden sm:inline">ALERT:</span>
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
                className="bg-black/90 border border-cyan-400/70 rounded px-1 text-white text-[10px] focus:outline-none w-28"
                autoFocus
              />
            ) : (
              <span 
                onClick={() => setIsEditingPhone(true)}
                className="text-cyan-300 font-semibold hover:text-cyan-100 cursor-pointer flex items-center space-x-1 transition-colors"
                title="Click to edit SMS alert number"
              >
                <span>{commanderPhone}</span>
                <span className="text-[8px] text-emerald-400 font-bold animate-pulse">●LIVE</span>
              </span>
            )}
          </div>

          {/* SMS key config */}
          <button
            onClick={() => {
              const current = localStorage.getItem('fast2sms_key') || '';
              const key = window.prompt('Enter Fast2SMS API Key for cellular SMS to Indian SIMs:', current);
              if (key !== null) {
                localStorage.setItem('fast2sms_key', key.trim());
                alert(key.trim() ? '✓ Fast2SMS Key Saved!' : 'Key cleared.');
              }
            }}
            className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-amber-500/08 hover:bg-amber-500/20 text-amber-300 border border-amber-500/25 text-[10px] font-mono transition-all hover:border-amber-400/50"
            title="Configure Fast2SMS API key"
          >
            <KeyRound className="w-2.5 h-2.5 text-amber-400" />
            <span className="hidden sm:inline">SMS GATEWAY</span>
          </button>

          {/* Clock */}
          <div 
            onClick={() => setTimeMode(m => m === 'IST' ? 'UTC' : 'IST')}
            className="flex items-center space-x-1 cursor-pointer hover:text-white transition-colors bg-white/04 hover:bg-white/08 px-2 py-0.5 rounded-md border border-white/08"
            title="Toggle IST / UTC"
          >
            <Clock className="w-2.5 h-2.5 text-cyan-400" />
            <span className="text-cyan-300 font-bold tracking-widest">{currentTime}</span>
          </div>

          {/* Sound toggle */}
          <button 
            onClick={toggleSound} 
            className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/05 rounded"
            title={soundEnabled ? 'Mute' : 'Unmute'}
          >
            {soundEnabled 
              ? <Volume2 className="w-3 h-3 text-slate-300" /> 
              : <VolumeX className="w-3 h-3 text-slate-600" />
            }
          </button>
        </div>
      </div>

      {/* ── MAIN NAV BAR ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 py-2.5">

          {/* Logo */}
          <div 
            onClick={() => { setActiveTab('home'); soundFx.playClick(); }}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="relative p-2.5 bg-gradient-to-br from-space-800 to-space-950 rounded-xl border border-thermal/25 group-hover:border-thermal/60 transition-all shadow-thermal-glow group-hover:shadow-[0_0_30px_rgba(249,115,22,0.5)]">
              <Flame className="w-5 h-5 text-thermal animate-pulse" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-ai rounded-full ring-2 ring-[#03050c] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-black tracking-wider text-white uppercase group-hover:text-thermal-light transition-colors leading-none">
                  Thermal<span className="text-thermal">Intel</span>
                </span>
                <span className="px-1.5 py-0.5 bg-ai/15 text-ai-light border border-ai/30 rounded text-[9px] font-mono font-bold tracking-widest">
                  NTRO SIH26162
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono tracking-tight hidden sm:block mt-0.5">
                ISRO/NTRO Geospatial Satellite Anomaly Command Center
              </p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); soundFx.playClick(); }}
                  className={`relative flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-[11px] font-semibold tracking-wide transition-all ${
                    isActive 
                      ? 'bg-white/08 text-white border border-white/15 shadow-lg' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/04 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-thermal' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono font-black bg-critical text-white animate-pulse min-w-[18px] text-center">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-px bg-gradient-to-r from-thermal via-amber-400 to-thermal rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Mindmap button */}
            <a
              href="/mindmap.html"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-[11px] font-mono font-bold text-cyber-cyan hover:text-white bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 hover:border-cyan-400/60 transition-all shadow-sm"
              title="Open Evaluator Mindmap"
            >
              <span>🧠</span>
              <span className="hidden sm:inline">Mindmap ↗</span>
            </a>

            {/* Live Command button */}
            <button
              onClick={() => {
                setActiveTab(activeTab === 'dashboard' ? 'analytics' : 'dashboard');
                soundFx.playAlert();
              }}
              className="relative flex items-center space-x-2 px-4 py-2 rounded-lg text-[11px] font-mono font-black uppercase tracking-wider text-white overflow-hidden transition-all hover:scale-[1.03] active:scale-[0.97] border border-critical/40 shadow-critical-glow"
              style={{
                background: 'linear-gradient(135deg, #dc2626 0%, #f97316 100%)',
              }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
              <ShieldAlert className="w-3.5 h-3.5 animate-bounce relative z-10" />
              <span className="relative z-10">{activeTab === 'dashboard' ? 'Telemetry' : 'Live CMD'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Nav Row */}
        <div className="lg:hidden flex items-center py-2 border-t border-white/05 overflow-x-auto space-x-1 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); soundFx.playClick(); }}
                className={`flex-shrink-0 flex items-center space-x-1 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                  isActive 
                    ? 'bg-thermal/15 text-thermal border border-thermal/35 font-bold' 
                    : 'text-slate-400 hover:text-white hover:bg-white/05'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label.split(' ')[0]}</span>
                {item.badge && <span className="w-1.5 h-1.5 rounded-full bg-critical inline-block animate-pulse" />}
              </button>
            );
          })}
          <a href="/mindmap.html" target="_blank" rel="noreferrer"
            className="flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-mono text-cyber-cyan border border-cyan-500/30 bg-cyan-950/30">
            🧠
          </a>
        </div>
      </div>
    </header>
  );
};
