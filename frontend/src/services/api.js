// Centralized API client for AquaSat AI
const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const config = {
    headers: {
      'Accept': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Crucial for HTTP-only session cookies
    ...options,
  };

  if (config.body && !(config.body instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(config.body);
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    
    // Check if unauthorized to clear frontend cached state if needed
    if (res.status === 401) {
      const isAuthCheck = endpoint === '/auth/me';
      if (!isAuthCheck) {
        // Do not spam alerts on initial auth check
      }
    }

    // Handle responses with no content (like 204)
    if (res.status === 204) {
      return { success: true };
    }

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMsg = data?.detail || data?.message || `Request failed with status ${res.status}`;
      const err = new Error(errorMsg);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (err) {
    if (err.status) {
      throw err;
    }
    // Network or server unreachable error
    const netErr = new Error('Unable to connect to the prediction backend server. Please verify the service is running.');
    netErr.status = 503;
    throw netErr;
  }
}

export const api = {
  // Authentication
  auth: {
    register: (name, email, password) =>
      request('/auth/register', {
        method: 'POST',
        body: { name, email, password },
      }),
    login: (email, password) =>
      request('/auth/login', {
        method: 'POST',
        body: { email, password },
      }),
    logout: () =>
      request('/auth/logout', {
        method: 'POST',
      }),
    getMe: () =>
      request('/auth/me', {
        method: 'GET',
      }),
    updateProfile: (data) =>
      request('/auth/profile', {
        method: 'PUT',
        body: data,
      }),
  },

  // Dashboard Stats
  dashboard: {
    getStats: () =>
      request('/dashboard', {
        method: 'GET',
      }),
  },

  // Predictions
  predictions: {
    analyze: (formData) =>
      request('/predictions', {
        method: 'POST',
        body: formData, // FormData automatically sets multipart/form-data boundary
      }),
    list: (skip = 0, limit = 50) =>
      request(`/predictions?skip=${skip}&limit=${limit}`, {
        method: 'GET',
      }),
    get: (id) =>
      request(`/predictions/${id}`, {
        method: 'GET',
      }),
    delete: (id) =>
      request(`/predictions/${id}`, {
        method: 'DELETE',
      }),
    getMaskUrl: (id) => `${API_BASE}/predictions/${id}/mask`,
  },

  // System Health
  health: {
    check: () =>
      request('/health', {
        method: 'GET',
      }),
  },
};

export default api;
