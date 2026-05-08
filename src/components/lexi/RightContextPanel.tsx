import { motion } from "framer-motion";
import { FileText, Layers, Database, Quote, ShieldCheck, Activity } from "lucide-react";
import type { UploadedFile } from "./UploadPanel";

interface RightContextPanelProps {
  files: UploadedFile[];
}

export function RightContextPanel({ files }: RightContextPanelProps) {
  const indexedCount = files.filter((f) => f.status === "indexed").length;
  const totalPages = indexedCount * 23; // mock derivation
  const chunks = indexedCount * 184;
  const confidence = Math.min(99, 78 + indexedCount * 4);
  const active = files.find((f) => f.status === "indexed") ?? files[0];

  return (
    <aside className="hidden xl:flex flex-col w-80 shrink-0 border-l border-border bg-sidebar/50 h-full overflow-y-auto scrollbar-thin">
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
        <ConfidenceBar value={confidence} />
        <EmbeddingStatus indexed={indexedCount} total={files.length} />
      </div>

      <div className="px-5 pb-3">
        <SectionTitle icon={Quote}>Retrieved Context</SectionTitle>
        <div className="space-y-2">
          {indexedCount === 0 ? (
            <Empty text="Ask a question to see retrieved chunks." />
          ) : (
            MOCK_CHUNKS.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass rounded-xl p-3"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-medium text-primary">{c.source}</span>
                  <span className="text-[10px] text-muted-foreground">p.{c.page}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {c.text}
                </p>
                <div className="mt-2 flex items-center gap-1 text-[10px] text-success">
                  <ShieldCheck className="h-2.5 w-2.5" /> {c.score}% match
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <div className="px-5 pb-5">
        <SectionTitle icon={Activity}>Citations</SectionTitle>
        <div className="space-y-1.5">
          {indexedCount === 0 ? (
            <Empty text="Citations will appear after a query." />
          ) : (
            ["§ 4.2 Termination", "§ 7.1 Liability Cap", "Schedule A · Fees"].map((c) => (
              <div
                key={c}
                className="text-xs px-3 py-2 rounded-lg glass hover:border-primary/40 transition-colors cursor-pointer"
              >
                {c}
              </div>
            ))
          )}
        </div>
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

function ConfidenceBar({ value }: { value: number }) {
  return (
    <div className="glass rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Confidence Score
        </span>
        <span className="text-sm font-semibold gradient-text">{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full gradient-bg"
        />
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

const MOCK_CHUNKS = [
  {
    source: "Contract.pdf",
    page: 4,
    score: 96,
    text: "Either party may terminate this Agreement upon thirty (30) days written notice in the event of a material breach not cured within such notice period.",
  },
  {
    source: "Contract.pdf",
    page: 7,
    score: 91,
    text: "Liability of either party for any claim arising out of or related to this Agreement shall not exceed the fees paid in the twelve (12) months prior.",
  },
  {
    source: "Schedule_A.pdf",
    page: 2,
    score: 88,
    text: "Late payments shall accrue interest at the lesser of 1.5% per month or the maximum rate permitted by applicable law.",
  },
];
