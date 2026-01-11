from motor.motor_asyncio import AsyncIOMotorClient
import os
import certifi

from dotenv import load_dotenv

load_dotenv()

# MongoDB Connection String from User
MONGO_DETAILS = os.getenv("MONGO_DETAILS")

client = AsyncIOMotorClient(MONGO_DETAILS, tlsCAFile=certifi.where())

database = client.auditai

users_collection = database.get_collection("users")
alerts_collection = database.get_collection("alerts")
transactions_collection = database.get_collection("transactions")

# Helpers needed for Pydantic models with MongoDB (Convert ObjectId to str)
def alert_helper(alert) -> dict:
    return {
        "id": str(alert["_id"]),
        "transaction_id": alert["transaction_id"],
        "risk_score": alert["risk_score"],
        "risk_level": alert.get("risk_level", "UNKNOWN"),
        "is_fraud": alert.get("is_fraud", False),
        "amount": alert["amount"],
        "department_id": alert["department_id"],
        "vendor_id": alert["vendor_id"],
        "timestamp": alert.get("timestamp"),
        "explanation": alert.get("explanation", ""),
        "ml_flag": alert.get("ml_flag", "NORMAL"),
        "status": alert.get("status", "new"),
        "created_at": alert.get("created_at")
    }

def user_helper(user) -> dict:
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "full_name": user.get("full_name"),
    }
