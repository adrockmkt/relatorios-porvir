import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, FileText, KeyRound, Link2, LogOut, Plus, RefreshCw, Save, ShieldCheck, Trash2, Users } from 'lucide-react';
import { api, setStoredToken } from './utils/api';
import type { AuthUser, ClientRecord, ReportLinkDestinationType, ReportLinkRecord, ReportPeriodType, ReportRecord, ReportStatus, SettingsRecord, UserRecord } from './types';

type Section = 'dashboard' | 'clients' | 'reports' | 'users' | 'settings';

type ReportFormState = {
  clientId: string;
  title: string;
  description: string;
  periodType: ReportPeriodType;
  periodLabel: string;
  startsAt: string;
  endsAt: string;
  status: ReportStatus;
};

type ReportFilterState = {
  clientId: string;
  periodType: string;
  status: string;
  search: string;
  dateFrom: string;
  dateTo: string;
};

type LinkFormState = {
  reportId: string;
  title: string;
  url: string;
  destinationType: ReportLinkDestinationType;
  description: string;
};

type LinkEditFormState = {
  id: string;
  title: string;
  url: string;
  destinationType: ReportLinkDestinationType;
  description: string;
  sortOrder: string;
  status: 'active' | 'inactive';
};

const DEFAULT_BRAND: SettingsRecord['brand'] = {
  appName: 'Porvir Reports Hub',
  slogan: 'Historico de relatorios e entregas Ad Rock',
  topLogoUrl: `${import.meta.env.BASE_URL}adrock-logo.png`,
  topLogoSize: 56
};

const periodLabels: Record<ReportPeriodType, string> = {
  daily: 'Diario',
  weekly: 'Semanal',
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  semiannual: 'Semestral',
  annual: 'Anual'
};

const statusLabels: Record<ReportStatus, string> = {
  draft: 'Rascunho',
  published: 'Publicado',
  archived: 'Arquivado'
};

const destinationLabels: Record<ReportLinkDestinationType, string> = {
  looker_studio: 'Looker Studio',
  google_drive: 'Google Drive',
  google_sheets: 'Google Sheets',
  pdf: 'PDF',
  presentation: 'Apresentacao',
  dashboard: 'Dashboard',
  document: 'Documento',
  other: 'Outro'
};

