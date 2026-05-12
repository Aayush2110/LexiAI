import { useState, useEffect } from "react";
import { Sidebar, type ChatItem, type DocItem } from "@/components/lexi/Sidebar";
import { Navbar } from "@/components/lexi/Navbar";
import { useChatContext } from "@/contexts/ChatContext";

interface MainLayoutProps {
  title?: string;
  subtitle?: string;
  chats?: ChatItem[];
  docs?: DocItem[];
  activeChatId?: string;
  onNewChat?: () => void;
  onSelectChat?: (id: string) => void;
  onDeleteChat?: (id: string) => void;
  onRenameChat?: (id: string, newTitle: string) => void;
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
  onDeleteChat,
  onRenameChat,
  rightSlot,
  children,
}: MainLayoutProps) {
  const [open, setOpen] = useState(false);
  
  // Use ChatContext for chat data
  const { chats: contextChats, refreshChats } = useChatContext();
  
  // Use context chats if no prop chats provided
  const chats = propChats || contextChats.map(chat => ({
    id: chat.id,
    title: chat.title,
    updatedAt: chat.updatedAt,
    messageCount: chat.messageCount,
  }));

  const handleNewChat = async () => {
    try {
      if (onNewChat) {
        await onNewChat();
      }
      // Refresh from context
      await refreshChats();
    } catch (error) {
      console.error('[MainLayout] Error creating chat:', error);
    }
  };

  const handleSelectChat = (id: string) => {
    console.log('[MainLayout] Selecting chat:', id);
    onSelectChat?.(id);
  };

  const handleDeleteChat = async (id: string) => {
    try {
      if (onDeleteChat) {
        await onDeleteChat(id);
      }
      // Refresh from context
      await refreshChats();
    } catch (error) {
      console.error('[MainLayout] Error deleting chat:', error);
    }
  };

  const handleRenameChat = async (id: string, newTitle: string) => {
    try {
      if (onRenameChat) {
        await onRenameChat(id, newTitle);
      }
      // Refresh from context
      await refreshChats();
    } catch (error) {
      console.error('[MainLayout] Error renaming chat:', error);
    }
  };

  useEffect(() => {
    const onResize = () => setOpen(window.innerWidth >= 1024);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar
        open={open}
        onClose={() => setOpen(false)}
        chats={chats}
        docs={docs}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
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
