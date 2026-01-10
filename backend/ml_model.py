import pandas as pd
import numpy as np
import pickle
from sklearn.ensemble import IsolationForest

print("Loading data...")

# 1️⃣ Load CSV
df = pd.read_csv("transactions_normal.csv")
df["timestamp"] = pd.to_datetime(df["timestamp"])

print("Data loaded:", df.shape)

# 2️⃣ Data Cleaning
df["amount"] = df["amount"].fillna(df["amount"].median())

# 3️⃣ Baseline Statistics (Department level)
print("Calculating baselines...")

dept_stats = df.groupby("department_id")["amount"].agg(
    mean="mean",
    std="std",
    q1=lambda x: x.quantile(0.25),
    q3=lambda x: x.quantile(0.75)
)

dept_stats["iqr"] = dept_stats["q3"] - dept_stats["q1"]

# 4️⃣ Train Isolation Forest (ML part)
print("Training Isolation Forest...")

iso_model = IsolationForest(
    contamination=0.05,
    random_state=42
)

iso_model.fit(df[["amount"]])

# 5️⃣ Save trained objects
print("Saving trained model...")

with open("trained_model.pkl", "wb") as f:
    pickle.dump(
        {
            "dept_stats": dept_stats,
            "iso_model": iso_model
        },
        f
    )

print("Training completed successfully!")