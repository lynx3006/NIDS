import React from 'react';

/**
 * Sidebar Component
 * Minimal technical navigation with Nothing Phone aesthetic
 * Navigation items: Dashboard, Live Detection, Detection History
 */
export default function Sidebar({
  currentView = "dashboard",
  onSelectView,
  isOpen = true,
  onClose
}) {
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "⊞",
      tag: "OVERVIEW"
    },
    {
      id: "live",
      label: "Live Detection",
      icon: "◎",
      tag: "REAL-TIME"
    },
    {
      id: "history",
      label: "Detection History",
      icon: "≡",
      tag: "FORENSICS"
    }
  ];

  return (
    <aside
      className={`sidebar-container ${isOpen ? "open" : ""}`}
      style={{
        width: "250px",
        height: "100vh",
        backgroundColor: "var(--bg-black)",
        borderRight: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        zIndex: 60
      }}
    >
      {/* Top Branding Section */}
      <div>
        <div
          style={{
            padding: "22px 20px",
            borderBottom: "1px solid var(--border-ultra-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Dot-matrix style brand icon */}
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "6px",
                backgroundColor: "var(--bg-surface-elevated)",
                border: "1px solid var(--border-medium)",
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                padding: "5px",
                gap: "3px"
              }}
            >
              <div style={{ backgroundColor: "#ffffff", borderRadius: "1px" }} />
              <div style={{ backgroundColor: "rgba(255,255,255,0.3)", borderRadius: "1px" }} />
              <div style={{ backgroundColor: "#ffffff", borderRadius: "1px" }} />
              <div style={{ backgroundColor: "rgba(255,255,255,0.3)", borderRadius: "1px" }} />
              <div style={{ backgroundColor: "#ffffff", borderRadius: "1px" }} />
              <div style={{ backgroundColor: "rgba(255,255,255,0.3)", borderRadius: "1px" }} />
              <div style={{ backgroundColor: "#ffffff", borderRadius: "1px" }} />
              <div style={{ backgroundColor: "rgba(255,255,255,0.3)", borderRadius: "1px" }} />
              <div style={{ backgroundColor: "#ffffff", borderRadius: "1px" }} />
            </div>

            <div>
              <div
                className="font-mono"
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: "var(--text-primary)"
                }}
              >
                NIDS // OS
              </div>
              <div
                className="dot-matrix-label"
                style={{ fontSize: "9px", color: "var(--text-muted)" }}
              >
                INTRUSION ENGINE
              </div>
            </div>
          </div>

          {/* Mobile close button */}
          {onClose && (
            <button
              onClick={onClose}
              className="mobile-only-btn"
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                fontSize: "16px",
                cursor: "pointer"
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Navigation Section */}
        <nav style={{ padding: "16px 12px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <div
            className="dot-matrix-label"
            style={{
              fontSize: "9px",
              color: "var(--text-faint)",
              padding: "4px 8px",
              letterSpacing: "0.12em"
            }}
          >
            :: NAVIGATION
          </div>

          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectView(item.id);
                  if (onClose) onClose();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: "var(--radius-sm)",
                  border: isActive ? "1px solid var(--border-medium)" : "1px solid transparent",
                  backgroundColor: isActive ? "var(--bg-surface-elevated)" : "transparent",
                  color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s ease",
                  width: "100%"
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "var(--bg-surface)";
                    e.currentTarget.style.color = "var(--text-primary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: "14px",
                      color: isActive ? "var(--text-primary)" : "var(--text-muted)"
                    }}
                  >
                    {item.icon}
                  </span>
                  <span style={{ fontSize: "13px", fontWeight: isActive ? 600 : 400 }}>
                    {item.label}
                  </span>
                </div>

                <span
                  className="font-mono"
                  style={{
                    fontSize: "9px",
                    color: isActive ? "var(--text-secondary)" : "var(--text-faint)",
                    letterSpacing: "0.06em"
                  }}
                >
                  {item.tag}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer: System Telemetry & Model Engine Info */}
      <div
        style={{
          padding: "16px 14px",
          borderTop: "1px solid var(--border-ultra-subtle)",
          backgroundColor: "var(--bg-surface)",
          display: "flex",
          flexDirection: "column",
          gap: "8px"
        }}
      >
        <div className="dot-matrix-label" style={{ fontSize: "9px" }}>
          <span className="dot-led active" />
          SYSTEM STATUS
        </div>

        <div
          className="font-mono"
          style={{
            fontSize: "11px",
            color: "var(--text-secondary)",
            lineHeight: 1.5,
            backgroundColor: "var(--bg-input)",
            padding: "8px 10px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-ultra-subtle)"
          }}
        >
          <div>ENGINE: <span style={{ color: "var(--text-primary)" }}>HYBRID DUAL-STAGE</span></div>
          <div>HOST: <span style={{ color: "var(--text-primary)" }}>172.17.51.28</span></div>
        </div>

        <div
          className="font-mono"
          style={{ fontSize: "9px", color: "var(--text-muted)", textAlign: "center" }}
        >
          PROTOTYPE // NOTHING AESTHETIC
        </div>
      </div>
    </aside>
  );
}
