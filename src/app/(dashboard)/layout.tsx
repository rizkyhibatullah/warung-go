"use client"

import { SessionProvider } from "next-auth/react"
import Sidebar from "@/components/Sidebar"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <SessionProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 bg-off-white overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="p-6"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </SessionProvider>
  )
}
