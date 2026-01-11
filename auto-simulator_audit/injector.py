import time
import json
import random
import urllib.request
import uuid
from datetime import datetime

# Configuration
API_URL = "http://localhost:8000/api/transaction"
INTERVAL = 5 # Seconds

# Mock Data Pools
VENDORS = [
    "TechCorp Solutions", "Global Services Ltd", "QuickLogistics", 
    "OfficeNeeds Pvt", "BuildRight Infra", "MediCare Supplies", 
    "Apex Consulting", "City Power Corp", "GreenField Agro"
]

DEPARTMENTS = ["Dept_A", "Dept_B", "Dept_C", "Dept_D", "Dept_E"]
CATEGORIES = ["IT", "Logistics", "Medical", "Infrastructure", "Services", "Utilities"]

def generate_transaction():
    # 20% chance of generating a risky/anomalous transaction
    is_risky = random.random() < 0.2 
    
    vendor = random.choice(VENDORS)
    dept = random.choice(DEPARTMENTS)
    category = random.choice(CATEGORIES)
    
    if is_risky:
        risk_type = random.choice(['structure', 'round', 'limit'])
        if risk_type == 'structure':
            # Slightly under 5L limit
            amount = random.randint(480000, 499000)
        elif risk_type == 'round':
            # Round number like 500000
            amount = 50000 * random.randint(2, 20)
        else:
            # High amount
            amount = random.randint(600000, 2500000)
    else:
        # Normal operational range
        amount = random.randint(5000, 150000)
        if random.random() < 0.1: # Occasional higher but valid
            amount = random.randint(150000, 300000)

    # Simulation: Department B has higher limits, so adjust risk perception logic matching backend mock policy
    if dept == "Dept_B" and amount < 2500000:
        # Might be normal for Dept B, but let the backend decide
        pass

    return {
        "transaction_id": f"LIVE-{str(uuid.uuid4())[:8].upper()}",
        "amount": amount,
        "department_id": dept,
        "vendor_id": vendor,
        "vendor_category": category,
        "timestamp": datetime.utcnow().isoformat(),
        "description": "Live injected transaction via Simulation Script"
    }

def send_transaction():
    data = generate_transaction()
    
    req = urllib.request.Request(API_URL)
    req.add_header('Content-Type', 'application/json')
    jsondata = json.dumps(data).encode('utf-8')
    req.add_header('Content-Length', len(jsondata))
    
    try:
        response = urllib.request.urlopen(req, jsondata)
        status_code = response.getcode()
        
        # Parse response to show risk level
        resp_body = response.read().decode('utf-8')
        resp_json = json.loads(resp_body)
        risk_level = resp_json.get('risk_level', 'UNKNOWN')
        risk_score = resp_json.get('risk_score', 0)
        
        icon = "🟢"
        if risk_score > 0.8: icon = "🔴"
        elif risk_score > 0.6: icon = "🟠"
        elif risk_score > 0.4: icon = "🟡"
        
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {icon} Sent: ₹{data['amount']:,.0f} | {data['vendor_id']} | Risk: {risk_level} ({risk_score})")
        
    except urllib.error.URLError as e:
        print(f"[{datetime.now().strftime('%H:%M:%S')}] ❌ Connection Error: Is api.py running? ({e})")
    except Exception as e:
        print(f"[{datetime.now().strftime('%H:%M:%S')}] ❌ Error: {e}")

if __name__ == "__main__":
    print("="*60)
    print(" AuditAI Real-Time Transaction Injector")
    print("="*60)
    print(f"Target: {API_URL}")
    print(f"Rate:   1 transaction every {INTERVAL} seconds")
    print("Log:    Monitor specific anomalies below...")
    print("-" * 60)
    print("Press Ctrl+C to stop simulation.")
    print("-" * 60)
    
    try:
        while True:
            send_transaction()
            time.sleep(INTERVAL)
    except KeyboardInterrupt:
        print("\nStopping injector...")
