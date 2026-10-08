import React, { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../context/CartContext";

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M3 4h2l2.4 11h11l2-8H6.5" />
      <circle cx="9" cy="19.5" r="1.5" />
      <circle cx="17" cy="19.5" r="1.5" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.8-3.5 3.1-5.2 7-5.2s6.2 1.7 7 5.2" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-2.6v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8 15a1.7 1.7 0 0 0-1.5-1H6.3v-2.6h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.2h2.6v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2V14h-.2a1.7 1.7 0 0 0-1.5 1Z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M21 4v16" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count, clear } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [query, setQuery] = useState("");

  const params = new URLSearchParams(location.search);
  const onCatalog = location.pathname === "/equipment";
  const activeMode = onCatalog ? params.get("mode") || "rent" : null;

  const managerLinks = [
    {
      key: "dashboard",
      label: "Dashboard",
      to: "/dashboard",
    },
    {
      key: "equipment",
      label: "Equipment",
      to: "/equipment",
    },
    {
      key: "history",
      label: "History",
      to: "/allocation/history",
    },
    {
      key: "sites",
      label: "Sites",
      to: "/locations",
    },
    {
      key: "analytics",
      label: "Analytics",
      to: "/analytics",
    },
     {
    key: "orders",
    label: "My Orders",
    to: "/orders",
  },
  ];

  const handleSearch = (e) => {
    e.preventDefault();

    const q = query.trim();
    const mode = activeMode || "rent";

    navigate(
      q
        ? `/equipment?mode=${mode}&q=${encodeURIComponent(q)}`
        : `/equipment?mode=${mode}`
    );

    setMenuOpen(false);
  };

  const handleLogout = () => {
    setMenuOpen(false);
    setAccountOpen(false);
    clear();
    logout();
    navigate("/login");
  };

  const closeMenus = () => {
    setMenuOpen(false);
    setAccountOpen(false);
  };

  const searchForm = (widthClass) => (
    <form
      onSubmit={handleSearch}
      className={`flex items-center border border-[#2a2a2d] bg-[#1c1c1f] ${widthClass}`}
    >
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search equipment or site"
        className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none"
      />

      <button
        type="submit"
        aria-label="Search"
        className="px-3 text-gray-400 transition-colors hover:text-[#8b5cf6]"
      >
        <SearchIcon />
      </button>
    </form>
  );

  return (
    <header className="sticky top-0 z-40">
      {/* Main Navbar */}
      <div className="flex items-center justify-between gap-6 border-b border-[#2a2a2d] bg-[#161618] px-4 py-3 sm:px-8">
        {/* Brand + Desktop Navigation */}
        <div className="flex min-w-0 items-center gap-8">
          <Link
            to="/dashboard"
            onClick={closeMenus}
            className="flex shrink-0 items-center gap-2"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-[#8b5cf6] font-display text-sm font-bold text-white">
              E
            </span>

            <span className="font-display text-xl font-bold tracking-tight text-white">
              EquipShare
            </span>
          </Link>

          <nav className="hidden items-center gap-6 xl:flex">
            {managerLinks.map((link) => (
              <NavLink
                key={link.key}
                to={link.to}
                className={({ isActive }) =>
                  [
                    "border-b-2 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors",
                    isActive
                      ? "border-[#8b5cf6] text-white"
                      : "border-transparent text-gray-400 hover:border-gray-500 hover:text-white",
                  ].join(" ")
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Desktop Right Side */}
        <div className="hidden items-center gap-4 xl:flex">
          {searchForm("w-64 rounded")}

          {/* Cart */}
          <Link
            to="/cart"
            aria-label={`Draft, ${count} items`}
            className="relative p-1 text-gray-300 transition-colors hover:text-[#8b5cf6]"
          >
            <CartIcon />

            {count > 0 && (
              <span className="absolute -right-1 -top-1 rounded bg-[#8b5cf6] px-1 font-mono text-[10px] font-bold leading-4 text-white">
                {count}
              </span>
            )}
          </Link>

          {/* Account */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setAccountOpen((open) => !open)}
              className="flex items-center gap-2 border border-transparent px-2 py-1.5 text-left transition-colors hover:border-[#2a2a2d] hover:bg-[#1c1c1f]"
              aria-expanded={accountOpen}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#8b5cf6]/15 text-xs font-bold text-[#c4b5fd]">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>

              <span className="max-w-[130px] truncate text-sm font-medium text-gray-300">
                {user?.name || "Account"}
              </span>

              <ChevronIcon />
            </button>

            {accountOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden border border-[#2a2a2d] bg-[#1c1c1f] shadow-2xl">
                <div className="border-b border-[#2a2a2d] px-4 py-3">
                  <p className="truncate text-sm font-semibold text-white">
                    {user?.name || "User"}
                  </p>

                  <p className="mt-1 truncate text-xs text-gray-500">
                    {user?.email || "Project Manager"}
                  </p>
                </div>

                <div className="p-1">
                  <Link
                    to="/profile"
                    onClick={closeMenus}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 transition-colors hover:bg-[#2a2a2d] hover:text-white"
                  >
                    <UserIcon />
                    Profile
                  </Link>

                  <Link
                    to="/settings"
                    onClick={closeMenus}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 transition-colors hover:bg-[#2a2a2d] hover:text-white"
                  >
                    <SettingsIcon />
                    Settings
                  </Link>
                </div>

                <div className="border-t border-[#2a2a2d] p-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                  >
                    <LogoutIcon />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Right Side */}
        <div className="flex items-center gap-3 xl:hidden">
          <Link
            to="/cart"
            aria-label={`Draft, ${count} items`}
            className="relative p-1 text-gray-300 transition-colors hover:text-[#8b5cf6]"
          >
            <CartIcon />

            {count > 0 && (
              <span className="absolute -right-1 -top-1 rounded bg-[#8b5cf6] px-1 font-mono text-[10px] font-bold leading-4 text-white">
                {count}
              </span>
            )}
          </Link>

          <button
            type="button"
            className="p-2 text-gray-300 transition-colors hover:text-white"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <nav className="absolute left-0 right-0 top-full border-b border-[#2a2a2d] bg-[#1c1c1f] p-4 shadow-2xl xl:hidden">
          {searchForm("mb-4 w-full rounded")}

          <div className="flex flex-col gap-1">
            {managerLinks.map((link) => (
              <NavLink
                key={link.key}
                to={link.to}
                onClick={closeMenus}
                className={({ isActive }) =>
                  [
                    "border-l-2 px-4 py-3 text-sm font-bold uppercase tracking-wider transition-colors",
                    isActive
                      ? "border-[#8b5cf6] bg-[#8b5cf6]/10 text-white"
                      : "border-transparent text-gray-400 hover:bg-[#2a2a2d] hover:text-white",
                  ].join(" ")
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Mobile Account */}
          <div className="mt-4 border-t border-[#2a2a2d] pt-4">
            <div className="mb-3 flex items-center gap-3 px-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#8b5cf6]/15 text-sm font-bold text-[#c4b5fd]">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {user?.name || "User"}
                </p>

                <p className="truncate text-xs text-gray-500">
                  {user?.email || "Project Manager"}
                </p>
              </div>
            </div>

            <Link
              to="/profile"
              onClick={closeMenus}
              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-400 transition-colors hover:bg-[#2a2a2d] hover:text-white"
            >
              <UserIcon />
              Profile
            </Link>

            <Link
              to="/settings"
              onClick={closeMenus}
              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-400 transition-colors hover:bg-[#2a2a2d] hover:text-white"
            >
              <SettingsIcon />
              Settings
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-1 flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold uppercase tracking-wider text-red-400 transition-colors hover:bg-red-500/10"
            >
              <LogoutIcon />
              Logout
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}