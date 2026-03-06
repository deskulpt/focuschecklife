import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trash2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Article {
  id?: string;
  title: string;
  content: string;
  icon: string;
  sort_order: number;
  is_published: boolean;
}

export const AdminArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => { loadArticles(); }, []);

  const loadArticles = async () => {
    const { data } = await supabase.from('cms_articles').select('*').order('sort_order') as any;
    setArticles(data || []);
  };

  const addArticle = () => {
    setArticles([...articles, { title: '', content: '', icon: 'FileText', sort_order: articles.length, is_published: true }]);
  };

  const updateArticle = (index: number, field: keyof Article, value: any) => {
    const updated = [...articles];
    (updated[index] as any)[field] = value;
    setArticles(updated);
  };

  const deleteArticle = async (index: number) => {
    const article = articles[index];
    if (article.id) {
      await supabase.from('cms_articles').delete().eq('id', article.id);
    }
    setArticles(articles.filter((_, i) => i !== index));
    toast({ title: 'Article deleted' });
  };

  const saveAll = async () => {
    setLoading(true);
    for (let i = 0; i < articles.length; i++) {
      const a = { ...articles[i], sort_order: i };
      if (a.id) {
        await supabase.from('cms_articles').update({
          title: a.title, content: a.content, icon: a.icon,
          sort_order: a.sort_order, is_published: a.is_published,
        }).eq('id', a.id);
      } else {
        await supabase.from('cms_articles').insert({
          title: a.title, content: a.content, icon: a.icon,
          sort_order: a.sort_order, is_published: a.is_published,
        } as any);
      }
    }
    await loadArticles();
    setLoading(false);
    toast({ title: 'Articles saved successfully' });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Manage Articles</CardTitle>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={addArticle}><Plus className="w-4 h-4 mr-1" /> Add</Button>
          <Button size="sm" onClick={saveAll} disabled={loading}><Save className="w-4 h-4 mr-1" /> Save All</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {articles.map((article, i) => (
          <div key={article.id || i} className="border border-border/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Article #{i + 1}</span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs">
                  <Switch checked={article.is_published} onCheckedChange={(v) => updateArticle(i, 'is_published', v)} />
                  Published
                </label>
                <Button size="icon" variant="ghost" onClick={() => deleteArticle(i)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input placeholder="Title" value={article.title} onChange={(e) => updateArticle(i, 'title', e.target.value)} />
              <Input placeholder="Icon (e.g. Brain, Target, Shield)" value={article.icon} onChange={(e) => updateArticle(i, 'icon', e.target.value)} />
            </div>
            <Textarea placeholder="Content" value={article.content} onChange={(e) => updateArticle(i, 'content', e.target.value)} rows={4} />
          </div>
        ))}
        {articles.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No articles yet. Click "Add" to create one.</p>}
      </CardContent>
    </Card>
  );
};
