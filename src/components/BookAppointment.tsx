import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarCheck, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

export const BookAppointment = () => {
  const { t } = useLanguage();
  const [enabled, setEnabled] = useState(false);
  const [bookingUrl, setBookingUrl] = useState('');
  const [clinicName, setClinicName] = useState('');

  useEffect(() => {
    supabase.from('site_settings').select('key, value').then(({ data }) => {
      if (data) {
        const map: Record<string, string> = {};
        (data as any[]).forEach(s => { map[s.key] = s.value; });
        setEnabled(map['booking_enabled'] === 'true');
        setBookingUrl(map['booking_url'] || '');
        setClinicName(map['booking_clinic_name'] || '');
      }
    });
  }, []);

  if (!enabled || !bookingUrl) return null;

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <CalendarCheck className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-base">
              {t('booking.title')}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {clinicName
                ? t('booking.descriptionWithClinic').replace('{clinic}', clinicName)
                : t('booking.description')}
            </p>
          </div>
          <Button
            onClick={() => window.open(bookingUrl, '_blank')}
            className="flex-shrink-0"
          >
            {t('booking.cta')} <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
