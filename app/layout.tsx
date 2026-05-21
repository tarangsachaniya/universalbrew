import type { Metadata, Viewport } from 'next'
import { DM_Sans, Cormorant_Garamond } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SessionProvider } from 'next-auth/react'
import { CartProvider } from '@/lib/cart-context'
import { auth } from '@/lib/auth'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700'],
})

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: '--font-playfair',
  weight: ['300', '400', '500', '600', '700'],
})

export const viewport: Viewport = {
  themeColor: '#1A0900',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://universalbrew.in'),
  title: {
    default: 'Universal Brew — Premium Indian Coffee',
    template: '%s | Universal Brew',
  },
  description: 'Experience the rich aroma of 100% pure Arabica coffee with a classic Indian touch. No artificial flavours, keto friendly, gluten-free, and no machines required.',
  keywords: [
    'universal brew', 'indian coffee', 'arabica coffee', 'instant coffee',
    'premium coffee', 'flavoured coffee', 'keto coffee', 'gluten free coffee',
    'no sugar coffee', 'natural coffee', 'coffee brand india',
  ],
  authors: [{ name: 'Universal Brew', url: 'https://universalbrew.in' }],
  creator: 'Universal Brew',
  publisher: 'Universal Brew',
  category: 'food & beverage',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://universalbrew.in',
    siteName: 'Universal Brew',
    title: 'Universal Brew — Premium Indian Coffee',
    description: '100% pure Arabica coffee with a classic Indian touch. No artificial flavours, keto friendly, gluten-free.',
    images: [
      {
        url: '/images/img1.png',
        width: 1200,
        height: 630,
        alt: 'Universal Brew — Premium Indian Coffee',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Universal Brew — Premium Indian Coffee',
    description: '100% pure Arabica coffee with a classic Indian touch. No artificial flavours, keto friendly, gluten-free.',
    images: ['/images/img1.png'],
    creator: '@universalbrew',
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
  },
  alternates: {
    canonical: 'https://universalbrew.in',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  return (
    <html lang="en" className="bg-background">
      <body className={`${dmSans.variable} ${cormorant.variable} font-sans antialiased`}>
        <SessionProvider
          session={session}
          refetchInterval={60 * 60}
          refetchOnWindowFocus={false}
        >
          <CartProvider>
            {children}
          </CartProvider>
        </SessionProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
