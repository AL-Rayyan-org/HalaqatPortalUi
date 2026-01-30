import { Sun, Moon, Monitor } from "lucide-react"
import { Button } from "@/shared/components/ui"
import { useTheme } from "@/shared/components/theme/UseTheme"
import { cn } from "@/shared/utils/cn"

interface ThemeSwitcherProps {
  size?: "sm" | "md"
}

export function ThemeSwitcher({ size = "md" }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme()

  const themes = [
    { id: "system", icon: Monitor, label: "System" },
    { id: "light", icon: Sun, label: "Light" },
    { id: "dark", icon: Moon, label: "Dark" },
  ] as const

  const buttonSize = size === "sm" ? "h-8 w-8" : "h-10 w-10"
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5"

  return (
    <div className="flex gap-1 p-1 bg-muted rounded-md">
      {themes.map(({ id, icon: Icon, label }) => {
        const isActive = theme === id
        return (
          <Button
            key={id}
            onClick={() => setTheme(id)}
            variant="ghost"
            size="sm"
            className={cn(
              "flex items-center justify-center rounded-sm transition-colors flex-1",
              buttonSize,
              isActive 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
            title={label}
          >
            <Icon className={iconSize} />
          </Button>
        )
      })}
    </div>
  )
}