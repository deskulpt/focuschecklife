import { useEffect } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export const TrackingScripts = () => {
  const settings = useSiteSettings();

  useEffect(() => {
    // Google Analytics
    const gaId = settings['google_analytics_id'];
    if (gaId && !document.getElementById('ga-script')) {
      const s1 = document.createElement('script');
      s1.id = 'ga-script';
      s1.async = true;
      s1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(s1);

      const s2 = document.createElement('script');
      s2.id = 'ga-config';
      s2.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`;
      document.head.appendChild(s2);
    }

    // Facebook Pixel
    const fbId = settings['facebook_pixel_id'];
    if (fbId && !document.getElementById('fb-pixel')) {
      const s = document.createElement('script');
      s.id = 'fb-pixel';
      s.textContent = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${fbId}');fbq('track','PageView');`;
      document.head.appendChild(s);
    }

    // Custom head scripts
    const custom = settings['custom_head_scripts'];
    if (custom && !document.getElementById('custom-head-scripts')) {
      const div = document.createElement('div');
      div.id = 'custom-head-scripts';
      div.innerHTML = custom;
      const scripts = div.querySelectorAll('script');
      scripts.forEach(oldS => {
        const newS = document.createElement('script');
        if (oldS.src) newS.src = oldS.src;
        else newS.textContent = oldS.textContent;
        newS.async = true;
        document.head.appendChild(newS);
      });
    }
  }, [settings]);

  return null;
};
