import { useQuery } from '@tanstack/react-query';
import { AppShell } from './components/AppShell';
import { APP_NAME } from './constants/app';
import { fetchHealth } from './lib/api';
import type { ApiHealthResponse } from './types';

export default function App() {
  const healthQuery = useQuery<ApiHealthResponse>({
    queryKey: ['health'],
    queryFn: fetchHealth,
  });

  return (
    <AppShell>
      <section className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wide text-brand-600">
            Step 1 complete
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            Welcome to {APP_NAME}
          </h1>
          <p className="mt-3 text-slate-600">
            Foundation is running. Client and server are separate apps with their own env
            files — ready for independent deployment.
          </p>

          <div className="mt-6 rounded-lg border border-slate-100 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-700">API health check</p>
            {healthQuery.isLoading && (
              <p className="mt-1 text-sm text-slate-500">Connecting to server…</p>
            )}
            {healthQuery.isError && (
              <p className="mt-1 text-sm text-red-600">
                Server unreachable — check <code className="rounded bg-slate-200 px-1">VITE_API_URL</code>{' '}
                in <code className="rounded bg-slate-200 px-1">client/.env</code>
              </p>
            )}
            {healthQuery.isSuccess && (
              <p className="mt-1 text-sm text-green-700">
                Server is running — {healthQuery.data.service}
              </p>
            )}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
