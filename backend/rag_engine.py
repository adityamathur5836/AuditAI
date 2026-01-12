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
            
        # Configure Gemini
        import os
        import google.generativeai as genai
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            try:
                genai.configure(api_key=api_key)
                self.model = genai.GenerativeModel('gemini-1.5-flash')
                self.ai_enabled = True
            except Exception as e:
                print(f"Failed to config GenAI: {e}")
                self.ai_enabled = False
        else:
            self.ai_enabled = False
            print("⚠️ GEMINI_API_KEY not found. Policy Chat will use basic retrieval.")

    def search(self, query: str, top_k: int = 3) -> dict:
        """
        Retrieve context and answer using GenAI.
        """
        if not self.chunks or self.tfidf_matrix is None:
            return {"answer": "I don't have enough policy data to answer that.", "context": []}

        # 1. Retrieval (TF-IDF)
        query_vec = self.vectorizer.transform([query])
        similarities = cosine_similarity(query_vec, self.tfidf_matrix).flatten()
        top_indices = similarities.argsort()[-top_k:][::-1]
        
        relevant_chunks = [self.chunks[i] for i in top_indices if similarities[i] > 0.1]
        context_str = "\n\n".join(relevant_chunks)
        
        if not relevant_chunks:
            return {"answer": "I couldn't find any specific policy regarding that.", "context": []}

        # 2. Augmented Generation (Gemini)
        if self.ai_enabled:
            try:
                prompt = f"""
                You are an expert Government Audit Consultant. Answer the following question strictly based on the provided Policy Context.
                
                Policy Context:
                {context_str}
                
                Question: {query}
                
                Answer (keep it professional, concise, and cite the specific section/rule numbers):
                """
                response = self.model.generate_content(prompt)
                return {
                    "answer": response.text,
                    "context": relevant_chunks
                }
            except Exception as e:
                import traceback
                print(f"GenAI Error: {e}")
                print(traceback.format_exc())
                return {
                    "answer": "I found relevant policies but couldn't generate a summary. See context below.",
                    "context": relevant_chunks
                }
        else:
            # Fallback
            return {
                "answer": "Here are the relevant policy sections I found:",
                "context": relevant_chunks
            }

    def ask(self, question: str) -> dict:
        return self.search(question)
