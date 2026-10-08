import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import fs from "fs/promises";
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

/*
|--------------------------------------------------------------------------
| Seed configuration
|--------------------------------------------------------------------------
*/

const DEMO_USERS = [
  {
    name: "Admin Demo",
    email: "admin@equipshare.test",
    password: "password123",
    role: "admin",
    companyName: "EquipShare Demo Co.",
  },
  {
    name: "Manager Demo",
    email: "manager@equipshare.test",
    password: "password123",
    role: "manager",
    companyName: "EquipShare Demo Co.",
  },
];

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

async function loadSyntheticDataset() {
  const datasetPath = path.join(
    __dirname,
    "../data/syntheticDataset.json"
  );

  try {
    const rawData = await fs.readFile(
      datasetPath,
      "utf-8"
    );

    const synthetic = JSON.parse(rawData);

    if (!Array.isArray(synthetic)) {
      throw new Error(
        "syntheticDataset.json must contain an array."
      );
    }

    return synthetic;
  } catch (error) {
    throw new Error(
      `Failed to load synthetic dataset: ${error.message}`
    );
  }
}

function validateCatalog() {
  if (!Array.isArray(catalogEquipment)) {
    throw new Error(
      "catalogEquipment must be an array."
    );
  }

  if (catalogEquipment.length === 0) {
    throw new Error(
      "catalogEquipment is empty. Nothing to seed."
    );
  }
}

/*
|--------------------------------------------------------------------------
| Main seed function
|--------------------------------------------------------------------------
*/

async function seed() {
  let connected = false;

  try {
    /*
    |--------------------------------------------------------------------------
    | Validate seed data before touching the database
    |--------------------------------------------------------------------------
    */

    validateCatalog();

    if (!env.MONGO_URI) {
      throw new Error(
        "MONGO_URI is not configured."
      );
    }

    console.log("");
    console.log("========================================");
    console.log("       EquipShare Database Seeder");
    console.log("========================================");
    console.log("");

    console.log(
      `Mode: ${
        includeSynthetic
          ? "FULL (catalog + synthetic dataset)"
          : "STANDARD (catalog only)"
      }`
    );

    console.log("");

    /*
    |--------------------------------------------------------------------------
    | Connect MongoDB
    |--------------------------------------------------------------------------
    */

    await mongoose.connect(env.MONGO_URI);
    connected = true;

    console.log(
      "Connected to MongoDB for seeding."
    );

    /*
    |--------------------------------------------------------------------------
    | Clear development/test data
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    | This permanently removes these collections' documents.
    |
    */

    console.log("");
    console.log(
      "Clearing existing EquipShare seed data..."
    );

    const equipmentDeleteResult =
      await Equipment.deleteMany({});

    const orderDeleteResult =
      await Order.deleteMany({});

    const allocationDeleteResult =
      await AllocationRequest.deleteMany({});

    console.log(
      `Deleted equipment: ${equipmentDeleteResult.deletedCount}`
    );

    console.log(
      `Deleted orders: ${orderDeleteResult.deletedCount}`
    );

    console.log(
      `Deleted allocation requests: ${allocationDeleteResult.deletedCount}`
    );

    /*
    |--------------------------------------------------------------------------
    | Seed catalog equipment
    |--------------------------------------------------------------------------
    */

    console.log("");
    console.log(
      "Seeding catalog equipment..."
    );

    const curatedEquipment =
      await Equipment.insertMany(
        catalogEquipment,
        {
          ordered: true,
        }
      );

    console.log(
      `Seeded ${curatedEquipment.length} catalog machines.`
    );

    /*
    |--------------------------------------------------------------------------
    | Seed synthetic dataset
    |--------------------------------------------------------------------------
    */

    if (includeSynthetic) {
      console.log("");
      console.log(
        "Loading synthetic equipment dataset..."
      );

      const synthetic =
        await loadSyntheticDataset();

      if (synthetic.length === 0) {
        console.warn(
          "Synthetic dataset is empty. No synthetic equipment was inserted."
        );
      } else {
        console.log(
          `Found ${synthetic.length} synthetic machines.`
        );

        const insertedSynthetic =
          await Equipment.insertMany(
            synthetic,
            {
              ordered: true,
            }
          );

        console.log(
          `Seeded ${insertedSynthetic.length} synthetic machines.`
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Seed demo users
    |--------------------------------------------------------------------------
    */

    console.log("");
    console.log(
      "Seeding demo users..."
    );

    /*
     * Delete only the known demo accounts.
     * We do not delete all users because the seed script should
     * not destroy unrelated user accounts.
     */
    await User.deleteMany({
      email: {
        $in: DEMO_USERS.map(
          (user) => user.email
        ),
      },
    });

    for (const userData of DEMO_USERS) {
      await User.create(userData);

      console.log(
        `Seeded ${userData.role}: ${userData.email}`
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Complete
    |--------------------------------------------------------------------------
    */

    console.log("");
    console.log("========================================");
    console.log("       Seeding completed successfully");
    console.log("========================================");
    console.log("");

    console.log(
      `Catalog machines : ${curatedEquipment.length}`
    );

    if (includeSynthetic) {
      const totalEquipment =
        await Equipment.countDocuments();

      console.log(
        `Total equipment   : ${totalEquipment}`
      );
    }

    console.log(
      `Demo users        : ${DEMO_USERS.length}`
    );

    console.log("");
    console.log(
      "Demo accounts:"
    );

    console.log(
      "Admin   : admin@equipshare.test"
    );

    console.log(
      "Manager : manager@equipshare.test"
    );

    console.log(
      "Password: password123"
    );

    console.log("");
  } catch (error) {
    console.error("");
    console.error(
      "========================================"
    );
    console.error(
      "       EquipShare seeding failed"
    );
    console.error(
      "========================================"
    );

    console.error(
      error?.message || error
    );

    console.error("");
    process.exitCode = 1;
  } finally {
    /*
    |--------------------------------------------------------------------------
    | Always close MongoDB connection
    |--------------------------------------------------------------------------
    */

    if (connected) {
      try {
        await mongoose.disconnect();
        console.log(
          "MongoDB connection closed."
        );
      } catch (disconnectError) {
        console.error(
          "Failed to close MongoDB connection:",
          disconnectError.message
        );

        process.exitCode = 1;
      }
    }
  }
}

/*
|--------------------------------------------------------------------------
| Run
|--------------------------------------------------------------------------
*/

seed();