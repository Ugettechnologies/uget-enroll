import { useState } from "react";
import {
  Download,
  Copy,
  Check,
  FileJson,
  FileSpreadsheet,
  Eye,
  EyeOff,
  Sparkles,
  UserCheck,
  GraduationCap,
  Globe,
  Mail,
  Phone,
} from "lucide-react";
import {
  formatBioForAcademy,
  downloadJsonFile,
  downloadCsvFile,
  copyToClipboard,
  sanitizeFilename,
  type StudentBioRecord,
} from "@/lib/bio-export";

interface StudentBioExtractorProps {
  student: StudentBioRecord;
  className?: string;
  title?: string;
  showCardSummary?: boolean;
}

export function StudentBioExtractor({
  student,
  className = "",
  title = "Student Bio & Academy Import Data",
  showCardSummary = true,
}: StudentBioExtractorProps) {
  const [copied, setCopied] = useState(false);
  const [showJsonPreview, setShowJsonPreview] = useState(false);

  const bioPayload = formatBioForAcademy(student);
  const baseFilename = `uget_academy_bio_${sanitizeFilename(student.full_name || "student")}`;

  const handleDownloadJson = () => {
    downloadJsonFile(bioPayload, `${baseFilename}.json`);
  };

  const handleDownloadCsv = () => {
    downloadCsvFile([student], `${baseFilename}.csv`);
  };

  const handleCopyJson = async () => {
    const ok = await copyToClipboard(JSON.stringify(bioPayload, null, 2));
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <div
      className={`rounded-2xl border border-primary/30 p-6 sm:p-7 shadow-xl animate-fade-in ${className}`}
      style={{
        background: "linear-gradient(145deg, oklch(0.20 0.07 285 / 0.85), oklch(0.18 0.05 280 / 0.85))",
        backdropFilter: "blur(14px)",
      }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-primary-foreground shadow-md"
            style={{ background: "var(--gradient-brand)" }}
          >
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              {title}
            </h3>
            <p className="text-xs text-muted-foreground">
              Extract verified bio details to import directly into the Uget Academy site
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-xs font-semibold text-emerald-400">
            <UserCheck className="h-3.5 w-3.5" />
            Bio Ready for Import
          </span>
        </div>
      </div>

      {/* Card Summary */}
      {showCardSummary && (
        <div className="rounded-xl border border-border/60 bg-card/40 p-4 mb-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-3">
            <div>
              <p className="font-bold text-base text-foreground">{student.full_name}</p>
              <p className="text-xs text-muted-foreground font-mono">ID: {student.id}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-primary/15 border border-primary/30 px-2.5 py-0.5 text-xs font-medium text-primary flex items-center gap-1">
                <GraduationCap className="h-3.5 w-3.5" />
                {student.track}
              </span>
              <span className="rounded-md bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                Cohort 1
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="truncate text-foreground/90">{student.email}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="truncate text-foreground/90">{student.phone || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="truncate text-foreground/90">
                {student.state_region ? `${student.state_region}, ` : ""}
                {student.country || "Nigeria"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="font-semibold text-primary">Qualification:</span>
              <span className="truncate text-foreground/90">{student.highest_qualification || "N/A"}</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2.5 items-center">
        <button
          type="button"
          onClick={handleDownloadJson}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow)" }}
        >
          <FileJson className="h-4 w-4" />
          <span>Export Bio (JSON)</span>
          <Download className="h-3.5 w-3.5 opacity-80" />
        </button>

        <button
          type="button"
          onClick={handleDownloadCsv}
          className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-card/60 px-4 py-2.5 text-xs sm:text-sm font-semibold text-foreground transition-all hover:bg-accent/40 hover:border-primary/50"
        >
          <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
          <span>Export Bio (CSV)</span>
          <Download className="h-3.5 w-3.5 opacity-80" />
        </button>

        <button
          type="button"
          onClick={handleCopyJson}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-card/40 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-foreground/90 transition-all hover:bg-card/80 hover:text-foreground"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied JSON!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 text-muted-foreground" />
              <span>Copy JSON</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => setShowJsonPreview((prev) => !prev)}
          className="ml-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors py-1 px-2"
        >
          {showJsonPreview ? (
            <>
              <EyeOff className="h-3.5 w-3.5" />
              <span>Hide Payload</span>
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5" />
              <span>Inspect Payload</span>
            </>
          )}
        </button>
      </div>

      {/* JSON Payload Preview Dropdown */}
      {showJsonPreview && (
        <div className="mt-4 pt-4 border-t border-border/40 animate-fade-in">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span className="font-mono text-[11px]">uget_academy_import_payload.json</span>
            <span className="text-[10px] uppercase tracking-wider text-primary">Ready to Import</span>
          </div>
          <pre
            className="max-h-60 overflow-auto rounded-xl p-3.5 text-[11px] font-mono text-foreground/90 border border-border/60"
            style={{ background: "oklch(0.14 0.04 280)" }}
          >
            {JSON.stringify(bioPayload, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
