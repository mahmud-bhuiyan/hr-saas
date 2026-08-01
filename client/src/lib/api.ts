import type { ApiHealthResponse } from '../types';

const apiBase = import.meta.env.VITE_API_URL || '';

export async function fetchHealth(): Promise<ApiHealthResponse> {
  const response = await fetch(`${apiBase}/api/health`);

  if (!response.ok) {
    throw new Error('Health check failed');
  }

  return response.json() as Promise<ApiHealthResponse>;
}
