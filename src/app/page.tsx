import Link from "next/link"
import {
  MapPinIcon,
  ArrowRightIcon,
  ShoppingBagIcon,
  BuildingStorefrontIcon,
  SparklesIcon,
  PlusIcon,
  ClockIcon,
  StarIcon as StarIconSolid,
} from "@heroicons/react/24/outline"
import MenuSection, { type Product } from "@/components/landing/MenuSection"
import { formatCurrency } from "@/lib/utils"

async function getProducts() {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/products`, { cache: "no-store" })
    if (!res.ok) return []
    const data = await res.json()
    if (Array.isArray(data)) return data
    if (data && Array.isArray(data.products)) return data.products
    return []
  } catch {
    return []
  }
}

async function getCategories() {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/categories`, { cache: "no-store" })
    if (!res.ok) return []
    const data = await res.json()
    if (Array.isArray(data)) return data
    if (data && Array.isArray(data.categories)) return data.categories
    return []
  } catch {
    return []
  }
}

async function getStore() {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/products`, { cache: "no-store" })
    if (!res.ok) return null
    const data = await res.json()
    if (data && data.store) return data.store
    return null
  } catch {
    return null
  }
}

const storefrontItems = [
  { name: "Beras 5 kg", price: "Rp 62.000" },
  { name: "Minyak Goreng 2 L", price: "Rp 34.000" },
  { name: "Telur Ayam 1 kg", price: "Rp 28.000" },
  { name: "Gula Pasir 1 kg", price: "Rp 17.000" },
]

export default async function LandingPage() {
  const [products, categories, store] = await Promise.all([getProducts(), getCategories(), getStore()])
  const featured = (products as Product[]).filter((p) => p.isActive).slice(0, 8)
  const heroItems = featured.slice(0, 4)

  return (
    <div className="min-h-screen bg-off-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-off-white/90 backdrop-blur-md border-b border-cream-dark">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-terracotta flex items-center justify-center">
              <BuildingStorefrontIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif font-semibold text-brown text-lg">WarungGo</span>
          </Link>
          <nav className="flex items-center gap-6">
            <a href="#sembako" className="text-sm text-brown-light hover:text-brown transition-colors hidden sm:block">
              Sembako
            </a>
            <a href="#cara-pesan" className="text-sm text-brown-light hover:text-brown transition-colors hidden sm:block">
              Cara Pesan
            </a>
            <Link
              href="/login"
              className="px-5 py-2 rounded-xl bg-terracotta text-white text-sm font-semibold hover:bg-terracotta-light transition-colors shadow-sm"
            >
              Kelola Warung
            </Link>
            <Link href="/login" className="px-4 py-2 rounded-xl border border-cream-dark text-brown text-sm font-medium hover:bg-cream transition-colors hidden sm:block">
              Masuk
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative pt-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cream via-off-white to-success/5" />
          <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-24">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-success/10 border border-success/20 text-success text-sm mb-6">
                  <span className="w-2 h-2 rounded-full bg-success" />
                  Etalase digital warung sembako
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-brown leading-[1.1]">
                  Warung di ujung jalan,
                  <br />
                  kini di{" "}
                  <span className="relative inline-block text-terracotta">
                    ujung jari
                    <svg className="absolute -bottom-1.5 left-0 w-full" viewBox="0 0 200 12" fill="none" preserveAspectRatio="none">
                      <path d="M2 8C40 2 160 2 198 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-terracotta/70" />
                    </svg>
                  </span>
                </h1>
                <p className="mt-5 text-base md:text-lg text-brown-light leading-relaxed max-w-lg">
                  WarungGo bantu warung sembako punya toko online sendiri. Pelanggan bisa
                  lihat dan pesan beras, minyak, telur, dan kebutuhan harian dari HP&mdash;tanpa
                  ubah cara jualanmu.
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-8">
                  <Link href="/order" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-terracotta text-white font-semibold hover:bg-terracotta-light transition-colors shadow-lg shadow-terracotta/20">
                    Pesan Sekarang
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                  <Link href="#sembako" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-cream-dark text-brown font-semibold hover:bg-cream transition-colors">
                    Lihat Sembako
                  </Link>
                  <Link href="/login" className="text-sm text-brown-light hover:text-brown underline-offset-4 hover:underline">
                    Kelola Warung
                  </Link>
                </div>
                <div className="flex items-center gap-5 mt-7 text-xs text-brown-light">
                  <span className="inline-flex items-center gap-1.5"><SparklesIcon className="w-4 h-4 text-success" /> Tanpa biaya buka etalase</span>
                  <span className="inline-flex items-center gap-1.5"><SparklesIcon className="w-4 h-4 text-success" /> Stok otomatis</span>
                </div>
              </div>

              <div className="relative hidden md:block">
                <div className="absolute -top-6 -right-6 w-40 h-40 rounded-3xl bg-terracotta/10 -z-0" />
                <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-3xl bg-success/10 -z-0" />

                <div className="relative bg-white rounded-3xl border border-cream-dark shadow-xl shadow-brown/5 p-5 max-w-sm ml-auto mr-auto">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-terracotta/15 flex items-center justify-center">
                        <BuildingStorefrontIcon className="w-5 h-5 text-terracotta" />
                      </div>
                      <div>
                        <p className="font-serif font-semibold text-brown text-sm leading-tight">{store?.name ?? "Warung Sembako"}</p>
                        <p className="text-[11px] text-success inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-success" /> Buka · Antar sekitar
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-cream px-3 py-2 text-sm text-brown-light">
                    <MapPinIcon className="w-4 h-4 text-terracotta" />
                    <span className="truncate">{store?.address ?? "Jl. Mawar No. 12"}</span>
                  </div>

                  <div className="mt-4 space-y-2">
                    {heroItems.length > 0 ? (
                      heroItems.map((item) => {
                        const soldOut = typeof item.stock === "number" && item.stock <= 0
                        return (
                          <div key={item.id} className="flex items-center justify-between rounded-2xl border border-cream-dark px-3 py-2.5">
                            <div className="min-w-0">
                              <p className="font-medium text-brown text-sm truncate">{item.name}</p>
                              <p className="text-xs text-terracotta font-semibold">
                                {formatCurrency(item.price)}{item.unit ? ` / ${item.unit}` : ""}
                              </p>
                            </div>
                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${soldOut ? "bg-cream-dark text-brown-light" : "bg-terracotta/10 text-terracotta"}`}>
                              <PlusIcon className="w-4 h-4" />
                            </span>
                          </div>
                        )
                      })
                    ) : (
                      storefrontItems.map((item) => (
                        <div key={item.name} className="flex items-center justify-between rounded-2xl border border-cream-dark px-3 py-2.5">
                          <div>
                            <p className="font-medium text-brown text-sm">{item.name}</p>
                            <p className="text-xs text-terracotta font-semibold">{item.price}</p>
                          </div>
                          <span className="w-8 h-8 rounded-lg bg-terracotta/10 text-terracotta flex items-center justify-center">
                            <PlusIcon className="w-4 h-4" />
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  <Link href="/order" className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-brown text-cream text-sm font-semibold hover:bg-charcoal transition-colors">
                    Pesan lewat WarungGo
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                  <p className="text-center text-[11px] text-brown-light mt-2 inline-flex items-center gap-1 justify-center w-full">
                    <ClockIcon className="w-3.5 h-3.5" /> Buka {store?.openHour ?? "08.00"} – {store?.closeHour ?? "21.00"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="cara-pesan" className="py-20 px-6 bg-off-white scroll-mt-16">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-2xl mb-12">
              <p className="text-sm font-semibold text-terracotta uppercase tracking-wide">Satu warung, dua yang terbantu</p>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-brown mt-2">
                Warung tetap warung, cuma jadi lebih mudah.
              </h2>
              <p className="text-brown-light mt-3 leading-relaxed">
                WarungGo bukan toko baru. Kita cuma kasih warung sembako seperti punya etalase
                online sendiri&mdash;pelanggan pesan dari HP, pemilik kelola dari dashboard.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-3xl border border-success/20 bg-success/5 p-7 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 rounded-2xl bg-success/15 flex items-center justify-center">
                    <ShoppingBagIcon className="w-6 h-6 text-success" />
                  </div>
                  <h3 className="font-serif font-semibold text-brown text-xl">Buat Pelanggan Kami</h3>
                </div>
                <ol className="space-y-5">
                  {[
                    { t: "Lihat sembako kami", d: "Cek beras, minyak, telur, dan kebutuhan harian yang tersedia hari ini dalam satu halaman." },
                    { t: "Pesan & pilih cara terima", d: "Ambil sendiri ke warung, atau minta diantar ke rumah kalau lagi tak sempat." },
                    { t: "Bayar & terima", d: "Pesanan tercatat rapi, tinggal ambil di warung atau tunggu di depan rumah." },
                  ].map((s, i) => (
                    <li key={i} className="flex gap-4">
                      <span className="w-7 h-7 rounded-full bg-success/15 text-success font-semibold text-sm flex items-center justify-center shrink-0">{i + 1}</span>
                      <div>
                        <p className="font-semibold text-brown">{s.t}</p>
                        <p className="text-sm text-brown-light leading-relaxed">{s.d}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-3xl border border-terracotta/20 bg-terracotta/5 p-7 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 rounded-2xl bg-terracotta/15 flex items-center justify-center">
                    <BuildingStorefrontIcon className="w-6 h-6 text-terracotta" />
                  </div>
                  <h3 className="font-serif font-semibold text-brown text-xl">Buat Pemilik Warung</h3>
                </div>
                <ol className="space-y-5">
                  {[
                    { t: "Kelola etalase", d: "Tampilkan barang jualan di satu halaman, tanpa ribet dan tanpa sewa kios online." },
                    { t: "Atur stok & harga", d: "Update sekali sentuh&mdash;stok otomatis berkurang tiap ada yang pesan." },
                    { t: "Terima pesanan", d: "Notifikasi pesanan masuk langsung ke HP, tinggal siapkan barangnya." },
                  ].map((s, i) => (
                    <li key={i} className="flex gap-4">
                      <span className="w-7 h-7 rounded-full bg-terracotta/15 text-terracotta font-semibold text-sm flex items-center justify-center shrink-0">{i + 1}</span>
                      <div>
                        <p className="font-semibold text-brown">{s.t}</p>
                        <p className="text-sm text-brown-light leading-relaxed" dangerouslySetInnerHTML={{ __html: s.d }} />
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        <MenuSection products={featured} categories={categories} />

        <section id="info" className="py-20 px-6 bg-cream/50 scroll-mt-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-serif font-bold text-brown text-center mb-3">Kata Mereka</h2>
            <p className="text-brown-light text-center mb-12 max-w-lg mx-auto">Dari balik etalase warung sampai ke dapur pelanggan.</p>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: "Bu Siti", role: "Pemilik Warung", text: "Dulu yang pesan cuma yang lewat depan. Sejak pakai WarungGo, langganan di komplek sebelah mulai nitip beras & minyak. Dagangan nggak numpuk.", rating: 5 },
                { name: "Ibu Ani", role: "Pelanggan", text: "Malem-malem kehabisan beras, tinggal buka WarungGo—tinggal pesan, sepuluh menit sampai. Nggak perlu ke warung hujan-hujanan.", rating: 5 },
                { name: "Anwar", role: "Pelanggan", text: "Galon & bumbu dapur langganan aku sekarang bisa dipesan dari HP. Bu Siti juga ingat kalau aku suka yang pedas.", rating: 5 },
              ].map((testimonial, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-cream-dark hover:shadow-md transition-shadow">
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <StarIconSolid key={j} className={`w-4 h-4 ${j < testimonial.rating ? "text-gold" : "text-cream-dark"}`} />
                    ))}
                  </div>
                  <p className="text-brown text-sm leading-relaxed italic">&ldquo;{testimonial.text}&rdquo;</p>
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-cream-dark/50">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-terracotta/30 to-gold/30 flex items-center justify-center text-brown font-semibold text-sm shrink-0">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-brown">{testimonial.name}</p>
                      <p className="text-xs text-brown-light">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-6 bg-brown relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]">
            <div className="absolute top-8 left-8 text-7xl">🛒</div>
            <div className="absolute bottom-8 right-8 text-7xl">🏪</div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl">📦</div>
          </div>
          <div className="relative max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-cream mb-4">
              Punya warung sembako?
            </h2>
            <p className="text-cream-dark text-lg mb-8 max-w-xl mx-auto">
              Bawa warungmu ke WarungGo. Gratis daftar, tanpa potongan mahal&mdash;pelanggan
              tinggal satunya klik untuk pesan.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-terracotta text-white font-semibold hover:bg-terracotta-light transition-colors shadow-lg shadow-black/10"
            >
              Kelola Warung Sekarang
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-charcoal py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-terracotta flex items-center justify-center">
                <BuildingStorefrontIcon className="w-4 h-4 text-white" />
              </div>
              <span className="font-serif font-semibold text-cream">WarungGo</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-cream-dark">
              <a href="#sembako" className="hover:text-cream transition-colors">Sembako</a>
              <a href="#cara-pesan" className="hover:text-cream transition-colors">Cara Pesan</a>
              <Link href="/login" className="hover:text-cream transition-colors">Kelola Warung</Link>
              <Link href="/login" className="hover:text-cream transition-colors">Masuk</Link>
            </div>
            <p className="text-cream-dark text-sm">&copy; 2026 WarungGo</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
