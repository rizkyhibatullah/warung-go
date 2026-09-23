"use client"

import { useEffect, useState, useCallback } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ShoppingCartIcon,
  CubeIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Squares2X2Icon,
  TagIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline"
import { useCartStore } from "@/lib/store"

const navItems = [
  { href: "/pos", label: "POS / Kasir", icon: ShoppingCartIcon, roles: ["owner", "kasir"] },
  { href: "/categories", label: "Kategori", icon: TagIcon, roles: ["owner"] },
  { href: "/products", label: "Produk", icon: CubeIcon, roles: ["owner"] },
  { href: "/stock", label: "Stok", icon: Squares2X2Icon, roles: ["owner", "kasir"] },
  { href: "/transactions", label: "Transaksi", icon: ClipboardDocumentListIcon, roles: ["owner", "kasir"] },
  { href: "/dashboard", label: "Dashboard", icon: ChartBarIcon, roles: ["owner"] },
  { href: "/settings", label: "Pengaturan", icon: Cog6ToothIcon, roles: ["owner"] },
]

export default function Sidebar() {
  const pathname = usePathname()
  const totalItems = useCartStore((s) => s.totalItems())
  const [open, setOpen] = useState(false)
  const closeDrawer = useCallback(() => setOpen(false), [])

  // Tutup drawer otomatis setiap pindah halaman.
  // Dilakukan saat link diklik (onNavigate) agar tidak memanggil
  // setState sinkron di dalam effect (react-hooks/set-state-in-effect).

  // Kunci scroll body saat drawer terbuka
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  const navList = (onNavigate?: () => void) => (
    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
            pathname === item.href
              ? "bg-gold/20 text-gold"
              : "text-cream/70 hover:text-cream hover:bg-cream/10"
          }`}
        >
          <item.icon className="w-5 h-5 shrink-0" />
          <span className="truncate">{item.label}</span>
          {item.href === "/pos" && totalItems > 0 && (
            <span className="ml-auto bg-terracotta text-white text-xs min-w-5 h-5 px-1 rounded-full flex items-center justify-center shrink-0">
              {totalItems > 99 ? "99+" : totalItems}
            </span>
          )}
        </Link>
      ))}
    </nav>
  )

  return (
    <>
      {/* Top bar khusus mobile */}
      <div className="md:hidden sticky top-0 z-30 flex items-center justify-between gap-3 bg-brown px-4 h-16 shrink-0">
        <Link href="/pos" className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gold flex items-center justify-center shrink-0">
            <span className="text-brown font-serif font-bold">WG</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-cream font-serif font-semibold leading-tight truncate">WarungGo</h1>
            <p className="text-cream-dark text-[11px] leading-tight truncate">Kasir & Manajemen</p>
          </div>
        </Link>
        <button
          onClick={() => setOpen(true)}
          aria-label="Buka menu navigasi"
          className="p-2.5 -mr-1 rounded-xl text-cream hover:bg-cream/10 active:bg-cream/20 transition-colors"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-64 bg-brown sticky top-0 h-screen flex-col overflow-y-auto shrink-0">
        <div className="p-6 border-b border-brown-light/20">
          <Link href="/pos" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center">
              <span className="text-brown font-serif font-bold text-lg">WG</span>
            </div>
            <div>
              <h1 className="text-cream font-serif font-semibold text-lg leading-tight">Warung</h1>
              <p className="text-cream-dark text-xs">Go</p>
            </div>
          </Link>
        </div>

        {navList()}

        <div className="p-4 border-t border-brown-light/20">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-cream/70 hover:text-cream hover:bg-cream/10 w-full transition-all"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Drawer mobile */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeDrawer}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-[85vw] max-w-xs bg-brown flex flex-col md:hidden shadow-2xl"
            >
              <div className="p-5 border-b border-brown-light/20 flex items-center justify-between gap-3">
                <Link href="/pos" onClick={closeDrawer} className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center shrink-0">
                    <span className="text-brown font-serif font-bold text-lg">WG</span>
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-cream font-serif font-semibold text-lg leading-tight truncate">WarungGo</h1>
                    <p className="text-cream-dark text-xs truncate">Kasir & Manajemen</p>
                  </div>
                </Link>
                <button
                  onClick={closeDrawer}
                  aria-label="Tutup menu navigasi"
                  className="p-2 rounded-xl text-cream/70 hover:text-cream hover:bg-cream/10 transition-colors shrink-0"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {navList(closeDrawer)}

              <div className="p-4 border-t border-brown-light/20">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-cream/70 hover:text-cream hover:bg-cream/10 w-full transition-all"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <span>Keluar</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
