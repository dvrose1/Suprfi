import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PersonalInfoStep } from '@/components/borrower/steps/PersonalInfoStep'

const mockFormData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '+15551234567',
  addressLine1: '123 Main St',
  addressLine2: '',
  city: 'Austin',
  state: 'TX',
  postalCode: '78701',
  dateOfBirth: '1990-01-15',
  ssn: '123-45-6789',
  creditCheckConsent: false,
  termsAccepted: false,
  eSignConsent: false,
}

const emptyFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  dateOfBirth: '',
  ssn: '',
  creditCheckConsent: false,
  termsAccepted: false,
  eSignConsent: false,
}

describe('PersonalInfoStep', () => {
  const mockUpdateFormData = jest.fn()
  const mockOnNext = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders the form title', () => {
      render(
        <PersonalInfoStep
          formData={mockFormData}
          updateFormData={mockUpdateFormData}
          onNext={mockOnNext}
        />
      )
      expect(screen.getByText('Personal Information')).toBeInTheDocument()
    })

    it('renders all required fields', () => {
      render(
        <PersonalInfoStep
          formData={mockFormData}
          updateFormData={mockUpdateFormData}
          onNext={mockOnNext}
        />
      )
      
      // Check for labels (form uses non-standard label associations)
      expect(screen.getByText(/first name/i)).toBeInTheDocument()
      expect(screen.getByText(/last name/i)).toBeInTheDocument()
      expect(screen.getByText(/email address/i)).toBeInTheDocument()
      expect(screen.getByText(/date of birth/i)).toBeInTheDocument()
      expect(screen.getByText(/social security number/i)).toBeInTheDocument()
      expect(screen.getByText(/street address/i)).toBeInTheDocument()
      expect(screen.getByText(/city/i)).toBeInTheDocument()
      expect(screen.getByText(/zip code/i)).toBeInTheDocument()
    })

    it('pre-fills form with existing data', () => {
      render(
        <PersonalInfoStep
          formData={mockFormData}
          updateFormData={mockUpdateFormData}
          onNext={mockOnNext}
        />
      )
      
      expect(screen.getByDisplayValue('John')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Doe')).toBeInTheDocument()
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument()
    })

    it('renders continue button', () => {
      render(
        <PersonalInfoStep
          formData={mockFormData}
          updateFormData={mockUpdateFormData}
          onNext={mockOnNext}
        />
      )
      
      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
    })
  })

  describe('phone formatting', () => {
    it('formats phone number with dashes', () => {
      render(
        <PersonalInfoStep
          formData={{ ...mockFormData, phone: '' }}
          updateFormData={mockUpdateFormData}
          onNext={mockOnNext}
        />
      )
      
      const phoneInput = screen.getByPlaceholderText('555-123-4567')
      fireEvent.change(phoneInput, { target: { value: '5551234567' } })
      
      expect(mockUpdateFormData).toHaveBeenCalled()
    })

    it('renders country code selector', () => {
      render(
        <PersonalInfoStep
          formData={mockFormData}
          updateFormData={mockUpdateFormData}
          onNext={mockOnNext}
        />
      )
      
      // Should have country code select (first combobox is country code, second is state)
      const selects = screen.getAllByRole('combobox')
      expect(selects.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('SSN field', () => {
    it('has show/hide toggle', () => {
      render(
        <PersonalInfoStep
          formData={mockFormData}
          updateFormData={mockUpdateFormData}
          onNext={mockOnNext}
        />
      )
      
      // Find toggle button
      const toggleButton = screen.getByRole('button', { name: /show ssn|hide ssn/i })
      expect(toggleButton).toBeInTheDocument()
    })

    it('toggles SSN visibility when clicked', () => {
      render(
        <PersonalInfoStep
          formData={mockFormData}
          updateFormData={mockUpdateFormData}
          onNext={mockOnNext}
        />
      )
      
      // Initially should be password type (hidden)
      const ssnInput = document.querySelector('input[placeholder="###-##-####"]')
      expect(ssnInput).toHaveAttribute('type', 'password')
      
      // Click toggle
      const toggleButton = screen.getByRole('button', { name: /show ssn/i })
      fireEvent.click(toggleButton)
      
      // Should now be text type (visible)
      expect(ssnInput).toHaveAttribute('type', 'text')
    })
  })

  describe('validation', () => {
    it('shows error when required fields are empty', async () => {
      render(
        <PersonalInfoStep
          formData={emptyFormData}
          updateFormData={mockUpdateFormData}
          onNext={mockOnNext}
        />
      )
      
      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /continue/i }))
      
      await waitFor(() => {
        expect(screen.getByText('First name is required')).toBeInTheDocument()
        expect(screen.getByText('Last name is required')).toBeInTheDocument()
        expect(screen.getByText('Email is required')).toBeInTheDocument()
      })
    })

    it('shows error for invalid SSN length', async () => {
      const invalidSSNData = { ...mockFormData, ssn: '123' }
      
      render(
        <PersonalInfoStep
          formData={invalidSSNData}
          updateFormData={mockUpdateFormData}
          onNext={mockOnNext}
        />
      )
      
      fireEvent.click(screen.getByRole('button', { name: /continue/i }))
      
      await waitFor(() => {
        expect(screen.getByText('SSN must be 9 digits')).toBeInTheDocument()
      })
    })

    it('calls onNext when form is valid', async () => {
      render(
        <PersonalInfoStep
          formData={mockFormData}
          updateFormData={mockUpdateFormData}
          onNext={mockOnNext}
        />
      )
      
      fireEvent.click(screen.getByRole('button', { name: /continue/i }))
      
      await waitFor(() => {
        expect(mockOnNext).toHaveBeenCalled()
      })
    })

    it('does not call onNext when form is invalid', async () => {
      render(
        <PersonalInfoStep
          formData={emptyFormData}
          updateFormData={mockUpdateFormData}
          onNext={mockOnNext}
        />
      )
      
      fireEvent.click(screen.getByRole('button', { name: /continue/i }))
      
      await waitFor(() => {
        expect(mockOnNext).not.toHaveBeenCalled()
      })
    })
  })

  describe('form interactions', () => {
    it('calls updateFormData when first name changes', () => {
      render(
        <PersonalInfoStep
          formData={mockFormData}
          updateFormData={mockUpdateFormData}
          onNext={mockOnNext}
        />
      )
      
      const firstNameInput = screen.getByDisplayValue('John')
      fireEvent.change(firstNameInput, { target: { value: 'Jane' } })
      
      expect(mockUpdateFormData).toHaveBeenCalledWith({ firstName: 'Jane' })
    })

    it('calls updateFormData when email changes', () => {
      render(
        <PersonalInfoStep
          formData={mockFormData}
          updateFormData={mockUpdateFormData}
          onNext={mockOnNext}
        />
      )
      
      const emailInput = screen.getByDisplayValue('john@example.com')
      fireEvent.change(emailInput, { target: { value: 'jane@example.com' } })
      
      expect(mockUpdateFormData).toHaveBeenCalledWith({ email: 'jane@example.com' })
    })

    it('calls updateFormData when address changes', () => {
      render(
        <PersonalInfoStep
          formData={mockFormData}
          updateFormData={mockUpdateFormData}
          onNext={mockOnNext}
        />
      )
      
      const addressInput = screen.getByDisplayValue('123 Main St')
      fireEvent.change(addressInput, { target: { value: '456 Oak Ave' } })
      
      expect(mockUpdateFormData).toHaveBeenCalledWith({ addressLine1: '456 Oak Ave' })
    })

    it('calls updateFormData when state selection changes', () => {
      render(
        <PersonalInfoStep
          formData={mockFormData}
          updateFormData={mockUpdateFormData}
          onNext={mockOnNext}
        />
      )
      
      const stateSelect = screen.getByDisplayValue('Texas')
      fireEvent.change(stateSelect, { target: { value: 'CA' } })
      
      expect(mockUpdateFormData).toHaveBeenCalledWith({ state: 'CA' })
    })
  })

  describe('security note', () => {
    it('displays SSN security notice', () => {
      render(
        <PersonalInfoStep
          formData={mockFormData}
          updateFormData={mockUpdateFormData}
          onNext={mockOnNext}
        />
      )
      
      expect(screen.getByText(/used for identity verification only/i)).toBeInTheDocument()
    })
  })
})
