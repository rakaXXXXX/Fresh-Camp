'use client'

import { Star, ArrowUpRight } from 'lucide-react'

export default function FeaturedProduct() {
  return (
    <div className="w-full h-full bg-white flex items-center justify-center py-12">
      <div className="container mx-auto px-6">
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 italic">
            Featured Product
          </h2>
        </div>

        {/* Product Card */}
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Left - Text Content */}
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-lg text-gray-700 leading-relaxed">Clean gear.</p>
              <p className="text-lg text-gray-700 leading-relaxed">Quiet confidence.</p>
              <p className="text-lg text-gray-700 leading-relaxed">Washed, worn, and ready again.</p>
              <p className="text-lg text-gray-700 leading-relaxed">Every thread tells a journey.</p>
              <p className="text-lg text-gray-700 leading-relaxed">Fresh layers for wild paths ahead.</p>
            </div>
          </div>

          {/* Right - Product Image */}
          <div className="relative">
            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl group">
              <img
                src="https://images.unsplash.com/photo-1597574523731-7d5ace5a8e8b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2ODh8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGhpa2luZyUyMGJhY2twYWNrZXJ8ZW58MHx8fGdyZWVufDE3NzAxODM3NDR8MA&ixlib=rb-4.1.0&q=85"
                alt="Featured Product"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              
              {/* Overlay Badge */}
              <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full">
                <p className="text-white text-sm font-medium">15 items</p>
              </div>

              {/* Arrow Button */}
              <button className="absolute top-6 right-6 bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110">
                <ArrowUpRight className="w-6 h-6 text-gray-800" />
              </button>

              {/* Rating Badge */}
              <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center space-x-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-gray-800 font-semibold">5.5</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
