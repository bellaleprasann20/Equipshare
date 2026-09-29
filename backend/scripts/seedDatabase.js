import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import Equipment from "../src/models/Equipment.js";
import User from "../src/models/User.js";
import Order from "../src/models/Order.js";
import AllocationRequest from "../src/models/AllocationRequest.js";
import { env } from "../src/config/environment.js";
import { catalogEquipment } from "../data/catalogEquipment.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const includeSynthetic = process.argv.includes("--full");

/**
 * npm run seed        -> 24 catalog machines (with images and prices) + 2 test users
 * npm run seed:full   -> the same, plus the 150 synthetic machines used for
 *                        the EEI and allocation experiments
 *
 * WARNING: clears equipment, orders and allocation requests first.
 */
async function seed() {
  await mongoose.connect(env.MONGO_URI);
  console.log("Connected to MongoDB for seeding...");

  await Equipment.deleteMany({});
  await Order.deleteMany({});
  await AllocationRequest.deleteMany({});

  const curated = await Equipment.insertMany(catalogEquipment);
  console.log(`Seeded ${curated.length} catalog machines.`);

  if (includeSynthetic) {
    const datasetPath = path.join(__dirname, "../data/syntheticDataset.json");
    const synthetic = JSON.parse(fs.readFileSync(datasetPath, "utf-8"));
    const inserted = await Equipment.insertMany(synthetic);
    console.log(`Seeded ${inserted.length} synthetic machines.`);
  }

  const testUsers = [
    { name: "Admin Demo", email: "admin@equipshare.test", password: "password123", role: "admin", companyName: "EquipShare Demo Co." },
    { name: "Manager Demo", email: "manager@equipshare.test", password: "password123", role: "manager", companyName: "EquipShare Demo Co." },
  ];

  for (const userData of testUsers) {
    await User.deleteOne({ email: userData.email });
    await User.create(userData);
    console.log(`Seeded user: ${userData.email} / password123 (${userData.role})`);
  }

  await mongoose.disconnect();
  console.log("Seeding complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});