import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Download, Search, Users, Phone, Calendar, Brain, ChevronRight, Mail, ClipboardList } from 'lucide-react';
import { CRMUserProfile, type CRMUserDetail } from './CRMUserProfile';
import { CRMWaitlist } from './CRMWaitlist';

interface CRMUser {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  state: string | null;
  age: number | null;
  gender: string | null;
  plan: string;
  has_paid_full_test: boolean;
  has_paid_pdf: boolean;
  share_results_consent: boolean;
  marketing_email_opt_in: boolean;
  marketing_email_opt_in_at: string | null;
  marketing_push_opt_in: boolean;
  marketing_push_opt_in_at: string | null;
  stripe_order_id: string | null;
  created_at: string;
  updated_at: string;
  assessment_count: number;
  latest_risk_level: string | null;
  latest_test_type: string | null;
  incomplete_tests: number;
}

export const AdminCRM = () => {
  const [users, setUsers] = useState<CRMUser[]>([]);
  const [filtered, setFiltered] = useState<CRMUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<CRMUserDetail | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState(0);

  useEffect(() => { loadUsers(); loadWaitlistCount(); }, []);
  useEffect(() => { applyFilters(); }, [users, search, planFilter, riskFilter, statusFilter]);

  const loadWaitlistCount = async () => {
    const { count } = await supabase.from('waitlist').select('*', { count: 'exact', head: true });
    setWaitlistCount(count || 0);
  };

  const loadUsers = async () => {
    setLoading(true);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!profiles) { setLoading(false); return; }

    const { data: assessments } = await supabase
      .from('user_assessments')
      .select('user_id, risk_level, test_type, completion_percentage, created_at')
      .order('created_at', { ascending: false });

    const assessmentMap = new Map<string, { count: number; latestRisk: string | null; latestTestType: string | null; incomplete: number }>();
    (assessments || []).forEach((a: any) => {
      const existing = assessmentMap.get(a.user_id);
      const isIncomplete = (a.completion_percentage || 0) < 100;
      if (!existing) {
        assessmentMap.set(a.user_id, {
          count: 1,
          latestRisk: a.risk_level,
          latestTestType: a.test_type || 'ADHD',
          incomplete: isIncomplete ? 1 : 0,
        });
      } else {
        existing.count++;
        if (isIncomplete) existing.incomplete++;
      }
    });

    const enriched: CRMUser[] = profiles.map((p: any) => ({
      ...p,
      assessment_count: assessmentMap.get(p.user_id)?.count || 0,
      latest_risk_level: assessmentMap.get(p.user_id)?.latestRisk || null,
      latest_test_type: assessmentMap.get(p.user_id)?.latestTestType || null,
      incomplete_tests: assessmentMap.get(p.user_id)?.incomplete || 0,
    }));

    setUsers(enriched);
    setLoading(false);
  };

  const applyFilters = () => {
    let result = [...users];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(u =>
        (u.full_name || '').toLowerCase().includes(q) ||
        (u.phone || '').toLowerCase().includes(q) ||
        (u.country || '').toLowerCase().includes(q) ||
        (u.city || '').toLowerCase().includes(q)
      );
    }
    if (planFilter === 'paid') result = result.filter(u => u.has_paid_full_test);
    else if (planFilter === 'free') result = result.filter(u => !u.has_paid_full_test);
    if (riskFilter !== 'all') result = result.filter(u => u.latest_risk_level === riskFilter);
    if (statusFilter === 'tested') result = result.filter(u => u.assessment_count > 0);
    else if (statusFilter === 'not_tested') result = result.filter(u => u.assessment_count === 0);
    else if (statusFilter === 'incomplete') result = result.filter(u => u.incomplete_tests > 0);
    setFiltered(result);
  };

  const openUserProfile = async (user: CRMUser) => {
    // Fetch full detail for this user
    const { data: assessments } = await supabase
      .from('user_assessments')
      .select('*')
      .eq('user_id', user.user_id)
      .order('created_at', { ascending: false });

    const { data: visits } = await supabase
      .from('page_visits')
      .select('page, created_at, session_id')
      .eq('user_id', user.user_id)
      .order('created_at', { ascending: false })
      .limit(200);

    const pageVisits = visits || [];
    const faqAccessed = pageVisits.some(v => v.page?.includes('faq') || v.page?.includes('FAQ'));
    const uniqueSessions = new Set(pageVisits.map(v => v.session_id).filter(Boolean));

    // Estimate time on site (rough: avg 30s per page view)
    const totalTime = pageVisits.length * 30;

    const detail: CRMUserDetail = {
      ...user,
      assessments: (assessments || []) as any,
      page_visits: pageVisits as any,
      faq_accessed: faqAccessed,
      total_time_on_site: totalTime,
      session_count: uniqueSessions.size,
      incomplete_tests: user.incomplete_tests,
    };

    setSelectedUser(detail);
    setProfileOpen(true);
  };

  const exportCSV = () => {
    const headers = ['Name', 'Phone', 'City', 'State', 'Country', 'Age', 'Gender', 'Plan', 'Paid', 'Tests', 'Risk', 'Test Type', 'Incomplete', 'Share Consent', 'Email Opt-In', 'Push Opt-In', 'Order ID', 'Joined'];
    const rows = filtered.map(u => [
      u.full_name || '', u.phone || '', u.city || '', u.state || '', u.country || '',
      u.age || '', u.gender || '', u.plan,
      u.has_paid_full_test ? 'Yes' : 'No', u.assessment_count,
      u.latest_risk_level || 'N/A', u.latest_test_type || 'N/A',
      u.incomplete_tests, u.share_results_consent ? 'Yes' : 'No',
      u.marketing_email_opt_in ? 'Yes' : 'No', u.marketing_push_opt_in ? 'Yes' : 'No',
      u.stripe_order_id || '', new Date(u.created_at).toLocaleDateString(),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crm-users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getRiskBadge = (risk: string | null) => {
    if (!risk) return <Badge variant="outline" className="text-xs">No Test</Badge>;
    const colors: Record<string, string> = {
      low: 'bg-green-100 text-green-700 border-green-200',
      moderate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      high: 'bg-red-100 text-red-700 border-red-200',
    };
    return <Badge className={`text-xs ${colors[risk] || ''}`}>{risk}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users" className="gap-1.5">
            <Users className="w-3.5 h-3.5" /> Users ({users.length})
          </TabsTrigger>
          <TabsTrigger value="waitlist" className="gap-1.5">
            <ClipboardList className="w-3.5 h-3.5" /> Waitlist ({waitlistCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6 mt-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
                <div className="text-2xl font-bold">{users.length}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Brain className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                <div className="text-2xl font-bold">{users.filter(u => u.assessment_count > 0).length}</div>
                <div className="text-xs text-muted-foreground">Tested</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Phone className="w-5 h-5 mx-auto mb-1 text-green-500" />
                <div className="text-2xl font-bold">{users.filter(u => u.has_paid_full_test).length}</div>
                <div className="text-xs text-muted-foreground">Paid</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Calendar className="w-5 h-5 mx-auto mb-1 text-red-500" />
                <div className="text-2xl font-bold">{users.filter(u => u.latest_risk_level === 'high').length}</div>
                <div className="text-xs text-muted-foreground">High Risk</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Mail className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                <div className="text-2xl font-bold">{users.filter(u => u.marketing_email_opt_in).length}</div>
                <div className="text-xs text-muted-foreground">Email Opt-In</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters & Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">User CRM</CardTitle>
                  <CardDescription>{filtered.length} of {users.length} users — click row to view profile</CardDescription>
                </div>
                <Button onClick={exportCSV} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" /> Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search name, phone, city, country..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
                </div>
                <Select value={planFilter} onValueChange={setPlanFilter}>
                  <SelectTrigger className="w-[130px]"><SelectValue placeholder="Plan" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger className="w-[130px]"><SelectValue placeholder="Risk" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="tested">Tested</SelectItem>
                    <SelectItem value="not_tested">Not Tested</SelectItem>
                    <SelectItem value="incomplete">Incomplete</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden sm:table-cell">Location</TableHead>
                      <TableHead>Age/Gender</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Risk</TableHead>
                      <TableHead className="hidden md:table-cell">Test</TableHead>
                      <TableHead className="hidden md:table-cell">Consent</TableHead>
                      <TableHead className="hidden lg:table-cell">Mktg</TableHead>
                      <TableHead className="w-[40px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                    ) : filtered.length === 0 ? (
                      <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No users found</TableCell></TableRow>
                    ) : filtered.map(u => (
                      <TableRow key={u.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openUserProfile(u)}>
                        <TableCell className="font-medium">
                          <div>{u.full_name || '—'}</div>
                          {u.incomplete_tests > 0 && (
                            <span className="text-[10px] text-yellow-600 font-medium">⚠ Incomplete</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-xs">
                          {[u.city, u.state, u.country].filter(Boolean).join(', ') || '—'}
                        </TableCell>
                        <TableCell className="text-xs">{u.age || '—'} / {u.gender || '—'}</TableCell>
                        <TableCell>
                          <Badge variant={u.has_paid_full_test ? 'default' : 'secondary'} className="text-xs">
                            {u.has_paid_full_test ? 'Paid' : 'Free'}
                          </Badge>
                        </TableCell>
                        <TableCell>{getRiskBadge(u.latest_risk_level)}</TableCell>
                        <TableCell className="hidden md:table-cell text-xs">
                          {u.latest_test_type || '—'} ({u.assessment_count})
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant={u.share_results_consent ? 'default' : 'outline'} className="text-[10px]">
                            {u.share_results_consent ? 'Yes' : 'No'}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex gap-1">
                            {u.marketing_email_opt_in && <Badge className="text-[10px] bg-blue-100 text-blue-700">📧</Badge>}
                            {u.marketing_push_opt_in && <Badge className="text-[10px] bg-purple-100 text-purple-700">🔔</Badge>}
                            {!u.marketing_email_opt_in && !u.marketing_push_opt_in && <span className="text-xs text-muted-foreground">—</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="waitlist" className="mt-4">
          <CRMWaitlist />
        </TabsContent>
      </Tabs>

      <CRMUserProfile user={selectedUser} open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
};
