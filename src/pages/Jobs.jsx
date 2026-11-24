import { useState } from 'react';
import { api, errMsg, fmtDateTime, inr } from '../lib/api';
import { Badge, ErrorBanner, PageHeader, Spinner, Table, Tabs, useFetch } from '../components/ui';

const pretty = (s) => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export default function Jobs() {
  const [tab, setTab] = useState('');
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const { data, loading, error, reload } = useFetch(() => api.get('/admin/jobs', { params: { status: tab || undefined, q: query || undefined } }).then((r) => r.data.jobs), [tab, query]);
  const [err, setErr] = useState('');

  const cancel = async (job) => {
    const reason = window.prompt('Reason for cancelling this job (sent to both parties):');
    if (!reason) return;
    try {
      await api.post(`/admin/jobs/${job._id}/cancel`, { reason });
      reload();
    } catch (e) {
      setErr(errMsg(e));
    }
  };

  return (
    <>
      <PageHeader title="Jobs" subtitle="Moderate requests and oversee bookings">
        <form onSubmit={(e) => { e.preventDefault(); setQuery(q); }} className="flex gap-2">
          <input className="input w-56" placeholder="Search customer, mechanic, service" value={q} onChange={(e) => setQ(e.target.value)} />
          <button className="btn btn-ghost">Search</button>
        </form>
      </PageHeader>
      <Tabs value={tab} onChange={setTab} tabs={[{ value: '', label: 'All' }, { value: 'requested', label: 'Open requests' }, { value: 'ongoing', label: 'Ongoing' }, { value: 'completed', label: 'Completed' }, { value: 'cancelled', label: 'Cancelled' }]} />
      <ErrorBanner error={error || err} />
      {loading ? <Spinner /> : (
        <Table
          rows={data}
          empty="No jobs match"
          columns={[
            { header: 'Job ID', render: (j) => <span className="font-mono text-xs">J-{String(j._id).slice(-6).toUpperCase()}</span> },
            { header: 'Service', render: (j) => (<div><p>{pretty(j.category)}</p><p className="text-xs text-slate-400">{j.vehicle ? `${j.vehicle.make} ${j.vehicle.model}` : ''} · {j.type}</p></div>) },
            { header: 'Customer', render: (j) => j.owner?.name || '—' },
            { header: 'Mechanic', render: (j) => j.mechanic?.name || <span className="text-slate-400">Unassigned</span> },
            { header: 'Scheduled', render: (j) => fmtDateTime(j.scheduledAt) },
            { header: 'Amount', render: (j) => (j.price ? inr(j.price) : '—') },
            { header: 'Status', render: (j) => <Badge>{j.status}</Badge> },
            { header: '', render: (j) => (['completed', 'cancelled'].includes(j.status) ? null : <button className="btn btn-ghost !py-1 text-red-600" onClick={() => cancel(j)}>Cancel</button>) },
          ]}
        />
      )}
    </>
  );
}
