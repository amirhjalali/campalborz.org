# Component Library Documentation

Complete reference for all React components in the Camp Alborz platform.

## Table of Contents

1. [UI Components](#ui-components)
2. [Form Components](#form-components)
3. [Layout Components](#layout-components)
4. [Feature Components](#feature-components)
5. [Utility Components](#utility-components)
6. [Navigation Components](#navigation-components)

---

## UI Components

### Button

Reusable button component with multiple variants and sizes.

**Location:** `src/components/ui/Button.tsx`

**Props:**

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  children: React.ReactNode;
}
```

**Usage:**

```tsx
import { Button } from '@/components/ui/Button';

<Button variant="primary" size="lg">
  Donate Now
</Button>

<Button variant="outline" leftIcon={<HeartIcon />}>
  Support Us
</Button>

<Button loading={isSubmitting} disabled={!isValid}>
  Submit Application
</Button>
```

**Variants:**

- `primary` - Main call-to-action button (blue background)
- `secondary` - Secondary actions (gray background)
- `outline` - Outlined button with transparent background
- `ghost` - No border, transparent background
- `danger` - Destructive actions (red)

---

### Card

Container component with optional header, content, and footer sections.

**Location:** `src/components/ui/Card.tsx`

**Props:**

```typescript
interface CardProps {
  variant?: 'default' | 'bordered' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}
```

**Usage:**

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';

<Card variant="elevated">
  <CardHeader>
    <CardTitle>Camp Statistics</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Content goes here...</p>
  </CardContent>
  <CardFooter>
    <Button>View More</Button>
  </CardFooter>
</Card>
```

---

### Loading States

Various loading indicators and skeleton screens.

**Location:** `src/components/ui/LoadingStates.tsx`

**Components:**

#### Spinner

```tsx
import { Spinner } from '@/components/ui/LoadingStates';

<Spinner size="lg" color="primary" />
```

#### DotsLoader

```tsx
import { DotsLoader } from '@/components/ui/LoadingStates';

<DotsLoader size="md" color="primary" />
```

#### ProgressBar

```tsx
import { ProgressBar } from '@/components/ui/LoadingStates';

<ProgressBar
  progress={75}
  size="md"
  color="primary"
  showLabel
  label="Uploading..."
/>
```

#### LoadingOverlay

```tsx
import { LoadingOverlay } from '@/components/ui/LoadingStates';

<LoadingOverlay isLoading={isLoading} message="Processing...">
  <div>Your content</div>
</LoadingOverlay>
```

#### PageLoader

```tsx
import { PageLoader } from '@/components/ui/LoadingStates';

<PageLoader message="Loading page..." />
```

---

### Skeleton

Loading placeholders for content.

**Location:** `src/components/ui/skeleton.tsx`

**Components:**

```tsx
import {
  Skeleton,
  CardSkeleton,
  EventCardSkeleton,
  MemberCardSkeleton,
  ListSkeleton,
  FormSkeleton,
  DashboardSkeleton,
  PageSkeleton
} from '@/components/ui/skeleton';

// Basic skeleton
<Skeleton className="h-4 w-32" />

// Pre-built card skeleton
<CardSkeleton />

// Event card skeleton
<EventCardSkeleton />

// List skeleton (5 items)
<ListSkeleton items={5} />
```

---

## Form Components

### ContactForm

Contact form with validation and submission handling.

**Location:** `src/components/contact/ContactForm.tsx`

**Props:**

```typescript
interface ContactFormProps {
  showContactInfo?: boolean;
  onSubmit?: (data: ContactFormData) => Promise<void>;
}
```

**Usage:**

```tsx
import { ContactForm } from '@/components/contact/ContactForm';

// Simple form
<ContactForm />

// With contact info sidebar
<ContactForm showContactInfo={true} />

// Custom submit handler
<ContactForm
  onSubmit={async (data) => {
    await sendEmail(data);
  }}
/>
```

**Features:**

- Email and phone validation
- Form persistence (localStorage)
- Subject dropdown
- Success/error toast notifications
- Success confirmation screen

---

### VolunteerForm

Comprehensive volunteer application form.

**Location:** `src/components/volunteer/VolunteerForm.tsx`

**Usage:**

```tsx
import { VolunteerForm } from '@/components/volunteer/VolunteerForm';

<VolunteerForm
  onSuccess={() => {
    router.push('/volunteer/thank-you');
  }}
/>
```

**Features:**

- Personal information collection
- Availability checkboxes
- Skills and interests
- Experience textarea
- Emergency contact
- Form persistence
- Validation

---

### DonationForm

Stripe-integrated donation form with payment processing.

**Location:** `src/components/donate/DonationForm.tsx`

**Usage:**

```tsx
import { DonationForm } from '@/components/donate/DonationForm';

<DonationForm />
```

**Features:**

- Preset and custom amounts
- One-time and recurring donations
- Stripe Elements integration
- Donor information capture
- Email receipt
- Success confirmation

---

### NewsletterSignup

Newsletter subscription form with multiple variants.

**Location:** `src/components/newsletter/NewsletterSignup.tsx`

**Props:**

```typescript
interface NewsletterSignupProps {
  variant?: 'default' | 'inline' | 'minimal' | 'card';
  title?: string;
  description?: string;
  showName?: boolean;
  buttonText?: string;
  onSuccess?: () => void;
}
```

**Usage:**

```tsx
import { NewsletterSignup } from '@/components/newsletter/NewsletterSignup';

// Default variant
<NewsletterSignup />

// Inline variant (compact)
<NewsletterSignup variant="inline" />

// With name field
<NewsletterSignup showName={true} />

// Card variant
<NewsletterSignup
  variant="card"
  title="Stay Updated"
  description="Get camp news and updates"
/>
```

---

## Layout Components

### Header

Main navigation header with responsive design.

**Location:** `src/components/layout/Header.tsx`

**Features:**

- Responsive navigation
- Mobile menu
- Authentication state
- Search integration
- Sticky on scroll

**Usage:**

```tsx
import { Header } from '@/components/layout/Header';

<Header />
```

---

### Footer

Site footer with links and social media.

**Location:** `src/components/layout/Footer.tsx`

**Features:**

- Multi-column layout
- Social media links
- Newsletter signup
- Copyright info
- Sitemap links

**Usage:**

```tsx
import { Footer } from '@/components/layout/Footer';

<Footer />
```

---

### Breadcrumb

Navigation breadcrumbs with auto-generation.

**Location:** `src/components/navigation/Breadcrumb.tsx`

**Props:**

```typescript
interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  homeIcon?: boolean;
  separator?: React.ReactNode;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
}
```

**Usage:**

```tsx
import { Breadcrumb } from '@/components/navigation/Breadcrumb';

// Auto-generated from URL
<Breadcrumb />

// Manual items
<Breadcrumb
  items={[
    { label: 'Events', href: '/events' },
    { label: 'Burning Man 2024' }
  ]}
/>

// With home icon
<Breadcrumb homeIcon={true} />
```

**Additional Components:**

- `BreadcrumbBanner` - Full-width banner with breadcrumbs
- `BreadcrumbStructuredData` - SEO structured data

---

## Feature Components

### TestimonialsCarousel

Rotating testimonials carousel with auto-advance.

**Location:** `src/components/testimonials/TestimonialsCarousel.tsx`

**Props:**

```typescript
interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
  autoAdvanceInterval?: number; // milliseconds
  showArrows?: boolean;
  showDots?: boolean;
  slidesPerView?: 1 | 2 | 3;
}

interface Testimonial {
  id: string;
  name: string;
  role?: string;
  avatar?: string;
  content: string;
  rating?: number;
  date?: string;
}
```

**Usage:**

```tsx
import {
  TestimonialsCarousel,
  TestimonialsGrid,
  FeaturedTestimonial,
  sampleTestimonials
} from '@/components/testimonials/TestimonialsCarousel';

// Carousel
<TestimonialsCarousel
  testimonials={sampleTestimonials}
  autoAdvanceInterval={5000}
  slidesPerView={1}
/>

// Grid layout
<TestimonialsGrid testimonials={sampleTestimonials} />

// Featured (single, large)
<FeaturedTestimonial testimonial={sampleTestimonials[0]} />
```

---

### FAQAccordion

Collapsible FAQ list with search and categories.

**Location:** `src/components/faq/FAQAccordion.tsx`

**Props:**

```typescript
interface FAQAccordionProps {
  items: FAQItem[];
  allowMultiple?: boolean;
  showSearch?: boolean;
  showCategories?: boolean;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}
```

**Usage:**

```tsx
import {
  FAQAccordion,
  SimpleFAQ,
  TwoColumnFAQ,
  campAlborzFAQs
} from '@/components/faq/FAQAccordion';

// Accordion
<FAQAccordion
  items={campAlborzFAQs}
  showSearch={true}
  showCategories={true}
  allowMultiple={false}
/>

// Simple list (no accordion)
<SimpleFAQ items={campAlborzFAQs} />

// Two-column layout
<TwoColumnFAQ items={campAlborzFAQs} />
```

---

### EventCalendar

Monthly calendar with event indicators.

**Location:** `src/components/events/EventCalendar.tsx`

**Props:**

```typescript
interface EventCalendarProps {
  events?: CalendarEvent[];
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime?: string;
  endTime?: string;
  location?: string;
  description?: string;
  category?: string;
  color?: string;
}
```

**Usage:**

```tsx
import {
  EventCalendar,
  UpcomingEventsList
} from '@/components/events/EventCalendar';

// Calendar view
<EventCalendar
  events={events}
  onEventClick={(event) => router.push(`/events/${event.id}`)}
/>

// Upcoming events list
<UpcomingEventsList
  events={events}
  limit={5}
/>
```

---

### ImageGallery

Image gallery with lightbox modal.

**Location:** `src/components/gallery/ImageGallery.tsx`

**Props:**

```typescript
interface ImageGalleryProps {
  images: GalleryImage[];
  columns?: 2 | 3 | 4 | 5;
  gap?: number;
  aspectRatio?: 'square' | 'video' | 'auto';
}

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  title?: string;
  description?: string;
  category?: string;
}
```

**Usage:**

```tsx
import {
  ImageGallery,
  MasonryGallery,
  CategorizedGallery
} from '@/components/gallery/ImageGallery';

// Grid gallery
<ImageGallery
  images={images}
  columns={3}
  aspectRatio="square"
/>

// Masonry layout
<MasonryGallery images={images} />

// With categories
<CategorizedGallery
  images={images}
  categories={['Art', 'Workshops', 'Events']}
/>
```

**Features:**

- Lightbox modal
- Keyboard navigation (arrows, ESC)
- Image titles and descriptions
- Category filtering
- Responsive grid

---

### Search

Comprehensive search with filtering and suggestions.

**Location:** `src/components/search/Search.tsx`

**Props:**

```typescript
interface SearchProps {
  placeholder?: string;
  showSuggestions?: boolean;
  showRecent?: boolean;
  debounceMs?: number;
  filterByType?: SearchResultType[];
  onSearch?: (query: string, filters: SearchResultType[]) => Promise<SearchResult[]>;
  onResultClick?: (result: SearchResult) => void;
  isModal?: boolean;
  onClose?: () => void;
}
```

**Usage:**

```tsx
import {
  Search,
  SearchButton,
  useSearchModal
} from '@/components/search/Search';

// Inline search
<Search
  placeholder="Search events, articles..."
  showSuggestions={true}
  showRecent={true}
/>

// Modal search with keyboard shortcut (Cmd+K)
function MyComponent() {
  const { isOpen, open, close } = useSearchModal();

  return (
    <>
      <SearchButton onClick={open} />
      {isOpen && <Search isModal={true} onClose={close} />}
    </>
  );
}
```

**Features:**

- Debounced search
- Recent searches (localStorage)
- Filter by type (events, articles, people, pages)
- Keyboard navigation
- Cmd+K shortcut support
- Custom search function

---

### ShareButtons

Social media sharing buttons.

**Location:** `src/components/social/ShareButtons.tsx`

**Props:**

```typescript
interface ShareButtonsProps {
  title: string;
  url?: string;
  description?: string;
  hashtags?: string[];
  variant?: 'default' | 'compact' | 'icon-only';
  showCopyLink?: boolean;
}
```

**Usage:**

```tsx
import { ShareButtons } from '@/components/social/ShareButtons';

<ShareButtons
  title="Check out Camp Alborz!"
  url="https://campalborz.org"
  description="Join our vibrant community"
  hashtags={['BurningMan', 'CampAlborz']}
  variant="default"
/>
```

**Platforms:**

- Twitter
- Facebook
- LinkedIn
- Email
- WhatsApp
- Copy Link
- Native Share (mobile)

---

### CookieConsent

GDPR/CCPA compliant cookie consent banner.

**Location:** `src/components/CookieConsent.tsx`

**Usage:**

```tsx
import { CookieConsent, useCookieConsent } from '@/components/CookieConsent';

// Add to root layout
<CookieConsent />

// Check consent in components
function MyComponent() {
  const consent = useCookieConsent();

  if (consent?.analytics) {
    // Load analytics
  }
}
```

**Features:**

- Customizable cookie categories
- Settings modal
- localStorage persistence
- Accept all / Necessary only / Custom
- Integrates with analytics

**Cookie Categories:**

- **Necessary**: Always enabled (cannot be disabled)
- **Analytics**: Google Analytics, tracking (optional)
- **Marketing**: Ads, remarketing (optional)
- **Preferences**: User preferences (optional)

---

## Utility Components

### ErrorBoundary

Catches React errors and displays fallback UI.

**Location:** `src/components/ErrorBoundary.tsx`

**Usage:**

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

**Features:**

- Error details in development
- User-friendly message in production
- "Try Again" and "Go Home" buttons
- Error logging

---

### AnalyticsProvider

Initializes analytics and tracks page views.

**Location:** `src/components/analytics/AnalyticsProvider.tsx`

**Usage:**

```tsx
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider';

// In root layout
<AnalyticsProvider
  googleAnalyticsId={process.env.NEXT_PUBLIC_GA_ID}
  plausibleDomain="campalborz.org"
  debug={process.env.NODE_ENV === 'development'}
>
  {children}
</AnalyticsProvider>
```

**Additional Components:**

- `GoogleTagManagerScript` - GTM script injection
- `GoogleTagManagerNoscript` - GTM noscript fallback
- `PlausibleScript` - Plausible analytics script

---

## Navigation Components

### Tabs

Tabbed navigation component.

**Example Usage:**

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="details">Details</TabsTrigger>
    <TabsTrigger value="photos">Photos</TabsTrigger>
  </TabsList>

  <TabsContent value="overview">
    Overview content
  </TabsContent>
  <TabsContent value="details">
    Details content
  </TabsContent>
  <TabsContent value="photos">
    Photos content
  </TabsContent>
</Tabs>
```

---

## Hooks

### useAnalytics

Hook for tracking analytics events.

**Location:** `src/hooks/useAnalytics.ts`

**Usage:**

```tsx
import { useAnalytics } from '@/hooks/useAnalytics';

function MyComponent() {
  const analytics = useAnalytics();

  const handleDonation = () => {
    analytics.trackDonation(5000, 'USD', 'stripe');
  };

  const handleSignup = () => {
    analytics.trackSignup('member');
  };

  return <Button onClick={handleDonation}>Donate</Button>;
}
```

**Methods:**

- `trackDonation(amount, currency, method)`
- `trackSignup(type)` - member, volunteer, newsletter
- `trackFormSubmission(formName, success)`
- `trackLinkClick(url, text, external)`
- `trackDownload(fileName, fileType)`
- `trackVideoPlay(videoTitle, duration)`
- `trackSearch(query, resultsCount)`
- `trackSocialShare(platform, url)`
- `trackError(error, fatal)`

**Additional Hooks:**

- `usePageView()` - Auto-track page views
- `useTimeOnPage()` - Track time spent on page
- `useScrollTracking()` - Track scroll depth

---

### useFormPersistence

Hook for persisting form data in localStorage.

**Location:** `src/hooks/useFormPersistence.ts`

**Usage:**

```tsx
import { useFormPersistence } from '@/hooks/useFormPersistence';

interface FormData {
  name: string;
  email: string;
  message: string;
}

function ContactForm() {
  const { data, updateField, clearData } = useFormPersistence<FormData>(
    'contact-form',
    {
      name: '',
      email: '',
      message: '',
    }
  );

  return (
    <form>
      <input
        value={data.name}
        onChange={(e) => updateField('name', e.target.value)}
      />
      {/* ... */}
    </form>
  );
}
```

---

## Styling

### Tailwind CSS

All components use Tailwind CSS for styling.

**Common Classes:**

```
Text:     text-gray-900, text-sm, font-semibold, leading-relaxed
Spacing:  p-4, py-6, px-8, gap-4, space-y-6
Layout:   flex, grid, items-center, justify-between
Colors:   bg-primary-600, text-primary-700, border-gray-200
Sizing:   w-full, h-screen, max-w-7xl
Effects:  shadow-lg, rounded-lg, hover:bg-gray-50, transition-colors
```

### Color Palette

- **Primary**: Blue (Camp Alborz brand color)
  - `primary-50` to `primary-900`
- **Gray**: Neutral colors
  - `gray-50` to `gray-900`
- **Success**: Green
  - `green-500`, `green-600`
- **Warning**: Yellow
  - `yellow-500`, `yellow-600`
- **Danger**: Red
  - `red-500`, `red-600`

---

## Best Practices

### Component Organization

```
src/components/
├── ui/              # Reusable UI primitives
├── layout/          # Layout components
├── forms/           # Form components
├── features/        # Feature-specific components
└── [domain]/        # Domain-specific (donate, events, etc.)
```

### Naming Conventions

- **Components**: PascalCase (e.g., `Button`, `ContactForm`)
- **Files**: PascalCase.tsx (e.g., `Button.tsx`)
- **Props Interfaces**: `ComponentNameProps`
- **Hooks**: camelCase starting with `use` (e.g., `useAnalytics`)

### TypeScript

All components are fully typed with TypeScript:

```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', children }: ButtonProps) {
  // ...
}
```

### Accessibility

- Use semantic HTML elements
- Include ARIA labels
- Support keyboard navigation
- Maintain focus management
- Provide alt text for images

Example:

```tsx
<button
  aria-label="Close modal"
  onClick={onClose}
  className="..."
>
  <XMarkIcon className="h-6 w-6" />
</button>
```

---

## Contributing

### Adding New Components

1. Create component file in appropriate directory
2. Export from index file
3. Add TypeScript types
4. Include JSDoc comments
5. Add to Storybook (if applicable)
6. Update this documentation

### Component Template

```tsx
'use client';

import { cn } from '@/lib/utils';

interface MyComponentProps {
  /**
   * Brief description
   */
  variant?: 'default' | 'alternate';
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Component children
   */
  children: React.ReactNode;
}

/**
 * MyComponent
 *
 * Detailed description of what this component does.
 *
 * @example
 * ```tsx
 * <MyComponent variant="default">
 *   Content
 * </MyComponent>
 * ```
 */
export function MyComponent({
  variant = 'default',
  className,
  children,
}: MyComponentProps) {
  return (
    <div className={cn('base-classes', className)}>
      {children}
    </div>
  );
}
```

---

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Heroicons](https://heroicons.com)

---

## Support

For component-related questions:
- Check this documentation first
- Review component source code
- Check Storybook examples (if available)
- Ask in Discord #frontend channel
- Create GitHub issue

---

This documentation is maintained by the Camp Alborz development team. Last updated: January 2025.
