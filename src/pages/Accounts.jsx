import { useState } from 'react';
import { api, errMsg, fmtDate } from '../lib/api';
import { Badge, ErrorBanner, PageHeader, Spinner, Table, Tabs, useFetch } from '../components/ui';
import { useAuth } from '../lib/auth';

export default function Accounts() {
  const { user: me } = useAuth();
  const [role, setRole] = useState('owner');
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const { data, loading, error, reload } = useFetch(() => api.get('/admin/users', { params: { role, q: query || undefined } }).then((r) => r.data.users), [role, query]);
  const [err, setErr] = useState('');

  const toggle = async (u) => {
    let reason;
    if (u.status === 'active') {
      reason = window.prompt(`Suspend ${u.name}? Enter a reason (saved in the audit log):`);
      if (!reason) return;
    }
    try {
      setErr('');
      await api.patch(`/admin/users/${u._id}/status`, { status: u.status === 'active' ? 'suspended' : 'active', reason });
      reload();
    } catch (e) {
      setErr(errMsg(e));
    }
  };

  return (
    <>
      <PageHeader title="Accounts" subtitle="Vehicle owners, mechanics and administrators">
        <form onSubmit={(e) => { e.preventDefault(); setQuery(q); }} className="flex gap-2">
          <input className="input w-60" placeholder="Search name, email, phone" value={q} onChange={(e) => setQ(e.target.value)} />
          <button className="btn btn-ghost">Search</button>
        </form>
      </PageHeader>
      <Tabs value={role} onChange={setRole} tabs={[{ value: 'owner', label: 'Vehicle owners' }, { value: 'mechanic', label: 'Mechanics' }, { value: 'admin', label: 'Admins' }]} />
      <ErrorBanner error={error || err} />
      {loading ? <Spinner /> : (
        <Table
          rows={data}
          empty="No accounts found"
          columns={[
            { header: 'Name', render: (u) => <span className="font-medium">{u.name}</span> },
            { header: 'Email / phone', render: (u) => (<div><p>{u.email}</p><p className="text-xs text-slate-400">{u.phone}</p></div>) },
            { header: 'Joined', render: (u) => fmtDate(u.createdAt) },
            { header: 'Status', render: (u) => <Badge>{u.status}</Badge> },
            { header: 'Action', render: (u) => (u._id === me._id ? <span className="text-xs text-slate-400">You</span> : (
              <button className={`btn !py-1 ${u.status === 'active' ? 'btn-ghost text-red-600' : 'btn-success'}`} onClick={() => toggle(u)}>{u.status === 'active' ? 'Suspend' : 'Reactivate'}</button>
            )) },
          ]}
        />
      )}
    </>
  );
}
