"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function EmbedModeDetector() {
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get("embed") === "1") {
      document.body.classList.add("quickfnd-embed-mode");
    }
    return () => { document.body.classList.remove("quickfnd-embed-mode"); };
  }, [searchParams]);
  return null;
}