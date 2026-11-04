/**
 * Utility functions for exporting and formatting student bio data
 * for seamless import into the Uget Academy platform (uget-academy).
 */

export interface StudentBioRecord {
  id: string;
  created_at?: string;
  track: string;
  track_reason?: string;
  full_name: string;
  email: string;
  phone: string;
  gender?: string;
  date_of_birth?: string | null;
  residential_address?: string | null;
  state_region?: string;
  country?: string;
  linkedin_url?: string | null;
  highest_qualification?: string;
  institution?: string | null;
  course_of_study?: string | null;
  current_status?: string;
  studied_before?: boolean;
  experience_level?: string;
  why_apply?: string;
  goals?: string;
  two_year_vision?: string;
  has_computer?: boolean;
  has_internet?: boolean;
  can_commit?: boolean;
  portfolio_url?: string | null;
  github_url?: string | null;
  design_profile_url?: string | null;
  other_links?: string | null;
  emergency_name?: string | null;
  emergency_relationship?: string | null;
  emergency_phone?: string | null;
  heard_from?: string;
  referral_code?: string | null;
  signature?: string;
  agreed_to_terms?: boolean;
  payment_status?: string | null;
  payment_sender?: string | null;
  payment_amount?: number | null;
  payment_date?: string | null;
  payment_ref?: string | null;
  [key: string]: any;
}

export function formatBioForAcademy(student: StudentBioRecord) {
  return {
    source_platform: "Uget Academy Admissions Portal",
    import_version: "2.0",
    extracted_at: new Date().toISOString(),
    student: {
      id: student.id,
      full_name: student.full_name,
      email: student.email,
      phone: student.phone || "",
      gender: student.gender || "Not specified",
      date_of_birth: student.date_of_birth || null,
      country: student.country || "Nigeria",
      state_region: student.state_region || "",
      residential_address: student.residential_address || "",
    },
    academic_profile: {
      track: student.track,
      track_reason: student.track_reason || "",
      highest_qualification: student.highest_qualification || "",
      institution: student.institution || "",
      course_of_study: student.course_of_study || "",
      current_status: student.current_status || "",
      experience_level: student.experience_level || "Beginner",
      studied_before: Boolean(student.studied_before),
      why_apply: student.why_apply || "",
      goals: student.goals || "",
      two_year_vision: student.two_year_vision || "",
    },
    technical_readiness: {
      has_computer: Boolean(student.has_computer),
      has_internet: Boolean(student.has_internet),
      can_commit: Boolean(student.can_commit),
    },
    portfolios_and_links: {
      github_url: student.github_url || null,
      linkedin_url: student.linkedin_url || null,
      portfolio_url: student.portfolio_url || null,
      design_profile_url: student.design_profile_url || null,
      other_links: student.other_links || null,
    },
    emergency_contact: {
      name: student.emergency_name || null,
      relationship: student.emergency_relationship || null,
      phone: student.emergency_phone || null,
    },
    enrollment_details: {
      cohort: "Cohort 1",
      referral_code: student.referral_code || null,
      heard_from: student.heard_from || null,
      signature: student.signature || null,
      registered_at: student.created_at || new Date().toISOString(),
      payment_status: student.payment_status || "Unpaid",
      payment_amount: student.payment_amount ?? null,
      payment_sender: student.payment_sender ?? null,
      payment_date: student.payment_date ?? null,
      payment_ref: student.payment_ref ?? null,
    },
  };
}

export function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

export function downloadJsonFile(data: any, filename: string) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadCsvFile(records: StudentBioRecord[], filename: string) {
  if (!records.length) return;
  const headers = [
    "id",
    "created_at",
    "full_name",
    "email",
    "phone",
    "track",
    "gender",
    "date_of_birth",
    "country",
    "state_region",
    "residential_address",
    "highest_qualification",
    "institution",
    "course_of_study",
    "current_status",
    "experience_level",
    "studied_before",
    "has_computer",
    "has_internet",
    "can_commit",
    "why_apply",
    "goals",
    "two_year_vision",
    "github_url",
    "linkedin_url",
    "portfolio_url",
    "design_profile_url",
    "other_links",
    "emergency_name",
    "emergency_relationship",
    "emergency_phone",
    "heard_from",
    "referral_code",
    "payment_status",
    "payment_amount",
    "payment_sender",
    "payment_date",
    "payment_ref",
  ];

  const escapeCell = (v: any) => {
    if (v === null || v === undefined) return '""';
    const s = String(v).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = records.map((rec) =>
    headers.map((key) => escapeCell(rec[key])).join(",")
  );

  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (err) {
    console.error("Failed to copy:", err);
    return false;
  }
}
