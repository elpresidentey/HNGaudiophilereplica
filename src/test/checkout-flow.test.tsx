import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
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

// Helper to render CheckoutForm with cart context
const renderCheckoutForm = () => {
  return render(<CheckoutForm />)
}

describe('Checkout Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock successful API responses
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    })
  })

  describe('Form rendering and initial state', () => {
    it('should render all form sections', () => {
      renderCheckoutForm()

      expect(screen.getByText('Billing Details')).toBeInTheDocument()
      expect(screen.getByText('Shipping Information')).toBeInTheDocument()
      expect(screen.getByText('Payment Details')).toBeInTheDocument()
      expect(screen.getByText('Order Summary')).toBeInTheDocument()
    })

    it('should display cart items in order summary', () => {
      renderCheckoutForm()

      expect(screen.getByText('XX99 Mark II Headphones')).toBeInTheDocument()
      expect(screen.getByText('ZX9 Speaker')).toBeInTheDocument()
    })

    it('should calculate totals correctly', () => {
      renderCheckoutForm()

      // Subtotal: 2999 + (4500 * 2) = 11999
      expect(screen.getByText('$11,999')).toBeInTheDocument()
      // Shipping: $50
      expect(screen.getByText('$50')).toBeInTheDocument()
      // Tax (20%): 2400 (rounded)
      expect(screen.getByText('$2,400')).toBeInTheDocument()
      // Total: 11999 + 50 + 2400 = 14449
      expect(screen.getByText('$14,449')).toBeInTheDocument()
    })

    it('should show empty cart message when cart is empty', () => {
      renderCheckoutForm([])

      expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
      expect(screen.getByText('Continue Shopping')).toBeInTheDocument()
    })
  })

  describe('Form validation and user interaction', () => {
    it('should show validation errors for empty required fields', async () => {
      const user = userEvent.setup()
      renderCheckoutForm()

      const submitButton = screen.getByRole('button', { name: /continue & pay/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/full name is required/i)).toBeInTheDocument()
        expect(screen.getByText(/email address is required/i)).toBeInTheDocument()
        expect(screen.getByText(/phone number is required/i)).toBeInTheDocument()
      })
    })

    it('should validate email format in real-time', async () => {
      const user = userEvent.setup()
      renderCheckoutForm()

      const emailInput = screen.getByLabelText(/email address/i)
      await user.type(emailInput, 'invalid-email')
      await user.tab() // Trigger blur event

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
      })
    })

    it('should validate phone number format', async () => {
      const user = userEvent.setup()
      renderCheckoutForm()

      const phoneInput = screen.getByLabelText(/phone number/i)
      await user.type(phoneInput, '123')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText(/phone number must contain at least 10 digits/i)).toBeInTheDocument()
      })
    })

    it('should show e-Money fields when e-Money payment is selected', async () => {
      const user = userEvent.setup()
      renderCheckoutForm()

      const eMoneyRadio = screen.getByLabelText(/e-money/i)
      await user.click(eMoneyRadio)

      expect(screen.getByLabelText(/e-money number/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/e-money pin/i)).toBeInTheDocument()
    })

    it('should hide e-Money fields when Cash on Delivery is selected', async () => {
      const user = userEvent.setup()
      renderCheckoutForm()

      // First select e-Money to show fields
      const eMoneyRadio = screen.getByLabelText(/e-money/i)
      await user.click(eMoneyRadio)

      expect(screen.getByLabelText(/e-money number/i)).toBeInTheDocument()

      // Then select Cash on Delivery
      const cashRadio = screen.getByLabelText(/cash on delivery/i)
      await user.click(cashRadio)

      expect(screen.queryByLabelText(/e-money number/i)).not.toBeInTheDocument()
      expect(screen.getByText(/cash on delivery information/i)).toBeInTheDocument()
    })
  })

  describe('Form submission', () => {
    const fillValidForm = async (user: any) => {
      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com')
      await user.type(screen.getByLabelText(/phone number/i), '1234567890')
      await user.type(screen.getByLabelText(/your address/i), '123 Main Street')
      await user.type(screen.getByLabelText(/city/i), 'New York')
      await user.type(screen.getByLabelText(/zip code/i), '12345')
      await user.type(screen.getByLabelText(/country/i), 'United States')
      await user.click(screen.getByLabelText(/cash on delivery/i))
    }

    it('should submit form with valid data', async () => {
      const user = userEvent.setup()
      renderCheckoutForm()

      await fillValidForm(user)

      const submitButton = screen.getByRole('button', { name: /continue & pay/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/processing order/i)).toBeInTheDocument()
      })

      // Verify API calls
      expect(global.fetch).toHaveBeenCalledWith('/api/send-email', expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }))
    })

    it('should handle API errors gracefully', async () => {
      const user = userEvent.setup()
      
      // Mock API failure
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))
      
      renderCheckoutForm()
      await fillValidForm(user)

      const submitButton = screen.getByRole('button', { name: /continue & pay/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/network connection error/i)).toBeInTheDocument()
      })
    })

    it('should prevent duplicate submissions', async () => {
      const user = userEvent.setup()
      renderCheckoutForm()

      await fillValidForm(user)

      const submitButton = screen.getByRole('button', { name: /continue & pay/i })
      
      // Click submit button multiple times quickly
      await user.click(submitButton)
      await user.click(submitButton)
      await user.click(submitButton)

      // Should only make one API call
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1)
      })
    })

    it('should validate e-Money fields when e-Money payment is selected', async () => {
      const user = userEvent.setup()
      renderCheckoutForm()

      // Fill basic form
      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com')
      await user.type(screen.getByLabelText(/phone number/i), '1234567890')
      await user.type(screen.getByLabelText(/your address/i), '123 Main Street')
      await user.type(screen.getByLabelText(/city/i), 'New York')
      await user.type(screen.getByLabelText(/zip code/i), '12345')
      await user.type(screen.getByLabelText(/country/i), 'United States')

      // Select e-Money payment
      await user.click(screen.getByLabelText(/e-money/i))

      // Try to submit without e-Money fields
      const submitButton = screen.getByRole('button', { name: /continue & pay/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/e-money number is required/i)).toBeInTheDocument()
        expect(screen.getByText(/e-money pin is required/i)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility features', () => {
    it('should have proper ARIA labels and roles', () => {
      renderCheckoutForm()

      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByRole('complementary')).toBeInTheDocument()
      expect(screen.getByLabelText(/checkout form/i)).toBeInTheDocument()
    })

    it('should announce form errors to screen readers', async () => {
      const user = userEvent.setup()
      renderCheckoutForm()

      const submitButton = screen.getByRole('button', { name: /continue & pay/i })
      await user.click(submitButton)

      await waitFor(() => {
        const errorAlert = screen.getByRole('alert')
        expect(errorAlert).toBeInTheDocument()
        expect(errorAlert).toHaveTextContent(/form validation errors/i)
      })
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      renderCheckoutForm()

      const nameInput = screen.getByLabelText(/full name/i)
      const emailInput = screen.getByLabelText(/email address/i)

      await user.tab()
      expect(nameInput).toHaveFocus()

      await user.tab()
      expect(emailInput).toHaveFocus()
    })
  })

  describe('Performance considerations', () => {
    it('should not re-render unnecessarily', () => {
      const renderSpy = vi.fn()
      
      const TestComponent = () => {
        renderSpy()
        return <CheckoutForm />
      }

      const { rerender } = render(<TestComponent />)

      const initialRenderCount = renderSpy.mock.calls.length

      // Re-render with same props
      rerender(<TestComponent />)

      // Should not cause unnecessary re-renders
      expect(renderSpy.mock.calls.length).toBe(initialRenderCount)
    })
  })
})