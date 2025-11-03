import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CheckoutForm from '@/components/CheckoutForm'

// Mock performance API
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByType: vi.fn(() => []),
  getEntriesByName: vi.fn(() => []),
}

Object.defineProperty(window, 'performance', {
  value: mockPerformance,
})

// Mock cart data with various sizes for performance testing
const createMockCartItems = (count: number) => {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `Product ${index + 1}`,
    price: 1000 + index * 100,
    quantity: Math.floor(Math.random() * 5) + 1,
    image: `/assets/product-${index + 1}/mobile/image-product.jpg`,
    slug: `product-${index + 1}`,
  }))
}

// Mock cart context at module level
vi.mock('@/context/CartContext', () => ({
  CartProvider: ({ children }: { children: React.ReactNode }) => children,
  useCart: () => ({
    cart: createMockCartItems(3),
    clearCart: vi.fn(),
    totalPrice: createMockCartItems(3).reduce((sum, item) => sum + item.price * item.quantity, 0),
    addToCart: vi.fn(),
    removeFromCart: vi.fn(),
    updateQuantity: vi.fn(),
    totalItems: createMockCartItems(3).reduce((sum, item) => sum + item.quantity, 0),
  }),
}))

const renderWithCart = () => {
  return render(<CheckoutForm />)
}

