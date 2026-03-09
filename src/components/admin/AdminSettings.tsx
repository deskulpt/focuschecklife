import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { Save, CalendarCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const AdminSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    const { data } = await supabase.from('site_settings').select('key, value') as any;
    if (data) {
      const map: Record<string, string> = {};
      data.forEach((s: any) => { map[s.key] = s.value; });
      setSettings(map);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings({ ...settings, [key]: value });
  };

  const saveAll = async () => {
    setLoading(true);
    for (const [key, value] of Object.entries(settings)) {
      await supabase.from('site_settings').upsert({ key, value, updated_at: new Date().toISOString() } as any, { onConflict: 'key' });
    }
    setLoading(false);
    toast({ title: 'Settings saved! Tracking codes will take effect on next page load.' });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tracking & Analytics Pixels</CardTitle>
          <CardDescription>Add Google Analytics, Facebook Pixel, or any custom JS tracking code.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Google Analytics ID</label>
            <Input
              placeholder="G-XXXXXXXXXX"
              value={settings['google_analytics_id'] || ''}
              onChange={(e) => updateSetting('google_analytics_id', e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">Enter your GA4 Measurement ID (starts with G-)</p>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Facebook Pixel ID</label>
            <Input
              placeholder="123456789012345"
              value={settings['facebook_pixel_id'] || ''}
              onChange={(e) => updateSetting('facebook_pixel_id', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Custom Head Scripts</label>
            <Textarea
              placeholder="<script>...</script>"
              value={settings['custom_head_scripts'] || ''}
              onChange={(e) => updateSetting('custom_head_scripts', e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">Any additional tracking scripts to inject in the page head (e.g., TikTok Pixel, LinkedIn Insight Tag)</p>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Checkout Conversion Scripts</label>
            <Textarea
              placeholder="fbq('track', 'Purchase', {value: 5.00, currency: 'USD'});"
              value={settings['checkout_conversion_scripts'] || ''}
              onChange={(e) => updateSetting('checkout_conversion_scripts', e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">JS to fire on successful payment (conversion tracking)</p>
          </div>
          <Button onClick={saveAll} disabled={loading}><Save className="w-4 h-4 mr-2" /> Save Settings</Button>
        </CardContent>
      </Card>

      {/* Booking / Appointment Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarCheck className="w-5 h-5" /> Book Appointment Feature
          </CardTitle>
          <CardDescription>Enable a "Book Clinical Consultation" CTA shown after full assessment results. Users will be directed to an external booking URL.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Enable Booking CTA</label>
            <Switch
              checked={settings['booking_enabled'] === 'true'}
              onCheckedChange={(checked) => updateSetting('booking_enabled', checked ? 'true' : 'false')}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Clinic / Partner Name</label>
            <Input
              placeholder="e.g. MindCare Clinic"
              value={settings['booking_clinic_name'] || ''}
              onChange={(e) => updateSetting('booking_clinic_name', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Booking URL</label>
            <Input
              placeholder="https://calendly.com/your-clinic"
              value={settings['booking_url'] || ''}
              onChange={(e) => updateSetting('booking_url', e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">External link where users can book an appointment (Calendly, Cal.com, clinic website, etc.)</p>
          </div>
          <Button onClick={saveAll} disabled={loading}><Save className="w-4 h-4 mr-2" /> Save Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
};
