import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import logo from "@/assets/uget-logo.png";
import { supabase } from "@/lib/supabase";
import type { StudentBioRecord } from "@/lib/bio-export";
import { payWithPaystack } from "@/lib/paystack";

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

export const UNIFORM_COURSE_FEE = 3000;

export const COURSE_FEES: Record<string, number> = {
  // New courses
  "Customer Representative": 3000,
  "User-Generated Content (UGC)": 3000,
  "User Generated Content": 3000,
  "Project Management": 3000,
  "AI Automation": 3000,

  // Existing tracks
  "Full-Stack Development": 3000,
  "Cybersecurity": 3000,
  "Virtual Assistance": 3000,
  "AI Automation & Data Annotation": 3000,
  "Frontend Development": 3000,
  "Backend Development": 3000,
  "UI/UX Design": 3000,
  "Graphic Design": 3000,
  "Data Analysis": 3000,
  "Content & Technical Writing": 3000,
  "Professional Video Editing": 3000,
  "Printing Technology": 3000,

  // Table aliases / spelling variations
  "Full Stack Development": 3000,
  "Virtual Assistant": 3000,
  "AI Automation/Annotation": 3000,
  "Graphics Design": 3000,
  "Content/Technical Writing": 3000,
  "Graphics Printing": 3000,
};

