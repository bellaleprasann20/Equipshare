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

  const links = [
    { key: "dashboard", label: "Dashboard", to: "/dashboard", active: location.pathname === "/dashboard" },
    { key: "rent", label: "Rent", to: "/equipment?mode=rent", active: activeMode === "rent" },
    { key: "buy", label: "Buy", to: "/equipment?mode=buy", active: activeMode === "buy" },
    { key: "locations", label: "Locations", to: "/locations", active: location.pathname === "/locations" },
    { key: "analytics", label: "Analytics", to: "/analytics", active: location.pathname === "/analytics" },
    ...(isAdmin
      ? [{ key: "admin", label: "Fleet overview", to: "/admin", active: location.pathname === "/admin" }]
      : []),
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
    <form onSubmit={handleSearch} className={`flex items-center border border-line bg-white ${widthClass}`}>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search equipment or site"
        className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm placeholder:text-steel-light focus:outline-none"
      />
      <button type="submit" aria-label="Search" className="px-3 text-steel hover:text-signal">
        <SearchIcon />
      </button>
    </form>
  );

  const cartLink = (
    <Link to="/cart" aria-label={`Cart, ${count} items`} className="relative p-1 text-ink hover:text-signal">
      <CartIcon />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 bg-signal px-1 font-mono text-[10px] font-bold leading-4 text-white">
          {count}
        </span>
      )}
    </Link>
  );

  return (
    <header className="sticky top-0 z-30">
      {/* Main bar */}
      <div className="flex items-center justify-between gap-6 border-b border-line bg-white px-4 py-3 sm:px-8">
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center bg-signal font-display text-sm font-bold text-white">
              E
            </span>
            <span className="font-display text-xl font-bold tracking-tight text-ink">EquipShare</span>
          </Link>

          <nav className="hidden items-center gap-6 xl:flex">
            {links.map((l) => (
              <Link
                key={l.key}
                to={l.to}
                className={[
                  "border-b-2 py-1 text-xs font-semibold uppercase tracking-widest",
                  l.active ? "border-signal text-ink" : "border-transparent text-steel hover:text-ink",
                ].join(" ")}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-4 xl:flex">
          {searchForm("w-64")}
          {cartLink}
          {user && <span className="text-sm text-steel">{user.name}</span>}
          <button
            onClick={handleLogout}
            className="border border-ink/20 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-ink hover:border-ink/50"
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

      {/* Dark strip */}
      <div className="hidden items-center justify-between bg-ink px-8 py-2.5 text-sm text-white md:flex">
        <span className="text-white/70">{roleLabel}</span>
        <div className="flex items-center gap-8 text-xs font-medium uppercase tracking-wider">
          <Link to="/allocation" className="hover:text-signal">New requirement</Link>
          <Link to="/allocation/history" className="hover:text-signal">Allocation history</Link>
          <Link to="/equipment/manage" className="hover:text-signal">Table view</Link>
          <Link to="/orders" className="hover:text-signal">My orders</Link>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="absolute left-0 right-0 top-full flex flex-col border-b border-line bg-white p-4 xl:hidden">
          {searchForm("w-full")}
          <div className="mt-2 flex flex-col">
            {links.map((l) => (
              <Link
                key={l.key}
                to={l.to}
                onClick={() => setMenuOpen(false)}
                className={[
                  "border-l-2 px-3 py-3 text-sm font-medium",
                  l.active ? "border-signal text-ink" : "border-transparent text-steel",
                ].join(" ")}
              >
                {l.label}
              </Link>
            ))}
            <Link to="/allocation" onClick={() => setMenuOpen(false)} className="px-3 py-3 text-sm font-medium text-signal">
              New requirement
            </Link>
            <Link to="/allocation/history" onClick={() => setMenuOpen(false)} className="px-3 py-3 text-sm text-steel">
              Allocation history
            </Link>
            <Link to="/orders" onClick={() => setMenuOpen(false)} className="px-3 py-3 text-sm text-steel">
              My orders
            </Link>
            <button onClick={handleLogout} className="px-3 py-3 text-left text-sm text-ink">
              Logout
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}