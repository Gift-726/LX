/**
 * Database Configuration
 * Handles MongoDB connection
 */

import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }

    // Clean the connection string - remove unsupported options
    let cleanUri = mongoUri;
    const unsupportedOptions = ['bufferMaxEntries', 'buffermaxentries', 'bufferCommands', 'buffercommands'];
    unsupportedOptions.forEach(option => {
      const regex = new RegExp(`[?&]${option}=[^&]*`, 'gi');
      cleanUri = cleanUri.replace(regex, '');
    });
    cleanUri = cleanUri.replace(/\?&/g, '?').replace(/&&/g, '&').replace(/[?&]$/, '');

    const options: mongoose.ConnectOptions = {
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 60000,
      maxPoolSize: 10,
      retryWrites: true,
      retryReads: true,
    };

    await mongoose.connect(cleanUri, options);
    console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ MongoDB connection error:', errorMessage);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

export default connectDB;
