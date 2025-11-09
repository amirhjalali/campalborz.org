# Content Migration Plan: campalborz.org

## Overview

This document outlines a comprehensive plan to migrate content from the old campalborz.org website (stored in `/OLD` directory) to the new Next.js-based platform. The migration will preserve all content, images, and structure while adapting it to the modern architecture.

## Current State Analysis

### Old Website Structure (`/OLD` directory)
- **Pages**: ALBORZ.html, APPLY.html, ART.html, DAMAVAND.html, DONATE.html, EVENTS.html, HOMA.html, MEMBERS.html, THANKS.html
- **Images**: Organized in subdirectories (ALBORZ/, APPLY/, ART/, DAMAVAND/, DONATE/, EVENTS/, HOMA/, MEMBERS/, THANKS/)
- **Content Format**: Google Sites-generated HTML (minified, complex structure)
- **Media**: Images (JPG format), embedded videos (Vimeo)

### New Website Structure
- **Framework**: Next.js 14 with App Router
- **Content System**: 
  - Configuration-based (`config/content.config.ts`)
  - CMS system (Prisma-based with Content/ContentType models)
- **Pages**: `/about`, `/art`, `/events`, `/culture`, `/donate`, `/apply`, `/members`
- **Storage**: PostgreSQL database + file system for media

## Migration Strategy

### Phase 1: Content Extraction & Inventory

#### 1.1 Extract Text Content from HTML Files
**Tools Needed**: HTML parser (cheerio, jsdom, or manual extraction)

**Tasks**:
- [ ] Extract all text content from each HTML file
- [ ] Identify headings, paragraphs, lists, and structured content
- [ ] Document content hierarchy and relationships
- [ ] Extract metadata (titles, descriptions, keywords)
- [ ] Identify embedded media (images, videos)

**Output**: Structured JSON files with extracted content per page

**Script Location**: `scripts/extract-content.js`

#### 1.2 Inventory All Media Assets
**Tasks**:
- [ ] List all images in `/OLD` directory and subdirectories
- [ ] Document image dimensions, file sizes, and usage context
- [ ] Identify duplicate images
- [ ] Extract image metadata (alt text, captions if available)
- [ ] Document video embeds (Vimeo URLs, titles)

**Output**: Media inventory spreadsheet/JSON

**Script Location**: `scripts/inventory-media.js`

#### 1.3 Map Old Pages to New Structure
**Page Mapping**:
- `ALBORZ.html` → `/about` (homepage content)
- `ART.html` → `/art` (main art page)
- `HOMA.html` → `/art/homa` (HOMA project detail)
- `DAMAVAND.html` → `/art/damavand` (DAMAVAND project detail)
- `EVENTS.html` → `/events` (events page)
- `DONATE.html` → `/donate` (donation page)
- `APPLY.html` → `/apply` (application page)
- `MEMBERS.html` → `/members` (member portal)
- `THANKS.html` → `/donate/success` or `/donate/thanks` (thank you page)

**Output**: Migration mapping document

### Phase 2: Content Processing & Transformation

#### 2.1 Clean and Structure Content
**Tasks**:
- [ ] Remove HTML artifacts and Google Sites-specific markup
- [ ] Convert HTML to Markdown or structured JSON
- [ ] Normalize text formatting
- [ ] Extract and preserve semantic structure (headings, lists, etc.)
- [ ] Identify and preserve important formatting (bold, italic, links)

**Tools**: 
- HTML parser (cheerio)
- Markdown converter (turndown or similar)
- Text cleaning utilities

**Script Location**: `scripts/process-content.js`

#### 2.2 Process Images
**Tasks**:
- [ ] Copy images to new location (`packages/web/public/images/migrated/`)
- [ ] Optimize images (compress, resize if needed)
- [ ] Generate thumbnails for gallery views
- [ ] Add proper alt text based on context
- [ ] Update image references in content

**Tools**: Sharp (image processing library)

**Script Location**: `scripts/process-images.js`

#### 2.3 Extract and Preserve Videos
**Tasks**:
- [ ] Extract Vimeo/YouTube embed URLs
- [ ] Document video metadata (title, description, duration if available)
- [ ] Create video content entries in CMS
- [ ] Update content references to use new video format

