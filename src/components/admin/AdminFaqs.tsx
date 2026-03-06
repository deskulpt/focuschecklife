import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trash2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Faq {
  id?: string;
  question: string;
  answer: string;
  sort_order: number;
  is_published: boolean;
}

export const AdminFaqs = () => {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => { loadFaqs(); }, []);

  const loadFaqs = async () => {
    const { data } = await supabase.from('cms_faqs').select('*').order('sort_order') as any;
    setFaqs(data || []);
  };

  const addFaq = () => {
    setFaqs([...faqs, { question: '', answer: '', sort_order: faqs.length, is_published: true }]);
  };

  const updateFaq = (index: number, field: keyof Faq, value: any) => {
    const updated = [...faqs];
    (updated[index] as any)[field] = value;
    setFaqs(updated);
  };

  const deleteFaq = async (index: number) => {
    const faq = faqs[index];
    if (faq.id) {
      await supabase.from('cms_faqs').delete().eq('id', faq.id);
    }
    setFaqs(faqs.filter((_, i) => i !== index));
    toast({ title: 'FAQ deleted' });
  };

  const saveAll = async () => {
    setLoading(true);
    for (let i = 0; i < faqs.length; i++) {
      const faq = { ...faqs[i], sort_order: i };
      if (faq.id) {
        await supabase.from('cms_faqs').update({
          question: faq.question,
          answer: faq.answer,
          sort_order: faq.sort_order,
          is_published: faq.is_published,
        }).eq('id', faq.id);
      } else {
        await supabase.from('cms_faqs').insert({
          question: faq.question,
          answer: faq.answer,
          sort_order: faq.sort_order,
          is_published: faq.is_published,
        } as any);
      }
    }
    await loadFaqs();
    setLoading(false);
    toast({ title: 'FAQs saved successfully' });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Manage FAQs</CardTitle>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={addFaq}><Plus className="w-4 h-4 mr-1" /> Add</Button>
          <Button size="sm" onClick={saveAll} disabled={loading}><Save className="w-4 h-4 mr-1" /> Save All</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {faqs.map((faq, i) => (
          <div key={faq.id || i} className="border border-border/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">FAQ #{i + 1}</span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs">
                  <Switch checked={faq.is_published} onCheckedChange={(v) => updateFaq(i, 'is_published', v)} />
                  Published
                </label>
                <Button size="icon" variant="ghost" onClick={() => deleteFaq(i)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
            <Input placeholder="Question" value={faq.question} onChange={(e) => updateFaq(i, 'question', e.target.value)} />
            <Textarea placeholder="Answer" value={faq.answer} onChange={(e) => updateFaq(i, 'answer', e.target.value)} rows={3} />
          </div>
        ))}
        {faqs.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No FAQs yet. Click "Add" to create one.</p>}
      </CardContent>
    </Card>
  );
};
