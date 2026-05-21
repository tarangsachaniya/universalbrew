"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  Package,
  Tag,
  ImagePlay,
  FileText,
  BookOpen,
  ShoppingBag,
  LogOut,
} from "lucide-react"
import { signOut } from "next-auth/react"

const navItems = [
  { href: "/admin",            label: "Dashboard",  icon: LayoutDashboard },
  { href: "/admin/products",   label: "Products",   icon: Package          },
  { href: "/admin/categories", label: "Categories", icon: Tag              },
  { href: "/admin/heroes",     label: "Hero Slides", icon: ImagePlay       },
  { href: "/admin/orders",      label: "Orders",      icon: ShoppingBag     },
  { href: "/admin/coupons",     label: "Coupons",     icon: Tag              },
  { href: "/admin/static-pages", label: "Static Pages", icon: BookOpen       },
  { href: "/admin/footer",     label: "Footer",     icon: FileText         },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <Link href="/" className="font-serif text-lg font-bold text-primary">
          Universal Brew
        </Link>
        <p className="text-xs text-muted-foreground">Admin Panel</p>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={active}>
                  <Link href={item.href} className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-2 border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => signOut({ callbackUrl: "/" })}>
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}