import { useState, useEffect } from "react";
import { Sidebar, type ChatItem, type DocItem } from "@/components/lexi/Sidebar";
import { Navbar } from "@/components/lexi/Navbar";

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

const DEFAULT_CHATS: ChatItem[] = [
  { id: "c1", title: "NDA review – Acme Corp", updatedAt: "" },
  { id: "c2", title: "SaaS MSA risk analysis", updatedAt: "" },
  { id: "c3", title: "Termination clause Q&A", updatedAt: "" },
];

const DEFAULT_DOCS: DocItem[] = [
  { id: "d1", name: "MSA_v3.pdf", status: "indexed" },
  { id: "d2", name: "NDA_Acme.pdf", status: "indexed" },
  { id: "d3", name: "Schedule_A.pdf", status: "processing" },
];

export function MainLayout({
  title,
  subtitle,
  chats = DEFAULT_CHATS,
  docs = DEFAULT_DOCS,
  activeChatId,
  onNewChat = () => {},
  onSelectChat = () => {},
  rightSlot,
  children,
}: MainLayoutProps) {
  const [open, setOpen] = useState(false);

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
        onNewChat={onNewChat}
        onSelectChat={onSelectChat}
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
