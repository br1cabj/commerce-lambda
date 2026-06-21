import mongoose from "mongoose";

export const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.error("FATAL: MONGODB_URI environment variable is not set.");
    process.exit(1);
  }

  const maxRetries = 5;
  let retries = 0;

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected. Attempting to reconnect...");
  });

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err);
  });

  mongoose.connection.on("connected", () => {
    console.log("Database connected successfully!");
  });

  while (retries < maxRetries) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        maxPoolSize: 20,
        minPoolSize: 5,
        maxIdleTimeMS: 60000,
      });
      return;
    } catch (error) {
      retries++;
      console.error(
        `Database connection attempt ${retries}/${maxRetries} failed:`,
        error.message,
      );
      if (retries === maxRetries) {
        console.error("Max retries reached. Could not connect to database.");
        process.exit(1);
      }
      const backoff = Math.min(3000 * Math.pow(2, retries - 1), 30000);
      await new Promise((resolve) => setTimeout(resolve, backoff));
    }
  }
};
