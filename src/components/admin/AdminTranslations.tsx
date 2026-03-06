import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Download, Upload, Save, Trash2, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Language {
  id: string;
  code: string;
  name: string;
  flag: string;
  is_enabled: boolean;
}

interface Translation {
  key: string;
  value: string;
}

// All known translation keys from the app
const ALL_KEYS = [
  // App core
  'app.title','app.subtitle','disclaimer.title','disclaimer.text',
  // Navigation
  'nav.home','nav.signIn','nav.getStarted','landing.myAssessment','landing.logout',
  // Hero
  'hero.badge','hero.title1','hero.title2','hero.subtitle','hero.cta','hero.learnMore','hero.noCreditCard',
  // Trust badges
  'trust.dsm5','trust.dsm5Sub','trust.cognitive','trust.cognitiveSub','trust.ageGroups','trust.ageGroupsSub','trust.pdf','trust.pdfSub',
  // Pricing
  'pricing.title','pricing.subtitle',
  'pricing.free.title','pricing.free.price','pricing.free.subtitle','pricing.free.f1','pricing.free.f2','pricing.free.f3','pricing.free.f4','pricing.free.cta',
  'pricing.full.title','pricing.full.price','pricing.full.subtitle','pricing.full.badge','pricing.full.f1','pricing.full.f2','pricing.full.f3','pricing.full.f4','pricing.full.f5','pricing.full.cta',
  'pricing.pdf.title','pricing.pdf.price','pricing.pdf.subtitle','pricing.pdf.f1','pricing.pdf.f2','pricing.pdf.f3','pricing.pdf.f4','pricing.pdf.f5','pricing.pdf.cta',
  // Learn
  'learn.title','learn.subtitle',
  'learn.a1.title','learn.a1.content','learn.a2.title','learn.a2.content','learn.a3.title','learn.a3.content',
  'learn.a4.title','learn.a4.content','learn.a5.title','learn.a5.content','learn.a6.title','learn.a6.content',
  // FAQ
  'faq.title','faq.subtitle',
  'faq.q1','faq.a1','faq.q2','faq.a2','faq.q3','faq.a3','faq.q4','faq.a4',
  'faq.q5','faq.a5','faq.q6','faq.a6','faq.q7','faq.a7','faq.q8','faq.a8',
  // CTA & Footer
  'cta.title','cta.subtitle','cta.button',
  'footer.disclaimer','footer.copyright',
  // Auth
  'auth.welcomeBack','auth.createAccount','auth.signInSubtitle','auth.signUpSubtitle','auth.subtitle',
  'auth.fullName','auth.phone','auth.age','auth.gender','auth.gender.male','auth.gender.female','auth.gender.nonBinary','auth.gender.preferNot',
  'auth.country','auth.email','auth.password','auth.submit.signIn','auth.submit.signUp','auth.loading',
  'auth.switchToSignUp','auth.switchToSignIn','auth.freeIncludes','auth.freeIncludesDesc','auth.backHome',
  'auth.accountCreated','auth.checkEmail','auth.error',
  // Age selection
  'age.title','age.subtitle','age.child.title','age.child.description','age.teen.title','age.teen.description','age.adult.title','age.adult.description','age.questions','age.time','age.begin','age.research',
  // Survey
  'survey.question','survey.of','survey.previous','survey.back','survey.instructions.child','survey.instructions.teen','survey.instructions.adult','survey.progress','survey.answered','survey.selectAnswer',
  'survey.category.inattention','survey.category.hyperactivity','survey.category.impulsivity','survey.category.functional_impairment',
  // Scale
  'scale.never','scale.rarely','scale.sometimes','scale.often','scale.veryOften',
  // Games
  'games.title','games.subtitle','games.back','games.backToMenu','games.game','games.progress','games.completed',
  'games.test1.title','games.test1.description','games.test1.time','games.test2.title','games.test2.description','games.test2.time','games.test3.title','games.test3.description','games.test3.time',
  'games.complete','games.pending','games.start','games.viewResults','games.completeAll','games.research','games.basedOn','games.note','games.allComplete',
  // CPT
  'cpt.title','cpt.description','cpt.instructions','cpt.start','cpt.respond','cpt.hits','cpt.misses','cpt.falseAlarms','cpt.avgReaction','cpt.trial','cpt.watching',
  // Working Memory
  'wm.title','wm.description','wm.instructions.title','wm.instructions.1','wm.instructions.2','wm.instructions.3','wm.instructions.4','wm.start','wm.watch','wm.repeat','wm.level','wm.trial','wm.correct','wm.maxLevel',
  // Stroop
  'stroop.title','stroop.description','stroop.instructions.title','stroop.instructions.1','stroop.instructions.2','stroop.instructions.3','stroop.start','stroop.selectColor','stroop.trial','stroop.correct','stroop.avgTime',
  // Results
  'results.title','results.completed','results.ageGroup.child','results.ageGroup.teen','results.ageGroup.adult','results.overallScore','results.overallRisk','results.low','results.moderate','results.high',
  'results.categoryBreakdown','results.cognitivePerformance','results.cognitiveDescription','results.performanceComparison','results.symptomProfile','results.score','results.yourScore','results.clinicalThreshold',
  'results.basedOn','results.clinicalCriteria','results.validatedScales','results.retake','results.save','results.medicalDisclaimer','results.disclaimerText',
  'results.unlockCta','results.getPdf','results.printDisabled','results.upgradeDescription',
  // Dashboard
  'dashboard.high.title','dashboard.high.description','dashboard.high.recommendation','dashboard.moderate.title','dashboard.moderate.description','dashboard.moderate.recommendation','dashboard.low.title','dashboard.low.description','dashboard.low.recommendation',
  'dashboard.sustainedAttention','dashboard.impulseControl','dashboard.workingMemory','dashboard.cognitiveFlexibility','dashboard.reactionTime','dashboard.accuracy','dashboard.level',
  'dashboard.attentionTest','dashboard.memoryTest','dashboard.flexibilityTest','dashboard.correctHits','dashboard.falseAlarms','dashboard.missed','dashboard.avgTime','dashboard.correct','dashboard.incorrect',
  'dashboard.maxLevelAchieved','dashboard.congruent','dashboard.incongruent','dashboard.clinicalNote','dashboard.clinicalNoteText','dashboard.accuracyPercent','dashboard.performanceScore','dashboard.attention','dashboard.memory','dashboard.flexibility',
  // Category descriptions
  'category.inattention.low','category.inattention.moderate','category.inattention.high','category.hyperactivity.low','category.hyperactivity.moderate','category.hyperactivity.high',
  'category.impulsivity.low','category.impulsivity.moderate','category.impulsivity.high','category.functional_impairment.low','category.functional_impairment.moderate','category.functional_impairment.high',
  // Paywall
  'paywall.unlockTitle','paywall.unlockDescription','paywall.oneTime',
  // Promo
  'promo.title','promo.placeholder','promo.apply','promo.redeemed','promo.successTitle','promo.successDesc',
  'promo.invalidCode','promo.invalidCodeDesc','promo.codeExpired','promo.codeExpiredDesc','promo.maxUsesDesc',
  'promo.alreadyRedeemed','promo.alreadyRedeemedDesc','promo.error','promo.errorDesc',
  // Assessment flow
  'assessment.paymentSoon',
];

