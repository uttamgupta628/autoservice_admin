import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { api, errMsg, fmtDate } from '../lib/api';
import { Badge, ErrorBanner, Modal, PageHeader, Spinner, Table, Tabs, useFetch } from '../components/ui';

const DOC_LABEL = { id_proof: 'ID proof', certificate: 'Skill certificate', shop_photo: 'Shop / work photo', insurance: 'Insurance' };

export default function Verification() {
  const [tab, setTab] = useState('pending');
  const { data, loading, error, reload } = useFetch(() => api.get(`/admin/mechanics?status=${tab}`).then((r) => r.data), [tab]);
  const [selected, setSelected] = useState(null);
  const c = data?.counts || {};

  return (
    <>
      <PageHeader title="Mechanic verification" subtitle="Review identity, credentials and equipment before mechanics can take paid jobs" />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'pending', label: 'Pending', count: c.pending },
          { value: 'approved', label: 'Approved', count: c.approved },
          { value: 'rejected', label: 'Rejected', count: c.rejected },
          { value: 'suspended', label: 'Suspended', count: c.suspended },
        ]}
      />
      <ErrorBanner error={error} />
      {loading ? <Spinner /> : (
        <Table
          rows={data.mechanics}
          empty="No applications in this list"
          columns={[
            { header: 'Mechanic', render: (m) => (<div><p className="font-medium">{m.user?.name}</p><p className="text-xs text-slate-400">{m.shopName || m.user?.email}</p></div>) },
            { header: 'Documents', render: (m) => `${m.documents.length} document${m.documents.length === 1 ? '' : 's'}` },
            { header: 'Submitted', render: (m) => fmtDate(m.submittedAt) },
            { header: 'Status', render: (m) => <Badge>{m.verificationStatus}</Badge> },
            { header: 'Action', render: (m) => <button className="btn btn-primary !py-1" onClick={() => setSelected(m._id)}>Review</button> },
          ]}
        />
      )}
      {selected && <ReviewModal id={selected} onClose={() => setSelected(null)} onDone={() => { setSelected(null); reload(); }} />}
    </>
  );
}

function ReviewModal({ id, onClose, onDone }) {
  const { data, loading, error } = useFetch(() => api.get(`/admin/mechanics/${id}`).then((r) => r.data.mechanic), [id]);
  const [reason, setReason] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const decide = async (decision) => {
    setBusy(true);
    setErr('');
    try {
      await api.post(`/admin/mechanics/${id}/decision`, { decision, reason });
      onDone();
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title="Review application" onClose={onClose} wide>
      {loading ? <Spinner /> : error ? <ErrorBanner error={error} /> : (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Info label="Name" value={data.user?.name} />
            <Info label="Shop" value={data.shopName} />
            <Info label="Email" value={data.user?.email} />
            <Info label="Phone" value={data.user?.phone} />
            <Info label="Experience" value={`${data.experienceYears} years`} />
            <Info label="Service area" value={`${data.city || '—'} · ${data.serviceRadiusKm} km radius`} />
            <Info label="Equipment" value={data.equipment.join(', ')} />
            <Info label="Vehicle makes" value={data.vehicleMakes.join(', ') || 'All makes'} />
            <Info label="Services" value={data.services.filter((s) => s.enabled).map((s) => `${s.category} (₹${s.price})`).join(', ')} />
            <Info label="Current status" value={<Badge>{data.verificationStatus}</Badge>} />
          </div>
          {data.verificationNote && <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">Last note: {data.verificationNote}</p>}

          <div>
            <h3 className="mb-2 text-sm font-semibold text-navy">Submitted documents</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {data.documents.map((d, i) => (
                <a key={i} href={d.url} target="_blank" rel="noreferrer" className="group block overflow-hidden rounded-lg border border-slate-200">
                  {/\.pdf($|\?)/i.test(d.url) ? <div className="flex h-28 items-center justify-center bg-slate-50 text-sm text-slate-500">PDF</div> : <img src={d.url} alt={d.type} className="h-28 w-full object-cover" />}
                  <div className="flex items-center justify-between px-2.5 py-1.5 text-xs"><span>{DOC_LABEL[d.type] || d.type}</span><ExternalLink size={12} className="text-slate-400 group-hover:text-brand" /></div>
                </a>
              ))}
              {!data.documents.length && <p className="text-sm text-slate-400">No documents uploaded</p>}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Decision reason <span className="font-normal text-slate-400">(required to reject, suspend or request information)</span></label>
            <textarea className="input" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Shown to the mechanic and saved in the audit log" />
          </div>
          <ErrorBanner error={err} />
          <div className="flex flex-wrap justify-end gap-2">
            <button disabled={busy} className="btn btn-ghost" onClick={() => decide('request_info')}>Request more info</button>
            <button disabled={busy} className="btn btn-danger" onClick={() => decide('reject')}>Reject</button>
            {data.verificationStatus === 'verified' && <button disabled={busy} className="btn btn-danger" onClick={() => decide('suspend')}>Suspend</button>}
            <button disabled={busy} className="btn btn-success" onClick={() => decide('approve')}>Approve</button>
          </div>
        </div>
      )}
    </Modal>
  );
}

const Info = ({ label, value }) => (
  <div><p className="text-xs uppercase tracking-wide text-slate-400">{label}</p><div className="text-sm font-medium text-slate-700">{value || '—'}</div></div>
);
