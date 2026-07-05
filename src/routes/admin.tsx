import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, Fragment, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { sendEmailFn } from "@/lib/email";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { COURSE_FEES, fmt, fmtUsd, getFeeDetails } from "./payment";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Settings, ChevronDown, ChevronUp, Mail, MessageSquare, Send, Copy, Check, ExternalLink, Search, X, ArrowUpDown } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminWrapper,
});

// ─── Email template ──────────────────────────────────────────────────────────
function buildEmailHtml(name: string, track: string, fee: number, paymentUrl: string) {
  const feeDetails = getFeeDetails(track);
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Welcome to Uget Academy</title>
</head>
<body style="margin:0;padding:0;background:#13111c;font-family:Inter,Arial,sans-serif;color:#f0eeff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:40px auto;">
    <tr>
      <td style="background:linear-gradient(135deg,#13111c 0%,#1f1a30 50%,#181424 100%);border-radius:16px;padding:0;overflow:hidden;border:1px solid rgba(120,100,220,0.25);">
        <!-- Header -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:32px 36px 24px;background:linear-gradient(135deg,rgba(120,80,220,0.15),rgba(100,60,200,0.08));border-bottom:1px solid rgba(120,100,220,0.25);text-align:center;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.3em;text-transform:uppercase;color:#06b6d4;">Uget Academy</p>
              <h1 style="margin:0;font-size:20px;font-weight:800;color:#ffffff;text-transform:uppercase;letter-spacing:0.05em;">
                Welcome to Uget Academy
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:28px 36px;">
              <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#d0c8f0;">
                Hello <strong style="color:#ffffff;">${name}</strong>,
              </p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#d0c8f0;">
                Congratulations! You've secured a spot in Uget Academy's Cohort 1 for <strong style="color:#ffffff;">${track}</strong>.
              </p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#d0c8f0;">
                <strong style="color:#ffffff;">Program Fee:</strong> ${fmt(feeDetails.ngn.total)} (approximately ${fmtUsd(feeDetails.usd.total)})
              </p>

              <!-- Payment Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border-radius:12px;overflow:hidden;border:1px solid rgba(120,100,220,0.3);background:rgba(120,80,220,0.05);font-size:14px;color:#d0c8f0;">
                <tr>
                  <td style="padding:16px 20px;background:rgba(120,80,220,0.1);border-bottom:1px solid rgba(120,100,220,0.15);">
                    <strong style="color:#ffffff;font-size:15px;">Payment Details (Nigeria)</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;line-height:1.6;">
                    <span style="color:#8b83b0;">Bank:</span> <strong style="color:#ffffff;">Moniepoint</strong><br/>
                    <span style="color:#8b83b0;">Account Number:</span> <strong style="color:#06b6d4;font-size:16px;font-mono:true;">6743620799</strong><br/>
                    <span style="color:#8b83b0;">Account Name:</span> <strong style="color:#ffffff;">Uget Technologies</strong>
                  </td>
                </tr>
                <tr style="background:rgba(120,80,220,0.08);border-top:1px solid rgba(120,100,220,0.15);">
                  <td style="padding:16px 20px;line-height:1.6;border-top:1px solid rgba(120,100,220,0.15);">
                    <strong style="color:#ffffff;font-size:14px;">Payment Details (International Students)</strong><br/>
                    <p style="margin:4px 0 0;font-size:13px;color:#d0c8f0;">
                      Please contact us on WhatsApp at <a href="https://wa.me/2347043620799" style="color:#c4b5fd;text-decoration:none;font-weight:600;">+234 704 362 0799</a> and we'll guide you through the best payment option for your country.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA button -->
              <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: 24px auto; width: 100%; text-align: center;">
                <tr>
                  <td align="center">
                    <a href="${paymentUrl}"
                       target="_blank"
                       style="display: inline-block; background-color: #06b6d4; background-image: linear-gradient(135deg, #06b6d4, #3b82f6); padding: 14px 36px; font-family: Arial, sans-serif; font-size: 14px; font-weight: 800; color: #ffffff; text-decoration: none; letter-spacing: 0.05em; text-transform: uppercase; border-radius: 9999px; box-shadow: 0 4px 12px rgba(6,182,212,0.35);">
                      PROCEED TO PAYMENT & VALIDATE
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:16px 0 16px;font-size:15px;line-height:1.7;color:#d0c8f0;">
                Once payment is confirmed, you'll receive your onboarding details, including access to the learning dashboard and your cohort schedule.
              </p>

              <p style="margin:16px 0 24px;font-size:15px;line-height:1.7;color:#d0c8f0;">
                If you have any questions before enrolling, feel free to reach out — we're happy to help.
              </p>

              <p style="margin:24px 0 0;font-size:15px;line-height:1.7;color:#d0c8f0;">
                Warm regards,<br/>
                <strong>ogobor blessed</strong>, admissions coordinator<br/>
                Uget Technologies
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:16px 36px;background:rgba(26,21,41,0.5);border-top:1px solid rgba(120,100,220,0.15);text-align:center;">
              <p style="margin:0;font-size:12px;color:#635d7a;">© ${new Date().getFullYear()} Uget Academy / Uget Technologies. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function buildEmailText(name: string, track: string, fee: number, paymentUrl: string) {
  const feeDetails = getFeeDetails(track);
  return `Hello ${name},

Congratulations! You've secured a spot in Uget Academy's Cohort 1 for ${track}.

Program Fee: ${fmt(feeDetails.ngn.total)} (approximately ${fmtUsd(feeDetails.usd.total)})

Payment Details (Nigeria):
Bank: Moniepoint
Account Number: 6743620799
Account Name: Uget Technologies

Payment Details (International Students):
Please contact us on WhatsApp at +234 704 362 0799 and we'll guide you through the best payment option for your country.

Confirm payment & validate scholarship here:
${paymentUrl}

Once payment is confirmed, you'll receive your onboarding details, including access to the learning dashboard and your cohort schedule.

If you have any questions before enrolling, feel free to reach out — we're happy to help.

Warm regards,
ogobor blessed, admissions coordinator
Uget Technologies`.trim();
}

function getWhatsAppMessage(app: any, paymentUrl: string) {
  const feeDetails = getFeeDetails(app.track);
  return `Hello ${app.full_name},\n\nCongratulations! You've secured a spot in Uget Academy's Cohort 1 for ${app.track}.\n\nProgram Fee: ${fmt(feeDetails.ngn.total)} (approximately ${fmtUsd(feeDetails.usd.total)})\n\nPayment Details (Nigeria):\nBank: Moniepoint\nAccount Number: 6743620799\nAccount Name: Uget Technologies\n\nPayment Details (International Students):\nPlease contact us on WhatsApp at +234 704 362 0799 and we'll guide you through the best payment option for your country.\n\nConfirm payment & validate scholarship here:\n${paymentUrl}\n\nOnce payment is confirmed, you'll receive your onboarding details, including access to the learning dashboard and your cohort schedule.\n\nIf you have any questions before enrolling, feel free to reach out — we're happy to help.\n\nWarm regards,\nogobor blessed, admissions coordinator\nUget Technologies`;
}

// ─── Auth wrapper ─────────────────────────────────────────────────────────────
function AdminWrapper() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("adminAuth") === "true";
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "uget@admin" && password === "admin@10717") {
      setIsAuthenticated(true);
      sessionStorage.setItem("adminAuth", "true");
      setError("");
    } else {
      setError("Invalid email or password");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background/50">
        <div className="w-full max-w-md p-8 space-y-6 bg-card border rounded-xl shadow-lg">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Admin Login</h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access the dashboard
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <AdminDashboard
      onLogout={() => {
        setIsAuthenticated(false);
        sessionStorage.removeItem("adminAuth");
      }}
    />
  );
}

