import '@testing-library/jest-dom'
import React from 'react'

// Mock Next.js router
const mockPush = vi.fn()
const mockReplace = vi.fn()
const mockBack = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
    pathname: '/checkout',
    query: {},
  }),
  usePathname: () => '/checkout',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => {
    return React.createElement('img', { src, alt, ...props })
  },
}))

// Mock Convex
vi.mock('convex/react', () => ({
  useMutation: () => vi.fn(),
  useQuery: () => undefined,
}))

// Mock performance monitor
vi.mock('@/lib/performanceMonitor', () => ({
  usePerformanceMonitor: () => ({
    record: vi.fn(),
    start: vi.fn(),
    end: vi.fn(),
  }),
  checkoutPerformanceMonitor: {
    start: vi.fn(),
    end: vi.fn(),
    record: vi.fn(),
  },
}))

// Mock session storage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
})

// Mock fetch
global.fetch = vi.fn()

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
  mockPush.mockClear()
  mockReplace.mockClear()
  mockBack.mockClear()
})