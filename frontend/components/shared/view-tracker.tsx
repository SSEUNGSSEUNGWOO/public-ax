"use client";

import { useEffect } from "react";

interface ViewTrackerProps {
  type: "guide" | "insight";
  slug: string;
}

export function ViewTracker({ type, slug }: ViewTrackerProps) {
  useEffect(() => {
    const key = `viewed_${type}_${slug}`;
    const lastViewed = localStorage.getItem(key);
    const today = new Date().toISOString().slice(0, 10);

    if (lastViewed === today) return;

    localStorage.setItem(key, today);
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, slug }),
    });
  }, [type, slug]);

  return null;
}
