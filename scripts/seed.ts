import "dotenv/config";
import { connectToDatabase } from "../src/lib/mongodb";
import { Product } from "../src/models/Product";
import { FailureRule } from "../src/models/FailureRule";

const products = [
  {
    name: "Nimbus Running Shoes",
    slug: "nimbus-running-shoes",
    description:
      "Lightweight performance shoes for daily training and long walks.",
    price: 89.99,
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    stock: 120,
    status: "active",
  },
  {
    name: "AeroPack Travel Backpack",
    slug: "aeropack-travel-backpack",
    description:
      "A durable backpack with laptop storage and anti-theft compartments.",
    price: 64.99,
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
    stock: 85,
    status: "active",
  },
  {
    name: "Pulse Wireless Headphones",
    slug: "pulse-wireless-headphones",
    description: "Noise-isolating wireless headphones with long battery life.",
    price: 129.99,
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    stock: 45,
    status: "active",
  },
  {
    name: "Forge Desk Lamp",
    slug: "forge-desk-lamp",
    description: "Minimal LED desk lamp for focused workspaces.",
    price: 39.99,
    imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c",
    stock: 60,
    status: "active",
  },
];

const failureRules = [
  {
    key: "payment_timeout",
    enabled: false,
    probability: 0.2,
    affectedQueue: "payment_processing",
    config: { message: "Simulated payment provider timeout" },
  },
  {
    key: "smtp_rate_limit",
    enabled: false,
    probability: 0.3,
    affectedQueue: "email_notifications",
    config: { message: "Simulated SMTP rate limit exceeded" },
  },
  {
    key: "inventory_unavailable",
    enabled: false,
    probability: 0.2,
    affectedQueue: "inventory_sync",
    config: { message: "Simulated inventory sync service offline" },
  },
  {
    key: "invalid_invoice_payload",
    enabled: false,
    probability: 0.15,
    affectedQueue: "invoice_generation",
    config: { message: "Simulated invalid invoice payload format" },
  },
  {
    key: "worker_slowdown",
    enabled: false,
    probability: 0.5,
    affectedQueue: "payment_processing",
    config: { delayMs: 10000, message: "Simulated heavy process slowdown" },
  },
  {
    key: "dead_letter_growth",
    enabled: false,
    probability: 0.4,
    affectedQueue: "inventory_sync",
    config: { message: "Simulated persistent inventory error leading to DLQ" },
  },
];

async function seed() {
  await connectToDatabase();

  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log("Seeded products successfully.");

  await FailureRule.deleteMany({});
  await FailureRule.insertMany(failureRules);
  console.log("Seeded failure rules successfully.");

  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
