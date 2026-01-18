import dotenv from "dotenv";

dotenv.config();

const env = {
  PORT: process.env.PORT || 5000,
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGO_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/simult",
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key-change-in-production",
  JWT_EXPIRE: process.env.JWT_EXPIRE || "7d",
};

export default env;
