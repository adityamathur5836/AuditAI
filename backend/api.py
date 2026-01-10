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

@app.post("/api/upload")
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")
    
    try:
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
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
        results_df = results_df.sort_values('risk_score', ascending=False)
        results_list = results_df.to_dict(orient='records')
        
        # Filter high risk for storage (> 0.5)
        alerts_to_store = []
        for r in results_list:
            if r.get('risk_score', 0) > 0.5:
                # Format for DB
                alert = r.copy()
                if isinstance(alert.get('reasons'), list):
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
            "detection_rate": round(fraudulent / total * 100, 2) if total > 0 else 0,
            "results": results_list[:50] # Return top 50 to frontend
        }
        
    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="CSV file is empty")
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.get("/api/alerts")
async def get_alerts(limit: int = 100, min_score: float = 0.0):
    cursor = alerts_collection.find({"risk_score": {"$gte": min_score}}).sort("risk_score", -1).limit(limit)
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
