import { prisma } from "@/lib/prisma"

async function notifyTelegram(order: any) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return

  const idShort = order.id.slice(0, 6).toUpperCase()
  const total = order.items.reduce((s: number, i: any) => s + Number(i.subtotal), 0)
  const itemsText = order.items.map((i: any) => `• ${i.product.name} x${i.qty} — Rp ${Number(i.subtotal).toLocaleString("id-ID")}`).join("\n")
  const caraTerima = order.deliveryMethod === "delivery" ? `Antar ke:\n${order.deliveryAddress || "-"}` : "Ambil di warung"
  const bayar = order.paymentMethod === "qris" ? "QRIS (lunas)" : "Bayar di warung (counter)"
  const catatan = order.notes ? `\nCatatan: ${order.notes}` : ""

  const text =
    `🔔 Pesanan Baru #${idShort}\n` +
    `Nama: ${order.customerName}\n` +
    `Bayar: ${bayar}\n` +
    `Terima: ${caraTerima}${catatan}\n\n` +
    `${itemsText}\n\n` +
    `Total: Rp ${total.toLocaleString("id-ID")}`

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    })
  } catch (err) {
    console.error("Telegram notify error:", err)
  }
}

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    })
    return Response.json(orders)
  } catch {
    return Response.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { customerName, notes, items, paymentMethod = "counter", deliveryMethod, deliveryAddress } = body

    if (!customerName || !items || !items.length) {
      return Response.json({ error: "Nama dan pesanan harus diisi" }, { status: 400 })
    }

    if (paymentMethod !== "counter" && paymentMethod !== "qris") {
      return Response.json({ error: "Metode pembayaran tidak valid" }, { status: 400 })
    }

    if (deliveryMethod !== undefined && deliveryMethod !== "pickup" && deliveryMethod !== "delivery") {
      return Response.json({ error: "Metode pengiriman tidak valid" }, { status: 400 })
    }

    const products = await prisma.product.findMany({
      where: { id: { in: items.map((i: any) => i.productId) }, isActive: true },
    })
    const productMap = new Map(products.map((p: any) => [p.id, p as any]))

    for (const item of items) {
      if (!productMap.has(item.productId)) {
        return Response.json({ error: `Produk ${item.productId} tidak ditemukan` }, { status: 400 })
      }
      if ((productMap.get(item.productId) as any).stockQty < item.qty) {
        return Response.json({ error: `Stok ${(productMap.get(item.productId) as any).name} tidak mencukupi` }, { status: 400 })
      }
    }

    const orderItems = items.map((item: any) => {
      const product = productMap.get(item.productId)
      return {
        productId: item.productId,
        qty: item.qty,
        priceAtOrder: product.price,
        subtotal: product.price * item.qty,
      }
    })

    if (paymentMethod === "qris") {
      const order = await prisma.$transaction(async (tx: any) => {
        const created = await tx.order.create({
          data: {
            customerName,
            notes: notes || null,
            status: "confirmed",
            paymentMethod: "qris",
            deliveryMethod: deliveryMethod === "delivery" ? "delivery" : "pickup",
            deliveryAddress: deliveryMethod === "delivery" ? deliveryAddress || null : null,
            items: { create: orderItems },
          },
          include: { items: { include: { product: true } } },
        })

        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stockQty: { decrement: item.qty } },
          })
        }

        return created
      })

      // fire-and-forget, jangan blokir response jika Telegram gagal
      notifyTelegram(order).catch((e) => console.error("Telegram notify error:", e))
      return Response.json(order, { status: 201 })
    }

    const order = await prisma.$transaction(async (tx: any) => {
      const created = await tx.order.create({
        data: {
          customerName,
          notes: notes || null,
          paymentMethod: "counter",
          deliveryMethod: deliveryMethod === "delivery" ? "delivery" : "pickup",
          deliveryAddress: deliveryMethod === "delivery" ? deliveryAddress || null : null,
          items: { create: orderItems },
        },
        include: { items: { include: { product: true } } },
      })

      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQty: { decrement: item.qty } },
        })
      }

      return created
    })

    notifyTelegram(order).catch((e) => console.error("Telegram notify error:", e))
    return Response.json(order, { status: 201 })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    console.error("Order create error:", message)
    return Response.json({ error: "Gagal membuat pesanan", detail: process.env.NODE_ENV === "development" ? message : undefined }, { status: 500 })
  }
}
