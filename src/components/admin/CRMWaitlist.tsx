import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Download, Search, Mail, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface WaitlistEntry {
  id: string;
  email: string;
  name: string | null;
  source: string;
  created_at: string;
}

export const CRMWaitlist = () => {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [filtered, setFiltered] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { loadEntries(); }, []);
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      search
        ? entries.filter(e => e.email.toLowerCase().includes(q) || (e.name || '').toLowerCase().includes(q))
        : entries
    );
  }, [entries, search]);

  const loadEntries = async () => {
    setLoading(true);
    const { data } = await supabase.from('waitlist').select('*').order('created_at', { ascending: false });
    setEntries(data || []);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('waitlist').delete().eq('id', id);
    if (error) { toast.error('Failed to remove entry'); return; }
    setEntries(prev => prev.filter(e => e.id !== id));
    toast.success('Entry removed');
  };

  const exportCSV = () => {
    const headers = ['Email', 'Name', 'Source', 'Signed Up'];
    const rows = filtered.map(e => [e.email, e.name || '', e.source, new Date(e.created_at).toLocaleDateString()]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waitlist-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-lg flex items-center gap-2"><Mail className="w-5 h-5" /> Waitlist Subscribers</CardTitle>
            <CardDescription>{filtered.length} of {entries.length} subscribers</CardDescription>
          </div>
          <Button onClick={exportCSV} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by email or name..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Signed Up</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No subscribers found</TableCell></TableRow>
              ) : filtered.map(e => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.email}</TableCell>
                  <TableCell>{e.name || '—'}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{e.source}</Badge></TableCell>
                  <TableCell>{new Date(e.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(e.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
