import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-center">
      <span className="text-5xl">🏗️</span>
      <h1 className="text-2xl font-semibold text-gray-900">Page not found</h1>
      <p className="text-sm text-gray-500">The page you're looking for doesn't exist.</p>
      <Link to="/dashboard" className="text-sm font-medium text-blue-600 hover:underline">
        Back to Dashboard
      </Link>
    </div>
  );
}