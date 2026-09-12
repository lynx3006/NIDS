import React from 'react';
import RiskBadge from '../common/RiskBadge';
import ScoreMeter from '../common/ScoreMeter';

/**
 * FlowDetailModal
 * Technical modal/drawer displaying comprehensive forensic telemetry for a selected flow
 */
export default function FlowDetailModal({ flow, onClose }) {
  if (!flow) return null;

  const isCritical = flow.risk_level === "CRITICAL";

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "16px"
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border-medium)",
          borderRadius: "var(--radius-lg)",
          width: "100%",
          maxWidth: "680px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.8)",
          position: "relative"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div className="dot-matrix-label" style={{ fontSize: "11px", marginBottom: "4px" }}>
              :: FLOW FORENSIC INSPECTOR
            </div>
            <h3
              className="font-mono"
              style={{
                fontSize: "18px",
                fontWeight: 600,
                color: "var(--text-primary)",
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}
            >
              <span>{flow.src_ip}:{flow.src_port}</span>
              <span style={{ color: "var(--text-muted)", fontWeight: 300 }}>→</span>
              <span>{flow.dst_ip}:{flow.dst_port}</span>
            </h3>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <RiskBadge level={flow.risk_level} />
            <button
              onClick={onClose}
              style={{
                backgroundColor: "var(--bg-surface-elevated)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-secondary)",
                padding: "4px 10px",
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                fontSize: "12px"
              }}
            >
              ESC [ ✕ ]
            </button>
          </div>
        </div>

        {/* Attack Classification Banner */}
        {flow.attack_class && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: isCritical ? "var(--threat-red-dim)" : "var(--bg-surface-elevated)",
              border: `1px solid ${isCritical ? "var(--threat-red-border)" : "var(--border-subtle)"}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div>
              <span className="dot-matrix-label" style={{ fontSize: "10px" }}>SIGNATURE / BEHAVIOR</span>
              <div
                className="font-mono"
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: isCritical ? "var(--threat-red)" : "var(--text-primary)"
                }}
              >
                {flow.attack_class}
              </div>
            </div>
            <div className="font-mono" style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              PROTOCOL: {flow.protocol}
            </div>
          </div>
        )}

        {/* Primary Hybrid Score Meter */}
        <div
          style={{
            padding: "14px",
            backgroundColor: "var(--bg-input)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)",
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          }}
        >
          <ScoreMeter score={flow.hybrid_score} label="HYBRID RISK SCORE (DECISION ENGINE)" height={8} />

          <div
            className="font-mono"
            style={{
              fontSize: "11px",
              color: "var(--text-secondary)",
              lineHeight: 1.5,
              paddingTop: "6px",
              borderTop: "1px solid var(--border-ultra-subtle)"
            }}
          >
            <div style={{ color: "var(--text-muted)", marginBottom: "2px" }}>
              <strong>Hybrid Formula (backend/detector.py):</strong>
            </div>
            <code>
              {flow.xgb_probability >= 0.5 && flow.ocsvm_anomaly >= 0.5
                ? `xgb(${flow.xgb_probability}) >= 0.5 && ocsvm(${flow.ocsvm_anomaly}) >= 0.5 => min(${flow.xgb_probability}, ${flow.ocsvm_anomaly}) + 0.2 = ${flow.hybrid_score}`
                : `min(xgb(${flow.xgb_probability}), ocsvm(${flow.ocsvm_anomaly})) = ${flow.hybrid_score}`}
            </code>
            <div style={{ marginTop: "4px" }}>
              Risk Level: <strong style={{ color: "var(--text-primary)" }}>{flow.risk_level}</strong> (derived exclusively from Hybrid Score)
            </div>
          </div>
        </div>

        {/* Component Model Breakdowns */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {/* XGBoost Classifier */}
          <div
            style={{
              padding: "12px",
              backgroundColor: "var(--bg-surface-elevated)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)"
            }}
          >
            <div className="dot-matrix-label" style={{ fontSize: "10px", marginBottom: "4px" }}>
              SUPERVISED: XGBOOST
            </div>
            <div
              className="font-mono"
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: flow.xgb_probability >= 0.5 ? "var(--threat-red)" : "var(--text-primary)"
              }}
            >
              {Number(flow.xgb_probability).toFixed(4)}
            </div>
            <div className="font-mono" style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
              Model: XGboost_model.pkl
            </div>
            <div className="font-mono" style={{ fontSize: "10px", color: "var(--text-secondary)", marginTop: "2px" }}>
              Attack Prob: {(flow.xgb_probability * 100).toFixed(1)}% | Decision: {flow.xgb_probability >= 0.5 ? "ATTACK DETECTED" : "BENIGN"}
            </div>
          </div>

          {/* One-Class SVM */}
          <div
            style={{
              padding: "12px",
              backgroundColor: "var(--bg-surface-elevated)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)"
            }}
          >
            <div className="dot-matrix-label" style={{ fontSize: "10px", marginBottom: "4px" }}>
              UNSUPERVISED: ONE-CLASS SVM
            </div>
            <div
              className="font-mono"
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: flow.ocsvm_anomaly >= 0.5 ? "var(--high-orange)" : "var(--text-primary)"
              }}
            >
              {Number(flow.ocsvm_anomaly).toFixed(4)}
            </div>
            <div className="font-mono" style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
              Model: ocsvm_model.pkl + scaler
            </div>
            <div className="font-mono" style={{ fontSize: "10px", color: "var(--text-secondary)", marginTop: "2px" }}>
              Anomaly: {(flow.ocsvm_anomaly * 100).toFixed(1)}% | Decision: {flow.ocsvm_anomaly >= 0.5 ? "OUTLIER" : "NORMAL"}
            </div>
          </div>
        </div>

        {/* Feature Payload Representation */}
        <div
          style={{
            backgroundColor: "var(--bg-black)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)",
            padding: "12px"
          }}
        >
          <div className="dot-matrix-label" style={{ fontSize: "10px", marginBottom: "8px" }}>
            :: RAW FLOW TELEMETRY VECTOR [detector.py analyze_flow input]
          </div>
          <div
            className="font-mono"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "8px",
              fontSize: "11px",
              color: "var(--text-secondary)"
            }}
          >
            <div>IN_BYTES: <span style={{ color: "var(--text-primary)" }}>{flow.IN_BYTES.toLocaleString()}</span></div>
            <div>OUT_BYTES: <span style={{ color: "var(--text-primary)" }}>{flow.OUT_BYTES.toLocaleString()}</span></div>
            <div>IN_PKTS: <span style={{ color: "var(--text-primary)" }}>{flow.IN_PKTS.toLocaleString()}</span></div>
            <div>OUT_PKTS: <span style={{ color: "var(--text-primary)" }}>{flow.OUT_PKTS.toLocaleString()}</span></div>
            <div>PROTOCOL: <span style={{ color: "var(--text-primary)" }}>{flow.protocol}</span></div>
            <div>TIMESTAMP: <span style={{ color: "var(--text-primary)" }}>{flow.timestamp}</span></div>
          </div>
        </div>

        {/* Close button */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: "var(--bg-surface-elevated)",
              border: "1px solid var(--border-medium)",
              borderRadius: "var(--radius-sm)",
              color: "var(--text-primary)",
              padding: "8px 16px",
              fontSize: "12px",
              fontFamily: "var(--font-mono)",
              cursor: "pointer"
            }}
          >
            CLOSE INSPECTOR
          </button>
        </div>
      </div>
    </div>
  );
}
