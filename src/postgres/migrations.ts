import pg_migrate from "node-pg-migrate";

export async function postgresMigrate(databaseUrl: string): Promise<void> {
  await pg_migrate({
    databaseUrl,
    dir: "src/postgres/migrations",
    direction: "up",
    migrationsTable: "pgmigrations",
  });
}