// ─── Notify modal ─────────────────────────────────────────────────────────────
function NotifyModal({
  app,
  onClose,
  resendKey,
  senderEmail,
  paymentUrl,
}: {
  app: any;
  onClose: () => void;
  resendKey: string;
  senderEmail: string;
  paymentUrl: string;
}) {
  const fee = COURSE_FEES[app.track] ?? 0;
  const html = buildEmailHtml(app.full_name, app.track, fee, paymentUrl);
  const text = buildEmailText(app.full_name, app.track, fee, paymentUrl);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<"idle" | "ok" | "err">("idle");
  const [sendMsg, setSendMsg] = useState("");

  async function sendViaResend() {
    setSending(true);
    setSendResult("idle");
    try {
      const result = await sendEmailFn({
        data: {
          resendKey,
          from: senderEmail || "onboarding@resend.dev",
          to: [app.email],
          subject: `Welcome to Uget Academy — ${app.track} Cohort 1`,
          html,
          text,
        },
      });
      if (result.success) {
        setSendResult("ok");
        setSendMsg("Email sent successfully!");
      } else {
        setSendResult("err");
        setSendMsg(result.error || "Failed to send. Check your Resend API key and sender domain.");
      }
    } catch (e: any) {
      setSendResult("err");
      setSendMsg(e.message ?? "Network error.");
    } finally {
      setSending(false);
    }
  }

  const mailtoLink = `mailto:${app.email}?subject=${encodeURIComponent("🎓 Uget Academy — Complete Your Enrollment")}&body=${encodeURIComponent(text)}`;
  const waText = encodeURIComponent(getWhatsAppMessage(app, paymentUrl));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,8,20,0.85)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-border p-6 space-y-5 shadow-2xl animate-scale-in"
        style={{ background: "oklch(0.21 0.06 280)" }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold">Notify Student</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {app.full_name} · {app.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors text-xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Preview */}
        <div className="rounded-xl border border-border/60 bg-card/40 p-4 space-y-1 text-sm">
          <p className="text-muted-foreground text-xs uppercase tracking-wider mb-2">
            Email Preview
          </p>
          <p>
            <span className="text-muted-foreground">To:</span> {app.email}
          </p>
          <p>
            <span className="text-muted-foreground">Course:</span> {app.track}
          </p>
          <p>
            <span className="text-muted-foreground">Fee:</span>{" "}
            <strong className="text-primary">{fee > 0 ? fmt(fee) : "—"}</strong>
          </p>
          <p>
            <span className="text-muted-foreground">Link:</span>{" "}
            <span className="text-primary/80">{paymentUrl}</span>
          </p>
        </div>

        {/* Send result */}
        {sendResult === "ok" && (
          <div className="rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 text-sm text-primary">
            ✅ {sendMsg}
          </div>
        )}
        {sendResult === "err" && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            ❌ {sendMsg}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={sendViaResend}
            disabled={sending || !resendKey}
            className="w-full rounded-full py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:scale-[1.01] disabled:opacity-50"
            style={{ background: "var(--gradient-brand)" }}
            title={!resendKey ? "Add Resend API key in Settings tab first" : ""}
          >
            {sending ? "Sending…" : "📧 Send Email (via Resend)"}
          </button>
          <a
            href={mailtoLink}
            className="w-full block text-center rounded-full py-2.5 text-sm font-semibold border border-border bg-card/60 transition-all hover:border-primary/50"
          >
            📤 Open in Mail App (mailto)
          </a>
          <a
            href={`https://wa.me/?text=${waText}`}
            target="_blank"
            rel="noreferrer noopener"
            className="w-full flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold border border-border bg-card/60 transition-all hover:border-green-500/50"
          >
            <svg className="h-4 w-4 text-green-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Send via WhatsApp
          </a>
        </div>

        {!resendKey && (
          <p className="text-xs text-muted-foreground text-center">
            ⚙️ Add your Resend API key in the <strong>Settings</strong> tab to enable one-click emails.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Bulk email modal ─────────────────────────────────────────────────────────
// ─── Bulk email modal ─────────────────────────────────────────────────────────
function BulkEmailModal({
  applications,
  onClose,
  resendKey,
  senderEmail,
  paymentUrl,
}: {
  applications: any[];
  onClose: () => void;
  resendKey: string;
  senderEmail: string;
  paymentUrl: string;
}) {
  const unpaid = applications.filter(
    (a) => !a.payment_status || a.payment_status === "Unpaid",
  );
  const [target, setTarget] = useState<"all" | "unpaid">("unpaid");
  const targets = target === "all" ? applications : unpaid;
  const [progress, setProgress] = useState<Record<string, "idle" | "ok" | "err">>({});
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [method, setMethod] = useState<"resend" | "mailto" | "whatsapp">("resend");
  const [copiedAppId, setCopiedAppId] = useState<string | null>(null);

  async function sendAll() {
    if (!resendKey) return;
    setRunning(true);
    setDone(false);
    const next: Record<string, "idle" | "ok" | "err"> = {};
    targets.forEach((a) => (next[a.id] = "idle"));
    setProgress({ ...next });

    for (const app of targets) {
      const fee = COURSE_FEES[app.track] ?? 0;
      try {
        const result = await sendEmailFn({
          data: {
            resendKey,
            from: senderEmail || "onboarding@resend.dev",
            to: [app.email],
            subject: `Welcome to Uget Academy — ${app.track} Cohort 1`,
            html: buildEmailHtml(app.full_name, app.track, fee, paymentUrl),
            text: buildEmailText(app.full_name, app.track, fee, paymentUrl),
          },
        });
        next[app.id] = result.success ? "ok" : "err";
      } catch {
        next[app.id] = "err";
      }
      setProgress({ ...next });
      // Small delay to avoid rate limiting
      await new Promise((r) => setTimeout(r, 300));
    }
    setRunning(false);
    setDone(true);
  }

  const sent = Object.values(progress).filter((v) => v === "ok").length;
  const failed = Object.values(progress).filter((v) => v === "err").length;

  const cleanPhone = (phone: string) => {
    if (!phone) return "";
    let cleaned = phone.replace(/[^0-9]/g, "");
    if (cleaned.startsWith("0")) {
      cleaned = "234" + cleaned.slice(1);
    }
    return cleaned;
  };

  const getWhatsAppMsg = (app: any) => {
    return getWhatsAppMessage(app, paymentUrl);
  };

  const handleCopyMsg = (app: any) => {
    navigator.clipboard.writeText(getWhatsAppMsg(app)).then(() => {
      setCopiedAppId(app.id);
      setTimeout(() => setCopiedAppId(null), 2000);
    });
  };

  const handleCopyAllWhatsApp = () => {
    const allMsgs = targets
      .map(
        (app) =>
          `--- MESSAGE FOR ${app.full_name} (${app.phone || "No Phone"}) ---\n${getWhatsAppMsg(app)}`,
      )
      .join("\n\n");
    navigator.clipboard.writeText(allMsgs).then(() => {
      setCopiedAppId("all_wa");
      setTimeout(() => setCopiedAppId(null), 2000);
    });
  };

  // Preview data based on first applicant in target list or placeholder
  const previewApp = targets[0] ?? { full_name: "John Doe", track: "Full-Stack Development" };
  const previewFee = COURSE_FEES[previewApp.track] ?? 0;
  const previewText = buildEmailText(previewApp.full_name, previewApp.track, previewFee, paymentUrl);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,8,20,0.85)", backdropFilter: "blur(8px)" }}
      onClick={(e) => !running && e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-border p-6 space-y-5 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto"
        style={{ background: "oklch(0.21 0.06 280)" }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" /> Send Payment Emails
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Notify registrants of their course fee and payment link
            </p>
          </div>
          {!running && (
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors text-xl font-bold"
            >
              ×
            </button>
          )}
        </div>

        {/* 1. Target Selector */}
        {!running && !done && (
          <div className="space-y-2">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              1. Select Recipients
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTarget("unpaid")}
                className={`rounded-xl border p-3 text-left text-sm transition-all ${
                  target === "unpaid"
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-card/45 text-muted-foreground hover:border-border/80"
                }`}
              >
                <div className="font-semibold">Unpaid only</div>
                <div className="text-xs mt-0.5">{unpaid.length} registrants</div>
              </button>
              <button
                type="button"
                onClick={() => setTarget("all")}
                className={`rounded-xl border p-3 text-left text-sm transition-all ${
                  target === "all"
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-card/45 text-muted-foreground hover:border-border/80"
                }`}
              >
                <div className="font-semibold">All registrants</div>
                <div className="text-xs mt-0.5">{applications.length} registrants</div>
              </button>
            </div>
          </div>
        )}

        {/* 2. Choose Method */}
        {!running && !done && (
          <div className="space-y-2">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              2. Choose Notification Method
            </label>
            <div className="flex border-b border-border/60">
              <button
                type="button"
                onClick={() => setMethod("resend")}
                className={`flex-1 pb-2.5 text-sm font-semibold border-b-2 transition-colors ${
                  method === "resend"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Resend API (Auto)
              </button>
              <button
                type="button"
                onClick={() => setMethod("mailto")}
                className={`flex-1 pb-2.5 text-sm font-semibold border-b-2 transition-colors ${
                  method === "mailto"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Mail Client (mailto)
              </button>
              <button
                type="button"
                onClick={() => setMethod("whatsapp")}
                className={`flex-1 pb-2.5 text-sm font-semibold border-b-2 transition-colors ${
                  method === "whatsapp"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                WhatsApp Blast
              </button>
            </div>
          </div>
        )}

        {/* Method Panels */}
        {!running && !done && (
          <div className="space-y-4">
            {method === "resend" && (
              <div className="space-y-3">
                <div className="rounded-xl border border-border bg-card/40 p-4 text-xs space-y-1.5">
                  <h4 className="font-bold text-foreground text-sm">Resend Configuration</h4>
                  {resendKey ? (
                    <p className="text-primary font-medium flex items-center gap-1">
                      <span>✓ Resend Key Configured</span>
                    </p>
                  ) : (
                    <p className="text-destructive font-semibold">
                      ✕ No Resend API key found. Add it in the Settings panel (⚙️) first.
                    </p>
                  )}
                  <p className="text-muted-foreground text-[11px]">
                    Sender email: <strong className="text-foreground">{senderEmail || "academy@ugettech.com"}</strong>
                  </p>
                </div>

                {/* Template Preview */}
                <div className="rounded-xl border border-border bg-card/20 overflow-hidden">
                  <div className="bg-card/65 px-4 py-2 border-b border-border/60 flex justify-between items-center text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                    <span>Email Template Preview ({previewApp.full_name})</span>
                  </div>
                  <div className="p-4 text-xs max-h-48 overflow-y-auto space-y-2 bg-background/40">
                    <p className="font-semibold text-foreground">
                      Subject: <span className="font-normal text-muted-foreground">🎓 Uget Academy — Complete Your Enrollment</span>
                    </p>
                    <div className="border-t border-border/30 pt-2 text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed text-[11px]">
                      {previewText}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={sendAll}
                  disabled={!resendKey || targets.length === 0}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                >
                  Send to {targets.length} Student{targets.length !== 1 ? "s" : ""} via Resend
                </Button>
              </div>
            )}

            {method === "mailto" && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed bg-primary/5 p-3 rounded-lg border border-primary/10">
                  💡 Click <strong>Open Mail Client</strong> next to each registrant to generate a personalized email in your device's default mail application. Useful for small batches.
                </p>

                <div className="max-h-60 overflow-y-auto border border-border bg-card/30 rounded-xl divide-y divide-border/40">
                  {targets.map((app) => {
                    const fee = COURSE_FEES[app.track] ?? 0;
                    const text = buildEmailText(app.full_name, app.track, fee, paymentUrl);
                    const mailto = `mailto:${app.email}?subject=${encodeURIComponent("🎓 Uget Academy — Complete Your Enrollment")}&body=${encodeURIComponent(text)}`;
                    return (
                      <div key={app.id} className="flex items-center justify-between p-3 text-xs">
                        <div className="truncate max-w-[65%] pr-2">
                          <p className="font-semibold text-foreground truncate">{app.full_name}</p>
                          <p className="text-muted-foreground text-[10px] truncate">{app.email}</p>
                        </div>
                        <a
                          href={mailto}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-card/90 hover:border-primary/50 text-[11px] font-semibold text-foreground transition-all shrink-0"
                        >
                          <Send className="h-3 w-3 text-primary" /> Open Mail Client
                        </a>
                      </div>
                    );
                  })}
                  {targets.length === 0 && (
                    <p className="p-4 text-center text-muted-foreground text-xs">No recipients matching your selection.</p>
                  )}
                </div>
              </div>
            )}

            {method === "whatsapp" && (
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-primary/5 p-3 rounded-lg border border-primary/10">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    💡 Click <strong>Chat</strong> to open WhatsApp Web/App pre-filled with the message, or copy text templates below.
                  </p>
                  {targets.length > 0 && (
                    <button
                      type="button"
                      onClick={handleCopyAllWhatsApp}
                      className="text-xs text-primary hover:underline font-semibold flex items-center gap-1 shrink-0 ml-2"
                    >
                      {copiedAppId === "all_wa" ? (
                        <>
                          <Check className="h-3.5 w-3.5" /> Copied All!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" /> Copy All Templates
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="max-h-60 overflow-y-auto border border-border bg-card/30 rounded-xl divide-y divide-border/40">
                  {targets.map((app) => {
                    const waLink = `https://wa.me/${cleanPhone(app.phone)}?text=${encodeURIComponent(getWhatsAppMsg(app))}`;
                    return (
                      <div key={app.id} className="flex items-center justify-between p-3 text-xs">
                        <div className="truncate max-w-[50%] pr-2">
                          <p className="font-semibold text-foreground truncate">{app.full_name}</p>
                          <p className="text-muted-foreground text-[10px] truncate">
                            {app.phone || "No phone number"}
                          </p>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleCopyMsg(app)}
                            className="inline-flex items-center justify-center h-8 px-2.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/50 text-[11px] transition-all"
                            title="Copy message text"
                          >
                            {copiedAppId === app.id ? (
                              <Check className="h-3.5 w-3.5 text-primary" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                          {app.phone && (
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border border-border bg-card text-green-400 hover:text-green-300 hover:border-green-500/50 text-[11px] transition-all"
                            >
                              <MessageSquare className="h-3.5 w-3.5" /> Chat
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {targets.length === 0 && (
                    <p className="p-4 text-center text-muted-foreground text-xs">No recipients matching your selection.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Progress View */}
        {(running || done) && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Sending Progress</span>
              <span className="font-semibold font-mono">
                {sent + failed} / {targets.length}
              </span>
            </div>
            <div className="h-2 rounded-full bg-border overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${targets.length ? ((sent + failed) / targets.length) * 100 : 0}%`,
                  background: "var(--gradient-brand)",
                }}
              />
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1 rounded-xl border border-border/60 bg-card/30 p-3">
              {targets.map((app) => (
                <div key={app.id} className="flex items-center justify-between text-xs py-0.5">
                  <span className="text-muted-foreground truncate max-w-[70%]">
                    {app.full_name}
                  </span>
                  <span>
                    {progress[app.id] === "ok" ? (
                      <span className="text-primary font-medium">✓ Sent</span>
                    ) : progress[app.id] === "err" ? (
                      <span className="text-destructive font-medium">✕ Failed</span>
                    ) : (
                      <span className="text-muted-foreground">
                        {running ? "Pending…" : "–"}
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
            {done && (
              <div className="rounded-lg border border-primary/45 bg-primary/10 px-4 py-2.5 text-sm text-primary font-medium animate-fade-in">
                🎉 Complete! {sent} emails sent successfully, {failed} failed.
              </div>
            )}
          </div>
        )}

        {/* Footer actions */}
        {done && (
          <Button
            onClick={() => {
              setDone(false);
              setProgress({});
            }}
            className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold"
          >
            Start Over / Reset Modal
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────
function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [applications, setApplications] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refName, setRefName] = useState("");
  const [refCode, setRefCode] = useState("");
  const [notifyApp, setNotifyApp] = useState<any | null>(null);
  const [showBulk, setShowBulk] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const renderSortableHeader = (field: string, label: string) => {
    const isActive = sortField === field;
    return (
      <TableHead
        className="cursor-pointer hover:bg-muted/40 transition-colors select-none py-3"
        onClick={() => handleSort(field)}
      >
        <div className="flex items-center gap-1.5">
          <span>{label}</span>
          {isActive ? (
            sortDirection === "asc" ? (
              <ChevronUp className="h-3.5 w-3.5 text-primary shrink-0" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-primary shrink-0" />
            )
          ) : (
            <ArrowUpDown className="h-3 w-3 text-muted-foreground/30 shrink-0" />
          )}
        </div>
      </TableHead>
    );
  };

  const filteredAndSortedApplications = useMemo(() => {
    let result = [...applications];

    // 1. Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((app) => {
        return (
          app.full_name?.toLowerCase().includes(q) ||
          app.email?.toLowerCase().includes(q) ||
          app.phone?.toLowerCase().includes(q) ||
          app.track?.toLowerCase().includes(q) ||
          app.payment_status?.toLowerCase().includes(q) ||
          app.payment_sender?.toLowerCase().includes(q) ||
          app.payment_ref?.toLowerCase().includes(q) ||
          app.referral_code?.toLowerCase().includes(q)
        );
      });
    }

    // 2. Sort Logic
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle null/undefined values
      if (aVal === null || aVal === undefined) aVal = "";
      if (bVal === null || bVal === undefined) bVal = "";

      // Special handling for created_at (dates)
      if (sortField === "created_at") {
        const aDate = new Date(aVal).getTime();
        const bDate = new Date(bVal).getTime();
        return sortDirection === "asc" ? aDate - bDate : bDate - aDate;
      }

      // Special handling for fee (derived from track) or amount paid
      if (sortField === "fee") {
        aVal = COURSE_FEES[a.track] ?? 0;
        bVal = COURSE_FEES[b.track] ?? 0;
      }

      // Convert to string for comparisons if they are strings
      if (typeof aVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal);
      }

      // For numbers
      return sortDirection === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });

    return result;
  }, [applications, searchQuery, sortField, sortDirection]);

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Settings (persisted in localStorage or environment variables)
  const [resendKey, setResendKey] = useState(
    () => localStorage.getItem("uget_resend_key") || (import.meta.env.VITE_RESEND_API_KEY as string | undefined) || "",
  );
  const [senderEmail, setSenderEmail] = useState(
    () => localStorage.getItem("uget_sender_email") || (import.meta.env.VITE_SENDER_EMAIL as string | undefined) || "",
  );
  const [paymentUrl, setPaymentUrl] = useState(
    () => {
      const stored = localStorage.getItem("uget_payment_url");
      if (stored === "https://enroll.vercel.app/payment") {
        localStorage.setItem("uget_payment_url", "https://uget-enroll.vercel.app/payment");
        return "https://uget-enroll.vercel.app/payment";
      }
      return stored ||
        (import.meta.env.VITE_PAYMENT_URL as string | undefined) ||
        "https://uget-enroll.vercel.app/payment";
    }
  );

  function saveSettings(key: string, email: string, url: string) {
    localStorage.setItem("uget_resend_key", key);
    localStorage.setItem("uget_sender_email", email);
    localStorage.setItem("uget_payment_url", url);
    setResendKey(key);
    setSenderEmail(email);
    setPaymentUrl(url);
  }

  useEffect(() => {
    async function fetchData() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const [appsRes, refsRes] = await Promise.all([
        supabase
          .from("scholarship_applications")
          .select("*, payments(payment_status, payment_sender, payment_amount, payment_date, payment_ref)")
          .order("created_at", { ascending: false }),
        supabase
          .from("referral_codes")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);
      if (appsRes.data) {
        const mapped = appsRes.data.map((app: any) => {
          const p = Array.isArray(app.payments) ? app.payments[0] : app.payments;
          return {
            ...app,
            payment_status: p?.payment_status || "Unpaid",
            payment_sender: p?.payment_sender || null,
            payment_amount: p?.payment_amount || null,
            payment_date: p?.payment_date || null,
            payment_ref: p?.payment_ref || null,
          };
        });
        setApplications(mapped);
      }
      if (refsRes.data) setReferrals(refsRes.data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const downloadCSV = () => {
    if (!applications.length) return;
    const headers = Object.keys(applications[0]);
    const csvContent = [
      headers.join(","),
      ...applications.map((row) =>
        headers
          .map((header) => {
            const val = row[header];
            return `"${String(val !== null && val !== undefined ? val : "").replace(/"/g, '""')}"`;
          })
          .join(","),
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute(
      "download",
      `uget-applications-${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refName || !supabase) return;
    const randomHex = Math.floor(Math.random() * 65535)
      .toString(16)
      .toUpperCase()
      .padStart(4, "0");
    const cleanName = refName
      .split(" ")[0]
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase();
    const code = `${cleanName}-${randomHex}`;
    const { data, error } = await supabase
      .from("referral_codes")
      .insert({ referrer_name: refName, code })
      .select();
    if (!error && data) {
      setReferrals([data[0], ...referrals]);
      setRefName("");
      setRefCode(code);
    } else {
      alert("Error generating referral code: " + (error?.message ?? "Unknown error"));
    }
  };

  const deleteReferral = async (id: string) => {
    if (!supabase) return;
    if (!confirm("Are you sure you want to delete this referral code?")) return;
    const { error } = await supabase.from("referral_codes").delete().eq("id", id);
    if (!error) {
      setReferrals(referrals.filter((ref) => ref.id !== id));
    }
  };

  async function updatePaymentStatus(id: string, status: string) {
    if (!supabase) return;
    const { error } = await supabase
      .from("payments")
      .upsert({ application_id: id, payment_status: status }, { onConflict: "application_id" });
    if (!error) {
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, payment_status: status } : a)),
      );
    }
  }

  const paid = applications.filter((a) => a.payment_status === "Paid");
  const pending = applications.filter((a) => a.payment_status === "Pending Verification");
  const unpaid = applications.filter(
    (a) => !a.payment_status || a.payment_status === "Unpaid",
  );

  function PaymentBadge({ status }: { status: string | null }) {
    if (status === "Paid")
      return (
        <span className="inline-flex items-center rounded-full bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
          ✅ Paid
        </span>
      );
    if (status === "Pending Verification")
      return (
        <span className="inline-flex items-center rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-semibold text-yellow-400">
          ⏳ Pending
        </span>
      );
    return (
      <span className="inline-flex items-center rounded-full bg-destructive/20 px-2 py-0.5 text-xs font-semibold text-destructive">
        ❌ Unpaid
      </span>
    );
  }

  return (
    <>
      {notifyApp && (
        <NotifyModal
          app={notifyApp}
          onClose={() => setNotifyApp(null)}
          resendKey={resendKey}
          senderEmail={senderEmail}
          paymentUrl={paymentUrl}
        />
      )}
      {showBulk && (
        <BulkEmailModal
          applications={applications}
          onClose={() => setShowBulk(false)}
          resendKey={resendKey}
          senderEmail={senderEmail}
          paymentUrl={paymentUrl}
        />
      )}

      <Sheet open={showSettings} onOpenChange={setShowSettings}>
        <SheetContent className="w-full sm:max-w-md bg-card border-border overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-xl font-bold flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" /> Admin Settings
            </SheetTitle>
            <SheetDescription className="text-muted-foreground text-xs">
              Configure parameters for email blasting and student payment confirmations. Settings are saved in your local browser.
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              saveSettings(
                fd.get("resend_key") as string,
                fd.get("sender_email") as string,
                fd.get("payment_url") as string,
              );
              setShowSettings(false);
            }}
            className="space-y-5"
          >
            <div className="space-y-1.5">
              <Label htmlFor="resend_key">Resend API Key</Label>
              <Input
                id="resend_key"
                name="resend_key"
                type="password"
                defaultValue={resendKey}
                placeholder="re_xxxxxxxxxxxxxxxxxxxx"
              />
              <p className="text-[10px] text-muted-foreground">
                Retrieve your key from{" "}
                <a
                  href="https://resend.com/api-keys"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-primary underline"
                >
                  resend.com/api-keys
                </a>
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sender_email">Sender Email ("From" Address)</Label>
              <Input
                id="sender_email"
                name="sender_email"
                type="email"
                defaultValue={senderEmail}
                placeholder="academy@ugettech.com"
              />
              <p className="text-[10px] text-muted-foreground">
                Must be verified in Resend. E.g., <code>no-reply@uget.com.ng</code>.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="payment_url">Payment Page URL</Label>
              <Input
                id="payment_url"
                name="payment_url"
                type="url"
                defaultValue={paymentUrl}
                placeholder="https://uget-enroll.vercel.app/payment"
              />
              <p className="text-[10px] text-muted-foreground">
                This is the payment confirmation link embedded in email alerts.
              </p>
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold">
                Save Settings
              </Button>
            </div>
          </form>

          {/* Reference Fees */}
          <div className="mt-8 pt-6 border-t border-border/60 text-xs space-y-3">
            <h4 className="font-semibold text-foreground uppercase tracking-wider text-[10px]">Course Fee Schedule</h4>
            <div className="space-y-1.5 rounded-lg border border-border/60 bg-card/45 p-3 leading-relaxed">
              {Object.entries(COURSE_FEES).slice(0, 12).map(([course, fee]) => (
                <div key={course} className="flex justify-between text-muted-foreground">
                  <span>{course}</span>
                  <span className="font-mono font-semibold text-foreground">{fmt(fee)}</span>
                </div>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <div className="container mx-auto py-6 sm:py-10 px-4 max-w-[95vw]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Uget Academy — Admin</h1>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Button
              onClick={() => setShowBulk(true)}
              className="bg-primary text-primary-foreground flex-1 sm:flex-none"
            >
              📧 Send Payment Emails
            </Button>
            <Button
              onClick={downloadCSV}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              Export CSV
            </Button>
            <Button
              onClick={() => setShowSettings(true)}
              variant="outline"
              size="icon"
              title="Settings"
              className="flex-1 sm:flex-none h-10 w-10"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              onClick={onLogout}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* Search & Sort Panel */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center bg-card/45 border border-border/60 rounded-xl p-4 backdrop-blur-sm shadow-sm">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, email, phone, course, reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-10 bg-background/40 border-border/80 focus-visible:ring-primary text-sm rounded-lg"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto shrink-0">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              Showing <strong className="text-foreground">{filteredAndSortedApplications.length}</strong> of <strong className="text-foreground">{applications.length}</strong> applications
            </span>
            
            <div className="flex items-center gap-2">
              <label htmlFor="sort-by" className="text-xs text-muted-foreground whitespace-nowrap">Sort by:</label>
              <select
                id="sort-by"
                value={`${sortField}-${sortDirection}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split("-");
                  setSortField(field);
                  setSortDirection(direction as "asc" | "desc");
                }}
                className="h-10 bg-background/50 border border-border/80 rounded-lg px-3 py-1 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary text-foreground transition-colors cursor-pointer hover:bg-background/80"
              >
                <option value="created_at-desc">Date (Newest)</option>
                <option value="created_at-asc">Date (Oldest)</option>
                <option value="full_name-asc">Name (A-Z)</option>
                <option value="full_name-desc">Name (Z-A)</option>
                <option value="track-asc">Track (A-Z)</option>
                <option value="payment_status-asc">Status (Unpaid First)</option>
                <option value="payment_status-desc">Status (Paid First)</option>
              </select>
            </div>
          </div>
        </div>

        <Tabs defaultValue="payments" className="w-full">
          <TabsList className="mb-4 flex-wrap h-auto gap-1">
            <TabsTrigger value="payments">
              Payments ({paid.length + pending.length}/{applications.length})
            </TabsTrigger>
            <TabsTrigger value="applications">
              All Applications ({applications.length})
            </TabsTrigger>
            <TabsTrigger value="referrers">Referrers ({referrals.length})</TabsTrigger>
          </TabsList>

          {/* ── PAYMENTS TAB ─────────────────────────────────────────────── */}
          <TabsContent value="payments" className="space-y-6">
            {/* Summary cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Paid", count: paid.length, color: "text-primary", bg: "bg-primary/10 border-primary/30" },
                { label: "Pending Verification", count: pending.length, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
                { label: "Unpaid", count: unpaid.length, color: "text-destructive", bg: "bg-destructive/10 border-destructive/30" },
              ].map((s) => (
                <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
                  <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Paid / Pending & Unpaid lists */}
            {[
              {
                id: "paid-pending",
                title: "✅ Paid / Pending Verification",
                rows: filteredAndSortedApplications.filter(
                  (a) => a.payment_status === "Paid" || a.payment_status === "Pending Verification"
                ),
                showDetails: true,
              },
              {
                id: "unpaid",
                title: "❌ Unpaid",
                rows: filteredAndSortedApplications.filter(
                  (a) => !a.payment_status || a.payment_status === "Unpaid"
                ),
                showDetails: false,
              },
            ].map((group) => {
              if (group.rows.length === 0) return null;
              return (
                <div key={group.id} className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    {group.title} ({group.rows.length})
                  </h3>
                  <div className="border rounded-lg overflow-x-auto shadow-sm">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {renderSortableHeader("full_name", "Name")}
                          {renderSortableHeader("email", "Email")}
                          {renderSortableHeader("track", "Course")}
                          {renderSortableHeader("fee", "Fee")}
                          {renderSortableHeader("payment_status", "Status")}
                          {group.showDetails && (
                            <>
                              {renderSortableHeader("payment_sender", "Sender Name")}
                              {renderSortableHeader("payment_ref", "Reference")}
                              {renderSortableHeader("payment_date", "Date")}
                              {renderSortableHeader("payment_amount", "Amount Paid")}
                            </>
                          )}
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.rows.map((app, i) => {
                          const fee = COURSE_FEES[app.track] ?? 0;
                          return (
                            <TableRow key={i}>
                              <TableCell className="font-medium whitespace-nowrap">
                                {app.full_name}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">{app.email}</TableCell>
                              <TableCell className="whitespace-nowrap">{app.track}</TableCell>
                              <TableCell className="font-semibold text-primary whitespace-nowrap">
                                {fee > 0 ? fmt(fee) : "—"}
                              </TableCell>
                              <TableCell>
                                <PaymentBadge status={app.payment_status} />
                              </TableCell>
                              {group.showDetails && (
                                <>
                                  <TableCell className="whitespace-nowrap">{app.payment_sender ?? "—"}</TableCell>
                                  <TableCell className="whitespace-nowrap">{app.payment_ref ?? "—"}</TableCell>
                                  <TableCell className="whitespace-nowrap">{app.payment_date ?? "—"}</TableCell>
                                  <TableCell className="whitespace-nowrap">
                                    {app.payment_amount ? fmt(app.payment_amount) : "—"}
                                  </TableCell>
                                </>
                              )}
                              <TableCell>
                                <div className="flex gap-1 flex-wrap">
                                  {app.payment_status !== "Paid" && (
                                    <Button
                                      size="sm"
                                      className="bg-primary/20 text-primary hover:bg-primary/30 border-0 text-xs"
                                      onClick={() => updatePaymentStatus(app.id, "Paid")}
                                    >
                                      Mark Paid
                                    </Button>
                                  )}
                                  {app.payment_status === "Paid" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-xs"
                                      onClick={() => updatePaymentStatus(app.id, "Unpaid")}
                                    >
                                      Mark Unpaid
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs"
                                    onClick={() => setNotifyApp(app)}
                                  >
                                    Notify
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="text-center py-8 text-muted-foreground">Loading…</div>
            )}
          </TabsContent>

          {/* ── ALL APPLICATIONS TAB ──────────────────────────────────────── */}
          <TabsContent value="applications" className="border rounded-lg shadow-sm">
            <div className="overflow-x-auto whitespace-nowrap">
              <Table>
                <TableHeader>
                  <TableRow>
                    {renderSortableHeader("created_at", "Date")}
                    {renderSortableHeader("track", "Track")}
                    {renderSortableHeader("full_name", "Full Name")}
                    {renderSortableHeader("email", "Email")}
                    {renderSortableHeader("phone", "Phone")}
                    {renderSortableHeader("gender", "Gender")}
                    {renderSortableHeader("date_of_birth", "DOB")}
                    {renderSortableHeader("state_region", "State/Region")}
                    {renderSortableHeader("country", "Country")}
                    {renderSortableHeader("highest_qualification", "Highest Qual.")}
                    {renderSortableHeader("institution", "Institution")}
                    {renderSortableHeader("course_of_study", "Course of Study")}
                    {renderSortableHeader("current_status", "Current Status")}
                    {renderSortableHeader("studied_before", "Studied Before")}
                    {renderSortableHeader("experience_level", "Exp. Level")}
                    {renderSortableHeader("has_computer", "Has Computer")}
                    {renderSortableHeader("has_internet", "Has Internet")}
                    {renderSortableHeader("can_commit", "Can Commit")}
                    {renderSortableHeader("heard_from", "Heard From")}
                    {renderSortableHeader("referral_code", "Referral Code")}
                    {renderSortableHeader("signature", "Signature")}
                    {renderSortableHeader("agreed_to_terms", "Agreed to Terms")}
                    {renderSortableHeader("payment_status", "Payment Status")}
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={24} className="text-center py-4">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredAndSortedApplications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={24} className="text-center py-4">
                        No applications found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSortedApplications.map((app, i) => (
                      <Fragment key={app.id || i}>
                        <TableRow
                          onClick={() => toggleRow(app.id)}
                          className="cursor-pointer hover:bg-muted/40 transition-colors"
                        >
                          <TableCell>
                            {new Date(app.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{app.track}</TableCell>
                          <TableCell className="font-medium flex items-center gap-1">
                            {expandedRows[app.id] ? (
                              <ChevronUp className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            )}
                            {app.full_name}
                          </TableCell>
                          <TableCell>{app.email}</TableCell>
                          <TableCell>{app.phone}</TableCell>
                          <TableCell>{app.gender}</TableCell>
                          <TableCell>{app.date_of_birth || "—"}</TableCell>
                          <TableCell>{app.state_region}</TableCell>
                          <TableCell>{app.country}</TableCell>
                          <TableCell>{app.highest_qualification}</TableCell>
                          <TableCell>{app.institution || "—"}</TableCell>
                          <TableCell>{app.course_of_study || "—"}</TableCell>
                          <TableCell>{app.current_status}</TableCell>
                          <TableCell>{app.studied_before ? "Yes" : "No"}</TableCell>
                          <TableCell>{app.experience_level}</TableCell>
                          <TableCell>{app.has_computer ? "Yes" : "No"}</TableCell>
                          <TableCell>{app.has_internet ? "Yes" : "No"}</TableCell>
                          <TableCell>{app.can_commit ? "Yes" : "No"}</TableCell>
                          <TableCell>{app.heard_from}</TableCell>
                          <TableCell>{app.referral_code || "—"}</TableCell>
                          <TableCell>{app.signature}</TableCell>
                          <TableCell>{app.agreed_to_terms ? "Yes" : "No"}</TableCell>
                          <TableCell>
                            <PaymentBadge status={app.payment_status} />
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <div className="flex gap-1.5 items-center">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs whitespace-nowrap"
                                onClick={() => setNotifyApp(app)}
                              >
                                Notify
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleRow(app.id)}
                                className="text-xs text-muted-foreground p-1 h-8 w-8"
                              >
                                {expandedRows[app.id] ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>

                        {expandedRows[app.id] && (
                          <TableRow className="bg-muted/10 border-b border-border/80" onClick={(e) => e.stopPropagation()}>
                            <TableCell colSpan={24} className="p-4">
                              <div className="max-w-3xl rounded-xl border border-border bg-card/65 p-4 space-y-4 shadow-inner">
                                <h4 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                  Payment Verification Details
                                </h4>
                                <div className="grid gap-4 sm:grid-cols-4">
                                  <div>
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Sender Name</div>
                                    <div className="text-sm font-semibold">{app.payment_sender ?? "—"}</div>
                                  </div>
                                  <div>
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Reference</div>
                                    <div className="text-sm font-semibold font-mono text-primary/95">{app.payment_ref ?? "—"}</div>
                                  </div>
                                  <div>
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Date Paid</div>
                                    <div className="text-sm font-semibold">{app.payment_date ?? "—"}</div>
                                  </div>
                                  <div>
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Amount Paid</div>
                                    <div className="text-sm font-bold text-primary">
                                      {app.payment_amount ? fmt(app.payment_amount) : "—"}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                  {app.payment_status !== "Paid" && (
                                    <Button
                                      size="sm"
                                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs px-4"
                                      onClick={() => updatePaymentStatus(app.id, "Paid")}
                                    >
                                      ✓ Mark as Paid
                                    </Button>
                                  )}
                                  {app.payment_status !== "Unpaid" && app.payment_status !== null && (
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="font-semibold text-xs px-4"
                                      onClick={() => updatePaymentStatus(app.id, "Unpaid")}
                                    >
                                      ✕ Mark as Unpaid
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs px-4"
                                    onClick={() => setNotifyApp(app)}
                                  >
                                    Notify Student
                                  </Button>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* ── REFERRERS TAB ────────────────────────────────────────────── */}
          <TabsContent
            value="referrers"
            className="border rounded-lg shadow-sm p-6 space-y-6"
          >
            <div className="max-w-md space-y-4">
              <h2 className="text-xl font-semibold">Generate New Referral Code</h2>
              <form onSubmit={generateReferral} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="refname">Referrer Name</Label>
                  <Input
                    id="refname"
                    placeholder="e.g. John Doe"
                    value={refName}
                    onChange={(e) => setRefName(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit">Generate Code</Button>
              </form>
              {refCode && (
                <div className="p-4 bg-primary/10 rounded-lg mt-4 border border-primary/20">
                  <p className="text-sm font-medium text-primary mb-1">Generated Code:</p>
                  <p className="text-2xl font-mono">{refCode}</p>
                </div>
              )}
            </div>

            <div className="pt-6 border-t">
              <h2 className="text-xl font-semibold mb-4">Existing Referrers</h2>
              <div className="overflow-x-auto whitespace-nowrap">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date Created</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referrals.map((ref, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          {new Date(ref.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{ref.referrer_name}</TableCell>
                        <TableCell className="font-mono">{ref.code}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteReferral(ref.id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {referrals.length === 0 && !loading && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          No referrers generated yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </>
  );
}
