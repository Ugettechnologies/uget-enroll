import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import logo from "@/assets/uget-logo.png";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/payment")({
  head: () => ({
    meta: [
      { title: "Complete Your Enrollment — Uget Academy" },
      {
        name: "description",
        content:
          "Confirm your course fee payment to secure your spot in the Uget Academy Tech Scholarship Cohort.",
      },
    ],
  }),
  component: PaymentPage,
});

// ─── Fee schedule (admin-only reference — NOT rendered to students) ──────────
export const COURSE_FEES: Record<string, number> = {
  // Canonical database track names
  "Full-Stack Development": 30000,
  "Cybersecurity": 20000,
  "Virtual Assistance": 10000,
  "AI Automation & Data Annotation": 15000,
  "Frontend Development": 15000,
  "Backend Development": 15000,
  "UI/UX Design": 15000,
  "Graphic Design": 10000,
  "Data Analysis": 10000,
  "Content & Technical Writing": 10000,
  "Professional Video Editing": 10000,
  "Printing Technology": 10000,

  // Table aliases / spelling variations
  "Full Stack Development": 30000,
  "Virtual Assistant": 10000,
  "AI Automation/Annotation": 15000,
  "Graphics Design": 10000,
  "Content/Technical Writing": 10000,
  "Graphics Printing": 10000,
};

export function fmt(n: number) {
  return `\u20a6${n.toLocaleString("en-NG")}`;
}

type LookupStatus = "idle" | "loading" | "found" | "not_found";
type SubmitStatus = "idle" | "submitting" | "success" | "error";

interface Applicant {
  id: string;
  full_name: string;
  email: string;
  track: string;
  payment_status: string | null;
}

const inputCls =
  "w-full rounded-lg border border-border bg-input px-3.5 py-2.5 text-sm text-foreground outline-none transition-all duration-200 focus:border-ring focus:ring-2 focus:ring-ring/30 focus:bg-input/80 placeholder:text-muted-foreground hover:border-border/80";

