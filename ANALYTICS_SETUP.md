# Analytics Setup Guide

This guide explains how to set up and use analytics tracking in the Camp Alborz platform.

## Overview

The platform supports two analytics approaches:

1. **Third-Party Analytics** (Google Analytics, Plausible) - For standard web analytics
2. **Custom Analytics** (Backend tracking) - For custom event tracking in your database

Both systems can work together and respect user cookie consent preferences.

## Third-Party Analytics Setup

### 1. Install Analytics Provider

Add the `AnalyticsProvider` to your root layout:

```tsx
// app/layout.tsx
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AnalyticsProvider
          googleAnalyticsId={process.env.NEXT_PUBLIC_GA_ID}
          plausibleDomain="campalborz.org"
          debug={process.env.NODE_ENV === 'development'}
        >
          {children}
        </AnalyticsProvider>
      </body>
    </html>
  );
}
```

### 2. Set Environment Variables

Add to your `.env.local`:

```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=campalborz.org
```

### 3. Cookie Consent Integration

The analytics system automatically respects cookie consent from the `CookieConsent` component:

```tsx
// Add CookieConsent to your root layout
import { CookieConsent } from '@/components/CookieConsent';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AnalyticsProvider googleAnalyticsId={process.env.NEXT_PUBLIC_GA_ID}>
          {children}
        </AnalyticsProvider>

        <CookieConsent />
      </body>
    </html>
  );
}
```

Analytics will only track users who have accepted analytics cookies.

## Tracking Events

### Basic Event Tracking

```tsx
import { trackEvent } from '@/lib/analytics';

// Track a custom event
trackEvent({
  name: 'button_click',
  category: 'engagement',
  label: 'Join Camp',
  value: 1,
  properties: {
    location: 'homepage',
  },
});
```

### Page View Tracking

Page views are automatically tracked when using `AnalyticsProvider`. For manual tracking:

```tsx
import { trackPageView } from '@/lib/analytics';

trackPageView({
  path: '/events',
  title: 'Events - Camp Alborz',
});
```

### Common Event Helpers

#### Donation Tracking

```tsx
import { trackDonation } from '@/lib/analytics';

const handleDonation = async (amount: number) => {
  // ... donation processing
  trackDonation(amount, 'USD', 'stripe');
};
```

#### Signup Tracking

```tsx
import { trackSignup } from '@/lib/analytics';

const handleSignup = async () => {
  // ... signup processing
  trackSignup('member'); // or 'volunteer' or 'newsletter'
};
```

#### Form Submission Tracking

```tsx
import { trackFormSubmission } from '@/lib/analytics';

const handleSubmit = async (formData: any) => {
  try {
    // ... form submission
    trackFormSubmission('contact-form', true);
  } catch (error) {
    trackFormSubmission('contact-form', false);
  }
};
```

#### Link Click Tracking

```tsx
import { trackLinkClick } from '@/lib/analytics';

<a
  href="https://external-site.com"
  onClick={() => trackLinkClick('https://external-site.com', 'Partner Link', true)}
>
  Partner Site
</a>
```

#### Download Tracking

```tsx
import { trackDownload } from '@/lib/analytics';

<button onClick={() => {
  trackDownload('camp-guide-2024.pdf', 'pdf');
  window.open('/downloads/camp-guide-2024.pdf');
}}>
  Download Guide
</button>
```

#### Search Tracking

```tsx
import { trackSearch } from '@/lib/analytics';

const handleSearch = (query: string, results: any[]) => {
  trackSearch(query, results.length);
};
```

#### Social Share Tracking

```tsx
import { trackSocialShare } from '@/lib/analytics';

const shareToTwitter = () => {
  trackSocialShare('twitter', window.location.href);
  // ... share logic
};
```

#### Error Tracking

```tsx
import { trackError } from '@/lib/analytics';

try {
  // ... code that might fail
} catch (error) {
  trackError(error, false); // false = not fatal
  // ... error handling
}
```

#### Video Play Tracking

```tsx
import { trackVideoPlay } from '@/lib/analytics';

<video
  onPlay={() => trackVideoPlay('Camp Intro Video', 120)}
>
  ...
</video>
```

## Custom Backend Analytics

For custom event tracking to your database, use the existing `useAnalytics` hook:

```tsx
import { useAnalytics } from '@/hooks/useAnalytics';

function MyComponent() {
  const analytics = useAnalytics();

  const handleAction = () => {
    analytics.track({
      event: 'custom_action',
      category: 'engagement',
      properties: {
        customField: 'value',
      },
    });
  };

  return <button onClick={handleAction}>Track Me</button>;
}
```

