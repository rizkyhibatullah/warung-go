import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface TransactionItemInput {
  productId: string
  qty: number
}

interface TransactionRow {
  id: string
  invoiceNo: string
  paymentMethod: string
  subtotal: number
  discount: number
  total: number
  status: string
  createdAt: Date
  cashier: { id: string; name: string }
  items: Array<{
    id: string
    qty: number
    priceAtSale: number
    subtotal: number
    product: { id: string; name: string }
  }>
}

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Batasi jumlah baris agar payload tidak membengkak seiring waktu.
    const { searchParams } = new URL(request.url)
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") ?? "100", 10) || 100, 1),
      500
    )

    // Satu query agregat (transaksi + item + nama produk/kasir) supaya hanya
    // 1 round-trip ke database, bukan 2 query berurutan seperti sebelumnya.
    // Kolom dibatasi ke yang dipakai frontend (item.product.name, cashier.name).
    const transactions = await prisma.$queryRaw<TransactionRow[]>`
      SELECT t.id,
             t.invoice_no AS "invoiceNo",
             t.payment_method AS "paymentMethod",
             t.subtotal, t.discount, t.total, t.status,
             t.created_at AS "createdAt",
             json_build_object('id', u.id, 'name', u.name) AS cashier,
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', ti.id,
                   'qty', ti.qty,
                   'priceAtSale', ti.price_at_sale,
                   'subtotal', ti.subtotal,
                   'product', json_build_object('id', p.id, 'name', p.name)
                 ) ORDER BY ti.id
               ) FILTER (WHERE ti.id IS NOT NULL),
               '[]'
             ) AS items
      FROM transactions t
      JOIN users u ON u.id = t.cashier_id
      LEFT JOIN transaction_items ti ON ti.transaction_id = t.id
      LEFT JOIN products p ON p.id = ti.product_id
      GROUP BY t.id, u.id, u.name
      ORDER BY t.created_at DESC
      LIMIT ${limit}
    `

    return Response.json(transactions)
  } catch (error) {
    return Response.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { items, paymentMethod, discount = 0 } = body as {
      items: TransactionItemInput[]
      paymentMethod: string
      discount?: number
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return Response.json({ error: "Items are required" }, { status: 400 })
    }

    if (!paymentMethod) {
      return Response.json({ error: "Payment method is required" }, { status: 400 })
    }

    const products = await prisma.product.findMany({
      where: { id: { in: items.map((i: TransactionItemInput) => i.productId) }, isActive: true },
    })

    const productMap = new Map<string, { id: string; stockQty: number; name: string; price: number }>(
      products.map((p: any) => [p.id, p as { id: string; stockQty: number; name: string; price: number }])
    )

    for (const item of items) {
      const product = productMap.get(item.productId)
      if (!product) {
        return Response.json(
          { error: `Product ${item.productId} not found or inactive` },
          { status: 400 }
        )
      }
      if (product.stockQty < item.qty) {
        return Response.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        )
      }
    }

    const invoiceNo = `INV-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

    const subtotal = items.reduce((sum, item) => {
      const product = productMap.get(item.productId)!
      return sum + product.price * item.qty
    }, 0)

    const total = subtotal - discount

    const transaction = await prisma.$transaction(async (tx: any) => {
      const trx = await tx.transaction.create({
        data: {
          invoiceNo,
          cashierId: session.user.id,
          paymentMethod,
          subtotal,
          discount,
          total,
          status: "paid",
          items: {
            create: items.map((item) => {
              const product = productMap.get(item.productId)!
              return {
                productId: item.productId,
                qty: item.qty,
                priceAtSale: product.price,
                subtotal: product.price * item.qty,
              }
            }),
          },
        },
        include: {
          items: { include: { product: true } },
          cashier: { select: { id: true, name: true, email: true } },
        },
      })

      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQty: { decrement: item.qty } },
        })

        await tx.stockLog.create({
          data: {
            productId: item.productId,
            changeQty: -item.qty,
            type: "sale",
            reason: `Sale ${invoiceNo}`,
            createdBy: session.user.id,
          },
        })
      }

      return trx
    })

    return Response.json(transaction, { status: 201 })
  } catch (error) {
    return Response.json({ error: "Failed to create transaction" }, { status: 500 })
  }
}
