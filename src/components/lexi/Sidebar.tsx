import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence } from "framer-motion";
import {
  Plus,
  MessageSquare,
  FileText,
  Settings,
  LogOut,
  Sparkles,
  Scale,
  X,
  FolderOpen,
  Search,
  Trash2,
  Edit2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";

export interface ChatItem { 
  id: string; 
  title: string; 
  updatedAt: string;
  messageCount?: number;
}
export interface DocItem { id: string; name: string; status: "indexed" | "processing" }

type ChatGroup = {
  label: string;
  chats: ChatItem[];
};

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  chats: ChatItem[];
  docs: DocItem[];
  activeChatId?: string;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat?: (id: string) => void;
  onRenameChat?: (id: string, newTitle: string) => void;
}

const navItems = [
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
  onDeleteChat,
  onRenameChat,
}: SidebarProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [searchQuery, setSearchQuery] = useState("");
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  // Group chats by time
  const groupedChats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const groups: ChatGroup[] = [
      { label: "Today", chats: [] },
      { label: "Yesterday", chats: [] },
      { label: "Previous 7 Days", chats: [] },
      { label: "Older", chats: [] },
    ];

    const filteredChats = chats.filter(chat =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filteredChats.forEach(chat => {
      const chatDate = new Date(chat.updatedAt);
      if (chatDate >= today) {
        groups[0].chats.push(chat);
      } else if (chatDate >= yesterday) {
        groups[1].chats.push(chat);
      } else if (chatDate >= sevenDaysAgo) {
        groups[2].chats.push(chat);
      } else {
        groups[3].chats.push(chat);
      }
    });

    return groups.filter(group => group.chats.length > 0);
  }, [chats, searchQuery]);

  const handleStartEdit = (chat: ChatItem) => {
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
  };

  const handleSaveEdit = () => {
    if (editingChatId && editTitle.trim() && onRenameChat) {
      onRenameChat(editingChatId, editTitle.trim());
    }
    setEditingChatId(null);
    setEditTitle("");
  };

  const handleCancelEdit = () => {
    setEditingChatId(null);
    setEditTitle("");
  };

  const handleDelete = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (onDeleteChat && confirm("Delete this chat?")) {
      onDeleteChat(chatId);
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {open && (
          <div
            onClick={onClose}
            className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed lg:sticky lg:translate-x-0 top-0 left-0 z-40 h-screen w-64 shrink-0 transition-transform duration-200",
          "flex flex-col border-r border-border bg-sidebar",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <Scale className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="font-semibold text-sm">LexiAI</div>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden h-7 w-7 flex items-center justify-center rounded-lg hover:bg-accent transition-colors duration-150"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* New chat */}
        <div className="p-3 border-b border-border">
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors duration-150"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </button>
        </div>

        {/* Search */}
        <div className="px-3 py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg bg-background border border-border focus:border-primary focus:outline-none transition-colors duration-150"
            />
          </div>
        </div>

        {/* Scrollable */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-2 py-2 space-y-4">
          {/* Grouped chats */}
          {groupedChats.length === 0 ? (
            <Section icon={MessageSquare} title="Recent">
              <EmptyHint text={searchQuery ? "No chats found" : "No conversations yet"} />
            </Section>
          ) : (
            groupedChats.map((group) => (
              <Section key={group.label} icon={MessageSquare} title={group.label}>
                {group.chats.map((c) => (
                  <div
                    key={c.id}
                    className={cn(
                      "group relative w-full text-left flex items-center gap-2 rounded-lg px-2 py-2 text-sm",
                      c.id === activeChatId
                        ? "bg-accent text-foreground"
                        : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {editingChatId === c.id ? (
                      <div className="flex-1 flex items-center gap-1">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          className="flex-1 px-2 py-1 text-xs rounded bg-background border border-border focus:outline-none focus:border-primary"
                          autoFocus
                        />
                        <button
                          onClick={handleSaveEdit}
                          className="p-1 hover:bg-accent rounded"
                        >
                          <Check className="h-3 w-3 text-success" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1 hover:bg-accent rounded"
                        >
                          <X className="h-3 w-3 text-muted-foreground" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            onSelectChat(c.id);
                          }}
                          className="flex-1 flex items-center gap-2 min-w-0"
                        >
                          <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate text-xs">{c.title}</span>
                        </button>
                        <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100">
                          {onRenameChat && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEdit(c);
                              }}
                              className="p-1 hover:bg-accent rounded"
                              title="Rename"
                            >
                              <Edit2 className="h-3 w-3 text-muted-foreground" />
                            </button>
                          )}
                          {onDeleteChat && (
                            <button
                              onClick={(e) => handleDelete(e, c.id)}
                              className="p-1 hover:bg-accent rounded"
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </Section>
            ))
          )}

          {/* Documents */}
          <Section icon={FolderOpen} title="Documents">
            {docs.length === 0 ? (
              <EmptyHint text="No documents uploaded" />
            ) : (
              docs.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-accent transition-colors duration-150"
                >
                  <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate flex-1 text-xs text-muted-foreground">{d.name}</span>
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full shrink-0",
                      d.status === "indexed" ? "bg-success" : "bg-warning"
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
                    "flex items-center gap-2 rounded-lg px-2 py-2 text-sm",
                    active
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <n.icon className="h-4 w-4" />
                  <span className="text-xs">{n.label}</span>
                </Link>
              );
            })}
          </Section>
        </div>

        {/* Profile */}
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2 rounded-lg bg-accent p-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white text-xs font-medium">
              AK
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate">Alex Kim</div>
              <div className="text-[10px] text-muted-foreground truncate">alex@lexi.ai</div>
            </div>
            <Link
              to="/login"
              className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors duration-150"
              title="Log out"
            >
              <LogOut className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
          </div>
        </div>
      </aside>
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
      <div className="px-2 mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {Icon && <Icon className="h-3 w-3" />}
        {title}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return <div className="px-2 py-2 text-xs text-muted-foreground italic">{text}</div>;
}
