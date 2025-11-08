/**
 * Analytics Integration
 *
 * Multi-provider analytics with cookie consent support
 * Supports: Google Analytics, Plausible, custom events
 */

export interface AnalyticsConfig {
  googleAnalyticsId?: string;
  plausibleDomain?: string;
  debug?: boolean;
}

export interface AnalyticsEvent {
  name: string;
  category?: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
}

export interface PageViewEvent {
  path: string;
  title?: string;
  referrer?: string;
}

class Analytics {
  private config: AnalyticsConfig = {};
  private isInitialized = false;
  private hasConsent = false;

  /**
   * Initialize analytics with configuration
   */
  init(config: AnalyticsConfig) {
    this.config = config;
    this.isInitialized = true;

    // Check for existing consent
    this.checkConsent();

    if (this.config.debug) {
      console.log('[Analytics] Initialized with config:', config);
    }
  }

  /**
   * Check cookie consent status
   */
  private checkConsent(): boolean {
    if (typeof window === 'undefined') return false;

    try {
      const preferencesJson = localStorage.getItem('cookie-preferences');
      if (preferencesJson) {
        const preferences = JSON.parse(preferencesJson);
        this.hasConsent = preferences.analytics === true;

        if (this.hasConsent && !this.isGoogleAnalyticsLoaded()) {
          this.loadGoogleAnalytics();
        }

        return this.hasConsent;
      }
    } catch (error) {
      console.error('[Analytics] Error checking consent:', error);
    }

    return false;
  }

  /**
   * Update consent status
   */
  updateConsent(hasConsent: boolean) {
    this.hasConsent = hasConsent;

    if (this.config.debug) {
      console.log('[Analytics] Consent updated:', hasConsent);
    }

    if (hasConsent) {
      this.loadGoogleAnalytics();
    } else {
      this.disableTracking();
    }
  }

  /**
   * Check if Google Analytics is loaded
   */
  private isGoogleAnalyticsLoaded(): boolean {
    return typeof window !== 'undefined' && typeof (window as any).gtag !== 'undefined';
  }

