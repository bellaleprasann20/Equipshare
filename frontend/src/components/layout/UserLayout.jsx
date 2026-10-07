import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function UserLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#161618] text-white">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}