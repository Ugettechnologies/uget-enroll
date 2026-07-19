import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, Fragment, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { sendEmailFn } from "@/lib/email";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { COURSE_FEES, fmt, fmtUsd, getFeeDetails } from "./payment";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Settings, ChevronDown, ChevronUp, Mail, MessageSquare, Send, Copy, Check, ExternalLink, Search, X, ArrowUpDown } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminWrapper,
});

// ─── Email template ──────────────────────────────────────────────────────────
function buildEmailHtml(name: string, track: string, fee: number, paymentUrl: string) {
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
        <img src="https://uget-enroll.vercel.app/uget-logo.png" alt="Uget Technologies Logo" style="width:160px;max-width:100%;height:auto;display:inline-block;margin-bottom:12px;" />
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

function buildEmailText(name: string, track: string, fee: number, paymentUrl: string) {
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

function getWhatsAppMessage(app: any, paymentUrl?: string) {
  return `Hello ${app.full_name},\n\nThis is from Uget Academy Cohort 1. Kindly check your email for an update on the admission form. If you do not see it in your inbox, please check your spam folder.`;
}

function buildDeadlineEmailHtml(name: string, track: string, paymentUrl: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Payment Reminder — Secure Your Spot by July 19th</title>
</head>
<body style="margin:0;padding:0;background:#0d0a1a;font-family:'Inter',Arial,sans-serif;color:#f0eeff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:40px auto;background:#130f26;border-radius:24px;overflow:hidden;border:1px solid rgba(239,68,68,0.3);box-shadow:0 20px 40px rgba(0,0,0,0.5);">
    <!-- Header Logo -->
    <tr>
      <td style="padding:48px 36px 32px;background:linear-gradient(135deg,rgba(239,68,68,0.15) 0%,rgba(6,182,212,0.05) 100%);border-bottom:1px solid rgba(239,68,68,0.2);text-align:center;">
        <img src="https://uget-enroll.vercel.app/uget-logo.png" alt="Uget Technologies Logo" style="width:160px;max-width:100%;height:auto;display:inline-block;margin-bottom:12px;" />
        <p style="margin:0;font-size:11px;font-weight:800;letter-spacing:0.35em;text-transform:uppercase;color:#f87171;">Academy</p>
      </td>
    </tr>
    <!-- Content Body -->
    <tr>
      <td style="padding:40px 36px 32px;">
        <h2 style="margin:0 0 20px;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">Important Update: Cohort Starts July 20th &amp; Part-Payment Window Open</h2>
        
        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#d0c8f0;">
          Hello <strong style="color:#ffffff;">${name}</strong>,
        </p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#d0c8f0;">
          How are you doing? We hope this message finds you well!
        </p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#d0c8f0;">
          This is a gentle reminder regarding your admission offer to Uget Academy's Cohort 1 for <strong style="color:#ffffff;">${track}</strong>. We want to inform you that our classes will officially commence on <strong style="color:#ffffff;">Monday, July 20th, 2026</strong>.
        </p>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#facc15;font-weight:600;background:rgba(250,204,21,0.08);padding:14px 20px;border-radius:12px;border:1px solid rgba(250,204,21,0.25);">
          📢 <strong style="color:#ffffff;">Extended Window:</strong> Due to extremely high demand for the part-payment option, we have opened a <strong style="color:#ffffff;">two-week payment window starting now</strong> (during the cohort).
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
              <p style="margin:10px 0 0;font-size:13px;color:#8b83b0;">Choose Full Payment or Part-Payment on your enrollment portal below.</p>
            </td>
          </tr>
        </table>

        <!-- Portal Details Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;border-radius:16px;overflow:hidden;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.02);font-size:14px;color:#d0c8f0;">
          <tr>
            <td style="padding:18px 24px;background:rgba(239,68,68,0.08);border-bottom:1px solid rgba(239,68,68,0.15);">
              <strong style="color:#ffffff;font-size:15px;">Payment Verification Portal</strong>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px;line-height:1.6;">
              Visit your personalized portal to choose your payment type (Full or Part-Payment), make the transfer, and upload your receipt for immediate verification.
            </td>
          </tr>
        </table>

        <!-- CTA button -->
        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: 32px auto; width: 100%; text-align: center;">
          <tr>
            <td align="center">
              <a href="${paymentUrl}"
                 target="_blank"
                 style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #7c3aed 100%); padding: 16px 40px; font-family: Arial, sans-serif; font-size: 14px; font-weight: 800; color: #ffffff; text-decoration: none; letter-spacing: 0.08em; text-transform: uppercase; border-radius: 9999px; box-shadow: 0 8px 24px rgba(239,68,68,0.35);">
                GO TO PORTAL &amp; COMPLETE PAYMENT
              </a>
            </td>
          </tr>
        </table>

        <p style="margin:16px 0 32px;font-size:15px;line-height:1.7;color:#d0c8f0;">
          If you are an international student requiring localized payment options, or have any other questions, please contact our coordinator via WhatsApp at <a href="https://wa.me/2348106175131" style="color:#06b6d4;text-decoration:none;font-weight:600;">+234 810 617 5131</a>.
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

function buildDeadlineEmailText(name: string, track: string, paymentUrl: string) {
  return `Hello ${name},

How are you doing? We hope this message finds you well!

This is a gentle reminder regarding your admission offer to Uget Academy's Cohort 1 for ${track}. Official classes will commence on Monday, July 20th, 2026.

Important Update: Due to extremely high demand for the part-payment option, we have opened a two-week payment window starting now (during the cohort).

--- 50% PART-PAYMENT OPTION AVAILABLE ---
You can pay the 50% part-payment during the cohort:
- Make a deposit of 50% during the cohort (within the 2-week window).
- Spread and pay the remaining 50% balance later before the cohort ends to receive your certificate.
You can choose Full Payment or Part-Payment on your enrollment portal.
-----------------------------------------

Go to your portal to choose your payment option and submit details:
${paymentUrl}

If you are an international student requiring localized payment options, or have any other questions, please contact our coordinator via WhatsApp at +234 810 617 5131.

Warm regards,
Chiemena Erasmous
Uget Technologies`.trim();
}

function buildClassStartsEmailHtml(name: string, track: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Class Commencement Alert — Uget Academy</title>
</head>
<body style="margin:0;padding:0;background:#0d0a1a;font-family:'Inter',Arial,sans-serif;color:#f0eeff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:40px auto;background:#130f26;border-radius:24px;overflow:hidden;border:1px solid rgba(6,182,212,0.3);box-shadow:0 20px 40px rgba(0,0,0,0.5);">
    <!-- Header Logo -->
    <tr>
      <td style="padding:48px 36px 32px;background:linear-gradient(135deg,rgba(6,182,212,0.15) 0%,rgba(124,58,237,0.05) 100%);border-bottom:1px solid rgba(6,182,212,0.2);text-align:center;">
        <img src="https://uget-enroll.vercel.app/uget-logo.png" alt="Uget Technologies Logo" style="width:160px;max-width:100%;height:auto;display:inline-block;margin-bottom:12px;" />
        <p style="margin:0;font-size:11px;font-weight:800;letter-spacing:0.35em;text-transform:uppercase;color:#06b6d4;">Academy</p>
      </td>
    </tr>
    <!-- Content Body -->
    <tr>
      <td style="padding:40px 36px 32px;">
        <h2 style="margin:0 0 20px;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">Classes Start July 20th</h2>
        
        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#d0c8f0;">
          Hello <strong style="color:#ffffff;">${name}</strong>,
        </p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#d0c8f0;">
          Congratulations once again on securing your spot in Uget Academy's Cohort 1 for <strong style="color:#ffffff;">${track}</strong>!
        </p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#d0c8f0;">
          We are pleased to inform you that your payment has been verified, and your enrollment is officially complete.
        </p>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#06b6d4;font-weight:600;background:rgba(6,182,212,0.1);padding:14px 20px;border-radius:12px;border:1px solid rgba(6,182,212,0.25);">
          🚀 <strong style="color:#ffffff;">Start Date:</strong> Official classes will commence on <strong style="color:#ffffff;text-decoration:underline;">Monday, July 20th, 2026</strong>.
        </p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#d0c8f0;">
          In the coming days, you will receive an onboarding email containing your learning dashboard access credentials, Discord workspace invitation, and the schedule details for our first session.
        </p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#d0c8f0;">
          Please ensure you check your email regularly so you do not miss these setup instructions. If you have any immediate questions, feel free to reply directly to this email or chat with us on WhatsApp.
        </p>

        <!-- Support Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border-radius:16px;overflow:hidden;border:1px solid rgba(124,58,237,0.3);background:rgba(124,58,237,0.05);font-size:14px;color:#d0c8f0;">
          <tr>
            <td style="padding:18px 24px;background:rgba(124,58,237,0.12);border-bottom:1px solid rgba(124,58,237,0.25);">
              <strong style="color:#ffffff;font-size:15px;">Need Help?</strong>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px;line-height:1.6;">
              WhatsApp Support: <strong style="color:#ffffff;">+234 810 617 5131</strong><br/>
              Email: <a href="mailto:ugettechnologies@gmail.com" style="color:#06b6d4;text-decoration:underline;">ugettechnologies@gmail.com</a>
            </td>
          </tr>
        </table>

        <p style="margin:16px 0 32px;font-size:15px;line-height:1.7;color:#d0c8f0;">
          We are thrilled to welcome you to this cohort and look forward to an amazing learning journey together.
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

function buildClassStartsEmailText(name: string, track: string) {
  return `Hello ${name},

Congratulations once again on securing your spot in Uget Academy's Cohort 1 for ${track}!

We are pleased to inform you that your payment has been verified, and your enrollment is officially complete.

Start Date: Official classes will commence on Monday, July 20th, 2026.

In the coming days, you will receive an onboarding email containing your learning dashboard access credentials, Discord workspace invitation, and the schedule details for our first session.

Please ensure you check your email regularly so you do not miss these setup instructions. If you have any immediate questions, feel free to reply to this email or chat with us on WhatsApp at +234 810 617 5131.

Warm regards,
Chiemena Erasmous
Uget Technologies`.trim();
}

function getDeadlineWhatsAppMessage(app: any, paymentUrl: string) {
  return `Hello ${app.full_name},\n\nHow are you doing? We hope you are doing well!\n\nThis is a gentle reminder regarding your Uget Academy Cohort 1 offer for ${app.track}.\n\nClasses officially start on Monday, July 20th.\n\n🎉 NEW — Cohort Part-Payment: Due to high demand, a two-week window starting now is open (during the cohort). You can make a deposit of 50% during the cohort and spread the remaining 50% later before the cohort ends.\n\nVisit your enrollment portal to choose Full or Part-Payment and submit your confirmation:\n${paymentUrl}\n\nIf you have any questions, let us know. We look forward to welcoming you!\n\nWarm regards,\nChiemena Erasmous\nUget Technologies`;
}

function getClassStartsWhatsAppMessage(app: any) {
  return `Hello ${app.full_name},\n\nCongratulations! Your payment has been verified, and your spot in Uget Academy Cohort 1 for ${app.track} is secured.\n\nStart Date: Official classes will commence on Monday, July 20th, 2026.\n\nKeep an eye on your email for dashboard access details and our Discord invitation. We look forward to starting this journey with you!\n\nWarm regards,\nChiemena Erasmous\nUget Technologies`;
}


const WEBINAR_WA_LINK = "https://chat.whatsapp.com/HM8hzDeMHTYCZA8qY12Eek";

function buildWebinarEmailHtml(name: string) {
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
    <tr>
      <td style="padding:48px 36px 32px;background:linear-gradient(135deg,rgba(124,58,237,0.15) 0%,rgba(6,182,212,0.05) 100%);border-bottom:1px solid rgba(124,58,237,0.2);text-align:center;">
        <img src="https://uget-enroll.vercel.app/uget-logo.png" alt="Uget Technologies Logo" style="width:160px;max-width:100%;height:auto;display:inline-block;margin-bottom:12px;" />
        <p style="margin:0;font-size:11px;font-weight:800;letter-spacing:0.35em;text-transform:uppercase;color:#06b6d4;">Academy</p>
      </td>
    </tr>
    <tr>
      <td style="padding:40px 36px 32px;">
        <div style="background:linear-gradient(135deg,rgba(124,58,237,0.2) 0%,rgba(6,182,212,0.1) 100%);border:1px solid rgba(124,58,237,0.4);border-radius:16px;padding:24px;margin-bottom:28px;text-align:center;">
          <p style="margin:0;font-size:32px;">🎙️</p>
          <p style="margin:8px 0 4px;font-size:18px;font-weight:800;color:#ffffff;">A Special Webinar Just for You!</p>
          <p style="margin:0;font-size:13px;color:#a78bfa;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;">Cohort 01 — Wednesday, July 22nd · 8:00 PM</p>
        </div>
        <h2 style="margin:0 0 20px;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">Dear ${name},</h2>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#d0c8f0;">
          As a valued member of <strong style="color:#ffffff;">UGET Academy Cohort 01</strong>, we're excited to invite you to a special webinar happening this <strong style="color:#ffffff;">Wednesday, 22nd of July, by 8:00 PM sharp</strong> — no African time, we're starting on the dot! ⏰
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border-radius:16px;overflow:hidden;border:1px solid rgba(124,58,237,0.3);background:rgba(124,58,237,0.05);">
          <tr><td style="padding:18px 24px;background:rgba(124,58,237,0.12);border-bottom:1px solid rgba(124,58,237,0.25);"><strong style="color:#ffffff;font-size:15px;">✨ Here's what to expect:</strong></td></tr>
          <tr><td style="padding:20px 24px;">
            <p style="margin:0 0 10px;font-size:14px;line-height:1.6;color:#d0c8f0;">👥 <strong style="color:#ffffff;">Meet our instructors</strong> — get to know the experts who'll be guiding your learning journey</p>
            <p style="margin:0 0 10px;font-size:14px;line-height:1.6;color:#d0c8f0;">🌍 <strong style="color:#ffffff;">Real impact stories</strong> — hear how tech is shaping and transforming society today</p>
            <p style="margin:0 0 10px;font-size:14px;line-height:1.6;color:#d0c8f0;">🎓 <strong style="color:#ffffff;">A deeper look at UGET Academy</strong> — how the program works and how it'll benefit you</p>
            <p style="margin:0;font-size:14px;line-height:1.6;color:#d0c8f0;">🤖 <strong style="color:#ffffff;">Future-proofing yourself</strong> — in this era, getting a job isn't as easy as it used to be. The ability to build and reinvent yourself is key to adapting in this age of AI, which is reshaping everything</p>
          </td></tr>
        </table>
        <p style="margin:16px 0 24px;font-size:15px;line-height:1.7;color:#d0c8f0;">This promises to be an exciting and inspiring session, so <strong style="color:#ffffff;">don't miss it!</strong></p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border-radius:16px;overflow:hidden;border:1px solid rgba(37,211,102,0.35);background:rgba(37,211,102,0.05);">
          <tr><td style="padding:20px 24px;">
            <p style="margin:0 0 8px;font-size:15px;font-weight:800;color:#25d366;">💬 Join Our Webinar Community Group</p>
            <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#d0c8f0;">Join our webinar community group below for all details and the live session link:</p>
            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;"><tr><td align="center">
              <a href="${WEBINAR_WA_LINK}" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#25d366 0%,#128c7e 100%);padding:14px 36px;font-family:Arial,sans-serif;font-size:14px;font-weight:800;color:#ffffff;text-decoration:none;letter-spacing:0.06em;text-transform:uppercase;border-radius:9999px;box-shadow:0 8px 24px rgba(37,211,102,0.3);">👉 Join Webinar Group</a>
            </td></tr></table>
          </td></tr>
        </table>
        <p style="margin:16px 0 32px;font-size:15px;line-height:1.7;color:#d0c8f0;">See you there — on time! 😉</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(124,58,237,0.2);margin-top:4px;padding-top:24px;">
          <tr><td><p style="margin:0;font-size:15px;line-height:1.7;color:#d0c8f0;">Warm regards,<br/><strong style="color:#ffffff;">The UGET Academy Team</strong></p></td></tr>
        </table>
      </td>
    </tr>
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

function buildWebinarEmailText(name: string) {
  return `Dear ${name},

As a valued member of UGET Academy Cohort 01, we're excited to invite you to a special webinar happening this Wednesday, 22nd of July, by 8:00 PM sharp — no African time, we're starting on the dot! ⏰

Here's what to expect:

👥 Meet our instructors — get to know the experts who'll be guiding your learning journey
🌍 Real impact stories — hear how tech is shaping and transforming society today
🎓 A deeper look at UGET Academy — how the program works and how it'll benefit you
🤖 Future-proofing yourself — in this era, getting a job isn't as easy as it used to be. The ability to build and reinvent yourself is key to adapting in this age of AI, which is reshaping everything

This promises to be an exciting and inspiring session, so don't miss it!

Join our webinar community group for all details and the live session link:
👉 ${WEBINAR_WA_LINK}

See you there — on time! 😉

Warm regards,
The UGET Academy Team`.trim();
}

function getWebinarWhatsAppMessage(app: any) {
  return `Hello ${app.full_name},\n\nAs a valued member of UGET Academy Cohort 01, we're excited to invite you to a special webinar this Wednesday, 22nd of July, by 8:00 PM sharp — no African time, we're starting on the dot! ⏰\n\nHere's what to expect:\n👥 Meet our instructors\n🌍 Real impact stories from tech\n🎓 A deeper look at UGET Academy\n🤖 Future-proofing yourself in the age of AI\n\nJoin our webinar community group for all details and the live session link:\n👉 ${WEBINAR_WA_LINK}\n\nSee you there — on time! 😉\n\nWarm regards,\nThe UGET Academy Team`;
}

// ─── Auth wrapper ─────────────────────────────────────────────────────────────
function AdminWrapper() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("adminAuth") === "true";
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "uget@admin" && password === "admin@10717") {
      setIsAuthenticated(true);
      sessionStorage.setItem("adminAuth", "true");
      setError("");
    } else {
      setError("Invalid email or password");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background/50">
        <div className="w-full max-w-md p-8 space-y-6 bg-card border rounded-xl shadow-lg">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Admin Login</h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access the dashboard
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <AdminDashboard
      onLogout={() => {
        setIsAuthenticated(false);
        sessionStorage.removeItem("adminAuth");
      }}
    />
  );
}

// ─── Notify modal ─────────────────────────────────────────────────────────────
function NotifyModal({
  app,
  onClose,
  resendKey,
  brevoKey,
  emailProvider,
  senderEmail,
  paymentUrl,
  onNotified,
}: {
  app: any;
  onClose: () => void;
  resendKey: string;
  brevoKey: string;
  emailProvider: "resend" | "brevo";
  senderEmail: string;
  paymentUrl: string;
  onNotified: () => void;
}) {
  const [templateType, setTemplateType] = useState<"offer" | "deadline" | "class_starts" | "webinar">(() => {
    return app.payment_status === "Paid" ? "class_starts" : "deadline";
  });

  const fee = COURSE_FEES[app.track] ?? 0;
  const personalizedPaymentUrl = paymentUrl.includes("?")
    ? `${paymentUrl}&id=${app.id}`
    : `${paymentUrl}?id=${app.id}`;

  let subject = `Welcome to Uget Academy — ${app.track} Cohort 1`;
  let html = "";
  let text = "";
  let waTextRaw = "";

  if (templateType === "class_starts") {
    subject = `Congratulations! Class Commences July 13th — Uget Academy`;
    html = buildClassStartsEmailHtml(app.full_name, app.track);
    text = buildClassStartsEmailText(app.full_name, app.track);
    waTextRaw = getClassStartsWhatsAppMessage(app);
  } else if (templateType === "deadline") {
    subject = `Action Required: Secure Your Spot at Uget Academy`;
    html = buildDeadlineEmailHtml(app.full_name, app.track, personalizedPaymentUrl);
    text = buildDeadlineEmailText(app.full_name, app.track, personalizedPaymentUrl);
    waTextRaw = getDeadlineWhatsAppMessage(app, personalizedPaymentUrl);
  } else if (templateType === "webinar") {
    subject = `A Special Webinar Just for You — Cohort 01! 🎙️`;
    html = buildWebinarEmailHtml(app.full_name);
    text = buildWebinarEmailText(app.full_name);
    waTextRaw = getWebinarWhatsAppMessage(app);
  } else {
    subject = `Welcome to Uget Academy — ${app.track} Cohort 1`;
    html = buildEmailHtml(app.full_name, app.track, fee, personalizedPaymentUrl);
    text = buildEmailText(app.full_name, app.track, fee, personalizedPaymentUrl);
    waTextRaw = getWhatsAppMessage(app, personalizedPaymentUrl);
  }

  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<"idle" | "ok" | "err">("idle");
  const [sendMsg, setSendMsg] = useState("");
  const [copiedText, setCopiedText] = useState(false);

  const handleCopyEmailText = () => {
    const fullText = `Subject: ${subject}\n\n${text}`;
    navigator.clipboard.writeText(fullText).then(() => {
      setCopiedText(true);
      onNotified();
      setTimeout(() => setCopiedText(false), 2000);
    });
  };

  async function sendViaProvider() {
    setSending(true);
    setSendResult("idle");
    try {
      const result = await sendEmailFn({
        data: {
          provider: emailProvider,
          resendKey,
          brevoKey,
          from: senderEmail || (emailProvider === "brevo" ? "academy@ugettech.com" : "onboarding@resend.dev"),
          to: [app.email],
          subject,
          html,
          text,
        },
      });
      if (result.success) {
        setSendResult("ok");
        setSendMsg("Email sent successfully!");
        onNotified();
      } else {
        setSendResult("err");
        setSendMsg(result.error || `Failed to send. Check your ${emailProvider === "brevo" ? "Brevo" : "Resend"} API key and sender domain.`);
      }
    } catch (e: any) {
      setSendResult("err");
      setSendMsg(e.message ?? "Network error.");
    } finally {
      setSending(false);
    }
  }

  const mailtoLink = `mailto:${app.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
  const waText = encodeURIComponent(waTextRaw);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,8,20,0.85)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-border p-6 space-y-5 shadow-2xl animate-scale-in"
        style={{ background: "oklch(0.21 0.06 280)" }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold">Notify Student</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {app.full_name} · {app.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors text-xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Template Selector */}
        <div className="space-y-1.5">
          <Label htmlFor="template_type" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Email Template
          </Label>
          <select
            id="template_type"
            value={templateType}
            onChange={(e) => setTemplateType(e.target.value as any)}
            className="w-full h-10 bg-background border border-border rounded-lg px-3 py-1 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary text-foreground transition-colors cursor-pointer hover:bg-background/80"
          >
            <option value="offer">Welcome Offer (Original)</option>
            <option value="deadline">Payment Reminder — July 19th (Part-Payment Offer)</option>
            <option value="class_starts">Class Start Notification (July 13)</option>
            <option value="webinar">🎙️ Webinar Invite — July 22nd (Unpaid Registrants)</option>
          </select>
        </div>

        {/* Preview */}
        <div className="rounded-xl border border-border/60 bg-card/40 p-4 space-y-1 text-sm">
          <p className="text-muted-foreground text-xs uppercase tracking-wider mb-2">
            Email Preview
          </p>
          <p>
            <span className="text-muted-foreground">Subject:</span> <strong className="text-foreground">{subject}</strong>
          </p>
          <p>
            <span className="text-muted-foreground">To:</span> {app.email}
          </p>
          <p>
            <span className="text-muted-foreground">Course:</span> {app.track}
          </p>
          {templateType === "offer" && (
            <p>
              <span className="text-muted-foreground">Fee:</span>{" "}
              <strong className="text-primary">{fee > 0 ? fmt(fee) : "—"}</strong>
            </p>
          )}
          {templateType !== "class_starts" && templateType !== "webinar" && (
            <p>
              <span className="text-muted-foreground">Link:</span>{" "}
              <span className="text-primary/80">{personalizedPaymentUrl}</span>
            </p>
          )}
          {templateType === "webinar" && (
            <p>
              <span className="text-muted-foreground">WhatsApp Group:</span>{" "}
              <span className="text-green-400/80 text-xs break-all">{WEBINAR_WA_LINK}</span>
            </p>
          )}
        </div>

        {/* Send result */}
        {sendResult === "ok" && (
          <div className="rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 text-sm text-primary">
            ✅ {sendMsg}
          </div>
        )}
        {sendResult === "err" && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            ❌ {sendMsg}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={sendViaProvider}
            disabled={sending || (emailProvider === "brevo" ? !brevoKey : !resendKey)}
            className="w-full rounded-full py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:scale-[1.01] disabled:opacity-50"
            style={{ background: "var(--gradient-brand)" }}
            title={
              emailProvider === "brevo"
                ? !brevoKey ? "Add Brevo API key in Settings tab first" : ""
                : !resendKey ? "Add Resend API key in Settings tab first" : ""
            }
          >
            {sending ? "Sending…" : `📧 Send Email (via ${emailProvider === "brevo" ? "Brevo" : "Resend"})`}
          </button>
          <button
            onClick={handleCopyEmailText}
            className="w-full flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold border border-border bg-card/60 transition-all hover:border-primary/50"
          >
            {copiedText ? "📋 Copied!" : "📋 Copy Email Text (Webmail)"}
          </button>
          <a
            href={mailtoLink}
            onClick={onNotified}
            className="w-full block text-center rounded-full py-2.5 text-sm font-semibold border border-border bg-card/60 transition-all hover:border-primary/50"
          >
            📤 Open in Mail App (mailto)
          </a>
          <a
            href={`https://wa.me/?text=${waText}`}
            target="_blank"
            rel="noreferrer noopener"
            onClick={onNotified}
            className="w-full flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold border border-border bg-card/60 transition-all hover:border-green-500/50"
          >
            <svg className="h-4 w-4 text-green-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Send via WhatsApp
          </a>
        </div>

        {emailProvider === "resend" && !resendKey && (
          <p className="text-xs text-muted-foreground text-center">
            ⚙️ Add your Resend API key in the <strong>Settings</strong> tab to enable one-click emails.
          </p>
        )}
        {emailProvider === "brevo" && !brevoKey && (
          <p className="text-xs text-muted-foreground text-center">
            ⚙️ Add your Brevo API key in the <strong>Settings</strong> tab to enable one-click emails.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Bulk email modal ─────────────────────────────────────────────────────────
// ─── Bulk email modal ─────────────────────────────────────────────────────────
function BulkEmailModal({
  applications,
  onClose,
  resendKey,
  brevoKey,
  emailProvider,
  senderEmail,
  paymentUrl,
  onNotifiedBatch,
  notifiedApps = {},
}: {
  applications: any[];
  onClose: () => void;
  resendKey: string;
  brevoKey: string;
  emailProvider: "resend" | "brevo";
  senderEmail: string;
  paymentUrl: string;
  onNotifiedBatch?: (ids: string[]) => void;
  notifiedApps?: Record<string, boolean>;
}) {
  const unpaid = applications.filter(
    (a) => !a.payment_status || a.payment_status === "Unpaid",
  );
  const paid = applications.filter(
    (a) => a.payment_status === "Paid",
  );
  const [target, setTarget] = useState<"all" | "unpaid" | "paid">("unpaid");
  const targets = target === "all" ? applications : target === "paid" ? paid : unpaid;

  const [templateType, setTemplateType] = useState<"offer" | "deadline" | "class_starts">("deadline");

  const handleTargetChange = (newTarget: "all" | "unpaid" | "paid") => {
    setTarget(newTarget);
    if (newTarget === "paid") {
      setTemplateType("class_starts");
    } else if (newTarget === "unpaid") {
      setTemplateType("deadline");
    } else {
      setTemplateType("offer");
    }
  };

  const [progress, setProgress] = useState<Record<string, "idle" | "ok" | "err">>({});
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [method, setMethod] = useState<"resend" | "mailto" | "whatsapp">("resend");
  const [copiedAppId, setCopiedAppId] = useState<string | null>(null);
  const [sendLimit, setSendLimit] = useState<string>("");
  const [messagedIds, setMessagedIds] = useState<Record<string, boolean>>(() => ({ ...notifiedApps }));

  async function sendAll() {
    const activeKey = emailProvider === "brevo" ? brevoKey : resendKey;
    if (!activeKey) return;
    setRunning(true);
    setDone(false);
    
    const limitNum = sendLimit ? parseInt(sendLimit, 10) : 0;
    const activeTargets = limitNum > 0 ? targets.slice(0, limitNum) : targets;

    const next: Record<string, "idle" | "ok" | "err"> = {};
    activeTargets.forEach((a) => (next[a.id] = "idle"));
    setProgress({ ...next });
    const notifiedIds: string[] = [];

    for (const app of activeTargets) {
      const fee = COURSE_FEES[app.track] ?? 0;
      const personalizedPaymentUrl = paymentUrl.includes("?")
        ? `${paymentUrl}&id=${app.id}`
        : `${paymentUrl}?id=${app.id}`;
      try {
        let subject = "";
        let html = "";
        let text = "";
        if (templateType === "class_starts") {
          subject = `Congratulations! Class Commences July 13th — Uget Academy`;
          html = buildClassStartsEmailHtml(app.full_name, app.track);
          text = buildClassStartsEmailText(app.full_name, app.track);
        } else if (templateType === "deadline") {
          subject = `Action Required: Secure Your Spot at Uget Academy`;
          html = buildDeadlineEmailHtml(app.full_name, app.track, personalizedPaymentUrl);
          text = buildDeadlineEmailText(app.full_name, app.track, personalizedPaymentUrl);
        } else {
          subject = `Welcome to Uget Academy — ${app.track} Cohort 1`;
          html = buildEmailHtml(app.full_name, app.track, fee, personalizedPaymentUrl);
          text = buildEmailText(app.full_name, app.track, fee, personalizedPaymentUrl);
        }

        const result = await sendEmailFn({
          data: {
            provider: emailProvider,
            resendKey,
            brevoKey,
            from: senderEmail || (emailProvider === "brevo" ? "academy@ugettech.com" : "onboarding@resend.dev"),
            to: [app.email],
            subject,
            html,
            text,
          },
        });
        if (result.success) {
          next[app.id] = "ok";
          notifiedIds.push(app.id);
        } else {
          next[app.id] = "err";
        }
      } catch {
        next[app.id] = "err";
      }
      setProgress({ ...next });
      // Small delay to avoid rate limiting
      await new Promise((r) => setTimeout(r, 300));
    }
    if (notifiedIds.length > 0 && onNotifiedBatch) {
      onNotifiedBatch(notifiedIds);
    }
    setRunning(false);
    setDone(true);
  }

  const sent = Object.values(progress).filter((v) => v === "ok").length;
  const failed = Object.values(progress).filter((v) => v === "err").length;

  const cleanPhone = (phone: string) => {
    if (!phone) return "";
    let cleaned = phone.replace(/[^0-9]/g, "");
    if (cleaned.startsWith("0")) {
      cleaned = "234" + cleaned.slice(1);
    }
    return cleaned;
  };

  const getWhatsAppMsg = (app: any) => {
    const personalizedPaymentUrl = paymentUrl.includes("?")
      ? `${paymentUrl}&id=${app.id}`
      : `${paymentUrl}?id=${app.id}`;
    if (templateType === "class_starts") {
      return getClassStartsWhatsAppMessage(app);
    } else if (templateType === "deadline") {
      return getDeadlineWhatsAppMessage(app, personalizedPaymentUrl);
    }
    return getWhatsAppMessage(app, personalizedPaymentUrl);
  };

  const handleCopyMsg = (app: any) => {
    navigator.clipboard.writeText(getWhatsAppMsg(app)).then(() => {
      setCopiedAppId(app.id);
      setMessagedIds((prev) => ({ ...prev, [app.id]: true }));
      if (onNotifiedBatch) onNotifiedBatch([app.id]);
      setTimeout(() => setCopiedAppId(null), 2000);
    });
  };

  const handleCopyAllWhatsApp = () => {
    const allMsgs = targets
      .map(
        (app) =>
          `--- MESSAGE FOR ${app.full_name} (${app.phone || "No Phone"}) ---\n${getWhatsAppMsg(app)}`,
      )
      .join("\n\n");
    navigator.clipboard.writeText(allMsgs).then(() => {
      setCopiedAppId("all_wa");
      const ids = targets.map((a) => a.id);
      setMessagedIds((prev) => {
        const next = { ...prev };
        ids.forEach((id) => {
          next[id] = true;
        });
        return next;
      });
      if (onNotifiedBatch) onNotifiedBatch(ids);
      setTimeout(() => setCopiedAppId(null), 2000);
    });
  };

  // Preview data based on first applicant in target list or placeholder
  const previewApp = targets[0] ?? { id: "placeholder-id", full_name: "John Doe", track: "Full-Stack Development", email: "johndoe@example.com" };
  const previewFee = COURSE_FEES[previewApp.track] ?? 0;
  const previewPaymentUrl = paymentUrl.includes("?")
    ? `${paymentUrl}&id=${previewApp.id || ""}`
    : `${paymentUrl}?id=${previewApp.id || ""}`;

  let previewSubject = "";
  let previewText = "";
  if (templateType === "class_starts") {
    previewSubject = `Congratulations! Class Commences July 13th — Uget Academy`;
    previewText = buildClassStartsEmailText(previewApp.full_name, previewApp.track);
  } else if (templateType === "deadline") {
    previewSubject = `Action Required: Secure Your Spot at Uget Academy`;
    previewText = buildDeadlineEmailText(previewApp.full_name, previewApp.track, previewPaymentUrl);
  } else {
    previewSubject = `Welcome to Uget Academy — ${previewApp.track} Cohort 1`;
    previewText = buildEmailText(previewApp.full_name, previewApp.track, previewFee, previewPaymentUrl);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,8,20,0.85)", backdropFilter: "blur(8px)" }}
      onClick={(e) => !running && e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-border p-6 space-y-5 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto"
        style={{ background: "oklch(0.21 0.06 280)" }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" /> Send Payment Emails
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Notify registrants of their course fee and payment link
            </p>
          </div>
          {!running && (
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors text-xl font-bold"
            >
              ×
            </button>
          )}
        </div>

        {/* 1. Target Selector */}
        {!running && !done && (
          <div className="space-y-2">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              1. Select Recipients
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleTargetChange("unpaid")}
                className={`rounded-xl border p-2.5 text-left text-sm transition-all ${
                  target === "unpaid"
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-card/45 text-muted-foreground hover:border-border/80"
                }`}
              >
                <div className="font-semibold text-xs">Unpaid only</div>
                <div className="text-[10px] mt-0.5 text-muted-foreground">{unpaid.length} students</div>
              </button>
              <button
                type="button"
                onClick={() => handleTargetChange("paid")}
                className={`rounded-xl border p-2.5 text-left text-sm transition-all ${
                  target === "paid"
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-card/45 text-muted-foreground hover:border-border/80"
                }`}
              >
                <div className="font-semibold text-xs">Paid only</div>
                <div className="text-[10px] mt-0.5 text-muted-foreground">{paid.length} students</div>
              </button>
              <button
                type="button"
                onClick={() => handleTargetChange("all")}
                className={`rounded-xl border p-2.5 text-left text-sm transition-all ${
                  target === "all"
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-card/45 text-muted-foreground hover:border-border/80"
                }`}
              >
                <div className="font-semibold text-xs">All</div>
                <div className="text-[10px] mt-0.5 text-muted-foreground">{applications.length} students</div>
              </button>
            </div>
          </div>
        )}

        {/* 1b. Template Selector */}
        {!running && !done && (
          <div className="space-y-2">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              2. Select Email Template
            </label>
            <select
              id="bulk_template_type"
              value={templateType}
              onChange={(e) => setTemplateType(e.target.value as any)}
              className="w-full h-10 bg-background border border-border rounded-xl px-3 py-1 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary text-foreground transition-colors cursor-pointer hover:bg-background/80"
            >
              <option value="offer">Welcome Offer (Original)</option>
              <option value="deadline">Payment Reminder — July 19th (Part-Payment Offer)</option>
              <option value="class_starts">Class Start Notification (July 13)</option>
            </select>
          </div>
        )}

        {/* 2. Choose Method */}
        {!running && !done && (
          <div className="space-y-2">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              3. Choose Notification Method
            </label>
            <div className="flex border-b border-border/60">
              <button
                type="button"
                onClick={() => setMethod("resend")}
                className={`flex-1 pb-2.5 text-sm font-semibold border-b-2 transition-colors ${
                  method === "resend"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {emailProvider === "brevo" ? "Brevo API (Auto)" : "Resend API (Auto)"}
              </button>
              <button
                type="button"
                onClick={() => setMethod("mailto")}
                className={`flex-1 pb-2.5 text-sm font-semibold border-b-2 transition-colors ${
                  method === "mailto"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Mail Client (mailto)
              </button>
              <button
                type="button"
                onClick={() => setMethod("whatsapp")}
                className={`flex-1 pb-2.5 text-sm font-semibold border-b-2 transition-colors ${
                  method === "whatsapp"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                WhatsApp Blast
              </button>
            </div>
          </div>
        )}

        {/* Method Panels */}
        {!running && !done && (
          <div className="space-y-4">
            {method === "resend" && (
              <div className="space-y-3">
                <div className="rounded-xl border border-border bg-card/40 p-4 text-xs space-y-1.5">
                  <h4 className="font-bold text-foreground text-sm">
                    {emailProvider === "brevo" ? "Brevo Configuration" : "Resend Configuration"}
                  </h4>
                  {emailProvider === "brevo" ? (
                    brevoKey ? (
                      <p className="text-primary font-medium flex items-center gap-1">
                        <span>✓ Brevo Key Configured</span>
                      </p>
                    ) : (
                      <p className="text-destructive font-semibold">
                        ✕ No Brevo API key found. Add it in the Settings panel (⚙️) first.
                      </p>
                    )
                  ) : (
                    resendKey ? (
                      <p className="text-primary font-medium flex items-center gap-1">
                        <span>✓ Resend Key Configured</span>
                      </p>
                    ) : (
                      <p className="text-destructive font-semibold">
                        ✕ No Resend API key found. Add it in the Settings panel (⚙️) first.
                      </p>
                    )
                  )}
                  <p className="text-muted-foreground text-[11px]">
                    Sender email: <strong className="text-foreground">{senderEmail || (emailProvider === "brevo" ? "academy@ugettech.com" : "onboarding@resend.dev")}</strong>
                  </p>
                </div>

                {/* Send Limit setting */}
                <div className="space-y-1.5 bg-card/10 border border-border/40 rounded-xl p-3">
                  <label htmlFor="send_limit" className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Limit Sending (first N recipients):
                  </label>
                  <Input
                    id="send_limit"
                    type="number"
                    min="1"
                    max={targets.length.toString()}
                    value={sendLimit}
                    onChange={(e) => setSendLimit(e.target.value)}
                    placeholder={`e.g. 1, 5, 10... Leave empty to send to all ${targets.length}`}
                    className="h-9 text-xs bg-background/50 border-border/80 focus-visible:ring-primary"
                  />
                  <p className="text-[9px] text-muted-foreground">
                    Tip: Enter 1 to send a single email to the first unpaid student.
                  </p>
                </div>

                {/* Template Preview */}
                <div className="rounded-xl border border-border bg-card/20 overflow-hidden">
                  <div className="bg-card/65 px-4 py-2 border-b border-border/60 flex justify-between items-center text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                    <span>Email Template Preview ({previewApp.full_name})</span>
                  </div>
                  <div className="p-4 text-xs max-h-48 overflow-y-auto space-y-2 bg-background/40">
                    <p className="font-semibold text-foreground">
                      Subject: <span className="font-normal text-muted-foreground">{previewSubject}</span>
                    </p>
                    <div className="border-t border-border/30 pt-2 text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed text-[11px]">
                      {previewText}
                    </div>
                  </div>
                </div>

                {(() => {
                  const limitNum = sendLimit ? parseInt(sendLimit, 10) : 0;
                  const activeTargets = limitNum > 0 ? targets.slice(0, limitNum) : targets;
                  return (
                    <Button
                      onClick={sendAll}
                      disabled={!(emailProvider === "brevo" ? brevoKey : resendKey) || activeTargets.length === 0}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                    >
                      Send to {activeTargets.length} Student{activeTargets.length !== 1 ? "s" : ""} via {emailProvider === "brevo" ? "Brevo" : "Resend"}
                    </Button>
                  );
                })()}
              </div>
            )}

            {method === "mailto" && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed bg-primary/5 p-3 rounded-lg border border-primary/10">
                  💡 Click <strong>Open Mail Client</strong> next to each registrant to generate a personalized email in your device's default mail application. Useful for small batches.
                </p>

                <div className="max-h-60 overflow-y-auto border border-border bg-card/30 rounded-xl divide-y divide-border/40">
                  {targets.map((app) => {
                    const fee = COURSE_FEES[app.track] ?? 0;
                    const personalizedPaymentUrl = paymentUrl.includes("?")
                      ? `${paymentUrl}&id=${app.id}`
                      : `${paymentUrl}?id=${app.id}`;
                    
                    let subject = "";
                    let text = "";
                    if (templateType === "class_starts") {
                      subject = `Congratulations! Class Commences July 13th — Uget Academy`;
                      text = buildClassStartsEmailText(app.full_name, app.track);
                    } else if (templateType === "deadline") {
                      subject = `Action Required: Secure Your Spot at Uget Academy`;
                      text = buildDeadlineEmailText(app.full_name, app.track, personalizedPaymentUrl);
                    } else {
                      subject = `Welcome to Uget Academy — ${app.track} Cohort 1`;
                      text = buildEmailText(app.full_name, app.track, fee, personalizedPaymentUrl);
                    }
                    
                    const mailto = `mailto:${app.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
                    return (
                      <div key={app.id} className="flex items-center justify-between p-3 text-xs">
                        <div className="truncate max-w-[65%] pr-2">
                          <p className="font-semibold text-foreground truncate">{app.full_name}</p>
                          <p className="text-muted-foreground text-[10px] truncate">{app.email}</p>
                        </div>
                        <a
                          href={mailto}
                          onClick={() => onNotifiedBatch && onNotifiedBatch([app.id])}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-card/90 hover:border-primary/50 text-[11px] font-semibold text-foreground transition-all shrink-0"
                        >
                          <Send className="h-3 w-3 text-primary" /> Open Mail Client
                        </a>
                      </div>
                    );
                  })}
                  {targets.length === 0 && (
                    <p className="p-4 text-center text-muted-foreground text-xs">No recipients matching your selection.</p>
                  )}
                </div>
              </div>
            )}

            {method === "whatsapp" && (
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-primary/5 p-3 rounded-lg border border-primary/10">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    💡 Click <strong>Chat</strong> to open WhatsApp Web/App pre-filled with the message, or copy text templates below.
                  </p>
                  {targets.length > 0 && (
                    <button
                      type="button"
                      onClick={handleCopyAllWhatsApp}
                      className="text-xs text-primary hover:underline font-semibold flex items-center gap-1 shrink-0 ml-2"
                    >
                      {copiedAppId === "all_wa" ? (
                        <>
                          <Check className="h-3.5 w-3.5" /> Copied All!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" /> Copy All Templates
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="max-h-60 overflow-y-auto border border-border bg-card/30 rounded-xl divide-y divide-border/40">
                  {targets.map((app) => {
                    const waLink = `https://wa.me/${cleanPhone(app.phone)}?text=${encodeURIComponent(getWhatsAppMsg(app))}`;
                    return (
                      <div key={app.id} className="flex items-center justify-between p-3 text-xs">
                        <div className="truncate max-w-[50%] pr-2">
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-foreground truncate">{app.full_name}</p>
                            {messagedIds[app.id] && (
                              <span className="inline-flex items-center gap-0.5 rounded bg-green-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-green-400 border border-green-500/30 shrink-0">
                                ✓ Sent
                              </span>
                            )}
                          </div>
                          <p className="text-muted-foreground text-[10px] truncate">
                            {app.phone || "No phone number"}
                          </p>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleCopyMsg(app)}
                            className="inline-flex items-center justify-center h-8 px-2.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/50 text-[11px] transition-all"
                            title="Copy message text"
                          >
                            {copiedAppId === app.id ? (
                              <Check className="h-3.5 w-3.5 text-primary" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                          {app.phone && (
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => {
                                setMessagedIds((prev) => ({ ...prev, [app.id]: true }));
                                if (onNotifiedBatch) onNotifiedBatch([app.id]);
                              }}
                              className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border border-border bg-card text-green-400 hover:text-green-300 hover:border-green-500/50 text-[11px] transition-all"
                            >
                              <MessageSquare className="h-3.5 w-3.5" /> Chat
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {targets.length === 0 && (
                    <p className="p-4 text-center text-muted-foreground text-xs">No recipients matching your selection.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Progress View */}
        {(running || done) && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Sending Progress</span>
              <span className="font-semibold font-mono">
                {sent + failed} / {targets.length}
              </span>
            </div>
            <div className="h-2 rounded-full bg-border overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${targets.length ? ((sent + failed) / targets.length) * 100 : 0}%`,
                  background: "var(--gradient-brand)",
                }}
              />
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1 rounded-xl border border-border/60 bg-card/30 p-3">
              {targets.map((app) => (
                <div key={app.id} className="flex items-center justify-between text-xs py-0.5">
                  <span className="text-muted-foreground truncate max-w-[70%]">
                    {app.full_name}
                  </span>
                  <span>
                    {progress[app.id] === "ok" ? (
                      <span className="text-primary font-medium">✓ Sent</span>
                    ) : progress[app.id] === "err" ? (
                      <span className="text-destructive font-medium">✕ Failed</span>
                    ) : (
                      <span className="text-muted-foreground">
                        {running ? "Pending…" : "–"}
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
            {done && (
              <div className="rounded-lg border border-primary/45 bg-primary/10 px-4 py-2.5 text-sm text-primary font-medium animate-fade-in">
                🎉 Complete! {sent} emails sent successfully, {failed} failed.
              </div>
            )}
          </div>
        )}

        {/* Footer actions */}
        {done && (
          <Button
            onClick={() => {
              setDone(false);
              setProgress({});
            }}
            className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold"
          >
            Start Over / Reset Modal
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────
function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [applications, setApplications] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refName, setRefName] = useState("");
  const [refCode, setRefCode] = useState("");
  const [notifyApp, setNotifyApp] = useState<any | null>(null);
  const [showBulk, setShowBulk] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const [notifiedFilter, setNotifiedFilter] = useState<"all" | "yes" | "no">("all");
  const [notifiedApps, setNotifiedApps] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem("uget_notified_apps");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.reduce((acc: Record<string, boolean>, id: string) => {
            acc[id] = true;
            return acc;
          }, {});
        }
      }
    } catch (e) {
      console.error("Error parsing uget_notified_apps", e);
    }
    return {};
  });

  const toggleNotified = (id: string) => {
    setNotifiedApps((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      const ids = Object.keys(next).filter((key) => next[key]);
      localStorage.setItem("uget_notified_apps", JSON.stringify(ids));
      return next;
    });
  };

  const markBatchNotified = (ids: string[]) => {
    setNotifiedApps((prev) => {
      const next = { ...prev };
      ids.forEach((id) => {
        next[id] = true;
      });
      const allIds = Object.keys(next).filter((key) => next[key]);
      localStorage.setItem("uget_notified_apps", JSON.stringify(allIds));
      return next;
    });
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const renderSortableHeader = (field: string, label: string) => {
    const isActive = sortField === field;
    return (
      <TableHead
        className="cursor-pointer hover:bg-muted/40 transition-colors select-none py-3"
        onClick={() => handleSort(field)}
      >
        <div className="flex items-center gap-1.5">
          <span>{label}</span>
          {isActive ? (
            sortDirection === "asc" ? (
              <ChevronUp className="h-3.5 w-3.5 text-primary shrink-0" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-primary shrink-0" />
            )
          ) : (
            <ArrowUpDown className="h-3 w-3 text-muted-foreground/30 shrink-0" />
          )}
        </div>
      </TableHead>
    );
  };

  const filteredAndSortedApplications = useMemo(() => {
    let result = [...applications];

    // 1. Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((app) => {
        return (
          app.full_name?.toLowerCase().includes(q) ||
          app.email?.toLowerCase().includes(q) ||
          app.phone?.toLowerCase().includes(q) ||
          app.track?.toLowerCase().includes(q) ||
          app.payment_status?.toLowerCase().includes(q) ||
          app.payment_sender?.toLowerCase().includes(q) ||
          app.payment_ref?.toLowerCase().includes(q) ||
          app.referral_code?.toLowerCase().includes(q)
        );
      });
    }

    // 1.5. Notified Filter
    if (notifiedFilter !== "all") {
      result = result.filter((app) => {
        const isNotified = Boolean(notifiedApps[app.id]);
        return notifiedFilter === "yes" ? isNotified : !isNotified;
      });
    }

    // 2. Sort Logic
    result.sort((a, b) => {
      if (sortField === "notified") {
        const aVal = notifiedApps[a.id] ? 1 : 0;
        const bVal = notifiedApps[b.id] ? 1 : 0;
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }

      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle null/undefined values
      if (aVal === null || aVal === undefined) aVal = "";
      if (bVal === null || bVal === undefined) bVal = "";

      // Special handling for created_at (dates)
      if (sortField === "created_at") {
        const aDate = new Date(aVal).getTime();
        const bDate = new Date(bVal).getTime();
        return sortDirection === "asc" ? aDate - bDate : bDate - aDate;
      }

      // Special handling for fee (derived from track) or amount paid
      if (sortField === "fee") {
        aVal = COURSE_FEES[a.track] ?? 0;
        bVal = COURSE_FEES[b.track] ?? 0;
      }

      // Convert to string for comparisons if they are strings
      if (typeof aVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal);
      }

      // For numbers
      return sortDirection === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });

    return result;
  }, [applications, searchQuery, sortField, sortDirection]);

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Settings (persisted in localStorage or environment variables)
  const [emailProvider, setEmailProvider] = useState<"resend" | "brevo">(
    () => {
      if (typeof window !== "undefined") {
        return (localStorage.getItem("uget_email_provider") as "resend" | "brevo" | null) || "resend";
      }
      return "resend";
    }
  );
  const [resendKey, setResendKey] = useState(
    () => {
      if (typeof window !== "undefined") {
        return localStorage.getItem("uget_resend_key") || (import.meta.env.VITE_RESEND_API_KEY as string | undefined) || "";
      }
      return "";
    }
  );
  const [brevoKey, setBrevoKey] = useState(
    () => {
      if (typeof window !== "undefined") {
        return localStorage.getItem("uget_brevo_key") || (import.meta.env.VITE_BREVO_API_KEY as string | undefined) || "";
      }
      return "";
    }
  );
  const [senderEmail, setSenderEmail] = useState(
    () => {
      if (typeof window !== "undefined") {
        return localStorage.getItem("uget_sender_email") || (import.meta.env.VITE_SENDER_EMAIL as string | undefined) || "";
      }
      return "";
    }
  );
  const [paymentUrl, setPaymentUrl] = useState(
    () => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("uget_payment_url");
        if (
          !stored ||
          stored.includes("uget-enrollment.online") ||
          stored.includes("uget-blog-seven.vercel.app") ||
          stored.includes("enroll.vercel.app")
        ) {
          localStorage.setItem("uget_payment_url", "https://uget-enroll.vercel.app/payment");
          return "https://uget-enroll.vercel.app/payment";
        }
        return stored;
      }
      return "https://uget-enroll.vercel.app/payment";
    }
  );

  function saveSettings(provider: "resend" | "brevo", resKey: string, brevKey: string, email: string, url: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("uget_email_provider", provider);
      localStorage.setItem("uget_resend_key", resKey);
      localStorage.setItem("uget_brevo_key", brevKey);
      localStorage.setItem("uget_sender_email", email);
      localStorage.setItem("uget_payment_url", url);
    }
    setEmailProvider(provider);
    setResendKey(resKey);
    setBrevoKey(brevKey);
    setSenderEmail(email);
    setPaymentUrl(url);
  }

  const [sendingCorrection, setSendingCorrection] = useState(false);

  const sendCorrectionEmails = async () => {
    const notifiedIds = Object.keys(notifiedApps).filter((id) => notifiedApps[id]);
    const targets = applications.filter((app) => notifiedIds.includes(app.id));

    if (targets.length === 0) {
      alert("No notified candidates found in this browser to send reminders to.");
      return;
    }

    const activeKey = emailProvider === "brevo" ? brevoKey : resendKey;
    if (!activeKey) {
      alert(`Please configure your ${emailProvider === "brevo" ? "Brevo" : "Resend"} API Key in Settings first.`);
      return;
    }

    const confirmSend = window.confirm(
      `This will send a professional check-in/reminder email to ${targets.length} candidates who were notified. Are you sure you want to proceed?`
    );
    if (!confirmSend) return;

    setSendingCorrection(true);
    let successCount = 0;
    let failCount = 0;

    for (const app of targets) {
      const fee = COURSE_FEES[app.track] ?? 0;
      const personalizedPaymentUrl = paymentUrl.includes("?")
        ? `${paymentUrl}&id=${app.id}`
        : `${paymentUrl}?id=${app.id}`;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:24px;background:#13111c;font-family:Inter,Arial,sans-serif;color:#f0eeff;">
          <div style="max-width:600px;margin:0 auto;background:rgba(120,80,220,0.05);border:1px solid rgba(120,100,220,0.25);border-radius:12px;padding:32px;">
            <p style="font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#06b6d4;margin:0 0 8px;">Uget Academy</p>
            <h2 style="color:#ffffff;margin-top:0;">Scholarship Offer & Enrollment Check-in</h2>
            
            <p style="font-size:14px;line-height:1.6;color:#d0c8f0;">
              Hello <strong>${app.full_name}</strong>,
            </p>
            <p style="font-size:14px;line-height:1.6;color:#d0c8f0;">
              We are reaching out to check in on your scholarship enrollment progress. As we prepare learning dashboard setups and onboarding schedules for Cohort 1, we want to ensure your spot is secured.
            </p>
            <p style="font-size:14px;line-height:1.6;color:#d0c8f0;">
              If you have already made your commitment fee transfer (or are about to do so), please visit your enrollment portal to confirm your payment details and <strong>upload your receipt (Image or PDF)</strong> for verification:
            </p>
            
            <div style="margin:24px 0;text-align:center;">
              <a href="${personalizedPaymentUrl}" style="display:inline-block;padding:12px 24px;background:#7c3aed;color:#ffffff;text-decoration:none;font-weight:bold;border-radius:30px;font-size:14px;box-shadow:0 4px 12px rgba(124,58,237,0.35);">
                💳 Open Portal & Confirm Payment
              </a>
            </div>
            
            <p style="font-size:14px;line-height:1.6;color:#d0c8f0;">
              If you require a localized country payment option (for candidates outside Nigeria) or have any questions about the enrollment timeline, please chat with our coordinator on our official WhatsApp line:
            </p>
            
            <div style="margin:24px 0;text-align:center;">
              <a href="https://wa.me/2348106175131" style="display:inline-block;padding:12px 24px;background:#25d366;color:#ffffff;text-decoration:none;font-weight:bold;border-radius:30px;font-size:14px;box-shadow:0 4px 12px rgba(37,211,102,0.3);">
                💬 Contact Coordinator on WhatsApp
              </a>
            </div>
            
            <p style="font-size:13px;color:#8b83b0;margin-top:32px;border-top:1px solid rgba(120,100,220,0.15);padding-top:16px;line-height:1.6;">
              Please make sure to message us only at our official line <strong>+234 810 617 5131</strong> for any WhatsApp updates. We look forward to welcoming you as a scholar!
            </p>
          </div>
        </body>
        </html>
      `;

      const textContent = `Hello ${app.full_name},\n\nWe are reaching out to check in on your scholarship enrollment progress for Uget Academy.\n\nTo secure your spot, please confirm your commitment fee transfer and upload your receipt (Image or PDF) directly on your personalized enrollment portal:\n${personalizedPaymentUrl}\n\nIf you require international/localized payment options or have any questions, please contact our admissions coordinator on our official WhatsApp line (+234 810 617 5131):\nhttps://wa.me/2348106175131\n\nWarm regards,\nUget Academy Team`;

      try {
        const result = await sendEmailFn({
          data: {
            provider: emailProvider,
            resendKey,
            brevoKey,
            from: senderEmail || (emailProvider === "brevo" ? "academy@ugettech.com" : "onboarding@resend.dev"),
            to: [app.email],
            subject: "Correction: Uget Academy WhatsApp Support Line",
            html: htmlContent,
            text: textContent,
          },
        });
        if (result.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }

      // Delay to avoid rate limiting
      await new Promise((r) => setTimeout(r, 200));
    }

    setSendingCorrection(false);
    alert(`Finished sending correction emails!\nSent successfully: ${successCount}\nFailed: ${failCount}`);
  };

  useEffect(() => {
    async function fetchData() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const [appsRes, refsRes] = await Promise.all([
        supabase
          .from("scholarship_applications")
          .select("*, payments(payment_status, payment_sender, payment_amount, payment_date, payment_ref)")
          .order("created_at", { ascending: false }),
        supabase
          .from("referral_codes")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);
      if (appsRes.data) {
        const mapped = appsRes.data.map((app: any) => {
          const p = Array.isArray(app.payments) ? app.payments[0] : app.payments;
          return {
            ...app,
            payment_status: p?.payment_status || "Unpaid",
            payment_sender: p?.payment_sender || null,
            payment_amount: p?.payment_amount || null,
            payment_date: p?.payment_date || null,
            payment_ref: p?.payment_ref || null,
          };
        });
        setApplications(mapped);
      }
      if (refsRes.data) setReferrals(refsRes.data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const downloadCSV = () => {
    if (!applications.length) return;
    const headers = Object.keys(applications[0]);
    const csvContent = [
      headers.join(","),
      ...applications.map((row) =>
        headers
          .map((header) => {
            const val = row[header];
            return `"${String(val !== null && val !== undefined ? val : "").replace(/"/g, '""')}"`;
          })
          .join(","),
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute(
      "download",
      `uget-applications-${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refName || !supabase) return;
    const randomHex = Math.floor(Math.random() * 65535)
      .toString(16)
      .toUpperCase()
      .padStart(4, "0");
    const cleanName = refName
      .split(" ")[0]
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase();
    const code = `${cleanName}-${randomHex}`;
    const { data, error } = await supabase
      .from("referral_codes")
      .insert({ referrer_name: refName, code })
      .select();
    if (!error && data) {
      setReferrals([data[0], ...referrals]);
      setRefName("");
      setRefCode(code);
    } else {
      alert("Error generating referral code: " + (error?.message ?? "Unknown error"));
    }
  };

  const deleteReferral = async (id: string) => {
    if (!supabase) return;
    if (!confirm("Are you sure you want to delete this referral code?")) return;
    const { error } = await supabase.from("referral_codes").delete().eq("id", id);
    if (!error) {
      setReferrals(referrals.filter((ref) => ref.id !== id));
    }
  };

  const deleteApplication = async (id: string) => {
    if (!supabase) return;
    if (!confirm("Are you sure you want to delete this applicant and all their associated payment records?")) return;

    // First delete from payments due to foreign key constraints
    await supabase.from("payments").delete().eq("application_id", id);
    // Then delete from scholarship_applications
    const { error } = await supabase.from("scholarship_applications").delete().eq("id", id);
    if (!error) {
      setApplications((prev) => prev.filter((a) => a.id !== id));
    } else {
      alert("Error deleting application: " + error.message);
    }
  };

  async function updatePaymentStatus(id: string, status: string) {
    if (!supabase) return;
    const { error } = await supabase
      .from("payments")
      .upsert({ application_id: id, payment_status: status }, { onConflict: "application_id" });
    if (!error) {
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, payment_status: status } : a)),
      );
    }
  }

  const paid = applications.filter((a) => a.payment_status === "Paid");
  const pending = applications.filter((a) => a.payment_status === "Pending Verification");
  const unpaid = applications.filter(
    (a) => !a.payment_status || a.payment_status === "Unpaid",
  );

  function PaymentBadge({ status }: { status: string | null }) {
    if (status === "Paid")
      return (
        <span className="inline-flex items-center rounded-full bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
          ✅ Paid
        </span>
      );
    if (status === "Pending Verification")
      return (
        <span className="inline-flex items-center rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-semibold text-yellow-400">
          ⏳ Pending
        </span>
      );
    return (
      <span className="inline-flex items-center rounded-full bg-destructive/20 px-2 py-0.5 text-xs font-semibold text-destructive">
        ❌ Unpaid
      </span>
    );
  }

  return (
    <>
      {notifyApp && (
        <NotifyModal
          app={notifyApp}
          onClose={() => setNotifyApp(null)}
          resendKey={resendKey}
          brevoKey={brevoKey}
          emailProvider={emailProvider}
          senderEmail={senderEmail}
          paymentUrl={paymentUrl}
          onNotified={() => toggleNotified(notifyApp.id)}
        />
      )}
      {showBulk && (
        <BulkEmailModal
          applications={filteredAndSortedApplications}
          onClose={() => setShowBulk(false)}
          resendKey={resendKey}
          brevoKey={brevoKey}
          emailProvider={emailProvider}
          senderEmail={senderEmail}
          paymentUrl={paymentUrl}
          onNotifiedBatch={markBatchNotified}
          notifiedApps={notifiedApps}
        />
      )}

      <Sheet open={showSettings} onOpenChange={setShowSettings}>
        <SheetContent className="w-full sm:max-w-md bg-card border-border overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-xl font-bold flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" /> Admin Settings
            </SheetTitle>
            <SheetDescription className="text-muted-foreground text-xs">
              Configure parameters for email blasting and student payment confirmations. Settings are saved in your local browser.
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              saveSettings(
                (fd.get("email_provider") as "resend" | "brevo") || "resend",
                fd.get("resend_key") as string,
                fd.get("brevo_key") as string,
                fd.get("sender_email") as string,
                fd.get("payment_url") as string,
              );
              setShowSettings(false);
            }}
            className="space-y-5"
          >
            <div className="space-y-1.5">
              <Label htmlFor="email_provider">Email Provider</Label>
              <select
                id="email_provider"
                name="email_provider"
                defaultValue={emailProvider}
                className="w-full h-10 bg-background border border-border rounded-lg px-3 py-1 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary text-foreground transition-colors cursor-pointer hover:bg-background/80"
              >
                <option value="resend">Resend</option>
                <option value="brevo">Brevo (Sendinblue)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="resend_key">Resend API Key</Label>
              <Input
                id="resend_key"
                name="resend_key"
                type="password"
                defaultValue={resendKey}
                placeholder="re_xxxxxxxxxxxxxxxxxxxx"
              />
              <p className="text-[10px] text-muted-foreground">
                Retrieve your key from{" "}
                <a
                  href="https://resend.com/api-keys"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-primary underline"
                >
                  resend.com/api-keys
                </a>
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="brevo_key">Brevo API Key</Label>
              <Input
                id="brevo_key"
                name="brevo_key"
                type="password"
                defaultValue={brevoKey}
                placeholder="xkeysib-xxxxxxxxxxxxxxxxxxxx"
              />
              <p className="text-[10px] text-muted-foreground">
                Retrieve your key from SMTP & API page in your Brevo dashboard.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sender_email">Sender Email ("From" Address)</Label>
              <Input
                id="sender_email"
                name="sender_email"
                type="email"
                defaultValue={senderEmail}
                placeholder="academy@ugettech.com"
              />
              <p className="text-[10px] text-muted-foreground">
                E.g., <code>Uget Academy &lt;academy@ugettech.com&gt;</code> or <code>no-reply@uget.com.ng</code>. Must be a verified sender in your chosen provider.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="payment_url">Payment Page URL</Label>
              <Input
                id="payment_url"
                name="payment_url"
                type="url"
                defaultValue={paymentUrl}
                placeholder="https://uget-enroll.vercel.app/payment"
              />
              <p className="text-[10px] text-muted-foreground">
                This is the payment confirmation link embedded in email alerts.
              </p>
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold">
                Save Settings
              </Button>
            </div>
          </form>

          {/* WhatsApp Correction Tool */}
          <div className="mt-6 pt-6 border-t border-border/60 space-y-4">
            <h4 className="font-semibold uppercase tracking-wider text-[10px] text-destructive">
              Emergency: WhatsApp Correction
            </h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              If you recently sent offers with the incorrect WhatsApp support number ending in <code>0799</code>, use this tool to send a polite follow-up correction email to all candidates who were marked as "Notified" in this browser.
            </p>
            <Button
              type="button"
              variant="destructive"
              onClick={sendCorrectionEmails}
              disabled={sendingCorrection || !resendKey}
              className="w-full font-semibold text-xs py-2 bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-1.5"
            >
              {sendingCorrection ? "Sending Correction..." : "📧 Send Correction to Notified Candidates"}
            </Button>
          </div>

          {/* Reference Fees */}
          <div className="mt-8 pt-6 border-t border-border/60 text-xs space-y-3">
            <h4 className="font-semibold text-foreground uppercase tracking-wider text-[10px]">Course Fee Schedule</h4>
            <div className="space-y-1.5 rounded-lg border border-border/60 bg-card/45 p-3 leading-relaxed">
              {Object.entries(COURSE_FEES).slice(0, 12).map(([course, fee]) => (
                <div key={course} className="flex justify-between text-muted-foreground">
                  <span>{course}</span>
                  <span className="font-mono font-semibold text-foreground">{fmt(fee)}</span>
                </div>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <div className="container mx-auto py-4 sm:py-10 px-3 sm:px-4 max-w-[100vw] sm:max-w-[95vw]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Uget Academy — Admin</h1>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Button
              onClick={() => setShowBulk(true)}
              className="bg-primary text-primary-foreground flex-1 sm:flex-none"
            >
              📧 Send Payment Emails
            </Button>
            <Button
              onClick={downloadCSV}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              Export CSV
            </Button>
            <Button
              onClick={() => setShowSettings(true)}
              variant="outline"
              size="icon"
              title="Settings"
              className="flex-1 sm:flex-none h-10 w-10"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              onClick={onLogout}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* Search & Sort Panel */}
        <div className="flex flex-col gap-3 mb-6 bg-card/45 border border-border/60 rounded-xl p-3 sm:p-4 backdrop-blur-sm shadow-sm">
          {/* Search row */}
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, email, phone, course, reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-10 bg-background/40 border-border/80 focus-visible:ring-primary text-sm rounded-lg"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filters row */}
          <div className="flex flex-wrap items-center gap-2 justify-between">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              Showing <strong className="text-foreground">{filteredAndSortedApplications.length}</strong> of <strong className="text-foreground">{applications.length}</strong>
            </span>

            <div className="flex flex-wrap items-center gap-2">
              <select
                id="filter-notified"
                value={notifiedFilter}
                onChange={(e) => setNotifiedFilter(e.target.value as "all" | "yes" | "no")}
                className="h-9 bg-background/50 border border-border/80 rounded-lg px-2 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary text-foreground transition-colors cursor-pointer hover:bg-background/80"
              >
                <option value="all">All Notifications</option>
                <option value="no">⏳ Not Sent</option>
                <option value="yes">✅ Notified</option>
              </select>

              <select
                id="sort-by"
                value={`${sortField}-${sortDirection}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split("-");
                  setSortField(field);
                  setSortDirection(direction as "asc" | "desc");
                }}
                className="h-9 bg-background/50 border border-border/80 rounded-lg px-2 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary text-foreground transition-colors cursor-pointer hover:bg-background/80"
              >
                <option value="created_at-desc">Date (Newest)</option>
                <option value="created_at-asc">Date (Oldest)</option>
                <option value="full_name-asc">Name (A-Z)</option>
                <option value="full_name-desc">Name (Z-A)</option>
                <option value="track-asc">Track (A-Z)</option>
                <option value="payment_status-asc">Status (Unpaid First)</option>
                <option value="payment_status-desc">Status (Paid First)</option>
              </select>
            </div>
          </div>
        </div>

        <Tabs defaultValue="payments" className="w-full">
          <TabsList className="mb-4 flex flex-wrap h-auto gap-1 w-full">
            <TabsTrigger value="payments" className="text-xs sm:text-sm flex-1 min-w-[120px]">
              Payments ({paid.length + pending.length}/{applications.length})
            </TabsTrigger>
            <TabsTrigger value="part-payment" className="text-orange-400 data-[state=active]:text-orange-300 text-xs sm:text-sm flex-1 min-w-[120px]">
              ⚡ Part-Pay ({applications.filter(a => a.payment_ref && a.payment_ref.includes('[PART-PAYMENT]')).length})
            </TabsTrigger>
            <TabsTrigger value="applications" className="text-xs sm:text-sm flex-1 min-w-[120px]">
              All ({applications.length})
            </TabsTrigger>
            <TabsTrigger value="referrers" className="text-xs sm:text-sm flex-1 min-w-[90px]">Referrers ({referrals.length})</TabsTrigger>
          </TabsList>

          {/* ── PAYMENTS TAB ─────────────────────────────────────────────── */}
          <TabsContent value="payments" className="space-y-6">
            {/* Summary cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Paid", count: paid.length, color: "text-primary", bg: "bg-primary/10 border-primary/30" },
                { label: "Pending Verification", count: pending.length, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
                { label: "Unpaid", count: unpaid.length, color: "text-destructive", bg: "bg-destructive/10 border-destructive/30" },
              ].map((s) => (
                <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
                  <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Paid / Pending & Unpaid lists */}
            {[
              {
                id: "paid-pending",
                title: "✅ Paid / Pending Verification",
                rows: filteredAndSortedApplications.filter(
                  (a) => a.payment_status === "Paid" || a.payment_status === "Pending Verification"
                ),
                showDetails: true,
              },
              {
                id: "unpaid",
                title: "❌ Unpaid",
                rows: filteredAndSortedApplications.filter(
                  (a) => !a.payment_status || a.payment_status === "Unpaid"
                ),
                showDetails: false,
              },
            ].map((group) => {
              if (group.rows.length === 0) return null;
              return (
                <div key={group.id} className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    {group.title} ({group.rows.length})
                  </h3>
                  <div className="border rounded-lg overflow-x-auto shadow-sm">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {renderSortableHeader("full_name", "Name")}
                          {renderSortableHeader("email", "Email")}
                          {renderSortableHeader("track", "Course")}
                          {renderSortableHeader("fee", "Fee")}
                          {renderSortableHeader("payment_status", "Status")}
                          {renderSortableHeader("notified", "Notified")}
                          {group.showDetails && (
                            <>
                              {renderSortableHeader("payment_sender", "Sender Name")}
                              {renderSortableHeader("payment_ref", "Reference")}
                              {renderSortableHeader("payment_date", "Date")}
                              {renderSortableHeader("payment_amount", "Amount Paid")}
                            </>
                          )}
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.rows.map((app, i) => {
                          const fee = COURSE_FEES[app.track] ?? 0;
                          return (
                            <TableRow key={i}>
                              <TableCell className="font-medium whitespace-nowrap">
                                {app.full_name}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">{app.email}</TableCell>
                              <TableCell className="whitespace-nowrap">{app.track}</TableCell>
                              <TableCell className="font-semibold text-primary whitespace-nowrap">
                                {fee > 0 ? fmt(fee) : "—"}
                              </TableCell>
                              <TableCell>
                                <PaymentBadge status={app.payment_status} />
                              </TableCell>
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => toggleNotified(app.id)}
                                  className="focus:outline-none select-none text-left"
                                  title="Click to toggle notification status"
                                >
                                  {notifiedApps[app.id] ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500/15 text-green-400 border border-green-500/20">
                                      ✅ Notified
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-zinc-500/10 text-muted-foreground border border-zinc-500/15">
                                      ⏳ Not Sent
                                    </span>
                                  )}
                                </button>
                              </TableCell>
                              {group.showDetails && (
                                <>
                                  <TableCell className="whitespace-nowrap">{app.payment_sender ?? "—"}</TableCell>
                                  <TableCell className="whitespace-nowrap">
                                    {(() => {
                                      if (!app.payment_ref) return "—";
                                      const hasReceipt = app.payment_ref.includes("data:");
                                      const parts = app.payment_ref.split(" | ");
                                      const refText = parts.length > 1 ? parts[0] : (hasReceipt ? "" : app.payment_ref);
                                      const isPdf = hasReceipt && app.payment_ref.includes("data:application/pdf");
                                      return (
                                        <div className="flex flex-col gap-0.5">
                                          {refText && <span className="font-mono text-xs">{refText}</span>}
                                          {hasReceipt && (
                                            <span className="text-primary font-bold text-[11px] flex items-center gap-1 select-none">
                                              {isPdf ? "📄 PDF Receipt" : "🖼️ Receipt Uploaded"}
                                            </span>
                                          )}
                                        </div>
                                      );
                                    })()}
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap">{app.payment_date ?? "—"}</TableCell>
                                  <TableCell className="whitespace-nowrap">
                                    {app.payment_amount ? fmt(app.payment_amount) : "—"}
                                  </TableCell>
                                </>
                              )}
                              <TableCell>
                                <div className="flex gap-1 flex-wrap">
                                  {app.payment_status !== "Paid" && (
                                    <Button
                                      size="sm"
                                      className="bg-primary/20 text-primary hover:bg-primary/30 border-0 text-xs"
                                      onClick={() => updatePaymentStatus(app.id, "Paid")}
                                    >
                                      Mark Paid
                                    </Button>
                                  )}
                                  {app.payment_status === "Paid" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-xs"
                                      onClick={() => updatePaymentStatus(app.id, "Unpaid")}
                                    >
                                      Mark Unpaid
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs"
                                    onClick={() => setNotifyApp(app)}
                                  >
                                    Notify
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="text-xs font-semibold py-1 bg-red-600/90 hover:bg-red-700 text-white"
                                    onClick={() => deleteApplication(app.id)}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="text-center py-8 text-muted-foreground">Loading…</div>
            )}
          </TabsContent>

          {/* ── ALL APPLICATIONS TAB ──────────────────────────────────────── */}
          <TabsContent value="applications" className="border rounded-lg shadow-sm">
            <div className="overflow-x-auto whitespace-nowrap">
              <Table>
                <TableHeader>
                  <TableRow>
                    {renderSortableHeader("created_at", "Date")}
                    {renderSortableHeader("track", "Track")}
                    {renderSortableHeader("full_name", "Full Name")}
                    {renderSortableHeader("email", "Email")}
                    {renderSortableHeader("phone", "Phone")}
                    {renderSortableHeader("gender", "Gender")}
                    {renderSortableHeader("date_of_birth", "DOB")}
                    {renderSortableHeader("state_region", "State/Region")}
                    {renderSortableHeader("country", "Country")}
                    {renderSortableHeader("highest_qualification", "Highest Qual.")}
                    {renderSortableHeader("institution", "Institution")}
                    {renderSortableHeader("course_of_study", "Course of Study")}
                    {renderSortableHeader("current_status", "Current Status")}
                    {renderSortableHeader("studied_before", "Studied Before")}
                    {renderSortableHeader("experience_level", "Exp. Level")}
                    {renderSortableHeader("has_computer", "Has Computer")}
                    {renderSortableHeader("has_internet", "Has Internet")}
                    {renderSortableHeader("can_commit", "Can Commit")}
                    {renderSortableHeader("heard_from", "Heard From")}
                    {renderSortableHeader("referral_code", "Referral Code")}
                    {renderSortableHeader("signature", "Signature")}
                    {renderSortableHeader("agreed_to_terms", "Agreed to Terms")}
                    {renderSortableHeader("notified", "Notified")}
                    {renderSortableHeader("payment_status", "Payment Status")}
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={24} className="text-center py-4">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredAndSortedApplications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={24} className="text-center py-4">
                        No applications found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSortedApplications.map((app, i) => (
                      <Fragment key={app.id || i}>
                        <TableRow
                          onClick={() => toggleRow(app.id)}
                          className="cursor-pointer hover:bg-muted/40 transition-colors"
                        >
                          <TableCell>
                            {new Date(app.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{app.track}</TableCell>
                          <TableCell className="font-medium flex items-center gap-1">
                            {expandedRows[app.id] ? (
                              <ChevronUp className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            )}
                            {app.full_name}
                          </TableCell>
                          <TableCell>{app.email}</TableCell>
                          <TableCell>{app.phone}</TableCell>
                          <TableCell>{app.gender}</TableCell>
                          <TableCell>{app.date_of_birth || "—"}</TableCell>
                          <TableCell>{app.state_region}</TableCell>
                          <TableCell>{app.country}</TableCell>
                          <TableCell>{app.highest_qualification}</TableCell>
                          <TableCell>{app.institution || "—"}</TableCell>
                          <TableCell>{app.course_of_study || "—"}</TableCell>
                          <TableCell>{app.current_status}</TableCell>
                          <TableCell>{app.studied_before ? "Yes" : "No"}</TableCell>
                          <TableCell>{app.experience_level}</TableCell>
                          <TableCell>{app.has_computer ? "Yes" : "No"}</TableCell>
                          <TableCell>{app.has_internet ? "Yes" : "No"}</TableCell>
                          <TableCell>{app.can_commit ? "Yes" : "No"}</TableCell>
                          <TableCell>{app.heard_from}</TableCell>
                          <TableCell>{app.referral_code || "—"}</TableCell>
                          <TableCell>{app.signature}</TableCell>
                          <TableCell>{app.agreed_to_terms ? "Yes" : "No"}</TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => toggleNotified(app.id)}
                              className="focus:outline-none select-none text-left"
                              title="Click to toggle notification status"
                            >
                              {notifiedApps[app.id] ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500/15 text-green-400 border border-green-500/20">
                                  ✅ Notified
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-zinc-500/10 text-muted-foreground border border-zinc-500/15">
                                  ⏳ Not Sent
                                </span>
                              )}
                            </button>
                          </TableCell>
                          <TableCell>
                            <PaymentBadge status={app.payment_status} />
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <div className="flex gap-1.5 items-center flex-wrap">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs whitespace-nowrap"
                                onClick={() => setNotifyApp(app)}
                              >
                                Notify
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleRow(app.id)}
                                className="text-xs text-muted-foreground p-1 h-8 w-8"
                              >
                                {expandedRows[app.id] ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="text-xs font-semibold bg-red-600/90 hover:bg-red-700 text-white"
                                onClick={() => deleteApplication(app.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>

                        {expandedRows[app.id] && (
                          <TableRow className="bg-muted/10 border-b border-border/80" onClick={(e) => e.stopPropagation()}>
                            <TableCell colSpan={24} className="p-4">
                              <div className="max-w-3xl rounded-xl border border-border bg-card/65 p-4 space-y-4 shadow-inner">
                                <h4 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                  Payment Verification Details
                                </h4>
                                <div className="grid gap-4 sm:grid-cols-4">
                                  <div>
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Sender Name</div>
                                    <div className="text-sm font-semibold">{app.payment_sender ?? "—"}</div>
                                  </div>
                                  <div>
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Reference / Receipt</div>
                                    {(() => {
                                      if (!app.payment_ref) return <div className="text-sm font-semibold">—</div>;
                                      const hasReceipt = app.payment_ref.includes("data:");
                                      const parts = app.payment_ref.split(" | ");
                                      const refText = parts.length > 1 ? parts[0] : (hasReceipt ? "" : app.payment_ref);
                                      const receiptData = hasReceipt ? (parts.length > 1 ? parts[1] : app.payment_ref) : null;
                                      const isPdf = hasReceipt && receiptData && receiptData.startsWith("data:application/pdf");
                                      return (
                                        <div className="space-y-2">
                                          {refText && <div className="text-sm font-semibold font-mono text-primary/95">{refText}</div>}
                                          {receiptData && (
                                            <div className="mt-1">
                                              <a
                                                href={receiptData}
                                                target="_blank"
                                                rel="noreferrer noopener"
                                                className="inline-flex items-center gap-1 text-primary hover:underline text-xs font-semibold"
                                              >
                                                {isPdf ? "👁️ View PDF Receipt" : "👁️ View Full Receipt"}
                                              </a>
                                              <div className="mt-1.5 rounded-lg overflow-hidden border border-border/40 max-w-[200px] bg-card/50 p-1 flex items-center justify-center">
                                                {isPdf ? (
                                                  <div className="p-4 flex flex-col items-center gap-1.5 text-muted-foreground select-none">
                                                    <span className="text-2xl">📄</span>
                                                    <span className="text-[10px] font-medium">PDF Document</span>
                                                  </div>
                                                ) : (
                                                  <img
                                                    src={receiptData}
                                                    alt="Receipt Proof"
                                                    className="max-h-36 object-contain rounded"
                                                  />
                                                )}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })()}
                                  </div>
                                  <div>
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Date Paid</div>
                                    <div className="text-sm font-semibold">{app.payment_date ?? "—"}</div>
                                  </div>
                                  <div>
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Amount Paid</div>
                                    <div className="text-sm font-bold text-primary">
                                      {app.payment_amount ? fmt(app.payment_amount) : "—"}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                  {app.payment_status !== "Paid" && (
                                    <Button
                                      size="sm"
                                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs px-4"
                                      onClick={() => updatePaymentStatus(app.id, "Paid")}
                                    >
                                      ✓ Mark as Paid
                                    </Button>
                                  )}
                                  {app.payment_status !== "Unpaid" && app.payment_status !== null && (
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="font-semibold text-xs px-4"
                                      onClick={() => updatePaymentStatus(app.id, "Unpaid")}
                                    >
                                      ✕ Mark as Unpaid
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs px-4"
                                    onClick={() => setNotifyApp(app)}
                                  >
                                    Notify Student
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="text-xs font-semibold px-4 bg-red-600/90 hover:bg-red-700 text-white"
                                    onClick={() => deleteApplication(app.id)}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* ── REFERRERS TAB ────────────────────────────────────────────── */}
          <TabsContent
            value="referrers"
            className="border rounded-lg shadow-sm p-6 space-y-6"
          >
            <div className="max-w-md space-y-4">
              <h2 className="text-xl font-semibold">Generate New Referral Code</h2>
              <form onSubmit={generateReferral} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="refname">Referrer Name</Label>
                  <Input
                    id="refname"
                    placeholder="e.g. John Doe"
                    value={refName}
                    onChange={(e) => setRefName(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit">Generate Code</Button>
              </form>
              {refCode && (
                <div className="p-4 bg-primary/10 rounded-lg mt-4 border border-primary/20">
                  <p className="text-sm font-medium text-primary mb-1">Generated Code:</p>
                  <p className="text-2xl font-mono">{refCode}</p>
                </div>
              )}
            </div>

            <div className="pt-6 border-t">
              <h2 className="text-xl font-semibold mb-4">Existing Referrers</h2>
              <div className="overflow-x-auto whitespace-nowrap">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date Created</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referrals.map((ref, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          {new Date(ref.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{ref.referrer_name}</TableCell>
                        <TableCell className="font-mono">{ref.code}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteReferral(ref.id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {referrals.length === 0 && !loading && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          No referrers generated yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          {/* ── PART-PAYMENT TAB ─────────────────────────────────────────────── */}
          <TabsContent value="part-payment" className="space-y-6">
            {/* Summary cards */}
            {(() => {
              const partPayers = applications.filter(
                (a) => a.payment_ref && a.payment_ref.includes("[PART-PAYMENT]")
              );
              const partPending = partPayers.filter((a) => a.payment_status === "Pending Verification");
              const partPaid = partPayers.filter((a) => a.payment_status === "Paid");
              return (
                <>
                  <div className="rounded-xl border border-orange-500/30 bg-orange-500/5 p-4 flex items-start gap-3">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <h3 className="text-sm font-bold text-orange-300">Part-Payment Applicants</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        These applicants have paid 50% of their course fee. The remaining 50% is due at the end of the cohort before they receive their certificate.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    {[
                      { label: "Total Part-Payers", count: partPayers.length, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30" },
                      { label: "Verified Part-Paid", count: partPaid.length, color: "text-primary", bg: "bg-primary/10 border-primary/30" },
                      { label: "Pending Verification", count: partPending.length, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
                    ].map((s) => (
                      <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
                        <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
                        <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="border rounded-lg overflow-x-auto shadow-sm">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Track</TableHead>
                          <TableHead>Full Fee</TableHead>
                          <TableHead>Paid (50%)</TableHead>
                          <TableHead>Balance Due</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {partPayers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-8 text-muted-foreground text-sm">
                              No part-payment applicants found yet.
                            </TableCell>
                          </TableRow>
                        ) : (
                          partPayers.map((app, i) => {
                            const fullFee = COURSE_FEES[app.track] ?? 0;
                            const feeDetails = getFeeDetails(app.track);
                            const partAmount = app.payment_amount ?? Math.round(feeDetails.ngn.total * 0.5);
                            const balance = feeDetails.ngn.total - partAmount;
                            return (
                              <TableRow key={i}>
                                <TableCell className="font-medium whitespace-nowrap">{app.full_name}</TableCell>
                                <TableCell className="whitespace-nowrap text-xs">{app.email}</TableCell>
                                <TableCell className="whitespace-nowrap text-xs">{app.track}</TableCell>
                                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{fullFee > 0 ? fmt(feeDetails.ngn.total) : "—"}</TableCell>
                                <TableCell className="whitespace-nowrap font-semibold text-orange-400">{partAmount > 0 ? fmt(partAmount) : "—"}</TableCell>
                                <TableCell className="whitespace-nowrap font-semibold text-destructive">{balance > 0 ? fmt(balance) : "—"}</TableCell>
                                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                                  {app.payment_date ? new Date(app.payment_date).toLocaleDateString() : "—"}
                                </TableCell>
                                <TableCell>
                                  <span className="inline-flex items-center rounded-full bg-orange-500/15 px-2 py-0.5 text-xs font-semibold text-orange-400 border border-orange-500/20">
                                    ⚡ Part-Paid
                                  </span>
                                  <div className="mt-1">
                                    <PaymentBadge status={app.payment_status} />
                                  </div>
                                </TableCell>
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                  <div className="flex gap-1.5 items-center flex-wrap">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-xs whitespace-nowrap"
                                      onClick={() => setNotifyApp(app)}
                                    >
                                      Notify
                                    </Button>
                                    <select
                                      value={app.payment_status}
                                      onChange={(e) => updatePaymentStatus(app.id, e.target.value)}
                                      className="text-xs bg-background border border-border rounded px-1.5 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                                    >
                                      <option value="Unpaid">Unpaid</option>
                                      <option value="Pending Verification">Pending</option>
                                      <option value="Paid">Paid ✓</option>
                                    </select>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="text-xs font-semibold bg-red-600/90 hover:bg-red-700 text-white"
                                      onClick={() => deleteApplication(app.id)}
                                    >
                                      Delete
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </>
              );
            })()}
          </TabsContent>

        </Tabs>
      </div>
    </>
  );
}
