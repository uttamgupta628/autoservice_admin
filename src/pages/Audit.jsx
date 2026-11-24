import { useState } from 'react';
import { api, fmtDateTime } from '../lib/api';
import { ErrorBanner, PageHeader, Spinner, Table, useFetch } from '../components/ui';

export default function Audit() {
  const [page, setPage] = useState(1);
  const { data, loading, error } = useFetch(() => api.get('/admin/audit', { params: { page } }).then((r) => r.data), [page]);
  return (
    <>
      <PageHeader title="Audit log" subtitle="Sensitive admin and financial actions, newest first" />
      <ErrorBanner error={error} />
      {loading ? <Spinner /> : (
        <>
          <Table
            rows={data.logs}
            empty="No activity recorded yet"
            columns={[
              { header: 'Date & time', render: (l) => fmtDateTime(l.createdAt) },
              { header: 'User', render: (l) => l.actor?.name || '—' },
              { header: 'Action', render: (l) => <span className="font-mono text-xs">{l.action}</span> },
              { header: 'Target', render: (l) => <span className="font-mono text-xs text-slate-500">{l.target}</span> },
              { header: 'Details', render: (l) => <span className="block max-w-xs truncate text-xs text-slate-500">{l.meta ? JSON.stringify(l.meta) : ''}</span> },
              { header: 'IP', render: (l) => <span className="text-xs text-slate-400">{l.ip}</span> },
            ]}
          />
          <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
            <span>{data.total} events</span>
            <div className="flex items-center gap-2">
              <button className="btn btn-ghost !py-1" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
              <span>Page {data.page} of {Math.max(data.pages, 1)}</span>
              <button className="btn btn-ghost !py-1" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
