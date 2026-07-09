/**
 * One-off script: send professional welcome offer emails to all unpaid cohort candidates.
 * It also exports a "whatsapp-messages.txt" file containing personalized WhatsApp messages
 * for each student to allow easy copy-pasting.
 *
 * Runs on:
 *   npx tsx send-welcome-offers.ts
 */

import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import * as fs from "fs";
import * as path from "path";

// Load environment variables from .env manually
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
  console.error("Error: Supabase credentials are required in .env");
  process.exit(1);
}

if (!resendApiKey) {
  console.error("Error: Resend API key is required in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const resend = new Resend(resendApiKey);

// Safe Fallback Domain
const FALLBACK_DOMAIN = "https://www.uget-enrollment.online";
const FROM_ADDRESS = `Uget Academy <${senderEmail}>`;

// ─── Course fees configuration ───────────────────────────────────────────────
const COURSE_FEES: Record<string, number> = {
  "Full-Stack Development": 30000,
  "Cybersecurity": 20000,
  "Virtual Assistance": 10000,
  "AI Automation & Data Annotation": 15000,
  "Frontend Development": 15000,
  "Backend Development": 15000,
  "UI/UX Design": 15000,
  "Graphic Design": 10000,
  "Data Analysis": 10000,
  "Content & Technical Writing": 10000,
  "Professional Video Editing": 10000,
  "Printing Technology": 10000,
  // Aliases
  "Full Stack Development": 30000,
  "Virtual Assistant": 10000,
  "AI Automation/Annotation": 15000,
  "Graphics Design": 10000,
  "Content/Technical Writing": 10000,
  "Graphics Printing": 10000,
};

function fmt(n: number) {
  return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtUsd(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getFeeDetails(track: string) {
  const baseNgn = COURSE_FEES[track] ?? 10000;
  let baseUsd = 10;
  if (baseNgn === 15000) baseUsd = 15;
  else if (baseNgn === 20000) baseUsd = 20;
  else if (baseNgn === 30000) baseUsd = 30;

  return {
    ngn: {
      total: baseNgn * 1.05,
    },
    usd: {
      total: baseUsd * 1.05,
    }
  };
}

// ─── Welcome Email HTML ──────────────────────────────────────────────────────
function buildEmailHtml(name: string, track: string, paymentUrl: string) {
  const feeDetails = getFeeDetails(track);
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Welcome to Uget Academy</title>
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
        <h2 style="margin:0 0 20px;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">Welcome to Uget Academy</h2>
        
        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#d0c8f0;">
          Hello <strong style="color:#ffffff;">${name}</strong>,
        </p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#d0c8f0;">
          Congratulations! You've secured a spot in Uget Academy's Cohort 1 for <strong style="color:#ffffff;">${track}</strong>.
        </p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#d0c8f0;">
          <strong style="color:#ffffff;">Program Fee:</strong> ${fmt(feeDetails.ngn.total)} (approximately ${fmtUsd(feeDetails.usd.total)})
        </p>
        <p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#facc15;font-weight:600;">
          ⚠️ <strong style="color:#ffffff;">Payment Window:</strong> Open now from Thursday, July 9th until it closes on <strong>Wednesday, July 15th</strong>. Please complete your payment before the 15th to secure your spot and give us time to process all registrations ahead of the start date.
        </p>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#06b6d4;font-weight:600;">
          📅 <strong style="color:#ffffff;">Commencement Date:</strong> Cohort 1 classes officially commence on <strong>Monday, July 20th</strong>.
        </p>

        <!-- Payment Details Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;border-radius:16px;overflow:hidden;border:1px solid rgba(124,58,237,0.3);background:rgba(124,58,237,0.05);font-size:14px;color:#d0c8f0;">
          <tr>
            <td style="padding:18px 24px;background:rgba(124,58,237,0.12);border-bottom:1px solid rgba(124,58,237,0.25);">
              <strong style="color:#ffffff;font-size:15px;">Payment Details (Nigeria)</strong>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px;line-height:1.6;">
              <span style="color:#8b83b0;">Bank:</span> <strong style="color:#ffffff;">Moniepoint</strong><br/>
              <span style="color:#8b83b0;">Account Number:</span> <strong style="color:#06b6d4;font-size:18px;font-family:monospace;letter-spacing:0.05em;">6743620799</strong><br/>
              <span style="color:#8b83b0;">Account Name:</span> <strong style="color:#ffffff;">Uget Technologies</strong>
            </td>
          </tr>
          <tr style="background:rgba(124,58,237,0.08);border-top:1px solid rgba(124,58,237,0.2);">
            <td style="padding:20px 24px;line-height:1.6;border-top:1px solid rgba(124,58,237,0.2);">
              <strong style="color:#ffffff;font-size:14px;">Payment Details (International Students)</strong><br/>
              <p style="margin:6px 0 0;font-size:13px;color:#d0c8f0;line-height:1.6;">
                Please contact us at <a href="mailto:ugettechnologies@gmail.com" style="color:#06b6d4;text-decoration:underline;">ugettechnologies@gmail.com</a> or via WhatsApp at <a href="https://wa.me/2348106175131" style="color:#06b6d4;text-decoration:none;font-weight:600;">+234 810 617 5131</a> and we'll guide you through the best payment option for your country.
              </p>
            </td>
          </tr>
        </table>

        <!-- CTA button -->
        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: 32px auto; width: 100%; text-align: center;">
          <tr>
            <td align="center">
              <a href="${paymentUrl}"
                 target="_blank"
                 style="display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #7c3aed 100%); padding: 16px 40px; font-family: Arial, sans-serif; font-size: 14px; font-weight: 800; color: #ffffff; text-decoration: none; letter-spacing: 0.08em; text-transform: uppercase; border-radius: 9999px; box-shadow: 0 8px 24px rgba(124,58,237,0.35);">
                PROCEED TO PAYMENT & VALIDATE
              </a>
            </td>
          </tr>
        </table>

        <p style="margin:16px 0;font-size:15px;line-height:1.7;color:#d0c8f0;">
          Once payment is confirmed, you'll receive your onboarding details, including access to the learning dashboard and your cohort schedule.
        </p>

        <p style="margin:16px 0 32px;font-size:15px;line-height:1.7;color:#d0c8f0;">
          If you have any questions before enrolling, feel free to reach out — we're happy to help.
        </p>

        <!-- Sign-off -->
        <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(124,58,237,0.2);padding-top:24px;">
          <tr>
            <td>
              <p style="margin:0;font-size:15px;line-height:1.7;color:#d0c8f0;">
                Warm regards,<br/>
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

// ─── Welcome Email Plain Text ───────────────────────────────────────────────
function buildEmailText(name: string, track: string, paymentUrl: string) {
  const feeDetails = getFeeDetails(track);
  return `Hello ${name},

Congratulations! You've secured a spot in Uget Academy's Cohort 1 for ${track}.

Program Fee: ${fmt(feeDetails.ngn.total)} (approximately ${fmtUsd(feeDetails.usd.total)})
Payment Window: Open now from Thursday, July 9th until it closes on Wednesday, July 15th. Please complete your payment before the 15th to secure your spot and allow us time to process all registrations ahead of the start date.
Commencement Date: Cohort 1 classes officially commence on Monday, July 20th.

Payment Details (Nigeria):
Bank: Moniepoint
Account Number: 6743620799
Account Name: Uget Technologies

Payment Details (International Students):
Please contact us at ugettechnologies@gmail.com or via WhatsApp at +234 810 617 5131 and we'll guide you through the best payment option for your country.

Confirm payment & validate scholarship here:
${paymentUrl}

Once payment is confirmed, you'll receive your onboarding details, including access to the learning dashboard and your cohort schedule.

If you have any questions before enrolling, feel free to reach out — we're happy to help.

Warm regards,
Chiemena Erasmous
Uget Technologies`.trim();
}

// ─── Personalized WhatsApp Message ─────────────────────────────────────────
function buildWhatsAppMessage(name: string | null) {
  return `Hello ${name || ""},\n\nKindly pls check your mail for update on the admission form. If not seen on the inbox, try to check your spam messages.`;
}

async function main() {
  console.log("Connecting to database and fetching applications...");
  const { data: students, error } = await supabase
    .from("scholarship_applications")
    .select("*, payments(payment_status)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch applications:", error);
    process.exit(1);
  }

  if (!students || students.length === 0) {
    console.log("No candidates found in database.");
    return;
  }

  // Filter out candidates who already paid or are pending verification
  const unpaidCandidates = students.filter((app: any) => {
    const p = Array.isArray(app.payments) ? app.payments[0] : app.payments;
    const status = p?.payment_status || "Unpaid";
    return status !== "Paid" && status !== "Pending Verification";
  });

  console.log(`Total database candidates: ${students.length}`);
  console.log(`Unpaid candidates to welcome: ${unpaidCandidates.length}`);

  if (unpaidCandidates.length === 0) {
    console.log("No unpaid candidates to notify. Exiting.");
    return;
  }

  // 1. Generate local file for WhatsApp copy-pasting
  console.log("Generating whatsapp-messages.txt file for manual sending...");
  let waFileContent = `========================================================================\n`;
  waFileContent += `Personalized WhatsApp messages for ${unpaidCandidates.length} cohort students\n`;
  waFileContent += `========================================================================\n\n`;

  unpaidCandidates.forEach((app, idx) => {
    const personalizedLink = `${FALLBACK_DOMAIN}/payment?id=${app.id}`;
    const waText = buildWhatsAppMessage(app.full_name);
    waFileContent += `[${idx + 1}] Student: ${app.full_name} | Phone: ${app.phone || "N/A"} | Email: ${app.email}\n`;
    waFileContent += `------------------------------------------------------------------------\n`;
    waFileContent += `${waText}\n`;
    waFileContent += `========================================================================\n\n`;
  });

  fs.writeFileSync(path.resolve(process.cwd(), "whatsapp-messages.txt"), waFileContent, "utf-8");
  console.log("✅ Created whatsapp-messages.txt successfully!");

  // 2. Send Emails via Resend Batch API
  console.log(`Preparing to batch email welcome offers to ${unpaidCandidates.length} students via Resend...`);

  const chunkSize = 100;
  let sentCount = 0;

  for (let i = 0; i < unpaidCandidates.length; i += chunkSize) {
    const chunk = unpaidCandidates.slice(i, i + chunkSize);

    const emailBatch = chunk.map((app) => {
      const personalizedLink = `${FALLBACK_DOMAIN}/payment?id=${app.id}`;
      const htmlContent = buildEmailHtml(app.full_name, app.track, personalizedLink);
      const textContent = buildEmailText(app.full_name, app.track, personalizedLink);

      return {
        from: FROM_ADDRESS,
        to: app.email,
        subject: `Welcome to Uget Academy — ${app.track} Cohort 1`,
        html: htmlContent,
        text: textContent,
      };
    });

    try {
      const { data, error: sendError } = await resend.batch.send(emailBatch);
      if (sendError) {
        console.error(`❌ Batch ${Math.floor(i / chunkSize) + 1} send failed:`, sendError.message);
      } else {
        sentCount += chunk.length;
        console.log(`✅ Sent Batch ${Math.floor(i / chunkSize) + 1} (${chunk.length} emails):`, data);
      }
    } catch (e: any) {
      console.error(`❌ Batch ${Math.floor(i / chunkSize) + 1} encountered an exception:`, e.message);
    }
  }

  console.log(`\n🎉 Script Finished!`);
  console.log(`- Welcomed ${sentCount} students via email using Resend.`);
  console.log(`- Stored ${unpaidCandidates.length} personalized WhatsApp messages in 'whatsapp-messages.txt'.`);
}

main();
