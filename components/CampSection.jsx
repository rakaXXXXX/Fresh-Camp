'use client'

import { Star, ArrowUpRight } from 'lucide-react'

export default function CampSection() {
  return (
    <div className="w-full h-full bg-white flex items-center justify-center py-12">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Left - Text Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="text-lg text-gray-700 leading-relaxed">A quiet camp beneath tall trees.</p>
              <p className="text-lg text-gray-700 leading-relaxed">Simple shelter, gentle atmosphere.</p>
              <p className="text-lg text-gray-700 leading-relaxed">Soft light, calm air.</p>
              <p className="text-lg text-gray-700 leading-relaxed">Built to rest, made to belong.</p>
              <p className="text-lg text-gray-700 leading-relaxed">Where silence feels natural.</p>
            </div>
          </div>

          {/* Right - Camp Image */}
          <div className="relative">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl group">
              <img
                src="https://images.pexels.com/photos/1309586/pexels-photo-1309586.jpeg"
                alt="Camp Scene"
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
