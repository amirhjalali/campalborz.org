'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initAnalytics, trackPageView, updateAnalyticsConsent } from '@/lib/analytics';

interface AnalyticsProviderProps {
  children: React.ReactNode;
  googleAnalyticsId?: string;
  plausibleDomain?: string;
  debug?: boolean;
}

/**
 * Analytics Provider
 *
 * Initializes analytics and tracks page views automatically
 * Respects cookie consent preferences
 */
export function AnalyticsProvider({
  children,
  googleAnalyticsId,
  plausibleDomain,
  debug = false,
}: AnalyticsProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize analytics on mount
  useEffect(() => {
    initAnalytics({
      googleAnalyticsId,
      plausibleDomain,
      debug,
    });

    // Listen for consent changes
    const handleConsentChange = () => {
      try {
        const preferencesJson = localStorage.getItem('cookie-preferences');
        if (preferencesJson) {
          const preferences = JSON.parse(preferencesJson);
          updateAnalyticsConsent(preferences.analytics === true);
        }
      } catch (error) {
        console.error('[Analytics] Error handling consent change:', error);
      }
    };

    // Check initial consent
    handleConsentChange();

    // Listen for storage events (consent changes in other tabs)
    window.addEventListener('storage', handleConsentChange);

    return () => {
      window.removeEventListener('storage', handleConsentChange);
    };
  }, [googleAnalyticsId, plausibleDomain, debug]);

  // Track page views on route change
  useEffect(() => {
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

    trackPageView({
      path: url,
      title: document.title,
      referrer: document.referrer,
    });
  }, [pathname, searchParams]);

  return <>{children}</>;
}

/**
 * Google Tag Manager Script
 *
 * Add this to your root layout for Google Tag Manager support
 */
export function GoogleTagManagerScript({ gtmId }: { gtmId: string }) {
  return (
    <>
      {/* Google Tag Manager */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `,
        }}
      />
    </>
  );
}

/**
 * Google Tag Manager Noscript
 *
 * Add this to your root layout body for Google Tag Manager fallback
 */
export function GoogleTagManagerNoscript({ gtmId }: { gtmId: string }) {
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  );
}

/**
 * Plausible Analytics Script
 *
 * Add this to your root layout for Plausible Analytics support
 */
export function PlausibleScript({ domain }: { domain: string }) {
  return (
    <script
      defer
      data-domain={domain}
      src="https://plausible.io/js/script.js"
    />
  );
}
