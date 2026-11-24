import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './index.css';
import { AuthProvider, useAuth } from './lib/auth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Overview from './pages/Overview';
import Verification from './pages/Verification';
import Jobs from './pages/Jobs';
import Finance from './pages/Finance';
import TrustSafety from './pages/TrustSafety';
import Configuration from './pages/Configuration';
import Audit from './pages/Audit';
import Accounts from './pages/Accounts';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10 text-center text-slate-400">Loading…</div>;
  return user ? children : <Navigate to="/login" replace />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Protected><Layout /></Protected>}>
            <Route index element={<Overview />} />
            <Route path="verification" element={<Verification />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="finance" element={<Finance />} />
            <Route path="trust-safety" element={<TrustSafety />} />
            <Route path="configuration" element={<Configuration />} />
            <Route path="audit" element={<Audit />} />
            <Route path="accounts" element={<Accounts />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
