import productsData from '../app/db.json'

export interface Product {
  id: number
  slug: string
  name: string
  image: {
    mobile: string
    tablet: string
    desktop: string
  }
  category: string
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
  others: Array<{
    slug: string
    name: string
    image: {
      mobile: string
      tablet: string
      desktop: string
    }
  }>
}

export const products: Product[] = productsData.data as Product[]

export function getProductBySlug(slug: string): Product | undefined {
  return products.find(p => p.slug === slug)
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter(p => p.category === category)
}

