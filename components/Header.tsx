"use client"

import Link from 'next/link'
import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import CartModal from './CartModal'

export default function Header() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { totalItems } = useCart()

  return (
    <>
      <header className="bg-dark border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-6 sm:py-8">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-white hover:text-primary transition-colors"
              aria-label="Toggle menu"
            >
              <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="16" height="3" fill="currentColor"/>
                <rect y="6" width="16" height="3" fill="currentColor"/>
                <rect y="12" width="16" height="3" fill="currentColor"/>
              </svg>
            </button>

            {/* Logo */}
            <Link href="/" className="text-white text-xl sm:text-2xl font-bold tracking-wider uppercase">
              audiophile
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex gap-8">
              <Link href="/" className="text-white text-sm font-bold uppercase tracking-wider hover:text-primary transition-colors">
                HOME
              </Link>
              <Link href="/headphones" className="text-white text-sm font-bold uppercase tracking-wider hover:text-primary transition-colors">
                HEADPHONES
              </Link>
              <Link href="/speakers" className="text-white text-sm font-bold uppercase tracking-wider hover:text-primary transition-colors">
                SPEAKERS
              </Link>
              <Link href="/earphones" className="text-white text-sm font-bold uppercase tracking-wider hover:text-primary transition-colors">
                EARPHONES
              </Link>
            </nav>

            {/* Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative hover:opacity-75 transition-opacity"
              aria-label="Shopping cart"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6">
                <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 18.1 16.1 19 15 19H9C7.9 19 7 18.1 7 17V13M17 13H7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs">
                  {totalItems}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-white/10 py-4">
              <nav className="flex flex-col gap-4">
                <Link 
                  href="/" 
                  className="text-white text-sm font-bold uppercase tracking-wider hover:text-primary transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  HOME
                </Link>
                <Link 
                  href="/headphones" 
                  className="text-white text-sm font-bold uppercase tracking-wider hover:text-primary transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  HEADPHONES
                </Link>
                <Link 
                  href="/speakers" 
                  className="text-white text-sm font-bold uppercase tracking-wider hover:text-primary transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  SPEAKERS
                </Link>
                <Link 
                  href="/earphones" 
                  className="text-white text-sm font-bold uppercase tracking-wider hover:text-primary transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  EARPHONES
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}

