export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787/api';

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
        ...options,
    };

    const token = localStorage.getItem('auth_token');

    config.headers = {
        ...options.headers,
    } as HeadersInit;

    if (token) {
        (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    // If payload is JSON
    if (options.body && typeof options.body === 'string') {
        (config.headers as Record<string, string>)['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, config);

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `API Error: ${response.status}`);
    }

    return response.json();
};
