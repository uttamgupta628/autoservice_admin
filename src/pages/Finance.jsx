import { useState } from 'react';
import { api, errMsg, fmtDateTime, inr } from '../lib/api';
import { Badge, ErrorBanner, PageHeader, Spinner, StatCard, Table, Tabs, useFetch } from '../components/ui';

export default function Finance() {
  const [tab, setTab] = useState('');
  const { data, loading, error, reload } = useFetch(() => api.get('/admin/finance', { params: { status: tab || undefined } }).then((r) => r.data), [tab]);
  const [err, setErr] = useState('');

  const act = async (p, kind) => {
    const body = {};
    if (kind === 'refund') {
      body.reason = window.prompt(`Refund ${inr(p.amount)} to ${p.owner?.name}? Enter a reason:`);
      if (!body.reason) return;
    } else if (!window.confirm(`Mark the ${inr(p.payout)} payout to ${p.mechanic?.name} as settled?`)) return;
    try {
      setErr('');
      await api.post(`/admin/payments/${p._id}/${kind}`, body);
      reload();
    } catch (e) {
      setErr(errMsg(e));
    }
  };

  return (
    <>
      <PageHeader title="Finance" subtitle="Payments, platform fees, refunds and payout exceptions" />
      <ErrorBanner error={error || err} />
      {loading && !data ? <Spinner /> : data && (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total revenue" value={inr(data.totalRevenue)} />
            <StatCard label="Payouts settled" value={inr(data.payouts)} tone="text-success" hint={`${inr(data.pendingPayouts)} pending`} />
            <StatCard label="Platform fees" value={inr(data.platformFees)} tone="text-brand" />
            <StatCard label="Refunds" value={inr(data.refunds)} tone="text-red-600" />
          </div>
          <Tabs value={tab} onChange={setTab} tabs={[{ value: '', label: 'All' }, { value: 'authorized', label: 'Authorized' }, { value: 'captured', label: 'Captured' }, { value: 'refunded', label: 'Refunded' }, { value: 'voided', label: 'Voided' }]} />
          <Table
            rows={data.payments}
            empty="No payments"
            columns={[
              { header: 'Txn', render: (p) => <span className="font-mono text-xs">P-{String(p._id).slice(-6).toUpperCase()}</span> },
              { header: 'Customer', render: (p) => p.owner?.name },
              { header: 'Mechanic', render: (p) => p.mechanic?.name },
              { header: 'Amount', render: (p) => inr(p.amount) },
              { header: 'Fee / Payout', render: (p) => <span className="text-xs text-slate-500">{inr(p.platformFee)} / {inr(p.payout)}</span> },
              { header: 'Payment', render: (p) => <Badge>{p.status}</Badge> },
              { header: 'Payout', render: (p) => <Badge>{p.payoutStatus === 'pending' ? 'pending' : p.payoutStatus === 'settled' ? 'settled' : 'none'}</Badge> },
              { header: 'Date', render: (p) => fmtDateTime(p.createdAt) },
              {
                header: 'Actions',
                render: (p) => p.status === 'captured' && (
                  <div className="flex gap-1.5">
                    {p.payoutStatus === 'pending' && <button className="btn btn-success !py-1" onClick={() => act(p, 'settle')}>Settle</button>}
                    {p.payoutStatus === 'pending' && <button className="btn btn-ghost !py-1 text-red-600" onClick={() => act(p, 'refund')}>Refund</button>}
                  </div>
                ),
              },
            ]}
          />
          <p className="mt-3 text-xs text-slate-400">Payments are recorded by the platform. Connect a payment gateway (Razorpay, Stripe…) in the backend to move real money.</p>
        </>
      )}
    </>
  );
}
