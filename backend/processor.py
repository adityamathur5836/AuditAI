import csv
import json
import logging
from datetime import datetime
import os

# Configure logging for auditability
LOG_FILE = 'data/processing_audit.log'
os.makedirs('data', exist_ok=True)
logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def levenshtein_distance(s1, s2):
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)
    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    return previous_row[-1]

def fuzzy_match(s1, s2, threshold=0.6):
    s1 = s1.lower().strip()
    s2 = s2.lower().strip()
    
    # Check for direct inclusion first (common in vendor aliases)
    if s1 in s2 or s2 in s1:
        return True
        
    max_len = max(len(s1), len(s2))
    if max_len == 0: return 1.0
    distance = levenshtein_distance(s1, s2)
    similarity = 1 - (distance / max_len)
    return similarity >= threshold

class DataProcessor:
    def __init__(self, input_path, output_path):
        self.input_path = input_path
        self.output_path = output_path
        self.data = []
        self.vendor_map = {} # canonical name mapping

    def log_transformation(self, tx_id, field, original, new, reason):
        msg = f"TX: {tx_id} | Field: {field} | Original: '{original}' -> New: '{new}' | Reason: {reason}"
        logging.info(msg)

    def parse_date(self, date_str):
        formats = [
            "%Y-%m-%dT%H:%M:%S",
            "%Y-%m-%d %H:%M:%S",
            "%m/%d/%Y %H:%M",
            "%Y/%m/%d %H:%M:%S"
        ]
        for fmt in formats:
            try:
                return datetime.strptime(date_str, fmt).isoformat()
            except ValueError:
                continue
        return date_str # Return as-is if no format matches

    def process(self):
        raw_data = []
        with open(self.input_path, mode='r') as f:
            reader = csv.DictReader(f)
            raw_data = [row for row in reader]

        # First pass: Cleaning and Canonical Entity Extraction
        for row in raw_data:
            tx_id = row['transaction_id']
            
            # 1. Standardise Amount
            original_amount = row['amount']
            try:
                row['amount'] = float(original_amount)
            except ValueError:
                row['amount'] = 0.0
                self.log_transformation(tx_id, 'amount', original_amount, 0.0, "Invalid numeric format")

            # 2. Standardise Date
            original_date = row['timestamp']
            cleaned_date = self.parse_date(original_date)
            if cleaned_date != original_date:
                row['timestamp'] = cleaned_date
                self.log_transformation(tx_id, 'timestamp', original_date, cleaned_date, "Date format standardisation")

            # 3. Handle Missing Values
            for field in ['vendor_id', 'department_id', 'vendor_category', 'approver_id', 'budget_code']:
                if not row[field] or row[field].strip() == '':
                    old_val = row[field]
                    row[field] = "UNKNOWN"
                    self.log_transformation(tx_id, field, old_val, "UNKNOWN", "Missing value replacement")

        # Second pass: Entity Linking (Identity Resolution)
        unique_vendors = list(set(row['vendor_id'] for row in raw_data if row['vendor_id'] != "UNKNOWN"))
        canonical_vendors = {} # Original Name -> Canonical Name

        for v in unique_vendors:
            matched = False
            for canon in canonical_vendors.keys():
                if fuzzy_match(v, canon):
                    canonical_vendors[v] = canon # Link to existing canonical name
                    matched = True
                    break
            if not matched:
                canonical_vendors[v] = v # This is a new canonical entity

        # Third pass: Apply Entity Linking
        for row in raw_data:
            tx_id = row['transaction_id']
            v_id = row['vendor_id']
            if v_id in canonical_vendors and canonical_vendors[v_id] != v_id:
                row['vendor_id_original'] = v_id
                row['vendor_id'] = canonical_vendors[v_id]
                self.log_transformation(tx_id, 'vendor_id', v_id, canonical_vendors[v_id], "Entity linking / Alias resolution")

        self.data = raw_data
        self.save_data()

    def save_data(self):
        if not self.data: return
        # Ensure all rows have all keys for the DictWriter
        all_keys = set()
        for row in self.data:
            all_keys.update(row.keys())
        
        # Consistent order: original keys first, then new ones
        ordered_keys = ['transaction_id', 'timestamp', 'department_id', 'vendor_id', 'vendor_category', 'amount', 'payment_method', 'description', 'approver_id', 'budget_code', 'project_id']
        for k in all_keys:
            if k not in ordered_keys:
                ordered_keys.append(k)

        with open(self.output_path, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=ordered_keys)
            writer.writeheader()
            for row in self.data:
                # Fill missing keys for this specific row
                for k in ordered_keys:
                    if k not in row: row[k] = ""
                writer.writerow(row)
        print(f"Cleaned data saved to {self.output_path}")

if __name__ == "__main__":
    import sys
    input_f = sys.argv[1] if len(sys.argv) > 1 else 'data/transactions.csv'
    output_f = sys.argv[2] if len(sys.argv) > 2 else 'data/transactions_cleaned.csv'
    
    processor = DataProcessor(input_f, output_f)
    processor.process()
