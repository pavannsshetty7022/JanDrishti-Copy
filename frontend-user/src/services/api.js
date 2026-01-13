const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const handleResponse = async (response) => {
    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            // Token expired or invalid - clear local storage and redirect
            localStorage.removeItem('janDrishtiUser');
            // We use window.location.href for a hard redirect to ensure state is cleared
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login?expired=true';
            }
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    return response.json();
};

const api = {
    get: async (endpoint, token) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return handleResponse(response);
    },

    post: async (endpoint, body, token, isFormData = false) => {
        const headers = {
            'Authorization': `Bearer ${token}`
        };

        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: isFormData ? body : JSON.stringify(body)
        });
        return handleResponse(response);
    },

    put: async (endpoint, body, token, isFormData = false) => {
        const headers = {
            'Authorization': `Bearer ${token}`
        };

        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers,
            body: isFormData ? body : JSON.stringify(body)
        });
        return handleResponse(response);
    },

    delete: async (endpoint, token) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return handleResponse(response);
    }
};

export default api;
