import { revalidateTag as nextRevalidateTag } from 'next/cache'

// Typed wrapper — next/cache types vary across Next.js versions
export const revalidateTag = (tag: string): void => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(nextRevalidateTag as any)(tag)
}