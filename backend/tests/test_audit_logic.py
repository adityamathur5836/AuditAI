import sys
import os
import json
import unittest
from datetime import datetime

# Add parent directory to path to import AuditEngine
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from engine import AuditEngine

class TestAuditLogic(unittest.TestCase):
    def setUp(self):
        # Create a small controlled test dataset
        self.test_data_path = "test_transactions.csv"
        with open(self.test_data_path, "w") as f:
            f.write("transaction_id,timestamp,department_id,vendor_id,vendor_category,amount,payment_method,description,approver_id,budget_code\n")
            # 1. Normal Transactions
            f.write("TX-NORM-01,2025-11-01T10:00:00,DEP-HEALTH,VEN-OFFICE-01,Supplies,100.0,Bank Transfer,Normal Supplies,A-01,B-101\n")
            f.write("TX-NORM-02,2025-11-02T10:00:00,DEP-HEALTH,VEN-OFFICE-01,Supplies,105.0,Bank Transfer,Normal Supplies,A-01,B-101\n")
            f.write("TX-NORM-03,2025-11-03T10:00:00,DEP-HEALTH,VEN-OFFICE-01,Supplies,98.0,Bank Transfer,Normal Supplies,A-01,B-101\n")
            
            # 2. Duplicate Anomaly (TX-DUP-01 and TX-DUP-02)
            f.write("TX-DUP-01,2025-11-04T10:00:00,DEP-HEALTH,VEN-OFFICE-02,Supplies,150.0,Bank Transfer,Duplicate 1,A-02,B-102\n")
            f.write("TX-DUP-02,2025-11-04T11:00:00,DEP-HEALTH,VEN-OFFICE-02,Supplies,150.0,Bank Transfer,Duplicate 2,A-02,B-102\n")
            
            # 3. Off-Hours Anomaly (TX-OFF-01 - 2 AM)
            f.write("TX-OFF-01,2025-11-05T02:00:00,DEP-POLICE,VEN-TECH-01,IT,500.0,Credit Card,Late Night IT,A-03,B-103\n")
            
            # 4. Amount Spike Anomaly (TX-SPIKE-01 - 5000 is much higher than mean of ~100)
            f.write("TX-SPIKE-01,2025-11-06T10:00:00,DEP-HEALTH,VEN-OFFICE-01,Supplies,5000.0,Bank Transfer,Spike Transaction,A-01,B-104\n")
            
            # 5. Frequency Anomaly (TX-FREQ-01, 02, 03 to same vendor same dept in < 48h)
            f.write("TX-FREQ-01,2025-11-07T10:00:00,DEP-EDU,VEN-PROF-01,Consulting,500.0,Bank Transfer,Freq 1,A-04,B-105\n")
            f.write("TX-FREQ-02,2025-11-07T14:00:00,DEP-EDU,VEN-PROF-01,Consulting,600.0,Bank Transfer,Freq 2,A-04,B-105\n")
            f.write("TX-FREQ-03,2025-11-08T09:00:00,DEP-EDU,VEN-PROF-01,Consulting,550.0,Bank Transfer,Freq 3,A-04,B-105\n")

        self.engine = AuditEngine(self.test_data_path)

    def tearDown(self):
        if os.path.exists(self.test_data_path):
            os.remove(self.test_data_path)

    def test_duplicate_detection(self):
        alerts = self.engine.run()
        dup_alerts = [a for a in alerts if a['type'] == 'DUPLICATE' and a['transaction_id'] == 'TX-DUP-02']
        self.assertTrue(len(dup_alerts) > 0, "Duplicate transaction TX-DUP-02 was not flagged.")
        self.assertIn("Identical payment of $150.00", dup_alerts[0]['explanation'])

    def test_off_hours_detection(self):
        alerts = self.engine.run()
        off_alerts = [a for a in alerts if a['type'] == 'OFF_HOURS' and a['transaction_id'] == 'TX-OFF-01']
        self.assertTrue(len(off_alerts) > 0, "Off-hours transaction TX-OFF-01 was not flagged.")
        self.assertIn("initiated at 02:00", off_alerts[0]['explanation'])

    def test_amount_spike_detection(self):
        alerts = self.engine.run()
        spike_alerts = [a for a in alerts if a['type'] == 'STAT_OUTLIER' and a['transaction_id'] == 'TX-SPIKE-01']
        self.assertTrue(len(spike_alerts) > 0, "Amount spike TX-SPIKE-01 was not flagged.")
        self.assertIn("significantly higher", spike_alerts[0]['explanation'])

    def test_frequency_detection(self):
        alerts = self.engine.run()
        freq_alerts = [a for a in alerts if a['type'] == 'HIGH_FREQUENCY' and a['transaction_id'] == 'TX-FREQ-01']
        self.assertTrue(len(freq_alerts) > 0, "High frequency transaction group starting at TX-FREQ-01 was not flagged.")
        self.assertIn("indicating an accelerated payout pattern", freq_alerts[0]['explanation'])

if __name__ == "__main__":
    unittest.main()
