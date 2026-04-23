import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

// Fix: Prevent Next.js static optimization causing webpack __webpack_require__.C error
export const dynamic = 'force-dynamic'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

