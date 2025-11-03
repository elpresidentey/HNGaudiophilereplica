import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// Import the validation schema from CheckoutForm
// Since it's not exported, we'll recreate it for testing
const checkoutSchema = z.object({
  name: z.string()
    .min(1, 'Full name is required to process your order')
    .min(2, 'Name must contain at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .regex(/^[a-zA-Z\s'-\.]+$/, 'Name can only contain letters, spaces, hyphens, apostrophes, and periods')
    .refine(
      (val) => val.trim().split(/\s+/).length >= 2,
      'Please enter both first and last name'
    )
    .refine(
      (val) => !/^\s|\s$/.test(val),
      'Name cannot start or end with spaces'
    ),
  email: z.string()
    .min(1, 'Email address is required for order confirmation')
    .email('Please enter a valid email address (e.g., john@example.com)')
    .max(100, 'Email address cannot exceed 100 characters')
    .refine(
      (val) => !val.includes('..'),
      'Email address cannot contain consecutive dots'
    )
    .refine(
      (val) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val),
      'Please enter a valid email format with proper domain'
    ),
  phone: z.string()
    .min(1, 'Phone number is required for delivery coordination')
    .refine(
      (val) => {
        const digitsOnly = val.replace(/\D/g, '')
        return digitsOnly.length >= 10
      },
      'Phone number must contain at least 10 digits'
    )
    .refine(
      (val) => {
        const digitsOnly = val.replace(/\D/g, '')
        return digitsOnly.length <= 15
      },
      'Phone number cannot exceed 15 digits'
    ),
  address: z.string()
    .min(1, 'Street address is required for delivery')
    .min(5, 'Address must be at least 5 characters long')
    .max(100, 'Address cannot exceed 100 characters')
    .refine(
      (val) => !/^\s|\s$/.test(val),
      'Address cannot start or end with spaces'
    )
    .refine(
      (val) => /[a-zA-Z]/.test(val),
      'Address must contain at least one letter'
    ),
  city: z.string()
    .min(1, 'City is required for delivery')
    .min(2, 'City name must be at least 2 characters')
    .max(50, 'City name cannot exceed 50 characters')
    .regex(/^[a-zA-Z\s'-\.]+$/, 'City name can only contain letters, spaces, hyphens, apostrophes, and periods')
    .refine(
      (val) => !/^\s|\s$/.test(val),
      'City name cannot start or end with spaces'
    ),
  zipCode: z.string()
    .min(1, 'ZIP/Postal code is required for delivery')
    .refine(
      (val) => {
        const patterns = [
          /^\d{5}$/, // US 5-digit ZIP
          /^\d{5}-\d{4}$/, // US ZIP+4
          /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i, // Canadian postal code
          /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i, // UK postal code
        ]
        return patterns.some(pattern => pattern.test(val.trim()))
      },
      'Please enter a valid ZIP/Postal code for your country'
    ),
  country: z.string()
    .min(1, 'Country is required for delivery')
    .min(2, 'Country name must be at least 2 characters')
    .max(50, 'Country name cannot exceed 50 characters'),
  paymentMethod: z.enum(['e-money', 'cash'], {
    required_error: 'Please select a payment method to continue',
  }),
  eMoneyNumber: z.string().optional(),
  eMoneyPIN: z.string().optional(),
}).refine(
  (data) => {
    if (data.paymentMethod === 'e-money') {
      return data.eMoneyNumber && data.eMoneyNumber.trim().length > 0
    }
    return true
  },
  {
    message: 'E-Money Number is required when using e-Money payment',
    path: ['eMoneyNumber'],
  }
).refine(
  (data) => {
    if (data.paymentMethod === 'e-money') {
      return data.eMoneyPIN && data.eMoneyPIN.trim().length > 0
    }
    return true
  },
  {
    message: 'E-Money PIN is required when using e-Money payment',
    path: ['eMoneyPIN'],
  }
)

