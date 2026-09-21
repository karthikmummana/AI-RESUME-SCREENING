const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoMemoryServer = null;

const connectDB = async () => {
  const primaryURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-resume-screening';
  
  try {
    // 1. Try connecting to local MongoDB
    mongoose.set('strictQuery', false);
    await mongoose.connect(primaryURI, {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`[Database] Successfully connected to MongoDB at ${primaryURI}`);
  } catch (err) {
    console.warn(`[Database] Local MongoDB unreachable. Launching MongoMemoryServer fallback...`);
    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[Database] MongoMemoryServer active at ${memoryUri}`);
    } catch (memErr) {
      console.error(`[Database] Failed to initialize MongoMemoryServer fallback:`, memErr);
    }
  }
};

module.exports = connectDB;
