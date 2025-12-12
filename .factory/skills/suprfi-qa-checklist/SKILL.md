---
name: suprfi-qa-checklist
description: Validate completed work against SuprFi standards. Use after implementing any feature to ensure quality, consistency, and completeness. Chains with other skills.
---

# Skill: SuprFi QA Checklist

## Purpose

Validate completed work against SuprFi standards before marking any task complete. This skill chains with other skills to provide final verification.

## When to use this skill

- After completing any UI component work
- After implementing API endpoints
- After database changes
- Before committing code
- When asked to review or validate work

## Layout Inspector Checklist

- [ ] Grid/flex structure is correct for the layout
- [ ] Spacing uses Tailwind values only (p-4, p-6, p-8, gap-4, gap-6)
- [ ] Responsive breakpoints applied (sm:, md:, lg:)
- [ ] Container max-widths use max-w-6xl or max-w-4xl
- [ ] Z-index uses Tailwind scale (z-10, z-20, z-50)
- [ ] Overflow handling is explicit where needed

## Style Consistency Checklist

- [ ] Colors from SuprFi palette only:
  - Brand: navy (#0F2D4A), teal (#2A9D8F), mint (#6EC6A7), cyan (#40C4D3)
  - Semantic: success (#10B981), warning (#FFB84D), error (#FF6B6B)
  - Neutrals: warm-white (#FAFAFA), light-gray (#F5F7F9), medium-gray (#8B9AAB)
- [ ] Shadows use shadow-lg or shadow-xl only
- [ ] Border radii use rounded-lg, rounded-xl, or rounded-2xl
- [ ] No magic numbers or inline hex codes
- [ ] Focus rings use ring-teal or focus:ring-2 focus:ring-teal

## Typography Auditor Checklist

- [ ] Headings use font-display (Plus Jakarta Sans)
- [ ] Body text uses font-sans (Inter)
- [ ] Font sizes from Tailwind scale only
- [ ] Line heights appropriate for text size
- [ ] Heading hierarchy maintained (h1 > h2 > h3)
- [ ] Font weights: font-bold for headings, font-semibold for buttons

## Component Validator Checklist

- [ ] Props are fully typed with TypeScript
- [ ] Reuses existing components from components/ui/
- [ ] No inline styles (use Tailwind classes)
- [ ] Accessible markup (aria labels, roles where needed)
- [ ] Loading states handled
- [ ] Error states handled
- [ ] Empty states handled

## API Route Validator Checklist

- [ ] Uses NextRequest/NextResponse
- [ ] Params are awaited (Next.js 15)
- [ ] Try/catch with console.error logging
- [ ] Zod validation for all inputs
- [ ] Proper HTTP status codes (200, 400, 401, 404, 500)
- [ ] Audit log created for mutations
- [ ] No sensitive data in responses (SSN, tokens)

## Database Validator Checklist

- [ ] Uses cuid() for IDs
- [ ] Has createdAt/updatedAt fields
- [ ] Indexes on frequently queried fields
- [ ] Relations properly defined
- [ ] JSON fields typed as Record<string, unknown>
- [ ] Transactions used for multi-step operations

## Visual QA Checklist

- [ ] SuprFi logo styled correctly (Supr navy, Fi teal)
- [ ] Hover/focus states work and use brand colors
- [ ] Animations use transition-all duration-200 or duration-300
- [ ] No visual regressions from existing pages
- [ ] Mobile responsive (test at 375px width)

## Verification Commands

Run ALL of these before marking complete:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Completion Criteria

The skill is complete when:
- All applicable checklists pass
- All verification commands succeed
- No TypeScript errors
- No ESLint errors
- Build succeeds without warnings
