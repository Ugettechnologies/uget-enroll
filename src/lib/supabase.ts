import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://mcmyjsszuipdcfnjvigp.supabase.co";
const DEFAULT_SUPABASE_KEY = "sb_publishable_hlZQZCGGFp8ls6UXCBv6jg_feh6pH4S";

const url =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  DEFAULT_SUPABASE_URL;
const key =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
  DEFAULT_SUPABASE_KEY;

export const supabaseConfigured = Boolean(url && key);

export const supabase = supabaseConfigured
  ? createClient(url, key, { auth: { persistSession: false } })
  : null;
