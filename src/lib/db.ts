import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    // Enhanced options for institutional/restrictive networks
    const opts = {
      bufferCommands: true,
      serverSelectionTimeoutMS: 15000, // Increased to 15s for slower DNS resolution
      connectTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4 (often fixes ETIMEOUT on local machines)
    };

    console.log("[DB] Attempting Connection Bridge to Atlas...");
    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.info("[DB] Initialized Connection Bridge Stage 2");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log("[DB] Secure Ledger Connected.");
  } catch (e: any) {
    console.error("[DB] CONNECTION BRIDGE FAILURE:", e.message);
    cached.promise = null;
    
    // Provide a detailed instructional error
    const detailedError = new Error(
      `Network Resolution Failed (querySrv ETIMEOUT). Action Required:\n` +
      `1. Log into MongoDB Atlas\n` +
      `2. Go to 'Network Access'\n` +
      `3. Confirm '0.0.0.0/0' is ACTIVE\n` +
      `4. Verify institutional firewall allows port 27017`
    );
    throw detailedError;
  }

  return cached.conn;
}

export default dbConnect;
