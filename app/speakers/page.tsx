import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductGrid from '@/components/ProductGrid'
import GoBack from '@/components/GoBack'
import { getProductsByCategory } from '@/lib/products'

export default function SpeakersPage() {
  const speakers = getProductsByCategory('speakers')
  
  return (
    <main>
      <Header />
      <div className="container mx-auto px-6 py-8">
        <GoBack />
      </div>
      <section className="bg-dark text-white py-24">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold uppercase text-center">Speakers</h1>
        </div>
      </section>
      <section className="container mx-auto px-6 py-24">
        <ProductGrid products={speakers} />
      </section>
      <Footer />
    </main>
  )
}

