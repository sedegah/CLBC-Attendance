export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787/api';

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;

    const token = localStorage.getItem('auth_token');
    const headers: Record<string, string> = {};

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Only set Content-Type for JSON string bodies.
    // For FormData, the browser MUST set Content-Type itself (with the multipart boundary).
    const isFormData = options.body instanceof FormData;
    if (options.body && typeof options.body === 'string') {
        headers['Content-Type'] = 'application/json';
    }

    const config: RequestInit = {
        ...options,
        headers: isFormData ? headers : { ...headers, ...options.headers },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `API Error: ${response.status}`);
    }

    return response.json();
};
