import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Save, Trash2, GripVertical } from 'lucide-react';

interface PackageRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  features: string[];
  price_cad_cents: number;
  sale_price_cad_cents: number | null;
  is_free: boolean;
  grants_full_test: boolean;
  grants_pdf: boolean;
  sort_order: number;
  is_active: boolean;
}

const empty = (sort: number): Omit<PackageRow, 'id'> => ({
  slug: '',
  name: '',
  description: '',
  features: [],
  price_cad_cents: 0,
  sale_price_cad_cents: null,
  is_free: false,
  grants_full_test: false,
  grants_pdf: false,
  sort_order: sort,
  is_active: true,
});

const centsToInput = (c: number | null | undefined) =>
  c == null ? '' : (c / 100).toFixed(2);
const inputToCents = (s: string) => {
  const n = parseFloat(s);
  if (Number.isNaN(n)) return 0;
  return Math.round(n * 100);
};

export const AdminPackages = () => {
  const [pkgs, setPkgs] = useState<PackageRow[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) {
      toast({ title: 'Failed to load packages', description: error.message, variant: 'destructive' });
      return;
    }
    setPkgs(
      (data || []).map((r: Record<string, unknown>) => ({
        ...(r as PackageRow),
        features: Array.isArray(r.features) ? (r.features as string[]) : [],
      })),
    );
  };

  useEffect(() => { load(); }, []);

  const update = (idx: number, patch: Partial<PackageRow>) => {
    setPkgs((prev) => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  };

  const save = async (pkg: PackageRow) => {
    setLoading(true);
    const payload = {
      slug: pkg.slug.trim().toLowerCase(),
      name: pkg.name,
      description: pkg.description,
      features: pkg.features,
      price_cad_cents: pkg.price_cad_cents,
      sale_price_cad_cents: pkg.sale_price_cad_cents,
      is_free: pkg.is_free,
      grants_full_test: pkg.grants_full_test,
      grants_pdf: pkg.grants_pdf,
      sort_order: pkg.sort_order,
      is_active: pkg.is_active,
    };
    const { error } = pkg.id.startsWith('new-')
      ? await supabase.from('packages').insert(payload)
      : await supabase.from('packages').update(payload).eq('id', pkg.id);
    setLoading(false);
    if (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Package saved' });
    load();
  };

  const remove = async (pkg: PackageRow) => {
    if (pkg.id.startsWith('new-')) {
      setPkgs((prev) => prev.filter((p) => p.id !== pkg.id));
      return;
    }
    if (!confirm(`Delete package "${pkg.name}"?`)) return;
    const { error } = await supabase.from('packages').delete().eq('id', pkg.id);
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Deleted' });
    load();
  };

  const addNew = () => {
    const nextSort = (pkgs[pkgs.length - 1]?.sort_order ?? 0) + 1;
    setPkgs((prev) => [
      ...prev,
      { id: `new-${Date.now()}`, ...empty(nextSort) },
    ]);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Packages</CardTitle>
            <CardDescription>
              Set base prices in <strong>CAD</strong>. Visitors anywhere see auto-converted prices in their own currency, rounded to .99.
            </CardDescription>
          </div>
          <Button onClick={addNew} size="sm"><Plus className="w-4 h-4 mr-1" /> Add package</Button>
        </CardHeader>
      </Card>

      {pkgs.map((pkg, idx) => (
        <Card key={pkg.id}>
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1">
              <GripVertical className="w-4 h-4 text-muted-foreground" />
              <Input
                className="font-semibold"
                placeholder="Package name"
                value={pkg.name}
                onChange={(e) => update(idx, { name: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Switch checked={pkg.is_active} onCheckedChange={(v) => update(idx, { is_active: v })} />
                <Label className="text-xs">Active</Label>
              </div>
              <Button size="sm" variant="ghost" onClick={() => remove(pkg)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Slug</Label>
                <Input
                  placeholder="full-report"
                  value={pkg.slug}
                  onChange={(e) => update(idx, { slug: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs">Sort order</Label>
                <Input
                  type="number"
                  value={pkg.sort_order}
                  onChange={(e) => update(idx, { sort_order: parseInt(e.target.value || '0', 10) })}
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Description</Label>
              <Textarea
                rows={2}
                value={pkg.description ?? ''}
                onChange={(e) => update(idx, { description: e.target.value })}
              />
            </div>

            <div>
              <Label className="text-xs">Features (one per line)</Label>
              <Textarea
                rows={4}
                value={pkg.features.join('\n')}
                onChange={(e) => update(idx, { features: e.target.value.split('\n').filter(Boolean) })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Price (CAD)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="6.99"
                  value={centsToInput(pkg.price_cad_cents)}
                  onChange={(e) => update(idx, { price_cad_cents: inputToCents(e.target.value) })}
                />
              </div>
              <div>
                <Label className="text-xs">Sale price (CAD, optional)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="—"
                  value={centsToInput(pkg.sale_price_cad_cents)}
                  onChange={(e) =>
                    update(idx, {
                      sale_price_cad_cents: e.target.value === '' ? null : inputToCents(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-6 pt-1">
              <div className="flex items-center gap-2">
                <Switch checked={pkg.is_free} onCheckedChange={(v) => update(idx, { is_free: v })} />
                <Label className="text-xs">Free package</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={pkg.grants_full_test} onCheckedChange={(v) => update(idx, { grants_full_test: v })} />
                <Label className="text-xs">Grants full results</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={pkg.grants_pdf} onCheckedChange={(v) => update(idx, { grants_pdf: v })} />
                <Label className="text-xs">Grants PDF report</Label>
              </div>
            </div>

            <div className="pt-2">
              <Button size="sm" onClick={() => save(pkg)} disabled={loading}>
                <Save className="w-4 h-4 mr-1" /> Save package
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
