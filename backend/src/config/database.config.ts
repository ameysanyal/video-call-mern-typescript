import mongoose from 'mongoose';
import { Env } from '@/config/env.config.js';

const connectDatabase = async () => {
  // Connect only if NODE_ENV is not 'test'
  if (Env.NODE_ENV !== 'test') {
    try {
      await mongoose.connect(Env.MONGO_URI, {
        serverSelectionTimeoutMS: 8000, // MongoDB will give up finding a suitable server after 8000 ms (8 seconds).
        socketTimeoutMS: 45000, //Timeout for inactivity on the socket (45 seconds).
        connectTimeoutMS: 30000, //Max time to wait for the initial connection (30 seconds).
      });
      console.log('Connected to MongoDB database');
    } catch (error) {
      console.error('Error connecting to MongoDB database:', error);
      process.exit(1);
    }
  }
};

export default connectDatabase;
