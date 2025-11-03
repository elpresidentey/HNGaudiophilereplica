# Setup Instructions for Audiophile E-commerce Website

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Convex account (free tier available)
- A Resend account (free tier available)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Convex Backend

1. Install Convex CLI globally (if not already installed):
   ```bash
   npm install -g convex
   ```

2. Initialize Convex in your project:
   ```bash
   npx convex dev
   ```

3. This will:
   - Create a new Convex deployment
   - Generate `convex/_generated/` files
   - Provide you with a deployment URL

4. Copy the deployment URL and add it to your `.env.local` file:
   ```
   NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
   ```

### 3. Set Up Resend API

1. Sign up at [resend.com](https://resend.com) (free tier available)

2. Create an API key:
   - Go to API Keys section
   - Create a new API key
   - Copy the key

3. Add the API key to your `.env.local` file:
   ```
   RESEND_API_KEY=re_your_api_key_here
   ```

4. Update the sender email in `app/api/send-email/route.ts`:
   - Replace `onboarding@resend.dev` with your verified domain email
   - Or use the default for testing

### 4. Create Environment File

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
RESEND_API_KEY=your_resend_api_key
```

### 5. Run the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Troubleshooting

### Convex Connection Issues

- Make sure `NEXT_PUBLIC_CONVEX_URL` is set correctly
- Verify your Convex deployment is running
- Check the browser console for connection errors

### Email Not Sending

- Verify `RESEND_API_KEY` is set correctly
- Check Resend dashboard for API key usage
- Ensure sender email is verified in Resend
- Check server logs for error messages

### Images Not Loading

- Ensure `assets/` folder is in the root directory
- Images should be accessible at `/assets/...`
- Check browser console for 404 errors

### TypeScript Errors

- Run `npm install` again
- Delete `.next` folder and rebuild
- Run `npx convex dev` to regenerate types

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import repository to Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_CONVEX_URL`
   - `RESEND_API_KEY`
4. Deploy!

### Deploy to Netlify

1. Push your code to GitHub
2. Import repository to Netlify
3. Add environment variables in Site settings
4. Deploy!

## Testing the Checkout Flow

1. Add products to cart
2. Navigate to checkout
3. Fill out the form with:
   - Name: Test User
   - Email: your-email@example.com
   - Phone: +1234567890
   - Address: 123 Test St
   - City: New York
   - ZIP: 10001
   - Country: United States
   - Payment: e-Money (or Cash on Delivery)
4. Submit the order
5. Check your email for confirmation
6. View order confirmation page

## Notes

- The app uses sessionStorage to temporarily store order data
- Images are loaded from the `/assets/` directory
- Product data is loaded from `assets/db.json`
- All form validation happens client-side using Zod


