import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (err) {
    console.error('DB connection failed:', err.message);
    // Let the request through anyway — routes that need the DB will fail on
    // their own with a clear error, but this stops a Mongo outage from
    // taking down routes (like /api/health) that don't touch it.
  }
  return app(req, res);
}
