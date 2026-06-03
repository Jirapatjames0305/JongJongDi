import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import ws from "ws";

let cached: SupabaseClient | null = null;

// ws's WebSocket type isn't structurally identical to realtime-js's WebSocketLikeConstructor,
// so cast to the transport type derived from createClient's own options signature.
type RealtimeTransport = NonNullable<NonNullable<Parameters<typeof createClient>[2]>["realtime"]>["transport"];

export function isStorageEnabled(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getSupabase(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw Object.assign(new Error("StorageNotConfigured"), { status: 503 });
  }
  // Node < 22 has no native WebSocket — give realtime-js a transport so it doesn't warn.
  // (We only use Storage, never realtime, but the client probes WebSocket on construction.)
  cached = createClient(url, key, { realtime: { transport: ws as unknown as RealtimeTransport } });
  return cached;
}

export const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET ?? "jongjongdi-uploads";
