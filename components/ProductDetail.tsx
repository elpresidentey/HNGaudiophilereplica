"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import CartModal from './CartModal'
import ItemAddedModal from './ItemAddedModal'
import GoBack from './GoBack'
import { getBestImage } from '@/lib/imageUtils'

interface Product {
  id: number
  slug: string
  name: string
  category: string
  image: {
    mobile: string
    tablet: string
    desktop: string
  }
  categoryImage: {
    mobile: string
    tablet: string
    desktop: string
  }
  new?: boolean
  price: number
  description: string
  features: string
  includes: Array<{
    quantity: number
    item: string
  }>
  gallery: {
    first: { mobile: string; tablet: string; desktop: string }
    second: { mobile: string; tablet: string; desktop: string }
    third: { mobile: string; tablet: string; desktop: string }
  }
}

interface ProductDetailProps {
  product: Product
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isItemAddedModalOpen, setIsItemAddedModalOpen] = useState(false)
  const [addedItem, setAddedItem] = useState<{
    id: number
    name: string
    price: number
    image: string
    quantity: number
  } | null>(null)
  const { addToCart } = useCart()

  const handleAddToCart = () => {
    const itemToAdd = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: getBestImage(product.image),
      slug: product.slug,
      quantity,
    }
    
    addToCart(itemToAdd)
    
    // Set the added item for the modal
    setAddedItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: getBestImage(product.image),
      quantity,
    })
    
    // Show item added modal
    setIsItemAddedModalOpen(true)
  }

  const categoryPath = '/' + product.category

  return (
    <>
      <div className="container mx-auto px-6 py-8">
        <GoBack />
      </div>

      <section className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
          {/* Product Image */}
          <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-light">
            <Image
              src={getBestImage(product.image)}
              alt={product.name}
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center">
            {product.new && (
              <p className="text-primary text-sm uppercase tracking-wider mb-4">New Product</p>
            )}
            <h1 className="text-4xl md:text-5xl font-bold mb-6 uppercase">{product.name}</h1>
            <p className="text-dark/60 mb-6 leading-relaxed">{product.description}</p>
            <p className="text-2xl font-bold mb-8">${product.price.toLocaleString()}</p>

            {/* Quantity and Add to Cart */}
            <div className="flex gap-4 items-center">
              <div className="flex items-center bg-light px-4 py-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-dark/60 hover:text-primary transition-colors px-2"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-12 text-center font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="text-dark/60 hover:text-primary transition-colors px-2"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-primary text-white px-8 py-4 uppercase tracking-wider font-bold hover:bg-primary-light transition-colors"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>

        {/* Features and Includes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
          <div>
            <h2 className="text-2xl font-bold uppercase mb-6">Features</h2>
            <p className="text-dark/60 leading-relaxed whitespace-pre-line">{product.features}</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold uppercase mb-6">In the Box</h2>
            <ul className="space-y-2">
              {product.includes.map((item, index) => (
                <li key={index} className="text-dark/60">
                  <span className="text-primary font-bold mr-2">{item.quantity}x</span>
                  {item.item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-24">
          <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-light">
            <Image
              src={getBestImage(product.gallery.first)}
              alt={`${product.name} gallery 1`}
              fill
              className="object-cover"
            />
          </div>
          <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-light">
            <Image
              src={getBestImage(product.gallery.second)}
              alt={`${product.name} gallery 2`}
              fill
              className="object-cover"
            />
          </div>
          <div className="md:col-span-2 relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-light">
            <Image
              src={getBestImage(product.gallery.third)}
              alt={`${product.name} gallery 3`}
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Modals */}
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <ItemAddedModal 
        isOpen={isItemAddedModalOpen} 
        onClose={() => setIsItemAddedModalOpen(false)}
        addedItem={addedItem}
      />
    </>
  )
}

