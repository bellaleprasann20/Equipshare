import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

try {
  await mongoose.connect(process.env.MONGO_URI);

  const indexes = await mongoose.connection
    .collection("allocationrequests")
    .indexes();

  console.log(JSON.stringify(indexes, null, 2));
} catch (error) {
  console.error(error);
} finally {
  await mongoose.disconnect();
}
