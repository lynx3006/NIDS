import React, { useState, useEffect } from 'react';
import Sidebar from './components/common/Sidebar';
import Header from './components/common/Header';
import DashboardView from './views/DashboardView';
import LiveDetectionView from './views/LiveDetectionView';
import DetectionHistoryView from './views/DetectionHistoryView';
import { getDashboardStats } from './services/api';
import './App.css';

/**
 * NIDS Main Application Container
 * Industrial cybersecurity monitoring console inspired by Nothing Phone aesthetic
 */
export default function App() {
  const [currentView, setCurrentView] = useState("dashboard"); // "dashboard" | "live" | "history"
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeThreatCount, setActiveThreatCount] = useState(0);

  // Monitor threat posture periodically for Header alert badge
  useEffect(() => {
    const checkThreats = async () => {
      try {
        const stats = await getDashboardStats();
        setActiveThreatCount(stats.activeThreatsCount || 0);
      } catch {
        // silent fallback
      }
    };
    checkThreats();
    const interval = setInterval(checkThreats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-shell">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Navigation Sidebar */}
      <Sidebar
        currentView={currentView}
        onSelectView={setCurrentView}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Layout Area */}
      <div className="main-layout">
        <Header
          statusText="Network monitoring active"
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          activeThreatCount={activeThreatCount}
        />

        <main className="content-area">
          {currentView === "dashboard" && (
            <DashboardView
              onNavigateToLive={() => setCurrentView("live")}
              onNavigateToHistory={() => setCurrentView("history")}
            />
          )}

          {currentView === "live" && <LiveDetectionView />}

          {currentView === "history" && <DetectionHistoryView />}
        </main>
      </div>
    </div>
  );
}
