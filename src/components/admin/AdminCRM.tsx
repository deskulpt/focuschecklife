import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Download, Search, Filter, Users, Mail, Phone, Calendar, Brain } from 'lucide-react';

interface CRMUser {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  country: string | null;
  age: number | null;
  gender: string | null;
  plan: string;
  has_paid_full_test: boolean;
  has_paid_pdf: boolean;
  created_at: string;
  email?: string;
  marketing_consent?: boolean;
  assessment_count?: number;
  latest_risk_level?: string | null;
}

export const AdminCRM = () => {
  const [users, setUsers] = useState<CRMUser[]>([]);
  const [filtered, setFiltered] = useState<CRMUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [consentFilter, setConsentFilter] = useState('all');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, search, planFilter, riskFilter, consentFilter]);

  const loadUsers = async () => {
    setLoading(true);

    // Get all profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!profiles) { setLoading(false); return; }

    // Get assessments for risk levels
    const { data: assessments } = await supabase
      .from('user_assessments')
      .select('user_id, risk_level, created_at')
      .order('created_at', { ascending: false });

    // Group assessments by user
    const assessmentMap = new Map<string, { count: number; latestRisk: string | null }>();
    (assessments || []).forEach((a: any) => {
      const existing = assessmentMap.get(a.user_id);
      if (!existing) {
        assessmentMap.set(a.user_id, { count: 1, latestRisk: a.risk_level });
      } else {
        existing.count++;
      }
    });

    const enriched: CRMUser[] = profiles.map((p: any) => ({
      ...p,
      assessment_count: assessmentMap.get(p.user_id)?.count || 0,
      latest_risk_level: assessmentMap.get(p.user_id)?.latestRisk || null,
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
        (u.country || '').toLowerCase().includes(q)
      );
    }

    if (planFilter !== 'all') {
      if (planFilter === 'paid') result = result.filter(u => u.has_paid_full_test);
      else if (planFilter === 'free') result = result.filter(u => !u.has_paid_full_test);
    }

    if (riskFilter !== 'all') {
      result = result.filter(u => u.latest_risk_level === riskFilter);
    }

    if (consentFilter === 'tested') {
      result = result.filter(u => u.assessment_count && u.assessment_count > 0);
    } else if (consentFilter === 'not_tested') {
      result = result.filter(u => !u.assessment_count || u.assessment_count === 0);
    }

    setFiltered(result);
  };

  const exportCSV = () => {
    const headers = ['Name', 'Phone', 'Country', 'Age', 'Gender', 'Plan', 'Paid Test', 'Paid PDF', 'Assessments', 'Risk Level', 'Joined'];
    const rows = filtered.map(u => [
      u.full_name || '',
      u.phone || '',
      u.country || '',
      u.age || '',
      u.gender || '',
      u.plan,
      u.has_paid_full_test ? 'Yes' : 'No',
      u.has_paid_pdf ? 'Yes' : 'No',
      u.assessment_count || 0,
      u.latest_risk_level || 'N/A',
      new Date(u.created_at).toLocaleDateString(),
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
    const variants: Record<string, string> = {
      low: 'bg-green-100 text-green-700 border-green-200',
      moderate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      high: 'bg-red-100 text-red-700 border-red-200',
    };
    return <Badge className={`text-xs ${variants[risk] || ''}`}>{risk}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-1 text-primary" />
            <div className="text-2xl font-bold">{users.length}</div>
            <div className="text-xs text-muted-foreground">Total Users</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Brain className="w-6 h-6 mx-auto mb-1 text-orange-500" />
            <div className="text-2xl font-bold">{users.filter(u => (u.assessment_count || 0) > 0).length}</div>
            <div className="text-xs text-muted-foreground">Tested</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Phone className="w-6 h-6 mx-auto mb-1 text-green-500" />
            <div className="text-2xl font-bold">{users.filter(u => u.phone).length}</div>
            <div className="text-xs text-muted-foreground">With Phone</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="w-6 h-6 mx-auto mb-1 text-purple-500" />
            <div className="text-2xl font-bold">{users.filter(u => u.latest_risk_level === 'high').length}</div>
            <div className="text-xs text-muted-foreground">High Risk</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Export */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg">User CRM</CardTitle>
              <CardDescription>{filtered.length} of {users.length} users shown</CardDescription>
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
              <Input
                placeholder="Search by name, phone, country..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
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
            <Select value={consentFilter} onValueChange={setConsentFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="tested">Tested</SelectItem>
                <SelectItem value="not_tested">Not Tested</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Phone</TableHead>
                  <TableHead className="hidden md:table-cell">Country</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead className="hidden lg:table-cell">Gender</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead className="hidden md:table-cell">Tests</TableHead>
                  <TableHead className="hidden lg:table-cell">Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No users found</TableCell>
                  </TableRow>
                ) : filtered.map(u => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.full_name || '—'}</TableCell>
                    <TableCell className="hidden sm:table-cell">{u.phone || '—'}</TableCell>
                    <TableCell className="hidden md:table-cell">{u.country || '—'}</TableCell>
                    <TableCell>{u.age || '—'}</TableCell>
                    <TableCell className="hidden lg:table-cell">{u.gender || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={u.has_paid_full_test ? 'default' : 'secondary'} className="text-xs">
                        {u.has_paid_full_test ? 'Paid' : 'Free'}
                      </Badge>
                    </TableCell>
                    <TableCell>{getRiskBadge(u.latest_risk_level)}</TableCell>
                    <TableCell className="hidden md:table-cell">{u.assessment_count || 0}</TableCell>
                    <TableCell className="hidden lg:table-cell">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
