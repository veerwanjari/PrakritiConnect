import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';

// Vercel invokes this handler per-request. connectDB() reuses a cached
// connection across warm invocations instead of reconnecting every time.
export default async function handler(req, res) {
  await connectDB();
  return app(req, res);
}