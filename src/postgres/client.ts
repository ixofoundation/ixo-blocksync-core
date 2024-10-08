import { Pool, PoolClient } from "pg";
import { DATABASE_USE_SSL } from "../util/secrets";
import { currentPool } from "../sync/sync_blocks";

export const pool = new Pool({
  application_name: "Blocksync-core",
  connectionString: process.env.DATABASE_URL,
  // maximum number of clients the pool should contain
  // by default this is set to 10.
  // max: 20,
  // number of milliseconds a client must sit idle in the pool and not be checked out
  // before it is disconnected from the backend and discarded
  // default is 10000 (10 seconds) - set to 0 to disable auto-disconnection of idle clients
  // idleTimeoutMillis: 10000,
  // number of milliseconds to wait before timing out when connecting a new client
  // by default this is 0 which means no timeout
  connectionTimeoutMillis: 2000,
  ...(DATABASE_USE_SSL && { ssl: { rejectUnauthorized: false } }), // Use SSL (recommended
});

// helper function that manages connection transaction start and commit and rollback
// on fail, user can just pass a function that takes a client as argument
export const withTransaction = async (
  fn: (client: PoolClient) => Promise<any>
) => {
  // const start = Date.now();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const res = await fn(client);
    await client.query("COMMIT");
    return res;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    // console.log("executed transaction", { duration: Date.now() - start });
  }
};

/**
 * Helper function to execute a query either using the global current pool or a new pool connection
 */
export const dbQuery = async (queryText: string, params: any[] = []) => {
  const client = currentPool || pool;
  return await client.query(queryText, params);
};

// helper function that manages connect to pool and release,
// user can just pass a function that takes a client as argument
export const withQuery = async (fn: (client: any) => Promise<any>) => {
  // const start = Date.now();
  const client = await pool.connect();
  try {
    return await fn(client);
  } catch (error) {
    throw error;
  } finally {
    client.release();
    // console.log("executed query", { duration: Date.now() - start });
  }
};
