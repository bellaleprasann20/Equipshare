
import React, { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../context/CartContext";

function CartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
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
    >
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M21 4v16" />
    </svg>
  );
}

function MenuIcon({ open }) {
  return open ? (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
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

  const managerLinks = [
    { key: "dashboard", label: "Dashboard", to: "/dashboard" },
    { key: "equipment", label: "Equipment", to: "/equipment" },
    { key: "history", label: "History", to: "/allocation/history" },
    { key: "sites", label: "Sites", to: "/locations" },
    { key: "analytics", label: "Analytics", to: "/analytics" },
    { key: "orders", label: "My Orders", to: "/orders" },
  ];

  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenus = () => {
    setMenuOpen(false);
    setAccountOpen(false);
  };

  const handleLogout = () => {
    closeMenus();
    clear();
    logout();
    navigate("/login");
  };

  const navigationLinks = (mobile = false) =>
    managerLinks.map((link) => (
      <NavLink
        key={link.key}
        to={link.to}
        onClick={mobile ? closeMenus : undefined}
        className={({ isActive }) =>
          mobile
            ? [
                "flex items-center rounded-lg border-l-2 px-4 py-3 text-sm font-semibold transition-colors",
                isActive
                  ? "border-[#8b5cf6] bg-[#8b5cf6]/10 text-white"
                  : "border-transparent text-gray-400 hover:bg-[#2a2a2d] hover:text-white",
              ].join(" ")
            : [
                "whitespace-nowrap border-b-2 py-2 text-xs font-bold uppercase tracking-wider transition-colors",
                isActive
                  ? "border-[#8b5cf6] text-white"
                  : "border-transparent text-gray-400 hover:border-gray-500 hover:text-white",
              ].join(" ")
        }
      >
        {link.label}
      </NavLink>
    ));

  const accountDetails = (
    <>
      <div className="mb-3 flex items-center gap-3 px-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#8b5cf6]/15 text-sm font-bold text-[#c4b5fd]">
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
        className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-gray-400 transition-colors hover:bg-[#2a2a2d] hover:text-white"
      >
        <UserIcon />
        Profile
      </Link>

      <Link
        to="/settings"
        onClick={closeMenus}
        className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-gray-400 transition-colors hover:bg-[#2a2a2d] hover:text-white"
      >
        <SettingsIcon />
        Settings
      </Link>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-2 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/10"
      >
        <LogoutIcon />
        Logout
      </button>
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#2a2a2d] bg-[#161618]">
      {/* Top Navbar */}
      <div className="flex min-h-[68px] items-center justify-between gap-4 px-4 sm:px-8">
        {/* Logo */}
        <Link
          to="/dashboard"
          onClick={closeMenus}
          className="flex shrink-0 items-center gap-2"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#8b5cf6] font-bold text-white">
            E
          </span>

          <span className="font-display text-xl font-bold tracking-tight text-white">
            EquipShare
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-5 lg:flex">
          {navigationLinks()}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-4 lg:flex">
          <Link
            to="/cart"
            aria-label={`Cart, ${count} items`}
            className="relative p-1 text-gray-300 transition-colors hover:text-[#8b5cf6]"
          >
            <CartIcon />

            {count > 0 && (
              <span className="absolute -right-1 -top-1 rounded bg-[#8b5cf6] px-1 font-mono text-[10px] font-bold leading-4 text-white">
                {count}
              </span>
            )}
          </Link>

          {/* Desktop Account Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setAccountOpen((open) => !open)}
              className="flex items-center gap-2 border border-transparent px-2 py-1.5 transition-colors hover:border-[#2a2a2d] hover:bg-[#1c1c1f]"
              aria-expanded={accountOpen}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#8b5cf6]/15 text-xs font-bold text-[#c4b5fd]">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>

              <span className="max-w-[110px] truncate text-sm text-gray-300">
                {user?.name || "Account"}
              </span>

              <ChevronIcon />
            </button>

            {accountOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-lg border border-[#2a2a2d] bg-[#1c1c1f] p-2 shadow-2xl">
                <div className="border-b border-[#2a2a2d] px-3 py-3">
                  <p className="truncate text-sm font-semibold text-white">
                    {user?.name || "User"}
                  </p>
                  <p className="mt-1 truncate text-xs text-gray-500">
                    {user?.email || "Project Manager"}
                  </p>
                </div>

                <Link
                  to="/profile"
                  onClick={closeMenus}
                  className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-300 hover:bg-[#2a2a2d]"
                >
                  <UserIcon />
                  Profile
                </Link>

                <Link
                  to="/settings"
                  onClick={closeMenus}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-300 hover:bg-[#2a2a2d]"
                >
                  <SettingsIcon />
                  Settings
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10"
                >
                  <LogoutIcon />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-3 lg:hidden">
          <Link
            to="/cart"
            aria-label={`Cart, ${count} items`}
            className="relative p-1 text-gray-300 hover:text-[#8b5cf6]"
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
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            className="rounded-lg p-2 text-gray-300 transition-colors hover:bg-[#2a2a2d] hover:text-white"
          >
            <MenuIcon open={menuOpen} />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={closeMenus}
            className="absolute inset-0 bg-black/70"
          />

          {/* Sidebar */}
          <aside className="absolute bottom-0 left-0 top-0 flex w-[300px] max-w-[85vw] flex-col border-r border-[#2a2a2d] bg-[#161618] shadow-2xl">
            {/* Sidebar Header */}
            <div className="flex min-h-[68px] items-center justify-between border-b border-[#2a2a2d] px-5">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#8b5cf6] font-bold text-white">
                  E
                </span>
                <span className="font-display text-lg font-bold text-white">
                  EquipShare
                </span>
              </div>

              <button
                type="button"
                onClick={closeMenus}
                aria-label="Close menu"
                className="rounded-lg p-2 text-gray-400 hover:bg-[#2a2a2d] hover:text-white"
              >
                <MenuIcon open />
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                Main Menu
              </p>

              <nav className="flex flex-col gap-1">
                {navigationLinks(true)}
              </nav>

              <div className="mt-6 border-t border-[#2a2a2d] pt-5">
                <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                  Account
                </p>

                {accountDetails}
              </div>
            </div>

            {/* Sidebar Footer */}
            <div className="border-t border-[#2a2a2d] px-5 py-4">
              <p className="text-xs text-gray-500">
                EquipShare System
              </p>
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}
