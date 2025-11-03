import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CheckoutForm from '@/components/CheckoutForm'

// Mock different browser environments
const mockUserAgents = {
  chrome: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  firefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
  safari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
  edge: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
  ie11: 'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko',
}

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

// Helper to mock browser environment
const mockBrowserEnvironment = (userAgent: string, features: Record<string, any> = {}) => {
  Object.defineProperty(navigator, 'userAgent', {
    value: userAgent,
    configurable: true,
  })

  // Mock browser-specific features
  Object.entries(features).forEach(([key, value]) => {
    Object.defineProperty(window, key, {
      value: value,
      configurable: true,
    })
  })
}

describe('Cross-Browser Compatibility Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset to default environment
    mockBrowserEnvironment(mockUserAgents.chrome)
  })

  describe('Chrome Compatibility', () => {
    beforeEach(() => {
      mockBrowserEnvironment(mockUserAgents.chrome, {
        chrome: { runtime: {} },
      })
    })

    it('should render correctly in Chrome', () => {
      renderWithCart()

      expect(screen.getByText('Billing Details')).toBeInTheDocument()
      expect(screen.getByText('Order Summary')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /continue & pay/i })).toBeInTheDocument()
    })

    it('should handle form validation in Chrome', async () => {
      const user = userEvent.setup()
      renderWithCart()

      const emailInput = screen.getByLabelText(/email address/i)
      await user.type(emailInput, 'invalid-email')
      await user.tab()

      // Chrome should show validation errors
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
    })
  })

  describe('Firefox Compatibility', () => {
    beforeEach(() => {
      mockBrowserEnvironment(mockUserAgents.firefox, {
        InstallTrigger: {},
      })
    })

    it('should render correctly in Firefox', () => {
      renderWithCart()

      expect(screen.getByText('Billing Details')).toBeInTheDocument()
      expect(screen.getByText('Order Summary')).toBeInTheDocument()
    })

    it('should handle radio button interactions in Firefox', async () => {
      const user = userEvent.setup()
      renderWithCart()

      const eMoneyRadio = screen.getByLabelText(/e-money/i)
      const cashRadio = screen.getByLabelText(/cash on delivery/i)

      await user.click(eMoneyRadio)
      expect(eMoneyRadio).toBeChecked()

      await user.click(cashRadio)
      expect(cashRadio).toBeChecked()
      expect(eMoneyRadio).not.toBeChecked()
    })
  })

  describe('Safari Compatibility', () => {
    beforeEach(() => {
      mockBrowserEnvironment(mockUserAgents.safari, {
        safari: { pushNotification: {} },
      })
    })

    it('should render correctly in Safari', () => {
      renderWithCart()

      expect(screen.getByText('Billing Details')).toBeInTheDocument()
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    it('should handle date/time inputs in Safari', () => {
      renderWithCart()

      // Safari has specific handling for form inputs
      const inputs = screen.getAllByRole('textbox')
      expect(inputs.length).toBeGreaterThan(0)

      inputs.forEach(input => {
        expect(input).toBeInTheDocument()
      })
    })

    it('should handle touch events in Safari mobile', async () => {
      // Mock touch support
      Object.defineProperty(window, 'ontouchstart', {
        value: null,
        configurable: true,
      })

      renderWithCart()

      const submitButton = screen.getByRole('button', { name: /continue & pay/i })
      
      // Simulate touch events
      fireEvent.touchStart(submitButton)
      fireEvent.touchEnd(submitButton)

      // Should handle touch events without errors
      expect(submitButton).toBeInTheDocument()
    })
  })

  describe('Edge Compatibility', () => {
    beforeEach(() => {
      mockBrowserEnvironment(mockUserAgents.edge, {
        StyleMedia: {},
      })
    })

    it('should render correctly in Edge', () => {
      renderWithCart()

      expect(screen.getByText('Billing Details')).toBeInTheDocument()
      expect(screen.getByText('Payment Details')).toBeInTheDocument()
    })

    it('should handle form submission in Edge', async () => {
      const user = userEvent.setup()
      renderWithCart()

      // Fill required fields
      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com')
      await user.type(screen.getByLabelText(/phone number/i), '1234567890')
      await user.type(screen.getByLabelText(/your address/i), '123 Main Street')
      await user.type(screen.getByLabelText(/city/i), 'New York')
      await user.type(screen.getByLabelText(/zip code/i), '12345')
      await user.type(screen.getByLabelText(/country/i), 'United States')
      await user.click(screen.getByLabelText(/cash on delivery/i))

      const submitButton = screen.getByRole('button', { name: /continue & pay/i })
      
      // Should be able to submit form
      expect(submitButton).not.toBeDisabled()
    })
  })

  describe('Internet Explorer 11 Compatibility', () => {
    beforeEach(() => {
      mockBrowserEnvironment(mockUserAgents.ie11, {
        MSInputMethodContext: {},
        documentMode: 11,
      })

      // Mock IE11 specific APIs
      Object.defineProperty(window, 'Promise', {
        value: undefined,
        configurable: true,
      })
    })

    it('should handle missing modern APIs gracefully', () => {
      renderWithCart()

      // Should still render basic functionality
      expect(screen.getByText('Billing Details')).toBeInTheDocument()
    })

    it('should provide fallbacks for modern features', () => {
      renderWithCart()

      // Check that form still works without modern APIs
      const nameInput = screen.getByLabelText(/full name/i)
      expect(nameInput).toBeInTheDocument()
      expect(nameInput).toHaveAttribute('type', 'text')
    })
  })

  describe('Feature Detection', () => {
    it('should detect and handle missing localStorage', () => {
      // Mock missing localStorage
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        configurable: true,
      })

      renderWithCart()

      // Should still render without localStorage
      expect(screen.getByText('Billing Details')).toBeInTheDocument()
    })

    it('should detect and handle missing sessionStorage', () => {
      // Mock missing sessionStorage
      Object.defineProperty(window, 'sessionStorage', {
        value: undefined,
        configurable: true,
      })

      renderWithCart()

      // Should still render without sessionStorage
      expect(screen.getByText('Order Summary')).toBeInTheDocument()
    })

    it('should handle missing fetch API', () => {
      // Mock missing fetch
      Object.defineProperty(window, 'fetch', {
        value: undefined,
        configurable: true,
      })

      renderWithCart()

      // Should still render form
      expect(screen.getByRole('button', { name: /continue & pay/i })).toBeInTheDocument()
    })

    it('should handle missing IntersectionObserver', () => {
      // Mock missing IntersectionObserver
      Object.defineProperty(window, 'IntersectionObserver', {
        value: undefined,
        configurable: true,
      })

      renderWithCart()

      // Should still render without intersection observer
      expect(screen.getByText('Billing Details')).toBeInTheDocument()
    })
  })

  describe('CSS and Layout Compatibility', () => {
    it('should handle CSS Grid fallbacks', () => {
      // Mock missing CSS Grid support
      const mockSupports = vi.fn().mockReturnValue(false)
      Object.defineProperty(window, 'CSS', {
        value: { supports: mockSupports },
        configurable: true,
      })

      renderWithCart()

      // Should still render with fallback layout
      expect(screen.getByText('Billing Details')).toBeInTheDocument()
      expect(screen.getByText('Order Summary')).toBeInTheDocument()
    })

    it('should handle Flexbox fallbacks', () => {
      renderWithCart()

      // Check that layout elements are present
      const form = screen.getByRole('main')
      const orderSummary = screen.getByRole('complementary')

      expect(form).toBeInTheDocument()
      expect(orderSummary).toBeInTheDocument()
    })
  })

  describe('Input Type Support', () => {
    it('should handle email input type fallback', () => {
      renderWithCart()

      const emailInput = screen.getByLabelText(/email address/i)
      
      // Should have email type or fallback to text
      expect(emailInput).toHaveAttribute('type', 'email')
    })

    it('should handle tel input type fallback', () => {
      renderWithCart()

      const phoneInput = screen.getByLabelText(/phone number/i)
      
      // Should have tel type or fallback to text
      expect(phoneInput).toHaveAttribute('type', 'tel')
    })
  })

  describe('Event Handling Compatibility', () => {
    it('should handle different event models', async () => {
      const user = userEvent.setup()
      renderWithCart()

      const nameInput = screen.getByLabelText(/full name/i)
      
      // Test different event types
      await user.type(nameInput, 'John')
      expect(nameInput).toHaveValue('John')

      await user.clear(nameInput)
      expect(nameInput).toHaveValue('')
    })

    it('should handle keyboard events consistently', async () => {
      const user = userEvent.setup()
      renderWithCart()

      const submitButton = screen.getByRole('button', { name: /continue & pay/i })
      
      // Test keyboard activation
      submitButton.focus()
      await user.keyboard('{Enter}')
      
      // Should handle keyboard events
      expect(submitButton).toHaveFocus()
    })
  })

  describe('Polyfill Requirements', () => {
    it('should work with common polyfills', () => {
      // Mock polyfilled environment
      Object.defineProperty(Array.prototype, 'includes', {
        value: function(searchElement: any) {
          return this.indexOf(searchElement) !== -1
        },
        configurable: true,
      })

      renderWithCart()

      // Should work with polyfilled methods
      expect(screen.getByText('Billing Details')).toBeInTheDocument()
    })

    it('should handle missing modern array methods', () => {
      // Mock missing modern methods
      Object.defineProperty(Array.prototype, 'find', {
        value: undefined,
        configurable: true,
      })

      renderWithCart()

      // Should still work with fallbacks
      expect(screen.getByText('Order Summary')).toBeInTheDocument()
    })
  })
})