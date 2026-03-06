import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Users, UserCheck, ClipboardList, Download, DollarSign, Eye } from 'lucide-react';

interface FunnelData {
  visited: number;
  registered: number;
  tookTest: number;
  downloaded: number;
}

export const AdminAnalytics = () => {
  const [funnel, setFunnel] = useState<FunnelData>({ visited: 0, registered: 0, tookTest: 0, downloaded: 0 });
  const [earnings, setEarnings] = useState({ fullTest: 0, pdf: 0 });
  const [recentVisits, setRecentVisits] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    // Unique visitors (by session_id)
    const { data: visits } = await supabase.from('page_visits').select('session_id, page') as any;
    const uniqueSessions = new Set((visits || []).map((v: any) => v.session_id));
    
    // Registered users
    const { count: registeredCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    
    // Users who took test
    const { count: testCount } = await supabase.from('user_assessments').select('*', { count: 'exact', head: true });
    
    // Users who paid for PDF
    const { count: pdfCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('has_paid_pdf', true);

    // Users who paid for full test
    const { count: fullTestCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('has_paid_full_test', true);

    setFunnel({
      visited: uniqueSessions.size,
      registered: registeredCount || 0,
      tookTest: testCount || 0,
      downloaded: pdfCount || 0,
    });

    setEarnings({
      fullTest: (fullTestCount || 0) * 5,
      pdf: (pdfCount || 0) * 20,
    });

    // Recent visits
    const { data: recent } = await supabase
      .from('page_visits')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20) as any;
    setRecentVisits(recent || []);

    // Customer list
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    setCustomers(profiles || []);
  };

  const funnelSteps = [
    { label: 'Visited', value: funnel.visited, icon: Eye, color: 'text-blue-500' },
    { label: 'Registered', value: funnel.registered, icon: UserCheck, color: 'text-green-500' },
    { label: 'Took Test', value: funnel.tookTest, icon: ClipboardList, color: 'text-orange-500' },
    { label: 'Downloaded PDF', value: funnel.downloaded, icon: Download, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Conversion Funnel */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Conversion Funnel</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {funnelSteps.map((step, i) => (
              <div key={i} className="text-center p-4 rounded-lg bg-muted/50">
                <step.icon className={`w-8 h-8 mx-auto mb-2 ${step.color}`} />
                <div className="text-2xl font-bold">{step.value}</div>
                <div className="text-xs text-muted-foreground">{step.label}</div>
                {i > 0 && funnel.visited > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {((step.value / funnel.visited) * 100).toFixed(1)}%
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Earnings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">${earnings.fullTest + earnings.pdf}</div>
            <div className="text-xs text-muted-foreground">Total Earnings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold">${earnings.fullTest}</div>
            <div className="text-xs text-muted-foreground">Full Test ($5 × {earnings.fullTest / 5})</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold">${earnings.pdf}</div>
            <div className="text-xs text-muted-foreground">PDF Reports ($20 × {earnings.pdf / 20})</div>
          </CardContent>
        </Card>
      </div>

      {/* Customer List */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Recent Customers</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Name</th>
                  <th className="text-left py-2 px-2 hidden sm:table-cell">Phone</th>
                  <th className="text-left py-2 px-2 hidden md:table-cell">Country</th>
                  <th className="text-left py-2 px-2">Age</th>
                  <th className="text-left py-2 px-2">Plan</th>
                  <th className="text-left py-2 px-2 hidden md:table-cell">Joined</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c: any) => (
                  <tr key={c.id} className="border-b border-border/30">
                    <td className="py-2 px-2">{c.full_name || '—'}</td>
                    <td className="py-2 px-2 hidden sm:table-cell">{c.phone || '—'}</td>
                    <td className="py-2 px-2 hidden md:table-cell">{c.country || '—'}</td>
                    <td className="py-2 px-2">{c.age || '—'}</td>
                    <td className="py-2 px-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${c.has_paid_full_test ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                        {c.has_paid_full_test ? 'Paid' : 'Free'}
                      </span>
                    </td>
                    <td className="py-2 px-2 hidden md:table-cell">{new Date(c.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
