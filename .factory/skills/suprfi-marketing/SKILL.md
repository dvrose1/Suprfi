---
name: suprfi-marketing
description: Build or modify marketing and landing pages following SuprFi patterns for responsive design, SEO, and component composition. Use when working on the marketing site, landing pages, or public-facing content.
---

# Skill: SuprFi Marketing Pages

## Purpose

Implement marketing pages following established patterns for responsive design, component composition, and SEO best practices.

## When to use this skill

- Building new landing pages
- Modifying marketing site content
- Adding new sections to homepage
- Working on waitlist or lead capture
- Any public-facing (non-app) pages

## Directory Structure
```
src/app/
  page.tsx                    # Homepage
  how-it-works/page.tsx       # Process explanation
  for-contractors/page.tsx    # B2B landing page
  pricing/page.tsx            # Pricing page

src/components/marketing/
  Header.tsx                  # Fixed nav with mobile menu
  Footer.tsx                  # Links, legal, contact
  Hero.tsx                    # Above-fold hero section
  HowItWorks.tsx              # Step-by-step explainer
  ServicesGrid.tsx            # Service/feature cards
  Testimonials.tsx            # Customer quotes
  TrustBar.tsx                # Partner logos, trust badges
  CtaSection.tsx              # Call-to-action block
  WaitlistForm.tsx            # Email capture form
```

## Page Layout Pattern
```tsx
import { Header } from '@/components/marketing/Header'
import { Footer } from '@/components/marketing/Footer'
import { Hero } from '@/components/marketing/Hero'

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-warm-white flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        {/* More sections */}
      </main>
      <Footer />
    </div>
  )
}
```

## Hero Section Pattern
```tsx
export function Hero() {
  return (
    <section className="relative py-20 md:py-28 lg:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto text-center">
        {/* Badge (optional) */}
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-teal/10 text-teal text-sm font-medium mb-6">
          Now Available
        </div>
        
        {/* Main Headline */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-navy mb-6 leading-tight">
          Finance Home Services
          <br />
          <span className="text-teal">Without the Hassle</span>
        </h1>
        
        {/* Subheadline */}
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Get approved in minutes for home improvement financing.
        </p>
        
        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/get-started" 
            className="px-8 py-4 bg-teal text-white rounded-xl font-semibold text-lg hover:bg-teal/90 transition-colors shadow-lg"
          >
            Check Your Rate
          </Link>
          <Link 
            href="/how-it-works" 
            className="px-8 py-4 border-2 border-navy text-navy rounded-xl font-semibold text-lg hover:bg-navy hover:text-white transition-colors"
          >
            Learn More
          </Link>
        </div>
      </div>
    </section>
  )
}
```

## Feature Grid Pattern
```tsx
const features = [
  { icon: ClockIcon, title: 'Fast Approval', description: 'Get approved in under 60 seconds' },
  { icon: ShieldIcon, title: 'No Hard Pull', description: 'Soft credit check only' },
  { icon: WalletIcon, title: 'Flexible Terms', description: '6-60 month options' },
]

<section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-light-gray">
  <div className="max-w-6xl mx-auto">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {features.map((feature, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="w-12 h-12 bg-teal/10 rounded-xl flex items-center justify-center mb-4">
            <feature.icon className="w-6 h-6 text-teal" />
          </div>
          <h3 className="text-xl font-semibold font-display text-navy mb-2">
            {feature.title}
          </h3>
          <p className="text-gray-600">{feature.description}</p>
        </div>
      ))}
    </div>
  </div>
</section>
```

## CTA Section Pattern
```tsx
<section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8">
  <div className="max-w-4xl mx-auto">
    <div className="bg-gradient-to-r from-navy to-teal rounded-3xl p-8 md:p-12 text-center text-white">
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold font-display mb-4">
        Ready to Get Started?
      </h2>
      <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
        Check your rate in under 60 seconds with no impact to your credit score.
      </p>
      <Link 
        href="/get-started"
        className="inline-block px-8 py-4 bg-white text-navy rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors"
      >
        Check Your Rate
      </Link>
    </div>
  </div>
</section>
```

## Responsive Breakpoints
```
Mobile-first approach:
- Default: mobile (< 640px)
- sm: 640px (large phones)
- md: 768px (tablets)
- lg: 1024px (laptops)
- xl: 1280px (desktops)

Common patterns:
- Text: text-3xl md:text-4xl lg:text-5xl
- Padding: py-12 md:py-16 lg:py-20
- Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Flex: flex-col sm:flex-row
- Container: px-4 sm:px-6 lg:px-8
- Max width: max-w-6xl mx-auto
```

## Header Pattern
```tsx
export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold font-display">
          <span className="text-navy">Supr</span>
          <span className="text-teal">Fi</span>
        </Link>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/how-it-works" className="text-gray-600 hover:text-navy">
            How It Works
          </Link>
          <Link 
            href="/get-started" 
            className="px-4 py-2 bg-teal text-white rounded-lg font-semibold hover:bg-teal/90"
          >
            Get Started
          </Link>
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <XIcon /> : <MenuIcon />}
        </button>
      </nav>
    </header>
  )
}
```

## Verification

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Checklist

- [ ] Header is fixed with backdrop-blur
- [ ] Mobile menu is functional
- [ ] Hero section is above the fold
- [ ] All grids are responsive (mobile-first)
- [ ] CTAs use teal or gradient background
- [ ] Sections have consistent vertical padding
- [ ] Max-width containers are centered