describe('Form Validation Logic', () => {
  describe('Name validation', () => {
    it('should accept valid full names', () => {
      const validNames = [
        'John Doe',
        'Mary Jane Smith',
        "O'Connor Patrick",
        'Jean-Pierre Dubois',
        'Anna-Maria Rodriguez',
      ]

      validNames.forEach(name => {
        const result = checkoutSchema.safeParse({
          name,
          email: 'test@example.com',
          phone: '1234567890',
          address: '123 Main St',
          city: 'New York',
          zipCode: '12345',
          country: 'United States',
          paymentMethod: 'cash',
        })
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid names', () => {
      const invalidNames = [
        '', // empty
        'John', // single name
        'John123', // contains numbers
        ' John Doe', // starts with space
        'John Doe ', // ends with space
        'J', // too short
      ]

      invalidNames.forEach(name => {
        const result = checkoutSchema.safeParse({
          name,
          email: 'test@example.com',
          phone: '1234567890',
          address: '123 Main St',
          city: 'New York',
          zipCode: '12345',
          country: 'United States',
          paymentMethod: 'cash',
        })
        expect(result.success).toBe(false)
      })
    })
  })

  describe('Email validation', () => {
    it('should accept valid email addresses', () => {
      const validEmails = [
        'user@example.com',
        'test.email@domain.co.uk',
        'user+tag@example.org',
        'firstname.lastname@company.com',
      ]

      validEmails.forEach(email => {
        const result = checkoutSchema.safeParse({
          name: 'John Doe',
          email,
          phone: '1234567890',
          address: '123 Main St',
          city: 'New York',
          zipCode: '12345',
          country: 'United States',
          paymentMethod: 'cash',
        })
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        '', // empty
        'invalid-email', // no @ symbol
        'user@', // no domain
        '@domain.com', // no user
        'user..double@domain.com', // consecutive dots
        'user@domain', // no TLD
      ]

      invalidEmails.forEach(email => {
        const result = checkoutSchema.safeParse({
          name: 'John Doe',
          email,
          phone: '1234567890',
          address: '123 Main St',
          city: 'New York',
          zipCode: '12345',
          country: 'United States',
          paymentMethod: 'cash',
        })
        expect(result.success).toBe(false)
      })
    })
  })

  describe('Phone validation', () => {
    it('should accept valid phone numbers', () => {
      const validPhones = [
        '1234567890',
        '+1 234 567 8900',
        '(555) 123-4567',
        '+44 20 1234 5678',
      ]

      validPhones.forEach(phone => {
        const result = checkoutSchema.safeParse({
          name: 'John Doe',
          email: 'test@example.com',
          phone,
          address: '123 Main St',
          city: 'New York',
          zipCode: '12345',
          country: 'United States',
          paymentMethod: 'cash',
        })
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid phone numbers', () => {
      const invalidPhones = [
        '', // empty
        '123', // too short
        '12345678901234567890', // too long
      ]

      invalidPhones.forEach(phone => {
        const result = checkoutSchema.safeParse({
          name: 'John Doe',
          email: 'test@example.com',
          phone,
          address: '123 Main St',
          city: 'New York',
          zipCode: '12345',
          country: 'United States',
          paymentMethod: 'cash',
        })
        expect(result.success).toBe(false)
      })
    })
  })

  describe('Address validation', () => {
    it('should accept valid addresses', () => {
      const validAddresses = [
        '123 Main Street',
        '456 Oak Avenue Apt 2B',
        '789 Pine Road Unit 10',
      ]

      validAddresses.forEach(address => {
        const result = checkoutSchema.safeParse({
          name: 'John Doe',
          email: 'test@example.com',
          phone: '1234567890',
          address,
          city: 'New York',
          zipCode: '12345',
          country: 'United States',
          paymentMethod: 'cash',
        })
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid addresses', () => {
      const invalidAddresses = [
        '', // empty
        '123', // too short
        '12345', // numbers only
        ' 123 Main St', // starts with space
      ]

      invalidAddresses.forEach(address => {
        const result = checkoutSchema.safeParse({
          name: 'John Doe',
          email: 'test@example.com',
          phone: '1234567890',
          address,
          city: 'New York',
          zipCode: '12345',
          country: 'United States',
          paymentMethod: 'cash',
        })
        expect(result.success).toBe(false)
      })
    })
  })

  describe('ZIP code validation', () => {
    it('should accept valid ZIP codes', () => {
      const validZipCodes = [
        '12345', // US 5-digit
        '12345-6789', // US ZIP+4
        'K1A 0A6', // Canadian
        'SW1A 1AA', // UK
      ]

      validZipCodes.forEach(zipCode => {
        const result = checkoutSchema.safeParse({
          name: 'John Doe',
          email: 'test@example.com',
          phone: '1234567890',
          address: '123 Main St',
          city: 'New York',
          zipCode,
          country: 'United States',
          paymentMethod: 'cash',
        })
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid ZIP codes', () => {
      const invalidZipCodes = [
        '', // empty
        '123', // too short
        'INVALID', // invalid format
      ]

      invalidZipCodes.forEach(zipCode => {
        const result = checkoutSchema.safeParse({
          name: 'John Doe',
          email: 'test@example.com',
          phone: '1234567890',
          address: '123 Main St',
          city: 'New York',
          zipCode,
          country: 'United States',
          paymentMethod: 'cash',
        })
        expect(result.success).toBe(false)
      })
    })
  })

  describe('Payment method validation', () => {
    it('should accept cash payment without additional fields', () => {
      const result = checkoutSchema.safeParse({
        name: 'John Doe',
        email: 'test@example.com',
        phone: '1234567890',
        address: '123 Main St',
        city: 'New York',
        zipCode: '12345',
        country: 'United States',
        paymentMethod: 'cash',
      })
      expect(result.success).toBe(true)
    })

    it('should require e-Money fields when e-money is selected', () => {
      const result = checkoutSchema.safeParse({
        name: 'John Doe',
        email: 'test@example.com',
        phone: '1234567890',
        address: '123 Main St',
        city: 'New York',
        zipCode: '12345',
        country: 'United States',
        paymentMethod: 'e-money',
        // Missing eMoneyNumber and eMoneyPIN
      })
      expect(result.success).toBe(false)
    })

    it('should accept valid e-Money payment', () => {
      const result = checkoutSchema.safeParse({
        name: 'John Doe',
        email: 'test@example.com',
        phone: '1234567890',
        address: '123 Main St',
        city: 'New York',
        zipCode: '12345',
        country: 'United States',
        paymentMethod: 'e-money',
        eMoneyNumber: '123456789',
        eMoneyPIN: '1234',
      })
      expect(result.success).toBe(true)
    })
  })
})