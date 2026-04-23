'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { z } from 'zod'
import { registerSchema } from '@/lib/validations/auth'
import Image from 'next/image'
import { useEffect } from 'react'

export default function RegisterPage() {
  const router = useRouter()
  const { status } = useSession()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [clientErrors, setClientErrors] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Client-side validation
    try {
      const tempData = { ...formData, confirmPassword: undefined }
      registerSchema.parse(tempData)
      
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: 'Error',
          description: 'Password konfirmasi tidak cocok',
          variant: 'destructive',
        })
        return
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.errors[0]?.message || 'Form tidak valid',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: 'Error',
          description: data.error || 'Terjadi kesalahan saat registrasi',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Success',
        description: 'Registrasi berhasil! Silakan login.',
      })
      router.push('/login')
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat registrasi',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/')
    }
  }, [status, router])

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

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Logo */}
           <div className="flex justify-center mb-8">
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center shadow-lg">
               <Image
      src='/2.png'
      alt="Logo"
      width={80}
      height={80}
    />
            </div>
          </div>

          {/* Register Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <Input
                  type="text"
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="example@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10"
                  />
                </div>
              </div>

              {/* Register Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#6B8E6B] hover:bg-[#5a7a5a] text-white py-3 rounded-lg font-medium transition-colors mt-6"
              >
                {loading ? 'Loading...' : 'Register'}
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">or</span>
                </div>
              </div>

              {/* Google Sign In */}
              <Button
                type="button"
                onClick={() => {
                  toast({
                    title: 'Info',
                    description: 'Silakan gunakan halaman login untuk Google OAuth',
                  })
                  router.push('/login')
                }}
                variant="outline"
                className="w-full py-3 rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center justify-center space-x-2 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="font-medium text-gray-700">Login with google</span>
              </Button>

              {/* Facebook Sign In - Disabled */}
              <Button
                type="button"
                disabled={true}
                variant="outline"
                className="w-full py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center space-x-2 transition-colors opacity-50 cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="font-medium">Login with Facebook</span>
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <span className="text-sm text-gray-600">have an account? </span>
              <Link href="/login" className="text-sm text-blue-500 hover:underline font-medium">
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
