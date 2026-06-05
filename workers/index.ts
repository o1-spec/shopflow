import "dotenv/config";
import mongoose from "mongoose";

async function bootstrap() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  console.log("✅ MongoDB connected for workers");

  await import("./payment.worker");
  await import("./inventory.worker");
  await import("./invoice.worker");
  await import("./email.worker");
  await import("./shipment.worker");

  console.log("🚀 ShopFlow Workers Started");
}

bootstrap().catch((error) => {
  console.error("❌ Failed to start ShopFlow workers:", error);
  process.exit(1);
});
