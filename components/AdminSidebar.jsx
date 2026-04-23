import { Button } from "@/components/ui/button"
import { LayoutDashboard, Package, MessageCircle, FileText, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useState } from "react"

export default function AdminSidebar({ activeTab, onTabChange }) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, onClick: () => onTabChange('products') },
    { id: 'products', label: 'Products', icon: Package, onClick: () => onTabChange('products') },
    { id: 'reviews', label: 'Reviews', icon: MessageCircle, onClick: () => onTabChange('reviews') },
    { id: 'orders', label: 'Orders', icon: FileText, onClick: () => onTabChange('orders') },
    { id: 'reports', label: 'Reports', icon: FileText, onClick: () => onTabChange('reports') },
  ]

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut({ callbackUrl: '/login' })
    } catch (error) {
      console.error('Logout error:', error)
      // Fallback
      router.push('/login')
    }
  }

  return (
    <div className="w-64 bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 shadow-lg h-screen fixed left-0 top-0 z-40">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#8B9D83] to-[#2C3E2E] bg-clip-text text-transparent">
          Admin
        </h1>
      </div>
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant={activeTab === item.id ? "secondary" : "ghost"}
            className="w-full justify-start h-12 text-left hover:bg-gray-100 hover:text-[#8B9D83] transition-all group"
            onClick={item.onClick}
          >
            <item.icon className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
            <span>{item.label}</span>
          </Button>
        ))}
      </nav>
      <div className="absolute bottom-4 left-4 right-4">
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={handleLogout}
          disabled={status === 'loading' || isLoggingOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </Button>
      </div>
    </div>
  )
}

