import * as React from "react"
import { Globe, Menu, Monitor, Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { SOCIAL_LINKS } from "@/consts"

const navItems: { href: string; label: string; external?: boolean }[] = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/tags", label: "Tags" },
  { href: "https://www.unoplat.io", label: "About", external: true },
]

type ThemePreference = "light" | "dark" | "system"

const THEME_STORAGE_KEY = "theme"
const THEME_MEDIA_QUERY = "(prefers-color-scheme: dark)"
const THEME_CYCLE: ThemePreference[] = ["light", "dark", "system"]

const getStoredTheme = (): ThemePreference => {
  if (typeof window === "undefined") {
    return "system"
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored
  }

  return "system"
}

const getSystemTheme = (): "light" | "dark" => {
  if (typeof window === "undefined" || !window.matchMedia) {
    return "light"
  }

  return window.matchMedia(THEME_MEDIA_QUERY).matches ? "dark" : "light"
}

const applyTheme = (theme: ThemePreference) => {
  const resolvedTheme = theme === "system" ? getSystemTheme() : theme
  document.documentElement.classList.toggle("dark", resolvedTheme === "dark")
  document.documentElement.setAttribute("data-theme", resolvedTheme)
}

const getNextTheme = (theme: ThemePreference): ThemePreference => {
  const currentIndex = THEME_CYCLE.indexOf(theme)
  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % THEME_CYCLE.length
  return THEME_CYCLE[nextIndex]
}

const ThemeToggleButton = ({ showLabel = false }: { showLabel?: boolean }) => {
  const [theme, setTheme] = React.useState<ThemePreference>("system")

  React.useEffect(() => {
    setTheme(getStoredTheme())

    const handleAfterSwap = () => {
      setTheme(getStoredTheme())
    }

    const handleThemeChange = (event: Event) => {
      const nextTheme = (event as CustomEvent<ThemePreference>).detail
      if (nextTheme === "light" || nextTheme === "dark" || nextTheme === "system") {
        setTheme((current) => (current === nextTheme ? current : nextTheme))
      }
    }

    document.addEventListener("astro:after-swap", handleAfterSwap)
    window.addEventListener("theme-change", handleThemeChange)
    return () => {
      document.removeEventListener("astro:after-swap", handleAfterSwap)
      window.removeEventListener("theme-change", handleThemeChange)
    }
  }, [])

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // Ignore storage write errors (private mode, disabled storage).
    }

    applyTheme(theme)
    window.dispatchEvent(new CustomEvent("theme-change", { detail: theme }))
  }, [theme])

  const cycleTheme = () => {
    setTheme((current) => getNextTheme(current))
  }

  const label = theme === "light" ? "Light" : theme === "dark" ? "Dark" : "System"
  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor

  return (
    <Button
      type="button"
      variant={showLabel ? "outline" : "ghost"}
      size={showLabel ? "sm" : "icon"}
      className={cn(showLabel && "gap-2")}
      onClick={cycleTheme}
      aria-label={`Theme: ${label} (click to switch)`}
    >
      <Icon className="size-4" />
      {showLabel ? (
        <span className="text-sm">Theme: {label}</span>
      ) : (
        <span className="sr-only">Theme: {label}</span>
      )}
    </Button>
  )
}

type SiteHeaderProps = {
  pathname: string
}

const isActivePath = (pathname: string, href: string) => {
  if (href === "/") {
    return pathname === "/"
  }

  return pathname.startsWith(href)
}

const SocialIconButton = ({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: React.ReactNode
}) => (
  <Button asChild variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
      {children}
    </a>
  </Button>
)

export function SiteHeader({ pathname }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="/" className="flex items-center text-foreground">
            <img src="/images/unoplat-logo-light.svg" alt="Unoplat Blog" className="h-7 w-auto dark:hidden" />
            <img src="/images/unoplat-logo-dark.svg" alt="Unoplat Blog" className="hidden h-7 w-auto dark:block" />
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Button
              key={item.href}
              asChild
              variant="ghost"
              size="sm"
              className={cn(
                "text-sm font-medium",
                !item.external && isActivePath(pathname, item.href)
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              <a
                href={item.href}
                {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {item.label}
              </a>
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggleButton />
          <div className="hidden items-center gap-1 sm:flex">
            <SocialIconButton href={SOCIAL_LINKS.website} label="Unoplat Website">
              <Globe className="size-4" />
            </SocialIconButton>
            <SocialIconButton href={SOCIAL_LINKS.github} label="Unoplat on GitHub">
              <img
                src="/images/social/github-mark.svg"
                alt=""
                aria-hidden="true"
                className="size-4 dark:invert"
              />
            </SocialIconButton>
            <SocialIconButton href={SOCIAL_LINKS.discord} label="Join Unoplat Discord">
              <img src="/images/social/Discord-Symbol-Blurple.svg" alt="" aria-hidden="true" className="size-4" />
            </SocialIconButton>
            <SocialIconButton href={SOCIAL_LINKS.linkedin} label="Unoplat on LinkedIn">
              <img src="/images/social/LI-In-Bug.png" alt="" aria-hidden="true" className="size-4" />
            </SocialIconButton>
            <SocialIconButton href={SOCIAL_LINKS.twitter} label="Unoplat on X (Twitter)">
              <img src="/images/social/x-logo.svg" alt="" aria-hidden="true" className="size-4 dark:invert" />
            </SocialIconButton>
          </div>

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon" aria-label="Open menu">
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader className="space-y-1">
                <SheetTitle className="flex items-center">
                  <a href="/" className="flex items-center text-foreground">
                    <img src="/images/unoplat-logo-light.svg" alt="Unoplat Blog" className="h-7 w-auto dark:hidden" />
                    <img src="/images/unoplat-logo-dark.svg" alt="Unoplat Blog" className="hidden h-7 w-auto dark:block" />
                  </a>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-2 px-4">
                {navItems.map((item) => (
                  <Button
                    key={item.href}
                    asChild
                    variant={!item.external && isActivePath(pathname, item.href) ? "secondary" : "ghost"}
                    className="justify-start"
                  >
                    <a
                      href={item.href}
                      {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      {item.label}
                    </a>
                  </Button>
                ))}
              </nav>
              <div className="mt-4 px-4">
                <ThemeToggleButton showLabel />
              </div>
              <div className="mt-4 flex flex-col gap-2 px-4">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Connect
                </span>
                <div className="flex flex-wrap gap-2">
                  <SocialIconButton href={SOCIAL_LINKS.website} label="Unoplat Website">
                    <Globe className="size-4" />
                  </SocialIconButton>
                  <SocialIconButton href={SOCIAL_LINKS.github} label="Unoplat on GitHub">
                    <img
                      src="/images/social/github-mark.svg"
                      alt=""
                      aria-hidden="true"
                      className="size-4 dark:invert"
                    />
                  </SocialIconButton>
                  <SocialIconButton href={SOCIAL_LINKS.discord} label="Join Unoplat Discord">
                    <img src="/images/social/Discord-Symbol-Blurple.svg" alt="" aria-hidden="true" className="size-4" />
                  </SocialIconButton>
                  <SocialIconButton href={SOCIAL_LINKS.linkedin} label="Unoplat on LinkedIn">
                    <img src="/images/social/LI-In-Bug.png" alt="" aria-hidden="true" className="size-4" />
                  </SocialIconButton>
                  <SocialIconButton href={SOCIAL_LINKS.twitter} label="Unoplat on X (Twitter)">
                    <img src="/images/social/x-logo.svg" alt="" aria-hidden="true" className="size-4 dark:invert" />
                  </SocialIconButton>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
