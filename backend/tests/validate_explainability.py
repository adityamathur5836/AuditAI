import json
import os

def validate_explainer(alerts_path, n=5):
    with open(alerts_path, 'r') as f:
        alerts = json.load(f)
    
    print(f"Validating {n} samples from {len(alerts)} alerts...\n")
    
    for i in range(min(n, len(alerts))):
        a = alerts[i]
        print(f"Alert ID: {a['transaction_id']} | Type: {a['type']} | Score: {a['risk_score']:.2f}")
        print(f"Narrative: {a['explanation']}")
        
        # Cross-validation checks
        if a['type'] == 'STAT_OUTLIER':
            assert "significantly higher" in a['explanation'], "Narrative mismatch for STAT_OUTLIER"
            assert "$" in a['explanation'], "Amount missing in STAT_OUTLIER narrative"
        
        if a['type'] == 'HIGH_FREQUENCY':
            assert "accelerated payout pattern" in a['explanation'], "Narrative mismatch for HIGH_FREQUENCY"
        
        if a['type'] == 'OFF_HOURS':
            assert "outside standard operational windows" in a['explanation'], "Narrative mismatch for OFF_HOURS"

        print("-" * 30)

    print("\nExplainability Validation PASSED.")

if __name__ == "__main__":
    validate_explainer('data/alerts_large.json')
