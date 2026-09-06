import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { MapDashboard } from './components/MapDashboard';
import { HotspotDetailsModal } from './components/HotspotDetailsModal';
import { SmsAlertModal } from './components/SmsAlertModal';
import { ExplainabilityView } from './components/ExplainabilityView';
import { AnalyticsView } from './components/AnalyticsView';
import { AboutProjectView } from './components/AboutProjectView';
import { Footer } from './components/Footer';
import { LoadingScreen } from './components/LoadingScreen';
import type { Hotspot } from './data/hotspots';
import { DEMO_HOTSPOTS, SATELLITE_TELEMETRY_STATS } from './data/hotspots';
import { checkBackendHealth } from './services/api';

export function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // SMS Alert Modal State
  const [smsModalOpen, setSmsModalOpen] = useState(false);
  const [smsTargetHotspot, setSmsTargetHotspot] = useState<Hotspot | null>(null);

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

  const handleOpenSmsModal = (hotspot: Hotspot) => {
    setSmsTargetHotspot(hotspot);
    setSmsModalOpen(true);
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

      {/* Global Tactical Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        criticalAlertsCount={SATELLITE_TELEMETRY_STATS.criticalAlertsCount}
      />

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
            onOpenSmsModal={handleOpenSmsModal}
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
          onOpenSmsModal={handleOpenSmsModal}
        />
      )}

      {/* Real-Time Mobile SMS Emergency Dispatch Modal */}
      {smsModalOpen && (
        <SmsAlertModal
          hotspot={smsTargetHotspot}
          onClose={() => setSmsModalOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
