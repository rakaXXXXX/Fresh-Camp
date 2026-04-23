'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#8B9D83] text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-white rounded-full p-2 w-12 h-12 relative">
                <Image src='/1.png'
                  alt="FreshCamp Logo"
                  width={48}
                  height={48}
                  className="rounded-full"/>
              </div>
              <span className="text-xl font-bold">FreshCamp</span>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">
              High-tech care. Adventure with confidence.
            </p>
            <p className="text-xs text-white/60">
              Wash outdoor gear. Adventure with confidence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-white/80 hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/category" className="text-sm text-white/80 hover:text-white transition">
                  Category
                </Link>
              </li>
              <li>
                <Link href="/order" className="text-sm text-white/80 hover:text-white transition">
                  Order
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-white/80 hover:text-white transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-white/80">123 Mountain View Rd, Adventure City</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm text-white/80">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm text-white/80">info@freshcamp.com</span>
              </li>
            </ul>
          </div>

          {/* Social & Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4 mb-6">
              <a href="#" className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
            <div className="space-y-2">
              <Link href="/privacy" className="block text-sm text-white/80 hover:text-white transition">
                Privacy Policy
              </Link>
              <Link href="/terms" className="block text-sm text-white/80 hover:text-white transition">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-white/20 text-center">
          <p className="text-sm text-white/60">
            © 2025 FreshCamp. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
