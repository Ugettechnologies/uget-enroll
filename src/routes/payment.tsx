import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
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
  return `\u20a6${n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function fmtUsd(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function getFeeDetails(track: string) {
  const baseNgn = COURSE_FEES[track] ?? 10000;
  
  // Calculate USD equivalent base fee (10% fee)
  let baseUsd = 10;
  if (baseNgn === 15000) baseUsd = 15;
  else if (baseNgn === 20000) baseUsd = 20;
  else if (baseNgn === 30000) baseUsd = 30;

  return {
    ngn: {
      base: baseNgn,
      full: baseNgn * 10,
      scholarship: baseNgn * 9,
      tax: baseNgn * 0.05,
      total: baseNgn * 1.05,
    },
    usd: {
      base: baseUsd,
      full: baseUsd * 10,
      scholarship: baseUsd * 9,
      tax: baseUsd * 0.05,
      total: baseUsd * 1.05,
    }
  };
}


type LookupStatus = "idle" | "loading" | "found" | "not_found";
type SubmitStatus = "idle" | "submitting" | "success" | "error";

interface Applicant {
  id: string;
  full_name: string;
  email: string;
  track: string;
  country?: string;
  phone?: string;
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
  const [currency, setCurrency] = useState<"NGN" | "OTHER_AFRICA" | "USD">("NGN");

  useEffect(() => {
    if (applicant) {
      const countryLower = (applicant.country || "").trim().toLowerCase();
      if (!countryLower || countryLower.includes("nigeria")) {
        setCurrency("NGN");
      } else if (
        countryLower.includes("ghana") ||
        countryLower.includes("kenya") ||
        countryLower.includes("south africa") ||
        countryLower.includes("rwanda") ||
        countryLower.includes("cameroon") ||
        countryLower.includes("uganda") ||
        countryLower.includes("liberia") ||
        countryLower.includes("zambia") ||
        countryLower.includes("zimbabwe") ||
        countryLower.includes("malawi") ||
        countryLower.includes("sierra leone") ||
        countryLower.includes("gambia") ||
        countryLower.includes("tanzania") ||
        countryLower.includes("egypt") ||
        countryLower.includes("morocco") ||
        countryLower.includes("tunisia") ||
        countryLower.includes("ethiopia") ||
        countryLower.includes("senegal") ||
        countryLower.includes("ivory coast") ||
        countryLower.includes("cote d'ivoire") ||
        countryLower.includes("africa")
      ) {
        setCurrency("OTHER_AFRICA");
      } else {
        setCurrency("USD");
      }
    }
  }, [applicant]);

  const feeDetails = applicant ? getFeeDetails(applicant.track) : null;
  const alreadyPaid =
    applicant?.payment_status === "Paid" ||
    applicant?.payment_status === "Pending Verification";

  async function performLookup(emailVal: string) {
    if (!emailVal.trim()) return;
    setLookupStatus("loading");
    setApplicant(null);

    if (!supabase) {
      setLookupStatus("not_found");
      return;
    }

    const { data } = await supabase
      .from("scholarship_applications")
      .select("id, full_name, email, track, country, phone, payments(payment_status)")
      .ilike("email", emailVal.trim())
      .maybeSingle();

    if (data) {
      const p = Array.isArray(data.payments) ? data.payments[0] : (data.payments as any);
      setApplicant({
        id: data.id,
        full_name: data.full_name,
        email: data.email,
        track: data.track,
        country: data.country || "Nigeria",
        phone: data.phone || "",
        payment_status: p?.payment_status || "Unpaid",
      });
      setLookupStatus("found");
    } else {
      setLookupStatus("not_found");
    }
  }

  async function handleLookup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await performLookup(email);
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get("email");
      if (emailParam) {
        const decodedEmail = decodeURIComponent(emailParam).trim();
        setEmail(decodedEmail);
        performLookup(decodedEmail);
      }
    }
  }, []);

  async function handleConfirm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!applicant || !supabase || !feeDetails) return;

    const fd = new FormData(e.currentTarget);
    const payload = {
      application_id: applicant.id,
      payment_status: "Pending Verification",
      payment_sender: fd.get("sender_name") as string,
      payment_amount: Number(fd.get("amount_paid")),
      payment_date: fd.get("payment_date") as string,
      payment_ref: fd.get("transaction_ref") as string,
    };

    setSubmitStatus("submitting");
    setSubmitError("");

    const { error } = await supabase
      .from("payments")
      .upsert(payload, { onConflict: "application_id" });

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

  const whatsappText = applicant && feeDetails
    ? encodeURIComponent(
        `Hello Uget Academy,\n\nI have made the course commitment fee payment for my enrollment.\n\nName: ${applicant.full_name}\nEmail: ${applicant.email}\nCourse: ${applicant.track}\nAmount: ${fmt(feeDetails.ngn.total)} (Tax Inclusive)\n\nPlease confirm my payment. Thank you.`,
      )
    : "";

  const selectCls =
    "w-full rounded-lg border border-border bg-input px-3.5 py-2.5 text-sm text-foreground outline-none transition-all duration-200 focus:border-ring focus:ring-2 focus:ring-ring/30 focus:bg-input/80 hover:border-border/80 appearance-none cursor-pointer";

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
            Find your enrollment record, select your currency, and validate your scholarship.
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-3.5 py-1 text-[11px] font-medium text-yellow-400 border border-yellow-500/20">
            ⏳ Please complete your payment before the cohort deadline to secure your slot.
          </div>
        </div>

        {/* Step 1 — Email Lookup */}
        {lookupStatus !== "found" && submitStatus !== "success" && (
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
          </div>
        )}

        {/* Redesigned Premium Form for Found Student */}
        {lookupStatus === "found" && applicant && submitStatus !== "success" && (
          <div className="space-y-6">
            {/* Step 2 — Enrollment Form in Image 4 Style */}
            <div
              className="rounded-2xl border border-border/60 p-6 sm:p-8 animate-fade-in shadow-xl"
              style={{ background: "oklch(0.21 0.06 280 / 0.7)", backdropFilter: "blur(12px)" }}
            >
              <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-6">
                <h2 className="text-lg font-bold tracking-tight">Claim Your Scholarship</h2>
                <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  Selected Candidate
                </div>
              </div>

              {alreadyPaid ? (
                <div className="rounded-xl border border-primary/30 p-5 space-y-4" style={{ background: "oklch(0.74 0.16 285 / 0.08)" }}>
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-primary-foreground text-sm font-bold shadow-md"
                      style={{ background: "var(--gradient-brand)" }}
                    >
                      {applicant.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-base">{applicant.full_name}</p>
                      <p className="text-xs text-muted-foreground">{applicant.email}</p>
                      <p className="text-xs font-medium text-primary mt-1">Track: {applicant.track}</p>
                    </div>
                  </div>
                  <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary font-semibold text-center">
                    {applicant.payment_status === "Paid"
                      ? "✅ Your payment has been verified. You are successfully enrolled!"
                      : "⏳ Payment details received — our admissions team is verifying your transfer."}
                  </div>
                  <div className="text-center pt-2">
                    <button 
                      onClick={() => {
                        setApplicant(null);
                        setLookupStatus("idle");
                        setEmail("");
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
                    >
                      Search for another email
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/80">
                      Full Name
                    </label>
                    <input
                      className={inputCls + " opacity-80 cursor-not-allowed"}
                      value={applicant.full_name}
                      readOnly
                      disabled
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/80">
                      Email Address
                    </label>
                    <input
                      className={inputCls + " opacity-80 cursor-not-allowed"}
                      value={applicant.email}
                      readOnly
                      disabled
                    />
                  </div>

                  {/* Whatsapp Phone */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/80">
                      WhatsApp Number
                    </label>
                    <input
                      className={inputCls + " opacity-80 cursor-not-allowed"}
                      value={applicant.phone}
                      readOnly
                      disabled
                    />
                  </div>

                  {/* Track Info */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/80">
                      Selected Track
                    </label>
                    <input
                      className={inputCls + " opacity-80 cursor-not-allowed font-medium text-primary"}
                      value={applicant.track}
                      readOnly
                      disabled
                    />
                  </div>

                  {/* Currency Selector */}
                  <div className="space-y-1.5 relative">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/80">
                      Currency <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <select
                        className={selectCls}
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as any)}
                      >
                        <option value="NGN">Nigerian Naira (NGN - ₦)</option>
                        <option value="OTHER_AFRICA">Other African Countries (Mobile Money)</option>
                        <option value="USD">International (USD - $)</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                        <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Price Container (Image 4 design) */}
                  {feeDetails && (
                    <div className="rounded-xl border border-border bg-card/30 p-5 mt-6 space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Scholarship Pricing Breakdown (12-Week Bootcamp)
                      </div>
                      
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-muted-foreground">Full Tuition (100%):</span>
                        <span className="text-xs font-semibold text-muted-foreground line-through">
                          {currency === "USD" ? fmtUsd(feeDetails.usd.full) : fmt(feeDetails.ngn.full)}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between border-b border-border/30 pb-2">
                        <span className="text-xs text-muted-foreground">Scholarship (90% off):</span>
                        <span className="text-xs font-semibold text-green-400">
                          -{currency === "USD" ? fmtUsd(feeDetails.usd.scholarship) : fmt(feeDetails.ngn.scholarship)}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between pt-1">
                        <div>
                          <div className="text-xs font-medium text-foreground">Commitment Fee (10%):</div>
                          <div className="text-[10px] text-muted-foreground">5% Tax/VAT Inclusive</div>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-extrabold text-foreground tracking-tight">
                            {currency === "USD" ? fmtUsd(feeDetails.usd.total) : fmt(feeDetails.ngn.total)}
                          </span>
                          <span className="text-xs text-muted-foreground line-through">
                            {currency === "USD" ? fmtUsd(feeDetails.usd.full) : fmt(feeDetails.ngn.full)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ────────────────── Payment Methods based on currency selection ────────────────── */}

                  {/* Option A: NGN Naira (Manual Bank Transfer form) */}
                  {currency === "NGN" && feeDetails && (
                    <div className="pt-4 border-t border-border/40 space-y-6">
                      <div
                        className="rounded-xl border border-primary/30 p-5 space-y-3"
                        style={{ background: "oklch(0.74 0.16 285 / 0.05)" }}
                      >
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
                          🏦 Bank Transfer Details
                        </h3>
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 text-sm">
                          <div>
                            <div className="text-[10px] text-muted-foreground uppercase">Bank</div>
                            <div className="font-semibold">Moniepoint</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-muted-foreground uppercase">Account Name</div>
                            <div className="font-semibold">Uget Technologies</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-muted-foreground uppercase">Account Number</div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-base text-primary tracking-wide">6743620799</span>
                              <button
                                type="button"
                                onClick={copyAccountNumber}
                                className="p-1 rounded hover:bg-card border border-border"
                                title="Copy account number"
                              >
                                {copied ? "✅" : "📋"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Confirm Transfer Details
                        </h3>
                        <form onSubmit={handleConfirm} className="space-y-4">
                          <div>
                            <label className="block text-xs font-medium text-foreground mb-1">
                              Sender Name <span className="text-accent">*</span>
                              <span className="text-muted-foreground font-normal text-[10px] ml-1">
                                (Name on the transfer account)
                              </span>
                            </label>
                            <input
                              name="sender_name"
                              required
                              placeholder="e.g. Favour Okafor"
                              defaultValue={applicant.full_name}
                              className={inputCls}
                            />
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <label className="block text-xs font-medium text-foreground mb-1">
                                Amount Paid (₦) <span className="text-accent">*</span>
                              </label>
                              <input
                                name="amount_paid"
                                type="number"
                                required
                                defaultValue={feeDetails.ngn.total}
                                className={inputCls}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-foreground mb-1">
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
                            <label className="block text-xs font-medium text-foreground mb-1">
                              Transaction Reference / Description
                              <span className="text-muted-foreground font-normal text-[10px] ml-1">
                                (Optional)
                              </span>
                            </label>
                            <input
                              name="transaction_ref"
                              placeholder="Narration or Reference number"
                              className={inputCls}
                            />
                          </div>

                          {submitStatus === "error" && (
                            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-xs text-destructive">
                              {submitError}
                            </div>
                          )}

                          <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <button
                              type="submit"
                              disabled={submitStatus === "submitting"}
                              className="flex-1 rounded-full py-3 text-sm font-semibold text-primary-foreground transition-all hover:scale-[1.01]"
                              style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow)" }}
                            >
                              {submitStatus === "submitting" ? "Submitting…" : "Confirm Payment Details"}
                            </button>
                            <a
                              href={`https://wa.me/2347043620799?text=${whatsappText}`}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="flex-1 flex items-center justify-center gap-2 rounded-full border border-border bg-card/60 py-3 text-sm font-semibold hover:bg-card transition-all"
                            >
                              <svg className="h-4 w-4 text-green-400" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                              </svg>
                              Confirm via WhatsApp
                            </a>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Option B: Other African Countries */}
                  {currency === "OTHER_AFRICA" && (
                    <div className="pt-4 border-t border-border/40 space-y-4">
                      <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-5 space-y-3">
                        <div className="flex items-center gap-2 text-yellow-400">
                          <span className="text-xl">🌍</span>
                          <h3 className="font-semibold text-sm">Other African Countries Payment Options</h3>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          For selected applicants in other African countries (such as Ghana, Kenya, South Africa, Rwanda, Uganda, Cameroon, Liberia, etc.), we support local Mobile Money (MoMo) and bank transfers.
                        </p>
                        <p className="text-xs text-yellow-400/90 font-medium">
                          Please contact our admissions coordinator on WhatsApp to receive the payment details and guidelines for your country.
                        </p>
                      </div>

                      <a
                        href={`https://wa.me/2347043620799?text=${encodeURIComponent(
                          `Hello, I am ${applicant.full_name} and I have been selected for the Tech4Africans Cohort 8 Scholarship (${applicant.track}). I am registering from an African country and would like to receive details to make my commitment fee payment in my local currency/MoMo. My email is ${applicant.email}`
                        )}`}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="w-full flex items-center justify-center gap-2 rounded-full border border-border bg-card/60 py-3.5 text-sm font-semibold hover:border-primary/50 transition-all text-foreground"
                      >
                        <svg className="h-4 w-4 text-green-400" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        👉 Message Admissions Coordinator on WhatsApp
                      </a>
                    </div>
                  )}

                  {/* Option C: International USD */}
                  {currency === "USD" && feeDetails && (
                    <div className="pt-4 border-t border-border/40 space-y-4">
                      <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 space-y-3">
                        <div className="flex items-center gap-2 text-primary">
                          <span className="text-xl">🌐</span>
                          <h3 className="font-semibold text-sm">International USD Payment</h3>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          For international candidates, we offer secure card checkout, bank transfer, and PayPal payment options to pay the commitment fee of <strong>{fmtUsd(feeDetails.usd.total)}</strong>.
                        </p>
                        <p className="text-xs text-primary font-medium">
                          Please contact our international support desk on WhatsApp or email us at support@uget.co to get your payment link.
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <a
                          href={`https://wa.me/2347043620799?text=${encodeURIComponent(
                            `Hello support, I am an international candidate (${applicant.full_name}) selected for the Tech4Africans Cohort 8 Scholarship (${applicant.track}). I would like to receive the USD card payment checkout link. My email is ${applicant.email}`
                          )}`}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="flex-1 flex items-center justify-center gap-2 rounded-full border border-border bg-card/60 py-3 text-sm font-semibold hover:border-primary/50 transition-all text-foreground"
                        >
                          <svg className="h-4 w-4 text-green-400" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                          </svg>
                          Contact via WhatsApp
                        </a>
                        <a
                          href={`mailto:support@uget.co?subject=${encodeURIComponent("International USD Scholarship Payment Inquiry")}&body=${encodeURIComponent(
                            `Hello, I am ${applicant.full_name} and I have been selected for the Tech4Africans Cohort 8 Scholarship (${applicant.track}). I am an international candidate and would like to receive international payment link options. My email is ${applicant.email}`
                          )}`}
                          className="flex-1 flex items-center justify-center gap-2 rounded-full border border-border bg-card/60 py-3 text-sm font-semibold hover:border-primary/50 transition-all text-foreground"
                        >
                          ✉️ Contact via Email
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Reset/Change Email search link */}
                  <div className="text-center pt-4">
                    <button 
                      onClick={() => {
                        setApplicant(null);
                        setLookupStatus("idle");
                        setEmail("");
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
                    >
                      Not your record? Search again
                    </button>
                  </div>
                </div>
              )}
            </div>
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
              Thank you, <strong className="text-foreground">{applicant?.full_name}</strong>. Our admissions team will verify your payment details within <strong className="text-foreground">24–48 hours</strong> and you will receive your official enrollment confirmation email.
            </p>
            {whatsappText && (
              <a
                href={`https://wa.me/2347043620799?text=${whatsappText}`}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-5 py-2.5 text-sm font-medium transition-all hover:border-primary/50"
              >
                <svg className="h-4 w-4 text-green-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Notify Us via WhatsApp
              </a>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-10">
        <div className="mx-auto max-w-4xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Tech4Africans / Uget Technologies. All rights reserved.</p>
          <p>Having trouble? Contact us on WhatsApp.</p>
        </div>
      </footer>
    </div>
  );
}
