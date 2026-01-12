/**
 * API utility functions for connecting to the AuditAI backend
 */

const API_BASE = 'http://localhost:8000';


// Helper to get auth header
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

/**
 * Login user
 */
export async function loginUser(email, password) {
    const formData = new FormData();
    formData.append('username', email); // OAuth2 expects username
    formData.append('password', password);

    const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) throw new Error('Invalid credentials');
    return await response.json();
}

/**
 * Register user
 */
export async function registerUser(email, password, fullName) {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName }),
    });

    if (!response.ok) throw new Error('Registration failed');
    return await response.json();
}

/**
 * Get current user details
 */
export async function fetchCurrentUser() {
    const response = await fetch(`${API_BASE}/api/users/me`, {
        headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error('Failed to fetch user');
    return await response.json();
}

/**
 * Fetch all fraud alerts from the API
 */
export async function fetchAlerts(limit = 1000, minScore = 0.0, sortBy = 'risk_score') {
    try {
        const response = await fetch(`${API_BASE}/api/alerts?limit=${limit}&min_score=${minScore}&sort_by=${sortBy}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch alerts');
        const data = await response.json();
        return data.alerts || [];
    } catch (error) {
        console.error('Error fetching alerts:', error);
        return [];
    }
}

/**
 * Fetch latest alerts (sorted by time) - Dedicated function to avoid caching issues
 */
export async function fetchLatestAlerts(limit = 20) {
    try {
        // Explicitly force sort_by=latest
        const url = `${API_BASE}/api/alerts?limit=${limit}&min_score=0.0&sort_by=latest&_t=${Date.now()}`;
        const response = await fetch(url, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch latest alerts');
        const data = await response.json();
        return data.alerts || [];
    } catch (error) {
        console.error('Error fetching latest alerts:', error);
        return [];
    }
}

/**
 * Fetch statistics from the API
 */
export async function fetchStats() {
    try {
        const response = await fetch(`${API_BASE}/api/stats`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch stats');
        return await response.json();
    } catch (error) {
        console.error('Error fetching stats:', error);
        return null;
    }
}

/**
 * Check API health status
 */
export async function checkHealth() {
    try {
        const response = await fetch(`${API_BASE}/api/health`);
        if (!response.ok) return { status: 'unhealthy', model_loaded: false };
        return await response.json();
    } catch (error) {
        console.error('API health check failed:', error);
        return { status: 'offline', model_loaded: false };
    }
}

/**
 * Upload CSV for fraud analysis
 */
export async function uploadCSV(file) {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE}/api/upload`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: formData,
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || 'Upload failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Error uploading CSV:', error);
        throw error;
    }
}

/**
 * Predict fraud for a single transaction
 */
export async function predictSingle(transaction) {
    try {
        const response = await fetch(`${API_BASE}/api/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify(transaction),
        });

        if (!response.ok) throw new Error('Prediction failed');
        return await response.json();
    } catch (error) {
        console.error('Error predicting:', error);
        throw error;
    }
}

/**
 * Update the status of an alert (e.g., 'review', 'escalate', 'resolved')
 */
export async function updateAlertStatus(transactionId, status) {
    try {
        const response = await fetch(`${API_BASE}/api/alerts/${transactionId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify({ status }),
        });

        if (!response.ok) throw new Error('Failed to update status');
        return await response.json();
    } catch (error) {
        console.error('Error updating alert status:', error);
        throw error;
    }
}

export default {
    fetchAlerts,
    fetchStats,
    checkHealth,
    uploadCSV,
    predictSingle,
    loginUser,
    registerUser,
    fetchCurrentUser,
    updateAlertStatus,
    updateAlertStatus,
    fetchNetworkGraph,
    fetchBenfordStats,
    API_BASE,
};

/**
 * Fetch Network Graph Data
 */
/**
 * Fetch Network Graph Data
 */
// export async function fetchNetworkGraph() {
//     try {
//         const response = await fetch(`${API_BASE}/api/network/graph`, { headers: getAuthHeaders() });
//         if (!response.ok) return { nodes: [], links: [] };
//         return await response.json();
//     } catch (e) {
//         console.error("Graph fetch error", e);
//         return { nodes: [], links: [] };
//     }
// }

/**
 * Fetch Benford's Law Stats
 */
// export async function fetchBenfordStats() {
//     const response = await fetch(`${API_BASE}/api/stats/benford`, { headers: getAuthHeaders() });
//     if (!response.ok) return null;
//     return await response.json();
// }

/**
 * Fetch Entity Risk Registry (Aggregated by Vendor)
 */
// Supports 'days' (int) OR { start, end } (object)
export async function fetchEntities(filter = null) {
    try {
        let url = `${API_BASE}/api/entities`;

        if (typeof filter === 'number') {
            url += `?days=${filter}`;
        } else if (filter && typeof filter === 'object') {
            const params = new URLSearchParams();
            if (filter.start) params.append('start_date', filter.start);
            if (filter.end) params.append('end_date', filter.end);
            url += `?${params.toString()}`;
        }

        const response = await fetch(url, { headers: getAuthHeaders() });
        if (!response.ok) throw new Error('Failed to fetch entities');
        return await response.json();
    } catch (error) {
        console.error('Error fetching entities:', error);
        return [];
    }
}

/**
 * Fetch Departmental Oversight Data
 */
export async function fetchDepartments() {
    try {
        const response = await fetch(`${API_BASE}/api/departments`, { headers: getAuthHeaders() });
        if (!response.ok) throw new Error('Failed to fetch departments');
        return await response.json();
    } catch (error) {
        console.error('Error fetching departments:', error);
        return [];
    }
}

/**
 * Fetch Network Graph Data
 */
export async function fetchNetworkGraph() {
    try {
        const response = await fetch(`${API_BASE}/api/network/graph`, { headers: getAuthHeaders() });
        if (!response.ok) throw new Error('Failed to fetch network graph');
        return await response.json();
    } catch (error) {
        console.error('Error fetching network graph:', error);
        return null;
    }
}

/**
 * Fetch Benford's Law Analysis
 */
export async function fetchBenfordStats() {
    try {
        const response = await fetch(`${API_BASE}/api/benford`, { headers: getAuthHeaders() });
        if (!response.ok) throw new Error('Failed to fetch Benford stats');
        return await response.json();
    } catch (error) {
        console.error('Error fetching Benford stats:', error);
        return null;
    }
}

/**
 * Fetch District Risk Heatmap
 */
export async function fetchDistrictRisk() {
    try {
        const response = await fetch(`${API_BASE}/api/risk/districts`, { headers: getAuthHeaders() });
        if (!response.ok) throw new Error('Failed to fetch district risk');
        return await response.json();
    } catch (error) {
        console.error('Error fetching district risk:', error);
        return [];
    }
}

/**
 * Fetch Department Risk Heatmap
 */
export async function fetchDepartmentRisk() {
    try {
        const response = await fetch(`${API_BASE}/api/risk/departments`, { headers: getAuthHeaders() });
        if (!response.ok) throw new Error('Failed to fetch department risk');
        return await response.json();
    } catch (error) {
        console.error('Error fetching department risk:', error);
        return [];
    }
}
