import csv
import random
import uuid
from datetime import datetime, timedelta

def generate_fraud_dataset(n=6000):
    departments = ["DEPT-NHAI", "DEPT-CPWD", "DEPT-RAIL", "DEPT-EDU-DELHI", "DEPT-HEALTH-AIIMS"]
    categories = ["Civil Works", "IT Hardware", "Medical Supplies", "Consultancy", "Manpower"]
    
    # 100 Vendors
    vendors = [f"VEN-{i:03d}" for i in range(100)]
    
    # 10 Officers
    approvers = [f"OFFICER-{i:02d}" for i in range(10)]
    
    start_date = datetime(2025, 1, 1)
    
    # Define Fraud Scenarios
    
    # SCENARIO 1: PROCUREMENT COLLUSION (Kickbacks)
    # Officer 05 always awards high-value contracts to Vendor 099
    # Characteristics: High amounts, same Approver-Vendor pair, "Consultancy" or "Civil Works"
    corrupt_officer = "OFFICER-05"
    corrupt_vendor = "VEN-099"
    
    # SCENARIO 2: WELFARE LEAKAGE (Middleman)
    # Vendor 033 receiving hundreds of small payouts meant for beneficiaries
    # Characteristics: High frequency, low amounts (₹2k-5k), Scheme-related
    middleman_vendor = "VEN-033"
    
    # SCENARIO 3: SPENDING FRAUD (Ghost Project)
    # A project that consumes budget rapidly with vague descriptions
    ghost_project = "PROJ-666"
    
    # SCENARIO 4: CONTRACT SPLITTING (already defined but explicit here)
    # Project 404
    split_project = "PROJ-404"

    # Base Projects
    projects = [f"PROJ-{i:03d}" for i in range(1, 51)]
    projects.remove("PROJ-033") if "PROJ-033" in projects else None # reserve
    
    with open("transactions_fraud.csv", "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["transaction_id", "timestamp", "department_id", "vendor_id", "vendor_category", "amount", "payment_method", "description", "approver_id", "budget_code", "project_id"])
        
        tx_count = 0
        
        # --- PHASE 1: Generate Base "Normal" Traffic (70% of data) ---
        num_normal = int(n * 0.7)
        for i in range(num_normal):
            tx_id = f"TX-{tx_count:05d}"
            tx_count += 1
            
            ts = start_date + timedelta(minutes=random.randint(0, 525600))
            dept = random.choice(departments)
            vendor = random.choice(vendors)
            cat = random.choice(categories)
            # Normal: 2k to 2L
            amount = round(random.uniform(2000, 200000), 2)
            
            writer.writerow([
                tx_id, ts.isoformat(), dept, vendor, cat, amount,
                random.choice(["NEFT", "RTGS", "UPI"]),
                f"Standard procurement for {dept}",
                random.choice(approvers),
                f"BUD-{random.randint(1000, 9999)}",
                random.choice(projects)
            ])
            
        # --- PHASE 2: Inject SCENARIO 1 (Procurement Collusion) ---
        # 50 High value transactions
        for i in range(50):
            tx_id = f"FRAUD-COL-{i:03d}"
            ts = start_date + timedelta(days=random.randint(0, 364))
            amount = round(random.uniform(2500000, 8000000), 2) # 25L to 80L
            
            writer.writerow([
                tx_id, ts.isoformat(), "DEPT-CPWD", corrupt_vendor, "Civil Works", amount,
                "RTGS", "Infrastructure development - Phase IV (Priority)",
                corrupt_officer, "BUD-9999", "PROJ-099"
            ])
            
        # --- PHASE 3: Inject SCENARIO 2 (Welfare Leakage) ---
        # 300 Small transactions to same vendor in short time
        leakage_start = start_date + timedelta(days=100)
        for i in range(300):
            tx_id = f"FRAUD-LEAK-{i:03d}"
            # All within 5 days
            ts = leakage_start + timedelta(minutes=random.randint(0, 7200)) # 5 days
            amount = round(random.uniform(2000, 5000), 2)
            
            writer.writerow([
                tx_id, ts.isoformat(), "DEPT-HEALTH-AIIMS", middleman_vendor, "Medical Supplies", amount,
                "UPI", "Direct Benefit Transfer - Janani Suraksha",
                "OFFICER-01", "BUD-5000", "PROJ-033"
            ])
            
        # --- PHASE 4: Inject SCENARIO 3 (Ghost Project Spending) ---
        # Rapid budget drain
        ghost_start = start_date + timedelta(days=200)
        for i in range(20):
            tx_id = f"FRAUD-GHOST-{i:03d}"
            ts = ghost_start + timedelta(days=random.randint(0, 10))
            amount = round(random.uniform(500000, 1500000), 2) # 5L - 15L
            
            writer.writerow([
                tx_id, ts.isoformat(), "DEPT-EDU-DELHI", random.choice(vendors), "Consultancy", amount,
                "NEFT", "Operational expenses - Miscellaneous",
                random.choice(approvers), "BUD-0666", ghost_project
            ])

        # --- PHASE 5: Inject SCENARIO 4 (Contract Splitting) ---
        # Splitting a 1 Crore contract into 25 payments of 3.8L to avoid 5L threshold
        split_start = start_date + timedelta(days=50)
        split_vendor = "VEN-044"
        for i in range(25):
            tx_id = f"FRAUD-SPLIT-{i:03d}"
            ts = split_start + timedelta(hours=random.randint(0, 48)) # within 48h
            amount = round(random.uniform(380000, 395000), 2) # Just under 4L
            
            writer.writerow([
                tx_id, ts.isoformat(), "DEPT-NHAI", split_vendor, "Civil Works", amount,
                "RTGS", "Road repair material supply - Batch A",
                "OFFICER-03", "BUD-4004", split_project
            ])

    print(f"Generated comprehensive fraud dataset in transactions_fraud.csv with {tx_count + 50 + 300 + 20 + 25} records.")

if __name__ == "__main__":
    generate_fraud_dataset()
