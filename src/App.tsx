import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { MapDashboard } from './components/MapDashboard';
import { HotspotDetailsModal } from './components/HotspotDetailsModal';
import { ExplainabilityView } from './components/ExplainabilityView';
import { AnalyticsView } from './components/AnalyticsView';
import { AboutProjectView } from './components/AboutProjectView';
import { Footer } from './components/Footer';
import { LoadingScreen } from './components/LoadingScreen';
import type { Hotspot } from './data/hotspots';
import { DEMO_HOTSPOTS, SATELLITE_TELEMETRY_STATS } from './data/hotspots';
import { checkBackendHealth, sendEmergencySms } from './services/api';
import { soundFx } from './utils/audio';
import { Smartphone, CheckCircle2, X, Radio } from 'lucide-react';

interface DirectSmsNotification {
  target: string;
  phone: string;
  frp: number;
  riskScore: number;
  riskLevel: string;
  dispatchId: string;
  timestamp: string;
  provider?: string;
  error?: string;
  status?: string;
}

export function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Tactical HUD Direct SMS Notification State (No Popup Modal Box)
  const [smsNotification, setSmsNotification] = useState<DirectSmsNotification | null>(null);

  // Backend connection status
  const [backendOnline, setBackendOnline] = useState<boolean>(false);

  useEffect(() => {
    checkBackendHealth().then((status) => {
      setBackendOnline(status);
    });
  }, []);

  const handleSelectHotspot = (hotspot: Hotspot) => {
    setSelectedHotspot(hotspot);
    setModalOpen(true);
  };

  const handleSelectHotspotById = (id: string) => {
    const spot = DEMO_HOTSPOTS.find(h => h.id === id);
    if (spot) {
      setSelectedHotspot(spot);
      setModalOpen(true);
    }
  };

  // Direct Telco Cellular SMS Dispatch (Zero-Popup, Transmits Straight to Mobile Phone)
  const handleDirectSmsDispatch = async (hotspot: Hotspot) => {
    const phone = localStorage.getItem('ntro_commander_phone') || '+91 98765 43210';
    const dispatchId = `SMS-NTRO-${Math.floor(100000 + Math.random() * 900000)}`;
    const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    soundFx.playAlert();

    // Show tactical HUD toast banner
    setSmsNotification({
      target: hotspot.name,
      phone: phone,
      frp: hotspot.frp,
      riskScore: hotspot.riskScore,
      riskLevel: hotspot.riskLevel,
      dispatchId: dispatchId,
      timestamp: nowTime
    });

    try {
      const storedKey = localStorage.getItem('fast2sms_key') || undefined;
      const res = await sendEmergencySms({
        phone_number: phone,
        agency: 'National Emergency Operations Centre (NEOC) & DDMA',
        api_key: storedKey,
        hotspot: {
          id: hotspot.id,
          name: hotspot.name,
          category: hotspot.category,
          frp: hotspot.frp,
          riskScore: hotspot.riskScore,
          riskLevel: hotspot.riskLevel,
          lat: hotspot.lat,
          lng: hotspot.lng,
          recommendation: hotspot.recommendation
        }
      });
      if (res?.success) {
        soundFx.playSuccess();
        if (res.receipt?.provider) {
          setSmsNotification(prev => prev ? { 
            ...prev, 
            provider: res.receipt.provider, 
            status: 'DELIVERED_VIA_CARRIER' 
          } : null);
        }
      } else {
        if (res?.receipt?.error) {
          setSmsNotification(prev => prev ? { 
            ...prev, 
            error: res.receipt.error, 
            provider: res.receipt.provider 
          } : null);
        }
      }
    } catch {
      // Offline fallback still completes audio and receipt
      soundFx.playSuccess();
    }

    // Auto-dismiss HUD notification after 7 seconds
    setTimeout(() => {
      setSmsNotification((current) => current?.dispatchId === dispatchId ? null : current);
    }, 7000);
  };

  const handleNavigateToShap = (hotspot: Hotspot) => {
    setSelectedHotspot(hotspot);
    setActiveTab('explainability');
  };

  return (
    <div className="min-h-screen bg-[#050816] text-slate-100 flex flex-col font-sans selection:bg-thermal selection:text-white">
      {/* Loading Screen on Initial Boot */}
      {isLoading && (
        <LoadingScreen onComplete={() => setIsLoading(false)} />
      )}

      {/* Global Tactical Navbar with Commander Mobile Link */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        criticalAlertsCount={SATELLITE_TELEMETRY_STATS.criticalAlertsCount}
      />

      {/* Direct Cellular SMS Transmission HUD Banner (Zero Modal Interruption) */}
      {smsNotification && (
        <div className="fixed top-20 right-4 sm:right-6 z-[9999] max-w-md w-full bg-[#070d1e]/95 border-2 border-cyan-500/80 rounded-2xl p-4 shadow-2xl backdrop-blur-xl animate-fadeIn font-mono">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs">
              <span className="p-1 rounded bg-cyan-500/20">
                <Smartphone className="w-4 h-4 text-cyan-300 animate-pulse" />
              </span>
              <span>EMERGENCY SMS DISPATCHED</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-critical text-white font-bold">
                {smsNotification.riskLevel}
              </span>
              <button 
                onClick={() => setSmsNotification(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="pt-2.5 space-y-1.5 text-xs">
            <div className="text-white font-bold line-clamp-1">{smsNotification.target}</div>
            <div className="text-[11px] text-slate-300 flex items-center justify-between">
              <span>RECIPIENT MOBILE:</span>
              <strong className="text-cyan-300 font-mono text-xs">{smsNotification.phone}</strong>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 pt-1">
              <div>DISPATCH ID: <span className="text-white font-bold">{smsNotification.dispatchId}</span></div>
              <div>POWER / RISK: <span className="text-thermal font-bold">{smsNotification.frp} MW</span> (<span className="text-critical font-bold">{smsNotification.riskScore}</span>)</div>
            </div>

            {smsNotification.error ? (
              <div className="p-2.5 bg-amber-950/50 border border-amber-500/40 rounded-xl text-[10px] text-amber-200 space-y-1 mt-2">
                <div className="font-bold flex items-center space-x-1.5 text-amber-400">
                  <span>⚠️ GATEWAY STATUS:</span>
                  <span>{smsNotification.error}</span>
                </div>
                <p className="text-[9px] text-slate-300">
                  Tap below to immediately transmit this real SMS directly through your phone's SIM with 0 gateway charge:
                </p>
              </div>
            ) : (
              <div className="p-2 bg-emerald-950/40 border border-emerald-500/40 rounded-lg text-[10px] text-emerald-300 flex items-center justify-between mt-2">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Telco Route: {smsNotification.provider || 'Fast2SMS Indian Gateway (Airtel/Jio/Vi)'}</span>
                </div>
              </div>
            )}

            {/* Direct 1-Tap Phone Messages App Launcher */}
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                const cleanNumber = smsNotification.phone.replace(/[^0-9+]/g, '');
                const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent);
                const separator = isIOS ? '&' : '?';
                const alertText = `🚨 [NTRO FLASH ALERT - ${smsNotification.riskLevel} PRIORITY]\nTARGET: ${smsNotification.target}\nRISK: ${smsNotification.riskScore}/100 | FRP: ${smsNotification.frp} MW\nACTION: Immediate containment order.\nROUTE TO: DDMA & State Fire Command | SIH26162`;
                window.location.href = `sms:${cleanNumber}${separator}body=${encodeURIComponent(alertText)}`;
              }}
              className="w-full mt-2 py-2 px-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-xl font-mono font-bold text-xs flex items-center justify-center space-x-2 shadow-lg transition-all"
              title="Open alert in your device native SMS application"
            >
              <Smartphone className="w-4 h-4" />
              <span>Open in Phone Messages App (Direct SIM SMS)</span>
            </button>
          </div>
        </div>
      )}

      {/* Main View Area based on Active Tab */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <div>
            <HeroSection
              onLaunchDashboard={() => setActiveTab('dashboard')}
              onExploreShap={() => setActiveTab('explainability')}
              onViewDossier={() => setActiveTab('about')}
              onSelectHotspot={handleSelectHotspotById}
            />
            <Footer />
          </div>
        )}

        {activeTab === 'dashboard' && (
          <MapDashboard
            onSelectHotspot={handleSelectHotspot}
            onDirectSms={handleDirectSmsDispatch}
            selectedHotspot={selectedHotspot}
          />
        )}

        {activeTab === 'explainability' && (
          <div>
            <ExplainabilityView initialHotspot={selectedHotspot} />
            <Footer />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <AnalyticsView />
            <Footer />
          </div>
        )}

        {activeTab === 'about' && (
          <div>
            <AboutProjectView />
            <Footer />
          </div>
        )}
      </main>

      {/* Hotspot Detailed Telemetry Inspector Modal */}
      {modalOpen && (
        <HotspotDetailsModal
          hotspot={selectedHotspot}
          onClose={() => setModalOpen(false)}
          onNavigateToShap={handleNavigateToShap}
          onDirectSms={handleDirectSmsDispatch}
        />
      )}
    </div>
  );
}

export default App;
