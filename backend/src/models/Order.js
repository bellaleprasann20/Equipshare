import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    equipmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Equipment", required: true },
    name: String,
    type: String,
    mode: { type: String, enum: ["rent", "buy"], required: true },
    days: { type: Number, default: 0 },
    unitPrice: Number,
    lineTotal: Number,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    total: Number,
    // pending: awaiting admin review, nothing reserved yet.
    // approved: admin confirmed, equipment reserved.
    // rejected / cancelled: no reservation, or released.
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },
    contactName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    paymentMethod: { type: String, enum: ["cod", "bank", "upi"], default: "cod" },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);