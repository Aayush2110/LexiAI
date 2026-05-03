import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
}

export function MessageBubble({ message }: { message: Message }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const onCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className={cn(
        "group flex w-full gap-3 animate-fade-in-up",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-user-bubble">
          <Sparkles className="h-4 w-4 text-user-bubble-foreground" />
        </div>
      )}

      <div className={cn("flex flex-col gap-1 max-w-[80%]", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
            isUser
              ? "bg-user-bubble text-user-bubble-foreground rounded-br-sm"
              : "bg-bot-bubble text-foreground rounded-bl-sm"
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="text-sm leading-relaxed [&_p]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 [&_pre]:bg-background/60 [&_pre]:border [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:my-2 [&_pre]:overflow-x-auto [&_code]:font-mono [&_code]:text-xs [&_:not(pre)>code]:bg-background/60 [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:rounded [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_a]:underline [&_strong]:font-semibold">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        <button
          onClick={onCopy}
          className="flex items-center gap-1 px-2 py-0.5 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-foreground"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in-up">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-user-bubble">
        <Sparkles className="h-4 w-4 text-user-bubble-foreground" />
      </div>
      <div className="bg-bot-bubble rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5">
        <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce-dot" style={{ animationDelay: "0s" }} />
        <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce-dot" style={{ animationDelay: "0.15s" }} />
        <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce-dot" style={{ animationDelay: "0.3s" }} />
      </div>
    </div>
  );
}
