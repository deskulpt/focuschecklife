import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const getSessionId = () => {
  let sid = sessionStorage.getItem('fc_sid');
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem('fc_sid', sid);
  }
  return sid;
};

export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const track = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('page_visits').insert({
        page: location.pathname,
        user_id: user?.id || null,
        session_id: getSessionId(),
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
      } as any);
    };
    track();
  }, [location.pathname]);
};
