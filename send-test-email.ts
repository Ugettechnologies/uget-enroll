/**
 * One-off script: Send a single test email via Resend to verify spam score and layout.
 * 
 * Run with:
 *   npx tsx send-test-email.ts <test-email-address>
 */

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

const resendApiKey = process.env.VITE_RESEND_API_KEY;
const senderEmail = process.env.VITE_SENDER_EMAIL || "academy@uget-enrollment.online";

if (!resendApiKey) {
  console.error("Error: Resend API key (VITE_RESEND_API_KEY) is required in .env");
  process.exit(1);
}

const resend = new Resend(resendApiKey);
const targetEmail = process.argv[2];

if (!targetEmail) {
  console.error("Error: Please provide a target email address.");
  console.log("Usage: npx tsx send-test-email.ts your-test-address@mail-tester.com");
  process.exit(1);
}

const FROM_ADDRESS = `Uget Academy <${senderEmail}>`;

function getTestHtml() {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Uget Academy Test Email</title>
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
        <h2 style="margin:0 0 20px;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">Spam and Design verification Test</h2>
        
        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#d0c8f0;">
          Hello <strong style="color:#ffffff;">Tester</strong>,
        </p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#d0c8f0;">
          This is an official test email from Uget Academy to check our domain deliverability score and make sure our 67 KB optimized logo renders perfectly in all mail clients.
        </p>

        <!-- CTA button -->
        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: 32px auto; width: 100%; text-align: center;">
          <tr>
            <td align="center">
              <a href="https://www.uget-enrollment.online/payment"
                 target="_blank"
                 style="display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #7c3aed 100%); padding: 16px 40px; font-family: Arial, sans-serif; font-size: 14px; font-weight: 800; color: #ffffff; text-decoration: none; letter-spacing: 0.08em; text-transform: uppercase; border-radius: 9999px; box-shadow: 0 8px 24px rgba(124,58,237,0.35);">
                VERIFY TEST SUCCESSFUL
              </a>
            </td>
          </tr>
        </table>

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
  </table>
</body>
</html>
  `.trim();
}

async function send() {
  console.log(`Sending a test email to ${targetEmail} from ${FROM_ADDRESS}...`);
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: targetEmail,
      subject: "Official Deliverability & Logo Test — Uget Academy",
      html: getTestHtml(),
    });

    if (error) {
      console.error("❌ Send failed:", error.message);
    } else {
      console.log("✅ Test email sent successfully!", data);
    }
  } catch (e: any) {
    console.error("❌ Exception during send:", e.message);
  }
}

send();
