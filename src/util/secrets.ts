export const PORT = Number(process.env.PORT) || 8080;
export const SENTRYDSN = process.env.SENTRYDSN || undefined;
export const RPC = process.env.RPC || "http://localhost:26657";
export const DATABASE_URL = process.env.DATABASE_URL;
export const TRUST_PROXY = process.env.TRUST_PROXY || 1;
export const MIGRATE_DB_PROGRAMATICALLY =
  Number(process.env.MIGRATE_DB_PROGRAMATICALLY ?? "0") || 0;
export const DATABASE_USE_SSL =
  Number(process.env.DATABASE_USE_SSL ?? "0") || 0;
// log blocks whose fetch+index time exceeds this many milliseconds (0 disables)
export const SLOW_BLOCK_LOG_MS = Number(process.env.SLOW_BLOCK_LOG_MS ?? "8000");
// Client-side per-query pg timeout. A half-dead socket mid-query otherwise
// stalls the sync loop until the OS TCP retransmission timeout (~15min) —
// TCP keepalive only guards IDLE connections. 0 disables.
export const DATABASE_QUERY_TIMEOUT_MS =
  Number(process.env.DATABASE_QUERY_TIMEOUT_MS ?? "40000");
