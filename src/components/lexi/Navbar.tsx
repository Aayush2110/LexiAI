import { Menu, Search, Bell, Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface NavbarProps {
  onMenu: () => void;
  title?: string;
  subtitle?: string;
}

export function Navbar({ onMenu, title, subtitle }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-20 bg-surface border-b border-border">
      <div className="flex items-center gap-4 px-4 sm:px-6 h-14">
        <button
          onClick={onMenu}
          className="lg:hidden h-8 w-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors duration-150"
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1">
          {title && <h1 className="text-sm font-medium text-foreground">{title}</h1>}
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>

        <div className="hidden md:flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-1.5 w-64 hover:border-muted-foreground/30 transition-colors duration-150">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            placeholder="Search..."
            className="bg-transparent text-sm outline-none placeholder:text-muted-foreground w-full"
          />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-accent text-muted-foreground border border-border font-mono">
            ⌘K
          </kbd>
        </div>

        <button 
          onClick={toggleTheme}
          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors duration-150"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>

        <button className="relative h-8 w-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors duration-150">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
        </button>

        <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
          AK
        </div>
      </div>
    </header>
  );
}
