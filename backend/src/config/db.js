const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoMemoryServer = null;

const connectDB = async () => {
  const primaryURI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-resume-screening';
  
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(primaryURI, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[Database] Connected to MongoDB database`);
  } catch (err) {
    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[Database] Connected to In-Memory Database Engine`);
    } catch (memErr) {
      console.error(`[Database] Database connection error:`, memErr.message);
    }
  }
};

module.exports = connectDB;