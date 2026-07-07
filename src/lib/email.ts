import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const sendEmailSchema = z.object({
  provider: z.enum(["resend", "brevo"]).optional(),
  resendKey: z.string().optional(),
  brevoKey: z.string().optional(),
  from: z.string(),
  to: z.array(z.string()),
  subject: z.string(),
  html: z.string(),
  text: z.string(),
});

export const sendEmailFn = createServerFn({ method: "POST" })
  .validator(sendEmailSchema)
  .handler(async ({ data }) => {
    try {
      const provider = data.provider || "resend";

      if (provider === "brevo") {
        if (!data.brevoKey) {
          return {
            success: false,
            error: "Brevo API Key is missing.",
          };
        }

        // Parse sender name and email from "Name <email@domain.com>" format if present
        let senderName = "Uget Academy";
        let senderEmail = data.from;
        const match = data.from.match(/(.*)<(.[^>]+)>/);
        if (match) {
          senderName = match[1].trim();
          senderEmail = match[2].trim();
        }

        const res = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "accept": "application/json",
            "api-key": data.brevoKey,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            sender: {
              name: senderName,
              email: senderEmail,
            },
            to: data.to.map((email) => ({ email })),
            subject: data.subject,
            htmlContent: data.html,
            textContent: data.text,
          }),
        });

        if (!res.ok) {
          const errBody = await res.json().catch(() => null);
          return {
            success: false,
            error: errBody?.message || `Failed to send email via Brevo: ${res.statusText}`,
          };
        }

        const body = await res.json();
        return {
          success: true,
          data: body,
        };
      } else {
        // Default to Resend
        if (!data.resendKey) {
          return {
            success: false,
            error: "Resend API Key is missing.",
          };
        }

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.resendKey}`,
          },
          body: JSON.stringify({
            from: data.from,
            to: data.to,
            subject: data.subject,
            html: data.html,
            text: data.text,
          }),
        });

        if (!res.ok) {
          const errBody = await res.json().catch(() => null);
          return {
            success: false,
            error: errBody?.message || `Failed to send email via Resend: ${res.statusText}`,
          };
        }

        const body = await res.json();
        return {
          success: true,
          data: body,
        };
      }
    } catch (e: any) {
      console.error("Error in sendEmailFn handler:", e);
      return {
        success: false,
        error: e.message || "Network error on the server.",
      };
    }
  });