export const AdminTranslations = () => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLang, setSelectedLang] = useState<string>('');
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [filter, setFilter] = useState('');
  const [newLang, setNewLang] = useState({ code: '', name: '', flag: '🌐' });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => { loadLanguages(); }, []);
  useEffect(() => { if (selectedLang) loadTranslations(selectedLang); }, [selectedLang]);

  const loadLanguages = async () => {
    const { data } = await supabase.from('languages').select('*').order('code') as any;
    if (data) {
      setLanguages(data);
      if (!selectedLang && data.length > 0) setSelectedLang(data[0].code);
    }
  };

  const loadTranslations = async (code: string) => {
    const { data } = await supabase.from('translations').select('key, value').eq('language_code', code) as any;
    const map: Record<string, string> = {};
    (data || []).forEach((t: any) => { map[t.key] = t.value; });
    setTranslations(ALL_KEYS.map(key => ({ key, value: map[key] || '' })));
  };

  const updateTranslation = (key: string, value: string) => {
    setTranslations(prev => prev.map(t => t.key === key ? { ...t, value } : t));
  };

  const saveTranslations = async () => {
    setLoading(true);
    const nonEmpty = translations.filter(t => t.value.trim());
    for (const t of nonEmpty) {
      await supabase.from('translations').upsert(
        { language_code: selectedLang, key: t.key, value: t.value, updated_at: new Date().toISOString() } as any,
        { onConflict: 'language_code,key' }
      );
    }
    setLoading(false);
    toast({ title: `Translations saved for ${selectedLang}` });
  };

  const addLanguage = async () => {
    if (!newLang.code || !newLang.name) return;
    await supabase.from('languages').insert({ code: newLang.code, name: newLang.name, flag: newLang.flag, is_enabled: false } as any);
    setNewLang({ code: '', name: '', flag: '🌐' });
    await loadLanguages();
    toast({ title: `Language "${newLang.name}" added` });
  };

  const toggleLanguage = async (lang: Language) => {
    await supabase.from('languages').update({ is_enabled: !lang.is_enabled } as any).eq('id', lang.id);
    await loadLanguages();
  };

  const deleteLanguage = async (lang: Language) => {
    if (lang.code === 'en') return toast({ title: 'Cannot delete English', variant: 'destructive' });
    await supabase.from('languages').delete().eq('id', lang.id);
    if (selectedLang === lang.code) setSelectedLang('en');
    await loadLanguages();
    toast({ title: `Language "${lang.name}" deleted` });
  };

  const downloadCSV = () => {
    const header = 'key,value';
    const rows = translations.map(t => `"${t.key}","${(t.value || '').replace(/"/g, '""')}"`);
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translations_${selectedLang}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const uploadCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').slice(1); // skip header
      const parsed: Translation[] = [];
      for (const line of lines) {
        const match = line.match(/^"([^"]+)","(.*)"$/);
        if (match) {
          parsed.push({ key: match[1], value: match[2].replace(/""/g, '"') });
        } else {
          const [key, ...rest] = line.split(',');
          if (key?.trim()) parsed.push({ key: key.trim(), value: rest.join(',').trim() });
        }
      }
      if (parsed.length > 0) {
        setTranslations(ALL_KEYS.map(key => {
          const found = parsed.find(p => p.key === key);
          return { key, value: found?.value || '' };
        }));
        toast({ title: `${parsed.length} translations loaded from CSV. Click Save to persist.` });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filtered = translations.filter(t =>
    !filter || t.key.toLowerCase().includes(filter.toLowerCase()) || t.value.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Language Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Globe className="w-5 h-5" /> Manage Languages</CardTitle>
          <CardDescription>Add, enable/disable languages. Only enabled languages with translations appear in the dropdown.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {languages.map(lang => (
              <div key={lang.id} className="flex items-center justify-between border border-border/50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{lang.flag}</span>
                  <div>
                    <div className="text-sm font-medium">{lang.name}</div>
                    <div className="text-xs text-muted-foreground">{lang.code}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={lang.is_enabled} onCheckedChange={() => toggleLanguage(lang)} />
                  {lang.code !== 'en' && (
                    <Button size="icon" variant="ghost" onClick={() => deleteLanguage(lang)}>
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-border/50">
            <Input placeholder="Code (e.g. es, fr)" value={newLang.code} onChange={e => setNewLang({ ...newLang, code: e.target.value })} className="max-w-[140px]" />
            <Input placeholder="Name (e.g. Español)" value={newLang.name} onChange={e => setNewLang({ ...newLang, name: e.target.value })} className="max-w-[200px]" />
            <Input placeholder="Flag emoji" value={newLang.flag} onChange={e => setNewLang({ ...newLang, flag: e.target.value })} className="max-w-[80px]" />
            <Button size="sm" variant="outline" onClick={addLanguage}><Plus className="w-4 h-4 mr-1" /> Add Language</Button>
          </div>
        </CardContent>
      </Card>

      {/* Translation Editor */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-lg">Translation Editor</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Select value={selectedLang} onValueChange={setSelectedLang}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(l => (
                    <SelectItem key={l.code} value={l.code}>{l.flag} {l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" onClick={downloadCSV}><Download className="w-4 h-4 mr-1" /> CSV</Button>
              <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}><Upload className="w-4 h-4 mr-1" /> Upload</Button>
              <Button size="sm" onClick={saveTranslations} disabled={loading}><Save className="w-4 h-4 mr-1" /> Save</Button>
            </div>
          </div>
          <Input placeholder="Filter keys..." value={filter} onChange={e => setFilter(e.target.value)} className="mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filtered.map(t => (
              <div key={t.key} className="grid grid-cols-1 sm:grid-cols-[280px_1fr] gap-2 items-start border-b border-border/30 pb-2">
                <label className="text-xs font-mono text-muted-foreground pt-2 break-all">{t.key}</label>
                <Input
                  value={t.value}
                  onChange={e => updateTranslation(t.key, e.target.value)}
                  placeholder={`Translation for "${t.key}"`}
                  className="text-sm"
                />
              </div>
            ))}
          </div>
          <input ref={fileInputRef} type="file" accept=".csv" onChange={uploadCSV} className="hidden" />
        </CardContent>
      </Card>
    </div>
  );
};
