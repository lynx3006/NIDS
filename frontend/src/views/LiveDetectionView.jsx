import React, { useState, useEffect } from 'react';
import DetectionCard from '../components/detection/DetectionCard';
import FlowDetailModal from '../components/detection/FlowDetailModal';
import { subscribeLiveFlows, getRecentDetections } from '../services/api';

/**
 * LiveDetectionView
 * Real-time monitoring feed with pause, resume, rate control, and detection cards
 */
export default function LiveDetectionView() {
  const [liveFlows, setLiveFlows] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [streamRate, setStreamRate] = useState(2500); // 2.5s
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [filterLevel, setFilterLevel] = useState("ALL");
  const [bufferCount, setBufferCount] = useState(0);

  // Load initial detections
  useEffect(() => {
    getRecentDetections(8).then((initial) => {
      setLiveFlows(initial);
    });
  }, []);

  // Handle live flow subscription
  useEffect(() => {
    if (isPaused) return;

    const unsubscribe = subscribeLiveFlows((newFlow) => {
      setBufferCount((prev) => prev + 1);
      setLiveFlows((prevFlows) => [newFlow, ...prevFlows.slice(0, 49)]); // Keep last 50
    }, streamRate);

    return () => unsubscribe();
  }, [isPaused, streamRate]);

  // Clear buffer
  const handleClear = () => {
    setLiveFlows([]);
    setBufferCount(0);
  };

  const filteredFlows = filterLevel === "ALL"
    ? liveFlows
    : liveFlows.filter((f) => f.risk_level === filterLevel);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Top Banner: Title and Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "14px"
        }}
      >
        <div>
          <div className="dot-matrix-label" style={{ marginBottom: "4px" }}>
            :: REAL-TIME SURVEILLANCE
          </div>
          <h2
            style={{
              fontSize: "22px",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "var(--text-primary)",
              margin: 0
            }}
          >
            Live Detection Stream
          </h2>
          <div
            className="font-mono"
            style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}
          >
            SIMULATED INGESTION FEED // API-READY WEBSOCKET ADAPTER
          </div>
        </div>

        {/* Live Stream Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {/* Pause / Resume Button */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            style={{
              backgroundColor: isPaused ? "var(--threat-red-dim)" : "var(--safe-green-dim)",
              border: `1px solid ${isPaused ? "var(--threat-red-border)" : "var(--safe-green-border)"}`,
              borderRadius: "var(--radius-sm)",
              color: isPaused ? "var(--threat-red)" : "var(--safe-green)",
              padding: "7px 16px",
              fontSize: "12px",
              fontFamily: "var(--font-mono)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: 600
            }}
          >
            <span className={isPaused ? "dot-led threat" : "dot-led active"} />
            {isPaused ? "PAUSED (RESUME)" : "STREAMING ACTIVE (PAUSE)"}
          </button>

          {/* Rate Selector */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 8px",
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-sm)"
            }}
          >
            <span className="dot-matrix-label" style={{ fontSize: "9px" }}>INTERVAL:</span>
            <select
              value={streamRate}
              onChange={(e) => setStreamRate(Number(e.target.value))}
              style={{
                backgroundColor: "transparent",
                border: "none",
                color: "var(--text-primary)",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                cursor: "pointer"
              }}
            >
              <option value={1000} style={{ backgroundColor: "#111" }}>1.0s (Fast)</option>
              <option value={2500} style={{ backgroundColor: "#111" }}>2.5s (Normal)</option>
              <option value={5000} style={{ backgroundColor: "#111" }}>5.0s (Slow)</option>
            </select>
          </div>

          {/* Clear Button */}
          <button
            onClick={handleClear}
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-sm)",
              color: "var(--text-secondary)",
              padding: "7px 12px",
              fontSize: "11px",
              fontFamily: "var(--font-mono)",
              cursor: "pointer"
            }}
          >
            CLEAR BUFFER
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
          padding: "12px 16px",
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-sm)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="dot-matrix-label" style={{ fontSize: "10px" }}>FILTER RISK:</span>
          {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((level) => (
            <button
              key={level}
              onClick={() => setFilterLevel(level)}
              style={{
                padding: "4px 10px",
                borderRadius: "var(--radius-sm)",
                border: filterLevel === level ? "1px solid var(--border-medium)" : "1px solid transparent",
                backgroundColor: filterLevel === level ? "var(--bg-surface-elevated)" : "transparent",
                color: filterLevel === level ? "var(--text-primary)" : "var(--text-secondary)",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                cursor: "pointer"
              }}
            >
              {level}
            </button>
          ))}
        </div>

        <div className="font-mono" style={{ fontSize: "11px", color: "var(--text-muted)" }}>
          BUFFER: {filteredFlows.length} DISPLAYED ({bufferCount} INGESTED)
        </div>
      </div>

      {/* Flow Cards Stream */}
      {filteredFlows.length === 0 ? (
        <div
          style={{
            padding: "60px 20px",
            textAlign: "center",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)"
          }}
        >
          <div className="dot-matrix-label" style={{ justifyContent: "center", fontSize: "12px" }}>
            :: NO FLOWS IN BUFFER MATCHING CRITERIA
          </div>
          <div
            className="font-mono"
            style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px" }}
          >
            {isPaused ? "Live stream is paused. Click RESUME to ingest new network flows." : "Waiting for next flow..."}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredFlows.map((flow) => (
            <DetectionCard
              key={flow.id}
              flow={flow}
              onInspect={setSelectedFlow}
            />
          ))}
        </div>
      )}

      {/* Forensic Inspection Modal */}
      {selectedFlow && (
        <FlowDetailModal
          flow={selectedFlow}
          onClose={() => setSelectedFlow(null)}
        />
      )}
    </div>
  );
}
