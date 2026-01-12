"""
AuditAI Fraud Detector - ML-powered fraud detection using trained_model.pkl
Enterprise-ready fraud detection for government spending analysis
"""

import pickle
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from datetime import datetime

class FraudDetector:
    """
    ML-powered fraud detection using Isolation Forest + Statistical Analysis.
    Uses trained_model.pkl containing department baselines and Isolation Forest model.
    """
    
    def __init__(self, transaction_file: str = 'demo_transactions_with_anomalies.csv', model_path: str = 'trained_model.pkl', config: dict = None):
        self.model_path = model_path
        self.model_loaded = False
        self.iso_model = None
        self.dept_stats = None
        self.config = config or {  # Use provided config or defaults
            "z_score_threshold": 3.0,
            "iqr_multiplier": 1.5,
            "off_hours_enabled": True,
            "weekend_flagging": True,
            "off_hours_start": 22,
            "off_hours_end": 6,
            "critical_threshold": 0.7,  # 70%
            "high_threshold": 0.4  # 40%
        }
        self._load_model()
    
    def _load_model(self) -> None:
        """Load the trained Isolation Forest model and department statistics"""
        try:
            model_file = Path(self.model_path)
            if not model_file.exists():
                # Try relative to this file's directory
                model_file = Path(__file__).parent / self.model_path
            
            with open(model_file, 'rb') as f:
                model_data = pickle.load(f)
            
            self.dept_stats = model_data['dept_stats']
            self.iso_model = model_data['iso_model']
            self.model_loaded = True
            print(f"✅ Fraud detection model loaded successfully")
        except FileNotFoundError:
            print(f"⚠️ Model file not found: {self.model_path}")
            self.model_loaded = False
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            self.model_loaded = False
    
    def predict_single(self, transaction: Dict) -> Dict:
        """
        Predict fraud probability for a single transaction.
        
        Args:
            transaction: Dictionary with keys like 'amount', 'department_id', 'vendor_id', etc.
            
        Returns:
            Dictionary with risk_score, is_fraud, reasons, and transaction details
        """
        if not self.model_loaded:
            return {
                "error": "Model not loaded",
                "is_fraud": False,
                "risk_score": 0,
                "reasons": []
            }
        
        amount = float(transaction.get('amount', 0))
        dept_id = transaction.get('department_id', 'UNKNOWN')
        
        risk_score = 0
        reasons = []
        
        # 1. Z-score analysis (department baseline)
        z_score = self._compute_z_score(amount, dept_id)
        z_threshold = self.config.get("z_score_threshold", 3.0)
        if z_score is not None and abs(z_score) > z_threshold:
            risk_score += 30
            reasons.append(f"Extreme deviation from department average (z-score: {z_score:.2f})")
        elif z_score is not None and abs(z_score) > (z_threshold - 1):
            risk_score += 15
            reasons.append(f"Significant deviation from department average (z-score: {z_score:.2f})")
        
        # 2. IQR-based outlier detection
        is_iqr_outlier = self._check_iqr_outlier(amount, dept_id)
        if is_iqr_outlier:
            risk_score += 25
            reasons.append("Amount outside normal IQR range for this department")
        
        # 3. Isolation Forest ML prediction
        ml_flag = self.iso_model.predict([[amount]])[0]
        if ml_flag == -1:  # Anomaly
            risk_score += 30
            ml_score = self.iso_model.score_samples([[amount]])[0]
            reasons.append(f"ML model detected rare statistical pattern (anomaly score: {ml_score:.3f})")
        
        # 4. Off-hours check
        timestamp = transaction.get('timestamp')
        if timestamp and self.config.get("off_hours_enabled", True):
            is_off_hours, off_hours_reason = self._check_off_hours(timestamp)
            if is_off_hours:
                risk_score += 15
                reasons.append(off_hours_reason)

        # 5. Round Number Check (Human Bias Heuristic)
        # Fraudulent amounts are often perfectly round numbers (e.g., 50000.00)
        if amount > 1000 and amount % 1000 == 0:
            risk_score += 10
            reasons.append("Suspiciously round amount (multiple of ₹1,000)")
        
        # Normalize to 0-1 scale
        normalized_score = min(risk_score / 100, 1.0)
        
        return {
            "transaction_id": transaction.get('transaction_id', 'UNKNOWN'),
            "is_fraud": normalized_score > 0.5,
            "risk_score": round(normalized_score, 3),
            "risk_level": self._get_risk_level(normalized_score),
            "reasons": reasons,
            "amount": amount,
            "department_id": dept_id,
            "vendor_id": transaction.get('vendor_id', 'UNKNOWN'),
            "z_score": float(z_score) if z_score is not None and not pd.isna(z_score) else 0.0,
            "ml_flag": "ANOMALY" if ml_flag == -1 else "NORMAL"
        }
    
    def predict_batch(self, transactions: List[Dict]) -> List[Dict]:
        """Batch prediction for multiple transactions"""
        return [self.predict_single(tx) for tx in transactions]
    
    def predict_dataframe(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Predict fraud for an entire DataFrame of transactions.
        
        Args:
            df: DataFrame with transaction data
            
        Returns:
            DataFrame with added risk_score, is_fraud, reasons columns
        """
        if not self.model_loaded:
            df['risk_score'] = 0
            df['is_fraud'] = False
            df['reasons'] = ''
            df['risk_level'] = 'LOW'
            return df
        
        results = []
        for _, row in df.iterrows():
            tx_dict = row.to_dict()
            result = self.predict_single(tx_dict)
            results.append(result)
        
        results_df = pd.DataFrame(results)
        return results_df
    
    def _compute_z_score(self, amount: float, dept_id: str) -> Optional[float]:
        """Compute z-score based on department statistics"""
        if self.dept_stats is None or dept_id not in self.dept_stats.index:
            return None
        
        stats = self.dept_stats.loc[dept_id]
        mean = stats['mean']
        std = stats['std']
        
        if std == 0 or pd.isna(std):
            return None
        
        return (amount - mean) / std
    
    def _check_iqr_outlier(self, amount: float, dept_id: str) -> bool:
        """Check if amount is an IQR outlier for the department"""
        if self.dept_stats is None or dept_id not in self.dept_stats.index:
            return False
        
        stats = self.dept_stats.loc[dept_id]
        q1 = stats['25%']
        q3 = stats['75%']
        iqr = q3 - q1
        
        iqr_multiplier = self.config.get("iqr_multiplier", 1.5)
        lower_bound = q1 - (iqr_multiplier * iqr)
        upper_bound = q3 + (iqr_multiplier * iqr)
        
        return amount < lower_bound or amount > upper_bound
    
    def _check_off_hours(self, timestamp_str: str) -> tuple:
        """Check if transaction occurred during off-hours"""
        try:
            # Parse ISO format timestamp
            dt = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
            hour = dt.hour
            
            off_hours_start = self.config.get("off_hours_start", 22)
            off_hours_end = self.config.get("off_hours_end", 6)
            weekend_flagging = self.config.get("weekend_flagging", True)
            
            # Check off-hours (e.g., 10 PM to 6 AM)
            is_off_hours = hour >= off_hours_start or hour < off_hours_end
            
            # Check weekend
            is_weekend = dt.weekday() >= 5  # Saturday=5, Sunday=6
            
            if is_off_hours:
                return (True, f"Transaction occurred during off-hours ({hour}:00)")
            elif is_weekend and weekend_flagging:
                return (True, f"Transaction occurred on weekend")
            else:
                return (False, "")
        except Exception as e:
            return (False, "")
    
    def _get_risk_level(self, score: float) -> str:
        """Convert risk score to human-readable level using configurable thresholds"""
        # Thresholds are in percentage (0-100), normalize to 0-1
        critical_threshold = self.config.get("critical_threshold", 0.7)
        high_threshold = self.config.get("high_threshold", 0.4)
        
        if score > critical_threshold:
            return "CRITICAL"
        elif score > high_threshold:
            return "HIGH"
        elif score > 0.3:
            return "MEDIUM"
        else:
            return "LOW"
    
    def get_model_info(self) -> Dict:
        """Get information about the loaded model"""
        if not self.model_loaded:
            return {"status": "not_loaded", "error": "Model file not found"}
        
        return {
            "status": "loaded",
            "departments_tracked": len(self.dept_stats) if self.dept_stats is not None else 0,
            "model_type": "IsolationForest",
            "features": ["amount"],
            "contamination": getattr(self.iso_model, 'contamination', 'unknown')
        }


# Export singleton for easy import
_detector_instance = None

def get_detector(model_path: str = "trained_model.pkl") -> FraudDetector:
    """Get or create a FraudDetector singleton"""
    global _detector_instance
    if _detector_instance is None:
        _detector_instance = FraudDetector(model_path)
    return _detector_instance


if __name__ == "__main__":
    # Quick test
    detector = FraudDetector()
    
    # Test transaction
    test_tx = {
        "transaction_id": "TEST-001",
        "amount": 5000000,  # 50 Lakh - likely anomaly
        "department_id": "DEPT-RAIL",
        "vendor_id": "VEN-TEST",
        "timestamp": "2025-01-10T02:00:00"  # Off-hours
    }
    
    result = detector.predict_single(test_tx)
    print("\n🔍 Fraud Detection Result:")
    print(f"   Transaction: {result['transaction_id']}")
    print(f"   Risk Score: {result['risk_score']}")
    print(f"   Risk Level: {result['risk_level']}")
    print(f"   Is Fraud: {result['is_fraud']}")
    print(f"   ML Flag: {result['ml_flag']}")
    print(f"   Reasons:")
    for reason in result['reasons']:
        print(f"     - {reason}")
