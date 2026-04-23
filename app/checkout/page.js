'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { CheckCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'

export default function CheckoutSuccess() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [orderNumber, setOrderNumber] = useState('')
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const orderNum = searchParams.get('orderNumber')
    const tot = searchParams.get('total')
    if (orderNum) {
      setOrderNumber(orderNum)
      setTotal(parseFloat(tot || '0'))
    }
    setLoading(false)
  }, [searchParams])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!orderNumber || !session) {
    router.push('/cart')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-6 max-w-2xl">
          <div className="text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Order Berhasil!</h1>
            <p className="text-xl text-gray-600 mb-8">Terima kasih atas pembelian Anda.</p>
            
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Detail Pesanan</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nomor Pesanan</span>
                  <span className="font-semibold">{orderNumber}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-green-600">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="text-sm text-gray-500 pt-4 border-t">
                  Pembayaran melalui Bank Transfer. Pesanan akan diproses dalam 24 jam.
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-[#8B9D83] hover:bg-[#7a8a72] text-white w-full sm:w-auto"
                onClick={() => router.push('/order')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Lihat Pesanan
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/')}
                className="w-full sm:w-auto"
              >
                Belanja Lagi
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

