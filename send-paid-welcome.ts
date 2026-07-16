/**
 * One-off script: send a welcome email to all PAID cohort students.
 * Notifies them that:
 *   - Classes officially commence on Monday, July 20th.
 *   - They need a Discord account to be added to their respective class.
 *
 * Run with:
 *   npx tsx send-paid-welcome.ts
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
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?/);
      if (match) {
        const key = match[1];
        let value = match[2]?.trim() || "";
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
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
  console.error("Error: Supabase environment variables are required.");
  process.exit(1);
}

if (!resendApiKey) {
  console.error("Error: Resend API key (VITE_RESEND_API_KEY) is required.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const resend = new Resend(resendApiKey);

const FROM_ADDRESS = `Uget Academy <${senderEmail}>`;

// ─── Sending Limits and Controls ─────────────────────────────────────────────
const MAX_SEND_LIMIT: number | null = null;
const BATCH_SIZE = 100;
const DELAY_BETWEEN_BATCHES_MS = 1000;

interface Student {
  id: string;
  email: string;
  full_name: string | null;
  track: string | null;
}

// ─── Welcome Email HTML ──────────────────────────────────────────────────────
function buildEmailHtml(name: string | null, track: string | null) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Welcome to Uget Academy — Classes Start July 20th!</title>
</head>
<body style="margin:0;padding:0;background:#0d0a1a;font-family:'Inter',Arial,sans-serif;color:#f0eeff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:40px auto;background:#130f26;border-radius:24px;overflow:hidden;border:1px solid rgba(124,58,237,0.3);box-shadow:0 20px 40px rgba(0,0,0,0.5);">
    <!-- Header Logo -->
    <tr>
      <td style="padding:48px 36px 32px;background:linear-gradient(135deg,rgba(124,58,237,0.15) 0%,rgba(6,182,212,0.05) 100%);border-bottom:1px solid rgba(124,58,237,0.2);text-align:center;">
        <img src="https://uget-enroll.vercel.app/uget-logo.png" alt="Uget Technologies Logo" style="width:160px;max-width:100%;height:auto;display:inline-block;margin-bottom:12px;" />
        <p style="margin:0;font-size:11px;font-weight:800;letter-spacing:0.35em;text-transform:uppercase;color:#06b6d4;">Academy</p>
      </td>
    </tr>
    <!-- Content Body -->
    <tr>
      <td style="padding:40px 36px 32px;">

        <!-- Success banner -->
        <div style="background:linear-gradient(135deg,rgba(34,197,94,0.15) 0%,rgba(6,182,212,0.1) 100%);border:1px solid rgba(34,197,94,0.35);border-radius:16px;padding:20px 24px;margin-bottom:28px;text-align:center;">
          <p style="margin:0;font-size:22px;">🎉</p>
          <p style="margin:6px 0 0;font-size:16px;font-weight:800;color:#22c55e;">Payment Confirmed!</p>
          <p style="margin:4px 0 0;font-size:13px;color:#d0c8f0;">Your spot in Cohort 1 is officially secured.</p>
        </div>

        <h2 style="margin:0 0 20px;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">Welcome to Uget Academy, ${name ?? "Scholar"}!</h2>

        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#d0c8f0;">
          We are thrilled to officially welcome you to <strong style="color:#ffffff;">Uget Academy Cohort 1</strong>${track ? ` — <strong style="color:#ffffff;">${track}</strong> track` : ""}. Your payment has been received and your place in the cohort is confirmed.
        </p>

        <!-- Commencement notice -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border-radius:16px;overflow:hidden;border:1px solid rgba(6,182,212,0.3);background:rgba(6,182,212,0.05);">
          <tr>
            <td style="padding:20px 24px;">
              <p style="margin:0 0 8px;font-size:15px;font-weight:800;color:#06b6d4;">📅 Classes Commence — Monday, July 20th</p>
              <p style="margin:0;font-size:14px;line-height:1.7;color:#d0c8f0;">
                Cohort 1 officially begins on <strong style="color:#ffffff;">Monday, July 20th, 2026</strong>. Make sure you are available and ready to start on day one!
              </p>
            </td>
          </tr>
        </table>

        <!-- Discord notice -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border-radius:16px;overflow:hidden;border:1px solid rgba(124,58,237,0.3);background:rgba(124,58,237,0.05);">
          <tr>
            <td style="padding:20px 24px;">
              <p style="margin:0 0 8px;font-size:15px;font-weight:800;color:#a78bfa;">🎮 Action Required — Set Up Your Discord Account</p>
              <p style="margin:0 0 12px;font-size:14px;line-height:1.7;color:#d0c8f0;">
                All classes and cohort communication will take place on <strong style="color:#ffffff;">Discord</strong>. Please ensure you have an active Discord account before July 20th — you will be added to your respective class channel ahead of the start date.
              </p>
              <p style="margin:0;font-size:13px;line-height:1.7;color:#8b83b0;">
                If you don't have Discord yet, download it for free at 
                <a href="https://discord.com/download" target="_blank" style="color:#06b6d4;text-decoration:underline;">discord.com/download</a>.
                Once you have your account, reply to this email with your <strong style="color:#ffffff;">Discord username</strong> so we can add you to the right class.
              </p>
            </td>
          </tr>
        </table>

        <p style="margin:16px 0;font-size:15px;line-height:1.7;color:#d0c8f0;">
          We are excited to have you on this journey. Get ready for an intensive 12 weeks of learning, mentorship, hands-on projects, and community — all designed to fast-track your career in tech.
        </p>
        <p style="margin:16px 0 32px;font-size:15px;line-height:1.7;color:#d0c8f0;">
          If you have any questions in the meantime, do not hesitate to reach out at <a href="mailto:ugettechnologies@gmail.com" style="color:#06b6d4;text-decoration:underline;">ugettechnologies@gmail.com</a> or on WhatsApp at <a href="https://wa.me/2348106175131" style="color:#06b6d4;text-decoration:none;font-weight:600;">+234 810 617 5131</a>.
        </p>

        <!-- Sign-off -->
        <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(124,58,237,0.2);padding-top:24px;">
          <tr>
            <td>
              <p style="margin:0;font-size:15px;line-height:1.7;color:#d0c8f0;">
                See you on the 20th! 🚀<br/>
                <strong style="color:#ffffff;">Chiemena Erasmous</strong><br/>
                <span style="color:#8b83b0;font-size:13px;">Uget Technologies Team</span>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style="padding:24px 36px;background:#090714;border-top:1px solid rgba(124,58,237,0.15);text-align:center;">
        <p style="margin:0;font-size:12px;color:#635d7a;">© ${new Date().getFullYear()} Uget Academy / Uget Technologies. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// ─── Plain Text Version ──────────────────────────────────────────────────────
function buildEmailText(name: string | null, track: string | null) {
  return `Welcome to Uget Academy, ${name ?? "Scholar"}!

🎉 Payment Confirmed — Your Spot is Secured!

We are thrilled to officially welcome you to Uget Academy Cohort 1${track ? ` (${track} track)` : ""}. Your payment has been received and your place is confirmed.

📅 Classes Commence: Monday, July 20th, 2026.
Make sure you are available and ready to start on day one!

🎮 Action Required — Set Up Your Discord Account
All classes and cohort communication will take place on Discord. Please ensure you have an active Discord account before July 20th — you will be added to your respective class channel ahead of the start date.

If you don't have Discord yet, download it for free at: https://discord.com/download
Once you have your account, reply to this email with your Discord username so we can add you to the right class.

We are excited to have you on this journey. Get ready for 12 weeks of learning, mentorship, and real-world projects!

If you have any questions, reach out at ugettechnologies@gmail.com or WhatsApp: +234 810 617 5131.

See you on the 20th! 🚀
Chiemena Erasmous
Uget Technologies`.trim();
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log("Fetching PAID student applications from database...");

  // Fetch all applications with their payment records
  const { data: students, error } = await supabase
    .from("scholarship_applications")
    .select("id, email, full_name, track")
    .not("email", "is", null);

  if (error) {
    console.error("Failed to fetch students:", error);
    process.exit(1);
  }

  if (!students || students.length === 0) {
    console.log("No students found.");
    return;
  }

  console.log(`Fetched ${students.length} total applications.`);

  // Fetch payment statuses — only notify Paid students
  console.log("Checking payment statuses to filter paid students...");
  const { data: payments, error: paymentsError } = await supabase
    .from("payments")
    .select("application_id, payment_status");

  if (paymentsError) {
    console.error("Could not load payment statuses:", paymentsError.message);
    process.exit(1);
  }

  const paidAppIds = new Set<string>();
  if (payments) {
    payments.forEach((p) => {
      if (p.payment_status === "Paid") {
        paidAppIds.add(p.application_id);
      }
    });
  }

  let paidStudents = students.filter((s) => paidAppIds.has(s.id)) as Student[];
  console.log(`Found ${paidStudents.length} paid students to welcome.`);

  if (MAX_SEND_LIMIT !== null && paidStudents.length > MAX_SEND_LIMIT) {
    console.log(`⚠️ Capping sending queue to MAX_SEND_LIMIT of ${MAX_SEND_LIMIT} candidates.`);
    paidStudents = paidStudents.slice(0, MAX_SEND_LIMIT);
  }

  if (paidStudents.length === 0) {
    console.log("No paid students found. Exiting.");
    return;
  }

  console.log(`Preparing to send ${paidStudents.length} welcome emails...`);

  let sentCount = 0;

  for (let i = 0; i < paidStudents.length; i += BATCH_SIZE) {
    const chunk = paidStudents.slice(i, i + BATCH_SIZE);

    const batch = chunk.map((s) => ({
      from: FROM_ADDRESS,
      to: s.email,
      subject: `🎉 Welcome to Uget Academy Cohort 1 — Classes Start July 20th!`,
      html: buildEmailHtml(s.full_name, s.track),
      text: buildEmailText(s.full_name, s.track),
    }));

    try {
      const { data, error: sendError } = await resend.batch.send(batch);
      if (sendError) {
        console.error(`❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, sendError.message);
      } else {
        sentCount += chunk.length;
        console.log(`✅ Sent Batch ${Math.floor(i / BATCH_SIZE) + 1} (${chunk.length} emails):`, data);
      }
    } catch (e: any) {
      console.error(`❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} exception:`, e.message);
    }

    if (i + BATCH_SIZE < paidStudents.length) {
      console.log(`Waiting ${DELAY_BETWEEN_BATCHES_MS}ms before next batch...`);
      await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_BATCHES_MS));
    }
  }

  console.log(`\n🎉 Done! Sent welcome emails to ${sentCount} paid students.`);
}

main();
