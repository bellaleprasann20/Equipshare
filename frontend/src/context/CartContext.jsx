import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { lineTotal } from "../utils/pricing";

const CartContext = createContext(null);
const STORAGE_KEY = "equipshare_cart";

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((i) => i && i.equipmentId) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage unavailable, cart just won't persist
    }
  }, [items]);

  const addItem = useCallback((equipment, mode = "rent", days = 7) => {
    const entry = {
      equipmentId: equipment._id,
      name: equipment.name,
      type: equipment.type,
      location: equipment.location,
      imageUrl: equipment.imageUrl || "",
      rentPerDay: equipment.rentPerDay || 0,
      salePrice: equipment.salePrice || 0,
      operatingCostPerDay: equipment.operatingCostPerDay || 0,
      purchaseDate: equipment.purchaseDate || null,
      mode,
      days,
    };
    setItems((prev) => [...prev.filter((i) => i.equipmentId !== equipment._id), entry]);
  }, []);

  const removeItem = useCallback((equipmentId) => {
    setItems((prev) => prev.filter((i) => i.equipmentId !== equipmentId));
  }, []);

  const updateItem = useCallback((equipmentId, changes) => {
    setItems((prev) => prev.map((i) => (i.equipmentId === equipmentId ? { ...i, ...changes } : i)));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const total = useMemo(() => items.reduce((sum, i) => sum + lineTotal(i), 0), [items]);

  const value = useMemo(
    () => ({ items, count: items.length, total, addItem, removeItem, updateItem, clear }),
    [items, total, addItem, removeItem, updateItem, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside <CartProvider>. Wrap your app in main.jsx.");
  }
  return context;
}