import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type Status = 'loading' | 'valid' | 'used' | 'invalid' | 'done' | 'error';

const Unsubscribe = () => {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState<Status>('loading');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) { setStatus('invalid'); return; }
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`;
    fetch(url, { headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } })
      .then(async (r) => {
        const body: unknown = await r.json().catch(() => ({}));
        const valid = typeof body === 'object' && body !== null && 'valid' in body && body.valid === true;
        const reason = typeof body === 'object' && body !== null && 'reason' in body ? String(body.reason) : '';
        setStatus(valid ? 'valid' : reason === 'already_unsubscribed' ? 'used' : 'invalid');
      })
      .catch(() => setStatus('error'));
  }, [token]);

  const confirm = async () => {
    setSubmitting(true);
    const { error } = await supabase.functions.invoke('handle-email-unsubscribe', { body: { token } });
    setSubmitting(false);
    setStatus(error ? 'error' : 'done');
  };

  const messages: Record<Status, string> = {
    loading: 'Checking your link…',
    valid: 'Stop receiving FocusCheck emails at this address?',
    used: 'You are already unsubscribed.',
    invalid: 'This unsubscribe link is invalid or has expired.',
    done: 'You have been unsubscribed. You will not receive further emails.',
    error: 'Something went wrong. Please try again in a moment.',
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center space-y-4">
          <img src="/logo.png" alt="FocusCheck" className="w-12 h-12 mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Email preferences</h1>
          <p className="text-muted-foreground">{messages[status]}</p>
          {status === 'loading' && <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />}
          {status === 'valid' && (
            <Button onClick={confirm} disabled={submitting} className="w-full">
              {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Confirm unsubscribe
            </Button>
          )}
          <Link to="/" className="block text-sm text-primary underline">Go to homepage</Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default Unsubscribe;
