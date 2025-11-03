import type { Metadata } from 'next'
import { Cabin } from 'next/font/google'
import './globals.css'
import { ConvexClientProvider } from '@/components/ConvexClientProvider'
import { CartProvider } from '@/context/CartContext'

const cabin = Cabin({ 
  subsets: ['latin'],
  variable: '--font-cabin',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Audiophile - Premium Audio Equipment',
  description: 'High-end headphones, earphones, and speakers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${cabin.variable} font-sans antialiased`}>
        <ConvexClientProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </ConvexClientProvider>
      </body>
    </html>
  )
}

