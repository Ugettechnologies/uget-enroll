import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import logo from "@/assets/uget-logo.png";
import { supabase, supabaseConfigured } from "@/lib/supabase";

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

type Status = "idle" | "submitting" | "success" | "error";

function RegistrationPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase) {
      setStatus("error");
      setMessage(
        "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your .env file.",
      );
      return;
    }
    const fd = new FormData(e.currentTarget);
    const payload = {
      track: fd.get("track"),
      track_reason: fd.get("track_reason"),
      full_name: fd.get("full_name"),
      email: fd.get("email"),
      phone: fd.get("phone"),
      gender: fd.get("gender"),
      date_of_birth: fd.get("date_of_birth") || null,
      residential_address: fd.get("residential_address"),
      state_region: fd.get("state_region"),
      country: fd.get("country"),
      linkedin_url: fd.get("linkedin_url") || null,
      highest_qualification: fd.get("highest_qualification"),
      institution: fd.get("institution"),
      course_of_study: fd.get("course_of_study") || null,
      current_status: fd.get("current_status"),
      studied_before: fd.get("studied_before") === "Yes",
      experience_level: fd.get("experience_level"),
      why_apply: fd.get("why_apply"),
      goals: fd.get("goals"),
      two_year_vision: fd.get("two_year_vision"),
      has_computer: fd.get("has_computer") === "Yes",
      has_internet: fd.get("has_internet") === "Yes",
      can_commit: fd.get("can_commit") === "Yes",
      portfolio_url: fd.get("portfolio_url") || null,
      github_url: fd.get("github_url") || null,
      design_profile_url: fd.get("design_profile_url") || null,
      other_links: fd.get("other_links") || null,
      emergency_name: fd.get("emergency_name"),
      emergency_relationship: fd.get("emergency_relationship"),
      emergency_phone: fd.get("emergency_phone"),
      heard_from: fd.get("heard_from"),
      referral_code: fd.get("referral_code"),
      signature: fd.get("signature"),
      agreed_to_terms: fd.get("agreed_to_terms") === "on",
    };

    if (!payload.agreed_to_terms) {
      setStatus("error");
      setMessage("You must agree to the terms and conditions to submit.");
      return;
    }

    setStatus("submitting");
    setMessage("");
    const { error } = await supabase.from("scholarship_applications").insert(payload);
    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }
    setStatus("success");
    setMessage("Application received! We'll be in touch via email shortly.");
    (e.target as HTMLFormElement).reset();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <header
        className="relative overflow-hidden border-b border-border"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="absolute inset-0 opacity-30 pointer-events-none"
             style={{ background: "radial-gradient(circle at 80% 20%, oklch(0.62 0.22 295 / 0.35), transparent 50%)" }} />
        <div className="relative mx-auto max-w-5xl px-6 py-16 sm:py-24 text-center">
          <img src={logo} alt="Uget Technologies" className="mx-auto h-24 w-24 rounded-2xl shadow-2xl" />
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Uget Academy
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            Tech Scholarship{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-brand)" }}
            >
              Cohort
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-muted-foreground">
            A 12-week online program equipping aspiring professionals with practical,
            in-demand digital skills — through expert-led training, mentorship and
            real-world projects.
          </p>
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {HIGHLIGHTS.map((h) => (
              <div
                key={h.label}
                className="rounded-xl border border-border/60 bg-card/40 backdrop-blur px-4 py-3 text-left"
              >
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {h.label}
                </div>
                <div className="mt-1 text-sm font-semibold">{h.value}</div>
              </div>
            ))}
          </div>
          <a
            href="#apply"
            className="mt-10 inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-105"
            style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow)" }}
          >
            Begin Application →
          </a>
        </div>
      </header>

      {/* Status banner */}
      {!supabaseConfigured && (
        <div className="mx-auto max-w-3xl px-6 mt-6">
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">
            <strong>Supabase not connected.</strong> Add your project URL and
            publishable key to <code>.env</code> (see <code>.env.example</code>) and run the
            provided SQL to create the table.
          </div>
        </div>
      )}

      {/* Form */}
      <main id="apply" className="mx-auto max-w-3xl px-6 py-16">
        {status === "success" && (
          <div className="mb-8 rounded-xl border border-primary/40 bg-primary/10 p-5 text-center">
            <p className="text-base font-semibold">{message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          <Section title="Scholarship Track" subtitle="Select your preferred learning track.">
            <Field label="Track" required>
              <select name="track" required className={selectCls}>
                <option value="">Choose a track…</option>
                {TRACKS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Why did you choose this track?" required>
              <textarea name="track_reason" required rows={3} className={inputCls} />
            </Field>
          </Section>

          <Section title="Personal Information">
            <Grid>
              <Field label="Full Name" required>
                <input name="full_name" required className={inputCls} />
              </Field>
              <Field label="Email Address" required>
                <input type="email" name="email" required className={inputCls} />
              </Field>
              <Field label="Phone (WhatsApp Preferred)" required>
                <input name="phone" required className={inputCls} />
              </Field>
              <Field label="Gender" required>
                <select name="gender" required className={selectCls}>
                  <option value="">Select…</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Prefer not to say</option>
                </select>
              </Field>
              <Field label="Date of Birth">
                <input type="date" name="date_of_birth" className={inputCls} />
              </Field>
              <Field label="State / Region" required>
                <input name="state_region" required className={inputCls} />
              </Field>
              <Field label="Country" required>
                <input name="country" required className={inputCls} />
              </Field>
              <Field label="LinkedIn (optional)">
                <input name="linkedin_url" type="url" className={inputCls} />
              </Field>
            </Grid>
            <Field label="Residential Address" required>
              <textarea name="residential_address" required rows={2} className={inputCls} />
            </Field>
          </Section>

          <Section title="Educational Background">
            <Grid>
              <Field label="Highest Qualification" required>
                <select name="highest_qualification" required className={selectCls}>
                  <option value="">Select…</option>
                  {["Secondary School", "Diploma", "Undergraduate", "Graduate", "Postgraduate", "Other"].map(
                    (o) => (
                      <option key={o}>{o}</option>
                    ),
                  )}
                </select>
              </Field>
              <Field label="Current Status" required>
                <select name="current_status" required className={selectCls}>
                  <option value="">Select…</option>
                  {["Student", "Employed", "Self-Employed", "Unemployed", "Other"].map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </Field>
              <Field label="Name of Institution" required>
                <input name="institution" required className={inputCls} />
              </Field>
              <Field label="Course of Study (if applicable)">
                <input name="course_of_study" className={inputCls} />
              </Field>
            </Grid>
          </Section>

          <Section title="Experience & Motivation">
            <Grid>
              <Field label="Have you studied this field before?" required>
                <select name="studied_before" required className={selectCls}>
                  <option value="">Select…</option>
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </Field>
              <Field label="Experience Level" required>
                <select name="experience_level" required className={selectCls}>
                  <option value="">Select…</option>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </Field>
            </Grid>
            <Field label="Why are you applying for this scholarship?" required>
              <textarea name="why_apply" required rows={3} className={inputCls} />
            </Field>
            <Field label="What do you hope to achieve after completing this program?" required>
              <textarea name="goals" required rows={3} className={inputCls} />
            </Field>
            <Field label="Where do you see yourself in the next 2 years?" required>
              <textarea name="two_year_vision" required rows={3} className={inputCls} />
            </Field>
          </Section>

          <Section title="Technical Readiness">
            <Grid>
              <Field label="Access to a laptop/desktop?" required>
                <select name="has_computer" required className={selectCls}>
                  <option value="">Select…</option>
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </Field>
              <Field label="Reliable internet access?" required>
                <select name="has_internet" required className={selectCls}>
                  <option value="">Select…</option>
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </Field>
              <Field
                label="Willing to commit to the full 12 weeks?"
                required
                className="md:col-span-2"
              >
                <select name="can_commit" required className={selectCls}>
                  <option value="">Select…</option>
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </Field>
            </Grid>
          </Section>

          <Section title="Portfolio & Social (Optional)">
            <Grid>
              <Field label="Portfolio Link">
                <input name="portfolio_url" type="url" className={inputCls} />
              </Field>
              <Field label="GitHub (technical tracks)">
                <input name="github_url" type="url" className={inputCls} />
              </Field>
              <Field label="Behance / Dribbble (design tracks)">
                <input name="design_profile_url" type="url" className={inputCls} />
              </Field>
              <Field label="Other Relevant Links">
                <input name="other_links" className={inputCls} />
              </Field>
            </Grid>
          </Section>

          <Section title="Emergency Contact">
            <Grid>
              <Field label="Full Name" required>
                <input name="emergency_name" required className={inputCls} />
              </Field>
              <Field label="Relationship" required>
                <input name="emergency_relationship" required className={inputCls} />
              </Field>
              <Field label="Phone Number" required className="md:col-span-2">
                <input name="emergency_phone" required className={inputCls} />
              </Field>
            </Grid>
          </Section>

          <Section title="Referral">
            <Grid>
              <Field label="How did you hear about Uget Academy?" required>
                <select name="heard_from" required className={selectCls}>
                  <option value="">Select…</option>
                  {["Facebook", "Instagram", "LinkedIn", "WhatsApp", "Friend/Referral", "Website", "Other"].map(
                    (o) => (
                      <option key={o}>{o}</option>
                    ),
                  )}
                </select>
              </Field>
              <Field label="Referral Code (required)" required>
                <input name="referral_code" required className={inputCls} />
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
                <li>Information provided in this application is accurate and truthful.</li>
              </ul>
            </div>
            <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" name="agreed_to_terms" required className="mt-1 h-4 w-4 accent-primary" />
              <span>
                I agree to the terms and conditions of the Uget Academy Tech Scholarship Cohort.
              </span>
            </label>
            <Grid>
              <Field label="Applicant Signature (full name)" required>
                <input name="signature" required className={inputCls} />
              </Field>
              <Field label="Date">
                <input value={new Date().toLocaleDateString()} readOnly className={inputCls + " opacity-70"} />
              </Field>
            </Grid>
          </Section>

          {status === "error" && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full rounded-full px-7 py-4 text-base font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-[1.01] disabled:opacity-60 disabled:hover:scale-100"
            style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow)" }}
          >
            {status === "submitting" ? "Submitting…" : "Submit Application"}
          </button>
        </form>
      </main>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Uget Technologies — Innovative Solutions for a Connected World
      </footer>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-input px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30 placeholder:text-muted-foreground";
const selectCls = inputCls + " appearance-none cursor-pointer";

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card/60 p-6 sm:p-8 shadow-sm">
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
  children: React.ReactNode;
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

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}
