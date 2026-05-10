'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, X } from 'lucide-react'

export default function CartToast({ isOpen, message, type = 'success', onClose }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Small delay to trigger CSS transition
      const timer = setTimeout(() => setVisible(true), 10)
      return () => clearTimeout(timer)
    } else {
      setVisible(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const isSuccess = type === 'success'

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] transition-all duration-300 ease-out transform ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div
        className={`flex items-start gap-3 min-w-[320px] max-w-[420px] bg-white rounded-xl shadow-2xl border-l-4 p-4 pr-10 ${
          isSuccess ? 'border-green-500' : 'border-red-500'
        }`}
      >
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {isSuccess ? (
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          ) : (
            <XCircle className="w-6 h-6 text-red-500" />
          )}
        </div>

        {/* Message */}
        <div className="flex-1">
          <p className={`text-sm font-medium ${isSuccess ? 'text-gray-900' : 'text-red-700'}`}>
            {isSuccess ? 'Berhasil!' : 'Gagal!'}
          </p>
          <p className="text-sm text-gray-600 mt-0.5">{message}</p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

