import joblib
import pandas as pd
import numpy as np
ocsvm_model=joblib.load("ocsvm_model.pkl")
ocsvm_scaler=joblib.load("ocsvm_scaler.pkl")
XGboost_model=joblib.load("XGboost_model.pkl")
def detect(flow):
    xgb_probability=XGboost_model.predict_proba(flow)[0][1]
    flow_log=flow.copy()
    for col in flow:
        flow_log[col]=np.log1p(flow_log[col])
    flow_scaled=ocsvm_scaler.transform(flow_log)
    ocsvm_score=ocsvm_model.decision_function(flow_scaled)[0]
    ocsvm_anomaly=(1-np.tanh((ocsvm_score+50)/75))/2
    return xgb_probability,ocsvm_anomaly
def hybrid_score(xgb_probability,ocsvm_anomaly):
    if xgb_probability>=0.5 and ocsvm_anomaly>=0.5:
        score=min(xgb_probability,ocsvm_anomaly)
        score=min(1.0,score+0.2)
    else:
        score=min(xgb_probability,ocsvm_anomaly)
    return score
def risk_level(score):
    if score<0.3:
        return "LOW"
    elif score<0.6:
        return "MEDIUM"
    elif score<0.8:
        return "HIGH"
    else:
        return "CRITICAL"
def analyze_flow(flow):

    xgb_probability,ocsvm_anomaly=detect(flow)

    score=hybrid_score(xgb_probability,ocsvm_anomaly)

    risk=risk_level(score)
    return {
        "xgb_probability": xgb_probability,
        "ocsvm_anomaly": ocsvm_anomaly,
        "hybrid_score": score,
        "risk_level": risk
    }
def process_flow(flow_info, flow):
    result = analyze_flow(flow)

    return {
        "timestamp": flow_info["timestamp"],
        "src_ip": flow_info["src_ip"],
        "dst_ip": flow_info["dst_ip"],
        "src_port": flow_info["src_port"],
        "dst_port": flow_info["dst_port"],
        "protocol": flow_info["protocol"],
        "IN_BYTES": int(flow["IN_BYTES"].iloc[0]),
        "OUT_BYTES": int(flow["OUT_BYTES"].iloc[0]),
        "IN_PKTS": int(flow["IN_PKTS"].iloc[0]),
        "OUT_PKTS": int(flow["OUT_PKTS"].iloc[0]),
        "xgb_probability": float(result["xgb_probability"]),
        "ocsvm_anomaly": float(result["ocsvm_anomaly"]),
        "hybrid_score": float(result["hybrid_score"]),
        "risk_level": result["risk_level"]
    }