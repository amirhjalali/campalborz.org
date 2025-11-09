# Content Migration Checklist

Quick reference checklist for migrating content from old campalborz.org to new platform.

## Pre-Migration Setup

- [ ] Review migration plan (`CONTENT_MIGRATION_PLAN.md`)
- [ ] Set up development environment
- [ ] Backup current database
- [ ] Create staging environment
- [ ] Review old website structure

## Phase 1: Content Extraction

### ALBORZ.html → /about
- [ ] Extract mission statement
- [ ] Extract values and principles
- [ ] Extract timeline/history
- [ ] Extract team information
- [ ] Extract images (ALBORZ/ directory)
- [ ] Extract video embed (Vimeo)
- [ ] Extract social media links

### ART.html → /art
- [ ] Extract art installations list
- [ ] Extract project descriptions
- [ ] Extract images (ART/ directory)
- [ ] Note links to HOMA and DAMAVAND

### HOMA.html → /art/homa
- [ ] Extract HOMA project details
- [ ] Extract description and story
- [ ] Extract images (HOMA/ directory)
- [ ] Extract any video embeds

### DAMAVAND.html → /art/damavand
- [ ] Extract DAMAVAND project details
- [ ] Extract description and story
- [ ] Extract images (DAMAVAND/ directory)
- [ ] Extract any video embeds

### EVENTS.html → /events
- [ ] Extract event listings
- [ ] Extract event descriptions
- [ ] Extract dates and locations
- [ ] Extract images (EVENTS/ directory)

### DONATE.html → /donate
- [ ] Extract donation information
- [ ] Extract donation tiers/amounts
- [ ] Extract 501(c)(3) information
- [ ] Extract images (DONATE/ directory)

### APPLY.html → /apply
- [ ] Extract application form fields
- [ ] Extract application instructions
- [ ] Extract requirements
- [ ] Extract images (APPLY/ directory)

### MEMBERS.html → /members
- [ ] Extract member portal content
- [ ] Extract login information
- [ ] Extract member benefits
- [ ] Extract images (MEMBERS/ directory)

### THANKS.html → /donate/success
- [ ] Extract thank you message
- [ ] Extract images (THANKS/ directory)

## Phase 2: Content Processing

- [ ] Clean HTML artifacts from extracted text
- [ ] Convert to Markdown or structured format
- [ ] Normalize formatting
- [ ] Extract and preserve links
- [ ] Document content structure

## Phase 3: Media Processing

- [ ] Copy all images to `packages/web/public/images/migrated/`
- [ ] Organize by category (alborz/, art/, events/, etc.)
- [ ] Optimize images (compress, resize)
- [ ] Generate thumbnails
- [ ] Add alt text to images
- [ ] Process video embeds

## Phase 4: Content Import

### Configuration Updates
- [ ] Update `config/content.config.ts` hero section
- [ ] Update about page content
- [ ] Update art page content
- [ ] Update events page content
- [ ] Update donate page content
- [ ] Update apply page content

### CMS Import (if needed)
- [ ] Create ContentTypes for dynamic content
- [ ] Import blog posts/articles
- [ ] Import art installation details
- [ ] Import event details
- [ ] Upload media to CMS
- [ ] Set up categories and tags

### Page Creation
- [ ] Create `/art/homa` page (if doesn't exist)
- [ ] Create `/art/damavand` page (if doesn't exist)
- [ ] Update existing pages with migrated content

## Phase 5: Redirects

- [ ] Add redirect: ALBORZ.html → /about
- [ ] Add redirect: ART.html → /art
- [ ] Add redirect: HOMA.html → /art/homa
- [ ] Add redirect: DAMAVAND.html → /art/damavand
- [ ] Add redirect: EVENTS.html → /events
- [ ] Add redirect: DONATE.html → /donate
- [ ] Add redirect: APPLY.html → /apply
- [ ] Add redirect: MEMBERS.html → /members
- [ ] Add redirect: THANKS.html → /donate/success
- [ ] Test all redirects

## Phase 6: SEO

- [ ] Extract meta titles from old pages
- [ ] Extract meta descriptions
- [ ] Update page metadata
- [ ] Add Open Graph tags
- [ ] Add Twitter Card metadata
- [ ] Update sitemap.xml
- [ ] Verify canonical URLs

## Phase 7: Quality Assurance

### Content Review
- [ ] Review all migrated text content
- [ ] Check spelling and grammar
- [ ] Verify formatting
- [ ] Check image display
- [ ] Test video embeds
- [ ] Verify responsive design

### Link Testing
- [ ] Test all internal links
- [ ] Test all external links
- [ ] Verify navigation
- [ ] Test redirects
- [ ] Check footer links

### Browser Testing
- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Test on Edge
- [ ] Test on mobile (iOS)
- [ ] Test on mobile (Android)

### Performance
- [ ] Check page load times
- [ ] Verify image optimization
- [ ] Test on slow connections
- [ ] Check Core Web Vitals

## Phase 8: Final Steps

- [ ] Document migration completion
- [ ] Note any manual fixes needed
- [ ] Archive old files
- [ ] Update documentation
- [ ] Deploy to production
- [ ] Monitor for issues

## Post-Migration

- [ ] Monitor analytics
- [ ] Check for 404 errors
- [ ] Review user feedback
- [ ] Update content as needed
- [ ] Train content editors on CMS

