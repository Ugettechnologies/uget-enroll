/**
 * One-off script: send fallback registration links to all unpaid students via Resend.
 *
 * Assumes:
 * - Environment variables are loaded from the local .env file or system environment.
 * - Fallback domain is https://uget-blog-seven.vercel.app (customizable below).
 *
 * Run with:
 *   npx tsx send-fallback-links.ts
 */

import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import * as fs from "fs";
import * as path from "path";

// Load environment variables from .env manually to avoid external dependencies
try {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        if (value.startsWith("'") && value.endsWith("'")) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    });
  }
} catch (e) {
  console.warn("Could not load .env file manually:", e);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const resendApiKey = process.env.VITE_RESEND_API_KEY;
const senderEmail = process.env.VITE_SENDER_EMAIL || "academy@uget-enrollment.online";

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: Supabase environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY / SUPABASE_SERVICE_ROLE_KEY) are required.");
  process.exit(1);
}

if (!resendApiKey) {
  console.error("Error: Resend API key (VITE_RESEND_API_KEY) is required.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const resend = new Resend(resendApiKey);

const FALLBACK_DOMAIN = "https://uget-enroll.vercel.app";
const FROM_ADDRESS = `Uget Academy <${senderEmail}>`;

interface Student {
  id: string;
  email: string;
  full_name: string | null;
}

function buildEmailHtml(name: string | null, link: string) {
  return `
    <div style="font-family: sans-serif; font-size: 15px; color: #222; line-height: 1.5; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <p>Hi ${name ?? "there"},</p>
      <p>Quick update on registration for the cohort.</p>
      <p>Our main site is showing a temporary browser security flag while we finish fixing it,
      so please use the link below to complete your registration/payment instead:</p>
      <p style="margin: 24px 0;">
        <a href="${link}" style="background:#7c3aed;color:#fff;padding:12px 24px;
        border-radius:30px;font-weight:bold;text-decoration:none;display:inline-block;box-shadow:0 4px 12px rgba(124,58,237,0.35);">
          Complete Registration
        </a>
      </p>
      <p>Or copy this link directly into your browser:<br/>
      <a href="${link}" style="color:#7c3aed;">${link}</a></p>
      <p>Sorry for the extra step — everything else about the process stays the same.
      Thanks for your patience!</p>
      <p style="margin-top:32px;border-top:1px solid #eee;padding-top:16px;font-size:13px;color:#666;">
        Warm regards,<br/>
        <strong>Uget Academy Team</strong>
      </p>
    </div>
  `;
}

async function main() {
  console.log("Fetching student applications from database...");
  const { data: students, error } = await supabase
    .from("scholarship_applications")
    .select("id, email, full_name")
    .not("email", "is", null);

  if (error) {
    console.error("Failed to fetch students:", error);
    process.exit(1);
  }

  if (!students || students.length === 0) {
    console.log("No students found.");
    return;
  }

  console.log(`Fetched ${students.length} applications from database.`);

  // Fetch payment statuses to exclude already Paid / Pending Verification candidates
  console.log("Checking payment statuses...");
  const { data: payments, error: paymentsError } = await supabase
    .from("payments")
    .select("application_id, payment_status");

  const paidAppIds = new Set<string>();
  if (paymentsError) {
    console.warn("Could not load payment statuses, fallback to notifying all fetched students:", paymentsError.message);
  } else if (payments) {
    payments.forEach((p) => {
      if (p.payment_status === "Paid" || p.payment_status === "Pending Verification") {
        paidAppIds.add(p.application_id);
      }
    });
  }

  const unpaidStudents = students.filter((s) => !paidAppIds.has(s.id));
  console.log(`Found ${unpaidStudents.length} unpaid students to notify.`);

  if (unpaidStudents.length === 0) {
    console.log("No unpaid students found. Exiting.");
    return;
  }

  console.log(`Preparing to send ${unpaidStudents.length} emails...`);

  // Resend's batch endpoint accepts up to 100 emails per call
  const chunkSize = 100;
  for (let i = 0; i < unpaidStudents.length; i += chunkSize) {
    const chunk = unpaidStudents.slice(i, i + chunkSize) as Student[];

    const batch = chunk.map((s) => {
      const link = `${FALLBACK_DOMAIN}/payment?id=${s.id}`;
      return {
        from: FROM_ADDRESS,
        to: s.email,
        subject: "Updated registration link — Uget Academy Cohort",
        html: buildEmailHtml(s.full_name, link),
      };
    });

    const { data, error: sendError } = await resend.batch.send(batch);

    if (sendError) {
      console.error(`Chunk starting at index ${i} failed:`, sendError);
    } else {
      console.log(`Sent chunk ${Math.floor(i / chunkSize) + 1}:`, data);
    }
  }

  console.log("Done.");
}

main();
