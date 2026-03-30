export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787/api';

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;

    const token = localStorage.getItem('auth_token');
    const headers = new Headers(options.headers || {});

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const isFormData = options.body instanceof FormData || (options.body && typeof (options.body as any).append === 'function');
    
    if (isFormData) {
        // We MUST NOT set Content-Type for FormData, the browser will add it with the specific form boundary.
        headers.delete('Content-Type');
    } else if (options.body && typeof options.body === 'string') {
        headers.set('Content-Type', 'application/json');
    }

    const config: RequestInit = {
        ...options,
        headers,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `API Error: ${response.status}`);
    }

    return response.json();
};
