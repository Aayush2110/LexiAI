import { useState } from "react";
import { Copy, Check, RefreshCw, Sparkles, User, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
  citations?: { label: string; page?: number }[];
}

export function MessageBubble({
  message,
  onRegenerate,
}: {
  message: Message;
  onRegenerate?: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const copy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={cn("group flex gap-3 w-full", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <div className="h-8 w-8 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
      )}

      <div className={cn("flex flex-col gap-1.5 max-w-[85%] sm:max-w-[75%]", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-lg px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "bg-primary text-white"
              : "card"
          )}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>

          {!isUser && message.citations && message.citations.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border flex flex-wrap gap-2">
              {message.citations.map((c, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-md bg-accent text-foreground border border-border"
                >
                  <FileText className="h-3 w-3" />
                  {c.label}
                  {c.page && <span className="text-muted-foreground">· p.{c.page}</span>}
                </span>
              ))}
            </div>
          )}
        </div>

        <div
          className={cn(
            "flex items-center gap-2 text-[10px] text-muted-foreground px-1",
            isUser && "flex-row-reverse"
          )}
        >
          <span>{time}</span>
          <span>·</span>
          <button
            onClick={copy}
            className="inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:text-foreground"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
          {!isUser && onRegenerate && (
            <button
              onClick={() => onRegenerate(message.id)}
              className="inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:text-foreground"
            >
              <RefreshCw className="h-3 w-3" />
              Regenerate
            </button>
          )}
        </div>
      </div>

      {isUser && (
        <div className="h-8 w-8 shrink-0 rounded-lg bg-accent border border-border flex items-center justify-center">
          <User className="h-4 w-4 text-foreground" />
        </div>
      )}
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="h-8 w-8 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
        <Sparkles className="h-4 w-4 text-primary" />
      </div>
      <div className="card rounded-lg px-4 py-3 flex gap-1.5">
        <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce-dot" style={{ animationDelay: "0s" }} />
        <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce-dot" style={{ animationDelay: "0.15s" }} />
        <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce-dot" style={{ animationDelay: "0.3s" }} />
      </div>
    </div>
  );
}
