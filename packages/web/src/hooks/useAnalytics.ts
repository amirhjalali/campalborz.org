import { useEffect, useRef } from 'react';
import { trpc } from '../lib/trpc';

interface AnalyticsEvent {
  event: string;
  category: string;
  properties?: Record<string, any>;
  page?: string;
}

export function useAnalytics() {
  const sessionId = useRef<string>();
  const trackMutation = trpc.analytics.track.useMutation();
  const trackGoalMutation = trpc.analytics.trackGoal.useMutation();

  // Generate session ID on mount
  useEffect(() => {
    if (!sessionId.current) {
      sessionId.current = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }, []);

  const track = async (event: AnalyticsEvent) => {
    if (!sessionId.current) return;

    const eventData = {
      event: event.event,
      category: event.category,
      properties: event.properties,
      sessionId: sessionId.current,
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      page: event.page || window.location.pathname,
    };

    try {
      await trackMutation.mutateAsync(eventData);
    } catch (error) {
      // Silently fail - don't break user experience for analytics
      console.warn('Analytics tracking failed:', error);
    }
  };

  const trackPageView = (page?: string) => {
    track({
      event: 'page_view',
      category: 'navigation',
      page: page || window.location.pathname,
      properties: {
        title: document.title,
        url: window.location.href,
      },
    });
  };

  const trackClick = (element: string, properties?: Record<string, any>) => {
    track({
      event: 'click',
      category: 'interaction',
      properties: {
        element,
        ...properties,
      },
    });
  };

  const trackFormSubmit = (formName: string, properties?: Record<string, any>) => {
    track({
      event: 'form_submit',
      category: 'conversion',
      properties: {
        form: formName,
        ...properties,
      },
    });
  };

  const trackDownload = (filename: string, properties?: Record<string, any>) => {
    track({
      event: 'download',
      category: 'engagement',
      properties: {
        filename,
        ...properties,
      },
    });
  };

  const trackGoal = async (goalName: string, value?: number) => {
    try {
      await trackGoalMutation.mutateAsync({ goalName, value });
    } catch (error) {
      console.warn('Goal tracking failed:', error);
    }
  };

  const trackSearch = (query: string, resultsCount?: number) => {
    track({
      event: 'search',
      category: 'engagement',
      properties: {
        query,
        resultsCount,
      },
    });
  };

  const trackTimeOnPage = (duration: number) => {
    track({
      event: 'time_on_page',
      category: 'engagement',
      properties: {
        duration,
        page: window.location.pathname,
      },
    });
  };

  return {
    track,
    trackPageView,
    trackClick,
    trackFormSubmit,
    trackDownload,
    trackGoal,
    trackSearch,
    trackTimeOnPage,
  };
}

// Hook for page view tracking
export function usePageView() {
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView();
  }, [trackPageView]);
}

// Hook for time on page tracking
export function useTimeOnPage() {
  const { trackTimeOnPage } = useAnalytics();
  const startTime = useRef<number>();

  useEffect(() => {
    startTime.current = Date.now();

    const handleBeforeUnload = () => {
      if (startTime.current) {
        const duration = Math.floor((Date.now() - startTime.current) / 1000);
        trackTimeOnPage(duration);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload();
    };
  }, [trackTimeOnPage]);
}

// Hook for scroll tracking
export function useScrollTracking() {
  const { track } = useAnalytics();
  const scrollDepths = useRef<Set<number>>(new Set());

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const scrollPercent = Math.round((scrollTop / (docHeight - winHeight)) * 100);

      // Track at 25%, 50%, 75%, and 100% scroll depths
      const depths = [25, 50, 75, 100];
      for (const depth of depths) {
        if (scrollPercent >= depth && !scrollDepths.current.has(depth)) {
          scrollDepths.current.add(depth);
          track({
            event: 'scroll_depth',
            category: 'engagement',
            properties: {
              depth,
              page: window.location.pathname,
            },
          });
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [track]);
}