// components/HeroSection.jsx
'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Sparkles, Shield, Truck, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useIsMobile } from '@/hooks/use-mobile'

const heroSlides = [
  {
    image: 'https://images.unsplash.com/photo-1597574523731-7d5ace5a8e8b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2ODh8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGhpa2luZyUyMGJhY2twYWNrZXJ8ZW58MHx8fGdyZWVufDE3NzAxODM3NDR8MA&ixlib=rb-4.1.0&q=85',
    subtitle: '100% Quality & Reliable',
    title: 'Dirty Outdoor Gear?',
    highlight: 'Expert Cleaning',
    description: 'Specialized techniques to clean, protect, and extend gear life.',
    color: 'from-[#8B9D83]/90 to-[#6B8E6B]/90',
    icon: <RefreshCw className="w-5 h-5" />
  },
  {
    image: 'https://images.unsplash.com/photo-1484068592442-1602183ad661?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2ODh8MHwxfHNlYXJjaHwyfHxtb3VudGFpbiUyMGhpa2luZyUyMGJhY2twYWNrZXJ8ZW58MHx8fGdyZWVufDE3NzAxODM3NDR8MA&ixlib=rb-4.1.0&q=85',
    subtitle: 'Premium Collection',
    title: 'Outdoor Equipment',
    highlight: 'For Every Journey',
    description: 'Explore premium gear designed for true adventurers.',
    color: 'from-[#4A6FA5]/90 to-[#2C3E50]/90',
    icon: <Sparkles className="w-5 h-5" />
  },
  {
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2ODh8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGxhbmRzY2FwZXxlbnwwfHx8Z3JlZW58MTc3MDE4Mzc0NHww&ixlib=rb-4.1.0&q=85',
    subtitle: 'Fast & Secure',
    title: 'Delivery Service',
    highlight: 'Nationwide',
    description: 'Fast delivery and secure packaging for all your gear.',
    color: 'from-[#D4A574]/90 to-[#B8860B]/90',
    icon: <Truck className="w-5 h-5" />
  }
]

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const router = useRouter()
  const isMobile = useIsMobile()

  useEffect(() => {
    if (!isHovered) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
      }, 5000)
      return () => clearInterval(timer)
    }
  }, [isHovered])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  }

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  // Features untuk ditampilkan di hero
  const features = [
    { icon: <Shield className="w-4 h-4" />, text: '100% Safe Cleaning' },
    { icon: <Truck className="w-4 h-4" />, text: 'Free Shipping' },
    { icon: <RefreshCw className="w-4 h-4" />, text: '30-Day Return' }
  ]

  return (
    <div className="relative w-full h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hero Background dengan Overlay Gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out transform ${
            isHovered ? 'scale-105' : 'scale-100'
          }`}
          style={{ 
            backgroundImage: `url(${heroSlides[currentSlide].image})`,
            backgroundPosition: isMobile ? 'center 30%' : 'center'
          }}
        />
        
        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-b ${heroSlides[currentSlide].color} via-black/40 to-black/60`} />
      </div>

      {/* Content Container */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="max-w-3xl text-white">
          {/* Subtitle */}
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              <p className="text-xs sm:text-sm font-medium tracking-wide">
                {heroSlides[currentSlide].subtitle}
              </p>
            </div>
            {heroSlides[currentSlide].icon}
          </div>

          {/* Title */}
          <h1 className={`${isMobile ? 'text-3xl' : 'text-5xl lg:text-7xl'} font-bold mb-2 sm:mb-4 leading-tight`}>
            {heroSlides[currentSlide].title}
            <br />
            <span className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              {heroSlides[currentSlide].highlight}
            </span>
          </h1>

          {/* Description */}
          <p className={`${isMobile ? 'text-base' : 'text-lg lg:text-xl'} mb-6 sm:mb-8 max-w-xl text-gray-100 leading-relaxed`}>
            {heroSlides[currentSlide].description}
          </p>

          {/* Features - Responsif untuk semua perangkat */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                <span className="text-white">{feature.icon}</span>
                <span className="text-xs sm:text-sm">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className={`flex ${isMobile ? 'flex-col gap-3' : 'flex-row gap-4'} items-center`}>
            <Button
              onClick={() => router.push('/category')}
              className={`${isMobile ? 'w-full py-4' : 'px-8 py-6'} bg-[#8B9D83] hover:bg-[#7a8a72] text-white rounded-full shadow-lg transition-all duration-300 hover:shadow-xl text-base sm:text-lg font-medium`}
            >
              Shop Now
            </Button>
          </div>

          {/* Stats - Desktop & Tablet */}
          {!isMobile && (
            <div className="absolute bottom-8 left-0 right-0">
              <div className="flex justify-center space-x-8 sm:space-x-12">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white">500+</div>
                  <div className="text-sm sm:text-base text-gray-200">Gears Cleaned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white">4.9★</div>
                  <div className="text-sm sm:text-base text-gray-200">Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white">24/7</div>
                  <div className="text-sm sm:text-base text-gray-200">Support</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Slider Indicators */}
        <div className={`absolute ${isMobile ? 'bottom-4' : 'bottom-8'} left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-3`}>
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white w-6 sm:w-8 h-2 sm:h-3 rounded-full' 
                  : 'bg-white/50 w-2 sm:w-3 h-2 sm:h-3 rounded-full hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Navigation Arrows - Desktop & Tablet */}
        {!isMobile && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 p-3 rounded-full transition-all duration-300 hover:scale-110"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 p-3 rounded-full transition-all duration-300 hover:scale-110"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </>
        )}

        {/* Swipe Indicator for Mobile */}
        {isMobile && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white/70 text-xs">
            Swipe for more
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <div 
          className="h-full bg-white transition-all duration-5000 ease-linear"
          style={{ 
            width: isHovered ? '100%' : '0%',
            animation: isHovered ? 'none' : 'progress 5s linear forwards'
          }}
        />
      </div>

      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  )
}