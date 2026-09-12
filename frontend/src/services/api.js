/**
 * NIDS API Service Layer
 * 
 * Abstracted API service separating the React UI from data sourcing.
 * Currently uses mock data with simulation capabilities.
 * 
 * To switch to real FastAPI endpoints in the future:
 * Set USE_MOCK = false and configure VITE_API_BASE_URL in .env.
 */

import {
  INITIAL_FLOW_HISTORY,
  createDetectionRecord,
  calculateDashboardStats,
  calculateHybridScore,
  getRiskLevel
} from "../mock/mockData";

const USE_MOCK = true;
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || "http://localhost:8000/api";

// In-memory flow store during session
let flowStore = [...INITIAL_FLOW_HISTORY];

/**
 * Fetch high-level dashboard statistics
 */
export async function getDashboardStats() {
  if (USE_MOCK) {
    // Simulate slight asynchronous resolution
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(calculateDashboardStats(flowStore));
      }, 50);
    });
  }

  const response = await fetch(`${API_BASE_URL}/stats`);
  if (!response.ok) throw new Error("Failed to fetch dashboard stats");
  return response.json();
}

/**
 * Fetch most recent detections
 */
export async function getRecentDetections(limit = 6) {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(flowStore.slice(0, limit));
      }, 50);
    });
  }

  const response = await fetch(`${API_BASE_URL}/detections/recent?limit=${limit}`);
  if (!response.ok) throw new Error("Failed to fetch recent detections");
  return response.json();
}

/**
 * Fetch detection history with search, filtering, and sorting
 */
export async function getDetectionHistory({
  search = "",
  riskFilter = "ALL",
  sortOrder = "desc", // "desc" (newest first) or "asc" (oldest first)
  page = 1,
  limit = 15
} = {}) {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let results = [...flowStore];

        // Search filter: IP, port, protocol, attack class
        if (search && search.trim() !== "") {
          const q = search.trim().toLowerCase();
          results = results.filter((flow) => {
            return (
              flow.src_ip.toLowerCase().includes(q) ||
              flow.dst_ip.toLowerCase().includes(q) ||
              flow.protocol.toLowerCase().includes(q) ||
              String(flow.src_port).includes(q) ||
              String(flow.dst_port).includes(q) ||
              (flow.attack_class && flow.attack_class.toLowerCase().includes(q))
            );
          });
        }

        // Risk Level filter: ALL, LOW, MEDIUM, HIGH, CRITICAL
        if (riskFilter && riskFilter !== "ALL") {
          results = results.filter((flow) => flow.risk_level === riskFilter);
        }

        // Sort by timestamp
        results.sort((a, b) => {
          return sortOrder === "asc"
            ? a.timestampRaw - b.timestampRaw
            : b.timestampRaw - a.timestampRaw;
        });

        // Pagination
        const totalItems = results.length;
        const totalPages = Math.ceil(totalItems / limit) || 1;
        const startIndex = (page - 1) * limit;
        const pagedItems = results.slice(startIndex, startIndex + limit);

        resolve({
          items: pagedItems,
          total: totalItems,
          page,
          totalPages,
          limit
        });
      }, 60);
    });
  }

  const queryParams = new URLSearchParams({
    search,
    risk_level: riskFilter,
    sort: sortOrder,
    page: String(page),
    limit: String(limit)
  });

  const response = await fetch(`${API_BASE_URL}/detections/history?${queryParams}`);
  if (!response.ok) throw new Error("Failed to fetch detection history");
  return response.json();
}

/**
 * Fetch traffic overview metrics (protocols, bytes in/out, throughput)
 */
export async function getTrafficOverview() {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const protocols = { TCP: 0, UDP: 0, ICMP: 0, OTHER: 0 };
        let totalInBytes = 0;
        let totalOutBytes = 0;
        let totalInPkts = 0;
        let totalOutPkts = 0;

        flowStore.forEach((f) => {
          if (protocols[f.protocol] !== undefined) {
            protocols[f.protocol]++;
          } else {
            protocols.OTHER++;
          }
          totalInBytes += f.IN_BYTES;
          totalOutBytes += f.OUT_BYTES;
          totalInPkts += f.IN_PKTS;
          totalOutPkts += f.OUT_PKTS;
        });

        resolve({
          protocols,
          totalInBytes,
          totalOutBytes,
          totalInPkts,
          totalOutPkts,
          activeFlowRate: Number((flowStore.length / 4.2).toFixed(1))
        });
      }, 50);
    });
  }

  const response = await fetch(`${API_BASE_URL}/traffic/overview`);
  if (!response.ok) throw new Error("Failed to fetch traffic overview");
  return response.json();
}

/**
 * Fetch model analysis statistics and correlation data
 */
export async function getModelAnalysis() {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const sampleFlows = flowStore.slice(0, 30);
        const avgXgb = sampleFlows.reduce((sum, f) => sum + f.xgb_probability, 0) / sampleFlows.length;
        const avgOcsvm = sampleFlows.reduce((sum, f) => sum + f.ocsvm_anomaly, 0) / sampleFlows.length;
        const avgHybrid = sampleFlows.reduce((sum, f) => sum + f.hybrid_score, 0) / sampleFlows.length;

        resolve({
          models: {
            supervised: {
              name: "XGBoost Classifier",
              file: "XGboost_model.pkl",
              metricName: "Attack Probability",
              averageScore: Number(avgXgb.toFixed(4)),
              threshold: 0.50
            },
            unsupervised: {
              name: "One-Class SVM",
              file: "ocsvm_model.pkl",
              scaler: "ocsvm_scaler.pkl",
              metricName: "Anomaly Score",
              averageScore: Number(avgOcsvm.toFixed(4)),
              threshold: 0.50
            },
            hybrid: {
              name: "Hybrid Risk Engine",
              formula: "min(xgb, ocsvm) + (0.2 if both >= 0.5 else 0.0)",
              averageScore: Number(avgHybrid.toFixed(4)),
              riskLevels: {
                LOW: "< 0.30",
                MEDIUM: "0.30 - 0.59",
                HIGH: "0.60 - 0.79",
                CRITICAL: ">= 0.80"
              }
            }
          },
          samples: sampleFlows.slice(0, 8)
        });
      }, 50);
    });
  }

  const response = await fetch(`${API_BASE_URL}/model/analysis`);
  if (!response.ok) throw new Error("Failed to fetch model analysis");
  return response.json();
}

/**
 * Subscribe to simulated live flows (or WebSocket in production)
 * @param {Function} onFlowReceived Callback called with new flow record
 * @param {number} intervalMs Milliseconds between incoming flows
 * @returns {Function} Unsubscribe function
 */
export function subscribeLiveFlows(onFlowReceived, intervalMs = 2400) {
  if (USE_MOCK) {
    let flowCounter = flowStore.length + 1;
    const timer = setInterval(() => {
      const newFlow = createDetectionRecord(flowCounter++, 0);
      // Prepend to internal flow store so other views have the updated data
      flowStore = [newFlow, ...flowStore.slice(0, 199)];
      onFlowReceived(newFlow);
    }, intervalMs);

    return () => clearInterval(timer);
  }

  // Future WebSocket implementation:
  const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${wsProtocol}//${window.location.host}/api/ws/live-flows`;
  const socket = new WebSocket(wsUrl);

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onFlowReceived(data);
    } catch (err) {
      console.error("Live flow parse error:", err);
    }
  };

  return () => socket.close();
}

export { calculateHybridScore, getRiskLevel };
