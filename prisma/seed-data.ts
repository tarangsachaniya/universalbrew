import { Decimal } from '@prisma/client/runtime/library'

export interface CategorySeed {
  id: string
  name: string
  slug: string
  tagline: string
  description: string
}

export interface ProductVariantSeed {
  weight: string
  price: number
  compareAtPrice: number | null
}

export interface ProductSeed {
  id: string
  sku: string
  name: string
  slug: string
  categoryId: string
  description: string // shortDescription
  content: string // long description
  price: number
  compareAtPrice: number | null
  badges: string[]
  rating: number | null
  reviewCount: number
  variants: ProductVariantSeed[]
  inStock: boolean
}

export const CATEGORIES: CategorySeed[] = [
  {
    id: 'instant-coffee',
    name: 'Instant Coffee',
    slug: 'instant-coffee',
    tagline: 'Pure Arabica, zero machine required',
    description:
      '100% pure Arabica instant coffee blends made without chicory or filler — just add hot water or milk.',
  },
  {
    id: 'flavoured-coffee',
    name: 'Flavoured Coffee',
    slug: 'flavoured-coffee',
    tagline: 'Classic Indian spice, reinvented',
    description:
      'Instant Arabica coffee infused with classic Indian spices — ginger, masala, cinnamon and cardamom.',
  },
]

