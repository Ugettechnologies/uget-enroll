/**
 * One-off script: send a welcome email to all PAID cohort students.
 * Notifies them that:
 *   - They are officially welcomed as Cohort 01 learners.
 *   - Classes kick off Monday, July 20th.
 *   - They should join the WhatsApp group to get started.
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

const WHATSAPP_GROUP_LINK = "https://chat.whatsapp.com/HRy8MCg1l42EMH6hvOtzOf";

// ─── Welcome Email HTML ──────────────────────────────────────────────────────
function buildEmailHtml(name: string | null, track: string | null) {
  const displayName = name ?? "Cohort 2 Learner";
  const displayTrack = track ? `for <strong style="color:#06b6d4;">${track}</strong>` : "";
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Welcome to Uget Academy Cohort 2 🎉</title>
</head>
<body style="margin:0;padding:0;background:#0d0a1a;font-family:'Inter',Arial,sans-serif;color:#f0eeff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:40px auto;background:#130f26;border-radius:24px;overflow:hidden;border:1px solid rgba(124,58,237,0.3);box-shadow:0 20px 40px rgba(0,0,0,0.5);">
    <!-- Header Logo -->
    <tr>
      <td style="padding:48px 36px 32px;background:linear-gradient(135deg,rgba(124,58,237,0.18) 0%,rgba(6,182,212,0.08) 100%);border-bottom:1px solid rgba(124,58,237,0.25);text-align:center;">
        <img src="https://uget-enrollment.online/uget-logo.png" alt="Uget Technologies Logo" style="width:160px;max-width:100%;height:auto;display:inline-block;margin-bottom:12px;" />
        <p style="margin:0;font-size:11px;font-weight:800;letter-spacing:0.35em;text-transform:uppercase;color:#06b6d4;">Academy · Cohort 2</p>
      </td>
    </tr>
    <!-- Content Body -->
    <tr>
      <td style="padding:40px 36px 32px;">
        <h2 style="margin:0 0 20px;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">Welcome to Uget Academy Cohort 2 🎉</h2>
        
        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#d0c8f0;">
          Hello <strong style="color:#ffffff;">${displayName}</strong>,
        </p>

        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#d0c8f0;">
          Congratulations! Your registration and enrollment payment of <strong style="color:#ffffff;">₦3,000</strong> ${displayTrack} have been verified and confirmed.
        </p>

        <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#d0c8f0;">
          Your seat in <strong style="color:#ffffff;">Cohort 2</strong> is officially secured. We are excited to support you on your 12-week intensive learning journey to master practical digital skills.
        </p>

        <!-- Community WhatsApp CTA Box -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border-radius:16px;overflow:hidden;border:1px solid rgba(37,211,102,0.35);background:rgba(37,211,102,0.06);">
          <tr>
            <td style="padding:22px 24px;text-align:center;">
              <p style="margin:0 0 8px;font-size:16px;font-weight:800;color:#25d366;">💬 Join Official Cohort 2 WhatsApp Group</p>
              <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#d0c8f0;">
                All class schedules, live sessions, project links, and mentor announcements will be shared inside the WhatsApp group. Join now:
              </p>
              <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto;">
                <tr>
                  <td align="center">
                    <a href="${WHATSAPP_GROUP_LINK}" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#25d366 0%,#128c7e 100%);padding:14px 36px;font-family:Arial,sans-serif;font-size:14px;font-weight:800;color:#ffffff;text-decoration:none;letter-spacing:0.06em;text-transform:uppercase;border-radius:9999px;box-shadow:0 8px 24px rgba(37,211,102,0.35);">
                      👉 Join WhatsApp Group
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:12px 0 0;font-size:12px;color:#8b80a8;">Or direct link: <a href="${WHATSAPP_GROUP_LINK}" style="color:#06b6d4;">${WHATSAPP_GROUP_LINK}</a></p>
            </td>
          </tr>
        </table>

        <!-- Support Box -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border-radius:16px;overflow:hidden;border:1px solid rgba(124,58,237,0.3);background:rgba(124,58,237,0.05);font-size:14px;color:#d0c8f0;">
          <tr>
            <td style="padding:18px 24px;line-height:1.6;">
              <strong style="color:#ffffff;">Need Assistance?</strong><br/>
              WhatsApp Support: <a href="https://wa.me/2348106175131" style="color:#06b6d4;font-weight:600;text-decoration:none;">+234 810 617 5131</a><br/>
              Email: <a href="mailto:ugettechnologies@gmail.com" style="color:#06b6d4;text-decoration:underline;">ugettechnologies@gmail.com</a>
            </td>
          </tr>
        </table>

        <p style="margin:20px 0 32px;font-size:15px;line-height:1.7;color:#d0c8f0;">
          We look forward to seeing what you'll achieve in Cohort 2!
        </p>

        <!-- Sign-off -->
        <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(124,58,237,0.2);padding-top:24px;">
          <tr>
            <td>
              <p style="margin:0;font-size:15px;line-height:1.7;color:#d0c8f0;">
                Warm regards,<br/>
                <strong style="color:#ffffff;">The Uget Academy Team</strong><br/>
                <span style="color:#8b83b0;font-size:13px;">Uget Technologies</span>
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
  const displayName = name ?? "Cohort 2 Learner";
  const trackLine = track ? ` for ${track}` : "";
  return `Subject: Welcome to Uget Academy Cohort 2 🎉 — Enrollment Confirmed

Hello ${displayName},

Congratulations! Your registration and enrollment payment of ₦3,000${trackLine} have been verified and confirmed.

Your seat in Cohort 2 is officially secured. We are excited to support you on your 12-week learning journey!

All class schedules, live sessions, project links, and mentor announcements will be shared inside our official WhatsApp community. Join now using the link below:

👉 ${WHATSAPP_GROUP_LINK}

Once you join, our coordinators will direct you into your specialized learning channel.

Need Assistance?
WhatsApp Support: +234 810 617 5131
Email: ugettechnologies@gmail.com

Warm regards,
The Uget Academy Team
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
      subject: `Welcome to UGET Academy — Cohort 01 🎉`,
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

  console.log(`\n🎉 Done! Sent Cohort 01 welcome emails to ${sentCount} paid students.`);
}

main();
