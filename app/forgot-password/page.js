'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mountain, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast.jsx'
import Image from 'next/image'

export default function ForgotPasswordPage() {
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)

  const res = await fetch("/api/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })

  const data = await res.json()

  toast({
    title: "Success",
    description: data.message,
  })

  setLoading(false)
  setEmail("")
}

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Geometric Background */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-100">
        {/* Diagonal Layers */}
        <div className="absolute inset-0">
          {/* Green Sage Layer */}
          <div 
            className="absolute inset-0 bg-[#8BA888]" 
            style={{
              clipPath: 'polygon(0 0, 100% 0, 40% 100%, 0 100%)'
            }}
          />
          
          {/* Gray Layer */}
          <div 
            className="absolute inset-0 bg-gray-300" 
            style={{
              clipPath: 'polygon(40% 0, 100% 0, 60% 100%, 25% 100%)'
            }}
          />
          
          {/* White Layer */}
          <div 
            className="absolute inset-0 bg-white" 
            style={{
              clipPath: 'polygon(60% 0, 100% 0, 100% 100%, 50% 100%)'
            }}
          />
        </div>
      </div>

      {/* Right Side - Forgot Password Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Logo */}
            <div className="flex justify-center mb-8">
                      <div className="w-24 h-24 rounded-2xl flex items-center justify-center shadow-lg">
                         <Image
                src='2.png'
                alt="Deskripsi Gambar"
                 width={500}
                height={500}
              />
                      </div>
                    </div>
          {/* Forgot Password Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <Link 
              href="/login" 
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Login</span>
            </Link>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
            <p className="text-gray-600 mb-6">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="example@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#6B8E6B] hover:bg-[#5a7a5a] text-white py-3 rounded-lg font-medium transition-colors"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
