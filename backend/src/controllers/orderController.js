import mongoose from "mongoose";
import Order from "../models/Order.js";
import Equipment from "../models/Equipment.js";

const PAYMENT_METHODS = [
  "cod",
  "bank",
  "upi",
];

/* =========================================================
   HELPERS
   ========================================================= */

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function rentPerDay(equipment) {
  if (
    Number.isFinite(
      Number(equipment.rentPerDay)
    )
  ) {
    return Math.round(
      Number(equipment.rentPerDay)
    );
  }

  return Math.round(
    (Number(
      equipment.operatingCostPerDay
    ) || 0) * 1.4
  );
}

function buyPrice(equipment) {
  if (
    Number.isFinite(
      Number(equipment.salePrice)
    )
  ) {
    return Math.round(
      Number(equipment.salePrice)
    );
  }

  const ageYears = equipment.purchaseDate
    ? Math.max(
        0,
        (Date.now() -
          new Date(
            equipment.purchaseDate
          ).getTime()) /
          (1000 *
            60 *
            60 *
            24 *
            365.25)
      )
    : 5;

  const valueFactor = Math.max(
    0.25,
    1 - ageYears * 0.08
  );

  return (
    Math.round(
      (((Number(
        equipment.operatingCostPerDay
      ) || 0) *
        500 *
        valueFactor) /
        1000)
    ) * 1000
  );
}

/* =========================================================
   POST /api/orders
   ========================================================= */

export async function createOrder(
  req,
  res
) {
  try {
    const {
      items,
      contactName,
      phone,
      address,
      paymentMethod,
    } = req.body;

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        message: "Your cart is empty.",
      });
    }

    if (items.length > 20) {
      return res.status(400).json({
        message:
          "An order cannot contain more than 20 machines.",
      });
    }

    if (
      !contactName?.trim() ||
      !phone?.trim() ||
      !address?.trim()
    ) {
      return res.status(400).json({
        message:
          "Contact name, phone and address are required.",
      });
    }

    const normalizedPhone =
      phone.replace(/\D/g, "");

    if (
      normalizedPhone.length < 10 ||
      normalizedPhone.length > 15
    ) {
      return res.status(400).json({
        message:
          "Enter a valid contact phone number.",
      });
    }

    if (contactName.trim().length > 100) {
      return res.status(400).json({
        message:
          "Contact name is too long.",
      });
    }

    if (address.trim().length > 500) {
      return res.status(400).json({
        message: "Address is too long.",
      });
    }

    const ids = items.map((item) =>
      String(item?.equipmentId || "")
    );

    if (
      ids.some(
        (id) => !isValidObjectId(id)
      )
    ) {
      return res.status(400).json({
        message:
          "One or more equipment IDs are invalid.",
      });
    }

    if (
      new Set(ids).size !== ids.length
    ) {
      return res.status(400).json({
        message:
          "Each machine can only appear once in an order.",
      });
    }

    const equipmentDocs =
      await Equipment.find({
        _id: { $in: ids },
      }).lean();

    const byId = Object.fromEntries(
      equipmentDocs.map((equipment) => [
        equipment._id.toString(),
        equipment,
      ])
    );

    const lines = [];

    for (const item of items) {
      const equipment =
        byId[String(item.equipmentId)];

      if (!equipment) {
        return res.status(400).json({
          message:
            "A machine in your cart no longer exists.",
        });
      }

      if (
        equipment.availability !==
        "available"
      ) {
        return res.status(409).json({
          message: `${equipment.name} is no longer available.`,
        });
      }

      const mode =
        item.mode === "buy"
          ? "buy"
          : "rent";

      const days =
        mode === "rent"
          ? Math.max(
              1,
              Math.min(
                365,
                Number(item.days) || 1
              )
            )
          : 0;

      const unitPrice =
        mode === "buy"
          ? buyPrice(equipment)
          : rentPerDay(equipment);

      const lineTotal =
        mode === "buy"
          ? unitPrice
          : unitPrice * days;

      lines.push({
        equipmentId: equipment._id,
        name: equipment.name,
        type: equipment.type,
        mode,
        days,
        unitPrice,
        lineTotal,
      });
    }

    const total = lines.reduce(
      (sum, line) =>
        sum + line.lineTotal,
      0
    );

    const order =
      await Order.create({
        user: req.user.id,
        items: lines,
        total,
        contactName:
          contactName.trim(),
        phone: normalizedPhone,
        address: address.trim(),
        paymentMethod:
          PAYMENT_METHODS.includes(
            paymentMethod
          )
            ? paymentMethod
            : "cod",
        status: "pending",
      });

    return res.status(201).json({
      order,
    });
  } catch (err) {
    console.error(
      "createOrder:",
      err
    );

    return res.status(500).json({
      message:
        "Failed to submit your order.",
    });
  }
}

/* =========================================================
   GET /api/orders
   Current user's orders
   ========================================================= */

