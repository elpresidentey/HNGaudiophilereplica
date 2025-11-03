import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductDetail from '@/components/ProductDetail'
import db from '@/app/db.json'

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = db.data.find(p => p.slug === params.slug)
  
  if (!product) {
    return (
      <main>
        <Header />
        <div className="container mx-auto px-6 py-24 text-center">
          <h1 className="text-4xl font-bold mb-4">Product not found</h1>
          <p className="text-dark/60">The product you&apos;re looking for doesn&apos;t exist.</p>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main>
      <Header />
      <ProductDetail product={product} />
      <Footer />
    </main>
  )
}

