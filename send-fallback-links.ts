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

const FALLBACK_DOMAIN = "https://www.uget-enrollment.online";
const FROM_ADDRESS = `Uget Academy <${senderEmail}>`;

// ─── Sending Limits and Controls ─────────────────────────────────────────────
// Set MAX_SEND_LIMIT to control how many total emails are sent in one run.
// (e.g. set to 100 to stay under Resend Free Tier daily limits). Set to null for no limit.
const MAX_SEND_LIMIT: number | null = null; 
const BATCH_SIZE = 100; // Resend batch API limit is 100
const DELAY_BETWEEN_BATCHES_MS = 1000; // Delay between API calls in milliseconds

interface Student {
  id: string;
  email: string;
  full_name: string | null;
}

function buildEmailHtml(name: string | null, link: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Uget Academy Update: Cohort Starts July 20th &amp; Part-Payment Option</title>
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
        <h2 style="margin:0 0 20px;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">⚠️ Cohort Starts July 20th &amp; Part-Payment Window Open</h2>
        
        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#d0c8f0;">
          Hello <strong style="color:#ffffff;">${name ?? "Candidate"}</strong>,
        </p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#d0c8f0;">
          How are you doing? We hope this message finds you well!
        </p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#d0c8f0;">
          This is a gentle reminder that Uget Academy's Cohort 1 officially starts on <strong style="color:#ffffff;">Monday, July 20th</strong>.
        </p>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#facc15;font-weight:600;background:rgba(250,204,21,0.08);padding:14px 20px;border-radius:12px;border:1px solid rgba(250,204,21,0.25);">
          📢 <strong style="color:#ffffff;">Extended Window:</strong> Due to high demand for part-payment offer, we have integrated it and opened a <strong style="color:#ffffff;">two-week payment window starting now</strong> (during the cohort).
        </p>

        <!-- Part-Payment Offer Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border-radius:16px;overflow:hidden;border:1px solid rgba(124,58,237,0.4);background:rgba(124,58,237,0.08);font-size:14px;color:#d0c8f0;">
          <tr>
            <td style="padding:16px 24px;background:rgba(124,58,237,0.18);border-bottom:1px solid rgba(124,58,237,0.3);">
              <strong style="color:#ffffff;font-size:15px;">🎉 Part-Payment Terms — Pay Half During Cohort!</strong>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 24px;line-height:1.7;">
              <p style="margin:0 0 10px;">You can pay the 50% part-payment during the cohort:</p>
              <ul style="margin:0;padding-left:20px;line-height:1.9;">
                <li>Make a deposit of <strong style="color:#06b6d4;">50% during the cohort</strong> within the 2-week window.</li>
                <li>Spread and pay the <strong style="color:#ffffff;">remaining 50% balance later before the cohort ends</strong> to receive your certificate.</li>
              </ul>
              <p style="margin:10px 0 0;font-size:13px;color:#8b83b0;">Choose Full Payment or Part-Payment on your enrollment portal.</p>
            </td>
          </tr>
        </table>

        <!-- CTA button -->
        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: 32px auto; width: 100%; text-align: center;">
          <tr>
            <td align="center">
              <a href="${link}"
                 target="_blank"
                 style="display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #7c3aed 100%); padding: 16px 40px; font-family: Arial, sans-serif; font-size: 14px; font-weight: 800; color: #ffffff; text-decoration: none; letter-spacing: 0.08em; text-transform: uppercase; border-radius: 9999px; box-shadow: 0 8px 24px rgba(124,58,237,0.35);">
                COMPLETE PAYMENT NOW
              </a>
            </td>
          </tr>
        </table>

        <p style="margin:16px 0 24px;font-size:14px;line-height:1.7;color:#8b83b0;text-align:center;">
          Or copy and paste this link into your browser:<br/>
          <a href="${link}" style="color:#06b6d4;text-decoration:underline;">${link}</a>
        </p>

        <p style="margin:16px 0 32px;font-size:15px;line-height:1.7;color:#d0c8f0;">
          If you have already made your payment, please disregard this message — your slot is secure and we look forward to welcoming you!
        </p>

        <!-- Sign-off -->
        <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(124,58,237,0.2);padding-top:24px;">
          <tr>
            <td>
              <p style="margin:0;font-size:15px;line-height:1.7;color:#d0c8f0;">
                Warm regards,<br/>
                <strong style="color:#ffffff;">Uget Academy Team</strong><br/>
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

  let unpaidStudents = students.filter((s) => !paidAppIds.has(s.id));
  console.log(`Found ${unpaidStudents.length} unpaid students to notify.`);

  if (MAX_SEND_LIMIT !== null && unpaidStudents.length > MAX_SEND_LIMIT) {
    console.log(`⚠️ Capping sending queue to MAX_SEND_LIMIT of ${MAX_SEND_LIMIT} candidates.`);
    unpaidStudents = unpaidStudents.slice(0, MAX_SEND_LIMIT);
  }

  if (unpaidStudents.length === 0) {
    console.log("No unpaid students found. Exiting.");
    return;
  }

  console.log(`Preparing to send ${unpaidStudents.length} emails...`);

  for (let i = 0; i < unpaidStudents.length; i += BATCH_SIZE) {
    const chunk = unpaidStudents.slice(i, i + BATCH_SIZE) as Student[];

    const batch = chunk.map((s) => {
      const link = `${FALLBACK_DOMAIN}/payment?id=${s.id}`;
      return {
        from: FROM_ADDRESS,
        to: s.email,
        subject: "⚠️ Uget Academy Update: Cohort Starts July 20th & Part-Payment Option Window Open",
        html: buildEmailHtml(s.full_name, link),
      };
    });

    const { data, error: sendError } = await resend.batch.send(batch);

    if (sendError) {
      console.error(`Chunk starting at index ${i} failed:`, sendError);
    } else {
      console.log(`Sent chunk ${Math.floor(i / BATCH_SIZE) + 1}:`, data);
    }

    // Wait between batches to respect Resend rate limits
    if (i + BATCH_SIZE < unpaidStudents.length) {
      console.log(`Waiting ${DELAY_BETWEEN_BATCHES_MS}ms before sending next batch to respect rate limits...`);
      await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_BATCHES_MS));
    }
  }

  console.log("Done.");
}

main();
