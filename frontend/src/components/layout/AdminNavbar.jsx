import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const ADMIN_LINKS = [
  { to: "/admin/dashboard", label: "Fleet Overview" },
  { to: "/admin/equipment", label: "Equipment Inventory" },
  { to: "/admin/approvals", label: "Approval Queue" },
  { to: "/admin/reports", label: "Analytics" },
];

export default function AdminNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[#2a2a2d] bg-[#161618]">
      <div className="flex items-center justify-between px-4 py-3 sm:px-8">
        <div className="flex items-center gap-8">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-[#8b5cf6] font-display text-sm font-bold text-white">
              E
            </span>
            <span className="font-display text-xl font-bold tracking-tight text-white">EquipShare</span>
            <span className="rounded bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-purple-400 uppercase tracking-wider ml-1">
              Admin
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {ADMIN_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  [
                    "border-b-2 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors",
                    isActive 
                      ? "border-[#8b5cf6] text-white" 
                      : "border-transparent text-gray-400 hover:text-white hover:border-gray-500",
                  ].join(" ")
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          {user && <span className="text-sm font-medium text-gray-300">{user.name}</span>}
          <button
            onClick={handleLogout}
            className="border border-[#2a2a2d] bg-[#1c1c1f] px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-300 hover:border-gray-500 hover:text-white rounded transition-colors"
          >
            Logout
          </button>
        </div>

        <button
          className="p-2 text-gray-300 hover:text-white md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <nav className="flex flex-col border-t border-[#2a2a2d] bg-[#1c1c1f] p-2 md:hidden shadow-lg absolute w-full">
          {ADMIN_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                [
                  "border-l-2 px-4 py-3 text-sm font-bold uppercase tracking-wider transition-colors",
                  isActive 
                    ? "border-[#8b5cf6] bg-[#8b5cf6]/10 text-white" 
                    : "border-transparent text-gray-400 hover:bg-[#2a2a2d] hover:text-white",
                ].join(" ")
              }
            >
              {l.label}
            </NavLink>
          ))}
          <button 
            onClick={handleLogout} 
            className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider text-red-400 hover:bg-[#2a2a2d]"
          >
            Logout
          </button>
        </nav>
      )}
    </header>
  );
}