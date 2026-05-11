import { FileText } from "lucide-react";
import type { UploadedFile } from "./UploadPanel";
import { UploadPanel } from "./UploadPanel";

interface RightContextPanelProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  onSessionId?: (sessionId: string) => void;
}

export function RightContextPanel({ files, onFilesChange, onSessionId }: RightContextPanelProps) {
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

    </aside>
  );
}