  /**
   * Load Google Analytics script
   */
  private loadGoogleAnalytics() {
    if (
      typeof window === 'undefined' ||
      !this.config.googleAnalyticsId ||
      this.isGoogleAnalyticsLoaded()
    ) {
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.googleAnalyticsId}`;
    document.head.appendChild(script);

    // Initialize gtag
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).gtag = function () {
      (window as any).dataLayer.push(arguments);
    };

    (window as any).gtag('js', new Date());
    (window as any).gtag('config', this.config.googleAnalyticsId, {
      anonymize_ip: true, // GDPR compliance
      cookie_flags: 'SameSite=None;Secure',
    });

    if (this.config.debug) {
      console.log('[Analytics] Google Analytics loaded');
    }
  }

  /**
   * Disable all tracking
   */
  private disableTracking() {
    if (typeof window === 'undefined') return;

    // Disable Google Analytics
    if (this.config.googleAnalyticsId) {
      (window as any)[`ga-disable-${this.config.googleAnalyticsId}`] = true;
    }

    if (this.config.debug) {
      console.log('[Analytics] Tracking disabled');
    }
  }

  /**
   * Track page view
   */
  pageView(event: PageViewEvent) {
    if (!this.hasConsent) {
      if (this.config.debug) {
        console.log('[Analytics] Page view not tracked (no consent):', event);
      }
      return;
    }

    // Google Analytics
    if (this.config.googleAnalyticsId && this.isGoogleAnalyticsLoaded()) {
      (window as any).gtag('config', this.config.googleAnalyticsId, {
        page_path: event.path,
        page_title: event.title,
      });
    }

    // Plausible
    if (this.config.plausibleDomain && typeof (window as any).plausible !== 'undefined') {
      (window as any).plausible('pageview', {
        url: event.path,
      });
    }

    if (this.config.debug) {
      console.log('[Analytics] Page view tracked:', event);
    }
  }

  /**
   * Track custom event
   */
  trackEvent(event: AnalyticsEvent) {
    if (!this.hasConsent) {
      if (this.config.debug) {
        console.log('[Analytics] Event not tracked (no consent):', event);
      }
      return;
    }

    // Google Analytics
    if (this.config.googleAnalyticsId && this.isGoogleAnalyticsLoaded()) {
      (window as any).gtag('event', event.name, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.properties,
      });
    }

    // Plausible
    if (this.config.plausibleDomain && typeof (window as any).plausible !== 'undefined') {
      (window as any).plausible(event.name, {
        props: event.properties,
      });
    }

    if (this.config.debug) {
      console.log('[Analytics] Event tracked:', event);
    }
  }

  /**
   * Track donation
   */
  trackDonation(amount: number, currency: string = 'USD', method?: string) {
    this.trackEvent({
      name: 'donation',
      category: 'engagement',
      value: amount,
      properties: {
        currency,
        method,
        amount_dollars: amount / 100,
      },
    });
  }

  /**
   * Track signup
   */
  trackSignup(type: 'member' | 'volunteer' | 'newsletter') {
    this.trackEvent({
      name: 'signup',
      category: 'conversion',
      label: type,
    });
  }

  /**
   * Track form submission
   */
  trackFormSubmission(formName: string, success: boolean = true) {
    this.trackEvent({
      name: 'form_submission',
      category: 'engagement',
      label: formName,
      value: success ? 1 : 0,
      properties: {
        success,
      },
    });
  }

  /**
   * Track link click
   */
  trackLinkClick(url: string, text?: string, external: boolean = false) {
    this.trackEvent({
      name: external ? 'external_link_click' : 'internal_link_click',
      category: 'engagement',
      label: url,
      properties: {
        text,
        url,
      },
    });
  }

  /**
   * Track file download
   */
  trackDownload(fileName: string, fileType?: string) {
    this.trackEvent({
      name: 'file_download',
      category: 'engagement',
      label: fileName,
      properties: {
        file_type: fileType,
      },
    });
  }

  /**
   * Track video play
   */
  trackVideoPlay(videoTitle: string, duration?: number) {
    this.trackEvent({
      name: 'video_play',
      category: 'engagement',
      label: videoTitle,
      properties: {
        duration,
      },
    });
  }

  /**
   * Track search
   */
  trackSearch(query: string, resultsCount?: number) {
    this.trackEvent({
      name: 'search',
      category: 'engagement',
      label: query,
      properties: {
        results_count: resultsCount,
      },
    });
  }

  /**
   * Track social share
   */
  trackSocialShare(platform: string, url: string) {
    this.trackEvent({
      name: 'social_share',
      category: 'engagement',
      label: platform,
      properties: {
        url,
        platform,
      },
    });
  }

  /**
   * Track error
   */
  trackError(error: Error | string, fatal: boolean = false) {
    const errorMessage = typeof error === 'string' ? error : error.message;

    this.trackEvent({
      name: 'error',
      category: 'technical',
      label: errorMessage,
      properties: {
        fatal,
        stack: typeof error === 'object' ? error.stack : undefined,
      },
    });
  }

  /**
   * Track user timing (performance)
   */
  trackTiming(category: string, variable: string, value: number, label?: string) {
    if (!this.hasConsent || typeof window === 'undefined') return;

    if (this.config.googleAnalyticsId && this.isGoogleAnalyticsLoaded()) {
      (window as any).gtag('event', 'timing_complete', {
        name: variable,
        value: value,
        event_category: category,
        event_label: label,
      });
    }

    if (this.config.debug) {
      console.log('[Analytics] Timing tracked:', { category, variable, value, label });
    }
  }
}

// Singleton instance
export const analytics = new Analytics();

// Convenience functions
export const initAnalytics = (config: AnalyticsConfig) => analytics.init(config);
export const updateAnalyticsConsent = (hasConsent: boolean) => analytics.updateConsent(hasConsent);
export const trackPageView = (event: PageViewEvent) => analytics.pageView(event);
export const trackEvent = (event: AnalyticsEvent) => analytics.trackEvent(event);
export const trackDonation = (amount: number, currency?: string, method?: string) =>
  analytics.trackDonation(amount, currency, method);
export const trackSignup = (type: 'member' | 'volunteer' | 'newsletter') =>
  analytics.trackSignup(type);
export const trackFormSubmission = (formName: string, success?: boolean) =>
  analytics.trackFormSubmission(formName, success);
export const trackLinkClick = (url: string, text?: string, external?: boolean) =>
  analytics.trackLinkClick(url, text, external);
export const trackDownload = (fileName: string, fileType?: string) =>
  analytics.trackDownload(fileName, fileType);
export const trackVideoPlay = (videoTitle: string, duration?: number) =>
  analytics.trackVideoPlay(videoTitle, duration);
export const trackSearch = (query: string, resultsCount?: number) =>
  analytics.trackSearch(query, resultsCount);
export const trackSocialShare = (platform: string, url: string) =>
  analytics.trackSocialShare(platform, url);
export const trackError = (error: Error | string, fatal?: boolean) =>
  analytics.trackError(error, fatal);
export const trackTiming = (category: string, variable: string, value: number, label?: string) =>
  analytics.trackTiming(category, variable, value, label);
