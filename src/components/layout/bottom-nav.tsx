"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, CalendarCheck, Wallet, Menu } from "lucide-react"
import { cn } from "@/lib/utils"

const bottomNavItems = [
  { name: "Home", href: "/", icon: LayoutDashboard },
  { name: "Students", href: "/students", icon: Users },
  { name: "Attendance", href: "/attendance", icon: CalendarCheck },
  { name: "Finance", href: "/fees", icon: Wallet },
  { name: "More", href: "/settings", icon: Menu },
]

export function BottomNav() {
  const pathname = usePathname()

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
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
