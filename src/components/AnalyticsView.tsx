import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart as PieIcon, 
  MapPin, 
  Calendar, 
  Download, 
  Check, 
  FileText, 
  Filter, 
  Activity, 
  ShieldAlert,
  Flame
} from 'lucide-react';
import { 
  DAILY_DETECTIONS_DATA, 
  CATEGORY_DISTRIBUTION_DATA, 
  STATE_HOTSPOT_DATA, 
  RISK_LEVEL_PIE_DATA,
  HOURLY_DIURNAL_CYCLE 
} from '../data/analyticsData';
import { soundFx } from '../utils/audio';

export const AnalyticsView: React.FC = () => {
  const [timelinePeriod, setTimelinePeriod] = useState<'7D' | '30D'>('7D');
  const [reportExported, setReportExported] = useState(false);

  const handleExportReport = () => {
    soundFx.playSuccess();
    setReportExported(true);
    setTimeout(() => setReportExported(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Analytics Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-thermal uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>National Geospatial Telemetry & Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Thermal Intelligence Analytics Hub
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Multi-sensor trend analysis, category distributions, and state-wise risk prioritizations derived from VIIRS, MODIS, and INSAT-3DR orbits.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-space-800 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => { setTimelinePeriod('7D'); soundFx.playClick(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                timelinePeriod === '7D' ? 'bg-thermal text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => { setTimelinePeriod('30D'); soundFx.playClick(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                timelinePeriod === '30D' ? 'bg-thermal text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Past 30 Days
            </button>
          </div>

          <button
            onClick={handleExportReport}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-ai to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-xl text-xs font-mono font-bold shadow-ai-glow transition-all"
          >
            {reportExported ? <Check className="w-4 h-4 text-geo-light" /> : <Download className="w-4 h-4" />}
            <span>{reportExported ? 'Intelligence Brief Exported' : 'Export NTRO Dossier'}</span>
          </button>
        </div>
      </div>

      {/* Top 4 Metric Summaries */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl border border-white/10">
          <div className="text-[11px] font-mono text-slate-400">DAILY MEAN DETECTIONS</div>
          <div className="mt-1 text-2xl font-black font-mono text-white">176.8</div>
          <div className="mt-1 text-[11px] text-geo-light flex items-center space-x-1 font-mono">
            <TrendingUp className="w-3 h-3" />
            <span>+4.2% week-on-week</span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-critical/30 bg-critical/5">
          <div className="text-[11px] font-mono text-slate-400">CRITICAL INDUSTRIAL FIRES</div>
          <div className="mt-1 text-2xl font-black font-mono text-critical">14 EVENTS</div>
          <div className="mt-1 text-[11px] text-critical-light font-mono">
            94% auto-dispatched &lt; 90s
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-white/10">
          <div className="text-[11px] font-mono text-slate-400">REGULATED FLARE BASELINE</div>
          <div className="mt-1 text-2xl font-black font-mono text-ai-light">70 SITES</div>
          <div className="mt-1 text-[11px] text-slate-400 font-mono">
            CPCL, Reliance, IOCL, GAIL
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-white/10">
          <div className="text-[11px] font-mono text-slate-400">ACTIVE FOREST PERIMETERS</div>
          <div className="mt-1 text-2xl font-black font-mono text-amber-400">31 CANOPIES</div>
          <div className="mt-1 text-[11px] text-slate-400 font-mono">
            Western Ghats & Central Reserves
          </div>
        </div>
      </div>

      {/* Row 1 Charts: Daily Hotspots (Line/Area) & Investigation Priority Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Daily Hotspot Detections Trend (8 Cols) */}
        <div className="lg:col-span-8 glass-card p-6 rounded-2xl border border-white/10 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <div>
              <span className="text-[10px] font-mono text-thermal uppercase font-semibold">TEMPORAL RADIOMETRY</span>
              <h3 className="text-lg font-bold text-white">Daily Hotspot Detections History</h3>
            </div>
            <div className="flex items-center space-x-3 text-xs font-mono text-slate-400 mt-2 sm:mt-0">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-thermal" />
                <span>Total Hotspots</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-critical" />
                <span>Critical Alerts</span>
              </span>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DAILY_DETECTIONS_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="critGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC2626" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0c1334', 
                    borderColor: 'rgba(255,255,255,0.15)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontFamily: 'monospace'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="totalHotspots" 
                  stroke="#F97316" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#totalGrad)" 
                  name="Total Hotspots"
                />
                <Area 
                  type="monotone" 
                  dataKey="criticalAlerts" 
                  stroke="#DC2626" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#critGrad)" 
                  name="Critical Alerts"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Investigation Priority Breakdown Donut Chart (4 Cols) */}
        <div className="lg:col-span-4 glass-card p-6 rounded-2xl border border-white/10 shadow-2xl flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono text-ai-light uppercase font-semibold">TRIAGE CLASSIFICATION</span>
            <h3 className="text-lg font-bold text-white">Investigation Priority Tiers</h3>
          </div>

          <div className="h-[220px] w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={RISK_LEVEL_PIE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {RISK_LEVEL_PIE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.4)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0c1334', 
                    borderColor: 'rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontFamily: 'monospace'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            {RISK_LEVEL_PIE_DATA.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-slate-300">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[11px]">{item.name}</span>
                </div>
                <span className="font-bold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Row 2 Charts: Category Distribution Bar Chart & State-Wise Count */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Hotspot Category Distribution (6 Cols) */}
        <div className="lg:col-span-6 glass-card p-6 rounded-2xl border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-mono text-geo-light uppercase font-semibold">ANOMALY TAXONOMY</span>
              <h3 className="text-lg font-bold text-white">Hotspot Category Distribution</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">Total: 208 Active</span>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CATEGORY_DISTRIBUTION_DATA} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis 
                  dataKey="category" 
                  stroke="#64748b" 
                  angle={-20} 
                  textAnchor="end" 
                  tick={{ fill: '#94a3b8', fontSize: 10 }} 
                />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0c1334', 
                    borderColor: 'rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontFamily: 'monospace'
                  }} 
                />
                <Bar dataKey="count" fill="#2563EB" radius={[6, 6, 0, 0]}>
                  {CATEGORY_DISTRIBUTION_DATA.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* State-Wise Hotspot Count (6 Cols) */}
        <div className="lg:col-span-6 glass-card p-6 rounded-2xl border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold">GEOGRAPHIC SPREAD</span>
              <h3 className="text-lg font-bold text-white">State-Wise Hotspot Detections</h3>
            </div>
            <span className="text-xs font-mono text-thermal">Tamil Nadu Lead Sector</span>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={STATE_HOTSPOT_DATA} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis 
                  dataKey="state" 
                  stroke="#64748b" 
                  angle={-20} 
                  textAnchor="end" 
                  tick={{ fill: '#94a3b8', fontSize: 10 }} 
                />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0c1334', 
                    borderColor: 'rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontFamily: 'monospace'
                  }} 
                />
                <Bar dataKey="baseline" stackId="a" fill="#16a34a" name="Controlled Baseline" />
                <Bar dataKey="highRisk" stackId="a" fill="#f97316" name="High Risk" />
                <Bar dataKey="critical" stackId="a" fill="#dc2626" name="Critical Alert" radius={[6, 6, 0, 0]} />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '8px' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Row 3: Diurnal Cycle Multi-Line Chart (Day vs Night Temporal Behavior) */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <div>
            <span className="text-[10px] font-mono text-purple-400 uppercase font-semibold">DIURNAL PATTERN SIGNATURE</span>
            <h3 className="text-lg font-bold text-white">24-Hour Cycle Temporal Distribution</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Notice how industrial refinery flares stay flat 24/7, while agricultural burning and wildfires peak during afternoon thermal solar heating.
            </p>
          </div>
        </div>

        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={HOURLY_DIURNAL_CYCLE} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="hour" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0c1334', 
                  borderColor: 'rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontFamily: 'monospace'
                }} 
              />
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
              <Line type="monotone" dataKey="flares" stroke="#3b82f6" strokeWidth={2} name="Refinery Flares (Continuous)" />
              <Line type="monotone" dataKey="wildfires" stroke="#f59e0b" strokeWidth={2} name="Forest Wildfires (Peak Daytime)" />
              <Line type="monotone" dataKey="agro" stroke="#16a34a" strokeWidth={2} name="Agricultural Stubble (Daytime Only)" />
              <Line type="monotone" dataKey="industrial" stroke="#dc2626" strokeWidth={2.5} name="Industrial Fires (Spontaneous)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
