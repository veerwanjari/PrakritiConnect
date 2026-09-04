import mongoose from 'mongoose';
import { env } from './env.js';

mongoose.set('strictQuery', true);

let connectionPromise = null;

export async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (connectionPromise) return connectionPromise;

  const mongoUri = env.mongoUri;
  connectionPromise = mongoose
    .connect(mongoUri, { dbName: mongoUri.split('/').pop().split('?')[0] })
    .then((conn) => {
      console.log('MongoDB connected');
      return conn;
    })
    .catch((error) => {
      console.error('MongoDB connection error:', error.message);
      connectionPromise = null;
      throw error;
    });

  return connectionPromise;
}
