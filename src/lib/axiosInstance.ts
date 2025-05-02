import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

// Enhanced request interceptor (combines both versions)
axiosInstance.interceptors.request.use(
  (config) => {
    // Add authorization token if available
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Smart Content-Type handling (from old version)
    if (config.data instanceof FormData) {
      // Let browser set Content-Type with boundary for FormData
      delete config.headers['Content-Type'];
    } else if (!config.headers['Content-Type']) {
      // Default to JSON only if not set
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Enhanced response interceptor (combines both versions)
axiosInstance.interceptors.response.use(
  (response) => {
    // Return data directly like old version, but with full response available
    return response ;
  },
  (error) => {
    // Enhanced error handling (from new version)
    if (error.response) {
      // Handle unauthorized access
      if (error.response.status === 401) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        // Only redirect if we're client-side
        if (typeof window !== 'undefined') {
          window.location.href = '/auth';
        }
      }

      // Consistent error format
      return Promise.reject({
        message: error.response.data?.message || 'An error occurred',
        status: error.response.status,
        data: error.response.data,
      });
    }

    // Fallback for network errors etc.
    console.error('API Error:', error);
    return Promise.reject({
      message: 'Network error or server unavailable',
      isNetworkError: true,
      originalError: error,
    });
  }
);

export default axiosInstance;