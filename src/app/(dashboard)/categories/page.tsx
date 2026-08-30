"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import toast from "react-hot-toast"
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface Category {
  id: string
  name: string
  _count?: { products: number }
}

export default function CategoriesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editCategory, setEditCategory] = useState<Category | null>(null)
  const [form, setForm] = useState({ name: "" })

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated") fetchCategories()
  }, [status, router])

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories")
      const data = await res.json()
      setCategories(Array.isArray(data) ? data : Array.isArray(data?.categories) ? data.categories : [])
    } catch {
      toast.error("Gagal memuat kategori")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editCategory ? `/api/categories/${editCategory.id}` : "/api/categories"
      const method = editCategory ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast.success(editCategory ? "Kategori diupdate" : "Kategori ditambahkan")
      setShowModal(false)
      setEditCategory(null)
      setForm({ name: "" })
      fetchCategories()
    } catch {
      toast.error("Gagal menyimpan kategori")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus kategori ini?")) return
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success("Kategori dihapus")
      fetchCategories()
    } catch {
      toast.error("Gagal menghapus kategori (mungkin masih memiliki produk)")
    }
  }

  const openEdit = (cat: Category) => {
    setEditCategory(cat)
    setForm({ name: cat.name })
    setShowModal(true)
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terracotta" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-brown">Kategori</h1>
          <p className="text-brown-light mt-1">Kelola kategori produk</p>
        </div>
        <button
          onClick={() => { setEditCategory(null); setForm({ name: "" }); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-terracotta text-white rounded-xl hover:bg-terracotta-light transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Tambah Kategori
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-cream-dark">
        <h2 className="text-lg font-serif font-semibold text-brown mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-terracotta" />
          Semua Kategori
        </h2>
        <div className="space-y-2">
          {categories.length === 0 && <p className="text-brown-light text-sm">Belum ada kategori</p>}
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-cream/50 hover:bg-cream transition-colors">
              <div>
                <span className="font-medium text-brown">{cat.name}</span>
                <span className="ml-2 text-xs text-brown-light">({cat._count?.products ?? 0} produk)</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-cream-dark text-brown-light hover:text-brown transition-colors">
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(cat.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-brown-light hover:text-red-600 transition-colors">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-serif font-semibold text-brown mb-4">
              {editCategory ? "Edit Kategori" : "Tambah Kategori"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brown mb-1">Nama Kategori</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-off-white text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-cream-dark text-brown hover:bg-cream transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-terracotta text-white hover:bg-terracotta-light transition-colors"
                >
                  {editCategory ? "Simpan" : "Tambah"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
