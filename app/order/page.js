// app/order/page.js
'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { 
  Package, 
  Truck, 
  Home, 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  ShoppingBag,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const steps = [
 "Pengantaran",
 "Proses Pencucian",
 "Dikeringkan",
 "Dikemas",
 "Diantar Kerumah"
];

// Removed sample data - using real API data

// Order status timeline
const getStatusTimeline = (order) => {
  const baseTimeline = [
    { 
      status: 'ordered', 
      label: 'Pesanan Dibuat', 
      description: 'Pesanan Anda telah diterima',
      date: order.date,
      completed: true
    },
    { 
      status: 'processing', 
      label: 'Sedang Diproses', 
      description: 'Pesanan sedang dipersiapkan',
      date: order.date,
      completed: order.status !== 'cancelled'
    },
    { 
      status: 'shipped', 
      label: 'Sedang Dikirim', 
      description: 'Pesanan dalam perjalanan',
      date: order.status === 'shipped' || order.status === 'delivered' ? order.estimatedDelivery : null,
      completed: ['shipped', 'delivered'].includes(order.status)
    },
    { 
      status: 'delivered', 
      label: 'Terkirim', 
      description: 'Pesanan telah sampai',
      date: order.deliveredDate || null,
      completed: order.status === 'delivered'
    }
  ]

  const currentIndex = {
    PENDING: 0,
    PROCESSING: 1,
    SHIPPED: 2,
    DELIVERED: 4,
    CANCELED: -1
  }[order.status] ?? 0
  return steps.map((step, index) => ({
      status: step,
    label: step,
    description: step,
    completed: index <= currentIndex
  }))
}

