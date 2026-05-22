"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/admin/data-table'
import { Plus, Pencil, Trash2 } from 'lucide-react'

type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  _count: { products: number }
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCategories = () => {
    fetch('/api/admin/categories')
      .then((r) => r.json())
      .then((data) => { setCategories(data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchCategories() }, [])

  const handleDelete = async (slug: string) => {
    if (!confirm('Delete this category?')) return
    await fetch(`/api/categories/${slug}`, { method: 'DELETE' })
    fetchCategories()
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'slug', label: 'Slug' },
    {
      key: 'description',
      label: 'Description',
      render: (row: Category) => row.description ?? '—',
    },
    {
      key: 'products',
      label: 'Products',
      render: (row: Category) => row._count.products,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row: Category) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" asChild>
            <Link href={`/admin/categories/${row.id}/edit`}><Pencil className="h-4 w-4" /></Link>
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
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button asChild>
          <Link href="/admin/categories/new"><Plus className="h-4 w-4 mr-2" />New Category</Link>
        </Button>
      </div>
      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <DataTable data={categories} columns={columns} />
      )}
    </div>
  )
}
