# Design System Abstraction Plan

## Overview

This document outlines the strategy for abstracting the visual design system to make it fully configurable for different camps while maintaining the current Camp Alborz appearance.

## Current State Analysis

### Color Usage
The website currently uses hardcoded Tailwind classes throughout:
- `persian-purple` - Primary brand color (Burnt Sienna rgb(160, 82, 45))
- `persian-violet` - Secondary accent (Antique Gold rgb(212, 175, 55))
- `desert-gold` - Accent color (rgb(212, 175, 55))
- `saffron` - Highlight color (Royal Gold rgb(255, 215, 0))
- `midnight` - Dark text color
- Various gradient combinations

### Components Using Colors
All 9 main pages use hardcoded color classes:
- Hero sections with gradient backgrounds
- Cards and buttons with persian-purple gradients
- Text colors and borders
- Hover states and transitions

### Current Configuration
`brand.config.ts` exists but only stores RGB values, not actively used in components.

## Abstraction Strategy

### Phase 4.1: Extend Brand Configuration (Priority 1)
**Goal**: Add comprehensive theme configuration

Add to `brand.config.ts`:
```typescript
theme: {
  // Semantic color mapping
  colors: {
    primary: {
      base: string;    // Main brand color
      light: string;   // Lighter variant
      dark: string;    // Darker variant
      gradient: {
        from: string;
        to: string;
      };
    };
    secondary: { /* same structure */ };
    accent: { /* same structure */ };
    neutral: {
      50-900: string[]; // Full neutral scale
    };
    // Semantic colors
    success: string;
    warning: string;
    error: string;
    info: string;
  };

  // Gradient presets
  gradients: {
    hero: string;
    card: string;
    button: string;
    decorative: string;
  };

  // Shadow presets
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };

  // Border radius
  radius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
}
```

### Phase 4.2: CSS Custom Properties System (Priority 1)
**Goal**: Convert static Tailwind colors to dynamic CSS variables

Create `packages/web/src/app/globals.css`:
```css
:root {
  --color-primary: rgb(160, 82, 45);
  --color-primary-light: rgb(180, 102, 65);
  --color-primary-dark: rgb(140, 62, 25);

  --gradient-hero: linear-gradient(...);
  --gradient-button: linear-gradient(...);

  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  /* ... */
}
```

### Phase 4.3: Theme Provider Component (Priority 2)
**Goal**: Inject CSS variables from brand config

Create `packages/web/src/components/ThemeProvider.tsx`:
```typescript
export function ThemeProvider({ children }) {
  const brandConfig = useBrandConfig();

  useEffect(() => {
    // Inject CSS variables from config
    const root = document.documentElement;
    root.style.setProperty('--color-primary', brandConfig.theme.colors.primary.base);
    // ...
  }, [brandConfig]);

  return <>{children}</>;
}
```

### Phase 4.4: Update Tailwind Config (Priority 2)
**Goal**: Use CSS variables in Tailwind

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          light: 'var(--color-primary-light)',
          dark: 'var(--color-primary-dark)',
        },
        // ...
      },
      backgroundImage: {
        'gradient-hero': 'var(--gradient-hero)',
        'gradient-button': 'var(--gradient-button)',
      },
    },
  },
};
```

### Phase 4.5: Component Refactoring (Priority 3)
**Goal**: Replace hardcoded colors with semantic names

**Before:**
```tsx
<div className="bg-persian-purple hover:bg-persian-violet">
```

**After:**
```tsx
<div className="bg-primary hover:bg-primary-light">
```

**Migration Path:**
1. Create color mapping utility
2. Add backward compatibility aliases
3. Gradually migrate components
4. Remove old color classes

## Implementation Steps

### Step 1: Extend Type Definitions
Update `config/types.ts`:
- Add `ThemeColors` interface
- Add `GradientPresets` interface
- Add `ThemeConfig` interface
- Extend `BrandConfig` with comprehensive theme

### Step 2: Update Brand Configuration
Enhance `config/brand.config.ts`:
- Add full color palette with variants
- Add gradient presets
- Add shadow and radius presets
- Maintain backward compatibility

### Step 3: Create Theme System
Build theme infrastructure:
- CSS custom properties generator
- ThemeProvider component
- Theme utility functions
- Color conversion helpers

### Step 4: Update Tailwind Configuration
Modify `packages/web/tailwind.config.js`:
- Replace static colors with CSS variables
- Add semantic color names
- Keep old names as aliases (temporary)

### Step 5: Create Migration Utilities
Build helper tools:
- Color class mapper (persian-purple → primary)
- Gradient generator
- Testing utilities

### Step 6: Migrate Components
Update components page by page:
- Replace hardcoded colors
- Test appearance matches original
- Verify responsiveness

### Step 7: Testing & Documentation
Ensure quality:
- Visual regression tests
- Theme switching tests
- Documentation updates
- Example theme configs

## Benefits

### For Camp Alborz
- Easier brand consistency
- Centralized theme management
- Better maintainability

### For Other Camps
- Quick rebranding (change config only)
- No code knowledge required
- Professional appearance guaranteed

### For Developers
- Type-safe theming
- Clear semantic naming
- Easy to extend

## Backward Compatibility

During transition:
- Keep `persian-purple` as alias to `primary`
- Keep `desert-gold` as alias to `accent`
- Gradual migration, no breaking changes
- Old classes deprecated but functional

## Success Criteria

- [ ] All 9 pages use semantic color names
- [ ] Brand config fully controls appearance
- [ ] No hardcoded colors in components
- [ ] Camp Alborz appearance unchanged
- [ ] Example "Ocean Camp" theme works
- [ ] Documentation complete

## Timeline

- **Phase 4.1**: 1 session (Extend brand config)
- **Phase 4.2**: 1 session (CSS variables system)
- **Phase 4.3**: 1 session (Theme provider)
- **Phase 4.4**: 1 session (Tailwind config)
- **Phase 4.5**: 2-3 sessions (Component migration)
- **Total**: ~6 sessions for complete design system abstraction

## Risk Mitigation

**Risk**: Visual regressions
**Mitigation**: Side-by-side comparison, incremental rollout

**Risk**: Performance impact
**Mitigation**: CSS variables are fast, minimal overhead

**Risk**: Breaking existing pages
**Mitigation**: Maintain aliases, test thoroughly

## Next Actions

1. ✅ Create this design document
2. Extend `types.ts` with theme interfaces
3. Enhance `brand.config.ts` with full theme
4. Create CSS variable system
5. Build ThemeProvider component
6. Update Tailwind config
7. Begin component migration

---

*Created: 2025-10-05*
*Status: Planning Complete*
*Phase: 4 - Design System Abstraction*
