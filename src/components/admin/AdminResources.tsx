import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trash2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Resource {
  id?: string;
  category: string;
  title: string;
  description: string;
  url: string;
  badge: string;
  sort_order: number;
  is_published: boolean;
}

const CATEGORIES = [
  'Trusted Organizations',
  'YouTube Channels',
  'Podcasts',
  'Online Communities',
  'Free Reading & Guides',
  'For Family & Friends',
];

export const AdminResources = () => {
  const [items, setItems] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => { void load(); }, []);

  const load = async () => {
    const { data } = await supabase
      .from('cms_resources' as never)
      .select('*')
      .order('category')
      .order('sort_order');
    setItems(((data as unknown as Resource[]) || []).map((r) => ({
      ...r,
      description: r.description ?? '',
      badge: r.badge ?? '',
    })));
  };

  const add = () => {
    setItems([
      ...items,
      { category: CATEGORIES[0], title: '', description: '', url: '', badge: '', sort_order: items.length, is_published: true },
    ]);
  };

  const update = <K extends keyof Resource>(i: number, field: K, value: Resource[K]) => {
    const next = [...items];
    next[i] = { ...next[i], [field]: value };
    setItems(next);
  };

  const remove = async (i: number) => {
    const r = items[i];
    if (r.id) {
      await supabase.from('cms_resources' as never).delete().eq('id', r.id);
    }
    setItems(items.filter((_, idx) => idx !== i));
    toast({ title: 'Resource deleted' });
  };

  const saveAll = async () => {
    setLoading(true);
    for (let i = 0; i < items.length; i++) {
      const r = items[i];
      const payload = {
        category: r.category,
        title: r.title,
        description: r.description || null,
        url: r.url,
        badge: r.badge || null,
        sort_order: i,
        is_published: r.is_published,
      };
      const client = supabase as unknown as {
        from: (t: string) => {
          update: (p: unknown) => { eq: (c: string, v: string) => Promise<unknown> };
          insert: (p: unknown) => Promise<unknown>;
        };
      };
      if (r.id) {
        await client.from('cms_resources').update(payload).eq('id', r.id);
      } else {
        await client.from('cms_resources').insert(payload);
      }
    }
    await load();
    setLoading(false);
    toast({ title: 'Resources saved' });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Manage learning resources</CardTitle>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={add}><Plus className="w-4 h-4 mr-1" /> Add</Button>
          <Button size="sm" onClick={saveAll} disabled={loading}><Save className="w-4 h-4 mr-1" /> Save all</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((r, i) => (
          <div key={r.id || `new-${i}`} className="border border-border/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">#{i + 1}</span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs">
                  <Switch checked={r.is_published} onCheckedChange={(v) => update(i, 'is_published', v)} />
                  Published
                </label>
                <Button size="icon" variant="ghost" onClick={() => remove(i)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={r.category}
                onChange={(e) => update(i, 'category', e.target.value)}
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <Input placeholder="Badge (e.g. Org, Video, Podcast)" value={r.badge} onChange={(e) => update(i, 'badge', e.target.value)} />
            </div>
            <Input placeholder="Title" value={r.title} onChange={(e) => update(i, 'title', e.target.value)} />
            <Input placeholder="https://…" value={r.url} onChange={(e) => update(i, 'url', e.target.value)} />
            <Textarea placeholder="Short description" value={r.description} onChange={(e) => update(i, 'description', e.target.value)} rows={2} />
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No resources yet. Click "Add" to create one.</p>}
      </CardContent>
    </Card>
  );
};
