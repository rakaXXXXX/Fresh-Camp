'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Navbar from '@/components/Navbar'
import dynamic from 'next/dynamic'
const HeroSection = dynamic(() => import('@/components/HeroSection'), { ssr: false })
const CategorySection = dynamic(() => import('@/components/CategorySection'), { ssr: false })
const FeaturedProduct = dynamic(() => import('@/components/FeaturedProduct'), { ssr: false })
const ProductShowcase = dynamic(() => import('@/components/ProductShowcase'), { ssr: false })
const CampSection = dynamic(() => import('@/components/CampSection'), { ssr: false })
import Footer from '@/components/Footer'

export default function HomeClient() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    console.log("SESSION:", session)
  }, [session])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B9D83] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Scroll Snap Container */}
      <div className="snap-y snap-mandatory h-screen overflow-y-scroll">
        {/* Hero Section */}
        <section className="snap-start h-screen">
          <HeroSection />
        </section>

        {/* Category Section */}
        <section className="snap-start h-screen">
          <CategorySection />
        </section>

        {/* Featured Product */}
        <section className="snap-start h-screen">
          <FeaturedProduct />
        </section>

        {/* Product Showcase */}
        <section className="snap-start h-screen">
          <ProductShowcase
            imageUrl="https://images.unsplash.com/photo-1484068592442-1602183ad661?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2ODh8MHwxfHNlYXJjaHwyfHxtb3VudGFpbiUyMGhpa2luZyUyMGJhY2twYWNrZXJ8ZW58MHx8fGdyZWVufDE3NzAxODM3NDR8MA&ixlib=1.0&qrb-4.=85"
            items="8"
            rating="5.5"
            title="Clean fabric, renewed spirit."
            subtitle="A backpack restored to its natural strength."
            description="From dirt to dignity.\nWhere every wash brings it back to life."
            reverse={false}
          />
        </section>

        {/* Camp Section */}
        <section className="snap-start h-screen">
          <CampSection />
        </section>

        {/* Footer */}
        <section className="snap-start">
          <Footer />
        </section>
      </div>
    </div>
  )
}
