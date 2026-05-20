"use client"

import { Bell, Menu, Download, Globe, LogOut, User as UserIcon, Settings as SettingsIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

export function TopBar() {
  const router = useRouter()
  const { setTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [showInstallDialog, setShowInstallDialog] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsStandalone(
        window.matchMedia("(display-mode: standalone)").matches || 
        (window.navigator as any).standalone === true
      )
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
      // Automatically show the install dialog on load if PWA is installable
      setShowInstallDialog(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    setShowInstallDialog(false)
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setIsInstallable(false)
      }
      setDeferredPrompt(null)
    }
  }

  const handleLogout = () => {
    document.cookie = "auth=; path=/; max-age=0"
    router.push("/login")
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 shadow-sm">
        <div className="flex md:hidden">
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <div className="w-full flex-1">
          <h1 className="text-lg font-semibold md:text-xl font-sans text-primary">{t("logoText")}</h1>
        </div>
        
        {!isStandalone && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowInstallDialog(true)} 
            className="flex items-center gap-1.5 border-emerald-600/35 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 shadow-sm"
          >
            <Download className="h-4 w-4 text-emerald-600 animate-pulse" />
            <span className="hidden sm:inline text-xs font-semibold font-sans">{t("installApp")}</span>
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button variant="ghost" size="icon">
              <Globe className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">Toggle language</span>
            </Button>
          } />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setLanguage("en")} className={language === "en" ? "bg-muted" : ""}>
              English
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage("ur")} className={language === "ur" ? "bg-muted font-urdu" : "font-urdu"}>
              اردو
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-destructive"></span>
          <span className="sr-only">Notifications</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button variant="outline" size="icon">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          } />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-user.jpg" alt="Admin" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <span className="sr-only">Toggle user menu</span>
            </Button>
          } />
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem className="gap-2">
              <UserIcon className="h-4 w-4" />
              <span>{t("profile")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <SettingsIcon className="h-4 w-4" />
              <span>{t("settings")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="gap-2 text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4" />
              <span>{t("logout")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* PWA Auto-Install Promotion Dialog */}
      <Dialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600">
              <Download className="h-5 w-5 animate-bounce" />
              <span>{t("installApp")}</span>
            </DialogTitle>
            <DialogDescription className="pt-2 text-left">
              {t("installAppDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted/50 p-3 rounded-lg border text-xs text-muted-foreground mt-2 text-left">
            <p className="font-semibold mb-1">{t("howToInstall")}:</p>
            <p className="mt-1">
              {/iPhone|iPad|iPod/.test(navigator.userAgent) ? t("iosInstructions") : t("chromeInstructions")}
            </p>
          </div>
          <DialogFooter className="flex sm:justify-between items-center mt-4">
            <Button variant="ghost" onClick={() => setShowInstallDialog(false)}>
              {t("later")}
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleInstallClick}>
              {t("installNow")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