export async function listMyOrders(
  req,
  res
) {
  try {
    const orders =
      await Order.find({
        user: req.user.id,
      })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

    return res.json({
      orders,
    });
  } catch (err) {
    console.error(
      "listMyOrders:",
      err
    );

    return res.status(500).json({
      message:
        "Failed to load your orders.",
    });
  }
}

/* =========================================================
   GET /api/orders/admin
   Admin only
   ========================================================= */

export async function listAllOrders(
  req,
  res
) {
  try {
    const allowedStatuses = [
      "pending",
      "approved",
      "rejected",
      "cancelled",
    ];

    const requestedStatus =
      String(
        req.query.status || "pending"
      ).toLowerCase();

    const status =
      allowedStatuses.includes(
        requestedStatus
      )
        ? requestedStatus
        : "pending";

    const orders =
      await Order.find({ status })
        .populate(
          "user",
          "name companyName email"
        )
        .sort({ createdAt: 1 })
        .lean();

    return res.json({
      orders,
    });
  } catch (err) {
    console.error(
      "listAllOrders:",
      err
    );

    return res.status(500).json({
      message:
        "Failed to load orders.",
    });
  }
}

/* =========================================================
   POST /api/orders/:id/approve
   Admin only
   ========================================================= */

export async function approveOrder(
  req,
  res
) {
  const reservedIds = [];

  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid order ID.",
      });
    }

    const order =
      await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    if (order.status !== "pending") {
      return res.status(400).json({
        message:
          "This order has already been reviewed.",
      });
    }

    /*
     * Reserve each machine atomically.
     */
    for (const item of order.items) {
      const updated =
        await Equipment.findOneAndUpdate(
          {
            _id: item.equipmentId,
            availability: "available",
          },
          {
            $set: {
              availability:
                item.mode === "buy"
                  ? "sold"
                  : "in_use",
            },
          },
          {
            new: true,
          }
        );

      if (!updated) {
        /*
         * Release machines already reserved
         * during this approval attempt.
         */
        if (reservedIds.length) {
          await Equipment.updateMany(
            {
              _id: {
                $in: reservedIds,
              },
            },
            {
              $set: {
                availability:
                  "available",
              },
            }
          );
        }

        return res.status(409).json({
          message: `${item.name} is no longer available. The order was not approved.`,
        });
      }

      reservedIds.push(
        item.equipmentId
      );
    }

    order.status = "approved";

    await order.save();

    return res.json({
      message:
        "Order approved successfully.",
      order,
    });
  } catch (err) {
    console.error(
      "approveOrder:",
      err
    );

    /*
     * Roll back any reservations made
     * before the error occurred.
     */
    if (reservedIds.length) {
      try {
        await Equipment.updateMany(
          {
            _id: {
              $in: reservedIds,
            },
          },
          {
            $set: {
              availability:
                "available",
            },
          }
        );
      } catch (rollbackError) {
        console.error(
          "Order reservation rollback failed:",
          rollbackError
        );
      }
    }

    return res.status(500).json({
      message:
        "Failed to approve order.",
    });
  }
}

/* =========================================================
   POST /api/orders/:id/reject
   Admin only
   ========================================================= */

export async function rejectOrder(
  req,
  res
) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid order ID.",
      });
    }

    const order =
      await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    if (order.status !== "pending") {
      return res.status(400).json({
        message:
          "This order has already been reviewed.",
      });
    }

    order.status = "rejected";

    await order.save();

    return res.json({
      message: "Order rejected.",
      order,
    });
  } catch (err) {
    console.error(
      "rejectOrder:",
      err
    );

    return res.status(500).json({
      message:
        "Failed to reject order.",
    });
  }
}

/* =========================================================
   POST /api/orders/:id/cancel
   Order owner only
   ========================================================= */

export async function cancelOrder(
  req,
  res
) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid order ID.",
      });
    }

    const order =
      await Order.findOne({
        _id: id,
        user: req.user.id,
      });

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    if (
      !["pending", "approved"].includes(
        order.status
      )
    ) {
      return res.status(400).json({
        message:
          "Only pending or approved orders can be cancelled.",
      });
    }

    /*
     * Only release equipment that is currently
     * reserved. This avoids changing machines
     * that have already moved to another state.
     */
    if (order.status === "approved") {
      const ids = order.items.map(
        (item) => item.equipmentId
      );

      await Equipment.updateMany(
        {
          _id: { $in: ids },
          availability: {
            $in: ["in_use", "sold"],
          },
        },
        {
          $set: {
            availability:
              "available",
          },
        }
      );
    }

    order.status = "cancelled";

    await order.save();

    return res.json({
      message:
        "Order cancelled successfully.",
      order,
    });
  } catch (err) {
    console.error(
      "cancelOrder:",
      err
    );

    return res.status(500).json({
      message:
        "Failed to cancel order.",
    });
  }
}