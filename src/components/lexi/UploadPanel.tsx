import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, CheckCircle2, Loader2, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { DocsAPI } from "@/services/api";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: "uploading" | "processing" | "indexed" | "error";
}

interface UploadPanelProps {
  files: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  onSessionId?: (sessionId: string) => void;
}

const ACCEPT = ".pdf,.docx,.txt";

export function UploadPanel({ files, onChange, onSessionId }: UploadPanelProps) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (list: FileList | null) => {
      if (!list || list.length === 0) return;
      const newOnes: UploadedFile[] = Array.from(list).map((f) => ({
        id: crypto.randomUUID(),
        name: f.name,
        size: f.size,
        progress: 0,
        status: "uploading",
      }));
      let current = [...files, ...newOnes];
      onChange(current);

      try {
        const fileArray = Array.from(list);
        const result = await DocsAPI.upload(fileArray, (p) => {
          current = current.map((x) =>
            newOnes.some(n => n.id === x.id) ? { ...x, progress: p, status: p >= 100 ? "processing" : "uploading" } : x
          );
          onChange(current);
        });
        
        // Mark as processing
        current = current.map((x) =>
          newOnes.some(n => n.id === x.id) ? { ...x, status: "processing", progress: 100 } : x
        );
        onChange(current);
        
        // Wait a bit then mark as indexed
        await new Promise(r => setTimeout(r, 500));
        current = current.map((x) =>
          newOnes.some(n => n.id === x.id) ? { ...x, status: "indexed" } : x
        );
        onChange(current);
        
        // Return session_id for parent component
        console.log('[UploadPanel] Upload result:', result);
        if (onSessionId && result?.session_id) {
          console.log('[UploadPanel] Calling onSessionId with:', result.session_id);
          onSessionId(result.session_id);
        } else {
          console.warn('[UploadPanel] No session_id in result or no callback:', { result, hasCallback: !!onSessionId });
        }
        return result?.session_id;
      } catch (err: any) {
        console.error('Upload error:', err);
        current = current.map((x) => (newOnes.some(n => n.id === x.id) ? { ...x, status: "error" } : x));
        onChange(current);
      }
    },
    [files, onChange, onSessionId]
  );

  const remove = (id: string) => onChange(files.filter((f) => f.id !== id));

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all",
          drag
            ? "border-primary bg-primary/10"
            : "border-border hover:border-primary/50 hover:bg-accent/30"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={(e) => {
          handleFiles(e.target.files);
        }}
        />
        <motion.div
          animate={{ y: drag ? -4 : 0 }}
          className="mx-auto h-12 w-12 rounded-2xl gradient-bg grid place-items-center shadow-lg shadow-primary/30 mb-3"
        >
          <UploadCloud className="h-6 w-6 text-white" />
        </motion.div>
        <div className="text-sm font-medium">Drop files or click to upload</div>
        <div className="text-xs text-muted-foreground mt-1">PDF, DOCX, TXT · up to 25 MB each</div>
      </div>

      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {files.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass rounded-2xl p-5 text-center"
            >
              <FileText className="h-6 w-6 mx-auto text-muted-foreground/60 mb-2" />
              <div className="text-xs text-muted-foreground">No documents yet — upload to begin.</div>
            </motion.div>
          ) : (
            files.map((f) => (
              <motion.div
                key={f.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="glass rounded-2xl p-3 flex items-center gap-3"
              >
                <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/10 border border-primary/20 grid place-items-center text-primary">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-medium truncate">{f.name}</div>
                    <button
                      onClick={() => remove(f.id)}
                      className="h-6 w-6 grid place-items-center rounded-md hover:bg-accent text-muted-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>{(f.size / 1024).toFixed(0)} KB</span>
                    <span>·</span>
                    <StatusPill status={f.status} />
                  </div>
                  {(f.status === "uploading" || f.status === "processing") && (
                    <div className="mt-2 h-1 w-full rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${f.status === "processing" ? 100 : f.progress}%` }}
                        className="h-full gradient-bg"
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: UploadedFile["status"] }) {
  if (status === "indexed")
    return (
      <span className="inline-flex items-center gap-1 text-success">
        <CheckCircle2 className="h-3 w-3" /> Indexed
      </span>
    );
  if (status === "processing")
    return (
      <span className="inline-flex items-center gap-1 text-warning">
        <Loader2 className="h-3 w-3 animate-spin" /> Processing
      </span>
    );
  if (status === "error")
    return (
      <span className="inline-flex items-center gap-1 text-destructive">
        <AlertCircle className="h-3 w-3" /> Failed
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-muted-foreground">
      <Loader2 className="h-3 w-3 animate-spin" /> Uploading
    </span>
  );
}
