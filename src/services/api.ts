import axios from 'axios';

// Use the new subdomain for backend API with HTTPS
const API_BASE_URL = 'https://smswebappbackend-cn6lm.ondigitalocean.app';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
         
    },  
    timeout: 30000,
    withCredentials: true // Now works with HTTPS subdomain
});

// Add request interceptor for authentication
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});   

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Only handle actual HTTP 401 responses from the server, not network errors
        if (error.response && error.response.status === 401 && !error.config.url?.includes('/api/user/login')) {
            // Only clear auth and redirect for actual 401 responses from the server
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            delete api.defaults.headers.common['Authorization'];
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        } else if (error.code === 'ERR_NETWORK') {
            // Handle network errors without redirecting
            console.error('Network error - Please check if the backend server is running');
            console.error('Backend URL:', API_BASE_URL);
        }
        return Promise.reject(error);
    }
);

export default api;
