import api from "./api";

export async function createOrder({ items, contactName, phone, address, paymentMethod }) {
  const { data } = await api.post("/orders", {
    items: items.map((i) => ({ equipmentId: i.equipmentId, mode: i.mode, days: i.days })),
    contactName,
    phone,
    address,
    paymentMethod,
  });
  return data.order;
}

export async function fetchMyOrders() {
  const { data } = await api.get("/orders");
  return data.orders;
}

export async function cancelOrder(orderId) {
  const { data } = await api.post(`/orders/${orderId}/cancel`);
  return data.order;
}

// Admin-only
export async function fetchPendingOrders() {
  const { data } = await api.get("/orders/admin", { params: { status: "pending" } });
  return data.orders;
}

export async function approveOrderRequest(orderId) {
  const { data } = await api.post(`/orders/${orderId}/approve`);
  return data.order;
}

export async function rejectOrderRequest(orderId) {
  const { data } = await api.post(`/orders/${orderId}/reject`);
  return data.order;
}