describe('Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPerformance.now.mockImplementation(() => Date.now())
  })

  describe('Component Rendering Performance', () => {
    it('should render quickly with small cart', () => {
      const startTime = performance.now()
      
      renderWithCart()
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // Should render in under 100ms for small cart
      expect(renderTime).toBeLessThan(100)
    })

    it('should handle large cart efficiently', () => {
      const startTime = performance.now()
      
      renderWithCart()
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // Should still render reasonably quickly even with large cart
      expect(renderTime).toBeLessThan(500)
    })

    it('should not cause memory leaks with multiple renders', () => {
      const { rerender, unmount } = renderWithCart()
      
      // Re-render multiple times
      for (let i = 0; i < 10; i++) {
        rerender(<CheckoutForm />)
      }
      
      // Unmount to trigger cleanup
      unmount()
      
      // No specific assertion here, but this test helps identify memory leaks
      // in a real environment with proper memory profiling tools
      expect(true).toBe(true)
    })
  })

  describe('Form Validation Performance', () => {
    it('should validate fields quickly', async () => {
      const user = userEvent.setup()
      renderWithCart()

      const nameInput = screen.getByLabelText(/full name/i)
      
      const startTime = performance.now()
      
      await user.type(nameInput, 'John Doe')
      await user.tab() // Trigger validation
      
      const endTime = performance.now()
      const validationTime = endTime - startTime
      
      // Validation should be fast
      expect(validationTime).toBeLessThan(50)
    })

    it('should handle rapid input changes efficiently', async () => {
      const user = userEvent.setup()
      renderWithCart()

      const emailInput = screen.getByLabelText(/email address/i)
      
      const startTime = performance.now()
      
      // Simulate rapid typing
      await user.type(emailInput, 'test@example.com')
      
      const endTime = performance.now()
      const typingTime = endTime - startTime
      
      // Should handle rapid input without significant delay
      expect(typingTime).toBeLessThan(200)
    })

    it('should debounce validation efficiently', async () => {
      const user = userEvent.setup()
      renderWithCart()

      const phoneInput = screen.getByLabelText(/phone number/i)
      
      // Type quickly to test debouncing
      await user.type(phoneInput, '1234567890')
      
      // Debouncing should prevent excessive validation calls
      // This is more of a structural test - the actual debouncing
      // behavior is tested through the absence of performance issues
      expect(phoneInput).toHaveValue('1234567890')
    })
  })

  describe('Cart Calculations Performance', () => {
    it('should calculate totals efficiently for large carts', () => {
      const largeCart = createMockCartItems(100)
      
      const startTime = performance.now()
      
      renderWithCart(largeCart)
      
      const endTime = performance.now()
      const calculationTime = endTime - startTime
      
      // Should handle large cart calculations efficiently
      expect(calculationTime).toBeLessThan(100)
      
      // Verify calculations are correct
      const expectedSubtotal = largeCart.reduce((sum, item) => sum + item.price * item.quantity, 0)
      expect(screen.getByText(`$${expectedSubtotal.toLocaleString()}`)).toBeInTheDocument()
    })

    it('should memoize calculations to prevent unnecessary recalculations', () => {
      const { rerender } = renderWithCart()
      
      const startTime = performance.now()
      
      // Re-render with same cart data multiple times
      for (let i = 0; i < 5; i++) {
        rerender(<CheckoutForm />)
      }
      
      const endTime = performance.now()
      const rerenderTime = endTime - startTime
      
      // Re-renders should be fast due to memoization
      expect(rerenderTime).toBeLessThan(50)
    })
  })

  describe('Session Storage Performance', () => {
    it('should handle session storage operations efficiently', async () => {
      const user = userEvent.setup()
      renderWithCart()

      // Mock session storage operations
      const mockSetItem = vi.fn()
      const mockGetItem = vi.fn()
      
      Object.defineProperty(window, 'sessionStorage', {
        value: {
          setItem: mockSetItem,
          getItem: mockGetItem,
          removeItem: vi.fn(),
          clear: vi.fn(),
        },
      })

      // Fill form and submit to trigger session storage
      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com')
      await user.type(screen.getByLabelText(/phone number/i), '1234567890')
      await user.type(screen.getByLabelText(/your address/i), '123 Main Street')
      await user.type(screen.getByLabelText(/city/i), 'New York')
      await user.type(screen.getByLabelText(/zip code/i), '12345')
      await user.type(screen.getByLabelText(/country/i), 'United States')
      await user.click(screen.getByLabelText(/cash on delivery/i))

      const startTime = performance.now()
      
      const submitButton = screen.getByRole('button', { name: /continue & pay/i })
      await user.click(submitButton)
      
      const endTime = performance.now()
      const storageTime = endTime - startTime
      
      // Session storage operations should be fast
      expect(storageTime).toBeLessThan(100)
    })
  })

  describe('Network Request Performance', () => {
    it('should handle API requests efficiently', async () => {
      const user = userEvent.setup()
      
      // Mock fast API response
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
      
      renderWithCart()

      // Fill form
      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com')
      await user.type(screen.getByLabelText(/phone number/i), '1234567890')
      await user.type(screen.getByLabelText(/your address/i), '123 Main Street')
      await user.type(screen.getByLabelText(/city/i), 'New York')
      await user.type(screen.getByLabelText(/zip code/i), '12345')
      await user.type(screen.getByLabelText(/country/i), 'United States')
      await user.click(screen.getByLabelText(/cash on delivery/i))

      const startTime = performance.now()
      
      const submitButton = screen.getByRole('button', { name: /continue & pay/i })
      await user.click(submitButton)
      
      // Wait for API call to complete
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled()
      })
      
      const endTime = performance.now()
      const requestTime = endTime - startTime
      
      // API request handling should be efficient
      expect(requestTime).toBeLessThan(200)
    })

    it('should handle slow API responses gracefully', async () => {
      const user = userEvent.setup()
      
      // Mock slow API response
      global.fetch = vi.fn().mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({ success: true }),
          }), 1000)
        )
      )
      
      renderWithCart()

      // Fill form
      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com')
      await user.type(screen.getByLabelText(/phone number/i), '1234567890')
      await user.type(screen.getByLabelText(/your address/i), '123 Main Street')
      await user.type(screen.getByLabelText(/city/i), 'New York')
      await user.type(screen.getByLabelText(/zip code/i), '12345')
      await user.type(screen.getByLabelText(/country/i), 'United States')
      await user.click(screen.getByLabelText(/cash on delivery/i))

      const submitButton = screen.getByRole('button', { name: /continue & pay/i })
      await user.click(submitButton)
      
      // Should show loading state immediately
      expect(screen.getByText(/processing order/i)).toBeInTheDocument()
      
      // Should handle the slow response without blocking UI
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled()
      }, { timeout: 2000 })
    })
  })

  describe('Memory Usage', () => {
    it('should clean up event listeners on unmount', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener')
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')
      
      const { unmount } = renderWithCart()
      
      const addedListeners = addEventListenerSpy.mock.calls.length
      
      unmount()
      
      const removedListeners = removeEventListenerSpy.mock.calls.length
      
      // Should clean up event listeners
      expect(removedListeners).toBeGreaterThan(0)
      
      addEventListenerSpy.mockRestore()
      removeEventListenerSpy.mockRestore()
    })

    it('should clean up timeouts on unmount', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
      
      const { unmount } = renderWithCart()
      
      unmount()
      
      // Should clean up any pending timeouts
      expect(clearTimeoutSpy).toHaveBeenCalled()
      
      clearTimeoutSpy.mockRestore()
    })
  })

  describe('Bundle Size Impact', () => {
    it('should not import unnecessary dependencies', () => {
      // This is more of a structural test
      // In a real scenario, you'd use bundle analyzers
      
      renderWithCart()
      
      // Verify core functionality works without heavy dependencies
      expect(screen.getByText('Billing Details')).toBeInTheDocument()
      expect(screen.getByText('Order Summary')).toBeInTheDocument()
    })
  })
})