# Theme Examples

This directory contains example theme configurations demonstrating the power of the semantic color system. Each theme completely transforms the visual appearance of the website by simply changing color values.

## Available Themes

### 🌊 Ocean Camp (`ocean-camp.theme.ts`)
**A marine-inspired theme**
- **Primary**: Deep Ocean Blue (#0D47A1)
- **Secondary**: Teal/Aqua (#009688)
- **Accent**: Coral (#FF8A65)
- **Vibe**: Fresh, aquatic, coastal

Perfect for beach camps, ocean conservation themes, or coastal gatherings.

### 🌲 Forest Camp (`forest-camp.theme.ts`)
**A nature-inspired theme**
- **Primary**: Deep Forest Green (#1B5E20)
- **Secondary**: Warm Brown/Wood (#795548)
- **Accent**: Fresh Lime (#CDDC39)
- **Vibe**: Natural, earthy, organic

Perfect for eco camps, forest retreats, or sustainability-focused gatherings.

## How to Use a Theme

### Method 1: Copy Colors to Brand Config

1. Open the theme file (e.g., `ocean-camp.theme.ts`)
2. Copy the `theme.colors` section
3. Paste into `config/brand.config.ts`
4. Restart your development server

```typescript
// config/brand.config.ts
export const brandConfig: BrandConfig = {
  // ... other config

  theme: {
    colors: {
      // Paste theme colors here
      primary: {
        DEFAULT: 'rgb(13, 71, 161)',
        // ... rest of Ocean Camp colors
      }
    }
  }
};
```

### Method 2: Import Entire Theme

Replace your entire `brand.config.ts` with a theme:

```typescript
// config/brand.config.ts
import { oceanCampTheme } from '../examples/themes/ocean-camp.theme';

export const brandConfig = oceanCampTheme;
```

### Method 3: Mix and Match

Use colors from one theme with assets from another:

```typescript
// config/brand.config.ts
import { oceanCampTheme } from '../examples/themes/ocean-camp.theme';
import { forestCampTheme } from '../examples/themes/forest-camp.theme';

export const brandConfig: BrandConfig = {
  colors: oceanCampTheme.colors,           // Ocean colors
  fonts: forestCampTheme.fonts,            // Forest fonts
  theme: {
    colors: oceanCampTheme.theme.colors,   // Ocean theme
    gradients: forestCampTheme.theme.gradients, // Forest gradients
  },
  assets: {
    // Your custom assets
  }
};
```

## What Changes with Themes?

When you apply a theme, these visual elements automatically update:

### Navigation
- Logo color
- Link hover states
- Button backgrounds and borders
- Dropdown menu highlights

### Hero Section
- Background gradients
- Decorative line accents
- Button colors

### Content Sections
- Card backgrounds and borders
- Icon backgrounds
- Heading colors
- Gradient overlays
- Link colors

### Interactive Elements
- Button gradients
- Hover states
- Focus rings
- Active states

## Creating Your Own Theme

### 1. Start with a Copy

```bash
cp examples/themes/ocean-camp.theme.ts examples/themes/my-camp.theme.ts
```

### 2. Choose Your Colors

Pick three main colors:
- **Primary**: Main brand color (used for headings, icons, primary buttons)
- **Secondary**: Supporting color (used for accents, gradients)
- **Accent**: Highlight color (used for calls-to-action, highlights)

### 3. Generate Color Scales

Use a tool like:
- [Tailwind CSS Color Generator](https://uicolors.app/create)
- [Color Scale Generator](https://www.tailwindshades.com/)
- [Coolors](https://coolors.co/)

### 4. Update the Theme File

Replace the RGB values in your theme file:

```typescript
colors: {
  primary: {
    DEFAULT: 'rgb(YOUR_PRIMARY_R, YOUR_PRIMARY_G, YOUR_PRIMARY_B)',
    light: 'rgb(...)', // Lighter version
    dark: 'rgb(...)',  // Darker version
    50: 'rgb(...)',    // Very light
    // ... continue through 900
  }
}
```

### 5. Test Your Theme

1. Apply the theme to `config/brand.config.ts`
2. Run `npm run dev` in `packages/web`
3. Visit http://localhost:3006
4. Check all pages for color harmony

## Theme Guidelines

### Color Balance
- **Primary**: 40-50% of color usage
- **Secondary**: 30-40% of color usage
- **Accent**: 10-20% of color usage (highlights only)

### Contrast Ratios
Ensure WCAG AA compliance:
- Text on background: Minimum 4.5:1
- Large text on background: Minimum 3:1
- Interactive elements: Minimum 3:1

Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Color Harmony
Choose colors that work well together:
- **Analogous**: Colors next to each other on color wheel
- **Complementary**: Colors opposite on color wheel
- **Triadic**: Three colors evenly spaced on wheel

## Advanced Customization

### Gradients

Update gradient stops to match your theme:

```typescript
gradients: {
  hero: 'linear-gradient(135deg, YOUR_COLOR_1 0%, YOUR_COLOR_2 50%, YOUR_COLOR_3 100%)',
  card: 'linear-gradient(135deg, YOUR_PRIMARY 0%, YOUR_SECONDARY 100%)',
}
```

### Shadows

Tint shadows with your primary color for cohesion:

```typescript
shadows: {
  DEFAULT: '0 1px 3px 0 rgba(YOUR_PRIMARY_R, YOUR_PRIMARY_G, YOUR_PRIMARY_B, 0.1)',
}
```

### Spacing & Radius

Adjust for different visual styles:
- **Modern/Tech**: Smaller radius (sm, md), tighter spacing
- **Playful/Artsy**: Larger radius (lg, xl), looser spacing
- **Classic/Formal**: Medium radius (md), balanced spacing

## Examples in Action

### Desert Camp (Current)
- Warm earth tones
- Persian-inspired colors
- Mystical gradient overlays

### Ocean Camp
- Cool blues and teals
- Coral accent pops
- Wave-inspired gradients

### Forest Camp
- Deep greens and browns
- Natural, organic feel
- Leaf and wood tones

## Need Help?

- Review `DESIGN_SYSTEM_ABSTRACTION.md` for architecture details
- Check `COLOR_MIGRATION_PLAN.md` for semantic color usage
- See `config/brand.config.ts` for the active theme

## Contributing Themes

Have a great theme? Share it!

1. Create your theme in `examples/themes/`
2. Add documentation above
3. Submit a pull request
4. Help other camps get started faster!

---

*Remember: The entire website can be rebranded by changing these configuration files alone - no code changes required!* 🎨✨
