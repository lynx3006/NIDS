/**
 * NIDS Mock Data & Risk Scoring Engine
 * 
 * Replicates the exact detection logic from backend/detector.py:
 * - hybrid_score(xgb_prob, ocsvm_anomaly)
 * - risk_level(hybrid_score)
 * 
 * Note: Risk level is strictly derived from the Hybrid Risk Score.
 */

// Exact replica of backend/detector.py hybrid_score
export function calculateHybridScore(xgbProbability, ocsvmAnomaly) {
  if (xgbProbability >= 0.5 && ocsvmAnomaly >= 0.5) {
    const score = Math.min(xgbProbability, ocsvmAnomaly);
    return Math.min(1.0, score + 0.2);
  } else {
    return Math.min(xgbProbability, ocsvmAnomaly);
  }
}

// Exact replica of backend/detector.py risk_level
export function getRiskLevel(score) {
  if (score < 0.3) {
    return "LOW";
  } else if (score < 0.6) {
    return "MEDIUM";
  } else if (score < 0.8) {
    return "HIGH";
  } else {
    return "CRITICAL";
  }
}

// Helper to format float to 4 decimal places
export function formatScore(num) {
  return Number(num).toFixed(4);
}

// Realistic attack descriptions for forensics (informational only)
const ATTACK_PROFILES = [
  { class: "Benign HTTPS", proto: "TCP", dport: 443, xgb: 0.04, ocsvm: 0.08, inBytesRange: [1200, 85000], outBytesRange: [450, 12000], inPktsRange: [5, 60], outPktsRange: [4, 40] },
  { class: "Benign DNS Query", proto: "UDP", dport: 53, xgb: 0.02, ocsvm: 0.05, inBytesRange: [68, 512], outBytesRange: [48, 128], inPktsRange: [1, 2], outPktsRange: [1, 2] },
  { class: "Normal NTP Sync", proto: "UDP", dport: 123, xgb: 0.01, ocsvm: 0.03, inBytesRange: [96, 96], outBytesRange: [96, 96], inPktsRange: [1, 1], outPktsRange: [1, 1] },
  { class: "SYN Flood Anomaly", proto: "TCP", dport: 80, xgb: 0.94, ocsvm: 0.89, inBytesRange: [40, 120], outBytesRange: [0, 40], inPktsRange: [240, 1800], outPktsRange: [0, 10] },
  { class: "SSH Brute Force", proto: "TCP", dport: 22, xgb: 0.88, ocsvm: 0.76, inBytesRange: [2400, 9600], outBytesRange: [1800, 7200], inPktsRange: [45, 120], outPktsRange: [38, 95] },
  { class: "Stealth Port Scan", proto: "TCP", dport: 8080, xgb: 0.58, ocsvm: 0.65, inBytesRange: [0, 40], outBytesRange: [40, 40], inPktsRange: [0, 1], outPktsRange: [1, 1] },
  { class: "DNS Tunneling Exfil", proto: "UDP", dport: 53, xgb: 0.72, ocsvm: 0.81, inBytesRange: [4800, 32000], outBytesRange: [1200, 4500], inPktsRange: [30, 180], outPktsRange: [25, 140] },
  { class: "C2 Beaconing Pattern", proto: "TCP", dport: 4443, xgb: 0.69, ocsvm: 0.71, inBytesRange: [180, 240], outBytesRange: [120, 160], inPktsRange: [3, 4], outPktsRange: [3, 4] },
  { class: "ICMP Sweep Detection", proto: "ICMP", dport: 0, xgb: 0.45, ocsvm: 0.52, inBytesRange: [64, 128], outBytesRange: [64, 128], inPktsRange: [2, 4], outPktsRange: [2, 4] },
  { class: "High Volume UDP Flood", proto: "UDP", dport: 5060, xgb: 0.96, ocsvm: 0.92, inBytesRange: [450000, 2400000], outBytesRange: [0, 200], inPktsRange: [3200, 14500], outPktsRange: [0, 5] },
  { class: "Benign Internal API", proto: "TCP", dport: 8000, xgb: 0.08, ocsvm: 0.12, inBytesRange: [800, 4200], outBytesRange: [1400, 8900], inPktsRange: [8, 22], outPktsRange: [10, 28] },
  { class: "Suspicious TLS Handshake", proto: "TCP", dport: 8443, xgb: 0.52, ocsvm: 0.48, inBytesRange: [1500, 3200], outBytesRange: [800, 1600], inPktsRange: [12, 18], outPktsRange: [10, 15] }
];

const MONITORED_HOST = "172.17.51.28"; // matches MY_IP in backend/network_capture.py

