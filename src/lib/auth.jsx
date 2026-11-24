import { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken } from './api';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getToken());

  useEffect(() => {
    if (!getToken()) return;
    api
      .get('/auth/me')
      .then((r) => (r.data.user.role === 'admin' ? setUser(r.data.user) : setToken(null)))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (identifier, password) => {
    const { data } = await api.post('/auth/login', { identifier, password });
    if (data.user.role !== 'admin') throw new Error('This panel is for administrators only');
    setToken(data.token);
    setUser(data.user);
  };
  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return <AuthCtx.Provider value={{ user, loading, login, logout }}>{children}</AuthCtx.Provider>;
}
