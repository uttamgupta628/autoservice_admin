import axios from 'axios';

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });

const KEY = 'autoservice_admin_token';
export const getToken = () => localStorage.getItem(KEY);
export const setToken = (t) => (t ? localStorage.setItem(KEY, t) : localStorage.removeItem(KEY));

api.interceptors.request.use((config) => {
  const t = getToken();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

// An expired/invalid token sends the admin back to the login screen.
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && getToken()) {
      setToken(null);
      window.location.assign('/login');
    }
    return Promise.reject(err);
  }
);

export const errMsg = (e) => e.response?.data?.message || e.message || 'Something went wrong';
export const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
export const fmtDateTime = (d) => (d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—');
