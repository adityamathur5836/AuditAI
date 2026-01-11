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
export async function fetchAlerts(limit = 1000, minScore = 0.0) {
    try {
        const response = await fetch(`${API_BASE}/api/alerts?limit=${limit}&min_score=${minScore}`, {
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
export async function fetchNetworkGraph() {
    const response = await fetch(`${API_BASE}/api/network/graph`, { headers: getAuthHeaders() });
    if (!response.ok) return null;
    return await response.json();
}

/**
 * Fetch Benford's Law Stats
 */
export async function fetchBenfordStats() {
    const response = await fetch(`${API_BASE}/api/stats/benford`, { headers: getAuthHeaders() });
    if (!response.ok) return null;
    return await response.json();
}
