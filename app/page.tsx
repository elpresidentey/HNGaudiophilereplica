import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Categories from '@/components/Categories'
import FeaturedProduct from '@/components/FeaturedProduct'
import About from '@/components/About'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <Categories />
      <FeaturedProduct />
      <About />
      <Footer />
    </main>
  )
}

