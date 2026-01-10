import csv
import json
import os
from datetime import datetime
from collections import defaultdict
import math

class AuditEngine:
    def __init__(self, data_path, feedback_path='data/auditor_feedback.json'):
        self.data_path = data_path
        self.feedback_path = feedback_path
        self.transactions = []
        self.feedback = []
        self.load_data()
        self.load_feedback()

    def load_data(self):
        with open(self.data_path, mode='r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    row['amount'] = float(row['amount'])
                    self.transactions.append(row)
                except (ValueError, TypeError):
                    continue

    def load_feedback(self):
        if os.path.exists(self.feedback_path):
            with open(self.feedback_path, 'r') as f:
                self.feedback = json.load(f)

    def submit_feedback(self, transaction_id, action, reason):
        """Auditor feedback submission"""
        entry = {
            "transaction_id": transaction_id,
            "action": action, # 'escalate', 'dismiss'
            "reason": reason,
            "timestamp": datetime.now().isoformat()
        }
        self.feedback.append(entry)
        with open(self.feedback_path, 'w') as f:
            json.dump(self.feedback, f, indent=2)
        print(f"Feedback logged for {transaction_id}: {action}")

    def get_feedback_adjustments(self):
        """Calculate score adjustments based on historical feedback"""
        adjustments = defaultdict(float)
        # 1. Vendor dismissal count
        vendor_dismissals = defaultdict(int)
        vendor_escalations = defaultdict(int)
        
        for f in self.feedback:
            # Find vendor for this tx
            tx = next((t for t in self.transactions if t['transaction_id'] == f['transaction_id']), None)
            if tx:
                v_id = tx['vendor_id']
                if f['action'] == 'dismiss':
                    vendor_dismissals[v_id] += 1
                elif f['action'] == 'escalate':
                    vendor_escalations[v_id] += 1
        
        # Logic: If dismissed 3+ times, reduce score by 0.15
        for v, count in vendor_dismissals.items():
            if count >= 3:
                adjustments[v] -= 0.15
        
        # Logic: If escalated even once, increase score baseline by 0.1
        for v, count in vendor_escalations.items():
            if count >= 1:
                adjustments[v] += 0.1
                
        return adjustments

    def get_rules_signals(self):
        signals = defaultdict(list)
        
        seen = {}
        for tx in self.transactions:
            key = f"{tx['vendor_id']}|{tx['department_id']}|{tx['amount']}"
            if key in seen:
                prev_tx = seen[key]
                t1 = datetime.fromisoformat(tx['timestamp'])
                t2 = datetime.fromisoformat(prev_tx['timestamp'])
                if abs((t1 - t2).total_seconds()) < 86400:
                    signals[tx['transaction_id']].append({
                        "type": "DUPLICATE", 
                        "score": 0.9, 
                        "desc": f"Identical payment of ₹{tx['amount']:,.2f} detected for {tx['vendor_id']} within 24h. Matches previous transaction {prev_tx['transaction_id']}."
                    })
            seen[key] = tx

        for tx in self.transactions:
            dt = datetime.fromisoformat(tx['timestamp'])
            if dt.hour < 6 or dt.hour > 22 or dt.weekday() >= 5:
                day_name = dt.strftime('%A')
                time_str = dt.strftime('%H:%M')
                signals[tx['transaction_id']].append({
                    "type": "OFF_HOURS", 
                    "score": 0.7, 
                    "desc": f"Transaction initiated at {time_str} on a {day_name}, which is outside standard operational windows."
                })

        return signals

    def get_probabilistic_signals(self):
        signals = defaultdict(list)
        
        cat_map = defaultdict(list)
        for tx in self.transactions:
            cat_map[tx['vendor_category']].append(tx['amount'])
        
        cat_stats = {}
        for cat, amounts in cat_map.items():
            avg = sum(amounts) / len(amounts)
            std = math.sqrt(sum((x - avg)**2 for x in amounts) / len(amounts)) if len(amounts) > 1 else 0
            cat_stats[cat] = {"avg": avg, "std": std}

        for tx in self.transactions:
            stats = cat_stats[tx['vendor_category']]
            if stats['std'] > 0:
                z = abs(tx['amount'] - stats['avg']) / stats['std']
                if z > 2.0:
                    score = min(0.95, 0.4 + (z/10))
                    signals[tx['transaction_id']].append({
                        "type": "STAT_OUTLIER", 
                        "score": score, 
                        "desc": f"Transaction amount (₹{tx['amount']:,.2f}) is significantly higher ({z:.1f}x deviation) than the category average (₹{stats['avg']:,.2f})."
                    })

        vendor_dept_history = defaultdict(list)
        for tx in self.transactions:
            vendor_dept_history[(tx['vendor_id'], tx['department_id'])].append(tx)
        
        for (v, d), txs in vendor_dept_history.items():
            txs.sort(key=lambda x: x['timestamp'])
            for i in range(len(txs)):
                count = 1
                t_start = datetime.fromisoformat(txs[i]['timestamp'])
                for j in range(i + 1, len(txs)):
                    t_curr = datetime.fromisoformat(txs[j]['timestamp'])
                    if (t_curr - t_start).total_seconds() < 172800: # 48h
                        count += 1
                if count >= 3:
                    signals[txs[i]['transaction_id']].append({
                        "type": "HIGH_FREQUENCY", 
                        "score": 0.8, 
                        "desc": f"Vendor {v} received {count} payments within a 48-hour window, indicating an accelerated payout pattern."
                    })

        # IMPROVEMENT 3: Project Contract Splitting Detection
        project_history = defaultdict(list)
        for tx in self.transactions:
            if tx.get('project_id'):
                project_history[tx['project_id']].append(tx)
        
        for pid, txs in project_history.items():
            txs.sort(key=lambda x: x['timestamp'])
            # Check for multiple payments in short duration (Contract Splitting)
            for i in range(len(txs)):
                count = 1
                t_start = datetime.fromisoformat(txs[i]['timestamp'])
                amount_sum = float(txs[i]['amount'])
                
                for j in range(i + 1, len(txs)):
                    t_curr = datetime.fromisoformat(txs[j]['timestamp'])
                    if (t_curr - t_start).total_seconds() < 604800: # 7 days
                        count += 1
                        amount_sum += float(txs[j]['amount'])
                
                if count >= 4 and amount_sum < 2000000: # Many small payments < 20 Lakh
                   signals[txs[i]['transaction_id']].append({
                        "type": "CONTRACT_SPLIT", 
                        "score": 0.85, 
                        "desc": f"Project {pid} flagged for potential contract splitting: {count} transactions appearing under ₹20L threshold within 7 days."
                    })

        return signals

    def calculate_composite_score(self, rules, prob):
        final_alerts = []
        adjustments = self.get_feedback_adjustments()
        now = datetime.now()
        
        for tx in self.transactions:
            tx_id = tx['transaction_id']
            v_id = tx['vendor_id']
            r_sigs = rules.get(tx_id, [])
            p_sigs = prob.get(tx_id, [])
            
            if not r_sigs and not p_sigs:
                continue

            max_rule_score = max([s['score'] for s in r_sigs]) if r_sigs else 0
            max_prob_score = max([s['score'] for s in p_sigs]) if p_sigs else 0
            
            if max_rule_score > 0:
                final_score = (max_rule_score * 0.7 + max_prob_score * 0.3)
            else:
                final_score = max_prob_score * 0.85
            
            # Inject slight variance to prevent flat scores (User Request)
            import random
            variance = random.uniform(-0.03, 0.03)
            final_score += variance
            
            # Apply Human Feedback Adjustment
            adjustment = adjustments.get(v_id, 0)
            final_score = max(0.01, min(1.0, final_score + adjustment))
            
            reasons = [s['desc'] for s in r_sigs + p_sigs]
            if adjustment != 0:
                reasons.append(f"Score adjusted by {adjustment:+.2f} based on historical auditor feedback for {v_id}.")
            
            # Pre-payment Guard Check (Transaction in last 60 minutes)
            try:
                tx_time = datetime.fromisoformat(tx['timestamp'])
                is_pre_payment = (now - tx_time).total_seconds() < 3600
            except:
                is_pre_payment = False

            final_alerts.append({
                "transaction_id": tx_id,
                "risk_score": final_score,
                "type": r_sigs[0]['type'] if r_sigs else p_sigs[0]['type'],
                "explanation": " ".join(reasons),
                "timestamp": tx['timestamp'],
                "department": tx['department_id'],
                "vendor": tx['vendor_id'],
                "amount": tx['amount'],
                "is_pre_payment": is_pre_payment,
                "evidence": [tx_id]
            })
        
        return sorted(final_alerts, key=lambda x: x['risk_score'], reverse=True)

    def run(self):
        rules = self.get_rules_signals()
        prob = self.get_probabilistic_signals()
        return self.calculate_composite_score(rules, prob)

if __name__ == "__main__":
    import sys
    input_f = sys.argv[1] if len(sys.argv) > 1 else 'data/transactions_cleaned.csv'
    output_f = sys.argv[2] if len(sys.argv) > 2 else '../frontend/src/alerts.json'

    engine = AuditEngine(input_f)
    results = engine.run()
    
    with open(output_f, "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"Engine processed {len(engine.transactions)} transactions.")
    print(f"Generated {len(results)} risk alerts with enhanced explainability.")
