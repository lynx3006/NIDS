import sqlite3
DATABASE="nids.db"
def init_db():
    conn=sqlite3.connect(DATABASE)
    cursor=conn.cursor()
    cursor.execute("""CREATE TABLE IF NOT EXISTS detections(id INTEGER PRIMARY KEY,timestamp TEXT NOT NULL,src_ip TEXT,dst_ip TEXT,src_port INTEGER,dst_port INTEGER,protocol TEXT,IN_BYTES INTEGER,OUT_BYTES INTEGER,IN_PKTS INTEGER,OUT_PKTS INTEGER,xgb_probability REAL,ocsvm_anomaly REAL,hybrid_score REAL,risk_level TEXT)""")
    conn.commit()
    conn.close()
def insert_detection(timestamp,src_ip,dst_ip,src_port,dst_port,protocol,IN_BYTES,OUT_BYTES,IN_PKTS,OUT_PKTS,xgb_probability,ocsvm_anomaly,hybrid_score,risk_level):
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO detections (
        timestamp,
        src_ip,
        dst_ip,
        src_port,
        dst_port,
        protocol,
        IN_BYTES,
        OUT_BYTES,
        IN_PKTS,
        OUT_PKTS,
        xgb_probability,
        ocsvm_anomaly,
        hybrid_score,
        risk_level
    )
    VALUES (?, ?, ?, ?, ?,?,?,?,?, ?, ?, ?, ?, ?)
    """, (
        timestamp,
        src_ip,
        dst_ip,
        src_port,
        dst_port,
        protocol,
        IN_BYTES,
        OUT_BYTES,
        IN_PKTS,
        OUT_PKTS,
        xgb_probability,
        ocsvm_anomaly,
        hybrid_score,
        risk_level
    ))
    conn.commit()
    conn.close()
def get_detections():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM detections")
    rows = cursor.fetchall()
    conn.close()
    detections = []
    for row in rows:
        detections.append({
            "id": row[0],
            "timestamp": row[1],
            "src_ip": row[2],
            "dst_ip": row[3],
            "src_port": row[4],
            "dst_port": row[5],
            "protocol": row[6],
            "IN_BYTES": row[7],
            "OUT_BYTES": row[8],
            "IN_PKTS": row[9],
            "OUT_PKTS": row[10],
            "xgb_probability": row[11],
            "ocsvm_anomaly": row[12],
            "hybrid_score": row[13],
            "risk_level": row[14]
        })
    return detections
if __name__ == "__main__":
    init_db()