**Script Location**: `scripts/process-videos.js`

### Phase 3: Content Import

#### 3.1 Update Configuration Files
**File**: `config/content.config.ts`

**Tasks**:
- [ ] Update hero section with content from ALBORZ.html
- [ ] Update about page content with mission, values, timeline
- [ ] Update art page with installations and projects
- [ ] Update events page with event information
- [ ] Update donate page with donation tiers and information
- [ ] Update apply page with application details

**Approach**: Manual review and update based on extracted content

#### 3.2 Import into CMS System
**For dynamic content that should be editable:**

**Tasks**:
- [ ] Create ContentTypes for:
  - Blog posts / News articles
  - Art installations (detailed pages)
  - Events (individual event pages)
  - Member spotlights
  - Gallery images
- [ ] Import content using CMS API
- [ ] Associate media files with content entries
- [ ] Set up categories and tags
- [ ] Configure SEO metadata

**Script Location**: `scripts/import-to-cms.js`

**API Endpoints**: Use existing CMS tRPC routers (`packages/api/src/router/cms.ts`)

#### 3.3 Create Static Pages (if needed)
**For content that doesn't need CMS:**

**Tasks**:
- [ ] Create new page components if needed (`/art/homa/page.tsx`, `/art/damavand/page.tsx`)
- [ ] Add content to page components
- [ ] Ensure proper layout and styling
- [ ] Add metadata for SEO

### Phase 4: Media Migration

#### 4.1 Organize Media Structure
**New Structure**:
```
packages/web/public/images/
├── migrated/
│   ├── alborz/          (from OLD/ALBORZ/)
│   ├── art/              (from OLD/ART/)
│   ├── events/           (from OLD/EVENTS/)
│   ├── homa/             (from OLD/HOMA/)
│   ├── damavand/         (from OLD/DAMAVAND/)
│   ├── donate/           (from OLD/DONATE/)
│   ├── members/          (from OLD/MEMBERS/)
│   └── apply/            (from OLD/APPLY/)
└── [existing images]
```

#### 4.2 Upload to Media Library (CMS)
**Tasks**:
- [ ] Upload images through CMS Media API
- [ ] Add metadata (alt text, captions, tags)
- [ ] Organize into folders/categories
- [ ] Generate thumbnails and responsive sizes

**Script Location**: `scripts/upload-media.js`

### Phase 5: URL Mapping & Redirects

#### 5.1 Create Redirect Map
**Old URLs → New URLs**:
- `ALBORZ.html` → `/about`
- `ART.html` → `/art`
- `HOMA.html` → `/art/homa`
- `DAMAVAND.html` → `/art/damavand`
- `EVENTS.html` → `/events`
- `DONATE.html` → `/donate`
- `APPLY.html` → `/apply`
- `MEMBERS.html` → `/members`
- `THANKS.html` → `/donate/success`

#### 5.2 Implement Redirects
**File**: `packages/web/next.config.js` or middleware

**Tasks**:
- [ ] Add redirect rules in Next.js config
- [ ] Test all redirects
- [ ] Ensure SEO-friendly redirects (301 permanent)

**Example**:
```javascript
async redirects() {
  return [
    {
      source: '/ALBORZ.html',
      destination: '/about',
      permanent: true,
    },
    // ... more redirects
  ];
}
```

### Phase 6: SEO & Metadata

#### 6.1 Extract SEO Data
**Tasks**:
- [ ] Extract meta titles and descriptions from old pages
- [ ] Extract Open Graph images
- [ ] Document existing keywords and tags
- [ ] Note any structured data (JSON-LD)

#### 6.2 Update SEO Metadata
**Files**: 
- `packages/web/src/lib/metadata.ts`
- Individual page components

**Tasks**:
- [ ] Update page metadata with extracted SEO data
- [ ] Add Open Graph tags
- [ ] Add Twitter Card metadata
- [ ] Ensure proper canonical URLs
- [ ] Update sitemap.xml

### Phase 7: Quality Assurance

#### 7.1 Content Review
**Tasks**:
- [ ] Review all migrated content for accuracy
- [ ] Check for broken links
- [ ] Verify image display
- [ ] Test video embeds
- [ ] Check formatting and typography
- [ ] Verify responsive design

