import { Plus, MessageSquare, Sparkles, PanelLeftClose, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface ChatSession {
  id: string;
  title: string;
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

export function Sidebar({ open, onClose, sessions, activeId, onSelect, onNew, onDelete }: SidebarProps) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed md:relative z-40 h-full w-72 shrink-0 border-r bg-sidebar-surface transition-transform duration-300 ease-out flex flex-col",
          open ? "translate-x-0" : "-translate-x-full md:w-0 md:border-r-0"
        )}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-user-bubble">
              <Sparkles className="h-4 w-4 text-user-bubble-foreground" />
            </div>
            <span className="font-semibold text-sm">RAG Assistant</span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        </div>

        <div className="px-3 py-3">
          <Button onClick={onNew} className="w-full justify-start gap-2" variant="outline">
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1 pb-4">
            {sessions.map((s) => (
              <div
                key={s.id}
                className={cn(
                  "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors",
                  s.id === activeId ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                )}
                onClick={() => onSelect(s.id)}
              >
                <MessageSquare className="h-4 w-4 shrink-0 opacity-70" />
                <span className="flex-1 truncate">{s.title}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(s.id); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            ))}
            {sessions.length === 0 && (
              <p className="px-3 py-6 text-xs text-muted-foreground text-center">No conversations yet</p>
            )}
          </div>
        </ScrollArea>

        <div className="border-t px-4 py-3 text-xs text-muted-foreground">
          Powered by RAG · v1.0
        </div>
      </aside>
    </>
  );
}
