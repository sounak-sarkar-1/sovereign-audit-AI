import axios from 'axios';
import { useAuthStore } from '../stores/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const { accessToken, tenantSlug } = useAuthStore.getState();
  
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  
  if (tenantSlug) {
    config.headers['X-Tenant-Slug'] = tenantSlug;
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => {
    // Automatically unwrap success/data wrapper from backend
    if (response.data && response.data.success === true) {
      const { success, ...payload } = response.data;
      // If the payload only has a 'data' property (and potentially others we don't care about), 
      // but 'data' is the common pattern, we check for its existence.
      // If we have both 'data' AND 'meta', we return the whole payload.
      if (Object.keys(payload).length === 1 && 'data' in payload) {
        return { ...response, data: payload.data };
      }
      return { ...response, data: payload };
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login') {
      originalRequest._retry = true;
      
      try {
        const response = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        const { accessToken } = response.data.data;
        useAuthStore.setState({ accessToken });
        
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
