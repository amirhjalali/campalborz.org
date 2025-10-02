# Configuration System

This directory contains all configuration files for customizing the camp website. By editing these files, you can rebrand the entire site for different camps without touching the codebase.

## Quick Start

To customize the site for your camp:

1. **Edit `camp.config.ts`** - Update camp name, contact info, and features
2. **Edit `brand.config.ts`** - Customize colors, fonts, and assets
3. **Edit `content.config.ts`** - Change hero text, stats, and feature cards

The website will automatically use your new configuration!

## Configuration Files

### `camp.config.ts`
Camp identity and organizational information.

**Key fields:**
- `name` - Camp name (e.g., "Camp Alborz")
- `tagline` - Short description/tagline
- `description` - Longer description
- `email`, `website`, `domain` - Contact and web info
- `social` - Social media links
- `features` - Enable/disable features (events, donations, etc.)
- `cultural.heritage` - Cultural identity (e.g., "Persian", "Japanese", "None")

### `brand.config.ts`
Visual branding and design system.

**Key fields:**
- `colors.primary`, `colors.secondary`, `colors.accent` - Main brand colors (RGB format)
- `colors.text` - Text colors
- `fonts.display`, `fonts.body`, `fonts.ui` - Font family names
- `theme.style` - Theme style identifier
- `assets` - Paths to logo, favicon, og-image, etc.

### `content.config.ts`
Content and copy for the website.

**Key sections:**
- `hero` - Homepage hero section (title, subtitle, description, CTA buttons)
- `stats` - Statistics to display (value, label, icon, description, color gradient)
- `features` - Feature cards (title, description, icon, link, gradient)
- `footer` - Footer tagline and copyright

### `types.ts`
TypeScript type definitions for all configuration objects. You shouldn't need to edit this unless adding new fields.

## Icon Names

Icons are specified as strings and mapped to Lucide React icons. Available icons:

- `users` - Users/people icon
- `calendar` - Calendar icon
- `dollar-sign` - Dollar sign icon
- `globe` - Globe/world icon
- `flame` - Flame/fire icon
- `heart` - Heart icon
- `palette` - Palette/art icon
- `star` - Star icon
- `coffee` - Coffee/tea icon
- `tent` - Tent/camping icon
- `arrow-right` - Arrow pointing right

To add more icons, edit `packages/web/src/lib/icons.ts`.

## Color Format

Colors should be in RGB format: `rgb(r, g, b)`

Example:
```typescript
colors: {
  primary: "rgb(160, 82, 45)",    // Burnt Sienna
  secondary: "rgb(212, 175, 55)", // Antique Gold
}
```

## Gradient Format

Gradients use Tailwind CSS gradient classes: `from-{color} to-{color}`

Example:
```typescript
gradient: "from-burnt-sienna to-antique-gold"
```

## Example: Creating a New Camp Configuration

Let's say you want to create "Ocean Camp" with a beach/ocean theme:

**1. Update `camp.config.ts`:**
```typescript
export const campConfig: CampConfig = {
  name: "Ocean Camp",
  tagline: "Where the waves meet the desert",
  description: "Bringing ocean vibes to the playa...",
  email: "info@oceancamp.org",
  website: "https://oceancamp.org",
  domain: "oceancamp.org",
  cultural: {
    heritage: "Coastal",
    artStyle: "Ocean-Inspired Art",
    values: ["Flow", "Depth", "Community", "Exploration"],
  },
  // ... other fields
};
```

**2. Update `brand.config.ts`:**
```typescript
export const brandConfig: BrandConfig = {
  colors: {
    primary: "rgb(0, 119, 182)",    // Ocean Blue
    secondary: "rgb(0, 180, 216)",  // Turquoise
    accent: "rgb(255, 215, 0)",     // Golden Sand
    background: "rgb(240, 248, 255)", // Light Blue
    text: {
      primary: "rgb(13, 27, 42)",   // Deep Ocean
      secondary: "rgb(100, 149, 237)", // Cornflower Blue
    },
  },
  fonts: {
    display: "Montserrat",
    body: "Open Sans",
    ui: "Roboto",
  },
  // ... other fields
};
```

**3. Update `content.config.ts`:**
```typescript
export const contentConfig: ContentConfig = {
  hero: {
    title: "Welcome to Ocean Camp",
    subtitle: "Where the waves meet the desert",
    description: "Experience the serenity of the ocean in the heart of Black Rock City...",
    // ... CTAs
  },
  stats: [
    {
      label: "Years Making Waves",
      value: "8+",
      icon: "globe",
      description: "Bringing ocean energy to the playa",
    },
    // ... more stats
  ],
  // ... features
};
```

Save the files and restart your dev server - your site is now Ocean Camp!

## Tips

- **Start with Camp Alborz config**: The default configuration is complete and tested
- **Test as you go**: Make small changes and check the site
- **Keep RGB format**: Colors must be `rgb(r, g, b)` format
- **Use existing gradients**: Stick to Tailwind's color names in gradients
- **Icons are case-sensitive**: Use lowercase with hyphens (e.g., `dollar-sign`)

## Troubleshooting

**Site won't compile:**
- Check for syntax errors in config files
- Ensure all required fields are present
- Verify TypeScript types match

**Icons not showing:**
- Check icon name spelling
- Ensure icon is added to `packages/web/src/lib/icons.ts`

**Colors look wrong:**
- Verify RGB format: `rgb(r, g, b)`
- Check Tailwind config has the color defined

## Advanced

For more advanced customization beyond configuration:
- Edit Tailwind theme: `packages/web/tailwind.config.js`
- Add custom components: `packages/web/src/components/`
- Modify page layouts: `packages/web/src/app/`

See the main project documentation for details.
