"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, CalendarCheck, Wallet, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/components/language-provider"

const bottomNavItems = [
  { name: "dashboard", href: "/", icon: LayoutDashboard },
  { name: "students", href: "/students", icon: Users },
  { name: "attendance", href: "/attendance", icon: CalendarCheck },
  { name: "fees", href: "/fees", icon: Wallet },
  { name: "settings", href: "/settings", icon: Menu },
] as const

export function BottomNav() {
  const pathname = usePathname()
  const { t } = useLanguage()

  return (
    <div className="fixed bottom-0 z-50 w-full border-t bg-background pb-safe md:hidden">
      <nav className="flex h-16 items-center justify-around px-2">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(`${item.href}/`) && item.href !== "/")
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-full h-full",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "fill-primary/20")} />
              <span className="text-[10px] font-medium">{t(item.name)}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
