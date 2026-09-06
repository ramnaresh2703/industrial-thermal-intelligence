import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Sparkles, 
  HelpCircle, 
  Flame, 
  Sliders, 
  Layers, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle2, 
  ChevronRight,
  Info,
  RefreshCw,
  Cpu,
  BarChart3
} from 'lucide-react';
import { Hotspot, DEMO_HOTSPOTS } from '../data/hotspots';
import { GLOBAL_SHAP_IMPORTANCE } from '../data/analyticsData';
import { soundFx } from '../utils/audio';

interface ExplainabilityViewProps {
  initialHotspot?: Hotspot | null;
}

export const ExplainabilityView: React.FC<ExplainabilityViewProps> = ({ initialHotspot }) => {
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot>(
    initialHotspot || DEMO_HOTSPOTS[0]
  );

  // Interactive "What-If" Simulation parameters
  const [simFrp, setSimFrp] = useState<number>(selectedHotspot.frp);
  const [simDistance, setSimDistance] = useState<number>(selectedHotspot.distanceToIndustry);
  const [simPersistence, setSimPersistence] = useState<number>(selectedHotspot.historicalCount);
  const [simLandCover, setSimLandCover] = useState<string>(
    selectedHotspot.category === 'Forest Fire' ? 'forest' : 
    selectedHotspot.category === 'Agricultural Burning' ? 'cropland' : 'industrial'
  );

  // Switch hotspot and update simulator defaults
  const handleSelectHotspot = (spot: Hotspot) => {
    soundFx.playClick();
    setSelectedHotspot(spot);
    setSimFrp(spot.frp);
    setSimDistance(spot.distanceToIndustry);
    setSimPersistence(spot.historicalCount);
    setSimLandCover(
      spot.category === 'Forest Fire' ? 'forest' : 
      spot.category === 'Agricultural Burning' ? 'cropland' : 'industrial'
    );
  };

  // Real-time XGBoost simulation function
  const calculateSimulatedPrediction = () => {
    let baseScore = 20;

    // FRP contribution
    const frpScore = Math.min(45, (simFrp / 700) * 45);

    // Distance to industry contribution
    let distScore = 0;
    if (simLandCover === 'industrial') {
      // Closer to hazardous industry = higher risk of industrial disaster
      distScore = Math.max(0, 35 * (1 - simDistance / 2000));
    } else if (simLandCover === 'forest') {
      distScore = 30; // wilderness wildfire
    } else {
      distScore = 5; // agricultural
    }

    // Historical persistence (high persistence = baseline flare, low persistence = unexpected fire)
    let persistencePenalty = 0;
    if (simPersistence > 15 && simLandCover === 'industrial') {
      persistencePenalty = -25; // Routine plant flare
    } else if (simPersistence <= 2) {
      persistencePenalty = +15; // Sudden explosion / spontaneous event
    }

    let calculatedRisk = Math.round(baseScore + frpScore + distScore + persistencePenalty);
    calculatedRisk = Math.max(5, Math.min(99, calculatedRisk));

    let category = 'Industrial Fire';
    let riskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' = 'MODERATE';

    if (simLandCover === 'forest') {
      category = 'Forest Fire';
      riskLevel = calculatedRisk > 75 ? 'CRITICAL' : 'HIGH';
    } else if (simLandCover === 'cropland') {
      category = 'Agricultural Burning';
      riskLevel = calculatedRisk > 60 ? 'MODERATE' : 'LOW';
    } else {
      if (simPersistence > 18 && calculatedRisk < 60) {
        category = 'Refinery Flare';
        riskLevel = 'MODERATE';
      } else if (calculatedRisk >= 85) {
        category = simDistance < 100 ? 'Chemical Hazard' : 'Industrial Fire';
        riskLevel = 'CRITICAL';
      } else if (calculatedRisk >= 65) {
        category = 'Industrial Fire';
        riskLevel = 'HIGH';
      } else {
        category = 'Thermal Power Plant';
        riskLevel = 'LOW';
      }
    }

    return { calculatedRisk, category, riskLevel };
  };

  const simResult = calculateSimulatedPrediction();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-ai-light uppercase tracking-wider mb-1">
            <BrainCircuit className="w-4 h-4" />
            <span>SHAP (SHapley Additive exPlanations) Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            AI Model Explainability Studio
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Inspect local feature contribution bars for any satellite detection and test counterfactual scenarios with our interactive XGBoost simulator.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-space-800/80 p-2 rounded-xl border border-white/10">
          <Cpu className="w-5 h-5 text-ai-light" />
          <div className="text-xs font-mono">
            <div className="text-white font-bold">XGBoost v2.1 + TreeSHAP</div>
            <div className="text-geo-light">Game-Theoretic Axiomatic Guarantees</div>
          </div>
        </div>
      </div>

      {/* Hotspot Switcher */}
      <div className="bg-space-900/60 p-4 rounded-2xl border border-white/10 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-xs font-mono text-slate-300 font-semibold uppercase flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-ai animate-pulse" />
            <span>Select Target Hotspot for Local SHAP Attribution:</span>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            {DEMO_HOTSPOTS.length} Strategic Nodes Across India
          </div>
        </div>

        {/* Scrollable grid of all national hotspots */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
          {DEMO_HOTSPOTS.map((spot) => {
            const isSelected = selectedHotspot.id === spot.id;
            return (
              <button
                key={spot.id}
                onClick={() => handleSelectHotspot(spot)}
                className={`p-2.5 rounded-xl text-left border transition-all text-xs ${
                  isSelected 
                    ? 'bg-ai/25 border-ai text-white shadow-ai-glow ring-1 ring-ai' 
                    : 'bg-space-950/80 border-white/10 text-slate-400 hover:text-white hover:bg-space-800'
                }`}
              >
                <div className="font-mono text-[9px] text-slate-400 truncate flex items-center justify-between">
                  <span>{spot.state}</span>
                  <span className={`text-[8px] font-bold ${spot.riskLevel === 'CRITICAL' ? 'text-critical' : spot.riskLevel === 'HIGH' ? 'text-thermal' : 'text-geo-light'}`}>
                    {spot.riskLevel}
                  </span>
                </div>
                <div className="font-bold truncate mt-0.5 text-slate-100">{spot.name}</div>
                <div className="mt-1 flex items-center justify-between text-[9px] font-mono text-slate-400">
                  <span>{spot.district}</span>
                  <span className="text-thermal font-semibold">{spot.frp} MW</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: SHAP Feature Importance Bars & Reasoning */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Local SHAP Feature Importance Bars (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">LOCAL SHAP ATTRIBUTION</span>
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <span>{selectedHotspot.name}</span>
                </h3>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase ${
                selectedHotspot.riskLevel === 'CRITICAL' ? 'bg-critical text-white' :
                selectedHotspot.riskLevel === 'HIGH' ? 'bg-thermal text-white' :
                selectedHotspot.riskLevel === 'MODERATE' ? 'bg-amber-500 text-black' :
                'bg-geo text-white'
              }`}>
                {selectedHotspot.category}
              </span>
            </div>

            <div className="text-xs text-slate-300 mb-6 bg-space-950/60 p-3 rounded-xl border border-white/5">
              <span className="text-ai-light font-bold">How to read SHAP bars: </span>
              <span className="text-red-400 font-semibold">Red/Orange (+)</span> pushes prediction higher towards emergency fire/critical risk. 
              <span className="text-emerald-400 font-semibold ml-2">Green/Blue (-)</span> pulls prediction lower towards routine regulated baseline.
            </div>

            {/* Feature Bars */}
            <div className="space-y-4">
              {selectedHotspot.shapValues.map((val, idx) => {
                const isPositive = val.impact === 'positive';
                const percentage = Math.round(Math.abs(val.importance) * 100);

                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">{val.feature}</span>
                      <span className={`font-mono font-bold ${isPositive ? 'text-critical-light' : 'text-geo-light'}`}>
                        {isPositive ? `+${val.importance.toFixed(2)}` : `${val.importance.toFixed(2)}`}
                      </span>
                    </div>

                    {/* Visual Bar */}
                    <div className="w-full bg-space-950 h-3 rounded-full overflow-hidden flex">
                      {isPositive ? (
                        <div 
                          className="bg-gradient-to-r from-thermal to-critical h-full rounded-full transition-all duration-500 shadow-thermal-glow"
                          style={{ width: `${percentage * 2}%` }}
                        />
                      ) : (
                        <div 
                          className="bg-gradient-to-r from-ai to-geo h-full rounded-full transition-all duration-500 shadow-geo-glow"
                          style={{ width: `${percentage * 2}%` }}
                        />
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400 italic">
                      {val.description}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AI Natural Language Explanation Box */}
            <div className="mt-6 pt-5 border-t border-white/10">
              <div className="flex items-center space-x-2 text-xs font-mono text-ai-light font-bold uppercase mb-2">
                <Sparkles className="w-4 h-4" />
                <span>Automated Neural Inference Summary</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed bg-ai/5 p-4 rounded-xl border border-ai/20">
                {selectedHotspot.aiReasoning}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive "What-If" AI Simulator (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-ai/30 shadow-ai-glow">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-ai-light" />
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wide">
                    "What-If" Counterfactual Simulator
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Live Real-Time XGBoost Feedback
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleSelectHotspot(selectedHotspot)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Reset simulator values"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Slider 1: FRP */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-300">Fire Radiative Power (FRP):</span>
                  <span className="text-thermal font-bold">{simFrp} MW</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="800"
                  step="10"
                  value={simFrp}
                  onChange={(e) => { setSimFrp(Number(e.target.value)); soundFx.playClick(); }}
                  className="w-full h-1.5 bg-space-800 rounded-lg appearance-none cursor-pointer accent-thermal"
                />
              </div>

              {/* Slider 2: Distance to Industry */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-300">Distance to Nearest Industry:</span>
                  <span className="text-cyan-400 font-bold">{simDistance} m</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="5000"
                  step="50"
                  value={simDistance}
                  onChange={(e) => { setSimDistance(Number(e.target.value)); soundFx.playClick(); }}
                  className="w-full h-1.5 bg-space-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Slider 3: 30-Day Persistence */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-300">30-Day Recurrence Count:</span>
                  <span className="text-geo-light font-bold">{simPersistence} passes</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={simPersistence}
                  onChange={(e) => { setSimPersistence(Number(e.target.value)); soundFx.playClick(); }}
                  className="w-full h-1.5 bg-space-800 rounded-lg appearance-none cursor-pointer accent-geo-light"
                />
              </div>

              {/* Land Cover Selector */}
              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1.5">
                  Simulated Land Cover Buffer:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'industrial', label: 'Industrial Zone' },
                    { id: 'forest', label: 'Wild Forest' },
                    { id: 'cropland', label: 'Crop Stubble' }
                  ].map((lc) => (
                    <button
                      key={lc.id}
                      onClick={() => { setSimLandCover(lc.id); soundFx.playClick(); }}
                      className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all ${
                        simLandCover === lc.id 
                          ? 'bg-ai text-white border-ai-light shadow-md' 
                          : 'bg-space-800 text-slate-400 border-white/10 hover:text-white'
                      }`}
                    >
                      {lc.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Model Output Display */}
            <div className="mt-6 p-4 rounded-xl bg-space-950 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">RE-CLASSIFIED CATEGORY:</span>
                <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded bg-white/10 text-white">
                  {simResult.category}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">DYNAMIC RISK SCORE:</span>
                <span className={`text-2xl font-black font-mono ${
                  simResult.riskLevel === 'CRITICAL' ? 'text-critical' :
                  simResult.riskLevel === 'HIGH' ? 'text-thermal' :
                  simResult.riskLevel === 'MODERATE' ? 'text-amber-400' : 'text-geo-light'
                }`}>
                  {simResult.calculatedRisk}/100
                </span>
              </div>

              <div className="w-full bg-space-800 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    simResult.riskLevel === 'CRITICAL' ? 'bg-critical' :
                    simResult.riskLevel === 'HIGH' ? 'bg-thermal' :
                    simResult.riskLevel === 'MODERATE' ? 'bg-amber-400' : 'bg-geo'
                  }`}
                  style={{ width: `${simResult.calculatedRisk}%` }}
                />
              </div>

              <div className="text-[11px] text-slate-400 pt-2 border-t border-white/5 flex items-center justify-between">
                <span>PRIORITY TIER:</span>
                <span className={`font-mono font-bold uppercase ${
                  simResult.riskLevel === 'CRITICAL' ? 'text-critical' : 'text-slate-300'
                }`}>
                  {simResult.riskLevel}
                </span>
              </div>
            </div>

          </div>

          {/* Global SHAP Ranking Card */}
          <div className="glass-card p-5 rounded-2xl border border-white/10">
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 uppercase mb-3 font-semibold">
              <BarChart3 className="w-4 h-4 text-thermal" />
              <span>Global SHAP Mean (|SHAP|) Across 50k Records</span>
            </div>
            <div className="space-y-2">
              {GLOBAL_SHAP_IMPORTANCE.slice(0, 5).map((feat, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 truncate max-w-[200px]">{feat.feature}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-space-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-ai h-full rounded-full" 
                        style={{ width: `${feat.importance * 220}%` }}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-slate-400 w-8 text-right">
                      {feat.importance}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
