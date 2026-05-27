import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Resource {
  id: string;
  category: string;
  title: string;
  description: string | null;
  url: string;
  badge: string | null;
  sort_order: number;
}

const CATEGORY_ORDER = [
  'Trusted Organizations',
  'YouTube Channels',
  'Podcasts',
  'Online Communities',
  'Free Reading & Guides',
  'For Family & Friends',
];

export const Resources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Free ADHD resources — FocusCheck';
    const load = async () => {
      const { data } = await supabase
        .from('cms_resources' as never)
        .select('*')
        .eq('is_published', true)
        .order('sort_order');
      setResources((data as unknown as Resource[]) || []);
      setLoading(false);
    };
    load();
  }, []);

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    items: resources.filter((r) => r.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> Back home
        </Link>

        <header className="mb-10 sm:mb-14">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Free ADHD resources</h1>
          <p className="text-muted-foreground max-w-2xl text-base sm:text-lg">
            Curated, trusted resources to keep learning about ADHD — for you and the people who support you.
            ADHD isn't laziness or lack of effort; it's a neurological difference in how the brain regulates
            attention, emotion, and impulse. Start anywhere below.
          </p>
        </header>

        {loading && <p className="text-sm text-muted-foreground">Loading resources…</p>}

        {!loading && grouped.length === 0 && (
          <p className="text-sm text-muted-foreground">No resources published yet.</p>
        )}

        <div className="space-y-12">
          {grouped.map((group) => (
            <section key={group.category}>
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-foreground">{group.category}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {group.items.map((r) => (
                  <a
                    key={r.id}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <Card className="p-4 h-full border-border/40 hover:border-primary/40 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {r.title}
                        </h3>
                        <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                      </div>
                      {r.badge && (
                        <Badge variant="secondary" className="mb-2 text-[10px]">{r.badge}</Badge>
                      )}
                      {r.description && (
                        <p className="text-sm text-muted-foreground">{r.description}</p>
                      )}
                    </Card>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-14 p-5 rounded-xl border border-border/40 bg-muted/30 text-sm text-muted-foreground">
          <strong className="text-foreground">A note:</strong> These external resources are independent of
          FocusCheck and are shared for educational purposes only. They are not a substitute for clinical
          evaluation or treatment.
        </div>
      </div>
    </div>
  );
};

export default Resources;
