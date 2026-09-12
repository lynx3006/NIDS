import React, { useState, useEffect } from 'react';
import RiskBadge from '../components/common/RiskBadge';
import FlowDetailModal from '../components/detection/FlowDetailModal';
import { getDetectionHistory } from '../services/api';

/**
 * DetectionHistoryView
 * Forensic investigation table with:
 * - Columns: Timestamp, Source, Destination, Protocol, Risk Score, Risk Level
 * - Search by IP, port, protocol, attack class
 * - Filter by Risk Level (ALL, LOW, MEDIUM, HIGH, CRITICAL)
 * - Sort by Timestamp (desc/asc)
 * - Pagination & Row inspection modal
 */
export default function DetectionHistoryView() {
  const [historyData, setHistoryData] = useState({
    items: [],
    total: 0,
    page: 1,
    totalPages: 1,
    limit: 15
  });
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getDetectionHistory({
      search,
      riskFilter,
      sortOrder,
      page,
      limit: 15
    }).then((data) => {
      if (isMounted) {
        setHistoryData(data);
        setLoading(false);
      }
    }).catch((err) => {
      console.error("Failed to load history:", err);
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [search, riskFilter, sortOrder, page]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1); // reset to first page on search
  };

  const handleRiskChange = (level) => {
    setRiskFilter(level);
    setPage(1);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Page Header */}
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
            :: FORENSIC ARCHIVE
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
            Detection History
          </h2>
          <div
            className="font-mono"
            style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}
          >
            HISTORICAL AUDIT LOG // QUERY ENGINE
          </div>
        </div>

        <div className="font-mono" style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
          TOTAL MATCHES: <strong style={{ color: "var(--text-primary)" }}>{historyData.total}</strong> FLOWS
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <div
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "14px"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px"
          }}
        >
          {/* Search Box */}
          <div style={{ flex: "1", minWidth: "260px", position: "relative" }}>
            <span
              className="font-mono"
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
                fontSize: "12px"
              }}
            >
              ⌕
            </span>
            <input
              type="text"
              placeholder="Search IP, port, protocol, attack signature..."
              value={search}
              onChange={handleSearchChange}
              style={{
                width: "100%",
                padding: "8px 12px 8px 32px",
                backgroundColor: "var(--bg-input)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-primary)",
                fontFamily: "var(--font-mono)",
                fontSize: "12px"
              }}
            />
          </div>

          {/* Sort Toggle Button */}
          <button
            onClick={toggleSortOrder}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              backgroundColor: "var(--bg-surface-elevated)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-sm)",
              color: "var(--text-primary)",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              cursor: "pointer"
            }}
          >
            <span>SORT TIMESTAMP:</span>
            <strong>{sortOrder === "desc" ? "NEWEST FIRST ↓" : "OLDEST FIRST ↑"}</strong>
          </button>
        </div>

        {/* Risk Level Filter Tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span className="dot-matrix-label" style={{ fontSize: "10px" }}>FILTER RISK:</span>
          {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((level) => (
            <button
              key={level}
              onClick={() => handleRiskChange(level)}
              style={{
                padding: "4px 12px",
                borderRadius: "var(--radius-sm)",
                border: riskFilter === level ? "1px solid var(--border-medium)" : "1px solid transparent",
                backgroundColor: riskFilter === level ? "var(--bg-surface-elevated)" : "transparent",
                color: riskFilter === level ? "var(--text-primary)" : "var(--text-secondary)",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                cursor: "pointer",
                fontWeight: riskFilter === level ? 600 : 400
              }}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Forensic Table Container */}
      <div
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          overflow: "hidden"
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left"
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid var(--border-subtle)",
                  backgroundColor: "var(--bg-surface-elevated)"
                }}
              >
                <th style={{ padding: "12px 16px", fontSize: "10px", color: "var(--text-secondary)" }} className="dot-matrix-label">
                  :: TIMESTAMP
                </th>
                <th style={{ padding: "12px 16px", fontSize: "10px", color: "var(--text-secondary)" }} className="dot-matrix-label">
                  :: SOURCE
                </th>
                <th style={{ padding: "12px 16px", fontSize: "10px", color: "var(--text-secondary)" }} className="dot-matrix-label">
                  :: DESTINATION
                </th>
                <th style={{ padding: "12px 16px", fontSize: "10px", color: "var(--text-secondary)" }} className="dot-matrix-label">
                  :: PROTOCOL
                </th>
                <th style={{ padding: "12px 16px", fontSize: "10px", color: "var(--text-secondary)" }} className="dot-matrix-label">
                  :: RISK SCORE
                </th>
                <th style={{ padding: "12px 16px", fontSize: "10px", color: "var(--text-secondary)" }} className="dot-matrix-label">
                  :: RISK LEVEL
                </th>
                <th style={{ padding: "12px 16px", fontSize: "10px", color: "var(--text-secondary)", textAlign: "right" }} className="dot-matrix-label">
                  :: ACTION
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                    <span className="dot-matrix-label">:: QUERYING FORENSIC DATABASE...</span>
                  </td>
                </tr>
              ) : historyData.items.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                    <div className="dot-matrix-label" style={{ justifyContent: "center" }}>
                      :: NO HISTORICAL RECORDS FOUND
                    </div>
                  </td>
                </tr>
              ) : (
                historyData.items.map((flow) => {
                  const isCrit = flow.risk_level === "CRITICAL";
                  return (
                    <tr
                      key={flow.id}
                      onClick={() => setSelectedFlow(flow)}
                      style={{
                        borderBottom: "1px solid var(--border-ultra-subtle)",
                        cursor: "pointer",
                        transition: "background-color 0.1s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "var(--bg-surface-elevated)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      {/* Timestamp */}
                      <td style={{ padding: "12px 16px" }} className="font-mono">
                        <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                          {flow.timestamp}
                        </span>
                      </td>

                      {/* Source */}
                      <td style={{ padding: "12px 16px" }} className="font-mono">
                        <span style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 500 }}>
                          {flow.src_ip}
                        </span>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          :{flow.src_port}
                        </span>
                      </td>

                      {/* Destination */}
                      <td style={{ padding: "12px 16px" }} className="font-mono">
                        <span style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 500 }}>
                          {flow.dst_ip}
                        </span>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          :{flow.dst_port}
                        </span>
                      </td>

                      {/* Protocol */}
                      <td style={{ padding: "12px 16px" }} className="font-mono">
                        <span
                          style={{
                            fontSize: "11px",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            backgroundColor: "var(--bg-input)",
                            border: "1px solid var(--border-subtle)",
                            color: "var(--text-primary)"
                          }}
                        >
                          {flow.protocol}
                        </span>
                        {flow.attack_class && (
                          <div style={{ fontSize: "10px", color: isCrit ? "var(--threat-red)" : "var(--text-muted)", marginTop: "2px" }}>
                            {flow.attack_class}
                          </div>
                        )}
                      </td>

                      {/* Risk Score (Hybrid Risk Score) */}
                      <td style={{ padding: "12px 16px" }} className="font-mono">
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: isCrit ? "var(--threat-red)" : "var(--text-primary)"
                          }}
                        >
                          {Number(flow.hybrid_score).toFixed(4)}
                        </span>
                        <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                          xgb: {flow.xgb_probability.toFixed(2)} | ocsvm: {flow.ocsvm_anomaly.toFixed(2)}
                        </div>
                      </td>

                      {/* Risk Level */}
                      <td style={{ padding: "12px 16px" }}>
                        <RiskBadge level={flow.risk_level} size="small" />
                      </td>

                      {/* Action */}
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFlow(flow);
                          }}
                          style={{
                            backgroundColor: "transparent",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "var(--radius-sm)",
                            color: "var(--text-secondary)",
                            padding: "4px 8px",
                            fontSize: "10px",
                            fontFamily: "var(--font-mono)",
                            cursor: "pointer"
                          }}
                        >
                          INSPECT
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid var(--border-subtle)",
            backgroundColor: "var(--bg-surface-elevated)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px"
          }}
        >
          <div className="font-mono" style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            PAGE {historyData.page} OF {historyData.totalPages} ({historyData.total} TOTAL ENTRIES)
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button
              disabled={historyData.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{
                padding: "4px 10px",
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                color: historyData.page <= 1 ? "var(--text-muted)" : "var(--text-primary)",
                cursor: historyData.page <= 1 ? "not-allowed" : "pointer",
                fontFamily: "var(--font-mono)",
                fontSize: "11px"
              }}
            >
              ← PREV
            </button>

            <span className="font-mono" style={{ fontSize: "11px", padding: "0 6px" }}>
              {historyData.page}
            </span>

            <button
              disabled={historyData.page >= historyData.totalPages}
              onClick={() => setPage((p) => Math.min(historyData.totalPages, p + 1))}
              style={{
                padding: "4px 10px",
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                color: historyData.page >= historyData.totalPages ? "var(--text-muted)" : "var(--text-primary)",
                cursor: historyData.page >= historyData.totalPages ? "not-allowed" : "pointer",
                fontFamily: "var(--font-mono)",
                fontSize: "11px"
              }}
            >
              NEXT →
            </button>
          </div>
        </div>
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
