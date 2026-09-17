import axios, { AxiosInstance } from 'axios';

export const API_BASE_URL = 'https://momo-be-production.up.railway.app';

export const clearAuthSession = (): void => {
  if (typeof window === 'undefined') return;

  const cookieAttributes = 'expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; path=/; SameSite=Lax';
  ['auth_token', 'user_role', 'guru_profile'].forEach((name) => {
    document.cookie = `${name}=; ${cookieAttributes}`;
  });

  ['auth_token', 'token', 'user_role', 'guru_profile', 'active_class_id'].forEach((key) => {
    window.localStorage.removeItem(key);
  });
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      clearAuthSession();

      if (window.location.pathname !== '/login') {
        const redirect = `${window.location.pathname}${window.location.search}`;
        window.location.replace(`/login?redirect=${encodeURIComponent(redirect)}`);
      }
    }

    return Promise.reject(error);
  },
);