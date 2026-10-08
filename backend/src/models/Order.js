import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    equipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    type: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    mode: {
      type: String,
      enum: ["rent", "buy"],
      required: true,
    },

    days: {
      type: Number,
      default: 0,
      min: 0,
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    lineTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) =>
          Array.isArray(items) &&
          items.length > 0 &&
          items.length <= 50,
        message: "Order must contain between 1 and 50 items.",
      },
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },

    contactName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },

    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    paymentMethod: {
      type: String,
      enum: [
        "internal_budget",
        "cod",
        "bank",
        "upi",
      ],
      default: "internal_budget",
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({
  user: 1,
  createdAt: -1,
});

orderSchema.index({
  status: 1,
  createdAt: -1,
});

export default mongoose.model("Order", orderSchema);