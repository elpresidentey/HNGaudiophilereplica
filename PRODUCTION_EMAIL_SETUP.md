# 🚀 Production Email Setup Guide

## Overview
This guide will walk you through setting up email confirmations for production using Resend and Vercel.

## Current Status
- ✅ Email system is working in development
- ✅ Code is ready for production
- ⏳ Need to configure production environment

## Step-by-Step Setup Process

### Phase 1: Resend Account Setup

#### 1.1 Create Resend Account
1. Go to [resend.com](https://resend.com)
2. Click "Sign Up" 
3. Use your email: `conceptsandcontexts@gmail.com`
4. Verify your email address
5. Complete account setup

#### 1.2 Generate API Key
1. Login to Resend dashboard
2. Navigate to **API Keys** section
3. Click **"Create API Key"**
4. Name it: `Audiophile Production`
5. Copy the API key (starts with `re_`)
6. **IMPORTANT**: Save this key securely - you won't see it again

### Phase 2: Domain Verification (Optional but Recommended)

#### 2.1 Add Your Domain
1. In Resend dashboard, go to **Domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `audiophile-ecommerce.vercel.app`)
4. Follow DNS verification steps

#### 2.2 Benefits of Domain Verification
- Send emails to any address (not just verified emails)
- Better deliverability rates
- Professional "from" addresses
- Higher sending limits

### Phase 3: Vercel Environment Configuration

#### 3.1 Access Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Login to your account
3. Find your project: `HNGaudiophilereplica`
4. Click on the project

#### 3.2 Add Environment Variables
1. Go to **Settings** tab
2. Click **Environment Variables**
3. Add the following variables:

**Required Variable:**
```
Name: RESEND_API_KEY
Value: re_your_actual_api_key_here
Environment: Production, Preview, Development
```

**Optional Variables (if using custom domain):**
```
Name: EMAIL_FROM_ADDRESS
Value: orders@yourdomain.com
Environment: Production, Preview, Development
```

#### 3.3 Save and Deploy
1. Click **Save** for each variable
2. Go to **Deployments** tab
3. Click **"Redeploy"** on the latest deployment
4. Wait for deployment to complete

### Phase 4: Testing Production Setup

#### 4.1 Test Email Functionality
1. Visit your production site
2. Go to `/diagnose-email` page
3. Run the diagnostic tests
4. Send a test email

#### 4.2 Test Complete Checkout Flow
1. Add items to cart
2. Complete checkout form
3. Verify order confirmation page shows
4. Check if email was sent (check logs if needed)

### Phase 5: Monitoring and Troubleshooting

#### 5.1 Check Email Status
- Visit: `https://your-site.vercel.app/diagnose-email`
- This page shows configuration status and allows testing

#### 5.2 View Logs
1. In Vercel dashboard, go to **Functions** tab
2. Click on any function to see logs
3. Look for email-related errors or success messages

#### 5.3 Common Issues and Solutions

**Issue: "API Key Missing"**
- Solution: Ensure `RESEND_API_KEY` is set in Vercel environment variables
- Check the variable is set for "Production" environment

**Issue: "Invalid API Key Format"**
- Solution: API key must start with `re_`
- Generate a new key from Resend if needed

**Issue: "Can only send to verified email"**
- Solution: Either verify your domain in Resend, or emails will go to your verified address in development

**Issue: "Email sending failed"**
- Solution: Check Vercel function logs for detailed error messages
- Verify API key is correct and active

## Production Checklist

### Before Going Live:
- [ ] Resend account created and verified
- [ ] API key generated and saved securely
- [ ] Environment variables added to Vercel
- [ ] Latest code deployed to production
- [ ] Email diagnostic tests passing
- [ ] Test checkout flow completed successfully

### Optional (Recommended):
- [ ] Custom domain verified in Resend
- [ ] Custom "from" email address configured
- [ ] Email templates customized with branding
- [ ] Monitoring and alerting set up

## Next Steps After Setup

1. **Monitor Email Delivery**: Check Resend dashboard for delivery statistics
2. **Customize Email Templates**: Update branding and styling in email templates
3. **Set Up Webhooks**: Configure Resend webhooks for delivery tracking
4. **Add Email Analytics**: Track email open rates and click-through rates

## Support and Resources

- **Resend Documentation**: [docs.resend.com](https://docs.resend.com)
- **Vercel Environment Variables**: [vercel.com/docs/environment-variables](https://vercel.com/docs/environment-variables)
- **Project Email Diagnostic**: `/diagnose-email` page on your site
- **Email Service Status**: `/api/email-status` endpoint

## Emergency Fallback

If emails fail completely:
- ✅ Checkout still works perfectly
- ✅ Users get confirmation pages
- ✅ Orders are saved to database
- ✅ Manual follow-up is possible using order data

The system is designed to never block checkout due to email issues.