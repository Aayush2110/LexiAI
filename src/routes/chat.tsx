import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MainLayout } from "@/layouts/MainLayout";
import { ChatLayout } from "@/components/lexi/ChatLayout";
import { UploadPanel, type UploadedFile } from "@/components/lexi/UploadPanel";
import { RightContextPanel } from "@/components/lexi/RightContextPanel";
import type { Message } from "@/components/lexi/MessageBubble";
import { ChatAPI } from "@/services/api";
import { motion } from "framer-motion";
import { FileUp } from "lucide-react";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Chat — LexiAI" },
      { name: "description", content: "Ask questions about your legal documents with cited answers." },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [showUpload, setShowUpload] = useState(false);

  const send = async (text: string) => {
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      createdAt: Date.now(),
    };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);
    try {
      const { reply } = await ChatAPI.send(text);
      const sample =
        files.length > 0
          ? `Based on your indexed documents, here's the analysis:\n\n${reply}\n\nThe relevant clauses indicate standard market terms with two notable considerations: a 30-day cure period and a liability cap tied to 12-month fees.`
          : `${reply}\n\nUpload a contract for source-cited answers grounded in your specific documents.`;
      const botMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: sample,
        createdAt: Date.now(),
        citations: files.length > 0
          ? [{ label: files[0].name, page: 4 }, { label: files[0].name, page: 7 }]
          : undefined,
      };
      // simulate stream
      await new Promise((r) => setTimeout(r, 900));
      setMessages((m) => [...m, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  const regenerate = (id: string) => {
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === id);
      if (idx <= 0) return prev;
      const prompt = prev[idx - 1]?.content;
      if (!prompt) return prev;
      const trimmed = prev.slice(0, idx);
      setLoading(true);
      setTimeout(() => {
        setMessages((m) => [
          ...m,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `Regenerated answer for "${prompt}":\n\nA fresh perspective with refined clause references and risk highlights.`,
            createdAt: Date.now(),
            citations: files[0] ? [{ label: files[0].name, page: 5 }] : undefined,
          },
        ]);
        setLoading(false);
      }, 800);
      return trimmed;
    });
  };

  return (
    <MainLayout
      title="AI Legal Assistant"
      subtitle="RAG-grounded legal analysis"
      rightSlot={<RightContextPanel files={files} />}
    >
      <div className="relative flex-1 flex flex-col min-h-0">
        {/* Floating upload toggle (mobile/tablet) */}
        <div className="xl:hidden border-b border-border px-4 py-2 flex items-center justify-between glass-strong">
          <div className="text-xs text-muted-foreground">
            {files.length > 0 ? `${files.length} document(s)` : "No documents uploaded"}
          </div>
          <button
            onClick={() => setShowUpload((s) => !s)}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg glass hover:border-primary/40 transition-colors"
          >
            <FileUp className="h-3.5 w-3.5" /> {showUpload ? "Hide" : "Upload"}
          </button>
        </div>

        {showUpload && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="xl:hidden border-b border-border p-4 bg-surface/40"
          >
            <UploadPanel files={files} onChange={setFiles} />
          </motion.div>
        )}

        {/* Desktop: side-by-side chat + uploads on the left of context panel */}
        <div className="flex-1 flex min-h-0">
          <div className="flex-1 min-w-0">
            <ChatLayout
              messages={messages}
              loading={loading}
              onSend={send}
              onRegenerate={regenerate}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
