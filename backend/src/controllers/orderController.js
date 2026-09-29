import Order from "../models/Order.js";
import Equipment from "../models/Equipment.js";

const PAYMENT_METHODS = ["cod", "bank", "upi"];

// Same pricing rules as frontend/src/utils/pricing.js.
// The server recalculates prices so a client can never set its own.
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

async function release(ids) {
  if (ids.length > 0) {
    await Equipment.updateMany({ _id: { $in: ids } }, { availability: "available" });
  }
}

/**
 * POST /api/orders
 * Body: { items: [{ equipmentId, mode, days }], contactName, phone, address, paymentMethod }
 * Rented machines become "in_use", purchased machines become "sold".
 */
export async function createOrder(req, res) {
  const reserved = [];
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
      if (!eq) {
        return res.status(400).json({ message: "A machine in your cart no longer exists." });
      }
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

    // Reserve each machine. The availability condition makes sure two
    // people can never take the same machine at the same time.
    for (const line of lines) {
      const updated = await Equipment.findOneAndUpdate(
        { _id: line.equipmentId, availability: "available" },
        { availability: line.mode === "buy" ? "sold" : "in_use" }
      );
      if (!updated) {
        await release(reserved);
        return res.status(409).json({
          message: `${line.name} was just taken. Remove it from your cart and try again.`,
        });
      }
      reserved.push(line.equipmentId);
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
    await release(reserved);
    res.status(500).json({ message: "Failed to place your order.", error: err.message });
  }
}

/**
 * GET /api/orders
 */
export async function listMyOrders(req, res) {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(50).lean();
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: "Failed to load your orders.", error: err.message });
  }
}

/**
 * POST /api/orders/:id/cancel
 * Cancels a confirmed order and releases every machine in it.
 */
export async function cancelOrder(req, res) {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
    if (!order) return res.status(404).json({ message: "Order not found." });
    if (order.status !== "confirmed") {
      return res.status(400).json({ message: "Only confirmed orders can be cancelled." });
    }

    await release(order.items.map((i) => i.equipmentId));
    order.status = "cancelled";
    await order.save();

    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: "Failed to cancel the order.", error: err.message });
  }
}