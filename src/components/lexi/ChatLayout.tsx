import { useEffect, useRef, useState, KeyboardEvent } from "react";
import { Send, Paperclip, Sparkles, Scale, FileSearch, AlertTriangle, DollarSign } from "lucide-react";
import { MessageBubble, TypingIndicator, type Message } from "./MessageBubble";

interface ChatLayoutProps {
  messages: Message[];
  loading: boolean;
  onSend: (text: string) => void;
  onRegenerate: (id: string) => void;
}

const SUGGESTIONS = [
  { icon: Scale, title: "Summarize this contract", desc: "Get the key terms in plain English." },
  { icon: AlertTriangle, title: "Explain termination clause", desc: "Understand cancellation rights." },
  { icon: FileSearch, title: "Find legal risks", desc: "Spot ambiguous or risky language." },
  { icon: DollarSign, title: "Extract payment terms", desc: "Surface fees, schedules, penalties." },
] as const;

export function ChatLayout({ messages, loading, onSend, onRegenerate }: ChatLayoutProps) {
  const [value, setValue] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const submit = (text?: string) => {
    const t = (text ?? value).trim();
    if (!t || loading) return;
    onSend(t);
    setValue("");
    if (taRef.current) taRef.current.style.height = "auto";
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const empty = messages.length === 0;

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
          {empty ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold">
                AI Legal Assistant
              </h1>
              <p className="mt-3 text-sm text-muted-foreground max-w-lg mx-auto">
                Upload legal documents and ask questions instantly. Get cited, contextual answers grounded in your files.
              </p>

              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.title}
                    onClick={() => submit(s.title)}
                    className="group card p-4 text-left hover:border-primary/30 transition-all duration-150"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <s.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{s.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">{s.desc}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} onRegenerate={onRegenerate} />
              ))}
              {loading && <TypingIndicator />}
              <div ref={endRef} />
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="border-t border-border bg-surface">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-4">
          <div className="relative flex items-end gap-2 rounded-lg border border-border bg-background p-2 focus-within:border-primary transition-colors duration-150">
            <button
              className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg hover:bg-accent transition-colors duration-150 text-muted-foreground"
              title="Attach"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <textarea
              ref={taRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              onInput={(e) => {
                const t = e.currentTarget;
                t.style.height = "auto";
                t.style.height = Math.min(t.scrollHeight, 180) + "px";
              }}
              rows={1}
              placeholder="Ask about your contracts, clauses, risks…"
              className="flex-1 resize-none bg-transparent px-1 py-2 text-sm outline-none placeholder:text-muted-foreground max-h-44"
            />
            <button
              onClick={() => submit()}
              disabled={!value.trim() || loading}
              className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            LexiAI may produce inaccurate information. Verify critical legal advice with a professional.
          </p>
        </div>
      </div>
    </div>
  );
}
