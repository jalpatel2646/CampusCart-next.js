import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || "campus_cart";

/**
 * Cached connection for serverless + Next.js dev hot reload.
 * Stored on globalThis so module re-evaluation does not open new pools.
 */
const globalForMongoose = globalThis;
const cached = (globalForMongoose.mongoose ??= { conn: null, promise: null });

/**
 * Reusable MongoDB connection.
 * Safe to call from every service / route handler: repeated calls reuse the
 * same Mongoose instance and connection pool.
 *
 * @returns {Promise<import("mongoose").Mongoose>}
 */
export async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local"
    );
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: MONGODB_DB,
        bufferCommands: false,
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 10,
      })
      .catch((error) => {
        // Allow the next call to retry instead of caching a rejected promise.
        cached.promise = null;
        cached.conn = null;
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

/** True for a 24-character hex ObjectId string (or an ObjectId instance). */
export function isValidObjectId(value) {
  if (value === undefined || value === null || value === "") return false;
  if (typeof value === "string") return /^[a-f\d]{24}$/i.test(value);
  return mongoose.isValidObjectId(value);
}

export default connectToDatabase;
