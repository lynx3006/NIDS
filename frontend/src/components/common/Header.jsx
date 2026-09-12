import React, { useState, useEffect } from 'react';

/**
 * Header Component
 * Displays system brand, monitoring status, active LED, and real-time UTC telemetry
 */
export default function Header({
  statusText = "Network monitoring active",
  onToggleSidebar,
  activeThreatCount = 0
}) {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toISOString().replace("T", " ").substring(0, 19) + " UTC");
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      style={{
        height: "64px",
        backgroundColor: "var(--bg-surface)",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(8px)"
      }}
    >
      {/* Left: Mobile Toggle & Brand Title */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="mobile-only-btn"
            style={{
              backgroundColor: "transparent",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-sm)",
              color: "var(--text-primary)",
              padding: "6px 10px",
              cursor: "pointer",
              fontFamily: "var(--font-mono)",
              fontSize: "12px"
            }}
            aria-label="Toggle navigation menu"
          >
            ☰
          </button>
        )}

        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1
              style={{
                fontSize: "16px",
                fontWeight: 600,
                letterSpacing: "-0.01em",
                color: "var(--text-primary)",
                margin: 0
              }}
            >
              Network Intrusion Detection System
            </h1>
            <span
              className="font-mono"
              style={{
                fontSize: "10px",
                padding: "2px 6px",
                borderRadius: "4px",
                backgroundColor: "var(--bg-surface-elevated)",
                border: "1px solid var(--border-medium)",
                color: "var(--text-secondary)",
                letterSpacing: "0.05em"
              }}
            >
              CORE // v1.2
            </span>
          </div>

          <div
            className="dot-matrix-label"
            style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}
          >
          </div>
        </div>
      </div>

      {/* Right: Monitoring Status & Live Telemetry Clock */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        {/* Status Indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "5px 12px",
            backgroundColor: "var(--bg-surface-elevated)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-sm)"
          }}
        >
          <span className="dot-led active" />
          <span
            className="font-mono"
            style={{
              fontSize: "11px",
              color: "var(--text-primary)",
              letterSpacing: "0.02em"
            }}
          >
            {statusText}
          </span>
        </div>

        {/* Active Threat Counter Pill if threats exist */}
        {activeThreatCount > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 10px",
              backgroundColor: "var(--threat-red-dim)",
              border: "1px solid var(--threat-red-border)",
              borderRadius: "var(--radius-sm)",
              color: "var(--threat-red)"
            }}
          >
            <span className="dot-led threat" />
            <span className="font-mono" style={{ fontSize: "11px", fontWeight: 600 }}>
              {activeThreatCount} HIGH/CRIT THREATS
            </span>
          </div>
        )}

        {/* Real-time UTC clock */}
        <div
          className="font-mono header-telemetry-clock"
          style={{
            fontSize: "11px",
            color: "var(--text-muted)",
            letterSpacing: "0.04em",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          <span>:: SYS_TIME:</span>
          <span style={{ color: "var(--text-secondary)" }}>{currentTime}</span>
        </div>
      </div>
    </header>
  );
}
