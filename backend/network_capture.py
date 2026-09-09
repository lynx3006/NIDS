import subprocess
import pandas as pd
from detector import analyze_flow
MY_IP = "172.17.51.28"
command = [
    "tshark",
    "-i", "4",
    "-f", f"host {MY_IP}",
    "-T", "fields",
    "-e", "ip.src",
    "-e", "ip.dst",
    "-e", "tcp.srcport",
    "-e", "tcp.dstport",
    "-e", "udp.srcport",
    "-e", "udp.dstport",
    "-e", "ip.proto",
    "-e", "frame.len",
    "-c", "20"
]
process = subprocess.Popen(
    command,
    stdout=subprocess.PIPE,
    text=True
)
flows= {}
for line in process.stdout:
    fields = line.strip().split("\t")
    if len(fields) < 8:
        continue
    src = fields[0]
    dst = fields[1]
    src_port = fields[2] or fields[4]
    dst_port = fields[3] or fields[5]
    protocol = fields[6]
    if src==MY_IP:
        flow_key = (MY_IP, dst, src_port, dst_port, protocol)
    else:
        flow_key = (MY_IP,src,dst_port,src_port,protocol)
    if flow_key not in flows:
        flows[flow_key] = {"IN_BYTES": 0,"OUT_BYTES": 0,"IN_PKTS": 0,"OUT_PKTS": 0}
    length = int(fields[7])
    if src == MY_IP:
        flows[flow_key]["OUT_BYTES"] += length
        flows[flow_key]["OUT_PKTS"] += 1
    else:
        flows[flow_key]["IN_BYTES"] += length
        flows[flow_key]["IN_PKTS"] += 1
for flow_key, flow in flows.items():
        result=analyze_flow(pd.DataFrame([flow]))
        print(flow_key)
        print(flow)
        print(result)