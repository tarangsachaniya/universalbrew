import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { DEFAULT_ABOUT_BODY, DEFAULT_ABOUT_FEATURES, DEFAULT_ABOUT_TITLE } from '../lib/about'

const prisma = new PrismaClient()
// The generated Prisma client can lag behind the schema during local setup.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const homepageHero = (prisma as any).homepageHero

async function main() {
  // Admin user
  const adminPassword = await bcrypt.hash(process.env?.SEED_ADMIN_PASSWORD ?? '', 12)
  await prisma.user.upsert({
    where: { email: 'admin@universalbrew.in' },
    update: {},
    create: {
      email: 'admin@universalbrew.in',
      password: adminPassword,
      name: 'Admin',
      role: 'ADMIN',
    },
  })

  // Default category
  const category = await prisma.category.upsert({
    where: { slug: 'instant-coffee' },
    update: {},
    create: {
      name: 'Instant Coffee',
      slug: 'instant-coffee',
      description: 'Premium instant coffee blends crafted from 100% Arabica beans. No machines required.',
    },
  })

  // Products from existing static data
  const products = [
    { name: 'Basic', slug: 'basic', price: 209, description: 'Our signature blend — smooth and balanced for everyday enjoyment.' },
    { name: 'Granule', slug: 'granule', price: 249, description: 'Rich granule coffee with a bold, robust flavour profile.' },
    { name: 'Classic', slug: 'classic', price: 219, description: 'A timeless classic blend with deep aroma and velvety finish.' },
    { name: 'Ginger', slug: 'ginger', price: 299, description: 'Infused with natural ginger for a warming, spiced coffee experience.', featured: true },
    { name: 'Filter', slug: 'filter', price: 209, description: 'Traditional South Indian filter coffee taste in an instant format.' },
    { name: 'Masala', slug: 'masala', price: 229, description: 'A spiced masala coffee blend inspired by the streets of India.', featured: true },
    { name: 'Cardamom', slug: 'cardamom', price: 259, description: 'Fragrant cardamom-infused coffee for a floral, aromatic cup.' },
    { name: 'Cinnamon', slug: 'cinnamon', price: 279, description: 'Warm cinnamon notes paired with premium Arabica for a cozy brew.' },
  ]

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        stock: 100,
        published: true,
        featuredProduct: p.featured ?? false,
        categoryId: category.id,
      },
    })
  }

  const heroSlides = [
    { url: '/images/img1.webp', title: 'The Vessel',  subtitle: 'Heritage · Craft · Ritual'                                                    },
    { url: '/images/img2.webp', title: 'The Bag',     subtitle: 'Where it all begins'                                                          },
    { url: '/images/img3.webp', title: 'The Bloom',   subtitle: 'Nature awakens within'                                                        },
    { url: '/images/img4.webp', title: 'The Release', subtitle: 'Botanicals set free'                                                          },
    { url: '/images/img5.webp', title: 'The Cup',     subtitle: 'An original, pure, rich-creamy & aromatic coffee with incredible taste'        },
  ]

  await homepageHero.upsert({
    where:  { id: 'default-hero' },
    update: {
      slides: heroSlides,
      youtubeUrls: [],
      aboutTitle: DEFAULT_ABOUT_TITLE,
      aboutBody: DEFAULT_ABOUT_BODY,
      aboutFeatures: DEFAULT_ABOUT_FEATURES,
      active: true,
    },
    create: {
      id: 'default-hero',
      slides: heroSlides,
      youtubeUrls: [],
      aboutTitle: DEFAULT_ABOUT_TITLE,
      aboutBody: DEFAULT_ABOUT_BODY,
      aboutFeatures: DEFAULT_ABOUT_FEATURES,
      active: true,
    },
  })

  // Default footer
  const existing = await prisma.footerContent.findFirst()
  if (!existing) {
    await prisma.footerContent.create({
      data: {
        companyName: 'Khyati & Sons Enterprise',
        description: '100% pure Arabica coffee with a classic Indian touch. No artificial flavours.',
        address: 'Ahmedabad, Gujarat, India',
        phone: '+91 98765 43210',
        email: 'hello@universalbrew.in',
        socialLinks: {},
      },
    })
  }

  // Static pages
  const staticPages: { key: 'ABOUT_US' | 'TERMS_OF_SERVICE' | 'PRIVACY_POLICY' | 'REFUND_POLICY' | 'SHIPPING_POLICY'; title: string; content: string }[] = [
    {
      key: 'ABOUT_US',
      title: 'About Us',
      content: `<h2>About Universal Brew Coffee</h2>
<p>A fully owned venture by Khyati &amp; Sons Enterprise, we at Universal Brew know what every coffee-loving loyalist seeks in their brew — be it your daily requirement or an occasional nudge to get through an active day.</p>
<p>We maintain coffee plantations in Southern India to source premium Arabica beans, ensuring every cup delivers an original, pure, rich-creamy and aromatic coffee experience with incredible taste.</p>
<h2>Our Products</h2>
<ul>
  <li>Green Coffee Beans</li>
  <li>Roasted Coffee Beans</li>
  <li>Filter Coffee</li>
  <li>Instant Coffee</li>
  <li>Customized &amp; Flavored Coffee</li>
  <li>Coffee Premixes</li>
  <li>Coffee Compounds &amp; Coffee Bars</li>
</ul>
<p>We offer something different to local and foreign patrons and ensure you enjoy a memorable coffee experience every time.</p>`,
    },
    {
      key: 'TERMS_OF_SERVICE',
      title: 'Terms of Service',
      content: `<p>This website is operated by Khyati &amp; Sons Enterprise. By accessing or using our site, you agree to be bound by these terms.</p>
<h2>1. Online Store Terms</h2>
<p>By using this site, you confirm that you are of legal age in your jurisdiction. You must not use our products for illegal or unauthorized purposes.</p>
<h2>2. General Conditions</h2>
<p>We reserve the right to refuse service to anyone for any reason at any time. Your content may be transferred unencrypted across networks; credit card information is always encrypted during transfer.</p>
<h2>3. Accuracy of Information</h2>
<p>The material on this site is provided for general information only and users rely on it at their own risk. We have no obligation to update information.</p>
<h2>4. Service Modifications</h2>
<p>Prices and services are subject to change without notice. We reserve the right to modify or discontinue any service at any time.</p>
<h2>5. Products and Services</h2>
<p>We reserve the right to limit sales geographically or by quantity. Product descriptions are subject to change without notice.</p>
<h2>6. Prohibited Uses</h2>
<p>You are prohibited from using the site for illegal activities, transmitting harmful code, data scraping, or circumventing security measures.</p>
<h2>7. Limitation of Liability</h2>
<p>Services are provided "as is." We disclaim all warranties and limit liability for damages arising from the use of our services.</p>
<h2>8. Contact</h2>
<p>Questions about these terms should be directed to <a href="mailto:care.ubcoffee@gmail.com">care.ubcoffee@gmail.com</a>.</p>`,
    },
    {
      key: 'PRIVACY_POLICY',
      title: 'Privacy Policy',
      content: `<h2>Section 1 – What Do We Do With Your Information?</h2>
<p>When you purchase from us, we collect personal information including your name, address, and email as part of the transaction. With your permission, we may send you emails about our store, new products, and updates.</p>
<h2>Section 2 – Consent</h2>
<p>When you provide personal information to complete a transaction, we imply consent for that specific purpose. You may withdraw consent at any time by contacting us at <a href="mailto:care.ubcoffee@gmail.com">care.ubcoffee@gmail.com</a>.</p>
<h2>Section 3 – Disclosure</h2>
<p>We may disclose your personal information if required by law or if you violate our Terms of Service.</p>
<h2>Section 4 – Payment Processing</h2>
<p>Payment data is handled by CCAvenue and PayU Money with PCI-DSS encryption. Transaction data is retained only as long as necessary.</p>
<h2>Section 5 – Security</h2>
<p>We take reasonable precautions and follow industry best practices to protect your information. Credit card data uses SSL encryption and AES-256 storage.</p>
<h2>Section 6 – Age of Consent</h2>
<p>Users must be of legal age in their jurisdiction or have parental consent.</p>
<h2>Section 7 – Changes to This Privacy Policy</h2>
<p>We reserve the right to modify this policy at any time. Changes take effect immediately upon posting.</p>
<h2>Contact</h2>
<p>Privacy inquiries: <a href="mailto:care.ubcoffee@gmail.com">care.ubcoffee@gmail.com</a><br/>Khyati &amp; Sons Enterprise, Ahmedabad 380007</p>`,
    },
    {
      key: 'REFUND_POLICY',
      title: 'Refund Policy',
      content: `<h2>Return Window</h2>
<p>We offer a 15-day return period from the date of delivery. Items must be unused, in original condition, and in original packaging to qualify.</p>
<h2>Cancellations</h2>
<p>Cancellations must be requested within 12 hours of order placement. Once tracking information has been shared, cancellations cannot be processed.</p>
<h2>Refunds</h2>
<p>Approved refunds are credited to the original payment method within 2–4 business days. COD orders receive refunds via cheque or IMPS transfer.</p>
<h2>Exchanges</h2>
<p>Exchanges are available only for defective or damaged items. Please report defective products to <a href="mailto:care.ubcoffee@gmail.com">care.ubcoffee@gmail.com</a> with an unboxing video.</p>
<h2>Non-Refundable Items</h2>
<p>Sale items cannot be refunded — only regular-priced merchandise qualifies. Return shipping costs are non-refundable and will be deducted from your refund.</p>
<h2>Return Address</h2>
<p>Khyati &amp; Sons Enterprise, B Block, Chandraprabhu V-2, B/H Vasna Bus-Stop, Vasna, Ahmedabad 380007</p>`,
    },
    {
      key: 'SHIPPING_POLICY',
      title: 'Shipping Policy',
      content: `<h2>Order Processing</h2>
<p>All orders are processed within 1 to 3 business days (excluding weekends and holidays) after receiving your order confirmation email.</p>
<h2>Shipping Notifications</h2>
<p>Once your order is dispatched, you will receive an email with tracking details. Please allow 48 hours for tracking information to become available.</p>
<h2>Delivery</h2>
<p>If your shipment has not arrived within a week following your shipping confirmation, please contact us at <a href="mailto:care.ubcoffee@gmail.com">care.ubcoffee@gmail.com</a> with your name and order number and we will investigate promptly.</p>
<h2>Contact</h2>
<p>For any shipping queries, reach out to <a href="mailto:care.ubcoffee@gmail.com">care.ubcoffee@gmail.com</a>.</p>`,
    },
  ]

  for (const sp of staticPages) {
    await prisma.staticPage.upsert({
      where: { key: sp.key },
      update: {},
      create: { key: sp.key, title: sp.title, content: sp.content },
    })
  }

  console.log('✓ Seed complete')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
