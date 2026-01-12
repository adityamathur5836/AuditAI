import os
import google.generativeai as genai

class NarrativeEngine:
    def __init__(self):
        # Configure Gemini
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            try:
                genai.configure(api_key=api_key)
                self.model = genai.GenerativeModel('gemini-1.5-flash')
                self.ai_enabled = True
            except Exception as e:
                print(f"Failed to config GenAI for Narrative: {e}")
                self.ai_enabled = False
        else:
            self.ai_enabled = False

        self.templates = {
            "critical_high_amount": "This transaction of ₹{amount} is significantly higher than the average for {dept}. Coupled with {risk_factors}, this requires immediate investigation.",
            "weekend_activity": "Unusual activity detected on a {day}. Corporate spending is rarely processed on weekends.",
            "round_amount": "The amount ₹{amount} is a round number, which is statistically improbable for genuine invoices.",
            "benford_anomaly": "The leading digit '{digit}' appears more frequently than natural laws suggest (Benford's Law anomaly).",
            "vendor_spike": "Vendor {vendor} has shown a sudden spike in transaction volume ({count} transactions recently).",
            "collusion_risk": "Network analysis suggests {vendor} shares suspicious links with {dept}.",
            "generic_fraud": "Multiple risk vectors detected including {reasons}."
        }

    def generate_narrative(self, transaction: dict, df = None) -> str:
        """
        Generate a natural language explanation for a standard transaction dict.
        """
        reasons = transaction.get('reasons', [])
        amount = transaction.get('amount', 0)
        vendor = transaction.get('vendor_id', 'Unknown Vendor')
        dept = transaction.get('department_id', 'Unknown Dept')
            
        # 1. AI-Powered Generation
        if self.ai_enabled:
            # Construct a rich context prompt
            risk_factors = ", ".join(reasons)
            prompt = f"""
            Act as a Senior Forensic Accountant. Explain why this transaction is suspicious in 1-2 professional sentences for a non-technical auditor.
            
            Transaction Details:
            - Vendor: {vendor}
            - Department: {dept}
            - Amount: ₹{amount}
            - Risk Flags: {risk_factors}
            - Fraud Score: {transaction.get('risk_score', 0)}
            
            Explanation:
            """
            try:
                response = self.model.generate_content(prompt)
                return response.text.replace("\n", " ").strip()
            except Exception as e:
                print(f"GenAI Narrative Error: {e} - Falling back to templates.")
        
        # 2. Template Fallback (Legacy Logic)
        score = transaction.get('risk_score', 0)
        if score > 0.8:
            return f"CRITICAL ALERT: High-confidence anomaly detected for {vendor} due to {', '.join(reasons)}."
        elif score > 0.5:
            return f"Suspicious activity flagged for {vendor}. Factors: {', '.join(reasons)}."
        else:
            return "Routine transaction. No significant anomalies detected."
