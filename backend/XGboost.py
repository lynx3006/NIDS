import pandas as pd
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier
from sklearn.metrics import classification_report, confusion_matrix
import joblib
file_path="data/sample/sample_NF-CSE-CIC-IDS2018-v2.csv"
df=pd.read_csv(file_path)
features=["IN_BYTES","OUT_BYTES","IN_PKTS","OUT_PKTS"]
X=df[features]
y=df["Label"]
X_train, X_test, y_train, y_test = train_test_split(X,y,test_size=0.2,random_state=42,stratify=y)
model=XGBClassifier(n_estimators=100,max_depth=6,learning_rate=0.1,random_state=42)
model.fit(X_train,y_train)
y_pred=model.predict(X_test)
joblib.dump(model,"XGboost_model.pkl")