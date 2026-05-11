import { useState, useEffect } from "react";
import { Sidebar, type ChatItem, type DocItem } from "@/components/lexi/Sidebar";
import { Navbar } from "@/components/lexi/Navbar";
import { ChatAPI } from "@/services/api";

interface MainLayoutProps {
  title?: string;
  subtitle?: string;
  chats?: ChatItem[];
  docs?: DocItem[];
  activeChatId?: string;
  onNewChat?: () => void;
  onSelectChat?: (id: string) => void;
  rightSlot?: React.ReactNode;
  children: React.ReactNode;
}

export function MainLayout({
  title,
  subtitle,
  chats: propChats,
  docs = [],
  activeChatId,
  onNewChat,
  onSelectChat,
  rightSlot,
  children,
}: MainLayoutProps) {
  const [open, setOpen] = useState(false);
  const [chats, setChats] = useState<ChatItem[]>(propChats || []);
  const [loading, setLoading] = useState(false);

  // Load chats from MongoDB on mount
  useEffect(() => {
    loadChats();
  }, []);

  // Update chats if prop changes
  useEffect(() => {
    if (propChats) {
      setChats(propChats);
    }
  }, [propChats]);

  const loadChats = async () => {
    try {
      setLoading(true);
      const response = await ChatAPI.listChats();
      const formattedChats: ChatItem[] = response.chats.map((chat: any) => ({
        id: chat.session_id,
        title: chat.title,
        updatedAt: new Date(chat.updated_at).toISOString(),
        messageCount: chat.message_count,
      }));
      setChats(formattedChats);
    } catch (error) {
      console.error('[MainLayout] Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    try {
      // Call parent onNewChat first (it creates the chat)
      if (onNewChat) {
        await onNewChat();
      }
      
      // Refresh chat list after creation
      await loadChats();
    } catch (error) {
      console.error('[MainLayout] Error creating chat:', error);
    }
  };

  const handleSelectChat = (id: string) => {
    onSelectChat?.(id);
  };

  useEffect(() => {
    const onResize = () => setOpen(window.innerWidth >= 1024);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="dark min-h-screen flex bg-background text-foreground">
      <Sidebar
        open={open}
        onClose={() => setOpen(false)}
        chats={chats}
        docs={docs}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenu={() => setOpen(true)} title={title} subtitle={subtitle} />
        <div className="flex-1 flex min-h-0">
          <main className="flex-1 min-w-0 flex flex-col">{children}</main>
          {rightSlot}
        </div>
      </div>
    </div>
  );
}
