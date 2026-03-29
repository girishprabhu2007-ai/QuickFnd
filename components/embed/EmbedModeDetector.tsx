"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function EmbedModeDetector() {
  const params = useSearchParams();
  useEffect(() => {
    if (params.get("embed") === "1") {
      document.body.classList.add("qf-embed");
    }
    return () => { document.body.classList.remove("qf-embed"); };
  }, [params]);
  return null;
}