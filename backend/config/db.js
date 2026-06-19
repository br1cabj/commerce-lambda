import mongoose from "mongoose";

export const connectDB = async () => {
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
      await new Promise((resolve) => setTimeout(resolve, 3000 * retries));
    }
  }
};
