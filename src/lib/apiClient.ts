export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787/api';

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;

    // Include credentials for cookies
    const config: RequestInit = {
        ...options,
        credentials: 'include',
    };

    // If payload is JSON
    if (options.body && typeof options.body === 'string') {
        config.headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };
    }

    const response = await fetch(url, config);

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `API Error: ${response.status}`);
    }

    return response.json();
};
