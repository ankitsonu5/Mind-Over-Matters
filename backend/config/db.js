// =====================================================================
//  MongoDB connection helper.
//  The client is cached on the module scope so we open ONE pool for the
//  whole process instead of a new connection per request.
//
//  Env vars:
//    MONGODB_URI  - Atlas connection string (required for Mongo mode)
//    MONGODB_DB   - database name (optional, default "mom")
// =====================================================================
import { MongoClient } from "mongodb";

let client = null;
let promise = null;

export function hasMongo() {
  return Boolean(process.env.MONGODB_URI);
}

export async function getDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI env var is missing");
  const dbName = process.env.MONGODB_DB || "mom";

  if (!promise) {
    const c = new MongoClient(uri, { maxPoolSize: 5 });
    promise = c.connect().catch((err) => {
      promise = null; // allow a retry on the next request
      throw err;
    });
  }
  client = await promise;
  return client.db(dbName);
}

export async function submissionsCollection() {
  const db = await getDb();
  return db.collection("submissions");
}

export async function closeDb() {
  if (client) await client.close();
  client = null;
  promise = null;
}
