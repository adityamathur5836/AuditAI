import csv
from datetime import datetime

def verify_data(filename):
    clean = True
    rows = 0
    with open(filename, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows += 1
            amt = float(row['amount'])
            ts = datetime.fromisoformat(row['timestamp'])
            
            if amt > 5000:
                print(f"Error: Amount {amt} at {row['transaction_id']} exceeds 5000")
                clean = False
            if not (9 <= ts.hour <= 17):
                print(f"Error: Time {ts.hour} at {row['transaction_id']} outside business hours")
                clean = False
                
    if clean:
        print(f"Verification Successful: {rows} rows verified.")
        print("- All amounts <= $5,000.00")
        print("- All timestamps within business hours (09:00 - 18:00)")
    else:
        print("Verification Failed: Anomalies found in the data.")

if __name__ == "__main__":
    verify_data("transactions_normal.csv")
