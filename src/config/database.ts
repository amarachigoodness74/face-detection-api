import mongoose from "mongoose";
import dotenv from "dotenv-safe";
import config from "config";
import logger from "../utils/logger";

dotenv.config();

const connectDB = async () => {
  const dbURL = config.get("dbConfig.url") as string;
  try {
    await mongoose.connect(dbURL);
    logger.info("MongoDB connected...");
  } catch (error: any) {
    logger.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;