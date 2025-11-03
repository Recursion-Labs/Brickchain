"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      toastOptions={{
        duration: 4000,
        style: {
          background: "#1f2937",
          color: "#fff",
          borderRadius: "0.5rem",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          fontSize: "0.875rem",
          fontWeight: "500",
        },
        success: {
          style: {
            background: "#10b981",
            color: "#fff",
          },
          icon: "✓",
        },
        error: {
          style: {
            background: "#ef4444",
            color: "#fff",
          },
          icon: "✕",
        },
      }}
    />
  );
}
