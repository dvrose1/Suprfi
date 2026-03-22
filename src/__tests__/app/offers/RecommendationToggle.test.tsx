// ABOUTME: Tests for the recommendation toggle on the offers page
// ABOUTME: Verifies toggle switches between "lowest monthly" and "lowest total cost" recommendation basis

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useSearchParams: jest.fn(),
  useRouter: jest.fn(),
}))

// Mock fetch
global.fetch = jest.fn()

// Import the page component
import OffersPage from '@/app/apply/[token]/offers/page'

const mockDecision = {
  id: 'decision-1',
  decisionStatus: 'approved',
  application: {
    customer: {
      firstName: 'John',
      lastName: 'Doe',
    },
    job: {
      estimateAmount: 5000,
      serviceType: 'HVAC Repair',
    },
  },
  offers: [],
}

describe('OffersPage Recommendation Toggle', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useParams as jest.Mock).mockReturnValue({ token: 'test-token' })
    ;(useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue('decision-1'),
    })
    ;(useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    })
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ decision: mockDecision }),
    })
  })

  it('renders the recommendation toggle', async () => {
    render(<OffersPage />)

    await waitFor(() => {
      expect(screen.getByText("What's most important to you?")).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /lowest cost/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /lowest monthly/i })).toBeInTheDocument()
  })

  it('defaults to "Lowest Cost" selection', async () => {
    render(<OffersPage />)

    await waitFor(() => {
      const lowestCostButton = screen.getByRole('button', { name: /lowest cost/i })
      expect(lowestCostButton).toHaveClass('bg-teal')
    })
  })

  it('switches to "Lowest Monthly" when clicked', async () => {
    render(<OffersPage />)

    await waitFor(() => {
      expect(screen.getByText("What's most important to you?")).toBeInTheDocument()
    })

    const lowestMonthlyButton = screen.getByRole('button', { name: /lowest monthly/i })
    fireEvent.click(lowestMonthlyButton)

    expect(lowestMonthlyButton).toHaveClass('bg-teal')
  })

  it('shows "Lowest Total Cost" in recommended badge by default', async () => {
    render(<OffersPage />)

    await waitFor(() => {
      expect(screen.getByText(/RECOMMENDED - Lowest Total Cost/i)).toBeInTheDocument()
    })
  })

  it('shows "Lowest Monthly Payment" in recommended badge after toggle', async () => {
    render(<OffersPage />)

    await waitFor(() => {
      expect(screen.getByText("What's most important to you?")).toBeInTheDocument()
    })

    const lowestMonthlyButton = screen.getByRole('button', { name: /lowest monthly/i })
    fireEvent.click(lowestMonthlyButton)

    await waitFor(() => {
      expect(screen.getByText(/RECOMMENDED - Lowest Monthly Payment/i)).toBeInTheDocument()
    })
  })

  it('recommends offer with lowest total when "Lowest Cost" is selected (default)', async () => {
    render(<OffersPage />)

    await waitFor(() => {
      // BNPL options have 0% APR, so they should be recommended for lowest total cost
      expect(screen.getByText(/RECOMMENDED - Lowest Total Cost/i)).toBeInTheDocument()
    })
  })

  it('recommends offer with lowest installment when "Lowest Monthly" is selected', async () => {
    render(<OffersPage />)

    await waitFor(() => {
      expect(screen.getByText("What's most important to you?")).toBeInTheDocument()
    })

    const lowestMonthlyButton = screen.getByRole('button', { name: /lowest monthly/i })
    fireEvent.click(lowestMonthlyButton)

    await waitFor(() => {
      expect(screen.getByText(/RECOMMENDED - Lowest Monthly Payment/i)).toBeInTheDocument()
    })
  })

  it('can toggle back to "Lowest Cost" after selecting "Lowest Monthly"', async () => {
    render(<OffersPage />)

    await waitFor(() => {
      expect(screen.getByText("What's most important to you?")).toBeInTheDocument()
    })

    // Click lowest monthly
    const lowestMonthlyButton = screen.getByRole('button', { name: /lowest monthly/i })
    fireEvent.click(lowestMonthlyButton)

    await waitFor(() => {
      expect(screen.getByText(/RECOMMENDED - Lowest Monthly Payment/i)).toBeInTheDocument()
    })

    // Click back to lowest cost
    const lowestCostButton = screen.getByRole('button', { name: /lowest cost/i })
    fireEvent.click(lowestCostButton)

    await waitFor(() => {
      expect(screen.getByText(/RECOMMENDED - Lowest Total Cost/i)).toBeInTheDocument()
    })
  })
})