// Status color mapping
const getStatusColor = (status) => {
  switch(status) {
    case 'PENDING':
    case 'PROCESSING': return 'bg-blue-100 text-blue-800'
    case 'SHIPPED': return 'bg-purple-100 text-purple-800'
    case 'DELIVERED': return 'bg-green-100 text-green-800'
    case 'CANCELED': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

// Status icon
const getStatusIcon = (status) => {
  switch(status) {
    case 'PENDING': 
    case 'PROCESSING': return <RefreshCw className="w-5 h-5" />
    case 'SHIPPED': return <Truck className="w-5 h-5" />
    case 'DELIVERED': return <CheckCircle className="w-5 h-5" />
    case 'CANCELED': return <AlertCircle className="w-5 h-5" />
    default: return <Package className="w-5 h-5" />
  }
}

export default function OrderPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const loadOrders = async () => {
      if (authStatus === 'unauthenticated') {
        router.push('/login')
        return
      }
      if (authStatus === 'authenticated') {
        const res = await fetch('/api/user/orders')
        if (res.ok) {
  const { orders: data } = await res.json()
          setOrders(data.map(order => ({
            ...order,
            statusText: order.statusText || order.status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
            date: order.createdAt || new Date().toISOString(),
            estimatedDelivery: order.estimatedDelivery,
            deliveredDate: order.deliveredAt,
            shippingAddress: order.shippingAddress || {},
            paymentMethod: order.paymentMethod || 'BANK_TRANSFER',
            trackingNumber: order.trackingNumber || '',
            carrier: order.carrier || ''
          }))) 
        }
        setLoading(false)
      }
    }
    loadOrders()
  }, [authStatus, router])

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter)

  if (loading || authStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B9D83] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
                  <p className="text-gray-600">Track and manage your orders</p>
                </div>
                <Button 
                  className="bg-[#8B9D83] hover:bg-[#7a8a72] text-white"
                  onClick={() => router.push('/category')}
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Order List */}
              <div className="lg:col-span-2">
                {/* Filter Tabs */}
                <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
                  <div className="flex overflow-x-auto">
{[
                      { id: 'all', label: 'Semua Pesanan', count: orders.length },
                      { id: 'PROCESSING', label: 'Diproses', count: orders.filter(o => o.status === 'PROCESSING').length },
                      { id: 'SHIPPED', label: 'Dikirim', count: orders.filter(o => o.status === 'SHIPPED').length },
                      { id: 'DELIVERED', label: 'Selesai', count: orders.filter(o => o.status === 'DELIVERED').length },
                      { id: 'CANCELED', label: 'Dibatalkan', count: orders.filter(o => o.status === 'CANCELED').length }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id)}
                        className={`flex-1 min-w-fit px-6 py-4 text-sm font-medium transition-colors ${
                          filter === tab.id
                            ? 'bg-[#8B9D83] text-white'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          {tab.label}
                          {tab.count > 0 && (
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              filter === tab.id 
                                ? 'bg-white/20' 
                                : 'bg-gray-200'
                            }`}>
                              {tab.count}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Orders List */}
                <div className="space-y-6">
                  {filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                      <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
                      <p className="text-gray-600 mb-6">
                        {filter === 'all' 
                          ? "You haven't placed any orders yet."
                          : `You don't have any ${filter} orders.`
                        }
                      </p>
                      <Button 
                        className="bg-[#8B9D83] hover:bg-[#7a8a72] text-white"
                        onClick={() => router.push('/category')}
                      >
                        Start Shopping
                      </Button>
                    </div>
                  ) : (
                    filteredOrders.map((order) => (
                      <div 
                        key={order.id}
                        className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <div className="p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                            <div>
                              <div className="flex items-center gap-3">
                                <h3 className="font-bold text-gray-900">{order.id}</h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
{order.statusText || order.status}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500 mt-1">
 Ordered on {order.date ? new Date(order.date).toLocaleDateString('id-ID', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                }) : 'N/A'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-[#8B9D83]">${order.total}</p>
                              <p className="text-sm text-gray-500">{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                            </div>
                          </div>

                          {/* Order Items Preview */}
                          <div className="flex items-center gap-4 overflow-x-auto pb-2">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex-shrink-0">
                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <div className="flex-shrink-0 text-sm text-gray-500">
                                +{order.items.length - 3} more
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedOrder(order)
                              }}
                            >
                              View Details
                            </Button>
                            {['PENDING', 'PROCESSING'].includes(order.status) && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={async (e) => {
                                  e.stopPropagation()
                                  if (confirm('Are you sure you want to cancel this order?')) {
                                    const res = await fetch(`/api/user/orders/${order.id}`, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ status: 'CANCELED' })
                                    })
                                    if (res.ok) {
                                      setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'CANCELED' } : o))
                                      alert('Order canceled successfully!')
                                    } else {
                                      alert('Cancel failed')
                                    }
                                  }
                                }}
                              >
                                Cancel Order
                              </Button>
                            )}
                            {order.trackingNumber && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  // Open tracking in new window
                                  window.open(`https://tracking.example.com/${order.trackingNumber}`, '_blank')
                                }}
                              >
                                Track Package
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Order Details Sidebar */}
              <div className="lg:col-span-1">
                {selectedOrder ? (
                  <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
                      <button
                        onClick={() => setSelectedOrder(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Order Info */}
                    <div className="space-y-6">
                      {/* Status Card */}
                      <div className={`p-4 rounded-xl ${getStatusColor(selectedOrder.status)}`}>
                        <div className="flex items-center gap-3">
                          {getStatusIcon(selectedOrder.status)}
                          <div>
                            <p className="font-semibold">{selectedOrder.statusText}</p>
                            <p className="text-sm opacity-80">
                              {selectedOrder.status === 'shipped' 
                                ? `Estimated delivery: ${new Date(selectedOrder.estimatedDelivery).toLocaleDateString()}`
                                : selectedOrder.status === 'delivered'
                                ? `Delivered on: ${new Date(selectedOrder.deliveredDate).toLocaleDateString()}`
                                : 'Order is being processed'
                              }
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Items List */}
                      <div>
                        <h3 className="font-medium text-gray-900 mb-3">Items</h3>
                        <div className="space-y-3">
                          {selectedOrder.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                <p className="text-xs text-gray-500">Qty: {item.quantity} × ${item.price}</p>
                              </div>
                              <p className="text-sm font-semibold">${item.price * item.quantity}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Timeline */}
                      <div>
                        <h3 className="font-medium text-gray-900 mb-3">Order Timeline</h3>
                        <div className="space-y-4">
                          {getStatusTimeline(selectedOrder).map((step, index) => (
                            <div key={step.status} className="flex gap-3">
                              <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  step.completed ? 'bg-[#8B9D83] text-white' : 'bg-gray-200 text-gray-400'
                                }`}>
                                  {index + 1}
                                </div>
                                {index < getStatusTimeline(selectedOrder).length - 1 && (
                                  <div className={`flex-1 w-0.5 ${step.completed ? 'bg-[#8B9D83]' : 'bg-gray-200'}`}></div>
                                )}
                              </div>
                              <div className="flex-1 pb-4">
                                <p className="font-medium text-gray-900">{step.label}</p>
                                <p className="text-sm text-gray-500">{step.description}</p>
                                {step.date && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    {new Date(step.date).toLocaleDateString('id-ID', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    })}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping Info */}
                      <div>
                        <h3 className="font-medium text-gray-900 mb-3">Shipping Information</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start gap-3 mb-3">
                            <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            <div>
                              <p className="font-medium">{selectedOrder.shippingAddress.name}</p>
                              <p className="text-sm text-gray-600">{selectedOrder.shippingAddress.street}</p>
                              <p className="text-sm text-gray-600">
                                {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-gray-400" />
                            <span className="text-sm">{selectedOrder.shippingAddress.phone}</span>
                          </div>
                        </div>
                      </div>

                      {/* Payment Info */}
                      <div>
                        <h3 className="font-medium text-gray-900 mb-3">Payment Information</h3>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-gray-400" />
                            <span className="text-sm">{selectedOrder.paymentMethod}</span>
                          </div>
                          <span className="font-bold text-[#8B9D83]">${selectedOrder.total}</span>
                        </div>
                      </div>

                      {/* Tracking Info */}
                      {selectedOrder.trackingNumber && (
                        <div className="pt-4 border-t border-gray-200">
                          <h3 className="font-medium text-gray-900 mb-3">Tracking Information</h3>
                          <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Tracking Number</span>
                              <span className="font-mono text-sm">{selectedOrder.trackingNumber}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Carrier</span>
                              <span className="text-sm font-medium">{selectedOrder.carrier}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Select an Order</h3>
                      <p className="text-gray-600 text-sm">
                        Click on any order from the list to view details, track status, and manage your purchase.
                      </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="space-y-4 pt-6 border-t border-gray-200">
                      <h4 className="font-medium text-gray-900">Order Summary</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-blue-600">Diproses</p>
                          <p className="text-xl font-bold">{orders.filter(o => o.status === 'PROCESSING').length}</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <p className="text-sm text-purple-600">Dikirim</p>
                          <p className="text-xl font-bold">{orders.filter(o => o.status === 'SHIPPED').length}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-sm text-green-600">Diantar</p>
                          <p className="text-xl font-bold">{orders.filter(o => o.status === 'DELIVERED').length}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600">Total</p>
                          <p className="text-xl font-bold">{orders.length}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}