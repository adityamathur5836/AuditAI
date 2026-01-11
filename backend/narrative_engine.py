import pandas as pd
import random

class NarrativeEngine:
    def __init__(self):
        self.templates = {
            "critical_high_amount": "This transaction of ₹{amount} is significantly higher than the average for {dept}. Coupled with {risk_factors}, this requires immediate investigation.",
            "weekend_activity": "Unusual activity detected on a {day}. Corporate spending is rarely processed on weekends.",
            "round_amount": "The amount ₹{amount} is a round number, which is statistically improbable for genuine invoices.",
            "benford_anomaly": "The leading digit '{digit}' appears more frequently than natural laws suggest (Benford's Law anomaly).",
            "vendor_spike": "Vendor {vendor} has shown a sudden spike in transaction volume ({count} transactions recently).",
            "collusion_risk": "Network analysis suggests {vendor} shares suspicious links with {dept}.",
            "generic_fraud": "Multiple risk vectors detected including {reasons}."
        }

    def generate_narrative(self, transaction: dict, df: pd.DataFrame = None) -> str:
        """
        Generate a natural language explanation for a standard transaction dict.
        df: Optional full dataframe to calculate context (averages, counts).
        """
        reasons = transaction.get('reasons', [])
        amount = transaction.get('amount', 0)
        vendor = transaction.get('vendor_id', 'Unknown Vendor')
        dept = transaction.get('department_id', 'Unknown Dept')
            
        narrative_parts = []
        
        # 1. Severity Intro
        score = transaction.get('risk_score', 0)
        if score > 0.8:
            narrative_parts.append(f"CRITICAL ALERT: High-confidence anomaly detected for {vendor}.")
        elif score > 0.5:
            narrative_parts.append(f"Suspicious activity flagged for {vendor}.")
        else:
            return "Routine transaction. No significant anomalies detected."

        # 2. Contextual Analysis (if DF provided)
        if df is not None and not df.empty:
            # Vendor Context
            vendor_txs = df[df['vendor_id'] == vendor]
            vendor_count = len(vendor_txs)
            
            # Dept Context
            dept_txs = df[df['department_id'] == dept]
            if not dept_txs.empty:
                avg_amt = dept_txs['amount'].mean()
                if amount > avg_amt * 2:
                    narrative_parts.append(f"The transaction value (₹{amount:,.2f}) is {amount/avg_amt:.1f}x higher than the {dept} average (₹{avg_amt:,.2f}).")
            
            if vendor_count > 1:
                narrative_parts.append(f"This vendor has {vendor_count} transactions in the current batch.")

        # 3. Specific Reason Expansion
        for reason in reasons:
            if "weekend" in reason.lower():
                narrative_parts.append("The timestamp indicates processing outside standard business hours (Weekend/Night).")
            elif "round" in reason.lower():
                narrative_parts.append("The round invoice amount is suspicious and warrants invoice verification.")
            elif "benford" in reason.lower() or "statistical" in reason.lower():
                narrative_parts.append("Statistical tests indicate the amount may be fabricated (Benford's Law violation).")
            elif "graph" in reason.lower():
                narrative_parts.append("Graph analysis links this vendor to other high-risk entities.")
        
        # 4. Conclusion
        narrative_parts.append("Recommended Action: Audit invoice content and verify vendor contract terms.")
        
        return " ".join(narrative_parts)
