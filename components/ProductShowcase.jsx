'use client'

import { Star, ArrowUpRight } from 'lucide-react'

export default function ProductShowcase({ imageUrl, items, rating, title, subtitle, description, reverse = false }) {
  return (
    <div className="w-full h-full bg-white flex items-center justify-center py-12">
      <div className="container mx-auto px-6">
        <div className={`max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center ${
          reverse ? 'md:flex-row-reverse' : ''
        }`}>
          {/* Image Side */}
          <div className={`relative ${reverse ? 'md:order-2' : ''}`}>
            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl group">
              <img
                src = "https://images.unsplash.com/photo-1484068592442-1602183ad661?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2ODh8MHwxfHNlYXJjaHwyfHxtb3VudGFpbiUyMGhpa2luZyUyMGJhY2twYWNrZXJ8ZW58MHx8fGdyZWVufDE3NzAxODM3NDR8MA&ixlib=rb-4.1.0&q=85"
                alt="Product Showcase"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              
              {/* Overlay Badge */}
              <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full">
                <p className="text-white text-sm font-medium">8 items</p>
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
          

          {/* Text Side */}
          <div className={`space-y-6 ${reverse ? 'md:order-1' : ''}`}>
            <div className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-semibold text-gray-900">Clean fabric, renewed spirit<span></span></h3>
              <p className="text-lg text-gray-700">A backpack restored to its natural strength.</p>
              <div className="space-y-2">
                {description.split('\n').map((line, index) => (
                  <p key={index} className="text-base text-gray-600 leading-relaxed">
                   From dirt to dignity.Where every wash brings it back to life.
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
