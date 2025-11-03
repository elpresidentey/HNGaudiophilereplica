# Checkout System Troubleshooting Guide

## Quick Reference

### Common Issues
- [Form Validation Problems](#form-validation-problems)
- [Email Delivery Issues](#email-delivery-issues)
- [Database Connection Problems](#database-connection-problems)
- [Performance Issues](#performance-issues)
- [Accessibility Problems](#accessibility-problems)
- [Cart State Issues](#cart-state-issues)

### Emergency Contacts
- **Development Team**: dev-team@company.com
- **Infrastructure**: ops@company.com
- **Customer Support**: support@company.com

---

## Form Validation Problems

### Issue: Validation Errors Persist After Correction

**Symptoms:**
- Red error messages remain visible after fixing input
- Form won't submit despite apparently valid data
- Validation icons show incorrect status
- Console shows validation timeout errors

**Root Causes:**
1. Debounced validation not clearing properly
2. Browser autocomplete interfering with validation
3. Hidden characters in input fields
4. JavaScript errors preventing validation updates

**Solutions:**

#### Step 1: Clear Validation State
```javascript
// In browser console
const form = document.querySelector('form')
const inputs = form.querySelectorAll('input')
inputs.forEach(input => {
  input.dispatchEvent(new Event('blur'))
})
```

#### Step 2: Check for Hidden Characters
```javascript
// Check field values for invisible characters
const nameField = document.getElementById('name')
console.log('Name value:', JSON.stringify(nameField.value))
console.log('Name length:', nameField.value.length)
```

#### Step 3: Reset Form State
```javascript
// Force form reset and revalidation
window.location.reload()
```

#### Step 4: Disable Browser Autocomplete
Add to problematic input fields:
```html
<input autocomplete="off" />
```

### Issue: Phone Number Validation Failing

**Symptoms:**
- Valid phone numbers rejected
- International numbers not accepted
- Formatting issues with country codes

**Solutions:**

#### Supported Formats:
- US/Canada: `+1 234 567 8900`, `(555) 123-4567`
- UK: `+44 20 1234 5678`, `020 1234 5678`
- International: `+33 1 23 45 67 89`

#### Debug Phone Validation:
```javascript
// Test phone number patterns
const phone = '+1 234 567 8900'
const patterns = [
  /^\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/,
  /^\+?[1-9]\d{1,14}$/,
  /^\+?[\d\s\-\(\)\.]{10,20}$/
]
patterns.forEach((pattern, i) => {
  console.log(`Pattern ${i}:`, pattern.test(phone))
})
```

### Issue: Email Validation Too Strict

**Symptoms:**
- Valid email addresses rejected
- Corporate email domains not accepted
- Plus addressing (+) not working

**Solutions:**

#### Check Email Format:
```javascript
// Validate email manually
const email = 'user+tag@company.co.uk'
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
console.log('Email valid:', emailRegex.test(email))
```

#### Common Valid Formats:
- Standard: `user@domain.com`
- Plus addressing: `user+tag@domain.com`
- Subdomain: `user@mail.company.com`
- International TLD: `user@domain.co.uk`

---

## Email Delivery Issues

### Issue: Confirmation Emails Not Sent

**Symptoms:**
- Order processes successfully but no email received
- Email error indicator appears in checkout
- Console shows email API errors
- Customer complaints about missing confirmations

**Diagnostic Steps:**

#### Step 1: Check Environment Variables
```bash
# Verify Resend API key is configured
echo $RESEND_API_KEY
# Should output: re_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Step 2: Test Email API Directly
```bash
curl -X POST http://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "orderId": "TEST-123",
    "items": [{"id": 1, "name": "Test Product", "price": 100, "quantity": 1}],
    "total": 150,
    "shipping": 50,
    "subtotal": 100,
    "tax": 0,
    "address": "123 Test St",
    "city": "Test City",
    "country": "Test Country",
    "zipCode": "12345"
  }'
```

#### Step 3: Check Resend Service Status
```bash
# Test Resend API connectivity
curl -X GET "https://api.resend.com/domains" \
  -H "Authorization: Bearer $RESEND_API_KEY"
```

**Common Solutions:**

#### Invalid API Key
```bash
# Regenerate API key in Resend dashboard
# Update environment variable
vercel env add RESEND_API_KEY
```

#### Rate Limiting
- **Symptom**: HTTP 429 errors
- **Solution**: Implement exponential backoff
- **Temporary**: Wait 1 hour before retrying

#### Email Domain Issues
```javascript
// Check if email domain accepts mail
const dns = require('dns')
dns.resolveMx('customer-domain.com', (err, addresses) => {
  console.log('MX records:', addresses)
})
```

### Issue: Emails Going to Spam

**Symptoms:**
- Emails sent but not in inbox
- Found in spam/junk folders
- Low delivery rates

**Solutions:**

#### Improve Email Content:
1. Remove excessive promotional language
2. Include plain text version
3. Add unsubscribe link
4. Use proper sender authentication

#### Check Sender Reputation:
```bash
# Test email deliverability
curl -X POST "https://api.resend.com/emails" \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from":"noreply@yourdomain.com","to":"test@gmail.com","subject":"Test","text":"Test"}'
```

---

## Database Connection Problems

### Issue: Orders Not Saving to Convex

**Symptoms:**
- Checkout completes but no database record
- Console shows Convex connection errors
- Order confirmation shows "orderSaved: false"
- Intermittent save failures

**Diagnostic Steps:**

#### Step 1: Verify Convex Configuration
```bash
# Check Convex deployment status
npx convex status

# Verify environment variables
echo $CONVEX_DEPLOYMENT
echo $NEXT_PUBLIC_CONVEX_URL
```

#### Step 2: Test Database Connection
```javascript
// In browser console (on checkout page)
import { useQuery } from 'convex/react'

// Check if Convex client is initialized
console.log('Convex client:', window.convex)

// Test basic query
const testQuery = useQuery(api.orders.list)
console.log('Query result:', testQuery)
```

#### Step 3: Check Schema Compatibility
```bash
# Verify schema is deployed
npx convex deploy

# Check for schema mismatches
npx convex logs --tail
```

**Common Solutions:**

#### Deployment Issues
```bash
# Redeploy Convex functions
npx convex deploy --prod

# Clear Convex cache
rm -rf .convex
npx convex dev
```

#### Schema Mismatches
```typescript
// Verify order schema matches interface
// In convex/schema.ts
export default defineSchema({
  orders: defineTable({
    customerName: v.string(),
    email: v.string(),
    // ... ensure all fields match CheckoutFormData
  })
})
```

#### Network Connectivity
```javascript
// Test Convex endpoint directly
fetch(process.env.NEXT_PUBLIC_CONVEX_URL + '/api/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'orders:list', args: {} })
})
```

### Issue: Slow Database Operations

**Symptoms:**
- Long delays during order submission
- Timeout errors in console
- Performance warnings in development

**Solutions:**

#### Optimize Queries:
```typescript
// Use indexes for better performance
export default defineSchema({
  orders: defineTable({
    // ... fields
  }).index("by_email", ["email"])
   .index("by_order_id", ["orderId"])
})
```

#### Monitor Performance:
```javascript
// Track database operation timing
const startTime = Date.now()
await createOrder(orderData)
console.log('Database save time:', Date.now() - startTime, 'ms')
```

---

## Performance Issues

### Issue: Slow Form Interactions

**Symptoms:**
- Delayed validation feedback
- Sluggish typing response
- Browser freezing during validation
- High CPU usage

**Diagnostic Steps:**

#### Step 1: Check Performance Metrics
```javascript
// In development mode, check performance panel
const monitor = usePerformanceMonitor()
console.log('Performance summary:', monitor.getSummary())
console.log('Performance issues:', monitor.getPerformanceIssues())
```

#### Step 2: Identify Bottlenecks
```javascript
// Check validation timing
const validationMetrics = monitor.getMetricsByPattern('validation_')
validationMetrics.forEach(metric => {
  if (metric.duration > 100) {
    console.warn('Slow validation:', metric.name, metric.duration + 'ms')
  }
})
```

#### Step 3: Browser Performance Analysis
1. Open Chrome DevTools
2. Go to Performance tab
3. Record during form interaction
4. Look for long tasks and excessive reflows

**Solutions:**

#### Reduce Validation Frequency:
```javascript
// Increase debounce delays for complex fields
const debouncedValidation = useCallback((fieldName, delay) => {
  const smartDelay = delay || {
    email: 1200,    // Increased from 800ms
    phone: 1000,    // Increased from 700ms
    name: 1200      // Increased from 900ms
  }[fieldName] || 500
  // ... rest of implementation
})
```

#### Optimize Re-renders:
```javascript
// Memoize expensive calculations
const validationState = useMemo(() => {
  return computeValidationState(formData)
}, [formData])

// Use React.memo for form fields
const FormField = React.memo(({ field, error, onChange }) => {
  // ... component implementation
})
```

### Issue: Memory Leaks

**Symptoms:**
- Increasing memory usage over time
- Browser becomes unresponsive
- Performance degrades with use

**Solutions:**

#### Clean Up Timeouts:
```javascript
// Ensure all timeouts are cleared
useEffect(() => {
  return () => {
    Object.values(validationTimeouts).forEach(timeout => {
      if (timeout) clearTimeout(timeout)
    })
  }
}, [validationTimeouts])
```

#### Monitor Memory Usage:
```javascript
// Check memory usage periodically
setInterval(() => {
  if (performance.memory) {
    console.log('Memory usage:', {
      used: Math.round(performance.memory.usedJSHeapSize / 1048576) + 'MB',
      total: Math.round(performance.memory.totalJSHeapSize / 1048576) + 'MB'
    })
  }
}, 10000)
```

---

## Accessibility Problems

### Issue: Screen Reader Not Announcing Changes

**Symptoms:**
- No audio feedback for validation errors
- Form changes not announced
- Navigation issues with assistive technology

**Diagnostic Steps:**

#### Step 1: Check ARIA Attributes
```javascript
// Verify aria-live regions exist
document.querySelectorAll('[aria-live]').forEach(el => {
  console.log('ARIA live region:', el.getAttribute('aria-live'), el.textContent)
})

// Check form labels
document.querySelectorAll('input').forEach(input => {
  const label = document.querySelector(`label[for="${input.id}"]`)
  console.log('Input:', input.id, 'Label:', label?.textContent)
})
```

#### Step 2: Test with Screen Reader
1. Enable screen reader (NVDA, JAWS, VoiceOver)
2. Navigate form using Tab key only
3. Verify error announcements
4. Check heading structure

**Solutions:**

#### Fix ARIA Labels:
```html
<!-- Ensure all inputs have proper labels -->
<label htmlFor="email">Email Address</label>
<input 
  id="email" 
  aria-describedby="email-help email-error"
  aria-invalid={hasError ? 'true' : 'false'}
/>
<div id="email-help">We'll send confirmation to this address</div>
{hasError && <div id="email-error" role="alert">Invalid email</div>}
```

#### Improve Announcements:
```javascript
// Ensure announcements are clear and contextual
setAnnounceMessage(`Form validation error: The ${fieldName} field needs attention. ${errorMessage}`)
```

### Issue: Keyboard Navigation Problems

**Symptoms:**
- Tab order is incorrect
- Focus gets trapped
- Keyboard shortcuts not working

**Solutions:**

#### Fix Tab Order:
```html
<!-- Use tabindex to control focus order -->
<input tabindex="1" />
<input tabindex="2" />
<button tabindex="3">Submit</button>
```

#### Test Keyboard Navigation:
1. Use Tab to navigate forward
2. Use Shift+Tab to navigate backward
3. Test Enter/Space on buttons
4. Verify Escape key behavior

---

## Cart State Issues

### Issue: Cart Data Inconsistencies

**Symptoms:**
- Items disappear from cart
- Incorrect quantity calculations
- Total price mismatches
- Cart state not persisting

**Diagnostic Steps:**

#### Step 1: Check Cart Context
```javascript
// Verify cart provider is properly configured
const { cart, totalPrice, totalItems } = useCart()
console.log('Cart state:', { cart, totalPrice, totalItems })

// Check for multiple providers
const providers = document.querySelectorAll('[data-cart-provider]')
console.log('Cart providers found:', providers.length)
```

#### Step 2: Verify Calculations
```javascript
// Manual calculation check
const manualTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
console.log('Manual total:', manualTotal, 'Context total:', totalPrice)
```

**Solutions:**

#### Fix Provider Setup:
```jsx
// Ensure single CartProvider at app root
function App() {
  return (
    <CartProvider>
      <ConvexProvider client={convex}>
        {/* App content */}
      </ConvexProvider>
    </CartProvider>
  )
}
```

#### Debug Cart Operations:
```javascript
// Add logging to cart operations
const addToCart = useCallback((item) => {
  console.log('Adding to cart:', item)
  // ... existing logic
  console.log('Cart after add:', newCart)
}, [])
```

### Issue: Cart Persistence Problems

**Symptoms:**
- Cart empties on page refresh
- Items lost during navigation
- Inconsistent cart state across tabs

**Solutions:**

#### Implement Cart Persistence:
```javascript
// Save cart to localStorage
useEffect(() => {
  localStorage.setItem('cart', JSON.stringify(cart))
}, [cart])

// Restore cart on load
useEffect(() => {
  const savedCart = localStorage.getItem('cart')
  if (savedCart) {
    setCart(JSON.parse(savedCart))
  }
}, [])
```

---

## Error Codes Reference

### Validation Errors (V001-V099)
- **V001**: Required field empty
- **V002**: Invalid email format
- **V003**: Invalid phone number
- **V004**: Invalid postal code
- **V005**: Name format invalid
- **V006**: Address too short
- **V007**: Payment method not selected
- **V008**: e-Money number invalid
- **V009**: e-Money PIN invalid
- **V010**: Weak PIN detected

### API Errors (A001-A099)
- **A001**: Email service unavailable
- **A002**: Database connection failed
- **A003**: Invalid request format
- **A004**: Rate limit exceeded
- **A005**: Authentication failed
- **A006**: Network timeout
- **A007**: Server error
- **A008**: Service maintenance

### Performance Warnings (P001-P099)
- **P001**: Validation timeout (>100ms)
- **P002**: Form load slow (>2000ms)
- **P003**: Email send slow (>3000ms)
- **P004**: Database save slow (>2000ms)
- **P005**: Memory usage high
- **P006**: CPU usage high

---

## Emergency Procedures

### Complete System Failure

1. **Immediate Actions:**
   - Check service status dashboard
   - Verify all environment variables
   - Restart application servers
   - Check external service status (Convex, Resend)

2. **Communication:**
   - Notify customer support team
   - Update status page
   - Prepare customer communication

3. **Recovery Steps:**
   - Deploy last known good version
   - Restore from backup if needed
   - Gradually re-enable features

### Data Loss Prevention

1. **Regular Backups:**
   ```bash
   # Daily Convex backup
   npx convex export --output backup-$(date +%Y%m%d).json
   ```

2. **Monitoring:**
   - Set up alerts for error rates
   - Monitor performance metrics
   - Track conversion rates

3. **Testing:**
   - Run automated tests before deployment
   - Perform manual checkout testing
   - Verify email delivery

---

## Contact Information

### Development Team
- **Email**: dev-team@company.com
- **Slack**: #checkout-system
- **On-call**: +1-555-DEV-TEAM

### Infrastructure Team
- **Email**: ops@company.com
- **Slack**: #infrastructure
- **Emergency**: +1-555-OPS-TEAM

### Customer Support
- **Email**: support@company.com
- **Phone**: +1-555-SUPPORT
- **Hours**: 24/7

---

## Additional Resources

- [Development Documentation](./DEVELOPMENT.md)
- [API Documentation](./API.md)
- [Performance Monitoring Guide](./PERFORMANCE.md)
- [Security Guidelines](./SECURITY.md)
- [Deployment Guide](./DEPLOYMENT.md)