function PaymentPage() {
  const [email, setEmail] = useState("");
  const [lookupStatus, setLookupStatus] = useState<LookupStatus>("idle");
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [submitError, setSubmitError] = useState("");
  const [copied, setCopied] = useState(false);

  const fee = applicant ? (COURSE_FEES[applicant.track] ?? 0) : 0;
  const alreadyPaid =
    applicant?.payment_status === "Paid" ||
    applicant?.payment_status === "Pending Verification";

  async function handleLookup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLookupStatus("loading");
    setApplicant(null);

    if (!supabase) {
      setLookupStatus("not_found");
      return;
    }

    const { data } = await supabase
      .from("scholarship_applications")
      .select("id, full_name, email, track, payment_status")
      .ilike("email", email.trim())
      .maybeSingle();

    if (data) {
      setApplicant(data as Applicant);
      setLookupStatus("found");
    } else {
      setLookupStatus("not_found");
    }
  }

  async function handleConfirm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!applicant || !supabase) return;

    const fd = new FormData(e.currentTarget);
    const payload = {
      payment_status: "Pending Verification",
      payment_sender: fd.get("sender_name") as string,
      payment_amount: Number(fd.get("amount_paid")),
      payment_date: fd.get("payment_date") as string,
      payment_ref: fd.get("transaction_ref") as string,
    };

    setSubmitStatus("submitting");
    setSubmitError("");

    const { error } = await supabase
      .from("scholarship_applications")
      .update(payload)
      .eq("id", applicant.id);

    if (error) {
      setSubmitStatus("error");
      setSubmitError(error.message);
    } else {
      setSubmitStatus("success");
      setApplicant((a) => a && { ...a, payment_status: "Pending Verification" });
    }
  }

  function copyAccountNumber() {
    navigator.clipboard.writeText("6743620799").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const whatsappText = applicant
    ? encodeURIComponent(
        `Hello Uget Academy,\n\nI have made the course fee payment for my enrollment.\n\nName: ${applicant.full_name}\nEmail: ${applicant.email}\nCourse: ${applicant.track}\nAmount: ${fmt(fee)}\n\nPlease confirm my payment. Thank you.`,
      )
    : "";

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "var(--gradient-hero)" }}>
      {/* Background orbs */}
      <div
        className="pointer-events-none fixed -top-32 -left-32 h-96 w-96 rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--gradient-brand)" }}
      />
      <div
        className="pointer-events-none fixed -bottom-40 -right-20 h-[28rem] w-[28rem] rounded-full opacity-15 blur-3xl"
        style={{ background: "radial-gradient(circle, oklch(0.62 0.22 295), transparent 70%)" }}
      />
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* Header */}
      <header className="relative border-b border-border/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-6 py-4">
          <img src={logo} alt="Uget Technologies" className="h-10 w-10 rounded-xl shadow-lg" />
          <div>
            <div className="text-sm font-bold tracking-wide">UGET TECHNOLOGIES</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
              Academy Enrollment
            </div>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-2xl px-6 py-14">
        {/* Title */}
        <div className="mb-10 text-center animate-fade-in">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary mb-3">
            Secure Your Spot
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Complete Your{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-brand)" }}
            >
              Enrollment
            </span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-sm mx-auto">
            Enter your registered email to see your course fee, then confirm your bank transfer below.
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-3.5 py-1 text-[11px] font-medium text-yellow-400 border border-yellow-500/20">
            ⏳ Please complete your payment before the cohort deadline to secure your slot.
          </div>
        </div>

        {/* Bank Details Card */}
        <div
          className="mb-8 rounded-2xl border border-border/60 p-6 animate-fade-in"
          style={{ background: "oklch(0.21 0.06 280 / 0.7)", backdropFilter: "blur(12px)" }}
        >
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Bank Transfer Details
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Bank</div>
              <div className="text-sm font-semibold">Moniepoint</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                Account Name
              </div>
              <div className="text-sm font-semibold">Uget Technologies</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                Account Number
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-lg font-mono font-bold tracking-widest"
                  style={{ color: "oklch(0.74 0.16 285)" }}
                >
                  6743620799
                </span>
                <button
                  type="button"
                  onClick={copyAccountNumber}
                  title="Copy account number"
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 bg-card/60 text-muted-foreground transition-all hover:border-primary/50 hover:text-primary hover:scale-110"
                >
                  {copied ? (
                    <svg
                      className="h-3.5 w-3.5 text-primary"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg
                      className="h-3.5 w-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  )}
                </button>
              </div>
              {copied && (
                <p className="text-[10px] text-primary mt-0.5 animate-fade-in">Copied!</p>
              )}
            </div>
          </div>
        </div>

        {/* Step 1 — Email Lookup */}
        {submitStatus !== "success" && (
          <div
            className="rounded-2xl border border-border/60 p-6 sm:p-8 mb-6 animate-fade-in"
            style={{ background: "oklch(0.21 0.06 280 / 0.7)", backdropFilter: "blur(12px)" }}
          >
            <h2 className="text-lg font-semibold mb-1">Find Your Enrollment</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Enter the email address you used when you registered.
            </p>
            <form onSubmit={handleLookup} className="flex gap-3 flex-col sm:flex-row">
              <input
                type="email"
                required
                placeholder="yourname@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (lookupStatus !== "idle") {
                    setLookupStatus("idle");
                    setApplicant(null);
                    setSubmitStatus("idle");
                  }
                }}
                className={inputCls + " flex-1"}
              />
              <button
                type="submit"
                disabled={lookupStatus === "loading"}
                className="rounded-full px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:scale-[1.02] hover:shadow-[var(--shadow-glow)] disabled:opacity-60 shrink-0"
                style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow)" }}
              >
                {lookupStatus === "loading" ? "Searching…" : "Find My Record"}
              </button>
            </form>

            {lookupStatus === "not_found" && (
              <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm animate-fade-in">
                No registration found for <strong>{email}</strong>. Please use the exact email you
                registered with.
              </div>
            )}

            {lookupStatus === "found" && applicant && (
              <div className="mt-5 animate-fade-in">
                <div
                  className="rounded-xl border border-primary/30 p-4"
                  style={{ background: "oklch(0.74 0.16 285 / 0.08)" }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-primary-foreground text-sm font-bold"
                      style={{ background: "var(--gradient-brand)" }}
                    >
                      {applicant.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold">Welcome back, {applicant.full_name} 👋</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{applicant.email}</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-border/60 bg-card/40 px-3 py-2">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Course
                      </div>
                      <div className="text-sm font-semibold mt-0.5">{applicant.track}</div>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-card/40 px-3 py-2">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Amount Due
                      </div>
                      <div
                        className="text-lg font-bold mt-0.5"
                        style={{ color: "oklch(0.74 0.16 285)" }}
                      >
                        {fee > 0 ? fmt(fee) : "Contact admin"}
                      </div>
                    </div>
                  </div>
                  {(applicant.payment_status === "Paid" ||
                    applicant.payment_status === "Pending Verification") && (
                    <div className="mt-3 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary font-medium">
                      {applicant.payment_status === "Paid"
                        ? "✅ Your payment has been verified. You're enrolled!"
                        : "⏳ Payment details received — our team is verifying within 24–48 hours."}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2 — Payment Confirmation Form */}
        {lookupStatus === "found" && applicant && !alreadyPaid && submitStatus !== "success" && (
          <div
            className="rounded-2xl border border-border/60 p-6 sm:p-8 animate-fade-in"
            style={{ background: "oklch(0.21 0.06 280 / 0.7)", backdropFilter: "blur(12px)" }}
          >
            <h2 className="text-lg font-semibold mb-1">Confirm Your Payment</h2>
            <p className="text-sm text-muted-foreground mb-6">
              After transferring <strong>{fmt(fee)}</strong> to the account above, fill in the details
              below so we can verify your payment.
            </p>
            <form onSubmit={handleConfirm} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-foreground/90 mb-1.5">
                  Sender Name <span className="text-accent">*</span>
                  <span className="text-muted-foreground font-normal ml-1">
                    (name on your bank account)
                  </span>
                </label>
                <input
                  name="sender_name"
                  required
                  placeholder="e.g. Amaka Okafor"
                  className={inputCls}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-foreground/90 mb-1.5">
                    Amount Paid <span className="text-accent">*</span>
                  </label>
                  <input
                    name="amount_paid"
                    type="number"
                    required
                    defaultValue={fee}
                    min={1}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground/90 mb-1.5">
                    Payment Date <span className="text-accent">*</span>
                  </label>
                  <input
                    name="payment_date"
                    type="date"
                    required
                    defaultValue={new Date().toISOString().split("T")[0]}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground/90 mb-1.5">
                  Transaction Reference / Description
                  <span className="text-muted-foreground font-normal ml-1">
                    (optional but helpful)
                  </span>
                </label>
                <input
                  name="transaction_ref"
                  placeholder="e.g. TXN123456 or transfer narration"
                  className={inputCls}
                />
              </div>

              {submitStatus === "error" && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm animate-fade-in">
                  {submitError}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <button
                  type="submit"
                  disabled={submitStatus === "submitting"}
                  className="flex-1 rounded-full py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:scale-[1.02] hover:shadow-[var(--shadow-glow)] disabled:opacity-60"
                  style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow)" }}
                >
                  {submitStatus === "submitting" ? "Submitting…" : "Submit Payment Details"}
                </button>
                <a
                  href={`https://wa.me/2347043620799?text=${whatsappText}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex-1 flex items-center justify-center gap-2 rounded-full border border-border bg-card/60 py-3 text-sm font-semibold transition-all hover:border-primary/50 hover:bg-card"
                >
                  <svg className="h-4 w-4 text-green-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Confirm via WhatsApp
                </a>
              </div>
            </form>
          </div>
        )}

        {/* Success State */}
        {submitStatus === "success" && (
          <div
            className="rounded-2xl border border-primary/40 p-8 text-center animate-scale-in"
            style={{ background: "oklch(0.74 0.16 285 / 0.1)", backdropFilter: "blur(12px)" }}
          >
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow)" }}
            >
              <svg
                className="h-8 w-8 text-primary-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Payment Details Received!</h2>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Thank you,{" "}
              <strong className="text-foreground">{applicant?.full_name}</strong>. Our team will
              verify your payment within{" "}
              <strong className="text-foreground">24–48 hours</strong> and you'll receive your
              enrollment confirmation.
            </p>
            <a
              href={`https://wa.me/2347043620799?text=${whatsappText}`}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-5 py-2.5 text-sm font-medium transition-all hover:border-primary/50"
            >
              <svg className="h-4 w-4 text-green-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Also Notify Us on WhatsApp
            </a>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-10">
        <div className="mx-auto max-w-4xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Uget Technologies. All rights reserved.</p>
          <p>Having trouble? Contact us on WhatsApp.</p>
        </div>
      </footer>
    </div>
  );
}
