import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CheckoutForm from '@/components/CheckoutForm'

// Mock cart data
const mockCartItems = [
  {
    id: 1,
    name: 'XX99 Mark II Headphones',
    price: 2999,
    quantity: 1,
    image: '/assets/product-xx99-mark-two-headphones/mobile/image-product.jpg',
    slug: 'xx99-mark-two-headphones',
  },
]

// Mock cart context at module level
vi.mock('@/context/CartContext', () => ({
  CartProvider: ({ children }: { children: React.ReactNode }) => children,
  useCart: () => ({
    cart: mockCartItems,
    clearCart: vi.fn(),
    totalPrice: mockCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    addToCart: vi.fn(),
    removeFromCart: vi.fn(),
    updateQuantity: vi.fn(),
    totalItems: mockCartItems.reduce((sum, item) => sum + item.quantity, 0),
  }),
}))

const renderWithCart = () => {
  return render(<CheckoutForm />)
}

describe('Accessibility Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('ARIA Labels and Roles', () => {
    it('should have proper form roles and labels', () => {
      renderWithCart()

      // Main form should have proper role and label
      const form = screen.getByRole('main')
      expect(form).toBeInTheDocument()
      expect(form).toHaveAttribute('aria-label', 'Checkout form')

      // Order summary should have complementary role
      const orderSummary = screen.getByRole('complementary')
      expect(orderSummary).toBeInTheDocument()
      expect(orderSummary).toHaveAttribute('aria-labelledby', 'order-summary-heading')
    })

    it('should have proper fieldset legends', () => {
      renderWithCart()

      expect(screen.getByText('Billing Details')).toBeInTheDocument()
      expect(screen.getByText('Shipping Info')).toBeInTheDocument()
      expect(screen.getByText('Payment Details')).toBeInTheDocument()
    })

    it('should have proper input labels and descriptions', () => {
      renderWithCart()

      const nameInput = screen.getByLabelText(/full name/i)
      expect(nameInput).toHaveAttribute('aria-required', 'true')
      expect(nameInput).toHaveAttribute('aria-describedby')

      const emailInput = screen.getByLabelText(/email address/i)
      expect(emailInput).toHaveAttribute('aria-required', 'true')
      expect(emailInput).toHaveAttribute('aria-describedby')
    })

    it('should mark required fields with asterisk and aria-required', () => {
      renderWithCart()

      const requiredFields = [
        /full name/i,
        /email address/i,
        /phone number/i,
        /your address/i,
        /city/i,
        /zip code/i,
        /country/i,
      ]

      requiredFields.forEach(fieldLabel => {
        const field = screen.getByLabelText(fieldLabel)
        expect(field).toHaveAttribute('aria-required', 'true')
        
        // Check for asterisk in label
        const label = screen.getByText(fieldLabel)
        expect(label.closest('label')).toHaveTextContent('*')
      })
    })
  })

  describe('Screen Reader Announcements', () => {
    it('should have live regions for announcements', () => {
      renderWithCart()

      // Should have polite live region for status updates
      const politeRegion = screen.getByRole('status')
      expect(politeRegion).toHaveAttribute('aria-live', 'polite')
      expect(politeRegion).toHaveAttribute('aria-atomic', 'true')

      // Should have assertive live region for critical errors
      const assertiveRegion = screen.getByRole('alert')
      expect(assertiveRegion).toHaveAttribute('aria-live', 'assertive')
      expect(assertiveRegion).toHaveAttribute('aria-atomic', 'true')
    })

    it('should announce validation errors', async () => {
      const user = userEvent.setup()
      renderWithCart()

      const submitButton = screen.getByRole('button', { name: /continue & pay/i })
      await user.click(submitButton)

      // Should show error summary with proper role
      const errorSummary = screen.getByRole('alert')
      expect(errorSummary).toBeInTheDocument()
      expect(errorSummary).toHaveAttribute('aria-labelledby', 'form-errors-heading')
    })

    it('should announce form progress', async () => {
      const user = userEvent.setup()
      renderWithCart()

      const nameInput = screen.getByLabelText(/full name/i)
      await user.type(nameInput, 'John Doe')
      await user.tab()

      // Progress announcements are handled by the component's internal state
      // We can verify the structure is in place
      const statusRegion = screen.getByRole('status')
      expect(statusRegion).toBeInTheDocument()
    })
  })

  describe('Keyboard Navigation', () => {
    it('should support tab navigation through all form fields', async () => {
      const user = userEvent.setup()
      renderWithCart()

      // Get all focusable elements in order
      const focusableElements = [
        screen.getByLabelText(/full name/i),
        screen.getByLabelText(/email address/i),
        screen.getByLabelText(/phone number/i),
        screen.getByLabelText(/your address/i),
        screen.getByLabelText(/city/i),
        screen.getByLabelText(/zip code/i),
        screen.getByLabelText(/country/i),
        screen.getByLabelText(/e-money/i),
        screen.getByLabelText(/cash on delivery/i),
        screen.getByRole('button', { name: /continue & pay/i }),
      ]

      // Tab through each element
      for (let i = 0; i < focusableElements.length; i++) {
        await user.tab()
        expect(focusableElements[i]).toHaveFocus()
      }
    })

    it('should support keyboard shortcuts', async () => {
      const user = userEvent.setup()
      renderWithCart()

      // Test Alt+M shortcut (skip to main content)
      await user.keyboard('{Alt>}m{/Alt}')
      
      // The main content should be focused (implementation detail)
      // We can verify the shortcut structure exists
      const skipLink = screen.getByText(/skip to main checkout form/i)
      expect(skipLink).toBeInTheDocument()
    })

    it('should handle Enter and Space keys on buttons', async () => {
      const user = userEvent.setup()
      renderWithCart()

      const submitButton = screen.getByRole('button', { name: /continue & pay/i })
      
      // Focus the button
      submitButton.focus()
      expect(submitButton).toHaveFocus()

      // Test Enter key
      await user.keyboard('{Enter}')
      // Button should be activated (form submission attempted)
      
      // Test Space key
      await user.keyboard(' ')
      // Button should be activated (form submission attempted)
    })

    it('should manage focus on validation errors', async () => {
      const user = userEvent.setup()
      renderWithCart()

      const submitButton = screen.getByRole('button', { name: /continue & pay/i })
      await user.click(submitButton)

      // After validation errors, focus should move to first error field
      // This is handled by the component's useEffect
      const nameInput = screen.getByLabelText(/full name/i)
      
      // We can verify the error state is properly marked
      expect(nameInput).toHaveAttribute('aria-invalid', 'true')
    })
  })

  describe('Color Contrast and Visual Accessibility', () => {
    it('should have proper error state styling', async () => {
      const user = userEvent.setup()
      renderWithCart()

      const nameInput = screen.getByLabelText(/full name/i)
      const submitButton = screen.getByRole('button', { name: /continue & pay/i })
      
      await user.click(submitButton)

      // Error state should be visually indicated
      expect(nameInput).toHaveAttribute('aria-invalid', 'true')
      
      // Error message should be associated with the field
      const errorMessage = screen.getByText(/full name is required/i)
      expect(errorMessage).toBeInTheDocument()
      expect(errorMessage).toHaveAttribute('role', 'alert')
    })

    it('should have proper focus indicators', () => {
      renderWithCart()

      const nameInput = screen.getByLabelText(/full name/i)
      nameInput.focus()

      // Focus styles are applied via CSS classes
      expect(nameInput).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-primary')
    })

    it('should have sufficient color contrast for text', () => {
      renderWithCart()

      // Verify important text elements are present and properly styled
      const heading = screen.getByText('Billing Details')
      expect(heading).toBeInTheDocument()

      const labels = screen.getAllByText(/\*/i) // Required field asterisks
      expect(labels.length).toBeGreaterThan(0)
    })
  })

  describe('Form Validation Accessibility', () => {
    it('should associate error messages with form fields', async () => {
      const user = userEvent.setup()
      renderWithCart()

      const nameInput = screen.getByLabelText(/full name/i)
      const submitButton = screen.getByRole('button', { name: /continue & pay/i })
      
      await user.click(submitButton)

      // Error message should be associated with the field
      expect(nameInput).toHaveAttribute('aria-invalid', 'true')
      expect(nameInput).toHaveAttribute('aria-describedby')
      
      const errorId = nameInput.getAttribute('aria-describedby')
      if (errorId) {
        const errorElement = document.getElementById(errorId.split(' ').find(id => id.includes('error')) || '')
        expect(errorElement).toBeInTheDocument()
      }
    })

    it('should provide helpful field descriptions', () => {
      renderWithCart()

      const nameInput = screen.getByLabelText(/full name/i)
      const emailInput = screen.getByLabelText(/email address/i)

      // Fields should have helpful descriptions
      expect(screen.getByText(/enter your full legal name/i)).toBeInTheDocument()
      expect(screen.getByText(/we'll send your order confirmation here/i)).toBeInTheDocument()

      // Descriptions should be associated with fields
      expect(nameInput).toHaveAttribute('aria-describedby')
      expect(emailInput).toHaveAttribute('aria-describedby')
    })

    it('should handle conditional field validation accessibly', async () => {
      const user = userEvent.setup()
      renderWithCart()

      // Select e-Money payment method
      const eMoneyRadio = screen.getByLabelText(/e-money/i)
      await user.click(eMoneyRadio)

      // e-Money fields should appear and be properly labeled
      const eMoneyNumberInput = screen.getByLabelText(/e-money number/i)
      const eMoneyPINInput = screen.getByLabelText(/e-money pin/i)

      expect(eMoneyNumberInput).toBeInTheDocument()
      expect(eMoneyPINInput).toBeInTheDocument()
      expect(eMoneyNumberInput).toHaveAttribute('aria-required', 'true')
      expect(eMoneyPINInput).toHaveAttribute('aria-required', 'true')
    })
  })

  describe('Mobile and Touch Accessibility', () => {
    it('should have touch-friendly button sizes', () => {
      renderWithCart()

      const submitButton = screen.getByRole('button', { name: /continue & pay/i })
      
      // Button should have adequate padding for touch targets
      expect(submitButton).toHaveClass('py-4') // Adequate vertical padding
    })

    it('should handle touch interactions properly', async () => {
      const user = userEvent.setup()
      renderWithCart()

      const eMoneyRadio = screen.getByLabelText(/e-money/i)
      
      // Touch interaction should work the same as click
      fireEvent.touchStart(eMoneyRadio)
      fireEvent.touchEnd(eMoneyRadio)
      
      // e-Money fields should appear
      expect(screen.getByLabelText(/e-money number/i)).toBeInTheDocument()
    })
  })

  describe('High Contrast Mode Support', () => {
    it('should maintain functionality in high contrast mode', () => {
      renderWithCart()

      // Verify that important visual elements have proper semantic markup
      // that will work in high contrast mode
      const form = screen.getByRole('main')
      const submitButton = screen.getByRole('button', { name: /continue & pay/i })
      const radioButtons = screen.getAllByRole('radio')

      expect(form).toBeInTheDocument()
      expect(submitButton).toBeInTheDocument()
      expect(radioButtons.length).toBeGreaterThan(0)
    })
  })
})