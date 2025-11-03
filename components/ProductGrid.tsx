"use client"

import Link from 'next/link'
import Image from 'next/image'
import { getBestImage } from '@/lib/imageUtils'

interface Product {
  id: number
  slug: string
  name: string
  image: {
    mobile: string
    tablet: string
    desktop: string
  }
  new?: boolean
  price: number
  description: string
}

interface ProductGridProps {
  products: Product[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="space-y-16 sm:space-y-20 lg:space-y-24">
      {products.map((product, index) => (
        <div
          key={product.id}
          className={`grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center ${
            index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
          }`}
        >
          {/* Product Image */}
          <div className={`relative ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
            <div className="bg-light rounded-lg p-6 sm:p-8 lg:p-12 flex items-center justify-center min-h-[280px] sm:min-h-[350px] lg:min-h-[400px]">
              <Image
                src={getBestImage(product.image)}
                alt={product.name}
                width={400}
                height={400}
                className="object-contain max-w-full max-h-full"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className={`space-y-4 sm:space-y-6 text-center lg:text-left ${index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
            {product.new && (
              <p className="text-primary text-xs sm:text-sm font-medium uppercase tracking-[4px] sm:tracking-[8px]">
                New Product
              </p>
            )}
            
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-wide sm:tracking-wider leading-tight px-4 sm:px-0">
              {product.name}
            </h2>
            
            <p className="text-dark/75 leading-relaxed text-sm sm:text-base px-4 sm:px-0">
              {product.description}
            </p>
            
            <div className="px-4 sm:px-0">
              <p className="text-xl sm:text-2xl font-bold text-dark mb-6 text-center lg:text-left">
                ${product.price.toLocaleString()}
              </p>
              
              <div className="flex justify-center lg:justify-start">
                <Link
                  href={`/product/${product.slug}`}
                  className="bg-primary text-white px-8 py-4 uppercase tracking-wider text-sm font-bold hover:bg-primary-light transition-colors inline-block"
                >
                  See Product
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