#### 7.2 Link Testing
**Tasks**:
- [ ] Test all internal links
- [ ] Verify external links still work
- [ ] Check redirect functionality
- [ ] Test navigation structure

#### 7.3 Cross-Browser Testing
**Tasks**:
- [ ] Test on Chrome, Firefox, Safari, Edge
- [ ] Test on mobile devices
- [ ] Verify image loading
- [ ] Check video playback

### Phase 8: Documentation & Cleanup

#### 8.1 Document Migration
**Tasks**:
- [ ] Document what was migrated
- [ ] Note any content that couldn't be migrated
- [ ] Document manual steps taken
- [ ] Create content editing guide

#### 8.2 Archive Old Files
**Tasks**:
- [ ] Move `/OLD` directory to `/archive` or keep as reference
- [ ] Document location of archived files
- [ ] Note any files kept for reference

## Implementation Scripts

### Script 1: Content Extractor
**File**: `scripts/extract-content.js`

**Purpose**: Extract text content from HTML files

**Features**:
- Parse HTML files
- Extract text content
- Preserve structure (headings, paragraphs, lists)
- Extract metadata
- Output structured JSON

### Script 2: Media Processor
**File**: `scripts/process-images.js`

**Purpose**: Process and migrate images

**Features**:
- Copy images to new location
- Optimize images (compress, resize)
- Generate thumbnails
- Extract and preserve alt text
- Create media inventory

### Script 3: CMS Importer
**File**: `scripts/import-to-cms.js`

**Purpose**: Import content into CMS system

**Features**:
- Create ContentTypes
- Import content entries
- Associate media files
- Set up categories and tags
- Configure SEO metadata

### Script 4: Redirect Generator
**File**: `scripts/generate-redirects.js`

**Purpose**: Generate redirect configuration

**Features**:
- Read URL mapping
- Generate Next.js redirect config
- Validate redirect rules

## Timeline Estimate

- **Phase 1**: 2-3 days (Content extraction & inventory)
- **Phase 2**: 2-3 days (Content processing)
- **Phase 3**: 3-4 days (Content import)
- **Phase 4**: 1-2 days (Media migration)
- **Phase 5**: 1 day (Redirects)
- **Phase 6**: 1-2 days (SEO)
- **Phase 7**: 2-3 days (QA)
- **Phase 8**: 1 day (Documentation)

**Total**: ~13-19 days

## Risk Mitigation

### Risks
1. **Content Loss**: Old HTML is complex and may lose formatting
   - **Mitigation**: Manual review of all extracted content, keep original files as backup

2. **Image Quality**: Images may need optimization
   - **Mitigation**: Test optimization on sample images first, keep originals

3. **Broken Links**: Internal and external links may break
   - **Mitigation**: Automated link checking, manual verification

4. **SEO Impact**: URL changes may affect search rankings
   - **Mitigation**: Proper 301 redirects, update sitemap, submit to search engines

5. **Content Structure Mismatch**: Old content may not fit new structure
   - **Mitigation**: Flexible CMS system, ability to create custom content types

## Success Criteria

- [ ] All text content migrated accurately
- [ ] All images migrated and optimized
- [ ] All videos embedded correctly
- [ ] All redirects working
- [ ] SEO metadata preserved/improved
- [ ] No broken links
- [ ] Content is editable in CMS (where applicable)
- [ ] Site performance maintained or improved
- [ ] Mobile responsiveness verified

## Next Steps

1. **Review this plan** with stakeholders
2. **Set up development environment** for migration scripts
3. **Start with Phase 1** - extract content from one page as proof of concept
4. **Iterate** based on findings from first page
5. **Scale** to remaining pages

## Resources

- **CMS Documentation**: `packages/api/src/router/cms.ts`
- **Content Config**: `config/content.config.ts`
- **Media API**: `packages/api/src/services/cms.ts`
- **Next.js Redirects**: https://nextjs.org/docs/app/api-reference/next-config-js/redirects

## Notes

- The old HTML files are Google Sites-generated and contain a lot of inline styles and JavaScript
- Focus on extracting semantic content rather than preserving exact styling
- Some content may need manual review and editing after migration
- Consider creating a staging environment for testing before production deployment

