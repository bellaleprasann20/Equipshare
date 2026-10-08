import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const NAV_ITEMS = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    end: true,
  },
  {
    to: "/admin/equipment",
    label: "Equipment",
    end: true,
  },
  {
    to: "/admin/approvals",
    label: "Approvals",
    end: true,
  },
  {
    to: "/admin/reports",
    label: "Reports",
    end: true,
  },
];

function navClass({ isActive }) {
  return [
    "relative px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "text-white"
      : "text-gray-400 hover:text-white",
  ].join(" ");
}

export default function AdminNavbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setMobileOpen(false);
      navigate("/login", { replace: true });
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#2a2a2d] bg-[#161618]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
        {/* Brand */}
        <Link
          to="/admin/dashboard"
          className="flex items-center gap-2"
          onClick={() => setMobileOpen(false)}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#8b5cf6] font-display text-sm font-bold text-white">
            E
          </span>

          <div className="hidden sm:block">
            <p className="font-display text-lg font-bold tracking-tight text-white">
              EquipShare
            </p>

            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-gray-500">
              Fleet Administration
            </p>
          </div>
        </Link>

        {/* Desktop navigation */}
        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Admin navigation"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={navClass}
            >
              {({ isActive }) => (
                <>
                  {item.label}

                  {isActive && (
                    <span className="absolute inset-x-3 -bottom-[21px] h-0.5 bg-[#8b5cf6]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Desktop account */}
        <div className="hidden items-center gap-3 md:flex">
          <NavLink
            to="/admin/profile"
            className={({ isActive }) =>
              [
                "rounded-md border px-3 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "border-[#8b5cf6]/40 bg-[#8b5cf6]/10 text-white"
                  : "border-[#2a2a2d] text-gray-400 hover:bg-[#1c1c1f] hover:text-white",
              ].join(" ")
            }
          >
            {user?.name || "Admin"}
          </NavLink>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md border border-[#2a2a2d] px-3 py-2 text-xs font-medium text-gray-400 transition-colors hover:border-red-500/30 hover:bg-red-500/5 hover:text-red-300"
          >
            Logout
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((current) => !current)}
          className="rounded-md border border-[#2a2a2d] px-3 py-2 text-sm text-gray-300 md:hidden"
        >
          {mobileOpen ? "Close" : "Menu"}
        </button>
      </div>

      {/* Mobile navigation */}
      {mobileOpen && (
        <div className="border-t border-[#2a2a2d] bg-[#1c1c1f] md:hidden">
          <nav
            className="mx-auto flex max-w-7xl flex-col px-4 py-3 sm:px-8"
            aria-label="Admin mobile navigation"
          >
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  [
                    "border-l-2 px-4 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "border-[#8b5cf6] bg-[#8b5cf6]/10 text-white"
                      : "border-transparent text-gray-400 hover:bg-white/[0.03] hover:text-white",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}

            <div className="mt-2 border-t border-[#2a2a2d] pt-2">
              <NavLink
                to="/admin/profile"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  [
                    "border-l-2 px-4 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "border-[#8b5cf6] bg-[#8b5cf6]/10 text-white"
                      : "border-transparent text-gray-400 hover:bg-white/[0.03] hover:text-white",
                  ].join(" ")
                }
              >
                Profile
              </NavLink>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full border-l-2 border-transparent px-4 py-3 text-left text-sm font-medium text-gray-400 transition-colors hover:bg-red-500/5 hover:text-red-300"
              >
                Logout
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}