export const PRODUCTS: ProductSeed[] = [
  {
    id: 'basic',
    sku: 'UB-BASIC',
    name: 'Basic',
    slug: 'basic',
    categoryId: 'instant-coffee',
    description:
      'An everyday pure Arabica instant coffee with a smooth, classic taste.',
    content:
      'Our Basic blend is an instant coffee made from pure Arabica beans, crafted for a smooth, no-fuss cup you can make anywhere — no machine required. No artificial flavours, no added sugar, keto-friendly and gluten-free.',
    price: 209.0,
    compareAtPrice: 300.0,
    badges: ['No Artificial Flavours', 'Keto Friendly', 'Gluten-Free'],
    rating: 4.5,
    reviewCount: 0,
    inStock: true,
    variants: [
      { weight: '50g', price: 209.0, compareAtPrice: 300.0 },
      { weight: '100g', price: 379.0, compareAtPrice: 549.0 },
    ],
  },
  {
    id: 'granule',
    sku: 'UB-GRANULE',
    name: 'Granule',
    slug: 'granule',
    categoryId: 'instant-coffee',
    description:
      'Coarse-granule instant Arabica coffee with a bold, rich body.',
    content:
      'A coarser granule cut for a bolder, more robust cup. Made from 100% pure Arabica with no chicory or fillers added.',
    price: 249.0,
    compareAtPrice: 449.0,
    badges: [
      'No Artificial Flavours',
      'Keto Friendly',
      'Gluten-Free',
      '100% Pure Coffee',
    ],
    rating: 4.4,
    reviewCount: 0,
    inStock: true,
    variants: [
      { weight: '50g', price: 249.0, compareAtPrice: 449.0 },
    ],
  },
  {
    id: 'classic',
    sku: 'UB-CLASSIC',
    name: 'Classic',
    slug: 'classic',
    categoryId: 'instant-coffee',
    description:
      'The signature Universal Brew cup — balanced and aromatic.',
    content:
      'Our house-signature blend, balanced for everyday drinking with a rich, creamy aroma. 100% pure Arabica, no synthetic flavours or preservatives.',
    price: 219.0,
    compareAtPrice: 349.0,
    badges: ['No Artificial Flavours', 'No Added Sugar', 'Gluten-Free'],
    rating: 4.6,
    reviewCount: 0,
    inStock: true,
    variants: [
      { weight: '50g', price: 219.0, compareAtPrice: 349.0 },
    ],
  },
  {
    id: 'filtter',
    sku: 'UB-FILTTER',
    name: 'Filtter',
    slug: 'filtter',
    categoryId: 'instant-coffee',
    description:
      'South-Indian filter-coffee style, instant format.',
    content:
      'Inspired by South Indian filter coffee, this blend delivers that familiar deep, roasted character in an instant, no-machine format.',
    price: 209.0,
    compareAtPrice: 300.0,
    badges: ['No Artificial Flavours', 'Keto Friendly', 'Gluten-Free'],
    rating: 4.3,
    reviewCount: 0,
    inStock: true,
    variants: [
      { weight: '50g', price: 209.0, compareAtPrice: 300.0 },
    ],
  },
  {
    id: 'pure',
    sku: 'UB-PURE',
    name: 'Pure',
    slug: 'pure',
    categoryId: 'instant-coffee',
    description:
      '100% pure Arabica, nothing else added.',
    content:
      'No chicory, no mixture — just 100% pure premium Arabica coffee for drinkers who want the bean and nothing but the bean.',
    price: 229.0,
    compareAtPrice: 400.0,
    badges: ['100% Pure Coffee', 'No Artificial Flavours', 'Gluten-Free'],
    rating: 4.7,
    reviewCount: 0,
    inStock: true,
    variants: [
      { weight: '50g', price: 229.0, compareAtPrice: 400.0 },
    ],
  },
  {
    id: 'ginger',
    sku: 'UB-GINGER',
    name: 'Ginger',
    slug: 'ginger',
    categoryId: 'flavoured-coffee',
    description:
      'Pure Arabica coffee infused with warming ginger.',
    content:
      'A classic Indian favourite — pure Arabica instant coffee infused with real ginger for a warming, spiced cup. No artificial flavours or added sugar.',
    price: 299.0,
    compareAtPrice: 499.0,
    badges: [
      'No Artificial Flavours',
      'Keto Friendly',
      'No Added Sugar',
      'Gluten-Free',
    ],
    rating: 4.6,
    reviewCount: 0,
    inStock: true,
    variants: [
      { weight: '50g', price: 299.0, compareAtPrice: 499.0 },
    ],
  },
  {
    id: 'masala',
    sku: 'UB-MASALA',
    name: 'Masala',
    slug: 'masala',
    categoryId: 'flavoured-coffee',
    description:
      'A spiced masala blend with a classic Indian character.',
    content:
      'Our take on the classic Indian masala spice blend, brewed into a pure Arabica instant coffee for a bold, aromatic cup.',
    price: 299.0,
    compareAtPrice: 499.0,
    badges: [
      'No Artificial Flavours',
      'Keto Friendly',
      'No Added Sugar',
      'Gluten-Free',
    ],
    rating: 4.5,
    reviewCount: 0,
    inStock: true,
    variants: [
      { weight: '50g', price: 299.0, compareAtPrice: 499.0 },
    ],
  },
  {
    id: 'cinnamon',
    sku: 'UB-CINNAMON',
    name: 'Cinnamon',
    slug: 'cinnamon',
    categoryId: 'flavoured-coffee',
    description:
      'Pure Arabica coffee with warm notes of cinnamon.',
    content:
      'A comforting blend of pure Arabica instant coffee and cinnamon, offering a naturally sweet, warm aroma with no added sugar.',
    price: 299.0,
    compareAtPrice: 499.0,
    badges: [
      'No Artificial Flavours',
      'Keto Friendly',
      'No Added Sugar',
      'Gluten-Free',
    ],
    rating: 4.5,
    reviewCount: 0,
    inStock: true,
    variants: [
      { weight: '50g', price: 299.0, compareAtPrice: 499.0 },
    ],
  },
  {
    id: 'cardamom',
    sku: 'UB-CARDAMOM',
    name: 'Cardamom',
    slug: 'cardamom',
    categoryId: 'flavoured-coffee',
    description:
      'Pure Arabica coffee lifted with fragrant cardamom.',
    content:
      'Fragrant green cardamom blended into pure Arabica instant coffee — an aromatic, classic Indian-inspired cup.',
    price: 299.0,
    compareAtPrice: 499.0,
    badges: [
      'No Artificial Flavours',
      'Keto Friendly',
      'No Added Sugar',
      'Gluten-Free',
    ],
    rating: 4.6,
    reviewCount: 0,
    inStock: true,
    variants: [
      { weight: '50g', price: 299.0, compareAtPrice: 499.0 },
    ],
  },
]
