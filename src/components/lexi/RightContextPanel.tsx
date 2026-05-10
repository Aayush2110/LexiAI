import { motion } from "framer-motion";
import { FileText, Layers, Database, Quote, ShieldCheck, Activity } from "lucide-react";
import type { UploadedFile } from "./UploadPanel";
import { UploadPanel } from "./UploadPanel";

interface RightContextPanelProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  onSessionId?: (sessionId: string) => void;
}

export function RightContextPanel({ files, onFilesChange, onSessionId }: RightContextPanelProps) {
  const indexedCount = files.filter((f) => f.status === "indexed").length;
  const totalPages = indexedCount * 23; // mock derivation
  const chunks = indexedCount * 184;
  const active = files.find((f) => f.status === "indexed") ?? files[0];

  return (
    <aside className="hidden xl:flex flex-col w-80 shrink-0 border-l border-border bg-sidebar/50 h-full overflow-y-auto scrollbar-thin">
      <div className="p-5 border-b border-border">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Upload Documents
        </div>
        <div className="mt-3">
          <UploadPanel files={files} onChange={onFilesChange} onSessionId={onSessionId} />
        </div>
      </div>

      <div className="p-5 border-b border-border">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Active Document
        </div>
        <div className="mt-2 flex items-start gap-3">
          <div className="h-10 w-10 shrink-0 rounded-xl gradient-bg grid place-items-center text-white">
            <FileText className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">
              {active?.name ?? "No document selected"}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {active ? `${(active.size / 1024).toFixed(0)} KB` : "Upload to begin"}
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-3">
        <Stat icon={Layers} label="Total Pages" value={totalPages} />
        <Stat icon={Database} label="Extracted Chunks" value={chunks} />
        <EmbeddingStatus indexed={indexedCount} total={files.length} />
      </div>

      

      
    </aside>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
}) {
  return (
    <div className="glass rounded-xl p-3 flex items-center gap-3">
      <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 grid place-items-center text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-base font-semibold">{value}</div>
      </div>
    </div>
  );
}

function EmbeddingStatus({ indexed, total }: { indexed: number; total: number }) {
  const ready = total > 0 && indexed === total;
  return (
    <div className="glass rounded-xl p-3 flex items-center gap-3">
      <span
        className={`relative flex h-2.5 w-2.5 ${ready ? "" : "opacity-80"}`}
      >
        <span
          className={`absolute inline-flex h-full w-full rounded-full ${
            ready ? "bg-success" : "bg-warning"
          } animate-ping opacity-60`}
        />
        <span
          className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
            ready ? "bg-success" : "bg-warning"
          }`}
        />
      </span>
      <div className="flex-1">
        <div className="text-xs font-medium">
          {ready ? "Embeddings Ready" : total === 0 ? "No Embeddings" : "Building Index…"}
        </div>
        <div className="text-[10px] text-muted-foreground">
          {indexed}/{total || 0} documents vectorized
        </div>
      </div>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5 mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      <Icon className="h-3 w-3" /> {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border p-3 text-center text-[11px] text-muted-foreground/80">
      {text}
    </div>
  );
}


