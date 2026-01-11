from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Mock Policy Document - Expanded and Structured
POLICY_TEXT = """
Section 1: Procurement Financial Limits & Approvals
1.1. Standard Departmental Limit: Department A has a single transaction discretionary limit of ₹5,00,000 (5 Lakhs). Any amount exceeding this requires pre-approval from the Finance Controller.
1.2. Infrastructure Projects: Department B (Infrastructure) has an enhanced limit of ₹25,00,000 (25 Lakhs) due to the nature of heavy machinery costs.
1.3. Petty Cash: Small discretionary spending is lawfully capped at ₹10,000 per week per designated officer.
1.4. Review Thresholds: Any procurement exceeding ₹50 Lakhs must undergo a compulsory competitive bidding process (e-Tender).

Section 2: Vendor Management & Compliance
2.1. Registration Requirements: All government vendors must possess a valid GSTIN and Tax ID registered for at least 3 fiscal years.
2.2. Blacklisting Protocols: Vendors flagged for 'High Risk' or past violations cannot receive new contracts until cleared by an external audit committee.
2.3. Emergency Procurement: Procurement from unregistered vendors is permitted ONLY during declared natural disasters or state emergencies, capped strictly at ₹1 Lakh per instance.
2.4. Conflict of Interest: Vendors sharing the same physical address, phone number, or bank details as a Department Officer constitute a Class A Violation and will be immediately blocked.

Section 3: Transaction Timing & Cut-offs
3.1. Standard Operating Windows: Financial transactions should be digitally processed between 9:00 AM and 6:00 PM on weekdays (Monday-Friday).
3.2. Weekend Prohibitions: Transactions executed on weekends (Saturday/Sunday) are strictly prohibited unless pre-authorized for emergency services (Hospital/Police/Fire).
3.3. Fiscal Year End: End-of-year bulk processing (March 25th - March 31st) requires a special oversight committee to prevent "budget dumping."

Section 4: Anti-Fraud & Audit Handling
4.1. Structuring/Smurfing: Splitting a large transaction into smaller amounts (e.g., four transactions of ₹4.9L) to bypass the ₹5L approval limit is a punishable offense under Anti-Corruption laws.
4.2. Invoice Numbering: Vendor invoice numbers must follow a sequential or logical pattern. Round numbers (e.g. ₹50,000.00 exactly) are subject to 100% automated system audit.
4.3. Benford's Law: The system automatically flags datasets that deviate from Benford's Law distribution as potential fabrication.
"""

class RagEngine:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words='english')
        # Split by double newline to keep sections together
        self.chunks = [p.strip() for p in POLICY_TEXT.split('\n\n') if p.strip()]
        
        if self.chunks:
            self.tfidf_matrix = self.vectorizer.fit_transform(self.chunks)
        else:
            self.tfidf_matrix = None

    def search(self, query: str, top_k: int = 3) -> list:
        """
        Retrieve top_k most relevant policy chunks for the query.
        """
        if not self.chunks or self.tfidf_matrix is None:
            return []

        query_vec = self.vectorizer.transform([query])
        
        # Calculate cosine similarity
        similarities = cosine_similarity(query_vec, self.tfidf_matrix).flatten()
        
        # Get top indices
        top_indices = similarities.argsort()[-top_k:][::-1]
        
        results = []
        for idx in top_indices:
            if similarities[idx] > 0.1: # Threshold for relevance
                results.append({
                    "text": self.chunks[idx],
                    "score": float(similarities[idx])
                })
        
        return results

    def ask(self, query: str) -> dict:
        """
        Simulate an LLM answer by retrieving context and formatting it.
        """
        results = self.search(query)
        if not results:
            return {
                "answer": "I couldn't find any specific policy details regarding your query in the handbook.",
                "context": []
            }
        
        # Construct a "synthesized" answer
        best_match = results[0]['text']
        
        # Heuristic: If we found a good match, format it nicely.
        # Clean up the newlines for the 'answer' part so it looks like a paragraph
        clean_text = best_match.replace('\n', ' ')
        
        return {
            "answer": f"Based on internal regulations: {clean_text}",
            "context": results
        }
