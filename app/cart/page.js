// app/cart/page.js
'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, CreditCard, Shield, Truck, RefreshCw, Package, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks/useCart'

export default function CartPage() {
  const { data: session, status } = useSession()
const router = useRouter()
  const { 
    cartItems, 
    loading, 
    updating, 
    updateQuantity, 
    removeFromCart, 
    clearCart 
  } = useCart()
  const [processingPayment, setProcessingPayment] = useState(false)

  // Calculation helpers
  const getItemPrice = (item) => Number(item.product?.salePrice || item.product?.price || item.price || 0);

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + getItemPrice(item) * item.quantity, 0)
  }

  const calculateShipping = () => {
    const subtotal = calculateSubtotal()
    return subtotal >= 200 ? 0 : 15
  }

  const calculateTax = () => {
    return calculateSubtotal() * 0.10
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping() + calculateTax()
  }

  const handleCheckout = async () => {
    if (processingPayment) return
    setProcessingPayment(true)
    try {
      const res = await fetch('/api/checkout', { method: 'POST' })
      if (res.ok) {
      const data = await res.json()
      router.push(`/checkout?orderNumber=${data.orderNumber}&total=${data.total}`)
      } else {
        alert('Checkout failed')
      }
    } catch (error) {
      alert('Checkout error')
    } finally {
      setProcessingPayment(false)
    }
  }

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  if (!session) {
    return null
  }

if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B9D83] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cart...</p>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <main className="pt-24 pb-12">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingCart className="w-12 h-12 text-gray-400" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h1>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Looks like you haven't added any products to your cart yet. Start shopping to find amazing outdoor gear!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    className="bg-[#8B9D83] hover:bg-[#7a8a72] text-white"
                    onClick={() => router.push('/category')}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Continue Shopping
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/category?filter=jacket')}
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Browse Jackets
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
              <p className="text-gray-600">You have {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-semibold text-gray-900">Cart Items</h2>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => clearCart()}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={updating}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear All
                      </Button>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-200">
{cartItems.map((item) => (
                      <div key={item.id} className="p-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                                <img
                                src={item.product?.images?.[0] || item.image || item.product?.image}
                                alt={item.product?.name || item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>

                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between">
                              <div>
                                <h3 className="font-medium text-gray-900 mb-1">{item.product?.name || item.name}</h3>
                                <p className="text-sm text-gray-500 mb-2 line-clamp-2">{item.product?.description || item.description}</p>
                                
                                <div className="flex flex-wrap gap-3 mb-3">
                                  {item.selectedSize && (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                      Size: {item.selectedSize}
                                    </span>
                                  )}
                                  {item.selectedColor && (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                      Color: {item.selectedColor}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="text-right">
<span className="text-2xl font-bold text-[#8B9D83]">
  ${(getItemPrice(item) * item.quantity).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
</span>
<div className="text-sm text-gray-500 line-through">
  {item.product?.salePrice ? `$${(item.product.price).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : ''}
</div>

                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center border border-gray-300 rounded-lg">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="p-2 hover:bg-gray-100 transition-colors"
                                  disabled={updating || item.quantity <= 1}
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-12 text-center font-medium">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="p-2 hover:bg-gray-100 transition-colors"
                                  disabled={updating}
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFromCart(item.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                disabled={updating}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => router.push('/category')}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Continue Shopping
                  </Button>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                      <span className="font-medium">${calculateSubtotal().toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">
                        {calculateShipping() === 0 ? (
                          <span className="text-green-600">FREE</span>
                        ) : (
                          `$${calculateShipping().toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
                        )}
                      </span>
                    </div>
                    
                    {calculateShipping() === 0 && calculateSubtotal() < 200 && (
                      <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                        <Check className="w-4 h-4 inline mr-1" />
                        Free shipping unlocked! (Orders over $200)
                      </div>
                    )}
                    
                    {calculateSubtotal() < 200 && calculateShipping() > 0 && (
                      <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                        Spend $${(200 - calculateSubtotal()).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} more for free shipping
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax (10%)</span>
                      <span className="font-medium">${calculateTax().toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-[#8B9D83]">${calculateTotal().toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                      </div>
                    </div>
                  </div>

                  <Button
  className="w-full py-6 bg-[#8B9D83] hover:bg-[#7a8a72] text-white font-medium text-lg mb-4"
  onClick={handleCheckout}
  disabled={processingPayment}
>
  <CreditCard className="w-5 h-5 mr-2" />
  {processingPayment ? "Processing..." : "Pay Now"}
</Button>

                  <div className="space-y-4 pt-6 border-t border-gray-200">
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 text-green-500 mr-3" />
                      <div>
                        <p className="font-medium text-sm">Secure Payment</p>
                        <p className="text-xs text-gray-500">Your payment is safe with us</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Truck className="w-5 h-5 text-blue-500 mr-3" />
                      <div>
                        <p className="font-medium text-sm">Free Shipping</p>
                        <p className="text-xs text-gray-500">On orders over $200</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <RefreshCw className="w-5 h-5 text-orange-500 mr-3" />
                      <div>
                        <p className="font-medium text-sm">Easy Returns</p>
                        <p className="text-xs text-gray-500">30-day return policy</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}