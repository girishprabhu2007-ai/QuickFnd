"use client";

import { useEffect } from "react";

type Props = {
  itemSlug: string;
  itemType: "tool" | "calculator" | "ai-tool";
};

export default function TrackUsage({ itemSlug, itemType }: Props) {
  useEffect(() => {
    fetch("/api/usage/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        item_slug: itemSlug,
        item_type: itemType,
        event_type: "page_view",
      }),
    }).catch(() => {});
  }, [itemSlug, itemType]);

  return null;
}