### Available Custom Tracking Methods

```tsx
const {
  track,               // Generic event tracking
  trackPageView,       // Page view tracking
  trackClick,          // Click tracking
  trackFormSubmit,     // Form submission tracking
  trackDownload,       // Download tracking
  trackGoal,           // Goal conversion tracking
  trackSearch,         // Search tracking
  trackTimeOnPage,     // Time on page tracking
} = useAnalytics();
```

### Additional Hooks

#### Page View Tracking

```tsx
import { usePageView } from '@/hooks/useAnalytics';

function MyPage() {
  usePageView(); // Automatically tracks page view on mount
  return <div>...</div>;
}
```

#### Time on Page Tracking

```tsx
import { useTimeOnPage } from '@/hooks/useAnalytics';

function MyPage() {
  useTimeOnPage(); // Tracks time spent on page
  return <div>...</div>;
}
```

#### Scroll Depth Tracking

```tsx
import { useScrollTracking } from '@/hooks/useAnalytics';

function MyPage() {
  useScrollTracking(); // Tracks scroll depth (25%, 50%, 75%, 100%)
  return <div>...</div>;
}
```

## Google Tag Manager (Alternative)

If you prefer Google Tag Manager over direct GA integration:

```tsx
// app/layout.tsx
import {
  GoogleTagManagerScript,
  GoogleTagManagerNoscript
} from '@/components/analytics/AnalyticsProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <GoogleTagManagerScript gtmId="GTM-XXXXXX" />
      </head>
      <body>
        <GoogleTagManagerNoscript gtmId="GTM-XXXXXX" />
        {children}
      </body>
    </html>
  );
}
```

## Plausible Analytics (Alternative)

For privacy-focused analytics with Plausible:

```tsx
// app/layout.tsx
import { PlausibleScript } from '@/components/analytics/AnalyticsProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <PlausibleScript domain="campalborz.org" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
```

## GDPR Compliance

The analytics system is GDPR compliant:

1. ✅ No tracking before user consent
2. ✅ IP anonymization enabled
3. ✅ Respects "Do Not Track" browser settings
4. ✅ Cookie preferences stored in localStorage
5. ✅ User can change preferences anytime
6. ✅ All tracking can be disabled

### Cookie Categories

- **Necessary**: Always enabled (authentication, sessions)
- **Analytics**: Google Analytics, Plausible (requires consent)
- **Marketing**: Ad tracking, remarketing (requires consent)
- **Preferences**: User preferences, personalization (requires consent)

## Testing Analytics

### Development Mode

Enable debug mode to see analytics events in console:

```tsx
<AnalyticsProvider
  googleAnalyticsId={process.env.NEXT_PUBLIC_GA_ID}
  debug={true}
>
  {children}
</AnalyticsProvider>
```

### Testing Without Tracking

Analytics automatically respects:
- Development environment (won't send to GA in dev)
- Ad blockers
- Browser "Do Not Track" settings
- Missing analytics IDs

## Best Practices

1. **Always respect user privacy** - Check consent before tracking
2. **Track meaningful events** - Don't over-track, focus on key metrics
3. **Use descriptive names** - Make event names clear and consistent
4. **Include context** - Add relevant properties to events
5. **Test thoroughly** - Verify events are tracked correctly
6. **Document custom events** - Keep track of what you're measuring

## Common Metrics to Track

### Engagement Metrics
- Page views
- Time on page
- Scroll depth
- Video plays
- Downloads
- Social shares

### Conversion Metrics
- Signups (member, volunteer, newsletter)
- Donations
- Form submissions
- Goal completions

### Technical Metrics
- Errors
- Performance timings
- API response times
- Failed form submissions

## Troubleshooting

### Analytics Not Tracking

1. Check cookie consent is enabled for analytics
2. Verify analytics IDs are set in environment variables
3. Check browser console for errors
4. Enable debug mode to see tracking events
5. Verify ad blocker is not blocking scripts

### Cookie Consent Not Working

1. Check localStorage for 'cookie-consent' and 'cookie-preferences'
2. Verify CookieConsent component is rendered
3. Clear localStorage and test consent flow
4. Check for JavaScript errors in console

### Events Not Showing in GA

1. Wait 24-48 hours for data to appear
2. Check Real-Time reports in GA for immediate feedback
3. Verify GA tracking ID is correct
4. Check Network tab for gtag requests
5. Ensure user has accepted analytics cookies

## Support

For issues or questions:
- Review this documentation
- Check browser console for errors
- Enable debug mode for detailed logging
- Contact dev team with specific error messages
