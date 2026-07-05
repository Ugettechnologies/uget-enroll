import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const sendEmailSchema = z.object({
  resendKey: z.string(),
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
          error: errBody?.message || `Failed to send email: ${res.statusText}`,
        };
      }

      const body = await res.json();
      return {
        success: true,
        data: body,
      };
    } catch (e: any) {
      console.error("Error in sendEmailFn handler:", e);
      return {
        success: false,
        error: e.message || "Network error on the server.",
      };
    }
  });
