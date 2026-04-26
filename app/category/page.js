import { Suspense } from 'react'
import CategoryContent from '@/components/CategoryContent'

export default function CategoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CategoryContent />
    </Suspense>
  )
}

