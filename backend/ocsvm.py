import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.svm import OneClassSVM
import matplotlib.pyplot as plt
from sklearn.metrics import confusion_matrix,ConfusionMatrixDisplay
from sklearn.metrics import roc_curve, auc
import joblib
scaler=StandardScaler()
np.random.seed(42)
file_path = "data/sample/sample_NF-CSE-CIC-IDS2018-v2.csv"
df = pd.read_csv(file_path)
device_data = df[(df["Label"] == 0)]
features=["IN_BYTES","OUT_BYTES","IN_PKTS","OUT_PKTS"]
X=device_data[features].copy()
for col in features:
    X[col] = np.log1p(X[col])
X_scaled=scaler.fit_transform(X)
train_indices = np.random.choice(X_scaled.shape[0],size=40000,replace=False)
X_train = X_scaled[train_indices]
X_test_benign = X_scaled[~np.isin(np.arange(len(X_scaled)), train_indices)]
model=OneClassSVM(kernel="rbf",gamma="scale",nu=0.375)
model.fit(X_train)
# joblib.dump(model,"ocsvm_model.pkl")
# joblib.dump(scaler,"ocsvm_scaler.pkl")
pred_benign = model.predict(X_test_benign)
# print("Benign predicted normal:", np.sum(pred_benign == 1))
# print("Benign predicted anomaly:", np.sum(pred_benign == -1))
scores = model.decision_function(X_test_benign)
# print("Min:", scores.min())
# print("Max:", scores.max())
# print("Mean:", scores.mean())
attack_data = df[df["Label"] == 1].copy()
X_attack = attack_data[features].copy()
for col in features:
    X_attack[col] = np.log1p(X_attack[col])
X_attack_scaled = scaler.transform(X_attack)
attack_predictions = model.predict(X_attack_scaled)
# print("Attack predicted normal:",np.sum(attack_predictions==1))
# print("Attack predicted anomaly:",np.sum(attack_predictions==-1))
# detection_rate = np.sum(attack_predictions==-1) / len(attack_data)
# print("Attack detection rate:", detection_rate*100,"%")
attack_scores = model.decision_function(X_attack_scaled)
# print("Attack score min:", attack_scores.min())
# print("Attack score max:", attack_scores.max())
# print("Attack score mean:", attack_scores.mean())
k = 75
c = -50
benign_anomaly = (1 - np.tanh((scores - c) / k)) / 2
attack_anomaly = (1 - np.tanh((attack_scores - c) / k)) / 2