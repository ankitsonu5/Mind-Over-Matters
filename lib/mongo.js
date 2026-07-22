// =====================================================================
//  MongoDB connection helper (serverless-safe)
//  Caches the client on the global object so Vercel doesn't open a new
//  connection on every function invocation (which would exhaust the
//  free-tier connection limit).
//
//  Env vars:
//    MONGODB_URI  — Atlas connection string (required)
//    MONGODB_DB   — database name (optional, default "mom")
// =====================================================================
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "mom";

let cached = global._momMongo;
if (!cached) cached = global._momMongo = { client: null, promise: null };

export async function getDb() {
  if (!uri) throw new Error("MONGODB_URI env var is missing");
  if (!cached.promise) {
    const client = new MongoClient(uri, { maxPoolSize: 5 });
    cached.promise = client.connect().catch((err) => {
      cached.promise = null; // allow retry on next request
      throw err;
    });
  }
  cached.client = await cached.promise;
  return cached.client.db(dbName);
}

// collection that stores every form submission
export async function submissionsCollection() {
  const db = await getDb();
  return db.collection("submissions");
}
