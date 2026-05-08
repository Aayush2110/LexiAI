import { useState } from "react";
import { motion } from "framer-motion";
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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn("group flex gap-3 w-full", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <div className="h-8 w-8 shrink-0 rounded-xl gradient-bg grid place-items-center shadow-lg shadow-primary/20">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
      )}

      <div className={cn("flex flex-col gap-1.5 max-w-[85%] sm:max-w-[75%]", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
            isUser
              ? "gradient-bg text-white rounded-br-md"
              : "glass text-foreground rounded-bl-md"
          )}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>

          {!isUser && message.citations && message.citations.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border/60 flex flex-wrap gap-1.5">
              {message.citations.map((c, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-primary/15 text-primary border border-primary/20"
                >
                  <FileText className="h-2.5 w-2.5" />
                  {c.label}
                  {c.page && <span className="opacity-70">· p.{c.page}</span>}
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
          <span className="opacity-40">·</span>
          <button
            onClick={copy}
            className="inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-foreground"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
          {!isUser && onRegenerate && (
            <button
              onClick={() => onRegenerate(message.id)}
              className="inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-foreground"
            >
              <RefreshCw className="h-3 w-3" />
              Regenerate
            </button>
          )}
        </div>
      </div>

      {isUser && (
        <div className="h-8 w-8 shrink-0 rounded-xl bg-surface-elevated border border-border grid place-items-center">
          <User className="h-4 w-4 text-foreground" />
        </div>
      )}
    </motion.div>
  );
}

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3"
    >
      <div className="h-8 w-8 shrink-0 rounded-xl gradient-bg grid place-items-center shadow-lg shadow-primary/20">
        <Sparkles className="h-4 w-4 text-white" />
      </div>
      <div className="glass rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5">
        <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce-dot" style={{ animationDelay: "0s" }} />
        <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce-dot" style={{ animationDelay: "0.15s" }} />
        <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce-dot" style={{ animationDelay: "0.3s" }} />
      </div>
    </motion.div>
  );
}
