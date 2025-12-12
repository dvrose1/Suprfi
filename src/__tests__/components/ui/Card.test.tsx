import React from 'react'
import { render, screen } from '@testing-library/react'
import Card from '@/components/ui/Card'

describe('Card Component', () => {
  describe('rendering', () => {
    it('renders children correctly', () => {
      render(<Card>Card content</Card>)
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('applies base classes', () => {
      render(<Card><span data-testid="card-child">Content</span></Card>)
      const cardChild = screen.getByTestId('card-child')
      const card = cardChild.parentElement
      expect(card?.className).toContain('bg-white')
      expect(card?.className).toContain('rounded-2xl')
      expect(card?.className).toContain('shadow-md')
    })
  })

  describe('padding', () => {
    it('applies medium padding by default', () => {
      render(<Card>Content</Card>)
      const card = screen.getByText('Content')
      expect(card.className).toContain('p-6')
    })

    it('applies no padding when padding="none"', () => {
      render(<Card padding="none">Content</Card>)
      const card = screen.getByText('Content')
      expect(card.className).not.toContain('p-4')
      expect(card.className).not.toContain('p-6')
      expect(card.className).not.toContain('p-8')
    })

    it('applies small padding', () => {
      render(<Card padding="sm">Content</Card>)
      const card = screen.getByText('Content')
      expect(card.className).toContain('p-4')
    })

    it('applies large padding', () => {
      render(<Card padding="lg">Content</Card>)
      const card = screen.getByText('Content')
      expect(card.className).toContain('p-8')
    })
  })

  describe('hover effect', () => {
    it('does not apply hover classes by default', () => {
      render(<Card>Content</Card>)
      const card = screen.getByText('Content')
      expect(card.className).not.toContain('hover:shadow-xl')
      expect(card.className).not.toContain('hover:-translate-y-1')
    })

    it('applies hover classes when hover is true', () => {
      render(<Card hover>Content</Card>)
      const card = screen.getByText('Content')
      expect(card.className).toContain('hover:shadow-xl')
      expect(card.className).toContain('hover:-translate-y-1')
    })
  })

  describe('custom className', () => {
    it('applies custom className', () => {
      render(<Card className="custom-class">Content</Card>)
      const card = screen.getByText('Content')
      expect(card.className).toContain('custom-class')
    })

    it('merges custom className with default classes', () => {
      render(<Card className="my-custom-class">Content</Card>)
      const card = screen.getByText('Content')
      expect(card.className).toContain('bg-white')
      expect(card.className).toContain('my-custom-class')
    })
  })

  describe('nested content', () => {
    it('renders complex nested content', () => {
      render(
        <Card>
          <h2>Title</h2>
          <p>Description</p>
          <button>Action</button>
        </Card>
      )
      
      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Description')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
    })
  })
})
