# 📧 Email Setup Guide for Audiophile E-commerce

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Resend API Key
1. Go to [resend.com](https://resend.com)
2. Sign up for free account
3. Verify your email
4. Go to **API Keys** → **Create API Key**
5. Copy the key (starts with `re_`)

### Step 2: Add to Vercel
1. Go to your Vercel project dashboard
2. **Settings** → **Environment Variables**
3. Add new variable:
   - Name: `RESEND_API_KEY`
   - Value: `re_your_key_here`
   - Environment: Production
4. **Save** and redeploy

### Step 3: Test
Visit: `https://your-site.vercel.app/test-email` to test email functionality

## 🔧 Alternative Email Services

If Resend doesn't work, the code supports these alternatives:

### Option 1: SendGrid
```env
SENDGRID_API_KEY=your_sendgrid_key
EMAIL_SERVICE=sendgrid
```

### Option 2: Nodemailer (Gmail)
```env
EMAIL_SERVICE=gmail
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password
```

### Option 3: Mailgun
```env
MAILGUN_API_KEY=your_mailgun_key
MAILGUN_DOMAIN=your-domain.mailgun.org
EMAIL_SERVICE=mailgun
```

## 🎯 Current Status

✅ **Orders work without email** - Users can complete purchases
✅ **Graceful fallback** - No blocking errors
✅ **Status tracking** - Shows if email sent or failed
✅ **Multiple providers** - Automatic fallback between services

## 🆘 Troubleshooting

### Email not sending?
1. Check environment variables are set
2. Visit `/api/email-status` to check configuration
3. Check Vercel function logs
4. Try the test page at `/test-email`

### Still having issues?
The checkout works perfectly without email - users get confirmation pages and order tracking. Email is optional!