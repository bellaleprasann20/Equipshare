import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

// Shared with Navbar so the mobile menu always matches the sidebar
export const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", roles: ["admin", "manager"] },
  { to: "/equipment", label: "Equipment", roles: ["admin", "manager"] },
  { to: "/allocation", label: "New requirement", roles: ["admin", "manager"], end: true },
  { to: "/allocation/history", label: "Allocation history", roles: ["admin", "manager"] },
  { to: "/analytics", label: "Analytics", roles: ["admin", "manager"] },
  { to: "/admin", label: "Fleet overview", roles: ["admin"] },
  { to: "/reports", label: "Reports", roles: ["admin"] },
];

export default function Sidebar() {
  const { user } = useAuth();
  const role = user?.role || "manager";
  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <aside className="hidden w-56 shrink-0 bg-ink md:block">
      <nav className="flex flex-col py-4">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              [
                "border-l-2 px-5 py-2.5 text-sm",
                isActive
                  ? "border-signal bg-white/5 font-medium text-white"
                  : "border-transparent text-white/55 hover:text-white/90",
              ].join(" ")
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}