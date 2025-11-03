import Image from 'next/image'

export default function About() {
  return (
    <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-20 lg:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
        {/* Content */}
        <div className="order-1 lg:order-1 text-center lg:text-left">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8 uppercase tracking-wide leading-tight px-4 sm:px-0">
            Bringing you the{' '}
            <span className="text-primary">best</span> audio gear
          </h2>
          <p className="text-dark/60 leading-relaxed max-w-lg mx-auto lg:mx-0 text-sm sm:text-base px-4 sm:px-0">
            Located at the heart of New York City, Audiophile is the premier store for high end headphones, earphones, speakers, and audio accessories. We have a large showroom and luxury demonstration rooms available for you to browse and experience a wide range of our products. Stop by our store to meet some of the fantastic people who make Audiophile the best place to buy your portable audio equipment.
          </p>
        </div>

        {/* Image */}
        <div className="relative w-full aspect-square rounded-lg overflow-hidden order-2 lg:order-2">
          <Image
            src="/assets/shared/desktop/image-best-gear.jpg"
            alt="Best audio gear"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </section>
  )
}

