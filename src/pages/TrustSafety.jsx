import { useState } from 'react';
import { api, errMsg, fmtDateTime } from '../lib/api';
import { Badge, ErrorBanner, Modal, PageHeader, Spinner, Table, Tabs, useFetch } from '../components/ui';

export default function TrustSafety() {
  const [tab, setTab] = useState('disputes');
  return (
    <>
      <PageHeader title="Trust & Safety" subtitle="Resolve disputes and manage suspensions" />
      <Tabs value={tab} onChange={setTab} tabs={[{ value: 'disputes', label: 'Disputes & incidents' }, { value: 'suspensions', label: 'Suspensions' }]} />
      {tab === 'disputes' ? <Disputes /> : <Suspensions />}
    </>
  );
}

function Disputes() {
  const [status, setStatus] = useState('');
  const { data, loading, error, reload } = useFetch(() => api.get('/admin/disputes', { params: { status: status || undefined } }).then((r) => r.data.disputes), [status]);
  const [open, setOpen] = useState(null);
  const [form, setForm] = useState({ status: 'in_review', resolution: '' });
  const [err, setErr] = useState('');

  const save = async () => {
    try {
      setErr('');
      await api.patch(`/admin/disputes/${open._id}`, form);
      setOpen(null);
      reload();
    } catch (e) {
      setErr(errMsg(e));
    }
  };

  return (
    <>
      <div className="mb-3 flex gap-2">
        {['', 'open', 'in_review', 'resolved'].map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={`btn !py-1 ${status === s ? 'btn-primary' : 'btn-ghost'}`}>{s ? s.replace('_', ' ') : 'all'}</button>
        ))}
      </div>
      <ErrorBanner error={error} />
      {loading ? <Spinner /> : (
        <Table
          rows={data}
          empty="No cases"
          columns={[
            { header: 'Case', render: (d) => <span className="font-mono text-xs">D-{String(d._id).slice(-5).toUpperCase()}</span> },
            { header: 'Issue', render: (d) => (<div><p className="font-medium">{d.subject}</p><p className="max-w-xs truncate text-xs text-slate-400">{d.description}</p></div>) },
            { header: 'Raised by', render: (d) => `${d.raisedBy?.name} (${d.raisedBy?.role})` },
            { header: 'Against', render: (d) => d.against?.name || '—' },
            { header: 'Opened', render: (d) => fmtDateTime(d.createdAt) },
            { header: 'Status', render: (d) => <Badge>{d.status}</Badge> },
            { header: '', render: (d) => <button className="btn btn-primary !py-1" onClick={() => { setOpen(d); setForm({ status: d.status === 'open' ? 'in_review' : d.status, resolution: d.resolution || '' }); setErr(''); }}>Manage</button> },
          ]}
        />
      )}
      {open && (
        <Modal title={`Case: ${open.subject}`} onClose={() => setOpen(null)}>
          <p className="mb-4 whitespace-pre-wrap text-sm text-slate-600">{open.description || 'No description provided.'}</p>
          <label className="mb-1 block text-sm font-medium">Status</label>
          <select className="input mb-3" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="open">Open</option><option value="in_review">In review</option><option value="resolved">Resolved</option>
          </select>
          <label className="mb-1 block text-sm font-medium">Resolution note</label>
          <textarea className="input mb-3" rows={3} value={form.resolution} onChange={(e) => setForm({ ...form, resolution: e.target.value })} />
          <ErrorBanner error={err} />
          <div className="flex justify-end gap-2"><button className="btn btn-ghost" onClick={() => setOpen(null)}>Close</button><button className="btn btn-primary" onClick={save}>Save</button></div>
        </Modal>
      )}
    </>
  );
}

function Suspensions() {
  const users = useFetch(() => api.get('/admin/users', { params: { status: 'suspended' } }).then((r) => r.data.users));
  const mechs = useFetch(() => api.get('/admin/mechanics?status=suspended').then((r) => r.data.mechanics));
  const [err, setErr] = useState('');
  const reactivate = async (u) => {
    try {
      await api.patch(`/admin/users/${u._id}/status`, { status: 'active' });
      users.reload();
    } catch (e) {
      setErr(errMsg(e));
    }
  };
  return (
    <>
      <ErrorBanner error={err || users.error} />
      <h3 className="mb-2 text-sm font-semibold text-navy">Suspended accounts</h3>
      {users.loading ? <Spinner /> : (
        <Table rows={users.data} empty="No suspended accounts" columns={[
          { header: 'Name', render: (u) => u.name }, { header: 'Role', render: (u) => <Badge tone="gray">{u.role}</Badge> },
          { header: 'Reason', render: (u) => u.suspensionReason || '—' },
          { header: '', render: (u) => <button className="btn btn-ghost !py-1" onClick={() => reactivate(u)}>Reactivate</button> },
        ]} />
      )}
      <h3 className="mb-2 mt-6 text-sm font-semibold text-navy">Suspended mechanic profiles</h3>
      {mechs.loading ? <Spinner /> : (
        <Table rows={mechs.data} empty="No suspended mechanic profiles" columns={[
          { header: 'Mechanic', render: (m) => m.user?.name }, { header: 'Reason', render: (m) => m.verificationNote || '—' },
          { header: 'Re-review', render: () => <span className="text-xs text-slate-400">Use Verification to approve again</span> },
        ]} />
      )}
    </>
  );
}
