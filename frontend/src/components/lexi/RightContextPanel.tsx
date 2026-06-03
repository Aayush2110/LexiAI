import { FileText } from "lucide-react";
import type { UploadedFile } from "./UploadPanel";
import { UploadPanel } from "./UploadPanel";

interface RightContextPanelProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  onSessionId?: (sessionId: string) => void;
  currentSessionId?: string;
}

export function RightContextPanel({ files, onFilesChange, onSessionId, currentSessionId }: RightContextPanelProps) {
  const active = files.find((f) => f.status === "indexed") ?? files[0];

  return (
    <aside className="hidden xl:flex flex-col w-80 shrink-0 border-l border-border bg-surface h-full overflow-y-auto scrollbar-thin">
      <div className="p-4 border-b border-border">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Upload Documents
        </div>
        <div>
          <UploadPanel 
            files={files} 
            onChange={onFilesChange} 
            onSessionId={onSessionId}
            currentSessionId={currentSessionId}
          />
        </div>
      </div>

      <div className="p-4 border-b border-border">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Active Document
        </div>
        <div className="card p-3 flex items-start gap-3">
          <div className="h-9 w-9 shrink-0 rounded-lg bg-accent border border-border flex items-center justify-center">
            <FileText className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">
              {active?.name ?? "No document selected"}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {active ? `${(active.size / 1024).toFixed(0)} KB` : "Upload to begin"}
            </div>
          </div>
        </div>
      </div>

    </aside>
  );
}




