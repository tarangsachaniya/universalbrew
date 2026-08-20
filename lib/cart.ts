import type { Prisma } from '@prisma/client'

/**
 * The one cart-item response shape. Shared by GET/POST /api/cart and PUT /api/cart/[id]
 * so they cannot drift apart — the client relies on `variant` being present after every
 * cart mutation to price lines correctly.
 */
export const cartItemInclude = {
  product: {
    select: { id: true, name: true, slug: true, price: true, featuredImage: true, stock: true },
  },
  variant: {
    select: { id: true, weight: true, price: true, compareAtPrice: true, sku: true },
  },
} satisfies Prisma.CartItemInclude

/**
 * Stock is a single shared pool on `Product`, but one product can now occupy several cart
 * lines at once — one per selected variant, plus a variant-less line added from a product
 * card. Any stock check therefore has to compare the SUM of a product's cart lines against
 * `Product.stock`; checking a single line in isolation lets a customer stack 50 + 50 units
 * against a pool of 50 and be charged for units that do not exist.
 */
export function sumQuantitiesByProduct(items: { productId: string; quantity: number }[]): Map<string, number> {
  const totals = new Map<string, number>()
  for (const item of items) {
    totals.set(item.productId, (totals.get(item.productId) ?? 0) + item.quantity)
  }
  return totals
}

/**
 * Name of the first product whose total quantity across all its cart lines exceeds its
 * stock, or `null` when the whole cart fits. For routes that already hold the full cart in
 * memory, so this needs no extra query.
 */
export function findOverstockedProduct(
  items: { productId: string; quantity: number; product: { name: string; stock: number } }[]
): string | null {
  const totals = sumQuantitiesByProduct(items)
  for (const item of items) {
    if ((totals.get(item.productId) ?? 0) > item.product.stock) return item.product.name
  }
  return null
}
