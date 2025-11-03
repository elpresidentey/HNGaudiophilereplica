# Checkout System Development Documentation

## Overview

This document provides comprehensive development documentation for the Audiophile e-commerce checkout system. The system is built with Next.js 13+, React, TypeScript, and integrates with Convex for backend storage and Resend for email delivery.

## Table of Contents

1. [Component APIs and Interfaces](#component-apis-and-interfaces)
2. [Validation Logic Documentation](#validation-logic-documentation)
3. [Troubleshooting Guide](#troubleshooting-guide)
4. [Email Template Customization](#email-template-customization)
5. [Deployment and Environment Setup](#deployment-and-environment-setup)

---

## Component APIs and Interfaces

### CheckoutForm Component

**Location**: `components/CheckoutForm.tsx`

**Purpose**: Main checkout interface handling user input, validation, and order submission.

#### Props Interface
```typescript
// CheckoutForm takes no props - uses cart context and internal state
interface CheckoutFormProps {}
```

#### Key Features
- Multi-section form layout (Billing, Shipping, Payment)
- Real-time validation with inline error messages
- Payment method selection (e-Money vs Cash on Delivery)
- Order summary sidebar with cart items and totals
- Accessibility compliance with ARIA labels and screen reader support
- Responsive design matching Figma specifications
- Performance monitoring and optimization

#### Internal State Management
```typescript
interface CheckoutFormState {
  isSubmitting: boolean
  error: string | null
  announceMessage: string
  isClient: boolean
  retryCount: number
  networkError: boolean
  emailError: boolean
  submissionAttempted: boolean
  isValidating: boolean
  formLoadTime: number
  performanceMetrics: Record<string, number>
  fieldValidationStates: Record<string, 'idle' | 'validating' | 'valid' | 'invalid'>
  validationTimeouts: Record<string, NodeJS.Timeout>
}
```

#### Key Methods
- `trackPerformance(metric: string, startTime?: number)`: Performance monitoring utility
- `handleFieldValidation(fieldName: keyof CheckoutFormData, immediate?: boolean)`: Field-level validation
- `debouncedValidation(fieldName: keyof CheckoutFormData, delay?: number)`: Optimized validation with smart delays
- `retryOperation(operation: () => Promise<any>, maxRetries?: number, operationName?: string)`: Enhanced retry mechanism
- `onSubmit(data: CheckoutFormData)`: Main form submission handler

#### Accessibility Features
- ARIA labels and descriptions for all form fields
- Screen reader announcements for validation errors
- Keyboard navigation support (Alt+M, Alt+S, Ctrl+Enter shortcuts)
- Focus management for error states
- Semantic HTML structure with proper headings

### Order Confirmation Page

**Location**: `app/checkout/confirmation/page.tsx`

**Purpose**: Displays comprehensive order confirmation after successful checkout.

#### URL Parameters
```typescript
interface ConfirmationParams {
  orderId: string // Order ID from successful checkout
}
```

#### Key Features
- Order details retrieval from sessionStorage
- Complete order summary with items, pricing, and customer details
- Responsive layout with success indicators
- Fallback handling for missing order data
- Performance monitoring for page load times

### Cart Context

**Location**: `context/CartContext.tsx`

**Purpose**: Global state management for shopping cart functionality.

#### Interface
```typescript
interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image: string
  slug: string
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeFromCart: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}
```

#### Performance Optimizations
- Memoized calculations to prevent unnecessary recalculations
- useCallback for cart operations to prevent re-renders
- Performance monitoring for all cart operations

### Email API Route

**Location**: `app/api/send-email/route.ts`

**Purpose**: Handles sending order confirmation emails via Resend API.

#### Request Interface
```typescript
interface EmailRequest {
  email: string
  name: string
  orderId: string
  items: CartItem[]
  total: number
  shipping: number
  subtotal: number
  tax: number
  address: string
  city: string
  country: string
  zipCode: string
}
```

#### Response Interface
```typescript
interface EmailResponse {
  success: boolean
  data?: any
  message?: string
  error?: string
}
```

### Performance Monitor

**Location**: `lib/performanceMonitor.ts`

**Purpose**: Comprehensive performance monitoring for checkout flow.

#### Interface
```typescript
interface PerformanceMetric {
  name: string
  duration: number
  timestamp: number
  metadata?: Record<string, any>
}

class PerformanceMonitor {
  start(metricName: string, metadata?: Record<string, any>): void
  end(metricName: string, additionalMetadata?: Record<string, any>): number
  record(metricName: string, duration: number, metadata?: Record<string, any>): void
  getMetrics(): PerformanceMetric[]
  getSummary(): Record<string, { count: number; avgDuration: number; totalDuration: number; maxDuration: number }>
  getPerformanceIssues(thresholds?: Record<string, number>): PerformanceMetric[]
  getCheckoutInsights(): CheckoutInsights
}
```

---

## Validation Logic Documentation

### Form Validation Schema

The checkout system uses Zod for comprehensive form validation with the following schema structure:

#### Customer Information Validation
```typescript
// Name validation with multiple refinements
name: z.string()
  .min(1, 'Full name is required to process your order')
  .min(2, 'Name must contain at least 2 characters')
  .max(50, 'Name cannot exceed 50 characters')
  .regex(/^[a-zA-Z\s'-\.]+$/, 'Name can only contain letters, spaces, hyphens, apostrophes, and periods')
  .refine(val => val.trim().split(/\s+/).length >= 2, 'Please enter both first and last name')
  .refine(val => !/^\s|\s$/.test(val), 'Name cannot start or end with spaces')
```

#### Email Validation
```typescript
// Enhanced email validation with multiple checks
email: z.string()
  .min(1, 'Email address is required for order confirmation')
  .email('Please enter a valid email address (e.g., john@example.com)')
  .max(100, 'Email address cannot exceed 100 characters')
  .refine(val => !val.includes('..'), 'Email address cannot contain consecutive dots')
  .refine(val => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val), 'Please enter a valid email format with proper domain')
```

#### Phone Number Validation
```typescript
// International phone number validation with multiple format support
phone: z.string()
  .min(1, 'Phone number is required for delivery coordination')
  .refine(val => {
    const digitsOnly = val.replace(/\D/g, '')
    return digitsOnly.length >= 10 && digitsOnly.length <= 15
  }, 'Phone number must contain 10-15 digits')
  .refine(val => {
    // Support for multiple international formats
    const patterns = [
      /^\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/, // US/Canada
      /^\+?[1-9]\d{1,14}$/, // International E.164
      /^\+?[\d\s\-\(\)\.]{10,20}$/, // General international
      // Additional country-specific patterns...
    ]
    return patterns.some(pattern => pattern.test(val))
  }, 'Please enter a valid phone number')
```

#### Address Validation
```typescript
// Comprehensive address validation
address: z.string()
  .min(1, 'Street address is required for delivery')
  .min(5, 'Address must be at least 5 characters long')
  .max(100, 'Address cannot exceed 100 characters')
  .refine(val => !/^\s|\s$/.test(val), 'Address cannot start or end with spaces')
  .refine(val => /[a-zA-Z]/.test(val), 'Address must contain at least one letter')
  .refine(val => !/^\d+$/.test(val.trim()), 'Address must contain more than just numbers')
```

#### ZIP/Postal Code Validation
```typescript
// Multi-country ZIP/postal code validation
zipCode: z.string()
  .min(1, 'ZIP/Postal code is required for delivery')
  .refine(val => {
    const patterns = [
      /^\d{5}$/, // US 5-digit ZIP
      /^\d{5}-\d{4}$/, // US ZIP+4
      /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i, // Canadian postal code
      /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i, // UK postal code
      // Additional country patterns...
    ]
    return patterns.some(pattern => pattern.test(val.trim()))
  }, 'Please enter a valid ZIP/Postal code for your country')
```

#### Payment Method Validation
```typescript
// Conditional validation for e-Money payment
paymentMethod: z.enum(['e-money', 'cash'], {
  required_error: 'Please select a payment method to continue',
})
// Multiple refinements for e-Money fields when selected
.refine(data => {
  if (data.paymentMethod === 'e-money') {
    return data.eMoneyNumber && data.eMoneyNumber.trim().length > 0
  }
  return true
}, {
  message: 'E-Money Number is required when using e-Money payment',
  path: ['eMoneyNumber'],
})
```

### Real-time Validation Features

#### Debounced Validation
- Smart delay based on field complexity (email: 800ms, phone: 700ms, etc.)
- Prevents excessive API calls during typing
- Cleanup mechanism for pending validations

#### Visual Validation States
- `idle`: No validation performed yet
- `validating`: Validation in progress (spinner icon)
- `valid`: Field passes validation (green checkmark)
- `invalid`: Field has errors (red error icon)

#### Performance Tracking
All validation operations are monitored for performance:
```typescript
trackPerformance(`validation_${fieldName}`, startTime)
```

---

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. Form Validation Errors

**Issue**: Form shows validation errors but user input appears correct
**Symptoms**: 
- Red error messages persist after correction
- Form won't submit despite valid-looking data
- Validation state icons show incorrect status

**Solutions**:
1. Check browser console for JavaScript errors
2. Verify field values match validation patterns exactly
3. Clear browser cache and reload page
4. Check for invisible characters (copy-paste issues)

**Debug Steps**:
```javascript
// In browser console, check form state
const form = document.querySelector('form')
const formData = new FormData(form)
console.log(Object.fromEntries(formData.entries()))
```

#### 2. Email Delivery Failures

**Issue**: Orders process but confirmation emails not received
**Symptoms**:
- Order appears in confirmation page
- Email error indicator in checkout form
- Console shows email API errors

**Solutions**:
1. Verify RESEND_API_KEY environment variable is set
2. Check email address format and domain validity
3. Verify Resend service status
4. Check spam/junk folders

**Debug Steps**:
```bash
# Check environment variables
echo $RESEND_API_KEY

# Test email API directly
curl -X POST http://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","orderId":"TEST-123","items":[],"total":100}'
```

#### 3. Convex Database Connection Issues

**Issue**: Orders not saving to database
**Symptoms**:
- Checkout completes but no database record
- Console shows Convex connection errors
- Order confirmation shows "orderSaved: false"

**Solutions**:
1. Verify Convex deployment and configuration
2. Check CONVEX_DEPLOYMENT environment variable
3. Ensure ConvexProvider wraps the application
4. Verify database schema matches order structure

**Debug Steps**:
```javascript
// Check Convex connection in browser console
import { useQuery } from 'convex/react'
// Verify mutations are available
console.log(typeof createOrder) // Should be 'function'
```

#### 4. Performance Issues

**Issue**: Slow form interactions or submission
**Symptoms**:
- Delayed validation feedback
- Slow form submission
- Browser freezing during checkout

**Solutions**:
1. Check performance metrics in development mode
2. Reduce validation debounce delays if needed
3. Clear browser storage and cache
4. Disable browser extensions

**Debug Steps**:
```javascript
// Check performance metrics
const monitor = usePerformanceMonitor()
console.log(monitor.getSummary())
console.log(monitor.getPerformanceIssues())
```

#### 5. Accessibility Issues

**Issue**: Screen readers not announcing form changes
**Symptoms**:
- No audio feedback for validation errors
- Keyboard navigation not working
- Focus management problems

**Solutions**:
1. Verify ARIA labels are present and correct
2. Check aria-live regions are functioning
3. Test with actual screen reader software
4. Ensure proper heading hierarchy

**Debug Steps**:
```javascript
// Check ARIA attributes
document.querySelectorAll('[aria-live]').forEach(el => {
  console.log(el.getAttribute('aria-live'), el.textContent)
})
```

#### 6. Cart State Issues

**Issue**: Cart data inconsistencies or loss
**Symptoms**:
- Items disappear from cart
- Incorrect totals calculation
- Cart state not persisting

**Solutions**:
1. Verify CartProvider wraps components properly
2. Check for multiple CartProvider instances
3. Clear localStorage/sessionStorage
4. Verify cart operations are using callbacks correctly

**Debug Steps**:
```javascript
// Check cart context
const { cart, totalPrice } = useCart()
console.log('Cart items:', cart)
console.log('Total price:', totalPrice)
```

### Error Codes and Messages

#### Validation Error Codes
- `REQUIRED_FIELD`: Field is required but empty
- `INVALID_FORMAT`: Field format doesn't match pattern
- `LENGTH_ERROR`: Field length outside acceptable range
- `CONDITIONAL_REQUIRED`: Conditionally required field missing

#### API Error Codes
- `EMAIL_SERVICE_ERROR`: Resend API failure
- `DATABASE_ERROR`: Convex connection/save failure
- `NETWORK_ERROR`: Connection timeout or failure
- `VALIDATION_ERROR`: Server-side validation failure

#### Performance Warning Thresholds
- Form validation: >100ms
- Email sending: >3000ms
- Database save: >2000ms
- Form load: >2000ms
- Cart operations: >50ms

---

## Email Template Customization

### Template Structure

The email confirmation template is located in `app/api/send-email/route.ts` and uses responsive HTML design.

#### Template Sections
1. **Header**: Brand logo and styling
2. **Greeting**: Personalized customer greeting
3. **Order Information**: Order ID and date
4. **Order Summary**: Itemized list with quantities and prices
5. **Totals**: Subtotal, shipping, tax, and grand total
6. **Shipping Address**: Customer delivery information
7. **Footer**: Support contact and legal information

#### Customization Options

##### 1. Brand Colors and Styling
```html
<!-- Primary brand color -->
<td style="background-color: #D87D4A; ...">

<!-- Text colors -->
<h1 style="color: #ffffff; ...">audiophile</h1>
<p style="color: #4C4C4C; ...">

<!-- Accent colors -->
<span style="color: #D87D4A;">support@audiophile.com</span>
```

##### 2. Logo and Branding
```html
<!-- Replace text logo with image -->
<td style="background-color: #101010; padding: 40px; text-align: center;">
  <img src="https://your-domain.com/logo.png" alt="Audiophile" style="height: 40px;">
</td>
```

##### 3. Content Customization
```javascript
// Modify greeting message
const emailHtml = `
  <h2 style="color: #101010; margin: 0 0 20px 0; font-size: 24px;">Hi ${name},</h2>
  <p style="color: #4C4C4C; margin: 0 0 20px 0; font-size: 15px; line-height: 25px;">
    Thank you for your order! We've received your order and will begin processing it right away.
  </p>
`
```

##### 4. Order Item Display
```javascript
// Customize item display format
const itemsHtml = items.map((item: any) => `
  <tr>
    <td style="padding: 12px; border-bottom: 1px solid #eee;">
      <div style="display: flex; align-items: center;">
        <img src="${item.image}" alt="${item.name}" style="width: 40px; height: 40px; margin-right: 12px;">
        <strong>${item.name}</strong>
      </div>
    </td>
    <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
      ${item.quantity}x
    </td>
    <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
      $${(item.price * item.quantity).toLocaleString()}
    </td>
  </tr>
`).join('')
```

##### 5. Call-to-Action Buttons
```html
<!-- Add tracking or account links -->
<div style="margin: 40px 0; text-align: center;">
  <a href="https://your-domain.com/orders/${orderId}" 
     style="display: inline-block; background-color: #D87D4A; color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 0; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; font-size: 13px;">
    Track Your Order
  </a>
</div>
```

##### 6. Support Information
```html
<!-- Customize support section -->
<p style="color: #4C4C4C; margin: 30px 0 0 0; font-size: 13px; line-height: 20px;">
  If you have any questions about your order, please contact us at 
  <a href="mailto:support@audiophile.com" style="color: #D87D4A;">support@audiophile.com</a>
  or call us at <a href="tel:+1234567890" style="color: #D87D4A;">+1 (234) 567-8900</a>
</p>
```

### Email Client Compatibility

The template is designed for compatibility across major email clients:

#### Supported Clients
- Gmail (Web, iOS, Android)
- Outlook (Web, Desktop, Mobile)
- Apple Mail (macOS, iOS)
- Yahoo Mail
- Thunderbird

#### Compatibility Features
- Inline CSS for maximum compatibility
- Table-based layout for consistent rendering
- Fallback fonts and colors
- Responsive design with media queries
- Alt text for images

#### Testing Recommendations
1. Use email testing services (Litmus, Email on Acid)
2. Test across different devices and screen sizes
3. Verify dark mode compatibility
4. Check accessibility with screen readers

### Dynamic Content

#### Conditional Sections
```javascript
// Show different content based on payment method
${paymentMethod === 'cash' ? `
  <div style="background-color: #FFF3CD; border: 1px solid #FFEAA7; padding: 15px; margin: 20px 0; border-radius: 4px;">
    <p style="margin: 0; color: #856404; font-size: 14px;">
      <strong>Cash on Delivery:</strong> Please have exact change ready when our courier arrives.
    </p>
  </div>
` : ''}
```

#### Personalization
```javascript
// Add customer-specific content
const customerTier = getCustomerTier(email) // Implement based on your logic
const personalizedMessage = customerTier === 'premium' 
  ? 'As a premium customer, your order will be expedited.'
  : 'Thank you for choosing Audiophile!'
```

---

## Deployment and Environment Setup

### Environment Variables

#### Required Variables
```bash
# Resend API for email delivery
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx

# Convex backend configuration
CONVEX_DEPLOYMENT=your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Next.js configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```

#### Optional Variables
```bash
# Performance monitoring
NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true

# Debug settings
NEXT_PUBLIC_DEBUG_CHECKOUT=false

# Email configuration
EMAIL_FROM_ADDRESS=noreply@your-domain.com
EMAIL_FROM_NAME="Your Store Name"
```

### Development Setup

#### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- Convex CLI installed globally
- Resend account and API key

#### Installation Steps

1. **Clone and Install Dependencies**
```bash
git clone <repository-url>
cd checkout-system
npm install
```

2. **Environment Configuration**
```bash
# Copy environment template
cp .env.example .env.local

# Edit environment variables
nano .env.local
```

3. **Convex Setup**
```bash
# Install Convex CLI
npm install -g convex

# Initialize Convex
npx convex dev

# Deploy schema
npx convex deploy
```

4. **Development Server**
```bash
# Start development server
npm run dev

# Open browser
open http://localhost:3000
```

#### Development Tools

##### Performance Monitoring
```bash
# Enable performance monitoring in development
NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true npm run dev
```

##### Debug Mode
```bash
# Enable debug logging
NEXT_PUBLIC_DEBUG_CHECKOUT=true npm run dev
```

##### Testing
```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run accessibility tests
npm run test:a11y
```

### Production Deployment

#### Vercel Deployment (Recommended)

1. **Connect Repository**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel --prod
```

2. **Environment Variables Setup**
```bash
# Set production environment variables
vercel env add RESEND_API_KEY
vercel env add CONVEX_DEPLOYMENT
vercel env add NEXT_PUBLIC_CONVEX_URL
```

3. **Domain Configuration**
```bash
# Add custom domain
vercel domains add your-domain.com
```

#### Alternative Deployment Options

##### Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t checkout-system .
docker run -p 3000:3000 --env-file .env.production checkout-system
```

##### AWS Amplify
```yaml
# amplify.yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### Production Configuration

#### Performance Optimization
```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
    optimizeImages: true,
  },
  images: {
    domains: ['your-cdn-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
}
```

#### Security Headers
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}
```

#### Monitoring and Analytics

##### Error Tracking
```bash
# Install Sentry
npm install @sentry/nextjs

# Configure Sentry
echo "SENTRY_DSN=your-sentry-dsn" >> .env.production
```

##### Performance Monitoring
```javascript
// lib/analytics.ts
export function trackCheckoutEvent(event: string, data: any) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event, {
      event_category: 'checkout',
      ...data
    })
  }
}
```

### Maintenance and Updates

#### Regular Maintenance Tasks
1. **Dependency Updates**
```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Security audit
npm audit
```

2. **Performance Monitoring**
```bash
# Generate performance report
npm run analyze

# Check bundle size
npm run bundle-analyzer
```

3. **Database Maintenance**
```bash
# Convex schema updates
npx convex deploy

# Data migration (if needed)
npx convex run migration:updateOrderSchema
```

#### Backup and Recovery
```bash
# Export Convex data
npx convex export --output backup-$(date +%Y%m%d).json

# Import data (recovery)
npx convex import backup-20231201.json
```

### Troubleshooting Deployment Issues

#### Common Deployment Problems

1. **Build Failures**
```bash
# Clear Next.js cache
rm -rf .next

# Clear node modules
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

2. **Environment Variable Issues**
```bash
# Verify environment variables
vercel env ls

# Test locally with production env
vercel env pull .env.local
npm run build
```

3. **Convex Connection Issues**
```bash
# Verify Convex deployment
npx convex status

# Redeploy Convex functions
npx convex deploy --prod
```

4. **Email Delivery Issues**
```bash
# Test Resend API key
curl -X POST "https://api.resend.com/emails" \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from":"test@resend.dev","to":"test@example.com","subject":"Test","html":"Test"}'
```

This completes the comprehensive development documentation for the checkout system. The documentation covers all aspects of development, deployment, and maintenance needed for the project.