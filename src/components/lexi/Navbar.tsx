import { Menu, Search, Bell } from "lucide-react";
import { motion } from "framer-motion";

interface NavbarProps {
  onMenu: () => void;
  title?: string;
  subtitle?: string;
}

export function Navbar({ onMenu, title, subtitle }: NavbarProps) {
  return (
    <header className="sticky top-0 z-20 glass-strong border-b border-border">
      <div className="flex items-center gap-3 px-4 sm:px-6 py-3">
        <button
          onClick={onMenu}
          className="lg:hidden h-9 w-9 grid place-items-center rounded-lg hover:bg-accent transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1">
          {title && <h1 className="text-sm font-semibold truncate">{title}</h1>}
          {subtitle && (
            <p className="text-[11px] text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>

        <div className="hidden md:flex items-center gap-2 rounded-xl glass px-3 py-1.5 w-72">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            placeholder="Search documents, chats..."
            className="bg-transparent text-sm outline-none placeholder:text-muted-foreground/70 w-full"
          />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
            ⌘K
          </kbd>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative h-9 w-9 grid place-items-center rounded-lg hover:bg-accent transition-colors"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-brand-purple" />
        </motion.button>

        <div className="h-8 w-8 rounded-full gradient-bg grid place-items-center text-white text-[11px] font-semibold">
          AK
        </div>
      </div>
    </header>
  );
}
