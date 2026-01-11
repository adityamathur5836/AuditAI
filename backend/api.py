"""
AuditAI Enterprise API - FastAPI backend for fraud detection
Provides REST API for CSV upload, real-time analysis, alerts management, and authentication
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import pandas as pd
import io
import json
from datetime import datetime, timedelta
from pathlib import Path

from fraud_detector import FraudDetector, get_detector
from database import (
    users_collection, 
    alerts_collection, 
    transactions_collection,
    alert_helper, 
    user_helper
)
from auth import (
    get_password_hash, 
    verify_password, 
    create_access_token, 
    decode_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from network_engine import NetworkEngine
from benford import BenfordAnalyzer

from narrative_engine import NarrativeEngine
from rag_engine import RagEngine

# Initialize engines
network_engine = NetworkEngine()
benford_analyzer = BenfordAnalyzer()
narrative_engine = NarrativeEngine()
rag_engine = RagEngine()



# Initialize FastAPI app
app = FastAPI(
    title="AuditAI Fraud Detection API",
    description="Enterprise-ready ML-powered fraud detection for government spending",
    version="2.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize fraud detector
detector = get_detector()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# --- Pydantic Models ---

class Transaction(BaseModel):
    transaction_id: str
    amount: float
    department_id: str
    vendor_id: str
    vendor_category: Optional[str] = None
    timestamp: Optional[str] = None
    description: Optional[str] = None
    project_id: Optional[str] = None

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class PredictionResult(BaseModel):
    transaction_id: str
    is_fraud: bool
    risk_score: float
    risk_level: str
    reasons: List[str]
    amount: float
    department_id: str
    vendor_id: str

# --- Dependency ---

async def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    email: str = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = await users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user_helper(user)

# --- Routes ---

@app.get("/")
async def root():
    return {
        "name": "AuditAI Fraud Detection API",
        "version": "2.0.0",
        "status": "running",
        "database": "connected (MongoDB)",
        "model_status": detector.get_model_info()
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "model_loaded": detector.model_loaded,
        "database": "connected"
    }

@app.on_event("startup")
async def startup_db_client():
    # Create default admin user if not exists
    admin_email = "admin@auditai.gov"
    existing_admin = await users_collection.find_one({"email": admin_email})
    if not existing_admin:
        hashed_password = get_password_hash("admin123")
        admin_user = {
            "email": admin_email,
            "hashed_password": hashed_password,
            "full_name": "System Administrator",
            "created_at": datetime.utcnow(),
            "role": "admin"
        }
        await users_collection.insert_one(admin_user)
        print(f"Created default admin user: {admin_email}")

# --- Auth Endpoints ---

@app.post("/api/auth/register", response_model=User)
async def register(user: UserRegister):
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = {
        "email": user.email,
        "hashed_password": hashed_password,
        "full_name": user.full_name,
        "created_at": datetime.utcnow()
    }
    
    result = await users_collection.insert_one(new_user)
    created_user = await users_collection.find_one({"_id": result.inserted_id})
    return user_helper(created_user)

@app.post("/api/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # Compatible with OAuth2 standard form
    user = await users_collection.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# --- Core Logic ---

@app.post("/api/predict", response_model=PredictionResult)
async def predict_single(transaction: Transaction, current_user: User = Depends(get_current_user)):
    tx_dict = transaction.dict()
    result = detector.predict_single(tx_dict)
    return result

@app.post("/api/transaction")
async def ingest_transaction(transaction: Transaction):
    """
    Real-time ingestion endpoint.
    Predicts, generates narrative, and sets Score based on History + ML.
    """
    tx_dict = transaction.dict()
    
    # 1. Predict (Base ML Score)
    result = detector.predict_single(tx_dict)
    
    # 1. Duplicate Check (The "Basic Fail" Fix)
    # Check if exact same amount to same vendor in last 24 hours
    cutoff_time = datetime.utcnow() - timedelta(hours=24)
    duplicate = await alerts_collection.find_one({
        "vendor_id": tx_dict.get('vendor_id'),
        "amount": tx_dict.get('amount'),
        "created_at": {"$gte": cutoff_time}
    })

    if duplicate:
        result['risk_score'] = 1.0
        result['risk_level'] = "CRITICAL"
        result['explanation'] = f"🚨 DUPLICATE PAYMENT DETECTED. Identical amount (₹{tx_dict.get('amount')}) paid to this vendor recently (ID: {duplicate.get('transaction_id')})."
        # Skip ML if duplicate
        await alerts_collection.insert_one(result)
        return result

    # 2. Risk Recalibration (The "Entity-First" Logic)
    # Check history: Has this vendor been flagged before?
    vendor_id = tx_dict.get('vendor_id')
    history_count = await alerts_collection.count_documents({"vendor_id": vendor_id})
    
    recalibration_note = ""
    boost = 0.0
    
    if history_count > 0:
        # Boost logic: +10% for repeat offense, max +30%
        boost = min(history_count * 0.1, 0.3)
        result['risk_score'] = min(result['risk_score'] + boost, 0.99)
        
        # Update Risk Level Classification based on new score
        if result['risk_score'] >= 0.8:
            result['risk_level'] = "CRITICAL"
        elif result['risk_score'] >= 0.6:
            result['risk_level'] = "HIGH"
            
        recalibration_note = f" [Score boosted +{int(boost*100)} due to {history_count} previous flags]"

    # 3. AI Narrative
    # Generate base narrative
    explanation = narrative_engine.generate_narrative(result, None)
    
    # Enrich narrative with historical context
    if history_count > 0:
        explanation = f"⚠️ Repeat Offender ({history_count} prior flags). {explanation}{recalibration_note}"
    
    if boost > 0.15:
        explanation = f"🚨 ESCALATING RISK: Vendor risk trajectory is increasing rapidly. {explanation}"

    result['explanation'] = explanation
    
    # 4. Store in DB
    # Ensure timestamps
    if not result.get('timestamp'):
        result['timestamp'] = datetime.utcnow().isoformat()
    
    try:
        result['created_at'] = pd.to_datetime(result['timestamp'])
    except:
        result['created_at'] = datetime.utcnow()

    # Store in Transactions (History/Graph)
    await transactions_collection.insert_one(result.copy())
    
    # Store in Alerts (Dashboard)
    alert = result.copy()
    alert.pop('_id', None) 
    
    await alerts_collection.insert_one(alert)
    
    # Clean up for response
    alert.pop('_id', None)
    return alert

@app.post("/api/upload")
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")
    
    try:
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')), comment='#', skip_blank_lines=True)
        
        # Data Cleaning: Ensure amount is numeric and drop invalid rows
        if 'amount' in df.columns:
            df['amount'] = pd.to_numeric(df['amount'], errors='coerce')
            df = df.dropna(subset=['amount'])
            
        required_cols = ['transaction_id', 'amount', 'department_id', 'vendor_id']
        missing_cols = [col for col in required_cols if col not in df.columns]
        if missing_cols:
            raise HTTPException(status_code=400, detail=f"Missing required columns: {missing_cols}")
        
        results_df = detector.predict_dataframe(df)
        
        # Stats
        total = len(results_df)
        fraudulent = len(results_df[results_df['is_fraud'] == True])
        high_risk = len(results_df[results_df['risk_level'].isin(['CRITICAL', 'HIGH'])])
        medium_risk = len(results_df[results_df['risk_level'] == 'MEDIUM'])
        low_risk = len(results_df[results_df['risk_level'].isin(['LOW', 'MINIMAL'])])
        
        # Prepare for MongoDB
        # Prepare for MongoDB
        results_df = results_df.sort_values('risk_score', ascending=False)
        # Use to_json to handle NaNs correctly (converts to null), then load back to dict list
        results_list = json.loads(results_df.to_json(orient='records'))
        
        # [NEW] Generate Narratives (AI Detective)
        # We pass the original df for context (averages, etc)
        for res in results_list:
            res['explanation'] = narrative_engine.generate_narrative(res, df)
        
        # Store ALL transactions for advanced analytics (Graph/Benford)
        # [MODIFIED] Store ALL transactions accumulatively (do not clear old history)
        # await transactions_collection.delete_many({}) 
        if results_list:
            await transactions_collection.insert_many(results_list)
            # MongoDB adds _id in-place. Remove it to avoid JSON serialization error in response
            for r in results_list:
                r.pop('_id', None)
        
        # [MODIFIED] Store ALL records regardless of score so they appear in Dashboard/History
        alerts_to_store = []
        for r in results_list:
            # Format for DB
            alert = r.copy()
            # If narrative engine didn't run (fallback), join reasons. 
            if not alert.get('explanation') and isinstance(alert.get('reasons'), list):
                alert['explanation'] = ' | '.join(alert['reasons'])

            # Use transaction timestamp if available, else utcnow
            if alert.get('timestamp'):
                try:
                    alert['created_at'] = pd.to_datetime(alert['timestamp'])
                except:
                    alert['created_at'] = datetime.utcnow()
            else:
                alert['created_at'] = datetime.utcnow()
            
            alerts_to_store.append(alert)
        
        if alerts_to_store:
            await alerts_collection.insert_many(alerts_to_store)
        
        return {
            "success": True,
            "filename": file.filename,
            "total_transactions": total,
            "fraudulent_transactions": fraudulent,
            "high_risk_count": high_risk,
            "medium_risk_count": medium_risk,
            "low_risk_count": low_risk,
            "detection_rate": round(fraudulent / total * 100, 2) if total > 0 else 0,
            "results": results_list[:50] # Return top 50 to frontend
        }
        
    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="CSV file is empty")
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.get("/api/alerts")
async def get_alerts(limit: int = 100, min_score: float = 0.0, sort_by: str = "risk_score"):
    sort_field = "risk_score"
    if sort_by == "latest":
        sort_field = "created_at"
    
    cursor = alerts_collection.find({"risk_score": {"$gte": min_score}}).sort(sort_field, -1).limit(limit)
    alerts = []
    async for document in cursor:
        alerts.append(alert_helper(document))
    return {"total": len(alerts), "alerts": alerts}

@app.delete("/api/alerts")
async def clear_alerts():
    await alerts_collection.delete_many({})
    return {"success": True, "message": "All database alerts cleared."}

class AlertUpdate(BaseModel):
    status: str

@app.patch("/api/alerts/{transaction_id}")
async def update_alert_status(transaction_id: str, update: AlertUpdate, current_user: User = Depends(get_current_user)):
    result = await alerts_collection.update_one(
        {"transaction_id": transaction_id},
        {"$set": {"status": update.status, "updated_at": datetime.utcnow()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"success": True, "status": update.status}

@app.get("/api/stats")
async def get_statistics():
    total = await alerts_collection.count_documents({})
    critical = await alerts_collection.count_documents({"risk_score": {"$gte": 0.8}})
    high = await alerts_collection.count_documents({"risk_score": {"$gte": 0.6, "$lt": 0.8}})
    medium = await alerts_collection.count_documents({"risk_score": {"$gte": 0.4, "$lt": 0.6}})
    
    # Aggregation for total amount
    pipeline = [{"$group": {"_id": None, "total": {"$sum": "$amount"}}}]
    cursor = alerts_collection.aggregate(pipeline)
    result = await cursor.to_list(length=1)
    total_amount = result[0]["total"] if result else 0.0

    # Monthly aggregation
    monthly_pipeline = [
        {"$project": {
            "month": {"$month": "$created_at"},
            "is_critical": {"$cond": [{"$gte": ["$risk_score", 0.8]}, 1, 0]}
        }},
        {"$group": {
            "_id": "$month",
            "count": {"$sum": 1},
            "critical_count": {"$sum": "$is_critical"}
        }},
        {"$sort": {"_id": 1}}
    ]
    monthly_cursor = alerts_collection.aggregate(monthly_pipeline)
    monthly_data = await monthly_cursor.to_list(length=12)
    
    # Format monthly data for frontend (array of 12 ints)
    monthly_counts = [0] * 12
    for m in monthly_data:
        idx = m["_id"] - 1 # Mongo months are 1-12
        if 0 <= idx < 12:
            monthly_counts[idx] = m["count"]

    return {
        "total_alerts": total,
        "critical_alerts": critical,
        "high_risk_alerts": high,
        "medium_risk_alerts": medium,
        "total_flagged_amount": total_amount,
        "monthly_counts": monthly_counts,
        "model_info": detector.get_model_info()
    }

# --- Helper: Deterministic Vendor Name Generator ---
def generate_vendor_name(vendor_id, category="General"):
    """
    Generates a realistic, deterministic vendor name based on ID and Category.
    Ensures VEND-8363 always maps to 'Titanium Construction' etc.
    """
    import hashlib
    
    # Seed random with vendor_id to ensure consistency
    # We use a simple hash to pick an index
    hash_val = int(hashlib.md5(vendor_id.encode()).hexdigest(), 16)
    
    prefixes = {
        "Construction": ["Apex", "Titanium", "Metro", "Global", "BuildRight", "Urban", "Sturdy", "Prime"],
        "Medical Supplies": ["MedTech", "PharmaCare", "HealthPlus", "BioLife", "CureWell", "MediCorp", "Surgical"],
        "IT Hardware": ["TechGrid", "LogicCore", "SysMaster", "DataFlow", "ComputeX", "Silicon", "NetWorks"],
        "Logistics": ["RapidMove", "TransGlobal", "SwiftShip", "LogiTech", "CargoNet", "FleetOps", "Speedy"],
        "Office Supplies": ["OfficeDepot", "PaperTrail", "DeskMate", "SupplyPoint", "StationeryPlus"],
        "Software Licenses": ["SoftWarez", "CloudSync", "VirtuSoft", "CodeStream", "LicenSys", "AppSphere"],
        "Consulting": ["StratEdge", "InsightPro", "BizWiz", "Consultia", "Advisio", "Expertise"],
        "General": ["General", "Universal", "Standard", "United", "Federal"]
    }
    
    suffixes = {
        "Construction": ["Builders", "Construct", "Infra", "Developments", "Engineering", "Solutions"],
        "Medical Supplies": ["Supplies", "Labs", "Diagnostics", "Systems", "Health", "Medicines"],
        "IT Hardware": ["Systems", "Technologies", "Devices", "Computers", "Electronics"],
        "Logistics": ["Logistics", "Transport", "Freight", "Shipping", "Express"],
        "Office Supplies": ["Supplies", "Inc", "Limited", "Corp", "Store"],
        "Software Licenses": ["Systems", "Tech", "Solutions", "Soft", "Data"],
        "Consulting": ["Consulting", "Partners", "Group", "Associates", "Advisors"],
        "General": ["Group", "Inc", "Co", "Corp", "Limited", "Holdings"]
    }
    
    cat_key = category if category in prefixes else "General"
    
    # Pick prefix
    p_idx = hash_val % len(prefixes.get(cat_key, prefixes["General"]))
    prefix = prefixes.get(cat_key, prefixes["General"])[p_idx]
    
    # Rotate hash for suffix
    hash_val = hash_val // 10 
    # Safe fetch
    suffix_list = suffixes.get(cat_key, suffixes["General"])
    s_idx = hash_val % len(suffix_list)
    suffix = suffix_list[s_idx]
    
    return f"{prefix} {suffix}"

@app.get("/api/entities")
@app.get("/api/entities")
async def get_entities(days: Optional[int] = None, start_date: Optional[str] = None, end_date: Optional[str] = None):
    """
    Entity-First Aggregation.
    Groups alerts by Vendor to show 'Who is risky' instead of 'What is risky'.
    Supports `days` (lookback) or `start_date`/`end_date` (ISO strings).
    """
    match_stage = {}
    
    # Date Filtering Logic
    date_filter = {}
    if start_date:
        date_filter["$gte"] = start_date
    elif days:
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        date_filter["$gte"] = cutoff_date.isoformat()
        
    if end_date:
        date_filter["$lte"] = end_date
        
    if date_filter:
        match_stage = {"created_at": date_filter}

    pipeline = [
        {"$match": match_stage} if match_stage else None,
        {"$sort": {"created_at": -1}}, # Sort first to get recent trends
        {"$group": {
            "_id": "$vendor_id",
            "vendor_name": {"$first": "$vendor_id"}, 
            "category": {"$first": "$vendor_category"}, # Capture category
            "flag_count": {"$sum": 1},
            "total_risk_score": {"$sum": "$risk_score"},
            "max_risk_score": {"$max": "$risk_score"},
            "avg_risk_score": {"$avg": "$risk_score"},
            "total_amount": {"$sum": "$amount"},
            "last_flagged": {"$max": "$created_at"},
            "departments": {"$addToSet": "$department_id"},
            # Capture last 5 scores for Sparkline/Trend
            "recent_scores": {"$push": "$risk_score"},
            "recent_reasons": {"$push": "$explanation"}
        }},
        {"$project": {
            "vendor_name": 1,
            "category": 1,
            "flag_count": 1,
            "total_risk_score": 1,
            "max_risk_score": 1,
            "avg_risk_score": 1,
            "total_amount": 1,
            "last_flagged": 1,
            "departments": 1,
            "recent_scores": {"$slice": ["$recent_scores", 10]}, # Keep last 10
            "recent_reasons": {"$slice": ["$recent_reasons", 3]} # Keep last 3 reasons
        }},
        {"$sort": {"max_risk_score": -1, "flag_count": -1}}
    ]
    
    # Remove None stages
    pipeline = [s for s in pipeline if s is not None]

    cursor = alerts_collection.aggregate(pipeline)
    entities = await cursor.to_list(length=100)
    
    # Post-process for "Confidence" and "Trend"
    results = []
    for e in entities:
        # Determine Confidence/Verdict
        risk_level = "LOW"
        if e['max_risk_score'] > 0.8:
            risk_level = "CRITICAL"
        elif e['max_risk_score'] > 0.6:
            risk_level = "HIGH"
        elif e['flag_count'] > 5:
            risk_level = "HIGH" # Repeat offender
        elif e['max_risk_score'] > 0.4:
            risk_level = "MEDIUM"
            
        # Determine Trend
        scores = e.get('recent_scores', [])
        trend = "stable"
        if len(scores) >= 2:
            newest = scores[0]
            oldest = scores[-1]
            if newest > oldest + 0.1:
                trend = "increasing"
            elif newest < oldest - 0.1:
                trend = "decreasing"
        
        # Generate Name
        display_name = generate_vendor_name(e['_id'], e.get('category', 'General'))

        results.append({
            "id": e['_id'],
            "name": display_name,
            "flag_count": e['flag_count'],
            "total_amount": e['total_amount'],
            "risk_score": e['max_risk_score'], # Use Max as the headline score
            "verdict": risk_level,
            "trend": trend,
            "departments": list(e['departments']),
            "last_active": e['last_flagged'],
            "history": scores,  # For sparkline
            "top_reasons": e['recent_reasons']
        })
        
    return results

    return results

@app.get("/api/departments")
async def get_departments():
    """
    Departmental Oversight Aggregation.
    Answers: 'Which department is generating the most risk?'
    """
    pipeline = [
        {"$group": {
            "_id": "$department_id",
            "dept_name": {"$first": "$department_id"}, 
            "flag_count": {"$sum": 1},
            "total_risk_score": {"$sum": "$risk_score"},
            "avg_risk_score": {"$avg": "$risk_score"},
            "total_amount": {"$sum": "$amount"},
            "unique_vendors": {"$addToSet": "$vendor_id"},
            "top_risk_vendor_score": {"$max": "$risk_score"}
        }},
        {"$project": {
            "dept_name": 1,
            "flag_count": 1,
            "total_risk_score": 1,
            "avg_risk_score": 1,
            "total_amount": 1,
            "vendor_count": {"$size": "$unique_vendors"},
            "top_risk_vendor_score": 1
        }},
        {"$sort": {"total_risk_score": -1}}
    ]

    cursor = alerts_collection.aggregate(pipeline)
    depts = await cursor.to_list(length=50)
    
    results = []
    for d in depts:
        # Determine Health Status
        status = "Healthy"
        if d['avg_risk_score'] > 0.6 or d['flag_count'] > 20:
             status = "Critical"
        elif d['avg_risk_score'] > 0.4 or d['flag_count'] > 10:
             status = "Warning"
            
        results.append({
            "id": d['_id'],
            "name": d['dept_name'] or "General Fund",
            "flag_count": d['flag_count'],
            "total_amount": d['total_amount'],
            "avg_score": d['avg_risk_score'],
            "vendor_count": d['vendor_count'],
            "status": status,
            "risk_index": d['total_risk_score'] # Composite index
        })
        
    return results

@app.get("/api/network/graph")
async def get_network_graph():
    """Build and return logic for Network Graph visualization"""
    # 1. Get recent transactions (limit to 200 for viz performance)
    cursor = alerts_collection.find().sort("created_at", -1).limit(200)
    txns = await cursor.to_list(length=200)

    nodes = {}
    links = []

    for tx in txns:
        vnd_id = tx.get("vendor_id", "Unknown")
        dept_id = tx.get("department_id", "Unknown")
        risk = tx.get("risk_score", 0)
        
        # Vendor Node
        if vnd_id not in nodes:
            nodes[vnd_id] = {"id": vnd_id, "type": "vendor", "risk": 0}
        nodes[vnd_id]["risk"] = max(nodes[vnd_id]["risk"], risk)

        # Dept Node
        if dept_id not in nodes:
            nodes[dept_id] = {"id": dept_id, "type": "department", "risk": 0}
        
        # Link
        links.append({
            "source": vnd_id,
            "target": dept_id,
            "risk": risk
        })

    return {
        "nodes": list(nodes.values()),
        "links": links
    }

@app.get("/api/stats/benford")
async def get_benford_stats():
    """Return Benford's Law analysis for current transactions"""
    cursor = transactions_collection.find({})
    transactions = await cursor.to_list(length=10000)
    
    if not transactions:
        return {"valid": False, "error": "No data"}
        
    amounts = [t.get('amount', 0) for t in transactions]
    return benford_analyzer.analyze(amounts)

# ... (existing upload code) ...

class ChatRequest(BaseModel):
    message: str

@app.post("/api/chat")
async def chat_policy(request: ChatRequest):
    """
    RAG Chatbot endpoint.
    Retrieves policy documents and answers queries.
    """
    response = rag_engine.ask(request.message)
    return {
        "reply": response["answer"],
        "sources": response["context"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
