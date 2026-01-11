import networkx as nx
import pandas as pd
from typing import Dict, List, Any

class NetworkEngine:
    def __init__(self):
        self.graph = nx.Graph()
        
    def build_graph(self, transactions: List[Dict[str, Any]]):
        """
        Build a NetworkX graph from transactions.
        Nodes: Vendors, Departments, Projects
        Edges: Transactions connecting them
        """
        self.graph.clear()
        
        for tx in transactions:
            vendor_id = tx.get('vendor_id')
            dept_id = tx.get('department_id')
            project_id = tx.get('project_id')
            amount = float(tx.get('amount', 0))
            
            if not vendor_id or not dept_id:
                continue
                
            # Add Nodes
            self.graph.add_node(vendor_id, type='vendor', risk_score=tx.get('risk_score', 0))
            self.graph.add_node(dept_id, type='department')
            
            if project_id:
                self.graph.add_node(project_id, type='project')
                # Edge: Vendor -> Project
                if self.graph.has_edge(vendor_id, project_id):
                    self.graph[vendor_id][project_id]['weight'] += amount
                    self.graph[vendor_id][project_id]['count'] += 1
                else:
                    self.graph.add_edge(vendor_id, project_id, weight=amount, count=1, type='contract')
                
                # Edge: Project -> Department
                if not self.graph.has_edge(project_id, dept_id):
                    self.graph.add_edge(project_id, dept_id, type='belongs_to')
            else:
                # Direct Vendor -> Department edge if no project
                if self.graph.has_edge(vendor_id, dept_id):
                    self.graph[vendor_id][dept_id]['weight'] += amount
                    self.graph[vendor_id][dept_id]['count'] += 1
                else:
                    self.graph.add_edge(vendor_id, dept_id, weight=amount, count=1, type='direct_payment')

    def get_graph_data(self):
        """
        Return graph data in format suitable for react-force-graph
        {
          "nodes": [{"id": "...", "group": 1}],
          "links": [{"source": "...", "target": "...", "value": ...}]
        }
        """
        nodes = []
        for node, attrs in self.graph.nodes(data=True):
            group = 1 if attrs.get('type') == 'vendor' else 2
            if attrs.get('type') == 'project': group = 3
            
            # Color logic based on risk for vendors
            val = 5
            if attrs.get('type') == 'vendor':
                val = 10
            
            nodes.append({
                "id": node,
                "group": group,
                "type": attrs.get('type'),
                "val": val, 
                "risk": attrs.get('risk_score', 0)
            })
            
        links = []
        for u, v, attrs in self.graph.edges(data=True):
            links.append({
                "source": u,
                "target": v,
                "value": attrs.get('count', 1),
                "amount": attrs.get('weight', 0)
            })
            
        return {"nodes": nodes, "links": links}

    def detect_communities(self):
        """Detect clusters (potential collusion rings)"""
        if not self.graph:
            return {}
            
        try:
            # simple greedy modularity communities
            communities = nx.community.greedy_modularity_communities(self.graph)
            result = {}
            for idx, c in enumerate(communities):
                for node in c:
                    result[node] = idx
            return result
        except:
            return {}
