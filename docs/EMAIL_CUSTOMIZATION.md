# Email Template Customization Guide

## Overview

This guide provides comprehensive instructions for customizing the order confirmation email template used in the Audiophile checkout system. The email template is designed to be responsive, accessible, and compatible across all major email clients.

## Table of Contents

1. [Template Structure](#template-structure)
2. [Basic Customization](#basic-customization)
3. [Advanced Customization](#advanced-customization)
4. [Brand Guidelines](#brand-guidelines)
5. [Testing and Validation](#testing-and-validation)
6. [Troubleshooting](#troubleshooting)

---

## Template Structure

### File Location
The email template is located in: `app/api/send-email/route.ts`

### Template Architecture
The email template uses a table-based layout for maximum compatibility across email clients:

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- Meta tags and styles -->
  </head>
  <body>
    <table width="100%" cellpadding="0" cellspacing="0">
      <!-- Outer container -->
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0">
            <!-- Header Section -->
            <!-- Content Section -->
            <!-- Footer Section -->
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
```

### Template Sections

#### 1. Header Section
- Brand logo/name
- Primary brand colors
- Welcome message

#### 2. Content Section
- Personalized greeting
- Order information
- Order summary table
- Shipping details
- Call-to-action buttons

#### 3. Footer Section
- Support contact information
- Legal information
- Unsubscribe links

---

## Basic Customization

### Changing Brand Colors

#### Primary Brand Color
```javascript
// Current primary color: #D87D4A (orange)
// Replace throughout the template

// Header background
<td style="background-color: #YOUR_PRIMARY_COLOR; padding: 40px; text-align: center;">

// Button background
<a href="#" style="background-color: #YOUR_PRIMARY_COLOR; color: #ffffff; ...">

// Accent text
<span style="color: #YOUR_PRIMARY_COLOR;">support@yourdomain.com</span>
```

#### Secondary Colors
```javascript
// Text colors
const textColors = {
  primary: '#101010',    // Main text (black)
  secondary: '#4C4C4C',  // Secondary text (gray)
  light: '#ffffff',      // White text
  accent: '#D87D4A'      // Brand accent color
}

// Background colors
const backgroundColors = {
  main: '#ffffff',       // Main background
  light: '#F1F1F1',     // Light gray sections
  dark: '#101010'        // Dark header/footer
}
```

### Updating Logo and Branding

#### Text Logo (Current)
```html
<h1 style="color: #ffffff; margin: 0; font-size: 32px; text-transform: uppercase; letter-spacing: 2px;">
  audiophile
</h1>
```

#### Image Logo (Recommended)
```html
<img 
  src="https://yourdomain.com/logo-white.png" 
  alt="Your Brand Name" 
  style="height: 40px; width: auto; display: block;"
/>
```

#### Logo Best Practices
- Use PNG format with transparent background
- Optimize for 2x resolution (80px height for 40px display)
- Provide both light and dark versions
- Host on reliable CDN

### Customizing Content Text

#### Greeting Message
```javascript
// Current greeting
<h2 style="color: #101010; margin: 0 0 20px 0; font-size: 24px;">Hi ${name},</h2>

// Customization options
const greetings = {
  formal: `Dear ${name},`,
  casual: `Hi ${name}!`,
  friendly: `Hello ${name},`,
  branded: `Welcome back, ${name}!`
}
```

#### Main Message
```javascript
// Current message
<p style="color: #4C4C4C; margin: 0 0 20px 0; font-size: 15px; line-height: 25px;">
  Thank you for your order! We've received your order and will begin processing it right away.
</p>

// Customization example
<p style="color: #4C4C4C; margin: 0 0 20px 0; font-size: 15px; line-height: 25px;">
  Thank you for choosing ${brandName}! Your order has been confirmed and we're preparing it for shipment.
</p>
```

### Modifying Order Information Display

#### Order ID Section
```javascript
// Current format
<div style="background-color: #F1F1F1; border-radius: 8px; padding: 20px; margin: 30px 0;">
  <p style="margin: 0 0 10px 0; color: #101010; font-weight: 600;">Order ID: ${orderId}</p>
</div>

// Enhanced format with tracking
<div style="background-color: #F1F1F1; border-radius: 8px; padding: 20px; margin: 30px 0;">
  <p style="margin: 0 0 10px 0; color: #101010; font-weight: 600;">Order #${orderId}</p>
  <p style="margin: 0; color: #4C4C4C; font-size: 14px;">
    Track your order: <a href="https://yourdomain.com/track/${orderId}" style="color: #D87D4A;">Click here</a>
  </p>
</div>
```

---

## Advanced Customization

### Dynamic Content Based on Order Data

#### Conditional Sections
```javascript
// Payment method specific content
${paymentMethod === 'cash' ? `
  <div style="background-color: #FFF3CD; border: 1px solid #FFEAA7; padding: 15px; margin: 20px 0; border-radius: 4px;">
    <p style="margin: 0; color: #856404; font-size: 14px;">
      <strong>Cash on Delivery:</strong> Please have exact change ready when our courier arrives.
    </p>
  </div>
` : ''}

// Order value based messaging
${total > 500 ? `
  <div style="background-color: #D4EDDA; border: 1px solid #C3E6CB; padding: 15px; margin: 20px 0; border-radius: 4px;">
    <p style="margin: 0; color: #155724; font-size: 14px;">
      <strong>Free Premium Shipping:</strong> Your order qualifies for our fastest delivery option!
    </p>
  </div>
` : ''}
```

#### Personalization Based on Customer Data
```javascript
// Customer tier messaging (implement based on your customer data)
const getCustomerMessage = (email, orderTotal) => {
  const customerTier = getCustomerTier(email) // Implement this function
  
  switch (customerTier) {
    case 'premium':
      return 'As a premium customer, your order will be expedited and you\'ll receive priority support.'
    case 'returning':
      return 'Welcome back! We appreciate your continued trust in our products.'
    default:
      return 'Thank you for choosing us for your audio needs!'
  }
}

// Usage in template
<p style="color: #4C4C4C; margin: 20px 0; font-size: 14px; font-style: italic;">
  ${getCustomerMessage(email, total)}
</p>
```

### Enhanced Order Summary Table

#### Product Images in Email
```javascript
// Enhanced item display with images
const itemsHtml = items.map((item) => `
  <tr>
    <td style="padding: 12px; border-bottom: 1px solid #eee;">
      <table cellpadding="0" cellspacing="0">
        <tr>
          <td style="width: 60px; padding-right: 12px;">
            <img 
              src="${item.image}" 
              alt="${item.name}" 
              style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"
              onerror="this.style.display='none'"
            />
          </td>
          <td>
            <strong style="color: #101010; font-size: 14px;">${item.name}</strong>
            <br>
            <span style="color: #4C4C4C; font-size: 12px;">SKU: ${item.sku || item.id}</span>
          </td>
        </tr>
      </table>
    </td>
    <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
      <strong>${item.quantity}x</strong>
    </td>
    <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
      <strong>$${(item.price * item.quantity).toLocaleString()}</strong>
    </td>
  </tr>
`).join('')
```

#### Detailed Pricing Breakdown
```javascript
// Enhanced totals section
<table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
  <tr>
    <td style="padding: 8px 0; color: #4C4C4C;">Subtotal (${items.length} items)</td>
    <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #101010;">$${subtotal.toLocaleString()}</td>
  </tr>
  ${discount > 0 ? `
  <tr>
    <td style="padding: 8px 0; color: #4C4C4C;">Discount Applied</td>
    <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #28a745;">-$${discount.toLocaleString()}</td>
  </tr>
  ` : ''}
  <tr>
    <td style="padding: 8px 0; color: #4C4C4C;">Shipping</td>
    <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #101010;">
      ${shipping === 0 ? 'FREE' : '$' + shipping.toLocaleString()}
    </td>
  </tr>
  <tr>
    <td style="padding: 8px 0; color: #4C4C4C;">Tax</td>
    <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #101010;">$${tax.toLocaleString()}</td>
  </tr>
  <tr style="border-top: 2px solid #101010;">
    <td style="padding: 12px 0; font-weight: 600; color: #101010; font-size: 18px;">Total</td>
    <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #101010; font-size: 18px;">$${total.toLocaleString()}</td>
  </tr>
</table>
```

### Call-to-Action Buttons

#### Multiple Action Buttons
```javascript
// Enhanced CTA section
<div style="margin: 40px 0; text-align: center;">
  <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
    <tr>
      <td style="padding-right: 10px;">
        <a href="https://yourdomain.com/orders/${orderId}" 
           style="display: inline-block; background-color: #D87D4A; color: #ffffff; text-decoration: none; padding: 15px 25px; border-radius: 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; font-size: 13px;">
          Track Order
        </a>
      </td>
      <td style="padding-left: 10px;">
        <a href="https://yourdomain.com/account" 
           style="display: inline-block; background-color: transparent; color: #D87D4A; text-decoration: none; padding: 15px 25px; border: 2px solid #D87D4A; border-radius: 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; font-size: 13px;">
          View Account
        </a>
      </td>
    </tr>
  </table>
</div>
```

#### Social Media Links
```javascript
// Social media section
<div style="margin: 30px 0; text-align: center;">
  <p style="color: #4C4C4C; margin: 0 0 15px 0; font-size: 14px;">Follow us for updates and exclusive offers:</p>
  <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
    <tr>
      <td style="padding: 0 10px;">
        <a href="https://facebook.com/yourbrand" style="text-decoration: none;">
          <img src="https://yourdomain.com/icons/facebook.png" alt="Facebook" style="width: 32px; height: 32px;" />
        </a>
      </td>
      <td style="padding: 0 10px;">
        <a href="https://instagram.com/yourbrand" style="text-decoration: none;">
          <img src="https://yourdomain.com/icons/instagram.png" alt="Instagram" style="width: 32px; height: 32px;" />
        </a>
      </td>
      <td style="padding: 0 10px;">
        <a href="https://twitter.com/yourbrand" style="text-decoration: none;">
          <img src="https://yourdomain.com/icons/twitter.png" alt="Twitter" style="width: 32px; height: 32px;" />
        </a>
      </td>
    </tr>
  </table>
</div>
```

---

## Brand Guidelines

### Typography

#### Font Stack
```css
/* Primary font stack for maximum compatibility */
font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;

/* Alternative options */
font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; /* Windows-friendly */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; /* System fonts */
```

#### Font Sizes and Hierarchy
```css
/* Heading hierarchy */
h1: 32px; /* Brand name */
h2: 24px; /* Section headings */
h3: 18px; /* Subsection headings */

/* Body text */
body: 15px; /* Main content */
small: 13px; /* Fine print */
caption: 12px; /* Table captions */

/* Line heights */
line-height: 1.6; /* Body text */
line-height: 1.2; /* Headings */
```

### Color Palette

#### Primary Colors
```css
/* Brand colors */
--primary: #D87D4A;     /* Orange - main brand color */
--primary-light: #E89B6B; /* Lighter orange for hovers */
--primary-dark: #B86A3A;  /* Darker orange for emphasis */

/* Neutral colors */
--black: #101010;       /* Primary text */
--gray-dark: #4C4C4C;   /* Secondary text */
--gray-light: #F1F1F1;  /* Background sections */
--white: #FFFFFF;       /* Main background */
```

#### Status Colors
```css
/* Status indicators */
--success: #28A745;     /* Success messages */
--warning: #FFC107;     /* Warning messages */
--error: #DC3545;       /* Error messages */
--info: #17A2B8;        /* Information messages */
```

### Spacing and Layout

#### Consistent Spacing Scale
```css
/* Spacing scale (multiples of 4px) */
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-xxl: 48px;

/* Common usage */
padding: var(--space-md); /* 16px */
margin: var(--space-lg) 0; /* 24px top/bottom */
```

#### Email-Specific Measurements
```css
/* Email container widths */
--email-width: 600px;    /* Main container */
--email-padding: 40px;   /* Outer padding */
--content-padding: 20px; /* Inner content padding */

/* Button dimensions */
--button-padding: 15px 30px;
--button-radius: 4px;
--button-font-size: 13px;
```

---

## Testing and Validation

### Email Client Testing

#### Major Email Clients to Test
1. **Gmail** (Web, iOS, Android)
2. **Outlook** (Web, Desktop 2016+, Mobile)
3. **Apple Mail** (macOS, iOS)
4. **Yahoo Mail**
5. **Thunderbird**

#### Testing Tools

##### Litmus (Recommended)
```bash
# Install Litmus CLI
npm install -g litmus-cli

# Test email template
litmus test email-template.html
```

##### Email on Acid
- Upload HTML template
- Generate previews across 90+ clients
- Check spam score and deliverability

##### Manual Testing
```javascript
// Send test emails to different providers
const testEmails = [
  'test@gmail.com',
  'test@outlook.com',
  'test@yahoo.com',
  'test@icloud.com'
]

testEmails.forEach(email => {
  sendTestEmail(email, templateData)
})
```

### Accessibility Testing

#### Screen Reader Compatibility
```html
<!-- Proper heading structure -->
<h1>Order Confirmation</h1>
<h2>Order Summary</h2>
<h3>Shipping Address</h3>

<!-- Alt text for images -->
<img src="logo.png" alt="Company Name Logo" />

<!-- Descriptive link text -->
<a href="/track">Track your order #${orderId}</a>
```

#### Color Contrast Validation
```css
/* Ensure minimum 4.5:1 contrast ratio */
color: #101010; /* Black text */
background-color: #FFFFFF; /* White background */
/* Contrast ratio: 20.59:1 ✓ */

color: #4C4C4C; /* Gray text */
background-color: #FFFFFF; /* White background */
/* Contrast ratio: 9.74:1 ✓ */
```

### Performance Testing

#### Image Optimization
```html
<!-- Optimized images -->
<img 
  src="https://cdn.yourdomain.com/logo-optimized.png" 
  alt="Brand Logo"
  style="width: 200px; height: auto; display: block;"
  width="200"
  height="50"
/>
```

#### Loading Time Analysis
```javascript
// Measure email rendering time
const startTime = performance.now()
// ... email content loads
const endTime = performance.now()
console.log(`Email rendered in ${endTime - startTime}ms`)
```

### Spam Score Testing

#### SpamAssassin Testing
```bash
# Test email content for spam indicators
spamassassin -t < email-template.html
```

#### Common Spam Triggers to Avoid
- Excessive use of "FREE", "URGENT", "ACT NOW"
- All caps text
- Multiple exclamation points
- Suspicious links or attachments
- Poor HTML structure

---

## Troubleshooting

### Common Issues

#### Images Not Loading
**Problem**: Images appear as broken links in some email clients

**Solutions**:
```html
<!-- Use absolute URLs -->
<img src="https://yourdomain.com/images/logo.png" alt="Logo" />

<!-- Provide fallback with onerror -->
<img 
  src="https://yourdomain.com/images/product.jpg" 
  alt="Product Name"
  onerror="this.style.display='none'"
/>

<!-- Use background images for decorative elements -->
<td style="background-image: url('https://yourdomain.com/bg.jpg'); background-size: cover;">
```

#### Layout Breaking in Outlook
**Problem**: Table layout appears broken in Outlook desktop clients

**Solutions**:
```html
<!-- Use explicit table dimensions -->
<table width="600" cellpadding="0" cellspacing="0" border="0">

<!-- Add Outlook-specific conditional CSS -->
<!--[if mso]>
<style type="text/css">
  .outlook-fix {
    width: 600px !important;
  }
</style>
<![endif]-->

<!-- Use VML for background images in Outlook -->
<!--[if gte mso 9]>
<v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:600px;height:200px;">
  <v:fill type="tile" src="background.jpg" color="#D87D4A" />
  <v:textbox inset="0,0,0,0">
<![endif]-->
```

#### Dark Mode Compatibility
**Problem**: Email appears poorly in dark mode email clients

**Solutions**:
```html
<!-- Dark mode media query -->
<style>
@media (prefers-color-scheme: dark) {
  .dark-mode-bg { background-color: #1a1a1a !important; }
  .dark-mode-text { color: #ffffff !important; }
}
</style>

<!-- Inline dark mode styles -->
<td style="background-color: #ffffff; color: #101010;" class="dark-mode-bg dark-mode-text">
```

#### Mobile Responsiveness Issues
**Problem**: Email doesn't display properly on mobile devices

**Solutions**:
```html
<!-- Responsive meta tag -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- Mobile-first CSS -->
<style>
@media only screen and (max-width: 600px) {
  .mobile-full-width { width: 100% !important; }
  .mobile-padding { padding: 20px !important; }
  .mobile-font-size { font-size: 16px !important; }
}
</style>

<!-- Fluid table structure -->
<table width="100%" style="max-width: 600px; margin: 0 auto;">
```

### Debugging Tools

#### HTML Validation
```bash
# Validate HTML structure
html5validator email-template.html

# Check for common email HTML issues
npm install -g email-validator
email-validator validate email-template.html
```

#### CSS Inlining
```javascript
// Inline CSS for better email client support
const juice = require('juice')
const inlinedHtml = juice(htmlTemplate)
```

#### Preview Generation
```javascript
// Generate email previews
const puppeteer = require('puppeteer')

async function generatePreview(htmlContent) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.setContent(htmlContent)
  await page.screenshot({ path: 'email-preview.png', fullPage: true })
  await browser.close()
}
```

---

## Best Practices

### Email Development Guidelines

1. **Use Tables for Layout**: Email clients have poor CSS support
2. **Inline CSS**: Many clients strip `<style>` tags
3. **Test Early and Often**: Check across multiple clients
4. **Optimize Images**: Use appropriate formats and sizes
5. **Provide Alt Text**: Essential for accessibility
6. **Keep It Simple**: Complex layouts often break
7. **Use Web Fonts Carefully**: Provide fallbacks
8. **Test Dark Mode**: Increasingly common in email clients

### Performance Optimization

1. **Minimize HTML Size**: Keep under 100KB when possible
2. **Optimize Images**: Use WebP with JPEG fallbacks
3. **Reduce HTTP Requests**: Inline small images as base64
4. **Use CDN**: Host images on fast, reliable CDN
5. **Compress Content**: Enable gzip compression

### Deliverability Best Practices

1. **Authenticate Emails**: Set up SPF, DKIM, DMARC
2. **Use Reputable Sender**: Consistent from address
3. **Avoid Spam Triggers**: Test content with spam filters
4. **Include Unsubscribe**: Required by law in many regions
5. **Monitor Reputation**: Track bounce and complaint rates

---

## Resources

### Documentation
- [Email Client CSS Support](https://www.campaignmonitor.com/css/)
- [Can I Email](https://www.caniemail.com/)
- [Email Accessibility Guidelines](https://accessibility.digital.gov/visual-design/email/)

### Tools
- [Litmus](https://litmus.com/) - Email testing platform
- [Email on Acid](https://www.emailonacid.com/) - Email testing and analytics
- [Juice](https://github.com/Automattic/juice) - CSS inlining tool
- [MJML](https://mjml.io/) - Responsive email framework

### Templates and Inspiration
- [Really Good Emails](https://reallygoodemails.com/)
- [Email Love](https://emaillove.com/)
- [Mailchimp Templates](https://mailchimp.com/resources/email-templates/)

This completes the comprehensive email customization guide. The documentation provides everything needed to customize, test, and maintain the email confirmation system.