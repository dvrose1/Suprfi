---
name: suprfi-design-system
description: Apply SuprFi brand colors, typography, and component patterns. Use when building any UI component, page, or visual element. Provides exact Tailwind classes and hex values.
---

# Skill: SuprFi Design System

## Purpose

Ensure all UI work follows SuprFi's visual identity with exact, deterministic values. No interpretation needed - copy these patterns exactly.

## When to use this skill

- Building any new component
- Styling existing components
- Creating new pages
- Fixing visual inconsistencies
- Any task involving UI/UX

## Brand Colors (EXACT VALUES)

### Primary Brand
| Name | Hex | Tailwind | Usage |
|------|-----|----------|-------|
| Navy | #0F2D4A | `text-navy`, `bg-navy` | Primary text, headers, secondary buttons |
| Teal | #2A9D8F | `text-teal`, `bg-teal` | CTAs, links, focus rings, accents |
| Mint | #6EC6A7 | `text-mint`, `bg-mint` | Success accents, completed states |
| Cyan | #40C4D3 | `text-cyan`, `bg-cyan` | Highlights, decorative |

### Semantic Colors
| Name | Hex | Tailwind | Usage |
|------|-----|----------|-------|
| Success | #10B981 | `text-success`, `bg-success` | Success messages, checkmarks |
| Warning | #FFB84D | `text-warning`, `bg-warning` | Warnings, caution states |
| Error | #FF6B6B | `text-error`, `bg-error` | Errors, validation failures |

### Background Colors
| Name | Hex | Tailwind | Usage |
|------|-----|----------|-------|
| Warm White | #FAFAFA | `bg-warm-white` | Page backgrounds |
| Light Gray | #F5F7F9 | `bg-light-gray` | Card backgrounds, sections |
| White | #FFFFFF | `bg-white` | Elevated cards, modals |

### Text Colors
| Usage | Class |
|-------|-------|
| Primary text | `text-navy` or `text-gray-900` |
| Secondary text | `text-gray-600` |
| Muted text | `text-gray-500` or `text-medium-gray` |
| On dark backgrounds | `text-white` |

## Typography (EXACT CLASSES)

### Font Families
- **Headings**: `font-display` (Plus Jakarta Sans)
- **Body**: `font-sans` (Inter)
- **Code**: `font-mono` (JetBrains Mono)

### Heading Styles
```
h1: text-4xl md:text-5xl font-bold font-display text-navy
h2: text-3xl font-bold font-display text-navy
h3: text-xl font-semibold font-display text-navy
h4: text-lg font-semibold text-navy
```

### Body Text
```
Large: text-lg text-gray-600
Base: text-base text-gray-600
Small: text-sm text-gray-500
Tiny: text-xs text-gray-500
```

## Component Patterns (EXACT CLASSES)

### Buttons
```tsx
// Primary Button (main CTA)
className="bg-teal text-white rounded-lg font-semibold px-6 py-3 hover:bg-teal/90 transition-colors disabled:opacity-50"

// Secondary Button
className="bg-navy text-white rounded-lg font-semibold px-6 py-3 hover:bg-navy/90 transition-colors"

// Outline Button
className="border-2 border-navy text-navy rounded-lg font-semibold px-6 py-3 hover:bg-navy hover:text-white transition-colors"

// Ghost Button
className="text-teal hover:bg-teal/10 rounded-lg font-medium px-4 py-2 transition-colors"
```

### Cards
```tsx
// Standard Card
className="bg-white rounded-2xl shadow-lg p-6"

// Elevated Card
className="bg-white rounded-2xl shadow-xl p-8"

// Info Box (teal tinted)
className="bg-teal/10 rounded-xl p-4"

// Warning Box
className="bg-warning/10 border border-warning/20 rounded-xl p-4"
```

### Form Inputs
```tsx
// Standard Input
className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent transition-all"

// Input with Error
className="w-full px-4 py-3 border border-red-500 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"

// Label
className="block text-sm font-medium text-gray-700 mb-1"

// Error Message
className="mt-1 text-sm text-red-600"
```

### SuprFi Logo (ALWAYS USE THIS PATTERN)
```tsx
<span className="text-2xl font-bold font-display">
  <span className="text-navy">Supr</span>
  <span className="text-teal">Fi</span>
</span>
```

### Spacing Scale
```
Padding: p-4 (16px), p-6 (24px), p-8 (32px)
Margin: m-4, m-6, m-8
Gap: gap-4, gap-6, gap-8
Section padding: py-12 md:py-16 lg:py-20
Container padding: px-4 sm:px-6 lg:px-8
```

### Border Radius
```
Small elements: rounded-lg (8px)
Cards/modals: rounded-xl (12px) or rounded-2xl (16px)
Pills/badges: rounded-full
```

### Shadows
```
Cards: shadow-lg
Elevated/modals: shadow-xl
Buttons on hover: shadow-md
```

## Verification

```bash
npm run lint
npx tsc --noEmit
```

## Checklist Before Completion

- [ ] All colors use Tailwind classes from this skill (no hex codes inline)
- [ ] Headings use font-display
- [ ] Body text uses font-sans
- [ ] Buttons follow exact patterns above
- [ ] Cards use rounded-2xl shadow-lg
- [ ] Focus rings use ring-teal
- [ ] SuprFi logo uses Supr(navy) + Fi(teal) pattern
- [ ] No inline styles
