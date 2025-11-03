import Link from 'next/link'
import Image from 'next/image'

export default function Categories() {
  const categories = [
    {
      name: 'Headphones',
      href: '/headphones',
      image: '/assets/shared/desktop/image-category-thumbnail-headphones.png',
    },
    {
      name: 'Speakers',
      href: '/speakers',
      image: '/assets/shared/desktop/image-category-thumbnail-speakers.png',
    },
    {
      name: 'Earphones',
      href: '/earphones',
      image: '/assets/shared/desktop/image-category-thumbnail-earphones.png',
    },
  ]

  return (
    <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-20 lg:py-24">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {categories.map((category) => (
          <Link
            key={category.name}
            href={category.href}
            className="group bg-light rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 relative min-h-[180px] sm:min-h-[200px] flex flex-col"
          >
            {/* Product Image */}
            <div className="relative flex-1 flex items-center justify-center pt-8 sm:pt-12 pb-4 sm:pb-6">
              <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-contain drop-shadow-lg"
                />
              </div>
            </div>
            
            {/* Content */}
            <div className="px-4 sm:px-6 pb-6 sm:pb-8 text-center">
              <h3 className="text-base sm:text-lg font-bold uppercase tracking-wider mb-3 sm:mb-4 text-dark">
                {category.name}
              </h3>
              
              <div className="flex items-center justify-center gap-2 sm:gap-3 text-dark/60 group-hover:text-primary transition-colors">
                <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider">
                  Shop
                </span>
                <svg 
                  width="8" 
                  height="12" 
                  viewBox="0 0 8 12" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="transform group-hover:translate-x-1 transition-transform w-2 h-3 sm:w-2 sm:h-3"
                >
                  <path 
                    d="M1.32178 1L6.32178 6L1.32178 11" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

