# 🛍️ Audiophile E-commerce Website

A pixel-perfect, fully functional e-commerce website built with Next.js, React, Convex, and Resend for selling high-end audio products.

## 🚀 Features

- **Pixel-Perfect UI**: Matches Figma design across mobile, tablet, and desktop
- **Product Catalog**: Browse headphones, speakers, and earphones
- **Shopping Cart**: Add, update, and remove items from cart
- **Checkout Form**: Complete form with validation and accessibility features
- **Order Management**: Orders saved to Convex backend
- **Email Notifications**: Automated confirmation emails via Resend
- **Responsive Design**: Works seamlessly on all devices
- **Accessibility**: Full keyboard navigation and screen reader support

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Convex
- **Email Service**: Resend API
- **Styling**: Tailwind CSS
- **Form Validation**: React Hook Form + Zod
- **State Management**: React Context API

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "hng ECOMMERCE"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in the required environment variables:
   ```env
   NEXT_PUBLIC_CONVEX_URL=your_convex_url
   RESEND_API_KEY=your_resend_api_key
   ```

4. **Set up Convex**
   ```bash
   npx convex dev
   ```
   This will create a new Convex deployment and generate the deployment URL.

5. **Prepare Assets**
   Next.js serves static files from the `public` folder. You have two options:
   
   **Option A**: Copy assets to public folder
   ```bash
   cp -r assets public/assets
   ```
   
   **Option B**: Create a symlink (if on Mac/Linux)
   ```bash
   ln -s ../assets public/assets
   ```
   
   **Note**: The `assets` folder should be accessible at `/assets/...` for images to load correctly.

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
├── app/
│   ├── api/
│   │   └── send-email/          # Email API route
│   ├── checkout/
│   │   ├── confirmation/         # Order confirmation page
│   │   └── page.tsx             # Checkout page
│   ├── product/
│   │   └── [slug]/              # Product detail pages
│   ├── headphones/              # Headphones category page
│   ├── speakers/                # Speakers category page
│   ├── earphones/               # Earphones category page
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Homepage
│   └── globals.css              # Global styles
├── components/                   # Reusable components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── CartModal.tsx
│   ├── CheckoutForm.tsx
│   └── ...
├── context/                     # React contexts
│   └── CartContext.tsx
├── convex/                      # Convex backend
│   ├── schema.ts
│   └── orders.ts
├── assets/                      # Product images and data
│   ├── db.json
│   └── ...
└── ...
```

## 🔧 Configuration

### Convex Setup

1. Create a new Convex project at [convex.dev](https://convex.dev)
2. Run `npx convex dev` to initialize
3. Copy the deployment URL to `NEXT_PUBLIC_CONVEX_URL` in `.env.local`

### Resend API Setup

1. Sign up at [resend.com](https://resend.com)
2. Create an API key
3. Add it to `RESEND_API_KEY` in `.env.local`
4. Update the sender email in `app/api/send-email/route.ts` (currently uses `onboarding@resend.dev`)

## 🎨 Design System

The design follows the Figma specifications:

- **Colors**:
  - Primary: `#D87D4A`
  - Primary Light: `#FBAF85`
  - Dark: `#101010`
  - Light: `#F1F1F1`
  - Light Alt: `#FAFAFA`

- **Typography**: Cabin font family
  - H1: 56px (desktop) / 36px (mobile)
  - H2: 40px (desktop) / 28px (mobile)
  - Body: 15px

## 📱 Features

### Shopping Cart
- Add items with quantity
- Update quantities
- Remove items
- View cart total

### Checkout
- Full form validation
- Accessible form inputs
- Email and phone validation
- Shipping address collection
- Payment method selection (e-Money or Cash on Delivery)
- Order summary with subtotal, shipping, tax, and total

### Order Confirmation
- Order summary display
- Shipping address confirmation
- Order ID tracking
- Email confirmation sent automatically

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository to Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_CONVEX_URL`
   - `RESEND_API_KEY`
4. Deploy!

### Deploy to Netlify

1. Push your code to GitHub
2. Import your repository to Netlify
3. Add environment variables
4. Deploy!

## 📝 API Routes

### POST `/api/send-email`

Sends order confirmation email to customer.

**Request Body**:
```json
{
  "email": "customer@example.com",
  "name": "John Doe",
  "orderId": "ORD-123456789",
  "items": [...],
  "total": 2999,
  "shipping": 50,
  "subtotal": 2999,
  "tax": 600,
  "address": "123 Main St",
  "city": "New York",
  "country": "United States",
  "zipCode": "10001"
}
```

## 🔍 Testing

Test the checkout flow:

1. Add items to cart
2. Navigate to checkout
3. Fill out the form
4. Submit order
5. Check email for confirmation
6. View order confirmation page

## 📄 License

This project is part of the HNG Internship program.

## 👥 Contributors

Built as part of the HNG Internship Stage 3a task.

---

**Note**: Make sure to set up your Convex deployment and Resend API key before running the application.

