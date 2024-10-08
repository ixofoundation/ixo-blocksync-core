export const PORT = Number(process.env.PORT) || 8080;
export const SENTRYDSN = process.env.SENTRYDSN || undefined;
export const RPC = process.env.RPC || "http://localhost:26657";
export const DATABASE_URL = process.env.DATABASE_URL;
export const TRUST_PROXY = process.env.TRUST_PROXY || 1;
export const MIGRATE_DB_PROGRAMATICALLY =
  Number(process.env.MIGRATE_DB_PROGRAMATICALLY ?? "0") || 0;
export const DATABASE_USE_SSL =
  Number(process.env.DATABASE_USE_SSL ?? "0") || 0;
