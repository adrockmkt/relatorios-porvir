import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, FileText, Link2, LogOut, Plus, RefreshCw, ShieldCheck, Users } from 'lucide-react';
import { api, setStoredToken } from './utils/api';
import type { AuthUser, ClientRecord, ReportLinkDestinationType, ReportPeriodType, ReportRecord, ReportStatus, SettingsRecord, UserRecord } from './types';

type Section = 'dashboard' | 'clients' | 'reports' | 'users' | 'settings';

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
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [clientForm, setClientForm] = useState({ name: '', logoUrl: '', description: '' });
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
  const [linkForm, setLinkForm] = useState({
    reportId: '',
    title: '',
    url: '',
    destinationType: 'looker_studio' as ReportLinkDestinationType,
    description: ''
  });
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'viewer' as UserRecord['role']
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
      api.listReports(),
      currentUser?.role === 'admin' ? api.listUsers() : Promise.resolve([])
    ]);
    setClients(clientsResult);
    setReports(reportsResult);
    setUsers(usersResult);
    setSelectedClientId((current) => current || clientsResult[0]?.id || '');
    setReportForm((current) => ({ ...current, clientId: current.clientId || clientsResult[0]?.id || '' }));
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
    await api.createClient(clientForm);
    setClientForm({ name: '', logoUrl: '', description: '' });
    await loadAppData();
  }

  async function handleCreateReport(event: React.FormEvent) {
    event.preventDefault();
    await api.createReport({
      clientId: reportForm.clientId,
      title: reportForm.title,
      description: reportForm.description,
      periodType: reportForm.periodType,
      periodLabel: reportForm.periodLabel,
      startsAt: reportForm.startsAt || undefined,
      endsAt: reportForm.endsAt || undefined,
      status: reportForm.status
    });
    setReportForm((current) => ({ ...current, title: '', description: '', periodLabel: '' }));
    await loadAppData();
  }

  async function handleCreateLink(event: React.FormEvent) {
    event.preventDefault();
    await api.createReportLink(linkForm);
    setLinkForm((current) => ({ ...current, title: '', url: '', description: '' }));
    await loadAppData();
  }

  async function handleCreateUser(event: React.FormEvent) {
    event.preventDefault();
    await api.createUser(userForm);
    setUserForm({ name: '', email: '', password: '', role: 'viewer' });
    await loadAppData();
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
          <TwoColumn>
            <Panel title="Clientes" icon={<ShieldCheck size={20} />}>
              <RecordList
                empty="Nenhum cliente cadastrado."
                records={clients.map((client) => ({
                  id: client.id,
                  title: client.name,
                  meta: `${client.status} · ${client.reports_count || 0} relatorios`,
                  description: client.description || 'Sem descricao.'
                }))}
              />
            </Panel>
            {canManage ? (
              <Panel title="Novo cliente" icon={<Plus size={20} />}>
                <form onSubmit={handleCreateClient} className="adrock-form-shell space-y-4">
                  <Input label="Nome" value={clientForm.name} onChange={(value) => setClientForm({ ...clientForm, name: value })} required />
                  <Input label="Logo URL" value={clientForm.logoUrl} onChange={(value) => setClientForm({ ...clientForm, logoUrl: value })} />
                  <Textarea label="Descricao" value={clientForm.description} onChange={(value) => setClientForm({ ...clientForm, description: value })} />
                  <PrimaryButton label="Cadastrar cliente" />
                </form>
              </Panel>
            ) : null}
          </TwoColumn>
        ) : null}

        {activeSection === 'reports' ? (
          <TwoColumn>
            <Panel title="Relatorios" icon={<FileText size={20} />}>
              <ReportList reports={reports} />
            </Panel>
            {canManage ? (
              <div className="space-y-6">
                <Panel title="Novo relatorio" icon={<Plus size={20} />}>
                  <form onSubmit={handleCreateReport} className="adrock-form-shell space-y-4">
                    <Select label="Cliente" value={reportForm.clientId} onChange={(value) => setReportForm({ ...reportForm, clientId: value })} options={clients.map((client) => ({ value: client.id, label: client.name }))} required />
                    <Input label="Titulo" value={reportForm.title} onChange={(value) => setReportForm({ ...reportForm, title: value })} required />
                    <Select label="Periodo" value={reportForm.periodType} onChange={(value) => setReportForm({ ...reportForm, periodType: value as ReportPeriodType })} options={Object.entries(periodLabels).map(([value, label]) => ({ value, label }))} />
                    <Input label="Rotulo do periodo" value={reportForm.periodLabel} onChange={(value) => setReportForm({ ...reportForm, periodLabel: value })} placeholder="Ex.: Julho/2026" />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input label="Inicio" type="date" value={reportForm.startsAt} onChange={(value) => setReportForm({ ...reportForm, startsAt: value })} />
                      <Input label="Fim" type="date" value={reportForm.endsAt} onChange={(value) => setReportForm({ ...reportForm, endsAt: value })} />
                    </div>
                    <Select label="Status" value={reportForm.status} onChange={(value) => setReportForm({ ...reportForm, status: value as ReportStatus })} options={Object.entries(statusLabels).map(([value, label]) => ({ value, label }))} />
                    <Textarea label="Descricao" value={reportForm.description} onChange={(value) => setReportForm({ ...reportForm, description: value })} />
                    <PrimaryButton label="Cadastrar relatorio" />
                  </form>
                </Panel>
                <Panel title="Adicionar link" icon={<Link2 size={20} />}>
                  <form onSubmit={handleCreateLink} className="adrock-form-shell space-y-4">
                    <Select label="Relatorio" value={linkForm.reportId} onChange={(value) => setLinkForm({ ...linkForm, reportId: value })} options={reports.map((report) => ({ value: report.id, label: report.title }))} required />
                    <Input label="Titulo do link" value={linkForm.title} onChange={(value) => setLinkForm({ ...linkForm, title: value })} required />
                    <Input label="URL" type="url" value={linkForm.url} onChange={(value) => setLinkForm({ ...linkForm, url: value })} required />
                    <Select label="Tipo" value={linkForm.destinationType} onChange={(value) => setLinkForm({ ...linkForm, destinationType: value as ReportLinkDestinationType })} options={Object.entries(destinationLabels).map(([value, label]) => ({ value, label }))} />
                    <Textarea label="Descricao" value={linkForm.description} onChange={(value) => setLinkForm({ ...linkForm, description: value })} />
                    <PrimaryButton label="Adicionar link" />
                  </form>
                </Panel>
              </div>
            ) : null}
          </TwoColumn>
        ) : null}

        {activeSection === 'users' && canManageUsers ? (
          <TwoColumn>
            <Panel title="Usuarios" icon={<Users size={20} />}>
              <RecordList
                empty="Nenhum usuario cadastrado."
                records={users.map((record) => ({
                  id: record.id,
                  title: record.name,
                  meta: `${record.email} · ${record.role} · ${record.status}`,
                  description: 'Atribuicao de clientes entra na proxima tela administrativa.'
                }))}
              />
            </Panel>
            <Panel title="Novo usuario" icon={<Plus size={20} />}>
              <form onSubmit={handleCreateUser} className="adrock-form-shell space-y-4">
                <Input label="Nome" value={userForm.name} onChange={(value) => setUserForm({ ...userForm, name: value })} required />
                <Input label="Email" type="email" value={userForm.email} onChange={(value) => setUserForm({ ...userForm, email: value })} required />
                <Input label="Senha" type="password" value={userForm.password} onChange={(value) => setUserForm({ ...userForm, password: value })} required />
                <Select label="Perfil" value={userForm.role} onChange={(value) => setUserForm({ ...userForm, role: value as UserRecord['role'] })} options={[
                  { value: 'viewer', label: 'Viewer' },
                  { value: 'editor', label: 'Editor' },
                  { value: 'admin', label: 'Admin' }
                ]} />
                <PrimaryButton label="Cadastrar usuario" />
              </form>
            </Panel>
          </TwoColumn>
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

function normalizeBrand(brand: Partial<SettingsRecord['brand']>): SettingsRecord['brand'] {
  return {
    appName: brand.appName || DEFAULT_BRAND.appName,
    slogan: brand.slogan || DEFAULT_BRAND.slogan,
    topLogoUrl: brand.topLogoUrl || DEFAULT_BRAND.topLogoUrl,
    topLogoSize: brand.topLogoSize || DEFAULT_BRAND.topLogoSize
  };
}

export default App;
