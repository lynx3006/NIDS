import React from 'react';

/**
 * RiskBadge component
 * Displays risk level (LOW, MEDIUM, HIGH, CRITICAL) derived from Hybrid Risk Score
 * Styled with Nothing-inspired technical monochrome & subtle status tint
 */
export default function RiskBadge({ level = "LOW", size = "normal" }) {
  const normLevel = (level || "LOW").toUpperCase();

  const getStyle = () => {
    switch (normLevel) {
      case "CRITICAL":
        return {
          color: "var(--threat-red)",
          borderColor: "var(--threat-red-border)",
          backgroundColor: "var(--threat-red-dim)",
          dotColor: "var(--threat-red)"
        };
      case "HIGH":
        return {
          color: "var(--high-orange)",
          borderColor: "var(--high-orange-border)",
          backgroundColor: "var(--high-orange-dim)",
          dotColor: "var(--high-orange)"
        };
      case "MEDIUM":
        return {
          color: "var(--medium-amber)",
          borderColor: "var(--medium-amber-border)",
          backgroundColor: "var(--medium-amber-dim)",
          dotColor: "var(--medium-amber)"
        };
      case "LOW":
      default:
        return {
          color: "var(--safe-green)",
          borderColor: "var(--safe-green-border)",
          backgroundColor: "var(--safe-green-dim)",
          dotColor: "var(--safe-green)"
        };
    }
  };

  const style = getStyle();
  const isSmall = size === "small";

  return (
    <span
      className="font-mono"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: isSmall ? "4px" : "6px",
        padding: isSmall ? "2px 6px" : "3px 8px",
        borderRadius: "var(--radius-sm)",
        fontSize: isSmall ? "10px" : "11px",
        fontWeight: 600,
        letterSpacing: "0.06em",
        border: `1px solid ${style.borderColor}`,
        backgroundColor: style.backgroundColor,
        color: style.color,
        lineHeight: 1,
        whiteSpace: "nowrap"
      }}
    >
      <span
        style={{
          width: isSmall ? "4px" : "5px",
          height: isSmall ? "4px" : "5px",
          borderRadius: "50%",
          backgroundColor: style.dotColor,
          display: "inline-block"
        }}
      />
      {normLevel}
    </span>
  );
}
