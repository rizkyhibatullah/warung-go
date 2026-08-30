import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { createdAt: "desc" },
    })
    return Response.json(categories)
  } catch (error) {
    return Response.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name } = body

    if (!name) {
      return Response.json({ error: "Nama kategori harus diisi" }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: {
        name,
        createdBy: session.user.id,
      },
    })

    return Response.json(category, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("Category create error:", message)
    return Response.json(
      { error: "Failed to create category", detail: process.env.NODE_ENV === "development" ? message : undefined },
      { status: 500 }
    )
  }
}
