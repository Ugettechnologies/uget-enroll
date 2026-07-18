import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent, type ReactNode } from "react";
import logo from "@/assets/uget-logo.png";
import { supabase, supabaseConfigured } from "@/lib/supabase";

// Toggle registration status (set to true to reopen, false to close)
const REGISTRATION_OPEN = true;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Uget Academy Tech Scholarship Cohort — Apply" },
      {
        name: "description",
        content:
          "Apply to the Uget Academy 12-week online tech scholarship. Mentorship, hands-on projects and certification across 12 in-demand tracks.",
      },
    ],
  }),
  component: RegistrationPage,
});

const TRACKS = [
  "Cybersecurity",
  "AI Automation & Data Annotation",
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
  { label: "Duration", value: "12 Weeks" },
  { label: "Mode", value: "100% Online" },
  { label: "Tracks", value: "12 Skills" },
  { label: "Certificate", value: "On Completion" },
];

const STEPS = [
  { id: 1, title: "About You", hint: "Track & personal info" },
  { id: 2, title: "Background", hint: "Education & motivation" },
  { id: 3, title: "Final Details", hint: "Contact & commitment" },
];

type Status = "idle" | "submitting" | "success" | "error";

function RegistrationPage() {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState<Record<string, FormDataEntryValue>>({});

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

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const final = captureStep(e.currentTarget);

    if (final.agreed_to_terms !== "on") {
      setStatus("error");
      setMessage("You must agree to the terms and conditions to submit.");
      return;
    }
    if (!supabase) {
      setStatus("error");
      setMessage(
        "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your .env file.",
      );
      return;
    }

    const payload = {
      track: final.track,
      track_reason: final.track_reason,
      full_name: final.full_name,
      email: final.email,
      phone: final.phone,
      gender: final.gender,
      date_of_birth: final.date_of_birth || null,
      residential_address: final.residential_address,
      state_region: final.state_region,
      country: final.country,
      linkedin_url: final.linkedin_url || null,
      highest_qualification: final.highest_qualification,
      institution: final.institution,
      course_of_study: final.course_of_study || null,
      current_status: final.current_status,
      studied_before: final.studied_before === "Yes",
      experience_level: final.experience_level,
      why_apply: final.why_apply,
      goals: final.goals,
      two_year_vision: final.two_year_vision,
      has_computer: final.has_computer === "Yes",
      has_internet: final.has_internet === "Yes",
      can_commit: final.can_commit === "Yes",
      portfolio_url: final.portfolio_url || null,
      github_url: final.github_url || null,
      design_profile_url: final.design_profile_url || null,
      other_links: final.other_links || null,
      emergency_name: final.emergency_name,
      emergency_relationship: final.emergency_relationship,
      emergency_phone: final.emergency_phone,
      heard_from: final.heard_from,
      referral_code: final.referral_code,
      signature: final.signature,
      agreed_to_terms: true,
    };

    setStatus("submitting");
    setMessage("");

    // Save details to sessionStorage instead of the database to prevent unpaid database entries
    const tempId = "temp_" + Math.random().toString(36).substring(2, 11);
    const pendingPayload = {
      ...payload,
      id: tempId,
    };

    try {
      sessionStorage.setItem("pending_registration", JSON.stringify(pendingPayload));
      // Redirect immediately to payment page with temp ID
      window.location.href = `/payment?id=${tempId}`;
    } catch (err: any) {
      setStatus("error");
      setMessage("Failed to store pending registration details: " + (err.message || err));
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

        <div className="relative mx-auto max-w-5xl px-6 py-16 sm:py-24 text-center">
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
              ? "Uget Academy · Cohort Applications Open"
              : "Uget Academy · Cohort Registration Closed"}
          </p>
          <h1
            className="mt-4 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight animate-fade-in"
            style={{ animationDelay: "160ms", animationFillMode: "backwards" }}
          >
            Tech Scholarship{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-brand)" }}
            >
              Cohort
            </span>
          </h1>
          <p
            className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-muted-foreground animate-fade-in"
            style={{ animationDelay: "240ms", animationFillMode: "backwards" }}
          >
            A 12-week online program equipping aspiring professionals with practical, in-demand
            digital skills — through expert-led training, mentorship and real-world projects.
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

          {/* <a
            href="/referral/signup"
            className="mt-10 inline-flex items-center justify-center rounded-full px-20 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-[var(--shadow-glow)] animate-fade-in"
            style={{
              background: "var(--gradient-brand)",
              boxShadow: "var(--shadow-glow)",
              animationDelay: "640ms",
              animationFillMode: "backwards",
            }}
          >
            Refer 
          </a> */}
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
            {REGISTRATION_OPEN ? "Begin Application" : "Proceed to Payment"}{" "}
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

      {/* Stepper + Form / Registration Closed Notice */}
      {REGISTRATION_OPEN ? (
        <main id="apply" className="mx-auto max-w-3xl px-6 py-16 scroll-mt-8">
          {status === "success" && (
            <div className="mb-8 rounded-2xl border border-primary/40 bg-primary/10 p-6 text-center animate-scale-in">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                <svg
                  className="h-6 w-6 text-primary"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-base font-semibold">{message}</p>
            </div>
          )}

          <Stepper currentStep={step} />

          <div key={step} className="mt-10 animate-fade-in">
            {step === 1 && (
              <form onSubmit={goNext} className="space-y-8">
                <Section title="Scholarship Track" subtitle="Choose what you want to master.">
                  <Field label="Track" required>
                    <select
                      name="track"
                      required
                      defaultValue={str(formData.track)}
                      className={selectCls}
                    >
                      <option value="">Choose a track…</option>
                      {TRACKS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Why should you be chosen for this Scholarship?" required>
                    <textarea
                      name="track_reason"
                      required
                      defaultValue={str(formData.track_reason)}
                      rows={3}
                      className={inputCls}
                    />
                  </Field>
                </Section>

                <Section title="Personal Information">
                  <Grid>
                    <Field label="Full Name" required>
                      <input
                        name="full_name"
                        required
                        defaultValue={str(formData.full_name)}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Email Address" required>
                      <input
                        type="email"
                        name="email"
                        required
                        defaultValue={str(formData.email)}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Phone (WhatsApp Preferred)" required>
                      <input
                        name="phone"
                        required
                        defaultValue={str(formData.phone)}
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
                    <Field label="Date of Birth">
                      <input
                        type="date"
                        name="date_of_birth"
                        defaultValue={str(formData.date_of_birth)}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="State / Region" required>
                      <input
                        name="state_region"
                        required
                        defaultValue={str(formData.state_region)}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Country" required>
                      <input
                        name="country"
                        required
                        defaultValue={str(formData.country)}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="LinkedIn (optional)">
                      <input
                        name="linkedin_url"
                        type="url"
                        defaultValue={str(formData.linkedin_url)}
                        className={inputCls}
                      />
                    </Field>
                  </Grid>
                  <Field label="Residential Address">
                    <textarea
                      name="residential_address"
                      required
                      defaultValue={str(formData.residential_address)}
                      rows={2}
                      className={inputCls}
                    />
                  </Field>
                </Section>

                <NavButtons step={step} />
              </form>
            )}

            {step === 2 && (
              <form onSubmit={goNext} className="space-y-8">
                <Section title="Educational Background">
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
                          "Secondary School",
                          "Diploma",
                          "Undergraduate",
                          "Graduate",
                          "Postgraduate",
                          "Other",
                        ].map((o) => (
                          <option key={o}>{o}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Current Status" required>
                      <select
                        name="current_status"
                        required
                        defaultValue={str(formData.current_status)}
                        className={selectCls}
                      >
                        <option value="">Select…</option>
                        {["Student", "Employed", "Self-Employed", "Unemployed", "Other"].map((o) => (
                          <option key={o}>{o}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Name of Institution">
                      <input
                        name="institution"
                        required
                        defaultValue={str(formData.institution)}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Course of Study (if applicable)">
                      <input
                        name="course_of_study"
                        defaultValue={str(formData.course_of_study)}
                        className={inputCls}
                      />
                    </Field>
                  </Grid>
                </Section>

                <Section title="Experience & Motivation">
                  <Grid>
                    <Field label="Studied this field before?" required>
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
                    <Field label="Experience Level" required>
                      <select
                        name="experience_level"
                        required
                        defaultValue={str(formData.experience_level)}
                        className={selectCls}
                      >
                        <option value="">Select…</option>
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                      </select>
                    </Field>
                  </Grid>
                  <Field label="Why are you applying for this scholarship?" required>
                    <textarea
                      name="why_apply"
                      required
                      defaultValue={str(formData.why_apply)}
                      rows={3}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="What do you hope to achieve after this program?" required>
                    <textarea
                      name="goals"
                      required
                      defaultValue={str(formData.goals)}
                      rows={3}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Where do you see yourself in the next 2 years?" required>
                    <textarea
                      name="two_year_vision"
                      required
                      defaultValue={str(formData.two_year_vision)}
                      rows={3}
                      className={inputCls}
                    />
                  </Field>
                </Section>

                <Section title="Technical Readiness">
                  <Grid>
                    <Field label="Access to a laptop/desktop?" required>
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
                    <Field label="Reliable internet?" required>
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
                    <Field
                      label="Willing to commit to all 12 weeks?"
                      required
                      className="md:col-span-2"
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
                  </Grid>
                </Section>

                <NavButtons step={step} onBack={goBack} />
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleSubmit} className="space-y-8">
                <Section title="Portfolio & Social (Optional)">
                  <Grid>
                    <Field label="Portfolio Link">
                      <input
                        name="portfolio_url"
                        type="url"
                        defaultValue={str(formData.portfolio_url)}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="GitHub (technical tracks)">
                      <input
                        name="github_url"
                        type="url"
                        defaultValue={str(formData.github_url)}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Behance / Dribbble (design)">
                      <input
                        name="design_profile_url"
                        type="url"
                        defaultValue={str(formData.design_profile_url)}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Other Relevant Links">
                      <input
                        name="other_links"
                        defaultValue={str(formData.other_links)}
                        className={inputCls}
                      />
                    </Field>
                  </Grid>
                </Section>

                <Section title="Referral">
                  <Grid>
                    <Field label="How did you hear about us?" required>
                      <select
                        name="heard_from"
                        required
                        defaultValue={str(formData.heard_from)}
                        className={selectCls}
                      >
                        <option value="">Select…</option>
                        {[
                          "Facebook",
                          "Instagram",
                          "LinkedIn",
                          "WhatsApp",
                          "Friend/Referral",
                          "Website",
                          "Other",
                        ].map((o) => (
                          <option key={o}>{o}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Referral Code">
                      <input
                        name="referral_code"
                        required
                        defaultValue={str(formData.referral_code)}
                        className={inputCls}
                      />
                    </Field>
                  </Grid>
                </Section>

                <Section title="Commitment">
                  <div className="rounded-xl border border-border bg-card/50 p-5 text-sm text-muted-foreground space-y-2">
                    <p>By submitting this application, I understand that:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>The program runs for 12 weeks.</li>
                      <li>Attendance and active participation are required.</li>
                      <li>Assignments and projects must be completed on time.</li>
                      <li>Scholarships may be withdrawn for repeated absence or misconduct.</li>
                      <li>Information provided is accurate and truthful.</li>
                    </ul>
                  </div>
                  <label className="flex items-start gap-3 text-sm cursor-pointer group">
                    <input
                      type="checkbox"
                      name="agreed_to_terms"
                      required
                      className="mt-1 h-4 w-4 accent-primary"
                    />
                    <span className="transition-colors group-hover:text-foreground">
                      I agree to the terms and conditions of the Uget Academy Tech Scholarship Cohort.
                    </span>
                  </label>
                  <Grid>
                    <Field label="Applicant Signature (full name)" required>
                      <input
                        name="signature"
                        required
                        defaultValue={str(formData.signature)}
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
                />
              </form>
            )}
          </div>
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
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Registration is Closed</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Registration for the current Uget Academy Tech Scholarship cohort is now closed. We are no longer accepting new applications at this time.
              </p>
            </div>

            <div className="border-t border-border/40 my-6 pt-6 text-left space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Already Registered?</h3>
              <p className="text-xs text-muted-foreground">
                If you have already submitted your application, your record is active. You can proceed to complete your course commitment fee payment to secure your slot.
              </p>
              <div className="pt-4 text-center">
                <a
                  href="/payment"
                  className="inline-flex items-center justify-center rounded-full px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-[var(--shadow-glow)]"
                  style={{
                    background: "var(--gradient-brand)",
                    boxShadow: "var(--shadow-glow)",
                  }}
                >
                  Proceed to Payment
                  <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                </a>
              </div>
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
                  className={`relative flex h-11 w-11 items-center justify-center rounded-full border-2 font-semibold text-sm transition-all duration-500 ${
                    isCurrent
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
                  <div className="text-[10px] text-muted-foreground">{s.hint}</div>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div className="relative h-0.5 flex-1 -mt-7 sm:-mt-12 overflow-hidden rounded-full bg-border">
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
}: {
  step: number;
  onBack?: () => void;
  submitting?: boolean;
  isFinal?: boolean;
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
        {submitting ? "Submitting…" : isFinal ? "Submit Application" : "Continue →"}
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
          <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.22 8h4.56v14H.22V8zm7.5 0h4.37v1.92h.06c.61-1.15 2.1-2.36 4.32-2.36 4.62 0 5.47 3.04 5.47 7v7.44h-4.56v-6.6c0-1.57-.03-3.6-2.2-3.6-2.2 0-2.54 1.72-2.54 3.49V22H7.72V8z" />
        </svg>
      ),
    },
    {
      name: "Facebook",
      href: "https://www.facebook.com/share/1L1nmxPii2/?mibextid=wwXIfr",
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
          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Uget Technologies. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-input px-3.5 py-2.5 text-sm text-foreground outline-none transition-all duration-200 focus:border-ring focus:ring-2 focus:ring-ring/30 focus:bg-input/80 placeholder:text-muted-foreground hover:border-border/80";
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
    <section className="rounded-2xl border border-border bg-card/60 p-6 sm:p-8 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-border/80 hover:shadow-lg">
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
