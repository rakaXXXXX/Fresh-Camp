'use client'

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import CartToast from '@/components/CartToast'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [cartToast, setCartToast] = useState({ show: false, message: '', type: 'success' })
  const toastTimeoutRef = useRef(null)
  const { data: session, status } = useSession()
  const router = useRouter()

  const fetchCart = useCallback(async () => {
    if (!session?.user?.id) {
      setCartItems([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const res = await fetch('/api/cart')
      if (res.ok) {
        const items = await res.json()
        setCartItems(items)
      } else {
        console.error('Failed to fetch cart:', res.status, res.statusText)
        setCartItems([])
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error)
      setCartItems([])
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id])

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true)
      return
    }

    if (status === 'unauthenticated' || !session?.user?.id) {
      setCartItems([])
      setLoading(false)
      return
    }

    fetchCart()
  }, [status, session?.user?.id, fetchCart])

  const showCartToast = useCallback((message, type = 'success') => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current)
    }

    setCartToast({ show: true, message, type })

    toastTimeoutRef.current = setTimeout(() => {
      setCartToast(prev => ({ ...prev, show: false }))
    }, 3000)
  }, [])

  const hideCartToast = useCallback(() => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current)
    }
    setCartToast(prev => ({ ...prev, show: false }))
  }, [])

  const addToCart = useCallback(async (productId, quantity = 1, size = null, color = null) => {
    if (!session?.user?.id) {
      router.push('/login')
      return
    }

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          quantity,
          size,
          color
        }),
      })

      if (res.ok) {
        await fetchCart()
        showCartToast('Produk berhasil ditambahkan ke keranjang', 'success')
      } else {
        const data = await res.json()
        showCartToast(data.error || 'Gagal menambahkan ke keranjang', 'error')
      }
    } catch (error) {
      console.error('Add to cart error:', error)
      showCartToast('Gagal menambahkan ke keranjang', 'error')
    }
  }, [session?.user?.id, router, fetchCart, showCartToast])

  const updateQuantity = useCallback(async (cartItemId, newQuantity) => {
    if (newQuantity < 1) {
      return removeFromCart(cartItemId)
    }

    try {
      const item = cartItems.find(item => item.id === cartItemId)
      if (item) {
        await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: item.productId,
            quantity: newQuantity,
            size: item.size,
            color: item.color
          }),
        })
        await fetchCart()
      }
    } catch (error) {
      console.error('Update quantity error:', error)
    }
  }, [cartItems, fetchCart])

  const removeFromCart = useCallback(async (cartItemId) => {
    setUpdating(true)
    try {
      const item = cartItems.find(item => item.id === cartItemId)
      if (item) {
        await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: item.productId,
            quantity: 0,
            size: item.size,
            color: item.color
          }),
        })
        await fetchCart()
      }
    } catch (error) {
      console.error('Remove from cart error:', error)
    } finally {
      setUpdating(false)
    }
  }, [cartItems, fetchCart])

  const clearCart = useCallback(async () => {
    for (const item of cartItems) {
      await removeFromCart(item.id)
    }
  }, [cartItems, removeFromCart])

  const getCartTotalItems = useCallback(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0)
  }, [cartItems])

  const getCartTotalPrice = useCallback(() => {
    const getItemPrice = (item) => Number(item.product?.salePrice || item.product?.price || item.price || 0)
    return cartItems.reduce((sum, item) => sum + getItemPrice(item) * item.quantity, 0)
  }, [cartItems])

  const value = {
    cartItems,
    loading,
    updating,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotalItems,
    getCartTotalPrice,
    refetch: fetchCart,
    showCartToast,
    hideCartToast
  }

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartToast
        isOpen={cartToast.show}
        message={cartToast.message}
        type={cartToast.type}
        onClose={hideCartToast}
      />
    </CartContext.Provider>
  )
}

export function useCartContext() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCartContext must be used within a CartProvider')
  }
  return context
}

