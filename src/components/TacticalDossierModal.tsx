import React from 'react';
import { 
  X, 
  Printer, 
  ShieldAlert, 
  Satellite, 
  MapPin, 
  Flame, 
  Clock, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  Zap,
  Activity,
  Layers,
  Thermometer,
  BrainCircuit,
  Share2
} from 'lucide-react';
import type { Hotspot } from '../data/hotspots';
import { soundFx } from '../utils/audio';

interface TacticalDossierModalProps {
  hotspot: Hotspot | null;
  onClose: () => void;
  onOpenSmsModal: (hotspot: Hotspot) => void;
}

export const TacticalDossierModal: React.FC<TacticalDossierModalProps> = ({
  hotspot,
  onClose,
  onOpenSmsModal
}) => {
  if (!hotspot) return null;

  const isCritical = hotspot.riskLevel === 'CRITICAL';
  const isEnclosed = hotspot.category === 'Enclosed Electrical & Smoke Anomaly';
  const dossierId = `DOSSIER-NTRO-${hotspot.id.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now().toString().slice(-4)}`;
  const latGrid = Math.round(hotspot.lat * 100) / 100;
  const lngGrid = Math.round(hotspot.lng * 100) / 100;
  const dimensionId = hotspot.dimensionId || `DIM-${Math.abs(latGrid).toFixed(2)}${latGrid >= 0 ? 'N' : 'S'}-${Math.abs(lngGrid).toFixed(2)}${lngGrid >= 0 ? 'E' : 'W'}`;

  const handlePrint = () => {
    soundFx.playClick();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn print:p-0 print:bg-white">
      <div className="relative w-full max-w-3xl bg-space-900 border border-white/15 rounded-2xl shadow-2xl overflow-hidden my-auto glass-card print:border-none print:shadow-none print:bg-white print:text-black">
        
        {/* Dossier Action Bar (Hidden on Print) */}
        <div className="px-6 py-3.5 bg-space-950 border-b border-white/10 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-thermal/20 text-thermal border border-thermal/30">
              <FileText className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] font-mono uppercase text-thermal font-bold tracking-wider block">
                STATUTORY DISASTER BRIEFING DOSSIER
              </span>
              <h3 className="text-sm font-bold text-white">
                NTRO Emergency Incident Command Report
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-mono font-bold transition-all border border-white/10 shadow-sm"
              title="Print official incident dossier"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span>Print / Export PDF</span>
            </button>

            <button
              onClick={() => { soundFx.playClick(); onClose(); }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Tactical Document Body */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-200 font-sans print:text-black print:p-4">
          
          {/* Official Letterhead */}
          <div className="border-b-2 border-thermal/60 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:border-black">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-critical/20 text-critical border border-critical/40 font-bold uppercase print:border-black print:text-black">
                  RESTRICTED // TACTICAL DISPATCH
                </span>
                <span className="text-[10px] font-mono text-slate-400 print:text-gray-600">
                  REF: SIH26162-NTRO-GEOINT
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white mt-1 print:text-black">
                {hotspot.name}
              </h1>
              <p className="text-xs text-slate-400 font-mono mt-0.5 print:text-gray-700">
                Location: {hotspot.location} ({hotspot.district}, {hotspot.state})
              </p>
            </div>

            <div className="sm:text-right text-xs font-mono space-y-1">
              <div className="text-slate-400 print:text-gray-600">DOSSIER ID: <strong className="text-white print:text-black">{dossierId}</strong></div>
              <div className="text-slate-400 print:text-gray-600">DOWNLINK TIME: <strong className="text-cyan-300 print:text-black">{hotspot.detectionTime}</strong></div>
              <div className="text-slate-400 print:text-gray-600">SENSOR: <strong className="text-white print:text-black">{hotspot.satellite} (375m I-Band)</strong></div>
            </div>
          </div>

          {/* Spatial Dimension Matrix Card */}
          <div className="p-4 bg-black/40 rounded-xl border border-white/10 space-y-3 font-mono text-xs print:bg-gray-100 print:border-gray-400 print:text-black">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 print:border-gray-300">
              <div className="flex items-center space-x-2 text-cyan-400 font-bold print:text-black">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>SPATIAL DIMENSION CLUSTER ({dimensionId})</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                isCritical ? 'bg-critical text-white' : 'bg-thermal text-black'
              }`}>
                {hotspot.riskLevel} // SCORE: {hotspot.riskScore}/100
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
              <div>
                <span className="text-slate-500 block text-[9px]">CENTER COORDINATES</span>
                <span className="font-bold text-white print:text-black">{hotspot.lat.toFixed(4)}°N, {hotspot.lng.toFixed(4)}°E</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px]">FIRE POWER (FRP)</span>
                <span className="font-bold text-thermal print:text-black">{hotspot.frp} MW</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px]">BRIGHTNESS TEMP</span>
                <span className="font-bold text-white print:text-black">{hotspot.brightnessTemp} K</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px]">DIMENSIONAL OCCURRENCE</span>
                <span className="font-bold text-emerald-400 print:text-black">{hotspot.historicalCount || 1} Passes Recorded</span>
              </div>
            </div>

            {isEnclosed && (
              <div className="p-2.5 bg-purple-950/40 rounded-lg border border-purple-500/30 flex items-center justify-between text-[10px]">
                <span className="text-purple-300 flex items-center space-x-1.5 font-bold">
                  <Zap className="w-3.5 h-3.5 text-purple-400" />
                  <span>SPECIALIZED PATTERN: ENCLOSED BUILDING ELECTRICAL WIRE SHORT</span>
                </span>
                <span className="text-cyan-300 font-bold">
                  AOD Smoke: {hotspot.smokeAodIndex || 0.88} | Thermal Disparity: {hotspot.thermalOpticalDisparity || 82}%
                </span>
              </div>
            )}
          </div>

          {/* AI Root-Cause Reasoning */}
          <div className="space-y-2 text-xs leading-relaxed">
            <h4 className="font-mono text-xs font-bold text-white uppercase flex items-center space-x-1.5 print:text-black">
              <BrainCircuit className="w-4 h-4 text-ai-light" />
              <span>XGBoost Machine Learning Root-Cause Diagnosis</span>
            </h4>
            <div className="p-3.5 bg-space-950/80 rounded-xl border border-ai/30 text-slate-300 print:bg-gray-50 print:border-gray-300 print:text-black">
              {hotspot.aiReasoning}
            </div>
          </div>

          {/* TreeSHAP Feature Attribution Breakdown */}
          <div className="space-y-2">
            <h4 className="font-mono text-xs font-bold text-slate-400 uppercase print:text-black">
              TreeSHAP Local Feature Attribution Vector
            </h4>
            <div className="space-y-1.5">
              {hotspot.shapValues.map((shap, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-2 bg-black/20 rounded-lg border border-white/5 print:bg-white print:border-gray-200">
                  <span className="text-slate-300 print:text-black">{shap.feature}</span>
                  <div className="flex items-center space-x-2 font-mono">
                    <span className="text-[10px] text-slate-400 truncate max-w-[240px] hidden sm:inline print:text-gray-600">
                      {shap.description}
                    </span>
                    <span className="text-ai-light font-bold print:text-black">
                      +{Math.round(shap.importance * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statutory Incident Command Action Orders */}
          <div className="p-4 bg-red-950/20 border border-critical/40 rounded-xl space-y-2 font-mono text-xs print:bg-gray-100 print:border-black print:text-black">
            <div className="flex items-center space-x-2 text-critical font-bold print:text-black">
              <ShieldAlert className="w-4 h-4" />
              <span>STATUTORY DISASTER RESPONSE ORDERS (DDMA / NDRF)</span>
            </div>
            <p className="text-slate-300 text-xs font-sans leading-relaxed print:text-black">
              {hotspot.recommendation}
            </p>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 print:text-black">
              <span>DESIGNATED ROUTE: District Fire Command & DDMA HazMat Unit</span>
              <span className="text-white font-bold print:text-black">AUTO-ACK: VERIFIED SATELLITE PASS</span>
            </div>
          </div>

          {/* Sign-Off Stamp Box */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-500 print:text-gray-700">
            <div>
              Generated by: <strong>NTRO Thermal Anomaly Command Center (SIH26162)</strong>
            </div>
            <div>
              Verification Level: <strong>ISO-Geospatial Defense Standard</strong>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions (Hidden on Print) */}
        <div className="px-6 py-4 bg-space-950 border-t border-white/10 flex items-center justify-between print:hidden">
          <button
            onClick={() => {
              soundFx.playAlert();
              onClose();
              onOpenSmsModal(hotspot);
            }}
            className="px-4 py-2 bg-gradient-to-r from-critical to-thermal text-white font-mono font-bold text-xs rounded-xl shadow-lg hover:opacity-90 transition-all flex items-center space-x-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Transmit Emergency Cellular SMS</span>
          </button>

          <button
            onClick={() => { soundFx.playClick(); onClose(); }}
            className="px-4 py-2 bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-mono rounded-xl transition-colors"
          >
            Close Dossier
          </button>
        </div>

      </div>
    </div>
  );
};
