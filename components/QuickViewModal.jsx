'use client'

import { useState, useEffect } from "react"

export default function QuickViewModal({ product, isOpen, onClose }) {
  const [selectedRating, setSelectedRating] = useState(0)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [reviews, setReviews] = useState([])
  const [loadingReviews, setLoadingReviews] = useState(false)

  useEffect(() => {
    if (isOpen && product?.id) {
      setLoadingReviews(true)
      fetch(`/api/products/${product.id}/review`)
        .then(res => res.json())
        .then(data => {
          setReviews(data)
        })
        .catch(err => console.error("Reviews fetch error:", err))
        .finally(() => setLoadingReviews(false))
    }
  }, [isOpen, product?.id])

  const submitReview = async () => {
    if (selectedRating === 0) {
      alert("Pilih rating dulu ⭐")
      return
    }

    try {
      setLoading(true)

      const res = await fetch(`/api/products/${product.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: selectedRating,
          comment: comment,
        }),
      })

      if (res.ok) {
        // Refresh reviews
        fetch(`/api/products/${product.id}/review`)
          .then(res => res.json())
          .then(data => setReviews(data))
        
        setSelectedRating(0)
        setComment("")
        alert("Review berhasil!")
      } else {
        alert("Gagal kirim review")
      }

    } catch (error) {
      console.error(error)
      alert("Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  if (!product || !isOpen) return null

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 transition-all duration-300 ${
      isOpen ? "opacity-100 visible" : "opacity-0 invisible"
    }`}>
      <div className="bg-white w-full max-w-lg p-6 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto mx-4 my-4">
        {/* Close */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-2xl hover:text-gray-700 font-bold"
        >
          ×
        </button>

        {/* Product */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-3">{product.name}</h2>
          <img 
            src={product.images?.[0] || product.image} 
            alt={product.name}
            className="w-64 h-64 object-cover rounded-xl mx-auto mb-4 shadow-lg"
          />
          <p className="text-gray-600 text-sm mb-2">{product.description}</p>
          <div className="text-2xl font-bold text-[#8B9D83]">
            Rp {Number(product.price).toLocaleString('id-ID')}
          </div>
        </div>

        {/* Review Form - TOP */}
        <div className="border-t pt-6 mb-8">
          <h3 className="font-bold text-xl mb-4">⭐ Beri Rating Kamu</h3>
          
          {/* Stars */}
          <div className="flex justify-center gap-1 mb-6">
            {[1,2,3,4,5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setSelectedRating(star)}
                className={`text-3xl transition-all hover:scale-110 ${
                  star <= selectedRating 
                    ? "text-yellow-400 shadow-lg" 
                    : "text-gray-300 hover:text-yellow-400"
                }`}
              >
                ★
              </button>
            ))}
          </div>

          {/* Comment */}
          <textarea
            placeholder="Ceritakan pengalamanmu dengan produk ini..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-xl mb-6 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 h-28 text-sm"
            rows="4"
          />

          {/* Submit */}
          <button
            onClick={submitReview}
            disabled={loading || selectedRating === 0}
            className="w-full bg-[#8B9D83] hover:bg-[#7a8a72] text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Mengirim..." : "Kirim Review & Bintang ⭐"}
          </button>
        </div>

        {/* Reviews List - BOTTOM */}
        <div className="border-t pt-6 pb-2">
          <h3 className="font-bold text-xl mb-4 flex items-center">
            Ulasan Lainnya ({reviews.length})
            {loadingReviews && (
              <div className="ml-2 w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            )}
          </h3>
          
          {loadingReviews ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mr-3"></div>
              <span className="text-gray-500">Memuat ulasan...</span>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
              <div className="text-4xl mb-2">⭐</div>
              <p className="text-lg">Belum ada ulasan</p>
              <p className="text-sm">Jadilah yang pertama memberikan ulasan!</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-72 overflow-y-auto pr-2 -mr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {reviews.map((review) => (
                <div key={review.id} className="p-4 bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="flex-shrink-0">
                      {review.user.image ? (
                        <img 
                          src={review.user.image}
                          alt={review.user.name}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {review.user.name?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm truncate max-w-[200px]">{review.user.name}</h4>
                        <div className="flex -space-x-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <span
                              key={i}
                              className={`text-lg ${
                                i < review.rating 
                                  ? 'text-yellow-400 drop-shadow-sm' 
                                  : 'text-gray-300'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{review.comment}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(review.createdAt).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {reviews.length > 5 && (
                <div className="text-center pt-4 pb-2">
                  <p className="text-sm text-gray-500">+{reviews.length - 5} ulasan lainnya</p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