const SAMPLE_EXTERNAL_IPS = [
  "185.220.101.5",
  "45.33.32.156",
  "198.51.100.42",
  "104.244.42.1",
  "8.8.8.8",
  "1.1.1.1",
  "192.168.1.105",
  "10.0.0.14",
  "194.26.29.112",
  "91.108.4.1",
  "203.0.113.19",
  "162.158.85.22"
];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Generate single flow detection item
export function createDetectionRecord(index, timestampOffsetSec = 0) {
  const profile = getRandomItem(ATTACK_PROFILES);
  const isOutbound = Math.random() > 0.6;
  const externalIp = getRandomItem(SAMPLE_EXTERNAL_IPS);
  
  const srcIp = isOutbound ? MONITORED_HOST : externalIp;
  const dstIp = isOutbound ? externalIp : MONITORED_HOST;
  const srcPort = getRandomInt(49152, 65535);
  const dstPort = profile.dport === 0 ? 0 : profile.dport;
  
  // Add minor variance to base model scores
  const xgbVariance = (Math.random() - 0.5) * 0.06;
  const ocsvmVariance = (Math.random() - 0.5) * 0.08;
  const xgbProbability = Math.max(0.01, Math.min(0.99, profile.xgb + xgbVariance));
  const ocsvmAnomaly = Math.max(0.01, Math.min(0.99, profile.ocsvm + ocsvmVariance));
  
  // Apply EXACT backend hybrid logic
  const hybridScore = calculateHybridScore(xgbProbability, ocsvmAnomaly);
  const riskLevel = getRiskLevel(hybridScore);
  
  const inBytes = getRandomInt(profile.inBytesRange[0], profile.inBytesRange[1]);
  const outBytes = getRandomInt(profile.outBytesRange[0], profile.outBytesRange[1]);
  const inPkts = getRandomInt(profile.inPktsRange[0], profile.inPktsRange[1]);
  const outPkts = getRandomInt(profile.outPktsRange[0], profile.outPktsRange[1]);
  
  const time = new Date(Date.now() - timestampOffsetSec * 1000);
  const timestamp = time.toISOString().replace("T", " ").substring(0, 19);

  return {
    id: `flow-${index}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp,
    timestampRaw: time.getTime(),
    src_ip: srcIp,
    src_port: srcPort,
    dst_ip: dstIp,
    dst_port: dstPort,
    protocol: profile.proto,
    IN_BYTES: inBytes,
    OUT_BYTES: outBytes,
    IN_PKTS: inPkts,
    OUT_PKTS: outPkts,
    xgb_probability: Number(xgbProbability.toFixed(4)),
    ocsvm_anomaly: Number(ocsvmAnomaly.toFixed(4)),
    hybrid_score: Number(hybridScore.toFixed(4)),
    risk_level: riskLevel, // LOW, MEDIUM, HIGH, CRITICAL
    attack_class: profile.class,
    is_anomaly: ocsvmAnomaly >= 0.5,
    is_attack: xgbProbability >= 0.5
  };
}

// Initial realistic dataset of 60 historical flows
export const INITIAL_FLOW_HISTORY = Array.from({ length: 60 }, (_, idx) => {
  return createDetectionRecord(idx + 1, (idx * 45) + getRandomInt(5, 20));
});

// Calculate aggregate stats dynamically from flow dataset
export function calculateDashboardStats(flows = INITIAL_FLOW_HISTORY) {
  let low = 0;
  let medium = 0;
  let high = 0;
  let critical = 0;

  flows.forEach((flow) => {
    switch (flow.risk_level) {
      case "LOW":
        low++;
        break;
      case "MEDIUM":
        medium++;
        break;
      case "HIGH":
        high++;
        break;
      case "CRITICAL":
        critical++;
        break;
      default:
        low++;
    }
  });

  const totalFlows = flows.length;
  const recentSlice = flows.slice(0, 20);
  const avgHybrid = recentSlice.reduce((sum, f) => sum + f.hybrid_score, 0) / (recentSlice.length || 1);
  const activeAnomalies = flows.filter(f => f.is_anomaly).length;
  const anomalyPercentage = totalFlows > 0 ? ((activeAnomalies / totalFlows) * 100).toFixed(1) : "0.0";

  return {
    totalFlows,
    lowRisk: low,
    mediumRisk: medium,
    highRisk: high,
    criticalRisk: critical,
    currentHybridScore: Number(avgHybrid.toFixed(4)),
    currentRiskLevel: getRiskLevel(avgHybrid),
    activeAnomalyPercentage: anomalyPercentage,
    monitoredHost: MONITORED_HOST,
    activeThreatsCount: high + critical,
    statusText: "Network monitoring active"
  };
}
