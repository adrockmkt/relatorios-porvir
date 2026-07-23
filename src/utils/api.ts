import type { AuditLogRecord, AuthUser, ClientRecord, HealthRecord, ReportLinkPayload, ReportPayload, ReportRecord, SettingsRecord, UserRecord } from '../types';

const TOKEN_KEY = 'porvir_reports_hub_token';
const API_BASE_PATH = normalizeApiBasePath(import.meta.env.VITE_API_BASE_PATH || '/api');

function normalizeApiBasePath(path: string) {
  if (!path || path === '/') return '';
  return path.endsWith('/') ? path.slice(0, -1) : path;
}

function apiPath(path: string) {
  return `${API_BASE_PATH}${path}`;
}

export function getStoredToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (!token) {
    window.localStorage.removeItem(TOKEN_KEY);
    return;
  }
  window.localStorage.setItem(TOKEN_KEY, token);
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getStoredToken();
  const response = await fetch(apiPath(path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {})
    }
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.error || `Erro HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function queryString(params: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.set(key, value);
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export const api = {
  getSetupStatus: () => apiFetch<{ setupRequired: boolean }>('/auth/setup-status'),
  setupAdmin: (payload: { name: string; email: string; password: string }) =>
    apiFetch<{ message: string }>('/auth/setup', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  login: (payload: { email: string; password: string }) =>
    apiFetch<{ token: string; expiresAt: string; user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  me: () => apiFetch<{ user: AuthUser }>('/auth/me'),
  logout: () => apiFetch<{ success: boolean }>('/auth/logout', { method: 'POST' }),
  health: () => apiFetch<HealthRecord>('/health'),

  listUsers: () => apiFetch<UserRecord[]>('/users'),
  createUser: (payload: { name: string; email: string; password: string; role: UserRecord['role'] }) =>
    apiFetch<{ id: string }>('/users', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateUser: (id: string, payload: Partial<Pick<UserRecord, 'name' | 'email' | 'role' | 'status'>>) =>
    apiFetch<{ success: boolean }>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),
  resetUserPassword: (id: string, password: string) =>
    apiFetch<{ success: boolean }>(`/users/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ password })
    }),
  listUserClients: (id: string) => apiFetch<ClientRecord[]>(`/users/${id}/clients`),
  updateUserClients: (id: string, clientIds: string[]) =>
    apiFetch<{ success: boolean }>(`/users/${id}/clients`, {
      method: 'PUT',
      body: JSON.stringify({ clientIds })
    }),

  listClients: () => apiFetch<ClientRecord[]>('/clients'),
  createClient: (payload: { name: string; logoUrl?: string; description?: string; status?: ClientRecord['status'] }) =>
    apiFetch<{ id: string }>('/clients', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateClient: (id: string, payload: Partial<{ name: string; logoUrl: string; description: string; status: ClientRecord['status'] }>) =>
    apiFetch<{ success: boolean; archived?: boolean }>(`/clients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),
  deleteClient: (id: string) =>
    apiFetch<{ success: boolean; archived?: boolean }>(`/clients/${id}`, { method: 'DELETE' }),
  updateClientUsers: (id: string, userIds: string[]) =>
    apiFetch<{ success: boolean }>(`/clients/${id}/users`, {
      method: 'PUT',
      body: JSON.stringify({ userIds })
    }),

  listReports: (filters: { clientId?: string; periodType?: string; status?: string; search?: string } = {}) =>
    apiFetch<ReportRecord[]>(`/reports${queryString(filters)}`),
  getReport: (id: string) => apiFetch<ReportRecord>(`/reports/${id}`),
  createReport: (payload: ReportPayload) =>
    apiFetch<{ id: string }>('/reports', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateReport: (id: string, payload: Partial<ReportPayload>) =>
    apiFetch<{ success: boolean }>(`/reports/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),
  deleteReport: (id: string) =>
    apiFetch<{ success: boolean; archived?: boolean }>(`/reports/${id}`, { method: 'DELETE' }),
  createReportLink: (payload: ReportLinkPayload) =>
    apiFetch<{ id: string }>('/report-links', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateReportLink: (id: string, payload: Partial<ReportLinkPayload>) =>
    apiFetch<{ success: boolean }>(`/report-links/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),
  deleteReportLink: (id: string) =>
    apiFetch<{ success: boolean }>(`/report-links/${id}`, { method: 'DELETE' }),

  listAuditLogs: () => apiFetch<AuditLogRecord[]>('/audit-logs'),
  getPublicBrand: () => apiFetch<SettingsRecord['brand']>('/settings/public-brand'),
  getSettings: () => apiFetch<SettingsRecord>('/settings'),
  updateBrand: (payload: { appName: string; slogan: string; topLogoUrl: string }) =>
    apiFetch<{ success: boolean }>('/settings/brand', {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
};
