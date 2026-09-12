import React from 'react';

/**
 * StatCard component
 * High-density industrial KPI card with large monospace figures and micro-labels
 */
export default function StatCard({
  label,
  value,
  subtext,
  variant = "default", // default, low, medium, high, critical
  icon
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case "critical":
        return {
          borderColor: "var(--threat-red-border)",
          glowColor: "var(--threat-red-dim)",
          numColor: "var(--threat-red)",
          indicatorClass: "dot-led threat"
        };
      case "high":
        return {
          borderColor: "var(--high-orange-border)",
          glowColor: "var(--high-orange-dim)",
          numColor: "var(--high-orange)",
          indicatorClass: "dot-led threat"
        };
      case "medium":
        return {
          borderColor: "var(--medium-amber-border)",
          glowColor: "var(--medium-amber-dim)",
          numColor: "var(--medium-amber)",
          indicatorClass: "dot-led"
        };
      case "low":
        return {
          borderColor: "var(--safe-green-border)",
          glowColor: "var(--safe-green-dim)",
          numColor: "var(--safe-green)",
          indicatorClass: "dot-led active"
        };
      case "default":
      default:
        return {
          borderColor: "var(--border-subtle)",
          glowColor: "transparent",
          numColor: "var(--text-primary)",
          indicatorClass: "dot-led"
        };
    }
  };

  const vStyle = getVariantStyles();

  return (
    <div
      style={{
        backgroundColor: "var(--bg-surface)",
        border: `1px solid ${vStyle.borderColor}`,
        borderRadius: "var(--radius-md)",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: "10px",
        position: "relative",
        overflow: "hidden",
        boxShadow: vStyle.glowColor !== "transparent" ? `inset 0 0 16px ${vStyle.glowColor}` : "none",
        transition: "border-color 0.2s ease, transform 0.15s ease"
      }}
    >
      {/* Card Header: Label & Status Dot */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span
          className="dot-matrix-label"
          style={{ fontSize: "11px", color: "var(--text-secondary)" }}
        >
          {icon && <span style={{ opacity: 0.7 }}>{icon}</span>}
          {label}
        </span>
        <span className={vStyle.indicatorClass} />
      </div>

      {/* Main Metric Value */}
      <div
        className="font-mono"
        style={{
          fontSize: "30px",
          fontWeight: 700,
          lineHeight: 1.1,
          color: vStyle.numColor,
          letterSpacing: "-0.02em"
        }}
      >
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>

      {/* Subtext / Context */}
      {subtext && (
        <div
          className="font-mono"
          style={{
            fontSize: "11px",
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}
        >
          {subtext}
        </div>
      )}
    </div>
  );
}
