import { Link, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  MessageSquare,
  FileText,
  LayoutDashboard,
  Settings,
  LogOut,
  Sparkles,
  Scale,
  X,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChatItem { id: string; title: string; updatedAt: string }
export interface DocItem { id: string; name: string; status: "indexed" | "processing" }

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  chats: ChatItem[];
  docs: DocItem[];
  activeChatId?: string;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
}

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/chat", label: "AI Assistant", icon: Sparkles },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function Sidebar({
  open,
  onClose,
  chats,
  docs,
  activeChatId,
  onNewChat,
  onSelectChat,
}: SidebarProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: open ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 32 }}
        className={cn(
          "fixed lg:sticky lg:translate-x-0 top-0 left-0 z-40 h-screen w-72 shrink-0",
          "flex flex-col border-r border-border bg-sidebar"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-border">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl gradient-bg shadow-lg shadow-primary/30">
              <Scale className="h-5 w-5 text-white" />
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <div className="font-semibold text-sm leading-tight">LexiAI</div>
              <div className="text-[10px] text-muted-foreground leading-tight">Legal Intelligence</div>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden h-8 w-8 grid place-items-center rounded-lg hover:bg-sidebar-accent transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* New chat */}
        <div className="px-3 pt-3">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium gradient-bg text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </motion.button>
        </div>

        {/* Scrollable */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-2 py-4 space-y-6">
          {/* Recent chats */}
          <Section icon={MessageSquare} title="Recent">
            {chats.length === 0 ? (
              <EmptyHint text="No conversations yet" />
            ) : (
              chats.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onSelectChat(c.id)}
                  className={cn(
                    "w-full text-left flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                    c.id === activeChatId
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/60 text-sidebar-foreground/85"
                  )}
                >
                  <MessageSquare className="h-3.5 w-3.5 opacity-60 shrink-0" />
                  <span className="truncate">{c.title}</span>
                </button>
              ))
            )}
          </Section>

          {/* Documents */}
          <Section icon={FolderOpen} title="Documents">
            {docs.length === 0 ? (
              <EmptyHint text="No documents uploaded" />
            ) : (
              docs.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-sidebar-accent/60 transition-colors"
                >
                  <FileText className="h-3.5 w-3.5 opacity-60 shrink-0" />
                  <span className="truncate flex-1">{d.name}</span>
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full shrink-0",
                      d.status === "indexed" ? "bg-success" : "bg-warning animate-pulse"
                    )}
                  />
                </div>
              ))
            )}
          </Section>

          {/* Nav */}
          <Section title="Navigate">
            {navItems.map((n) => {
              const active = pathname === n.to || pathname.startsWith(n.to + "/");
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/85 hover:bg-sidebar-accent/60"
                  )}
                >
                  <n.icon className="h-4 w-4 opacity-80" />
                  {n.label}
                </Link>
              );
            })}
          </Section>
        </div>

        {/* Profile */}
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-xl glass p-2.5">
            <div className="h-9 w-9 rounded-full gradient-bg grid place-items-center text-white text-xs font-semibold">
              AK
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">Alex Kim</div>
              <div className="text-[11px] text-muted-foreground truncate">alex@lexi.ai</div>
            </div>
            <Link
              to="/login"
              className="h-8 w-8 grid place-items-center rounded-lg hover:bg-sidebar-accent transition-colors"
              title="Log out"
            >
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="px-3 mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {Icon && <Icon className="h-3 w-3" />}
        {title}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return <div className="px-3 py-2 text-xs text-muted-foreground/70 italic">{text}</div>;
}
