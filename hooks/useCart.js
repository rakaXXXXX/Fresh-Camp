'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export function useCart() {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()

  // Load cart from API
  const fetchCart = async () => {
    if (!session?.user?.id) return
    
    try {
      setLoading(true)
      const res = await fetch('/api/cart')
      if (res.ok) {
        const items = await res.json()
        setCartItems(items)
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user?.id) {
      fetchCart()
    }
  }, [session?.user?.id])

  const addToCart = async (productId, quantity = 1, size = null, color = null) => {
    if (!session?.user?.id) {
      router.push('/login')
      return
    }

    // Removed updating state for instant add to cart
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
        await fetchCart() // Refresh full cart
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to add to cart')
      }
    } catch (error) {
      console.error('Add to cart error:', error)
      alert('Failed to add to cart')
    }
  }

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) {
      return removeFromCart(cartItemId)
    }

    // Removed updating state for instant update
    try {
      // Update via productId/size/color (since cartItemId might not exist yet)
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
  }

  const removeFromCart = async (cartItemId) => {
    setUpdating(true)
    try {
      const item = cartItems.find(item => item.id === cartItemId)
      if (item) {
        // Use POST with quantity: 0 to remove (simpler than separate DELETE)
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
  }

  const clearCart = async () => {
    // Checkout already clears, but for manual clear:
    for (const item of cartItems) {
      await removeFromCart(item.id)
    }
  }

  const getCartTotalItems = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0)
  }

  const getCartTotalPrice = () => {
    const getItemPrice = (item) => Number(item.product?.salePrice || item.product?.price || item.price || 0);
    return cartItems.reduce((sum, item) => sum + getItemPrice(item) * item.quantity, 0)
  }

  return {
    cartItems,
    loading,
    updating,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotalItems,
    getCartTotalPrice,
    refetch: fetchCart
  }
}

