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
    // Try contributor token first, then admin token
    const contributorToken = localStorage.getItem('contributor_access_token');
    const adminToken = localStorage.getItem('access_token');
    const token = contributorToken || adminToken;
    
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

// Phase 3.1 - Contributor Profile API
export const contributorProfileAPI = {
  getProfile: (contributorId) =>
    api.get(`/contributors/${contributorId}/profile`),
  
  updateProfile: (profileData) =>
    api.patch('/contributors/profile', profileData),
  
  verifyContributor: (contributorId, verified) =>
    api.patch(`/contributors/${contributorId}/verify`, { verified })
};

// Phase 3.2 - Moderation Logs API
export const moderationLogsAPI = {
  getLogsForOpportunity: (opportunityId) =>
    api.get(`/admin/moderation-log/opportunities/${opportunityId}`),
  
  getAllLogs: (moderatorUserId = null) => {
    const params = moderatorUserId ? { moderatorUserId } : {};
    return api.get('/admin/moderation-log/', { params });
  },
  
  exportCSV: (moderatorUserId = null) => {
    const params = moderatorUserId ? `?moderatorUserId=${moderatorUserId}` : '';
    return api.get(`/admin/moderation-log/export.csv${params}`, {
      responseType: 'blob'
    });
  }
};

// Phase 4.1 - Reactions & Comments API
export const reactionsAPI = {
  toggleLike: (opportunityId) =>
    api.post(`/opportunities/${opportunityId}/react`),
  
  getLikeCount: (opportunityId) =>
    api.get(`/opportunities/${opportunityId}/reactions`),
  
  postComment: (opportunityId, commentData) =>
    api.post(`/opportunities/${opportunityId}/comments`, commentData),
  
  getComments: (opportunityId) =>
    api.get(`/opportunities/${opportunityId}/comments`),
  
  hideComment: (commentId) =>
    api.patch(`/opportunities/admin/comments/${commentId}/hide`)
};

// Phase 4.2 - Newsletter API
export const newsletterAPI = {
  subscribe: (email) =>
    api.post('/newsletter/subscribe', { email }),
  
  getSubscribers: () =>
    api.get('/newsletter/admin/subscribers'),
  
  exportSubscribersCSV: () =>
    api.get('/newsletter/admin/subscribers/export.csv', {
      responseType: 'blob'
    }),
  
  getDraftDigest: () =>
    api.get('/newsletter/admin/draft-digest')
};

// Phase 4.3 - Sponsored API
export const sponsoredAPI = {
  setSponsor: (opportunityId, isSponsored, sponsorLabel) =>
    api.patch(`/admin/opportunities/${opportunityId}/sponsor`, {
      is_sponsored: isSponsored,
      sponsor_label: sponsorLabel
    })
};

// Phase 4.4 - Leaderboard API
export const leaderboardAPI = {
  getTopContributors: (limit = 10) =>
    api.get(`/contributors/leaderboard?limit=${limit}`)
};

export default api;
