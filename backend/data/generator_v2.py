import csv
import random
import uuid
from datetime import datetime, timedelta

def generate_large_dataset(n=5000):
    departments = ["DEPT-NHAI", "DEPT-CPWD", "DEPT-RAIL", "DEPT-EDU-DELHI", "DEPT-HEALTH-AIIMS"]
    categories = ["Civil Works", "IT Hardware", "Medical Supplies", "Consultancy", "Manpower"]
    vendors = [f"VEN-{i:03d}" for i in range(100)]
    approvers = [f"OFFICER-{i:02d}" for i in range(10)]
    
    start_date = datetime(2025, 1, 1)
    
    # Project Clustering
    avg_tx_per_proj = 25 # Slightly more for large datasets
    num_projects = int(n / avg_tx_per_proj)
    projects = [f"PROJ-{i:03d}" for i in range(1, num_projects + 1)]
    
    # Vendor Skew
    all_vendors = [f"VEN-{i:03d}" for i in range(100)]
    frequent_vendors = all_vendors[:15] # 15% get most
    rare_vendors = all_vendors[15:]
    
    with open("transactions_large.csv", "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["transaction_id", "timestamp", "department_id", "vendor_id", "vendor_category", "amount", "payment_method", "description", "approver_id", "budget_code", "project_id"])
        
        tx_count = 0
        for proj in projects:
             # 10 to 50 transactions per project for large dataset
            num_project_txs = random.randint(10, 50)
            
            proj_dept = random.choice(departments)
            proj_cat = random.choice(categories)
            
            if random.random() < 0.8:
                proj_main_vendor = random.choice(frequent_vendors)
            else:
                proj_main_vendor = random.choice(rare_vendors)

            for _ in range(num_project_txs):
                tx_id = f"LTX-{tx_count:05d}"
                tx_count += 1
                
                # Timestamp: Spread over 12 months
                ts = start_date + timedelta(minutes=random.randint(0, 525600)) 
                
                # Off hours injection (keep existing logic)
                if tx_count % 250 == 0:
                     ts = ts.replace(hour=random.randint(0, 4))

                if random.random() < 0.85:
                    vendor = proj_main_vendor
                else:
                    vendor = random.choice(all_vendors)
                
                # Wider Amount Range & Anomalies
                # Normal: 5k - 20L
                amount_tier = random.choices(["small", "medium", "large"], weights=[0.4, 0.4, 0.2])[0]
                if amount_tier == "small":
                     amount = round(random.uniform(5000, 50000), 2)
                elif amount_tier == "medium":
                     amount = round(random.uniform(50000, 500000), 2)
                else:
                     amount = round(random.uniform(500000, 2000000), 2)

                # Inject potential anomalies (Keep logic but scale amounts)
                if tx_count % 100 == 0: # Every 100th tx is a spike
                    # Spike to ₹50L - ₹2Cr
                    amount = round(random.uniform(5000000, 20000000), 2)
                
                schemes = ["PMGSY", "Digital India", "Ayushman Bharat", "Smart City Mission", "Swachh Bharat"]
                selected_scheme = random.choice(schemes)
                
                descriptions = [
                    f"Procurement for {selected_scheme} - Phase {random.randint(1, 5)}",
                    f"Infrastructure development for {proj_dept}",
                    f"Annual maintenance contract for {selected_scheme}",
                    f"Vendor payment for {proj_cat}",
                    f"Urgent dispatch for {proj}"
                ]

                writer.writerow([
                    tx_id,
                    ts.isoformat(),
                    proj_dept,
                    vendor,
                    proj_cat,
                    amount,
                    random.choice(["NEFT", "RTGS", "UPI"]),
                    random.choice(descriptions),
                    random.choice(approvers),
                    f"BUD-{random.randint(1000, 9999)}",
                    proj
                ])
    print(f"Generated {tx_count} transactions in transactions_large.csv")

if __name__ == "__main__":
    generate_large_dataset(5000)
