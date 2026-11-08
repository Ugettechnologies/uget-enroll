import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent, type ReactNode } from "react";
import logo from "@/assets/uget-logo.png";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { fmt } from "./payment";
import { payWithPaystack } from "@/lib/paystack";

// Toggle registration status (set to true to reopen, false to close)
const REGISTRATION_OPEN = true;
const UNIFORM_FEE = 3000;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Uget Academy Cohort 2 Tech Scholarship — Apply & Enroll" },
      {
        name: "description",
        content:
          "Apply to the Uget Academy 12-week online tech scholarship Cohort 2. Mentorship, hands-on projects and certification across in-demand tracks.",
      },
    ],
  }),
  component: RegistrationPage,
});

const TRACKS = [
  "Cybersecurity",
  "AI Automation",
  "Customer Representative",
  "User-Generated Content (UGC)",
  "Project Management",
  "UI/UX Design",
  "Frontend Development",
  "Backend Development",
  "Full-Stack Development",
  "Graphic Design",
  "Content & Technical Writing",
  "Professional Video Editing",
  "Virtual Assistance",
  "Printing Technology",
  "Data Analysis",
];

const HIGHLIGHTS = [
  { label: "Cohort", value: "Cohort 2" },
  { label: "Duration", value: "12 Weeks" },
  { label: "Mode", value: "100% Online" },
  { label: "Certificate", value: "On Completion" },
];

const STEPS = [
  { id: 1, title: "About You", hint: "Track & contact info" },
  { id: 2, title: "Background & Tools", hint: "Education & readiness" },
  { id: 3, title: "Tuition & Payment", hint: "" },
];

type Status = "idle" | "submitting" | "success" | "error";

