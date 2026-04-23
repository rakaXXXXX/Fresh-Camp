'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const iconMap = {
  'carrier': '🎒',
  'jacket': '🧥',
  'fly sheet': '⛺',
  'tent': '⛺',
  'hiking shoes': '👞',
  default: '📦'
}

export default function CategorySection() {
  const router = useRouter()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [hoveredCategory, setHoveredCategory] = useState(null)

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch categories:', err)
        setLoading(false)
      })
  }, [])

  const handleCategoryClick = (categorySlug) => {
    router.push(`/category?filter=${categorySlug}`)
  }

  if (loading) {
    return (
      <div className="w-full h-full bg-gray-50 flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B9D83] mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading categories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-gray-50 flex items-center justify-center py-12">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-center space-x-4 mt-16">
          <button className="hidden md:block p-3 rounded-full bg-white shadow-md hover:shadow-lg transition-all">
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-12">
            {categories.map((category) => {
              const icon = iconMap[category.name.toLowerCase()] || iconMap.default
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.slug)}
                  onMouseEnter={() => setHoveredCategory(category.id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className="flex flex-col items-center space-y-3 group cursor-pointer"
                >
                  <div
                    className={`w-24 h-24 md:w-32 md:h-32 rounded-full bg-white shadow-lg flex items-center justify-center transition-all duration-300 ${
                      hoveredCategory === category.id
                        ? 'scale-110 shadow-2xl bg-[#8B9D83]/10'
                        : 'group-hover:scale-105'
                    }`}
                  >
                    <span className="text-5xl md:text-6xl">{icon}</span>
                  </div>

                  <div className="text-center">
                    <h3 className="text-base md:text-lg font-semibold text-gray-800 group-hover:text-[#8B9D83] transition">
                      {category.name}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-500">{category._count.products} Items</p>
                  </div>
                </button>
              )
            })}
          </div>

          <button className="hidden md:block p-3 rounded-full bg-white shadow-md hover:shadow-lg transition-all">
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  )
}

