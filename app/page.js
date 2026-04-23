import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import HomeClient from './HomeClient'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  // If not logged in, redirect to login page
  if (!session) {
    redirect('/login')
  }

// Redirect ADMIN to admin dashboard, USER stays on home (user dashboard)
  if (session?.user?.role === 'ADMIN') {
    redirect('/admin')
  }
  return <HomeClient />
}
