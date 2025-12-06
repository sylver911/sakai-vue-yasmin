// API Configuration and Base Setup
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiClient {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    getAuthToken() {
        return localStorage.getItem('access_token');
    }

    getRefreshToken() {
        return localStorage.getItem('refresh_token');
    }

    setTokens(access, refresh) {
        localStorage.setItem('access_token', access);
        if (refresh) {
            localStorage.setItem('refresh_token', refresh);
        }
    }

    clearTokens() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const token = this.getAuthToken();

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            if (response.status === 401 && this.getRefreshToken()) {
                const refreshed = await this.refreshAccessToken();
                if (refreshed) {
                    headers['Authorization'] = `Bearer ${this.getAuthToken()}`;
                    const retryResponse = await fetch(url, { ...options, headers });
                    return this.handleResponse(retryResponse);
                } else {
                    this.clearTokens();
                    window.location.href = '/auth/login';
                    throw new Error('Session expired');
                }
            }

            return this.handleResponse(response);
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async handleResponse(response) {
        if (response.status === 204) {
            return null;
        }

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            const error = new Error(data?.detail || data?.message || 'API Error');
            error.status = response.status;
            error.data = data;
            throw error;
        }

        return data;
    }

    async refreshAccessToken() {
        try {
            const response = await fetch(`${this.baseURL}/api/auth/refresh/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: this.getRefreshToken() }),
            });

            if (response.ok) {
                const data = await response.json();
                this.setTokens(data.access, data.refresh);
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }

    get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    }

    post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    patch(endpoint, data) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    async upload(endpoint, formData) {
        const token = this.getAuthToken();
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'POST',
            headers,
            body: formData,
        });

        return this.handleResponse(response);
    }
}

export const api = new ApiClient();
export default api;
