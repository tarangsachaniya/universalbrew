import { redirect } from 'next/navigation'

export default async function EditHeroPage() {
  redirect('/admin/heroes')
}
