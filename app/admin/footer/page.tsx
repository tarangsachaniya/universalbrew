import { prisma } from '@/lib/prisma'
import { FooterForm } from '@/components/admin/footer-form'
import type { FooterInput } from '@/lib/validations/footer'

export default async function AdminFooterPage() {
  const footer = await prisma.footerContent.findFirst()

  const initialData: (FooterInput & { id?: string }) | undefined = footer
    ? {
        id: footer.id,
        companyName: footer.companyName,
        description: footer.description ?? '',
        address: footer.address ?? '',
        phone: footer.phone ?? '',
        email: footer.email ?? '',
        socialLinks: (footer.socialLinks as FooterInput['socialLinks']) ?? {},
      }
    : undefined

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Footer Content</h1>
      <FooterForm initialData={initialData} />
    </div>
  )
}