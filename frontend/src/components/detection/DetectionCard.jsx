import React, { useState } from 'react';
import RiskBadge from '../common/RiskBadge';
import ScoreMeter from '../common/ScoreMeter';

/**
 * DetectionCard Component
 * Implements the full project specification display:
 * - Risk Level (strictly from Hybrid Risk Score)
 * - Hybrid Risk Score
 * - XGBoost Attack Probability
 * - OCSVM Anomaly Score
 * - Source IP & Port
 * - Destination IP & Port
 * - Protocol
 * - Incoming Bytes (IN_BYTES)
 * - Outgoing Bytes (OUT_BYTES)
 * - Incoming Packets (IN_PKTS)
 * - Outgoing Packets (OUT_PKTS)
 * - Timestamp
 * - Optional expandable detail/inspection view
 */
export default function DetectionCard({
  flow,
  onInspect,
  compact = false,
  initiallyExpanded = false
}) {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);

  if (!flow) return null;

  const isCritical = flow.risk_level === "CRITICAL";
  const isHigh = flow.risk_level === "HIGH";

  const borderColor = isCritical
    ? "var(--threat-red-border)"
    : isHigh
    ? "var(--high-orange-border)"
    : "var(--border-subtle)";

  const formatBytes = (bytes) => {
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(2)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  };

  return (
    <div
      style={{
        backgroundColor: "var(--bg-surface)",
        border: `1px solid ${borderColor}`,
        borderRadius: "var(--radius-md)",
        padding: compact ? "12px 14px" : "16px 18px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        position: "relative",
        transition: "border-color 0.15s ease, background-color 0.15s ease"
      }}
    >
      {/* Top Header: Protocol, Direction, Risk Badge & Timestamp */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "8px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            className="font-mono"
            style={{
              fontSize: "11px",
              padding: "2px 6px",
              borderRadius: "4px",
              backgroundColor: "var(--bg-surface-elevated)",
              border: "1px solid var(--border-medium)",
              color: "var(--text-primary)",
              fontWeight: 700
            }}
          >
            {flow.protocol}
          </span>
          <RiskBadge level={flow.risk_level} size="small" />
          {flow.attack_class && (
            <span
              className="font-mono"
              style={{
                fontSize: "11px",
                color: isCritical ? "var(--threat-red)" : isHigh ? "var(--high-orange)" : "var(--text-secondary)"
              }}
            >
              :: {flow.attack_class}
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            className="font-mono"
            style={{ fontSize: "11px", color: "var(--text-muted)" }}
          >
            {flow.timestamp}
          </span>

          {onInspect && (
            <button
              onClick={() => onInspect(flow)}
              style={{
                backgroundColor: "transparent",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-secondary)",
                padding: "2px 8px",
                fontSize: "10px",
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                transition: "all 0.15s ease"
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = "var(--border-light)";
                e.target.style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = "var(--border-subtle)";
                e.target.style.color = "var(--text-secondary)";
              }}
            >
              INSPECT
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              backgroundColor: "transparent",
              border: "none",
              color: "var(--text-muted)",
              fontSize: "12px",
              cursor: "pointer",
              padding: "2px 4px",
              fontFamily: "var(--font-mono)"
            }}
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? "[ − ]" : "[ + ]"}
          </button>
        </div>
      </div>

      {/* Network 4-Tuple: Source -> Destination */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "10px",
          backgroundColor: "var(--bg-input)",
          padding: "8px 12px",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--border-ultra-subtle)"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span className="dot-matrix-label" style={{ fontSize: "9px" }}>SOURCE</span>
          <span
            className="font-mono"
            style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 500 }}
          >
            {flow.src_ip}
            <span style={{ color: "var(--text-muted)", marginLeft: "2px" }}>:{flow.src_port}</span>
          </span>
        </div>

        <div
          className="font-mono"
          style={{ color: "var(--text-muted)", fontSize: "14px" }}
        >
          →
        </div>

        <div style={{ display: "flex", flexDirection: "column", textAlign: "right" }}>
          <span className="dot-matrix-label" style={{ fontSize: "9px", justifyContent: "flex-end" }}>DESTINATION</span>
          <span
            className="font-mono"
            style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 500 }}
          >
            {flow.dst_ip}
            <span style={{ color: "var(--text-muted)", marginLeft: "2px" }}>:{flow.dst_port}</span>
          </span>
        </div>
      </div>

      {/* Model Scores: Hybrid, XGBoost, OCSVM */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <ScoreMeter score={flow.hybrid_score} label="HYBRID RISK SCORE" height={5} />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px",
            marginTop: "2px"
          }}
        >
          {/* XGBoost Attack Probability */}
          <div
            style={{
              padding: "6px 10px",
              backgroundColor: "var(--bg-surface-elevated)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-subtle)"
            }}
          >
            <div className="dot-matrix-label" style={{ fontSize: "9px" }}>
              XGBOOST ATTACK PROB
            </div>
            <div
              className="font-mono"
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: flow.xgb_probability >= 0.5 ? "var(--threat-red)" : "var(--text-secondary)",
                marginTop: "2px"
              }}
            >
              {Number(flow.xgb_probability).toFixed(4)}
              <span style={{ fontSize: "10px", color: "var(--text-muted)", marginLeft: "4px" }}>
                ({(flow.xgb_probability * 100).toFixed(0)}%)
              </span>
            </div>
          </div>

          {/* OCSVM Anomaly Score */}
          <div
            style={{
              padding: "6px 10px",
              backgroundColor: "var(--bg-surface-elevated)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-subtle)"
            }}
          >
            <div className="dot-matrix-label" style={{ fontSize: "9px" }}>
              OCSVM ANOMALY SCORE
            </div>
            <div
              className="font-mono"
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: flow.ocsvm_anomaly >= 0.5 ? "var(--high-orange)" : "var(--text-secondary)",
                marginTop: "2px"
              }}
            >
              {Number(flow.ocsvm_anomaly).toFixed(4)}
              <span style={{ fontSize: "10px", color: "var(--text-muted)", marginLeft: "4px" }}>
                ({(flow.ocsvm_anomaly * 100).toFixed(0)}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Traffic Metrics: In/Out Bytes, In/Out Packets */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "8px",
          paddingTop: "6px",
          borderTop: "1px solid var(--border-ultra-subtle)"
        }}
      >
        <div>
          <span className="dot-matrix-label" style={{ fontSize: "9px" }}>IN BYTES</span>
          <div className="font-mono" style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 500 }}>
            {formatBytes(flow.IN_BYTES)}
          </div>
        </div>
        <div>
          <span className="dot-matrix-label" style={{ fontSize: "9px" }}>OUT BYTES</span>
          <div className="font-mono" style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 500 }}>
            {formatBytes(flow.OUT_BYTES)}
          </div>
        </div>
        <div>
          <span className="dot-matrix-label" style={{ fontSize: "9px" }}>IN PKTS</span>
          <div className="font-mono" style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 500 }}>
            {flow.IN_PKTS.toLocaleString()}
          </div>
        </div>
        <div>
          <span className="dot-matrix-label" style={{ fontSize: "9px" }}>OUT PKTS</span>
          <div className="font-mono" style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 500 }}>
            {flow.OUT_PKTS.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Expandable Technical Forensics Detail */}
      {isExpanded && (
        <div
          style={{
            marginTop: "6px",
            padding: "10px 12px",
            backgroundColor: "var(--bg-black)",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-subtle)",
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          }}
        >
          <div className="dot-matrix-label" style={{ fontSize: "10px", color: "var(--text-primary)" }}>
            :: FLOW TELEMETRY & DECISION MATRIX
          </div>
          <div
            className="font-mono"
            style={{ fontSize: "11px", color: "var(--text-secondary)", lineHeight: 1.6 }}
          >
            <div><strong>Flow ID:</strong> {flow.id}</div>
            <div><strong>Backend Scoring Formula:</strong> min(xgb, ocsvm) + (0.2 if both &ge; 0.5) = {flow.hybrid_score}</div>
            <div><strong>Evaluation Engine:</strong> XGBoost (Supervised) + OCSVM (Unsupervised Isolation)</div>
            <div><strong>Risk Level Determination:</strong> {flow.risk_level} (from Hybrid Score: {flow.hybrid_score})</div>
            <div><strong>Raw Byte Ratio (In/Out):</strong> {(flow.IN_BYTES / (flow.OUT_BYTES || 1)).toFixed(2)}</div>
            <div><strong>Packet Volume:</strong> {flow.IN_PKTS + flow.OUT_PKTS} total frames</div>
          </div>
        </div>
      )}
    </div>
  );
}
