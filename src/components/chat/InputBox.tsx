import { useRef, useState, KeyboardEvent } from "react";
import { Send, Paperclip, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InputBoxProps {
  onSend: (text: string) => void;
  loading: boolean;
}

export function InputBox({ onSend, loading }: InputBoxProps) {
  const [value, setValue] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    const t = value.trim();
    if (!t || loading) return;
    onSend(t);
    setValue("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="border-t bg-background/80 backdrop-blur-sm">
      <div className="mx-auto max-w-3xl px-4 py-4">
        <div className="relative flex items-end gap-2 rounded-2xl border bg-card p-2 shadow-sm focus-within:ring-2 focus-within:ring-ring/40 transition-shadow">
          <input ref={fileRef} type="file" className="hidden" onChange={() => {}} />
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => fileRef.current?.click()}
            type="button"
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder="Ask something..."
            className="flex-1 resize-none bg-transparent px-1 py-2 text-sm outline-none placeholder:text-muted-foreground max-h-40"
            style={{ height: "auto" }}
            onInput={(e) => {
              const t = e.currentTarget;
              t.style.height = "auto";
              t.style.height = Math.min(t.scrollHeight, 160) + "px";
            }}
          />

          <Button
            onClick={submit}
            disabled={!value.trim() || loading}
            size="icon"
            className="h-9 w-9 shrink-0 rounded-xl"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
