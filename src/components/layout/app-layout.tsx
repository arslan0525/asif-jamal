"use client"

import { Sidebar } from "./sidebar"
import { TopBar } from "./top-bar"
import { BottomNav } from "./bottom-nav"

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Sidebar />
      <div className="flex flex-col sm:gap-4 md:py-4 md:pl-64 lg:pl-72 flex-1">
        <TopBar />
        <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 pb-20 md:pb-8">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  )
}
