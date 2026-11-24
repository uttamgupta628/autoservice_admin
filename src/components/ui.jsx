import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const BADGES = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  blue: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  red: 'bg-red-50 text-red-700 ring-red-600/20',
  gray: 'bg-slate-100 text-slate-600 ring-slate-500/20',
};
const STATUS_TONE = {
  verified: 'green', completed: 'green', captured: 'green', settled: 'green', resolved: 'green', active: 'green', booked: 'blue',
  in_progress: 'blue', in_review: 'blue', under_review: 'blue', submitted: 'amber', pending: 'amber', requested: 'amber', quoted: 'amber',
  authorized: 'amber', open: 'amber', rejected: 'red', cancelled: 'red', suspended: 'red', refunded: 'red', voided: 'gray', draft: 'gray', none: 'gray',
};
export const Badge = ({ children, tone }) => {
  const t = tone || STATUS_TONE[String(children)] || 'gray';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${BADGES[t]}`}>
      {String(children).replace(/_/g, ' ')}
    </span>
  );
};

export const PageHeader = ({ title, subtitle, children }) => (
  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
    <div>
      <h1 className="text-2xl font-bold text-navy">{title}</h1>
      {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
    </div>
    <div className="flex items-center gap-2">{children}</div>
  </div>
);

export const Tabs = ({ tabs, value, onChange }) => (
  <div className="mb-4 flex flex-wrap gap-1 rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-200 w-fit">
    {tabs.map((t) => (
      <button
        key={t.value}
        onClick={() => onChange(t.value)}
        className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${value === t.value ? 'bg-brand text-white' : 'text-slate-600 hover:bg-slate-100'}`}
      >
        {t.label}
        {t.count !== undefined && <span className={`ml-1.5 text-xs ${value === t.value ? 'text-white/80' : 'text-slate-400'}`}>({t.count})</span>}
      </button>
    ))}
  </div>
);

export const StatCard = ({ label, value, tone = 'text-navy', hint }) => (
  <div className="card p-5">
    <p className="text-sm text-slate-500">{label}</p>
    <p className={`mt-1 text-3xl font-bold ${tone}`}>{value}</p>
    {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
  </div>
);

export const Table = ({ columns, rows, empty = 'Nothing here yet', rowKey = (r) => r._id }) => (
  <div className="card overflow-x-auto">
    <table className="min-w-full divide-y divide-slate-100">
      <thead className="bg-slate-50/70">
        <tr>{columns.map((c) => <th key={c.header} className="th">{c.header}</th>)}</tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((r) => (
          <tr key={rowKey(r)} className="hover:bg-slate-50/60">
            {columns.map((c) => <td key={c.header} className="td">{c.render(r)}</td>)}
          </tr>
        ))}
        {!rows.length && (
          <tr><td colSpan={columns.length} className="td py-10 text-center text-slate-400">{empty}</td></tr>
        )}
      </tbody>
    </table>
  </div>
);

export function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 p-4" onMouseDown={onClose}>
      <div className={`card max-h-[90vh] w-full overflow-y-auto p-6 ${wide ? 'max-w-3xl' : 'max-w-md'}`} onMouseDown={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-navy">{title}</h2>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-slate-100"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const ErrorBanner = ({ error }) => (error ? <div className="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</div> : null);
export const Spinner = () => <div className="py-16 text-center text-sm text-slate-400">Loading…</div>;

/** Small data-loading hook: { data, loading, error, reload } */
export function useFetch(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: '' }));
    fn()
      .then((data) => alive && setState({ data, loading: false, error: '' }))
      .catch((e) => alive && setState({ data: null, loading: false, error: e.response?.data?.message || e.message }));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  return { ...state, reload: () => setTick((t) => t + 1) };
}
