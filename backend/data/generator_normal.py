import csv
import random
from datetime import datetime, timedelta

def generate_normal_dataset(n=5000):
    departments = ["DEPT-NHAI", "DEPT-CPWD", "DEPT-RAIL", "DEPT-EDU-DELHI", "DEPT-HEALTH-AIIMS"]
    categories = ["Civil Works", "IT Hardware", "Medical Supplies", "Consultancy", "Manpower"]
    vendors = [f"VEN-{i:03d}" for i in range(100)]
    approvers = [f"OFFICER-{i:02d}" for i in range(10)]
    
    projects = [f"PROJ-{i:03d}" for i in range(1, 21)]
    
    start_date = datetime(2025, 1, 1)
    
    with open("transactions_normal.csv", "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["transaction_id", "timestamp", "department_id", "vendor_id", "vendor_category", "amount", "payment_method", "description", "approver_id", "budget_code", "project_id"])
        
    start_date = datetime(2025, 1, 1)
    
    # 1. Project Clustering: Generate transactions PER PROJECT (5-20 per project)
    # We will generate enough projects to reach roughly n transactions
    avg_tx_per_proj = 12
    num_projects = int(n / avg_tx_per_proj)
    projects = [f"PROJ-{i:03d}" for i in range(1, num_projects + 1)]
    
    # 2. Realistic Vendor Distribution (80/20 rule)
    # 20% of vendors get 80% of contracts
    all_vendors = [f"VEN-{i:03d}" for i in range(100)]
    frequent_vendors = all_vendors[:20]
    rare_vendors = all_vendors[20:]
    
    with open("transactions_normal.csv", "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["transaction_id", "timestamp", "department_id", "vendor_id", "vendor_category", "amount", "payment_method", "description", "approver_id", "budget_code", "project_id"])
        
        tx_count = 0
        for proj in projects:
            # 5 to 20 transactions per project
            num_project_txs = random.randint(5, 20)
            
            # Assign a department and category to the project (projects usually stay within one dept/cat)
            proj_dept = random.choice(departments)
            proj_cat = random.choice(categories)
            
            # Project usually has one main vendor, maybe a couple of others
            # Pick a main vendor for this project
            if random.random() < 0.8:
                proj_main_vendor = random.choice(frequent_vendors)
            else:
                proj_main_vendor = random.choice(rare_vendors)

            # Determine timestamp strategy for this project
            # 15% of projects have "Bursty" activity (Contract Splitting simulation)
            is_bursty_project = random.random() < 0.15
            burst_start_day = random.randint(0, 360) if is_bursty_project else 0

            for _ in range(num_project_txs):
                tx_id = f"NTX-{tx_count:05d}"
                tx_count += 1
                
                if is_bursty_project:
                    # All txs happen within 5 days of start
                    days_offset = burst_start_day + random.randint(0, 5)
                else:
                    # Timestamp: Spread over 12 months
                    days_offset = random.randint(0, 364)
                    
                # Business hours
                hour = random.randint(9, 17)
                minute = random.randint(0, 59)
                second = random.randint(0, 59)
                
                ts = start_date + timedelta(days=days_offset)
                ts = ts.replace(hour=hour, minute=minute, second=second)
                
                # Vendor selection for this specific transaction
                # 90% chance it's the main project vendor, 10% chance it's a sub-vendor
                if random.random() < 0.9:
                    vendor = proj_main_vendor
                else:
                    vendor = random.choice(all_vendors)
                
                # IMPROVEMENT 1: Wider Amount Range (₹5k to ₹50L) with some logic
                # Small operational: 5k - 50k
                # Medium procurement: 50k - 5L
                # Large contract: 5L - 50L
                amount_tier = random.choices(["small", "medium", "large"], weights=[0.3, 0.5, 0.2])[0]
                
                if amount_tier == "small":
                    amount = round(random.uniform(5000, 50000), 2)
                elif amount_tier == "medium":
                    amount = round(random.uniform(50000, 500000), 2)
                else:
                    amount = round(random.uniform(500000, 5000000), 2)
                
                schemes = ["PMGSY", "Digital India", "Ayushman Bharat", "Smart City Mission", "Swachh Bharat"]
                selected_scheme = random.choice(schemes)
                
                descriptions = [
                    f"Procurement for {selected_scheme} - Phase {random.randint(1, 5)}",
                    f"Maintenance support for {proj_dept}",
                    f"Quarterly supply refill for {selected_scheme}",
                    f"Consultancy charges for {proj}",
                    f"Milestone payment for {proj_cat}"
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
                
        print(f"Generated {tx_count} realistic transactions in transactions_normal.csv")

if __name__ == "__main__":
    generate_normal_dataset(5000)
