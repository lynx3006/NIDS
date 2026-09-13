# Network Intrusion Detection System (NIDS)

An anomaly-based Network Intrusion Detection System that monitors network traffic, extracts bidirectional flows, analyzes them using supervised and unsupervised machine learning, assigns a risk level, and displays detection history through a web dashboard.

## Architecture

```text
TShark
   ↓
Flow Extraction & Aggregation
   ↓
XGBoost + One-Class SVM (RBF)
   ↓
Hybrid Risk Score
   ↓
FastAPI REST API
   ↓
SQLite
   ↓
React Dashboard
```

## Features

* Live network packet capture using TShark
* Bidirectional network flow aggregation
* 5-second flow inactivity timeout
* Four network traffic features:

  * `IN_BYTES`
  * `OUT_BYTES`
  * `IN_PKTS`
  * `OUT_PKTS`
* Supervised anomaly detection using XGBoost
* Unsupervised anomaly detection using One-Class SVM
* RBF kernel for One-Class SVM
* Hybrid risk scoring
* Risk classification:

  * LOW
  * MEDIUM
  * HIGH
  * CRITICAL
* Detection history stored in SQLite
* REST API built with FastAPI
* React-based monitoring dashboard
* Traffic and protocol statistics
* Detection history and flow-level information
* Automatic dashboard refresh through periodic API polling

## Machine Learning

The system uses two complementary machine learning models.

### XGBoost

XGBoost is the supervised detection model.

It was trained using four flow-level network traffic features:

```text
IN_BYTES
OUT_BYTES
IN_PKTS
OUT_PKTS
```

The model produces a probability between `0` and `1` representing the likelihood of anomalous traffic.

#### Evaluation

```text
Accuracy  : 99%
Precision : 99%
Recall    : 95%
F1-score  : 97%
```

Confusion matrix:

```text
[[33242,    30],
 [  226,  4290]]
```

### One-Class SVM

One-Class SVM is used as the unsupervised component of the detection pipeline.

The model is trained using benign traffic to learn the characteristics of normal network behavior.

The input features are transformed using:

```text
log1p → StandardScaler → One-Class SVM
```

The model uses an **RBF (Radial Basis Function) kernel** with:

```text
kernel = RBF
gamma  = scale
nu     = 0.375
```

The raw One-Class SVM decision score is calibrated into an anomaly score between `0` and `1`.

#### Evaluation

```text
Detection Rate : ≈ 94%
False Positive Rate (FPR) : ≈ 37–38%
```

The relatively high false-positive rate means that the OCSVM is not used as the sole decision-maker. Instead, its anomaly score provides an additional unsupervised signal that is combined with the XGBoost probability.

## Hybrid Risk Scoring

The outputs from both models are combined into a hybrid risk score.

The system gives additional weight to situations where both models strongly indicate anomalous behavior.

The resulting score is converted into a human-readable risk level:

```text
Score < 0.3         → LOW
0.3 ≤ Score < 0.6  → MEDIUM
0.6 ≤ Score < 0.8  → HIGH
Score ≥ 0.8         → CRITICAL
```

Using both models allows the system to combine:

```text
XGBoost
Supervised detection
       +
OCSVM
Unsupervised anomaly detection
       ↓
Hybrid Risk Score
```

## Dataset

The models were developed using the:

**NF-CSE-CIC-IDS2018-v2 dataset**

The original dataset contains benign and anomalous network traffic.

The project uses a selected subset of four flow-level features rather than the complete feature set:

```text
IN_BYTES
OUT_BYTES
IN_PKTS
OUT_PKTS
```

## Backend

The backend is built using **FastAPI** and **SQLite**.

FastAPI provides a REST API between the network detection pipeline, database, and React frontend.

### REST API

The main resource exposed by the API is:

```text
/detections
```

The current endpoints are:

```text
GET  /detections
POST /detections
```

### GET `/detections`

Retrieves stored detection results from SQLite.

The React dashboard uses this endpoint to display detection history, statistics, traffic information, and risk information.

### POST `/detections`

Creates a new detection record.

After a network flow has been processed by the ML pipeline, `network_capture.py` sends the detection to this endpoint.

The FastAPI backend then stores the result in SQLite.

