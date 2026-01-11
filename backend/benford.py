import numpy as np
from scipy.stats import chisquare
from typing import List, Dict, Any

class BenfordAnalyzer:
    def __init__(self):
        # Benford's Law Expected Frequencies for First Digit (1-9)
        # P(d) = log10(1 + 1/d)
        self.BENFORD_PROBS = {
            1: 0.301, 2: 0.176, 3: 0.125, 4: 0.097, 
            5: 0.079, 6: 0.067, 7: 0.058, 8: 0.051, 9: 0.046
        }

    def analyze(self, amounts: List[float]) -> Dict[str, Any]:
        """
        Analyze a list of transaction amounts against Benford's Law.
        Returns expected vs actual frequencies and statistical validity.
        """
        if not amounts or len(amounts) < 50:
            return {"valid": False, "error": "Insufficient data (need > 50 transactions)"}
            
        # Extract first digits
        first_digits = []
        for amt in amounts:
            try:
                s = str(abs(float(amt)))
                # Handles 0.005 -> 5, 500 -> 5
                s = s.replace('.', '').lstrip('0')
                if s:
                    first_digits.append(int(s[0]))
            except:
                continue
                
        total = len(first_digits)
        if total == 0:
             return {"valid": False, "error": "No valid numeric amounts"}
             
        # Calculate Observed Frequencies
        observed_counts = {d: first_digits.count(d) for d in range(1, 10)}
        observed_freqs = {d: c / total for d, c in observed_counts.items()}
        
        # Calculate Expected Counts (for Chi-Square)
        expected_counts = [total * self.BENFORD_PROBS[d] for d in range(1, 10)]
        observed_counts_list = [observed_counts[d] for d in range(1, 10)]
        
        # Chi-Square Test
        # Null hypothesis: Data follows Benford's Law
        # If p-value < 0.05, we reject null hypothesis -> Anomalous
        chi2_stat, p_value = chisquare(observed_counts_list, f_exp=expected_counts)
        
        is_anomaly = bool(p_value < 0.05)
        
        return {
            "valid": True,
            "total_transactions": total,
            "distribution": [
                {
                    "digit": d,
                    "actual": round(observed_freqs[d] * 100, 2),
                    "expected": round(self.BENFORD_PROBS[d] * 100, 2),
                    "count": observed_counts[d]
                }
                for d in range(1, 10)
            ],
            "stats": {
                "chi_square": float(round(chi2_stat, 2)),
                "p_value": float(round(p_value, 4)),
                "is_anomalous": is_anomaly,
                "conclusion": "Suspicious (High Deviation)" if is_anomaly else "Natural (Follows Benford's Law)"
            }
        }
