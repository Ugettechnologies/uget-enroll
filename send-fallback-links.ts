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
  <title>Uget Academy Registration Update</title>
</head>
<body style="margin:0;padding:0;background:#0d0a1a;font-family:'Inter',Arial,sans-serif;color:#f0eeff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:40px auto;background:#130f26;border-radius:24px;overflow:hidden;border:1px solid rgba(124,58,237,0.3);box-shadow:0 20px 40px rgba(0,0,0,0.5);">
    <!-- Header Logo -->
    <tr>
      <td style="padding:48px 36px 32px;background:linear-gradient(135deg,rgba(124,58,237,0.15) 0%,rgba(6,182,212,0.05) 100%);border-bottom:1px solid rgba(124,58,237,0.2);text-align:center;">
        <img src="https://www.uget-enrollment.online/uget-logo.png" alt="Uget Technologies Logo" style="width:160px;max-width:100%;height:auto;display:inline-block;margin-bottom:12px;" />
        <p style="margin:0;font-size:11px;font-weight:800;letter-spacing:0.35em;text-transform:uppercase;color:#06b6d4;">Academy</p>
      </td>
    </tr>
    <!-- Content Body -->
    <tr>
      <td style="padding:40px 36px 32px;">
        <h2 style="margin:0 0 20px;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">Important Registration Update</h2>
        
        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#d0c8f0;">
          Hello <strong style="color:#ffffff;">${name ?? "Candidate"}</strong>,
        </p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#d0c8f0;">
          This is a quick update regarding your cohort registration at Uget Academy.
        </p>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#d0c8f0;">
          Our main website is currently undergoing scheduled maintenance and showing a temporary security notice. To ensure your registration is processed securely and without delay, please use our verified enrollment portal link below:
        </p>

        <!-- CTA button -->
        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: 32px auto; width: 100%; text-align: center;">
          <tr>
            <td align="center">
              <a href="${link}"
                 target="_blank"
                 style="display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #7c3aed 100%); padding: 16px 40px; font-family: Arial, sans-serif; font-size: 14px; font-weight: 800; color: #ffffff; text-decoration: none; letter-spacing: 0.08em; text-transform: uppercase; border-radius: 9999px; box-shadow: 0 8px 24px rgba(124,58,237,0.35);">
                COMPLETE REGISTRATION & PAYMENT
              </a>
            </td>
          </tr>
        </table>

        <p style="margin:16px 0 24px;font-size:14px;line-height:1.7;color:#8b83b0;text-align:center;">
          Or copy and paste this link into your browser:<br/>
          <a href="${link}" style="color:#06b6d4;text-decoration:underline;">${link}</a>
        </p>

        <p style="margin:16px 0;font-size:15px;line-height:1.7;color:#d0c8f0;">
          All payment details, including course structures, discount offers, and registration status remain completely unaffected and secure.
        </p>
        <p style="margin:16px 0 32px;font-size:15px;line-height:1.7;color:#d0c8f0;">
          Thank you for your patience and understanding as we optimize our systems.
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
