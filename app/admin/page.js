"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import AdminSidebar from '@/components/AdminSidebar'
import * as ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { useMemo } from "react"

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [productsError, setProductsError] = useState(null)
  const [createError, setCreateError] = useState('')
  const [updateError, setUpdateError] = useState('')
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    categoryId: ""
  })

  const [editingProduct, setEditingProduct] = useState(null)
  const [activeTab, setActiveTab] = useState("products")
  const [reviews, setReviews] = useState([])
  const [reviewsSearch, setReviewsSearch] = useState("")
  const [reviewsPage, setReviewsPage] = useState(1)
  const [reviewsLoading, setReviewsLoading] = useState(false)

  const [orders, setOrders] = useState([])
  const [ordersSearch, setOrdersSearch] = useState("")
  const [ordersPage, setOrdersPage] = useState(1)
const [ordersLoading, setOrdersLoading] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
const [dateTo, setDateTo] = useState('')
  const salesData = useMemo(() => {
    let filtered = orders
    if (dateFrom || dateTo) {
      filtered = orders.filter(order => {
        const orderDate = new Date(order.createdAt)
        const fromDate = dateFrom ? new Date(dateFrom) : null
        const toDate = dateTo ? new Date(dateTo) : null
        if (fromDate && orderDate < fromDate) return false
        if (toDate && orderDate > toDate) return false
        return true
      })
    }
    const data = filtered.reduce((acc, order) => {
      const date = new Date(order.createdAt).toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + Number(order.totalAmount || 0)
      return acc
    }, {})
    return Object.entries(data).map(([date, value]) => ({ date, sales: value })).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-30)
  }, [orders, dateFrom, dateTo])

  const exportOrdersToExcel = async () => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Orders Report')

    // Headers
    worksheet.columns = [
      { header: 'Order #', key: 'orderNumber', width: 15 },
      { header: 'Customer Name', key: 'userName', width: 20 },
      { header: 'Customer Email', key: 'userEmail', width: 25 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Total Amount', key: 'totalAmount', width: 15 },
      { header: 'Items Count', key: 'itemsCount', width: 12 },
      { header: 'Order Date', key: 'createdAt', width: 20 },
    ]

    // Filter orders by date range if provided
    let filteredOrdersForExport = orders
    if (dateFrom || dateTo) {
      filteredOrdersForExport = orders.filter(order => {
        const orderDate = new Date(order.createdAt)
        const fromDate = dateFrom ? new Date(dateFrom) : null
        const toDate = dateTo ? new Date(dateTo) : null
        if (fromDate && orderDate < fromDate) return false
        if (toDate && orderDate > toDate) return false
        return true
      })
    }

    // Add rows
    filteredOrdersForExport.forEach(order => {
      worksheet.addRow({
        orderNumber: order.orderNumber,
        userName: order.user?.name || 'N/A',
        userEmail: order.user?.email || 'N/A',
        status: order.status,
        totalAmount: `Rp ${Number(order.totalAmount || 0).toLocaleString('id-ID')}`,
        itemsCount: order.items?.length || 0,
        createdAt: new Date(order.createdAt).toLocaleString('id-ID'),
      })
    })

    // Style headers
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF8B9D83' }
    }

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.width = column.width || 15
    })

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, `orders-report-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user?.role !== "ADMIN") {
      router.push("/")
    } else {
      fetchProducts()
      fetchCategories()
      fetchReviews()
      fetchOrders()
    }
  }, [session, status, router])

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true)
      const res = await fetch("/api/admin/reviews")
      if (res.ok) {
        const data = await res.json()
        setReviews(data)
      }
    } catch (err) {
      console.error("Fetch reviews error:", err)
    } finally {
      setReviewsLoading(false)
    }
  }

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true)
      const res = await fetch("/api/admin/orders")
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch (err) {
      console.error("Fetch orders error:", err)
    } finally {
      setOrdersLoading(false)
    }
  }

  const handleUpdateOrderStatus = async (orderNumber, newStatus) => {
    if (!confirm(`Ubah status pesanan ke ${newStatus}?`)) return
    try {
      const res = await fetch("/api/admin/order/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, status: newStatus }),
      })
      if (res.ok) {
        fetchOrders()
      } else {
        alert("Gagal update status")
      }
    } catch (error) {
      console.error("Update error:", error)
      alert("Error")
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/category")
      if (!res.ok) {
        console.error("Status:", res.status)
        const text = await res.text()
        console.error("Response:", text)
        return
      }
      const data = await res.json()
      setCategories(data)
    } catch (err) {
      console.error("Fetch error:", err)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setProductsError(null)
      const res = await fetch("/api/admin/product")
      if (!res.ok) {
        const text = await res.text()
        setProductsError(`Failed to fetch products: ${res.status} - ${text.slice(0,100)}`)
        setLoading(false)
        return
      }
      const data = await res.json()
      setProducts(data)
      setLoading(false)
    } catch (err) {
      setProductsError('Network error fetching products')
      console.error("FETCH ERROR:", err)
      setLoading(false)
    }
  }

  const handleImageUpload = async (e, isEdit = false) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      if (!res.ok) {
        console.error('Upload failed:', await res.text())
        return
      }
      const data = await res.json()
      console.log('✅ Upload success:', data.url, data.public_id)

      if (isEdit) {
        setEditingProduct({ ...editingProduct, image: data.url })
      } else {
        setNewProduct({ ...newProduct, image: data.url })
      }
    } catch (error) {
      console.error('❌ Upload error:', error)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreateError('')

    if (!newProduct.categoryId) {
      setCreateError('Please select a category')
      return
    }

    try {
      const res = await fetch("/api/admin/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      })
      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText)
      }
      setNewProduct({ name: "", description: "", price: "", image: "", categoryId: "" })
      fetchProducts()
    } catch (err) {
      setCreateError(err.message || 'Failed to create product')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus produk ini?')) return
    try {
      await fetch(`/api/admin/product/${id}`, { method: "DELETE" })
      fetchProducts()
    } catch (err) {
      console.error("Delete error:", err)
      alert("Gagal menghapus produk")
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setUpdateError('')

    const updateData = {
      name: editingProduct.name,
      description: editingProduct.description,
      price: editingProduct.price,
      categoryId: editingProduct.categoryId,
      image: editingProduct.image,  // Single image for consistency with create
    }

    try {
      const res = await fetch(`/api/admin/product/${editingProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })
      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText)
      }
      setEditingProduct(null)
      fetchProducts()
    } catch (err) {
      setUpdateError(err.message || 'Failed to update product')
    }
  }

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/login" })
    } catch (error) {
      console.error("Logout error:", error)
      window.location.href = "/login"
    }
  }

  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  )

  const perPage = 5
  const indexLast = currentPage * perPage
  const indexFirst = indexLast - perPage
  const currentProducts = filteredProducts.slice(indexFirst, indexLast)

  const filteredReviews = reviews.filter((r) =>
    r.product?.name?.toLowerCase().includes(reviewsSearch.toLowerCase()) ||
    r.user?.name?.toLowerCase().includes(reviewsSearch.toLowerCase()) ||
    (r.comment && r.comment.toLowerCase().includes(reviewsSearch.toLowerCase()))
  )

  const currentReviews = filteredReviews.slice((reviewsPage - 1) * 5, reviewsPage * 5)

  const filteredOrders = orders.filter((order) =>
    order.orderNumber?.toLowerCase().includes(ordersSearch.toLowerCase()) ||
    order.user?.name?.toLowerCase().includes(ordersSearch.toLowerCase()) ||
    order.user?.email?.toLowerCase().includes(ordersSearch.toLowerCase()) ||
    order.status?.toLowerCase().includes(ordersSearch.toLowerCase())
  )

  const ordersPerPage = 5
  const ordersIndexLast = ordersPage * ordersPerPage
  const ordersIndexFirst = ordersIndexLast - ordersPerPage
  const currentOrders = filteredOrders.slice(ordersIndexFirst, ordersIndexLast)

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    PROCESSING: 'bg-blue-100 text-blue-800 border border-blue-200',
    SHIPPED: 'bg-purple-100 text-purple-800 border border-purple-200',
    DELIVERED: 'bg-green-100 text-green-800 border border-green-200',
    CANCELED: 'bg-red-100 text-red-800 border border-red-200',
  }

  if (status === "loading") return <p className="p-10">Checking...</p>

  return (
    <>
<div className="flex">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="ml-64 flex-1 min-h-screen bg-gradient-to-b from-green-50 to-white">
        <div className="p-6">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#8B9D83] to-[#2C3E2E] bg-clip-text text-transparent mb-2">
                Admin Dashboard
              </h1>
              <p className="text-xl text-gray-600">Welcome back, Admin. Manage your business here.</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="group hover:shadow-2xl transition-all border-0 bg-gradient-to-br from-white to-green-50 border border-green-100/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardDescription className="text-sm font-medium text-green-600 group-hover:text-green-700">Total Products</CardDescription>
                <CardTitle className="text-3xl lg:text-4xl font-bold text-[#8B9D83]">{products.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="group hover:shadow-2xl transition-all border-0 bg-gradient-to-br from-white to-blue-50 border border-blue-100/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardDescription className="text-sm font-medium text-blue-600 group-hover:text-blue-700">Total Reviews</CardDescription>
                <CardTitle className="text-3xl lg:text-4xl font-bold text-[#8B9D83]">{reviews.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="group hover:shadow-2xl transition-all border-0 bg-gradient-to-br from-white to-orange-50 border border-orange-100/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardDescription className="text-sm font-medium text-orange-600 group-hover:text-orange-700">Total Orders</CardDescription>
                <CardTitle className="text-3xl lg:text-4xl font-bold text-[#8B9D83]">{orders.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="group hover:shadow-2xl transition-all border-0 bg-gradient-to-br from-white to-emerald-50 border border-emerald-100/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardDescription className="text-sm font-medium text-emerald-600 group-hover:text-emerald-700">Total Revenue</CardDescription>
                <CardTitle className="text-3xl lg:text-4xl font-bold text-[#8B9D83]">Rp {orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0).toLocaleString('id-ID')}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="reports" className="space-y-6">
              <Card className="shadow-xl border-0 bg-white/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">Periodic Vehicle Orders Report</CardTitle>
                  <CardDescription>Generate and export order reports by date range</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>From Date</Label>
                      <Input 
                        type="date" 
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>To Date</Label>
                      <Input 
                        type="date" 
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button onClick={exportOrdersToExcel} className="bg-gradient-to-r from-[#8B9D83] to-[#2C3E2E] hover:from-[#8B9D83]/90 hover:to-[#2C3E2E]/90 shadow-lg hover:shadow-xl transition-all text-lg py-6 font-semibold">
                      📊 Export Excel Report
                    </Button>
                    <div className="text-sm text-gray-600">
                      Orders: {orders.length} total
                      {dateFrom || dateTo && ` | Filtered: ${orders.filter(o => {
                        const d = new Date(o.createdAt)
                        const f = dateFrom ? new Date(dateFrom) : null
                        const t = dateTo ? new Date(dateTo) : null
                        return (!f || d >= f) && (!t || d <= t)
                      }).length}`}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 text-center py-4">
                    Supports date range filtering for periodic vehicle order reports. Exports to XLSX format.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products" className="space-y-6">
              {/* Search & Add Product */}
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50">
                <Input
                  placeholder="Search products..."
                  className="flex-1 max-w-md"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Add Product Form */}
              <form onSubmit={handleCreate}>
                <Card className="shadow-xl border-0 bg-white/60 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-gray-900">Add New Product</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {createError && (
                      <div className="p-4 bg-red-100 border border-red-400 text-red-800 rounded-xl text-sm font-medium">
                        {createError}
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Category *</Label>
                          <Select value={newProduct.categoryId || ''} onValueChange={(value) => setNewProduct({ ...newProduct, categoryId: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih Category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Name *</Label>
                          <Input
                            required
                            placeholder="Product name"
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Price *</Label>
                          <Input
                            required
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Price"
                            value={newProduct.price}
                            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Input
                            placeholder="Description"
                            value={newProduct.description}
                            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Image</Label>
                          <Input type="file" onChange={(e) => handleImageUpload(e, false)} accept="image/*" />
                          {newProduct.image && (
                            <div className="mt-2">
                              <img 
                                src={newProduct.image} 
                                alt="Preview" 
                                className="w-24 h-24 object-cover rounded-lg shadow-md" 
                                onError={(e) => {
                                  console.error('Preview load failed:', newProduct.image)
                                  e.target.src = '/placeholder-product.jpg'
                                  e.target.style.opacity = '0.5'
                                }}
                              />
                              <p className="text-xs text-gray-500 mt-1">Preview: {newProduct.image.slice(0,40)}...</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-[#8B9D83] to-[#2C3E2E] hover:from-[#8B9D83]/90 hover:to-[#2C3E2E]/90 shadow-lg hover:shadow-xl transition-all text-lg py-6 font-semibold disabled:opacity-50">
                      Create Product
                    </Button>
                  </CardContent>
                </Card>
              </form>

              {/* Products Table */}
              {productsError ? (
                <Card className="shadow-xl border-0 bg-white/60 backdrop-blur-sm">
                  <CardContent className="py-20 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl text-red-500">⚠️</span>
                      </div>
                      <p className="text-xl text-gray-600 mb-2">Failed to load products</p>
                      <p className="text-red-600 font-medium max-w-md">{productsError}</p>
                      <Button onClick={fetchProducts} className="mt-4 bg-[#8B9D83] hover:bg-[#2C3E2E]/90">
                        Retry
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : loading ? (
                <Card className="shadow-xl border-0 bg-white/60 backdrop-blur-sm">
                  <CardContent className="py-20 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B9D83] mx-auto mb-4"></div>
                      <p className="text-xl text-gray-600">Loading products...</p>
                    </div>
                  </CardContent>
                </Card>
              ) : products.length === 0 ? (
                <Card className="shadow-xl border-0 bg-white/60 backdrop-blur-sm text-center py-20">
                  <CardContent>
                    <div className="text-center py-8">
                      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">📦</span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">No products yet</h3>
                      <p className="text-gray-600 text-lg">Create your first product using the form above!</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="shadow-xl border-0 bg-white/60 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-bold">Products List ({filteredProducts.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent border-b-2 border-gray-200">
                            <TableHead className="font-semibold text-gray-900 w-8">Image</TableHead>
                            <TableHead className="font-semibold text-gray-900">Name</TableHead>
                            <TableHead className="font-semibold text-gray-900">Price</TableHead>
                            <TableHead className="font-semibold text-gray-900 text-center w-48">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentProducts.map((product) => (
                            <TableRow key={product.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 hover:border-green-100">
                              <TableCell>
                                <img 
                                  src={product.images?.[0] || '/placeholder-product.jpg'} 
                                  alt={product.name}
                                  className="w-12 h-12 object-cover rounded-lg shadow-md"
                                  onError={(e) => {
                                    console.error('Product card img failed:', product.images?.[0], 'ID:', product.id)
                                    e.target.src = '/placeholder-product.jpg'
                                  }}
                                />
                              </TableCell>
                              <TableCell className="font-medium text-lg text-gray-900">{product.name}</TableCell>
                              <TableCell className="font-semibold text-xl text-[#8B9D83]">Rp {Number(product.price).toLocaleString('id-ID')}</TableCell>
                              <TableCell className="flex gap-2 justify-center">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setEditingProduct(product)}
                                  className="hover:bg-blue-50 hover:text-blue-700 border-blue-200 hover:border-blue-300 transition-all"
                                >
                                  Edit
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleDelete(product.id)}
                                  className="hover:bg-red-50 hover:text-red-700 border-red-200 hover:border-red-300 transition-all shadow-sm hover:shadow-md"
                                >
                                  Delete
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="flex items-center justify-between mt-6">
                      <span className="text-sm text-gray-600">Showing {indexFirst + 1}-{Math.min(indexLast, filteredProducts.length)} of {filteredProducts.length} results</span>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="hover:bg-gray-100 transition-all"
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={indexLast >= filteredProducts.length}
                          className="hover:bg-gray-100 transition-all"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Edit Form */}
              {editingProduct && (
                <form onSubmit={handleUpdate}>
                  <Card className="shadow-2xl border-blue-200/50 bg-gradient-to-br from-blue-50 to-white/60 border-2 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold text-blue-900">Edit Product - {editingProduct.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 p-8">
                      {updateError && (
                        <div className="p-4 bg-red-100 border border-red-400 text-red-800 rounded-xl text-sm font-medium">
                          {updateError}
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Category *</Label>
                            <Select value={editingProduct.categoryId || editingProduct.category?.id || ''} onValueChange={(value) => setEditingProduct({ ...editingProduct, categoryId: value })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih Category" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((cat) => (
                                  <SelectItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Name *</Label>
                            <Input
                              required
                              placeholder="Name"
                              value={editingProduct.name || ''}
                              onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Price *</Label>
                            <Input
                              required
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="Price"
                              value={editingProduct.price || ''}
                              onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                            />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Input
                              placeholder="Description"
                              value={editingProduct.description || ''}
                              onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Image</Label>
                            <Input type="file" onChange={(e) => handleImageUpload(e, true)} accept="image/*" />
                            <div className="mt-2 p-4 bg-gray-100 rounded-lg">
                              <img 
                                src={editingProduct.image || editingProduct.images?.[0] || '/placeholder-product.jpg'} 
                                alt="Current" 
                                className="w-32 h-32 object-cover rounded-lg shadow-md mx-auto" 
                                onError={(e) => {
                                  console.error('Edit preview failed:', editingProduct.image || editingProduct.images?.[0])
                                  e.target.src = '/placeholder-product.jpg'
                                }}
                              />
                              <p className="text-xs text-gray-500 text-center mt-2">
                                {editingProduct.image ? 'New preview' : 'Current image'} - Upload to replace
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-4 pt-4 border-t border-blue-100">
                        <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-xl hover:shadow-2xl transition-all text-lg py-7 font-semibold disabled:opacity-50">
                          Update Product
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setEditingProduct(null)} className="flex-1 shadow-lg hover:shadow-xl transition-all border-gray-300 hover:bg-gray-50">
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </form>
              )}
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="space-y-6">
              <div className="flex gap-4 items-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50">
                <Input
                  placeholder="Search reviews (product, user, comment)..."
                  className="flex-1"
                  value={reviewsSearch}
                  onChange={(e) => setReviewsSearch(e.target.value)}
                />
                <Badge variant="outline" className="text-sm">{filteredReviews.length} results</Badge>
              </div>
              
              {reviewsLoading ? (
                <Card className="shadow-xl border-0 bg-white/60 backdrop-blur-sm">
                  <CardContent className="py-20 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B9D83] mx-auto mb-4"></div>
                      <p className="text-xl text-gray-600">Loading reviews...</p>
                    </div>
                  </CardContent>
                </Card>
              ) : reviews.length === 0 ? (
                <Card className="shadow-xl border-0 bg-white/60 backdrop-blur-sm text-center py-20">
                  <CardContent>
                    <div className="text-center py-8">
                      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">📝</span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">No reviews yet</h3>
                      <p className="text-gray-600 text-lg">Add some products and let users review!</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="shadow-xl border-0 bg-white/60 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-bold">Recent Reviews ({filteredReviews.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent border-b-2 border-gray-200">
                            <TableHead>Product</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead>Comment</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-center w-32">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentReviews.map((review) => (
                            <TableRow key={review.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 hover:border-green-100">
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                  <img 
                                    src={review.product?.images?.[0] || '/placeholder-product.jpg'} 
                                    alt={review.product?.name}
                                    className="w-12 h-12 object-cover rounded-xl shadow-md"
                                    onError={(e) => {
                                      e.target.src = '/placeholder-product.jpg'
                                    }}
                                  />
                                  <div>
                                    <p className="font-semibold text-gray-900 truncate max-w-[200px]">{review.product?.name}</p>
                                    <p className="text-xs text-gray-500">Rp {Number(review.product?.price).toLocaleString('id-ID')}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  {review.user?.image ? (
                                    <img 
                                      src={review.user.image} 
                                      alt={review.user.name}
                                      className="w-10 h-10 rounded-full object-cover shadow-md ring-2 ring-white"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center shadow-md ring-2 ring-white text-sm font-bold uppercase">
                                      {review.user?.name?.charAt(0) || '?'}
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="font-semibold text-gray-900 truncate max-w-[150px]">{review.user?.name}</p>
                                    <p className="text-xs text-gray-500 truncate max-w-[150px]">{review.user?.email}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1 text-2xl">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <span key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-300"}>
                                      ★
                                    </span>
                                  ))}
                                </div>
                                <p className="text-sm font-medium text-gray-600 mt-1">{review.rating}/5</p>
                              </TableCell>
                              <TableCell className="max-w-md">
                                <p className="text-sm text-gray-900 line-clamp-2 leading-relaxed">{review.comment || 'No comment'}</p>
                              </TableCell>
                              <TableCell className="text-sm text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString('id-ID', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </TableCell>
                              <TableCell className="text-center">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={async () => {
                                    if (confirm('Hapus review ini?')) {
                                      const res = await fetch(`/api/admin/reviews/${review.id}`, {
                                        method: 'DELETE',
                                      })
                                      if (res.ok) {
                                        fetchReviews()
                                      } else {
                                        alert('Gagal hapus review')
                                      }
                                    }
                                  }}
                                  className="shadow-sm hover:shadow-md transition-all"
                                >
                                  Delete
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                      <span className="text-sm text-gray-600">Showing { (reviewsPage - 1) * 5 + 1}-{Math.min(reviewsPage * 5, filteredReviews.length)} of {filteredReviews.length} results</span>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setReviewsPage(reviewsPage - 1)}
                          disabled={reviewsPage === 1}
                          className="hover:bg-gray-100 transition-all"
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setReviewsPage(reviewsPage + 1)}
                          disabled={reviewsPage * 5 >= filteredReviews.length}
                          className="hover:bg-gray-100 transition-all"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6">
              <div className="flex gap-4 items-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50">
                <Input
                  placeholder="Search orders (order#, user, status)..."
                  className="flex-1"
                  value={ordersSearch}
                  onChange={(e) => setOrdersSearch(e.target.value)}
                />
                <Badge variant="outline" className="text-sm">{filteredOrders.length} results</Badge>
              </div>
              
              {ordersLoading ? (
                <Card className="shadow-xl border-0 bg-white/60 backdrop-blur-sm">
                  <CardContent className="py-20 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B9D83] mx-auto mb-4"></div>
                      <p className="text-xl text-gray-600">Loading orders...</p>
                    </div>
                  </CardContent>
                </Card>
              ) : orders.length === 0 ? (
                <Card className="shadow-xl border-0 bg-white/60 backdrop-blur-sm text-center py-20">
                  <CardContent>
                    <div className="text-center py-8">
                      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🛒</span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h3>
                      <p className="text-gray-600 text-lg">Wait for users to checkout!</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="shadow-xl border-0 bg-white/60 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-bold">Recent Orders ({filteredOrders.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent border-b-2 border-gray-200">
                            <TableHead className="w-20">#</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-center w-48">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentOrders.map((order) => (
                            <TableRow key={order.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 hover:border-green-100">
                              <TableCell className="font-mono font-semibold text-lg">#{order.orderNumber?.slice(-8)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  {order.user?.image ? (
                                    <img 
                                      src={order.user.image} 
                                      alt={order.user.name}
                                      className="w-12 h-12 rounded-full object-cover shadow-md ring-2 ring-white"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center shadow-md ring-2 ring-white text-sm font-bold uppercase">
                                      {order.user?.name?.charAt(0) || '?'}
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="font-semibold text-gray-900 truncate max-w-[180px]">{order.user?.name || order.user?.email}</p>
                                    <p className="text-xs text-gray-500 truncate max-w-[180px]">{order.user?.email}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant="outline" 
                                  className={`font-semibold capitalize px-3 py-1 text-sm ${statusColors[order.status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}
                                >
                                  {order.status === 'PENDING' ? 'Menunggu' : 
                                   order.status === 'PROCESSING' ? 'Proses Pencucian' : 
                                   order.status === 'SHIPPED' ? 'Dikeringkan & Dikemas' : 
                                   order.status === 'DELIVERED' ? 'Diantar ke Rumah' : 
                                   order.status === 'CANCELED' ? 'Dibatalkan' : order.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-bold text-2xl text-[#8B9D83]">Rp {order.totalAmount?.toLocaleString('id-ID')}</TableCell>
                              <TableCell className="font-semibold">{order.items?.length || 0} items</TableCell>
                              <TableCell className="text-sm text-gray-500">
                                {new Date(order.createdAt).toLocaleString('id-ID', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </TableCell>
                              <TableCell className="text-center space-y-2">
                                <Select 
                                  defaultValue={order.status}
                                  onValueChange={(value) => handleUpdateOrderStatus(order.orderNumber, value)}
                                >
                                  <SelectTrigger className="w-[180px] h-10 border-2 border-gray-200 focus:border-[#8B9D83] focus:ring-2 focus:ring-[#8B9D83]/20 shadow-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="PENDING">Menunggu</SelectItem>
                                    <SelectItem value="PROCESSING">Proses Pencucian</SelectItem>
                                    <SelectItem value="SHIPPED">Dikeringkan & Dikemas</SelectItem>
                                    <SelectItem value="DELIVERED">Diantar ke Rumah</SelectItem>
                                    <SelectItem value="CANCELED">Dibatalkan</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                      <span className="text-sm text-gray-600">Showing {ordersIndexFirst + 1}-{Math.min(ordersIndexLast, filteredOrders.length)} of {filteredOrders.length} results</span>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setOrdersPage(ordersPage - 1)}
                          disabled={ordersPage === 1}
                          className="hover:bg-gray-100 transition-all"
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setOrdersPage(ordersPage + 1)}
                          disabled={ordersIndexLast >= filteredOrders.length}
                          className="hover:bg-gray-100 transition-all"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
        </div>
      </div>
    </>
  )
}
