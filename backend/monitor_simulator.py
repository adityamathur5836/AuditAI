import csv
import time
import random
import os
import subprocess
import json
from datetime import datetime

STATUS_FILE = '../frontend/public/status.json'

def write_status(stage, detail, progress):
    status = {
        "stage": stage,
        "detail": detail,
        "progress": progress,
        "timestamp": datetime.now().isoformat()
    }
    try:
        with open(STATUS_FILE, 'w') as f:
            json.dump(status, f)
    except Exception as e:
        print(f"Error writing status: {e}")

def push_transaction():
    tx_file = 'data/transactions.csv'
    dept = random.choice(["DEPT-NHAI", "DEPT-CPWD", "DEPT-RAIL", "DEPT-EDU-DELHI", "DEPT-HEALTH-AIIMS"])
    vendor = random.choice(["VEN-INFRA-01", "VEN-TECH-02", "VEN-MED-X", "VEN-019", "VEN-088"])
    
    write_status("Data Ingestion", f"Ingesting new event for {vendor}...", 25)
    
    print("\n" + "="*50)
    print("STAGE 1: DATA INGESTION (NEW EVENT)")
    print("="*50)
    
    is_anomaly = random.random() > 0.7  # 30% chance of anomaly
    if is_anomaly:
        # Scale to INR: ~4.5 Crore to 45 Crore
        amount = round(random.uniform(45000000, 450000000), 2) 
        print(f"⚠️  INJECTING ANOMALY: High-value transaction detected!")
    else:
        # Scale to INR: ~4.5 Lakh to 1.8 Crore
        amount = round(random.uniform(450000, 18000000), 2)
        
    tx_id = f"RT-{int(time.time())}"
    timestamp = datetime.now().isoformat()
    
    
    # Scale to match new generator (wider project range)
    # Simulator acts as "new incoming data", so it can pick from existing active projects
    project_id = f"PROJ-{random.randint(1, 100):03d}"
    
    schemes = ["PMGSY", "Digital India", "Ayushman Bharat", "Smart City Mission", "Swachh Bharat"]
    selected_scheme = random.choice(schemes)
    
    new_row = [
        tx_id,
        timestamp,
        dept,
        vendor,
        "Public Procurement",
        amount,
        random.choice(["NEFT", "RTGS", "UPI"]),
        f"Live payment for {selected_scheme} - ID: {tx_id}",
        "OFFICER-01",
        f"BUD-{random.randint(1000, 9999)}",
        project_id
    ]
    
    with open(tx_file, 'a', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(new_row)
    
    print(f"✅ [{timestamp}] Ingested {tx_id}: ₹{amount} (Dept: {dept}, Vendor: {vendor})")
    time.sleep(1) # Slow down for visualization
    
    write_status("Data Processing", "Normalizing fields and resolving entities...", 50)
    print("\nSTAGE 2: DATA PROCESSING (NORMALIZATION & CLEANING)")
    print("-" * 50)
    proc_res = subprocess.run(["python3", "processor.py"], capture_output=True, text=True)
    if proc_res.returncode == 0:
        print("✅ Data standardized. Levenshtein fuzzy matching and canonical mapping applied.")
    else:
        print(f"❌ Processor error: {proc_res.stderr}")
    time.sleep(1)

    write_status("Risk Engine", "Applying heuristic signals and composite scoring...", 75)
    print("\nSTAGE 3: RISK ENGINE (EVALUATION & PRE-PAYMENT GUARD)")
    print("-" * 50)
    eng_res = subprocess.run(["python3", "engine.py"], capture_output=True, text=True)
    if eng_res.returncode == 0:
        print("✅ Risk scoring complete. Statistical outliers and rule violations flagged.")
        print("✅ Pre-payment Guard: Transaction held for mandatory review if score > 0.7")
    else:
        print(f"❌ Engine error: {eng_res.stderr}")
    time.sleep(1)

    write_status("Frontend Sync", "Syncing ledger and updating dashboard anomalies...", 100)
    print("\nSTAGE 4: FRONTEND SYNC (DASHBOARD UPDATE)")
    print("-" * 50)
    print("✅ alerts.json updated. Frontend React app will now Hot-Reload with new data.")
    print("="*50)
    time.sleep(1)
    
    write_status("Idle", "Monitoring for next procurement cycle...", 0)

if __name__ == "__main__":
    print("\nStarting AuditAI Architecture Simulator...")
    print("This simulator demonstrates the full end-to-end flow of a transaction.")
    print("Check your terminal logs to see each stage of the pipeline.")
    print("-" * 50)
    try:
        while True:
            push_transaction()
            print("\nWaiting for next block (10 seconds)...")
            time.sleep(6) # Adjusted timing
    except KeyboardInterrupt:
        print("\nSimulator stopped.")
