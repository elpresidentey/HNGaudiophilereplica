import Link from 'next/link'
import Image from 'next/image'

export default function Hero() {
  return (
    <section className="bg-dark text-white relative overflow-hidden min-h-screen">
      {/* Background Pattern - Matching the Figma design */}
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 opacity-20 hidden lg:block">
        <svg width="944" height="944" viewBox="0 0 944 944" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="472" cy="472" r="235.5" stroke="white" strokeOpacity="0.1"/>
          <circle cx="472" cy="472" r="270.5" stroke="white" strokeOpacity="0.1"/>
          <circle cx="472" cy="472" r="471.5" stroke="white" strokeOpacity="0.05"/>
        </svg>
      </div>

      <div className="container mx-auto px-6 lg:px-12 xl:px-24 relative z-10 flex items-center min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 xl:gap-24 items-center w-full">
          {/* Text Content - Left Side */}
          <div className="text-center lg:text-left max-w-lg mx-auto lg:mx-0 order-2 lg:order-1">
            {/* New Product Label */}
            <p className="text-white/60 uppercase tracking-[10px] text-sm mb-6 font-normal">
              New Product
            </p>
            
            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 uppercase tracking-wide leading-tight">
              XX99 Mark II Headphones
            </h1>
            
            {/* Description */}
            <p className="text-white/75 mb-10 leading-relaxed text-base lg:text-lg max-w-md mx-auto lg:mx-0">
              Experience natural, lifelike audio and exceptional build quality made for the passionate music enthusiast.
            </p>
            
            {/* CTA Button */}
            <Link
              href="/product/xx99-mark-two-headphones"
              className="inline-block bg-primary text-white px-8 py-4 uppercase tracking-wider text-sm font-bold hover:bg-primary-light transition-colors"
            >
              See Product
            </Link>
          </div>

          {/* Hero Image - Right Side */}
          <div className="relative flex justify-center lg:justify-end order-1 lg:order-2">
            <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl">
              {/* Main Headphone Image */}
              <Image
                src="/assets/home/desktop/image-hero.jpg"
                alt="XX99 Mark II Headphones"
                width={700}
                height={700}
                className="object-contain w-full h-auto"
                priority
                quality={100}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

