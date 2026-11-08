/**
 * Paystack Inline Payment Integration Helper
 * Dynamically loads the Paystack Popup script and handles transactions.
 * Supports seamless switching between Test and Live environments.
 */

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: {
        key: string;
        email: string;
        amount: number; // in kobo
        currency?: string;
        ref?: string;
        channels?: string[];
        metadata?: Record<string, any>;
        callback: (response: PaystackSuccessResponse) => void;
        onClose: () => void;
      }) => {
        openIframe: () => void;
      };
    };
  }
}

export type PaystackEnvironment = "test" | "live";

export const LIVE_PAYSTACK_PUBLIC_KEY = "pk_live_ae39a7954cab295dc2f08831435a4ceaec14863b";

/**
 * Gets currently active Paystack environment ("test" | "live")
 * Always defaults to "live" for real production transactions.
 */
export function getPaystackMode(): PaystackEnvironment {
  return "live";
}

/**
 * Sets Paystack environment mode ("test" | "live")
 */
export function setPaystackMode(mode: PaystackEnvironment): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("uget_paystack_mode", "live");
    window.dispatchEvent(new CustomEvent("paystack_mode_changed", { detail: "live" }));
  }
}

/**
 * Gets currently active public key based on selected environment mode
 * Strictly falls back to official Uget live public key for real transactions.
 */
export function getActivePaystackPublicKey(): string {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("uget_paystack_test_pk");
      localStorage.setItem("uget_paystack_mode", "live");
    } catch (_) {}
  }
  return (
    (import.meta.env.VITE_PAYSTACK_LIVE_PUBLIC_KEY as string | undefined) ||
    (import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string | undefined) ||
    LIVE_PAYSTACK_PUBLIC_KEY
  );
}

export interface PaystackSuccessResponse {
  reference: string;
  trans?: string;
  status?: string;
  message?: string;
  trxref?: string;
}

export interface PaystackPaymentParams {
  email: string;
  amount: number; // in primary currency unit (e.g. Naira)
  publicKey?: string;
  reference?: string;
  currency?: "NGN" | "GHS" | "USD" | "ZAR";
  metadata?: Record<string, any>;
  onSuccess: (response: PaystackSuccessResponse) => void | Promise<void>;
  onClose?: () => void;
}

/**
 * Ensures Paystack inline script is loaded into DOM
 */
export function loadPaystackScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (window.PaystackPop) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector('script[src*="paystack.co"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true));
      existingScript.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Initializes and opens Paystack inline checkout popup
 */
export async function payWithPaystack({
  email,
  amount,
  publicKey,
  reference,
  currency = "NGN",
  metadata = {},
  onSuccess,
  onClose,
}: PaystackPaymentParams): Promise<void> {
  const key = publicKey || getActivePaystackPublicKey();

  if (!key) {
    throw new Error(
      "Paystack Public Key is missing. Please configure your Paystack keys in .env or the Admin settings.",
    );
  }

  const loaded = await loadPaystackScript();
  if (!loaded || !window.PaystackPop) {
    throw new Error(
      "Could not initialize Paystack checkout. Please verify your internet connection and try again.",
    );
  }

  // Paystack expects amount in Kobo for NGN (1 NGN = 100 Kobo)
  const amountInKobo = Math.round(amount * 100);
  const payRef =
    reference || `UGET-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

  const currentMode = getPaystackMode();
  const enhancedMetadata = {
    ...metadata,
    paystack_env: currentMode,
  };

  const handler = window.PaystackPop.setup({
    key,
    email: email.trim().toLowerCase(),
    amount: amountInKobo,
    currency,
    ref: payRef,
    channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
    metadata: enhancedMetadata,
    callback: (response: PaystackSuccessResponse) => {
      onSuccess(response);
    },
    onClose: () => {
      if (onClose) onClose();
    },
  });

  handler.openIframe();
}
