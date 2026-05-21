"use client"

import Link from "next/link"
import { signOut } from "next-auth/react"
import { ChevronDown, ShoppingBag, LogOut, LayoutDashboard, UserCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type UserDropdownProps = {
  name: string | null | undefined
  isAdmin?: boolean
}

export function UserDropdown({ name, isAdmin }: UserDropdownProps) {
  const displayName = name ? name.split(" ")[0] : "Account"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-1 text-[0.7rem] tracking-[0.18em] uppercase text-white/70 hover:text-amber-300 transition-colors duration-200 bg-transparent border-none cursor-pointer p-0"
        >
          {displayName}
          <ChevronDown className="h-3 w-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[160px] bg-black/90 border-white/20 text-white backdrop-blur-md"
      >
        {isAdmin && (
          <>
            <DropdownMenuItem asChild className="text-white/80 hover:text-amber-300 hover:bg-white/10 cursor-pointer focus:bg-white/10 focus:text-amber-300">
              <Link href="/admin" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Admin Panel
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
          </>
        )}
        <DropdownMenuItem asChild className="text-white/80 hover:text-amber-300 hover:bg-white/10 cursor-pointer focus:bg-white/10 focus:text-amber-300">
          <Link href="/account/profile" className="flex items-center gap-2">
            <UserCircle className="h-4 w-4" />
            My Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="text-white/80 hover:text-amber-300 hover:bg-white/10 cursor-pointer focus:bg-white/10 focus:text-amber-300">
          <Link href="/account/orders" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            My Orders
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem
          className="text-white/80 hover:text-amber-300 hover:bg-white/10 cursor-pointer focus:bg-white/10 focus:text-amber-300 flex items-center gap-2"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
