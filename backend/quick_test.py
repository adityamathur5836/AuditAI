import pandas as pd
import pickle

# Load trained model
with open("trained_model.pkl", "rb") as f:
    model_data = pickle.load(f)

dept_stats = model_data["dept_stats"]
iso_model = model_data["iso_model"]

# Load same CSV (or new CSV later)
df = pd.read_csv("transactions_fraud.csv")
df["timestamp"] = pd.to_datetime(df["timestamp"])

# Merge baseline stats
df = df.merge(dept_stats, on="department_id", how="left")

# Z-score
df["z_score"] = (df["amount"] - df["mean"]) / df["std"]

# IQR anomaly
df["iqr_anomaly"] = df["amount"] > (df["q3"] + 1.5 * df["iqr"])

# ML anomaly
df["ml_flag"] = iso_model.predict(df[["amount"]])

# Risk score + reason
def compute_risk(row):
    score = 0
    reasons = []

    if abs(row["z_score"]) > 3:
        score += 25
        reasons.append("Extreme deviation from department average")

    if row["iqr_anomaly"]:
        score += 25
        reasons.append("Outside normal IQR range")

    if row["ml_flag"] == -1:
        score += 25
        reasons.append("Rare statistical pattern detected")

    return score, reasons

df[["risk_score", "reasons"]] = df.apply(
    lambda r: pd.Series(compute_risk(r)), axis=1
)

# Sort by highest risk
top_anomalies = df.sort_values("risk_score", ascending=False).head(5)

# Print results
print("\n🔴 TOP 5 DETECTED ANOMALIES 🔴\n")

for _, row in top_anomalies.iterrows():
    print(f"Transaction ID : {row['transaction_id']}")
    print(f"Department     : {row['department_id']}")
    print(f"Project        : {row['project_id']}")
    print(f"Amount         : ₹{row['amount']}")
    print(f"Risk Score     : {row['risk_score']}")
    print("Reasons:")
    for r in row["reasons"]:
        print(" -", r)
    print("-" * 50)