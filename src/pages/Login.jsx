import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Car } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { errMsg } from '../lib/api';
import { ErrorBanner } from '../components/ui';

export default function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(form.identifier, form.password);
      nav('/');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy p-4">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4 p-8">
        <div className="flex flex-col items-center gap-1">
          <Car className="text-brand" size={34} />
          <h1 className="text-xl font-bold text-navy">AutoService Admin</h1>
          <p className="text-sm text-slate-500">Sign in to manage the marketplace</p>
        </div>
        <ErrorBanner error={error} />
        <input className="input" placeholder="Email" value={form.identifier} onChange={(e) => setForm({ ...form, identifier: e.target.value })} autoFocus />
        <input className="input" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="btn btn-primary w-full" disabled={busy || !form.identifier || !form.password}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  );
}
