from fastapi import FastAPI
from backend.database import get_detections
from backend.database import insert_detection
from pydantic import BaseModel
app = FastAPI()
class Detection(BaseModel):
    id:int
    timestamp:str
    src_ip:str
    dst_ip:str
    src_port:int
    dst_port:int
    protocol:str
    xgb_probability:float
    ocsvm_score:float
    hybrid_score:float
    risk_level:str
class DetectionCreate(BaseModel):
    timestamp: str
    src_ip: str
    dst_ip: str
    src_port: int
    dst_port: int
    protocol: str
    xgb_probability: float
    ocsvm_score: float
    hybrid_score: float
    risk_level: str
@app.get("/detections", response_model=list[Detection])
def detections():
    return get_detections()
@app.post("/detections")
def create_detection(detection: DetectionCreate):
    insert_detection(
        detection.timestamp,
        detection.src_ip,
        detection.dst_ip,
        detection.src_port,
        detection.dst_port,
        detection.protocol,
        detection.xgb_probability,
        detection.ocsvm_score,
        detection.hybrid_score,
        detection.risk_level
    )
    return {"message": "Detection saved"}