import React from "react";
import AdminNavbar from "./AdminNavbar";

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#161618] text-white">
      <AdminNavbar />
      
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-8">
        {children}
      </main>
      
      <footer className="border-t border-[#2a2a2d] bg-[#1c1c1f] px-4 py-6 text-center text-xs text-gray-500 sm:px-8">
        EquipShare Fleet Administration — MCA Capstone Project, PES University
      </footer>
    </div>
  );
}