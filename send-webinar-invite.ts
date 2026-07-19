/**
 * One-off script: send a webinar invitation email to all registered (unpaid) cohort candidates.
 * Invites them to a special webinar on Wednesday, July 22nd at 8:00 PM.
 *
 * Run with:
 *   npx tsx send-webinar-invite.ts
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
const WEBINAR_WHATSAPP_LINK = "https://chat.whatsapp.com/HM8hzDeMHTYCZA8qY12Eek";

// ─── Sending Limits and Controls ─────────────────────────────────────────────
const MAX_SEND_LIMIT: number | null = null;
const BATCH_SIZE = 100;
const DELAY_BETWEEN_BATCHES_MS = 1000;

interface Candidate {
  id: string;
  email: string;
  full_name: string | null;
  track: string | null;
}

// ─── Webinar Email HTML ──────────────────────────────────────────────────────
function buildEmailHtml(name: string | null) {
  const displayName = name ?? "Valued Member";
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>You're Invited: UGET Academy Webinar — July 22nd 🎙️</title>
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

        <!-- Webinar banner -->
        <div style="background:linear-gradient(135deg,rgba(124,58,237,0.2) 0%,rgba(6,182,212,0.1) 100%);border:1px solid rgba(124,58,237,0.4);border-radius:16px;padding:24px;margin-bottom:28px;text-align:center;">
          <p style="margin:0;font-size:32px;">🎙️</p>
          <p style="margin:8px 0 4px;font-size:18px;font-weight:800;color:#ffffff;">A Special Webinar Just for You!</p>
          <p style="margin:0;font-size:13px;color:#a78bfa;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;">Cohort 01 — Wednesday, July 22nd · 8:00 PM</p>
        </div>

        <h2 style="margin:0 0 20px;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">Dear ${displayName},</h2>

        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#d0c8f0;">
          As a valued member of <strong style="color:#ffffff;">UGET Academy Cohort 01</strong>, we're excited to invite you to a special webinar happening this <strong style="color:#ffffff;">Wednesday, 22nd of July, by 8:00 PM sharp</strong> — no African time, we're starting on the dot! ⏰
        </p>

        <!-- What to expect -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border-radius:16px;overflow:hidden;border:1px solid rgba(124,58,237,0.3);background:rgba(124,58,237,0.05);">
          <tr>
            <td style="padding:18px 24px;background:rgba(124,58,237,0.12);border-bottom:1px solid rgba(124,58,237,0.25);">
              <strong style="color:#ffffff;font-size:15px;">✨ Here's what to expect:</strong>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid rgba(124,58,237,0.15);">
                    <p style="margin:0;font-size:14px;line-height:1.6;color:#d0c8f0;">
                      <span style="font-size:18px;">👥</span>&nbsp;&nbsp;<strong style="color:#ffffff;">Meet our instructors</strong> — get to know the experts who'll be guiding your learning journey
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid rgba(124,58,237,0.15);">
                    <p style="margin:0;font-size:14px;line-height:1.6;color:#d0c8f0;">
                      <span style="font-size:18px;">🌍</span>&nbsp;&nbsp;<strong style="color:#ffffff;">Real impact stories</strong> — hear how tech is shaping and transforming society today
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid rgba(124,58,237,0.15);">
                    <p style="margin:0;font-size:14px;line-height:1.6;color:#d0c8f0;">
                      <span style="font-size:18px;">🎓</span>&nbsp;&nbsp;<strong style="color:#ffffff;">A deeper look at UGET Academy</strong> — how the program works and how it'll benefit you
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;">
                    <p style="margin:0;font-size:14px;line-height:1.6;color:#d0c8f0;">
                      <span style="font-size:18px;">🤖</span>&nbsp;&nbsp;<strong style="color:#ffffff;">Future-proofing yourself</strong> — in this era, getting a job isn't as easy as it used to be. The ability to build and reinvent yourself is key to adapting in this age of AI, which is reshaping everything
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <p style="margin:16px 0 24px;font-size:15px;line-height:1.7;color:#d0c8f0;">
          This promises to be an exciting and inspiring session, so <strong style="color:#ffffff;">don't miss it!</strong>
        </p>

        <!-- WhatsApp group CTA -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border-radius:16px;overflow:hidden;border:1px solid rgba(37,211,102,0.35);background:rgba(37,211,102,0.05);">
          <tr>
            <td style="padding:20px 24px;">
              <p style="margin:0 0 8px;font-size:15px;font-weight:800;color:#25d366;">💬 Join Our Webinar Community Group</p>
              <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#d0c8f0;">
                Join our webinar community group below for all details and the live session link:
              </p>
              <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
                <tr>
                  <td align="center">
                    <a href="${WEBINAR_WHATSAPP_LINK}"
                       target="_blank"
                       style="display:inline-block;background:linear-gradient(135deg,#25d366 0%,#128c7e 100%);padding:14px 36px;font-family:Arial,sans-serif;font-size:14px;font-weight:800;color:#ffffff;text-decoration:none;letter-spacing:0.06em;text-transform:uppercase;border-radius:9999px;box-shadow:0 8px 24px rgba(37,211,102,0.3);">👉 Join Webinar Group</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <p style="margin:16px 0 32px;font-size:15px;line-height:1.7;color:#d0c8f0;">
          See you there — on time! 😉
        </p>

        <!-- Sign-off -->
        <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(124,58,237,0.2);margin-top:4px;padding-top:24px;">
          <tr>
            <td>
              <p style="margin:0;font-size:15px;line-height:1.7;color:#d0c8f0;">
                Warm regards,<br/>
                <strong style="color:#ffffff;">The UGET Academy Team</strong>
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
function buildEmailText(name: string | null) {
  const displayName = name ?? "Valued Member";
  return `Subject: A Special Webinar Just for You — Cohort 01! 🎙️

Dear ${displayName},

As a valued member of UGET Academy Cohort 01, we're excited to invite you to a special webinar happening this Wednesday, 22nd of July, by 8:00 PM sharp — no African time, we're starting on the dot! ⏰

Here's what to expect:

👥 Meet our instructors — get to know the experts who'll be guiding your learning journey

🌍 Real impact stories — hear how tech is shaping and transforming society today

🎓 A deeper look at UGET Academy — how the program works and how it'll benefit you

🤖 Future-proofing yourself — in this era, getting a job isn't as easy as it used to be. The ability to build and reinvent yourself is key to adapting in this age of AI, which is reshaping everything

This promises to be an exciting and inspiring session, so don't miss it!

Join our webinar community group below for all details and the live session link:

👉 ${WEBINAR_WHATSAPP_LINK}

See you there — on time! 😉

Warm regards,
The UGET Academy Team`.trim();
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log("Fetching registered (unpaid) candidates from database...");

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

  console.log(`Total database candidates: ${students.length}`);

  // Filter: only unpaid / not pending verification (i.e., registered but haven't paid)
  let unpaidCandidates = students.filter((app: any) => {
    const p = Array.isArray(app.payments) ? app.payments[0] : app.payments;
    const status = p?.payment_status || "Unpaid";
    return status !== "Paid" && status !== "Pending Verification";
  }) as Candidate[];

  console.log(`Unpaid/unverified candidates to invite: ${unpaidCandidates.length}`);

  if (MAX_SEND_LIMIT !== null && unpaidCandidates.length > MAX_SEND_LIMIT) {
    console.log(`⚠️ Capping sending queue to MAX_SEND_LIMIT of ${MAX_SEND_LIMIT} candidates.`);
    unpaidCandidates = unpaidCandidates.slice(0, MAX_SEND_LIMIT);
  }

  if (unpaidCandidates.length === 0) {
    console.log("No unpaid candidates to invite. Exiting.");
    return;
  }

  console.log(`Preparing to send ${unpaidCandidates.length} webinar invite emails...`);

  let sentCount = 0;

  for (let i = 0; i < unpaidCandidates.length; i += BATCH_SIZE) {
    const chunk = unpaidCandidates.slice(i, i + BATCH_SIZE);

    const batch = chunk.map((s) => ({
      from: FROM_ADDRESS,
      to: s.email,
      subject: `A Special Webinar Just for You — Cohort 01! 🎙️`,
      html: buildEmailHtml(s.full_name),
      text: buildEmailText(s.full_name),
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

    if (i + BATCH_SIZE < unpaidCandidates.length) {
      console.log(`Waiting ${DELAY_BETWEEN_BATCHES_MS}ms before next batch...`);
      await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_BATCHES_MS));
    }
  }

  console.log(`\n🎙️ Done! Sent webinar invites to ${sentCount} registered candidates.`);
}

main();
