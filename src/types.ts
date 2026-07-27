export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  isAdmin: boolean;
}

export interface HealthRecord {
  status: string;
  database: string;
  backup?: {
    status: 'ok' | 'pending' | 'unavailable';
    lastBackupAt: string | null;
    file: string | null;
  };
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export interface ClientRecord {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  status: 'active' | 'inactive' | 'archived';
  created_at: string;
  updated_at: string;
  reports_count?: number;
  last_published_at?: string | null;
}

export type ReportPeriodType = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semiannual' | 'annual';
export type ReportStatus = 'draft' | 'published' | 'archived';
export type ReportLinkDestinationType = 'looker_studio' | 'google_drive' | 'google_sheets' | 'pdf' | 'presentation' | 'dashboard' | 'document' | 'other';

export interface ReportRecord {
  id: string;
  client_id: string;
  client_name?: string;
  client_logo_url?: string | null;
  title: string;
  description: string | null;
  period_type: ReportPeriodType;
  period_label: string | null;
  starts_at: string | null;
  ends_at: string | null;
  reference_year: number | null;
  reference_month: number | null;
  status: ReportStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  links_count?: number;
  links?: ReportLinkRecord[];
}

export interface ReportLinkRecord {
  id: string;
  report_id: string;
  title: string;
  url: string;
  destination_type: ReportLinkDestinationType;
  description: string | null;
  sort_order: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface ReportPayload {
  clientId: string;
  title: string;
  description?: string;
  periodType: ReportPeriodType;
  periodLabel?: string;
  startsAt?: string;
  endsAt?: string;
  referenceYear?: number | null;
  referenceMonth?: number | null;
  status: ReportStatus;
}

export interface ReportLinkPayload {
  reportId: string;
  title: string;
  url: string;
  destinationType: ReportLinkDestinationType;
  description?: string;
  sortOrder?: number;
  status?: 'active' | 'inactive';
}

export interface AuditLogRecord {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  actor_name: string | null;
  actor_email: string | null;
}

export interface SettingsRecord {
  brand: {
    appName: string;
    slogan: string;
    topLogoUrl: string;
    topLogoSize: number;
  };
}
