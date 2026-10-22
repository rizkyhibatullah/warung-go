import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayEnd = new Date(todayStart.getTime() + 86400000)
    const weekStart = new Date(now.getTime() - 6 * 86400000)
    const yearStart = new Date(now.getFullYear() - 1, now.getMonth(), 1)

    // Semua agregasi berat dikerjakan database dalam 1 round-trip per query,
    // bukan dengan memuat seluruh histori transaksi ke memori Node.
    const [
      todayTransactions,
      todayRaw,
      weeklyRaw,
      monthlyRaw,
      topProductsRaw,
      lowStockProducts,
      profitRaw,
    ] = await Promise.all([
      prisma.transaction.count({
        where: { status: "paid", createdAt: { gte: todayStart, lt: todayEnd } },
      }),
      prisma.transaction.aggregate({
        where: { status: "paid", createdAt: { gte: todayStart, lt: todayEnd } },
        _sum: { total: true },
      }),
      prisma.transaction.findMany({
        where: { status: "paid", createdAt: { gte: weekStart } },
        select: { total: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.transaction.findMany({
        where: { status: "paid", createdAt: { gte: yearStart } },
        select: { total: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.$queryRaw<Array<{ productId: string; name: string; totalQty: number }>>`
        SELECT ti.product_id AS "productId", p.name AS name, SUM(ti.qty)::int AS "totalQty"
        FROM transaction_items ti
        JOIN products p ON p.id = ti.product_id
        GROUP BY ti.product_id, p.name
        ORDER BY SUM(ti.qty) DESC
        LIMIT 5
      `,
      prisma.$queryRawUnsafe<
        Array<{ id: string; name: string; stock_qty: number; min_stock_alert: number }>
      >(
        `SELECT id, name, stock_qty, min_stock_alert FROM products WHERE is_active = true AND stock_qty <= min_stock_alert`
      ),
      prisma.$queryRaw<Array<{ totalRevenue: number; totalCost: number }>>`
        SELECT COALESCE(SUM(ti.qty * ti.price_at_sale), 0)::float AS "totalRevenue",
               COALESCE(SUM(ti.qty * p.cost_price), 0)::float AS "totalCost"
        FROM transaction_items ti
        JOIN transactions t ON t.id = ti.transaction_id AND t.status = 'paid'
        JOIN products p ON p.id = ti.product_id
      `,
    ])

    const todayRevenue = todayRaw._sum.total ?? 0

    const weeklyRevenue: { date: string; revenue: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000)
      const dateStr = d.toISOString().slice(0, 10)
      const dayTotal = weeklyRaw
        .filter((t: { createdAt: Date; total: number }) => t.createdAt.toISOString().slice(0, 10) === dateStr)
        .reduce((sum: number, t: { total: number }) => sum + t.total, 0)
      weeklyRevenue.push({ date: dateStr, revenue: dayTotal })
    }

    const monthlyMap = new Map<string, number>()
    for (const t of monthlyRaw) {
      const key = t.createdAt.toISOString().slice(0, 7)
      monthlyMap.set(key, (monthlyMap.get(key) || 0) + t.total)
    }
    const monthlyRevenue: { month: string; revenue: number }[] = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = d.toISOString().slice(0, 7)
      monthlyRevenue.push({ month: key, revenue: monthlyMap.get(key) ?? 0 })
    }

    const topProducts = topProductsRaw.map(
      (p: { productId: string; name: string; totalQty: number | string }) => ({
        productId: p.productId,
        name: p.name ?? "Unknown",
        totalQty: Number(p.totalQty) ?? 0,
      })
    )

    const lowStockFormatted = lowStockProducts.map((p: { id: string; name: string; stock_qty: number; min_stock_alert: number }) => ({
      id: p.id,
      name: p.name,
      stockQty: p.stock_qty,
      minStockAlert: p.min_stock_alert,
    }))

    const totalRevenue = Number(profitRaw[0]?.totalRevenue ?? 0)
    const totalCost = Number(profitRaw[0]?.totalCost ?? 0)
    const profitSummary = {
      totalRevenue,
      totalCost,
      totalProfit: totalRevenue - totalCost,
    }

    return Response.json({
      todayRevenue,
      todayTransactions,
      weeklyRevenue,
      monthlyRevenue,
      topProducts,
      lowStockProducts: lowStockFormatted,
      profitSummary,
    })
  } catch (error) {
    return Response.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
