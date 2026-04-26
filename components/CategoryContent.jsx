'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import QuickViewModal from '@/components/QuickViewModal'
import { Star, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks/useCart'

const categories = [
  { id: 'all', name: 'All Products' },
  { id: 'carrier', name: 'Carrier' },
  { id: 'jacket', name: 'Jacket' },
  { id: 'flysheet', name: 'Fly Sheet' },
  { id: 'tent', name: 'Tent' },
  { id: 'hiking-shoes', name: 'Hiking Shoes' },
]

export default function CategoryContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const filterParam = searchParams.get('filter')
  
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [productsData, setProductsData] = useState({ products: [], pagination: {} })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)
  const cartHook = useCart()

  const loadProducts = useCallback(async (currentPage = 1, reset = false) => {
    setLoading(currentPage === 1)
    setLoadingMore(currentPage > 1)
    setError(null)
    
    try {
      let url = `/api/products?limit=24&page=${currentPage}`
      if (selectedCategory !== 'all') {
        url += `&category=${selectedCategory}`
      }
      
      const res = await fetch(url)
      
      if (!res.ok) {
        throw new Error(`API error: ${res.status} ${res.statusText}`)
      }
      
      const data = await res.json()
      
      setProductsData(prev => ({
        products: reset || currentPage === 1 ? (data.products || []) : [...prev.products, ...(data.products || [])],
        pagination: data.pagination || {}
      }))
      
      setHasMore((data.pagination?.page || 1) < (data.pagination?.totalPages || 1))
    } catch (err) {
      console.error('Load products error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [selectedCategory])

  useEffect(() => {
    loadProducts(1, true)
  }, [selectedCategory, loadProducts])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (filterParam) {
      setSelectedCategory(filterParam)
    }
  }, [filterParam])

  const handleQuickView = (product) => {
    setQuickViewProduct(product)
    setIsQuickViewOpen(true)
  }

  const handleCloseQuickView = () => {
    setIsQuickViewOpen(false)
    setTimeout(() => setQuickViewProduct(null), 300)
  }

  const handleAddToCart = async (productId, quantity = 1, selectedSize = null, selectedColor = null) => {
    try {
      await cartHook.addToCart(productId, quantity, selectedSize, selectedColor)
      alert('Added to cart!')
    } catch (error) {
      console.error('Add to cart error:', error)
      alert('Failed to add to cart: ' + error.message)
    }
  }

  const handleSimpleAddToCart = (productId) => {
    handleAddToCart(productId, 1)
  }

  const getRelatedProducts = () => {
    if (!quickViewProduct) return []
    return productsData.products
      .filter(p => 
        p.category?.id === quickViewProduct.category?.id && 
        p.id !== quickViewProduct.id
      )
      .slice(0, 4)
  }

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
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Shop by Category</h1>
            <p className="text-gray-600">Explore our premium outdoor equipment collection</p>
          </div>

          {/* Category Filter */}
          <div className="mb-8 flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#8B9D83] text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {error && (
            <div className="col-span-full text-center py-12">
              <p className="text-red-500 text-lg mb-4">Error loading products: {error}</p>
              <button 
                onClick={() => loadProducts(1, true)}
                className="bg-[#8B9D83] text-white px-6 py-2 rounded-full hover:bg-[#7a8a72] transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {loading && productsData.products.length === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-xl mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded-full"></div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productsData.products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group"
              >
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={product.images?.[0] || product.image || '/placeholder-product.jpg'}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button 
                      className="bg-white text-gray-900 hover:bg-gray-100"
                      onClick={() => handleQuickView(product)}
                    >
                      Quick View
                    </Button>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                  
                  <div className="flex items-center mb-3">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="ml-1 text-sm font-medium text-gray-700">
                      {product.rating?.toFixed(1) || 'N/A'} ({product.reviewCount || 0})
                    </span>
                  </div>  
                  
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-[#8B9D83]">
                      Rp. {product.price?.toLocaleString('id-ID')}
                    </span>
                    <Button 
                      size="sm" 
                      className="bg-[#8B9D83] hover:bg-[#7a8a72]"
                      onClick={() => handleSimpleAddToCart(product.id)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {productsData.products.length === 0 && !loading && !error && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found in this category.</p>
            </div>
          )}

          {loadingMore && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B9D83] mx-auto"></div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          isOpen={isQuickViewOpen}
          onClose={handleCloseQuickView}
          relatedProducts={getRelatedProducts()}
          onAddToCart={handleAddToCart}
          onQuickView={handleQuickView}
        />
      )}
    </div>
  )
}