function App() {
  const [loading, setLoading] = useState(true);
  const [setupRequired, setSetupRequired] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [brand, setBrand] = useState(DEFAULT_BRAND);
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [message, setMessage] = useState('');
  const [authStatus, setAuthStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [userNotice, setUserNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [clientNotice, setClientNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [reportNotice, setReportNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedAdminClientId, setSelectedAdminClientId] = useState('');
  const [selectedReportId, setSelectedReportId] = useState('');
  const [selectedReportDetail, setSelectedReportDetail] = useState<ReportRecord | null>(null);
  const [assignedClientIds, setAssignedClientIds] = useState<string[]>([]);
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([]);
  const [userPasswordForm, setUserPasswordForm] = useState('');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [clientForm, setClientForm] = useState({ name: '', logoUrl: '', description: '' });
  const [clientEditForm, setClientEditForm] = useState({
    name: '',
    logoUrl: '',
    description: '',
    status: 'active' as ClientRecord['status']
  });
  const [reportForm, setReportForm] = useState({
    clientId: '',
    title: '',
    description: '',
    periodType: 'monthly' as ReportPeriodType,
    periodLabel: '',
    startsAt: '',
    endsAt: '',
    status: 'published' as ReportStatus
  });
  const [reportEditForm, setReportEditForm] = useState({
    clientId: '',
    title: '',
    description: '',
    periodType: 'monthly' as ReportPeriodType,
    periodLabel: '',
    startsAt: '',
    endsAt: '',
    status: 'draft' as ReportStatus
  });
  const [reportFilters, setReportFilters] = useState({
    clientId: '',
    periodType: '',
    status: '',
    search: '',
    dateFrom: '',
    dateTo: ''
  });
  const [linkForm, setLinkForm] = useState({
    reportId: '',
    title: '',
    url: '',
    destinationType: 'looker_studio' as ReportLinkDestinationType,
    description: ''
  });
  const [linkEditForm, setLinkEditForm] = useState({
    id: '',
    title: '',
    url: '',
    destinationType: 'looker_studio' as ReportLinkDestinationType,
    description: '',
    sortOrder: '0',
    status: 'active' as 'active' | 'inactive'
  });
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'viewer' as UserRecord['role']
  });
  const [userEditForm, setUserEditForm] = useState({
    name: '',
    email: '',
    role: 'viewer' as UserRecord['role'],
    status: 'active' as UserRecord['status']
  });
  const [brandForm, setBrandForm] = useState({
    appName: DEFAULT_BRAND.appName,
    slogan: DEFAULT_BRAND.slogan,
    topLogoUrl: DEFAULT_BRAND.topLogoUrl
  });

  const canManage = user ? ['admin', 'editor'].includes(user.role) : false;
  const canManageUsers = user?.role === 'admin';
  const visibleReports = useMemo(() => {
    if (!selectedClientId) return reports;
    return reports.filter((report) => report.client_id === selectedClientId);
  }, [reports, selectedClientId]);
  const selectedClient = clients.find((client) => client.id === selectedClientId) || clients[0] || null;
  const selectedAdminClient = clients.find((client) => client.id === selectedAdminClientId) || null;
  const selectedReport = reports.find((report) => report.id === selectedReportId) || null;
  const selectedUser = users.find((record) => record.id === selectedUserId) || null;

  useEffect(() => {
    void initialize();
  }, []);

  async function initialize() {
    setLoading(true);
    try {
      const publicBrand = await api.getPublicBrand().catch(() => null);
      if (publicBrand) {
        setBrand(normalizeBrand(publicBrand));
        setBrandForm({
          appName: publicBrand.appName,
          slogan: publicBrand.slogan,
          topLogoUrl: publicBrand.topLogoUrl
        });
      }

      const setup = await api.getSetupStatus();
      setSetupRequired(setup.setupRequired);
      if (!setup.setupRequired) {
        try {
          const me = await api.me();
          setUser(me.user);
          await loadAppData(me.user);
        } catch {
          setStoredToken(null);
          setUser(null);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadAppData(currentUser = user) {
    const [clientsResult, reportsResult, usersResult] = await Promise.all([
      api.listClients(),
      api.listReports(compactFilters(reportFilters)),
      currentUser?.role === 'admin' ? api.listUsers() : Promise.resolve([])
    ]);
    setClients(clientsResult);
    setReports(reportsResult);
    setUsers(usersResult);
    setSelectedClientId((current) => current || clientsResult[0]?.id || '');
    setReportForm((current) => ({ ...current, clientId: current.clientId || clientsResult[0]?.id || '' }));
    if (selectedReportId) {
      const stillSelectedReport = reportsResult.find((record) => record.id === selectedReportId);
      if (stillSelectedReport) {
        await handleSelectReport(stillSelectedReport, { refreshData: false });
      } else {
        clearSelectedReport();
      }
    }
    if (currentUser && ['admin', 'editor'].includes(currentUser.role)) {
      const stillSelectedClient = clientsResult.find((record) => record.id === selectedAdminClientId);
      const nextSelectedClient = stillSelectedClient || clientsResult[0] || null;
      if (nextSelectedClient && nextSelectedClient.id !== selectedAdminClientId) {
        await handleSelectAdminClient(nextSelectedClient, { refreshData: false });
      }
    }
    if (currentUser?.role === 'admin') {
      const stillSelected = usersResult.find((record) => record.id === selectedUserId);
      const nextSelected = stillSelected || usersResult[0] || null;
      if (nextSelected && nextSelected.id !== selectedUserId) {
        await handleSelectUser(nextSelected, { refreshData: false });
      }
    }
  }

  async function handleSetup(event: React.FormEvent) {
    event.preventDefault();
    setAuthSubmitting(true);
    setAuthStatus(null);
    try {
      const result = await api.setupAdmin(authForm);
      setStoredToken(result.token);
      setSetupRequired(false);
      setUser(result.user);
      setAuthForm({ name: '', email: '', password: '' });
      await loadAppData(result.user);
    } catch (error) {
      setAuthStatus({ type: 'error', text: error instanceof Error ? error.message : 'Nao foi possivel concluir o setup.' });
    } finally {
      setAuthSubmitting(false);
    }
  }

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setAuthSubmitting(true);
    setAuthStatus(null);
    try {
      const result = await api.login(loginForm);
      setStoredToken(result.token);
      setUser(result.user);
      setLoginForm({ email: '', password: '' });
      await loadAppData(result.user);
    } catch (error) {
      setStoredToken(null);
      setAuthStatus({ type: 'error', text: error instanceof Error ? error.message : 'Nao foi possivel entrar.' });
    } finally {
      setAuthSubmitting(false);
    }
  }

  async function handleLogout() {
    await api.logout().catch(() => null);
    setStoredToken(null);
    setUser(null);
    setAuthStatus({ type: 'success', text: 'Voce saiu do sistema.' });
  }

  async function handleCreateClient(event: React.FormEvent) {
    event.preventDefault();
    setClientNotice(null);
    try {
      const result = await api.createClient(clientForm);
      setClientForm({ name: '', logoUrl: '', description: '' });
      await loadAppData();
      setClientNotice({ type: 'success', text: 'Cliente cadastrado.' });
      await handleSelectAdminClient({
        id: result.id,
        name: clientForm.name,
        slug: '',
        logo_url: clientForm.logoUrl || null,
        description: clientForm.description || null,
        status: 'active',
        created_at: '',
        updated_at: ''
      }, { refreshData: false });
    } catch (error) {
      setClientNotice({ type: 'error', text: error instanceof Error ? error.message : 'Nao foi possivel cadastrar cliente.' });
    }
  }

  async function handleSelectAdminClient(record: ClientRecord, options: { refreshData?: boolean } = {}) {
    setSelectedAdminClientId(record.id);
    setClientEditForm({
      name: record.name,
      logoUrl: record.logo_url || '',
      description: record.description || '',
      status: record.status
    });
    if (user?.role !== 'admin') {
      setAssignedUserIds([]);
      if (options.refreshData) await loadAppData();
      return;
    }

    try {
      const assigned = await api.listClientUsers(record.id);
      setAssignedUserIds(assigned.map((assignedUser) => assignedUser.id));
      if (options.refreshData) await loadAppData();
    } catch (error) {
      setClientNotice({ type: 'error', text: error instanceof Error ? error.message : 'Nao foi possivel carregar usuarios do cliente.' });
    }
  }

  async function handleUpdateClient(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedAdminClientId) return;

    setClientNotice(null);
    try {
      await api.updateClient(selectedAdminClientId, clientEditForm);
      if (user?.role === 'admin') {
        await api.updateClientUsers(selectedAdminClientId, assignedUserIds);
      }
      await loadAppData();
      setClientNotice({ type: 'success', text: 'Cliente atualizado.' });
    } catch (error) {
      setClientNotice({ type: 'error', text: error instanceof Error ? error.message : 'Nao foi possivel atualizar cliente.' });
    }
  }

  async function handleArchiveOrDeleteClient() {
    if (!selectedAdminClient) return;
    const confirmed = window.confirm(`Remover o cliente ${selectedAdminClient.name}? Se houver relatorios, ele sera arquivado para preservar historico.`);
    if (!confirmed) return;

    setClientNotice(null);
    try {
      const result = await api.deleteClient(selectedAdminClient.id);
      setSelectedAdminClientId('');
      setAssignedUserIds([]);
      setClientEditForm({ name: '', logoUrl: '', description: '', status: 'active' });
      await loadAppData();
      setClientNotice({ type: 'success', text: result.archived ? 'Cliente arquivado para preservar historico.' : 'Cliente excluido.' });
    } catch (error) {
      setClientNotice({ type: 'error', text: error instanceof Error ? error.message : 'Nao foi possivel remover cliente.' });
    }
  }

  function handleToggleAssignedUser(userId: string) {
    setAssignedUserIds((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId]
    );
  }

  async function handleCreateReport(event: React.FormEvent) {
    event.preventDefault();
    setReportNotice(null);
    try {
      const result = await api.createReport(toReportPayload(reportForm));
      setReportForm((current) => ({ ...current, title: '', description: '', periodLabel: '' }));
      await loadAppData();
      setReportNotice({ type: 'success', text: 'Relatorio cadastrado.' });
      const created = await api.getReport(result.id);
      await handleSelectReport(created, { refreshData: false });
    } catch (error) {
      setReportNotice({ type: 'error', text: error instanceof Error ? error.message : 'Nao foi possivel cadastrar relatorio.' });
    }
  }

  async function handleCreateLink(event: React.FormEvent) {
    event.preventDefault();
    setReportNotice(null);
    try {
      await api.createReportLink(linkForm);
      setLinkForm((current) => ({ ...current, title: '', url: '', description: '' }));
      await refreshSelectedReport();
      await loadAppData();
      setReportNotice({ type: 'success', text: 'Link adicionado.' });
    } catch (error) {
      setReportNotice({ type: 'error', text: error instanceof Error ? error.message : 'Nao foi possivel adicionar link.' });
    }
  }

  async function handleSelectReport(record: ReportRecord, options: { refreshData?: boolean } = {}) {
    setSelectedReportId(record.id);
    const detail = record.links ? record : await api.getReport(record.id);
    setSelectedReportDetail(detail);
    setReportEditForm({
      clientId: detail.client_id,
      title: detail.title,
      description: detail.description || '',
      periodType: detail.period_type,
      periodLabel: detail.period_label || '',
      startsAt: detail.starts_at || '',
      endsAt: detail.ends_at || '',
      status: detail.status
    });
    setLinkForm((current) => ({ ...current, reportId: detail.id }));
    clearLinkEditForm();
    if (options.refreshData) await loadAppData();
  }

  async function refreshSelectedReport() {
    if (!selectedReportId) return;
    const detail = await api.getReport(selectedReportId);
    setSelectedReportDetail(detail);
  }

  function clearSelectedReport() {
    setSelectedReportId('');
    setSelectedReportDetail(null);
    setReportEditForm({ clientId: '', title: '', description: '', periodType: 'monthly', periodLabel: '', startsAt: '', endsAt: '', status: 'draft' });
    clearLinkEditForm();
  }

  function clearLinkEditForm() {
    setLinkEditForm({ id: '', title: '', url: '', destinationType: 'looker_studio', description: '', sortOrder: '0', status: 'active' });
  }

  async function handleUpdateReport(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedReportId) return;
    setReportNotice(null);
    try {
      await api.updateReport(selectedReportId, toReportPayload(reportEditForm));
      await refreshSelectedReport();
      await loadAppData();
      setReportNotice({ type: 'success', text: 'Relatorio atualizado.' });
    } catch (error) {
      setReportNotice({ type: 'error', text: error instanceof Error ? error.message : 'Nao foi possivel atualizar relatorio.' });
    }
  }

  async function handleArchiveReport() {
    if (!selectedReport) return;
    const confirmed = window.confirm(`Arquivar o relatorio "${selectedReport.title}"?`);
    if (!confirmed) return;
    setReportNotice(null);
    try {
      await api.deleteReport(selectedReport.id);
      await loadAppData();
      clearSelectedReport();
      setReportNotice({ type: 'success', text: 'Relatorio arquivado.' });
    } catch (error) {
      setReportNotice({ type: 'error', text: error instanceof Error ? error.message : 'Nao foi possivel arquivar relatorio.' });
    }
  }

  function handleSelectLink(link: NonNullable<ReportRecord['links']>[number]) {
    setLinkEditForm({
      id: link.id,
      title: link.title,
      url: link.url,
      destinationType: link.destination_type,
      description: link.description || '',
      sortOrder: String(link.sort_order || 0),
      status: link.status
    });
  }

  async function handleUpdateLink(event: React.FormEvent) {
    event.preventDefault();
    if (!linkEditForm.id || !selectedReportId) return;
    setReportNotice(null);
    try {
      await api.updateReportLink(linkEditForm.id, {
        reportId: selectedReportId,
        title: linkEditForm.title,
        url: linkEditForm.url,
        destinationType: linkEditForm.destinationType,
        description: linkEditForm.description,
        sortOrder: Number(linkEditForm.sortOrder) || 0,
        status: linkEditForm.status
      });
      await refreshSelectedReport();
      await loadAppData();
      setReportNotice({ type: 'success', text: 'Link atualizado.' });
    } catch (error) {
      setReportNotice({ type: 'error', text: error instanceof Error ? error.message : 'Nao foi possivel atualizar link.' });
    }
  }

  async function handleDeleteLink() {
    if (!linkEditForm.id) return;
    const confirmed = window.confirm(`Excluir o link "${linkEditForm.title}"?`);
    if (!confirmed) return;
    setReportNotice(null);
    try {
      await api.deleteReportLink(linkEditForm.id);
      clearLinkEditForm();
      await refreshSelectedReport();
      await loadAppData();
      setReportNotice({ type: 'success', text: 'Link excluido.' });
    } catch (error) {
      setReportNotice({ type: 'error', text: error instanceof Error ? error.message : 'Nao foi possivel excluir link.' });
    }
  }

  async function handleApplyReportFilters(event: React.FormEvent) {
    event.preventDefault();
    setReportNotice(null);
    const filtered = await api.listReports(compactFilters(reportFilters));
    setReports(filtered);
    clearSelectedReport();
  }

  async function handleClearReportFilters() {
    const emptyFilters = { clientId: '', periodType: '', status: '', search: '', dateFrom: '', dateTo: '' };
    setReportFilters(emptyFilters);
    const allReports = await api.listReports();
    setReports(allReports);
    clearSelectedReport();
  }

  async function handleCreateUser(event: React.FormEvent) {
    event.preventDefault();
    setUserNotice(null);
    try {
      const result = await api.createUser(userForm);
      setUserForm({ name: '', email: '', password: '', role: 'viewer' });
      await loadAppData();
      setUserNotice({ type: 'success', text: 'Usuario cadastrado.' });
      const createdUser = { id: result.id, name: userForm.name, email: userForm.email, role: userForm.role, status: 'active' as const };
      await handleSelectUser(createdUser, { refreshData: false });
    } catch (error) {
      setUserNotice({ type: 'error', text: error instanceof Error ? error.message : 'Nao foi possivel cadastrar usuario.' });
    }
  }

  async function handleSelectUser(record: Pick<UserRecord, 'id' | 'name' | 'email' | 'role' | 'status'>, options: { refreshData?: boolean } = {}) {
    setSelectedUserId(record.id);
    setUserEditForm({
      name: record.name,
      email: record.email,
      role: record.role,
      status: record.status
    });
    setUserPasswordForm('');
    try {
      const assigned = await api.listUserClients(record.id);
      setAssignedClientIds(assigned.map((client) => client.id));
      if (options.refreshData) await loadAppData();
    } catch (error) {
      setUserNotice({ type: 'error', text: error instanceof Error ? error.message : 'Nao foi possivel carregar clientes do usuario.' });
    }
  }

  async function handleUpdateUser(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedUserId) return;

    setUserNotice(null);
    try {
      await api.updateUser(selectedUserId, userEditForm);
      await api.updateUserClients(selectedUserId, assignedClientIds);
      await loadAppData();
      setUserNotice({ type: 'success', text: 'Usuario atualizado.' });
    } catch (error) {
      setUserNotice({ type: 'error', text: error instanceof Error ? error.message : 'Nao foi possivel atualizar usuario.' });
    }
  }

  async function handleResetUserPassword(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedUserId) return;

    setUserNotice(null);
    try {
      await api.resetUserPassword(selectedUserId, userPasswordForm);
      setUserPasswordForm('');
      setUserNotice({ type: 'success', text: 'Senha atualizada.' });
    } catch (error) {
      setUserNotice({ type: 'error', text: error instanceof Error ? error.message : 'Nao foi possivel trocar a senha.' });
    }
  }

  async function handleToggleSelectedUserStatus() {
    if (!selectedUser) return;
    const nextStatus = selectedUser.status === 'active' ? 'inactive' : 'active';
    setUserNotice(null);
    try {
      await api.updateUser(selectedUser.id, { status: nextStatus });
      await loadAppData();
      setUserEditForm((current) => ({ ...current, status: nextStatus }));
      setUserNotice({ type: 'success', text: nextStatus === 'active' ? 'Usuario reativado.' : 'Usuario inativado.' });
    } catch (error) {
      setUserNotice({ type: 'error', text: error instanceof Error ? error.message : 'Nao foi possivel alterar status.' });
    }
  }

  async function handleDeleteSelectedUser() {
    if (!selectedUser) return;
    const confirmed = window.confirm(`Excluir definitivamente o usuario ${selectedUser.name}? Esta acao remove sessoes e vinculos de cliente.`);
    if (!confirmed) return;

    setUserNotice(null);
    try {
      await api.deleteUser(selectedUser.id);
      setSelectedUserId('');
      setAssignedClientIds([]);
      setUserEditForm({ name: '', email: '', role: 'viewer', status: 'active' });
      await loadAppData();
      setUserNotice({ type: 'success', text: 'Usuario excluido.' });
    } catch (error) {
      setUserNotice({ type: 'error', text: error instanceof Error ? error.message : 'Nao foi possivel excluir usuario.' });
    }
  }

  function handleToggleAssignedClient(clientId: string) {
    setAssignedClientIds((current) =>
      current.includes(clientId)
        ? current.filter((id) => id !== clientId)
        : [...current, clientId]
    );
  }

  async function handleUpdateBrand(event: React.FormEvent) {
    event.preventDefault();
    await api.updateBrand(brandForm);
    const updatedBrand = normalizeBrand(brandForm);
    setBrand(updatedBrand);
    setMessage('Marca atualizada.');
  }

  if (loading) {
    return <FullScreenState title="Carregando" text="Preparando o portal de relatorios." />;
  }

  if (setupRequired) {
    return (
      <AuthShell brand={brand}>
        <form onSubmit={handleSetup} className="adrock-form-shell space-y-4">
          <PanelTitle title="Setup inicial" text="Crie o primeiro administrador desta instalacao." />
          <AuthNotice status={authStatus} />
          <Input label="Nome" value={authForm.name} onChange={(value) => setAuthForm({ ...authForm, name: value })} required />
          <Input label="Email" type="email" value={authForm.email} onChange={(value) => setAuthForm({ ...authForm, email: value })} required />
          <Input label="Senha" type="password" value={authForm.password} onChange={(value) => setAuthForm({ ...authForm, password: value })} required minLength={8} />
          <p className="text-xs font-semibold text-neutral-500">Use pelo menos 8 caracteres.</p>
          <PrimaryButton label={authSubmitting ? 'Criando...' : 'Criar administrador'} disabled={authSubmitting} />
        </form>
      </AuthShell>
    );
  }

  if (!user) {
    return (
      <AuthShell brand={brand}>
        <form onSubmit={handleLogin} className="adrock-form-shell space-y-4">
          <PanelTitle title="Entrar" text="Acesse os relatorios publicados para os clientes atribuidos ao seu usuario." />
          <AuthNotice status={authStatus} />
          {message ? <p className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-900">{message}</p> : null}
          <Input label="Email" type="email" value={loginForm.email} onChange={(value) => setLoginForm({ ...loginForm, email: value })} required />
          <Input label="Senha" type="password" value={loginForm.password} onChange={(value) => setLoginForm({ ...loginForm, password: value })} required />
          <PrimaryButton label={authSubmitting ? 'Entrando...' : 'Entrar'} disabled={authSubmitting} />
        </form>
      </AuthShell>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="bg-adrock-surface flex flex-col gap-4 rounded-2xl border border-white/80 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <img src={brand.topLogoUrl} alt="" className="h-14 w-14 rounded-xl object-contain" />
            <div>
              <h1 className="text-2xl font-bold text-neutral-950">{brand.appName}</h1>
              <p className="text-sm text-neutral-600">{brand.slogan}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-700">{user.name} · {user.role}</span>
            <button onClick={() => void loadAppData()} className="rounded-xl border border-sky-200 bg-white p-2 text-neutral-700" title="Atualizar">
              <RefreshCw size={18} />
            </button>
            <button onClick={() => void handleLogout()} className="rounded-xl border border-sky-200 bg-white p-2 text-neutral-700" title="Sair">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <nav className="flex flex-wrap gap-2">
          <NavButton active={activeSection === 'dashboard'} label="Dashboard" onClick={() => setActiveSection('dashboard')} />
          <NavButton active={activeSection === 'clients'} label="Clientes" onClick={() => setActiveSection('clients')} />
          <NavButton active={activeSection === 'reports'} label="Relatorios" onClick={() => setActiveSection('reports')} />
          {canManageUsers ? <NavButton active={activeSection === 'users'} label="Usuarios" onClick={() => setActiveSection('users')} /> : null}
          {canManageUsers ? <NavButton active={activeSection === 'settings'} label="Marca" onClick={() => setActiveSection('settings')} /> : null}
        </nav>

        {activeSection === 'dashboard' ? <Dashboard clients={clients} reports={visibleReports} selectedClient={selectedClient} selectedClientId={selectedClientId} onSelectClient={setSelectedClientId} /> : null}

        {activeSection === 'clients' ? (
          <ClientAdmin
            clients={clients}
            users={users}
            canManage={canManage}
            canAssignUsers={canManageUsers}
            selectedClient={selectedAdminClient}
            selectedClientId={selectedAdminClientId}
            clientForm={clientForm}
            clientEditForm={clientEditForm}
            assignedUserIds={assignedUserIds}
            notice={clientNotice}
            onSelectClient={(record) => void handleSelectAdminClient(record)}
            onCreateClient={handleCreateClient}
            onChangeClientForm={setClientForm}
            onChangeClientEditForm={setClientEditForm}
            onToggleAssignedUser={handleToggleAssignedUser}
            onUpdateClient={handleUpdateClient}
            onArchiveOrDeleteClient={() => void handleArchiveOrDeleteClient()}
          />
        ) : null}

        {activeSection === 'reports' ? (
          <ReportAdmin
            reports={reports}
            clients={clients}
            canManage={canManage}
            selectedReportId={selectedReportId}
            selectedReportDetail={selectedReportDetail}
            reportForm={reportForm}
            reportEditForm={reportEditForm}
            reportFilters={reportFilters}
            linkForm={linkForm}
            linkEditForm={linkEditForm}
            notice={reportNotice}
            onSelectReport={(record) => void handleSelectReport(record)}
            onCreateReport={handleCreateReport}
            onUpdateReport={handleUpdateReport}
            onArchiveReport={() => void handleArchiveReport()}
            onChangeReportForm={setReportForm}
            onChangeReportEditForm={setReportEditForm}
            onChangeReportFilters={setReportFilters}
            onApplyFilters={handleApplyReportFilters}
            onClearFilters={() => void handleClearReportFilters()}
            onCreateLink={handleCreateLink}
            onChangeLinkForm={setLinkForm}
            onSelectLink={handleSelectLink}
            onChangeLinkEditForm={setLinkEditForm}
            onUpdateLink={handleUpdateLink}
            onDeleteLink={() => void handleDeleteLink()}
          />
        ) : null}

        {activeSection === 'users' && canManageUsers ? (
          <UserAdmin
            users={users}
            clients={clients}
            currentUserId={user.id}
            selectedUser={selectedUser}
            selectedUserId={selectedUserId}
            userForm={userForm}
            userEditForm={userEditForm}
            userPasswordForm={userPasswordForm}
            assignedClientIds={assignedClientIds}
            notice={userNotice}
            onSelectUser={(record) => void handleSelectUser(record)}
            onCreateUser={handleCreateUser}
            onChangeUserForm={setUserForm}
            onChangeUserEditForm={setUserEditForm}
            onChangeUserPassword={setUserPasswordForm}
            onToggleAssignedClient={handleToggleAssignedClient}
            onUpdateUser={handleUpdateUser}
            onResetPassword={handleResetUserPassword}
            onToggleStatus={() => void handleToggleSelectedUserStatus()}
            onDeleteUser={() => void handleDeleteSelectedUser()}
          />
        ) : null}

        {activeSection === 'settings' && canManageUsers ? (
          <Panel title="Marca do sistema" icon={<ShieldCheck size={20} />}>
            <form onSubmit={handleUpdateBrand} className="adrock-form-shell grid gap-4 lg:grid-cols-3">
              <Input label="Titulo" value={brandForm.appName} onChange={(value) => setBrandForm({ ...brandForm, appName: value })} required />
              <Input label="Slogan" value={brandForm.slogan} onChange={(value) => setBrandForm({ ...brandForm, slogan: value })} />
              <Input label="Logo URL" value={brandForm.topLogoUrl} onChange={(value) => setBrandForm({ ...brandForm, topLogoUrl: value })} />
              <div className="lg:col-span-3">
                <PrimaryButton label="Salvar marca" />
              </div>
            </form>
          </Panel>
        ) : null}
      </div>
    </div>
  );
}

function ReportAdmin({
  reports,
  clients,
  canManage,
  selectedReportId,
  selectedReportDetail,
  reportForm,
  reportEditForm,
  reportFilters,
  linkForm,
  linkEditForm,
  notice,
  onSelectReport,
  onCreateReport,
  onUpdateReport,
  onArchiveReport,
  onChangeReportForm,
  onChangeReportEditForm,
  onChangeReportFilters,
  onApplyFilters,
  onClearFilters,
  onCreateLink,
  onChangeLinkForm,
  onSelectLink,
  onChangeLinkEditForm,
  onUpdateLink,
  onDeleteLink
}: {
  reports: ReportRecord[];
  clients: ClientRecord[];
  canManage: boolean;
  selectedReportId: string;
  selectedReportDetail: ReportRecord | null;
  reportForm: ReportFormState;
  reportEditForm: ReportFormState;
  reportFilters: ReportFilterState;
  linkForm: LinkFormState;
  linkEditForm: LinkEditFormState;
  notice: { type: 'success' | 'error'; text: string } | null;
  onSelectReport: (record: ReportRecord) => void;
  onCreateReport: (event: React.FormEvent) => void;
  onUpdateReport: (event: React.FormEvent) => void;
  onArchiveReport: () => void;
  onChangeReportForm: (form: ReportFormState) => void;
  onChangeReportEditForm: (form: ReportFormState) => void;
  onChangeReportFilters: (filters: ReportFilterState) => void;
  onApplyFilters: (event: React.FormEvent) => void;
  onClearFilters: () => void;
  onCreateLink: (event: React.FormEvent) => void;
  onChangeLinkForm: (form: LinkFormState) => void;
  onSelectLink: (link: ReportLinkRecord) => void;
  onChangeLinkEditForm: (form: LinkEditFormState) => void;
  onUpdateLink: (event: React.FormEvent) => void;
  onDeleteLink: () => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <div className="space-y-6">
        <Panel title="Relatorios" icon={<FileText size={20} />}>
          <AuthNotice status={notice} />
          <form onSubmit={onApplyFilters} className="adrock-form-shell mt-4 space-y-3">
            <Input label="Busca" value={reportFilters.search} onChange={(value) => onChangeReportFilters({ ...reportFilters, search: value })} placeholder="Titulo ou descricao" />
            <Select label="Cliente" value={reportFilters.clientId} onChange={(value) => onChangeReportFilters({ ...reportFilters, clientId: value })} options={clients.map((client) => ({ value: client.id, label: client.name }))} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Select label="Periodo" value={reportFilters.periodType} onChange={(value) => onChangeReportFilters({ ...reportFilters, periodType: value })} options={Object.entries(periodLabels).map(([value, label]) => ({ value, label }))} />
              <Select label="Status" value={reportFilters.status} onChange={(value) => onChangeReportFilters({ ...reportFilters, status: value })} options={Object.entries(statusLabels).map(([value, label]) => ({ value, label }))} />
              <Input label="De" type="date" value={reportFilters.dateFrom} onChange={(value) => onChangeReportFilters({ ...reportFilters, dateFrom: value })} />
              <Input label="Ate" type="date" value={reportFilters.dateTo} onChange={(value) => onChangeReportFilters({ ...reportFilters, dateTo: value })} />
            </div>
            <div className="flex flex-wrap gap-2">
              <PrimaryButton label="Filtrar" />
              <ActionButton label="Limpar" onClick={onClearFilters} />
            </div>
          </form>

          <div className="mt-5 space-y-3">
            {reports.length === 0 ? (
              <p className="rounded-xl border border-dashed border-sky-200 bg-white/70 p-5 text-sm text-neutral-600">Nenhum relatorio encontrado.</p>
            ) : reports.map((report) => (
              <button
                key={report.id}
                type="button"
                onClick={() => onSelectReport(report)}
                className={`w-full rounded-2xl border p-4 text-left transition ${selectedReportId === report.id ? 'border-orange-300 bg-orange-50' : 'border-sky-100 bg-white hover:border-orange-200'}`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-neutral-950">{report.title}</h3>
                  <Badge>{statusLabels[report.status]}</Badge>
                  <Badge>{periodLabels[report.period_type]}</Badge>
                </div>
                <p className="mt-1 text-sm text-neutral-600">{report.client_name} · {report.period_label || formatPeriod(report)}</p>
                <p className="mt-2 text-sm font-semibold text-neutral-500">{report.links_count || 0} links</p>
              </button>
            ))}
          </div>
        </Panel>

        {canManage ? (
          <Panel title="Novo relatorio" icon={<Plus size={20} />}>
            <ReportForm form={reportForm} clients={clients} onChange={onChangeReportForm} onSubmit={onCreateReport} submitLabel="Cadastrar relatorio" />
          </Panel>
        ) : null}
      </div>

      <div className="space-y-6">
        <Panel title="Editar relatorio" icon={<Save size={20} />}>
          {selectedReportDetail && canManage ? (
            <div className="space-y-6">
              <ReportForm form={reportEditForm} clients={clients} onChange={onChangeReportEditForm} onSubmit={onUpdateReport} submitLabel="Salvar relatorio" />
              <div className="flex flex-wrap gap-3">
                <ActionButton label="Arquivar relatorio" onClick={onArchiveReport} danger icon={<Trash2 size={16} />} />
              </div>
            </div>
          ) : selectedReportDetail ? (
            <ReportReadOnly report={selectedReportDetail} />
          ) : (
            <p className="rounded-xl border border-dashed border-sky-200 bg-white/70 p-5 text-sm text-neutral-600">Selecione um relatorio.</p>
          )}
        </Panel>

        <Panel title="Links do relatorio" icon={<Link2 size={20} />}>
          {selectedReportDetail ? (
            <div className="space-y-5">
              <div className="space-y-2">
                {selectedReportDetail.links?.length ? selectedReportDetail.links.map((link) => (
                  <div key={link.id} className="rounded-2xl border border-sky-100 bg-white p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-neutral-950">{link.title}</h3>
                          <Badge>{destinationLabels[link.destination_type]}</Badge>
                          <Badge>{link.status === 'active' ? 'Ativo' : 'Inativo'}</Badge>
                        </div>
                        <p className="mt-1 break-all text-sm text-neutral-600">{link.url}</p>
                        {link.description ? <p className="mt-2 text-sm text-neutral-700">{link.description}</p> : null}
                      </div>
                      <div className="flex gap-2">
                        <a href={link.url} target="_blank" rel="noreferrer" className="rounded-xl border border-sky-200 bg-white p-2 text-neutral-700" title="Abrir link">
                          <ExternalLink size={16} />
                        </a>
                        {canManage ? <button type="button" onClick={() => onSelectLink(link)} className="rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm font-bold text-neutral-700">Editar</button> : null}
                      </div>
                    </div>
                  </div>
                )) : (
                  <p className="rounded-xl border border-dashed border-sky-200 bg-white/70 p-5 text-sm text-neutral-600">Nenhum link cadastrado neste relatorio.</p>
                )}
              </div>

              {canManage ? (
                <div className="grid gap-6 lg:grid-cols-2">
                  <div>
                    <h3 className="mb-3 text-sm font-bold text-neutral-700">Adicionar link</h3>
                    <LinkForm form={{ ...linkForm, reportId: selectedReportDetail.id }} onChange={(form) => onChangeLinkForm({ ...form, reportId: selectedReportDetail.id })} onSubmit={onCreateLink} submitLabel="Adicionar link" />
                  </div>
                  <div>
                    <h3 className="mb-3 text-sm font-bold text-neutral-700">Editar link</h3>
                    {linkEditForm.id ? (
                      <div className="space-y-4">
                        <LinkEditForm form={linkEditForm} onChange={onChangeLinkEditForm} onSubmit={onUpdateLink} />
                        <ActionButton label="Excluir link" onClick={onDeleteLink} danger icon={<Trash2 size={16} />} />
                      </div>
                    ) : (
                      <p className="rounded-xl border border-dashed border-sky-200 bg-white/70 p-5 text-sm text-neutral-600">Selecione um link para editar.</p>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-sky-200 bg-white/70 p-5 text-sm text-neutral-600">Selecione um relatorio para ver os links.</p>
          )}
        </Panel>
      </div>
    </div>
  );
}

function ReportForm({ form, clients, onChange, onSubmit, submitLabel }: { form: ReportFormState; clients: ClientRecord[]; onChange: (form: ReportFormState) => void; onSubmit: (event: React.FormEvent) => void; submitLabel: string }) {
  return (
    <form onSubmit={onSubmit} className="adrock-form-shell space-y-4">
      <Select label="Cliente" value={form.clientId} onChange={(value) => onChange({ ...form, clientId: value })} options={clients.map((client) => ({ value: client.id, label: client.name }))} required />
      <Input label="Titulo" value={form.title} onChange={(value) => onChange({ ...form, title: value })} required />
      <Select label="Periodo" value={form.periodType} onChange={(value) => onChange({ ...form, periodType: value as ReportPeriodType })} options={Object.entries(periodLabels).map(([value, label]) => ({ value, label }))} />
      <Input label="Rotulo do periodo" value={form.periodLabel} onChange={(value) => onChange({ ...form, periodLabel: value })} placeholder="Ex.: Julho/2026" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input label="Inicio" type="date" value={form.startsAt} onChange={(value) => onChange({ ...form, startsAt: value })} />
        <Input label="Fim" type="date" value={form.endsAt} onChange={(value) => onChange({ ...form, endsAt: value })} />
      </div>
      <Select label="Status" value={form.status} onChange={(value) => onChange({ ...form, status: value as ReportStatus })} options={Object.entries(statusLabels).map(([value, label]) => ({ value, label }))} />
      <Textarea label="Descricao" value={form.description} onChange={(value) => onChange({ ...form, description: value })} />
      <PrimaryButton label={submitLabel} />
    </form>
  );
}

function LinkForm({ form, onChange, onSubmit, submitLabel }: { form: LinkFormState; onChange: (form: LinkFormState) => void; onSubmit: (event: React.FormEvent) => void; submitLabel: string }) {
  return (
    <form onSubmit={onSubmit} className="adrock-form-shell space-y-4">
      <Input label="Titulo do link" value={form.title} onChange={(value) => onChange({ ...form, title: value })} required />
      <Input label="URL" type="url" value={form.url} onChange={(value) => onChange({ ...form, url: value })} required />
      <Select label="Tipo" value={form.destinationType} onChange={(value) => onChange({ ...form, destinationType: value as ReportLinkDestinationType })} options={Object.entries(destinationLabels).map(([value, label]) => ({ value, label }))} />
      <Textarea label="Descricao" value={form.description} onChange={(value) => onChange({ ...form, description: value })} />
      <PrimaryButton label={submitLabel} />
    </form>
  );
}

function LinkEditForm({ form, onChange, onSubmit }: { form: LinkEditFormState; onChange: (form: LinkEditFormState) => void; onSubmit: (event: React.FormEvent) => void }) {
  return (
    <form onSubmit={onSubmit} className="adrock-form-shell space-y-4">
      <Input label="Titulo do link" value={form.title} onChange={(value) => onChange({ ...form, title: value })} required />
      <Input label="URL" type="url" value={form.url} onChange={(value) => onChange({ ...form, url: value })} required />
      <Select label="Tipo" value={form.destinationType} onChange={(value) => onChange({ ...form, destinationType: value as ReportLinkDestinationType })} options={Object.entries(destinationLabels).map(([value, label]) => ({ value, label }))} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input label="Ordem" type="number" value={form.sortOrder} onChange={(value) => onChange({ ...form, sortOrder: value })} />
        <Select label="Status" value={form.status} onChange={(value) => onChange({ ...form, status: value as 'active' | 'inactive' })} options={[
          { value: 'active', label: 'Ativo' },
          { value: 'inactive', label: 'Inativo' }
        ]} />
      </div>
      <Textarea label="Descricao" value={form.description} onChange={(value) => onChange({ ...form, description: value })} />
      <PrimaryButton label="Salvar link" />
    </form>
  );
}

function ReportReadOnly({ report }: { report: ReportRecord }) {
  return (
    <div className="rounded-2xl border border-sky-100 bg-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-xl font-bold text-neutral-950">{report.title}</h2>
        <Badge>{statusLabels[report.status]}</Badge>
        <Badge>{periodLabels[report.period_type]}</Badge>
      </div>
      <p className="mt-2 text-sm text-neutral-600">{report.client_name} · {report.period_label || formatPeriod(report)}</p>
      {report.description ? <p className="mt-3 text-sm text-neutral-700">{report.description}</p> : null}
    </div>
  );
}

function ClientAdmin({
  clients,
  users,
  canManage,
  canAssignUsers,
  selectedClient,
  selectedClientId,
  clientForm,
  clientEditForm,
  assignedUserIds,
  notice,
  onSelectClient,
  onCreateClient,
  onChangeClientForm,
  onChangeClientEditForm,
  onToggleAssignedUser,
  onUpdateClient,
  onArchiveOrDeleteClient
}: {
  clients: ClientRecord[];
  users: UserRecord[];
  canManage: boolean;
  canAssignUsers: boolean;
  selectedClient: ClientRecord | null;
  selectedClientId: string;
  clientForm: { name: string; logoUrl: string; description: string };
  clientEditForm: { name: string; logoUrl: string; description: string; status: ClientRecord['status'] };
  assignedUserIds: string[];
  notice: { type: 'success' | 'error'; text: string } | null;
  onSelectClient: (record: ClientRecord) => void;
  onCreateClient: (event: React.FormEvent) => void;
  onChangeClientForm: (form: { name: string; logoUrl: string; description: string }) => void;
  onChangeClientEditForm: (form: { name: string; logoUrl: string; description: string; status: ClientRecord['status'] }) => void;
  onToggleAssignedUser: (userId: string) => void;
  onUpdateClient: (event: React.FormEvent) => void;
  onArchiveOrDeleteClient: () => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <div className="space-y-6">
        <Panel title="Clientes" icon={<ShieldCheck size={20} />}>
          <AuthNotice status={notice} />
          <div className="mt-4 space-y-3">
            {clients.length === 0 ? (
              <p className="rounded-xl border border-dashed border-sky-200 bg-white/70 p-5 text-sm text-neutral-600">Nenhum cliente cadastrado.</p>
            ) : clients.map((client) => (
              <button
                key={client.id}
                type="button"
                onClick={() => onSelectClient(client)}
                className={`w-full rounded-2xl border p-4 text-left transition ${selectedClientId === client.id ? 'border-orange-300 bg-orange-50' : 'border-sky-100 bg-white hover:border-orange-200'}`}
              >
                <div className="flex items-start gap-3">
                  {client.logo_url ? <img src={client.logo_url} alt="" className="h-10 w-10 rounded-lg object-contain" /> : <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sm font-bold text-sky-700">{client.name.slice(0, 1).toUpperCase()}</span>}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-neutral-950">{client.name}</h3>
                      <Badge>{client.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-neutral-600">{client.reports_count || 0} relatorios</p>
                    <p className="mt-2 text-sm text-neutral-500">{client.description || 'Sem descricao.'}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Panel>

        {canManage ? (
          <Panel title="Novo cliente" icon={<Plus size={20} />}>
            <form onSubmit={onCreateClient} className="adrock-form-shell space-y-4">
              <Input label="Nome" value={clientForm.name} onChange={(value) => onChangeClientForm({ ...clientForm, name: value })} required />
              <Input label="Logo URL" value={clientForm.logoUrl} onChange={(value) => onChangeClientForm({ ...clientForm, logoUrl: value })} />
              <Textarea label="Descricao" value={clientForm.description} onChange={(value) => onChangeClientForm({ ...clientForm, description: value })} />
              <PrimaryButton label="Cadastrar cliente" />
            </form>
          </Panel>
        ) : null}
      </div>

      <div className="space-y-6">
        <Panel title="Editar cliente" icon={<Save size={20} />}>
          {selectedClient && canManage ? (
            <form onSubmit={onUpdateClient} className="adrock-form-shell space-y-5">
              <div className="grid gap-4 lg:grid-cols-2">
                <Input label="Nome" value={clientEditForm.name} onChange={(value) => onChangeClientEditForm({ ...clientEditForm, name: value })} required />
                <Input label="Logo URL" value={clientEditForm.logoUrl} onChange={(value) => onChangeClientEditForm({ ...clientEditForm, logoUrl: value })} />
                <div className="lg:col-span-2">
                  <Textarea label="Descricao" value={clientEditForm.description} onChange={(value) => onChangeClientEditForm({ ...clientEditForm, description: value })} />
                </div>
                <Select label="Status" value={clientEditForm.status} onChange={(value) => onChangeClientEditForm({ ...clientEditForm, status: value as ClientRecord['status'] })} options={[
                  { value: 'active', label: 'Ativo' },
                  { value: 'inactive', label: 'Inativo' },
                  { value: 'archived', label: 'Arquivado' }
                ]} />
              </div>

              {canAssignUsers ? (
                <div>
                  <h3 className="mb-3 text-sm font-bold text-neutral-700">Usuarios com acesso</h3>
                  {users.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-sky-200 bg-white/70 p-4 text-sm text-neutral-600">Cadastre usuarios antes de atribuir acesso.</p>
                  ) : (
                    <div className="grid gap-2 md:grid-cols-2">
                      {users.map((record) => (
                        <label key={record.id} className="flex items-center gap-3 rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm font-semibold text-neutral-700">
                          <input
                            type="checkbox"
                            checked={assignedUserIds.includes(record.id)}
                            onChange={() => onToggleAssignedUser(record.id)}
                            className="h-4 w-4 accent-orange-500"
                          />
                          <span>{record.name} <span className="text-neutral-400">({record.role})</span></span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <PrimaryButton label="Salvar cliente" />
                <ActionButton label="Arquivar ou excluir" onClick={onArchiveOrDeleteClient} danger icon={<Trash2 size={16} />} />
              </div>
              <p className="text-xs font-semibold text-neutral-500">Clientes com relatorios sao arquivados para preservar historico; clientes sem relatorios podem ser excluidos.</p>
            </form>
          ) : (
            <p className="rounded-xl border border-dashed border-sky-200 bg-white/70 p-5 text-sm text-neutral-600">Selecione um cliente para editar.</p>
          )}
        </Panel>
      </div>
    </div>
  );
}

function UserAdmin({
  users,
  clients,
  currentUserId,
  selectedUser,
  selectedUserId,
  userForm,
  userEditForm,
  userPasswordForm,
  assignedClientIds,
  notice,
  onSelectUser,
  onCreateUser,
  onChangeUserForm,
  onChangeUserEditForm,
  onChangeUserPassword,
  onToggleAssignedClient,
  onUpdateUser,
  onResetPassword,
  onToggleStatus,
  onDeleteUser
}: {
  users: UserRecord[];
  clients: ClientRecord[];
  currentUserId: string;
  selectedUser: UserRecord | null;
  selectedUserId: string;
  userForm: { name: string; email: string; password: string; role: UserRecord['role'] };
  userEditForm: { name: string; email: string; role: UserRecord['role']; status: UserRecord['status'] };
  userPasswordForm: string;
  assignedClientIds: string[];
  notice: { type: 'success' | 'error'; text: string } | null;
  onSelectUser: (record: UserRecord) => void;
  onCreateUser: (event: React.FormEvent) => void;
  onChangeUserForm: (form: { name: string; email: string; password: string; role: UserRecord['role'] }) => void;
  onChangeUserEditForm: (form: { name: string; email: string; role: UserRecord['role']; status: UserRecord['status'] }) => void;
  onChangeUserPassword: (value: string) => void;
  onToggleAssignedClient: (clientId: string) => void;
  onUpdateUser: (event: React.FormEvent) => void;
  onResetPassword: (event: React.FormEvent) => void;
  onToggleStatus: () => void;
  onDeleteUser: () => void;
}) {
  const roleOptions = [
    { value: 'viewer', label: 'Viewer' },
    { value: 'editor', label: 'Editor' },
    { value: 'admin', label: 'Admin' }
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <div className="space-y-6">
        <Panel title="Usuarios" icon={<Users size={20} />}>
          <AuthNotice status={notice} />
          <div className="mt-4 space-y-3">
            {users.length === 0 ? (
              <p className="rounded-xl border border-dashed border-sky-200 bg-white/70 p-5 text-sm text-neutral-600">Nenhum usuario cadastrado.</p>
            ) : users.map((record) => (
              <button
                key={record.id}
                type="button"
                onClick={() => onSelectUser(record)}
                className={`w-full rounded-2xl border p-4 text-left transition ${selectedUserId === record.id ? 'border-orange-300 bg-orange-50' : 'border-sky-100 bg-white hover:border-orange-200'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-neutral-950">{record.name}</h3>
                    <p className="mt-1 break-all text-sm font-semibold text-neutral-500">{record.email}</p>
                  </div>
                  <Badge>{record.status === 'active' ? 'Ativo' : 'Inativo'}</Badge>
                </div>
                <p className="mt-2 text-sm text-neutral-600">{record.role}</p>
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Novo usuario" icon={<Plus size={20} />}>
          <form onSubmit={onCreateUser} className="adrock-form-shell space-y-4">
            <Input label="Nome" value={userForm.name} onChange={(value) => onChangeUserForm({ ...userForm, name: value })} required />
            <Input label="Email" type="email" value={userForm.email} onChange={(value) => onChangeUserForm({ ...userForm, email: value })} required />
            <Input label="Senha" type="password" value={userForm.password} onChange={(value) => onChangeUserForm({ ...userForm, password: value })} required minLength={8} />
            <Select label="Perfil" value={userForm.role} onChange={(value) => onChangeUserForm({ ...userForm, role: value as UserRecord['role'] })} options={roleOptions} />
            <PrimaryButton label="Cadastrar usuario" />
          </form>
        </Panel>
      </div>

      <div className="space-y-6">
        <Panel title="Editar usuario" icon={<Save size={20} />}>
          {selectedUser ? (
            <form onSubmit={onUpdateUser} className="adrock-form-shell space-y-5">
              <div className="grid gap-4 lg:grid-cols-2">
                <Input label="Nome" value={userEditForm.name} onChange={(value) => onChangeUserEditForm({ ...userEditForm, name: value })} required />
                <Input label="Email" type="email" value={userEditForm.email} onChange={(value) => onChangeUserEditForm({ ...userEditForm, email: value })} required />
                <Select label="Perfil" value={userEditForm.role} onChange={(value) => onChangeUserEditForm({ ...userEditForm, role: value as UserRecord['role'] })} options={roleOptions} />
                <Select label="Status" value={userEditForm.status} onChange={(value) => onChangeUserEditForm({ ...userEditForm, status: value as UserRecord['status'] })} options={[
                  { value: 'active', label: 'Ativo' },
                  { value: 'inactive', label: 'Inativo' }
                ]} />
              </div>

              <div>
                <h3 className="mb-3 text-sm font-bold text-neutral-700">Clientes atribuídos</h3>
                {clients.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-sky-200 bg-white/70 p-4 text-sm text-neutral-600">Cadastre clientes antes de atribuir acesso.</p>
                ) : (
                  <div className="grid gap-2 md:grid-cols-2">
                    {clients.map((client) => (
                      <label key={client.id} className="flex items-center gap-3 rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm font-semibold text-neutral-700">
                        <input
                          type="checkbox"
                          checked={assignedClientIds.includes(client.id)}
                          onChange={() => onToggleAssignedClient(client.id)}
                          className="h-4 w-4 accent-orange-500"
                        />
                        <span>{client.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <PrimaryButton label="Salvar usuario" />
                <ActionButton label={selectedUser.status === 'active' ? 'Inativar' : 'Reativar'} onClick={onToggleStatus} />
                <ActionButton label="Excluir" onClick={onDeleteUser} danger disabled={selectedUser.id === currentUserId} icon={<Trash2 size={16} />} />
              </div>
              {selectedUser.id === currentUserId ? <p className="text-xs font-semibold text-neutral-500">O usuario logado nao pode excluir a propria conta.</p> : null}
            </form>
          ) : (
            <p className="rounded-xl border border-dashed border-sky-200 bg-white/70 p-5 text-sm text-neutral-600">Selecione um usuario para editar.</p>
          )}
        </Panel>

        <Panel title="Trocar senha" icon={<KeyRound size={20} />}>
          {selectedUser ? (
            <form onSubmit={onResetPassword} className="adrock-form-shell space-y-4">
              <p className="text-sm text-neutral-600">Defina uma nova senha para {selectedUser.name}.</p>
              <Input label="Nova senha" type="password" value={userPasswordForm} onChange={onChangeUserPassword} required minLength={8} />
              <PrimaryButton label="Atualizar senha" />
            </form>
          ) : (
            <p className="rounded-xl border border-dashed border-sky-200 bg-white/70 p-5 text-sm text-neutral-600">Selecione um usuario para trocar senha.</p>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Dashboard({ clients, reports, selectedClient, selectedClientId, onSelectClient }: {
  clients: ClientRecord[];
  reports: ReportRecord[];
  selectedClient: ClientRecord | null;
  selectedClientId: string;
  onSelectClient: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Clientes" value={clients.length} />
        <MetricCard label="Relatorios visiveis" value={reports.length} />
        <MetricCard label="Links cadastrados" value={reports.reduce((sum, report) => sum + (report.links_count || 0), 0)} />
      </div>
      <Panel title={selectedClient?.name || 'Dashboard'} icon={<FileText size={20} />}>
        {clients.length > 1 ? (
          <div className="mb-5 max-w-sm">
            <Select label="Cliente" value={selectedClientId} onChange={onSelectClient} options={clients.map((client) => ({ value: client.id, label: client.name }))} />
          </div>
        ) : null}
        {selectedClient ? (
          <div className="mb-5 flex items-center gap-4 rounded-xl border border-sky-100 bg-white p-4">
            {selectedClient.logo_url ? <img src={selectedClient.logo_url} alt="" className="h-14 w-14 rounded-lg object-contain" /> : null}
            <div>
              <h2 className="text-xl font-bold text-neutral-950">{selectedClient.name}</h2>
              <p className="text-sm text-neutral-600">{selectedClient.description || 'Historico de relatorios publicados.'}</p>
            </div>
          </div>
        ) : null}
        <ReportList reports={reports} />
      </Panel>
    </div>
  );
}

function ReportList({ reports }: { reports: ReportRecord[] }) {
  if (reports.length === 0) {
    return <p className="rounded-xl border border-dashed border-sky-200 bg-white/70 p-5 text-sm text-neutral-600">Nenhum relatorio encontrado.</p>;
  }

  return (
    <div className="space-y-3">
      {reports.map((report) => (
        <article key={report.id} className="adrock-list-card rounded-2xl p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold text-neutral-950">{report.title}</h3>
                <Badge>{statusLabels[report.status]}</Badge>
                <Badge>{periodLabels[report.period_type]}</Badge>
              </div>
              <p className="mt-1 text-sm text-neutral-600">{report.client_name} · {report.period_label || formatPeriod(report)}</p>
              {report.description ? <p className="mt-2 text-sm text-neutral-700">{report.description}</p> : null}
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-neutral-700">{report.links_count || 0} links</span>
          </div>
          {report.links?.length ? (
            <div className="mt-4 space-y-2">
              {report.links.map((link) => (
                <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm font-semibold text-neutral-800">
                  <span>{link.title}</span>
                  <ExternalLink size={16} />
                </a>
              ))}
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function AuthShell({ brand, children }: { brand: SettingsRecord['brand']; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="bg-adrock-surface grid w-full max-w-5xl gap-8 rounded-2xl border border-white/80 p-6 md:grid-cols-[1fr_420px] md:p-8">
        <section className="flex flex-col justify-between gap-10">
          <div className="flex items-center gap-4">
            <img src={brand.topLogoUrl} alt="" className="h-16 w-16 rounded-2xl object-contain" />
            <div>
              <h1 className="text-3xl font-bold text-neutral-950">{brand.appName}</h1>
              <p className="mt-1 text-neutral-600">{brand.slogan}</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <MiniFeature label="Clientes" text="Acesso por cliente atribuido." />
            <MiniFeature label="Periodos" text="Diario a anual no mesmo historico." />
            <MiniFeature label="Links" text="Looker, Drive, Sheets e dashboards." />
          </div>
        </section>
        <section className="rounded-2xl border border-sky-100 bg-white/82 p-5">
          {children}
        </section>
      </div>
    </div>
  );
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="bg-adrock-surface rounded-2xl border border-white/80 p-5">
      <div className="mb-5 flex items-center gap-3">
        <span className="rounded-xl bg-orange-100 p-2 text-orange-700">{icon}</span>
        <h2 className="text-xl font-bold text-neutral-950">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function TwoColumn({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-6 lg:grid-cols-[1fr_420px]">{children}</div>;
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-adrock-surface rounded-2xl border border-white/80 p-5">
      <p className="text-sm font-semibold text-neutral-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-neutral-950">{value}</p>
    </div>
  );
}

function RecordList({ records, empty }: { records: Array<{ id: string; title: string; meta: string; description: string }>; empty: string }) {
  if (records.length === 0) {
    return <p className="rounded-xl border border-dashed border-sky-200 bg-white/70 p-5 text-sm text-neutral-600">{empty}</p>;
  }
  return (
    <div className="space-y-3">
      {records.map((record) => (
        <article key={record.id} className="adrock-list-card rounded-2xl p-4">
          <h3 className="font-bold text-neutral-950">{record.title}</h3>
          <p className="mt-1 text-sm font-semibold text-neutral-500">{record.meta}</p>
          <p className="mt-2 text-sm text-neutral-700">{record.description}</p>
        </article>
      ))}
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', required = false, placeholder = '', minLength }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  minLength?: number;
}) {
  return (
    <label className="block">
      <span className="adrock-field-label mb-1 block text-sm font-semibold">{label}</span>
      <input className="w-full px-4 py-3" type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} placeholder={placeholder} minLength={minLength} />
    </label>
  );
}

function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="adrock-field-label mb-1 block text-sm font-semibold">{label}</span>
      <textarea className="min-h-24 w-full px-4 py-3" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Select({ label, value, onChange, options, required = false }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="adrock-field-label mb-1 block text-sm font-semibold">{label}</span>
      <select className="w-full px-4 py-3" value={value} onChange={(event) => onChange(event.target.value)} required={required}>
        <option value="">Selecione</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function PrimaryButton({ label, disabled = false }: { label: string; disabled?: boolean }) {
  return (
    <button className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-neutral-300" type="submit" disabled={disabled}>
      {label}
    </button>
  );
}

function ActionButton({ label, onClick, danger = false, disabled = false, icon }: { label: string; onClick: () => void; danger?: boolean; disabled?: boolean; icon?: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-400 ${danger ? 'border-red-200 bg-white text-red-700 hover:bg-red-50' : 'border-sky-200 bg-white text-neutral-700 hover:border-orange-200 hover:bg-orange-50'}`}
    >
      {icon}
      {label}
    </button>
  );
}

function NavButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`rounded-xl px-4 py-2 text-sm font-bold ${active ? 'bg-neutral-950 text-white' : 'border border-sky-200 bg-white text-neutral-700'}`}>
      {label}
    </button>
  );
}

function PanelTitle({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-neutral-950">{title}</h2>
      <p className="mt-1 text-sm text-neutral-600">{text}</p>
    </div>
  );
}

function AuthNotice({ status }: { status: { type: 'success' | 'error'; text: string } | null }) {
  if (!status) return null;

  const classes = status.type === 'error'
    ? 'border-red-200 bg-red-50 text-red-900'
    : 'border-emerald-200 bg-emerald-50 text-emerald-900';

  return <p className={`rounded-xl border px-4 py-3 text-sm font-semibold ${classes}`}>{status.text}</p>;
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-800">{children}</span>;
}

function MiniFeature({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-2xl border border-sky-100 bg-white/80 p-4">
      <p className="font-bold text-neutral-950">{label}</p>
      <p className="mt-1 text-sm text-neutral-600">{text}</p>
    </div>
  );
}

function FullScreenState({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="bg-adrock-surface rounded-2xl border border-white/80 p-8 text-center">
        <h1 className="text-2xl font-bold text-neutral-950">{title}</h1>
        <p className="mt-2 text-neutral-600">{text}</p>
      </div>
    </div>
  );
}

function formatPeriod(report: ReportRecord) {
  if (report.starts_at && report.ends_at) return `${formatDate(report.starts_at)} a ${formatDate(report.ends_at)}`;
  if (report.starts_at) return formatDate(report.starts_at);
  return 'Periodo nao informado';
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(value));
}

function compactFilters(filters: ReportFilterState) {
  return {
    clientId: filters.clientId || undefined,
    periodType: filters.periodType || undefined,
    status: filters.status || undefined,
    search: filters.search || undefined,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined
  };
}

function toReportPayload(form: ReportFormState) {
  return {
    clientId: form.clientId,
    title: form.title,
    description: form.description,
    periodType: form.periodType,
    periodLabel: form.periodLabel,
    startsAt: form.startsAt || undefined,
    endsAt: form.endsAt || undefined,
    status: form.status
  };
}

function normalizeBrand(brand: Partial<SettingsRecord['brand']>): SettingsRecord['brand'] {
  return {
    appName: brand.appName || DEFAULT_BRAND.appName,
    slogan: brand.slogan || DEFAULT_BRAND.slogan,
    topLogoUrl: brand.topLogoUrl || DEFAULT_BRAND.topLogoUrl,
    topLogoSize: brand.topLogoSize || DEFAULT_BRAND.topLogoSize
  };
}

export default App;
