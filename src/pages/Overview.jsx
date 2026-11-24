import { Link } from 'react-router-dom';
import { CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api, inr } from '../lib/api';
import { ErrorBanner, PageHeader, Spinner, StatCard, useFetch } from '../components/ui';

const COLORS = ['#2677E8', '#19A77C', '#F2A43A', '#14263D', '#94A3B8', '#8B5CF6', '#EF4444'];
const title = (s) => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export default function Overview() {
  const { data, loading, error, reload } = useFetch(() => api.get('/admin/stats').then((r) => r.data));
  if (loading) return <Spinner />;
  if (error) return <ErrorBanner error={error} />;
  const trend = data.trend.map((d) => ({ ...d, day: new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short' }) }));
  const cats = data.categories.map((c) => ({ name: title(c.category), value: c.count, percent: c.percent }));

  return (
    <>
      <PageHeader title="Overview" subtitle="Marketplace health at a glance">
        <button className="btn btn-ghost" onClick={reload}>Refresh</button>
      </PageHeader>

      {(data.alerts.pendingVerification > 0 || data.alerts.openDisputes > 0) && (
        <div className="mb-6 flex flex-wrap gap-3">
          {data.alerts.pendingVerification > 0 && (
            <Link to="/verification" className="rounded-lg bg-amber/10 px-4 py-2 text-sm font-medium text-amber ring-1 ring-amber/30">
              {data.alerts.pendingVerification} mechanic application(s) waiting for review →
            </Link>
          )}
          {data.alerts.openDisputes > 0 && (
            <Link to="/trust-safety" className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 ring-1 ring-red-200">
              {data.alerts.openDisputes} unresolved dispute(s) →
            </Link>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total users" value={data.totalUsers.toLocaleString('en-IN')} />
        <StatCard label="Mechanics" value={data.mechanics.toLocaleString('en-IN')} tone="text-brand" />
        <StatCard label="Bookings" value={data.bookings.toLocaleString('en-IN')} tone="text-success" hint="Booked, in progress or completed" />
        <StatCard label="Revenue" value={inr(data.revenue)} tone="text-navy" hint="Captured payments" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className="card p-5 lg:col-span-3">
          <h2 className="mb-4 font-semibold text-navy">Jobs created, last 7 days</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={trend} margin={{ left: -20, right: 10, top: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="count" name="Jobs" stroke="#2677E8" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-4 font-semibold text-navy">Service categories</h2>
          {cats.length ? (
            <div className="flex items-center gap-4">
              <div className="h-44 w-44 shrink-0">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={cats} dataKey="value" innerRadius={45} outerRadius={75} paddingAngle={2}>
                      {cats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="space-y-1.5 text-sm">
                {cats.slice(0, 6).map((c, i) => (
                  <li key={c.name} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-slate-600">{c.name}</span>
                    <span className="ml-auto font-medium">{c.percent}%</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : <p className="py-10 text-center text-sm text-slate-400">No jobs yet</p>}
        </div>
      </div>
    </>
  );
}