function RegistrationPage() {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState<Record<string, FormDataEntryValue>>({});
  const [enrolledStudent, setEnrolledStudent] = useState<any | null>(null);

  function captureStep(form: HTMLFormElement) {
    const fd = new FormData(form);
    const next: Record<string, FormDataEntryValue> = { ...formData };
    fd.forEach((v, k) => {
      next[k] = v;
    });
    setFormData(next);
    return next;
  }

  function goNext(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    captureStep(e.currentTarget);
    setStep((s) => Math.min(3, s + 1));
    window.scrollTo({ top: document.getElementById("apply")?.offsetTop ?? 0, behavior: "smooth" });
  }

  function goBack() {
    setStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: document.getElementById("apply")?.offsetTop ?? 0, behavior: "smooth" });
  }

  const selectedTrack = str(formData.track);
  const payableAmount = UNIFORM_FEE;

  async function saveEnrolledStudent(
    appData: any,
    paymentDetails: {
      status: string;
      sender: string;
      amount: number;
      ref: string;
    }
  ) {
    if (!supabase) {
      const full = { ...appData, ...paymentDetails, cohort: "Cohort 2" };
      setEnrolledStudent(full);
      setStatus("success");
      setMessage("Your application and payment details have been recorded.");
      window.scrollTo({ top: document.getElementById("apply")?.offsetTop ?? 0, behavior: "smooth" });
      return;
    }

    // 1. Insert applicant details into scholarship_applications (clean columns)
    const { data: insertedApp, error: appError } = await supabase
      .from("scholarship_applications")
      .insert([appData])
      .select()
      .single();

    if (appError) {
      console.error("Database application insert error:", appError);
      throw new Error(appError.message || "Failed to save scholarship application record.");
    }

    const appId = insertedApp.id;

    // 2. Insert payment details into payments table
    try {
      await supabase.from("payments").insert([{
        application_id: appId,
        payment_status: paymentDetails.status,
        payment_sender: paymentDetails.sender,
        payment_amount: paymentDetails.amount,
        payment_date: new Date().toISOString().split("T")[0],
        payment_ref: paymentDetails.ref,
      }]);
    } catch (payErr) {
      console.warn("Notice inserting to payments table:", payErr);
    }

    // 3. Insert into paid_students_sheet for dedicated Supabase view
    try {
      await supabase.from("paid_students_sheet").insert([{
        application_id: appId,
        full_name: appData.full_name,
        email: appData.email,
        phone: appData.phone,
        track: appData.track,
        gender: appData.gender,
        date_of_birth: appData.date_of_birth,
        state_region: appData.state_region,
        country: appData.country,
        residential_address: appData.residential_address,
        highest_qualification: appData.highest_qualification,
        institution: appData.institution,
        course_of_study: appData.course_of_study,
        current_status: appData.current_status,
        experience_level: appData.experience_level,
        why_apply: appData.why_apply,
        goals: appData.goals,
        portfolio_url: appData.portfolio_url,
        payment_status: paymentDetails.status,
        payment_sender: paymentDetails.sender,
        payment_amount: paymentDetails.amount,
        payment_date: new Date().toISOString().split("T")[0],
        payment_ref: paymentDetails.ref,
      }]);
    } catch (_) { }

    const completed = {
      ...insertedApp,
      payment_status: paymentDetails.status,
      payment_sender: paymentDetails.sender,
      payment_amount: paymentDetails.amount,
      payment_ref: paymentDetails.ref,
      cohort: "Cohort 2",
    };

    setEnrolledStudent(completed);
    setStatus("success");
    setMessage("Congratulations! Your payment has been confirmed and your enrollment in Cohort 2 is complete.");
    window.scrollTo({ top: document.getElementById("apply")?.offsetTop ?? 0, behavior: "smooth" });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const final = captureStep(e.currentTarget);

    if (final.agreed_to_terms !== "on") {
      setStatus("error");
      setMessage("You must agree to the terms and conditions to submit.");
      return;
    }

    if (!final.signature || !String(final.signature).trim()) {
      setStatus("error");
      setMessage("Please provide your digital signature (full name) to proceed.");
      return;
    }

    if (!supabase) {
      setStatus("error");
      setMessage("Supabase is not configured. Please check your environment variables.");
      return;
    }

    const currentTrack = String(final.track || "");
    if (!currentTrack) {
      setStatus("error");
      setMessage("Please go back to Step 1 and select your learning track.");
      return;
    }

    const amountToCharge = UNIFORM_FEE;

    // Build clean database payload (strictly matching scholarship_applications columns)
    const applicantPayload = {
      track: final.track,
      track_reason: final.track_reason || "Passionate about building a career in this field",
      full_name: final.full_name,
      email: String(final.email).trim().toLowerCase(),
      phone: final.phone,
      gender: final.gender,
      date_of_birth: final.date_of_birth || null,
      residential_address: final.residential_address || null,
      state_region: final.state_region,
      country: final.country || "Nigeria",
      linkedin_url: final.linkedin_url || null,
      highest_qualification: final.highest_qualification,
      institution: final.institution || null,
      course_of_study: final.course_of_study || null,
      current_status: final.current_status,
      studied_before: final.studied_before === "Yes",
      experience_level: final.experience_level,
      why_apply: final.why_apply || "Cohort 2 Tech Scholarship Admission",
      goals: final.goals || "Acquire in-demand practical digital skills",
      two_year_vision: final.two_year_vision || "Professional Growth in Tech",
      has_computer: final.has_computer === "Yes",
      has_internet: final.has_internet === "Yes",
      can_commit: final.can_commit === "Yes",
      portfolio_url: final.portfolio_url || null,
      github_url: final.github_url || null,
      design_profile_url: final.design_profile_url || null,
      other_links: final.other_links || null,
      emergency_name: null,
      emergency_relationship: null,
      emergency_phone: null,
      heard_from: final.heard_from || "WhatsApp",
      referral_code: final.referral_code || null,
      signature: final.signature,
      agreed_to_terms: true,
    };

    setStatus("submitting");
    setMessage("");

    // Paystack Online Checkout (Card, Bank Transfer, USSD, OPay)
    try {
      await payWithPaystack({
        email: applicantPayload.email,
        amount: amountToCharge,
        currency: "NGN",
        metadata: {
          custom_fields: [
            { display_name: "Full Name", variable_name: "full_name", value: applicantPayload.full_name },
            { display_name: "Track", variable_name: "track", value: applicantPayload.track },
            { display_name: "Cohort", variable_name: "cohort", value: "Cohort 2" },
            { display_name: "Payment Plan", variable_name: "payment_plan", value: `Full Payment (${fmt(amountToCharge)})` },
            { display_name: "Phone", variable_name: "phone", value: applicantPayload.phone },
          ],
        },
        onSuccess: async (response) => {
          try {
            await saveEnrolledStudent(applicantPayload, {
              status: "Paid",
              sender: String(applicantPayload.full_name),
              amount: amountToCharge,
              ref: response.reference,
            });
          } catch (saveErr: any) {
            console.error("Failed saving applicant after Paystack payment:", saveErr);
            setStatus("error");
            setMessage("Payment succeeded with Paystack reference " + response.reference + ", but saving profile encountered an issue. Please contact support.");
          }
        },
        onClose: () => {
          setStatus("idle");
          setMessage("Payment was not completed. In accordance with Cohort 2 policy, your registration details were NOT stored in the database. You can retry at any time to reserve your seat.");
        },
      });
    } catch (err: any) {
      console.error("Paystack checkout error:", err);
      setStatus("error");
      setMessage(err.message || "Failed to initialize Paystack checkout. Please try again.");
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero */}
      <header
        className="relative overflow-hidden border-b border-border"
        style={{ background: "var(--gradient-hero)" }}
      >
        {/* Animated orbs */}
        <div
          className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-30 blur-3xl animate-float-slow"
          style={{ background: "var(--gradient-brand)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-40 -right-20 h-[28rem] w-[28rem] rounded-full opacity-25 blur-3xl animate-float-slower"
          style={{ background: "radial-gradient(circle, oklch(0.62 0.22 295), transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-20 text-center">
          <div className="animate-fade-in">
            <div className="relative inline-block">
              <div
                className="absolute -inset-3 rounded-3xl opacity-60 blur-2xl animate-pulse-glow"
                style={{ background: "var(--gradient-brand)" }}
              />
              <img src={logo} alt="Uget Technologies" className="relative mx-auto h-24 w-24 rounded-2xl shadow-2xl" />
            </div>
          </div>

          <p
            className="mt-7 text-xs font-semibold uppercase tracking-[0.35em] text-primary animate-fade-in"
            style={{ animationDelay: "80ms", animationFillMode: "backwards" }}
          >
            {REGISTRATION_OPEN
              ? "Uget Academy · Cohort 2 Applications Open"
              : "Uget Academy · Cohort Registration Closed"}
          </p>
          <h1
            className="mt-4 text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight animate-fade-in leading-tight"
            style={{ animationDelay: "160ms", animationFillMode: "backwards" }}
          >
            Tech Scholarship{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-brand)" }}
            >
              Cohort 2
            </span>
          </h1>
          <p
            className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-muted-foreground animate-fade-in"
            style={{ animationDelay: "240ms", animationFillMode: "backwards" }}
          >
            A 12-week intensive online program equipping aspiring professionals with practical, in-demand
            digital skills. Mentorship, real-world capstones, and industry certification across 15 in-demand tracks.
          </p>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {HIGHLIGHTS.map((h, i) => (
              <div
                key={h.label}
                className="group rounded-xl border border-border/60 bg-card/40 backdrop-blur px-4 py-3 text-left transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-[var(--shadow-glow)] animate-fade-in"
                style={{ animationDelay: `${320 + i * 80}ms`, animationFillMode: "backwards" }}
              >
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {h.label}
                </div>
                <div className="mt-1 text-sm font-semibold transition-colors group-hover:text-primary">
                  {h.value}
                </div>
              </div>
            ))}
          </div>

          <a
            href={REGISTRATION_OPEN ? "#apply" : "/payment"}
            className="mt-10 inline-flex items-center justify-center rounded-full px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-[var(--shadow-glow)] animate-fade-in"
            style={{
              background: "var(--gradient-brand)",
              boxShadow: "var(--shadow-glow)",
              animationDelay: "640ms",
              animationFillMode: "backwards",
            }}
          >
            {REGISTRATION_OPEN ? "Enroll in Cohort 2" : "Proceed to Payment"}{" "}
            <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
          </a>
        </div>
      </header>

      {/* Config warning */}
      {!supabaseConfigured && (
        <div className="mx-auto max-w-3xl px-6 mt-6">
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm animate-fade-in">
            <strong>Supabase not connected.</strong> Add your project URL and publishable key to{" "}
            <code>.env</code> and run the provided SQL.
          </div>
        </div>
      )}

      {/* Stepper + Form / Registration Closed Notice / Success Screen */}
      {REGISTRATION_OPEN ? (
        <main id="apply" className="mx-auto max-w-3xl px-3.5 sm:px-6 py-8 sm:py-16 scroll-mt-8">
          {status === "success" && enrolledStudent ? (
            <div className="rounded-2xl border border-primary/40 bg-card/70 p-4 sm:p-10 text-center backdrop-blur-md shadow-2xl animate-scale-in">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <span className="rounded-full bg-emerald-500/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/30">
                Payment Verified & Enrolled
              </span>

              <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome to Uget Academy, <span className="text-primary">{enrolledStudent.full_name}</span>!
              </h2>

              <p className="mt-2 text-sm text-muted-foreground max-w-lg mx-auto">
                Your enrollment payment for <strong className="text-foreground">{enrolledStudent.track}</strong> has been received and verified. Your seat in Cohort 2 is officially secured!
              </p>

              {/* Receipt Summary Card */}
              <div className="mt-6 mx-auto max-w-md rounded-xl border border-border/80 bg-input/40 p-4 text-left text-xs space-y-2.5">
                <div className="flex justify-between border-b border-border/40 pb-2">
                  <span className="text-muted-foreground">Payment Status:</span>
                  <span className="font-bold text-emerald-400">Paid ✅</span>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-2">
                  <span className="text-muted-foreground">Amount Paid:</span>
                  <span className="font-bold text-foreground">{fmt(enrolledStudent.payment_amount)}</span>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-2">
                  <span className="text-muted-foreground">Payment Reference:</span>
                  <span className="font-mono font-bold text-primary">{enrolledStudent.payment_ref}</span>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-2">
                  <span className="text-muted-foreground">Enrolled Track:</span>
                  <span className="font-semibold text-foreground">{enrolledStudent.track}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cohort:</span>
                  <span className="font-semibold text-primary">Cohort 2</span>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-300 max-w-md mx-auto">
                ✅ Your enrollment is officially confirmed. Further orientation details will be sent directly to your registered email address.
              </div>
            </div>
          ) : (
            <>
              {message && status === "idle" && (
                <div className="mb-8 rounded-xl border border-amber-500/40 bg-amber-500/10 px-5 py-4 text-xs sm:text-sm text-amber-300 animate-fade-in flex items-start gap-3">
                  <span className="text-base">⚠️</span>
                  <div>{message}</div>
                </div>
              )}

              <Stepper currentStep={step} />

              <div key={step} className="mt-10 animate-fade-in">
                {step === 1 && (
                  <form onSubmit={goNext} className="space-y-8">
                    <Section
                      title="1. Learning Track"
                      subtitle="Choose the specialization that best matches your career goals"
                    >
                      <Field label="Selected Track" required>
                        <select
                          name="track"
                          required
                          defaultValue={str(formData.track)}
                          className={selectCls}
                        >
                          <option value="">Select a track…</option>
                          {TRACKS.map((t) => (
                            <option key={t}>{t}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Why are you choosing this track?" required>
                        <textarea
                          name="track_reason"
                          required
                          rows={3}
                          defaultValue={str(formData.track_reason)}
                          placeholder="Tell us what sparked your interest in this field…"
                          className={inputCls}
                        />
                      </Field>
                    </Section>

                    <Section title="2. Personal Information">
                      <Grid>
                        <Field label="Full Name" required>
                          <input
                            name="full_name"
                            required
                            defaultValue={str(formData.full_name)}
                            placeholder="e.g. Blessed Frankie"
                            className={inputCls}
                          />
                        </Field>
                        <Field label="Email Address" required>
                          <input
                            name="email"
                            type="email"
                            required
                            defaultValue={str(formData.email)}
                            placeholder="you@example.com"
                            className={inputCls}
                          />
                        </Field>
                      </Grid>

                      <Grid>
                        <Field label="WhatsApp / Phone Number" required>
                          <input
                            name="phone"
                            type="tel"
                            required
                            defaultValue={str(formData.phone)}
                            placeholder="+234 800 000 0000"
                            className={inputCls}
                          />
                        </Field>
                        <Field label="Gender" required>
                          <select
                            name="gender"
                            required
                            defaultValue={str(formData.gender)}
                            className={selectCls}
                          >
                            <option value="">Select…</option>
                            <option>Male</option>
                            <option>Female</option>
                            <option>Prefer not to say</option>
                          </select>
                        </Field>
                      </Grid>

                      <Grid>
                        <Field label="Date of Birth">
                          <input
                            name="date_of_birth"
                            type="date"
                            defaultValue={str(formData.date_of_birth)}
                            className={inputCls}
                          />
                        </Field>
                        <Field label="Country" required>
                          <input
                            name="country"
                            required
                            defaultValue={str(formData.country) || "Nigeria"}
                            className={inputCls}
                          />
                        </Field>
                      </Grid>

                      <Grid>
                        <Field label="State / Region" required>
                          <input
                            name="state_region"
                            required
                            defaultValue={str(formData.state_region)}
                            placeholder="e.g. Lagos"
                            className={inputCls}
                          />
                        </Field>
                        <Field label="LinkedIn Profile URL (Optional)">
                          <input
                            name="linkedin_url"
                            type="text"
                            defaultValue={str(formData.linkedin_url)}
                            placeholder="e.g. linkedin.com/in/... (leave blank if none)"
                            className={inputCls}
                          />
                        </Field>
                      </Grid>

                      <Field label="Residential Address">
                        <input
                          name="residential_address"
                          defaultValue={str(formData.residential_address)}
                          placeholder="Street, City"
                          className={inputCls}
                        />
                      </Field>
                    </Section>

                    <NavButtons step={step} />
                  </form>
                )}

                {step === 2 && (
                  <form onSubmit={goNext} className="space-y-8">
                    <Section title="3. Education & Background">
                      <Grid>
                        <Field label="Highest Qualification" required>
                          <select
                            name="highest_qualification"
                            required
                            defaultValue={str(formData.highest_qualification)}
                            className={selectCls}
                          >
                            <option value="">Select…</option>
                            {[
                              "High School / SSCE",
                              "OND / NCE",
                              "HND / Bachelor's",
                              "Master's Degree",
                              "Doctorate",
                              "Other",
                            ].map((q) => (
                              <option key={q}>{q}</option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Institution Attended">
                          <input
                            name="institution"
                            defaultValue={str(formData.institution)}
                            placeholder="e.g. University of Lagos"
                            className={inputCls}
                          />
                        </Field>
                      </Grid>

                      <Grid>
                        <Field label="Course of Study">
                          <input
                            name="course_of_study"
                            defaultValue={str(formData.course_of_study)}
                            placeholder="e.g. Computer Science"
                            className={inputCls}
                          />
                        </Field>
                        <Field label="Current Status" required>
                          <select
                            name="current_status"
                            required
                            defaultValue={str(formData.current_status)}
                            className={selectCls}
                          >
                            <option value="">Select…</option>
                            {[
                              "Student",
                              "Employed",
                              "Self-Employed / Freelancer",
                              "Unemployed",
                              "NYSC",
                            ].map((s) => (
                              <option key={s}>{s}</option>
                            ))}
                          </select>
                        </Field>
                      </Grid>

                      <Grid>
                        <Field label="Have you studied tech before?" required>
                          <select
                            name="studied_before"
                            required
                            defaultValue={str(formData.studied_before)}
                            className={selectCls}
                          >
                            <option value="">Select…</option>
                            <option>Yes</option>
                            <option>No</option>
                          </select>
                        </Field>
                        <Field label="Experience Level in this Track" required>
                          <select
                            name="experience_level"
                            required
                            defaultValue={str(formData.experience_level)}
                            className={selectCls}
                          >
                            <option value="">Select…</option>
                            <option>Complete Beginner</option>
                            <option>Intermediate (some experience)</option>
                            <option>Advanced</option>
                          </select>
                        </Field>
                      </Grid>
                    </Section>

                    {/* Section 4: Readiness & Tools (Essay questions removed per feedback) */}
                    <Section
                      title="4. Readiness & Learning Tools"
                      subtitle="Basic setup confirmation for your 12-week virtual cohort"
                    >
                      <Grid>
                        <Field label="Do you have access to a computer?" required>
                          <select
                            name="has_computer"
                            required
                            defaultValue={str(formData.has_computer)}
                            className={selectCls}
                          >
                            <option value="">Select…</option>
                            <option>Yes</option>
                            <option>No</option>
                          </select>
                        </Field>
                        <Field label="Do you have reliable internet access?" required>
                          <select
                            name="has_internet"
                            required
                            defaultValue={str(formData.has_internet)}
                            className={selectCls}
                          >
                            <option value="">Select…</option>
                            <option>Yes</option>
                            <option>No</option>
                          </select>
                        </Field>
                      </Grid>

                      <Field
                        label="Can you commit 10-15 hours/week for 12 weeks?"
                        required
                      >
                        <select
                          name="can_commit"
                          required
                          defaultValue={str(formData.can_commit)}
                          className={selectCls}
                        >
                          <option value="">Select…</option>
                          <option>Yes</option>
                          <option>No</option>
                        </select>
                      </Field>

                      {/* Online Profiles & Links (All clearly optional) */}
                      <div className="rounded-xl border border-border/70 bg-card/40 p-4 space-y-3">
                        <div className="text-xs font-semibold text-foreground flex items-center justify-between">
                          <span>Online Profiles & Portfolio Links</span>
                          <span className="text-[11px] text-muted-foreground font-normal">(All optional)</span>
                        </div>
                        <Grid>
                          <Field label="Portfolio URL (Optional)">
                            <input
                              name="portfolio_url"
                              type="text"
                              defaultValue={str(formData.portfolio_url)}
                              placeholder="https://... (or leave blank)"
                              className={inputCls}
                            />
                          </Field>
                          <Field label="GitHub URL (Optional)">
                            <input
                              name="github_url"
                              type="text"
                              defaultValue={str(formData.github_url)}
                              placeholder="https://github.com/... (or leave blank)"
                              className={inputCls}
                            />
                          </Field>
                        </Grid>

                        <Grid>
                          <Field label="Design Profile (Optional)">
                            <input
                              name="design_profile_url"
                              type="text"
                              defaultValue={str(formData.design_profile_url)}
                              placeholder="Behance, Figma, Dribbble (or leave blank)"
                              className={inputCls}
                            />
                          </Field>
                          <Field label="Other Relevant Links (Optional)">
                            <input
                              name="other_links"
                              type="text"
                              defaultValue={str(formData.other_links)}
                              placeholder="Any link (or leave blank)"
                              className={inputCls}
                            />
                          </Field>
                        </Grid>
                      </div>
                    </Section>

                    <NavButtons step={step} onBack={goBack} />
                  </form>
                )}

                {step === 3 && (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Section 5: Discovery & Referral (Emergency Contacts removed) */}
                    <Section
                      title="5. Discovery & Referral"
                      subtitle="Help us understand how you found Uget Academy"
                    >
                      <Grid>
                        <Field label="How did you hear about us? (Optional)">
                          <select
                            name="heard_from"
                            defaultValue={str(formData.heard_from) || "WhatsApp"}
                            className={selectCls}
                          >
                            {[
                              "WhatsApp",
                              "Instagram",
                              "Facebook",
                              "LinkedIn",
                              "Friend/Referral",
                              "Website",
                              "Other",
                            ].map((o) => (
                              <option key={o}>{o}</option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Referral Code (Optional)">
                          <input
                            name="referral_code"
                            defaultValue={str(formData.referral_code)}
                            placeholder="Optional referrer code"
                            className={inputCls}
                          />
                        </Field>
                      </Grid>
                    </Section>

                    {/* Section 6: Cohort 2 Tuition & Official Bank Payment */}
                    <Section
                      title="6. Cohort 2 Tuition & Payment"
                      subtitle="Under Cohort 2 policy, applications are stored only upon verified payment."
                    >
                      {selectedTrack ? (
                        <div className="space-y-5">
                          {/* Price Container */}
                          <div className="rounded-xl border border-border/80 bg-card/40 p-5">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm font-bold text-foreground">
                                  {selectedTrack} · Enrollment Fee
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  Flat commitment fee for 12-week program · Cohort 2
                                </div>
                              </div>
                              <span className="text-2xl sm:text-3xl font-extrabold text-primary">
                                {fmt(UNIFORM_FEE)}
                              </span>
                            </div>
                          </div>

                          {/* Paystack Integration Note */}
                          <div className="rounded-2xl border border-primary/40 bg-primary/10 p-4 text-xs text-muted-foreground flex items-start gap-3 shadow-sm">
                            <span className="text-2xl">💳</span>
                            <div className="space-y-1">
                              <span className="font-bold text-foreground text-sm block">
                                Secure Paystack Gateway
                              </span>
                              <p className="leading-relaxed">
                                Complete your payment securely with <strong>Debit Card</strong>, <strong>Bank Transfer</strong> (instant virtual account), <strong>USSD</strong>, or <strong>OPay / PalmPay</strong>. Your seat is confirmed immediately upon payment.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-xs text-yellow-300">
                          ⚠️ Please return to Step 1 to select your course track before proceeding.
                        </div>
                      )}
                    </Section>

                    {/* Section 7: Commitment & Terms */}
                    <Section title="7. Commitment & Terms">
                      <div className="rounded-xl border border-border bg-card/50 p-5 text-sm text-muted-foreground space-y-2">
                        <p>By submitting this application, I understand and agree that:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>The program runs for 12 weeks online.</li>
                          <li>Attendance and active participation are required.</li>
                          <li>Assignments and projects must be completed on schedule.</li>
                          <li>Scholarships may be withdrawn for misconduct or non-participation.</li>
                          <li>All information provided is authentic and accurate.</li>
                        </ul>
                      </div>
                      <label className="flex items-start gap-3 text-xs sm:text-sm cursor-pointer group py-1 select-none">
                        <input
                          type="checkbox"
                          name="agreed_to_terms"
                          required
                          className="mt-0.5 h-4 w-4 sm:h-5 sm:w-5 accent-primary shrink-0 cursor-pointer"
                        />
                        <span className="transition-colors group-hover:text-foreground leading-relaxed">
                          I agree to the terms and conditions of the Uget Academy Cohort 2 Tech Scholarship.
                        </span>
                      </label>
                      <Grid>
                        <Field label="Applicant Signature (full name)" required>
                          <input
                            name="signature"
                            required
                            defaultValue={str(formData.signature)}
                            placeholder="Type your full legal name"
                            className={inputCls}
                          />
                        </Field>
                        <Field label="Date">
                          <input
                            value={new Date().toLocaleDateString()}
                            readOnly
                            className={inputCls + " opacity-70"}
                          />
                        </Field>
                      </Grid>
                    </Section>

                    {status === "error" && (
                      <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm animate-fade-in">
                        {message}
                      </div>
                    )}

                    <NavButtons
                      step={step}
                      onBack={goBack}
                      submitting={status === "submitting"}
                      isFinal
                      submitLabel={`Pay ${fmt(payableAmount)} via Paystack & Enroll →`}
                    />
                  </form>
                )}
              </div>
            </>
          )}
        </main>
      ) : (
        <main id="apply" className="mx-auto max-w-2xl px-6 py-16 text-center scroll-mt-8 animate-fade-in">
          <div
            className="rounded-2xl border border-border/60 p-8 shadow-xl space-y-6"
            style={{ background: "oklch(0.21 0.06 280 / 0.7)", backdropFilter: "blur(12px)" }}
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
              <svg
                className="h-8 w-8"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Applications Temporarily Closed</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Registration for the current Uget Academy Tech Scholarship cohort is now closed. We are
                no longer accepting new applications at this time.
              </p>
            </div>
            <div className="border-t border-border/40 pt-4">
              <p className="text-xs text-muted-foreground">
                Already registered? You can still complete your commitment fee payment.
              </p>
              <a
                href="/payment"
                className="mt-3 inline-flex items-center justify-center rounded-full px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow transition-all hover:scale-105"
                style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow)" }}
              >
                Go to Payment Portal →
              </a>
            </div>
          </div>
        </main>
      )}

      <Footer />
    </div>
  );
}

function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="relative">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {STEPS.map((s, i) => {
          const isDone = currentStep > s.id;
          const isCurrent = currentStep === s.id;
          return (
            <div key={s.id} className="flex flex-1 items-center gap-3">
              <div className="flex flex-col items-center text-center flex-1">
                <div
                  className={`relative flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full border-2 font-semibold text-xs sm:text-sm transition-all duration-500 ${isCurrent
                      ? "border-primary text-primary-foreground scale-110"
                      : isDone
                        ? "border-primary/70 text-primary-foreground"
                        : "border-border text-muted-foreground"
                    }`}
                  style={
                    isCurrent || isDone
                      ? {
                        background: "var(--gradient-brand)",
                        boxShadow: isCurrent ? "var(--shadow-glow)" : undefined,
                      }
                      : undefined
                  }
                >
                  {isDone ? (
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    s.id
                  )}
                  {isCurrent && (
                    <span
                      className="absolute inset-0 rounded-full animate-ping opacity-40"
                      style={{ background: "var(--gradient-brand)" }}
                    />
                  )}
                </div>
                <div className="mt-2 hidden sm:block">
                  <div
                    className={`text-xs font-semibold transition-colors ${isCurrent || isDone ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {s.title}
                  </div>
                  {s.hint ? <div className="text-[10px] text-muted-foreground">{s.hint}</div> : null}
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div className="relative h-0.5 flex-1 -mt-5 sm:-mt-12 overflow-hidden rounded-full bg-border">
                  <div
                    className="absolute inset-y-0 left-0 transition-all duration-700"
                    style={{
                      width: currentStep > s.id ? "100%" : "0%",
                      background: "var(--gradient-brand)",
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3 sm:hidden text-center">
        <div className="text-xs font-semibold text-foreground">{STEPS[currentStep - 1].title}</div>
        <div className="text-[10px] text-muted-foreground">
          Step {currentStep} of {STEPS.length}
        </div>
      </div>
    </div>
  );
}

function NavButtons({
  step,
  onBack,
  submitting,
  isFinal,
  submitLabel,
}: {
  step: number;
  onBack?: () => void;
  submitting?: boolean;
  isFinal?: boolean;
  submitLabel?: string;
}) {
  return (
    <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
      {step > 1 ? (
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto rounded-full border border-border bg-card/60 px-6 py-3 text-sm font-semibold transition-all hover:border-primary/60 hover:bg-card"
        >
          ← Back
        </button>
      ) : (
        <span className="hidden sm:block" />
      )}
      <button
        type="submit"
        disabled={submitting}
        className="w-full sm:w-auto rounded-full px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-[var(--shadow-glow)] disabled:opacity-60 disabled:hover:scale-100"
        style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow)" }}
      >
        {submitting ? "Processing…" : isFinal ? (submitLabel || "Submit Application") : "Continue →"}
      </button>
    </div>
  );
}

function Footer() {
  const socials = [
    {
      name: "Instagram",
      href: "https://www.instagram.com/ugettech?igsh=MXNqN2R0cjVqNDMwZw%3D%3D&utm_source=qr",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-4 w-4"
        >
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/in/uget-technologies-562b46416?utm_source=share_via&utm_content=profile&utm_medium=member_ios",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
    },
    {
      name: "Facebook",
      href: "https://www.facebook.com/share/1BndqE18h3/?mibextid=wwXIfr",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M22 12.07C22 6.51 17.52 2 12 2S2 6.51 2 12.07c0 5.02 3.66 9.18 8.44 9.93v-7.03H7.9v-2.9h2.54V9.84c0-2.52 1.5-3.92 3.78-3.92 1.1 0 2.24.2 2.24.2v2.48h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.77l-.44 2.9h-2.33V22c4.78-.75 8.43-4.91 8.43-9.93z" />
        </svg>
      ),
    },
    {
      name: "X / Twitter",
      href: "https://x.com/uget_tech?s=21",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
  ];

  return (
    <footer
      className="relative mt-10 border-t border-border overflow-hidden"
      style={{ background: "var(--gradient-hero)" }}
    >
      <div
        className="pointer-events-none absolute -top-20 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--gradient-brand)" }}
      />
      <div className="relative mx-auto max-w-5xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <img src={logo} alt="" className="h-10 w-10 rounded-lg" />
              <div>
                <div className="text-sm font-bold tracking-wide">UGET TECHNOLOGIES</div>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              Innovative Solutions for a Connected World.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground/80">Cohort Tracks</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {TRACKS.slice(0, 6).map((t) => (
                <li key={t}>
                  <a href="#apply" className="transition-colors hover:text-primary">{t}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
              Connect
            </h4>
            <div className="mt-4 flex flex-wrap gap-2">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={s.name}
                  className="group flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/60 text-muted-foreground transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:text-primary-foreground"
                  style={{
                    transitionProperty: "transform, color, background, border-color, box-shadow",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "var(--gradient-brand)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-glow)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "";
                    (e.currentTarget as HTMLElement).style.boxShadow = "";
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Questions? <a href="mailto:academy@uget-enrollment.online" className="text-primary hover:underline">academy@uget-enrollment.online</a>
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Uget Technologies. All rights reserved.</p>
          <p>Innovative Solutions for a Connected World.</p>
        </div>
      </div>
    </footer>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-input px-3.5 py-2.5 text-base sm:text-sm text-foreground outline-none transition-all duration-200 focus:border-ring focus:ring-2 focus:ring-ring/30 focus:bg-input/80 placeholder:text-muted-foreground hover:border-border/80 min-h-[44px]";
const selectCls = inputCls + " appearance-none cursor-pointer";

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card/60 p-4 sm:p-7 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-border/80 hover:shadow-lg">
      <h2 className="text-lg sm:text-xl font-semibold tracking-tight">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  required,
  children,
  className = "",
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-medium text-foreground/90">
        {label}
        {required && <span className="ml-1 text-accent">*</span>}
      </span>
      {children}
    </label>
  );
}

function Grid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

function str(v: FormDataEntryValue | undefined): string {
  return typeof v === "string" ? v : "";
}
