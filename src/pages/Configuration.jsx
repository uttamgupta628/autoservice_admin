import { useEffect, useState } from 'react';
import { Pencil } from 'lucide-react';
import { api, errMsg, inr } from '../lib/api';
import { Badge, ErrorBanner, Modal, PageHeader, Spinner, Table, Tabs, useFetch } from '../components/ui';

export default function Configuration() {
  const [tab, setTab] = useState('categories');
  return (
    <>
      <PageHeader title="Configuration" subtitle="Service categories, fee policy and access controls" />
      <Tabs value={tab} onChange={setTab} tabs={[{ value: 'categories', label: 'Service categories' }, { value: 'fees', label: 'Fee policy' }, { value: 'access', label: 'Access controls' }]} />
      {tab === 'categories' && <Categories />}
      {tab === 'fees' && <Fees />}
      {tab === 'access' && <Access />}
    </>
  );
}

const EMPTY = { name: '', basePrice: 0, instantBook: true, requiredEquipment: '', icon: 'construct' };

function Categories() {
  const { data, loading, error, reload } = useFetch(() => api.get('/admin/categories').then((r) => r.data.categories));
  const [edit, setEdit] = useState(null);
  const [err, setErr] = useState('');

  const toggle = async (c) => {
    try {
      await api.put(`/admin/categories/${c._id}`, { active: !c.active });
      reload();
    } catch (e) {
      setErr(errMsg(e));
    }
  };
  const save = async () => {
    const body = { ...edit, basePrice: Number(edit.basePrice) || 0, requiredEquipment: String(edit.requiredEquipment).split(',').map((s) => s.trim()).filter(Boolean) };
    try {
      setErr('');
      if (edit._id) await api.put(`/admin/categories/${edit._id}`, body);
      else await api.post('/admin/categories', body);
      setEdit(null);
      reload();
    } catch (e) {
      setErr(errMsg(e));
    }
  };

  return (
    <>
      <div className="mb-3 flex justify-end"><button className="btn btn-primary" onClick={() => { setEdit({ ...EMPTY }); setErr(''); }}>+ Add category</button></div>
      <ErrorBanner error={error || (!edit && err)} />
      {loading ? <Spinner /> : (
        <Table
          rows={data}
          columns={[
            { header: 'Category', render: (c) => <span className="font-medium">{c.name}</span> },
            { header: 'Base price', render: (c) => inr(c.basePrice) },
            { header: 'Booking', render: (c) => <Badge tone={c.instantBook ? 'blue' : 'amber'}>{c.instantBook ? 'instant book' : 'quote only'}</Badge> },
            { header: 'Required equipment', render: (c) => c.requiredEquipment.join(', ') || <span className="text-slate-400">None</span> },
            { header: 'Active', render: (c) => (
              <button onClick={() => toggle(c)} className={`relative h-6 w-11 rounded-full transition ${c.active ? 'bg-success' : 'bg-slate-300'}`} aria-label="toggle">
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${c.active ? 'left-[22px]' : 'left-0.5'}`} />
              </button>) },
            { header: '', render: (c) => <button className="text-slate-400 hover:text-brand" onClick={() => { setEdit({ ...c, requiredEquipment: c.requiredEquipment.join(', ') }); setErr(''); }}><Pencil size={16} /></button> },
          ]}
        />
      )}
      {edit && (
        <Modal title={edit._id ? 'Edit category' : 'New category'} onClose={() => setEdit(null)}>
          <div className="space-y-3">
            <input className="input" placeholder="Name" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
            <input className="input" type="number" min="0" placeholder="Base price (₹)" value={edit.basePrice} onChange={(e) => setEdit({ ...edit, basePrice: e.target.value })} />
            <input className="input" placeholder="Required equipment, comma separated" value={edit.requiredEquipment} onChange={(e) => setEdit({ ...edit, requiredEquipment: e.target.value })} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={edit.instantBook} onChange={(e) => setEdit({ ...edit, instantBook: e.target.checked })} /> Allow instant booking (otherwise quote only)</label>
            <ErrorBanner error={err} />
            <div className="flex justify-end gap-2"><button className="btn btn-ghost" onClick={() => setEdit(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save</button></div>
          </div>
        </Modal>
      )}
    </>
  );
}

function Fees() {
  const { data, loading, error } = useFetch(() => api.get('/admin/settings').then((r) => r.data.settings));
  const [form, setForm] = useState(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  useEffect(() => { if (data) setForm({ fee: data.platformFeeRate * 100, tax: data.taxRate * 100, leadLimit: data.leadLimit }); }, [data]);
  if (loading || !form) return error ? <ErrorBanner error={error} /> : <Spinner />;

  const save = async () => {
    try {
      setErr(''); setMsg('');
      await api.put('/admin/settings', { platformFeeRate: Number(form.fee) / 100, taxRate: Number(form.tax) / 100, leadLimit: Number(form.leadLimit) });
      setMsg('Saved. New quotes and payments use these values; existing ones keep theirs.');
    } catch (e) {
      setErr(errMsg(e));
    }
  };
  return (
    <div className="card max-w-lg space-y-4 p-6">
      <Field label="Platform fee (% of job value)" hint="Deducted from the mechanic's payout when a job is completed"><input className="input" type="number" min="0" max="50" step="0.5" value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} /></Field>
      <Field label="Tax on quotes (%)" hint="Added by the server to every itemized quote"><input className="input" type="number" min="0" max="50" step="0.5" value={form.tax} onChange={(e) => setForm({ ...form, tax: e.target.value })} /></Field>
      <Field label="Lead limit" hint="Maximum number of mechanics a new request is sent to"><input className="input" type="number" min="1" max="50" value={form.leadLimit} onChange={(e) => setForm({ ...form, leadLimit: e.target.value })} /></Field>
      <ErrorBanner error={err} />
      {msg && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{msg}</p>}
      <button className="btn btn-primary" onClick={save}>Save policy</button>
    </div>
  );
}
const Field = ({ label, hint, children }) => (<div><label className="mb-1 block text-sm font-medium">{label}</label>{children}{hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}</div>);

function Access() {
  const { data, loading, error, reload } = useFetch(() => api.get('/admin/users', { params: { role: 'admin' } }).then((r) => r.data.users));
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const create = async (e) => {
    e.preventDefault();
    try {
      setErr('');
      await api.post('/admin/admins', form);
      setForm({ name: '', email: '', password: '' });
      reload();
    } catch (x) {
      setErr(errMsg(x));
    }
  };
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <ErrorBanner error={error} />
        {loading ? <Spinner /> : <Table rows={data} columns={[{ header: 'Administrator', render: (u) => <span className="font-medium">{u.name}</span> }, { header: 'Email', render: (u) => u.email }, { header: 'Status', render: (u) => <Badge>{u.status}</Badge> }]} />}
      </div>
      <form onSubmit={create} className="card h-fit space-y-3 p-5">
        <h3 className="font-semibold text-navy">Add administrator</h3>
        <input className="input" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="input" type="password" placeholder="Password (8+ characters)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <ErrorBanner error={err} />
        <button className="btn btn-primary w-full">Create admin</button>
      </form>
    </div>
  );
}
