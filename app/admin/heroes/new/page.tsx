import { redirect } from 'next/navigation'

export default function NewHeroPage() {
  redirect('/admin/heroes')
}
