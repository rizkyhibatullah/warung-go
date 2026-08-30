"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { formatCurrency } from "@/lib/utils"

interface Category {
  id: string
  name: string
  type?: string
  colorTag?: string
  _count?: { products: number }
}

export interface Product {
  id: string
  name: string
  price: number
  description?: string
  imageUrl?: string
  stockQty?: number
  stock?: number
  unit?: string
  categoryId: string
  category?: { id: string; name: string; colorTag?: string }
  isActive?: boolean
}

interface MenuSectionProps {
  products: Product[]
  categories: Category[]
}

type DisplayItem = {
  id?: string
  name: string
  price: number
  description?: string
  imageUrl?: string
  emoji?: string
  stockQty?: number
  stock?: number
  unit?: string
  categoryId?: string
  category?: { id: string; name: string; colorTag?: string }
}

const fallbackItems = [
  { name: "Beras 5kg", price: 62000, emoji: "🍚" },
  { name: "Minyak Goreng 2L", price: 34000, emoji: "🛢️" },
  { name: "Gula Pasir 1kg", price: 17000, emoji: "🍬" },
  { name: "Telur Ayam 1kg", price: 28000, emoji: "🥚" },
  { name: "Tepung Terigu 1kg", price: 12000, emoji: "🌾" },
  { name: "Susu Kental Manis", price: 11000, emoji: "🥛" },
  { name: "Mie Instan (12 pcs)", price: 24000, emoji: "🍜" },
  { name: "Garam Dapur 500g", price: 5000, emoji: "🧂" },
]

export default function MenuSection({ products, categories }: MenuSectionProps) {
  const [activeCategory, setActiveCategory] = useState("all")

  const derivedCategories: Category[] =
    categories.length > 0
      ? categories
      : Array.from(
          new Map(
            products
              .filter((p) => p.category)
              .map((p) => [p.category!.id, p.category as Category])
          ).values()
        )

  const filteredProducts =
    products.length > 0
      ? activeCategory === "all"
        ? products
        : products.filter((p) => p.categoryId === activeCategory)
      : null

  const displayItems: DisplayItem[] =
    filteredProducts !== null ? filteredProducts : fallbackItems

  return (
    <section id="sembako" className="py-20 px-6 bg-cream scroll-mt-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-brown">Sembako yang Sering Dicari</h2>
          <p className="text-brown-light mt-2">Ambil dari warung terdekat, bukan dari toko yang jauh</p>
        </div>

        {derivedCategories.length > 0 && (
          <div className="flex gap-2 mb-10 overflow-x-auto pb-1 scrollbar-thin -mx-4 px-4 justify-center">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                activeCategory === "all"
                  ? "bg-terracotta text-white shadow-sm shadow-terracotta/20"
                  : "bg-white text-brown-light hover:bg-cream border border-cream-dark"
              }`}
            >
              Semua
            </button>
            {derivedCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 inline-flex items-center gap-1.5 ${
                  activeCategory === cat.id
                    ? "bg-terracotta text-white shadow-sm shadow-terracotta/20"
                    : "bg-white text-brown-light hover:bg-cream border border-cream-dark"
                }`}
              >
                {cat.colorTag && (
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.colorTag }} />
                )}
                {cat.name}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <AnimatePresence mode="popLayout">
            {displayItems.map((item, i) => {
              const stock = item.stockQty ?? item.stock
              const soldOut = typeof stock === "number" && stock <= 0
              return (
                <motion.div
                  key={item.id ?? i}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25, delay: i * 0.03 }}
                  className="bg-white rounded-2xl overflow-hidden border border-cream-dark hover:shadow-lg hover:shadow-brown/5 transition-all hover:-translate-y-1"
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-cream to-cream-dark flex items-center justify-center">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">{item.emoji || "🛒"}</span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-serif font-semibold text-brown">{item.name}</h3>
                      {item.unit && (
                        <span className="text-[10px] text-brown-light bg-cream rounded-full px-2 py-0.5 whitespace-nowrap shrink-0">
                          {item.unit}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-brown-light text-xs mt-1 line-clamp-2">{item.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-bold text-terracotta">{formatCurrency(item.price)}</span>
                      {soldOut && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">Habis</span>
                      )}
                    </div>
                    {soldOut ? (
                      <span className="mt-3 block w-full text-center py-2 rounded-xl bg-cream-dark text-brown-light text-sm font-semibold cursor-not-allowed">
                        Habis
                      </span>
                    ) : (
                      <Link
                        href="/order"
                        className="mt-3 block w-full text-center py-2 rounded-xl bg-terracotta text-white text-sm font-semibold hover:bg-terracotta-light transition-colors"
                      >
                        Pesan
                      </Link>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {products.length > 0 && filteredProducts !== null && filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-brown-light/60">
            <p className="text-sm">Tidak ada produk di kategori ini</p>
          </div>
        )}
      </div>
    </section>
  )
}
