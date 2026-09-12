import React, { useState, useEffect } from 'react';
import StatCard from '../components/common/StatCard';
import RiskBadge from '../components/common/RiskBadge';
import ScoreMeter from '../components/common/ScoreMeter';
import DetectionCard from '../components/detection/DetectionCard';
import FlowDetailModal from '../components/detection/FlowDetailModal';
import { getDashboardStats, getRecentDetections, getTrafficOverview, getModelAnalysis } from '../services/api';

/**
 * DashboardView
 * Main NIDS overview page containing:
 * - 5 KPI statistics (Total Flows, Low, Medium, High, Critical)
 * - 4 core sections: Current Network Risk, Recent Detections, Traffic Overview, Model Analysis
 */
export default function DashboardView({ onNavigateToLive, onNavigateToHistory }) {
  const [stats, setStats] = useState(null);
  const [recentDetections, setRecentDetections] = useState([]);
  const [traffic, setTraffic] = useState(null);
  const [modelAnalysis, setModelAnalysis] = useState(null);
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboard = () => {
      Promise.all([
        getDashboardStats(),
        getRecentDetections(4),
        getTrafficOverview(),
        getModelAnalysis()
      ]).then(([s, r, t, m]) => {
        if (isMounted) {
          setStats(s);
          setRecentDetections(r);
          setTraffic(t);
          setModelAnalysis(m);
          setIsLoading(false);
        }
      }).catch((err) => {
        console.error("Failed to load dashboard data:", err);
        if (isMounted) setIsLoading(false);
      });
    };

    fetchDashboard();
    const interval = setInterval(fetchDashboard, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (isLoading && !stats) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
        <span className="dot-matrix-label">:: INITIALIZING NIDS TELEMETRY...</span>
      </div>
    );
  }

  const formatBytes = (bytes) => {
    if (!bytes) return "0 B";
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(2)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* View Header & Fast Action */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "12px"
        }}
      >
        <div>
          <div className="dot-matrix-label" style={{ marginBottom: "4px" }}>
            :: TELEMETRY DASHBOARD
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
            Network Intrusion Posture
          </h2>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={onNavigateToLive}
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-medium)",
              borderRadius: "var(--radius-sm)",
              color: "var(--text-primary)",
              padding: "6px 14px",
              fontSize: "12px",
              fontFamily: "var(--font-mono)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <span className="dot-led active" />
            LIVE FEED
          </button>
          <button
            onClick={onNavigateToHistory}
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-sm)",
              color: "var(--text-secondary)",
              padding: "6px 14px",
              fontSize: "12px",
              fontFamily: "var(--font-mono)",
              cursor: "pointer"
            }}
          >
            FORENSIC HISTORY →
          </button>
        </div>
      </div>

      {/* 5 Core Statistics Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "14px"
        }}
      >
        <StatCard
          label="TOTAL FLOWS"
          value={stats?.totalFlows || 0}
          subtext="Active captured flows"
          variant="default"
        />
        <StatCard
          label="LOW RISK"
          value={stats?.lowRisk || 0}
          subtext="Hybrid score < 0.30"
          variant="low"
        />
        <StatCard
          label="MEDIUM RISK"
          value={stats?.mediumRisk || 0}
          subtext="Hybrid score 0.30 - 0.59"
          variant="medium"
        />
        <StatCard
          label="HIGH RISK"
          value={stats?.highRisk || 0}
          subtext="Hybrid score 0.60 - 0.79"
          variant="high"
        />
        <StatCard
          label="CRITICAL RISK"
          value={stats?.criticalRisk || 0}
          subtext="Hybrid score >= 0.80"
          variant="critical"
        />
      </div>

      {/* Grid: 4 Main Sections */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))",
          gap: "20px"
        }}
      >
        {/* SECTION 1: Current Network Risk */}
        <section
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span className="dot-matrix-label">:: SECTION 01</span>
              <h3
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  margin: "2px 0 0 0"
                }}
              >
                Current Network Risk
              </h3>
            </div>
            <RiskBadge level={stats?.currentRiskLevel || "LOW"} />
          </div>

          {/* Primary Hybrid Gauge Indicator */}
          <div
            style={{
              padding: "16px",
              backgroundColor: "var(--bg-input)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-ultra-subtle)",
              display: "flex",
              flexDirection: "column",
              gap: "12px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span className="dot-matrix-label" style={{ fontSize: "10px" }}>
                NETWORK RISK INDEX (AGGREGATE)
              </span>
              <span
                className="font-mono"
                style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  color: stats?.currentRiskLevel === "CRITICAL"
                    ? "var(--threat-red)"
                    : stats?.currentRiskLevel === "HIGH"
                    ? "var(--high-orange)"
                    : stats?.currentRiskLevel === "MEDIUM"
                    ? "var(--medium-amber)"
                    : "var(--safe-green)"
                }}
              >
                {stats?.currentHybridScore?.toFixed(4) || "0.0000"}
              </span>
            </div>

            <ScoreMeter score={stats?.currentHybridScore || 0} label="" height={8} />

            <div
              className="font-mono"
              style={{
                fontSize: "11px",
                color: "var(--text-secondary)",
                display: "flex",
                justifyContent: "space-between"
              }}
            >
              <span>MONITORED HOST: {stats?.monitoredHost}</span>
              <span>
                POSTURE: {stats?.activeThreatsCount > 0 ? `${stats.activeThreatsCount} THREATS ACTIVE` : "STABLE"}
              </span>
            </div>
          </div>

          {/* Anomaly & Metric Details */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px"
            }}
          >
            <div
              style={{
                padding: "10px 12px",
                backgroundColor: "var(--bg-surface-elevated)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-subtle)"
              }}
            >
              <div className="dot-matrix-label" style={{ fontSize: "9px" }}>
                ACTIVE ANOMALY RATIO
              </div>
              <div
                className="font-mono"
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginTop: "2px"
                }}
              >
                {stats?.activeAnomalyPercentage}%
              </div>
              <div className="font-mono" style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                OCSVM anomaly &ge; 0.50
              </div>
            </div>

            <div
              style={{
                padding: "10px 12px",
                backgroundColor: "var(--bg-surface-elevated)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-subtle)"
              }}
            >
              <div className="dot-matrix-label" style={{ fontSize: "9px" }}>
                SURVEILLANCE STATUS
              </div>
              <div
                className="font-mono"
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--safe-green)",
                  marginTop: "4px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <span className="dot-led active" /> ACTIVE
              </div>
              <div className="font-mono" style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                tshark filter host {stats?.monitoredHost}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: Traffic Overview */}
        <section
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span className="dot-matrix-label">:: SECTION 02</span>
              <h3
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  margin: "2px 0 0 0"
                }}
              >
                Traffic Overview
              </h3>
            </div>
            <span className="font-mono" style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              RATE: {traffic?.activeFlowRate || "0.0"} flows/s
            </span>
          </div>

          {/* Protocol Distribution Grid */}
          <div>
            <div className="dot-matrix-label" style={{ fontSize: "10px", marginBottom: "8px" }}>
              PROTOCOL DISTRIBUTION
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "8px"
              }}
            >
              {Object.entries(traffic?.protocols || { TCP: 0, UDP: 0, ICMP: 0, OTHER: 0 }).map(
                ([proto, count]) => (
                  <div
                    key={proto}
                    style={{
                      padding: "8px 10px",
                      backgroundColor: "var(--bg-input)",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-ultra-subtle)",
                      textAlign: "center"
                    }}
                  >
                    <div className="dot-matrix-label" style={{ justifyContent: "center", fontSize: "9px" }}>
                      {proto}
                    </div>
                    <div
                      className="font-mono"
                      style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}
                    >
                      {count}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Bandwidth In / Out Metrics */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              paddingTop: "6px"
            }}
          >
            <div
              style={{
                padding: "12px",
                backgroundColor: "var(--bg-surface-elevated)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-subtle)"
              }}
            >
              <span className="dot-matrix-label" style={{ fontSize: "9px" }}>INCOMING TRAFFIC</span>
              <div
                className="font-mono"
                style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginTop: "2px" }}
              >
                {formatBytes(traffic?.totalInBytes)}
              </div>
              <div className="font-mono" style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                {traffic?.totalInPkts.toLocaleString() || 0} total packets
              </div>
            </div>

            <div
              style={{
                padding: "12px",
                backgroundColor: "var(--bg-surface-elevated)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-subtle)"
              }}
            >
              <span className="dot-matrix-label" style={{ fontSize: "9px" }}>OUTGOING TRAFFIC</span>
              <div
                className="font-mono"
                style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginTop: "2px" }}
              >
                {formatBytes(traffic?.totalOutBytes)}
              </div>
              <div className="font-mono" style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                {traffic?.totalOutPkts.toLocaleString() || 0} total packets
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: Model Analysis */}
        <section
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span className="dot-matrix-label">:: SECTION 03</span>
              <h3
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  margin: "2px 0 0 0"
                }}
              >
                Model Analysis
              </h3>
            </div>
            <span
              className="font-mono"
              style={{
                fontSize: "10px",
                color: "var(--text-secondary)",
                padding: "2px 6px",
                border: "1px solid var(--border-subtle)",
                borderRadius: "4px"
              }}
            >
              DUAL-MODEL INFERENCE
            </span>
          </div>

          {/* Model Breakdown Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div
              style={{
                padding: "12px",
                backgroundColor: "var(--bg-input)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-ultra-subtle)"
              }}
            >
              <span className="dot-matrix-label" style={{ fontSize: "9px" }}>XGBOOST CLASSIFIER</span>
              <div
                className="font-mono"
                style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginTop: "2px" }}
              >
                {modelAnalysis?.models?.supervised?.averageScore || "0.0000"}
              </div>
              <div className="font-mono" style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                Mean Attack Prob (Threshold: 0.50)
              </div>
            </div>

            <div
              style={{
                padding: "12px",
                backgroundColor: "var(--bg-input)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-ultra-subtle)"
              }}
            >
              <span className="dot-matrix-label" style={{ fontSize: "9px" }}>ONE-CLASS SVM</span>
              <div
                className="font-mono"
                style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginTop: "2px" }}
              >
                {modelAnalysis?.models?.unsupervised?.averageScore || "0.0000"}
              </div>
              <div className="font-mono" style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                Mean Anomaly (tanh scaled)
              </div>
            </div>
          </div>

          {/* Hybrid Formula Logic Card */}
          <div
            style={{
              padding: "12px",
              backgroundColor: "var(--bg-surface-elevated)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-subtle)"
            }}
          >
            <div className="dot-matrix-label" style={{ fontSize: "10px", marginBottom: "6px" }}>
              :: HYBRID FUSION LOGIC [backend/detector.py]
            </div>
            <div
              className="font-mono"
              style={{ fontSize: "11px", color: "var(--text-secondary)", lineHeight: 1.6 }}
            >
              <div>• <strong>Primary Decision Driver:</strong> Hybrid Risk Score = min(xgb, ocsvm) + (+0.2 if both &ge; 0.5)</div>
              <div>• <strong>Risk Tier Derivation:</strong> LOW (&lt;0.30), MEDIUM (&lt;0.60), HIGH (&lt;0.80), CRITICAL (&ge;0.80)</div>
              <div style={{ color: "var(--text-muted)", marginTop: "4px" }}>
                Note: Risk Level is determined exclusively from Hybrid Risk Score.
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: Recent Detections */}
        <section
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span className="dot-matrix-label">:: SECTION 04</span>
              <h3
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  margin: "2px 0 0 0"
                }}
              >
                Recent Detections
              </h3>
            </div>
            <button
              onClick={onNavigateToLive}
              style={{
                backgroundColor: "transparent",
                border: "none",
                color: "var(--text-secondary)",
                fontSize: "11px",
                fontFamily: "var(--font-mono)",
                cursor: "pointer"
              }}
            >
              VIEW LIVE STREAM →
            </button>
          </div>

          {/* Recent detection cards list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {recentDetections.map((flow) => (
              <DetectionCard
                key={flow.id}
                flow={flow}
                onInspect={setSelectedFlow}
                compact={true}
              />
            ))}
          </div>
        </section>
      </div>

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
