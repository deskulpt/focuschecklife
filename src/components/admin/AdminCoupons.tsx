import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trash2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Coupon {
  id?: string;
  code: string;
  description: string;
  grants_full_test: boolean;
  grants_pdf: boolean;
  max_uses: number | null;
  times_used: number;
  is_active: boolean;
  expires_at: string | null;
}

export const AdminCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => { loadCoupons(); }, []);

  const loadCoupons = async () => {
    // Admin can see all via RLS
    const { data } = await supabase.from('promo_codes').select('*').order('created_at', { ascending: false }) as any;
    setCoupons(data || []);
  };

  const addCoupon = () => {
    setCoupons([{
      code: '', description: '', grants_full_test: true, grants_pdf: false,
      max_uses: 50, times_used: 0, is_active: true, expires_at: null,
    }, ...coupons]);
  };

  const updateCoupon = (index: number, field: keyof Coupon, value: any) => {
    const updated = [...coupons];
    (updated[index] as any)[field] = value;
    setCoupons(updated);
  };

  const deleteCoupon = async (index: number) => {
    const c = coupons[index];
    if (c.id) {
      await supabase.from('promo_codes').delete().eq('id', c.id);
    }
    setCoupons(coupons.filter((_, i) => i !== index));
    toast({ title: 'Coupon deleted' });
  };

  const saveAll = async () => {
    setLoading(true);
    for (const c of coupons) {
      const payload = {
        code: c.code,
        description: c.description || null,
        grants_full_test: c.grants_full_test,
        grants_pdf: c.grants_pdf,
        max_uses: c.max_uses,
        is_active: c.is_active,
        expires_at: c.expires_at || null,
      };
      if (c.id) {
        await supabase.from('promo_codes').update(payload).eq('id', c.id);
      } else {
        await supabase.from('promo_codes').insert(payload as any);
      }
    }
    await loadCoupons();
    setLoading(false);
    toast({ title: 'Coupons saved successfully' });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Manage Coupons</CardTitle>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={addCoupon}><Plus className="w-4 h-4 mr-1" /> Add</Button>
          <Button size="sm" onClick={saveAll} disabled={loading}><Save className="w-4 h-4 mr-1" /> Save All</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {coupons.map((c, i) => (
          <div key={c.id || i} className="border border-border/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {c.id ? `Used: ${c.times_used}${c.max_uses ? `/${c.max_uses}` : ''}` : 'New Coupon'}
              </span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs">
                  <Switch checked={c.is_active} onCheckedChange={(v) => updateCoupon(i, 'is_active', v)} />
                  Active
                </label>
                <Button size="icon" variant="ghost" onClick={() => deleteCoupon(i)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input placeholder="Code (e.g. FAMILY2026)" value={c.code} onChange={(e) => updateCoupon(i, 'code', e.target.value.toUpperCase())} />
              <Input placeholder="Description" value={c.description || ''} onChange={(e) => updateCoupon(i, 'description', e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-4 items-center text-xs">
              <label className="flex items-center gap-2">
                <Switch checked={c.grants_full_test} onCheckedChange={(v) => updateCoupon(i, 'grants_full_test', v)} />
                Full Test
              </label>
              <label className="flex items-center gap-2">
                <Switch checked={c.grants_pdf} onCheckedChange={(v) => updateCoupon(i, 'grants_pdf', v)} />
                PDF Report
              </label>
              <Input type="number" placeholder="Max uses" className="w-24" value={c.max_uses ?? ''} onChange={(e) => updateCoupon(i, 'max_uses', e.target.value ? parseInt(e.target.value) : null)} />
              <Input type="date" placeholder="Expires" className="w-36" value={c.expires_at?.split('T')[0] || ''} onChange={(e) => updateCoupon(i, 'expires_at', e.target.value ? new Date(e.target.value).toISOString() : null)} />
            </div>
          </div>
        ))}
        {coupons.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No coupons yet.</p>}
      </CardContent>
    </Card>
  );
};
