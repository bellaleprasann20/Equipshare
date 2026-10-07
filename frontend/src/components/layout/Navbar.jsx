import React, { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../context/CartContext";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M3 4h2l2.4 11h11l2-8H6.5" />
      <circle cx="9" cy="19.5" r="1.5" />
      <circle cx="17" cy="19.5" r="1.5" />
    </svg>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count, clear } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  const params = new URLSearchParams(location.search);
  const onCatalog = location.pathname === "/equipment";
  const activeMode = onCatalog ? params.get("mode") || "rent" : null;

  // Strictly Project Manager Links
  const managerLinks = [
    { key: "dashboard", label: "Dashboard", to: "/dashboard" },
    { key: "catalog", label: "Equipment Catalog", to: "/equipment" },
    { key: "request", label: "New Requirement", to: "/allocation" },
    { key: "locations", label: "Site Locations", to: "/locations" },
    { key: "analytics", label: "Analytics", to: "/analytics" },
    { key: "profile", label: "Profile", to: "/profile" },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    const mode = activeMode || "rent";
    navigate(q ? `/equipment?mode=${mode}&q=${encodeURIComponent(q)}` : `/equipment?mode=${mode}`);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    setMenuOpen(false);
    clear();
    logout();
    navigate("/login");
  };

  const searchForm = (widthClass) => (
    <form onSubmit={handleSearch} className={`flex items-center border border-[#2a2a2d] bg-[#1c1c1f] ${widthClass}`}>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search equipment or site"
        className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none"
      />
      <button type="submit" aria-label="Search" className="px-3 text-gray-400 hover:text-[#8b5cf6] transition-colors">
        <SearchIcon />
      </button>
    </form>
  );

  return (
    <header className="sticky top-0 z-30">
      {/* Main bar */}
      <div className="flex items-center justify-between gap-6 border-b border-[#2a2a2d] bg-[#161618] px-4 py-3 sm:px-8">
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-[#8b5cf6] font-display text-sm font-bold text-white">
              E
            </span>
            <span className="font-display text-xl font-bold tracking-tight text-white">EquipShare</span>
          </Link>

          <nav className="hidden items-center gap-6 xl:flex">
            {managerLinks.map((l) => (
              <NavLink
                key={l.key}
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

        <div className="hidden items-center gap-4 xl:flex">
          {searchForm("w-64 rounded")}
          
          <Link to="/cart" aria-label={`Draft, ${count} items`} className="relative p-1 text-gray-300 hover:text-[#8b5cf6] transition-colors">
            <CartIcon />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 rounded bg-[#8b5cf6] px-1 font-mono text-[10px] font-bold leading-4 text-white">
                {count}
              </span>
            )}
          </Link>

          {user && <span className="text-sm font-medium text-gray-300">{user.name}</span>}
          
          <button
            onClick={handleLogout}
            className="border border-[#2a2a2d] bg-[#1c1c1f] px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-300 hover:border-gray-500 hover:text-white rounded transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="flex items-center gap-4 xl:hidden">
          <Link to="/cart" className="relative p-1 text-gray-300 hover:text-[#8b5cf6]">
            <CartIcon />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 rounded bg-[#8b5cf6] px-1 font-mono text-[10px] font-bold leading-4 text-white">
                {count}
              </span>
            )}
          </Link>
          <button
            className="p-2 text-gray-300 hover:text-white"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Secondary project manager action strip */}
      <div className="hidden items-center justify-between border-b border-[#2a2a2d] bg-[#1c1c1f] px-8 py-2.5 text-sm md:flex">
        <span className="font-medium text-gray-400">Project Manager Workspace</span>
        
        <div className="flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-gray-400">
          <Link to="/allocation" className="hover:text-[#8b5cf6] transition-colors">New Requirement</Link>
          <Link to="/allocation/history" className="hover:text-[#8b5cf6] transition-colors">Allocation History</Link>
          <Link to="/orders" className="hover:text-[#8b5cf6] transition-colors">My Active Orders</Link>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="absolute left-0 right-0 top-full flex flex-col border-b border-[#2a2a2d] bg-[#1c1c1f] p-4 xl:hidden shadow-lg">
          {searchForm("w-full rounded mb-3")}
          <div className="flex flex-col gap-1">
            {managerLinks.map((l) => (
              <NavLink
                key={l.key}
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

            <div className="my-2 flex flex-col gap-1 border-t border-[#2a2a2d] pt-2">
              <Link to="/allocation" onClick={() => setMenuOpen(false)} className="px-4 py-3 text-sm font-bold uppercase tracking-wider text-[#8b5cf6] hover:bg-[#2a2a2d]">
                New Requirement
              </Link>
              <Link to="/allocation/history" onClick={() => setMenuOpen(false)} className="px-4 py-3 text-sm font-bold uppercase tracking-wider text-gray-400 hover:bg-[#2a2a2d] hover:text-white">
                Allocation History
              </Link>
              <Link to="/orders" onClick={() => setMenuOpen(false)} className="px-4 py-3 text-sm font-bold uppercase tracking-wider text-gray-400 hover:bg-[#2a2a2d] hover:text-white">
                My Active Orders
              </Link>
            </div>

            <button 
              onClick={handleLogout} 
              className="mt-2 px-4 py-3 text-left text-sm font-bold uppercase tracking-wider text-red-400 hover:bg-[#2a2a2d] rounded"
            >
              Logout
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}