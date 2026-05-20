"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  Wallet, 
  HeartHandshake, 
  Receipt, 
  Utensils, 
  UserSquare2, 
  FileText, 
  Settings 
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/components/language-provider"

const navigation = [
  { name: "dashboard", href: "/", icon: LayoutDashboard },
  { name: "students", href: "/students", icon: Users },
  { name: "attendance", href: "/attendance", icon: CalendarCheck },
  { name: "fees", href: "/fees", icon: Wallet },
  { name: "donations", href: "/donations", icon: HeartHandshake },
  { name: "expenses", href: "/expenses", icon: Receipt },
  { name: "kitchen", href: "/kitchen", icon: Utensils },
  { name: "teachers", href: "/teachers", icon: UserSquare2 },
  { name: "reports", href: "/reports", icon: FileText },
  { name: "settings", href: "/settings", icon: Settings },
] as const

export function Sidebar() {
  const pathname = usePathname()
  const { t } = useLanguage()

  return (
    <div className="hidden fixed inset-y-0 left-0 rtl:left-auto rtl:right-0 z-10 border-r rtl:border-r-0 rtl:border-l bg-muted/40 md:block md:w-64 lg:w-72">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
            <span className="text-xl font-bold font-urdu">{t("logoText")}</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`) && item.href !== "/"
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all hover:text-primary",
                    isActive 
                      ? "bg-primary/10 text-primary font-semibold" 
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {t(item.name)}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}
