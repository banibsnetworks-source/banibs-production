import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Create axios instance
const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          // No refresh token, redirect to login
          window.location.href = '/admin/login';
          return Promise.reject(error);
        }

        // Try to refresh the token
        const response = await axios.post(`${BACKEND_URL}/api/auth/refresh`, {
          refresh_token: refreshToken
        });

        const { access_token } = response.data;
        
        // Update stored token
        localStorage.setItem('access_token', access_token);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/admin/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  logout: (refreshToken) => 
    api.post('/auth/logout', { refresh_token: refreshToken }),
  
  getMe: () => 
    api.get('/auth/me'),
  
  refresh: (refreshToken) => 
    api.post('/auth/refresh', { refresh_token: refreshToken })
};

// Contributor auth (Phase 2.9)
export const contributorAPI = {
  register: (email, password, name, organization) =>
    api.post('/auth/contributor/register', { email, password, name, organization }),
  
  login: (email, password) =>
    api.post('/auth/contributor/login', { email, password })
};

export const opportunitiesAPI = {
  getAll: (type) => 
    api.get('/opportunities/', { params: { type } }),
  
  getFeatured: () => 
    api.get('/opportunities/featured'),
  
  create: (data) => 
    api.post('/opportunities/', data),
  
  // Contributor endpoints (Phase 2.9)
  submit: (data) =>
    api.post('/opportunities/submit', data),
  
  getMine: () =>
    api.get('/opportunities/mine'),
  
  // Admin endpoints
  getPending: () => 
    api.get('/opportunities/pending'),
  
  approve: (id, notes) => 
    api.patch(`/opportunities/${id}/approve`, { notes }),
  
  reject: (id, notes) => 
    api.patch(`/opportunities/${id}/reject`, { notes }),
  
  feature: (id, notes) => 
    api.patch(`/opportunities/${id}/feature`, { notes }),
  
  getAnalytics: () =>
    api.get('/opportunities/analytics')
};

export const uploadsAPI = {
  getPresignedUrl: (fileName, fileType) => 
    api.post('/admin/uploads/presign', { fileName, fileType }),
  
  uploadLocal: (file, filename) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/admin/uploads/local?filename=${filename}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  testAWS: () => 
    api.get('/admin/uploads/test-aws')
};

export default api;
