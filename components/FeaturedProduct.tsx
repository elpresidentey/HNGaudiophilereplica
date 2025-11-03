import Link from 'next/link'
import Image from 'next/image'

export default function FeaturedProduct() {
  return (
    <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-20 lg:py-24 space-y-8 sm:space-y-12">
      {/* ZX9 Speaker - Orange Background */}
      <div className="bg-primary rounded-lg relative overflow-hidden min-h-[400px] sm:min-h-[500px] lg:min-h-[560px] flex items-center">
        {/* Background Pattern - Hidden on mobile for better performance */}
        <div className="hidden lg:block absolute right-0 top-0 opacity-20">
          <svg width="944" height="944" viewBox="0 0 944 944" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="472" cy="472" r="235.5" stroke="white" strokeOpacity="0.2"/>
            <circle cx="472" cy="472" r="270.5" stroke="white" strokeOpacity="0.2"/>
            <circle cx="472" cy="472" r="471.5" stroke="white" strokeOpacity="0.2"/>
          </svg>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full px-6 sm:px-8 lg:px-12 py-12 sm:py-14 lg:py-16 relative z-10">
          {/* Image */}
          <div className="relative flex justify-center order-1 lg:order-1">
            <div className="relative w-full max-w-xs sm:max-w-sm">
              <Image
                src="/assets/home/desktop/image-speaker-zx9.png"
                alt="ZX9 Speaker"
                width={400}
                height={500}
                className="object-contain w-full h-auto"
              />
            </div>
          </div>

          {/* Content */}
          <div className="text-center lg:text-left text-white order-2 lg:order-2">
            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-4 sm:mb-6 uppercase tracking-wider leading-tight">
              ZX9<br />Speaker
            </h2>
            <p className="text-white/75 mb-8 sm:mb-10 leading-relaxed max-w-md mx-auto lg:mx-0 text-sm sm:text-base px-4 sm:px-0">
              Upgrade to premium speakers that are phenomenally built to deliver truly remarkable sound.
            </p>
            <div className="flex justify-center lg:justify-start">
              <Link
                href="/product/zx9-speaker"
                className="bg-dark text-white px-8 py-4 uppercase tracking-wider text-sm font-bold hover:bg-dark-light transition-colors inline-block"
              >
                See Product
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ZX7 Speaker */}
      <div className="relative rounded-lg overflow-hidden min-h-[240px] sm:min-h-[280px] lg:min-h-[320px] flex items-center">
        <Image
          src="/assets/home/desktop/image-speaker-zx7.jpg"
          alt="ZX7 Speaker"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 flex items-center px-6 sm:px-8 lg:px-12 bg-black/20">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-8 uppercase text-white">ZX7 Speaker</h2>
            <Link
              href="/product/zx7-speaker"
              className="bg-transparent border-2 border-white text-white px-8 py-4 uppercase tracking-wider text-sm font-bold hover:bg-white hover:text-dark transition-colors inline-block"
            >
              See Product
            </Link>
          </div>
        </div>
      </div>

      {/* YX1 Earphones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <div className="relative aspect-square rounded-lg overflow-hidden">
          <Image
            src="/assets/home/desktop/image-earphones-yx1.jpg"
            alt="YX1 Earphones"
            fill
            className="object-cover"
          />
        </div>
        <div className="bg-light rounded-lg p-6 sm:p-8 lg:p-12 flex flex-col justify-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 uppercase">YX1 Earphones</h2>
          <div>
            <Link
              href="/product/yx1-earphones"
              className="bg-transparent border-2 border-dark text-dark px-8 py-4 uppercase tracking-wider text-sm font-bold hover:bg-dark hover:text-white transition-colors inline-block"
            >
              See Product
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

