"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function EmbedModeDetector() {
  const params = useSearchParams();
  useEffect(() => {
    if (params.get("embed") !== "1") return;
    document.body.classList.add("qf-embed");

    // Hide everything except the tool workspace
    const timer = setTimeout(() => {
      // Find the tool workspace card (contains the engine/renderer)
      const workspace = document.querySelector("[data-tool-workspace]") 
        || document.querySelector(".rounded-3xl.border.border-q-border.bg-q-card.p-6")
        || document.querySelector(".rounded-3xl.border");
      
      if (workspace) {
        // Walk up to the main content container
        const main = workspace.closest("main") || workspace.closest("section") || workspace.parentElement;
        if (main) {
          // Hide all siblings and children that aren't the workspace or its ancestors
          Array.from(main.children).forEach((child) => {
            if (child === workspace || child.contains(workspace) || workspace.contains(child)) return;
            (child as HTMLElement).style.display = "none";
          });
        }
        // Also hide everything after the workspace card's parent section
        let el = workspace.closest(".rounded-3xl");
        if (el && el.parentElement) {
          let sibling = el.nextElementSibling;
          while (sibling) {
            (sibling as HTMLElement).style.display = "none";
            sibling = sibling.nextElementSibling;
          }
          // Go up one more level and hide siblings after
          let parent = el.parentElement;
          if (parent) {
            let pSibling = parent.nextElementSibling;
            while (pSibling) {
              (pSibling as HTMLElement).style.display = "none";
              pSibling = pSibling.nextElementSibling;
            }
          }
        }
      }

      // Hide breadcrumbs
      document.querySelectorAll("nav").forEach((nav) => {
        if (nav.textContent?.includes("Home") && nav.textContent?.includes("/")) {
          (nav as HTMLElement).style.display = "none";
        }
      });

      // Hide all ADVERTISEMENT labels
      document.querySelectorAll("*").forEach((el) => {
        if (el.textContent?.trim() === "ADVERTISEMENT" && el.children.length === 0) {
          (el as HTMLElement).style.display = "none";
          if (el.parentElement) (el.parentElement as HTMLElement).style.display = "none";
        }
      });
    }, 100);

    return () => { 
      clearTimeout(timer);
      document.body.classList.remove("qf-embed"); 
    };
  }, [params]);
  return null;
}