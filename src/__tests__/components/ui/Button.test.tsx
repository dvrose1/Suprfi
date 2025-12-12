import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Button from '@/components/ui/Button'

// Mock next/link
jest.mock('next/link', () => {
  const MockLink = ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  )
  MockLink.displayName = 'MockLink'
  return MockLink
})

describe('Button Component', () => {
  describe('rendering', () => {
    it('renders children correctly', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByText('Click me')).toBeInTheDocument()
    })

    it('renders as a button by default', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('renders as a link when href is provided', () => {
      render(<Button href="/test">Click me</Button>)
      expect(screen.getByRole('link')).toHaveAttribute('href', '/test')
    })

    it('renders as button when href provided but disabled', () => {
      render(<Button href="/test" disabled>Click me</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('variants', () => {
    it('applies primary variant classes by default', () => {
      render(<Button>Primary</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('bg-primary-600')
    })

    it('applies secondary variant classes', () => {
      render(<Button variant="secondary">Secondary</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('bg-accent-500')
    })

    it('applies outline variant classes', () => {
      render(<Button variant="outline">Outline</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('border-2')
      expect(button.className).toContain('border-primary-600')
    })

    it('applies ghost variant classes', () => {
      render(<Button variant="ghost">Ghost</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('text-primary-600')
    })
  })

  describe('sizes', () => {
    it('applies medium size by default', () => {
      render(<Button>Medium</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('px-6')
      expect(button.className).toContain('py-3')
    })

    it('applies small size classes', () => {
      render(<Button size="sm">Small</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('px-4')
      expect(button.className).toContain('py-2')
    })

    it('applies large size classes', () => {
      render(<Button size="lg">Large</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('px-8')
      expect(button.className).toContain('py-4')
    })
  })

  describe('states', () => {
    it('is disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('is disabled when loading', () => {
      render(<Button loading>Loading</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('shows spinner when loading', () => {
      render(<Button loading>Loading</Button>)
      const svg = document.querySelector('svg.animate-spin')
      expect(svg).toBeInTheDocument()
    })

    it('applies fullWidth class when fullWidth is true', () => {
      render(<Button fullWidth>Full Width</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('w-full')
    })
  })

  describe('interactions', () => {
    it('calls onClick when clicked', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Click me</Button>)
      
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('does not call onClick when disabled', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick} disabled>Click me</Button>)
      
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('does not call onClick when loading', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick} loading>Click me</Button>)
      
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('button types', () => {
    it('has type="button" by default', () => {
      render(<Button>Button</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
    })

    it('can have type="submit"', () => {
      render(<Button type="submit">Submit</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
    })

    it('can have type="reset"', () => {
      render(<Button type="reset">Reset</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('type', 'reset')
    })
  })

  describe('custom className', () => {
    it('applies custom className', () => {
      render(<Button className="custom-class">Custom</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('custom-class')
    })
  })
})
