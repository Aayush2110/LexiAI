import { useCallback, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
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
  currentSessionId?: string;
}

const ACCEPT = ".pdf,.docx,.txt";

export function UploadPanel({ files, onChange, onSessionId, currentSessionId }: UploadPanelProps) {
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
        console.log('[UploadPanel] Uploading with session ID:', currentSessionId);
        const result = await DocsAPI.upload(fileArray, currentSessionId, (p) => {
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
    [files, onChange, onSessionId, currentSessionId]
  );

  const remove = (id: string) => onChange(files.filter((f) => f.id !== id));

  return (
    <div className="space-y-3">
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
          "relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-all duration-150",
          drag
            ? "border-primary bg-primary/5"
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
        <div className="mx-auto h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
          <UploadCloud className="h-6 w-6 text-primary" />
        </div>
        <div className="text-sm font-medium">Drop files or click to upload</div>
        <div className="text-xs text-muted-foreground mt-1">PDF, DOCX, TXT · up to 25 MB each</div>
      </div>

      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {files.length === 0 ? (
            <div
              key="empty"
              className="card p-4 text-center"
            >
              <FileText className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
              <div className="text-xs text-muted-foreground">No documents yet — upload to begin.</div>
            </div>
          ) : (
            files.map((f) => (
              <div
                key={f.id}
                className="card p-3 flex items-center gap-3"
              >
                <div className="h-9 w-9 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-medium truncate">{f.name}</div>
                    <button
                      onClick={() => remove(f.id)}
                      className="h-6 w-6 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground transition-colors duration-150"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>{(f.size / 1024).toFixed(0)} KB</span>
                    <span>·</span>
                    <StatusPill status={f.status} />
                  </div>
                  {(f.status === "uploading" || f.status === "processing") && (
                    <div className="mt-2 h-1 w-full rounded-full bg-accent overflow-hidden">
                      <div
                        style={{ width: `${f.status === "processing" ? 100 : f.progress}%` }}
                        className="h-full bg-primary transition-all duration-300"
                      />
                    </div>
                  )}
                </div>
              </div>
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
