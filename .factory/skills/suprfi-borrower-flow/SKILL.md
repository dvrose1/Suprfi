---
name: suprfi-borrower-flow
description: Build or modify borrower-facing application flows including multi-step forms, validation, and state management. Use when working on get-started page, application steps, offers, or agreement pages.
---

# Skill: SuprFi Borrower Flow

## Purpose

Implement borrower-facing features following established patterns for multi-step forms, validation, and UX.

## When to use this skill

- Building new application steps
- Modifying existing borrower flow pages
- Adding form validation
- Working on offers or agreement pages
- Any `/get-started` or `/apply/[token]/*` routes

## Directory Structure
```
src/app/
  get-started/page.tsx         # Initial application entry
  apply/[token]/
    page.tsx                   # Main application form
    offers/page.tsx            # Financing options display
    agreement/page.tsx         # Terms and signing
    success/page.tsx           # Confirmation page

src/components/borrower/
  ApplicationForm.tsx          # Main form orchestrator
  ManualBankForm.tsx           # Bank entry fallback
  steps/
    PersonalInfoStep.tsx       # Step 1: Personal details
    BankLinkStep.tsx           # Step 2: Plaid connection
    KYCStep.tsx                # Step 3: Identity verification
    ReviewStep.tsx             # Step 4: Final review
```

## Step Component Pattern
```tsx
interface StepProps {
  formData: ApplicationFormData
  updateFormData: (data: Partial<ApplicationFormData>) => void
  onNext: () => void
  onBack?: () => void
}

export function PersonalInfoStep({ formData, updateFormData, onNext, onBack }: StepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.firstName) newErrors.firstName = 'First name is required'
    // ... more validation
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    // ... any async work
    onNext()
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form fields */}
      <div className="flex gap-4">
        {onBack && (
          <button type="button" onClick={onBack} className="...">
            Back
          </button>
        )}
        <button type="submit" disabled={loading} className="bg-teal text-white ...">
          {loading ? 'Processing...' : 'Continue'}
        </button>
      </div>
    </form>
  )
}
```

## Form Field Pattern
```tsx
<div className="space-y-1">
  <label className="block text-sm font-medium text-gray-700">
    First Name <span className="text-red-500">*</span>
  </label>
  <input
    type="text"
    value={formData.firstName}
    onChange={(e) => updateFormData({ firstName: e.target.value })}
    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent transition-all ${
      errors.firstName ? 'border-red-500' : 'border-gray-300'
    }`}
    placeholder="Enter your first name"
  />
  {errors.firstName && (
    <p className="text-sm text-red-600">{errors.firstName}</p>
  )}
</div>
```

## Phone Input with Country Code
```tsx
const COUNTRY_CODES = [
  { code: '+1', country: 'US', flag: '🇺🇸' },
  { code: '+1', country: 'CA', flag: '🇨🇦' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+52', country: 'MX', flag: '🇲🇽' },
]

function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
}

// Usage in form
<div className="flex gap-2">
  <select 
    value={countryCode}
    onChange={(e) => setCountryCode(e.target.value)}
    className="px-3 py-3 border border-gray-300 rounded-lg bg-white"
  >
    {COUNTRY_CODES.map((c) => (
      <option key={c.country} value={c.code}>{c.flag} {c.code}</option>
    ))}
  </select>
  <input
    type="tel"
    value={formatPhoneNumber(formData.phone)}
    onChange={(e) => updateFormData({ phone: e.target.value.replace(/\D/g, '') })}
    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg ..."
    placeholder="555-123-4567"
  />
</div>
```

## Progress Bar Pattern
```tsx
const steps = ['Personal Info', 'Bank Link', 'Verify Identity', 'Review']
const currentStep = 1 // 0-indexed
const progress = ((currentStep + 1) / steps.length) * 100

<div className="mb-8">
  {/* Progress bar */}
  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
    <div
      className="bg-teal h-2 rounded-full transition-all duration-300"
      style={{ width: `${progress}%` }}
    />
  </div>
  
  {/* Step indicators */}
  <div className="flex justify-between">
    {steps.map((step, i) => (
      <div key={step} className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          i <= currentStep 
            ? 'bg-teal text-white' 
            : 'bg-gray-200 text-gray-500'
        }`}>
          {i < currentStep ? '✓' : i + 1}
        </div>
        <span className="text-xs mt-1 text-gray-500">{step}</span>
      </div>
    ))}
  </div>
</div>
```

## SSN Input with Toggle
```tsx
const [showSSN, setShowSSN] = useState(false)

<div className="relative">
  <input
    type={showSSN ? 'text' : 'password'}
    value={formData.ssn}
    onChange={(e) => updateFormData({ ssn: formatSSN(e.target.value) })}
    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg ..."
    placeholder="XXX-XX-XXXX"
  />
  <button
    type="button"
    onClick={() => setShowSSN(!showSSN)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
  >
    {showSSN ? <EyeOffIcon /> : <EyeIcon />}
  </button>
</div>

function formatSSN(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 9)
  if (digits.length <= 3) return digits
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
}
```

## Page Layout Pattern
```tsx
export default function ApplyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-warm-white to-white">
      {/* Header */}
      <header className="p-4 flex justify-center">
        <SuprFiLogo />
      </header>
      
      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h1 className="text-2xl font-bold font-display text-navy mb-6">
            Step Title
          </h1>
          {/* Form content */}
        </div>
      </main>
      
      {/* Trust indicators */}
      <footer className="max-w-2xl mx-auto px-4 py-8 text-center">
        <p className="text-sm text-gray-500">
          Your information is encrypted and secure
        </p>
      </footer>
    </div>
  )
}
```

## Verification

```bash
npm run lint
npx tsc --noEmit
```

## Checklist

- [ ] Form uses controlled inputs
- [ ] Validation runs before step advancement
- [ ] Error messages appear below fields in red
- [ ] Focus rings use teal color
- [ ] Loading state shows on submit buttons
- [ ] Progress indicator reflects current step
- [ ] Phone number formats with dashes (555-123-4567)
- [ ] SSN has show/hide toggle
- [ ] Back button available on steps 2+
