import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { Save, CalendarCheck, DollarSign, Sparkles, Globe, RefreshCw } from 'lucide-react';
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
    toast({ title: 'Settings saved! Changes will take effect on next page load.' });
  };

  return (
    <div className="space-y-6">
      {/* Pricing & Marketing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="w-5 h-5" /> Pricing & Title Settings
          </CardTitle>
          <CardDescription>Customize the pricing section displayed on the landing page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Landing Page Title</label>
            <Input
              placeholder="Know Your ADHD. Take Control of Your Focus."
              value={settings['landing_title'] || ''}
              onChange={(e) => updateSetting('landing_title', e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">Override the hero section title (leave empty for default)</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Full Assessment Price (USD)</label>
              <Input
                placeholder="$5"
                value={settings['pricing_usd'] || ''}
                onChange={(e) => updateSetting('pricing_usd', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Full Assessment Price (BRL)</label>
              <Input
                placeholder="R$25"
                value={settings['pricing_brl'] || ''}
                onChange={(e) => updateSetting('pricing_brl', e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Monitoring Plan Price (USD)</label>
              <Input
                placeholder="$12"
                value={settings['pricing_monitor_usd'] || ''}
                onChange={(e) => updateSetting('pricing_monitor_usd', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Monitoring Plan Price (BRL)</label>
              <Input
                placeholder="R$59"
                value={settings['pricing_monitor_brl'] || ''}
                onChange={(e) => updateSetting('pricing_monitor_brl', e.target.value)}
              />
            </div>
          </div>
          <Button onClick={saveAll} disabled={loading}><Save className="w-4 h-4 mr-2" /> Save Settings</Button>
        </CardContent>
      </Card>

      {/* Discount / Promotional Messaging */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5" /> Promotional Messaging
          </CardTitle>
          <CardDescription>Show discount badges, savings messages, and urgency banners on the pricing card.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Enable Discount Badge</label>
            <Switch
              checked={settings['discount_enabled'] === 'true'}
              onCheckedChange={(checked) => updateSetting('discount_enabled', checked ? 'true' : 'false')}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Original Price Display</label>
            <Input
              placeholder="$19.99"
              value={settings['discount_original_price'] || ''}
              onChange={(e) => updateSetting('discount_original_price', e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">Shown with strikethrough next to the current price</p>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Savings Message</label>
            <Input
              placeholder="Save 75% — Limited Launch Price!"
              value={settings['discount_savings_message'] || ''}
              onChange={(e) => updateSetting('discount_savings_message', e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Show "Limited Time" Urgency Banner</label>
            <Switch
              checked={settings['limited_time_enabled'] === 'true'}
              onCheckedChange={(checked) => updateSetting('limited_time_enabled', checked ? 'true' : 'false')}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Limited Time Message</label>
            <Input
              placeholder="⏰ Limited time offer — Price increases soon!"
              value={settings['limited_time_message'] || ''}
              onChange={(e) => updateSetting('limited_time_message', e.target.value)}
            />
          </div>
          <Button onClick={saveAll} disabled={loading}><Save className="w-4 h-4 mr-2" /> Save Settings</Button>
        </CardContent>
      </Card>

      {/* Tracking & Analytics */}
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
            <p className="text-xs text-muted-foreground mt-1">Any additional tracking scripts to inject in the page head</p>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Checkout Conversion Scripts</label>
            <Textarea
              placeholder="fbq('track', 'Purchase', {value: 5.00, currency: 'USD'});"
              value={settings['checkout_conversion_scripts'] || ''}
              onChange={(e) => updateSetting('checkout_conversion_scripts', e.target.value)}
              rows={3}
            />
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
          <CardDescription>Enable a "Book Professional Consultation" CTA shown after full assessment results.</CardDescription>
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
            <p className="text-xs text-muted-foreground mt-1">External link where users can book an appointment</p>
          </div>
          <Button onClick={saveAll} disabled={loading}><Save className="w-4 h-4 mr-2" /> Save Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
};
