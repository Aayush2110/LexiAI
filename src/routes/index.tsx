import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sidebar, type ChatSession } from "@/components/chat/Sidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import type { Message } from "@/components/chat/MessageBubble";

export const Route = createFileRoute("/")({
  component: Index,
});

const MOCK_REPLIES = [
  "Here's what I found in your documents:\n\n- **Key insight #1** — relevant context retrieved.\n- **Key insight #2** — supporting evidence.\n\n```ts\nconst answer = retrieve(query);\n```\n\nLet me know if you'd like me to dig deeper.",
  "Based on the retrieved context, the answer is:\n\n> The system uses vector similarity search across embedded documents.\n\nWould you like a code example?",
  "Great question! Here are three points to consider:\n\n1. Context window matters\n2. Chunking strategy is key\n3. Re-ranking improves precision",
];

function Index() {
  const [dark, setDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([
    { id: "1", title: "Welcome chat" },
  ]);
  const [activeId, setActiveId] = useState("1");
  const [messagesBySession, setMessagesBySession] = useState<Record<string, Message[]>>({ "1": [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const messages = messagesBySession[activeId] ?? [];

  const handleSend = (text: string) => {
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
    setMessagesBySession((prev) => ({
      ...prev,
      [activeId]: [...(prev[activeId] ?? []), userMsg],
    }));

    // Update session title from first user message
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeId && (messages.length === 0 || s.title === "New chat" || s.title === "Welcome chat")
          ? { ...s, title: text.slice(0, 40) }
          : s
      )
    );

    setLoading(true);
    setTimeout(() => {
      const reply = MOCK_REPLIES[Math.floor(Math.random() * MOCK_REPLIES.length)];
      const botMsg: Message = { id: crypto.randomUUID(), role: "bot", content: reply };
      setMessagesBySession((prev) => ({
        ...prev,
        [activeId]: [...(prev[activeId] ?? []), botMsg],
      }));
      setLoading(false);
    }, 1100);
  };

  const handleNew = () => {
    const id = crypto.randomUUID();
    setSessions((p) => [{ id, title: "New chat" }, ...p]);
    setMessagesBySession((p) => ({ ...p, [id]: [] }));
    setActiveId(id);
  };

  const handleDelete = (id: string) => {
    setSessions((p) => {
      const next = p.filter((s) => s.id !== id);
      if (id === activeId) setActiveId(next[0]?.id ?? "");
      return next;
    });
    setMessagesBySession((p) => {
      const { [id]: _, ...rest } = p;
      return rest;
    });
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sessions={sessions}
        activeId={activeId}
        onSelect={setActiveId}
        onNew={handleNew}
        onDelete={handleDelete}
      />
      <ChatWindow
        messages={messages}
        loading={loading}
        onSend={handleSend}
        onToggleSidebar={() => setSidebarOpen((s) => !s)}
        dark={dark}
        onToggleDark={() => setDark((d) => !d)}
      />
    </div>
  );
}
