import React from "react";
import { Outlet } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#161618] text-white">
      <AdminNavbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-8 sm:py-8">
        <Outlet />
      </main>

      <footer className="border-t border-[#2a2a2d] bg-[#1c1c1f] px-4 py-6 text-center text-xs text-gray-500 sm:px-8">
        <span>
          EquipShare Fleet Administration
        </span>
        <span className="mx-2 text-gray-700">•</span>
        <span>MCA Capstone Project, PES University</span>
      </footer>
    </div>
  );
}