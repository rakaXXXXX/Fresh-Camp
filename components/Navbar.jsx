'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { useCart } from '@/hooks/useCart'
import Image from 'next/image'
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function Navbar() {
  const { data: session } = useSession()
  const { getCartTotalItems } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const cartCount = getCartTotalItems ? getCartTotalItems() : 0

  const handleLogout = async () => {
  try {
    // clear client storage (optional)
    localStorage.removeItem("token")
    sessionStorage.clear()

    // logout + redirect
    await signOut({
      callbackUrl: "/login",
    })

  } catch (error) {
    console.error("Logout error:", error)
    window.location.href = "/login"
  }
}

  return (
    <nav className="fixed top-0 left-0 right-0 bg-[#8B9D83] shadow-md z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center">
          {/* Logo + Menu */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-3">
              <div className="bg-white rounded-full p-3 shadow-lg">
                <div className="w-12 h-12 relative">
                  <Image 
                    src='/1.png'
                    alt="FreshCamp Logo"
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#2C3E2E" strokeWidth="2" />
                </div>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-6">
              <Link href="/" className="text-white hover:text-gray-200 transition font-medium">
                Home
              </Link>
              <Link href="/category" className="text-white hover:text-gray-200 transition font-medium">
                Category
              </Link>
              <Link href="/order" className="text-white hover:text-gray-200 transition font-medium">
                Order
              </Link>
            </div>
          </div>

          {/* Search + Right Icons */}
          <div className="ml-auto flex items-center space-x-6">
            {/* Right Icons */}
            <div className="flex items-center space-x-4">
              {/* Cart */}
              <Link href="/cart" className="relative group">
                <button className="text-white hover:text-gray-200 transition relative">
                  <ShoppingCart className="w-6 h-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </button>
                <div className="absolute top-full right-0 mt-2 w-40 bg-gray-900 text-white text-sm rounded-lg p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  View Cart ({cartCount} item{cartCount !== 1 ? 's' : ''})
                </div>
              </Link>

              {/* Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger className="text-white hover:text-gray-200 transition">
                  <Avatar className="w-10 h-10 border-2 border-muted">
                    <AvatarImage src={session?.user?.image || undefined} />
                    <AvatarFallback>
                      <User className="w-5 h-5 text-[#8B9D83]" />
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {session ? (
                    <>
                      <div className="px-2 py-2">
                        <p className="text-sm font-medium">{session?.user?.name || session?.user?.email}</p>
                        <p className="text-xs text-gray-500">{session?.user?.email}</p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile">Dashboard</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/profile">Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/order">My Orders</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={handleLogout}
                        className="text-red-600 cursor-pointer"
                      >
                        Logout
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/login">Login</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/register">Register</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu */}
              <button
                className="lg:hidden text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 space-y-4">
            <Link 
              href="/" 
              className="block text-white hover:text-gray-200 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/category" 
              className="block text-white hover:text-gray-200 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Category
            </Link>
            <Link 
              href="/order" 
              className="block text-white hover:text-gray-200 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Order
            </Link>
            <Link 
              href="/cart" 
              className="flex items-center text-white hover:text-gray-200 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Cart
              {cartCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
