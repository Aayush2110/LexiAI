import { useEffect, useRef } from "react";
import { Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MessageBubble, TypingIndicator, type Message } from "./MessageBubble";
import { InputBox } from "./InputBox";

interface ChatWindowProps {
  messages: Message[];
  loading: boolean;
  onSend: (t: string) => void;
  onToggleSidebar: () => void;
  dark: boolean;
  onToggleDark: () => void;
}

export function ChatWindow({ messages, loading, onSend, onToggleSidebar, dark, onToggleDark }: ChatWindowProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="flex flex-1 flex-col h-full min-w-0">
      <header className="flex items-center justify-between border-b px-4 py-3 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onToggleSidebar}>
            <Menu className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-sm font-semibold">RAG Assistant</h1>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              <span className="text-xs text-muted-foreground">Online</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onToggleDark}>
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center py-20 animate-fade-in-up">
              <h2 className="text-2xl font-semibold mb-2">How can I help you today?</h2>
              <p className="text-sm text-muted-foreground max-w-md">
                Ask anything about your documents. I'll retrieve the relevant context and craft a precise answer.
              </p>
            </div>
          )}
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
          {loading && <TypingIndicator />}
          <div ref={endRef} />
        </div>
      </div>

      <InputBox onSend={onSend} loading={loading} />
    </div>
  );
}
