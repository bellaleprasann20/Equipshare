import Order from "../models/Order.js";
import Equipment from "../models/Equipment.js";

const PAYMENT_METHODS = ["cod", "bank", "upi"];

function rentPerDay(eq) {
  if (eq.rentPerDay) return Math.round(eq.rentPerDay);
  return Math.round((eq.operatingCostPerDay || 0) * 1.4);
}

function buyPrice(eq) {
  if (eq.salePrice) return Math.round(eq.salePrice);
  const ageYears = eq.purchaseDate
    ? (Date.now() - new Date(eq.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
    : 5;
  const valueFactor = Math.max(0.25, 1 - ageYears * 0.08);
  return Math.round(((eq.operatingCostPerDay || 0) * 500 * valueFactor) / 1000) * 1000;
}

/**
 * POST /api/orders — any logged-in user. Creates the order as
 * "pending" and does NOT touch equipment availability — nothing
 * is reserved until an admin approves it.
 */
export async function createOrder(req, res) {
  try {
    const { items, contactName, phone, address, paymentMethod } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty." });
    }
    if (!contactName?.trim() || !phone?.trim() || !address?.trim()) {
      return res.status(400).json({ message: "Contact name, phone and address are required." });
    }

    const ids = items.map((i) => String(i.equipmentId));
    if (new Set(ids).size !== ids.length) {
      return res.status(400).json({ message: "Each machine can only appear once in an order." });
    }

    const docs = await Equipment.find({ _id: { $in: ids } }).lean();
    const byId = Object.fromEntries(docs.map((d) => [d._id.toString(), d]));

    const lines = [];
    for (const item of items) {
      const eq = byId[String(item.equipmentId)];
      if (!eq) return res.status(400).json({ message: "A machine in your cart no longer exists." });
      if (eq.availability !== "available") {
        return res.status(409).json({
          message: `${eq.name} is no longer available. Remove it from your cart and try again.`,
        });
      }

      const mode = item.mode === "buy" ? "buy" : "rent";
      const days = mode === "rent" ? Math.max(1, Math.min(365, Number(item.days) || 1)) : 0;
      const unitPrice = mode === "buy" ? buyPrice(eq) : rentPerDay(eq);

      lines.push({
        equipmentId: eq._id,
        name: eq.name,
        type: eq.type,
        mode,
        days,
        unitPrice,
        lineTotal: mode === "buy" ? unitPrice : unitPrice * days,
      });
    }

    const total = lines.reduce((sum, l) => sum + l.lineTotal, 0);
    const order = await Order.create({
      user: req.user.id,
      items: lines,
      total,
      contactName: contactName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      paymentMethod: PAYMENT_METHODS.includes(paymentMethod) ? paymentMethod : "cod",
    });

    res.status(201).json({ order });
  } catch (err) {
    res.status(500).json({ message: "Failed to submit your order.", error: err.message });
  }
}

/** GET /api/orders — the logged-in user's own orders. */
export async function listMyOrders(req, res) {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(50).lean();
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: "Failed to load your orders.", error: err.message });
  }
}

/** GET /api/orders/admin — admin only. Every pending order to review. */
export async function listAllOrders(req, res) {
  try {
    const status = req.query.status || "pending";
    const orders = await Order.find({ status })
      .populate("user", "name companyName")
      .sort({ createdAt: 1 })
      .lean();
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: "Failed to load orders.", error: err.message });
  }
}

/**
 * POST /api/orders/:id/approve — admin only. Reserves every
 * machine in the order (in_use for rent, sold for buy).
 */
export async function approveOrder(req, res) {
  const reserved = [];
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found." });
    if (order.status !== "pending") {
      return res.status(400).json({ message: "This order has already been reviewed." });
    }

    for (const item of order.items) {
      const updated = await Equipment.findOneAndUpdate(
        { _id: item.equipmentId, availability: "available" },
        { availability: item.mode === "buy" ? "sold" : "in_use" }
      );
      if (!updated) {
        await Equipment.updateMany({ _id: { $in: reserved } }, { availability: "available" });
        return res.status(409).json({
          message: `${item.name} is no longer available. Reject this order and ask the requester to try again.`,
        });
      }
      reserved.push(item.equipmentId);
    }

    order.status = "approved";
    await order.save();
    res.json({ order });
  } catch (err) {
    await Equipment.updateMany({ _id: { $in: reserved } }, { availability: "available" });
    res.status(500).json({ message: "Failed to approve order.", error: err.message });
  }
}

/** POST /api/orders/:id/reject — admin only. Nothing to release, since approval never reserved anything. */
export async function rejectOrder(req, res) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found." });
    if (order.status !== "pending") {
      return res.status(400).json({ message: "This order has already been reviewed." });
    }

    order.status = "rejected";
    await order.save();
    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: "Failed to reject order.", error: err.message });
  }
}

/**
 * POST /api/orders/:id/cancel — the order's own user. Releases
 * equipment only if it was actually reserved (status "approved").
 */
export async function cancelOrder(req, res) {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
    if (!order) return res.status(404).json({ message: "Order not found." });
    if (!["pending", "approved"].includes(order.status)) {
      return res.status(400).json({ message: "Only pending or approved orders can be cancelled." });
    }

    if (order.status === "approved") {
      const ids = order.items.map((i) => i.equipmentId);
      await Equipment.updateMany({ _id: { $in: ids } }, { availability: "available" });
    }

    order.status = "cancelled";
    await order.save();
    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: "Failed to cancel the order.", error: err.message });
  }
}