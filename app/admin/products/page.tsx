"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/admin/data-table'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2 } from 'lucide-react'

type Product = {
  id: string
  name: string
  slug: string
  price: number
  stock: number
  published: boolean
  featuredProduct: boolean
  category?: { name: string } | null
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const fetchProducts = (p: number) => {
    setLoading(true)
    fetch(`/api/products?page=${p}&limit=20`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.items ?? [])
        setTotal(data.total ?? 0)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchProducts(page) }, [page])

  const handleDelete = async (slug: string) => {
    if (!confirm('Delete this product?')) return
    await fetch(`/api/products/${slug}`, { method: 'DELETE' })
    fetchProducts(page)
  }

  const columns = [
    { key: 'name', label: 'Name' },
    {
      key: 'category',
      label: 'Category',
      render: (row: Product) => row.category?.name ?? '—',
    },
    {
      key: 'price',
      label: 'Price',
      render: (row: Product) => `₹${Number(row.price).toFixed(2)}`,
    },
    { key: 'stock', label: 'Stock' },
    {
      key: 'published',
      label: 'Status',
      render: (row: Product) => (
        <div className="flex gap-1">
          <Badge variant={row.published ? 'default' : 'secondary'}>
            {row.published ? 'Live' : 'Draft'}
          </Badge>
          {row.featuredProduct && <Badge variant="outline">Featured</Badge>}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row: Product) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" asChild>
            <Link href={`/admin/products/${row.id}/edit`}><Pencil className="h-4 w-4" /></Link>
          </Button>
          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(row.slug)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button asChild>
          <Link href="/admin/products/new"><Plus className="h-4 w-4 mr-2" />New Product</Link>
        </Button>
      </div>
      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <DataTable
          data={products}
          columns={columns}
          total={total}
          page={page}
          limit={20}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}