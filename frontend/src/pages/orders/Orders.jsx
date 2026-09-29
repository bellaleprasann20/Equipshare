import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyOrders, cancelOrder } from "../../services/orderService";
import { formatINR } from "../../utils/pricing";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import Button from "../../components/common/Button";

const STATUS_LABEL = {
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  requested: "Requested",
  approved: "Approved",
  rejected: "Rejected",
};

const PAYMENT_LABEL = {
  cod: "Pay on delivery or on site",
  bank: "Bank transfer",
  upi: "UPI",
};

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  const load = () => {
    fetchMyOrders()
      .then(setOrders)
      .catch((err) => setError(err?.response?.data?.message || "Failed to load your orders."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCancel = async (orderId) => {
    if (!window.confirm("Cancel this order? The machines in it will be released.")) return;
    setError("");
    setCancellingId(orderId);
    try {
      await cancelOrder(orderId);
      load();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not cancel the order.");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) return <Loader label="Loading your orders..." />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold text-ink">My orders</h1>
        <Button variant="outline" onClick={() => navigate("/equipment?mode=rent")}>
          Browse equipment
        </Button>
      </div>

      {error && <ErrorMessage message={error} />}

      {orders.length === 0 ? (
        <div className="panel p-8 text-center">
          <p className="font-display text-lg font-semibold text-ink">No orders yet</p>
          <p className="mt-2 text-sm text-steel">Rent or buy a machine and it will show up here.</p>
        </div>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
              <div>
                <span className="font-mono text-ink">#{order._id.slice(-6).toUpperCase()}</span>
                <span className="ml-3 font-mono text-xs text-steel">
                  {new Date(order.createdAt).toLocaleDateString("en-IN")}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={[
                    "text-sm font-medium",
                    order.status === "confirmed" ? "text-green-700" : "text-steel",
                  ].join(" ")}
                >
                  {STATUS_LABEL[order.status] || order.status}
                </span>
                <span className="font-mono text-lg font-semibold text-ink">{formatINR(order.total)}</span>
              </div>
            </div>

            <ul className="divide-y divide-line">
              {order.items.map((item) => (
                <li key={item.equipmentId} className="flex flex-wrap justify-between gap-3 py-3 text-sm">
                  <div>
                    <p className="font-medium text-ink">{item.name}</p>
                    <p className="text-xs text-steel">
                      {item.mode === "rent"
                        ? `Rent, ${item.days} days at ${formatINR(item.unitPrice)} per day`
                        : "Purchase"}
                    </p>
                  </div>
                  <span className="font-mono text-ink">{formatINR(item.lineTotal)}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3 text-xs text-steel">
              <span>
                {order.contactName}, {order.phone}. Deliver to {order.address}. {PAYMENT_LABEL[order.paymentMethod]}.
              </span>
              {order.status === "confirmed" && (
                <Button
                  size="sm"
                  variant="outline"
                  loading={cancellingId === order._id}
                  onClick={() => handleCancel(order._id)}
                >
                  Cancel order
                </Button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}