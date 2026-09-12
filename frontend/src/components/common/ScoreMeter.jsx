import React from 'react';

/**
 * ScoreMeter component
 * Displays Hybrid Risk Score (0.0000 - 1.0000) with visual meter & exact number
 * Includes threshold demarcations matching detector.py (<0.3, <0.6, <0.8, >=0.8)
 */
export default function ScoreMeter({
  score = 0,
  label = "HYBRID RISK SCORE",
  showThresholds = true,
  height = 6
}) {
  const normalizedScore = Math.max(0, Math.min(1, Number(score) || 0));
  const percent = (normalizedScore * 100).toFixed(1);

  // Determine meter track color based strictly on hybrid score
  let meterColor = "var(--safe-green)";
  if (normalizedScore >= 0.8) {
    meterColor = "var(--threat-red)";
  } else if (normalizedScore >= 0.6) {
    meterColor = "var(--high-orange)";
  } else if (normalizedScore >= 0.3) {
    meterColor = "var(--medium-amber)";
  }

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "6px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        {label && (
          <span className="dot-matrix-label" style={{ fontSize: "10px" }}>
            :: {label}
          </span>
        )}
        <span
          className="font-mono"
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--text-primary)",
            marginLeft: "auto"
          }}
        >
          {Number(normalizedScore).toFixed(4)}
          <span style={{ fontSize: "10px", color: "var(--text-muted)", marginLeft: "4px" }}>
            ({percent}%)
          </span>
        </span>
      </div>

      {/* Meter Bar Container */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: `${height}px`,
          backgroundColor: "var(--bg-input)",
          borderRadius: "3px",
          overflow: "hidden",
          border: "1px solid var(--border-subtle)"
        }}
      >
        {/* Filled bar */}
        <div
          style={{
            height: "100%",
            width: `${percent}%`,
            backgroundColor: meterColor,
            transition: "width 0.3s ease, background-color 0.3s ease"
          }}
        />

        {/* Threshold Markers */}
        {showThresholds && (
          <>
            <div
              title="LOW / MEDIUM Threshold (0.30)"
              style={{
                position: "absolute",
                left: "30%",
                top: 0,
                bottom: 0,
                width: "1px",
                backgroundColor: "rgba(255, 255, 255, 0.25)"
              }}
            />
            <div
              title="MEDIUM / HIGH Threshold (0.60)"
              style={{
                position: "absolute",
                left: "60%",
                top: 0,
                bottom: 0,
                width: "1px",
                backgroundColor: "rgba(255, 255, 255, 0.25)"
              }}
            />
            <div
              title="HIGH / CRITICAL Threshold (0.80)"
              style={{
                position: "absolute",
                left: "80%",
                top: 0,
                bottom: 0,
                width: "1px",
                backgroundColor: "rgba(239, 68, 68, 0.5)"
              }}
            />
          </>
        )}
      </div>

      {showThresholds && (
        <div
          className="font-mono"
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "9px",
            color: "var(--text-muted)",
            letterSpacing: "0.02em"
          }}
        >
          <span>0.0</span>
          <span style={{ transform: "translateX(-20%)" }}>0.30 LOW</span>
          <span style={{ transform: "translateX(-10%)" }}>0.60 MED</span>
          <span style={{ transform: "translateX(-5%)" }}>0.80 HIGH</span>
          <span>1.0</span>
        </div>
      )}
    </div>
  );
}
