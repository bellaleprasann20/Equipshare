import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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

  const isAdmin = user?.role === "admin";
  const roleLabel = isAdmin ? "Fleet admin workspace" : "Project manager workspace";

  const params = new URLSearchParams(location.search);
  const onCatalog = location.pathname === "/equipment";
  const activeMode = onCatalog ? params.get("mode") || "rent" : null;

  // Primary navigation links split by role
  const adminLinks = [
    { key: "dashboard", label: "Fleet Overview", to: "/admin" },
    { key: "catalog", label: "Equipment Directory", to: "/equipment" },
    { key: "approvals", label: "Approval Queue", to: "/admin/approvals" },
    { key: "analytics", label: "Analytics", to: "/analytics" },
  ];

  const managerLinks = [
    { key: "dashboard", label: "Dashboard", to: "/dashboard" },
    { key: "catalog", label: "Equipment Catalog", to: "/equipment" },
    { key: "request", label: "New Requirement", to: "/allocation" },
    { key: "locations", label: "Site Locations", to: "/locations" },
    { key: "analytics", label: "Analytics", to: "/analytics" },
  ];

  const links = isAdmin ? adminLinks : managerLinks;

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
    <form onSubmit={handleSearch} className={`flex items-center border border-line bg-paper ${widthClass}`}>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search equipment or site"
        className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-ink placeholder:text-steel-light focus:outline-none"
      />
      <button type="submit" aria-label="Search" className="px-3 text-steel hover:text-signal">
        <SearchIcon />
      </button>
    </form>
  );

  const cartLink = !isAdmin ? (
    <Link to="/cart" aria-label={`Draft, ${count} items`} className="relative p-1 text-ink hover:text-signal">
      <CartIcon />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 bg-signal px-1 font-mono text-[10px] font-bold leading-4 text-white rounded">
          {count}
        </span>
      )}
    </Link>
  ) : null;

  return (
    <header className="sticky top-0 z-30">
      {/* Main bar */}
      <div className="flex items-center justify-between gap-6 border-b border-line bg-surface px-4 py-3 sm:px-8">
        <div className="flex items-center gap-8">
          <Link to={isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center bg-signal font-display text-sm font-bold text-white rounded-sm">
              E
            </span>
            <span className="font-display text-xl font-bold tracking-tight text-ink">EquipShare</span>
          </Link>

          <nav className="hidden items-center gap-6 xl:flex">
            {links.map((l) => (
              <Link
                key={l.key}
                to={l.to}
                className="border-b-2 border-transparent py-1 text-xs font-semibold uppercase tracking-widest text-steel hover:text-ink hover:border-signal transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-4 xl:flex">
          {searchForm("w-64 rounded")}
          {cartLink}
          {user && <span className="text-sm font-medium text-steel">{user.name}</span>}
          <button
            onClick={handleLogout}
            className="border border-line px-4 py-2 text-xs font-semibold uppercase tracking-widest text-ink hover:border-signal rounded transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="flex items-center gap-3 xl:hidden">
          {cartLink}
          <button
            className="p-2 text-ink"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Secondary role-based strip */}
      <div className="hidden items-center justify-between bg-paper px-8 py-2.5 text-sm md:flex border-b border-line">
        <span className="text-steel font-medium">{roleLabel}</span>
        
        <div className="flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-steel">
          {isAdmin ? (
            <>
              <Link to="/equipment/manage" className="hover:text-signal transition-colors">Table View</Link>
              <Link to="/equipment/add" className="hover:text-signal transition-colors">+ Register Asset</Link>
              <Link to="/admin/approvals" className="hover:text-signal text-purple-400 transition-colors">Approval Queue</Link>
            </>
          ) : (
            <>
              <Link to="/allocation" className="hover:text-signal transition-colors">New Requirement</Link>
              <Link to="/allocation/history" className="hover:text-signal transition-colors">Allocation History</Link>
              <Link to="/equipment/manage" className="hover:text-signal transition-colors">Table View</Link>
              <Link to="/orders" className="hover:text-signal transition-colors">My Orders</Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="absolute left-0 right-0 top-full flex flex-col border-b border-line bg-surface p-4 xl:hidden shadow-lg">
          {searchForm("w-full rounded mb-2")}
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.key}
                to={l.to}
                onClick={() => setMenuOpen(false)}
                className="px-3 py-2.5 text-sm font-medium text-steel hover:text-ink hover:bg-paper rounded"
              >
                {l.label}
              </Link>
            ))}

            <div className="border-t border-line my-2 pt-2 flex flex-col gap-1">
              {isAdmin ? (
                <>
                  <Link to="/equipment/manage" onClick={() => setMenuOpen(false)} className="px-3 py-2.5 text-sm text-steel">Table View</Link>
                  <Link to="/equipment/add" onClick={() => setMenuOpen(false)} className="px-3 py-2.5 text-sm text-steel">+ Register Asset</Link>
                  <Link to="/admin/approvals" onClick={() => setMenuOpen(false)} className="px-3 py-2.5 text-sm font-bold text-purple-400">Approval Queue</Link>
                </>
              ) : (
                <>
                  <Link to="/allocation" onClick={() => setMenuOpen(false)} className="px-3 py-2.5 text-sm font-bold text-signal">New Requirement</Link>
                  <Link to="/allocation/history" onClick={() => setMenuOpen(false)} className="px-3 py-2.5 text-sm text-steel">Allocation History</Link>
                  <Link to="/orders" onClick={() => setMenuOpen(false)} className="px-3 py-2.5 text-sm text-steel">My Orders</Link>
                </>
              )}
            </div>

            <button onClick={handleLogout} className="mt-2 px-3 py-2 text-left text-sm font-semibold text-red-400 hover:bg-paper rounded">
              Logout
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}