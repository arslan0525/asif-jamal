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

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Students", href: "/students", icon: Users },
  { name: "Attendance", href: "/attendance", icon: CalendarCheck },
  { name: "Fees", href: "/fees", icon: Wallet },
  { name: "Donations", href: "/donations", icon: HeartHandshake },
  { name: "Expenses", href: "/expenses", icon: Receipt },
  { name: "Kitchen", href: "/kitchen", icon: Utensils },
  { name: "Teachers", href: "/teachers", icon: UserSquare2 },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden fixed inset-y-0 left-0 z-10 border-r bg-muted/40 md:block md:w-64 lg:w-72">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
            <span className="text-xl font-bold font-urdu">مدرسہ سسٹم</span>
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
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}