export function fmt(n: number) {
  return `\u20a6${n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function fmtUsd(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function getFeeDetails(track?: string) {
  return {
    ngn: {
      base: 30000,
      full: 30000,
      scholarship: 27000,
      tax: 0,
      total: 3000,
    },
    usd: {
      base: 30,
      full: 30,
      scholarship: 27,
      tax: 0,
      total: 3,
    },
  };
}

type LookupStatus = "idle" | "loading" | "found" | "not_found";
type SubmitStatus = "idle" | "submitting" | "success" | "error";

interface Applicant extends StudentBioRecord {
  payment_status: string | null;
}

const inputCls =
  "w-full rounded-lg border border-border bg-input px-3.5 py-2.5 text-base sm:text-sm text-foreground outline-none transition-all duration-200 focus:border-ring focus:ring-2 focus:ring-ring/30 focus:bg-input/80 placeholder:text-muted-foreground hover:border-border/80 min-h-[44px]";

function PaymentPage() {
  const [email, setEmail] = useState("");
  const [lookupStatus, setLookupStatus] = useState<LookupStatus>("idle");
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [submitError, setSubmitError] = useState("");
  const [currency, setCurrency] = useState<"NGN" | "OTHER_AFRICA" | "USD">("NGN");
  const [paystackLoading, setPaystackLoading] = useState(false);

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

    if (typeof window !== "undefined") {
      const pendingStr = sessionStorage.getItem("pending_registration");
      if (pendingStr) {
        try {
          const pending = JSON.parse(pendingStr);
          if (pending.email && pending.email.trim().toLowerCase() === emailVal.trim().toLowerCase()) {
            setApplicant({
              id: pending.id,
              full_name: pending.full_name,
              email: pending.email,
              track: pending.track,
              country: pending.country || "Nigeria",
              phone: pending.phone || "",
              payment_status: "Unpaid",
            });
            setLookupStatus("found");
            return;
          }
        } catch (e) {
          console.error("Failed to parse pending registration:", e);
        }
      }
    }

    if (!supabase) {
      setLookupStatus("not_found");
      return;
    }

    const { data } = await supabase
      .from("scholarship_applications")
      .select("*")
      .ilike("email", emailVal.trim())
      .maybeSingle();

    if (data) {
      setApplicant({
        ...data,
        country: data.country || "Nigeria",
        phone: data.phone || "",
        payment_status: data.payment_status || "Unpaid",
      });
      setLookupStatus("found");
    } else {
      setLookupStatus("not_found");
    }
  }

  async function performIdLookup(idVal: string) {
    if (!idVal.trim()) return;
    setLookupStatus("loading");
    setApplicant(null);

    if (idVal.startsWith("temp_") && typeof window !== "undefined") {
      const pendingStr = sessionStorage.getItem("pending_registration");
      if (pendingStr) {
        try {
          const pending = JSON.parse(pendingStr);
          if (pending.id === idVal) {
            setApplicant({
              ...pending,
              country: pending.country || "Nigeria",
              phone: pending.phone || "",
              payment_status: "Unpaid",
            });
            setEmail(pending.email);
            setLookupStatus("found");
            return;
          }
        } catch (e) {
          console.error("Failed to parse pending registration:", e);
        }
      }
    }

    if (!supabase) {
      setLookupStatus("not_found");
      return;
    }

    const { data } = await supabase
      .from("scholarship_applications")
      .select("*")
      .eq("id", idVal.trim())
      .maybeSingle();

    if (data) {
      setApplicant({
        ...data,
        country: data.country || "Nigeria",
        phone: data.phone || "",
        payment_status: data.payment_status || "Unpaid",
      });
      setEmail(data.email);
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
      const idParam = params.get("id") || params.get("token");
      if (idParam) {
        performIdLookup(idParam.trim());
      }
    }
  }, []);


  async function handlePaystackPayment() {
    if (!applicant || !supabase || !feeDetails) return;
    setPaystackLoading(true);
    setSubmitError("");

    const payableAmount = UNIFORM_COURSE_FEE;
    let applicationId = applicant.id;

    try {
      await payWithPaystack({
        email: applicant.email,
        amount: payableAmount,
        currency: "NGN",
        metadata: {
          custom_fields: [
            { display_name: "Full Name", variable_name: "full_name", value: applicant.full_name },
            { display_name: "Track", variable_name: "track", value: applicant.track },
            { display_name: "Cohort", variable_name: "cohort", value: "Cohort 2" },
            { display_name: "Application ID", variable_name: "application_id", value: applicationId },
          ],
        },
        onSuccess: async (response) => {
          const paymentRef = response.reference;
          const today = new Date().toISOString().split("T")[0];

          if (!supabase) {
            setSubmitStatus("error");
            setSubmitError("Database connection is not configured.");
            return;
          }

          if (applicationId.startsWith("temp_")) {
            const pendingStr = sessionStorage.getItem("pending_registration");
            if (pendingStr) {
              try {
                const pending = JSON.parse(pendingStr);
                delete pending.id;
                const { data: inserted } = await supabase
                  .from("scholarship_applications")
                  .insert([
                    {
                      ...pending,
                      cohort: "Cohort 2",
                      payment_status: "Paid",
                      payment_sender: applicant.full_name,
                      payment_amount: payableAmount,
                      payment_date: today,
                      payment_ref: paymentRef,
                    },
                  ])
                  .select()
                  .single();
                if (inserted && inserted.id) {
                  applicationId = inserted.id;
                }
              } catch (_) {}
            }
          } else {
            await supabase
              .from("scholarship_applications")
              .update({
                payment_status: "Paid",
                payment_sender: applicant.full_name,
                payment_amount: payableAmount,
                payment_date: today,
                payment_ref: paymentRef,
              })
              .eq("id", applicationId);
          }

          try {
            await supabase.from("payments").upsert(
              {
                application_id: applicationId,
                payment_status: "Paid",
                payment_sender: applicant.full_name,
                payment_amount: payableAmount,
                payment_date: today,
                payment_ref: paymentRef,
              },
              { onConflict: "application_id" },
            );
          } catch (_) {}

          sessionStorage.removeItem("pending_registration");
          setApplicant((prev) =>
            prev
              ? {
                  ...prev,
                  id: applicationId,
                  payment_status: "Paid",
                  payment_amount: payableAmount,
                  payment_ref: paymentRef,
                  payment_date: today,
                }
              : null,
          );
          setSubmitStatus("success");
          setPaystackLoading(false);
        },
        onClose: () => {
          setPaystackLoading(false);
        },
      });
    } catch (err: any) {
      console.error("Paystack error:", err);
      setSubmitError(err.message || "Could not launch Paystack checkout.");
      setPaystackLoading(false);
    }
  }

  const selectCls =
    "w-full rounded-lg border border-border bg-input px-3.5 py-2.5 text-base sm:text-sm text-foreground outline-none transition-all duration-200 focus:border-ring focus:ring-2 focus:ring-ring/30 focus:bg-input/80 hover:border-border/80 appearance-none cursor-pointer min-h-[44px]";

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

      <main className="relative mx-auto max-w-2xl px-3.5 sm:px-6 py-8 sm:py-14">
        {/* Title */}
        <div className="mb-10 text-center animate-fade-in">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary mb-3">
            Secure Your Spot · Cohort 2
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
            Flat {fmt(UNIFORM_COURSE_FEE)} commitment fee for all tracks. Automated Paystack verification.
          </p>
        </div>

        {/* Step 1 — Email Lookup */}
        {lookupStatus !== "found" && submitStatus !== "success" && (
          <div
            className="rounded-2xl border border-border/60 p-4 sm:p-8 mb-6 animate-fade-in"
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

        {/* Found Student Form */}
        {lookupStatus === "found" && applicant && submitStatus !== "success" && (
          <div className="space-y-6">
            <div
              className="rounded-2xl border border-border/60 p-4 sm:p-8 animate-fade-in shadow-xl"
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
                      : "⏳ Payment details received — our admissions team is verifying your payment."}
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

                  {/* Price Container */}
                  {feeDetails && (
                    <div className="rounded-xl border border-border bg-card/30 p-5 mt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold text-foreground">
                            {applicant.track} · Enrollment Fee
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            Cohort 2 Flat Commitment Fee
                          </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
                          {fmt(UNIFORM_COURSE_FEE)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Methods */}
                  {feeDetails && (
                    <div className="pt-4 border-t border-border/40 space-y-6">
                      {/* Paystack Instant Checkout */}
                      <div
                        className="rounded-2xl border-2 border-primary/50 p-4 sm:p-6 space-y-3 shadow-lg"
                        style={{
                          background:
                            "linear-gradient(135deg, oklch(0.74 0.16 285 / 0.12) 0%, oklch(0.62 0.22 295 / 0.05) 100%)",
                        }}
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">💳</span>
                            <h3 className="text-sm font-bold text-foreground">
                              Pay Online with Paystack
                            </h3>
                          </div>
                          <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                            Instant Live Activation
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Pay securely with Debit Card, Bank Transfer (instant virtual account), USSD, or OPay. Your enrollment is
                          instantly confirmed upon completion.
                        </p>

                        {submitError && (
                          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                            {submitError}
                          </div>
                        )}

                        <button
                          type="button"
                          disabled={paystackLoading}
                          onClick={handlePaystackPayment}
                          className="w-full rounded-full py-3 px-6 text-sm font-bold text-primary-foreground transition-all duration-200 hover:scale-[1.01] hover:shadow-[var(--shadow-glow)] disabled:opacity-60 flex items-center justify-center gap-2"
                          style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow)" }}
                        >
                          <span>
                            {paystackLoading ? "Opening Paystack Checkout…" : `Pay ${fmt(UNIFORM_COURSE_FEE)} via Paystack`}
                          </span>
                          <span>→</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Success state */}
        {submitStatus === "success" && applicant && (
          <div
            className="rounded-2xl border border-border/60 p-6 sm:p-8 text-center animate-fade-in shadow-xl"
            style={{ background: "oklch(0.21 0.06 280 / 0.7)", backdropFilter: "blur(12px)" }}
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-2xl">
              ✓
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Enrollment Verified!</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              Thank you, <strong className="text-foreground">{applicant.full_name}</strong>! Your {fmt(UNIFORM_COURSE_FEE)} payment for <strong className="text-foreground">{applicant.track}</strong> has been received.
            </p>

            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-300 max-w-md mx-auto">
              ✅ Your enrollment is officially confirmed. Further orientation details will be sent directly to your registered email address.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
