import mongoose from "mongoose";
import  env from"./env";

export const connectDB = async (): Promise<void> => {
  try {
 
    if (!env.MONGO_URI) {
      throw new Error("Please provide a MongoDB URI");
      return;
    }

    await mongoose.connect(env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);

    mongoose.connection.on("error", (err) => {
      console.error(`❌ MongoDB connection error: ${err}`);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️  MongoDB disconnected");
    });
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error}`);
    process.exit(1);
  }
};
