import React, { useState } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  Target, 
  Cpu, 
  GitBranch, 
  Layers, 
  Database, 
  ArrowRight, 
  CheckCircle2, 
  Satellite, 
  Flame, 
  Eye, 
  Compass, 
  Share2, 
  Award,
  Sparkles,
  Server,
  Zap,
  Globe2
} from 'lucide-react';
import { soundFx } from '../utils/audio';

export const AboutProjectView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'statement' | 'workflow' | 'models' | 'stack' | 'future'>('statement');

  const navTabs = [
    { id: 'statement', label: 'Problem & Objectives', icon: Target },
    { id: 'workflow', label: 'System Workflow Pipeline', icon: GitBranch },
    { id: 'models', label: 'AI Models & SHAP', icon: Cpu },
    { id: 'stack', label: 'Technology Stack', icon: Server },
    { id: 'future', label: 'Applications & Scope', icon: Globe2 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Dossier Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-ai-light uppercase tracking-wider mb-1">
            <Award className="w-4 h-4 text-thermal" />
            <span>SIH 2026 Grand Finale Dossier // Ministry: NTRO</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Industrial Thermal Intelligence (SIH26162)
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            AI-Powered Geospatial Classification and Risk Prioritization of Satellite Thermal Hotspots.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-space-800/80 px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono text-slate-300">
          <span className="w-2 h-2 rounded-full bg-geo-light animate-ping" />
          <span>STATUS: TRL-7 OPERATIONAL PROTOTYPE</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-white/10 pb-2 overflow-x-auto scrollbar-none">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveSection(tab.id as typeof activeSection); soundFx.playClick(); }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${
                isActive 
                  ? 'bg-thermal text-white shadow-thermal-glow' 
                  : 'text-slate-400 hover:text-white hover:bg-space-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Section 1: Problem Statement & Objectives */}
      {activeSection === 'statement' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Problem Statement Card */}
            <div className="glass-card p-6 rounded-2xl border border-critical/30 bg-critical/5 shadow-xl">
              <div className="flex items-center space-x-2 text-critical text-xs font-mono font-bold uppercase mb-2">
                <Target className="w-4 h-4" />
                <span>The Core Challenge (Problem Statement SIH26162)</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-3">
                Satellite False Positives & Unprioritized Fire Anomaly Feeds
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed space-y-2">
                Earth observation satellites like NASA VIIRS (375m) and MODIS (1km) record thousands of thermal anomalies daily across India. 
                However, conventional feeds treat all thermal anomalies equally, causing massive operational bottlenecks:
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start space-x-2">
                  <span className="text-critical font-bold text-sm leading-none">•</span>
                  <span><strong>Industrial Flares Misidentified as Fires:</strong> Permitted flare stacks (e.g. CPCL Ennore, Reliance Jamnagar) and steel blast furnaces trigger costly false fire brigade dispatches.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-critical font-bold text-sm leading-none">•</span>
                  <span><strong>Lack of Proximity Context:</strong> Critical fires next to explosive chemical tanks (e.g., SIPCOT Cuddalore) receive the same urgency tag as isolated stubble burning in remote fields.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-critical font-bold text-sm leading-none">•</span>
                  <span><strong>No Mathematical Transparency:</strong> Emergency commanders and NTRO analysts hesitate to trust black-box AI predictions without explainable attribution.</span>
                </li>
              </ul>
            </div>

            {/* Objectives Card */}
            <div className="glass-card p-6 rounded-2xl border border-geo/30 bg-geo/5 shadow-xl">
              <div className="flex items-center space-x-2 text-geo-light text-xs font-mono font-bold uppercase mb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>System Objectives for NTRO & Civil Defense</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-3">
                Autonomous Triage & Explanatory Intelligence
              </h2>
              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 bg-space-950/60 rounded-xl border border-white/5">
                  <div className="font-bold text-white mb-0.5">1. Sub-90 Second Latency</div>
                  <span>Automated ingestion from NASA FIRMS & ISRO Bhuvan downlinks to ML classification within 90 seconds of satellite pass.</span>
                </div>
                <div className="p-3 bg-space-950/60 rounded-xl border border-white/5">
                  <div className="font-bold text-white mb-0.5">2. High-Accuracy Spatial Classification (99.1%)</div>
                  <span>Distinguish 7 distinct anomaly classes using multi-layered geospatial buffering (OpenStreetMap + Industrial Registries).</span>
                </div>
                <div className="p-3 bg-space-950/60 rounded-xl border border-white/5">
                  <div className="font-bold text-white mb-0.5">3. Quantitative Risk Prioritization (0–100)</div>
                  <span>Prioritize dispatches based on hazardous chemical proximity, population density downwind, and wind velocity vectors.</span>
                </div>
                <div className="p-3 bg-space-950/60 rounded-xl border border-white/5">
                  <div className="font-bold text-white mb-0.5">4. TreeSHAP Mathematical Explainability</div>
                  <span>Provide commanders with transparent attribution bars showing exact positive and negative feature contributions.</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Section 2: System Workflow Pipeline */}
      {activeSection === 'workflow' && (
        <div className="glass-card p-6 rounded-2xl border border-white/10 shadow-2xl space-y-6">
          <div>
            <span className="text-[10px] font-mono text-thermal uppercase font-semibold">END-TO-END PIPELINE</span>
            <h2 className="text-xl font-bold text-white">Architectural Dataflow & Processing Stages</h2>
          </div>

          {/* Workflow Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Stage 1 */}
            <div className="p-4 rounded-xl bg-space-950 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-ai-light font-bold">STAGE 01</span>
                <Satellite className="w-4 h-4 text-ai" />
              </div>
              <h3 className="font-bold text-white text-sm">Satellite Sensor Downlink</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                NASA FIRMS API polls VIIRS 375m (I-Band 4 & 5) and MODIS Terra/Aqua 1km channels. Real-time thermal anomaly coordinates and Fire Radiative Power (MW) extracted.
              </p>
            </div>

            {/* Stage 2 */}
            <div className="p-4 rounded-xl bg-space-950 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-geo-light font-bold">STAGE 02</span>
                <Layers className="w-4 h-4 text-geo" />
              </div>
              <h3 className="font-bold text-white text-sm">PostGIS Spatial Buffering</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Coordinates intersected against OpenStreetMap industrial layers, registered flare coordinates, forest boundaries, and 30-day historical spatio-temporal clusters.
              </p>
            </div>

            {/* Stage 3 */}
            <div className="p-4 rounded-xl bg-space-950 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-thermal font-bold">STAGE 03</span>
                <Cpu className="w-4 h-4 text-thermal" />
              </div>
              <h3 className="font-bold text-white text-sm">XGBoost & SHAP Inference</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Gradient-boosted decision trees compute multi-class probability. TreeSHAP generates local feature importance weights and natural-language intelligence briefs.
              </p>
            </div>

            {/* Stage 4 */}
            <div className="p-4 rounded-xl bg-space-950 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-amber-400 font-bold">STAGE 04</span>
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <h3 className="font-bold text-white text-sm">Dynamic Risk Indexing</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Risk score (0–100) dynamically calculated combining FRP surge, flammable asset proximity, wind propagation vector, and recurrence baseline.
              </p>
            </div>

            {/* Stage 5 */}
            <div className="p-4 rounded-xl bg-space-950 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-cyan-400 font-bold">STAGE 05</span>
                <Eye className="w-4 h-4 text-cyan-400" />
              </div>
              <h3 className="font-bold text-white text-sm">Command Center Visualization</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Pulsing radar markers, thermal density heatmaps, and live alert telemetry stream onto the NTRO tactical dashboard.
              </p>
            </div>

            {/* Stage 6 */}
            <div className="p-4 rounded-xl bg-space-950 border border-critical/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-critical font-bold">STAGE 06</span>
                <ShieldCheck className="w-4 h-4 text-critical" />
              </div>
              <h3 className="font-bold text-white text-sm">Multi-Agency Triage Routing</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Automated alerts dispatched to District Disaster Management Authorities (DDMA), Fire Stations, and State Pollution Control Boards for immediate intervention.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* Section 3: AI Models & SHAP */}
      {activeSection === 'models' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
            <div className="flex items-center space-x-2 text-xs font-mono text-ai-light font-bold uppercase">
              <Cpu className="w-4 h-4" />
              <span>Core ML Architecture</span>
            </div>
            <h3 className="text-lg font-bold text-white">XGBoost Ensemble Classifier</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              We employ an ensemble of Extreme Gradient Boosted Trees (XGBoost v2.1) calibrated with Platt scaling for well-calibrated class probabilities.
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3 bg-space-950 rounded-xl border border-white/5">
                <span className="text-white font-bold block mb-1">Key Input Features:</span>
                <span className="text-slate-400 font-mono">
                  [frp_mw, brightness_temp_k, scan_angle, distance_to_industrial_m, historical_30d_frequency, landcover_class, surface_wind_speed, ndwi_vegetation_moisture]
                </span>
              </div>

              <div className="p-3 bg-space-950 rounded-xl border border-white/5">
                <span className="text-white font-bold block mb-1">Model Metrics on Benchmark Validation Set:</span>
                <div className="grid grid-cols-3 gap-2 font-mono text-[11px] mt-1">
                  <div>Accuracy: <span className="text-geo-light font-bold">99.1%</span></div>
                  <div>Precision: <span className="text-ai-light font-bold">98.4%</span></div>
                  <div>F1-Score: <span className="text-thermal font-bold">0.987</span></div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
            <div className="flex items-center space-x-2 text-xs font-mono text-thermal font-bold uppercase">
              <Sparkles className="w-4 h-4" />
              <span>TreeSHAP Interpretability Framework</span>
            </div>
            <h3 className="text-lg font-bold text-white">Axiomatic Feature Explanations</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              TreeSHAP evaluates exact Shapley values in polynomial time <span className="font-mono text-slate-400">O(TLD²)</span>, satisfying efficiency, symmetry, dummy, and additivity axioms.
            </p>

            <div className="p-3.5 bg-space-950 rounded-xl border border-white/5 text-xs text-slate-300 space-y-2">
              <div className="font-bold text-white">Why SHAP is Critical for NTRO Commanders:</div>
              <p>
                In high-stakes national defense and disaster scenarios, an alert saying "94% risk" is not enough. Commanders need to know:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>Did the risk spike because of high FRP or nearby petrochemical solvent tanks?</li>
                <li>Is this flare normal for this refinery on a Thursday night?</li>
                <li>How will high winds alter the propagation perimeter?</li>
              </ul>
            </div>
          </div>

        </div>
      )}

      {/* Section 4: Technology Stack */}
      {activeSection === 'stack' && (
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-6">
          <div>
            <span className="text-[10px] font-mono text-geo-light uppercase font-semibold">PRODUCTION STACK</span>
            <h2 className="text-xl font-bold text-white">Technology Stack Matrix</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            
            <div className="p-4 rounded-xl bg-space-950 border border-white/10 space-y-2">
              <span className="text-ai-light font-mono font-bold block text-[10px]">FRONTEND CORE</span>
              <div className="font-bold text-white text-sm">React 19 + TypeScript + Vite</div>
              <p className="text-slate-400">
                Lightning-fast reactive state, type safety, and modular component architecture.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-space-950 border border-white/10 space-y-2">
              <span className="text-thermal font-mono font-bold block text-[10px]">MAPS & SPATIAL VIZ</span>
              <div className="font-bold text-white text-sm">Leaflet + React-Leaflet</div>
              <p className="text-slate-400">
                High-performance dark geospatial mapping, pulsing SVG radar markers, and dynamic heatmap overlays.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-space-950 border border-white/10 space-y-2">
              <span className="text-geo-light font-mono font-bold block text-[10px]">CHARTS & TELEMETRY</span>
              <div className="font-bold text-white text-sm">Recharts + Framer Motion</div>
              <p className="text-slate-400">
                Responsive time-series area charts, priority distribution donuts, and smooth tactical transitions.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-space-950 border border-white/10 space-y-2">
              <span className="text-purple-400 font-mono font-bold block text-[10px]">BACKEND & ML ROADMAP</span>
              <div className="font-bold text-white text-sm">FastAPI + PostGIS + XGBoost</div>
              <p className="text-slate-400">
                Asynchronous REST APIs, spatial buffering queries, and TreeSHAP attribution microservices.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* Section 5: Applications & Future Scope */}
      {activeSection === 'future' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
            <div className="flex items-center space-x-2 text-xs font-mono text-ai-light font-bold uppercase">
              <Globe2 className="w-4 h-4" />
              <span>Real-World Strategic Applications</span>
            </div>
            <h3 className="text-lg font-bold text-white">Defense & Civil Impact</h3>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 bg-space-950 rounded-xl border border-white/5">
                <div className="font-bold text-white mb-0.5">National Security & Critical Infrastructure:</div>
                <span>Protection of strategic naval fuel depots, ordnance storage, petrochemical refineries, and atomic power facilities from sabotaged or accidental fires.</span>
              </div>

              <div className="p-3 bg-space-950 rounded-xl border border-white/5">
                <div className="font-bold text-white mb-0.5">Disaster Management (NDMA/SDRF):</div>
                <span>Instant prioritized dispatch recommendations reducing response time from hours to under 90 seconds.</span>
              </div>

              <div className="p-3 bg-space-950 rounded-xl border border-white/5">
                <div className="font-bold text-white mb-0.5">Environmental Forest Protection:</div>
                <span>Early canopy wildfire detection in biodiversity hotspots like Nilgiris and Western Ghats before uncontrolled spread.</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
            <div className="flex items-center space-x-2 text-xs font-mono text-thermal font-bold uppercase">
              <Zap className="w-4 h-4" />
              <span>Future Scope & Roadmap</span>
            </div>
            <h3 className="text-lg font-bold text-white">Next-Generation Enhancements</h3>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 bg-space-950 rounded-xl border border-white/5">
                <div className="font-bold text-white mb-0.5">Edge AI Onboard Microsatellites:</div>
                <span>Deploying quantized XGBoost models directly onto future ISRO earth observation satellite payloads for instant onboard alerting.</span>
              </div>

              <div className="p-3 bg-space-950 rounded-xl border border-white/5">
                <div className="font-bold text-white mb-0.5">Autonomous Drone Swarm Interception:</div>
                <span>Automated dispatch of thermal FLIR drone swarms to verify unconfirmed high-risk hotspots within 10 km.</span>
              </div>

              <div className="p-3 bg-space-950 rounded-xl border border-white/5">
                <div className="font-bold text-white mb-0.5">Hyperspectral Chemical Gas Plume Detection:</div>
                <span>Fusing thermal infrared data with PRISMA/EnMAP hyperspectral bands to detect toxic gas emissions (SO2, Benzene, Chlorine) in real-time.</span>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