```text
Network Capture
      ↓
ML Detection
      ↓
POST /detections
      ↓
FastAPI
      ↓
SQLite
```

The frontend retrieves the stored results using:

```text
GET /detections
```

```text
SQLite
   ↓
FastAPI
   ↓
GET /detections
   ↓
React Dashboard
```

## Database

SQLite is used to store detection history.

The `detections` table stores:

* Detection ID
* Timestamp
* Source IP
* Destination IP
* Source port
* Destination port
* Protocol
* Incoming bytes
* Outgoing bytes
* Incoming packets
* Outgoing packets
* XGBoost probability
* OCSVM anomaly score
* Hybrid risk score
* Risk level

The SQLite database is created locally and is excluded from version control.

## Flow Processing

TShark captures packets from the selected network interface.

Packets belonging to the same bidirectional flow are aggregated together.

For each flow, the system tracks:

```text
IN_BYTES
OUT_BYTES
IN_PKTS
OUT_PKTS
```

A flow is considered complete after approximately **5 seconds of inactivity**.

This prevents the system from creating one database record for every individual packet.

Instead:

```text
Packets
   ↓
Flow aggregation
   ↓
5 seconds without traffic
   ↓
ML analysis
   ↓
One detection record
```

## Frontend

The frontend is built using **React + Vite**.

The dashboard provides:

* Current risk information
* Total flow statistics
* Risk-level statistics
* Traffic overview
* Protocol distribution
* Incoming/outgoing byte statistics
* Incoming/outgoing packet statistics
* Recent detections
* Detection history
* Flow-level details
* Model analysis

The frontend communicates with the FastAPI backend using HTTP requests.

## Project Structure

```text
NIDS/
│
├── backend/
│   ├── api.py
│   ├── database.py
│   ├── detector.py
│   ├── network_capture.py
│   ├── XGboost.py
│   ├── ocsvm.py
│   ├── XGboost_model.pkl
│   ├── ocsvm_model.pkl
│   └── ocsvm_scaler.pkl
│
├── data/
│   └── sample/
│       └── sample_NF-CSE-CIC-IDS2018-v2.csv
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── requirements.txt
├── .gitignore
└── README.md
```

## Requirements

* Python 3.x
* Node.js
* Wireshark / TShark
* FastAPI
* Uvicorn
* Pandas
* NumPy
* Scikit-learn
* XGBoost
* Requests
* React
* Vite

## Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd NIDS
```

### 2. Create a Python virtual environment

```bash
python -m venv .venv
```

Activate it on Windows:

```bash
.venv\Scripts\activate
```

### 3. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 4. Install frontend dependencies

```bash
cd frontend
npm install
cd ..
```

## Running the System

The current system uses three processes.

### Terminal 1 — FastAPI

From the project root:

```bash
uvicorn backend.api:app --reload
```

The API runs at:

```text
http://localhost:8000
```

Interactive API documentation:

```text
http://localhost:8000/docs
```

### Terminal 2 — Network Capture

```bash
python backend/network_capture.py
```

TShark captures live network traffic and the application aggregates packets into flows.

Completed flows are analyzed by the ML models and sent to the FastAPI backend.

### Terminal 3 — React Dashboard

```bash
cd frontend
npm run dev
```

The dashboard is normally available at:

```text
http://localhost:5173
```

## Current Scope

The project intentionally uses a simple architecture:

```text
TShark + Python
       ↓
XGBoost + OCSVM
       ↓
FastAPI
       ↓
SQLite
       ↓
React
```

The project does not currently use:

* Redis
* Kafka
* Vector databases
* RAG
* Microservices
* Distributed processing
* Multi-class attack classification

The focus is on evaluating machine learning models for network anomaly detection while building a complete working pipeline from live traffic capture to visualization.

## Future Improvements

Possible future improvements include:

* Start/stop live capture directly from the dashboard
* Additional network flow features
* Improved flow lifecycle management
* Further model tuning and evaluation
* Evaluation on additional network environments
* Authentication and access control
* Deployment to a remote server

## Project Goal

The goal of this project is to develop and evaluate an anomaly-based Network Intrusion Detection System while demonstrating how a machine learning model can be integrated into a complete software system.

The project combines:

**Computer Networks + Machine Learning + Backend Development + Database + Frontend Development**
