import React, { useEffect, useRef } from 'react';
import { 
  Satellite, 
  Flame, 
  BrainCircuit, 
  ShieldAlert, 
  ArrowRight, 
  Crosshair, 
  MapPin, 
  Activity, 
  Layers, 
  CheckCircle2,
  Cpu,
  Radar,
  FileText,
  Zap,
  Globe2,
  TrendingUp
} from 'lucide-react';
import { SATELLITE_TELEMETRY_STATS, DEMO_HOTSPOTS } from '../data/hotspots';
import { soundFx } from '../utils/audio';

interface HeroSectionProps {
  onLaunchDashboard: () => void;
  onExploreShap: () => void;
  onViewDossier: () => void;
  onSelectHotspot: (id: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onLaunchDashboard,
  onExploreShap,
  onViewDossier,
  onSelectHotspot
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Enhanced Satellite Orbital Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle1 = 0;
    let angle2 = Math.PI * 0.6;
    let angle3 = Math.PI * 1.3;
    let pulseRadius = 0;
    let scanLine = 0;
    let dataFlowT = 0;

    const resize = () => {
      canvas.width = canvas.parentElement ? canvas.parentElement.clientWidth : 800;
      canvas.height = 480;
    };
    resize();
    window.addEventListener('resize', resize);

    const drawDataStream = (x1: number, y1: number, x2: number, y2: number, t: number, color: string) => {
      const segments = 8;
      for (let i = 0; i < segments; i++) {
        const p = ((t + i / segments) % 1);
        const px = x1 + (x2 - x1) * p;
        const py = y1 + (y2 - y1) * p;
        const alpha = Math.sin(p * Math.PI) * 0.7;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
        ctx.fill();
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const globeRadius = Math.min(centerX, centerY) * 0.46;

      // Deep space glow
      const glowGrad = ctx.createRadialGradient(centerX, centerY, globeRadius * 0.3, centerX, centerY, globeRadius * 2.0);
      glowGrad.addColorStop(0, 'rgba(37, 99, 235, 0.20)');
      glowGrad.addColorStop(0.4, 'rgba(249, 115, 22, 0.08)');
      glowGrad.addColorStop(0.8, 'rgba(6, 182, 212, 0.04)');
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, globeRadius * 2.0, 0, Math.PI * 2);
      ctx.fill();

      // Star field
      ctx.save();
      for (let i = 0; i < 60; i++) {
        const sx = (Math.sin(i * 137.5 * Math.PI / 180) * 0.5 + 0.5) * canvas.width;
        const sy = (Math.cos(i * 97.3 * Math.PI / 180) * 0.5 + 0.5) * canvas.height;
        const alpha = 0.3 + 0.4 * Math.sin(dataFlowT * 0.3 + i);
        ctx.beginPath();
        ctx.arc(sx, sy, 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha * 0.4})`;
        ctx.fill();
      }
      ctx.restore();

      // Earth Globe
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, globeRadius, 0, Math.PI * 2);

      // Earth gradient fill
      const earthGrad = ctx.createRadialGradient(
        centerX - globeRadius * 0.3, centerY - globeRadius * 0.3, 0,
        centerX, centerY, globeRadius
      );
      earthGrad.addColorStop(0, '#0d1a4a');
      earthGrad.addColorStop(0.5, '#060d28');
      earthGrad.addColorStop(1, '#03050c');
      ctx.fillStyle = earthGrad;
      ctx.fill();

      // Globe border with glow
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = 'rgba(37, 99, 235, 0.8)';
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.clip();

      // Latitude grid lines
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.12)';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([]);
      for (let i = -4; i <= 4; i++) {
        const y = centerY + (i * globeRadius) / 4.5;
        const r = Math.sqrt(Math.max(0, globeRadius * globeRadius - Math.pow(y - centerY, 2)));
        if (r > 5) {
          ctx.beginPath();
          ctx.ellipse(centerX, y, r, r * 0.27, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Longitude grid
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, globeRadius * (0.2 * (i + 1)), globeRadius, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Scanline effect across globe
      scanLine = (scanLine + 0.8) % (globeRadius * 2);
      const scanY = centerY - globeRadius + scanLine;
      if (scanY > centerY - globeRadius && scanY < centerY + globeRadius) {
        const scanGrad = ctx.createLinearGradient(0, scanY - 4, 0, scanY + 4);
        scanGrad.addColorStop(0, 'transparent');
        scanGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.12)');
        scanGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = scanGrad;
        ctx.fillRect(centerX - globeRadius, scanY - 4, globeRadius * 2, 8);
      }

      // India thermal hotspot cluster
      const indiaX = centerX + globeRadius * 0.14;
      const indiaY = centerY + globeRadius * 0.08;

      // Expanding pulse rings
      pulseRadius = (pulseRadius + 0.6) % 40;
      for (let r = 0; r < 3; r++) {
        const rr = (pulseRadius + r * 13) % 40;
        const alpha = Math.max(0, 1 - rr / 40) * 0.8;
        ctx.beginPath();
        ctx.arc(indiaX, indiaY, rr, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(220, 38, 38, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Hot core dot
      const hotGrad = ctx.createRadialGradient(indiaX, indiaY, 0, indiaX, indiaY, 7);
      hotGrad.addColorStop(0, '#fff');
      hotGrad.addColorStop(0.3, '#fbbf24');
      hotGrad.addColorStop(1, '#f97316');
      ctx.beginPath();
      ctx.arc(indiaX, indiaY, 5, 0, Math.PI * 2);
      ctx.fillStyle = hotGrad;
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.restore();

      // Draw orbital paths
      const drawOrbit = (aX: number, aY: number, rot: number, color: string) => {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, aX, aY, 0, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.setLineDash([3, 8]);
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.restore();
      };

      drawOrbit(globeRadius * 1.52, globeRadius * 0.76, Math.PI / 4,   'rgba(59, 130, 246, 0.28)');
      drawOrbit(globeRadius * 1.36, globeRadius * 0.66, -Math.PI / 5,  'rgba(249, 115, 22, 0.28)');
      drawOrbit(globeRadius * 1.72, globeRadius * 0.86, 0.05,           'rgba(34, 197, 94, 0.28)');

      // Satellite 1 — VIIRS NOAA-20 (blue)
      const rot1 = Math.PI / 4;
      const lx1 = Math.cos(angle1) * globeRadius * 1.52;
      const ly1 = Math.sin(angle1) * globeRadius * 0.76;
      const s1X = centerX + lx1 * Math.cos(rot1) - ly1 * Math.sin(rot1);
      const s1Y = centerY + lx1 * Math.sin(rot1) + ly1 * Math.cos(rot1);

      // Data stream to hotspot
      drawDataStream(s1X, s1Y, indiaX, indiaY, dataFlowT, 'rgb(249, 115, 22)');

      // Sensor cone
      ctx.save();
      const coneGrad = ctx.createLinearGradient(s1X, s1Y, indiaX, indiaY);
      coneGrad.addColorStop(0, 'rgba(249, 115, 22, 0.6)');
      coneGrad.addColorStop(1, 'rgba(249, 115, 22, 0.0)');
      ctx.beginPath();
      ctx.moveTo(s1X, s1Y);
      ctx.lineTo(indiaX - 20, indiaY + 12);
      ctx.lineTo(indiaX + 20, indiaY - 12);
      ctx.closePath();
      ctx.fillStyle = coneGrad;
      ctx.fill();

      // Satellite body
      ctx.beginPath();
      ctx.arc(s1X, s1Y, 5.5, 0, Math.PI * 2);
      const s1Grad = ctx.createRadialGradient(s1X - 1, s1Y - 1, 0, s1X, s1Y, 5.5);
      s1Grad.addColorStop(0, '#93c5fd');
      s1Grad.addColorStop(1, '#38bdf8');
      ctx.fillStyle = s1Grad;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Solar panels
      ctx.strokeStyle = '#bae6fd';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(s1X - 12, s1Y); ctx.lineTo(s1X + 12, s1Y);
      ctx.stroke();

      ctx.fillStyle = 'rgba(186, 230, 253, 0.85)';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText('VIIRS NOAA-20 (375m)', s1X + 14, s1Y - 6);
      ctx.restore();

      // Satellite 2 — MODIS AQUA (orange)
      const rot2 = -Math.PI / 5;
      const lx2 = Math.cos(angle2) * globeRadius * 1.36;
      const ly2 = Math.sin(angle2) * globeRadius * 0.66;
      const s2X = centerX + lx2 * Math.cos(rot2) - ly2 * Math.sin(rot2);
      const s2Y = centerY + lx2 * Math.sin(rot2) + ly2 * Math.cos(rot2);

      ctx.save();
      ctx.beginPath();
      ctx.arc(s2X, s2Y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#fb923c';
      ctx.shadowColor = '#fb923c';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#fdba74';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(s2X - 10, s2Y); ctx.lineTo(s2X + 10, s2Y);
      ctx.stroke();
      ctx.fillStyle = 'rgba(253, 186, 116, 0.85)';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText('MODIS AQUA (1km)', s2X + 12, s2Y + 12);
      ctx.restore();

      // Satellite 3 — INSAT-3DR (green)
      const rot3 = 0.05;
      const lx3 = Math.cos(angle3) * globeRadius * 1.72;
      const ly3 = Math.sin(angle3) * globeRadius * 0.86;
      const s3X = centerX + lx3 * Math.cos(rot3) - ly3 * Math.sin(rot3);
      const s3Y = centerY + lx3 * Math.sin(rot3) + ly3 * Math.cos(rot3);

      ctx.save();
      ctx.beginPath();
      ctx.arc(s3X, s3Y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#4ade80';
      ctx.shadowColor = '#4ade80';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#86efac';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(s3X - 11, s3Y); ctx.lineTo(s3X + 11, s3Y);
      ctx.stroke();
      ctx.fillStyle = 'rgba(134, 239, 172, 0.85)';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText('INSAT-3DR (GEO-MET)', s3X + 12, s3Y - 6);
      ctx.restore();

      angle1 += 0.007;
      angle2 += 0.005;
      angle3 += 0.003;
      dataFlowT += 0.008;

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="relative overflow-hidden bg-grid-pattern pt-10 pb-24">

      {/* Ambient lighting blobs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-blue-900/12 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-thermal/6 blur-[100px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cyan-900/8 blur-[80px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── TOP BADGES ── */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8 animate-fade-in">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full glass-card border border-thermal/25 text-thermal-light text-[11px] font-mono font-semibold shadow-thermal-glow">
            <span className="w-2 h-2 rounded-full bg-thermal animate-ping" />
            <span>SMART INDIA HACKATHON 2026 // GRAND FINALE</span>
          </div>
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full glass-card border border-ai/30 text-ai-light text-[11px] font-mono font-semibold shadow-ai-glow">
            <Zap className="w-3.5 h-3.5" />
            <span>PROBLEM STATEMENT: SIH26162</span>
          </div>
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full glass-card border border-white/08 text-slate-300 text-[11px] font-mono">
            <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-500">MINISTRY:</span>
            <span className="text-white font-bold">NTRO (National Technical Research Org)</span>
          </div>
        </div>

        {/* ── HERO HEADER ── */}
        <div className="text-center max-w-5xl mx-auto animate-slide-up">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-thermal/08 border border-thermal/20 text-thermal text-[10px] font-mono mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-thermal animate-pulse" />
            <span>REAL-TIME SATELLITE THERMAL ANOMALY DETECTION SYSTEM</span>
            <span className="w-1.5 h-1.5 rounded-full bg-thermal animate-pulse" />
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tight text-white leading-[0.95] mb-6">
            Industrial{' '}
            <br className="sm:hidden" />
            <span
              className="inline-block"
              style={{
                background: 'linear-gradient(135deg, #f97316 0%, #fb923c 40%, #fbbf24 80%, #f97316 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 40px rgba(249,115,22,0.35))',
              }}
            >
              Thermal
            </span>
            <br />
            <span className="text-white">Intelligence</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto font-normal leading-relaxed">
            AI-Powered Geospatial Classification and Risk Prioritization of Satellite Thermal Hotspots.{' '}
            <span className="text-slate-200">
              Distinguish routine industrial emissions from catastrophic fires in under 90 seconds.
            </span>
          </p>

          {/* ── CTA BUTTONS ── */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => { soundFx.playAlert(); onLaunchDashboard(); }}
              className="group relative inline-flex items-center space-x-3 px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-wider text-white overflow-hidden transition-all hover:scale-[1.03] active:scale-[0.98] shadow-thermal-glow"
              style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #dc2626 100%)' }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Crosshair className="w-5 h-5 animate-spin relative z-10" style={{ animationDuration: '6s' }} />
              <span className="relative z-10">Launch Command Dashboard</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
            </button>

            <button
              onClick={() => { soundFx.playClick(); onExploreShap(); }}
              className="group inline-flex items-center space-x-2.5 px-7 py-4 rounded-2xl text-sm font-semibold text-slate-200 glass-card border border-white/12 hover:border-ai/45 hover:text-white transition-all hover:shadow-ai-glow"
            >
              <BrainCircuit className="w-5 h-5 text-ai-light group-hover:text-ai-light" />
              <span>Explore SHAP Explainability</span>
            </button>

            <button
              onClick={() => { soundFx.playClick(); onViewDossier(); }}
              className="inline-flex items-center space-x-2 px-6 py-4 rounded-2xl text-sm font-semibold text-slate-400 hover:text-white bg-white/03 hover:bg-white/07 border border-white/08 hover:border-white/15 transition-all"
            >
              <FileText className="w-4.5 h-4.5 text-slate-500" />
              <span>Project Architecture</span>
            </button>
          </div>
        </div>

        {/* ── ORBITAL CANVAS ── */}
        <div className="mt-14 relative max-w-5xl mx-auto rounded-3xl glass-card border border-white/12 overflow-hidden shadow-panel hud-corners">
          {/* Canvas header bar */}
          <div className="px-5 py-3 bg-space-950/80 border-b border-white/08 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Radar className="w-4 h-4 text-thermal animate-spin" style={{ animationDuration: '4s' }} />
              <span className="text-white font-bold text-xs tracking-wider uppercase">Orbital Pass Reconnaissance</span>
              <span className="text-white/20">│</span>
              <span className="text-[11px] font-mono text-geo-light">VIIRS / MODIS / INSAT-3DR INGESTION</span>
            </div>
            <div className="hidden sm:flex items-center space-x-2 text-[10px] font-mono text-cyan-300 bg-black/40 px-2.5 py-1 rounded-lg border border-cyan-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>SECTOR: 11.1271°N, 78.6569°E [TN]</span>
            </div>
          </div>

          <canvas ref={canvasRef} className="w-full h-[380px] sm:h-[450px] block cursor-crosshair" />

          {/* Canvas footer ticker */}
          <div className="px-5 py-3 bg-space-950/90 border-t border-white/08 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-thermal font-bold">LATEST:</span>
              <span className="text-white font-medium">Tiruppur SIDCO — 342.8 MW // CRITICAL INDUSTRIAL</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-geo-light flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Geospatial Buffer 500m ✓</span>
              </span>
              <span className="text-ai-light">XGBoost: 84ms</span>
            </div>
          </div>
        </div>

        {/* ── TELEMETRY STATS ── */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: 'ACTIVE SATELLITES',
              value: SATELLITE_TELEMETRY_STATS.activeSatellites,
              unit: 'CONSTELLATIONS',
              sub: 'VIIRS (375m), MODIS & INSAT-3DR',
              icon: Satellite,
              color: 'ai',
              borderColor: 'rgba(37,99,235,0.25)',
              accentColor: '#3b82f6',
            },
            {
              label: 'CRITICAL ALERTS',
              value: `0${SATELLITE_TELEMETRY_STATS.criticalAlertsCount}`,
              unit: 'EMERGENCY TIERS',
              sub: 'Tiruppur Boiler, Cuddalore Chem',
              icon: Flame,
              color: 'critical',
              borderColor: 'rgba(220,38,38,0.30)',
              accentColor: '#dc2626',
              bg: 'rgba(220,38,38,0.04)',
            },
            {
              label: 'ML ACCURACY',
              value: `${SATELLITE_TELEMETRY_STATS.overallAccuracyPct}%`,
              unit: '',
              sub: 'XGBoost + TreeSHAP Ensemble',
              icon: Cpu,
              color: 'geo',
              borderColor: 'rgba(22,163,74,0.25)',
              accentColor: '#22c55e',
            },
            {
              label: 'TRIAGE LATENCY',
              value: '< 90s',
              unit: 'INGEST TO DISPATCH',
              sub: 'Automated DDMA & NDRF routing',
              icon: Activity,
              color: 'amber',
              borderColor: 'rgba(245,158,11,0.25)',
              accentColor: '#f59e0b',
            },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="glass-card stat-card p-5 rounded-2xl relative overflow-hidden"
                style={{ border: `1px solid ${stat.borderColor}`, background: stat.bg || undefined }}
              >
                <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono mb-2">
                  <span className="tracking-widest">{stat.label}</span>
                  <Icon className="w-4 h-4" style={{ color: stat.accentColor }} />
                </div>
                <div className="text-3xl font-black font-mono" style={{ color: stat.accentColor }}>
                  {stat.value}
                  {stat.unit && <span className="text-[10px] text-slate-400 font-normal ml-1">{stat.unit}</span>}
                </div>
                <p className="mt-1 text-[10px] text-slate-500">{stat.sub}</p>
                <div 
                  className="absolute bottom-0 left-0 right-0 h-px"
                  style={{ background: `linear-gradient(90deg, ${stat.accentColor}, transparent)` }}
                />
              </div>
            );
          })}
        </div>

        {/* ── HOTSPOT SHOWCASE ── */}
        <div className="mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
            <div>
              <div className="flex items-center space-x-2 text-[11px] font-mono text-thermal uppercase tracking-widest mb-2">
                <MapPin className="w-4 h-4" />
                <span>Operational Demonstration Targets</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white">
                Tamil Nadu{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Strategic
                </span>{' '}
                Hotspots
              </h2>
            </div>
            <button
              onClick={() => { soundFx.playClick(); onLaunchDashboard(); }}
              className="mt-4 sm:mt-0 text-[11px] font-mono text-slate-400 hover:text-thermal flex items-center space-x-1.5 transition-colors group"
            >
              <span>View all on Command Map</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DEMO_HOTSPOTS.slice(0, 8).map((spot, idx) => {
              const isCritical = spot.riskLevel === 'CRITICAL';
              const isHigh     = spot.riskLevel === 'HIGH';
              const isModerate = spot.riskLevel === 'MODERATE';

              const borderBase  = isCritical ? 'rgba(220,38,38,0.30)' : isHigh ? 'rgba(249,115,22,0.30)' : isModerate ? 'rgba(245,158,11,0.25)' : 'rgba(22,163,74,0.25)';
              const dotColor    = isCritical ? '#dc2626' : isHigh ? '#f97316' : isModerate ? '#f59e0b' : '#22c55e';
              const badgeClass  = isCritical
                ? 'bg-critical/15 text-critical-light border-critical/35'
                : isHigh
                ? 'bg-thermal/15 text-thermal-light border-thermal/35'
                : isModerate
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/35'
                : 'bg-geo/15 text-geo-light border-geo/35';

              const frpPct = Math.min(100, (spot.frp / 500) * 100);

              return (
                <div
                  key={spot.id}
                  onClick={() => { soundFx.playClick(); onSelectHotspot(spot.id); }}
                  className="glass-card glass-card-hover p-4 rounded-2xl cursor-pointer group hud-corners"
                  style={{ 
                    border: `1px solid ${borderBase}`,
                    animationDelay: `${idx * 60}ms`
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono text-slate-500">{spot.district}, TN</span>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase border ${badgeClass}`}>
                      {spot.riskLevel}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-thermal-light transition-colors line-clamp-1 mb-1">
                    {spot.name.split('–')[0]}
                  </h3>

                  <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mb-3">
                    <span 
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: dotColor, boxShadow: `0 0 6px ${dotColor}` }}
                    />
                    <span className="truncate">{spot.category}</span>
                  </div>

                  {/* FRP progress bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-[9px] font-mono text-slate-500 mb-1">
                      <span>FRP</span>
                      <span style={{ color: dotColor }} className="font-bold">{spot.frp} MW</span>
                    </div>
                    <div className="h-1 bg-space-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full frp-bar"
                        style={{ 
                          width: `${frpPct}%`,
                          background: isCritical 
                            ? 'linear-gradient(90deg, #dc2626, #f97316)' 
                            : isHigh 
                            ? 'linear-gradient(90deg, #f97316, #fbbf24)'
                            : 'linear-gradient(90deg, #f59e0b, #22c55e)'
                        }} 
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/05 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-500">
                      Risk: <span className="text-white font-bold">{spot.riskScore}/100</span>
                    </span>
                    <span className="text-slate-500">
                      Conf: <span className="text-ai-light font-bold">{spot.confidence}%</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── FEATURE PILLARS ── */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Layers,
              iconBg: 'bg-ai/08 border-ai/25',
              iconColor: 'text-ai-light',
              title: 'Geospatial Sensor Fusion',
              body: 'Automated ingestion from NASA FIRMS (VIIRS 375m I-Band, MODIS 1km) fused with ISRO INSAT-3DR geostationary imagery and OpenStreetMap industrial land registry layers.',
              accent: 'rgba(37,99,235,0.15)',
            },
            {
              icon: BrainCircuit,
              iconBg: 'bg-thermal/08 border-thermal/25',
              iconColor: 'text-thermal',
              title: 'XGBoost & SHAP Attribution',
              body: 'Ensemble gradient boosted trees trained on 50,000+ historical anomalies with TreeSHAP local attribution bars, explaining every classification with mathematical transparency.',
              accent: 'rgba(249,115,22,0.15)',
            },
            {
              icon: ShieldAlert,
              iconBg: 'bg-critical/08 border-critical/25',
              iconColor: 'text-critical-light',
              title: 'Automated Defense Triage',
              body: 'Dynamic risk index (0–100) scoring severity using hazmat buffers, population density, wind vectors, and persistence — dispatching instant DDMA/NDRF notifications.',
              accent: 'rgba(220,38,38,0.12)',
            },
          ].map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <div
                key={i}
                className="glass-card glass-card-hover p-7 rounded-3xl border border-white/08 relative overflow-hidden group"
              >
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(ellipse at 30% 30%, ${pillar.accent}, transparent 60%)` }}
                />
                <div className={`relative p-3 w-12 h-12 rounded-2xl border ${pillar.iconBg} flex items-center justify-center mb-5`}>
                  <Icon className={`w-6 h-6 ${pillar.iconColor}`} />
                </div>
                <h3 className="relative text-lg font-bold text-white mb-3">{pillar.title}</h3>
                <p className="relative text-sm text-slate-400 leading-relaxed">{pillar.body}</p>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
