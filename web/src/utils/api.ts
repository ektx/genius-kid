import axios from 'axios';

const BASE_URL = 'http://localhost:5100/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：添加 Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：统一处理错误
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      // 如果是 401 错误，可能需要清除 token 并跳转登录
      if (error.response.status === 401) {
        localStorage.removeItem('auth-token');
        // 这里可以根据需要进行路由跳转，比如 window.location.href = '/login'
      }
      return Promise.reject(error.response.data);
    }
    return Promise.reject({ error: '网络错误，请稍后再试' });
  }
);

export { BASE_URL };
export default api;
