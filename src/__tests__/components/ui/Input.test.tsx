import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Input from '@/components/ui/Input'

describe('Input Component', () => {
  const defaultProps = {
    id: 'test-input',
    name: 'test',
  }

  describe('rendering', () => {
    it('renders input element', () => {
      render(<Input {...defaultProps} />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('renders with correct id and name', () => {
      render(<Input {...defaultProps} />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('id', 'test-input')
      expect(input).toHaveAttribute('name', 'test')
    })

    it('renders label when provided', () => {
      render(<Input {...defaultProps} label="Email Address" />)
      expect(screen.getByText('Email Address')).toBeInTheDocument()
    })

    it('does not render label when not provided', () => {
      render(<Input {...defaultProps} />)
      expect(screen.queryByRole('label')).not.toBeInTheDocument()
    })

    it('renders placeholder when provided', () => {
      render(<Input {...defaultProps} placeholder="Enter email" />)
      expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument()
    })
  })

  describe('input types', () => {
    it('renders text type by default', () => {
      render(<Input {...defaultProps} />)
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text')
    })

    it('renders email type', () => {
      render(<Input {...defaultProps} type="email" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')
    })

    it('renders tel type', () => {
      render(<Input {...defaultProps} type="tel" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'tel')
    })

    it('renders password type', () => {
      render(<Input {...defaultProps} type="password" />)
      // Password inputs don't have textbox role
      const input = document.querySelector('input[type="password"]')
      expect(input).toBeInTheDocument()
    })

    it('renders number type', () => {
      render(<Input {...defaultProps} type="number" />)
      expect(screen.getByRole('spinbutton')).toBeInTheDocument()
    })
  })

  describe('required state', () => {
    it('shows asterisk when required', () => {
      render(<Input {...defaultProps} label="Email" required />)
      expect(screen.getByText('*')).toBeInTheDocument()
    })

    it('sets required attribute on input', () => {
      render(<Input {...defaultProps} required />)
      expect(screen.getByRole('textbox')).toBeRequired()
    })

    it('does not show asterisk when not required', () => {
      render(<Input {...defaultProps} label="Email" />)
      expect(screen.queryByText('*')).not.toBeInTheDocument()
    })
  })

  describe('disabled state', () => {
    it('disables input when disabled prop is true', () => {
      render(<Input {...defaultProps} disabled />)
      expect(screen.getByRole('textbox')).toBeDisabled()
    })

    it('applies disabled styles', () => {
      render(<Input {...defaultProps} disabled />)
      const input = screen.getByRole('textbox')
      expect(input.className).toContain('disabled:bg-gray-100')
    })
  })

  describe('error state', () => {
    it('displays error message when provided', () => {
      render(<Input {...defaultProps} error="This field is required" />)
      expect(screen.getByText('This field is required')).toBeInTheDocument()
    })

    it('applies error styles when error is present', () => {
      render(<Input {...defaultProps} error="Error" />)
      const input = screen.getByRole('textbox')
      expect(input.className).toContain('border-accent-500')
    })

    it('does not show error message when no error', () => {
      render(<Input {...defaultProps} />)
      const errorElement = document.querySelector('.text-accent-600')
      expect(errorElement).not.toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('calls onChange when value changes', () => {
      const handleChange = jest.fn()
      render(<Input {...defaultProps} onChange={handleChange} />)
      
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } })
      expect(handleChange).toHaveBeenCalled()
    })

    it('calls onBlur when input loses focus', () => {
      const handleBlur = jest.fn()
      render(<Input {...defaultProps} onBlur={handleBlur} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.blur(input)
      expect(handleBlur).toHaveBeenCalled()
    })

    it('updates value correctly', () => {
      const TestComponent = () => {
        const [value, setValue] = React.useState('')
        return (
          <Input
            {...defaultProps}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        )
      }
      
      render(<TestComponent />)
      const input = screen.getByRole('textbox')
      
      fireEvent.change(input, { target: { value: 'hello' } })
      expect(input).toHaveValue('hello')
    })
  })

  describe('custom className', () => {
    it('applies custom className to wrapper', () => {
      render(<Input {...defaultProps} className="custom-wrapper" />)
      const wrapper = screen.getByRole('textbox').parentElement
      expect(wrapper?.className).toContain('custom-wrapper')
    })
  })

  describe('label association', () => {
    it('associates label with input via htmlFor', () => {
      render(<Input {...defaultProps} label="Email" />)
      const label = screen.getByText('Email')
      expect(label).toHaveAttribute('for', 'test-input')
    })
  })
})
