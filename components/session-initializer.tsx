"use client";

import { useEffect } from "react";
import { isAuthDisabled } from "@/lib/auth-helper";

export function SessionInitializer() {
  useEffect(() => {
    // Only initialize session if auth is disabled
    // We check this client-side since env vars aren't available in client components
    // The server will handle the actual check
    const initSession = async () => {
      try {
        await fetch("/api/session/init", { method: "GET" });
      } catch (error) {
        // Silently fail - session will be created on next API call
        console.error("Failed to initialize session:", error);
      }
    };

    initSession();
  }, []);

  return null;
}

