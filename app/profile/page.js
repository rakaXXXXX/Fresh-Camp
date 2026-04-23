// app/profile/page.js
'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { User, Package, MapPin, Mail, Phone, Camera, Key, Shield, Truck, Clock, LogOut, Loader2 } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [imagePreview, setImagePreview] = useState('');
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    image: '',
    totalSpent: 0,
    reviewCount: 0,
    wishlistCount: 0,
    totalOrders: 0,
    phone: '',
    address: '',
    city: '',
    zipCode: ''
  })
  const [orders, setOrders] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user) {
      loadUserData()
      loadOrders()
    }
  }, [status, session])

  const loadUserData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setProfileData({
          name: data.name || '',
          email: data.email || session.user.email || '',
          image: data.image || '',
          totalSpent: data.totalSpent || 0,
          reviewCount: data.reviewCount || 0,
          wishlistCount: data.wishlistCount || 0,
          totalOrders: data.totalOrders || 0,
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          zipCode: data.zipCode || ''
        })

      }
    } catch (error) {
      console.error('Error loading profile:', error)
      // Fallback to session data
      setProfileData({
        name: session.user.name || '',
        email: session.user.email || '',
        image: session.user.image || '',
        totalSpent: 0,
        reviewCount: 0,
        wishlistCount: 0,
        totalOrders: 0,
        phone: '',
        address: '',
        city: '',
        zipCode: ''
      })

    } finally {
      setLoading(false)
    }
  }

  const loadOrders = async () => {
    try {
      const response = await fetch('/api/user/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Error loading orders:', error)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      })

      if (response.ok) {
        // Update session dengan data baru
        await update({
          ...session,
          user: {
            ...session.user,
            name: profileData.name
          }
        })
        
        toast({
          title: 'Success',
          description: 'Profile updated successfully!',
        })
        setIsEditing(false)
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.message || 'Failed to update profile',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImageSelect = (e) => {
  const file = e.target.files[0];
  if (file) {
    // Preview gambar
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  }
}

const handlePhotoUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  if (!file.type.startsWith('image/')) {
    toast({
      title: 'Error',
      description: 'Please select an image file',
      variant: 'destructive',
    });
    return;
  }

  setUploading(true);
  try {
    const formData = new FormData();
    formData.append('file', file);

    toast({
      title: "Uploading...",
      description: "Please wait while we upload your photo",
    });

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Upload failed');
    }
    
    const { url } = await res.json();

    // Update profile image
    const updateRes = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...profileData, image: url }),
    });
    
    if (updateRes.ok) {
      setProfileData((prev) => ({ ...prev, image: url }));
      setImagePreview(''); // Reset preview
      toast({
        title: '✅ Success',
        description: 'Profile photo updated successfully!',
      });
      await update({ image: url });
    } else {
      throw new Error('Update failed');
    }
  } catch (error) {
    console.error('Upload error:', error);
    toast({
      title: '❌ Error',
      description: 'Failed to upload photo: ' + error.message,
      variant: 'destructive',
    });
  } finally {
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }
};


  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      })
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Password changed successfully!',
        })
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.message || 'Failed to change password',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error changing password:', error)
      toast({
        title: 'Error',
        description: 'Failed to change password',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };



  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed': 
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'in progress': 
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'pending': 
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default: 
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#F5F3EF]">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B9D83] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <Navbar />
      
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-[#8B9D83] to-[#7a8b72] py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-6 mb-6 md:mb-0">
              <div className="relative">
  <Avatar className="w-24 h-24 shadow-xl border-4 border-white relative">
    <AvatarImage 
      src={imagePreview || profileData.image} // ✅ Gunakan preview jika ada
      alt={profileData.name} 
    />
    <AvatarFallback className="bg-[#F5F3EF]">
      <User className="w-12 h-12 text-[#8B9D83]" />
    </AvatarFallback>
  </Avatar>
  
  {/* Preview overlay jika sedang preview */}
  {imagePreview && (
    <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center">
      <span className="text-white text-sm font-medium">Preview</span>
    </div>
  )}
  
  <button 
    className="absolute -bottom-3 -right-3 bg-white p-3 rounded-full shadow-lg border-4 border-[#F5F3EF] hover:bg-gray-50 transition-all disabled:opacity-50 flex items-center justify-center hover:scale-110"
    onClick={() => fileInputRef.current?.click()}
    disabled={uploading}
    title="Change photo"
  >
    {uploading ? (
      <Loader2 className="w-4 h-4 animate-spin text-[#8B9D83]" />
    ) : (
      <Camera className="w-5 h-5 text-[#8B9D83]" />
    )}
  </button>
</div>

<input
  ref={fileInputRef}
  type="file"
  accept="image/*"
  className="hidden"
  onChange={(e) => {
    handleImageSelect(e); // Preview
    handlePhotoUpload(e); // Upload langsung
  }}
/>
              <div>
                <h1 className="text-3xl font-bold text-white">{profileData.name || session.user.name}</h1>
                <p className="text-white/90">{session.user.email}</p>
                <p className="text-white/80 text-sm mt-1">Member since Jan 2024</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <p className="text-white text-sm font-medium">
                  <Package className="w-4 h-4 inline mr-2" />
                  {orders.length} Orders
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <p className="text-white text-sm font-medium">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Active Member
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-24">
              <div className="p-6 space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'profile' 
                      ? 'bg-[#8B9D83] text-white shadow-md' 
                      : 'text-gray-700 hover:bg-gray-100 hover:shadow'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">Profile</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'orders' 
                      ? 'bg-[#8B9D83] text-white shadow-md' 
                      : 'text-gray-700 hover:bg-gray-100 hover:shadow'
                  }`}
                >
                  <Package className="w-5 h-5" />
                  <span className="font-medium">Orders</span>
                  {orders.length > 0 && (
                    <span className="ml-auto bg-[#8B9D83]/20 text-[#8B9D83] text-xs px-2 py-1 rounded-full">
                      {orders.length}
                    </span>
                  )}
                </button>
                
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'security' 
                      ? 'bg-[#8B9D83] text-white shadow-md' 
                      : 'text-gray-700 hover:bg-gray-100 hover:shadow'
                  }`}
                >
                  <Key className="w-5 h-5" />
                  <span className="font-medium">Security</span>
                </button>

                <div className="pt-4 mt-4 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                  {!isEditing ? (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-[#8B9D83] hover:bg-[#7a8b72] text-white"
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        className="border-gray-300"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleProfileUpdate}
                        className="bg-[#8B9D83] hover:bg-[#7a8b72] text-white"
                        disabled={loading}
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  )}
                </div>

                <form onSubmit={handleProfileUpdate}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-2">
                      <label className="block text-gray-700 font-medium">Full Name</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          isEditing ? 'border-gray-300 focus:border-[#8B9D83]' : 'border-transparent bg-gray-50'
                        } focus:outline-none focus:ring-2 focus:ring-[#8B9D83]/20`}
                        readOnly={!isEditing}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-gray-700 font-medium">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={profileData.email}
                          className="w-full pl-12 pr-4 py-3 rounded-lg border border-transparent bg-gray-50 focus:outline-none"
                          readOnly
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-gray-700 font-medium">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                          className={`w-full pl-12 pr-4 py-3 rounded-lg border ${
                            isEditing ? 'border-gray-300 focus:border-[#8B9D83]' : 'border-transparent bg-gray-50'
                          } focus:outline-none focus:ring-2 focus:ring-[#8B9D83]/20`}
                          readOnly={!isEditing}
                          placeholder="Add phone number"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-gray-700 font-medium">City</label>
                      <input
                        type="text"
                        value={profileData.city}
                        onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          isEditing ? 'border-gray-300 focus:border-[#8B9D83]' : 'border-transparent bg-gray-50'
                        } focus:outline-none focus:ring-2 focus:ring-[#8B9D83]/20`}
                        readOnly={!isEditing}
                        placeholder="Your city"
                      />
                    </div>
                    
                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-gray-700 font-medium">Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={profileData.address}
                          onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                          className={`w-full pl-12 pr-4 py-3 rounded-lg border ${
                            isEditing ? 'border-gray-300 focus:border-[#8B9D83]' : 'border-transparent bg-gray-50'
                          } focus:outline-none focus:ring-2 focus:ring-[#8B9D83]/20`}
                          readOnly={!isEditing}
                          placeholder="Your complete address"
                        />
                      </div>
                    </div>
                  </div>
                </form>

                {/* Account Stats */}
                <div className="pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Stats</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-2xl font-bold text-[#8B9D83]">{profileData.totalOrders}</p>
                      <p className="text-sm text-gray-600">Total Orders</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-2xl font-bold text-[#8B9D83]">${profileData.totalSpent.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Total Spent</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-2xl font-bold text-[#8B9D83]">{profileData.reviewCount}</p>
                      <p className="text-sm text-gray-600">Reviews</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-2xl font-bold text-[#8B9D83]">{profileData.wishlistCount}</p>
                      <p className="text-sm text-gray-600">Wishlist</p>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Order History</h2>
                
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
                    <Button
                      onClick={() => router.push('/category')}
                      className="bg-[#8B9D83] hover:bg-[#7a8b72] text-white"
                    >
                      Start Shopping
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3">
                              <h3 className="font-semibold text-lg text-gray-900">{order.service || 'Order'}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </div>
                            <div className="space-y-2">
                              <p className="text-gray-600 text-sm">
                                <span className="font-medium">Order ID:</span> {order.id}
                              </p>
                              <p className="text-gray-600 text-sm">
                                <span className="font-medium">Date:</span> {new Date(order.date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-[#8B9D83] mb-2">{order.amount}</p>
                            <Button
                              variant="outline"
                              onClick={() => router.push(`/order?id=${order.id}`)}
                              className="text-sm"
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Security Settings</h2>
                
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-800 mb-2">Change Password</h3>
                    <p className="text-sm text-gray-500 mb-4">Enter your current password. <a href="/forgot-password" className="text-[#8B9D83] hover:underline font-medium">Forgot it?</a></p>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-gray-700 font-medium">Current Password</label>
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8B9D83] focus:border-transparent"
                          placeholder="Enter current password"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-gray-700 font-medium">New Password</label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8B9D83] focus:border-transparent"
                          placeholder="Enter new password"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-gray-700 font-medium">Confirm New Password</label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8B9D83] focus:border-transparent"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <Button
                      type="submit"
                      className="bg-[#8B9D83] hover:bg-[#7a8b72] text-white"
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : 'Update Password'}
                    </Button>
                  </div>
                </form>

                {/* Security Features */}
                <div className="pt-8 border-t border-gray-200 mt-8">
                  <h3 className="font-semibold text-lg text-gray-800 mb-4">Security Features</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                          <p className="text-sm text-gray-600">Add an extra layer of security</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Enable</Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Truck className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">Login Activity</p>
                          <p className="text-sm text-gray-600">Review recent account activity</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="pt-8 border-t border-red-200 mt-8">
                  <h3 className="font-semibold text-lg text-red-600 mb-4">Danger Zone</h3>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-gray-800 mb-3">
                      Deleting your account is permanent and cannot be undone. All your data will be permanently removed.
                    </p>
                    <Button
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}