import type { ServerEnv } from '../../config/env.js';

const XERO_AUTHORIZE_URL = 'https://login.xero.com/identity/connect/authorize';
const XERO_TOKEN_URL = 'https://identity.xero.com/connect/token';
const XERO_CONNECTIONS_URL = 'https://api.xero.com/connections';
const XERO_API_BASE = 'https://api.xero.com/api.xro/2.0';

const XERO_SCOPES = [
  'openid',
  'profile',
  'email',
  'offline_access',
  'accounting.transactions',
  'accounting.settings.read',
].join(' ');

export interface XeroTokenSet {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface XeroConnection {
  id: string;
  tenantId: string;
  tenantName: string;
}

export interface XeroManualJournalLine {
  Description: string;
  LineAmount: number;
  AccountCode: string;
  TaxType: 'NONE';
}

export class XeroClientError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'XeroClientError';
  }
}

export const isXeroConfigured = (env: ServerEnv): boolean =>
  Boolean(env.xeroClientId && env.xeroClientSecret && env.xeroRedirectUri);

const parseTokenResponse = (payload: Record<string, unknown>): XeroTokenSet => {
  const accessToken = payload.access_token;
  const refreshToken = payload.refresh_token;
  const expiresIn = payload.expires_in;

  if (typeof accessToken !== 'string' || typeof refreshToken !== 'string') {
    throw new XeroClientError('Invalid token response from Xero', 502);
  }

  const seconds =
    typeof expiresIn === 'number' ? expiresIn : Number.parseInt(String(expiresIn ?? '1800'), 10);

  return {
    accessToken,
    refreshToken,
    expiresAt: new Date(Date.now() + seconds * 1000),
  };
};

const xeroFetch = async (
  url: string,
  init: RequestInit,
  errorMessage: string
): Promise<Response> => {
  const response = await fetch(url, init);

  if (!response.ok) {
    let detail = '';
    try {
      const body = (await response.json()) as { Message?: string; Detail?: string };
      detail = body.Message ?? body.Detail ?? '';
    } catch {
      // ignore parse errors
    }
    throw new XeroClientError(
      detail ? `${errorMessage}: ${detail}` : errorMessage,
      response.status >= 500 ? 502 : 400
    );
  }

  return response;
};

export const buildXeroAuthorizationUrl = (env: ServerEnv, state: string): string => {
  if (!isXeroConfigured(env)) {
    throw new XeroClientError('Xero integration is not configured on the server', 503);
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: env.xeroClientId,
    redirect_uri: env.xeroRedirectUri,
    scope: XERO_SCOPES,
    state,
  });

  return `${XERO_AUTHORIZE_URL}?${params.toString()}`;
};

export const exchangeXeroCode = async (env: ServerEnv, code: string): Promise<XeroTokenSet> => {
  if (!isXeroConfigured(env)) {
    throw new XeroClientError('Xero integration is not configured on the server', 503);
  }

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: env.xeroRedirectUri,
  });

  const credentials = Buffer.from(`${env.xeroClientId}:${env.xeroClientSecret}`).toString('base64');

  const response = await xeroFetch(
    XERO_TOKEN_URL,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    },
    'Failed to exchange Xero authorization code'
  );

  const payload = (await response.json()) as Record<string, unknown>;
  return parseTokenResponse(payload);
};

export const refreshXeroToken = async (
  env: ServerEnv,
  refreshToken: string
): Promise<XeroTokenSet> => {
  if (!isXeroConfigured(env)) {
    throw new XeroClientError('Xero integration is not configured on the server', 503);
  }

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const credentials = Buffer.from(`${env.xeroClientId}:${env.xeroClientSecret}`).toString('base64');

  const response = await xeroFetch(
    XERO_TOKEN_URL,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    },
    'Failed to refresh Xero access token'
  );

  const payload = (await response.json()) as Record<string, unknown>;
  return parseTokenResponse(payload);
};

export const fetchXeroConnections = async (accessToken: string): Promise<XeroConnection[]> => {
  const response = await xeroFetch(
    XERO_CONNECTIONS_URL,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    },
    'Failed to load Xero organisations'
  );

  const payload = (await response.json()) as Array<{
    id: string;
    tenantId: string;
    tenantName: string;
  }>;

  return payload.map((row) => ({
    id: row.id,
    tenantId: row.tenantId,
    tenantName: row.tenantName,
  }));
};

export const createXeroManualJournal = async (
  accessToken: string,
  xeroTenantId: string,
  input: {
    narration: string;
    date: string;
    lines: XeroManualJournalLine[];
  }
): Promise<string> => {
  const response = await xeroFetch(
    `${XERO_API_BASE}/ManualJournals`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'xero-tenant-id': xeroTenantId,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ManualJournals: [
          {
            Narration: input.narration,
            Date: input.date,
            Status: 'DRAFT',
            JournalLines: input.lines,
          },
        ],
      }),
    },
    'Failed to create Xero manual journal'
  );

  const payload = (await response.json()) as {
    ManualJournals?: Array<{ ManualJournalID?: string }>;
  };

  const journalId = payload.ManualJournals?.[0]?.ManualJournalID;
  if (!journalId) {
    throw new XeroClientError('Xero did not return a manual journal id', 502);
  }

  return journalId;
};
