import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Flame, 
  ShieldAlert, 
  BrainCircuit, 
  Copy, 
  Check, 
  Send, 
  Building2, 
  Clock, 
  Compass, 
  Wind, 
  Activity, 
  BarChart, 
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Layers,
  Smartphone
} from 'lucide-react';
import { Hotspot } from '../data/hotspots';
import { soundFx } from '../utils/audio';

interface HotspotDetailsModalProps {
  hotspot: Hotspot | null;
  onClose: () => void;
  onNavigateToShap: (hotspot: Hotspot) => void;
  onOpenSmsModal?: (hotspot: Hotspot) => void;
}

export const HotspotDetailsModal: React.FC<HotspotDetailsModalProps> = ({
  hotspot,
  onClose,
  onNavigateToShap,
  onOpenSmsModal,
}) => {
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState<'idle' | 'dispatching' | 'dispatched'>('idle');
  const [smsSent, setSmsSent] = useState(false);

  if (!hotspot) return null;

  const isCritical = hotspot.riskLevel === 'CRITICAL';
  const isHigh = hotspot.riskLevel === 'HIGH';
  const isModerate = hotspot.riskLevel === 'MODERATE';

  const copyCoordinates = () => {
    soundFx.playClick();
    const text = `${hotspot.lat.toFixed(4)}, ${hotspot.lng.toFixed(4)}`;
    navigator.clipboard.writeText(text);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const handleSimulateDispatch = () => {
    soundFx.playAlert();
    setDispatchStatus('dispatching');
    setTimeout(() => {
      soundFx.playSuccess();
      setDispatchStatus('dispatched');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-space-900 border border-white/15 rounded-2xl shadow-2xl overflow-hidden my-8 glass-card">
        
        {/* Top Header Banner with Risk Color Coding */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isCritical ? 'bg-critical/15 border-critical/30' :
          isHigh ? 'bg-thermal/15 border-thermal/30' :
          isModerate ? 'bg-amber-500/10 border-amber-500/20' :
          'bg-geo/10 border-geo/20'
        }`}>
          <div className="flex items-center space-x-3">
            <span className={`p-2 rounded-xl ${
              isCritical ? 'bg-critical/20 text-critical animate-pulse' :
              isHigh ? 'bg-thermal/20 text-thermal' :
              'bg-ai/20 text-ai-light'
            }`}>
              <Flame className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-slate-400">{hotspot.id}</span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                  isCritical ? 'bg-critical text-white' :
                  isHigh ? 'bg-thermal text-white' :
                  isModerate ? 'bg-amber-500 text-black' :
                  'bg-geo text-white'
                }`}>
                  {hotspot.riskLevel} PRIORITY
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {hotspot.satellite}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">
                {hotspot.name}
              </h3>
            </div>
          </div>

          <button
            onClick={() => { soundFx.playClick(); onClose(); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto scrollbar-thin">
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Risk Score */}
            <div className="bg-space-950/70 p-3 rounded-xl border border-white/10">
              <span className="text-[10px] font-mono text-slate-400 block">RISK SCORE</span>
              <div className="mt-1 flex items-baseline space-x-1">
                <span className={`text-2xl font-black font-mono ${
                  isCritical ? 'text-critical' : isHigh ? 'text-thermal' : 'text-slate-200'
                }`}>
                  {hotspot.riskScore}
                </span>
                <span className="text-xs text-slate-500 font-mono">/100</span>
              </div>
              <div className="w-full bg-space-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className={`h-full ${
                    isCritical ? 'bg-critical' : isHigh ? 'bg-thermal' : isModerate ? 'bg-amber-400' : 'bg-geo'
                  }`}
                  style={{ width: `${hotspot.riskScore}%` }}
                />
              </div>
            </div>

            {/* Fire Radiative Power (FRP) */}
            <div className="bg-space-950/70 p-3 rounded-xl border border-white/10">
              <span className="text-[10px] font-mono text-slate-400 block">RADIATIVE POWER</span>
              <div className="mt-1 flex items-baseline space-x-1">
                <span className="text-2xl font-black font-mono text-thermal">
                  {hotspot.frp}
                </span>
                <span className="text-xs text-slate-400 font-mono">MW</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-2 block">
                Temp: {hotspot.brightnessTemp} K
              </span>
            </div>

            {/* Confidence */}
            <div className="bg-space-950/70 p-3 rounded-xl border border-white/10">
              <span className="text-[10px] font-mono text-slate-400 block">AI CONFIDENCE</span>
              <div className="mt-1 flex items-baseline space-x-1">
                <span className="text-2xl font-black font-mono text-ai-light">
                  {hotspot.confidence}%
                </span>
              </div>
              <span className="text-[10px] text-geo-light mt-2 block">
                Validated Ensemble
              </span>
            </div>

            {/* 30-Day Persistence */}
            <div className="bg-space-950/70 p-3 rounded-xl border border-white/10">
              <span className="text-[10px] font-mono text-slate-400 block">30-DAY PERSISTENCE</span>
              <div className="mt-1 flex items-baseline space-x-1">
                <span className="text-2xl font-black font-mono text-white">
                  {hotspot.historicalCount}
                </span>
                <span className="text-xs text-slate-400 font-mono">PASSES</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-2 block">
                {hotspot.historicalCount > 15 ? 'Routine Operational' : 'Anomalous Spurt'}
              </span>
            </div>
          </div>

          {/* Location & Coordinates Box */}
          <div className="bg-space-800/60 p-4 rounded-xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2 text-xs text-slate-300">
                <MapPin className="w-4 h-4 text-thermal" />
                <span className="font-semibold text-white">{hotspot.location}</span>
                <span className="text-slate-500">•</span>
                <span>{hotspot.district}, {hotspot.state}</span>
              </div>
              <div className="text-xs font-mono text-slate-400 mt-1 flex items-center space-x-3">
                <span>LAT: {hotspot.lat.toFixed(4)}° N</span>
                <span>LNG: {hotspot.lng.toFixed(4)}° E</span>
                <span>SCAN: {hotspot.scanAngle}°</span>
              </div>
            </div>

            <button
              onClick={copyCoordinates}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-colors"
            >
              {copiedCoords ? <Check className="w-3.5 h-3.5 text-geo-light" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCoords ? 'Coordinates Copied' : 'Copy GPS'}</span>
            </button>
          </div>

          {/* AI Prediction & Reasoning Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-ai/10 via-space-950 to-space-900 border border-ai/30 shadow-ai-glow">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <BrainCircuit className="w-4 h-4 text-ai-light" />
                <span className="text-xs font-mono font-bold text-ai-light uppercase tracking-wider">
                  AI Model Classification
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Model: XGBoost v2.1 + PostGIS Buffer
              </span>
            </div>

            <div className="text-base font-bold text-white flex items-center space-x-2">
              <span>Category:</span>
              <span className="text-thermal">{hotspot.category}</span>
            </div>

            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              {hotspot.aiReasoning}
            </p>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Want to inspect local SHAP feature contributions?
              </span>
              <button
                onClick={() => {
                  soundFx.playClick();
                  onClose();
                  onNavigateToShap(hotspot);
                }}
                className="inline-flex items-center space-x-1 text-xs font-mono text-ai-light hover:text-white transition-colors"
              >
                <span>Open in SHAP Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Geospatial Context & Environment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-space-950/60 border border-white/10">
              <div className="flex items-center space-x-2 text-slate-400 font-mono text-[10px] mb-1">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>NEARBY INDUSTRIAL ASSET</span>
              </div>
              <div className="text-white font-medium">{hotspot.nearbyIndustry}</div>
              <div className="text-slate-400 font-mono text-[11px] mt-1">
                Buffer Distance: <span className="text-amber-300 font-semibold">{hotspot.distanceToIndustry} meters</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-space-950/60 border border-white/10">
              <div className="flex items-center space-x-2 text-slate-400 font-mono text-[10px] mb-1">
                <Wind className="w-3.5 h-3.5 text-cyan-400" />
                <span>METEOROLOGY & LAND COVER</span>
              </div>
              <div className="text-white font-medium">{hotspot.landCover}</div>
              <div className="text-slate-400 font-mono text-[11px] mt-1">
                Wind Dispersion: <span className="text-cyan-300 font-semibold">{hotspot.windSpeed}</span>
              </div>
            </div>
          </div>

          {/* Actionable Protocol Recommendation */}
          <div className={`p-4 rounded-xl border ${
            isCritical ? 'bg-critical/10 border-critical/40' :
            isHigh ? 'bg-thermal/10 border-thermal/40' :
            'bg-space-950 border-white/10'
          }`}>
            <div className="flex items-center space-x-2 text-xs font-mono font-bold mb-1.5">
              <ShieldAlert className={`w-4 h-4 ${isCritical ? 'text-critical' : isHigh ? 'text-thermal' : 'text-geo-light'}`} />
              <span className={isCritical ? 'text-critical-light' : isHigh ? 'text-thermal-light' : 'text-slate-200'}>
                RECOMMENDED OPERATIONAL DIRECTIVE
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {hotspot.recommendation}
            </p>
          </div>

          {/* Emergency Triage / Dispatch Simulation & SMS */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Detected: {hotspot.detectionTime}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {onOpenSmsModal && (
                <button
                  onClick={() => {
                    soundFx.playAlert();
                    onOpenSmsModal(hotspot);
                  }}
                  className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase transition-all shadow-md bg-gradient-to-r from-critical/20 to-thermal/20 hover:from-critical hover:to-thermal text-critical-light hover:text-white border border-critical/40 hover:border-critical"
                  title="Send tactical SMS alert with AI root-cause analysis"
                >
                  <Smartphone className="w-4 h-4 text-critical-light" />
                  <span>Send SMS (with AI Analysis)</span>
                </button>
              )}

              {dispatchStatus === 'dispatched' ? (
                <div className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-geo/20 border border-geo/40 text-geo-light font-mono text-xs font-bold">
                  <Check className="w-4 h-4" />
                  <span>EMERGENCY DISPATCH TRANSMITTED</span>
                </div>
              ) : (
                <button
                  onClick={handleSimulateDispatch}
                  disabled={dispatchStatus === 'dispatching'}
                  className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-gradient-to-r from-critical via-red-600 to-thermal text-white shadow-critical-glow hover:opacity-90 transition-all disabled:opacity-50"
                >
                  <Send className={`w-4 h-4 ${dispatchStatus === 'dispatching' ? 'animate-spin' : ''}`} />
                  <span>
                    {dispatchStatus === 'dispatching' ? 'Broadcasting...' : 'Broadcast to DDMA'}
                  </span>
                </button>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
