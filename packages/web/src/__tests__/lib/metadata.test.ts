import {
  siteConfig,
  generateMetadata,
  generateOrganizationSchema,
  generateEventSchema,
  pageMetadata,
} from '../../lib/metadata';

describe('siteConfig', () => {
  it('should have required properties', () => {
    expect(siteConfig.name).toBe('Camp Alborz');
    expect(siteConfig.url).toBe('https://campalborz.org');
    expect(siteConfig.description).toBeDefined();
    expect(siteConfig.ogImage).toBeDefined();
    expect(siteConfig.keywords).toBeInstanceOf(Array);
    expect(siteConfig.keywords.length).toBeGreaterThan(0);
  });

  it('should have social links', () => {
    expect(siteConfig.links.instagram).toBeDefined();
    expect(siteConfig.links.youtube).toBeDefined();
    expect(siteConfig.links.soundcloud).toBeDefined();
  });
});

describe('generateMetadata', () => {
  it('should generate metadata with title and site name appended', () => {
    const meta = generateMetadata({ title: 'About' });
    expect(meta.title).toBe('About | Camp Alborz');
  });

  it('should not double-append site name if already included', () => {
    const meta = generateMetadata({ title: 'Camp Alborz | Home' });
    expect(meta.title).toBe('Camp Alborz | Home');
  });

  it('should use default description when none provided', () => {
    const meta = generateMetadata({ title: 'Test' });
    expect(meta.description).toBe(siteConfig.description);
  });

  it('should use custom description when provided', () => {
    const meta = generateMetadata({
      title: 'Test',
      description: 'Custom description',
    });
    expect(meta.description).toBe('Custom description');
  });

  it('should set canonical URL', () => {
    const meta = generateMetadata({ title: 'About', path: '/about' });
    expect(meta.alternates?.canonical).toBe('https://campalborz.org/about');
  });

  it('should merge custom keywords with default keywords', () => {
    const meta = generateMetadata({
      title: 'Test',
      keywords: ['custom-keyword'],
    });
    const keywords = meta.keywords as string[];
    expect(keywords).toContain('custom-keyword');
    expect(keywords).toContain('Camp Alborz');
  });

  it('should set noindex when specified', () => {
    const meta = generateMetadata({ title: 'Private', noIndex: true });
    expect(meta.robots).toBe('noindex,nofollow');
  });

  it('should set index,follow by default', () => {
    const meta = generateMetadata({ title: 'Public' });
    expect(meta.robots).toBe('index,follow');
  });

  it('should include Open Graph data', () => {
    const meta = generateMetadata({ title: 'Test', path: '/test' });
    expect(meta.openGraph).toBeDefined();
    expect((meta.openGraph as any)?.type).toBe('website');
    expect(meta.openGraph?.url).toBe('https://campalborz.org/test');
    expect(meta.openGraph?.siteName).toBe('Camp Alborz');
  });

  it('should include Twitter card data', () => {
    const meta = generateMetadata({ title: 'Test' });
    expect(meta.twitter).toBeDefined();
    expect((meta.twitter as any)?.card).toBe('summary_large_image');
    expect(meta.twitter?.creator).toBe('@campalborz');
  });

  it('should use custom image when provided', () => {
    const meta = generateMetadata({
      title: 'Test',
      image: 'https://example.com/image.jpg',
    });
    const ogImages = meta.openGraph?.images as any[];
    expect(ogImages?.[0]?.url).toBe('https://example.com/image.jpg');
  });
});

describe('pageMetadata', () => {
  it('should have metadata for all key pages', () => {
    expect(pageMetadata.home).toBeDefined();
    expect(pageMetadata.about).toBeDefined();
    expect(pageMetadata.art).toBeDefined();
    expect(pageMetadata.events).toBeDefined();
    expect(pageMetadata.culture).toBeDefined();
    expect(pageMetadata.donate).toBeDefined();
    expect(pageMetadata.apply).toBeDefined();
    expect(pageMetadata.members).toBeDefined();
    expect(pageMetadata.search).toBeDefined();
  });

  it('should have noIndex set for private pages', () => {
    expect(pageMetadata.members.robots).toBe('noindex,nofollow');
    expect(pageMetadata.donateSuccess.robots).toBe('noindex,nofollow');
    expect(pageMetadata.admin.robots).toBe('noindex,nofollow');
  });

  it('should have index set for public pages', () => {
    expect(pageMetadata.home.robots).toBe('index,follow');
    expect(pageMetadata.about.robots).toBe('index,follow');
    expect(pageMetadata.events.robots).toBe('index,follow');
  });
});

describe('generateOrganizationSchema', () => {
  it('should generate valid JSON-LD for nonprofit', () => {
    const schema = generateOrganizationSchema();
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('NonprofitOrganization');
    expect(schema.name).toBe('Camp Alborz');
    expect(schema.legalName).toBe('Camp Alborz Inc.');
    expect(schema.nonprofitStatus).toBe('501(c)(3)');
    expect(schema.url).toBe('https://campalborz.org');
    expect(schema.foundingDate).toBe('2008');
  });

  it('should include social links in sameAs', () => {
    const schema = generateOrganizationSchema();
    expect(schema.sameAs).toBeInstanceOf(Array);
    expect(schema.sameAs.length).toBeGreaterThan(0);
  });

  it('should include contact information', () => {
    const schema = generateOrganizationSchema();
    expect(schema.contactPoint).toBeDefined();
    expect(schema.contactPoint.email).toBe('info@campalborz.org');
  });
});

describe('generateEventSchema', () => {
  it('should generate valid event JSON-LD', () => {
    const event = {
      name: 'Persian Music Night',
      description: 'An evening of traditional Persian music',
      startDate: '2024-08-25T20:00:00Z',
      endDate: '2024-08-25T23:00:00Z',
      location: 'Black Rock City',
    };

    const schema = generateEventSchema(event);
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('Event');
    expect(schema.name).toBe('Persian Music Night');
    expect(schema.startDate).toBe('2024-08-25T20:00:00Z');
    expect(schema.location.name).toBe('Black Rock City');
    expect(schema.organizer.name).toBe('Camp Alborz');
  });

  it('should use default image when none provided', () => {
    const event = {
      name: 'Test Event',
      description: 'Test',
      startDate: '2024-01-01',
      endDate: '2024-01-02',
      location: 'Test Location',
    };

    const schema = generateEventSchema(event);
    expect(schema.image).toBe(siteConfig.ogImage);
  });

  it('should use custom image when provided', () => {
    const event = {
      name: 'Test Event',
      description: 'Test',
      startDate: '2024-01-01',
      endDate: '2024-01-02',
      location: 'Test Location',
      image: 'https://example.com/event.jpg',
    };

    const schema = generateEventSchema(event);
    expect(schema.image).toBe('https://example.com/event.jpg');
  });
});
